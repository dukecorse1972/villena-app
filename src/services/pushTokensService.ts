import { supabase, isSupabaseConfigured } from './supabase';
import { assertNoError } from './serviceHelpers';

/**
 * Registra (o refresca) el token push del dispositivo. userId es opcional:
 * los avisos son públicos, no hace falta sesión para recibirlos.
 * Sin Supabase configurado no hay dónde guardarlo — no falla, solo no hace nada.
 *
 * Inserta y, si el token ya existía, actualiza — a propósito NO se usa
 * upsert(): con RLS activo y sin política de SELECT (nadie puede leer la
 * lista de tokens de otros), Postgres no puede resolver el "ON CONFLICT DO
 * UPDATE" de un upsert y lo rechaza. Un INSERT y, si hace falta, un UPDATE
 * separado no tienen ese problema.
 */
export async function registerPushToken(
  token: string,
  platform: 'android' | 'ios',
  userId: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error: insertError } = await supabase
    .from('push_tokens')
    .insert({ token, platform, user_id: userId });

  if (!insertError) return;

  const isDuplicate = (insertError as { code?: string }).code === '23505';
  if (!isDuplicate) throw new Error(insertError.message);

  const { error: updateError } = await supabase
    .from('push_tokens')
    .update({ platform, user_id: userId })
    .eq('token', token);

  assertNoError(updateError);
}

/**
 * Desregistra el token (p. ej. el usuario apaga los avisos desde ajustes).
 */
export async function unregisterPushToken(token: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token);

  assertNoError(error);
}
