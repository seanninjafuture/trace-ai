import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireAuthenticatedUserInDatabase,
  requireProjectOwner,
} from "@/lib/projects-api";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "A non-empty name is required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId } = await context.params;
  const ownerResult = await requireProjectOwner(projectId, authResult.userId);
  if ("response" in ownerResult) {
    return ownerResult.response;
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return new NextResponse(null, { status: 204 });
}
