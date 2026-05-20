# Progress Tracker



Update this file after every meaningful implementation change.



## Current Phase



- Base collaborative React Flow canvas complete; ready for node palette and simulation



## Current Goal



- Node palette drag-and-drop and service panel forms (deferred from base canvas scope)



## Completed



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



## In Progress



- None



## Next Up



- Node palette (drag-and-drop infrastructure nodes onto canvas)

- Service panel option forms and AI chaos prompt routing



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

- Persistent database: Supabase PostgreSQL only, accessed via Prisma (`DATABASE_URL` + `DIRECT_URL` session/transaction poolers on IPv4)

- Prisma client lives at `src/lib/prisma.ts`; Clerk user sync in `src/server/actions/sync-clerk-user.ts`

- App routes live under `src/app/`; Clerk proxy in `src/proxy.ts` (not `middleware.ts`)

- Public routes use `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` when set, with `/sign-in` and `/sign-up` fallbacks



## Session Notes



- Home (`/`) redirects authenticated users to `/editor` and others to `/sign-in`

- Webhook sync requires `CLERK_WEBHOOK_SIGNING_SECRET` and `DATABASE_URL`; Liveblocks auth requires `LIVEBLOCKS_SECRET_KEY`

- Supabase pooler blocks Prisma advisory locks: use `npm run db:push` for schema sync; if `db:migrate:deploy` hits P1002, run `npm run db:unlock-migrate` then retry, or sync history via `scripts/sql/mark-add-projects-applied.sql`

- Do not wrap `DATABASE_URL` / `DIRECT_URL` in quotes in `.env.local`

- Clerk users are upserted on demand via `ensureClerkUserInDatabase` when webhooks lag in local dev (fixes `projects_owner_id_fkey` on project create)

- Remote Postgres TLS: `src/lib/pg-pool-config.ts` relaxes cert verification for Supabase unless `DATABASE_SSL_REJECT_UNAUTHORIZED=true` (fixes Windows self-signed chain errors)

- Share invites require `RESEND_API_KEY` in `.env.local`; optional `RESEND_FROM_EMAIL` (verified domain) and `NEXT_PUBLIC_APP_URL` for production invite links

