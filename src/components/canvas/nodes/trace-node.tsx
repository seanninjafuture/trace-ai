"use client";

import { useCallback, useState } from "react";
import { shallow, useOthers } from "@liveblocks/react/suspense";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";

import { InfrastructureShapeBody } from "@/components/canvas/nodes/infrastructure-shapes";
import { TraceNodeColorToolbar } from "@/components/canvas/nodes/trace-node-color-toolbar";
import { TraceNodeLabelEditor } from "@/components/canvas/nodes/trace-node-label-editor";
import { INFRASTRUCTURE_NODE_DEFINITIONS } from "@/lib/canvas/infrastructure-nodes";
import { getNodeColorPairDefinition } from "@/lib/canvas/node-color-pairs";
import { cn } from "@/lib/utils";
import type { InfrastructureNodeType, TraceCanvasNode } from "@/types/canvas";

const MIN_NODE_WIDTH = 140;
const MIN_NODE_HEIGHT = 50;

const RESIZER_HANDLE_CLASS =
  "!h-1.5 !w-1.5 !rounded-sm !border !border-zinc-600 !bg-zinc-800";

const silhouetteClass: Record<InfrastructureNodeType, string> = {
  gateway: "rounded-full",
  compute: "rounded-md",
  database: "rounded-lg",
  queue: "rounded-md",
};

const healthStatusClass = {
  healthy: "",
  degraded:
    "ring-2 ring-amber-500/90 shadow-[0_0_14px_color-mix(in_srgb,#f59e0b_35%,transparent)]",
  outage:
    "ring-2 ring-red-500 shadow-[0_0_18px_color-mix(in_srgb,#ef4444_45%,transparent)]",
} as const;

function useIsNodeLockedByPeer(nodeId: string) {
  return useOthers(
    (others) => others.some((other) => other.presence.activeNodeId === nodeId),
    shallow
  );
}

export function FoundationalNodeRenderer({
  id,
  data,
  selected,
  width,
  height,
}: NodeProps<TraceCanvasNode>) {
  const isPeerLocked = useIsNodeLockedByPeer(id);
  const isFocused = selected || isPeerLocked;
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const dimensions =
    width && height
      ? { width, height }
      : INFRASTRUCTURE_NODE_DEFINITIONS[data.type].dimensions;

  const showResizer = selected && !isPeerLocked;
  const showColorToolbar = selected && !isPeerLocked && !isEditingLabel;
  const colorPair = getNodeColorPairDefinition(data.colorPair);
  const showHealthMetrics = data.status !== "healthy";

  const beginLabelEdit = useCallback(
    (event: React.MouseEvent) => {
      if (isPeerLocked) return;
      event.stopPropagation();
      setIsEditingLabel(true);
    },
    [isPeerLocked]
  );

  return (
    <>
      <TraceNodeColorToolbar
        nodeId={id}
        colorPair={colorPair.id}
        isVisible={showColorToolbar}
      />
      <div
        style={{ width: dimensions.width, height: dimensions.height }}
        className={cn(
          "group relative shadow-sm backdrop-blur-md",
          colorPair.shell,
          silhouetteClass[data.type],
          healthStatusClass[data.status],
          isFocused
            ? "border-2 border-accent-primary shadow-[0_0_12px_color-mix(in_srgb,var(--accent-primary)_35%,transparent)]"
            : "border",
          data.type === "gateway" &&
            "before:pointer-events-none before:absolute before:-inset-1 before:rounded-full before:border before:border-border-default/50 before:content-['']"
        )}
    >
      <NodeResizer
        isVisible={showResizer}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        handleClassName={RESIZER_HANDLE_CLASS}
        lineClassName="!border-0 !opacity-0"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!-top-1 !h-2 !w-2 !rounded-full !border !border-zinc-900 !bg-zinc-100 !opacity-0 transition-opacity duration-200 group-hover:!opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-1 !h-2 !w-2 !rounded-full !border !border-zinc-900 !bg-zinc-100 !opacity-0 transition-opacity duration-200 group-hover:!opacity-100"
      />
      <div
        className="relative size-full"
        onDoubleClick={isEditingLabel ? undefined : beginLabelEdit}
      >
        <InfrastructureShapeBody
          label={data.label}
          type={data.type}
          hideLabel={isEditingLabel}
          labelTextClass={colorPair.text}
          iconClass={colorPair.icon}
        />
        {isEditingLabel ? (
          <TraceNodeLabelEditor
            nodeId={id}
            label={data.label}
            type={data.type}
            labelTextClass={colorPair.text}
            onClose={() => setIsEditingLabel(false)}
          />
        ) : null}
        {showHealthMetrics ? (
          <div
            className={cn(
              "pointer-events-none absolute right-1 bottom-1 rounded px-1 py-0.5 font-mono text-[9px] leading-none",
              data.status === "outage"
                ? "bg-red-950/90 text-red-300"
                : "bg-amber-950/90 text-amber-200"
            )}
          >
            {data.status === "outage" ? "OUT" : "DEG"} · {data.errorRate}% ·{" "}
            {data.latency}ms
          </div>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!-bottom-1 !h-2 !w-2 !rounded-full !border !border-zinc-900 !bg-zinc-100 !opacity-0 transition-opacity duration-200 group-hover:!opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!-right-1 !h-2 !w-2 !rounded-full !border !border-zinc-900 !bg-zinc-100 !opacity-0 transition-opacity duration-200 group-hover:!opacity-100"
      />
      </div>
    </>
  );
}

export const traceNodeTypes = {
  traceNode: FoundationalNodeRenderer,
} as const;
