import type {
  InfrastructureNodeType,
  TraceCanvasNode,
} from "@/types/canvas";

export const TRACE_NODE_DRAG_MIME = "application/trace-infrastructure-node";

export type InfrastructureNodeDimensions = {
  width: number;
  height: number;
};

export type InfrastructureNodeDragPayload = {
  type: InfrastructureNodeType;
  label: string;
  dimensions: InfrastructureNodeDimensions;
};

export type InfrastructureNodeDefinition = {
  type: InfrastructureNodeType;
  label: string;
  defaultLabel: string;
  dimensions: InfrastructureNodeDimensions;
};

export const INFRASTRUCTURE_NODE_DEFINITIONS: Record<
  InfrastructureNodeType,
  InfrastructureNodeDefinition
> = {
  gateway: {
    type: "gateway",
    label: "Gateway / Load Balancer",
    defaultLabel: "New Gateway",
    dimensions: { width: 200, height: 60 },
  },
  compute: {
    type: "compute",
    label: "Compute Service / API",
    defaultLabel: "New API Service",
    dimensions: { width: 180, height: 80 },
  },
  database: {
    type: "database",
    label: "Data Store / Database",
    defaultLabel: "New Data Store",
    dimensions: { width: 150, height: 90 },
  },
  queue: {
    type: "queue",
    label: "Message Queue",
    defaultLabel: "New Message Queue",
    dimensions: { width: 190, height: 55 },
  },
};

const INFRASTRUCTURE_NODE_TYPES = new Set<string>([
  "gateway",
  "compute",
  "database",
  "queue",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInfrastructureNodeType(value: unknown): value is InfrastructureNodeType {
  return typeof value === "string" && INFRASTRUCTURE_NODE_TYPES.has(value);
}

function isDimensions(value: unknown): value is InfrastructureNodeDimensions {
  if (!isRecord(value)) return false;
  return (
    typeof value.width === "number" &&
    Number.isFinite(value.width) &&
    value.width > 0 &&
    typeof value.height === "number" &&
    Number.isFinite(value.height) &&
    value.height > 0
  );
}

export function parseInfrastructureNodeDragPayload(
  raw: string
): InfrastructureNodeDragPayload | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;
  if (!isInfrastructureNodeType(parsed.type)) return null;
  if (typeof parsed.label !== "string" || !parsed.label.trim()) return null;
  if (!isDimensions(parsed.dimensions)) return null;

  return {
    type: parsed.type,
    label: parsed.label.trim(),
    dimensions: parsed.dimensions,
  };
}

export function serializeInfrastructureNodeDragPayload(
  type: InfrastructureNodeType
): string {
  const definition = INFRASTRUCTURE_NODE_DEFINITIONS[type];
  const payload: InfrastructureNodeDragPayload = {
    type: definition.type,
    label: definition.defaultLabel,
    dimensions: definition.dimensions,
  };
  return JSON.stringify(payload);
}

export function getInfrastructureNodeDimensions(
  type: InfrastructureNodeType
): InfrastructureNodeDimensions {
  return INFRASTRUCTURE_NODE_DEFINITIONS[type].dimensions;
}

export function createTraceCanvasNodeFromPayload(
  payload: InfrastructureNodeDragPayload,
  position: { x: number; y: number }
): TraceCanvasNode {
  const typeLabel =
    payload.type.charAt(0).toUpperCase() + payload.type.slice(1);

  return {
    id: `${payload.type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "traceNode",
    position,
    width: payload.dimensions.width,
    height: payload.dimensions.height,
    data: {
      label: `New ${typeLabel}`,
      type: payload.type,
      status: "healthy",
      errorRate: 0,
      latency: 15,
      colorPair: "default",
    },
  };
}
