import { put } from "@vercel/blob";

import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

export type CanvasSnapshot = {
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
};

export const EMPTY_CANVAS_SNAPSHOT: CanvasSnapshot = {
  nodes: [],
  edges: [],
};

export function canvasBlobPathname(projectId: string): string {
  return `projects/${projectId}/canvas.json`;
}

export async function uploadCanvasSnapshot(
  projectId: string,
  snapshot: CanvasSnapshot
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const blob = await put(canvasBlobPathname(projectId), JSON.stringify(snapshot), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    contentType: "application/json",
  });

  return blob.url;
}

export function parseCanvasSnapshotPayload(raw: unknown): CanvasSnapshot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    return null;
  }

  return {
    nodes: record.nodes as TraceCanvasNode[],
    edges: record.edges as TraceCanvasEdge[],
  };
}
