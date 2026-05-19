"use client";

import { UserButton } from "@clerk/nextjs";
import { Download, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLLABORATORS = [
  { initials: "AK", active: true },
  { initials: "JL", active: true },
  { initials: "MR", active: false },
] as const;

type EditorNavbarProps = {
  projectName?: string;
  onOpenProjects: () => void;
};

export function EditorNavbar({
  projectName,
  onOpenProjects,
}: EditorNavbarProps) {
  const displayName = projectName ?? "No project selected";

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
        <span className="truncate text-sm font-medium text-text-primary">
          {displayName}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 px-6">
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
        <Button type="button" disabled className="gap-2">
          <Download className="size-5" />
          Export Playbook
        </Button>
        <UserButton />
      </div>
    </header>
  );
}
