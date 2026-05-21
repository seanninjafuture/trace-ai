"use client";

import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { MarkdownPreview } from "@/components/editor/ai-sidebar/markdown-preview";
import { DialogShellContent } from "@/components/editor/dialog-shell";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatSpecDisplayTitle,
  projectSpecDownloadPath,
  type ProjectSpecSummary,
} from "@/types/project-spec";

type SpecPreviewDialogProps = {
  projectId: string;
  spec: ProjectSpecSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SpecPreviewDialog({
  projectId,
  spec,
  open,
  onOpenChange,
}: SpecPreviewDialogProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (!spec) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMarkdown(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/specs/${spec.id}`
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to load document.");
        return;
      }

      const data = (await response.json()) as { markdown?: string };
      setMarkdown(data.markdown ?? "");
    } catch {
      setError("Could not reach the preview API.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, spec]);

  useEffect(() => {
    if (open && spec) {
      void loadPreview();
    }

    if (!open) {
      setMarkdown(null);
      setError(null);
      setIsLoading(false);
    }
  }, [open, spec, loadPreview]);

  const downloadUrl = spec
    ? projectSpecDownloadPath(projectId, spec.id)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {spec ? (
        <DialogShellContent
          title={formatSpecDisplayTitle(spec.id)}
          showCloseButton
          overlayClassName="bg-black/80 backdrop-blur-sm"
          contentClassName="max-w-2xl sm:max-w-2xl"
        >
          <div className="flex justify-end">
            {downloadUrl ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-text-muted hover:text-text-primary"
                render={<a href={downloadUrl} download />}
              >
                <Download className="size-4" />
                Download
              </Button>
            ) : null}
          </div>

          <div
            className={cn(
              "max-h-[70vh] overflow-y-auto pr-2",
              "rounded-lg border border-border-default bg-bg-base/40 p-4"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Loading document…</span>
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-state-error">{error}</p>
            ) : null}

            {!isLoading && !error && markdown !== null ? (
              <MarkdownPreview markdown={markdown} />
            ) : null}
          </div>
        </DialogShellContent>
      ) : null}
    </Dialog>
  );
}
