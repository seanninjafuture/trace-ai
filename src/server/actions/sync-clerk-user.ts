import type { UserJSON } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

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

export async function deleteClerkUser(userId: string) {
  if (!userId) {
    return;
  }

  await prisma.user.deleteMany({
    where: { id: userId },
  });
}
