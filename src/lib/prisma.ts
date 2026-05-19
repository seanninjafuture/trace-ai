import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client";

import { createPgPoolConfig } from "@/lib/pg-pool-config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      datasourceUrl: databaseUrl,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  const adapter = new PrismaPg(createPgPoolConfig(databaseUrl));
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
