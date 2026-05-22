import { NextResponse } from "next/server";

import {
  getVerifiedUserEmail,
  listProjectsForUser,
  parseOptionalDescription,
  requireAuthenticatedUserInDatabase,
  resolveProjectName,
} from "@/lib/projects-api";
import { ensureLiveblocksRoom } from "@/lib/ensure-liveblocks-room";
import { prisma } from "@/lib/prisma";
import { slugifyProjectName } from "@/lib/slugify";

export async function GET() {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult.response;
  }

  const email = await getVerifiedUserEmail();
  const projects = await listProjectsForUser(authResult.userId, email);

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult.response;
  }

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const canvasJsonPath =
    typeof body.canvasJsonPath === "string" ? body.canvasJsonPath.trim() : "";

  const project = await prisma.project.create({
    data: {
      ownerId: authResult.userId,
      name: resolveProjectName(body.name),
      description: parseOptionalDescription(body.description),
      status: "DRAFT",
      canvasJsonPath,
    },
  });

  const liveblocksRoomId =
    project.canvasJsonPath.trim() || slugifyProjectName(project.name);

  try {
    await ensureLiveblocksRoom(liveblocksRoomId);
  } catch (error) {
    console.error("[projects] ensure Liveblocks room failed", {
      liveblocksRoomId,
      error,
    });
  }

  return NextResponse.json(project, { status: 201 });
}
