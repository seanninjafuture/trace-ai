"use client";

import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function SimulationSidebar() {
  return (
    <aside
      className={cn(
        "flex w-80 shrink-0 flex-col border-l border-border-default bg-bg-base"
      )}
    >
      <Tabs defaultValue="chaos" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="border-b border-border-default px-4 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="chaos" className="flex-1">
              Chaos Trigger
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="flex-1">
              Live Telemetry
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="chaos"
          className="flex flex-1 flex-col gap-4 p-4 data-[orientation=horizontal]:mt-0"
        >
          <Textarea
            placeholder="Describe a system failure scenario..."
            className="min-h-32 flex-1 resize-none"
          />
          <Button type="button" className="w-full gap-2">
            <Flame className="size-4" />
            Inject Chaos
          </Button>
        </TabsContent>

        <TabsContent
          value="telemetry"
          className="flex flex-1 p-4 data-[orientation=horizontal]:mt-0"
        >
          <Card className="flex w-full flex-1 rounded-lg bg-bg-base ring-border-default">
            <CardContent className="flex flex-1 items-center justify-center p-6">
              <p className="text-center text-sm text-text-muted">
                No active failure simulation running.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
