import { z } from "zod";

export const AIStatusMessageSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  step: z.enum([
    "idle",
    "initializing",
    "processing",
    "applying",
    "complete",
    "failed",
  ]),
  timestamp: z.number(),
});

export type AIStatusMessage = z.infer<typeof AIStatusMessageSchema>;

export function parseLatestAiStatusMessage(
  messages: readonly unknown[] | null | undefined
): AIStatusMessage | null {
  if (!messages?.length) {
    return null;
  }

  const parsed = AIStatusMessageSchema.safeParse(messages[messages.length - 1]);
  return parsed.success ? parsed.data : null;
}

export function formatAiStatusLabel(message: AIStatusMessage): string {
  const stepLabel = message.step.toUpperCase();
  return `[${stepLabel}] ${message.text}`;
}

export const AIChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  sender: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url(),
  }),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.number(),
});

export type AIChatMessage = z.infer<typeof AIChatMessageSchema>;

export function parseAiChatMessages(
  messages: readonly unknown[] | null | undefined
): AIChatMessage[] {
  if (!messages?.length) {
    return [];
  }

  const parsed: AIChatMessage[] = [];

  for (const item of messages) {
    const result = AIChatMessageSchema.safeParse(item);
    if (result.success) {
      parsed.push(result.data);
    }
  }

  return parsed.sort((a, b) => a.timestamp - b.timestamp);
}

const FALLBACK_AVATAR_BASE = "https://ui-avatars.com/api/";

/** Ensures avatar satisfies `AIChatMessageSchema` sender.avatar URL constraint. */
export function resolveChatAvatarUrl(
  avatar: string | undefined | null,
  name: string
): string {
  if (avatar?.trim()) {
    const check = z.string().url().safeParse(avatar.trim());
    if (check.success) {
      return check.data;
    }
  }

  const label = encodeURIComponent(name.trim() || "User");
  return `${FALLBACK_AVATAR_BASE}?name=${label}&background=27272a&color=f4f4f5`;
}
