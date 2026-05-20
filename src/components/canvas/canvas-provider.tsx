"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";

import { CanvasConnectionError } from "@/components/canvas/canvas-connection-error";
import { TraceCanvas } from "@/components/canvas/trace-canvas";

type CanvasProviderProps = {
  roomId: string;
};

// IMPORTANT: Do NOT wrap <TraceCanvas /> in <ClientSideSuspense> / <Suspense>.
// React 19's Suspense reappear pass re-fires layout effects in the suspended
// subtree as mount semantics, which drives React Flow's StoreUpdater layout
// effect to call setNodes inside the commit phase. Combined with the
// liveblocks-react-flow internal store + xyflow's zustand store, that triggers
// `Maximum update depth exceeded`. TraceCanvas handles its own loading state
// via useLiveblocksFlow({ suspense: false }) and only mounts <ReactFlow> after
// storage is ready.
export function CanvasProvider({ roomId }: CanvasProviderProps) {
  return (
    <div className="h-full w-full">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            activeNodeId: null,
            isThinking: false,
          }}
          initialStorage={() => ({})}
        >
          <CanvasConnectionError>
            <TraceCanvas />
          </CanvasConnectionError>
        </RoomProvider>
      </LiveblocksProvider>
    </div>
  );
}
