## AI Simulation Agent Logic & Canvas Mutation

## Goal

Implement the core execution logic for the asynchronous background AI chaos agent within Trigger.dev. The agent will ingest a natural language failure scenario, interpret system dependencies using the Vercel AI SDK, broadcast its active operational presence (cursor location and thinking state), and directly mutate the Liveblocks storage canvas graph to illustrate downstream degradation and traffic disruptions [STEM-Calculative-Problem-Solving].

1. Context-Aware Prompt Engineering & AI Model Setup

Update your background worker environment file (src/trigger/chaos-agent.ts) to orchestrate the analysis using the Vercel AI SDK and the structural system layout rules.

- Model Ingestion: Initialize the Vercel AI SDK using the pre-configured system keys.

- Structured Output Constraint (Schema): Use the generateStructuredJson or experimental_generateObject utility to force the model to output a strict, strongly typed delta change array. Never allow unformatted plain conversational markdown strings to enter the graph mutation pipeline.

typescript

// Strict operational schema contract for canvas changes
const canvasMutationSchema = z.object({
  mutations: z.array(z.discriminatedUnion("action", [
    z.object({
      action: z.literal("UPDATE_NODE"),
      nodeId: z.string(),
      status: z.enum(["healthy", "degraded", "outage"]),
      errorRate: z.number().min(0).max(100),
      latency: z.number()
    }),
    z.object({
      action: z.literal("ADD_EDGE_ALERT"),
      edgeId: z.string(),
      label: z.string()
    })
  ]))
});
Use code with caution.

- System Prompts Context: Feed the AI engine strict environment rules extracted from your system primitives:Enforce the absolute usage of our explicit dark UI color palette pairs and health parameters (healthy, degraded, outage).Instruct the model to traverse the existing network edges array to locate downstream casualties (e.g., if a gateway node fails, look at connected compute nodes to calculate cascading failures).

2. Liveblocks Headless Canvas Interceptors

To let a background server script write directly to a WebSocket room, initialize a headless session connection loop inside the Trigger.dev workflow task wrapper using your secret manager keys:

typescript

import { createClient } from "@liveblocks/node";

const liveblocksClient = createClient({ secret: process.env.LIVEBLOCKS_SECRET_KEY! });
Use code with caution.

## Real-Time Live Data Invariant:

- Do not query old snapshots from PostgreSQL database records.

- Always fetch the fresh, active live-memory runtime state of the system graph directly from the Liveblocks room storage stream (liveblocksClient.getStorageDocument) before parsing failure vectors. This ensures the AI reacts accurately to where nodes are placed right now.

3. Real-Time AI Presence Broadcasting

While the background worker runs the LLM calculation pipeline, it must stream its active state out to human collaborators on the canvas layout to make the system feel alive:

- Thinking State Indicator: Immediately upon task ingestion, set the room's transient presence state for the "ai-agent" identity block to { isThinking: true }. This instantly triggers glowing loaders on the human interface sidebars.

- Vector Pointer Movements: Animate an automated visual path loop across the canvas by passing incremental coordinate updates to the room's cursor object map. Move the pointer directly over the specific microservice node currently undergoing failure stress-testing.

- Status Progress Stream: Push discrete milestone text frames to a shared activity state array inside the room storage layer:[START]: "Trace AI Agent initializing chaos matrix..."[PROCESSING]: "Calculating downstream cascading latency vectors across API channels..."[COMPLETE]: "Failure injection successful. 2 nodes degraded."

4. Canvas Mutation Execution Loop

Once the structured JSON delta object resolves from the AI provider, iterate through the operation commands and apply changes directly to the Liveblocks storage map container:

- Targeted Property Overrides: Safely unpack mutations matching specific target infrastructure components. Shift their health parameters dynamically (e.g., changing a database container's status field to 'outage', ramping errorRate up to 98%, and scaling latency tracking values to 12500ms).

- Safety Cleanup Invariant: Whether the simulation script completes successfully or hits a processing failure path, you must execute a strict finally wrap block. The cleanup block must clear the active cursor coordinates, toggle the room's { isThinking: false } flag to idle, and terminate the Liveblocks headless connection instance cleanly to avoid active session token leaks.

## Scope Limits

To protect system boundaries and unit verification rules:

- Do not alter how human operators drag, select, or configure components via the local UI.Do not introduce an independent client state engine or temporary local variable array systems outside of the Liveblocks synchronization contract.Do not connect live application performance monitoring (APM) agents or runtime logs.

## Check When Done

- Trigger.dev background tasks successfully hook into active Liveblocks room instances using a headless node token client.Submitting a natural language chaos prompt accurately updates target node health states, error percentages, and latency metrics.The AI agent's animated mouse pointer and thinking loading widgets broadcast visible state changes to human peers during runs.System processing anomalies are caught gracefully, clearing active presence locks without clobbering canvas schemas.The entire application project builds smoothly (npm run build) with zero broken type assertions.