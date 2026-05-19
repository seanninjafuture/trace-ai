"use client";

import { useEffect, useRef } from "react";

import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";
import { DialogClose, DialogShell } from "@/components/editor/dialog-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const projectDialogOverlayClassName =
  "fixed inset-0 isolate z-50 bg-black/80 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

export function ProjectDialogs() {
  const {
    activeDialog,
    closeDialog,
    createName,
    setCreateName,
    createSlug,
    renameName,
    setRenameName,
    targetProject,
    handleCreateSubmit,
    handleRenameSubmit,
    handleDeleteConfirm,
  } = useEditorWorkspace();

  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeDialog !== "rename") return;
    const frame = window.requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeDialog]);

  return (
    <>
      <DialogShell
        open={activeDialog === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Create Simulation Project"
        description="Name your architecture workspace. This is stored locally for now."
        footer={
          <>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="button"
              disabled={!createName.trim()}
              onClick={handleCreateSubmit}
            >
              Create Project
            </Button>
          </>
        }
        overlayClassName={projectDialogOverlayClassName}
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!createName.trim()) return;
            handleCreateSubmit();
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-primary">
              Project name
            </span>
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="e.g. Payments API Mesh"
              autoFocus
            />
          </label>
          <p className="font-mono text-xs text-text-muted">
            traceai.dev/workspace/
            <span className="text-text-primary">
              {createSlug || "my-system-slug"}
            </span>
          </p>
        </form>
      </DialogShell>

      <DialogShell
        open={activeDialog === "rename"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Rename Workspace Architecture"
        description={
          targetProject
            ? `Previous system name: ${targetProject.name}`
            : undefined
        }
        footer={
          <>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="button"
              disabled={!renameName.trim()}
              onClick={handleRenameSubmit}
            >
              Save Name
            </Button>
          </>
        }
        overlayClassName={projectDialogOverlayClassName}
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!renameName.trim()) return;
            handleRenameSubmit();
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-primary">
              Architecture name
            </span>
            <Input
              ref={renameInputRef}
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (!renameName.trim()) return;
                  handleRenameSubmit();
                }
              }}
            />
          </label>
        </form>
      </DialogShell>

      <DialogShell
        open={activeDialog === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Wipe Simulation Workspace"
        description="This action cannot be undone."
        footer={
          <>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="button"
              className={cn(
                "bg-red-600 text-white hover:bg-red-700",
                "focus-visible:border-red-500 focus-visible:ring-red-500/30"
              )}
              onClick={handleDeleteConfirm}
            >
              Delete Workspace
            </Button>
          </>
        }
        overlayClassName={projectDialogOverlayClassName}
      >
        <p className="text-sm leading-relaxed text-state-error">
          Deleting this workspace will permanently wipe out its system nodes,
          graph configurations, and generated incident playbooks.
        </p>
      </DialogShell>
    </>
  );
}
