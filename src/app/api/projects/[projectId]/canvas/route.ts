import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  EMPTY_CANVAS_SNAPSHOT,
  parseCanvasSnapshotPayload,
  uploadCanvasSnapshot,
} from "@/lib/canvas-persistence";
import { requireProjectCanvasAccess } from "@/lib/canvas-api";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/projects-api";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) {
    return unauthorizedResponse();
  }

  const { projectId } = await context.params;
  const access = await requireProjectCanvasAccess(projectId);
  if ("response" in access) {
    return access.response;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasBlobUrl: true },
  });

  if (!project?.canvasBlobUrl) {
    return NextResponse.json(EMPTY_CANVAS_SNAPSHOT);
  }

  try {
    const blobResponse = await fetch(project.canvasBlobUrl, {
      cache: "no-store",
    });

    if (!blobResponse.ok) {
      console.error("Canvas blob fetch failed", blobResponse.status);
      return NextResponse.json(EMPTY_CANVAS_SNAPSHOT);
    }

    const raw: unknown = await blobResponse.json();
    const snapshot = parseCanvasSnapshotPayload(raw);

    if (!snapshot) {
      return NextResponse.json(EMPTY_CANVAS_SNAPSHOT);
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Canvas blob fetch error", error);
    return NextResponse.json(EMPTY_CANVAS_SNAPSHOT);
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) {
    return unauthorizedResponse();
  }

  const { projectId } = await context.params;
  const access = await requireProjectCanvasAccess(projectId);
  if ("response" in access) {
    return access.response;
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const snapshot = parseCanvasSnapshotPayload(body);
  if (!snapshot) {
    return NextResponse.json(
      { error: "Body must include nodes and edges arrays" },
      { status: 400 }
    );
  }

  try {
    const blobUrl = await uploadCanvasSnapshot(projectId, snapshot);

    void prisma.project
      .update({
        where: { id: projectId },
        data: { canvasBlobUrl: blobUrl },
      })
      .catch((error) => {
        console.error("Failed to persist canvas blob URL", error);
      });

    return NextResponse.json({
      canvasBlobUrl: blobUrl,
      nodes: snapshot.nodes.length,
      edges: snapshot.edges.length,
    } satisfies { canvasBlobUrl: string; nodes: number; edges: number });
  } catch (error) {
    console.error("Canvas blob upload failed", error);
    return NextResponse.json(
      { error: "Failed to save canvas" },
      { status: 500 }
    );
  }
}
