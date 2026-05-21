## Real-Time AI Presence & Activity Indicators

## Goal

Add shared, real-time AI activity indicators, visual loading flags, and status signals across the workspace. This UI-only milestone links Liveblocks Presence and storage threads to ensure all concurrent room operators can see when the AI agent (or a teammate) is actively running simulations, without implementing background job invocation or LLM provider connections yet.

1. Type Schema Contracts (src/types/tasks.ts)

Define a strict, validated data structure to track real-time simulation progress frames across the workspace canvas layout:

typescript
import { z } from 'zod';

export const AIStatusMessageSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  step: z.enum(['idle', 'initializing', 'processing', 'applying', 'complete', 'failed']),
  timestamp: z.number()
});

export type AIStatusMessage = z.infer<typeof AIStatusMessageSchema>;
Use code with caution.

2. Integrated Sidebar Loading Locks & Indicators

Update the right-hand panel control dashboard view (src/components/editor/simulation-sidebar.tsx) to respond to live room synchronization indicators:

- Global Presence Evaluation: Use the Liveblocks useOthers or specialized presence listener hooks to track if any active session participant (including the "ai-agent" identity block) has their isThinking flag set to true.

- Chat Input Disablement: When isThinking === true, dynamically assign the HTML disabled property onto the main chaos prompt Textarea element. This blocks concurrent input entry while a simulation executes.

- Button Loading Interceptor: Swap the primary "Inject Chaos" submit button text with a spinning loader symbol and a text label reading "Injecting Chaos...". Keep the surrounding tab workspace fully active so users can browse alternative documentation or structural metric history profiles.

3. Room-Agnostic Status Progress Stream

Leverage your existing Liveblocks architecture layers to build a centralized real-time notification mechanism without spawning non-standard state infrastructure:

- State Channel Mapping: Register or bind an active LiveList<AIStatusMessage> channel named aiStatusMessages directly within your shared Liveblocks room storage matrix definitions.

- Single-Message UI Display: Inside the AI Architect tab viewport shell, subscribe directly to the latest element inside this array list. Extract and display only the most recent status entry row text (e.g., "[PROCESSING] Calculating downstream network failure dependencies..."). Keep old history events hidden from the active display layer.

- Data Validation Gate: Prior to passing any status array update frames to the DOM rendering engine, run the raw payload objects directly through AIStatusMessageSchema.safeParse to guarantee schema integrity.

4. Presence Cursor Sync Anchors

Inject dynamic status indicators directly into the multi-user mouse cursor visualization layers overlaying the infinite React Flow canvas field:

- Pointer Indicator Badges: Update your collaborative pointer module component (src/components/canvas/presence-bar.tsx).

- Pulsing Action State: Evaluate the target participant's ephemeral presence payload. If peer.presence.isThinking === true, append a compact, low-latency micro-spinner asset directly inside their cursor name badge container, matching their assigned color track.

- Takedown Lifecycle: Automatically unmount or hide the visual loader element the moment the peer's isThinking flag reverts to false or becomes unassigned.

## Scope Limits

To protect system boundaries and unit isolation rules:

- Do not trigger live Trigger.dev background worker jobs or attach mock server API execution scripts yet.Do not introduce independent event emitters or multi-user state loops outside of the Liveblocks protocol.Do not show a comprehensive scrolling logs window displaying full status feed history records.

## Check When Done

- The right-hand sidebar successfully locks down text input frames when an active isThinking presence state is broadcast.The workspace chat panel updates and tracks the single most recent status stream message using validation gates.Collaborative mouse pointer arrows dynamically attach operational spinners when active users are running tasks.System panels remain operational and legible, avoiding full-screen dimming or layout freezes during processing events.The entire system application builds natively (npm run build) with zero broken type parameters or script linter notifications.