import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, createPersistentCache, unwrapList, withTimeout } from './serviceHelpers';
import { STORAGE_KEYS } from '../constants';
import { comparsasCristianas, comparsasMoras, allComparsas } from '../data/comparsas';
import type { Database } from '../types/database';
import type { Comparsa } from '../types';

type ComparsaUpdate = Database['public']['Tables']['comparsas']['Update'];

// Caché con TTL persistida en localStorage (ver serviceHelpers.createPersistentCache):
// evita repetir consultas al alternar entre Cristianas/Moras o volver a la
// pestaña, sobrevive a cerrar la app, y sirve de último recurso si falla la
// red. Solo dos bandos posibles, así que una instancia por bando basta (no
// hace falta un Map genérico).
const CACHE_TTL_MS = 3 * 60 * 1000;
const comparsasCacheBySide = {
  Cristianas: createPersistentCache<Comparsa[]>(STORAGE_KEYS.COMPARSAS_CACHE_CRISTIANAS, CACHE_TTL_MS),
  Moras:      createPersistentCache<Comparsa[]>(STORAGE_KEYS.COMPARSAS_CACHE_MORAS, CACHE_TTL_MS),
} as const;

// Caché del listado combinado para el backoffice (AdminComparsasPanel) — solo
// en memoria: el panel de admin siempre requiere Supabase configurado y no
// forma parte del problema de resiliencia offline de cara al usuario final.
let allComparsasCache: { comparsas: Comparsa[]; fetchedAt: number } | null = null;

function invalidateComparsasCache(): void {
  comparsasCacheBySide.Cristianas.clear();
  comparsasCacheBySide.Moras.clear();
  allComparsasCache = null;
}

/**
 * Mapea una fila de la tabla `comparsas` al tipo de dominio Comparsa.
 * La BD guarda `img_url`; el dominio usa `img`.
 */
function rowToComparsa(row: Record<string, unknown>): Comparsa {
  return {
    id:             row.id as string,
    name:           row.name as string,
    color:          row.color as string,
    img:            (row.img_url as string) ?? '',
    bando:          row.bando as Comparsa['bando'],
    description:    row.description as string | undefined,
    founded_year:   row.founded_year as number | undefined,
    num_socios:     row.num_socios as number | undefined,
    desfile_img:    (row.desfile_img_url as string) ?? undefined,
    traje_gala_img: (row.traje_gala_img_url as string) ?? undefined,
    estandarte_img: (row.estandarte_img_url as string) ?? undefined,
  };
}

/**
 * Devuelve comparsas filtradas por bando.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 *
 * Si la petición falla y ya había una copia conocida (aunque expirada), se
 * devuelve esa en vez de propagar el error.
 */
export async function getComparsas(side: 'Cristianas' | 'Moras'): Promise<Comparsa[]> {
  const cache = comparsasCacheBySide[side];
  const fresh = cache.get();
  if (fresh) return fresh;

  if (!isSupabaseConfigured) return side === 'Moras' ? comparsasMoras : comparsasCristianas;

  const bando = side === 'Moras' ? 'Moro' : 'Cristiano';

  try {
    const { data, error } = await withTimeout((signal) =>
      supabase.from('comparsas').select('*').eq('bando', bando).order('name').abortSignal(signal),
    );
    const comparsas = unwrapList({ data, error }).map(rowToComparsa);
    cache.set(comparsas);
    return comparsas;
  } catch (err) {
    const stale = cache.getStale();
    if (stale) return stale;
    throw err;
  }
}

// ── Backoffice ────────────────────────────────────────────────────────────────

/**
 * Todas las comparsas (ambos bandos), para gestión en el backoffice.
 * Sin Supabase configurado, devuelve los datos locales tal cual.
 */
export async function getAllComparsasAdmin(): Promise<Comparsa[]> {
  if (allComparsasCache && Date.now() - allComparsasCache.fetchedAt < CACHE_TTL_MS) return allComparsasCache.comparsas;

  if (!isSupabaseConfigured) return allComparsas;

  const { data, error } = await supabase
    .from('comparsas')
    .select('*')
    .order('bando')
    .order('name');

  const comparsas = unwrapList({ data, error }).map(rowToComparsa);
  allComparsasCache = { comparsas, fetchedAt: Date.now() };
  return comparsas;
}

export async function updateComparsa(
  id: string,
  changes: {
    description?: string;
    founded_year?: number;
    num_socios?: number;
    img?: string;
    desfile_img?: string;
    traje_gala_img?: string;
    estandarte_img?: string;
  },
): Promise<void> {
  assertConfigured();

  const { img, desfile_img, traje_gala_img, estandarte_img, ...rest } = changes;
  const dbChanges: ComparsaUpdate = { ...rest };
  if (img !== undefined) dbChanges.img_url = img;
  if (desfile_img !== undefined) dbChanges.desfile_img_url = desfile_img;
  if (traje_gala_img !== undefined) dbChanges.traje_gala_img_url = traje_gala_img;
  if (estandarte_img !== undefined) dbChanges.estandarte_img_url = estandarte_img;

  const { error } = await supabase.from('comparsas').update(dbChanges).eq('id', id);
  assertNoError(error);
  invalidateComparsasCache();
}
