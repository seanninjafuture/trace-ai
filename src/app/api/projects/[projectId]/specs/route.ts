import { NextResponse } from "next/server";

import {
  listProjectSpecSummaries,
  requireProjectSpecAccess,
} from "@/lib/specs-api";
import { requireAuthenticatedUserId } from "@/lib/projects-api";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const authResult = await requireAuthenticatedUserId();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId } = await context.params;
  const access = await requireProjectSpecAccess(projectId);

  if (!("ok" in access)) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const specs = await listProjectSpecSummaries(projectId);
  return NextResponse.json({ specs });
}
