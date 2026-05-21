"use client";

import {
  useOthers,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useReducer } from "react";
import { useStore, useStoreApi } from "@xyflow/react";

import { pointToFlowPosition } from "@/lib/canvas/screen-to-flow";

function CanvasCursorTracker() {
  const updateMyPresence = useUpdateMyPresence();
  const storeApi = useStoreApi();
  const domNode = useStore((state) => state.domNode);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const { paneDragging, transform, domNode: node } = storeApi.getState();
      if (paneDragging) return;

      const cursor = pointToFlowPosition(
        { x: event.clientX, y: event.clientY },
        transform,
        node
      );
      updateMyPresence({ cursor });
    },
    [storeApi, updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useEffect(() => {
    if (!domNode) return;

    domNode.addEventListener("pointermove", handlePointerMove);
    domNode.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      domNode.removeEventListener("pointermove", handlePointerMove);
      domNode.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      handlePointerLeave();
    };
  }, [domNode, handlePointerMove, handlePointerLeave]);

  return null;
}

type RemoteCursorProps = {
  name: string;
  color: string;
  cursor: { x: number; y: number };
  isThinking: boolean;
};

function RemoteCursor({ name, color, cursor, isThinking }: RemoteCursorProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 will-change-transform"
      style={{
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
        aria-hidden
      >
        <path
          d="M5.5 3.5L5.5 18.5L9.5 14.5L12.5 20.5L14.5 19.5L11.5 13.5L17 13.5L5.5 3.5Z"
          fill={color}
          stroke="var(--bg-base)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute left-4 top-4 flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {isThinking ? (
          <Loader2
            className="size-3 shrink-0 animate-spin"
            aria-label="Simulating"
          />
        ) : null}
        {name}
      </span>
    </div>
  );
}

function CanvasRemoteCursors() {
  const others = useOthers();
  const storeApi = useStoreApi();
  const [, bumpTransform] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    return storeApi.subscribe((state, previousState) => {
      if (state.transform !== previousState.transform) {
        bumpTransform();
      }
    });
  }, [storeApi]);

  const [panX, panY, zoom] = storeApi.getState().transform;

  return (
    <>
      {others.map((other) => {
        const flowCursor = other.presence.cursor;
        if (!flowCursor) return null;

        const screenX = flowCursor.x * zoom + panX;
        const screenY = flowCursor.y * zoom + panY;

        return (
          <RemoteCursor
            key={other.connectionId}
            name={other.info.name}
            color={other.info.color}
            cursor={{ x: screenX, y: screenY }}
            isThinking={other.presence.isThinking}
          />
        );
      })}
    </>
  );
}

export function CanvasPeerCursors() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-60 overflow-hidden"
      aria-hidden
    >
      <CanvasCursorTracker />
      <CanvasRemoteCursors />
    </div>
  );
}
