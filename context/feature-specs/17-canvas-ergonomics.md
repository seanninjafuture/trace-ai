## Canvas Controls & Keyboard Shortcuts

## Goal

Add a floating canvas control toolbar for managing zoom states and layout history (Undo/Redo), and wire those same operational steps to global keyboard shortcuts. This enables fluid canvas navigation, lets collaborators reverse structural architecture mistakes instantly, and connects directly to Liveblocks' distributed history timeline.

1. Floating Canvas Controls Toolbar (<CanvasControls />)

Create a pill-shaped layout panel (src/components/canvas/canvas-controls.tsx) anchored to the bottom-left boundary of the canvas viewport.

- Layout Perimeter: Position the element roughly 16px from the bottom and left margins, stacking it cleanly above the MiniMap panel. Wrap it inside our dark design system glass container (bg-zinc-900/90 border border-zinc-800 p-1.5 shadow-2xl rounded-lg flex items-center gap-2).

- Action Command Layout Groups: Split functionality using a thin vertical separator line (h-4 w-[1px] bg-zinc-800):

    - Navigation Cluster: Zoom Out (Minus icon), Fit View (Maximize icon), and Zoom In (Plus icon).
    
    - History Cluster: Undo (Undo2 icon) and Redo (Redo2 icon).
    
- Disabled State Indicators: When there are no historical mutations left in the queue, dim button visibilities (opacity-40 cursor-not-allowed) and strip their hover styles. Apply className="nodrag nopan" to ensure interacting with buttons never accidentally pans the canvas backdrop.

2. React Flow Viewport Binding

Wire the Navigation Cluster controls directly to the active React Flow viewport hook actions:

- Zoom Modifiers: Invoke the native zoomIn() and zoomOut() engine functions on click. Pass a clean execution duration parameter ({ duration: 200 }) to slide the infinite camera smoothly instead of jumping instantly.

- Graph Fitment: Invoke fitView({ duration: 200, padding: 0.2 }) to re-center the structural architecture diagram neatly within the user's active browser space.

3. Distributed Collaborative History (Liveblocks)

Wire the History Cluster controls directly to Liveblocks' state synchronization engine timeline hooks:

- History Anchors: Map the control triggers to the native Liveblocks useUndo() and useRedo() hooks.

- State Evaluators: Pull mutation availability flags using useCanUndo() and useCanRedo(). Use these boolean conditions to dynamically toggle the disabled indicator properties on your toolbar icons.

- Collaborative Safety: Liveblocks automatically scopes historical milestones locally. An operator undoing a node drag only reverses their own recent layout manipulations, preventing them from accidentally rewriting a peer's parallel canvas additions.

4. Keyboard Shortcuts Interceptor Hook (src/hooks/use-keyboard-shortcuts.ts)

Create a global event listener to capture high-velocity engineering hotkeys:

- Text Field Isolation: Write an explicit gate check tracking the active document.activeElement tag name. If the cursor resides inside an input, textarea, or content-editable text container, instantly halt the shortcut script (return;). This allows users to type normal characters or labels without firing layout modifications.

- Supported Shortcut Combinations:

Cmd / Ctrl + + (or =) \(\rightarrow \) Smooth Zoom In.

Cmd / Ctrl + - \(\rightarrow \) Smooth Zoom Out.

Cmd / Ctrl + Z \(\rightarrow \) Liveblocks Distributed Undo.

Cmd / Ctrl + Shift + Z OR Cmd / Ctrl + Y \(\rightarrow \) Liveblocks Distributed Redo.

## Scope Limits

To safeguard incremental development boundaries:

- Do not alter the bottom-center drag-and-drop node palette sidebar.

- Do not add additional structural canvas commands or custom viewport coordinate overrides.

- Do not change the fundamental room connection configurations or Liveblocks auth models.

## Check When Done

- The floating command pill mounts in the bottom-left layout boundary and isolates interaction signals safely.

- Zoom buttons dynamically shift the camera position using smooth, timed motion curves.

- Undo and Redo operations communicate with Liveblocks history and dim out accurately at timeline boundaries.

- Global keyboard hotkeys trigger matching canvas mutations smoothly while ignoring inputs inside text fields.

- The full workspace engine builds cleanly (npm run build) without a single TypeScript or linter failure.