Clerk is already installed and connected. Wire it into the NExt.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Use Clerk's `dark` theme from `@clerk/ui/themes` as the base.

Override Clerk appearance variables using the app's existing CSS variables. Do not harcode colors.

## Sign-in and sign-up pages:

- large screens: simple two panel layout
- left: compact logo, tagline, short text only feature list
- right: centered Clerk form
- small screens: form only
- no gradients
- no oversized hero sections
- no feature cards
- no scroll heavy layouts

Keep the layout minimal and professional.

# Authentication & Access Control

- Webhook Syncing (User Provisioning)

    - Create a Next.js Route Handler at `src/app/api/webhooks/clerk/route.ts`.
    - Listen for `user.created`, `user.updated`, and `user.deleted` events.
    - Use `svix` to verify incoming webhook signatures.
    - Database Sync: Mirror the User records (Id, email, avatar URL, display name) directly into your PostgreSQL instance via Prisma.
    - Invariant: Failing to sync a user profile must return a 5xx error code to allow Clerk to retry the webhook payload delivery automatically.

- Token Augmentation for Liveblocks

    - Create an authorization route handler at `src/app/api/liveblocks-auth/route.ts`.
    - Protect this endpoint with Clerk's root user token check `(auth())`.
    - Extract the current user's authenticated email, name, and avatar from Clerk.
    - Pass these verified details downstream into the Liveblocks token session handler to populate the workspace's presence cursor layer safely.

- Proxy Routing Safety (proxy.ts)

    - Ensure your proxy engine explicitly strips or intercepts Clerk's JWT tokens (__session cookies) before routing traffic to any background background/simulation tasks.
    - The proxy layer must always forward the Authorization: Bearer <clerk_token> header directly to the edge optimization endpoints.

## Implementation

Wrap the root layout with `ClerkProvider` using Clerk's `dark` theme.

Create sign-in and sign-up pages using Clerk components.

Use `proxy.ts` (not `middleware.ts`). Place it at the project root when using `app/`, or at `src/proxy.ts` when using `src/app/` (same level as the `app` directory).

Define public routes using the existing sign-in and sign-up env vars. Protect everything else by default.

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `/sign-in`

Add Clerk's built in `UserButton` to the editor navbar right section for profile settings and logout.

Keep Clerk's default user menu and profile flows intact. Do not rebuild or heavily customize Clerk internals.

Use existing Clerk env vars. Do not rename or invent new ones.

## Dependencies

install: @clerk/ui.
install: npm install svix @clerk/nextjs

## Check When Done

- `proxy.ts` exists at the project root or `src/proxy.ts` (when using `src/app/`)
- All workspace views are strictly locked down unless a valid Clerk session exists.
- Webhook processing safely mirrors user profile updates directly to PostgreSQL.
- Liveblocks auth endpoint safely pulls user data from the Clerk session state.
- Clerk's appearance configuration uses app CSS variables (var(--bg-base), etc.).
- all routes are protected except public auth paths
- auth pages use CSS variables with no hardcoded colors
- `ClerkProvider` wraps the root layout
- `npm run build` passes