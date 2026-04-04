import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase-Konfiguration via Vite-Umgebungsvariablen
// Füge VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY zu deiner .env.local hinzu
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true wenn Supabase konfiguriert ist, false im reinen Demo-Modus */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/** Supabase-Client — null wenn nicht konfiguriert */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '[Legal Buddy] Supabase nicht konfiguriert. App läuft im Demo-Modus.\n' +
    'Füge VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY zur .env.local hinzu.'
  );
}
