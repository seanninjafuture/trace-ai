import { generateObject } from "ai";

import { task } from "@trigger.dev/sdk";



import { buildChaosSystemPrompt } from "../src/lib/chaos-agent/build-chaos-system-prompt";

import { canvasMutationSchema } from "../src/lib/chaos-agent/canvas-mutation-schema";

import { mergeGraphWithPlan } from "../src/lib/chaos-agent/merge-graph-with-plan";

import { resolveMutationNodeIds } from "../src/lib/chaos-agent/resolve-mutation-node-ids";

import {

  animateAgentCursorPath,

  applyCanvasMutations,

  beginChaosAgentSession,

  cleanupChaosAgentSession,

  completeAgentActivity,

  failAgentActivity,

  fetchLiveFlowGraphForProject,

  markAgentApplying,

  markAgentProcessing,

} from "../src/lib/chaos-agent/liveblocks-chaos";

import { nemotronOmniFreeModel } from "../src/lib/openrouter";



export const chaosAgentTask = task({

  id: "chaos-agent-task",

  run: async (payload: { prompt: string; roomId: string; projectId: string }) => {

    const { prompt, roomId: canonicalRoomId, projectId } = payload;



    console.log(

      `[Trace AI Agent Init]: canonical room -> ${canonicalRoomId}, projectId -> ${projectId}`

    );

    console.log(`[Chaos Vector Captured]: prompt payload string -> ${prompt}`);



    let activeRoomId = canonicalRoomId;



    try {

      const resolved = await fetchLiveFlowGraphForProject(

        canonicalRoomId,

        projectId

      );

      activeRoomId = resolved.activeRoomId;

      const graph = resolved.graph;

      const architectMode = graph.nodes.length === 0;



      console.log(

        `[Chaos Agent] live graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges in room ${activeRoomId} (architect=${architectMode})`

      );



      await beginChaosAgentSession(activeRoomId);

      await markAgentProcessing(activeRoomId, { architectMode });



      const { object: rawPlan } = await generateObject({

        model: nemotronOmniFreeModel(),

        schema: canvasMutationSchema,

        system: buildChaosSystemPrompt(graph),

        prompt,

      });



      const plan = resolveMutationNodeIds(graph, rawPlan);

      const previewGraph = mergeGraphWithPlan(graph, plan);



      const nodeIdsToVisit = plan.mutations

        .filter((mutation) => mutation.action === "UPDATE_NODE")

        .map((mutation) => mutation.nodeId);



      const cursorTargets =

        nodeIdsToVisit.length > 0

          ? nodeIdsToVisit

          : previewGraph.nodes.map((node) => node.id);



      if (cursorTargets.length > 0) {

        await animateAgentCursorPath(activeRoomId, previewGraph, cursorTargets);

      }



      await markAgentApplying(activeRoomId);

      const applyResult = await applyCanvasMutations(activeRoomId, plan);

      await completeAgentActivity(activeRoomId, applyResult);



      return {

        status: "success" as const,

        processedPrompt: prompt,

        nodesMutatedCount: applyResult.nodesUpdated,

        nodesAddedCount: applyResult.nodesAdded,

        edgesAddedCount: applyResult.edgesAdded,

        mutationsApplied: plan.mutations.length,

      };

    } catch (error) {

      console.error("[Trace AI Agent] chaos simulation failed:", error);

      const reason =

        error instanceof Error

          ? error.message

          : "Chaos simulation failed unexpectedly.";

      await failAgentActivity(activeRoomId, reason);

      throw error;

    } finally {

      await cleanupChaosAgentSession(activeRoomId);

    }

  },

});

