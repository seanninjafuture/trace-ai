import type { CanvasMutation } from "@/lib/chaos-agent/canvas-mutation-schema";

const MUTATION_ORDER: Record<CanvasMutation["action"], number> = {
  ADD_NODE: 0,
  ADD_EDGE: 1,
  UPDATE_NODE: 2,
  ADD_EDGE_ALERT: 3,
};

/** Ensures nodes exist before edges and topology exists before health updates. */
export function sortCanvasMutations(mutations: CanvasMutation[]): CanvasMutation[] {
  return [...mutations].sort(
    (a, b) => MUTATION_ORDER[a.action] - MUTATION_ORDER[b.action]
  );
}
