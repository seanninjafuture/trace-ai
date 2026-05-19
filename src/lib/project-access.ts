import { auth } from "@clerk/nextjs/server";
import type { Project } from "@prisma/client";

import { getVerifiedUserEmail } from "@/lib/projects-api";
import { prisma } from "@/lib/prisma";
import { ensureClerkUserInDatabase } from "@/server/actions/sync-clerk-user";

export type ProjectAccessResult = {
  authorized: boolean;
  project: Project | null;
};

export async function evaluateProjectAccess(
  roomId: string
): Promise<ProjectAccessResult> {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return { authorized: false, project: null };
  }

  await ensureClerkUserInDatabase(userId);

  const email = await getVerifiedUserEmail();

  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: roomId }, { canvasJsonPath: roomId }],
    },
    include: {
      collaborators: {
        select: { collaboratorEmail: true },
      },
    },
  });

  if (!project) {
    return { authorized: false, project: null };
  }

  const isOwner = project.ownerId === userId;
  const normalizedEmail = email?.trim().toLowerCase() ?? null;
  const isCollaborator =
    normalizedEmail !== null &&
    project.collaborators.some(
      (row) => row.collaboratorEmail.trim().toLowerCase() === normalizedEmail
    );

  if (!isOwner && !isCollaborator) {
    return { authorized: false, project: null };
  }

  const { collaborators: _collaborators, ...projectRecord } = project;

  return {
    authorized: true,
    project: projectRecord,
  };
}
