"use client";

import { AiAgentStatus } from "@/components/editor/ai-sidebar/ai-agent-status";
import { AiArchitectTab } from "@/components/editor/ai-sidebar/ai-architect-tab";
import { AiSpecsTab } from "@/components/editor/ai-sidebar/ai-specs-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectSpecSummary } from "@/types/project-spec";

const tabTriggerClass = cn(
  "rounded-md border-transparent px-2 py-1.5 text-sm font-medium shadow-none",
  "text-text-muted hover:text-text-primary",
  "data-active:bg-accent-primary data-active:text-zinc-950 data-active:shadow-none",
  "dark:data-active:border-transparent dark:data-active:bg-accent-primary dark:data-active:text-zinc-950"
);

type AiSidebarTabsProps = {
  projectId?: string;
  roomId?: string;
  projectSpecs?: ProjectSpecSummary[];
  isSimulationRunning?: boolean;
  showSimulationStatusRibbon?: boolean;
  simulationError?: string | null;
  onStartChaosSimulation?: (prompt: string) => Promise<void>;
};

export function AiSidebarTabs({
  projectId,
  roomId,
  projectSpecs = [],
  isSimulationRunning = false,
  showSimulationStatusRibbon = false,
  simulationError = null,
  onStartChaosSimulation,
}: AiSidebarTabsProps) {
  return (
    <Tabs defaultValue="architect" className="flex min-h-0 flex-1 flex-col">
      <AiAgentStatus />
      <div className="shrink-0 border-b border-border-default px-4 pb-3">
        <TabsList
          className={cn(
            "grid h-9 w-full grid-cols-2 gap-1 rounded-lg bg-bg-base/80 p-1"
          )}
        >
          <TabsTrigger value="architect" className={tabTriggerClass}>
            AI Architect
          </TabsTrigger>
          <TabsTrigger value="specs" className={tabTriggerClass}>
            Specs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="architect"
        className="mt-0 flex min-h-0 flex-1 flex-col data-[orientation=horizontal]:mt-0"
      >
        <AiArchitectTab
          projectId={projectId}
          roomId={roomId}
          isSimulationRunning={isSimulationRunning}
          showSimulationStatusRibbon={showSimulationStatusRibbon}
          simulationError={simulationError}
          onStartChaosSimulation={onStartChaosSimulation}
        />
      </TabsContent>

      <TabsContent
        value="specs"
        className="mt-0 flex min-h-0 flex-1 flex-col overflow-auto data-[orientation=horizontal]:mt-0"
      >
        <AiSpecsTab projectId={projectId} specs={projectSpecs} />
      </TabsContent>
    </Tabs>
  );
}
