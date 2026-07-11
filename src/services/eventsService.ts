import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, unwrapList, unwrapRow } from './serviceHelpers';
import { allEvents } from '../data/events';
import type { Database } from '../types/database';
import type { FiestaEvent, EventType, Favorites } from '../types';

type EventoRow = Database['public']['Tables']['eventos']['Row'];

/** Convierte una fila de Supabase al modelo de dominio, normalizando `null` a `undefined`. */
function rowToEvent(row: EventoRow): FiestaEvent {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    title: row.title,
    location: row.location,
    type: row.type,
    img_url: row.img_url ?? undefined,
    description: row.description ?? undefined,
    ruta_id: row.ruta_id ?? undefined,
  };
}

/**
 * Obtiene eventos filtrados por fecha y tipo.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 *
 * `date` es una fecha ISO completa ('YYYY-MM-DD'), no un día suelto:
 * cada fila de `eventos` tiene su propia fecha real, así que distintas
 * ediciones del festival nunca pueden mezclarse en la misma consulta.
 */
export async function getEvents(date: string, filter: 'Todos' | EventType): Promise<FiestaEvent[]> {
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
    return unwrapList({ data, error }).map(rowToEvent);
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

function eventDateTime(ev: FiestaEvent): number {
  return new Date(`${ev.date}T${ev.time}`).getTime();
}

/**
 * Devuelve los `count` próximos eventos a partir del instante dado (por
 * defecto, ahora mismo), ordenados cronológicamente. Se recalcula cada vez
 * que se llama, así que siempre refleja la hora real: si son las 13:00 del
 * día 6, un acto de las 11:00 de ese mismo día ya no cuenta como "próximo".
 * Si al festival le quedan menos de `count` actos por delante (p.ej.
 * después de que termine), devuelve los últimos `count` en su lugar, para
 * no dejar el carrusel con menos tarjetas de las esperadas.
 */
export function getUpcomingEvents(events: FiestaEvent[], count = 5, now: Date = new Date()): FiestaEvent[] {
  const sorted = [...events].sort((a, b) => eventDateTime(a) - eventDateTime(b));
  const nowMs = now.getTime();
  const upcoming = sorted.filter((ev) => eventDateTime(ev) >= nowMs);
  return upcoming.length >= count ? upcoming.slice(0, count) : sorted.slice(-count);
}

// ── Backoffice ────────────────────────────────────────────────────────────────

export interface EventoInput {
  id:           string;
  title:        string;
  time:         string;
  location:     string;
  type:         EventType;
  date:         string;
  img_url?:     string;
  description?: string;
  ruta_id?:     string;
}

/**
 * Todos los eventos, ordenados cronológicamente — para gestión en el
 * backoffice (a diferencia de getEvents, que filtra por un día concreto).
 * Sin Supabase configurado, devuelve los datos locales tal cual.
 */
export async function getAllEventos(): Promise<FiestaEvent[]> {
  if (!isSupabaseConfigured) return allEvents;

  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('date')
    .order('time');

  return unwrapList({ data, error }).map(rowToEvent);
}

export async function createEvento(input: EventoInput): Promise<FiestaEvent> {
  assertConfigured();

  const { data, error } = await supabase
    .from('eventos')
    .insert(input)
    .select()
    .single();

  return rowToEvent(unwrapRow({ data, error }));
}

export async function updateEvento(id: string, changes: Partial<Omit<EventoInput, 'id'>>): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('eventos').update(changes).eq('id', id);
  assertNoError(error);
}

export async function deleteEvento(id: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('eventos').delete().eq('id', id);
  assertNoError(error);
}
