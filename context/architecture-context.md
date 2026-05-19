# Architecture Context

## Stack

| Layer     | Technology                  | Role   |
| --------- | --------------------------- | ------ |
| Framework | Next.js 16 + TypeScript | Full-stack app with server/client boundaries |
| UI & Canvas        | Tailwind + shadcn/ui | Component composition and styling |
| Auth      | Clerk                | User identity and route protection |
| Database  | Prisma → Supabase PostgreSQL only  | Relation metadata: projects, collaborators, specs, task runs (no Supabase Auth/Data API client) |
| Canvas  | Liveblocks + React Flow  | Real-time collaborative canvas, presence, and cursors |
| Background tasks  | Trigger .dev  | Durable AI generation workflows |
| Artifact storage  | Vercel blob  | Canvas snapshots and generated Markdown specs |
| AI Engine   | Vercel AI SDK + OpenAI API             | Translating plain English failure prompts into graph state changes |

## System Boundaries

- src/app — Owns the application routing, page layouts, and server-side entry points.
- src/components/canvas — Owns the live node-based workspace, canvas rendering, and real-time state listeners.
- src/services/ai — Owns the prompt engineering, simulation payload generation, and LLM streaming logic.
- src/server/actions — Owns the secure database mutations, state saves, and validation gates.

## Storage Model

- Supabase PostgreSQL (via Prisma in `src/server/db` and mutations in `src/server/actions`): Stores user accounts, tenant permissions, structural canvas nodes/edges, and generated incident playbooks.
- In-Memory Cache (Redis): Stores highly ephemeral simulation state telemetry during active multi-user chaos runs.

## Data Flow Model

- User Action Loop: User edits node \(\rightarrow \) React Flow captures local state \(\rightarrow \) Liveblocks broadcasts mutations over WebSockets \(\rightarrow \) Peers render instantly \(\rightarrow \) Server Actions persist state asynchronously.

- AI Simulation Loop: User submits failure prompt \(\rightarrow \) Canvas state payload sent to Vercel AI SDK \(\rightarrow \) LLM returns state delta array \(\rightarrow \) Local state merges delta streaming updates \(\rightarrow \) Canvas visualizes failures in real time.

## Auth and Access Model

- Every user must authenticate through Next-Auth or Clerk before joining a collaborative workspace session.
- System graphs are owned by an organization tier, allowing seamless sharing among verified internal engineering teammates.
- Canvas state changes require active workspace write tokens, instantly dropping unauthorized connection attempts via WebSocket.

## Invariants

1. Simulation logic must run deterministically; the same failure prompt on the same graph layout must yield identical failure vectors.
2. The UI canvas must never block user interactions or inputs while waiting for AI simulation payloads to stream.
3. Every graph mutation must trigger an immediate localized schema validation to prevent structural data corruption.
4. Active collaborative rooms must auto-flush state to the primary persistent database every 60 seconds of idle time.
