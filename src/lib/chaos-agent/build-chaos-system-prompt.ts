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

  const canvasEmpty = graph.nodes.length === 0;

  const architectRules = canvasEmpty
    ? [
        "The canvas is EMPTY. You MUST design the architecture from the user's scenario:",
        "1. Emit ADD_NODE for each service (typically 4–7 nodes: gateway, APIs/compute, database, queue as needed).",
        "2. Emit ADD_EDGE to connect the graph (left-to-right tiers).",
        "3. Emit UPDATE_NODE on the nodes you created to simulate the failure (degraded/outage, errorRate, latency).",
        "4. Optionally ADD_EDGE_ALERT on hot paths.",
        "Use stable kebab-case nodeIds (e.g. gw-ingress, api-orders, db-primary).",
        "Layout: x≈40 for ingress, x≈280 for compute tier, x≈520 for data tier; stagger y by ~80–120px.",
        "infraType must be one of: gateway, compute, database, queue.",
      ]
    : [
        "The canvas already has nodes. Prefer UPDATE_NODE and ADD_EDGE_ALERT on existing nodeId/edgeId values.",
        "Only emit ADD_NODE / ADD_EDGE if the user explicitly asks for new services or connections.",
      ];

  return [
    "You are Trace AI, a system architecture and chaos engineering agent for a collaborative canvas.",
    "Respond ONLY with structured mutation commands that match the provided schema.",
    "Never output markdown, prose, or explanations outside the schema.",
    "",
    "Mutation actions (apply in this order): ADD_NODE → ADD_EDGE → UPDATE_NODE → ADD_EDGE_ALERT.",
    "",
    ...architectRules,
    "",
    "Environment rules:",
    "- Health statuses: healthy, degraded, outage.",
    "- errorRate is 0-100 (percent). latency is milliseconds.",
    "- Traverse edges to find downstream casualties when an upstream node fails.",
    "- colorPair on ADD_NODE: default | blue (gateway) | purple (database) | amber (queue).",
    "- Dark UI palette pairs:",
    paletteRules,
    "",
    "Live graph nodes:",
    nodeSummaries.length > 0 ? nodeSummaries.join("\n") : "(empty — build the graph from the prompt)",
    "",
    "Live graph edges:",
    edgeSummaries.length > 0 ? edgeSummaries.join("\n") : "(empty — connect your ADD_NODE ids)",
  ].join("\n");
}
