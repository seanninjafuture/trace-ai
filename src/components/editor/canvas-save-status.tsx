"use client";

import { AlertCircle, Check, CloudOff, CloudUpload, Loader2 } from "lucide-react";

import {
  useCanvasAutosaveEnabled,
  useCanvasSaveStatus,
} from "@/components/canvas/canvas-save-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CanvasSaveStatusLabel() {
  const status = useCanvasSaveStatus();

  if (status === "saving") {
    return (
      <div
        className="flex items-center gap-2 text-xs text-text-muted"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-3.5 shrink-0 animate-spin opacity-70" />
        <span>Saving changes…</span>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div
        className="flex items-center gap-2 text-xs text-state-success"
        role="status"
        aria-live="polite"
      >
        <Check className="size-3.5 shrink-0" aria-hidden />
        <span>All changes saved</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={cn("flex items-center gap-2 text-xs text-state-error")}
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="size-3.5 shrink-0" aria-hidden />
        <span>Save failed — Retrying</span>
      </div>
    );
  }

  return (
    <span className="text-xs text-text-muted">Autosave on</span>
  );
}

export function CanvasSaveStatus() {
  const { enabled: autosaveEnabled, setEnabled: setAutosaveEnabled } =
    useCanvasAutosaveEnabled();

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setAutosaveEnabled(!autosaveEnabled)}
        aria-label={autosaveEnabled ? "Disable autosave" : "Enable autosave"}
        aria-pressed={autosaveEnabled}
        title={autosaveEnabled ? "Disable autosave" : "Enable autosave"}
        className={cn(
          "shrink-0",
          autosaveEnabled
            ? "text-text-muted hover:text-text-primary"
            : "text-text-muted"
        )}
      >
        {autosaveEnabled ? (
          <CloudUpload className="size-4" aria-hidden />
        ) : (
          <CloudOff className="size-4 opacity-70" aria-hidden />
        )}
      </Button>
      {autosaveEnabled ? (
        <CanvasSaveStatusLabel />
      ) : (
        <span className="text-xs text-text-muted">Autosave off</span>
      )}
    </div>
  );
}
