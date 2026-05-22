"use client";

import { useOthers, useStorage } from "@liveblocks/react";
import { Loader2 } from "lucide-react";

import { useRoomIsThinking } from "@/hooks/use-room-is-thinking";
import { cn } from "@/lib/utils";
import {
  formatAiStatusLabel,
  parseLatestAiStatusMessage,
} from "@/types/tasks";

export function AiAgentStatus() {
  const roomIsThinking = useRoomIsThinking();
  const statusList = useStorage((root) => root.aiStatusMessages);
  const latestStatus = parseLatestAiStatusMessage(statusList);

  if (!roomIsThinking && !latestStatus) {
    return null;
  }

  const statusLabel = latestStatus
    ? formatAiStatusLabel(latestStatus)
    : null;

  return (
    <div
      className={cn(
        "shrink-0 border-b border-border-default px-4 py-3",
        roomIsThinking && "bg-accent-primary/5"
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        {roomIsThinking ? (
          <Loader2
            className="mt-0.5 size-4 shrink-0 animate-spin text-accent-primary"
            aria-hidden
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium",
              roomIsThinking ? "text-accent-primary" : "text-text-muted"
            )}
          >
            {roomIsThinking ? "Trace AI is simulating…" : "Trace AI idle"}
          </p>
          {statusLabel ? (
            <p className="mt-1 text-[11px] leading-snug text-text-muted">
              {statusLabel}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
