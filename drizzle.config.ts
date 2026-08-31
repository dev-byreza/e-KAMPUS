import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './server/src/db/schema.ts',
  out: './server/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
