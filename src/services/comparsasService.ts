import { supabase, isSupabaseConfigured } from './supabase';
import { comparsasCristianas, comparsasMoras, allComparsas } from '../data/comparsas';
import type { Database } from '../types/database';
import type { Comparsa } from '../types';

type ComparsaUpdate = Database['public']['Tables']['comparsas']['Update'];

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
 */
export async function getComparsas(side: 'Cristianas' | 'Moras'): Promise<Comparsa[]> {
  const bando = side === 'Moras' ? 'Moro' : 'Cristiano';

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('comparsas')
      .select('*')
      .eq('bando', bando)
      .order('name');

    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToComparsa);
  }

  return side === 'Moras' ? comparsasMoras : comparsasCristianas;
}

/**
 * Devuelve una comparsa por su ID (siempre usa datos locales como caché rápida).
 */
export function getComparsaById(id: string): Comparsa | undefined {
  return allComparsas.find((c) => c.id === id);
}

// ── Backoffice ────────────────────────────────────────────────────────────────

/**
 * Todas las comparsas (ambos bandos), para gestión en el backoffice.
 * Sin Supabase configurado, devuelve los datos locales tal cual.
 */
export async function getAllComparsasAdmin(): Promise<Comparsa[]> {
  if (!isSupabaseConfigured) return allComparsas;

  const { data, error } = await supabase
    .from('comparsas')
    .select('*')
    .order('bando')
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToComparsa);
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
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

  const { img, desfile_img, traje_gala_img, estandarte_img, ...rest } = changes;
  const dbChanges: ComparsaUpdate = { ...rest };
  if (img !== undefined) dbChanges.img_url = img;
  if (desfile_img !== undefined) dbChanges.desfile_img_url = desfile_img;
  if (traje_gala_img !== undefined) dbChanges.traje_gala_img_url = traje_gala_img;
  if (estandarte_img !== undefined) dbChanges.estandarte_img_url = estandarte_img;

  const { error } = await supabase.from('comparsas').update(dbChanges).eq('id', id);
  if (error) throw new Error(error.message);
}
