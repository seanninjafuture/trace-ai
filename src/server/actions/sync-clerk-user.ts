import { currentUser, type User, type UserJSON } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

function clerkUserRecord(user: Pick<User, "id" | "imageUrl" | "fullName" | "username" | "primaryEmailAddress" | "emailAddresses">) {
  return {
    id: user.id,
    email:
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null,
    avatarUrl: user.imageUrl,
    displayName: user.fullName ?? user.username ?? null,
  };
}

function getDisplayName(user: UserJSON): string | null {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user.username ?? null;
}

function getPrimaryEmail(user: UserJSON): string | null {
  const primaryId = user.primary_email_address_id;
  const primary = user.email_addresses.find(
    (address) => address.id === primaryId
  );

  return primary?.email_address ?? user.email_addresses[0]?.email_address ?? null;
}

export async function syncClerkUser(user: UserJSON) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: getPrimaryEmail(user),
      avatarUrl: user.image_url,
      displayName: getDisplayName(user),
    },
    update: {
      email: getPrimaryEmail(user),
      avatarUrl: user.image_url,
      displayName: getDisplayName(user),
    },
  });
}

/** Ensures the signed-in Clerk user exists in Postgres (webhook may lag in local dev). */
export async function ensureClerkUserInDatabase(userId: string): Promise<void> {
  const sessionUser = await currentUser();

  if (sessionUser?.id === userId) {
    const record = clerkUserRecord(sessionUser);
    await prisma.user.upsert({
      where: { id: userId },
      create: record,
      update: {
        email: record.email,
        avatarUrl: record.avatarUrl,
        displayName: record.displayName,
      },
    });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    await prisma.user.create({ data: { id: userId } });
  }
}

export async function deleteClerkUser(userId: string) {
  if (!userId) {
    return;
  }

  await prisma.user.deleteMany({
    where: { id: userId },
  });
}
