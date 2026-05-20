import { Liveblocks } from "@liveblocks/node";

/** Eight accent tokens that contrast with `--bg-base` (see `globals.css`). */
export const USER_COLOR_PALETTE = [
  "var(--user-color-1)",
  "var(--user-color-2)",
  "var(--user-color-3)",
  "var(--user-color-4)",
  "var(--user-color-5)",
  "var(--user-color-6)",
  "var(--user-color-7)",
  "var(--user-color-8)",
] as const;

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }

  return new Liveblocks({ secret });
}

export function getLiveblocksClient(): Liveblocks {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = createLiveblocksClient();
  }

  return globalForLiveblocks.liveblocks;
}

function hashUserIdToPaletteIndex(userId: string): number {
  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % USER_COLOR_PALETTE.length;
}

/** Maps a stable user id (Clerk id or `ai-agent`) to a session color token. */
export function assignUserColor(userId: string): string {
  return USER_COLOR_PALETTE[hashUserIdToPaletteIndex(userId)]!;
}
