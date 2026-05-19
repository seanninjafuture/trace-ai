import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

type LiveblocksAuthBody = {
  room?: string;
};

export async function POST(req: Request) {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const liveblocksSecret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!liveblocksSecret) {
    console.error("Missing LIVEBLOCKS_SECRET_KEY");
    return new Response("Server configuration error", { status: 500 });
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

  const liveblocks = new Liveblocks({
    secret: liveblocksSecret,
  });

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;
  const name =
    user?.fullName ??
    ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous");
  const avatar = user?.imageUrl;

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      email: email ?? "",
      avatar: avatar ?? "",
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
