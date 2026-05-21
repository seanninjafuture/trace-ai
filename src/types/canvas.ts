import type { Edge, Node } from "@xyflow/react";

export type InfrastructureNodeType =
  | "gateway"
  | "compute"
  | "database"
  | "queue";

export type SimulationHealthStatus = "healthy" | "degraded" | "outage";

/** Coordinated node shell + label accent (see node-color-pairs.ts). */
export type NodeColorPair = "default" | "blue" | "purple" | "amber";

export interface TraceNodeData extends Record<string, unknown> {
  label: string;
  type: InfrastructureNodeType;
  status: SimulationHealthStatus;
  errorRate: number;
  latency: number;
  colorPair?: NodeColorPair;
}

export type TraceCanvasNode = Node<TraceNodeData, "traceNode">;

export interface TraceEdgeData extends Record<string, unknown> {
  label?: string;
}

export type TraceCanvasEdge = Edge<TraceEdgeData, "traceEdge">;
