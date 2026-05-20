import type { Edge, Node } from "@xyflow/react";

export type InfrastructureNodeType =
  | "gateway"
  | "compute"
  | "database"
  | "queue";

export type SimulationHealthStatus = "healthy" | "degraded" | "outage";

export interface TraceNodeData extends Record<string, unknown> {
  label: string;
  type: InfrastructureNodeType;
  status: SimulationHealthStatus;
  errorRate: number;
  latency: number;
}

export type TraceCanvasNode = Node<TraceNodeData, "traceNode">;
export type TraceCanvasEdge = Edge<Record<string, unknown>, "traceEdge">;
