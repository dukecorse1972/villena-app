import { supabase, isSupabaseConfigured } from './supabase';
import { allEvents } from '../data/events';
import { festivalISODate } from '../utils/dates';
import type { FiestaEvent, Favorites } from '../types';

/**
 * Obtiene eventos filtrados por fecha y tipo.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 *
 * `date` es una fecha ISO completa ('YYYY-MM-DD'), no un día suelto:
 * cada fila de `eventos` tiene su propia fecha real, así que distintas
 * ediciones del festival nunca pueden mezclarse en la misma consulta.
 */
export async function getEvents(date: string, filter: string): Promise<FiestaEvent[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('eventos')
      .select('*')
      .eq('date', date)
      .order('time');

    if (filter !== 'Todos') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as FiestaEvent[];
  }

  return allEvents.filter((ev) => {
    const matchDate = ev.date === date;
    const matchType = filter === 'Todos' || ev.type === filter;
    return matchDate && matchType;
  });
}

/**
 * Alterna el estado de favorito de un evento.
 */
export function toggleFavorite(eventId: string, favorites: Favorites): Favorites {
  return { ...favorites, [eventId]: !favorites[eventId] };
}

/**
 * Devuelve los eventos favoritos para un día del mes de fiestas.
 * Siempre usa datos locales como referencia base (los ids son los mismos).
 */
export function getFavoriteEvents(favorites: Favorites, day: number): FiestaEvent[] {
  const date = festivalISODate(day);
  return allEvents.filter((ev) => ev.date === date && favorites[ev.id]);
}
