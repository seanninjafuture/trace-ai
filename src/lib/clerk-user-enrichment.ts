import { clerkClient } from "@clerk/nextjs/server";

export type ClerkProfile = {
  displayName: string | null;
  imageUrl: string | null;
};

function resolveClerkDisplayName(user: {
  fullName: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}): string | null {
  if (user.fullName && user.fullName.trim().length > 0) {
    return user.fullName;
  }

  const parts = [user.firstName, user.lastName].filter(
    (part): part is string => Boolean(part && part.trim().length > 0)
  );

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user.username;
}

function resolvePrimaryEmail(user: {
  primaryEmailAddress: { emailAddress: string } | null;
  emailAddresses: { emailAddress: string }[];
}): string | null {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function fetchClerkProfileByUserId(
  userId: string
): Promise<ClerkProfile | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return {
      displayName: resolveClerkDisplayName(user),
      imageUrl: user.imageUrl,
    };
  } catch {
    return null;
  }
}

/** Batch-resolve Clerk profiles for collaborator emails (case-insensitive keys). */
export async function fetchClerkProfilesByEmails(
  emails: string[]
): Promise<Map<string, ClerkProfile>> {
  const normalized = [
    ...new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    ),
  ];

  if (normalized.length === 0) {
    return new Map();
  }

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    emailAddress: normalized,
    limit: Math.min(normalized.length, 100),
  });

  const profiles = new Map<string, ClerkProfile>();

  for (const user of users) {
    const email = resolvePrimaryEmail(user);
    if (!email) continue;

    profiles.set(email.trim().toLowerCase(), {
      displayName: resolveClerkDisplayName(user),
      imageUrl: user.imageUrl,
    });
  }

  return profiles;
}
