"use client";

import type { ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";
import { NodeSidebar } from "@/components/editor/node-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { SimulationSidebar } from "@/components/editor/simulation-sidebar";
import { cn } from "@/lib/utils";

type EditorLayoutProps = {
  children?: ReactNode;
};

export function EditorLayout({ children }: EditorLayoutProps) {
  const {
    activeProject,
    isProjectSidebarOpen,
    setProjectSidebarOpen,
    isLayoutLoading,
  } = useEditorWorkspace();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar
        projectName={activeProject?.name}
        onOpenProjects={() => setProjectSidebarOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1">
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

        <NodeSidebar />

        <main
          className={cn(
            "relative min-w-0 flex-1 bg-bg-base",
            "bg-[radial-gradient(circle_at_center,var(--border-default)_1px,transparent_1px)]",
            "bg-[length:24px_24px]"
          )}
        >
          {children}

          {isLayoutLoading ? (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-[2px]"
              aria-busy
              aria-label="Loading workspace"
            >
              <div className="size-8 animate-spin rounded-full border-2 border-border-default border-t-accent-primary" />
            </div>
          ) : null}
        </main>

        <SimulationSidebar />
      </div>

      <ProjectDialogs />
    </div>
  );
}
