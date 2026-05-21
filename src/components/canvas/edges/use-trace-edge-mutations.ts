"use client";

import { useMutation } from "@liveblocks/react/suspense";

export const TRACE_EDGE_LABEL_PLACEHOLDER = "gRPC, HTTPS, AMQP…";

export function useUpdateTraceEdgeLabel() {
  return useMutation(
    ({ storage }, edgeId: string, label: string) => {
      const flow = storage.get("flow");
      if (!flow) return;

      const edge = flow.get("edges").get(edgeId);
      if (!edge) return;

      const data = edge.get("data");
      if (data) {
        data.set("label", label);
      }
    },
    []
  );
}
