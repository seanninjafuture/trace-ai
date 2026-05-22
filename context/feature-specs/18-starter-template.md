## Starter Layout Templates & Lightweight Previews

## Goal

Add a built-in architecture starter template library so engineering teams can instantiate complex microservice topologies instantly instead of diagramming from scratch. Users can browse templates in a modal, view lightweight custom SVG previews, and clear the room's Liveblocks storage map with a pre-configured architecture baseline layout.

1. Schema Core Structures (src/components/editor/starter-templates.ts)

Create a centralized static schema file to house out-of-the-box infrastructure architectures. Map these data properties directly into our established canvas types.

Template Types & Constraints

- CanvasTemplate Schema Type: Contains a unique string identifier (id), a human-readable title (name), a detailed description, an initial structural array of TraceCanvasNode objects, and a downstream array of TraceCanvasEdge connectors.

- Architectural Topology Variations: Include at least three concrete infrastructure designs matching standard cloud architectures:

    - Three-Tier Web Service: Features an API gateway loading traffic onto separate compute nodes, which resolve records via a database layer.
    - Event-Driven Pipeline: Ingests requests into a gateway, forwards messages to an AMQP Message Queue, and distributes work to distributed worker nodes.
    - High-Availability Cluster: Maps a load balancer orchestrating data across multiple compute nodes with active-standby database replication links.
    
- 2. Grid Selector Interface (src/components/editor/starter-templates-modal.tsx)

Render the layout collection inside a standard, authenticated shadcn/ui overlay Dialog layout window.

- Grid Structure: Present choice items inside a multi-column scrollable container layout (ScrollArea) using a responsive grid (grid grid-cols-1 md:grid-cols-2 gap-4).

- Card Composition: Build every card profile using the dark ops theme --bg-surface element background. Each card explicitly lists the template name, an informative description string, the custom canvas preview container, and an "Import Architecture" call-to-action button.

- Import Handorsement: Clicking an import button triggers an onImport payload callback. This routine completely flushes the active Liveblocks room Storage map and instantiates the new template data model before cleanly dismissing the modal window view.

3. Inline Vector Diagram PreviewsTo ensure high-performance rendering without performance bottlenecks, do not spawn nested weight-heavy React Flow engine runtimes inside the template selection cards. Build a custom, standalone component that draws static layouts inside clean vector shells:

typescript// Example Preview Matrix Calculation Approach
const minX = Math.min(...nodes.map(n => n.position.x));
const minY = Math.min(...nodes.map(n => n.position.y));
const maxX = Math.max(...nodes.map(n => n.position.x + (n.width || 150)));
const maxY = Math.max(...nodes.map(n => n.position.y + (n.height || 80)));
Use code with caution.

## Static SVG Preview Strategy:

- Geometric Boundary Projection: Loop through the template's node coordinates to calculate its system bounding box boundaries (minX, minY, maxX, maxY). Feed these dimensions directly into the top-level SVG parent container element viewport viewbox scale property (viewBox={\(minX\){minY} \(width\){height}}).

- Edge Vector Drawings: Loop through the connection data arrays and trace simple inline path lines (<line className="stroke-zinc-700 stroke-[1.5]" />) mapping directly from center point to center point coordinates.

- Node Shape Drawings: Render lightweight shape vector approximations utilizing the node's saved color variable traits. This translates rectangle, circle, and pill boundaries dynamically inside the template picker.

## Scope Limits

To protect system boundaries and development speed:

- Do not include persistent cloud storage endpoints or remote JSON loaders yet.

- Do not write custom interactivity rules (panning, dragging, editing) inside the blueprint selector frame blocks.

- Do not change the fundamental room access tokens or Liveblocks auth models.

## Check When Done

- Template array collections reside statically with clean node-edge definitions within starter-templates.ts.

- The template modal window presents choices accurately in a scrolling layout grid.

- The custom SVG blueprint engine precisely projects and scales layout previews without firing full React Flow setups.

- Importing a starter profile successfully overrides the live room workspace across all concurrent browsers.

- Production compilation tasks run successfully (npm run build) with no linter notifications or type violations.