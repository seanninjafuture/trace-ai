"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";

import { useCanvasSaveStatus } from "@/components/canvas/canvas-save-context";
import { cn } from "@/lib/utils";

export function CanvasSaveStatus() {
  const status = useCanvasSaveStatus();

  if (status === "idle") {
    return null;
  }

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

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-state-error"
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
      <span>Save failed — Retrying</span>
    </div>
  );
}
