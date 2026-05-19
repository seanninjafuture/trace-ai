## Goal

Build the `/editor` home workspace screen and add project dialogs, sidebar item actions, and state wiring. Everything must run deterministically using mock data. Do not add API calls, live database writes, or persistence layers yet.

## Editor Home

Reuse the existing layout panels (editor-navbar, node-sidebar, and simulation-sidebar). Do not modify the established workspace perimeter layout behavior.

When no active graph project is loaded, display a centered splash layer directly over the main canvas area:

- Heading: `Create a simulation project or open an existing one`
- Description: `Start a new architecture workspace, or choose an infrastructure graph from the sidebar to inject chaos.`
- Primary Action: A `New Project` button containing a Plus icon.

Keep this center section completely minimal. Do not wrap this instruction block inside card frames or elevated surfaces. Clicking the New Project button must immediately trigger the `Create Project` dialog window.


## Dialogs

Implement the dialogs using the pre-configured shadcn/ui Dialog primitive structures. All overlay views must render with a dark backdrop blur (bg-black/80 backdrop-blur-sm) and stick to the defined design tokens.

### Create Simulation Project

- Input: A text field capturing the architectural project name.
- Live Slug Preview: Display a real-time URL/slug preview text element directly underneath the input field (e.g., traceai.dev/workspace/my-system-slug).
- Behavior: The slug updates dynamically as the user types, stripping whitespace, removing special characters, and converting characters to lowercase.

### Rename Workspace Architecture

- Input: A text field pre-filled with the current mock project name.
- Description: Display the previous system name explicitly inside the modal text description.
- Behavior: The input text field automatically focuses upon opening. Pressing the Enter key triggers the submission callback.

### Wipe Simulation Workspace (Delete)

- Warning Text: A high-visibility destructive warning detailing that deleting the workspace will permanently wipe out its system nodes, graph configurations, and generated incident playbooks.
- No Text Inputs: Do not require typing the project name to confirm deletion.
- Action Controls: A cancel button alongside a destructive confirmation button utilizing the --state-error (bg-red-600 hover:bg-red-700) styling scale.

## Sidebar Project Actions

Update the Project Sidebar tabs to display list layouts for mock project configurations. Add an interactive context menu or drop-down element to each active project row item.

- Actions Included: Rename and Delete options.
- Access Scope: Display these workspace mutations strictly for owned projects (My Projects tab).
- Access Restrictions: Hide or completely omit these options for shared developer instances (Shared tab).
- Mobile Viewports: Ensure clicking outside the layout border closes the overlay side view completely, backed by an explicit dimmed overlay scrim block.

Show actions only for owned projects.

Hide actions for shared/collaborator projects.

On mobile:

- tapping outside the sidebar closes it
- add a backdrop scrim

## State Management Implementation

Create a localized React context or a dedicated workspace custom hook (src/hooks/use-project-dialogs.ts) to manage:

- Active dialog visibility toggles (create | rename | delete | none).
- Form states (controlled name inputs and slug generation calculations).
- Local layout loading simulators.Wire this hook directly to:
- The main canvas empty-state New Project button.
- The sidebar action menu triggers for workspace creation, renaming, and execution testing steps.


## Check When Done

- All interactive project buttons cleanly toggle their matching modal viewports.
- The dynamic slug converter instantly processes string characters on keypress.
- Modal input auto-focus functions correctly on activation without displacing layout structures.
- The project code builds perfectly with no TypeScript types broken or lint rules violated.