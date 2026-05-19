import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireAuthenticatedUserInDatabase,
  requireProjectOwner,
} from "@/lib/projects-api";

type RouteContext = {
  params: Promise<{ projectId: string; collaboratorId: string }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId, collaboratorId } = await context.params;
  const ownerResult = await requireProjectOwner(projectId, authResult.userId);
  if ("response" in ownerResult) {
    return ownerResult.response;
  }

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: { id: collaboratorId, projectId },
  });

  if (!collaborator) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.projectCollaborator.delete({
    where: { id: collaboratorId },
  });

  return new NextResponse(null, { status: 204 });
}
