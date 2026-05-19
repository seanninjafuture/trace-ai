INSERT INTO "_prisma_migrations" (
  "id",
  "checksum",
  "finished_at",
  "migration_name",
  "logs",
  "rolled_back_at",
  "started_at",
  "applied_steps_count"
)
SELECT
  gen_random_uuid()::text,
  'afbac59c3c384c8c023acc818889f41b460e9189b85fd788ded8065db457b326',
  NOW(),
  '20250519120000_add_projects',
  NULL,
  NULL,
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations"
  WHERE "migration_name" = '20250519120000_add_projects'
);
