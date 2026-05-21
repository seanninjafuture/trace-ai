"use client";

import { Bot, PanelRightClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRoomIsThinking } from "@/hooks/use-room-is-thinking";
import { cn } from "@/lib/utils";

type AiSidebarHeaderProps = {
  onClose?: () => void;
  className?: string;
};

export function AiSidebarHeader({ onClose, className }: AiSidebarHeaderProps) {
  const roomIsThinking = useRoomIsThinking();

  return (
    <header
      className={cn(
        "flex shrink-0 items-start gap-3 border-b border-border-default px-4 py-4",
        className
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-base",
          roomIsThinking &&
            "border-accent-primary/50 shadow-[0_0_16px_rgba(99,102,241,0.35)]"
        )}
        aria-hidden
      >
        <Bot
          className={cn(
            "size-5 text-accent-primary",
            roomIsThinking && "animate-pulse"
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-text-primary">AI Workspace</h2>
        <p className="text-xs text-text-muted">Collaborate with Trace AI</p>
      </div>

      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-text-muted hover:text-text-primary"
          aria-label="Close AI workspace"
          onClick={onClose}
        >
          <PanelRightClose className="size-4" />
        </Button>
      ) : null}
    </header>
  );
}
