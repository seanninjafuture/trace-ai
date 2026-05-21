import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/** NVIDIA Nemotron 3 Nano Omni (free) on OpenRouter — multimodal, 256K context. */
export const NEMOTRON_OMNI_FREE_MODEL_ID =
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free" as const;

export function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return createOpenRouter({ apiKey });
}

export function nemotronOmniFreeModel() {
  return createOpenRouterClient()(NEMOTRON_OMNI_FREE_MODEL_ID);
}
