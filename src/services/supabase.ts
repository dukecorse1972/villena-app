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
 * Sin esas variables, `createClient` lanzaría al construirse (exige URL y
 * clave no vacías) — se le pasan valores de relleno solo para evitar ese
 * crash al arrancar. Ningún servicio debe usar este cliente sin comprobar
 * antes `isSupabaseConfigured`.
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);

/**
 * Flag para saber si Supabase está configurado.
 * Usar en servicios para ofrecer fallback a datos locales.
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
