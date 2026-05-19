We need the primary layout components that frame the Trace AI simulation experience—the global navigation header, the left infrastructure node palette sidebar, and the right AI simulation control layout shell.

### Global Header

Create `(src/components/editor/editor-navbar.tsx)`.

Requirements:

- Fixed-height layout container (h-14) anchored to the top of the viewport.
- Explicit bottom border styling using --border-default.
- Left section: Workspace application logo alongside a flexible title placeholder displaying the active architecture project name.
- Center section: Shared multi-user presence strip showing dummy collaborator avatars with glowing active border frames.
- Right section: A prominent "Export Playbook" action button utilizing the Download icon, disabled by default until a simulation runs.

### Infrastructure Palette Sidebar

Create `src/components/editor/node-sidebar.tsx`.

Requirements:

- Left-aligned layout panel with a explicit fixed-width sizing rule (w-64).
- Rigid 1px right border separating the panel cleanly from the central flow canvas surface.
- Sub-header title displaying "Architecture Components".
- A vertically stacked layout list of draggable architectural primitives:
    - Gateway / Load Balancer (Icon: Network)
    - Compute Service / API (Icon: Cpu)
    - Data Store / Database (Icon: Database)
    - Message Queue (Icon: GitCommit)
- Each component list item must render with its structural name, a small vector icon indicator, and custom hover states.

### Simulation Control Sidebar

Create `src/components/editor/simulation-sidebar.tsx`.

Requirements:

- Right-aligned layout panel with a explicit fixed-width sizing rule (w-80).
- Rigid 1px left border separating the workspace panel cleanly from the flow canvas surface.
- Embedded shadcn Tabs interface splitting control concerns:
    - Chaos Trigger: Contains a Textarea input field with a placeholder reading "Describe a system failure scenario..." and an interactive button labeled "Inject Chaos" using a Flame icon.
    - Live Telemetry: Displays an empty state card container styled with --bg-base with a text layer reading "No active failure simulation running."

### Dialog Design System Pattern

Ensure a standardized overlay design template is ready for modal popups across the workflow.

Requirements:

- Centered layout viewports framed by a strong background backdrop blur effect.
- Enforce structural usage constraints: A clear title header, descriptive text space, and flexible bottom action button alignments.
- Do not build actual modal views yet; standardize the wrapping styles.

### Check when done

- The structural layout panels compile cleanly with no TypeScript or lint warnings.
- Sidebars render with pixel-perfect alignment against the top navigation bar.
- Responsive dimensions safely adapt to fill out exactly 100% of the active canvas viewport height.