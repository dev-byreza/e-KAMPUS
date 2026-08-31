/**
 * seed.ts — Populate Supabase PostgreSQL with master data
 * Run with: npm run db:seed
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { schema, students, offerings, practiceVersions, auditEvents } from './schema';
import { SEED_STUDENTS, SEED_OFFERINGS, SEED_PRACTICE_VERSIONS } from './seedData';

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env');
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  console.log('🌱 Seeding database...');

  // ── Students ──────────────────────────────────────────────────
  console.log(`  → Inserting ${SEED_STUDENTS.length} students...`);
  for (const s of SEED_STUDENTS) {
    await db
      .insert(students)
      .values(s)
      .onConflictDoUpdate({ target: students.id, set: { nim: s.nim, name: s.name, class: s.class } });
  }

  // ── Offerings ─────────────────────────────────────────────────
  console.log(`  → Inserting ${SEED_OFFERINGS.length} offerings...`);
  for (const o of SEED_OFFERINGS) {
    await db
      .insert(offerings)
      .values(o as any)
      .onConflictDoUpdate({ target: offerings.id, set: o as any });
  }

  // ── Practice Versions ─────────────────────────────────────────
  console.log(`  → Inserting ${SEED_PRACTICE_VERSIONS.length} practice versions...`);
  for (const pv of SEED_PRACTICE_VERSIONS) {
    await db
      .insert(practiceVersions)
      .values(pv as any)
      .onConflictDoUpdate({ target: practiceVersions.id, set: pv as any });
  }

  // ── Audit log ─────────────────────────────────────────────────
  await db.insert(auditEvents).values({
    id: `audit-seed-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'System Seed Script',
    action: 'seed_database',
    targetType: 'system',
    targetId: 'all',
    details: `Database seeded: ${SEED_STUDENTS.length} students, ${SEED_OFFERINGS.length} offerings, ${SEED_PRACTICE_VERSIONS.length} practice versions.`,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   Students   : ${SEED_STUDENTS.length}`);
  console.log(`   Offerings  : ${SEED_OFFERINGS.length}`);
  console.log(`   PV versions: ${SEED_PRACTICE_VERSIONS.length}`);

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
