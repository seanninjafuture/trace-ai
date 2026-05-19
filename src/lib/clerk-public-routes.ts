/** Normalize Clerk env URLs (absolute or relative) to pathname-only route patterns. */
function normalizeAuthPath(urlOrPath: string): string {
  const trimmed = urlOrPath.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname.replace(/\/$/, "") || "/";
    } catch {
      return "/";
    }
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return path.replace(/\/$/, "") || "/";
}

function toRoutePattern(urlOrPath: string): string {
  const pathname = normalizeAuthPath(urlOrPath);
  if (pathname === "/") {
    return "/";
  }
  return `${pathname}(.*)`;
}

export function getClerkPublicRoutePatterns(): string[] {
  const signIn =
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
  const signUp =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

  return [
    "/",
    toRoutePattern(signIn),
    toRoutePattern(signUp),
    "/api/webhooks/clerk(.*)",
  ];
}
