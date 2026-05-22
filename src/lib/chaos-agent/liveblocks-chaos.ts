import { LiveList } from "@liveblocks/core";
import { mutateFlow } from "@liveblocks/react-flow/node";
import type { Liveblocks } from "@liveblocks/node";
import { randomUUID } from "node:crypto";

import {
  AGENT_ACTIVITY_PROCESSING,
  AGENT_ACTIVITY_START,
  CHAOS_AGENT_DISPLAY_NAME,
  CHAOS_AGENT_PRESENCE_TTL_SECONDS,
  CHAOS_AGENT_USER_ID,
} from "@/lib/chaos-agent/constants";
import {
  traceEdgeFromAddMutation,
  traceNodeFromAddMutation,
} from "@/lib/chaos-agent/build-trace-node-from-mutation";
import type { CanvasMutationPlan } from "@/lib/chaos-agent/canvas-mutation-schema";
import { sortCanvasMutations } from "@/lib/chaos-agent/sort-canvas-mutations";
import {
  nodeFlowCenter,
  parseLiveFlowGraph,
  type LiveFlowGraph,
} from "@/lib/chaos-agent/parse-live-flow-graph";
import { ensureLiveblocksRoom } from "@/lib/ensure-liveblocks-room";
import { assignUserColor, getLiveblocksClient } from "@/lib/liveblocks";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";
import {
  AIChatMessageSchema,
  AIStatusMessageSchema,
  type AIChatMessage,
  type AIStatusMessage,
  resolveChatAvatarUrl,
} from "@/types/tasks";

export type ChaosAgentPresence = {
  cursor: { x: number; y: number } | null;
  activeNodeId: string | null;
  isThinking: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getChaosLiveblocksClient(): Liveblocks {
  return getLiveblocksClient();
}

/** Read-only storage JSON (room must exist — call `ensureLiveblocksRoom` first). */
async function fetchLiveFlowGraphFromDocument(
  roomId: string
): Promise<LiveFlowGraph> {
  const client = getChaosLiveblocksClient();

  try {
    const document = await client.getStorageDocument(roomId, "json");
    return parseLiveFlowGraph(document);
  } catch {
    return { nodes: [], edges: [] };
  }
}

export async function fetchLiveFlowGraph(roomId: string): Promise<LiveFlowGraph> {
  await ensureLiveblocksRoom(roomId);
  return fetchLiveFlowGraphFromDocument(roomId);
}

async function resolveGraphForRooms(
  liveblocksRoomId: string,
  projectId: string
): Promise<{ graph: LiveFlowGraph; activeRoomId: string }> {
  const primary = await fetchLiveFlowGraph(liveblocksRoomId);

  if (primary.nodes.length > 0) {
    return { graph: primary, activeRoomId: liveblocksRoomId };
  }

  if (projectId !== liveblocksRoomId) {
    const legacy = await fetchLiveFlowGraph(projectId);
    if (legacy.nodes.length > 0) {
      console.warn(
        `[Chaos Agent] graph found in legacy room "${projectId}" (canonical: "${liveblocksRoomId}")`
      );
      return { graph: legacy, activeRoomId: projectId };
    }
  }

  return { graph: primary, activeRoomId: liveblocksRoomId };
}

const GRAPH_FETCH_RETRY_DELAYS_MS = [0, 400, 900, 1800] as const;

/**
 * Some legacy sessions stored graph data under the project id room instead of
 * canvasJsonPath. Retries give Liveblocks a moment to sync after template import.
 */
export async function fetchLiveFlowGraphForProject(
  liveblocksRoomId: string,
  projectId: string
): Promise<{ graph: LiveFlowGraph; activeRoomId: string }> {
  let last = await resolveGraphForRooms(liveblocksRoomId, projectId);

  for (let i = 1; i < GRAPH_FETCH_RETRY_DELAYS_MS.length; i++) {
    if (last.graph.nodes.length > 0) {
      return last;
    }

    const delay =
      GRAPH_FETCH_RETRY_DELAYS_MS[i]! - GRAPH_FETCH_RETRY_DELAYS_MS[i - 1]!;
    await sleep(delay);
    last = await resolveGraphForRooms(liveblocksRoomId, projectId);
  }

  return last;
}

async function setChaosAgentPresence(
  roomId: string,
  presence: ChaosAgentPresence
): Promise<void> {
  const client = getChaosLiveblocksClient();

  await client.setPresence(roomId, {
    userId: CHAOS_AGENT_USER_ID,
    data: presence,
    userInfo: {
      name: CHAOS_AGENT_DISPLAY_NAME,
      avatar: "",
      color: assignUserColor(CHAOS_AGENT_USER_ID),
    },
    ttl: CHAOS_AGENT_PRESENCE_TTL_SECONDS,
  });
}

export async function pushAiAssistantChatMessage(
  roomId: string,
  content: string
): Promise<void> {
  const message = AIChatMessageSchema.parse({
    id: randomUUID(),
    roomId,
    sender: {
      id: CHAOS_AGENT_USER_ID,
      name: CHAOS_AGENT_DISPLAY_NAME,
      avatar: resolveChatAvatarUrl(null, CHAOS_AGENT_DISPLAY_NAME),
    },
    role: "assistant",
    content,
    timestamp: Date.now(),
  });

  const client = getChaosLiveblocksClient();

  await client.mutateStorage(roomId, ({ root }) => {
    let chatMessages = root.get("aiChatMessages");

    if (!chatMessages) {
      chatMessages = new LiveList<AIChatMessage>([]);
      root.set("aiChatMessages", chatMessages);
    }

    chatMessages.push(message);
  });
}

export async function pushAiStatusMessage(
  roomId: string,
  step: AIStatusMessage["step"],
  text: string
): Promise<void> {
  const message = AIStatusMessageSchema.parse({
    id: randomUUID(),
    text,
    step,
    timestamp: Date.now(),
  });

  const client = getChaosLiveblocksClient();

  await client.mutateStorage(roomId, ({ root }) => {
    let statusMessages = root.get("aiStatusMessages");

    if (!statusMessages) {
      statusMessages = new LiveList<AIStatusMessage>([]);
      root.set("aiStatusMessages", statusMessages);
    }

    statusMessages.push(message);
  });
}

export async function pushAgentActivity(
  roomId: string,
  message: string
): Promise<void> {
  const client = getChaosLiveblocksClient();

  await client.mutateStorage(roomId, ({ root }) => {
    let activity = root.get("agentActivity");

    if (!activity) {
      activity = new LiveList<string>([]);
      root.set("agentActivity", activity);
    }

    activity.push(message);
  });
}

export async function beginChaosAgentSession(roomId: string): Promise<void> {
  await ensureLiveblocksRoom(roomId);
  await setChaosAgentPresence(roomId, {
    cursor: null,
    activeNodeId: null,
    isThinking: true,
  });
  await pushAgentActivity(roomId, AGENT_ACTIVITY_START);
  await pushAiStatusMessage(
    roomId,
    "initializing",
    "Trace AI Agent initializing chaos matrix..."
  );
}

export async function markAgentProcessing(
  roomId: string,
  options?: { architectMode?: boolean }
): Promise<void> {
  await pushAgentActivity(roomId, AGENT_ACTIVITY_PROCESSING);
  const text = options?.architectMode
    ? "Designing services on the canvas from your scenario, then simulating failure blast radius..."
    : "Calculating downstream cascading latency vectors across API channels...";
  await pushAiStatusMessage(roomId, "processing", text);
}

export async function markAgentApplying(roomId: string): Promise<void> {
  await pushAiStatusMessage(
    roomId,
    "applying",
    "Applying failure mutations to the live architecture graph..."
  );
}

export type CanvasApplyResult = {
  nodesAdded: number;
  edgesAdded: number;
  nodesUpdated: number;
};

function buildCompleteChatMessage(result: CanvasApplyResult): string {
  const { nodesAdded, edgesAdded, nodesUpdated } = result;
  const total = nodesAdded + nodesUpdated;

  if (total === 0 && edgesAdded === 0) {
    return "Simulation finished but nothing was applied to the canvas. Try a more specific scenario (e.g. services, failure type, and scale).";
  }

  const parts: string[] = [];
  if (nodesAdded > 0) {
    parts.push(
      `placed ${nodesAdded} service${nodesAdded === 1 ? "" : "s"} on the canvas`
    );
  }
  if (edgesAdded > 0) {
    parts.push(`connected ${edgesAdded} link${edgesAdded === 1 ? "" : "s"}`);
  }
  if (nodesUpdated > 0) {
    parts.push(
      `degraded ${nodesUpdated} node${nodesUpdated === 1 ? "" : "s"} for the scenario`
    );
  }

  return `Scenario applied: ${parts.join(", ")}. Check the canvas for topology and health indicators.`;
}

export async function completeAgentActivity(
  roomId: string,
  result: CanvasApplyResult
): Promise<void> {
  const summary =
    result.nodesAdded > 0
      ? `Architecture built (${result.nodesAdded} nodes, ${result.edgesAdded} edges) and failure injected (${result.nodesUpdated} nodes updated).`
      : `Failure injection successful. ${result.nodesUpdated} node${result.nodesUpdated === 1 ? "" : "s"} updated.`;

  await pushAgentActivity(roomId, `[COMPLETE]: ${summary}`);
  await pushAiStatusMessage(roomId, "complete", summary);
  await pushAiAssistantChatMessage(roomId, buildCompleteChatMessage(result));
}

export async function failAgentActivity(
  roomId: string,
  reason: string
): Promise<void> {
  const chatLine = /rate.?limit|429|quota|credit/i.test(reason)
    ? `Chaos simulation failed (API limit): ${reason}`
    : `Chaos simulation failed: ${reason}`;

  await pushAgentActivity(roomId, `[FAILED]: ${reason}`);
  await pushAiStatusMessage(roomId, "failed", reason);
  await pushAiAssistantChatMessage(roomId, chatLine);
}

export async function moveAgentCursorToNode(
  roomId: string,
  graph: LiveFlowGraph,
  nodeId: string
): Promise<void> {
  const node = graph.nodes.find((entry) => entry.id === nodeId);
  if (!node) {
    return;
  }

  const center = nodeFlowCenter(node);
  await setChaosAgentPresence(roomId, {
    cursor: center,
    activeNodeId: nodeId,
    isThinking: true,
  });
  await sleep(280);
}

export async function animateAgentCursorPath(
  roomId: string,
  graph: LiveFlowGraph,
  nodeIds: string[]
): Promise<void> {
  const uniqueIds = [...new Set(nodeIds)];

  for (const nodeId of uniqueIds) {
    await moveAgentCursorToNode(roomId, graph, nodeId);
  }
}

export async function applyCanvasMutations(
  roomId: string,
  plan: CanvasMutationPlan
): Promise<CanvasApplyResult> {
  await ensureLiveblocksRoom(roomId);
  const client = getChaosLiveblocksClient();
  const result: CanvasApplyResult = {
    nodesAdded: 0,
    edgesAdded: 0,
    nodesUpdated: 0,
  };

  const ordered = sortCanvasMutations(plan.mutations);

  await mutateFlow<TraceCanvasNode, TraceCanvasEdge>(
    { client, roomId, storageKey: "flow" },
    (flow) => {
      for (const mutation of ordered) {
        if (mutation.action === "ADD_NODE") {
          if (flow.getNode(mutation.nodeId)) {
            continue;
          }
          flow.addNode(traceNodeFromAddMutation(mutation));
          result.nodesAdded += 1;
          continue;
        }

        if (mutation.action === "ADD_EDGE") {
          if (flow.getEdge(mutation.edgeId)) {
            continue;
          }
          if (!flow.getNode(mutation.source) || !flow.getNode(mutation.target)) {
            continue;
          }
          flow.addEdge(traceEdgeFromAddMutation(mutation));
          result.edgesAdded += 1;
          continue;
        }

        if (mutation.action === "UPDATE_NODE") {
          const existing = flow.getNode(mutation.nodeId);
          if (!existing) {
            continue;
          }

          flow.updateNodeData(mutation.nodeId, {
            status: mutation.status,
            errorRate: mutation.errorRate,
            latency: mutation.latency,
          });
          result.nodesUpdated += 1;
          continue;
        }

        if (mutation.action === "ADD_EDGE_ALERT") {
          const existing = flow.getEdge(mutation.edgeId);
          if (!existing) {
            continue;
          }

          const currentLabel =
            typeof existing.data?.label === "string" ? existing.data.label : "";

          flow.updateEdgeData(mutation.edgeId, {
            label: currentLabel
              ? `${currentLabel} · ${mutation.label}`
              : mutation.label,
          });
        }
      }
    }
  );

  return result;
}

export async function cleanupChaosAgentSession(roomId: string): Promise<void> {
  await setChaosAgentPresence(roomId, {
    cursor: null,
    activeNodeId: null,
    isThinking: false,
  });
}
