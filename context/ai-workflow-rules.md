# AI Workflow Rules

## Approach

Build Trace AI incrementally using a strict, spec-driven workflow. Context files dictate the system's exact structure, feature scope, and implementation progress. Implement strictly against these specified rules—never guess, infer, or invent behavior outside of what is explicitly documented.

## Scoping Rules

- Work on exactly one feature unit at a time.
- Prefer small, verifiable increments over large, speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.
- Test and verify each increment immediately before writing more code.

## When to Split Work

Split an implementation step if it combines:

- Frontend UI layout changes and backend database schema migrations.
- Liveblocks real-time synchronization logic and AI streaming engine API endpoints.
- Feature requirements or behaviors not explicitly defined in the context files.

If a change cannot be verified end-to-end within 15 minutes, the scope is too broad—split it.

## Handling Missing Requirements

- Do not invent application behavior or product features not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in  `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- src/components/ui/* — Generated shadcn/ui library components.
- node_modules/* — Any third-party library internals.
- .next/* — Next.js build directories and generated configurations.

## Keeping Docs in Sync

Update the relevant context file whenever implementation
changes:

- System architecture, folder boundaries, or data flow paths.
- Database schema or Redis storage model decisions.
- Code conventions, type definitions, or tech stack standards.
- Overall feature scope or simulation rules.

## Before Moving to the Next Unit

1. The current unit works end-to-end within its defined scope.
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. npm run build and npm run lint both pass without errors.
