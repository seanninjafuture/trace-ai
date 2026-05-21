import { NextResponse } from "next/server";

import { evaluateProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function requireProjectCanvasAccess(
  projectId: string
): Promise<
  | { projectId: string; userId: string }
  | { response: NextResponse }
> {
  const { authorized, project } = await evaluateProjectAccess(projectId);

  if (!project) {
    return {
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  if (!authorized) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { projectId: project.id, userId: project.ownerId };
}
