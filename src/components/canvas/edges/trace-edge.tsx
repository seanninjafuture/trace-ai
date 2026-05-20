import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import { cn } from "@/lib/utils";
import type { TraceCanvasEdge } from "@/types/canvas";

export function TraceEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  style,
}: EdgeProps<TraceCanvasEdge>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <BaseEdge
      path={path}
      markerEnd={markerEnd}
      style={style}
      className={cn(
        "!stroke-[1.5]",
        selected
          ? "!stroke-accent-primary"
          : "!stroke-border-default/80"
      )}
    />
  );
}

export const traceEdgeTypes = {
  traceEdge: TraceEdge,
} as const;
