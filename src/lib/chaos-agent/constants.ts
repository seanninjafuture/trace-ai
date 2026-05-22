/** Stable Liveblocks user id for the background chaos agent. */
export const CHAOS_AGENT_USER_ID = "ai-agent" as const;

export const CHAOS_AGENT_DISPLAY_NAME = "Trace AI" as const;

/** Presence TTL (seconds) while the agent run is active. */
export const CHAOS_AGENT_PRESENCE_TTL_SECONDS = 300;

export const AGENT_ACTIVITY_START =
  "[START]: Trace AI Agent initializing chaos matrix...";

export const AGENT_ACTIVITY_PROCESSING =
  "[PROCESSING]: Calculating downstream cascading latency vectors across API channels...";
