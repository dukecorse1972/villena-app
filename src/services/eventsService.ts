import { supabase, isSupabaseConfigured } from './supabase';
import { allEvents } from '../data/events';
import type { FiestaEvent, Favorites } from '../types';

/**
 * Obtiene eventos filtrados por día y tipo.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 */
export async function getEvents(day: number, filter: string): Promise<FiestaEvent[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('eventos')
      .select('*')
      .eq('day', day)
      .order('time');

    if (filter !== 'Todos') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as FiestaEvent[];
  }

  return allEvents.filter((ev) => {
    const matchDay  = ev.day === day;
    const matchType = filter === 'Todos' || ev.type === filter;
    return matchDay && matchType;
  });
}

/**
 * Alterna el estado de favorito de un evento.
 */
export function toggleFavorite(eventId: string, favorites: Favorites): Favorites {
  return { ...favorites, [eventId]: !favorites[eventId] };
}

/**
 * Devuelve los eventos favoritos para un día concreto.
 * Siempre usa datos locales como referencia base (los ids son los mismos).
 */
export function getFavoriteEvents(favorites: Favorites, day: number): FiestaEvent[] {
  return allEvents.filter((ev) => ev.day === day && favorites[ev.id]);
}
