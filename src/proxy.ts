import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getClerkPublicRoutePatterns } from "@/lib/clerk-public-routes";

const isPublicRoute = createRouteMatcher(getClerkPublicRoutePatterns());

const isEdgeOptimizationRoute = createRouteMatcher(["/api/ai(.*)"]);

const isBackgroundSimulationRoute = createRouteMatcher([
  "/api/simulation(.*)",
  "/api/trigger(.*)",
]);

function stripSessionCookie(request: Request): Headers {
  const headers = new Headers(request.headers);
  const cookie = headers.get("cookie");

  if (!cookie) {
    return headers;
  }

  const filtered = cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("__session="))
    .join("; ");

  if (filtered) {
    headers.set("cookie", filtered);
  } else {
    headers.delete("cookie");
  }

  return headers;
}

export default clerkMiddleware(async (auth, req) => {
  if (isBackgroundSimulationRoute(req)) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }

    return NextResponse.next({
      request: { headers: stripSessionCookie(req) },
    });
  }

  if (isEdgeOptimizationRoute(req)) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }

    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
