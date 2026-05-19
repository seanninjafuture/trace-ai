"use client";

import { Plus } from "lucide-react";

import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";
import { Button } from "@/components/ui/button";

export function EditorHome() {
  const { openCreate } = useEditorWorkspace();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-medium text-text-primary">
          Create a simulation project or open an existing one
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Start a new architecture workspace, or choose an infrastructure graph
          from the sidebar to inject chaos.
        </p>
        <Button type="button" className="mt-6 gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>
    </div>
  );
}
