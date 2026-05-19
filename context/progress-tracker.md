# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Project REST APIs complete; ready to wire editor UI to Prisma

## Current Goal

- Replace mock project data in `use-project-dialogs` with `/api/projects` calls; then flow canvas

## Completed

- `feature-specs/01-design-system.md` — shadcn/ui in `src/components/ui/`; `src/lib/utils.ts` (`cn()`); `tailwind.config.ts` + `@theme` utilities for design tokens; Button, Card, Dialog, Input, Textarea, Tabs, ScrollArea, Badge; `lucide-react`; dark-only tokens in `app/globals.css`; `html.dark` on root layout
- `feature-specs/02-editor.md` — `EditorNavbar`, `NodeSidebar`, `SimulationSidebar`, `EditorLayout` (full-viewport shell + canvas placeholder), `DialogShell` (standardized modal wrapper styles; no concrete modals yet)
- `feature-specs/03-auth.md` — Clerk `ClerkProvider` with `@clerk/ui` dark theme + app CSS variables; `proxy.ts` protected-first routing; `/sign-in` and `/sign-up` two-panel auth pages; `/` redirects; `/editor` workspace; `UserButton` in navbar; Clerk webhook → Prisma user sync; Liveblocks auth route; session cookie stripping for background/simulation API paths
- `feature-specs/04-project-dialogs.md` — editor home splash when no project loaded; create/rename/delete dialogs (`DialogShell` + `bg-black/80 backdrop-blur-sm`); project sidebar (My Projects / Shared) with owned-only rename/delete menus; mobile scrim + outside-tap close; `use-project-dialogs` + `EditorWorkspaceProvider` (mock data only)
- `feature-specs/05-prisma.md` — `Project` + `ProjectCollaborator` models with cascade deletes, unique compound constraint, and indexes; `User.projects` relation; `src/lib/prisma.ts` singleton (Accelerate when `prisma+postgres://`, else `@prisma/adapter-pg` + `pg`); migrations `init_users` + `add_projects` applied to Supabase; `npm run build` passes
- `feature-specs/06-project-apis.md` — `GET`/`POST` `/api/projects`, `PATCH`/`DELETE` `/api/projects/[projectId]`; Clerk `auth()` 401 gate; owner-only mutation 403 gate; GET lists owned + collaborator projects by user id/email; POST defaults name to Untitled Project, status `DRAFT`; helpers in `src/lib/projects-api.ts`

## In Progress

- None

## Next Up

- Wire `use-project-dialogs` / `EditorWorkspaceProvider` to `/api/projects` (replace `src/lib/mock-projects.ts`)
- Flow canvas / node graph

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- Editor shell uses `h-screen` flex column: fixed `h-14` navbar, `flex-1 min-h-0` row for sidebars + canvas so panels fill remaining viewport height and align to the navbar bottom edge
- Dialog overlay/content styling lives in `src/components/editor/dialog-shell.tsx` so `src/components/ui/dialog.tsx` stays untouched per design-system rules; project modals pass `overlayClassName` for `bg-black/80 backdrop-blur-sm`
- Project workspace UI is mock-only until client hooks call `/api/projects`: `use-project-dialogs.ts` + `src/lib/mock-projects.ts`
- Project CRUD lives in `src/app/api/projects/` (route handlers), shared guards in `src/lib/projects-api.ts`
- Persistent database: Supabase PostgreSQL only, accessed via Prisma (`DATABASE_URL` + `DIRECT_URL` session/transaction poolers on IPv4)
- Prisma client lives at `src/lib/prisma.ts`; Clerk user sync in `src/server/actions/sync-clerk-user.ts`
- App routes live under `src/app/`; Clerk proxy in `src/proxy.ts` (not `middleware.ts`)
- Public routes use `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` when set, with `/sign-in` and `/sign-up` fallbacks

## Session Notes

- Home (`/`) redirects authenticated users to `/editor` and others to `/sign-in`
- Webhook sync requires `CLERK_WEBHOOK_SIGNING_SECRET` and `DATABASE_URL`; Liveblocks auth requires `LIVEBLOCKS_SECRET_KEY`
- Supabase pooler blocks Prisma advisory locks: use `npm run db:push` for schema sync; if `db:migrate:deploy` hits P1002, run `npm run db:unlock-migrate` then retry, or sync history via `scripts/sql/mark-add-projects-applied.sql`
- Do not wrap `DATABASE_URL` / `DIRECT_URL` in quotes in `.env.local`
