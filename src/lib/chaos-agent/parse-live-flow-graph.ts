import type {
  InfrastructureNodeType,
  NodeColorPair,
  SimulationHealthStatus,
  TraceCanvasEdge,
  TraceCanvasNode,
} from "@/types/canvas";

export type LiveFlowGraph = {
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
};

const INFRA_TYPES = new Set<InfrastructureNodeType>([
  "gateway",
  "compute",
  "database",
  "queue",
]);

const HEALTH_STATUSES = new Set<SimulationHealthStatus>([
  "healthy",
  "degraded",
  "outage",
]);

function unwrapLiveblocksJson(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const type = record.liveblocksType;

  if (
    type === "LiveObject" ||
    type === "LiveMap" ||
    type === "LiveList"
  ) {
    return unwrapLiveblocksJson(record.data);
  }

  return value;
}

type CollectionEntry = { mapKey: string; entry: unknown };

function extractCollectionEntries(value: unknown): CollectionEntry[] {
  const unwrapped = unwrapLiveblocksJson(value);

  if (!unwrapped) {
    return [];
  }

  if (Array.isArray(unwrapped)) {
    return unwrapped.map((entry, index) => ({
      mapKey: String(index),
      entry,
    }));
  }

  if (typeof unwrapped !== "object") {
    return [];
  }

  return Object.entries(unwrapped as Record<string, unknown>).map(
    ([key, entry]) => ({ mapKey: key, entry })
  );
}

function readPosition(
  record: Record<string, unknown>
): { x: number; y: number } | null {
  const position = unwrapLiveblocksJson(record.position);
  if (!position || typeof position !== "object") {
    return null;
  }

  const point = position as Record<string, unknown>;
  if (typeof point.x !== "number" || typeof point.y !== "number") {
    return null;
  }

  return { x: point.x, y: point.y };
}

function readNodeData(raw: unknown): TraceCanvasNode["data"] | null {
  const unwrapped = unwrapLiveblocksJson(raw);
  if (!unwrapped || typeof unwrapped !== "object") {
    return null;
  }

  const record = unwrapped as Record<string, unknown>;
  const label = typeof record.label === "string" ? record.label : null;
  const infraType = record.type;

  if (!label || typeof infraType !== "string" || !INFRA_TYPES.has(infraType as InfrastructureNodeType)) {
    return null;
  }

  const statusRaw =
    typeof record.status === "string" ? record.status : "healthy";
  const status = HEALTH_STATUSES.has(statusRaw as SimulationHealthStatus)
    ? (statusRaw as SimulationHealthStatus)
    : "healthy";

  const colorPairRaw = record.colorPair;
  const colorPair =
    typeof colorPairRaw === "string" &&
    ["default", "blue", "purple", "amber"].includes(colorPairRaw)
      ? (colorPairRaw as NodeColorPair)
      : "default";

  return {
    label,
    type: infraType as InfrastructureNodeType,
    status,
    errorRate: typeof record.errorRate === "number" ? record.errorRate : 0,
    latency: typeof record.latency === "number" ? record.latency : 0,
    colorPair,
  };
}

/**
 * Normalizes a Liveblocks/React Flow node from storage JSON.
 * Map keys are used as `id` when the payload omits it (common in LiveMap JSON).
 */
export function normalizeTraceNode(
  entry: unknown,
  mapKey: string
): TraceCanvasNode | null {
  let record = unwrapLiveblocksJson(entry);
  if (!record || typeof record !== "object") {
    return null;
  }

  let obj = record as Record<string, unknown>;

  // Some exports nest the RF node one level deep.
  if (!readPosition(obj) && obj.data && typeof obj.data === "object") {
    const inner = unwrapLiveblocksJson(obj.data);
    if (inner && typeof inner === "object" && readPosition(inner as Record<string, unknown>)) {
      obj = inner as Record<string, unknown>;
    }
  }

  const position = readPosition(obj);
  const nodeData = readNodeData(obj.data);
  if (!position || !nodeData) {
    return null;
  }

  const id = typeof obj.id === "string" ? obj.id : mapKey;
  const width = typeof obj.width === "number" ? obj.width : undefined;
  const height = typeof obj.height === "number" ? obj.height : undefined;

  return {
    id,
    type: "traceNode",
    position,
    width,
    height,
    data: nodeData,
  };
}

function normalizeTraceEdge(
  entry: unknown,
  mapKey: string
): TraceCanvasEdge | null {
  const record = unwrapLiveblocksJson(entry);
  if (!record || typeof record !== "object") {
    return null;
  }

  const obj = record as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : mapKey;
  const source = typeof obj.source === "string" ? obj.source : null;
  const target = typeof obj.target === "string" ? obj.target : null;

  if (!source || !target) {
    return null;
  }

  const dataRaw = unwrapLiveblocksJson(obj.data);
  const label =
    dataRaw &&
    typeof dataRaw === "object" &&
    typeof (dataRaw as Record<string, unknown>).label === "string"
      ? ((dataRaw as Record<string, unknown>).label as string)
      : "";

  return {
    id,
    type: "traceEdge",
    source,
    target,
    data: { label },
    markerEnd: obj.markerEnd as TraceCanvasEdge["markerEnd"],
  };
}

/**
 * Parses the `flow` root from a Liveblocks storage JSON document.
 * Never reads canvas snapshots from PostgreSQL.
 */
export function parseLiveFlowGraph(storageDocument: unknown): LiveFlowGraph {
  if (!storageDocument || typeof storageDocument !== "object") {
    return { nodes: [], edges: [] };
  }

  const flow = unwrapLiveblocksJson(
    (storageDocument as Record<string, unknown>).flow
  );

  if (!flow || typeof flow !== "object") {
    return { nodes: [], edges: [] };
  }

  const record = flow as Record<string, unknown>;

  const nodes = extractCollectionEntries(record.nodes)
    .map(({ entry, mapKey }) => normalizeTraceNode(entry, mapKey))
    .filter((node): node is TraceCanvasNode => node !== null);

  const edges = extractCollectionEntries(record.edges)
    .map(({ entry, mapKey }) => normalizeTraceEdge(entry, mapKey))
    .filter((edge): edge is TraceCanvasEdge => edge !== null);

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
