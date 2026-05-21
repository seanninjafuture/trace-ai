import { z } from "zod";

export const canvasMutationSchema = z.object({
  mutations: z.array(
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("UPDATE_NODE"),
        nodeId: z.string(),
        status: z.enum(["healthy", "degraded", "outage"]),
        errorRate: z.number().min(0).max(100),
        latency: z.number(),
      }),
      z.object({
        action: z.literal("ADD_EDGE_ALERT"),
        edgeId: z.string(),
        label: z.string(),
      }),
    ])
  ),
});

export type CanvasMutationPlan = z.infer<typeof canvasMutationSchema>;
