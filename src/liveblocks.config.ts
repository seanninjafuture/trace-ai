import type { LiveList } from "@liveblocks/client";
import type { LiveblocksFlow } from "@liveblocks/react-flow";

import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";
import type { AIChatMessage, AIStatusMessage } from "@/types/tasks";

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
      /** Milestone frames pushed by the background chaos agent. */
      agentActivity?: LiveList<string>;
      /** Validated real-time AI status stream (latest entry shown in sidebar). */
      aiStatusMessages?: LiveList<AIStatusMessage>;
      /** Room-scoped operator chat (isolated from aiStatusMessages). */
      aiChatMessages?: LiveList<AIChatMessage>;
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
