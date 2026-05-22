"use client";

import { useCallback } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";

import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

export function useImportStarterTemplate() {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete, isLoading } =
    useLiveblocksFlow<TraceCanvasNode, TraceCanvasEdge>({
      suspense: false,
    });

  return useCallback(
    (template: CanvasTemplate) => {
      if (isLoading) return;

      const currentNodes = nodes ?? [];
      const currentEdges = edges ?? [];

      if (currentNodes.length > 0 || currentEdges.length > 0) {
        onDelete({ nodes: currentNodes, edges: currentEdges });
      }

      if (template.nodes.length > 0) {
        onNodesChange(
          template.nodes.map((item) => ({
            type: "add" as const,
            item,
          }))
        );
      }

      if (template.edges.length > 0) {
        onEdgesChange(
          template.edges.map((item) => ({
            type: "add" as const,
            item,
          }))
        );
      }
    },
    [edges, isLoading, nodes, onDelete, onEdgesChange, onNodesChange]
  );
}
