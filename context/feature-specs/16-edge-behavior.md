## Architectural Edge Connections & Traffic Routing

## Goal

Replace the default React Flow connection lines with specialized, right-angle architectural network paths. This foundation enables team members to build complex microservice dependency topologies, provides an easier hover/click target surface, and supports inline routing labels to map out data flows and service protocols.

1. Multi-Port Intersection Handles

Configure omnidirectional connection ports inside your core custom component frame (src/components/canvas/nodes/trace-node.tsx):

- Four-Quadrant Layout: Attach native React Flow <Handle /> components to all cardinal directions of the node container card:

    - Top (type="target" position={Position.Top}).
    - Bottom (type="source" position={Position.Bottom})
    - Left (type="target" position={Position.Left})
    - Right (type="source" position={Position.Right})
    
- Permissive Routing: Configure cross-handle linking, allowing collaborators to establish infrastructure lines from any chosen hub port vertex to any other destination port vertex.

- Aesthetic Presence: Render handles as small, high-contrast markers (h-2 w-2 bg-zinc-100 border border-zinc-900 rounded-full). Keep them completely hidden (opacity-0) at rest, fading them smoothly into view (opacity-100 transition-opacity duration-200) whenever an operator hovers over the parent node container.

2. Right-Angle Custom Edge Renderer

Register a custom edge renderer component inside your primary canvas setup configuration (edgeTypes = { traceEdge: OrthogonalTrafficEdge }) at src/components/canvas/edges/orthogonal-edge.tsx:

- Orthogonal Routing: Use React Flow's layout path helper getSmoothStepPath to enforce clean, right-angle technical diagram routing instead of chaotic diagonal lines. Set a gentle corner bevel radius (borderRadius: 8).

- Interactive Visual States:

    - Rest Vector Style: A thin, slightly dimmed slate line (stroke: var(--border-default) strokeWidth: 1.5). Append a clean terminal arrowhead tracking the direction of the traffic stream.
    
    - Hover / Focus Accentuation: When a user hovers or selects an edge path, brighten the stroke color instantly to our primary active color token (stroke: var(--accent-primary)) and apply a subtle glow.
    
- Invisible Click Interceptor: Render a secondary, invisible thick duplicate path line layered directly behind the visible edge vector (stroke: "transparent" strokeWidth: 12 className: "cursor-pointer"). This expansion field makes selecting thin, precise edge paths significantly easier for collaborators.

3. Inline Traffic Label Configuration

Allow teams to document protocol details (e.g., "gRPC", "HTTPS", or "AMQP Queue") directly on top of the connection lines using React Flow's built-in <EdgeLabelRenderer />:

- Anchor Mapping: Use the exact midpoint coordinates (labelX, labelY) computed natively by getSmoothStepPath. This ensures perfect alignment without manually tracking custom geometric math offsets.

- Activation Trigger: Double-clicking anywhere over the network path label zone triggers an inline editing state, swapping the static description string with a small, borderless text input.

- Layout Safety Rules:

    - Style the inline label wrapper with a sharp, compact glassmorphism badge overlay (bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono px-1.5 py-0.5 rounded).
    
    - Stop event propagation (e.stopPropagation()) completely within the text entry field to isolate key strikes, ensuring that typing letters never accidentally drags nodes or pans the workspace canvas surface.
    
    - Automatically commit label string updates to the Liveblocks LiveList<CanvasEdge> storage map upon an onBlur form event or on hitting the Escape key.
    
## Scope Limits

To safeguard incremental development boundaries:

- Do not inject active cascading error animations or flowing neon traffic dot pulses across edges yet.

- Do not implement custom warning state changes linked to the AI chaos generation pipeline.

- Do not alter existing database project save models.

## Check When Done

- Node components reveal four discreet cardinal handles that fade into view on hover.

- New connections route cleanly at right-angles using the traceEdge schema type and include vector arrowheads.

- The invisible click interceptor allows for reliable edge line selection without requiring pixel-perfect mouse positioning.

- Double-clicking an infrastructure connection opens a centered, isolated text input to edit traffic protocols inline.

- The entire project compiles cleanly (npm run build) without broken TypeScript types or lint failures.