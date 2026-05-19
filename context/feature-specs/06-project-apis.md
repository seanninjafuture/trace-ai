The database schema is ready. Build the backend REST API endpoints for project management. All endpoints must handle authentication, enforce ownership security models, and perform database mutations using the cached Prisma client. Keep this backend-only—do not wire the frontend UI components or custom hooks yet.

## Routes

Create the following HTTP endpoints using Next.js 16 Route Handlers:

- GET `/api/projects`:
    - Description: Lists all workspace projects where the current user is either the explicit owner or an authorized collaborator.
    - Query / Filtering: Filter the results using the authenticated user's ID or verified email address.
    - Response: Return a JSON array of project objects ordered by createdAt descending.
- POST `/api/projects`:
    - Creates a new architecture project profile.
    - Payload Validation: Parse incoming body data for optional name and description string keys.
    - Fallback Logic: If the name string key is missing, empty, or unassigned, default the value to Untitled Project.
    - Primary Fields: Set the database ownerId to the current user's Clerk ID and assign the project status enum value to DRAFT. Use the default Prisma ID generation strategy—do not append sequential numerical ID counters.
- PATCH `/api/projects/[projectId]`:
    - Description: Renames an existing workspace project title.
    - Payload Validation: Validate that the body payload contains a valid, non-empty name string.
    - Behavior: Update the target project record with the new name value and refresh the updatedAt timestamp.
- DELETE `/api/projects/[projectId]`:
    - Description: Purges an entire workspace configuration.
    - Behavior: Completely delete the target project row from the database. Due to the cascade delete settings on your Prisma model schema, this operation will automatically wipe out all associated ProjectCollaborator records.

## Rules

Enforce these strict access controls on every API route boundary before executing any database mutations:

- Authentication Check: Extract the active session state using Clerk's auth() helper wrapper. If the request does not provide a verified user token, instantly abort processing and return an HTTP 401 Unauthorized status response.
- Ownership Check: For PATCH and DELETE endpoints, query the target project's ownerId field from the database using the route's [projectId] parameter.
- Mutation Gate: Verify if the parsed project ownerId matches the incoming request's authenticated user ID. If the IDs do not match, instantly drop the request and return an HTTP 403 Forbidden status response.

## Check When Done

- All four project endpoints (GET, POST, PATCH, DELETE) exist and operate under their correct path structures.
- Security validation guards accurately return an HTTP 401 status response for unauthenticated client runs.
- Mutation endpoints correctly return an HTTP 403 status response when an authenticated non-owner user attempts a change.
- Project creation operations fallback safely to Untitled Project if no custom string parameter is passed.
- The codebase passes compilation (npm run build) without any static type breaks or build anomalies.
