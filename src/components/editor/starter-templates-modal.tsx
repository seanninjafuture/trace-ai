"use client";

import { LayoutTemplate } from "lucide-react";

import { DialogShell } from "@/components/editor/dialog-shell";
import { StarterTemplatePreview } from "@/components/editor/starter-template-preview";
import { useStarterTemplateModal } from "@/components/editor/starter-template-modal-context";
import {
  STARTER_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { useImportStarterTemplate } from "@/components/editor/use-import-starter-template";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const templatesDialogOverlayClassName =
  "fixed inset-0 isolate z-50 bg-black/80 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

const templatesDialogContentClassName =
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border-default bg-bg-surface p-6 text-sm text-text-primary shadow-xl duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

function TemplateCard({
  template,
  onImport,
}: {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border-default bg-bg-surface p-4"
      )}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-text-primary">{template.name}</h3>
        <p className="text-xs leading-relaxed text-text-muted">
          {template.description}
        </p>
      </div>

      <div className="h-36 overflow-hidden rounded-md border border-border-default bg-bg-base/60">
        <StarterTemplatePreview
          nodes={template.nodes}
          edges={template.edges}
          className="h-full w-full"
        />
      </div>

      <Button
        type="button"
        size="sm"
        className="w-full"
        onClick={() => onImport(template)}
      >
        Import Architecture
      </Button>
    </article>
  );
}

export function StarterTemplatesModal() {
  const modal = useStarterTemplateModal();
  const importTemplate = useImportStarterTemplate();

  if (!modal) return null;

  const handleImport = (template: CanvasTemplate) => {
    importTemplate(template);
    modal.setOpen(false);
  };

  return (
    <DialogShell
      open={modal.open}
      onOpenChange={modal.setOpen}
      title="Architecture starter templates"
      description="Replace the current canvas with a pre-wired infrastructure layout. All collaborators see the update in real time."
      contentClassName={templatesDialogContentClassName}
      overlayClassName={templatesDialogOverlayClassName}
      showCloseButton
    >
      <ScrollArea className="max-h-[min(28rem,60vh)] pr-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STARTER_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={handleImport}
            />
          ))}
        </div>
      </ScrollArea>
    </DialogShell>
  );
}

export function StarterTemplatesModalTrigger() {
  const modal = useStarterTemplateModal();

  if (!modal) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={modal.openModal}
      aria-haspopup="dialog"
    >
      <LayoutTemplate className="size-4" />
      Templates
    </Button>
  );
}
