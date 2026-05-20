## Node Color Adjustments & Color Toolbar

## Goal
Add an interactive, floating color toolbar that appears above selected nodes, enabling teams to change both background and text color pairs directly on the canvas. This allows collaborators to visually categorize microservices (e.g., color-coding an auth cluster versus database clusters) [1] without requiring server calls, using our synchronized real-time state.

1. Color Palette Matrix Definition

To keep the dashboard interface clean, the color options must use highly deliberate, pre-defined pairs that contrast perfectly against our deep dark background (--bg-base). Add these color pair tokens to src/types/canvas.ts or reuse your established theme configuration:

Palette Role Node Background Token Coordinated Text Token Design Intent Default bg-zinc-900/50 border-zinc-700 text-zinc-100 Standard core services Blue Cluster bg-blue-950/40 border-blue-500/50 text-blue-200 Ingestion & Edge Gateways Purple Cluster bg-purple-950/40 border-purple-500/50 text-purple-200 Compute & Core Logic layers Amber Cluster bg-amber-950/40 border-amber-500/50 text-amber-200 Queues & Streaming channels

2. Floating Contextual Toolbar (<NodeToolbar />)

Incorporate the native React Flow <NodeToolbar /> component inside your custom canvas node structure (src/components/canvas/nodes/trace-node.tsx):

- Conditional Triggering: Display the panel strictly when the individual node component is selected (selected === true) and no inline text editing is active.
- Precise Alignment: Position the panel roughly 12px directly above the node's top edge boundary, avoiding overlap with custom connection port handles.
- Swatch Interface: Render a row of small, clickable circle color swatches (h-5 w-5 rounded-full) wrapped inside a glassmorphism container (bg-zinc-900/90 border border-zinc-800 p-1.5 shadow-xl rounded-md).

- Visual Interactions:
    - Active Indicator: Add an explicit ring outline (ring-2 ring-offset-2 ring-offset-zinc-950 ring-blue-500) to the active swatch.
    - Controlled Glow Hover: Hovering over a color option emits a tight, controlled outer glow footprint matching its coordinated text accent color.
- Event Traversal Isolation: Apply e.stopPropagation() and className="nodrag nopan" to the toolbar frame wrapper. This ensures that picking colors never accidentally drags the underlying node or moves the infinite React Flow canvas field.
.

3. Real-Time Storage Update & UI Reflections

Bind the color swatch selection action directly to the Liveblocks LiveMap mutation thread:

- State Updates: Selecting a swatch updates the target node's colorPair key inside its data object profile.

- Instant Updates: The custom node renderer dynamically assigns the mapped Tailwind custom property background, border, and text utilities based on this value. This ensures real-time color transitions across all connected collaborator viewports with zero layout shifts.

Scope Limits

To preserve incremental scoping rules:

- Do not change drag-and-drop ingestion behaviors.

- Do not replace our strict color matrix with an unconstrained color picker wheel.

- Do not tie color changes to server endpoints or persistent REST calls yet.
.
## Check When Done

- The contextual color selection toolbar opens cleanly right above a node component upon selection.

- Color swatches display clean hover glows and accurate ring highlights on active choices.

- Swatch clicks seamlessly isolate pointer signals, preventing canvas panning or element displacement.

- Selected nodes update their background color and text accents immediately across all room browsers.The layout builds cleanly (npm run build) without broken type constraints or linter complaints.