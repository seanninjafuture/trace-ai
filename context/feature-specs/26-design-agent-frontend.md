## AI Simulation Agent Client Integration & Real-Time Polishing

## Goal

Wire the right-hand AI workspace sidebar directly to the background orchestration pipeline. When an engineer submits a natural language failure trigger, the system appends the request to the real-time chat, dispatches an asynchronous execution task to Trigger.dev, secures a scoped public tracking token, and listens to streaming status updates while Liveblocks reflects node mutations in real time.

1. Automated Chat Submission & Inception Handoff

Modify the text submission trigger inside the AI Architect tab viewport component (src/components/editor/simulation-sidebar.tsx) to implement the following sequence:

- Message Dispatch: Instantly push the text input into the aiChatMessages Liveblocks storage list array to document the operation locally.

- Pipeline Invocation: Issue an HTTP POST fetch request targeting /api/ai/design, sending a payload of { prompt, roomId, projectId }.

- Token Allocation: Parse the successful JSON backend payload response to extract the unique Trigger.dev execution identifier (runId) and its corresponding read-only authentication key (publicToken).

- State Capture: Store these variables inside local, transient React component states (setRunningJob({ runId, publicToken })) to mount real-time tracking loops.

2. Real-Time Background Task Tracking Loop

Track the health and milestones of background processes smoothly without locking browser execution pools:

- Durable Hook Subscription: Pass the saved job identifiers into Trigger.dev's native client tracking listener hook component directly inside the sidebar layout:

typescript
const { run, isFinished, error } = useRealtimeRun(runningJob.runId, {
  accessToken: runningJob.publicToken,
  enabled: !!runningJob.runId
});
Use code with caution.

- Interactive Input Locking: While the evaluation check indicates an active execution runtime (isFinished === false), keep the text input Textarea card disabled and render a spinning loader animation directly on the main button.

- Simulation Handshake Teardown: The moment the monitoring hook registers a successful runtime completion status:Append an official, structured response block into the aiChatMessages storage list setting the role field to 'assistant' and text content to: "Chaos simulation sequence executed successfully. Inspect highlighted nodes for degradation traces."Reset the tracking state references clean to null to release layout locks.

3. Real-Time Canvas Synchronization (Zero Manual Overwrites)

Adhere strictly to decoupled, state-driven real-time updates across the workspace area bounds:

- Implicit React Flow Reflection: Do not write complex client-side element splicing scripts inside the sidebar message handlers to adjust positions or properties.

- Liveblocks Single Source of Truth: Because the headless background runner mutates the server-side room storage object properties directly over WebSockets, rely exclusively on the root <LiveblocksProvider> and the custom canvas useLiveblocksFlow sync layer to project updates onto the grid. Downstream microservice node alert states, latency numbers, and border glow modulations will project onto the screen automatically as values shift.

4. Contextual Status Bar Indicators

Provide real-time progress feedback directly above the user entry console block:

- Placement Matrix: Float a compact, clean text ribbon banner precisely atop the lowest textarea dashboard tier, displaying strictly when a background run tracker job is active.

- Live Status Injection: Pull the absolute latest element from the aiStatusMessages list channel. Display the text string (e.g., "[APPLYING] Ramping error rates on database_primary...") styled using our muted typography standard tokens.

- Takedown Logic: Automatically collapse or unmount this tracking row notification completely when the active Trigger.dev run flags completion.

## Check When Done

- Submitting a failure trigger successfully pipes conversational lines into the room layout and initiates background jobs.The Trigger.dev real-time hook accurately locks down user controls during simulation calculations.Canvas degradation states, error percentages, and latency metrics refresh automatically via Liveblocks hooks.Active simulation status tracking strings render cleanly without altering surrounding layout panels.The application architecture passes compilation tests (npm run build) with zero broken type parameters or script linter notifications.