"use client";

import { useCallback, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import { TraceEdgeLabelEditor } from "@/components/canvas/edges/trace-edge-label-editor";
import { cn } from "@/lib/utils";
import type { TraceCanvasEdge } from "@/types/canvas";

const EDGE_GLOW =
  "drop-shadow(0 0 4px color-mix(in srgb, var(--accent-primary) 45%, transparent))";

export function OrthogonalTrafficEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
}: EdgeProps<TraceCanvasEdge>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const isActive = selected || isHovered;
  const strokeColor = isActive
    ? "var(--accent-primary)"
    : "var(--border-default)";
  const label = data?.label ?? "";
  const showLabelBadge = Boolean(label) && !isEditingLabel;

  const beginLabelEdit = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditingLabel(true);
  }, []);

  const closeLabelEdit = useCallback(() => {
    setIsEditingLabel(false);
  }, []);

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={beginLabelEdit}
      />
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5,
          filter: isActive ? EDGE_GLOW : undefined,
        }}
        className="pointer-events-none"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={beginLabelEdit}
        >
          {isEditingLabel ? (
            <div
              className={cn(
                "rounded border border-zinc-800 bg-zinc-950/90 px-1.5 py-0.5"
              )}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <TraceEdgeLabelEditor
                edgeId={id}
                label={label}
                onClose={closeLabelEdit}
              />
            </div>
          ) : showLabelBadge ? (
            <span
              className={cn(
                "inline-block cursor-pointer rounded border border-zinc-800 bg-zinc-950/90 px-1.5 py-0.5 text-[11px] font-mono text-zinc-100"
              )}
            >
              {label}
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const traceEdgeTypes = {
  traceEdge: OrthogonalTrafficEdge,
} as const;
