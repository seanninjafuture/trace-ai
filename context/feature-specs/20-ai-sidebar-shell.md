## AI Chat Sidebar UI Component

## Goal

Complete the existing AI sidebar placeholder by transforming it into a high-utility, floating chat and documentation workspace. The sidebar leverages your established dark cloud-ops theme tokens, introduces clean contextual sub-tabs for architectural text prompt injection and Markdown specification generation previews, and uses completely isolated mock states before hooking into live backend streaming channels.

1. Structural Perimeter Layout (src/components/editor/simulation-sidebar.tsx)

Separate the AI panel into its own isolated layout component. Do not touch or refactor the top header navigation toggles or parent open/close context variables.

- Floating Enclosure Rules: Preserve the fixed width layout pattern (w-80) and right-anchored floating position. Wrap the shell in a glassmorphic operational skin (bg-[var(--bg-surface)] border-l border-[var(--border-default)] shadow-2xl h-[calc(100vh-3.5rem)]).

- Header Section:Primary Text: Title reads AI Workspace using the --text-primary token.Sub-header Text: Subtitle reads Collaborate with Trace AI using the --text-muted design token.Visual Indicators: Place a small vector Bot icon on the left margin, balanced by an explicit right-aligned X or PanelRightClose button to dismiss the overlay view.

2. Shared Workspace Controls (Tabs Partitioning)

Embed a responsive shadcn/ui Tabs layout container using an absolute grid grid-cols-2 scaling layout block.

- AI Architect Tab Trigger: Houses the failure trigger engine and real-time prompt chat history interface.

- Specs Tab Trigger: Houses the automated incident post-mortem markdown playbook generation utilities.

- Theme Styling Guard: Active tabs must utilize your primary glow style variables (bg-[var(--accent-primary)] text-zinc-950 font-medium). Inactive selections remain dimmed (text-[var(--text-muted)] hover:text-[var(--text-primary)]).

3. The AI Architect Console

Build a self-contained chat zone inside the primary workspace tab container. Ensure text elements use standard sizing variables:

- Scroll-Locked Dialogue Viewport (ScrollArea): Stretches to fill available height boundaries.

- Empty Baseline Indicator Layer: When no text nodes occupy the message history array, render a centered bot canvas graphic accompanied by three soft pill-shaped interactive shortcut prompt chips:"Inject standard e-commerce DB outage""Simulate 10x traffic spike on API""Trigger message queue replication failure"Aesthetic: Soft charcoal capsules (bg-zinc-900 border border-zinc-800 text-[var(--text-muted)] text-[12px] px-2.5 py-1 rounded-full hover:border-[var(--accent-primary)] cursor-pointer).

- Message Bubble Layout Formats:User Input Blocks: Right-aligned, utilizing a distinctive dark blue core (bg-blue-950/40 border border-blue-500/30 text-[var(--text-primary)] rounded-l-lg rounded-tr-lg p-3 text-sm maxWidth-[85%]).Trace AI Bot Responses: Left-aligned, utilizing a clean charcoal surface (bg-zinc-900/60 border border-[var(--border-default)] text-[var(--text-primary)] rounded-r-lg rounded-tl-lg p-3 text-sm maxWidth-[85%]).

## Text Entry Form Interaction Matrix

- Use a flexible, auto-scaling Textarea input field anchored to the lowest panel tier. Enforce rigid vertical expansion constraints (min-h-[72px] max-h-[160px] overflow-y-auto bg-zinc-950 border border-[var(--border-default)] text-sm rounded-md p-2).

- Embed a prominent "Inject Chaos" submission button on the inside right gutter using your action token accent styling (bg-[var(--accent-primary)] text-white hover:opacity-90).

- Hotkey Submission Invariant: Pressing Enter alone must instantly capture state parameters and submit the form string. Pressing Shift + Enter safely appends a standard newline break without executing submission handlers.

4. The Technical Specs & Playbook Viewer

Build the secondary workspace console tab pane to host markdown generation previews and automated technical documentation.

- Primary Execution Trigger: Feature a prominent button spanning 100% width labeled "Generate Incident Spec File", styled with a high-visibility Sparkles icon wrapper.

- Static Blueprint Snapshot Card: Below the trigger button, render a mock preview block illustrating a compiled playbook summary layout:Container Skin: Glass background card (bg-zinc-900/40 border border-[var(--border-default)] p-3 rounded-lg).Inner Architecture: Display a vector FileText markdown icon, a file heading reading "post_mortem_simulation_latest.md", and a code snippet block displaying text output approximations:markdown# Incident Spec Report
- Blast Radius: 3 Microservices Impacted
- Core Outage: database_primary (100% Loss)
Use code with caution.Download Action Anchor: Provide a lower action link row button showing a Download icon. Keep this button disabled and greyed out for this layout milestone until real data generation APIs are wired in upcoming units.

## Scope Limits

To protect system boundaries and unit verification rules:

- Do not write streaming backend API route handlers or integrate Vercel AI SDK route code yet.

- Do not bind active Liveblocks state listeners or manipulate central node schemas.

- Keep this unit strictly locked down to building out the user interface views and tab containers within the right-hand panel.

## Check When Done

- The AI control sidebar components are refactored cleanly into their own module layout files.

- Sub-tabs gracefully switch layout focus between the failure entry screen and document card views without moving adjacent canvas elements.

- User and assistant dialogue elements format correctly with isolated right and left boundary grid alignments.

- Key capture handlers accurately differentiate between single Enter submissions and Shift + Enter text padding rules.

- The entire system workspace builds correctly (npm run build) with zero broken type expressions.