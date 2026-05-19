import { parse, toClientConfig } from "pg-connection-string";
import type { PoolConfig } from "pg";

const LOCAL_HOST_PATTERN = /(?:localhost|127\.0\.0\.1)/;

/**
 * Build a `pg` pool config for Prisma's driver adapter.
 *
 * Supabase URLs include `sslmode=require`. With default pg-connection-string
 * parsing that becomes `ssl: {}`, which still verifies the chain and fails on
 * Windows ("self-signed certificate in certificate chain"). libpq-compat parsing
 * maps `require` → `rejectUnauthorized: false` unless strict mode is requested.
 */
export function createPgPoolConfig(connectionString: string): PoolConfig {
  if (LOCAL_HOST_PATTERN.test(connectionString)) {
    return { connectionString };
  }

  const strictSsl = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";

  if (strictSsl) {
    return { connectionString };
  }

  const parsed = parse(connectionString, {
    useLibpqCompat: true,
  });

  delete parsed.sslmode;

  const config = toClientConfig(parsed) as PoolConfig;

  if (config.ssl === false) {
    config.ssl = { rejectUnauthorized: false };
  } else if (config.ssl && typeof config.ssl === "object") {
    config.ssl = { ...config.ssl, rejectUnauthorized: false };
  } else {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}
