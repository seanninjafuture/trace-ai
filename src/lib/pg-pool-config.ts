import type { PoolConfig } from "pg";

const LOCAL_HOST_PATTERN = /(?:localhost|127\.0\.0\.1)/;

/**
 * Supabase pooler URLs use TLS. On some hosts (notably Windows) Node's pg driver
 * rejects the chain unless rejectUnauthorized is relaxed. Set
 * DATABASE_SSL_REJECT_UNAUTHORIZED=true to enforce strict verification.
 */
export function createPgPoolConfig(connectionString: string): PoolConfig {
  if (LOCAL_HOST_PATTERN.test(connectionString)) {
    return { connectionString };
  }

  const strictSsl = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";

  return {
    connectionString,
    ssl: { rejectUnauthorized: strictSsl },
  };
}
