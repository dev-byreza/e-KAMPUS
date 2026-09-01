/**
 * create-bucket.ts
 * Creates 'pdf-berkas' public storage bucket in Supabase and sets up storage policies.
 */
import 'dotenv/config';
import postgres from 'postgres';

async function setupStorage() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env');
  }

  console.log('🔌 Connecting to Supabase database...');
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    connect_timeout: 15,
    max: 1,
  });

  try {
    console.log('📦 Creating public storage bucket "pdf-berkas"...');
    
    // 1. Create or update bucket in storage.buckets
    await sql`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'pdf-berkas',
        'pdf-berkas',
        true,
        20971520, -- 20 MB in bytes
        ARRAY['application/pdf']::text[]
      )
      ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 20971520,
        allowed_mime_types = ARRAY['application/pdf']::text[];
    `;
    console.log('  ✓ Bucket "pdf-berkas" created / updated');

    // 2. Setup RLS policies on storage.objects
    console.log('🛡️ Configuring storage RLS policies...');

    // Drop existing policies if any to avoid collision
    await sql`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read pdf-berkas') THEN
          DROP POLICY "Public Read pdf-berkas" ON storage.objects;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Insert pdf-berkas') THEN
          DROP POLICY "Public Insert pdf-berkas" ON storage.objects;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Update pdf-berkas') THEN
          DROP POLICY "Public Update pdf-berkas" ON storage.objects;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Delete pdf-berkas') THEN
          DROP POLICY "Public Delete pdf-berkas" ON storage.objects;
        END IF;
      END $$;
    `;

    // Create public access policies
    await sql`
      CREATE POLICY "Public Read pdf-berkas"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'pdf-berkas');
    `;
    console.log('  ✓ SELECT policy created');

    await sql`
      CREATE POLICY "Public Insert pdf-berkas"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'pdf-berkas');
    `;
    console.log('  ✓ INSERT policy created');

    await sql`
      CREATE POLICY "Public Update pdf-berkas"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'pdf-berkas');
    `;
    console.log('  ✓ UPDATE policy created');

    console.log('🎉 Supabase Storage "pdf-berkas" is fully configured and ready for uploads!');
    await sql.end();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to setup storage bucket:', err.message || err);
    await sql.end();
    process.exit(1);
  }
}

setupStorage();
