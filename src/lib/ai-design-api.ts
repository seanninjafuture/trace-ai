import { evaluateProjectAccess } from "@/lib/project-access";
import {
  forbiddenResponse,
  requireAuthenticatedUserInDatabase,
} from "@/lib/projects-api";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export type DesignRequestBody = {
  prompt: string;
  projectId: string;
  roomId: string;
};

export function parseDesignRequestBody(
  body: unknown
): DesignRequestBody | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const prompt = typeof record.prompt === "string" ? record.prompt.trim() : "";
  const projectId =
    typeof record.projectId === "string" ? record.projectId.trim() : "";
  const roomId = typeof record.roomId === "string" ? record.roomId.trim() : "";

  if (!prompt || !projectId || !roomId) {
    return null;
  }

  return { prompt, projectId, roomId };
}

export function parseDesignTokenBody(body: unknown): { runId: string } | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const runId = typeof record.runId === "string" ? record.runId.trim() : "";

  if (!runId) {
    return null;
  }

  return { runId };
}

export async function requireDesignProjectAccess(projectId: string): Promise<
  | { userId: string; projectId: string }
  | { response: NextResponse }
> {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult;
  }

  const { authorized, project } = await evaluateProjectAccess(projectId);

  if (!project) {
    return {
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  if (!authorized) {
    return { response: forbiddenResponse() };
  }

  return { userId: authResult.userId, projectId: project.id };
}

export async function requireTaskRunOwner(runId: string): Promise<
  | { userId: string; runId: string }
  | { response: NextResponse }
> {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult;
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  });

  if (!taskRun || taskRun.userId !== authResult.userId) {
    return { response: forbiddenResponse() };
  }

  return { userId: authResult.userId, runId };
}
