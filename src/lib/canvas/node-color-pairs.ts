import type { NodeColorPair } from "@/types/canvas";

export type NodeColorPairDefinition = {
  id: NodeColorPair;
  label: string;
  shell: string;
  text: string;
  icon: string;
  swatch: string;
  hoverGlow: string;
};

/** Pre-defined background + text pairs tuned for --bg-base. */
export const NODE_COLOR_PAIR_DEFINITIONS: Record<
  NodeColorPair,
  NodeColorPairDefinition
> = {
  default: {
    id: "default",
    label: "Default",
    shell: "bg-zinc-900/50 border-zinc-700",
    text: "text-zinc-100",
    icon: "text-zinc-400",
    swatch: "bg-zinc-700",
    hoverGlow: "hover:shadow-[0_0_10px_rgba(244,244,245,0.35)]",
  },
  blue: {
    id: "blue",
    label: "Blue cluster",
    shell: "bg-blue-950/40 border-blue-500/50",
    text: "text-blue-200",
    icon: "text-blue-300/70",
    swatch: "bg-blue-500/80",
    hoverGlow: "hover:shadow-[0_0_10px_rgba(191,219,254,0.45)]",
  },
  purple: {
    id: "purple",
    label: "Purple cluster",
    shell: "bg-purple-950/40 border-purple-500/50",
    text: "text-purple-200",
    icon: "text-purple-300/70",
    swatch: "bg-purple-500/80",
    hoverGlow: "hover:shadow-[0_0_10px_rgba(233,213,255,0.45)]",
  },
  amber: {
    id: "amber",
    label: "Amber cluster",
    shell: "bg-amber-950/40 border-amber-500/50",
    text: "text-amber-200",
    icon: "text-amber-300/70",
    swatch: "bg-amber-500/80",
    hoverGlow: "hover:shadow-[0_0_10px_rgba(253,230,138,0.45)]",
  },
};

export const NODE_COLOR_PAIR_ORDER: NodeColorPair[] = [
  "default",
  "blue",
  "purple",
  "amber",
];

const NODE_COLOR_PAIR_SET = new Set<string>(NODE_COLOR_PAIR_ORDER);

export function resolveNodeColorPair(
  value: unknown
): NodeColorPair {
  if (typeof value === "string" && NODE_COLOR_PAIR_SET.has(value)) {
    return value as NodeColorPair;
  }
  return "default";
}

export function getNodeColorPairDefinition(
  value: unknown
): NodeColorPairDefinition {
  return NODE_COLOR_PAIR_DEFINITIONS[resolveNodeColorPair(value)];
}
