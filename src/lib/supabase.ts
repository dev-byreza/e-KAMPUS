import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diset di .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket untuk file PDF mahasiswa
export const PDF_BUCKET = 'pdf-berkas';

/**
 * Upload file PDF ke Supabase Storage
 * Path: pdf-berkas/{offeringId}/{nim}_v{version}.pdf
 * Returns: public URL atau null jika gagal
 */
export async function uploadPdfToStorage(
  file: File,
  offeringId: string,
  nim: string,
  version: number
): Promise<string | null> {
  const safeName = `${nim}_v${version}.pdf`;
  const path = `${offeringId}/${safeName}`;

  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: 'application/pdf',
      cacheControl: '3600',
    });

  if (error) {
    console.error('❌ Supabase Storage upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(PDF_BUCKET)
    .getPublicUrl(path);

  return urlData?.publicUrl ?? null;
}
