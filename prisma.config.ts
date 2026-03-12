import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    // CLI commands like 'migrate' will use this.
    // It should be the Direct URL because Accelerate pooled URLs don't support migrations.
    url: env('DIRECT_DATABASE_URL'),
  },
});
