import { createGoogleGenerativeAI } from "@ai-sdk/google";

/** Gemini flash — spec / playbook generation via Google AI SDK. */
export const SPEC_GENERATION_MODEL_ID = "gemini-2.5-flash" as const;

export function createGoogleAiClient() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
  return createGoogleGenerativeAI({ apiKey });
}

export function specGenerationModel() {
  return createGoogleAiClient()(SPEC_GENERATION_MODEL_ID);
}
