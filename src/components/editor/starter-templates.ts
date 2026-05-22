import { MarkerType } from "@xyflow/react";

import { INFRASTRUCTURE_NODE_DEFINITIONS } from "@/lib/canvas/infrastructure-nodes";
import type {
  InfrastructureNodeType,
  NodeColorPair,
  TraceCanvasEdge,
  TraceCanvasNode,
} from "@/types/canvas";

export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
};

const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: "var(--border-default)",
} as const;

function templateNode(
  id: string,
  type: InfrastructureNodeType,
  label: string,
  position: { x: number; y: number },
  colorPair: NodeColorPair = "default"
): TraceCanvasNode {
  const definition = INFRASTRUCTURE_NODE_DEFINITIONS[type];
  return {
    id,
    type: "traceNode",
    position,
    width: definition.dimensions.width,
    height: definition.dimensions.height,
    data: {
      label,
      type,
      status: "healthy",
      errorRate: 0,
      latency: 15,
      colorPair,
    },
  };
}

function templateEdge(
  id: string,
  source: string,
  target: string,
  label: string
): TraceCanvasEdge {
  return {
    id,
    type: "traceEdge",
    source,
    target,
    markerEnd: EDGE_MARKER,
    data: { label },
  };
}

/** API gateway → compute tier → database layer. */
const THREE_TIER_WEB_SERVICE: CanvasTemplate = {
  id: "three-tier-web",
  name: "Three-Tier Web Service",
  description:
    "API gateway load-balances traffic across compute services that persist state through a shared database tier.",
  nodes: [
    templateNode("tt-gateway", "gateway", "API Gateway", { x: 40, y: 150 }, "blue"),
    templateNode("tt-api-a", "compute", "User API", { x: 300, y: 70 }, "default"),
    templateNode("tt-api-b", "compute", "Orders API", { x: 300, y: 230 }, "default"),
    templateNode("tt-db", "database", "PostgreSQL", { x: 560, y: 150 }, "purple"),
  ],
  edges: [
    templateEdge("tt-e-gw-a", "tt-gateway", "tt-api-a", "HTTPS"),
    templateEdge("tt-e-gw-b", "tt-gateway", "tt-api-b", "HTTPS"),
    templateEdge("tt-e-a-db", "tt-api-a", "tt-db", "SQL"),
    templateEdge("tt-e-b-db", "tt-api-b", "tt-db", "SQL"),
  ],
};

/** Gateway → message queue → distributed workers. */
const EVENT_DRIVEN_PIPELINE: CanvasTemplate = {
  id: "event-driven-pipeline",
  name: "Event-Driven Pipeline",
  description:
    "Ingests requests through a gateway, buffers work on an AMQP queue, and fans out to parallel worker nodes.",
  nodes: [
    templateNode("ed-gateway", "gateway", "Ingress Gateway", { x: 40, y: 160 }, "blue"),
    templateNode("ed-queue", "queue", "AMQP Queue", { x: 280, y: 160 }, "amber"),
    templateNode("ed-worker-a", "compute", "Worker A", { x: 520, y: 70 }, "default"),
    templateNode("ed-worker-b", "compute", "Worker B", { x: 520, y: 250 }, "default"),
  ],
  edges: [
    templateEdge("ed-e-gw-q", "ed-gateway", "ed-queue", "publish"),
    templateEdge("ed-e-q-a", "ed-queue", "ed-worker-a", "consume"),
    templateEdge("ed-e-q-b", "ed-queue", "ed-worker-b", "consume"),
  ],
};

/** Load balancer → compute pool with primary / standby database replication. */
const HIGH_AVAILABILITY_CLUSTER: CanvasTemplate = {
  id: "high-availability-cluster",
  name: "High-Availability Cluster",
  description:
    "Load balancer distributes traffic across redundant compute nodes backed by active–standby database replication.",
  nodes: [
    templateNode("ha-lb", "gateway", "Load Balancer", { x: 40, y: 170 }, "blue"),
    templateNode("ha-node-1", "compute", "App Node 1", { x: 280, y: 50 }, "default"),
    templateNode("ha-node-2", "compute", "App Node 2", { x: 280, y: 170 }, "default"),
    templateNode("ha-node-3", "compute", "App Node 3", { x: 280, y: 290 }, "default"),
    templateNode("ha-db-primary", "database", "Primary DB", { x: 560, y: 110 }, "purple"),
    templateNode("ha-db-replica", "database", "Standby DB", { x: 560, y: 270 }, "purple"),
  ],
  edges: [
    templateEdge("ha-e-lb-1", "ha-lb", "ha-node-1", "HTTP"),
    templateEdge("ha-e-lb-2", "ha-lb", "ha-node-2", "HTTP"),
    templateEdge("ha-e-lb-3", "ha-lb", "ha-node-3", "HTTP"),
    templateEdge("ha-e-1-p", "ha-node-1", "ha-db-primary", "write"),
    templateEdge("ha-e-2-p", "ha-node-2", "ha-db-primary", "write"),
    templateEdge("ha-e-3-r", "ha-node-3", "ha-db-replica", "read"),
    templateEdge("ha-e-repl", "ha-db-primary", "ha-db-replica", "replication"),
  ],
};

export const STARTER_TEMPLATES: CanvasTemplate[] = [
  THREE_TIER_WEB_SERVICE,
  EVENT_DRIVEN_PIPELINE,
  HIGH_AVAILABILITY_CLUSTER,
];

export function getStarterTemplateById(id: string): CanvasTemplate | undefined {
  return STARTER_TEMPLATES.find((template) => template.id === id);
}
