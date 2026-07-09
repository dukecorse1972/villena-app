import { supabase } from './supabase';
import type { Favorites } from '../types';

/**
 * Carga los favoritos del usuario desde Supabase y los devuelve como
 * un objeto { eventoId: true } compatible con el tipo Favorites local.
 */
export async function syncFavoritesFromDB(userId: string): Promise<Favorites> {
  const { data, error } = await supabase
    .from('favoritos')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return Object.fromEntries((data ?? []).map((row) => [row.evento_id, true]));
}

/**
 * Marca un evento como favorito en Supabase.
 * Usa upsert para ser idempotente.
 */
export async function addFavorite(userId: string, eventoId: string): Promise<void> {
  const { error } = await supabase
    .from('favoritos')
    .upsert({ user_id: userId, evento_id: eventoId });

  if (error) throw new Error((error as { message: string }).message);
}

/**
 * Elimina un favorito de Supabase.
 */
export async function removeFavorite(userId: string, eventoId: string): Promise<void> {
  const { error } = await supabase
    .from('favoritos')
    .delete()
    .eq('user_id', userId)
    .eq('evento_id', eventoId);

  if (error) throw new Error((error as { message: string }).message);
}
