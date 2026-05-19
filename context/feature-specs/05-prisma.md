Prisma is already installed. Add the project data models, Prisma client singleton, and first
migration.

## Goal

Configure Prisma data models, establish a cached Prisma client singleton that splits traffic between Prisma Accelerate or direct drivers based on your configuration, and apply the initial database migration.

## Models

Create `prisma/schema.prisma` (or utilize a multi-file schema setup at `prisma/models/project.prisma` if Prisma preview features are enabled). Add the following structure matching Trace AI's core data constraints:

Add `Project`:

- id: String (UUID or CUID) as primary key.
- ownerId: String (mapped directly to the authenticated Clerk user ID).
- name: String.
- description: String (optional).
- status: Enum supporting `DRAFT` and `ARCHIVED`.
- canvasJsonPath: String (stores the reference URL pointing to Vercel Blob storage where the structural canvas node/edge configurations reside).
- createdAt / updatedAt: Timestamps.
- Indexes: Explicit composite indexes on `ownerId` and `createdAt` to optimize workspace queries.

Add `ProjectCollaborator`:

- id: String as primary key.
- projectId: String relation referencing `Project.id` with an explicit `onDelete: Cascade constraint`.
- collaboratorEmail: String.
- createdAt: Timestamp.
- Constraints: A strict unique compound constraint tracking unique pairings across `projectId` and `collaboratorEmail`.
- Indexes: Dedicated index lookup chains targeting collaboratorEmail and the compound `projectId` / `createdAt` fields.

Note: Do not append arbitrary additional data properties unless explicitly needed for relational mapping consistency by the Prisma engine.

## Prisma Client

Create `src/lib/prisma.ts` to manage your client connection pool safely. To accommodate the advanced Next.js 16 runtime and hot reloading protocols, configure the file using this exact behavior:


- Parse the environment's `DATABASE_URL`.

Connection Branching Rule:
- If the connection string prefixes with `prisma+postgres://`, initialize using the edge-optimized Prisma Accelerate extension client interface.
- Otherwise, fallback directly to a native server-side Postgres pool utilizing the `@prisma/adapter-pg` driver interface.

Development Cache: Attach the instantiated connection object to the Node.js `global` variable namespace during non-production runs to prevent connection leakage across hot reloads.

## Migration

Run the migration and generate the client.

## Dependencies

Verify the installation of these underlying layer dependencies inside your environment before running compilation tests:

- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
-`pg`

## Check When Done

- The `schema.prisma` file contains both models configured with explicit cascade deletes, constraints, and index paths.
- `src/lib/prisma.ts` outputs a single, shared cached client singleton without multiple connection warnings.
- Your initial schema migration executes and builds the target structures inside your PostgreSQL instance.
- The application compiles cleanly (`npm run build`) with typed data definitions mapped correctly.
