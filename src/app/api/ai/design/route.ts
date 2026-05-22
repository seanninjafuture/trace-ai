import { auth, tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import {
  parseDesignRequestBody,
  requireDesignProjectAccess,
  resolveProjectLiveblocksRoomId,
} from "@/lib/ai-design-api";
import { ensureLiveblocksRoom } from "@/lib/ensure-liveblocks-room";
import { prisma } from "@/lib/prisma";
import type { chaosAgentTask } from "@trigger/chaos-agent";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseDesignRequestBody(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Body must include prompt, projectId, and roomId strings" },
      { status: 400 }
    );
  }

  const projectAccess = await requireDesignProjectAccess(payload.projectId);
  if ("response" in projectAccess) {
    return projectAccess.response;
  }

  const liveblocksRoomId = await resolveProjectLiveblocksRoomId(
    projectAccess.projectId
  );

  if (!liveblocksRoomId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    await ensureLiveblocksRoom(liveblocksRoomId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not provision Liveblocks room.";
    console.error("[chaos-agent] ensure room failed", { liveblocksRoomId, message });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  console.log("[chaos-agent] trigger", {
    projectId: projectAccess.projectId,
    liveblocksRoomId,
    clientRoomId: payload.roomId,
    promptLength: payload.prompt.length,
  });

  const handle = await tasks.trigger<typeof chaosAgentTask>("chaos-agent-task", {
    prompt: payload.prompt,
    roomId: liveblocksRoomId,
    projectId: projectAccess.projectId,
  });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: projectAccess.projectId,
      userId: projectAccess.userId,
    },
  });

  const publicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
  });

  return NextResponse.json({ runId: handle.id, publicToken });
}
