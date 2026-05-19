import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

import { createPgPoolConfig } from "@/lib/pg-pool-config";

/** Bump when pool/SSL config changes so dev HMR does not reuse a stale client. */
const PRISMA_POOL_CONFIG_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPoolConfigVersion?: number;
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

  const pool = new pg.Pool(createPgPoolConfig(databaseUrl));
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaPoolConfigVersion !== PRISMA_POOL_CONFIG_VERSION
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPoolConfigVersion = PRISMA_POOL_CONFIG_VERSION;
}
