import { isSupabaseConfigured } from './supabase';

type MaybeError = { message: string } | null;

/**
 * Lanza si Supabase no está configurado. Para operaciones sin fallback local
 * (escritura de backoffice: crear/editar/borrar), que solo tienen sentido
 * contra la base de datos real.
 */
export function assertConfigured(): void {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');
}

/** Lanza el error de Supabase (si lo hay) con su mensaje original. */
export function assertNoError(error: MaybeError): void {
  if (error) throw new Error(error.message);
}

/**
 * Desempaqueta el resultado de un `insert()/update().select().single()`:
 * lanza si hay error y devuelve la fila (nunca null si no hubo error).
 */
export function unwrapRow<T>(result: { data: T | null; error: MaybeError }): T {
  assertNoError(result.error);
  if (result.data === null) throw new Error('Supabase no devolvió datos');
  return result.data;
}

/** Desempaqueta el resultado de un listado: lanza si hay error, si no, la lista (nunca null). */
export function unwrapList<T>(result: { data: T[] | null; error: MaybeError }): T[] {
  assertNoError(result.error);
  return result.data ?? [];
}
