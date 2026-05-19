import { auth, currentUser } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensureClerkUserInDatabase } from "@/server/actions/sync-clerk-user";

export const UNTITLED_PROJECT_NAME = "Untitled Project";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function requireAuthenticatedUserId(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return { response: unauthorizedResponse() };
  }

  return { userId };
}

export async function requireAuthenticatedUserInDatabase(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const authResult = await requireAuthenticatedUserId();
  if ("response" in authResult) {
    return authResult;
  }

  try {
    await ensureClerkUserInDatabase(authResult.userId);
  } catch (error) {
    console.error("Failed to sync Clerk user to database", error);
    return {
      response: NextResponse.json(
        { error: "Could not sync user profile" },
        { status: 500 }
      ),
    };
  }

  return authResult;
}

export async function getVerifiedUserEmail(): Promise<string | null> {
  const user = await currentUser();
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null
  );
}

export function resolveProjectName(name: unknown): string {
  if (typeof name === "string" && name.trim().length > 0) {
    return name.trim();
  }

  return UNTITLED_PROJECT_NAME;
}

export function parseOptionalDescription(description: unknown): string | null {
  if (typeof description !== "string") {
    return null;
  }

  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function listProjectsForUser(userId: string, email: string | null) {
  const orConditions: Prisma.ProjectWhereInput[] = [{ ownerId: userId }];

  if (email) {
    orConditions.push({
      collaborators: {
        some: { collaboratorEmail: email },
      },
    });
  }

  return prisma.project.findMany({
    where: { OR: orConditions },
    orderBy: { createdAt: "desc" },
  });
}

export async function requireProjectOwner(
  projectId: string,
  userId: string
): Promise<{ ownerId: string } | { response: NextResponse }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return {
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  if (project.ownerId !== userId) {
    return { response: forbiddenResponse() };
  }

  return project;
}
