import { INFRASTRUCTURE_NODE_DEFINITIONS } from "@/lib/canvas/infrastructure-nodes";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

/** Seed nodes for validating drag/sync on new rooms (palette injection comes later). */
export const CANVAS_DUMMY_NODES: TraceCanvasNode[] = [
  {
    id: "gateway-1",
    type: "traceNode",
    position: { x: 80, y: 120 },
    width: INFRASTRUCTURE_NODE_DEFINITIONS.gateway.dimensions.width,
    height: INFRASTRUCTURE_NODE_DEFINITIONS.gateway.dimensions.height,
    data: {
      label: "API Gateway",
      type: "gateway",
      status: "healthy",
      errorRate: 0.01,
      latency: 42,
    },
  },
  {
    id: "compute-1",
    type: "traceNode",
    position: { x: 320, y: 80 },
    width: INFRASTRUCTURE_NODE_DEFINITIONS.compute.dimensions.width,
    height: INFRASTRUCTURE_NODE_DEFINITIONS.compute.dimensions.height,
    data: {
      label: "Worker Pool",
      type: "compute",
      status: "degraded",
      errorRate: 2.4,
      latency: 186,
    },
  },
  {
    id: "database-1",
    type: "traceNode",
    position: { x: 560, y: 200 },
    width: INFRASTRUCTURE_NODE_DEFINITIONS.database.dimensions.width,
    height: INFRASTRUCTURE_NODE_DEFINITIONS.database.dimensions.height,
    data: {
      label: "Primary DB",
      type: "database",
      status: "healthy",
      errorRate: 0.05,
      latency: 12,
    },
  },
];

export const CANVAS_DUMMY_EDGES: TraceCanvasEdge[] = [
  {
    id: "e-gateway-compute",
    type: "traceEdge",
    source: "gateway-1",
    target: "compute-1",
    data: { label: "HTTPS" },
  },
  {
    id: "e-compute-database",
    type: "traceEdge",
    source: "compute-1",
    target: "database-1",
    data: { label: "gRPC" },
  },
];
