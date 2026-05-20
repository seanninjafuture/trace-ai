"use client";

import { useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";
import { NodeSidebar } from "@/components/editor/node-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { SimulationSidebar } from "@/components/editor/simulation-sidebar";
import { cn } from "@/lib/utils";
import type { WorkspaceProject } from "@/types/project";

type EditorLayoutProps = {
  children?: ReactNode;
  workspaceProject?: WorkspaceProject;
};

export function EditorLayout({
  children,
  workspaceProject,
}: EditorLayoutProps) {
  const {
    activeProject,
    isProjectSidebarOpen,
    setProjectSidebarOpen,
    isLayoutLoading,
  } = useEditorWorkspace();

  const [simulationSidebarOpen, setSimulationSidebarOpen] = useState(true);

  const resolvedProject = activeProject ?? workspaceProject ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar
        projectName={resolvedProject?.name}
        projectSlug={resolvedProject?.slug}
        projectId={resolvedProject?.id}
        isProjectOwner={resolvedProject?.owned ?? false}
        onOpenProjects={() => setProjectSidebarOpen(true)}
        simulationSidebarOpen={simulationSidebarOpen}
        onToggleSimulationSidebar={() =>
          setSimulationSidebarOpen((open) => !open)
        }
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {isProjectSidebarOpen ? (
          <>
            <button
              type="button"
              aria-label="Close projects panel"
              className={cn(
                "fixed inset-0 z-40 bg-black/60 md:hidden",
                "top-14"
              )}
              onClick={() => setProjectSidebarOpen(false)}
            />
            <div
              className={cn(
                "fixed top-14 bottom-0 left-0 z-50 flex md:relative md:top-auto md:bottom-auto md:z-auto md:shrink-0"
              )}
            >
              <ProjectSidebar
                onClose={() => setProjectSidebarOpen(false)}
              />
            </div>
          </>
        ) : null}

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-base">
          <NodeSidebar />

          <div className="relative h-full min-h-0 pl-64">{children}</div>

          {isLayoutLoading ? (
            <div
              className="absolute inset-0 z-40 flex items-center justify-center bg-bg-base/70 backdrop-blur-[2px]"
              aria-busy
              aria-label="Loading workspace"
            >
              <div className="size-8 animate-spin rounded-full border-2 border-border-default border-t-accent-primary" />
            </div>
          ) : null}
        </main>

        {simulationSidebarOpen ? <SimulationSidebar /> : null}
      </div>

      <ProjectDialogs />
    </div>
  );
}
