import { auth, currentUser } from "@clerk/nextjs/server";

import { assignUserColor, getLiveblocksClient } from "@/lib/liveblocks";
import { evaluateProjectAccess } from "@/lib/project-access";

type LiveblocksAuthBody = {
  room?: string;
};

export async function POST(req: Request) {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let room: string;

  try {
    const body = (await req.json()) as LiveblocksAuthBody;
    room = typeof body.room === "string" ? body.room.trim() : "";
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!room) {
    return new Response("Missing room", { status: 400 });
  }

  const { authorized } = await evaluateProjectAccess(room);

  if (!authorized) {
    return new Response("Forbidden", { status: 403 });
  }

  let liveblocks;

  try {
    liveblocks = getLiveblocksClient();
  } catch {
    console.error("Missing LIVEBLOCKS_SECRET_KEY");
    return new Response("Server configuration error", { status: 500 });
  }

  const user = await currentUser();
  const name =
    user?.fullName ??
    ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous");
  const avatar = user?.imageUrl ?? "";

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      avatar,
      color: assignUserColor(userId),
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
