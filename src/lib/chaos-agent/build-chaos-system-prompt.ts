import { NODE_COLOR_PAIR_DEFINITIONS } from "@/lib/canvas/node-color-pairs";
import type { LiveFlowGraph } from "@/lib/chaos-agent/parse-live-flow-graph";

export function buildChaosSystemPrompt(graph: LiveFlowGraph): string {
  const paletteRules = Object.values(NODE_COLOR_PAIR_DEFINITIONS)
    .map((pair) => `- ${pair.id}: shell ${pair.shell}, text ${pair.text}`)
    .join("\n");

  const nodeSummaries = graph.nodes.map((node) => {
    const data = node.data;
    return [
      `id=${node.id}`,
      `label=${data.label}`,
      `type=${data.type}`,
      `status=${data.status}`,
      `errorRate=${data.errorRate}`,
      `latency=${data.latency}ms`,
      `colorPair=${data.colorPair ?? "default"}`,
      `position=(${node.position.x},${node.position.y})`,
    ].join(", ");
  });

  const edgeSummaries = graph.edges.map((edge) => {
    const label = edge.data?.label ?? "";
    return `id=${edge.id}, source=${edge.source}, target=${edge.target}, label=${label}`;
  });

  return [
    "You are Trace AI, a chaos engineering agent for a distributed system canvas.",
    "Respond ONLY with structured mutation commands that match the provided schema.",
    "Never output markdown, prose, or explanations outside the schema.",
    "",
    "Environment rules:",
    "- Health statuses are strictly: healthy, degraded, outage.",
    "- errorRate is 0-100 (percent). latency is milliseconds.",
    "- Use only existing nodeId and edgeId values from the live graph below.",
    "- Traverse edges to find downstream casualties when an upstream node fails.",
    "- Respect the dark UI palette pairs on nodes (do not invent new color tokens):",
    paletteRules,
    "",
    "Live graph nodes:",
    nodeSummaries.length > 0 ? nodeSummaries.join("\n") : "(no nodes)",
    "",
    "Live graph edges:",
    edgeSummaries.length > 0 ? edgeSummaries.join("\n") : "(no edges)",
  ].join("\n");
}
