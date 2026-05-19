Wire the /editor layout workspace, infrastructure sidebars, and overlay dialog views directly to the live project API routes. Replace all mock definitions with real data fetching pipelines, route transitions, and state synchronization.

### Server-Side Data Fetching 

The main /editor/page.tsx route must act as a React Server Component (RSC).
- Direct Database Queries: Fetch project listings server-side by checking the authenticated user's Clerk ID directly through your Prisma data layer.
- Split Playbook Lists: Query two lists:
    - Owned Workspaces: Projects where ownerId === user.id.
    - Shared Workspaces: Projects where the user's verified email is found in the ProjectCollaborator records.
- Zero Client-Side Fetching: Pass these pre-fetched array lists down as immutable props to the Client Component sidebars. Do not trigger secondary client-side useEffect or SWR/React Query fetches on initial page render.

## Integrated Actions Hook (src/hooks/use-project-actions.ts)

Create a consolidated React client hook to handle operational states, processing feedback, and asynchronous API calls.

Create Workspace Action:
- State Management: Control the visibility state of the creation overlay alongside text inputs.
- Deterministic ID Generation: Slugify the user's project name string input (e.g., My System becomes my-system). Append a short, unique cryptographic suffix (e.g., 4f2a) to enforce uniqueness.
- Alignment Invariant: Use this generated string as both the canvasJsonPath storage slug and the unique Liveblocks Room ID.
- Execution: Call POST /api/projects. Upon a successful 200/211 response, use the Next.js router.push() method to navigate the browser directly to the newly allocated workspace path: /editor/[projectId].

Rename Workspace Action:
- State Management: Store the active target project's UUID and populate the input field with its current name.
- Execution: Call PATCH /api/projects/[projectId] passing the updated name payload string.
- Refresh: Upon completion, invoke router.refresh() to force Next.js to re-render the server layout data without a full page reload.

Wipe Workspace Action (Delete):
- State Management: Track the targeted project object metadata to display confirmation details.
- Execution: Call DELETE /api/projects/[projectId].
- Navigation Routing: If the user destroys the active workspace they are currently viewing, immediately redirect them to the parent /editor home view. Otherwise, execute router.refresh() to update the active sidebar lists.

## Component Interface Wiring

Sidebar Components:
- Map the server-fetched project arrays directly into the workspace layout tabs.
- Pass the mutation triggers down into the context drop-down lists on each project item block.

Dialogue Windows:
- Create Project Modal: Display a live string preview showing the exact Liveblocks Room ID structure as the operator types.
- Rename Project Modal: Automatically pre-fill the form text input and trigger element focus.
- Delete Project Modal: Explicitly insert the system's human-readable name into the warning description body to prevent accidental destruction.

## Check When Done

- The left sidebar populates instantly on load using data fetched from the Server Component layer.
- Creating a project successfully hits the backend API, generates a synchronized Room ID, and updates the URL path.
- Renaming or removing a project triggers corresponding database mutations and refreshes layout visibility instantly.
- Deleting an active workspace safely redirects the browser viewport back to the root /editor layout page.
- The workspace project builds successfully (npm run build) without broken TypeScript references or lint warnings.