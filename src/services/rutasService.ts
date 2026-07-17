import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, createPersistentCache, unwrapList, unwrapRow, withTimeout } from './serviceHelpers';
import { STORAGE_KEYS } from '../constants';
import type { Ruta } from '../types';

/**
 * Recorridos hardcodeados como fallback cuando Supabase no está disponible.
 * Vacío a propósito: no hay ninguna aproximación de línea recta que valga
 * la pena ofrecer como ejemplo — las rutas reales se dibujan desde el
 * editor visual del admin (pestaña Rutas) y viven solo en Supabase.
 */
const LOCAL_RUTAS: Ruta[] = [];

// Caché con TTL persistida en localStorage (ver serviceHelpers.createPersistentCache).
// Importa especialmente aquí: EventModal llama a getRutas() cada vez que se
// abre cualquier evento con ruta, así que sin caché repite la consulta en
// cada clic; y si falla la red, se usa como último recurso en vez de dejar
// el mapa de recorrido sin trazado.
const CACHE_TTL_MS = 3 * 60 * 1000;
const rutasCache = createPersistentCache<Ruta[]>(STORAGE_KEYS.RUTAS_CACHE, CACHE_TTL_MS);

function invalidateRutasCache(): void {
  rutasCache.clear();
}

function rowToRuta(row: { id: string; name: string; path: unknown }): Ruta {
  return { id: row.id, name: row.name, path: row.path as [number, number][] };
}

/**
 * Devuelve todos los recorridos de desfile.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 *
 * Si la petición falla y ya había una copia conocida (aunque expirada), se
 * devuelve esa en vez de propagar el error — solo se lanza si nunca hubo
 * ninguna copia real.
 */
export async function getRutas(): Promise<Ruta[]> {
  const fresh = rutasCache.get();
  if (fresh) return fresh;

  if (!isSupabaseConfigured) return LOCAL_RUTAS;

  try {
    const { data, error } = await withTimeout((signal) =>
      supabase.from('rutas').select('*').order('name').abortSignal(signal),
    );
    const rutas = unwrapList({ data, error }).map(rowToRuta);
    rutasCache.set(rutas);
    return rutas;
  } catch (err) {
    const stale = rutasCache.getStale();
    if (stale) return stale;
    throw err;
  }
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
