"use client";

import { Download, FileText, Sparkles } from "lucide-react";
import { useState } from "react";

import { SpecPreviewDialog } from "@/components/editor/ai-sidebar/spec-preview-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  formatSpecCreatedDate,
  formatSpecDisplayTitle,
  projectSpecDownloadPath,
  type ProjectSpecSummary,
} from "@/types/project-spec";

type AiSpecsTabProps = {
  projectId?: string;
  specs?: ProjectSpecSummary[];
};

export function AiSpecsTab({ projectId, specs = [] }: AiSpecsTabProps) {
  const [previewSpec, setPreviewSpec] = useState<ProjectSpecSummary | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = (spec: ProjectSpecSummary) => {
    setPreviewSpec(spec);
    setPreviewOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <Button
        type="button"
        className="h-10 w-full shrink-0 gap-2 bg-accent-primary text-white hover:opacity-90"
      >
        <Sparkles className="size-4" />
        Generate Incident Spec File
      </Button>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 pr-2">
          {specs.length === 0 ? (
            <p className="rounded-lg border border-border-default bg-bg-surface px-3 py-4 text-center text-sm text-text-muted">
              No incident playbooks yet. Generate a spec to archive it here.
            </p>
          ) : (
            specs.map((spec) => {
              const downloadUrl = projectId
                ? projectSpecDownloadPath(projectId, spec.id)
                : undefined;

              return (
                <div
                  key={spec.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openPreview(spec)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPreview(spec);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg bg-bg-surface px-3 py-3",
                    "border border-border-default transition-colors",
                    "hover:bg-bg-surface/80 hover:ring-1 hover:ring-border-default"
                  )}
                >
                  <FileText className="size-5 shrink-0 text-accent-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {formatSpecDisplayTitle(spec.id)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatSpecCreatedDate(spec.createdAt)}
                    </p>
                  </div>
                  {downloadUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-text-muted hover:text-text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      render={<a href={downloadUrl} download />}
                    >
                      <Download className="size-4" />
                      <span className="sr-only">Download playbook</span>
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {projectId ? (
        <SpecPreviewDialog
          projectId={projectId}
          spec={previewSpec}
          open={previewOpen}
          onOpenChange={(open) => {
            setPreviewOpen(open);
            if (!open) {
              setPreviewSpec(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
