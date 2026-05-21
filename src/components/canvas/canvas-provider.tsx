"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import type { ReactNode } from "react";

import { CanvasConnectionError } from "@/components/canvas/canvas-connection-error";
import { CanvasSaveProvider } from "@/components/canvas/canvas-save-context";
import { StarterTemplateModalProvider } from "@/components/editor/starter-template-modal-context";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";

type CanvasProviderProps = {
  roomId: string;
  projectId?: string;
  children: ReactNode;
};

// IMPORTANT: Do NOT wrap <TraceCanvas /> in <ClientSideSuspense> / <Suspense>.
// React 19's Suspense reappear pass re-fires layout effects in the suspended
// subtree as mount semantics, which drives React Flow's StoreUpdater layout
// effect to call setNodes inside the commit phase. Combined with the
// liveblocks-react-flow internal store + xyflow's zustand store, that triggers
// `Maximum update depth exceeded`. TraceCanvas handles its own loading state
// via useLiveblocksFlow({ suspense: false }) and only mounts <ReactFlow> after
// storage is ready.
export function CanvasProvider({
  roomId,
  projectId,
  children,
}: CanvasProviderProps) {
  const roomContent = (
    <StarterTemplateModalProvider>
      {children}
      <StarterTemplatesModal />
    </StarterTemplateModalProvider>
  );

  return (
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
        {projectId ? (
          <CanvasSaveProvider projectId={projectId}>
            {roomContent}
          </CanvasSaveProvider>
        ) : (
          roomContent
        )}
      </RoomProvider>
    </LiveblocksProvider>
  );
}

type CanvasSurfaceProps = {
  children: ReactNode;
};

/** Connection error boundary + full-size canvas slot inside the room. */
export function CanvasSurface({ children }: CanvasSurfaceProps) {
  return (
    <div className="h-full w-full">
      <CanvasConnectionError>{children}</CanvasConnectionError>
    </div>
  );
}
