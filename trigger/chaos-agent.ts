import { generateObject } from "ai";
import { task } from "@trigger.dev/sdk";

import { buildChaosSystemPrompt } from "../src/lib/chaos-agent/build-chaos-system-prompt";
import { canvasMutationSchema } from "../src/lib/chaos-agent/canvas-mutation-schema";
import {
  animateAgentCursorPath,
  applyCanvasMutations,
  beginChaosAgentSession,
  cleanupChaosAgentSession,
  completeAgentActivity,
  failAgentActivity,
  fetchLiveFlowGraph,
  markAgentApplying,
  markAgentProcessing,
} from "../src/lib/chaos-agent/liveblocks-chaos";
import { nemotronOmniFreeModel } from "../src/lib/openrouter";

export const chaosAgentTask = task({
  id: "chaos-agent-task",
  run: async (payload: { prompt: string; roomId: string; projectId: string }) => {
    const { prompt, roomId } = payload;

    console.log(`[Trace AI Agent Init]: target workspace room -> ${roomId}`);
    console.log(`[Chaos Vector Captured]: prompt payload string -> ${prompt}`);

    try {
      await beginChaosAgentSession(roomId);

      const graph = await fetchLiveFlowGraph(roomId);
      await markAgentProcessing(roomId);

      const { object: plan } = await generateObject({
        model: nemotronOmniFreeModel(),
        schema: canvasMutationSchema,
        system: buildChaosSystemPrompt(graph),
        prompt,
      });

      const nodeIdsToVisit = plan.mutations
        .filter((mutation) => mutation.action === "UPDATE_NODE")
        .map((mutation) => mutation.nodeId);

      if (nodeIdsToVisit.length > 0) {
        await animateAgentCursorPath(roomId, graph, nodeIdsToVisit);
      }

      await markAgentApplying(roomId);
      const nodesMutatedCount = await applyCanvasMutations(roomId, plan);
      await completeAgentActivity(roomId, nodesMutatedCount);

      return {
        status: "success" as const,
        processedPrompt: prompt,
        nodesMutatedCount,
        mutationsApplied: plan.mutations.length,
      };
    } catch (error) {
      console.error("[Trace AI Agent] chaos simulation failed:", error);
      const reason =
        error instanceof Error
          ? error.message
          : "Chaos simulation failed unexpectedly.";
      await failAgentActivity(roomId, reason);
      throw error;
    } finally {
      await cleanupChaosAgentSession(roomId);
    }
  },
});
