import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, createPersistentCache, withTimeout } from './serviceHelpers';
import { STORAGE_KEYS } from '../constants';
import type { Database } from '../types/database';
import type { ComparsaRating } from '../types';

type RatingRow = Database['public']['Tables']['comparsa_ratings']['Row'];

// Cache persistida en localStorage para acceso instantáneo a las valoraciones del usuario
const CACHE_TTL_MS = 10 * 60 * 1000;
const ratingsCache = createPersistentCache<Record<string, number>>(
  STORAGE_KEYS.RATINGS_CACHE,
  CACHE_TTL_MS,
);

function rowToRating(row: RatingRow): ComparsaRating {
  return {
    id: row.id,
    comparsa_id: row.comparsa_id,
    user_id: row.user_id,
    rating: row.rating,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Obtiene la valoración (1..5) que el usuario ha otorgado a una comparsa específica.
 * Devuelve `null` si no ha valorado todavía o no hay sesión.
 */
export async function getUserComparsaRating(
  comparsaId: string,
  userId?: string | null,
): Promise<number | null> {
  if (!userId) return null;

  const cached = ratingsCache.get();
  if (cached && cached[comparsaId] !== undefined) {
    return cached[comparsaId];
  }

  if (!isSupabaseConfigured) {
    return cached?.[comparsaId] ?? null;
  }

  try {
    const { data, error } = await withTimeout((signal) =>
      supabase
        .from('comparsa_ratings')
        .select('rating')
        .eq('comparsa_id', comparsaId)
        .eq('user_id', userId)
        .abortSignal(signal)
        .maybeSingle(),
    );

    if (error) throw new Error(error.message);
    const rating = data?.rating ?? null;

    if (rating !== null) {
      const currentCache = ratingsCache.getStale() ?? {};
      ratingsCache.set({ ...currentCache, [comparsaId]: rating });
    }

    return rating;
  } catch (err) {
    const stale = ratingsCache.getStale();
    if (stale && stale[comparsaId] !== undefined) return stale[comparsaId];
    throw err;
  }
}

/**
 * Registra o actualiza la valoración del usuario (1-5 estrellas) para una comparsa.
 */
export async function submitComparsaRating(
  comparsaId: string,
  userId: string,
  rating: number,
): Promise<number> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('La valoración debe ser un número entero entre 1 y 5');
  }

  assertConfigured();

  const { error } = await supabase
    .from('comparsa_ratings')
    .upsert(
      {
        comparsa_id: comparsaId,
        user_id: userId,
        rating,
      },
      { onConflict: 'comparsa_id,user_id' },
    );

  assertNoError(error);

  // Actualizar caché persistida
  const current = ratingsCache.getStale() ?? {};
  ratingsCache.set({ ...current, [comparsaId]: rating });

  return rating;
}

/**
 * Sincroniza todas las valoraciones del usuario desde Supabase al iniciar sesión.
 */
export async function syncUserRatingsFromDB(
  userId: string,
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured) return {};

  try {
    const { data, error } = await withTimeout((signal) =>
      supabase
        .from('comparsa_ratings')
        .select('*')
        .eq('user_id', userId)
        .abortSignal(signal),
    );

    if (error) throw new Error(error.message);

    const ratingsMap: Record<string, number> = {};
    for (const row of data ?? []) {
      const parsed = rowToRating(row);
      ratingsMap[parsed.comparsa_id] = parsed.rating;
    }

    ratingsCache.set(ratingsMap);
    return ratingsMap;
  } catch {
    return ratingsCache.getStale() ?? {};
  }
}
