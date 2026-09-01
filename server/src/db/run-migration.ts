/**
 * run-migration.ts
 * Runs the generated SQL migration directly to Supabase
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }

  console.log('🔌 Connecting to Supabase...');
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    connect_timeout: 30,
    idle_timeout: 30,
    max: 1,
  });

  try {
    // Read the migration SQL file
    const migrationFile = join(__dirname, 'migrations', '0000_talented_marvel_apes.sql');
    const migrationSql = readFileSync(migrationFile, 'utf-8');

    // Split on the statement-breakpoint comment and run each statement
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`📄 Running ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`  [${i + 1}/${statements.length}] ${stmt.split('\n')[0].substring(0, 60)}...`);
      await sql.unsafe(stmt);
    }

    console.log('✅ Migration applied successfully!');
    console.log('   9 tables created in Supabase PostgreSQL');

    await sql.end();
    process.exit(0);
  } catch (err: any) {
    // If table already exists, that's OK — migration already ran
    if (err.code === '42P07') {
      console.log('ℹ️  Tables already exist — migration already applied.');
      await sql.end();
      process.exit(0);
    }
    console.error('❌ Migration failed:', err.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
