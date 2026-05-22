## AI Simulation Agent Pipeline (Trigger.dev Configuration)

## Goal

Set up the asynchronous background orchestration layer for the AI chaos agent using Trigger.dev (v3). Since transforming plain English failure triggers into distributed graph states can exceed standard serverless route timeouts, we offload this logic to a durable background task pipeline [STEM-Calculative-Problem-Solving]. This milestone establishes job triggering, lifecycle run-tracking, and secure public token generation without implementing the core LLM execution rules yet.

1. Database Run Tracking Schema

To ensure security across asynchronous jobs, you must track running processes in your database. Append the following model definition to your prisma/schema.prisma file to link Trigger.dev jobs to project ownership bounds:

prisma
model TaskRun {
  id        String   @id @default(cuid())
  runId     String   @unique // Trigger.dev internal execution UUID
  projectId String
  userId    String   // Clerk operator who initiated the chaos simulation
  createdAt DateTime @default(now())

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([projectId])
}
Use code with caution.

Don't forget to run npx prisma migrate dev --name add_task_run_model after updating the schema layout.

2. Triggering API Endpoints

Create Next.js Route Handlers to instantiate and monitor cloud simulation execution layers safely:

A. POST /api/ai/design (Failure Inception Entry)

- Payload Expectation: Accepts a body JSON payload containing a prompt string (e.g., "Inject a cascading memory leak into the auth cache"), a projectId string, and the matching Liveblocks roomId.

- Security Gate: Require an authenticated Clerk token wrapper. Verify that the user has explicit project access permission via lib/project-access.ts.

- Job Dispatch: Invoke the Trigger.dev client SDK to trigger the background task asynchronously:

typescript
const handle = await tasks.trigger<typeof chaosAgentTask>("chaos-agent-task", {
  prompt,
  roomId,
  projectId,
});
Use code with caution.

- Persistence Loop: Create a corresponding TaskRun record mapping the returned handle.id to the current projectId and Clerk userId. Return the runId back to the client editor dashboard layout.

B. POST /api/ai/design/token (Public Tracking Scoping)

- Payload Expectation: Accepts a target background runId string.

- Security Gate: Query your Prisma TaskRun table. Confirm that the authenticated Clerk user's identity matches the userId attached to the saved execution profile. If the validation fails, immediately drop the transmission and return an HTTP 403 Forbidden status response.

- Token Generation: Generate an ephemeral, read-only public access token securely scoped strictly to that unique background task runtime ID via the Trigger.dev SDK. Pass this signed token string back to the client interface so the UI can listen directly to execution lifecycle streams securely.

3. Asynchronous Simulation Runner Blueprint

Create your core durable orchestration task environment profile inside your designated task file structure at src/trigger/chaos-agent.ts:

- Runtime Environments Integration: Review your global initialization steps. Avoid creating competing workspace handler patterns; import and build cleanly on top of the default layout parameters.

- Task Setup Structure: Export a minimal, typed durable task shape targeting your execution environment limits:

typescript

import { task } from "@trigger.dev/sdk/v3";

export const chaosAgentTask = task({
  id: "chaos-agent-task",
  run: async (payload: { prompt: string; roomId: string; projectId: string }) => {
    // Core orchestration wrapper log points
    console.log(`[Trace AI Agent Init]: target workspace room -> ${payload.roomId}`);
    console.log(`[Chaos Vector Captured]: prompt payload string -> ${payload.prompt}`);

    // Return a mock confirmation execution status payload for this layout unit
    return {
      status: "success",
      processedPrompt: payload.prompt,
      nodesMutatedCount: 0,
    };
  },
});
Use code with caution.

## Scope Limits

To protect step-by-step verification rules and unit isolation targets:

- Do not write Vercel AI SDK runtime handlers or import OpenAI API authorization credentials yet.

- Do not execute live state changes on active nodes, graph metrics, or Liveblocks room maps.

- Keep this task strictly focused on constructing background pipeline routing architectures.

## Check When Done

POST /api/ai/design safely initiates an asynchronous background task thread.Task execution records safely commit to PostgreSQL via Prisma to verify user session boundaries.The token endpoint accurately checks identity constraints before outputting run-scoped keys.The custom background task compiles natively with no environmental type faults.The entire system application workspace passes compilation routines (npm run build).