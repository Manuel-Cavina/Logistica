import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

loadEnv({ path: resolve(process.cwd(), '../../.env') });
loadEnv();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
