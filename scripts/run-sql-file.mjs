import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/run-sql-file.mjs <path-to.sql>");
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), sqlFile), "utf8");
const envPath = resolve(process.cwd(), ".env.local");
const envFile = readFileSync(envPath, "utf8");

for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const result = spawnSync(
  "npx",
  ["prisma", "db", "execute", "--stdin", "--schema", "prisma/schema.prisma"],
  {
    input: sql,
    stdio: ["pipe", "inherit", "inherit"],
    env: process.env,
    shell: true,
  }
);

process.exit(result.status ?? 1);
