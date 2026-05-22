import { z } from "zod";

const infraTypeSchema = z.enum(["gateway", "compute", "database", "queue"]);
const colorPairSchema = z.enum(["default", "blue", "purple", "amber"]);
const healthStatusSchema = z.enum(["healthy", "degraded", "outage"]);

export const canvasMutationSchema = z.object({
  mutations: z.array(
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("ADD_NODE"),
        nodeId: z.string().min(1),
        label: z.string().min(1),
        infraType: infraTypeSchema,
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
        colorPair: colorPairSchema.optional(),
      }),
      z.object({
        action: z.literal("ADD_EDGE"),
        edgeId: z.string().min(1),
        source: z.string().min(1),
        target: z.string().min(1),
        label: z.string().optional(),
      }),
      z.object({
        action: z.literal("UPDATE_NODE"),
        nodeId: z.string(),
        status: healthStatusSchema,
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

export type CanvasMutation = CanvasMutationPlan["mutations"][number];
