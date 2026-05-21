"use client";

import { useEffect, useRef } from "react";

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TAGS.has(target.tagName)) return true;
  return target.isContentEditable;
}

export type CanvasKeyboardShortcutActions = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function useKeyboardShortcuts(actions: CanvasKeyboardShortcutActions) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(document.activeElement)) return;

      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      const { onZoomIn, onZoomOut, onUndo, onRedo } = actionsRef.current;

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        onUndo();
        return;
      }

      if (
        (key === "z" && event.shiftKey) ||
        (key === "y" && !event.shiftKey)
      ) {
        event.preventDefault();
        onRedo();
        return;
      }

      if (key === "-" || key === "_") {
        event.preventDefault();
        onZoomOut();
        return;
      }

      if (key === "=" || key === "+") {
        event.preventDefault();
        onZoomIn();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
