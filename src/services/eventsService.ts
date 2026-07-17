import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, createPersistentCache, unwrapList, unwrapRow, withTimeout } from './serviceHelpers';
import { STORAGE_KEYS } from '../constants';
import { allEvents } from '../data/events';
import type { Database } from '../types/database';
import type { FiestaEvent, EventType, Favorites } from '../types';

type EventoRow = Database['public']['Tables']['eventos']['Row'];

// Caché con TTL persistida en localStorage (ver serviceHelpers.createPersistentCache):
// evita repetir la misma consulta a Supabase al volver a Agenda o al abrir
// varios eventos seguidos en EventModal, sobrevive a cerrar la app, y sirve
// de último recurso si falla la red. Se invalida al crear/editar/borrar para
// que el backoffice nunca vea datos viejos tras guardar.
const CACHE_TTL_MS = 3 * 60 * 1000;
const allEventosCache = createPersistentCache<FiestaEvent[]>(STORAGE_KEYS.ALL_EVENTOS_CACHE, CACHE_TTL_MS);

function invalidateEventsCache(): void {
  allEventosCache.clear();
}

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
 * Filtra una lista de eventos por fecha y tipo — función pura, sin acceso a
 * red. Agenda pide siempre el programa completo (`getAllEventos`, ya
 * cacheado) y filtra aquí en el propio cliente en vez de repetir una
 * consulta a Supabase por cada cambio de día o de filtro: son ~30 actos,
 * filtrar en el cliente es instantáneo y evita una petición de red distinta
 * por cada combinación día+filtro.
 *
 * `date` es una fecha ISO completa ('YYYY-MM-DD'), no un día suelto: cada
 * evento tiene su propia fecha real, así que distintas ediciones del
 * festival nunca pueden mezclarse.
 */
export function filterEventsByDayAndType(
  events: FiestaEvent[],
  date: string,
  filter: 'Todos' | EventType,
): FiestaEvent[] {
  return events.filter((ev) => ev.date === date && (filter === 'Todos' || ev.type === filter));
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
 * Todos los eventos, ordenados cronológicamente — programa completo, tanto
 * para Agenda (que filtra por día/tipo con `filterEventsByDayAndType`) como
 * para el backoffice. Sin Supabase configurado, devuelve los datos locales.
 *
 * Si la petición falla y ya había una copia conocida (aunque expirada), se
 * devuelve esa en vez de propagar el error — es el programa de actos, el
 * dato más importante de toda la app durante las fiestas.
 */
export async function getAllEventos(): Promise<FiestaEvent[]> {
  const fresh = allEventosCache.get();
  if (fresh) return fresh;

  if (!isSupabaseConfigured) return allEvents;

  try {
    const { data, error } = await withTimeout((signal) =>
      supabase.from('eventos').select('*').order('date').order('time').abortSignal(signal),
    );
    const events = unwrapList({ data, error }).map(rowToEvent);
    allEventosCache.set(events);
    return events;
  } catch (err) {
    const stale = allEventosCache.getStale();
    if (stale) return stale;
    throw err;
  }
}

export async function createEvento(input: EventoInput): Promise<FiestaEvent> {
  assertConfigured();

  const { data, error } = await supabase
    .from('eventos')
    .insert(input)
    .select()
    .single();

  const evento = rowToEvent(unwrapRow({ data, error }));
  invalidateEventsCache();
  return evento;
}

export async function updateEvento(id: string, changes: Partial<Omit<EventoInput, 'id'>>): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('eventos').update(changes).eq('id', id);
  assertNoError(error);
  invalidateEventsCache();
}

export async function deleteEvento(id: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('eventos').delete().eq('id', id);
  assertNoError(error);
  invalidateEventsCache();
}
