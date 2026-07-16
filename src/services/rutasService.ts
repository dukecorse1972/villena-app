import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, unwrapList, unwrapRow } from './serviceHelpers';
import type { Ruta } from '../types';

/**
 * Recorridos hardcodeados como fallback cuando Supabase no está disponible.
 * Vacío a propósito: no hay ninguna aproximación de línea recta que valga
 * la pena ofrecer como ejemplo — las rutas reales se dibujan desde el
 * editor visual del admin (pestaña Rutas) y viven solo en Supabase.
 */
const LOCAL_RUTAS: Ruta[] = [];

// Mismo patrón de caché con TTL que weatherService/eventsService. Importa
// especialmente aquí: EventModal llama a getRutas() cada vez que se abre
// cualquier evento con ruta, así que sin caché repite la consulta en cada clic.
const CACHE_TTL_MS = 3 * 60 * 1000;
let rutasCache: { rutas: Ruta[]; fetchedAt: number } | null = null;

function invalidateRutasCache(): void {
  rutasCache = null;
}

function rowToRuta(row: { id: string; name: string; path: unknown }): Ruta {
  return { id: row.id, name: row.name, path: row.path as [number, number][] };
}

/**
 * Devuelve todos los recorridos de desfile.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 */
export async function getRutas(): Promise<Ruta[]> {
  if (rutasCache && Date.now() - rutasCache.fetchedAt < CACHE_TTL_MS) return rutasCache.rutas;

  let rutas: Ruta[];
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('rutas').select('*').order('name');
    rutas = unwrapList({ data, error }).map(rowToRuta);
  } else {
    rutas = LOCAL_RUTAS;
  }

  rutasCache = { rutas, fetchedAt: Date.now() };
  return rutas;
}

// ── Backoffice ────────────────────────────────────────────────────────────────

export interface RutaInput {
  id: string;
  name: string;
  path: [number, number][];
}

export async function createRuta(input: RutaInput): Promise<Ruta> {
  assertConfigured();

  const { data, error } = await supabase.from('rutas').insert(input).select().single();
  const ruta = rowToRuta(unwrapRow({ data, error }));
  invalidateRutasCache();
  return ruta;
}

export async function updateRuta(id: string, changes: Partial<Omit<RutaInput, 'id'>>): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('rutas').update(changes).eq('id', id);
  assertNoError(error);
  invalidateRutasCache();
}

export async function deleteRuta(id: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('rutas').delete().eq('id', id);
  assertNoError(error);
  invalidateRutasCache();
}
