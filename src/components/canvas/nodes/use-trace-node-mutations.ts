"use client";

import { useMutation } from "@liveblocks/react/suspense";

import type { NodeColorPair } from "@/types/canvas";

export const TRACE_NODE_LABEL_PLACEHOLDER = "Enter service name...";

export function useUpdateTraceNodeLabel() {
  return useMutation(
    ({ storage }, nodeId: string, label: string) => {
      const flow = storage.get("flow");
      if (!flow) return;

      const node = flow.get("nodes").get(nodeId);
      if (!node) return;

      const data = node.get("data");
      if (data) {
        data.set("label", label);
      }
    },
    []
  );
}

export function useUpdateTraceNodeColorPair() {
  return useMutation(
    ({ storage }, nodeId: string, colorPair: NodeColorPair) => {
      const flow = storage.get("flow");
      if (!flow) return;

      const node = flow.get("nodes").get(nodeId);
      if (!node) return;

      const data = node.get("data");
      if (data) {
        data.set("colorPair", colorPair);
      }
    },
    []
  );
}
