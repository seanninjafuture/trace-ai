# Progress Tracker



Update this file after every meaningful implementation change.



## Current Phase



- Service panel option forms and canvas node health/degraded visuals



## Current Goal



- Next feature work after spec UI integration (see completed list)



## Completed

- OpenRouter AI SDK — `@openrouter/ai-sdk-provider@2.9.0`; `src/lib/openrouter.ts` exports Nemotron 3 Nano Omni free model (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`); `.env.example` documents `OPENROUTER_API_KEY`

- Trigger.dev v4 — `@trigger.dev/sdk@4.4.6`; root `trigger.config.ts` (`TRIGGER_PROJECT_REF`, `./trigger`); sample `hello-world` task in `trigger/example.ts`; `npm run trigger:dev`; `@trigger/*` path alias; `.env.example` documents `TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF` (user must create cloud project and login via `npx trigger.dev@latest login`)

- `feature-specs/01-design-system.md` — shadcn/ui in `src/components/ui/`; `src/lib/utils.ts` (`cn()`); `tailwind.config.ts` + `@theme` utilities for design tokens; Button, Card, Dialog, Input, Textarea, Tabs, ScrollArea, Badge; `lucide-react`; dark-only tokens in `app/globals.css`; `html.dark` on root layout

- `feature-specs/02-editor.md` — `EditorNavbar`, `NodeSidebar`, `SimulationSidebar`, `EditorLayout` (full-viewport shell + canvas placeholder), `DialogShell` (standardized modal wrapper styles; no concrete modals yet)

- `feature-specs/03-auth.md` — Clerk `ClerkProvider` with `@clerk/ui` dark theme + app CSS variables; `proxy.ts` protected-first routing; `/sign-in` and `/sign-up` two-panel auth pages; `/` redirects; `/editor` workspace; `UserButton` in navbar; Clerk webhook → Prisma user sync; Liveblocks auth route; session cookie stripping for background/simulation API paths

- `feature-specs/04-project-dialogs.md` — editor home splash when no project loaded; create/rename/delete dialogs (`DialogShell` + `bg-black/80 backdrop-blur-sm`); project sidebar (My Projects / Shared) with owned-only rename/delete menus; mobile scrim + outside-tap close; `EditorWorkspaceProvider` + project action hooks

- `feature-specs/05-prisma.md` — `Project` + `ProjectCollaborator` models with cascade deletes, unique compound constraint, and indexes; `User.projects` relation; `src/lib/prisma.ts` singleton (Accelerate when `prisma+postgres://`, else `@prisma/adapter-pg` + `pg`); migrations `init_users` + `add_projects` applied to Supabase; `npm run build` passes

- `feature-specs/06-project-apis.md` — `GET`/`POST` `/api/projects`, `PATCH`/`DELETE` `/api/projects/[projectId]`; Clerk `auth()` 401 gate; owner-only mutation 403 gate; GET lists owned + collaborator projects by user id/email; POST defaults name to Untitled Project, status `DRAFT`; helpers in `src/lib/projects-api.ts`

- `feature-specs/07-wire-editor-home.md` — async `editor/layout.tsx` + `listEditorProjectsForCurrentUser` (owned vs shared); `use-project-actions.ts` (create/rename/delete via REST, `router.push` / `router.refresh`); `POST` accepts `canvasJsonPath` aligned with `generateProjectRoomId`; `/editor/[projectId]` route; Liveblocks room preview in create dialog; delete warning includes project name; removed `mock-projects.ts`

- `feature-specs/08-editor-workspace-shell.md` — `evaluateProjectAccess` in `src/lib/project-access.ts` (owner + collaborator by email, lookup by `Project.id` or `canvasJsonPath`); RSC `/editor/[roomId]/page.tsx` with sign-in redirect and `AccessDenied`; `WorkspaceCanvas` placeholder; `EditorLayout` receives server `workspaceProject` for navbar title/slug; mock Share + Flame sidebar toggle; provider-only `editor/layout.tsx`; `npm run build` passes

- `feature-specs/09-share-dialog.md` — `GET`/`POST` `/api/projects/[projectId]/collaborators`, `DELETE` `.../collaborators/[collaboratorId]`; owner-only mutations; member GET for owner + collaborators; Clerk `getUserList` / `getUser` enrichment in `src/lib/clerk-user-enrichment.ts`; `ShareDialog` (`UserPlus` trigger, ScrollArea member list, owner invite/remove + copy link with 2s “Copied!”); collaborators read-only; Resend transactional invite email on POST (`src/services/email/send-collaborator-invite.ts`); `npm run build` passes

- `feature-specs/10-liveblocks-setup.md` — `src/liveblocks.config.ts` types `Presence` (`cursor`, `activeNodeId`, `isThinking`) and `UserMeta` (`name`, `avatar`, `color`); `src/lib/liveblocks.ts` cached `@liveblocks/node` client + `assignUserColor` (8-token palette, id hash); `--user-color-1`…`8` in `globals.css`; `POST /api/liveblocks-auth` Clerk 401, `evaluateProjectAccess` 403, session `userInfo` from Clerk + deterministic color; removed legacy `liveblocks-room-access.ts`; `npm run build` passes

- `feature-specs/11-base-canvas.md` — `src/types/canvas.ts` trace node/edge types; `CanvasProvider` (`LiveblocksProvider` → `/api/liveblocks-auth`, `RoomProvider` with presence + empty `initialStorage`, `ClientSideSuspense`, connection error + retry); `TraceCanvas` with `useLiveblocksFlow` (suspense, Liveblocks `flow` storage), dot `Background`, `MiniMap`, `ConnectionMode.Loose`, `fitView`, `traceNode` custom nodes + seed dummy topology; removed `WorkspaceCanvas` placeholder; `npm run build` passes

- `feature-specs/12-shape-panel.md` — `src/lib/canvas/infrastructure-nodes.ts` (definitions, JSON drag payload parse/serialize, node factory); `NodeSidebar` HTML5 drag with styled ghost + `application/trace-infrastructure-node` payload; `TraceCanvas` `onDragOver`/`onDrop` + `screenToFlowPosition` + Liveblocks `onNodesChange` add; `FoundationalNodeRenderer` glass cards with top/bottom handles and type icons; `npm run build` passes

- `feature-specs/13-nodes-shape.md` — `src/components/canvas/nodes/trace-node.tsx` type-specific profiles (gateway pill + double ring, compute grid card, database scaling cylinder SVG, queue hexagon SVG); glass rest + accent focus when selected or peer `activeNodeId`; `infrastructure-shapes.tsx` shared body/SVGs; `drag-ghost.ts` + `NodeSidebar` `setDragImage` previews sized to definition dimensions with `onDragEnd` teardown; reads `TraceNodeData` from Liveblocks nodes unchanged; `npx next build` passes

- `feature-specs/14-node-editing.md` — `NodeResizer` on selected nodes (hidden when peer `activeNodeId` locks node) with 140×50 min bounds and zinc handle styling; resize dimensions sync via React Flow → Liveblocks `dimensions` changes; double-click inline `TraceNodeLabelEditor` (`Textarea`, `nodrag`/`nopan`, Escape/blur teardown) with live `data.label` mutation through `useUpdateTraceNodeLabel`; empty-label placeholder in `InfrastructureShapeBody`; `npx next build` passes

- `feature-specs/15-nodes-color-toolbar.md` — `NodeColorPair` + `NODE_COLOR_PAIR_DEFINITIONS` in `src/lib/canvas/node-color-pairs.ts`; `data.colorPair` on `TraceNodeData`; `TraceNodeColorToolbar` (`NodeToolbar`, 12px offset, glass swatch row, active ring + hover glow, `nodrag`/`nopan`); `useUpdateTraceNodeColorPair` Liveblocks mutation; node shell/label/icon classes from palette in `trace-node.tsx` + `infrastructure-shapes.tsx`; toolbar hidden during label edit; new nodes default `colorPair: "default"`; `npm run build` passes

- `feature-specs/16-edge-behavior.md` — four cardinal handles on `trace-node.tsx` (top/left target, bottom/right source, zinc dots fade in on `group-hover`); `OrthogonalTrafficEdge` in `src/components/canvas/edges/orthogonal-edge.tsx` (`getSmoothStepPath` radius 8, accent hover/select + glow, transparent 12px hit path, `MarkerType.ArrowClosed`); `TraceEdgeData.label` + `TraceEdgeLabelEditor` / `useUpdateTraceEdgeLabel` via `EdgeLabelRenderer` midpoint (double-click, blur/Escape commit); `defaultEdgeOptions` on `TraceCanvas`; seed dummy edge labels; removed `trace-edge.tsx`; `npm run build` passes

- `feature-specs/17-canvas-ergonomics.md` — `CanvasControls` pill (`Panel` bottom-left above `MiniMap`, glass zinc toolbar, zoom/fit + Liveblocks undo/redo with disabled states, `nodrag`/`nopan`); `useKeyboardShortcuts` in `src/hooks/use-keyboard-shortcuts.ts` (skips input/textarea/contenteditable; Cmd/Ctrl ±/=/Z/Shift+Z/Y); `CanvasKeyboardShortcuts` wired in `TraceCanvas`; viewport actions via `useReactFlow` in child components only (`duration: 200`, `fitView` padding 0.2); history via `useUndo`/`useRedo`/`useCanUndo`/`useCanRedo`; `npx next build` passes

- `feature-specs/18-starter-template.md` — `STARTER_TEMPLATES` + `CanvasTemplate` in `src/components/editor/starter-templates.ts` (three-tier web, event-driven pipeline, HA cluster); `StarterTemplatePreview` static SVG (`viewBox` bounds, center-to-center edges, type-shaped nodes); `StarterTemplatesModal` + navbar `Templates` trigger (`DialogShell`, ScrollArea, responsive grid); `useImportStarterTemplate` flushes Liveblocks `flow` via `onDelete` then repopulates with `onNodesChange`/`onEdgesChange`; `CanvasProvider` hoisted around `EditorLayout` on `/editor/[roomId]` with `StarterTemplateModalProvider`; `npm run build` passes

- `feature-specs/19-presence-avatars-cursor.md` — `Presence` types verified in `src/liveblocks.config.ts`; `PresenceBar` (`src/components/canvas/presence-bar.tsx`) absolute top-right on canvas (not navbar), Clerk `UserButton` + filtered `useOthers` (max 5 + `+N`, initials fallback, overlapping avatars); `CanvasPeerCursors` (`src/components/canvas/canvas-cursors.tsx`) flow-space pointer broadcast via `pointToFlowPosition` + `updateMyPresence`, remote SVG arrows + name badges colored from `userInfo.color`; wired in `TraceCanvas`; `npm run build` passes

- `feature-specs/20-ai-sidebar-shell.md` — `SimulationSidebar` glass shell (`w-80`, `h-[calc(100vh-3.5rem)]`, `bg-bg-surface`, `shadow-2xl`); modular `src/components/editor/ai-sidebar/` (`ai-sidebar-header`, `ai-sidebar-tabs`, `ai-architect-tab`, `ai-specs-tab`, `types`); AI Architect tab with mock chat (empty-state Bot + shortcut chips, user/assistant bubbles, Enter submit / Shift+Enter newline, Inject Chaos); Specs tab with Generate Incident Spec File + mock `post_mortem_simulation_latest.md` preview + disabled download; `PanelRightClose` via optional `onClose` from `EditorLayout`; no API/Liveblocks wiring; `npx next build` passes

- `feature-specs/21-canvas-autosave.md` — `canvasBlobUrl` on `Project` (pointer only; `canvasJsonPath` remains Liveblocks room slug); `@vercel/blob` upload at `projects/[projectId]/canvas.json` (`allowOverwrite`, no suffix); `GET`/`PUT` `/api/projects/[projectId]/canvas` with Clerk + `evaluateProjectAccess`; `use-canvas-autosave.ts` (5s debounce, idle/saving/saved/error + retry); `use-canvas-hydration.ts` in `TraceCanvasInner` (single `useLiveblocksFlow`; hydrate from blob only when flow is empty); `CanvasSaveProvider` + `CanvasSaveStatus` in navbar; empty canvas initial (removed dummy seed on load); `BLOB_READ_WRITE_TOKEN` in `.env.example`; `npx next build` passes

- `feature-specs/22-design-agent-api.md` — `TaskRun` Prisma model + migration `add_task_run_model`; `chaosAgentTask` in `trigger/chaos-agent.ts` (mock orchestration logs only); `POST /api/ai/design` (Clerk + `evaluateProjectAccess`, `tasks.trigger`, persist `runId`); `POST /api/ai/design/token` (owner check via `TaskRun`, `auth.createPublicToken` scoped to run); helpers in `src/lib/ai-design-api.ts`; no LLM or Liveblocks mutation; `npm run build` passes

- `feature-specs/23-design-agent-logic.md` — `chaosAgentTask` uses Vercel AI SDK `generateObject` + `canvasMutationSchema` (OpenRouter Nemotron); live graph via `getStorageDocument` JSON (never Postgres); `mutateFlow` applies `UPDATE_NODE` / `ADD_EDGE_ALERT`; headless `setPresence` for `ai-agent` (cursor path, `isThinking`, `finally` cleanup); `agentActivity` LiveList milestones in room storage; `src/lib/chaos-agent/*`; AI sidebar `AiAgentStatus` + thinking glow + `Inject Chaos` → `POST /api/ai/design`; `npm run build` passes

- `feature-specs/24-ai-presence-state.md` — `AIStatusMessageSchema` in `src/types/tasks.ts`; `Storage.aiStatusMessages` LiveList + `pushAiStatusMessage` in `liveblocks-chaos.ts`; `useRoomIsThinking` hook; sidebar textarea disabled + `Injecting Chaos...` button when any peer `isThinking`; `AiAgentStatus` shows latest validated status only; `PresenceBar` avatar + `CanvasPeerCursors` name-badge spinners; `npm run build` passes

- `feature-specs/25-sidebar-chat-feed.md` — `AIChatMessageSchema` + `parseAiChatMessages` / `resolveChatAvatarUrl` in `src/types/tasks.ts`; `Storage.aiChatMessages` LiveList in `liveblocks.config.ts`; `usePushAiChatMessage` hook; `AiArchitectTab` subscribes to Liveblocks chat (timestamp order, avatars, auto-scroll anchor); Enter sends validated user messages with Clerk profile; `Inject Chaos` button unchanged (no chat pollution); send error + retry above input (`--state-error`); `AiChatMessageBubble` styling per spec; `npm run build` passes

- `feature-specs/26-design-agent-frontend.md` — `SimulationSidebar` owns `runningJob` + `useRealtimeRun` (`@trigger.dev/react-hooks`); `Inject Chaos` pushes user chat then `POST /api/ai/design` (returns `runId` + `publicToken`); locks textarea/button while run active; assistant success line on `COMPLETED`; status ribbon above input from latest `aiStatusMessages` while job runs; canvas updates via Liveblocks only (no client graph mutation); `npm run build` passes

- `feature-specs/27-spec-generation-flow.md` — `generateSpecTask` in `trigger/generate-spec.ts` (`schemaTask` + `GenerateSpecInputSchema`, Vercel AI SDK + `@ai-sdk/google` Gemini, `metadata` progress heartbeats, Markdown output); `POST /api/ai/spec` resolves `projectId` from `roomId` via `evaluateProjectAccess` (rejects client `projectId`), triggers task, persists `TaskRun`, returns `runId` only; `POST /api/ai/spec/token` owner check + `auth.createPublicToken` scoped to run with `expirationTime: "1h"`; helpers in `src/lib/ai-spec-api.ts`, `src/lib/google-ai.ts`, `src/lib/spec-agent/build-spec-system-prompt.ts`; `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.example`; no spec UI or Blob persistence; `npm run build` passes

- `feature-specs/28-spec-persistent-download.md` — `ProjectSpec` Prisma model + migration `add_project_spec_table`; `src/lib/spec-persistence.ts` (Vercel Blob at `projects/[projectId]/specs/[specId].md`, Prisma metadata only); `generateSpecTask` archives markdown after generation (`archiving` metadata step, returns `{ specId, markdown }`); `GET /api/projects/[projectId]/specs/[specId]/download` (Clerk 401, `evaluateProjectAccess` 403, spec-to-project 404, server-side blob fetch, attachment headers); no spec list/preview UI; `npm run build` passes

- `feature-specs/29-spec-ui-integration.md` — RSC `listProjectSpecsForProject` on `/editor/[roomId]` → `EditorLayout` → `SimulationSidebar` → `AiSpecsTab`; `GET /api/projects/[projectId]/specs` + `GET .../specs/[specId]` (JSON markdown, no blob URLs in payloads); shared `src/lib/specs-api.ts`; `SpecPreviewDialog` + `MarkdownPreview` (DialogShell `bg-black/80 backdrop-blur-sm`, `max-h-[70vh]` scroll); list rows `trace_ai_playbook_[id].md` + localized dates; download via `<a href="/api/projects/.../download">` on list + modal; `npm run build` passes



## In Progress



- None



## Next Up



- Service panel option forms and canvas node health/degraded visuals

- Configure `BLOB_READ_WRITE_TOKEN` in `.env.local` for canvas autosave in dev/prod




## Open Questions



- [Any unresolved product or technical decisions]



## Architecture Decisions



- Editor shell uses `h-screen` flex column: fixed `h-14` navbar, `flex-1 min-h-0` row for sidebars + canvas so panels fill remaining viewport height and align to the navbar bottom edge

- Dialog overlay/content styling lives in `src/components/editor/dialog-shell.tsx` so `src/components/ui/dialog.tsx` stays untouched per design-system rules; project modals pass `overlayClassName` for `bg-black/80 backdrop-blur-sm`

- Editor project lists are server-fetched in `editor/layout.tsx` via `listEditorProjectsForCurrentUser` (React `cache`); client mutations use `use-project-actions.ts` + `router.refresh()` / `router.push()`

- Active workspace is selected by URL `/editor/[roomId]` (project id or `canvasJsonPath`); home splash at `/editor` when no project segment; unauthorized or missing projects render full-page `AccessDenied` outside the editor shell

- Server-side room access is enforced in `src/lib/project-access.ts` before `EditorLayout` mounts on `/editor/[roomId]` and again in `POST /api/liveblocks-auth` before WebSocket sessions are issued

- Collaborator invites store email in `ProjectCollaborator` and send a Resend email with workspace link; display names and avatars resolve at read time via Clerk Backend API (no extra local profile sync table)

- Project CRUD lives in `src/app/api/projects/` (route handlers), shared guards in `src/lib/projects-api.ts`; collaborator routes in `src/lib/collaborators-api.ts`

- `canvasJsonPath` and Liveblocks room id share the same slugified name + 4-char suffix from `generateProjectRoomId`

- Liveblocks types live in `src/liveblocks.config.ts`; server client + palette in `src/lib/liveblocks.ts`; presence colors use CSS variables `--user-color-1`…`8` on dark `--bg-base`

- Collaborative canvas lives in `src/components/canvas/`; `CanvasProvider` wraps workspace main on `/editor/[roomId]` with Liveblocks room id = `workspaceProject.slug` (`canvasJsonPath`); React Flow state syncs via `@liveblocks/react-flow` `useLiveblocksFlow` into optional `Storage.flow` LiveMap (created on first connect)

- Infrastructure palette drag uses JSON payload MIME `application/trace-infrastructure-node`; drops call `onNodesChange([{ type: "add", item }])` so nodes sync through Liveblocks storage to all peers

- Canvas node visuals live in `src/components/canvas/nodes/` (`trace-node.tsx`, `infrastructure-shapes.tsx`, `drag-ghost.ts`, `trace-node-label-editor.tsx`, `use-trace-node-mutations.ts`); drag previews mirror per-type default dimensions from `INFRASTRUCTURE_NODE_DEFINITIONS`

- Node resize uses `@xyflow/react` `NodeResizer` (min 140×50); label edits mutate `flow.nodes[id].data.label` via Liveblocks `useMutation` for realtime multi-user sync

- Node cluster colors use predefined `NodeColorPair` tokens (`default`, `blue`, `purple`, `amber`); `TraceNodeColorToolbar` updates `flow.nodes[id].data.colorPair` via Liveblocks; missing/invalid values resolve to `default`

- Canvas edges use type `traceEdge` rendered by `OrthogonalTrafficEdge` (`getSmoothStepPath`, orthogonal routing); protocol labels live on `flow.edges[id].data.label` via `useUpdateTraceEdgeLabel`; new connections inherit `defaultEdgeOptions` (arrow marker + empty label)

- Trace nodes expose four cardinal handles (top/left target, bottom/right source) hidden until node hover; `ConnectionMode.Loose` allows cross-port wiring

- Canvas ergonomics: `CanvasControls` + `CanvasKeyboardShortcuts` live inside `<ReactFlow>` as leaf children (safe `useReactFlow` usage); zoom/fit use `{ duration: 200 }`; undo/redo use Liveblocks `useUndo`/`useRedo` with `useCanUndo`/`useCanRedo` for disabled UI; global hotkeys gated away from text fields via `use-keyboard-shortcuts.ts`

- Starter templates: static `STARTER_TEMPLATES` in `src/components/editor/starter-templates.ts`; import replaces all `flow` nodes/edges through Liveblocks `onDelete` + add changes (`use-import-starter-template.ts`); modal + SVG previews in `starter-templates-modal.tsx` / `starter-template-preview.tsx`; `CanvasProvider` wraps the full editor workspace on `/editor/[roomId]` so navbar can open the template dialog inside the active room

- Canvas presence: `PresenceBar` overlays the canvas viewport (`absolute top-4 right-4`); current user excluded from Liveblocks avatar stack and shown only via Clerk `UserButton`; collaborator avatars are display-only with `+N` overflow; `CanvasPeerCursors` tracks pointers on React Flow `domNode`, stores `{ cursor: { x, y } } | null` in flow coordinates, and renders peer SVG cursors with name badges (custom implementation, not `@liveblocks/react-flow` `Cursors`, to avoid StoreUpdater loop — see session notes)

- AI sidebar: `SimulationSidebar` is a thin shell; tab UI lives in `src/components/editor/ai-sidebar/` with local React state only (mock user/assistant messages, no streaming routes or Liveblocks mutations yet); dismiss uses `onClose` prop without changing navbar Flame toggle behavior

- Canvas persistence: collaborative state stays in Liveblocks; debounced snapshots (`use-canvas-autosave.ts`, 5s idle) write nodes/edges JSON to Vercel Blob via `PUT /api/projects/[projectId]/canvas`; `Project.canvasBlobUrl` stores the HTTPS pointer only; `GET` hydrates empty rooms once (`use-canvas-hydration.ts` wired in `TraceCanvasInner` only — one `useLiveblocksFlow` per room) without clobbering active peer edits; save status UI in navbar center via `CanvasSaveStatus` + `canvas-save-context.tsx`

- AI design pipeline: `chaosAgentTask` (`trigger/chaos-agent.ts`) triggered from `POST /api/ai/design`; reads live `flow` from Liveblocks `getStorageDocument` (JSON); structured mutations via `generateObject` + `src/lib/chaos-agent/canvas-mutation-schema.ts`; applies changes with `@liveblocks/react-flow/node` `mutateFlow`; broadcasts `ai-agent` presence (`setPresence`) and `agentActivity` LiveList; `finally` clears presence locks; `TaskRun` maps Trigger `runId` → `projectId` + initiating Clerk `userId`; `POST /api/ai/design/token` issues read-scoped public tokens only when `TaskRun.userId` matches session; routes under `/api/ai/*` use Clerk `auth.protect()` without session cookie stripping (unlike `/api/simulation` / `/api/trigger`)

- Chaos agent storage: `Storage.agentActivity` (`LiveList<string>`) legacy milestones; `Storage.aiStatusMessages` (`LiveList<AIStatusMessage>`) validated status stream (sidebar shows latest entry only); `CHAOS_AGENT_USER_ID` (`ai-agent`) for headless presence; helpers in `src/lib/chaos-agent/liveblocks-chaos.ts`

- AI presence UI: `useRoomIsThinking` aggregates any peer `presence.isThinking`; chaos prompt locks while thinking; cursor/name-badge and avatar stack micro-spinners in `canvas-cursors.tsx` and `presence-bar.tsx`

- Workspace chat: `Storage.aiChatMessages` (`LiveList<AIChatMessage>`) is room-scoped operator chat only; `aiStatusMessages` remains AI progress metrics; client push via `usePushAiChatMessage`; Zod validation on read (`parseAiChatMessages`) and write; local user bubbles right-aligned (blue), remote/assistant left (zinc); Enter sends chat only; `Inject Chaos` also dispatches `POST /api/ai/design` and tracks the run in `SimulationSidebar`

- Design agent UI: `SimulationSidebar` stores `{ runId, publicToken }`, subscribes with `useRealtimeRun`, and tears down on completion; `POST /api/ai/design` returns scoped `publicToken` alongside `runId`; architect tab shows latest `aiStatusMessages` ribbon only while a run is active; no client-side React Flow mutation from the sidebar

- Spec generation pipeline: `generateSpecTask` (`trigger/generate-spec.ts`) triggered from `POST /api/ai/spec` with canvas `nodes`/`edges` + `chatHistory` payload; server resolves `projectId` from `roomId` only; `POST /api/ai/spec/token` mints read-scoped public tokens (1h TTL) when `TaskRun.userId` matches session; task streams `metadata.status` / `metadata.completionPercent` for client hooks; on completion archives Markdown to Vercel Blob and inserts `ProjectSpec` (blob URL in `filePath` only, not Postgres body text)

- Spec persistence & download: `ProjectSpec` links `projectId` → Blob HTTPS URL; `archiveProjectSpec` in `src/lib/spec-persistence.ts`; gated download at `GET /api/projects/[projectId]/specs/[specId]/download` (never expose raw blob URLs to clients in API JSON)

- Spec UI: `listProjectSpecsForProject` (RSC cache) hydrates `AiSpecsTab`; preview via `GET /api/projects/[projectId]/specs/[specId]`; list via `GET /api/projects/[projectId]/specs`; helpers in `src/lib/specs-api.ts`; `SpecPreviewDialog` + `MarkdownPreview` in `src/components/editor/ai-sidebar/`; downloads use gated `/download` route only

- Persistent database: Supabase PostgreSQL only, accessed via Prisma (`DATABASE_URL` + `DIRECT_URL` session/transaction poolers on IPv4)

- Prisma client lives at `src/lib/prisma.ts`; Clerk user sync in `src/server/actions/sync-clerk-user.ts`

- App routes live under `src/app/`; Clerk proxy in `src/proxy.ts` (not `middleware.ts`)

- Public routes use `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` when set, with `/sign-in` and `/sign-up` fallbacks



## Session Notes

- **Never wrap `<TraceCanvas />` (or anything that mounts `<ReactFlow>`) in `<Suspense>` / `<ClientSideSuspense>`.** React 19's Suspense reappear pass re-fires layout effects with mount semantics on every fiber inside the suspended subtree. `@xyflow/react`'s `<StoreUpdater>` writes to its Zustand store inside a mount layout effect, and the resulting zustand → forceStoreRerender → re-commit → mount-effect-again cycle exhausts React's `Maximum update depth` counter (see `context/current-issues.md`). Use `useLiveblocksFlow({ suspense: false })` and gate the `<ReactFlow>` mount on `result.isLoading` instead.

- `CanvasProvider` imports `LiveblocksProvider` / `RoomProvider` from `@liveblocks/react` (not `/suspense`) and renders `<TraceCanvas />` directly without any suspense wrapper.

- `TraceCanvasInner` keeps the last non-null `nodes` / `edges` arrays in refs (`lastNodesRef`, `lastEdgesRef`) so the very first `<ReactFlow>` mount sees stable, non-null arrays.

- All custom node and edge types passed to `<ReactFlow>` must be defined as module-scope constants (`traceNodeTypes`, `traceEdgeTypes`) — never inline literals. Per xyflow's `error002`, inline `nodeTypes`/`edgeTypes` objects force internal recomputation and trigger update loops. Same applies to `proOptions`.

- Do not call `useReactFlow()` inside `TraceCanvasInner` — it subscribes to the xyflow zustand store (`useStore((s) => !!s.panZoom)`) and re-renders the canvas on store updates, which can chain into a StoreUpdater feedback loop. Use `useStoreApi()` + `pointToFlowPosition` from `src/lib/canvas/screen-to-flow.ts` for screen→flow math.

- Peer cursors use custom `CanvasPeerCursors` (not `@liveblocks/react-flow` `Cursors`) to avoid the StoreUpdater / Suspense update loop documented in `current-issues.md`.



- Home (`/`) redirects authenticated users to `/editor` and others to `/sign-in`

- Webhook sync requires `CLERK_WEBHOOK_SIGNING_SECRET` and `DATABASE_URL`; Liveblocks auth requires `LIVEBLOCKS_SECRET_KEY`

- Supabase pooler blocks Prisma advisory locks: use `npm run db:push` for schema sync; if `db:migrate:deploy` hits P1002, run `npm run db:unlock-migrate` then retry, or sync history via `scripts/sql/mark-add-projects-applied.sql`

- Do not wrap `DATABASE_URL` / `DIRECT_URL` in quotes in `.env.local`

- Clerk users are upserted on demand via `ensureClerkUserInDatabase` when webhooks lag in local dev (fixes `projects_owner_id_fkey` on project create)

- Remote Postgres TLS: `src/lib/pg-pool-config.ts` relaxes cert verification for Supabase unless `DATABASE_SSL_REJECT_UNAUTHORIZED=true` (fixes Windows self-signed chain errors)

- Share invites require `RESEND_API_KEY` in `.env.local`; optional `RESEND_FROM_EMAIL` (verified domain) and `NEXT_PUBLIC_APP_URL` for production invite links

