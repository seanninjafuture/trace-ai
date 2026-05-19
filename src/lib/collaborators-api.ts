import type { Project, ProjectCollaborator, User } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  fetchClerkProfileByUserId,
  fetchClerkProfilesByEmails,
} from "@/lib/clerk-user-enrichment";
import { prisma } from "@/lib/prisma";
import { forbiddenResponse } from "@/lib/projects-api";
import type { EnrichedProjectMember } from "@/types/collaborator";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidCollaboratorEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function normalizeCollaboratorEmail(email: string): string {
  return email.trim().toLowerCase();
}

type ProjectWithRelations = Project & {
  owner: User;
  collaborators: ProjectCollaborator[];
};

export async function requireProjectMember(
  projectId: string,
  userId: string,
  email: string | null
): Promise<
  | { project: ProjectWithRelations; isProjectOwner: boolean }
  | { response: NextResponse }
> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      collaborators: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) {
    return {
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  const isProjectOwner = project.ownerId === userId;
  const normalizedEmail = email?.trim().toLowerCase() ?? null;
  const isCollaborator =
    normalizedEmail !== null &&
    project.collaborators.some(
      (row) =>
        row.collaboratorEmail.trim().toLowerCase() === normalizedEmail
    );

  if (!isProjectOwner && !isCollaborator) {
    return { response: forbiddenResponse() };
  }

  return { project, isProjectOwner };
}

export async function buildEnrichedProjectMembers(
  project: ProjectWithRelations
): Promise<EnrichedProjectMember[]> {
  const collaboratorEmails = project.collaborators.map((row) =>
    row.collaboratorEmail.trim().toLowerCase()
  );

  const [ownerClerkProfile, emailProfiles] = await Promise.all([
    fetchClerkProfileByUserId(project.ownerId),
    fetchClerkProfilesByEmails(collaboratorEmails),
  ]);

  let resolvedOwnerEmail = project.owner.email?.trim() ?? null;

  if (!resolvedOwnerEmail) {
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const ownerUser = await client.users.getUser(project.ownerId);
      resolvedOwnerEmail =
        ownerUser.primaryEmailAddress?.emailAddress ??
        ownerUser.emailAddresses[0]?.emailAddress ??
        "workspace-owner@unknown";
    } catch {
      resolvedOwnerEmail = "workspace-owner@unknown";
    }
  }

  const ownerMember: EnrichedProjectMember = {
    collaboratorId: null,
    email: resolvedOwnerEmail,
    displayName:
      ownerClerkProfile?.displayName ?? project.owner.displayName ?? null,
    imageUrl: ownerClerkProfile?.imageUrl ?? project.owner.avatarUrl ?? null,
    role: "owner",
  };

  const collaboratorMembers: EnrichedProjectMember[] =
    project.collaborators.map((row) => {
      const email = row.collaboratorEmail.trim();
      const profile = emailProfiles.get(email.toLowerCase());

      return {
        collaboratorId: row.id,
        email,
        displayName: profile?.displayName ?? null,
        imageUrl: profile?.imageUrl ?? null,
        role: "collaborator",
      };
    });

  return [ownerMember, ...collaboratorMembers];
}
