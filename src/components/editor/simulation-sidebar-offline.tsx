"use client";

import { Bot, PanelRightClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SimulationSidebarOfflineProps = {
  onClose?: () => void;
};

/** Shown on `/editor` home — no Liveblocks room; avoids RoomProvider hook errors. */
export function SimulationSidebarOffline({
  onClose,
}: SimulationSidebarOfflineProps) {
  return (
    <aside
      className={cn(
        "flex w-80 shrink-0 flex-col",
        "border-l border-border-default bg-bg-surface shadow-2xl",
        "h-[calc(100vh-3.5rem)]"
      )}
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-border-default px-4 py-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-base"
          aria-hidden
        >
          <Bot className="size-5 text-accent-primary" />
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

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-text-primary">Open a project to use AI simulation</p>
        <p className="text-xs leading-relaxed text-text-muted">
          Chaos injection and workspace chat require an active project room. Create or
          select a project from the sidebar to continue.
        </p>
      </div>
    </aside>
  );
}
