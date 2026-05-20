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
          "relative shadow-sm backdrop-blur-md",
          colorPair.shell,
          silhouetteClass[data.type],
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
        className={cn(
          "!-top-1.5 !size-2 !bg-bg-surface",
          isFocused ? "!border-accent-primary" : "!border-border-default"
        )}
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
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "!-bottom-1.5 !size-2 !bg-bg-surface",
          isFocused ? "!border-accent-primary" : "!border-border-default"
        )}
      />
      </div>
    </>
  );
}

export const traceNodeTypes = {
  traceNode: FoundationalNodeRenderer,
} as const;
