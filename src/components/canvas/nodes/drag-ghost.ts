import { createElement } from "react";
import { createRoot } from "react-dom/client";

import { InfrastructureShapeBody } from "@/components/canvas/nodes/infrastructure-shapes";
import {
  getInfrastructureNodeDimensions,
  INFRASTRUCTURE_NODE_DEFINITIONS,
} from "@/lib/canvas/infrastructure-nodes";
import type { InfrastructureNodeType } from "@/types/canvas";

const GHOST_OFFSET = { x: 0, y: 0 };

type DragGhostHandle = {
  element: HTMLDivElement;
  unmount: () => void;
};

function mountGhostPreview(type: InfrastructureNodeType, label: string) {
  const { width, height } = getInfrastructureNodeDimensions(type);
  const shell = document.createElement("div");
  shell.className =
    "pointer-events-none fixed -left-[9999px] top-0 z-[9999] overflow-hidden border border-border-default bg-bg-base/40 shadow-lg backdrop-blur-md";
  shell.style.width = `${width}px`;
  shell.style.height = `${height}px`;

  if (type === "gateway") {
    shell.classList.add("rounded-full");
  } else if (type === "compute") {
    shell.classList.add("rounded-md");
  } else {
    shell.classList.add("rounded-lg");
  }

  document.body.appendChild(shell);

  const root = createRoot(shell);
  root.render(
    createElement(InfrastructureShapeBody, {
      label,
      type,
      compact: true,
    })
  );

  return {
    element: shell,
    unmount: () => {
      root.unmount();
      shell.remove();
    },
  } satisfies DragGhostHandle;
}

export function createInfrastructureDragGhost(
  type: InfrastructureNodeType
): DragGhostHandle {
  const definition = INFRASTRUCTURE_NODE_DEFINITIONS[type];
  return mountGhostPreview(type, definition.defaultLabel);
}

export function getDragGhostAnchor(type: InfrastructureNodeType) {
  const { width, height } = getInfrastructureNodeDimensions(type);
  return {
    x: width / 2 + GHOST_OFFSET.x,
    y: height / 2 + GHOST_OFFSET.y,
  };
}
