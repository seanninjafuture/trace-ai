import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  buildEnrichedProjectMembers,
  isValidCollaboratorEmail,
  normalizeCollaboratorEmail,
  requireProjectMember,
} from "@/lib/collaborators-api";
import { getAppBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import {
  getVerifiedUserEmail,
  requireAuthenticatedUserInDatabase,
  requireProjectOwner,
} from "@/lib/projects-api";
import { sendCollaboratorInviteEmail } from "@/services/email/send-collaborator-invite";
import type { ProjectCollaboratorsResponse } from "@/types/collaborator";

function resolveInviterName(
  user: Awaited<ReturnType<typeof currentUser>>
): string {
  if (!user) return "A teammate";

  return (
    user.fullName ??
    user.username ??
    user.primaryEmailAddress?.emailAddress ??
    "A teammate"
  );
}

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId } = await context.params;
  const email = await getVerifiedUserEmail();
  const access = await requireProjectMember(
    projectId,
    authResult.userId,
    email
  );

  if ("response" in access) {
    return access.response;
  }

  const members = await buildEnrichedProjectMembers(access.project);
  const payload: ProjectCollaboratorsResponse = {
    isProjectOwner: access.isProjectOwner,
    members,
  };

  return NextResponse.json(payload);
}

export async function POST(req: Request, context: RouteContext) {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId } = await context.params;
  const ownerResult = await requireProjectOwner(projectId, authResult.userId);
  if ("response" in ownerResult) {
    return ownerResult.response;
  }

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email : "";
  if (!isValidCollaboratorEmail(rawEmail)) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    );
  }

  const collaboratorEmail = normalizeCollaboratorEmail(rawEmail);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ownerEmail = project.owner.email?.trim().toLowerCase();
  if (ownerEmail && ownerEmail === collaboratorEmail) {
    return NextResponse.json(
      { error: "The project owner already has access" },
      { status: 400 }
    );
  }

  if (project.ownerId === authResult.userId) {
    const sessionEmail = (await getVerifiedUserEmail())?.trim().toLowerCase();
    if (sessionEmail && sessionEmail === collaboratorEmail) {
      return NextResponse.json(
        { error: "You cannot invite yourself" },
        { status: 400 }
      );
    }
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_collaboratorEmail: {
        projectId,
        collaboratorEmail,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This collaborator already has access" },
      { status: 409 }
    );
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: {
      projectId,
      collaboratorEmail,
    },
  });

  const inviter = await currentUser();
  const emailResult = await sendCollaboratorInviteEmail({
    toEmail: collaboratorEmail,
    projectName: project.name,
    inviterName: resolveInviterName(inviter),
    workspaceUrl: `${getAppBaseUrl(req)}/editor/${projectId}`,
  });

  if (!emailResult.ok) {
    await prisma.projectCollaborator.delete({
      where: { id: collaborator.id },
    });

    return NextResponse.json({ error: emailResult.message }, { status: 502 });
  }

  return NextResponse.json(collaborator, { status: 201 });
}
