"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";
import type {
  SimulationHealthStatus,
  TraceCanvasNode,
} from "@/types/canvas";

const statusBorderClass: Record<SimulationHealthStatus, string> = {
  healthy: "border-state-success/60",
  degraded: "border-state-warning/60",
  outage: "border-state-error/60",
};

const statusDotClass: Record<SimulationHealthStatus, string> = {
  healthy: "bg-state-success",
  degraded: "bg-state-warning",
  outage: "bg-state-error",
};

export function TraceNode({ data, selected }: NodeProps<TraceCanvasNode>) {
  return (
    <div
      className={cn(
        "min-w-[160px] rounded-lg border bg-bg-surface px-3 py-2 shadow-sm",
        statusBorderClass[data.status],
        selected && "ring-2 ring-accent-primary/50"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-border-default" />
      <div className="flex items-center gap-2">
        <span
          className={cn("size-2 shrink-0 rounded-full", statusDotClass[data.status])}
          aria-hidden
        />
        <span className="truncate text-sm font-medium text-text-primary">
          {data.label}
        </span>
      </div>
      <p className="mt-1 text-xs capitalize text-text-muted">{data.type}</p>
      <div className="mt-2 flex gap-3 font-mono text-[10px] text-text-muted">
        <span>{data.latency}ms</span>
        <span>{data.errorRate}% err</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-border-default" />
    </div>
  );
}

export const traceNodeTypes = {
  traceNode: TraceNode,
} as const;
