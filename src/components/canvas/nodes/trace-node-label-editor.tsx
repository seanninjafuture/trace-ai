"use client";

import { useEffect, useRef } from "react";

import { Textarea } from "@/components/ui/textarea";
import {
  TRACE_NODE_LABEL_PLACEHOLDER,
  useUpdateTraceNodeLabel,
} from "@/components/canvas/nodes/use-trace-node-mutations";
import { cn } from "@/lib/utils";
import type { InfrastructureNodeType } from "@/types/canvas";

const labelTypography = "text-xs leading-snug font-medium";

const editorLayoutByType: Record<
  InfrastructureNodeType,
  { wrapper: string; textarea: string }
> = {
  gateway: {
    wrapper: "flex size-full items-center justify-center px-3",
    textarea:
      "h-auto min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-center shadow-none focus-visible:ring-0",
  },
  compute: {
    wrapper:
      "flex size-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5",
    textarea:
      "h-auto min-h-0 resize-none border-0 bg-transparent px-1 py-0 text-center shadow-none focus-visible:ring-0",
  },
  database: {
    wrapper:
      "relative z-10 flex size-full flex-col items-center justify-center gap-0.5 px-2",
    textarea:
      "h-auto min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-center shadow-none focus-visible:ring-0",
  },
  queue: {
    wrapper: "relative z-10 flex size-full items-center justify-center px-4",
    textarea:
      "h-auto min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-center shadow-none focus-visible:ring-0",
  },
};

type TraceNodeLabelEditorProps = {
  nodeId: string;
  label: string;
  type: InfrastructureNodeType;
  labelTextClass?: string;
  onClose: () => void;
};

export function TraceNodeLabelEditor({
  nodeId,
  label,
  type,
  labelTextClass = "text-text-primary",
  onClose,
}: TraceNodeLabelEditorProps) {
  const updateLabel = useUpdateTraceNodeLabel();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const layout = editorLayoutByType[type];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const stopCanvasInteraction = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const commitAndClose = () => {
    onClose();
  };

  return (
    <div
      className={cn("nodrag nopan nowheel absolute inset-0", layout.wrapper)}
      onDoubleClick={stopCanvasInteraction}
      onPointerDown={stopCanvasInteraction}
      onPointerMove={stopCanvasInteraction}
      onPointerUp={stopCanvasInteraction}
      onMouseDown={stopCanvasInteraction}
      onClick={stopCanvasInteraction}
    >
      <Textarea
        ref={textareaRef}
        value={label}
        rows={1}
        placeholder={TRACE_NODE_LABEL_PLACEHOLDER}
        aria-label="Service name"
        className={cn(
          labelTypography,
          "max-w-full",
          labelTextClass,
          layout.textarea
        )}
        onChange={(event) => {
          updateLabel(nodeId, event.target.value);
        }}
        onBlur={commitAndClose}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Escape") {
            event.preventDefault();
            commitAndClose();
          }
        }}
        onPointerDown={stopCanvasInteraction}
        onDragStart={stopCanvasInteraction}
      />
    </div>
  );
}
