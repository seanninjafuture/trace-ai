import { NextResponse } from "next/server";

import {
  getVerifiedUserEmail,
  listProjectsForUser,
  parseOptionalDescription,
  requireAuthenticatedUserId,
  resolveProjectName,
} from "@/lib/projects-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAuthenticatedUserId();
  if ("response" in authResult) {
    return authResult.response;
  }

  const email = await getVerifiedUserEmail();
  const projects = await listProjectsForUser(authResult.userId, email);

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const authResult = await requireAuthenticatedUserId();
  if ("response" in authResult) {
    return authResult.response;
  }

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const project = await prisma.project.create({
    data: {
      ownerId: authResult.userId,
      name: resolveProjectName(body.name),
      description: parseOptionalDescription(body.description),
      status: "DRAFT",
      canvasJsonPath: "",
    },
  });

  return NextResponse.json(project, { status: 201 });
}
