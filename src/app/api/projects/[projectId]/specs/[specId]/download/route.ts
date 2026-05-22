import { auth } from "@clerk/nextjs/server";

import {
  fetchSpecMarkdownFromBlob,
  findProjectSpecInProject,
  requireProjectSpecAccess,
} from "@/lib/specs-api";
import { unauthorizedResponse } from "@/lib/projects-api";

type RouteContext = {
  params: Promise<{ projectId: string; specId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) {
    return unauthorizedResponse();
  }

  const { projectId, specId } = await context.params;
  const access = await requireProjectSpecAccess(projectId);

  if (!("ok" in access)) {
    return new Response(JSON.stringify({ error: access.error }), {
      status: access.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const spec = await findProjectSpecInProject(projectId, specId);
  if (!spec) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const markdownBuffer = await fetchSpecMarkdownFromBlob(spec.filePath);
  if (markdownBuffer === null) {
    return new Response(JSON.stringify({ error: "Failed to load spec" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(markdownBuffer, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="trace_ai_incident_playbook_${specId}.md"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
