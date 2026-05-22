"use client";

import { useState } from "react";

import type { AIChatMessage } from "@/types/tasks";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type ChatSenderAvatarProps = {
  name: string;
  avatar: string;
};

function ChatSenderAvatar({ name, avatar }: ChatSenderAvatarProps) {
  const initials = getInitials(name);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !imageFailed;

  return (
    <div
      className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-default bg-zinc-800"
      title={name}
      aria-hidden
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- Clerk / ui-avatars URLs are external
        <img
          src={avatar}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="text-[10px] font-medium uppercase text-zinc-200">
          {initials}
        </span>
      )}
    </div>
  );
}

type AiChatMessageBubbleProps = {
  message: AIChatMessage;
  isLocalUser: boolean;
};

export function AiChatMessageBubble({
  message,
  isLocalUser,
}: AiChatMessageBubbleProps) {
  return (
    <li
      className={cn(
        "flex items-end gap-2",
        isLocalUser ? "justify-end" : "justify-start"
      )}
    >
      {!isLocalUser ? (
        <ChatSenderAvatar
          name={message.sender.name}
          avatar={message.sender.avatar}
        />
      ) : null}
      <div
        className={cn(
          "max-w-[85%] p-3 text-sm text-text-primary",
          isLocalUser
            ? "rounded-l-lg rounded-tr-lg border border-blue-500/30 bg-blue-950/40"
            : "rounded-r-lg rounded-tl-lg border border-border-default bg-zinc-900/60"
        )}
      >
        {message.content}
      </div>
      {isLocalUser ? (
        <ChatSenderAvatar
          name={message.sender.name}
          avatar={message.sender.avatar}
        />
      ) : null}
    </li>
  );
}
