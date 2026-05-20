import type { LiveblocksFlow } from "@liveblocks/react-flow";

import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      activeNodeId: string | null;
      isThinking: boolean;
    };

    /** `flow` is created by `useLiveblocksFlow` on first room connect. */
    Storage: {
      flow?: LiveblocksFlow<TraceCanvasNode, TraceCanvasEdge>;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: Record<string, never>;

    ThreadMetadata: Record<string, never>;

    RoomInfo: Record<string, never>;
  }
}

export {};
