import type { CanvasMutationPlan } from "@/lib/chaos-agent/canvas-mutation-schema";
import type { LiveFlowGraph } from "@/lib/chaos-agent/parse-live-flow-graph";

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function resolveNodeRef(
  ref: string,
  byId: Map<string, string>,
  byLabel: Map<string, string>
): string {
  if (byId.has(ref)) {
    return ref;
  }

  const token = normalizeToken(ref);
  const byExactLabel = byLabel.get(token);
  if (byExactLabel) {
    return byExactLabel;
  }

  for (const [labelToken, id] of byLabel) {
    if (labelToken.includes(token) || token.includes(labelToken)) {
      return id;
    }
  }

  if (/postgres|database|db|primary|data/i.test(ref)) {
    for (const [labelToken, id] of byLabel) {
      if (/db|postgres|data/i.test(labelToken)) {
        return id;
      }
    }
  }

  if (/gateway|ingress|load|lb/i.test(ref)) {
    for (const [labelToken, id] of byLabel) {
      if (/gateway|ingress|load|lb/i.test(labelToken)) {
        return id;
      }
    }
  }

  return ref;
}

/**
 * Maps AI node/edge references onto real ids using the live graph plus
 * ADD_NODE entries in the same plan (labels → nodeId).
 */
export function resolveMutationNodeIds(
  graph: LiveFlowGraph,
  plan: CanvasMutationPlan
): CanvasMutationPlan {
  const byId = new Map(graph.nodes.map((node) => [node.id, node.id]));
  const byLabel = new Map(
    graph.nodes.map((node) => [normalizeToken(node.data.label), node.id])
  );

  for (const mutation of plan.mutations) {
    if (mutation.action === "ADD_NODE") {
      byId.set(mutation.nodeId, mutation.nodeId);
      byLabel.set(normalizeToken(mutation.label), mutation.nodeId);
      byLabel.set(normalizeToken(mutation.nodeId), mutation.nodeId);
    }
  }

  const mutations = plan.mutations.map((mutation) => {
    if (mutation.action === "UPDATE_NODE") {
      const nodeId = resolveNodeRef(mutation.nodeId, byId, byLabel);
      return { ...mutation, nodeId };
    }

    if (mutation.action === "ADD_EDGE") {
      return {
        ...mutation,
        source: resolveNodeRef(mutation.source, byId, byLabel),
        target: resolveNodeRef(mutation.target, byId, byLabel),
      };
    }

    return mutation;
  });

  return { ...plan, mutations };
}
