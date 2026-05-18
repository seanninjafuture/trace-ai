import type { ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { NodeSidebar } from "@/components/editor/node-sidebar";
import { SimulationSidebar } from "@/components/editor/simulation-sidebar";
import { cn } from "@/lib/utils";

type EditorLayoutProps = {
  projectName?: string;
  children?: ReactNode;
};

export function EditorLayout({
  projectName,
  children,
}: EditorLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar projectName={projectName} />

      <div className="flex min-h-0 flex-1">
        <NodeSidebar />

        <main
          className={cn(
            "relative min-w-0 flex-1 bg-bg-base",
            "bg-[radial-gradient(circle_at_center,var(--border-default)_1px,transparent_1px)]",
            "bg-[length:24px_24px]"
          )}
        >
          {children}
        </main>

        <SimulationSidebar />
      </div>
    </div>
  );
}
