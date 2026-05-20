## Architectural Shape Rendering & Drag Preview

## Goal

Replace the placeholder rectangle node renderer with specialized infrastructure shape profiles and a visual drag ghost preview. This layer uses responsive CSS and scaling SVGs to match Trace AI's dark cloud-ops dashboard theme, ensuring that components visually reflect their underlying architectural type while attached to the operator's cursor during creation.

1. Node Profile Styling & SVG Composites

Update the custom component renderer (src/components/canvas/nodes/trace-node.tsx) to apply custom visual treatments based on the node's type primitive definition:

CSS-Driven Layer Forms

- Gateway / Load Balancer (gateway): Wide, flat pill layout profile using a high border radius scale (rounded-full) accompanied by a subtle double-ring border offset.

- Compute Service / API (compute): A structured grid card with small rounded edges (rounded-md).

SVG Scaling Enclosures

- Data Store / Database (database): A 3D-perspective structural cylinder SVG mask. The path layout must anchor top and bottom curvature vectors that stretch cleanly to mirror parent container sizing parameters.

- Message Queue (queue): A distinct horizontal hexagonal flow capsule vector shell.


Interactive State States

- Subtle Rest Style: Thin borders utilizing --border-default and a dark, semi-translucent glass fill (bg-zinc-950/40 backdrop-blur-md).

- Collaborative Edit Focus: When selected locally or locked by a peer (activeNodeId), scale border thickness to 2px and shift stroke colors to our glowing accent token (--accent-primary).

2. Real-Time HTML5 Drag Preview

Implement a ghost preview that follows the user's cursor across the infinite canvas field before a component is explicitly instantiated in storage:

- Ghost Element Element Mount: Generate a transient, floating pointer element inside your drag state controller (src/components/editor/node-sidebar.tsx).

- Drag Event Configuration: In the element's onDragStart handler, use the native e.dataTransfer.setDragImage configuration. Bind it to an off-screen HTML canvas layout snippet or a customized glassmorphism micro-card matching the targeted service shape.

- Scale Alignment: Ensure the ghost frame mirrors the exact pixel width and height constraints defined for that architectural block (e.g., matching the 150px \(\times \) 90px dimensions for the database cylinder).

- Teardown Loop: Automatically unmount or hide the ghost overlay when catching the native onDragEnd or onDrop lifecycle events.

3. Storage Context Preservation

All shape rendering modules must hook directly into the live Liveblocks-synced TraceNodeData payload definition. Changing shape configurations must read directly from the collaborative canvas LiveMap data array without interrupting active WebSocket room synchronization threads.

## Scope Limits

To protect development speed and unit testing rules:

- Do not alter how dropped node properties are generated or append new status variables yet.

- Do not integrate layout side panels for inline title/label text editing yet.

- Do not write interactive vertex resize node edge anchors.

## Check When Done

- Canvas components visually render their correct shape archetype based on their structural infrastructure type.

- CSS geometry maps properly for gateway pills and compute rectangle profiles.

- Database cylinder and queue hexagon models utilize scaling inline SVGs that stretch to fit boundaries perfectly.

- Dragging an item from the sidebar hooks a floating preview shadow directly to the user's mouse layout point.

- Production builds execute successfully (npm run build) without broken typing schemas or layout script failures.