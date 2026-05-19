import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

export async function POST() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const liveblocksSecret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!liveblocksSecret) {
    console.error("Missing LIVEBLOCKS_SECRET_KEY");
    return new Response("Server configuration error", { status: 500 });
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

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
