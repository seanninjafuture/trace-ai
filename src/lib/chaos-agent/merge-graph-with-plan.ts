import type { CanvasMutationPlan } from "@/lib/chaos-agent/canvas-mutation-schema";
import { traceEdgeFromAddMutation, traceNodeFromAddMutation } from "@/lib/chaos-agent/build-trace-node-from-mutation";
import type { LiveFlowGraph } from "@/lib/chaos-agent/parse-live-flow-graph";

/** Preview graph for cursor animation before mutations are applied. */
export function mergeGraphWithPlan(
  graph: LiveFlowGraph,
  plan: CanvasMutationPlan
): LiveFlowGraph {
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];
  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const mutation of plan.mutations) {
    if (mutation.action === "ADD_NODE" && !nodeIds.has(mutation.nodeId)) {
      nodes.push(traceNodeFromAddMutation(mutation));
      nodeIds.add(mutation.nodeId);
    }
  }

  const edgeIds = new Set(edges.map((edge) => edge.id));
  for (const mutation of plan.mutations) {
    if (mutation.action === "ADD_EDGE" && !edgeIds.has(mutation.edgeId)) {
      edges.push(traceEdgeFromAddMutation(mutation));
      edgeIds.add(mutation.edgeId);
    }
  }

  return { nodes, edges };
}
