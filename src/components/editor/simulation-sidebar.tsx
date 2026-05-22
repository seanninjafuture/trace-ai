"use client";

import type { RealtimeRun } from "@trigger.dev/core/v3";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useCallback, useEffect, useRef, useState } from "react";

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

type ChaosRunOutput = {
  nodesMutatedCount?: number;
  nodesAddedCount?: number;
  edgesAddedCount?: number;
  mutationsApplied?: number;
};

type ChaosRunSnapshot = {
  id: string;
  status: string;
  finishedAt?: string | Date | null;
  output?: ChaosRunOutput;
  error?: unknown;
};

type RunningJob = {
  runId: string;
  publicToken: string;
  startedAt: number;
};

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "FAILED",
  "CANCELED",
  "CRASHED",
  "TIMED_OUT",
]);

const POLL_INTERVAL_MS = 2000;
const RUN_TIMEOUT_MS = 120_000;

type SimulationSidebarProps = {
  onClose?: () => void;
  projectId?: string;
  roomId?: string;
  projectSpecs?: ProjectSpecSummary[];
};

function buildAssistantChatMessage(
  roomId: string,
  content: string
): AIChatMessage {
  return {
    id: crypto.randomUUID(),
    roomId,
    sender: {
      id: "ai-agent",
      name: "Trace AI",
      avatar: resolveChatAvatarUrl(null, "Trace AI"),
    },
    role: "assistant",
    content,
    timestamp: Date.now(),
  };
}

function extractRunErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : null;
  }
  return null;
}

function buildAssistantReply(
  snapshot: ChaosRunSnapshot,
  monitorError?: Error
): string {
  if (monitorError) {
    return `Chaos simulation could not be monitored: ${monitorError.message}`;
  }

  const runError = extractRunErrorMessage(snapshot.error);
  if (runError) {
    if (/rate.?limit|429|quota|credit/i.test(runError)) {
      return `Chaos simulation failed (API limit): ${runError}. Try again later or add credits on OpenRouter.`;
    }
    return `Chaos simulation failed: ${runError}`;
  }

  if (snapshot.status === "FAILED") {
    return "Chaos simulation failed. Run `npm run trigger:dev` in a separate terminal and inspect the run in the Trigger.dev dashboard.";
  }

  if (snapshot.status === "CANCELED") {
    return "Chaos simulation was canceled.";
  }

  if (snapshot.status === "TIMED_OUT") {
    return "Chaos simulation timed out. The model or worker may be overloaded — try again with a shorter prompt.";
  }

  if (snapshot.status !== "COMPLETED") {
    return `Chaos simulation ended with status: ${snapshot.status}.`;
  }

  const output = snapshot.output;
  const nodesAdded = output?.nodesAddedCount ?? 0;
  const edgesAdded = output?.edgesAddedCount ?? 0;
  const nodesUpdated = output?.nodesMutatedCount ?? 0;

  if (nodesAdded === 0 && edgesAdded === 0 && nodesUpdated === 0) {
    return "Simulation finished but nothing was applied. Describe the system and failure in more detail (services, traffic, what breaks).";
  }

  const parts: string[] = [];
  if (nodesAdded > 0) {
    parts.push(`placed ${nodesAdded} service${nodesAdded === 1 ? "" : "s"}`);
  }
  if (edgesAdded > 0) {
    parts.push(`connected ${edgesAdded} link${edgesAdded === 1 ? "" : "s"}`);
  }
  if (nodesUpdated > 0) {
    parts.push(`updated ${nodesUpdated} node${nodesUpdated === 1 ? "" : "s"} for the scenario`);
  }

  return `Scenario complete: ${parts.join(", ")}. Check the canvas.`;
}

function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

function toSnapshot(
  run: RealtimeRun<typeof chaosAgentTask> | ChaosRunSnapshot
): ChaosRunSnapshot {
  return {
    id: run.id,
    status: run.status,
    finishedAt: run.finishedAt ?? null,
    output: run.output as ChaosRunOutput | undefined,
    error: "error" in run ? run.error : undefined,
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
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const completionHandledRef = useRef(false);
  const monitoredRunIdRef = useRef<string | null>(null);

  const pushAssistantReply = useCallback(
    (snapshot: ChaosRunSnapshot, err?: Error) => {
      if (!roomId) {
        return;
      }
      try {
        pushChatMessage(
          buildAssistantChatMessage(roomId, buildAssistantReply(snapshot, err))
        );
      } catch {
        // Liveblocks write failure should not block teardown
      }
    },
    [pushChatMessage, roomId]
  );

  const finalizeSimulation = useCallback(
    (snapshot: ChaosRunSnapshot, err?: Error) => {
      if (completionHandledRef.current) {
        return;
      }
      if (
        monitoredRunIdRef.current &&
        snapshot.id !== monitoredRunIdRef.current
      ) {
        return;
      }

      completionHandledRef.current = true;
      // Assistant replies are written by the Trigger worker into Liveblocks.
      setRunningJob(null);
      setIsStartingJob(false);
      setSimulationError(null);
    },
    [pushAssistantReply]
  );

  const { run, error: realtimeError } = useRealtimeRun<typeof chaosAgentTask>(
    runningJob?.runId,
    {
      id: runningJob?.runId,
      accessToken: runningJob?.publicToken,
      enabled: !!runningJob?.runId,
      onComplete: (completedRun, err) => {
        finalizeSimulation(toSnapshot(completedRun), err);
      },
    }
  );

  useEffect(() => {
    if (!runningJob?.runId || !run?.finishedAt) {
      return;
    }
    if (run.id !== runningJob.runId) {
      return;
    }
    if (!isTerminalStatus(run.status)) {
      return;
    }
    finalizeSimulation(toSnapshot(run), realtimeError);
  }, [finalizeSimulation, realtimeError, run, runningJob?.runId]);

  useEffect(() => {
    if (!runningJob?.runId) {
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/ai/design/run/${runningJob.runId}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ChaosRunSnapshot;
        if (!data.finishedAt || !isTerminalStatus(data.status)) {
          return;
        }
        if (data.id !== runningJob.runId) {
          return;
        }

        finalizeSimulation(data);
      } catch {
        // Polling is a fallback; realtime may still complete
      }
    };

    const interval = window.setInterval(() => {
      void pollStatus();
    }, POLL_INTERVAL_MS);

    void pollStatus();

    return () => {
      window.clearInterval(interval);
    };
  }, [finalizeSimulation, runningJob]);

  useEffect(() => {
    if (!runningJob) {
      return;
    }

    const elapsed = Date.now() - runningJob.startedAt;
    const delay = Math.max(0, RUN_TIMEOUT_MS - elapsed);

    const timeout = window.setTimeout(() => {
      if (completionHandledRef.current) {
        return;
      }

      setSimulationError(
        "Simulation is taking too long. Is `npm run trigger:dev` running? Check the Trigger.dev dashboard for a stuck or queued run."
      );
      finalizeSimulation({
        id: runningJob.runId,
        status: "TIMED_OUT",
        finishedAt: new Date().toISOString(),
      });
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [finalizeSimulation, runningJob]);

  const isFinished = Boolean(
    run?.id === runningJob?.runId && run?.finishedAt
  );
  const isSimulationRunning =
    isStartingJob || (!!runningJob && !isFinished);

  const startChaosSimulation = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isSimulationRunning) {
        return;
      }

      if (!projectId || !roomId) {
        setSimulationError(
          "Missing project or room context. Reload the project from the editor."
        );
        return;
      }

      setIsStartingJob(true);
      setSimulationError(null);
      completionHandledRef.current = false;
      monitoredRunIdRef.current = null;

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
          const message =
            data.error ?? `Failed to start chaos simulation (${response.status}).`;
          setSimulationError(message);
          pushAssistantReply(
            { id: "local", status: "FAILED", finishedAt: new Date().toISOString() },
            new Error(message)
          );
          setIsStartingJob(false);
          return;
        }

        const data = (await response.json()) as {
          runId?: string;
          publicToken?: string;
        };

        if (!data.runId || !data.publicToken) {
          const message = "Simulation API returned an incomplete job payload.";
          setSimulationError(message);
          pushAssistantReply(
            { id: "local", status: "FAILED", finishedAt: new Date().toISOString() },
            new Error(message)
          );
          setIsStartingJob(false);
          return;
        }

        monitoredRunIdRef.current = data.runId;
        setRunningJob({
          runId: data.runId,
          publicToken: data.publicToken,
          startedAt: Date.now(),
        });
        setIsStartingJob(false);
      } catch {
        const message = "Could not reach the simulation API.";
        setSimulationError(message);
        pushAssistantReply(
          { id: "local", status: "FAILED", finishedAt: new Date().toISOString() },
          new Error(message)
        );
        setIsStartingJob(false);
      }
    },
    [isSimulationRunning, projectId, pushAssistantReply, roomId]
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
        simulationError={simulationError}
        onStartChaosSimulation={startChaosSimulation}
      />
    </aside>
  );
}
