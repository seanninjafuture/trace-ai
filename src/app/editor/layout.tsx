import type { ReactNode } from "react";

import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorWorkspaceProvider } from "@/components/editor/editor-workspace-provider";
import { listEditorProjectsForCurrentUser } from "@/server/projects/list-editor-projects";

export default async function EditorRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { ownedProjects, sharedProjects } =
    await listEditorProjectsForCurrentUser();

  return (
    <EditorWorkspaceProvider
      initialOwnedProjects={ownedProjects}
      initialSharedProjects={sharedProjects}
    >
      <div className="h-full overflow-hidden">
        <EditorLayout>{children}</EditorLayout>
      </div>
    </EditorWorkspaceProvider>
  );
}
