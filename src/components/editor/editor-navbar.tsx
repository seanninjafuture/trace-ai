"use client";

import { UserButton } from "@clerk/nextjs";
import { Flame, LayoutGrid } from "lucide-react";

import { CanvasSaveStatus } from "@/components/editor/canvas-save-status";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModalTrigger } from "@/components/editor/starter-templates-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLLABORATORS = [
  { initials: "AK", active: true },
  { initials: "JL", active: true },
  { initials: "MR", active: false },
] as const;

type EditorNavbarProps = {
  projectName?: string;
  projectSlug?: string;
  projectId?: string;
  isProjectOwner?: boolean;
  onOpenProjects: () => void;
  simulationSidebarOpen: boolean;
  onToggleSimulationSidebar: () => void;
};

export function EditorNavbar({
  projectName,
  projectSlug,
  projectId,
  isProjectOwner = false,
  onOpenProjects,
  simulationSidebarOpen,
  onToggleSimulationSidebar,
}: EditorNavbarProps) {
  const displayName = projectName ?? "No project selected";
  const showSlug = Boolean(projectSlug && projectSlug.length > 0);

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center border-b border-border-default bg-bg-base px-4"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onOpenProjects}
          aria-label="Open projects"
          className="shrink-0"
        >
          <LayoutGrid className="size-4" />
        </Button>
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-surface ring-1 ring-border-default"
          aria-hidden
        >
          <span className="font-mono text-xs font-semibold text-accent-primary">
            T
          </span>
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-text-primary">
            {displayName}
          </span>
          {showSlug ? (
            <span className="block truncate font-mono text-xs text-text-muted">
              {projectSlug}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 px-6">
        {projectId ? <CanvasSaveStatus /> : null}
        {COLLABORATORS.map((user) => (
          <div
            key={user.initials}
            className={cn(
              "flex size-8 items-center justify-center rounded-full bg-bg-surface text-xs font-medium text-text-primary",
              user.active &&
                "ring-2 ring-accent-primary shadow-[0_0_12px_color-mix(in_srgb,var(--accent-primary)_45%,transparent)]"
            )}
            title={user.initials}
          >
            {user.initials}
          </div>
        ))}
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        {projectId ? <StarterTemplatesModalTrigger /> : null}
        {projectId ? (
          <ShareDialog projectId={projectId} isProjectOwner={isProjectOwner} />
        ) : null}
        <Button
          type="button"
          variant={simulationSidebarOpen ? "default" : "outline"}
          size="icon"
          onClick={onToggleSimulationSidebar}
          aria-label={
            simulationSidebarOpen
              ? "Hide chaos simulation sidebar"
              : "Show chaos simulation sidebar"
          }
          aria-pressed={simulationSidebarOpen}
        >
          <Flame className="size-5" />
        </Button>
        <UserButton />
      </div>
    </header>
  );
}

