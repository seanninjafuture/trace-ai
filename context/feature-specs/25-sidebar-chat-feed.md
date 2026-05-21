## Real-Time Collaborative Workspace Chat Feed

## Goal

Add real-time room chat to the AI sidebar using a dedicated Liveblocks storage layer. This enables multi-user engineering teams to chat with each other directly inside the workspace while running chaos experiments. This feed is room-scoped and completely isolated from the ai-status-feed, which is reserved exclusively for streaming background AI progress metrics.

1. Type Schema Contracts (src/types/tasks.ts)

Define a strict, validated data structure to ensure structural integrity across distributed network chat packets:

typescript

import { z } from 'zod';

export const AIChatMessageSchema = z.object({
  id: z.string(),
  roomId: string,
  sender: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url()
  }),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  timestamp: z.number()
});

export type AIChatMessage = z.infer<typeof AIChatMessageSchema>;
Use code with caution.

2. Shared Workspace Chat Thread Integration

Establish a dedicated real-time list model within your room definition structures. Do not mix text messages with system operation codes or simulation event listeners.

- State Channel Mapping: Register or bind an active LiveList<AIChatMessage> channel named aiChatMessages directly within your shared Liveblocks room storage matrix definitions.

- Sequential Delivery Mapping: Update the AI Architect tab inside src/components/editor/simulation-sidebar.tsx. Subscribe to this storage list to render incoming chat text logs in sequential order based on their creation timestamps.

- Enriched Profile Rendering: Extract and display the sender’s profile initials or small avatar pictures alongside their messages, styled according to our dark cloud-ops theme guidelines.

3. Form Message Dispatch Loop

Wire up the sidebar text entry area to dispatch messages to the Liveblocks workspace map:

- Input Capture Hook: Upon catching a single Enter key strike (or clicking the submission control button) when the prompt textarea is populated, compile an AIChatMessage object payload.

- Payload Construction: Automatically append the sender's authenticated Clerk profile metadata (name, user ID, avatar URL) and mark the role string property field as 'user'.

- Storage Dispatch: Push the validated message object directly into the room's live storage list map wrapper. Clear the textarea element immediately after a successful broadcast.

- Error Indicators: Wrap the execution dispatch in a standard try-catch shell. If network issues block the WebSocket state write, surface a small, controlled text label reading "Message failed to send. Click to retry." directly above the text input element using our --state-error red token.

4. UI Layer Styling Rules

Ensure that the newly wired live chat thread adopts our dark theme tokens seamlessly:

- Message Stream Layout Alignment:Local Human User Messages: Right-aligned, utilizing a distinctive dark blue core (bg-blue-950/40 border border-blue-500/30 text-[var(--text-primary)] rounded-l-lg rounded-tr-lg p-3 text-sm maxWidth-[85%]).Remote Teammate / Assistant Lines: Left-aligned, utilizing a clean charcoal surface (bg-zinc-900/60 border border-[var(--border-default)] text-[var(--text-primary)] rounded-r-lg rounded-tl-lg p-3 text-sm maxWidth-[85%]).

- Scroll-Locked Container: Wrap the message mapping function inside a layout ScrollArea component. Wire an anchor node reference point to automatically pin scroll bars down to the lowest element entry on update.

## Scope Limits

To protect step-by-step verification rules and unit isolation targets:

- Do not trigger live Trigger.dev background worker jobs or write streaming AI API handlers yet.Do not modify active canvas graph nodes, network lines, or system metrics.Keep this milestone strictly focused on routing multi-user chat state blocks between operators over Liveblocks WebSockets.

## Check When Done

- A dedicated aiChatMessages Liveblocks storage channel securely manages room-scoped discussions.Text entries are validated through Zod schema gates before rendering to prevent UI crashes.Chat bubbles render with distinct right-to-left layout alignments mapping accurately to user profiles.Dispatched messages broadcast across all room collaborator viewports instantly.The entire system workspace builds correctly (npm run build) with zero broken type expressions.