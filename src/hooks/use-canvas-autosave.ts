"use client";

import { useEffect, useRef } from "react";

import type { CanvasSaveStatus } from "@/components/canvas/canvas-save-context";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

const AUTOSAVE_DEBOUNCE_MS = 5000;
const ERROR_RETRY_MS = 8000;

type UseCanvasAutosaveOptions = {
  projectId: string;
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
  isLoading: boolean;
  enabled: boolean;
  onStatusChange: (status: CanvasSaveStatus) => void;
};

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  isLoading,
  enabled,
  onStatusChange,
}: UseCanvasAutosaveOptions) {
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const saveGenerationRef = useRef(0);
  const lastSavedPayloadRef = useRef<string | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  nodesRef.current = nodes;
  edgesRef.current = edges;

  useEffect(() => {
    if (!enabled || isLoading) {
      return;
    }

    const payloadKey = JSON.stringify({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });

    if (payloadKey === lastSavedPayloadRef.current) {
      return;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const debounceTimer = setTimeout(() => {
      const generation = ++saveGenerationRef.current;

      const flushSave = async () => {
        onStatusChange("saving");

        const body = {
          nodes: nodesRef.current,
          edges: edgesRef.current,
        };

        try {
          const response = await fetch(`/api/projects/${projectId}/canvas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`Canvas save failed (${response.status})`);
          }

          if (generation !== saveGenerationRef.current) {
            return;
          }

          lastSavedPayloadRef.current = JSON.stringify(body);
          onStatusChange("saved");
        } catch {
          if (generation !== saveGenerationRef.current) {
            return;
          }

          onStatusChange("error");

          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            void flushSave();
          }, ERROR_RETRY_MS);
        }
      };

      void flushSave();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [enabled, isLoading, nodes, edges, onStatusChange, projectId]);
}
