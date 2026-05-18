"use client";

import {
  Cpu,
  Database,
  GitCommit,
  Network,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ArchitectureNode = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  { id: "gateway", label: "Gateway / Load Balancer", icon: Network },
  { id: "compute", label: "Compute Service / API", icon: Cpu },
  { id: "datastore", label: "Data Store / Database", icon: Database },
  { id: "queue", label: "Message Queue", icon: GitCommit },
];

export function NodeSidebar() {
  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-border-default bg-bg-base"
      )}
    >
      <div className="border-b border-border-default px-4 py-3">
        <h2 className="text-sm font-medium text-text-primary">
          Architecture Components
        </h2>
      </div>

      <ul className="flex flex-col gap-1 p-2">
        {ARCHITECTURE_NODES.map((node) => {
          const Icon = node.icon;

          return (
            <li key={node.id}>
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/reactflow",
                    node.id
                  );
                  event.dataTransfer.effectAllowed = "move";
                }}
                className={cn(
                  "flex w-full cursor-grab items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-text-primary transition-colors",
                  "hover:bg-bg-surface active:cursor-grabbing active:bg-bg-surface/80"
                )}
              >
                <Icon className="size-4 shrink-0 text-text-muted" />
                <span className="min-w-0 flex-1 leading-snug">{node.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
