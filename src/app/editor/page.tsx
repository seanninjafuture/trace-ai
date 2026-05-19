"use client";

import { EditorHome } from "@/components/editor/editor-home";
import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";

export default function EditorPage() {
  const { activeProject } = useEditorWorkspace();

  if (!activeProject) {
    return <EditorHome />;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-text-muted">
        Flow canvas — {activeProject.name}
      </p>
    </div>
  );
}
