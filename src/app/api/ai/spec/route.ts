import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import {
  parseSpecRequestBody,
  requireSpecProjectAccess,
} from "@/lib/ai-spec-api";
import { prisma } from "@/lib/prisma";
import type { generateSpecTask } from "@trigger/generate-spec";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseSpecRequestBody(body);
  if (!payload) {
    return NextResponse.json(
      {
        error:
          "Body must include roomId and arrays chatHistory, nodes, and edges",
      },
      { status: 400 }
    );
  }

  const projectAccess = await requireSpecProjectAccess(payload.roomId);
  if ("response" in projectAccess) {
    return projectAccess.response;
  }

  const handle = await tasks.trigger<typeof generateSpecTask>(
    "generate-spec-task",
    {
      projectId: projectAccess.projectId,
      roomId: payload.roomId,
      chatHistory: payload.chatHistory,
      nodes: payload.nodes,
      edges: payload.edges,
    }
  );

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: projectAccess.projectId,
      userId: projectAccess.userId,
    },
  });

  return NextResponse.json({ runId: handle.id });
}
