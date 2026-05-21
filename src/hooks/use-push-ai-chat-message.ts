"use client";

import { LiveList } from "@liveblocks/client";
import { useMutation } from "@liveblocks/react";

import {
  AIChatMessageSchema,
  type AIChatMessage,
} from "@/types/tasks";

export function usePushAiChatMessage() {
  return useMutation(
    ({ storage }, message: AIChatMessage) => {
      const validated = AIChatMessageSchema.parse(message);
      let chatMessages = storage.get("aiChatMessages");

      if (!chatMessages) {
        chatMessages = new LiveList<AIChatMessage>([]);
        storage.set("aiChatMessages", chatMessages);
      }

      chatMessages.push(validated);
    },
    []
  );
}
