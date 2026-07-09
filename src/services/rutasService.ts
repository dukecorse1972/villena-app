import { supabase, isSupabaseConfigured } from './supabase';
import type { Ruta } from '../types';

/**
 * Recorridos hardcodeados como fallback cuando Supabase no está disponible.
 * Vacío a propósito: no hay ninguna aproximación de línea recta que valga
 * la pena ofrecer como ejemplo — las rutas reales se dibujan desde el
 * editor visual del admin (pestaña Rutas) y viven solo en Supabase.
 */
const LOCAL_RUTAS: Ruta[] = [];

function rowToRuta(row: { id: string; name: string; path: unknown }): Ruta {
  return { id: row.id, name: row.name, path: row.path as [number, number][] };
}

/**
 * Devuelve todos los recorridos de desfile.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 */
export async function getRutas(): Promise<Ruta[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('rutas').select('*').order('name');
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToRuta);
  }

  return LOCAL_RUTAS;
}

// ── Backoffice ────────────────────────────────────────────────────────────────

export interface RutaInput {
  id: string;
  name: string;
  path: [number, number][];
}

export async function createRuta(input: RutaInput): Promise<Ruta> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { data, error } = await supabase.from('rutas').insert(input).select().single();
  if (error) throw new Error(error.message);
  return rowToRuta(data);
}

export async function updateRuta(id: string, changes: Partial<Omit<RutaInput, 'id'>>): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { error } = await supabase.from('rutas').update(changes).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRuta(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { error } = await supabase.from('rutas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
