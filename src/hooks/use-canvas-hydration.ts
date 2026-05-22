"use client";

import { useEffect, useRef } from "react";
import type { EdgeChange, NodeChange } from "@xyflow/react";

import type { CanvasSnapshot } from "@/lib/canvas-persistence";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

type UseCanvasHydrationOptions = {
  projectId: string;
  enabled: boolean;
  isLoading: boolean;
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
  onNodesChange: (changes: NodeChange<TraceCanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<TraceCanvasEdge>[]) => void;
};

export function useCanvasHydration({
  projectId,
  enabled,
  isLoading,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: UseCanvasHydrationOptions) {
  const hasHydratedRef = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  nodesRef.current = nodes;
  edgesRef.current = edges;

  useEffect(() => {
    if (!enabled || isLoading || hasHydratedRef.current) {
      return;
    }

    if (nodes.length > 0 || edges.length > 0) {
      hasHydratedRef.current = true;
      return;
    }

    const hydrate = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          cache: "no-store",
        });

        if (!response.ok) {
          hasHydratedRef.current = true;
          return;
        }

        const snapshot = (await response.json()) as CanvasSnapshot;
        if (snapshot.nodes.length === 0 && snapshot.edges.length === 0) {
          hasHydratedRef.current = true;
          return;
        }

        // Re-check after network: peers may have populated the room meanwhile.
        if (nodesRef.current.length > 0 || edgesRef.current.length > 0) {
          hasHydratedRef.current = true;
          return;
        }

        hasHydratedRef.current = true;

        if (snapshot.nodes.length > 0) {
          onNodesChange(
            snapshot.nodes.map((item) => ({
              type: "add" as const,
              item,
            }))
          );
        }

        if (snapshot.edges.length > 0) {
          onEdgesChange(
            snapshot.edges.map((item) => ({
              type: "add" as const,
              item,
            }))
          );
        }
      } catch (error) {
        console.error("Canvas hydration failed", error);
      }
    };

    void hydrate();
  }, [
    enabled,
    edges,
    isLoading,
    nodes,
    onEdgesChange,
    onNodesChange,
    projectId,
  ]);
}
