import { LiveblocksError } from "@liveblocks/node";

import { getLiveblocksClient } from "@/lib/liveblocks";

/**
 * Liveblocks REST mutations require the room to exist server-side.
 * Browser `RoomProvider` does not create the room until connect — the chaos
 * worker must call this before `getStorageDocument` / `mutateStorage`.
 */
export async function ensureLiveblocksRoom(roomId: string): Promise<void> {
  const trimmed = roomId.trim();
  if (!trimmed) {
    throw new Error("Liveblocks room id is required.");
  }

  const client = getLiveblocksClient();

  try {
    await client.getOrCreateRoom(trimmed, {
      defaultAccesses: [],
      metadata: {
        traceCanvas: "true",
      },
    });
  } catch (error) {
    if (error instanceof LiveblocksError) {
      throw new Error(
        `Liveblocks room "${trimmed}" could not be created (${error.status}): ${error.message}`
      );
    }
    throw error;
  }
}
