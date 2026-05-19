const ROOM_ID_PATTERN = /^[a-zA-Z0-9_:%@-]+$/;
const MAX_ROOM_ID_LENGTH = 128;

/**
 * Server-side room ACL until project membership is stored in Supabase (Prisma).
 * Room IDs must be namespaced to the authenticated Clerk userId.
 */
export function canUserAccessRoom(userId: string, roomId: string): boolean {
  if (!userId || !ROOM_ID_PATTERN.test(userId)) {
    return false;
  }

  if (!roomId || roomId.length > MAX_ROOM_ID_LENGTH) {
    return false;
  }

  if (!ROOM_ID_PATTERN.test(roomId)) {
    return false;
  }

  return roomId === userId || roomId.startsWith(`${userId}:`);
}
