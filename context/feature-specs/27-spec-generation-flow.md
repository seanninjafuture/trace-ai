## Asynchronous Technical Spec & Playbook Generation (Trigger.dev Backend)

## Goal

Create the durable backend orchestration pipeline for AI-powered technical incident post-mortem playbook and specification generation using Trigger.dev (v3). When a team clicks the generation command, this architecture captures the active canvas topology along with the simulation chat logs, offloads the markdown generation to an enterprise background task to bypass API route timeouts, and returns securely scoped public lifecycle tokens [STEM-Calculative-Problem-Solving].

1. Secure Blueprint Specification Trigger Endpoint

Create a protected Next.js 1Route Handler at src/app/api/ai/spec/route.ts to capture state parameters and initiate background generation:

- Endpoint Address: POST /api/ai/spec

- Payload Ingestion Contract: Expects a body JSON payload containing a Liveblocks roomId, a structured chatHistory array list, and the active canvas topology nodes and edges arrays.

- Access Control & Security Rules:Authenticate the incoming connection check via Clerk's auth().Anti-Tamper Rule: Do not trust or accept a client-supplied projectId variable. Look up and resolve the true underlying projectId directly from the database using the validated roomId string via lib/project-access.ts.If the security helper validation fails or the user is not an owner or recorded ProjectCollaborator, instantly return an HTTP 403 Forbidden response.

- Background Orchestration: Dispatch the durable execution job to Trigger.dev:

typescript
const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec-task", {
  projectId,
  roomId,
  chatHistory,
  nodes,
  edges
});
Use code with caution.

- Run Recording: Insert a TaskRun record mapping the background handle.id to the current user's session. Return the runId back to the client sidebar dashboard.

2. Token Security Gate Endpoint

Create an authorization route handler at src/app/api/ai/spec/token/route.ts to grant read-only tracking permissions to client listening hooks:

- Endpoint Address: POST /api/ai/spec/token

- Payload Ingestion Contract: Expects a body JSON payload containing the targeted background runId string.

- Ownership Check Invariant: Query your Prisma TaskRun table using the runId. Enforce a strict identity validation check verifying if the authenticated user's Clerk ID matches the recorded userId. If a different user attempts to query the token, drop processing and return an HTTP 403 Forbidden response.

- Token Minting Constraints: Generate an ephemeral public tracking token using the Trigger.dev SDK. Enforce strict parameter scoping: limit access explicitly to that single execution run and set a rigid time-to-live expiration cap of exactly 1 hour (3600 seconds). Return the signed token string back to the client interface.

3. Durable Playbook Generation Task (src/trigger/generate-spec.ts)

Export a typed, durable execution task runner configured to parse cloud architectures and compile technical post-mortem playbooks:

- Input Validation Validation Guard: Build a comprehensive Zod validation schema inside the task's entry perimeter to ensure parameter safety:

typescript
const GenerateSpecInputSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(z.any()),
  nodes: z.array(z.any()),
  edges: z.array(z.any())
});
Use code with caution.

- Context-Aware Document Compilation: Use the Vercel AI SDK paired with the @ai-sdk/google provider client to analyze the input system topology. Pass a comprehensive system prompt instruction matrix:Analyze the arrangement of infrastructure shapes (gateway, compute, database, queue) and note components matching broken status tiers (degraded, outage).Parse the provided room chat logs to identify developer interaction patterns and troubleshooting milestones.Instruct the engine to compile a comprehensive, industry-grade Incident Post-Mortem and Recovery Playbook Specification Document formatted in valid Markdown syntax.

- Real-Time Metadata Heartbeats: During processing loops, continuously fire Trigger.dev runs.updateMetadata updates to stream job metrics (e.g., "{ status: 'compiling_playbook', completionPercent: 65 }") directly to human client hooks.

- Task Output: Return the final generated markdown text stream directly as the definitive output data payload of the background task run.

## Scope Limits

To protect step-by-step verification rules and unit isolation targets:
- Do not write frontend text markdown editor views, canvas rendering scripts, or download button links yet.Do not alter how human operators select, move, or configure elements via the local canvas UI.Keep this unit strictly locked down to establishing the backend generation routes, token managers, and task runner environments.Check 
## When Done

- POST /api/ai/spec successfully resolves underlying project mappings from the server and fires background tasks.Spec token allocation checks accurately reject cross-user token queries with strict HTTP 403 status rules.Trigger.dev background worker scripts validate data matrices using strict Zod schemas upon ingestion.System processing models generate valid Markdown content text as output payloads without timing out serverless paths.The full application environment compiles natively (npm run build) without type flaws or linting complaints.