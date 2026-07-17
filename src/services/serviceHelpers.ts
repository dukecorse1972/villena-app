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

interface CacheEntry<T> {
  data:      T;
  fetchedAt: number;
}

/**
 * Caché con TTL respaldada en `localStorage`, para que la última copia
 * conocida sobreviva a cerrar la app (no solo a cambiar de pantalla dentro
 * de la misma sesión, que es todo lo que cubre una variable de módulo).
 *
 * `get()` solo devuelve dato dentro del TTL (para no repetir peticiones sin
 * necesidad); `getStale()` devuelve lo último conocido aunque haya expirado
 * — para usar en el `catch` de una petición fallida: mejor un dato algo
 * viejo que una pantalla vacía en medio de la calle sin cobertura.
 */
export function createPersistentCache<T>(storageKey: string, ttlMs: number) {
  function readFromStorage(): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
    } catch {
      return null;
    }
  }

  let memory: CacheEntry<T> | null = readFromStorage();

  return {
    get(): T | null {
      return memory && Date.now() - memory.fetchedAt < ttlMs ? memory.data : null;
    },
    getStale(): T | null {
      return memory?.data ?? null;
    },
    set(data: T): void {
      memory = { data, fetchedAt: Date.now() };
      try {
        localStorage.setItem(storageKey, JSON.stringify(memory));
      } catch {
        // Cuota llena o modo privado: la caché sigue funcionando en memoria
        // para el resto de la sesión, solo no sobrevive a cerrar la app.
      }
    },
    clear(): void {
      memory = null;
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Nada que limpiar si nunca llegó a escribirse.
      }
    },
  };
}

/**
 * Envuelve una consulta de Supabase con un límite de tiempo: en red móvil
 * saturada, mejor fallar rápido (y caer a la caché/local, ver *Service.ts)
 * que dejar un spinner colgado indefinidamente. Se apoya en `.abortSignal()`,
 * que el query builder de `@supabase/supabase-js` soporta de forma nativa.
 */
export function withTimeout<T>(
  run: (signal: AbortSignal) => PromiseLike<T>,
  ms = 8000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return Promise.resolve(run(controller.signal)).finally(() => clearTimeout(timer));
}
