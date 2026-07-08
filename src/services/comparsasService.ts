import { supabase, isSupabaseConfigured } from './supabase';
import { comparsasCristianas, comparsasMoras, allComparsas } from '../data/comparsas';
import type { Comparsa } from '../types';

/**
 * Mapea una fila de la tabla `comparsas` al tipo de dominio Comparsa.
 * La BD guarda `img_url`; el dominio usa `img`.
 */
function rowToComparsa(row: Record<string, unknown>): Comparsa {
  return {
    id:           row.id as string,
    name:         row.name as string,
    color:        row.color as string,
    img:          (row.img_url as string) ?? '',
    bando:        row.bando as Comparsa['bando'],
    description:  row.description as string | undefined,
    founded_year: row.founded_year as number | undefined,
    num_socios:   row.num_socios as number | undefined,
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
