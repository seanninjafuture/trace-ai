## Client Integration: Specifications Tab & Playbook Previews

## Goal

Integrate AI-generated incident post-mortem specs and recovery playbooks directly into the right-hand AI sidebar's Specs tab. This layer hooks up historical document listings, renders secure inline markdown document previews via modal dialog overlays, and activates file downloads without exposing raw underlying Vercel Blob URLs directly to the client interface.

1. Historical Document Listing

Update the Specs tab layout inside the right-hand panel control dashboard (src/components/editor/simulation-sidebar.tsx) to render historical project documents:RSC Layout Hydration: Fetch project specifications through your backend API wrapper. Pass down the ProjectSpec array elements into the client tab grid view container.List Item Composition: Map the document items inside a vertical ScrollArea list wrapper. Render each row using your dark theme --bg-surface element background:Include a FileText vector symbol icon on the left column margin.Display a clean, formatted title string reading trace_ai_playbook_[id].md.Display a compact text string tracking the creation date using standard localized tokens (e.g., May 21, 2026).Ensure each list row remains clickable to fire the inspection overlay, featuring a clean hover background highlight accent.

2. Secure Markdown Preview Overlay Modal

Build an interactive document viewer overlay utilizing a standard, authenticated shadcn/ui Dialog component.Secure Content Ingestion Invariant: Clicking an entry in the document list must trigger a server call to pull data content. Do not connect or read raw Vercel Blob URLs directly from the client code. Use your gated server route to fetch text buffers securely.Modal Interface Structure: Center the overlay container backdrop frame with a strong backdrop blur styling filter (bg-black/80 backdrop-blur-sm).Viewport Canvas Render Area: Wrap the document canvas window inside a fixed height scroller (max-h-[70vh] overflow-y-auto pr-2). Render the returned raw text string through a lightweight typography mapping helper to layout markdown headings, bulleted lists, and parameters clearly inside the dark template viewport.Accessibility Safeguards: Integrate close macro callbacks. Ensure clicking outside the container boundary, clicking a top-right corner close button icon, or hitting the keyboard Escape hotkey instantly dismisses the active modal viewport.

3. Native Download Triggers

Activate the file extraction actions on both the list view item shortcuts and the main overlay modal view header bar:Route Targets Binding: Link the click handlers on your download icons and buttons directly to your secure file delivery endpoint handler:

typescript

const downloadUrl = `/api/projects/${projectId}/specs/${specId}/download`;
Use code with caution.Streaming Handoff Handshake: Execute downloads cleanly by routing traffic through standard HTML anchors (<a href={downloadUrl} download />) or clean browser redirects (window.location.href = downloadUrl). Let the browser handle incoming stream headers (Content-Disposition: attachment) to trigger native file downloads smoothly.

## Scope Limits

To protect system boundaries and preserve incremental scoping rules:

- Do not write manual client-side text editing inputs or document alteration forms inside the preview dialog window layout.Do not alter how human operators drag or connect nodes via the central React Flow canvas space.Keep this unit strictly locked down to wiring up the specifications listing panel, the preview dialog, and download triggers within the Specs tab workflow.

## Check When Done

- The Specs tab sidebar view dynamically loops and displays historical specification document entries.Clicking a document list item successfully triggers secure server fetches and renders inline markdown layouts.Document viewer overlay panels dismiss smoothly when catching outer clicks or keyboard Escape strikes.Download action controls accurately trigger native local file downloads without exposing bare Vercel Blob storage buckets.The entire system architecture builds perfectly (npm run build) with zero broken type parameters or script linter notifications.