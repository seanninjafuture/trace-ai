import { runs } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { requireTaskRunOwner } from "@/lib/ai-design-api";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { runId } = await context.params;
  const access = await requireTaskRunOwner(runId);
  if ("response" in access) {
    return access.response;
  }

  try {
    const run = await runs.retrieve(runId);

    return NextResponse.json({
      id: run.id,
      status: run.status,
      finishedAt: run.finishedAt ?? null,
      output: run.output ?? null,
      error: run.error ?? null,
    });
  } catch (error) {
    console.error("Failed to retrieve chaos run", error);
    return NextResponse.json(
      { error: "Could not load run status" },
      { status: 500 }
    );
  }
}
