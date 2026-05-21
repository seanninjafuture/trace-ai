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
import type { CanvasMutationPlan } from "@/lib/chaos-agent/canvas-mutation-schema";
import {
  nodeFlowCenter,
  parseLiveFlowGraph,
  type LiveFlowGraph,
} from "@/lib/chaos-agent/parse-live-flow-graph";
import { assignUserColor, getLiveblocksClient } from "@/lib/liveblocks";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";
import {
  AIStatusMessageSchema,
  type AIStatusMessage,
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

export async function fetchLiveFlowGraph(roomId: string): Promise<LiveFlowGraph> {
  const client = getChaosLiveblocksClient();
  const document = await client.getStorageDocument(roomId, "json");
  return parseLiveFlowGraph(document);
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

export async function markAgentProcessing(roomId: string): Promise<void> {
  await pushAgentActivity(roomId, AGENT_ACTIVITY_PROCESSING);
  await pushAiStatusMessage(
    roomId,
    "processing",
    "Calculating downstream cascading latency vectors across API channels..."
  );
}

export async function markAgentApplying(roomId: string): Promise<void> {
  await pushAiStatusMessage(
    roomId,
    "applying",
    "Applying failure mutations to the live architecture graph..."
  );
}

export async function completeAgentActivity(
  roomId: string,
  nodesMutatedCount: number
): Promise<void> {
  const summary = `Failure injection successful. ${nodesMutatedCount} node${nodesMutatedCount === 1 ? "" : "s"} degraded.`;
  await pushAgentActivity(roomId, `[COMPLETE]: ${summary}`);
  await pushAiStatusMessage(roomId, "complete", summary);
}

export async function failAgentActivity(
  roomId: string,
  reason: string
): Promise<void> {
  await pushAgentActivity(roomId, `[FAILED]: ${reason}`);
  await pushAiStatusMessage(roomId, "failed", reason);
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
): Promise<number> {
  const client = getChaosLiveblocksClient();
  let nodesMutated = 0;

  await mutateFlow<TraceCanvasNode, TraceCanvasEdge>(
    { client, roomId, storageKey: "flow" },
    (flow) => {
      for (const mutation of plan.mutations) {
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
          nodesMutated += 1;
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

  return nodesMutated;
}

export async function cleanupChaosAgentSession(roomId: string): Promise<void> {
  await setChaosAgentPresence(roomId, {
    cursor: null,
    activeNodeId: null,
    isThinking: false,
  });
}
