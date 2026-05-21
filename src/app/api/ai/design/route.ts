import { auth, tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import {
  parseDesignRequestBody,
  requireDesignProjectAccess,
} from "@/lib/ai-design-api";
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

  const handle = await tasks.trigger<typeof chaosAgentTask>("chaos-agent-task", {
    prompt: payload.prompt,
    roomId: payload.roomId,
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
