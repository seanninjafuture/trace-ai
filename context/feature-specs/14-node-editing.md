## Inline Node Mutations & Property Configurations

## Goal

Add multi-user resizing engines and inline double-click label text editors to all active layout components. These configuration modifications allow teams to customize their microservice topologies, prevent layout disruptions across client viewports, and stream graph changes directly through Liveblocks storage.

1. Matrix Resizing Controls (@xyflow/react NodeResizer)

Integrate the native React Flow <NodeResizer /> component directly inside your custom canvas node wrapper (src/components/canvas/nodes/trace-node.tsx):

- Conditional Triggering: Render resize handles strictly when the local operator selects the node, provided it is not locked by a peer (peer.presence.activeNodeId !== node.id).

- Aesthetic Integration: Style the bounding box handle vertices as subtle, 6px minimalist dark slate squares (bg-zinc-800 border border-zinc-600 rounded-sm) that blend into the dashboard UI.

- Dimensions Safeguard Invariant: Enforce strict minimum boundaries inside the resizer properties to prevent text truncation:
    - Minimum Width: 140px
    - Minimum Height: 50px
    
- Storage Synchronization: Bind the onResize or onResizeEnd event callbacks to update the node's width and height inside the Liveblocks collaborative LiveMap array.

2. In-Place Double-Click Typography Editor

Replace static label text blocks with a dynamic, overlay inline form input component:

- Activation Trigger: Double-clicking (onDoubleClick) anywhere over the central area of an infrastructure node replaces the text element with an interactive, borderless Textarea card container.

- Layout Shift Prevention: Mirror the exact bounding dimension styles, alignment configurations, and typography rules of the underlying label layer to ensure smooth transitions without moving adjacent canvas items.

- Event Traversal Isolation: Stop event propagation (e.stopPropagation()) on key actions like onPointerDown, onKeyDown, and dragging inside the textarea block. This ensures that typing characters does not accidentally pan or drag the infinite React Flow canvas surface.

- Input Management Loop:

    - Live Streaming Updates: Mutate the Liveblocks storage state node label field instantly on every keypress (onChange).
    - Graceful Text Placeholders: If the string input is cleared entirely, render a centered, low-opacity placeholder reading "Enter service name...".
    - Teardown Gating: Automatically commit changes, exit the editing view, and restore regular pointer layouts upon a form onBlur event or when hitting the Escape key.

3. Scope Limits
To safeguard incremental development steps:

- Do not alter the preset SVG infrastructure shapes or visual component color paths.

- Do not modify sidebar dragging palette configurations or node drop position mappings.

- Do not add custom inspection forms inside the right-hand simulation toolbar panel yet.

## Check When Done

- Selecting a system component displays minimalist boundary resize points that respect minimum scale rules.
- Double-clicking a component converts the label text into an adjustable typography field instantly.
- Text entry operations are fully isolated, allowing normal typing without triggering background canvas dragging or panning.
- Text modifications mirror changes immediately across all peer browser windows in the workspace room.

- Codebases pass full compilation metrics (npm run build) without broken type properties or linter alerts.