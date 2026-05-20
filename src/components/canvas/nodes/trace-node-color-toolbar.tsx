"use client";

import { NodeToolbar, Position } from "@xyflow/react";

import { useUpdateTraceNodeColorPair } from "@/components/canvas/nodes/use-trace-node-mutations";
import {
  NODE_COLOR_PAIR_DEFINITIONS,
  NODE_COLOR_PAIR_ORDER,
} from "@/lib/canvas/node-color-pairs";
import { cn } from "@/lib/utils";
import type { NodeColorPair } from "@/types/canvas";

type TraceNodeColorToolbarProps = {
  nodeId: string;
  colorPair: NodeColorPair;
  isVisible: boolean;
};

export function TraceNodeColorToolbar({
  nodeId,
  colorPair,
  isVisible,
}: TraceNodeColorToolbarProps) {
  const updateColorPair = useUpdateTraceNodeColorPair();

  const stopCanvasInteraction = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <NodeToolbar
      nodeId={nodeId}
      isVisible={isVisible}
      position={Position.Top}
      offset={12}
      align="center"
      className="nodrag nopan"
      onPointerDown={stopCanvasInteraction}
      onMouseDown={stopCanvasInteraction}
      onClick={stopCanvasInteraction}
    >
      <div
        className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-xl"
        onPointerDown={stopCanvasInteraction}
      >
        {NODE_COLOR_PAIR_ORDER.map((pairId) => {
          const pair = NODE_COLOR_PAIR_DEFINITIONS[pairId];
          const isActive = colorPair === pairId;

          return (
            <button
              key={pairId}
              type="button"
              title={pair.label}
              aria-label={pair.label}
              aria-pressed={isActive}
              className={cn(
                "h-5 w-5 shrink-0 rounded-full border border-zinc-800/80 transition-shadow",
                pair.swatch,
                pair.hoverGlow,
                isActive &&
                  "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950"
              )}
              onClick={(event) => {
                event.stopPropagation();
                updateColorPair(nodeId, pairId);
              }}
            />
          );
        })}
      </div>
    </NodeToolbar>
  );
}
