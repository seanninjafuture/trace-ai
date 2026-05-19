"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useProjectActions,
  type ProjectActionsState,
} from "@/hooks/use-project-actions";
import type { WorkspaceProject } from "@/types/project";

const EditorWorkspaceContext = createContext<ProjectActionsState | null>(null);

type EditorWorkspaceProviderProps = {
  children: ReactNode;
  initialOwnedProjects: WorkspaceProject[];
  initialSharedProjects: WorkspaceProject[];
};

export function EditorWorkspaceProvider({
  children,
  initialOwnedProjects,
  initialSharedProjects,
}: EditorWorkspaceProviderProps) {
  const workspace = useProjectActions({
    ownedProjects: initialOwnedProjects,
    sharedProjects: initialSharedProjects,
  });

  return (
    <EditorWorkspaceContext.Provider value={workspace}>
      {children}
    </EditorWorkspaceContext.Provider>
  );
}

export function useEditorWorkspace(): ProjectActionsState {
  const context = useContext(EditorWorkspaceContext);
  if (!context) {
    throw new Error(
      "useEditorWorkspace must be used within EditorWorkspaceProvider"
    );
  }
  return context;
}
