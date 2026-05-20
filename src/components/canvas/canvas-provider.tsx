"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";

import { CanvasConnectionError } from "@/components/canvas/canvas-connection-error";
import { CanvasLoadingSkeleton } from "@/components/canvas/canvas-loading-skeleton";
import { TraceCanvas } from "@/components/canvas/trace-canvas";

type CanvasProviderProps = {
  roomId: string;
};

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
            <ClientSideSuspense fallback={<CanvasLoadingSkeleton />}>
              <TraceCanvas />
            </ClientSideSuspense>
          </CanvasConnectionError>
        </RoomProvider>
      </LiveblocksProvider>
    </div>
  );
}
