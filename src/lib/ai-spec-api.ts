import { evaluateProjectAccess } from "@/lib/project-access";
import {
  forbiddenResponse,
  requireAuthenticatedUserInDatabase,
} from "@/lib/projects-api";
import { NextResponse } from "next/server";

export type SpecRequestBody = {
  roomId: string;
  chatHistory: unknown[];
  nodes: unknown[];
  edges: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSpecRequestBody(body: unknown): SpecRequestBody | null {
  if (!isRecord(body)) {
    return null;
  }

  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
  if (!roomId) {
    return null;
  }

  if (!Array.isArray(body.chatHistory)) {
    return null;
  }

  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return null;
  }

  return {
    roomId,
    chatHistory: body.chatHistory,
    nodes: body.nodes,
    edges: body.edges,
  };
}

export function parseSpecTokenBody(body: unknown): { runId: string } | null {
  if (!isRecord(body)) {
    return null;
  }

  const runId = typeof body.runId === "string" ? body.runId.trim() : "";
  if (!runId) {
    return null;
  }

  return { runId };
}

/** Resolves projectId from roomId only — never trusts client-supplied projectId. */
export async function requireSpecProjectAccess(roomId: string): Promise<
  | { userId: string; projectId: string }
  | { response: NextResponse }
> {
  const authResult = await requireAuthenticatedUserInDatabase();
  if ("response" in authResult) {
    return authResult;
  }

  const { authorized, project } = await evaluateProjectAccess(roomId);

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
