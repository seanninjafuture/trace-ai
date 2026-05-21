"use client";

import { useUser } from "@clerk/nextjs";
import { useStorage } from "@liveblocks/react";
import { Bot, Loader2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { AiChatMessageBubble } from "@/components/editor/ai-sidebar/ai-chat-message-bubble";
import {
  AI_ARCHITECT_SHORTCUTS,
} from "@/components/editor/ai-sidebar/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { usePushAiChatMessage } from "@/hooks/use-push-ai-chat-message";
import { useRoomIsThinking } from "@/hooks/use-room-is-thinking";
import { cn } from "@/lib/utils";
import {
  type AIChatMessage,
  formatAiStatusLabel,
  parseAiChatMessages,
  parseLatestAiStatusMessage,
  resolveChatAvatarUrl,
} from "@/types/tasks";

type AiArchitectTabProps = {
  projectId?: string;
  roomId?: string;
  isSimulationRunning?: boolean;
  showSimulationStatusRibbon?: boolean;
  onStartChaosSimulation?: (prompt: string) => Promise<void>;
};

type PendingChatSend = {
  content: string;
};

export function AiArchitectTab({
  roomId,
  isSimulationRunning = false,
  showSimulationStatusRibbon = false,
  onStartChaosSimulation,
}: AiArchitectTabProps) {
  const formId = useId();
  const { user } = useUser();
  const roomIsThinking = useRoomIsThinking();
  const pushChatMessage = usePushAiChatMessage();
  const chatList = useStorage((root) => root.aiChatMessages);
  const statusList = useStorage((root) => root.aiStatusMessages);
  const messages = parseAiChatMessages(chatList);
  const latestStatus = parseLatestAiStatusMessage(statusList);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<PendingChatSend | null>(null);

  const inputLocked = roomIsThinking || isSimulationRunning;
  const currentUserId = user?.id ?? "";

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages[messages.length - 1]?.id]);

  const buildChatMessage = useCallback(
    (content: string): AIChatMessage | null => {
      if (!roomId || !currentUserId) {
        return null;
      }

      const name =
        user?.fullName ??
        ([user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          "Anonymous");

      return {
        id: crypto.randomUUID(),
        roomId,
        sender: {
          id: currentUserId,
          name,
          avatar: resolveChatAvatarUrl(user?.imageUrl, name),
        },
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };
    },
    [currentUserId, roomId, user]
  );

  const sendChatMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || roomIsThinking) {
        return;
      }

      const payload = buildChatMessage(trimmed);
      if (!payload) {
        return;
      }

      setSendError(null);

      try {
        pushChatMessage(payload);
        setDraft("");
      } catch {
        setSendError({ content: trimmed });
      }
    },
    [buildChatMessage, pushChatMessage, roomIsThinking]
  );

  const injectChaos = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || inputLocked || !onStartChaosSimulation) {
        return;
      }

      const payload = buildChatMessage(trimmed);
      if (payload) {
        setSendError(null);
        try {
          pushChatMessage(payload);
          setDraft("");
        } catch {
          setSendError({ content: trimmed });
          return;
        }
      }

      await onStartChaosSimulation(trimmed);
    },
    [
      buildChatMessage,
      inputLocked,
      onStartChaosSimulation,
      pushChatMessage,
    ]
  );

  const handleChatSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      void sendChatMessage(draft);
    },
    [draft, sendChatMessage]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendChatMessage(draft);
    }
  };

  const handleRetrySend = () => {
    if (!sendError) {
      return;
    }
    void sendChatMessage(sendError.content);
  };

  const statusRibbonLabel = latestStatus
    ? formatAiStatusLabel(latestStatus)
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8">
              <div
                className="flex size-16 items-center justify-center rounded-2xl border border-border-default bg-bg-base"
                aria-hidden
              >
                <Bot className="size-8 text-accent-primary/80" />
              </div>
              <p className="text-center text-xs text-text-muted">
                Describe a failure scenario or pick a shortcut
              </p>
              <div className="flex max-w-full flex-col items-center gap-2">
                {AI_ARCHITECT_SHORTCUTS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={inputLocked}
                    className={cn(
                      "cursor-pointer rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[12px] text-text-muted",
                      "transition-colors hover:border-accent-primary",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    onClick={() => void injectChaos(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((message) => (
                <AiChatMessageBubble
                  key={message.id}
                  message={message}
                  isLocalUser={message.sender.id === currentUserId}
                />
              ))}
              <div ref={scrollAnchorRef} className="h-px shrink-0" aria-hidden />
            </ul>
          )}
        </div>
      </ScrollArea>

      <form
        id={formId}
        className="shrink-0 border-t border-border-default p-4"
        onSubmit={handleChatSubmit}
      >
        {sendError ? (
          <button
            type="button"
            className="mb-2 w-full text-left text-xs text-[var(--state-error)] hover:underline"
            onClick={handleRetrySend}
          >
            Message failed to send. Click to retry.
          </button>
        ) : null}
        {showSimulationStatusRibbon && statusRibbonLabel ? (
          <p
            className="mb-2 truncate text-[11px] leading-snug text-text-muted"
            aria-live="polite"
          >
            {statusRibbonLabel}
          </p>
        ) : null}
        <div className="relative">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the team in this workspace..."
            rows={3}
            disabled={inputLocked}
            className="min-h-[72px] max-h-[160px] resize-none overflow-y-auto rounded-md border-border-default bg-zinc-950 p-2 pr-28 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button
            type="button"
            disabled={inputLocked || !draft.trim()}
            className={cn(
              "absolute right-2 bottom-2 h-8 gap-1.5 px-3",
              "bg-accent-primary text-white hover:opacity-90"
            )}
            onClick={() => void injectChaos(draft)}
          >
            {isSimulationRunning ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Injecting Chaos...
              </>
            ) : (
              "Inject Chaos"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
