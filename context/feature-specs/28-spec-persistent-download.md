## Artifact Persistence & Secure Playbook Download

## Goal

Implement secure long-term persistence and download mechanics for AI-generated incident post-mortem specs and recovery playbooks. Relational metadata is recorded in PostgreSQL via Prisma, while the raw Markdown text payloads are streamed to Vercel Blob Storage. Access is strictly guarded by a server-side permission layer that wraps downloads in access checks, keeping cloud bucket asset URLs protected from unauthorized public exploration.

1. Relational Metadata Schema Configuration

To track generated specifications without bloating your operational database tables, append the following model layout inside your prisma/schema.prisma file:

prisma
model ProjectSpec {
  id        String   @id @default(cuid())
  projectId String
  filePath  String   // The absolute secure Vercel Blob storage HTTPS download path URL
  createdAt DateTime @default(now())

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}
Use code with caution.

Ensure you align your database structures by running npx prisma migrate dev --name add_project_spec_table before proceeding.

2. Asynchronous Artifact Archiving FlowUpdate your Trigger.dev task execution script (src/trigger/generate-spec.ts) or create a server-side execution interceptor. Once the AI generation pipeline outputs a valid Markdown playbook buffer, implement the following persistence sequence:Blob Storage Upload: Stream the raw text string into a Vercel Blob object using the @vercel/blob server client put() engine tool. Namespace the tracking path explicitly under projects/[projectId]/specs/[specId].md.Database Registration: Take the permanent asset URL returned by Vercel Blob and insert a corresponding record into the ProjectSpec database table using Prisma. Ensure it hooks the correct parent projectId reference to maintain architectural system boundaries.

3. Secure File Delivery Route HandlerCreate an authenticated, permission-gated file download route handler located at src/app/api/projects/[projectId]/specs/[specId]/download/route.ts:A. Core Operation LoopAuthentication Gate: Read the request context using Clerk's auth() module. If the user session token fails validation, immediately abort processing and return an HTTP 401 Unauthorized response.Perimeter Access Evaluation: Invoke your established lib/project-access.ts server utility helper using the target route's [projectId] variable. Confirm that the authenticated worker is either the project's explicit ownerId or a registered ProjectCollaborator. If the verification check fails, return an HTTP 403 Forbidden response.Relational Consistency Validation: Query the ProjectSpec record from the database using the route parameter's [specId]. Confirm that the spec document row actually exists and is mapped to the exact matching projectId of the route. If it points to an alternative workspace, return an HTTP 404 Not Found response to prevent malicious ID scraping.Secure Stream Handoff: Read the validated filePath cloud pointer URL string. Fetch the underlying raw markdown text buffer from Vercel Blob storage using a protected server-side fetch() command.B. Download HTTP Header MatrixReturn the raw file string back to the user's browser wrapped inside an optimized response block, configuring the following HTTP header rules to force standard local desktop storage downloads:

typescript
return new Response(markdownBuffer, {
  status: 200,
  headers: {
    "Content-Type": "text/markdown; charset=utf-8",
    "Content-Disposition": `attachment; filename="trace_ai_incident_playbook_${specId}.md"`,
    "Cache-Control": "no-store, max-age=0"
  }
});
Use code with caution.

## Scope Limits

To protect system boundaries and preserve step-by-step verification rules:

- Do not write frontend UI download button clicks or sidebar documentation component widgets yet.Do not store full raw Markdown playbooks text inside PostgreSQL columns.Do not expose or display bare, un-gated Vercel Blob access URLs directly inside raw client payloads.
## Check When Done

- Relational metadata links seamlessly between project profiles and document logs inside Prisma.Compiled markdown text buffers archive directly to Vercel Blob storage containers without database bloat.The secure download endpoint blocks unauthenticated users and unauthorized collaborators with strict 401 and 403 status codes.Spec-to-project validation loops prevent unauthorized cross-project file requests.The full application environment compiles cleanly (npm run build) with zero broken type parameters or script linter notifications.