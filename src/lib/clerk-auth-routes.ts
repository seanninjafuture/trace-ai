/** App-hosted Clerk auth paths (must match catch-all routes under src/app). */
export const CLERK_SIGN_IN_PATH = "/sign-in";
export const CLERK_SIGN_UP_PATH = "/sign-up";

export const clerkSignInProps = {
  routing: "path" as const,
  path: CLERK_SIGN_IN_PATH,
  signUpUrl: CLERK_SIGN_UP_PATH,
};

export const clerkSignUpProps = {
  routing: "path" as const,
  path: CLERK_SIGN_UP_PATH,
  signInUrl: CLERK_SIGN_IN_PATH,
};
