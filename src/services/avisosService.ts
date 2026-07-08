import { supabase, isSupabaseConfigured } from './supabase';
import type { Aviso } from '../types';

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
 */
export async function getAvisos(): Promise<Aviso[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  return LOCAL_AVISOS;
}

// ── Escritura (backoffice) ───────────────────────────────────────────────────
// Sin fallback local: crear/editar/borrar avisos solo tiene sentido contra la
// base de datos real, protegido por RLS (solo admins pueden escribir).

export async function createAviso(text: string, isNew = true): Promise<Aviso> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  // El cast `as never` es el mismo workaround ya usado en favoritosService.ts
  // para un problema conocido de inferencia de tipos de supabase-js v2.
  const { data, error } = await supabase
    .from('avisos')
    .insert({ text, is_new: isNew } as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAviso(id: string, changes: { text?: string; is_new?: boolean }): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { error } = await supabase.from('avisos').update(changes as never).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAviso(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { error } = await supabase.from('avisos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
