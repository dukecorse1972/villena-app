import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, unwrapList, unwrapRow } from './serviceHelpers';
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

  return unwrapList({ data, error }).map(rowToCargo);
}

export async function createCargo(input: CargoInput): Promise<Cargo> {
  assertConfigured();

  const { data, error } = await supabase
    .from('cargos')
    .insert(input)
    .select()
    .single();

  return rowToCargo(unwrapRow({ data, error }));
}

export async function updateCargo(
  id: string,
  changes: { role?: string; person_name?: string; photo_url?: string; sort_order?: number },
): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('cargos').update(changes).eq('id', id);
  assertNoError(error);
}

export async function deleteCargo(id: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('cargos').delete().eq('id', id);
  assertNoError(error);
}
