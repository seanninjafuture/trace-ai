# UI Context

## Theme

Dark mode only. No light mode option is provided. The visual language mimics a high-performance terminal or cloud operations dashboard—featuring deep near-black backdrops, slightly elevated charcoal control panels, and glowing neon indicators to represent data packets, system errors, and healthy infrastructure lines.

## Colors

All layout components must use these functional CSS custom property tokens. Hardcoded hexadecimal color assignments are strictly forbidden.

| Role            | CSS Variable       | Value    |
| --------------- | ------------------ | -------- |
| Page background | `--bg-base`        | `#09090b` |
| Surface         | `--bg-surface`     | `#18181b` |
| Primary text    | `--text-primary`   | `#f4f4f5` |
| Muted text      | `--text-muted`     | `#a1a1aa` |
| Primary accent  | `--accent-primary` | `#3b82f6` |
| Border          | `--border-default` | `#27272a` |
| Error/Outage           | `--state-error`    | `#ef4444` |
| Success/Healthy         | `--state-success`  | `#22c55e` |
| Warning / Degraded         | `--state-warning`  | `#f59e0b` |

## Typography

| Role      | Font              | Variable      |
| --------- | ----------------- | ------------- |
| UI text   | Inter / Geist Sans | `--font-sans` |
| Code / Data / Mono | Fira Code / Geist Mono | `--font-mono` |

## Border Radius

| Context           | Class            |
| ----------------- | ---------------- |
| Inline elements (Badges, small buttons) | `rounded-md (0.375rem)` |
| Cards / Side panels / Node blocks    | `rounded-lg (0.5rem)` |
| Dialog windows / Overlays | `rounded-xl (0.75rem)` |

## Component Library

Built using shadcn/ui primitives sitting directly on top of Tailwind CSS. Component atoms reside inside src/components/ui/. Use the shadcn CLI tool to initialize or drop in new layout structures rather than writing base primitives from scratch.

## Layout Patterns

- Simulation Workspace: Full viewport layout containing a fixed top navbar, left node-palette sidebar, centered infinite flow canvas, and right-hand AI control sidebar.
- Control Panels: Fixed 320px width dimensions anchored by strong 1px border dividers (border-default).
- Overlays / Dialogs: Strictly centered layout viewports framed by a strong background backdrop blur effect.
- Global Header: High-contrast top bar with a explicit bottom border edge to host active project names and multi-user profile avatars.

## Icons

Lucide React is the exclusive iconography provider. Use clean, vector stroke-based styles only. Maintain standard sizing patterns: h-4 w-4 for inline labels or nested lists, and h-5 w-5 for global layout action controls.
