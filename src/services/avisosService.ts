import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, createPersistentCache, unwrapList, unwrapRow, withTimeout } from './serviceHelpers';
import { STORAGE_KEYS } from '../constants';
import type { Aviso } from '../types';

// Caché con TTL persistida en localStorage (ver serviceHelpers.createPersistentCache):
// sobrevive a cerrar la app, y en el catch de getAvisos() se usa como último
// recurso si la red falla, en vez de dejar la pantalla de avisos en blanco.
const CACHE_TTL_MS = 3 * 60 * 1000;
const avisosCache = createPersistentCache<Aviso[]>(STORAGE_KEYS.AVISOS_CACHE, CACHE_TTL_MS);

function invalidateAvisosCache(): void {
  avisosCache.clear();
}

/** Avisos hardcodeados como fallback cuando Supabase no está disponible */
const LOCAL_AVISOS: Aviso[] = [
  {
    id:         'n1',
    text:       'Mañana comienza la Diana General a las 08:00h en la Plaza de Santiago',
    is_new:     true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id:         'n2',
    text:       'Cambio de última hora: El Contrabando se adelanta a las 16:30h por previsión de lluvia',
    is_new:     true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id:         'n3',
    text:       'Nueva noticia: El Capitán Moro presenta su indumentaria en acto multitudinario',
    is_new:     false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id:         'n4',
    text:       'Recuerda: la Entrada Cristiana parte desde Av. Constitución esquina con C/ Mayor',
    is_new:     false,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id:         'n5',
    text:       'El alcalde de Villena invita a todos los ciudadanos a participar activamente en los festejos',
    is_new:     false,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Devuelve una cadena legible indicando el tiempo transcurrido.
 * Ej.: "hace 2 horas", "hace 3 días"
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (days >= 1)    return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours >= 1)   return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes >= 1) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'ahora mismo';
}

/**
 * Devuelve los avisos ordenados por fecha descendente.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 *
 * Si la petición a Supabase falla (sin red, timeout...), cae a la última
 * copia real conocida aunque el TTL haya expirado — solo si nunca hubo
 * ninguna copia se propaga el error (no se sustituye por LOCAL_AVISOS: eso
 * mostraría avisos de ejemplo como si fueran reales).
 */
export async function getAvisos(): Promise<Aviso[]> {
  const fresh = avisosCache.get();
  if (fresh) return fresh;

  if (!isSupabaseConfigured) return LOCAL_AVISOS;

  try {
    const { data, error } = await withTimeout((signal) =>
      supabase.from('avisos').select('*').order('created_at', { ascending: false }).abortSignal(signal),
    );
    const avisos = unwrapList({ data, error });
    avisosCache.set(avisos);
    return avisos;
  } catch (err) {
    const stale = avisosCache.getStale();
    if (stale) return stale;
    throw err;
  }
}

// ── Escritura (backoffice) ───────────────────────────────────────────────────
// Sin fallback local: crear/editar/borrar avisos solo tiene sentido contra la
// base de datos real, protegido por RLS (solo admins pueden escribir).

export async function createAviso(text: string, isNew = true): Promise<Aviso> {
  assertConfigured();

  const { data, error } = await supabase
    .from('avisos')
    .insert({ text, is_new: isNew })
    .select()
    .single();

  const aviso = unwrapRow<Aviso>({ data, error });
  invalidateAvisosCache();
  return aviso;
}

export async function updateAviso(id: string, changes: { text?: string; is_new?: boolean }): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('avisos').update(changes).eq('id', id);
  assertNoError(error);
  invalidateAvisosCache();
}

export async function deleteAviso(id: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('avisos').delete().eq('id', id);
  assertNoError(error);
  invalidateAvisosCache();
}
