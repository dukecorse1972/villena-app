import { supabase, isSupabaseConfigured } from './supabase';
import { assertConfigured, assertNoError, unwrapList, unwrapRow } from './serviceHelpers';
import type { Cargo } from '../types';

// Mismo patrón de caché con TTL que el resto de servicios de lectura.
// ComparsaDetail vuelve a pedir los cargos cada vez que se abre una comparsa.
const CACHE_TTL_MS = 3 * 60 * 1000;
const cargosCache = new Map<string, { cargos: Cargo[]; fetchedAt: number }>();

function invalidateCargosCache(comparsaId: string): void {
  cargosCache.delete(comparsaId);
}

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
  const cached = cargosCache.get(comparsaId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.cargos;

  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('comparsa_id', comparsaId)
    .order('sort_order');

  const cargos = unwrapList({ data, error }).map(rowToCargo);
  cargosCache.set(comparsaId, { cargos, fetchedAt: Date.now() });
  return cargos;
}

export async function createCargo(input: CargoInput): Promise<Cargo> {
  assertConfigured();

  const { data, error } = await supabase
    .from('cargos')
    .insert(input)
    .select()
    .single();

  const cargo = rowToCargo(unwrapRow({ data, error }));
  invalidateCargosCache(input.comparsa_id);
  return cargo;
}

export async function updateCargo(
  id: string,
  changes: { role?: string; person_name?: string; photo_url?: string; sort_order?: number },
): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('cargos').update(changes).eq('id', id);
  assertNoError(error);
  // No tenemos comparsa_id aquí (solo el id del cargo): limpiar toda la
  // caché es más simple y barato que buscarlo antes de invalidar.
  cargosCache.clear();
}

export async function deleteCargo(id: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('cargos').delete().eq('id', id);
  assertNoError(error);
  cargosCache.clear();
}
