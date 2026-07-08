import { supabase } from './supabase';
import type { Favorites } from '../types';

// Tipo local para las filas de la tabla favoritos
interface FavoritoRow {
  user_id:    string;
  evento_id:  string;
  created_at: string;
}

/**
 * Carga los favoritos del usuario desde Supabase y los devuelve como
 * un objeto { eventoId: true } compatible con el tipo Favorites local.
 */
export async function syncFavoritesFromDB(userId: string): Promise<Favorites> {
  const { data, error } = await supabase
    .from('favoritos')
    .select('*')
    .eq('user_id', userId) as unknown as {
      data:  FavoritoRow[] | null;
      error: { message: string } | null;
    };

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
    .upsert({ user_id: userId, evento_id: eventoId } as never);

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
