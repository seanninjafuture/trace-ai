"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useCallback, useRef, useState } from "react";

import { AiSidebarHeader } from "@/components/editor/ai-sidebar/ai-sidebar-header";
import { AiSidebarTabs } from "@/components/editor/ai-sidebar/ai-sidebar-tabs";
import { usePushAiChatMessage } from "@/hooks/use-push-ai-chat-message";
import { cn } from "@/lib/utils";
import {
  type AIChatMessage,
  resolveChatAvatarUrl,
} from "@/types/tasks";
import type { ProjectSpecSummary } from "@/types/project-spec";
import type { chaosAgentTask } from "@trigger/chaos-agent";

const CHAOS_ASSISTANT_REPLY =
  "Chaos simulation sequence executed successfully. Inspect highlighted nodes for degradation traces.";

type RunningJob = {
  runId: string;
  publicToken: string;
};

type SimulationSidebarProps = {
  onClose?: () => void;
  projectId?: string;
  roomId?: string;
  projectSpecs?: ProjectSpecSummary[];
};

function buildAssistantChatMessage(roomId: string): AIChatMessage {
  return {
    id: crypto.randomUUID(),
    roomId,
    sender: {
      id: "ai-agent",
      name: "Trace AI",
      avatar: resolveChatAvatarUrl(null, "Trace AI"),
    },
    role: "assistant",
    content: CHAOS_ASSISTANT_REPLY,
    timestamp: Date.now(),
  };
}

export function SimulationSidebar({
  onClose,
  projectId,
  roomId,
  projectSpecs = [],
}: SimulationSidebarProps) {
  const pushChatMessage = usePushAiChatMessage();
  const [runningJob, setRunningJob] = useState<RunningJob | null>(null);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const completionHandledRef = useRef(false);

  const { run } = useRealtimeRun<typeof chaosAgentTask>(runningJob?.runId, {
    accessToken: runningJob?.publicToken,
    enabled: !!runningJob?.runId,
    onComplete: (completedRun, err) => {
      if (completionHandledRef.current) {
        return;
      }
      completionHandledRef.current = true;

      if (!err && completedRun.status === "COMPLETED" && roomId) {
        try {
          pushChatMessage(buildAssistantChatMessage(roomId));
        } catch {
          // Liveblocks write failure should not block teardown
        }
      }

      setRunningJob(null);
      setIsStartingJob(false);
    },
  });

  const isFinished = Boolean(run?.finishedAt);
  const isSimulationRunning =
    isStartingJob || (!!runningJob && !isFinished);

  const startChaosSimulation = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isSimulationRunning || !projectId || !roomId) {
        return;
      }

      setIsStartingJob(true);
      completionHandledRef.current = false;

      try {
        const response = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            projectId,
            roomId,
          }),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          console.error(data.error ?? "Failed to start chaos simulation.");
          setIsStartingJob(false);
          return;
        }

        const data = (await response.json()) as {
          runId?: string;
          publicToken?: string;
        };

        if (!data.runId || !data.publicToken) {
          console.error("Simulation API returned an incomplete job payload.");
          setIsStartingJob(false);
          return;
        }

        setRunningJob({
          runId: data.runId,
          publicToken: data.publicToken,
        });
        setIsStartingJob(false);
      } catch {
        console.error("Could not reach the simulation API.");
        setIsStartingJob(false);
      }
    },
    [isSimulationRunning, projectId, roomId]
  );

  return (
    <aside
      className={cn(
        "flex w-80 shrink-0 flex-col",
        "border-l border-border-default bg-bg-surface shadow-2xl",
        "h-[calc(100vh-3.5rem)]"
      )}
    >
      <AiSidebarHeader onClose={onClose} />
      <AiSidebarTabs
        projectId={projectId}
        roomId={roomId}
        projectSpecs={projectSpecs}
        isSimulationRunning={isSimulationRunning}
        showSimulationStatusRibbon={!!runningJob && !isFinished}
        onStartChaosSimulation={startChaosSimulation}
      />
    </aside>
  );
}
