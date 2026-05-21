import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

export type LiveFlowGraph = {
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
};

function valuesFromLiveMap<T>(value: unknown): T[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value as Record<string, T>);
}

/**
 * Parses the `flow` root from a Liveblocks storage JSON document.
 * Never reads canvas snapshots from PostgreSQL.
 */
export function parseLiveFlowGraph(storageDocument: unknown): LiveFlowGraph {
  if (!storageDocument || typeof storageDocument !== "object") {
    return { nodes: [], edges: [] };
  }

  const flow = (storageDocument as Record<string, unknown>).flow;
  if (!flow || typeof flow !== "object") {
    return { nodes: [], edges: [] };
  }

  const record = flow as Record<string, unknown>;
  const nodes = valuesFromLiveMap<TraceCanvasNode>(record.nodes);
  const edges = valuesFromLiveMap<TraceCanvasEdge>(record.edges);

  return { nodes, edges };
}

export function nodeFlowCenter(node: TraceCanvasNode): { x: number; y: number } {
  const width = typeof node.width === "number" ? node.width : 140;
  const height = typeof node.height === "number" ? node.height : 50;

  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}
