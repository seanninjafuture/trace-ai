import { NextResponse } from "next/server";

import { requireAuthenticatedUserId } from "@/lib/projects-api";
import {
  fetchSpecMarkdownFromBlob,
  findProjectSpecInProject,
  requireProjectSpecAccess,
} from "@/lib/specs-api";

type RouteContext = {
  params: Promise<{ projectId: string; specId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const authResult = await requireAuthenticatedUserId();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId, specId } = await context.params;
  const access = await requireProjectSpecAccess(projectId);

  if (!("ok" in access)) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const spec = await findProjectSpecInProject(projectId, specId);
  if (!spec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const markdown = await fetchSpecMarkdownFromBlob(spec.filePath);
  if (markdown === null) {
    return NextResponse.json(
      { error: "Failed to load spec" },
      { status: 500 }
    );
  }

  return NextResponse.json({ markdown });
}
