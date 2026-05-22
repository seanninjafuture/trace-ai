"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

const MAX_VISIBLE_COLLABORATORS = 5;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type CollaboratorAvatarProps = {
  name: string;
  avatar: string;
  isThinking: boolean;
};

function CollaboratorAvatar({ name, avatar, isThinking }: CollaboratorAvatarProps) {
  const initials = getInitials(name);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = avatar.trim().length > 0 && !imageFailed;

  return (
    <div
      className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-zinc-950"
      title={name}
      aria-label={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- Clerk/Liveblocks avatar URLs are external
        <img
          src={avatar}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-[10px] font-medium uppercase text-zinc-200">
          {initials}
        </span>
      )}
      {isThinking ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-zinc-950 ring-1 ring-zinc-800">
          <Loader2
            className="size-2.5 animate-spin text-accent-primary"
            aria-label={`${name} is simulating`}
          />
        </span>
      ) : null}
    </div>
  );
}

export function PresenceBar() {
  const { user } = useUser();
  const others = useOthers();

  const collaborators = useMemo(
    () => others.filter((other) => other.id !== user?.id),
    [others, user?.id]
  );

  const visible = collaborators.slice(0, MAX_VISIBLE_COLLABORATORS);
  const overflowCount = collaborators.length - visible.length;
  const showDivider = collaborators.length >= 1;

  return (
    <div
      className="pointer-events-auto absolute top-4 right-4 z-50 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 p-1.5 backdrop-blur-md"
      aria-label="Collaborators in this room"
    >
      {visible.length > 0 ? (
        <div className="flex -space-x-2">
          {visible.map((other) => (
            <CollaboratorAvatar
              key={other.connectionId}
              name={other.info.name}
              avatar={other.info.avatar}
              isThinking={other.presence.isThinking}
            />
          ))}
          {overflowCount > 0 ? (
            <div
              className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300 ring-2 ring-zinc-950"
              title={`${overflowCount} more collaborator${overflowCount === 1 ? "" : "s"}`}
            >
              +{overflowCount}
            </div>
          ) : null}
        </div>
      ) : null}

      {showDivider ? (
        <div className="h-4 w-px shrink-0 bg-zinc-800" aria-hidden />
      ) : null}

      <UserButton />
    </div>
  );
}
