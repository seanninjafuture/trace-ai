"use client";

import { FolderKanban, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { useEditorWorkspace } from "@/components/editor/editor-workspace-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MockProject } from "@/types/project";

type ProjectSidebarProps = {
  onClose: () => void;
};

function ProjectRow({
  project,
  isActive,
  showActions,
  onSelect,
  onRename,
  onDelete,
}: {
  project: MockProject;
  isActive: boolean;
  showActions: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="group flex items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex min-w-0 flex-1 items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
          isActive
            ? "bg-bg-surface text-text-primary ring-1 ring-border-default"
            : "text-text-primary hover:bg-bg-surface"
        )}
      >
        <FolderKanban className="mr-2 size-4 shrink-0 text-text-muted" />
        <span className="truncate">{project.name}</span>
      </button>

      {showActions ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
                aria-label={`Actions for ${project.name}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  );
}

export function ProjectSidebar({ onClose }: ProjectSidebarProps) {
  const {
    ownedProjects,
    sharedProjects,
    activeProject,
    openCreate,
    openRename,
    openDelete,
    selectProject,
  } = useEditorWorkspace();

  return (
    <aside
      className={cn(
        "flex h-full w-80 shrink-0 flex-col border-r border-border-default bg-bg-base shadow-xl"
      )}
    >
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <h2 className="text-sm font-medium text-text-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onClose}
          aria-label="Close projects panel"
        >
          <span className="text-lg leading-none">&times;</span>
        </Button>
      </div>

      <Tabs defaultValue="mine" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border-default px-4 pt-3 pb-3">
          <TabsList className="w-full">
            <TabsTrigger value="mine" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="mine"
          className="mt-0 flex min-h-0 flex-1 flex-col data-[orientation=horizontal]:mt-0"
        >
          <div className="px-4 pt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={openCreate}
            >
              <Plus className="size-4" />
              New Project
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-2 py-2">
            <ul className="flex flex-col gap-1">
              {ownedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  isActive={activeProject?.id === project.id}
                  showActions
                  onSelect={() => selectProject(project)}
                  onRename={() => openRename(project)}
                  onDelete={() => openDelete(project)}
                />
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="shared"
          className="mt-0 flex min-h-0 flex-1 flex-col data-[orientation=horizontal]:mt-0"
        >
          <ScrollArea className="min-h-0 flex-1 px-2 py-4">
            <ul className="flex flex-col gap-1">
              {sharedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  isActive={activeProject?.id === project.id}
                  showActions={false}
                  onSelect={() => selectProject(project)}
                  onRename={() => openRename(project)}
                  onDelete={() => openDelete(project)}
                />
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
