"use client";

import { useOthers } from "@liveblocks/react";
import { useMemo } from "react";

/** True when any connected peer (including the chaos agent) has `isThinking` set. */
export function useRoomIsThinking(): boolean {
  const others = useOthers();

  return useMemo(
    () => others.some((other) => other.presence.isThinking),
    [others]
  );
}
