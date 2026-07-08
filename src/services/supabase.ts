import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL    ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Cliente Supabase tipado con el schema de la app.
 *
 * Requiere que `.env.local` contenga:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 *
 * Si las variables no están configuradas, el cliente existe pero
 * todas las llamadas fallarán con error de red.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Flag para saber si Supabase está configurado.
 * Usar en servicios para ofrecer fallback a datos locales.
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
