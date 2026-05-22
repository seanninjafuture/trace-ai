"use client";

import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react";
import { Panel, useReactFlow } from "@xyflow/react";
import { Maximize, Minus, Plus, Redo2, Undo2 } from "lucide-react";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

const ZOOM_OPTIONS = { duration: 200 } as const;
const FIT_VIEW_OPTIONS = { duration: 200, padding: 0.2 } as const;

type ControlButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

function ControlButton({
  label,
  onClick,
  disabled = false,
  children,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "nodrag nopan flex h-7 w-7 items-center justify-center rounded-md text-zinc-300 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-zinc-800 hover:text-zinc-100"
      )}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onClick();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {children}
    </button>
  );
}

function ControlSeparator() {
  return <div className="h-4 w-px shrink-0 bg-zinc-800" aria-hidden />;
}

function useCanvasControlActions() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return {
    zoomIn: () => zoomIn(ZOOM_OPTIONS),
    zoomOut: () => zoomOut(ZOOM_OPTIONS),
    fitView: () => fitView(FIT_VIEW_OPTIONS),
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

export function CanvasControls() {
  const {
    zoomIn,
    zoomOut,
    fitView,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasControlActions();

  return (
    <Panel
      position="bottom-left"
      className="nodrag nopan !bottom-[168px] !left-4 !m-0"
    >
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-2xl">
        <ControlButton label="Zoom out" onClick={zoomOut}>
          <Minus className="h-4 w-4" strokeWidth={2} />
        </ControlButton>
        <ControlButton label="Fit view" onClick={fitView}>
          <Maximize className="h-4 w-4" strokeWidth={2} />
        </ControlButton>
        <ControlButton label="Zoom in" onClick={zoomIn}>
          <Plus className="h-4 w-4" strokeWidth={2} />
        </ControlButton>

        <ControlSeparator />

        <ControlButton
          label="Undo"
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" strokeWidth={2} />
        </ControlButton>
        <ControlButton
          label="Redo"
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" strokeWidth={2} />
        </ControlButton>
      </div>
    </Panel>
  );
}

/** Global hotkeys; must render inside React Flow + Liveblocks room context. */
export function CanvasKeyboardShortcuts() {
  const {
    zoomIn,
    zoomOut,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasControlActions();

  useKeyboardShortcuts({
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onUndo: () => {
      if (canUndo) undo();
    },
    onRedo: () => {
      if (canRedo) redo();
    },
  });

  return null;
}
