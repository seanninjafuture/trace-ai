Build the collaborative workspace route at /editor/[roomId] using React Server Components. This shell enforces strict server-side authentication and project permission gates, updates the layout with live project metadata, and frames the central layout viewports before initializing canvas elements or AI streaming engines.

## Access Control Helpers (src/lib/project-access.ts)

Create a dedicated server-side security helper module outside the page component to evaluate incoming connection permissions before rendering any layout structures.

Requirements:

- Identity Resolution: Extract the active operator's authenticated Clerk userId and their primary verified email address string from the current session.

- Authorization Evaluation: Query the database using the target roomId (mapping to Project.id or Project.canvasJsonPath). Grant authorization if:
    - The resolved user ID matches the project's explicit ownerId.
    - The resolved user email matches a record inside the project's ProjectCollaborator relation table.

- Return Type: Return a boolean evaluation alongside the fetched Project metadata record on successful matches.

## Server-Side Route Guarding (src/app/editor/[roomId]/page.tsx)

The workspace view must function strictly as a React Server Component to catch unauthorized traffic prior to loading client components.

Execution Path:
- Authentication Gate: If the operator lacks an active session token, immediately invoke a redirect to /sign-in.
- Resource / Permission Gate: Invoke your access control helper. If the project record does not exist in the database, or if the authenticated user fails the ownership and collaborator validation tests, instantly halt rendering and render the 

AccessDenied view.Access Denied Interface (src/components/editor/access-denied.tsx):

- Clean, centered viewport layout utilizing the --bg-base token background.
- A high-visibility Lock icon styled with the --text-muted design scale.
- A concise message reading: "You do not have permission to access this architecture workspace or the project does not exist."
- A primary button link routing the user safely back to the main /editor dashboard.

## Workspace Perimeter Layout Configuration

Once authorization succeeds, pass the server-fetched project metadata into the workspace structure.

+-----------------------------------------------------------------------------+

|  [Logo] Project Name / Slug            Collaborators Strip   [Share] [Flame] |
+---------------+-----------------------------------------------+-------------+

|  Draggable    |                                               |  AI Chaos   |
|  Components   |       Central Simulation Canvas Surface       |  Simulation |
|               |                                               |  Sidebar    |
|  [Gateway]    |               (Placeholder View)              |             |
|  [Compute]    |                                               |  [Trigger]  |
|  [Database]   |     "Drag components here to start layout"    |  [Metrics]  |
|  [Queue]      |                                               |             |
+---------------+-----------------------------------------------+-------------+


Components Framework:
- Global Header (editor-navbar): Populate the left slot dynamically with the project name fetched from the server. The right slot displays a mock Share button alongside a toggle button to control the right sidebar visibility.

- Left Infrastructure Sidebar (node-sidebar): Render the component list, automatically highlighting the active project row item within the sidebar navigation hierarchy.

- Central Workspace Surface: A placeholder viewport styled with a deep dark backdrop (--bg-base). Display a centered, muted typography element reading: "Drag components here to map your system architecture and run chaos simulations." The panel must scale to occupy 100% of the remaining screen real estate.

- Right Automation Sidebar (simulation-sidebar): Render a placeholder skeleton panel for the future AI prompt streaming field and live metric tracker layouts.

## Scope Boundaries

To preserve step-by-step verification rules, do not integrate live React Flow hooks, Liveblocks WebSocket sync protocols, Trigger.dev background worker scripts, or actual database share forms during this layout step.

## Check When Done

- Navigating to /editor/[roomId] triggers a server-side permission check using the custom access helper.

- Attempting to access an invalid or unauthorized project route safely returns the AccessDenied view.

- The global navigation layout dynamically resolves and displays the current project's title.

- Layout boundaries align across the screen without breaking application page viewports.

- Running compilation (npm run build) finishes successfully with no TypeScript type errors.