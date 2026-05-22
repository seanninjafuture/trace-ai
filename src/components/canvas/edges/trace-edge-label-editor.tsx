"use client";

import { useEffect, useRef } from "react";

import {
  TRACE_EDGE_LABEL_PLACEHOLDER,
  useUpdateTraceEdgeLabel,
} from "@/components/canvas/edges/use-trace-edge-mutations";
import { cn } from "@/lib/utils";

type TraceEdgeLabelEditorProps = {
  edgeId: string;
  label: string;
  onClose: () => void;
};

export function TraceEdgeLabelEditor({
  edgeId,
  label,
  onClose,
}: TraceEdgeLabelEditorProps) {
  const updateLabel = useUpdateTraceEdgeLabel();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const stopCanvasInteraction = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={label}
      placeholder={TRACE_EDGE_LABEL_PLACEHOLDER}
      aria-label="Traffic protocol label"
      className={cn(
        "nodrag nopan nowheel w-24 min-w-0 border-0 bg-transparent p-0 text-[11px] font-mono text-zinc-100 outline-none ring-0 focus:ring-0"
      )}
      onChange={(event) => {
        updateLabel(edgeId, event.target.value);
      }}
      onBlur={onClose}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      onPointerDown={stopCanvasInteraction}
      onMouseDown={stopCanvasInteraction}
      onClick={stopCanvasInteraction}
      onDoubleClick={stopCanvasInteraction}
      onDragStart={stopCanvasInteraction}
    />
  );
}
