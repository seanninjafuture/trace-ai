# Code Standards

## General

- Keep modules small, highly decoupled, and focused on a single responsibility.
- Fix root causes immediately; do not layer workarounds over structural flaws.
- Separate state synchronization (Liveblocks) completely from state processing (AI Engine).

## TypeScript

- Strict mode is required throughout the entire codebase.
- Avoid the any type completely; use explicit interfaces or strict generics.
- Validate all incoming canvas or prompt payloads at system boundaries before processing.

## Next.js 16

- Default to React Server Components (RSC) for data fetching and static layout rendering.
- Add 'use client' only at the leaf nodes where user browser interactivity requires it.
- Keep Server Actions highly focused on specific, isolated database mutations.

## Styling

- Use Tailwind utility classes combined with shadcn/ui custom CSS property tokens.
- Follow the border radius scale defined
  in `ui-context.md`

## API Routes

- Validate and parse incoming requests using a schema validator (like Zod) before running logic.
- Enforce strict authentication and workspace write-permission checks before allowing any mutation.
- Return consistent, strictly typed, JSON response shapes for all endpoint outputs.

## Data and Storage

- Structural graph layouts, node locations, and historical playbooks belong in PostgreSQL.
- Ephemeral simulation telemetry and hot WebSocket room states belong in Redis.
- Never block primary database connections with heavy, rapid-fire canvas coordinate stream writes.

## File Organization

- `src/app/` — Next.js routing pages, layouts, and server-side route definitions.
- `src/components/` — Shared, reusable UI layout atoms and interactive canvas features.
- `src/services/` — Core business logic abstractions for AI execution, parsing, and streaming.
- `src/types/` — Project-wide TypeScript interfaces, canvas schemas, and simulation types.
