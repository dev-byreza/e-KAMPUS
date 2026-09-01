/**
 * find-region.ts
 * Try all Supabase pooler regions to find the right one
 */
import 'dotenv/config';
import postgres from 'postgres';

const REF = 'plugulsqfukuloymvpwn';
const PASS = 'laAjEehxyNXa8qhZ';

const REGIONS = [
  'aws-0-ap-southeast-1',
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-eu-central-1',
  'aws-0-eu-west-1',
  'aws-0-ap-northeast-1',
  'aws-0-ap-south-1',
  'aws-0-sa-east-1',
];

async function tryRegion(region: string) {
  const url = `postgresql://postgres.${REF}:${PASS}@${region}.pooler.supabase.com:6543/postgres`;
  const client = postgres(url, { ssl: 'require', connect_timeout: 8, max: 1 });
  try {
    await client`SELECT 1`;
    console.log(`✅ FOUND: ${region}`);
    console.log(`   URL: ${url}`);
    await client.end();
    return region;
  } catch (e: any) {
    console.log(`   ✗ ${region} — ${e.code || e.message?.substring(0, 50)}`);
    await client.end().catch(() => {});
    return null;
  }
}

async function findRegion() {
  console.log('🔍 Scanning Supabase pooler regions...\n');
  for (const region of REGIONS) {
    const found = await tryRegion(region);
    if (found) process.exit(0);
  }
  console.log('\n❌ No region found. Please check Supabase Dashboard for the correct pooler URL.');
  process.exit(1);
}

findRegion();
