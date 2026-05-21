import { auth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { parseSpecTokenBody } from "@/lib/ai-spec-api";
import { requireTaskRunOwner } from "@/lib/ai-design-api";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseSpecTokenBody(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Body must include a runId string" },
      { status: 400 }
    );
  }

  const runAccess = await requireTaskRunOwner(payload.runId);
  if ("response" in runAccess) {
    return runAccess.response;
  }

  const token = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [runAccess.runId],
      },
    },
    expirationTime: "1h",
  });

  return NextResponse.json({ token });
}
