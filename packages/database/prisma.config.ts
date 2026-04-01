import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

loadEnv({ path: resolve(process.cwd(), '../../.env') });
loadEnv();

// `prisma generate` does not need a live database connection, but CI checks run
// in clean environments where DATABASE_URL is intentionally absent.
const DEFAULT_DATABASE_URL =
  'postgresql://postgres:postgres@ci-placeholder.invalid:5432/logistica_ci';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL,
  },
});
