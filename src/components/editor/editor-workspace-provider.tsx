"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useProjectDialogs,
  type ProjectDialogsState,
} from "@/hooks/use-project-dialogs";

const EditorWorkspaceContext = createContext<ProjectDialogsState | null>(null);

export function EditorWorkspaceProvider({ children }: { children: ReactNode }) {
  const workspace = useProjectDialogs();

  return (
    <EditorWorkspaceContext.Provider value={workspace}>
      {children}
    </EditorWorkspaceContext.Provider>
  );
}

export function useEditorWorkspace(): ProjectDialogsState {
  const context = useContext(EditorWorkspaceContext);
  if (!context) {
    throw new Error(
      "useEditorWorkspace must be used within EditorWorkspaceProvider"
    );
  }
  return context;
}
