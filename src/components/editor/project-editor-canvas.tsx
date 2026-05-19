"use client";

import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";

export function ProjectEditorCanvas() {
  const { activeProject } = useEditorWorkspace();

  if (!activeProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-muted">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-text-muted">
        Flow canvas — {activeProject.name}
      </p>
    </div>
  );
}
