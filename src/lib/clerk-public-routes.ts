export function getClerkPublicRoutePatterns(): string[] {
  const signIn = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
  const signUp = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

  return ["/", `${signIn}(.*)`, `${signUp}(.*)`, "/api/webhooks/clerk(.*)"];
}
