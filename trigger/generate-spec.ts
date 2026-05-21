import { generateText } from "ai";
import { metadata, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

import { buildSpecSystemPrompt } from "../src/lib/spec-agent/build-spec-system-prompt";
import { specGenerationModel } from "../src/lib/google-ai";
import { archiveProjectSpec } from "../src/lib/spec-persistence";

export const GenerateSpecInputSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(z.any()),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export type GenerateSpecInput = z.infer<typeof GenerateSpecInputSchema>;

async function reportSpecProgress(
  status: string,
  completionPercent: number
): Promise<void> {
  metadata.set("status", status).set("completionPercent", completionPercent);
}

export const generateSpecTask = schemaTask({
  id: "generate-spec-task",
  schema: GenerateSpecInputSchema,
  run: async (payload) => {
    const { roomId, chatHistory, nodes, edges } = payload;

    console.log(
      `[Trace Spec Generation]: project=${payload.projectId} room=${roomId}`
    );

    await reportSpecProgress("analyzing_topology", 10);

    const system = buildSpecSystemPrompt({ chatHistory, nodes, edges });

    await reportSpecProgress("parsing_chat", 35);

    await reportSpecProgress("compiling_playbook", 65);

    const { text } = await generateText({
      model: specGenerationModel(),
      system,
      prompt: [
        "Compile the Incident Post-Mortem and Recovery Playbook Specification Document",
        "from the topology and chat context above.",
        "Use clear Markdown headings, tables where helpful, and actionable recovery steps.",
      ].join(" "),
    });

    await reportSpecProgress("finalizing", 90);

    const markdown = text.trim();
    if (!markdown) {
      throw new Error("Spec generation returned empty markdown");
    }

    await reportSpecProgress("archiving", 95);

    const { specId } = await archiveProjectSpec(payload.projectId, markdown);

    await reportSpecProgress("completed", 100);

    return { specId, markdown };
  },
});
