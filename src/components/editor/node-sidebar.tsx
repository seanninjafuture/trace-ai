"use client";

import { useCallback, useRef } from "react";
import {
  Cpu,
  Database,
  GitCommit,
  Network,
  type LucideIcon,
} from "lucide-react";

import {
  createInfrastructureDragGhost,
  getDragGhostAnchor,
} from "@/components/canvas/nodes/drag-ghost";
import {
  INFRASTRUCTURE_NODE_DEFINITIONS,
  serializeInfrastructureNodeDragPayload,
  TRACE_NODE_DRAG_MIME,
} from "@/lib/canvas/infrastructure-nodes";
import { cn } from "@/lib/utils";
import type { InfrastructureNodeType } from "@/types/canvas";

const NODE_ICONS: Record<InfrastructureNodeType, LucideIcon> = {
  gateway: Network,
  compute: Cpu,
  database: Database,
  queue: GitCommit,
};

const PALETTE_ORDER: InfrastructureNodeType[] = [
  "gateway",
  "compute",
  "database",
  "queue",
];

export function NodeSidebar() {
  const activeGhostRef = useRef<ReturnType<
    typeof createInfrastructureDragGhost
  > | null>(null);

  const teardownDragGhost = useCallback(() => {
    activeGhostRef.current?.unmount();
    activeGhostRef.current = null;
  }, []);

  const handleDragStart = useCallback(
    (type: InfrastructureNodeType) =>
      (event: React.DragEvent<HTMLButtonElement>) => {
        event.dataTransfer.setData(
          TRACE_NODE_DRAG_MIME,
          serializeInfrastructureNodeDragPayload(type)
        );
        event.dataTransfer.effectAllowed = "move";

        teardownDragGhost();
        const ghost = createInfrastructureDragGhost(type);
        activeGhostRef.current = ghost;

        const anchor = getDragGhostAnchor(type);
        event.dataTransfer.setDragImage(ghost.element, anchor.x, anchor.y);
      },
    [teardownDragGhost]
  );

  return (
    <aside
      className={cn(
        "absolute top-0 left-0 z-30 flex h-full w-64 flex-col border-r border-border-default bg-bg-surface/95 shadow-xl backdrop-blur-md"
      )}
    >
      <div className="border-b border-border-default px-4 py-3">
        <h2 className="text-sm font-medium text-text-primary">
          Architecture Components
        </h2>
      </div>

      <ul className="flex flex-col gap-1 p-2">
        {PALETTE_ORDER.map((type) => {
          const definition = INFRASTRUCTURE_NODE_DEFINITIONS[type];
          const Icon = NODE_ICONS[type];

          return (
            <li key={type}>
              <button
                type="button"
                draggable
                onDragStart={handleDragStart(type)}
                onDragEnd={teardownDragGhost}
                className={cn(
                  "flex w-full cursor-grab items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-text-primary transition-colors",
                  "hover:bg-bg-surface active:cursor-grabbing active:bg-bg-surface/80"
                )}
              >
                <Icon className="size-4 shrink-0 text-text-muted" />
                <span className="min-w-0 flex-1 leading-snug">
                  {definition.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
