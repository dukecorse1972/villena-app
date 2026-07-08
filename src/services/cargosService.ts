import { supabase, isSupabaseConfigured } from './supabase';
import type { Cargo } from '../types';

function rowToCargo(row: Record<string, unknown>): Cargo {
  return {
    id:          row.id as string,
    comparsa_id: row.comparsa_id as string,
    role:        row.role as string,
    person_name: row.person_name as string,
    photo_url:   (row.photo_url as string) ?? undefined,
    sort_order:  row.sort_order as number,
  };
}

export interface CargoInput {
  comparsa_id: string;
  role:        string;
  person_name: string;
  photo_url?:  string;
  sort_order?: number;
}

/**
 * Cargos festeros del año de una comparsa. Lectura pública (sin admin
 * necesario). Sin Supabase configurado no hay cargos que mostrar todavía
 * (es contenido nuevo, no existe en los datos locales de ejemplo).
 */
export async function getCargosByComparsa(comparsaId: string): Promise<Cargo[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('comparsa_id', comparsaId)
    .order('sort_order');

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToCargo);
}

export async function createCargo(input: CargoInput): Promise<Cargo> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { data, error } = await supabase
    .from('cargos')
    .insert(input as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToCargo(data as Record<string, unknown>);
}

export async function updateCargo(
  id: string,
  changes: { role?: string; person_name?: string; photo_url?: string; sort_order?: number },
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { error } = await supabase.from('cargos').update(changes as never).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteCargo(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { error } = await supabase.from('cargos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
