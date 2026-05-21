import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";
import { parseAiChatMessages } from "@/types/tasks";

export type SpecGenerationContext = {
  nodes: unknown[];
  edges: unknown[];
  chatHistory: unknown[];
};

function summarizeNode(node: TraceCanvasNode): string {
  const data = node.data;
  return [
    `id=${node.id}`,
    `label=${data.label}`,
    `type=${data.type}`,
    `status=${data.status}`,
    `errorRate=${data.errorRate}%`,
    `latency=${data.latency}ms`,
  ].join(", ");
}

function summarizeEdge(edge: TraceCanvasEdge): string {
  const label = edge.data?.label ?? "";
  return `id=${edge.id}, source=${edge.source}, target=${edge.target}, label=${label}`;
}

function isTraceNode(node: unknown): node is TraceCanvasNode {
  if (typeof node !== "object" || node === null) {
    return false;
  }
  const record = node as TraceCanvasNode;
  const data = record.data;
  return (
    record.type === "traceNode" &&
    typeof data === "object" &&
    data !== null &&
    typeof data.label === "string" &&
    typeof data.type === "string" &&
    typeof data.status === "string"
  );
}

function isTraceEdge(edge: unknown): edge is TraceCanvasEdge {
  if (typeof edge !== "object" || edge === null) {
    return false;
  }
  const record = edge as TraceCanvasEdge;
  return typeof record.id === "string" && typeof record.source === "string";
}

export function buildSpecSystemPrompt(context: SpecGenerationContext): string {
  const nodes = context.nodes.filter(isTraceNode);
  const edges = context.edges.filter(isTraceEdge);
  const chatMessages = parseAiChatMessages(context.chatHistory);

  const degradedOrOutage = nodes.filter(
    (node) => node.data.status === "degraded" || node.data.status === "outage"
  );

  const nodeSummaries = nodes.map(summarizeNode);
  const edgeSummaries = edges.map(summarizeEdge);

  const chatSummaries = chatMessages.map((message) => {
    const role = message.role === "user" ? "Operator" : "Assistant";
    return `[${role}] ${message.sender.name}: ${message.content}`;
  });

  const incidentNodes =
    degradedOrOutage.length > 0
      ? degradedOrOutage.map(summarizeNode).join("\n")
      : "(no degraded or outage nodes — infer risk from topology and chat)";

  return [
    "You are Trace AI, a senior reliability engineer authoring incident documentation.",
    "Output a single comprehensive Incident Post-Mortem and Recovery Playbook Specification Document in valid Markdown.",
    "Do not wrap the document in code fences. Do not include preamble or meta commentary outside the document.",
    "",
    "Analysis requirements:",
    "- Map infrastructure shapes (gateway, compute, database, queue) and how they connect.",
    "- Highlight components in degraded or outage status tiers; relate blast radius along edges.",
    "- Parse simulation chat logs for operator troubleshooting patterns, hypotheses, and milestones.",
    "- Produce industry-grade sections: executive summary, timeline, impact, root cause analysis,",
    "  contributing factors, detection/response gaps, recovery playbook steps, verification checklist,",
    "  and follow-up action items with owners placeholders.",
    "",
    "Canvas topology — nodes:",
    nodeSummaries.length > 0 ? nodeSummaries.join("\n") : "(no nodes)",
    "",
    "Canvas topology — edges:",
    edgeSummaries.length > 0 ? edgeSummaries.join("\n") : "(no edges)",
    "",
    "Components in degraded or outage state:",
    incidentNodes,
    "",
    "Simulation chat log:",
    chatSummaries.length > 0 ? chatSummaries.join("\n") : "(no chat messages)",
  ].join("\n");
}
