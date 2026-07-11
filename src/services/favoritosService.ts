import { supabase } from './supabase';
import { assertConfigured, assertNoError, unwrapList } from './serviceHelpers';
import type { Favorites } from '../types';

/**
 * Carga los favoritos del usuario desde Supabase y los devuelve como
 * un objeto { eventoId: true } compatible con el tipo Favorites local.
 */
export async function syncFavoritesFromDB(userId: string): Promise<Favorites> {
  assertConfigured();

  const { data, error } = await supabase
    .from('favoritos')
    .select('*')
    .eq('user_id', userId);

  return Object.fromEntries(unwrapList({ data, error }).map((row) => [row.evento_id, true]));
}

/**
 * Marca un evento como favorito en Supabase.
 * Usa upsert para ser idempotente.
 */
export async function addFavorite(userId: string, eventoId: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase
    .from('favoritos')
    .upsert({ user_id: userId, evento_id: eventoId });

  assertNoError(error);
}

/**
 * Elimina un favorito de Supabase.
 */
export async function removeFavorite(userId: string, eventoId: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase
    .from('favoritos')
    .delete()
    .eq('user_id', userId)
    .eq('evento_id', eventoId);

  assertNoError(error);
}
