import { MarkerType } from "@xyflow/react";

import type { CanvasMutation } from "@/lib/chaos-agent/canvas-mutation-schema";
import { INFRASTRUCTURE_NODE_DEFINITIONS } from "@/lib/canvas/infrastructure-nodes";
import type {
  InfrastructureNodeType,
  NodeColorPair,
  TraceCanvasEdge,
  TraceCanvasNode,
} from "@/types/canvas";

const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: "var(--border-default)",
} as const;

function defaultColorPair(infraType: InfrastructureNodeType): NodeColorPair {
  switch (infraType) {
    case "gateway":
      return "blue";
    case "database":
      return "purple";
    case "queue":
      return "amber";
    default:
      return "default";
  }
}

export function traceNodeFromAddMutation(
  mutation: Extract<CanvasMutation, { action: "ADD_NODE" }>
): TraceCanvasNode {
  const definition = INFRASTRUCTURE_NODE_DEFINITIONS[mutation.infraType];

  return {
    id: mutation.nodeId,
    type: "traceNode",
    position: mutation.position,
    width: definition.dimensions.width,
    height: definition.dimensions.height,
    data: {
      label: mutation.label,
      type: mutation.infraType,
      status: "healthy",
      errorRate: 0,
      latency: 15,
      colorPair: mutation.colorPair ?? defaultColorPair(mutation.infraType),
    },
  };
}

export function traceEdgeFromAddMutation(
  mutation: Extract<CanvasMutation, { action: "ADD_EDGE" }>
): TraceCanvasEdge {
  return {
    id: mutation.edgeId,
    type: "traceEdge",
    source: mutation.source,
    target: mutation.target,
    markerEnd: EDGE_MARKER,
    data: { label: mutation.label ?? "" },
  };
}
