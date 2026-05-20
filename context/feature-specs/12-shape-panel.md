Component Palette & Canvas Injection (Node Palette)

## Goal

Add an interactive infrastructure components panel so users can drag architectural primitives (Gateways, Compute services, Databases, Message Queues) onto the React Flow canvas to expand their system layouts. This layer maps screen positions to infinite canvas grid coordinates, sets default health telemetry values, and renders custom node placeholders.

1. Architectural Component Definitions

Rather than drawing generic geometric shapes, Trace AI relies on concrete architectural building blocks. Update your dragging components to use these primitives and sensible default dimensions:

- Gateway / Load Balancer: Optimized for top-level entry mapping. Default dimensions: 200px width \(\times \) 60px height.

- Compute Service / API: Balanced square-rectangular layout box for service instances. Default dimensions: 180px width \(\times \) 80px height.

- Data Store / Database: Cylinder-style vertical block blueprint. Default dimensions: 150px width \(\times \) 90px height.

- Message Queue: Wide stream ribbon component layout. Default dimensions: 190px width \(\times \) 55px height.

2. Drag & Drop Payload Configuration

Implement native HTML5 Drag and Drop event bindings into the floating sidebar panel (src/components/editor/node-sidebar.tsx) and the main workspace canvas frame wrapper:

- Data Transfer Payload: On drag start (onDragStart), stringify and inject a structured JSON payload into the dataTransfer stream containing:
    - type: The specific InfrastructureNodeType matching the selected primitive.
    - label: A default template name string (e.g., "New API Service").
    - dimensions: Default target width and height constraints.

- Visual Transfer Shadow: Configure the element drag ghost view matching our near-black dashboard styling language.

3. Position Mapping & Node Creation Loop

Add structured onDragOver and onDrop event listener hooks directly onto the central client canvas wrapping surface:

- Drop Event Interception: Prevent default browser drop actions (e.preventDefault()). Extract the architectural payload from the event data transfer object safely using validation parsing.

- Coordinate Matrix Transformation: Read the drop event's screen-relative client position coordinates (clientX, clientY). Use React Flow's layout utility helper (screenToFlowPosition) to accurately translate the cursor's screen point into precise infinite grid coordinates.

- State Initialization Invariant: Generate the new node object initializing healthy baseline metrics. Do not add unassigned properties:

const newNode: TraceCanvasNode = {
  id: `${payload.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
  type: 'traceNode', // Use our registered custom type
  position,
  data: {
    label: `New ${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}`,
    type: payload.type,
    status: 'healthy', // All newly deployed services start healthy
    errorRate: 0,      // 0% Error rate baseline
    latency: 15,       // 15ms Baseline response speed
  }
};


- Live Storage Update: Append the new node directly into the synchronized Liveblocks storage layer to instantly broadcast its deployment out to all peer rooms.

4. Custom Foundation Component Renderer

To make injected nodes visible immediately, register a custom node component layout definition inside your React Flow entry configuration (nodeTypes = { traceNode: FoundationalNodeRenderer }):

- Temporary Blueprint Render: For this incremental milestone unit, render every dropped component as a sleek, bordered glassmorphism card frame (bg-[var(--bg-surface)] border-[var(--border-default)]).

- Port Handle Placement: Render a standard input connection handle centered neatly on the top edge, paired with an output connection handle centered on the bottom edge to support clean downstream architecture connection routing.

- Centered Text Layer: Display the data object's label string, accompanied by a small vector icon reflecting its primitive type. Advanced shape-specific visuals, glows, and real-time metric counters will be wired in upcoming units.

## Scope Limits

To protect incremental scoping rules:

- Do not write individual custom style graphics for the distinct shapes or error states yet.

- Do not integrate Trigger.dev background worker triggers or actual AI canvas injection paths yet.

- Do not configure sidebar detail inspection properties or edge mutation rules.

## Check When Done

- Dragging an infrastructure element from the sidebar palette passes clean, valid component types and size payloads.

- Dropping an item onto the active canvas precisely resolves coordinate locations matching your mouse point.

- Injected services initialize as custom traceNode types with a baseline healthy status schema.

- Dropped elements immediately register and render across all active browser windows inside the room.

- The full application compiles safely (npm run build) with no broken TypeScript types or lint failures.