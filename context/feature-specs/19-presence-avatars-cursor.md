## Real-Time Multi-User Presence & Floating Avatars

## Goal

Show real-time active room participants and moving mouse cursors directly within the collaborative workspace canvas layer. This implementation overlays live cursor tracking and profile indicators without modifying or polluting the global, shared top navbar component.

1. Presence Type Definitions (src/liveblocks.config.ts)

Verify that your project's root Liveblocks configuration file explicitly types transient peer behaviors to drive cursor rendering and status updates:
typescriptexport type Presence = {
  cursor: { x: number; y: number } | null;
  isThinking: boolean;
  activeNodeId: string | null;
};
Use code with caution.

2. Context-Isolated Avatar Ribbon (src/components/canvas/presence-bar.tsx)

Build a floating participant panel that sits cleanly inside the top-right corner of the canvas viewport, completely detached from the global page navigation bar.

- Boundary Layout: Absolute position the container (absolute top-4 right-4 z-50 flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-full backdrop-blur-md).

- Identity De-duplication Rule:Fetch the active operator's identity via Clerk. Filter the Liveblocks room presence list (useOthers) to exclude any entry matching the current user's ID.Render the current user exclusively via Clerk's native <UserButton /> anchor on the outer edge.

- Visual Separator: Implement a clean vertical line divider (w-[1px] h-4 bg-zinc-800) between the collaborator stack and the Clerk button. Render this divider only when the filtered list length is greater than zero (\(\ge 1\)).

3. Layered Profile Avatar Stacks

Render peer collaborators using high-contrast operational badges inside the container:

- Asset Hydration: Render the user's primary profile photo image. If a profile photo is missing or unassigned, fall back gracefully to a two-letter text initials indicator centered on an absolute dark background.

- Overlap Composition: Compress layout spacing to stack elements in a tight, overlapping sequence (flex -space-x-2). Apply an explicit high-contrast ring boundary (ring-2 ring-zinc-950) around every item card to preserve legibility over system nodes.

- Overflow Threshold: Cap the absolute list length at five concurrent user nodes. If a sixth user connects, render a minimalist text badge reading +N (e.g., +2) reflecting the remaining team count. Collaborator avatars must remain strictly display-only.

4. Live Multi-User Mouse Cursors

Map collaborative pointers smoothly across the React Flow workspace layer, isolating tracking logic from local user inputs.

- Coordinate Broadcasting: Capture local pointer shifts by binding a client event listener onto React Flow's wrapper container (onPointerMove). Extract viewport offsets and update states via updateMyPresence({ cursor: { x, y } }). Wire a corresponding exit event listener (onPointerLeave) to clear values instantly back to null.

- Peer Cursor Interception: Loop through remote peers using the Liveblocks presence array. Skip rendering entirely for any peer whose cursor coordinates resolve to null.

- Vector Pointer Overlays: Render a floating SVG cursor arrow paired with a trailing typography title badge. The badge displays the teammate's human-readable Clerk display name, with both the pointer fill and badge background matched to the user's assigned color token.

## Scope Limits

To protect system boundaries and unit testing rules:

- Do not patch or redesign the shared application top navbar component globally.
- Do not alter or replace Clerk's internal session account management, profile editing, or logout redirect behavior workflows.

- Do not inject custom click macros or menu options into the displays of peer avatar blocks.

## Check When Done

- The user presence tracker mounts cleanly in the top-right quadrant of the canvas view without altering the header navbar component.

- The current user is cleanly filtered out of the Liveblocks avatar loop and rendered exclusively via Clerk.

-- Up to 5 collaborator profile circles render in a clear overlapping stack with active overflow calculations.

- Concurrent users broadcast precise vector arrow pointers labeled with their names across the infinite grid.

- The entire real-time presence layout compiles cleanly (npm run build) with zero linter errors.