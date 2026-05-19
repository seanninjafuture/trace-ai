Add a "Share" button to the workspace header that opens a real-time collaboration access panel. This allows owners to invite or remove teammates using their email addresses, while granting collaborators read-only permission visibility. Teammate profile metadata (names, avatars) is dynamically resolved directly via the Clerk Backend API.

## Access Control Permissions

Enforce strict rule differences based on whether the active user is the project owner or a collaborator:

Project Owner Features:

- Invite new collaborators by entering their email address.
- Remove active collaborators via a destructive disconnect button.
- View a comprehensive, enriched list of all users with active access.
- Copy the unique project workspace link with an interactive 2-second "Copied!" button feedback toggle.

Collaborator Features (Read-Only):
- View the active collaborator listing only.
- Hide or disable all email text input forms and submission buttons.
- Omit or block all collaborator removal click controls.

## Dynamic Clerk User Enrichment

Collaborator associations are saved inside PostgreSQL strictly using their verified email addresses. To show rich user profiles on the UI without managing a local user metadata synchronization table, resolve profile identities on the fly:

- Clerk Backend Lookup: When fetching the collaborator list, use the @clerk/nextjs Backend API client (clerkClient.users.getUserList) to batch-query users matching the stored email addresses.

- Data Enrichment: Map the returned user data objects to enrich the workspace UI with the teammate's Display Name and Avatar Image URL.

- Graceful Fallback: If a Clerk user account does not exist yet for an invited email address, fall back gracefully to rendering the raw email string placeholder accompanied by a default vector profile avatar icon.

## Server Actions & Backend API Handlers

Create secure endpoints or Next.js Server Actions to handle access modifications. Each mutation must explicitly run through server-side authorization checks:

typescript// Example permission verification rule inside mutations
const project = await prisma.project.findUnique({ where: { id: projectId } });
if (project.ownerId !== authenticatedClerkUserId) {
  throw new Error("403_FORBIDDEN");
}

API Implementation Requirements:

- GET /api/projects/[projectId]/collaborators: Lists all saved emails tied to the project, combined with Clerk's profile identity values.

- POST /api/projects/[projectId]/collaborators: Inserts a new row containing the target email address into the ProjectCollaborator table. Blocks execution and returns a 403 error if triggered by a non-owner.

- DELETE /api/projects/[projectId]/collaborators/[collaboratorId]: Purges the target collaborator mapping row from the database. Rejects processing immediately if requested by a non-owner.

## UI Layout & Component Interface

Build the workspace access interface inside a standard shadcn/ui Dialog primitive.

- Trigger: Embed an action button displaying a UserPlus icon in the right-hand slot of editor-navbar.tsx.

- Header: Title reads "Share Architecture Workspace", paired with a short description text block.

- Main Slot: A scrollable list panel (ScrollArea) rendering the enriched list rows. Each teammate item features an image avatar, display name, email subtitle, and an optional owner-only "Remove" action icon.

- Footer Controls: An inline email entry text input paired with a "Send Invite" action button, placed adjacent to a "Copy Link" shortcut utility toggle.

## Check When Done

- The sharing dialog renders cleanly from the workspace top menu trigger without displacing canvas viewports.

- Project owners can successfully submit email invites and delete existing access mapping records.

- Authenticated collaborators are correctly restricted to a read-only list view with no form controls exposed.

- Teammate display names and avatar images load directly from the Clerk Backend API when an active profile matches.

- No local user tables were added, and the codebase passes strict compilation checks (npm run build).