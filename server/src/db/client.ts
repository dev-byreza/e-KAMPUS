import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { schema } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL tidak ditemukan.\n' +
    'Buat file .env di root project dan isi:\n' +
    'DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-...pooler.supabase.com:6543/postgres'
  );
}

// Use postgres-js driver — compatible with Supabase Transaction Pooler
const client = postgres(process.env.DATABASE_URL, {
  // For serverless/short-lived connections
  prepare: false,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;
