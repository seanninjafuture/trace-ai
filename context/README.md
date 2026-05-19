# Project context (single source of truth)

All Six-File context for **ghost-ai** lives in this folder only.

| File | Purpose |
|------|---------|
| `project-overview.md` | Product scope and goals |
| `architecture-context.md` | Stack, boundaries, storage, invariants |
| `ui-context.md` | Theme, tokens, component conventions |
| `code-standards.md` | Implementation rules |
| `ai-workflow-rules.md` | Spec-driven workflow and scoping |
| `progress-tracker.md` | Phase, completed work, next steps |
| `current-issues.md` | Open PR/review notes and known issues |
| `feature-specs/*.md` | Per-feature implementation specs |

Agents: read these paths via `@context/...` from the **ghost-ai** workspace root. Do not maintain a second copy under the Six-File methodology templates folder.
