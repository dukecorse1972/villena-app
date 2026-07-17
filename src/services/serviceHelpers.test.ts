import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('assertConfigured', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('lanza si Supabase no está configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { assertConfigured } = await import('./serviceHelpers');

    expect(() => assertConfigured()).toThrow('Supabase no está configurado');
  });

  it('no lanza si Supabase está configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { assertConfigured } = await import('./serviceHelpers');

    expect(() => assertConfigured()).not.toThrow();
  });
});

describe('assertNoError', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('lanza el mensaje del error si lo hay', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { assertNoError } = await import('./serviceHelpers');

    expect(() => assertNoError({ message: 'boom' })).toThrow('boom');
  });

  it('no hace nada si el error es null', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { assertNoError } = await import('./serviceHelpers');

    expect(() => assertNoError(null)).not.toThrow();
  });
});

describe('unwrapRow', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('devuelve la fila si no hay error', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { unwrapRow } = await import('./serviceHelpers');

    expect(unwrapRow({ data: { id: '1' }, error: null })).toEqual({ id: '1' });
  });

  it('lanza si hay error, aunque haya datos', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { unwrapRow } = await import('./serviceHelpers');

    expect(() => unwrapRow({ data: { id: '1' }, error: { message: 'boom' } })).toThrow('boom');
  });

  it('lanza "Supabase no devolvió datos" si data es null sin error', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { unwrapRow } = await import('./serviceHelpers');

    expect(() => unwrapRow({ data: null, error: null })).toThrow('Supabase no devolvió datos');
  });
});

describe('unwrapList', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('devuelve la lista si no hay error', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { unwrapList } = await import('./serviceHelpers');

    expect(unwrapList({ data: [1, 2, 3], error: null })).toEqual([1, 2, 3]);
  });

  it('devuelve [] si data es null sin error', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { unwrapList } = await import('./serviceHelpers');

    expect(unwrapList({ data: null, error: null })).toEqual([]);
  });

  it('lanza si hay error', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { unwrapList } = await import('./serviceHelpers');

    expect(() => unwrapList({ data: null, error: { message: 'boom' } })).toThrow('boom');
  });
});

describe('createPersistentCache', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('get() devuelve null si nunca se ha guardado nada', async () => {
    const { createPersistentCache } = await import('./serviceHelpers');
    const cache = createPersistentCache<string[]>('test_cache_1', 1000);

    expect(cache.get()).toBeNull();
    expect(cache.getStale()).toBeNull();
  });

  it('set() seguido de get() devuelve el dato dentro del TTL', async () => {
    const { createPersistentCache } = await import('./serviceHelpers');
    const cache = createPersistentCache<string[]>('test_cache_2', 1000);

    cache.set(['a', 'b']);
    expect(cache.get()).toEqual(['a', 'b']);
  });

  it('get() devuelve null (pero getStale() sigue devolviendo el dato) una vez expirado el TTL', async () => {
    vi.useFakeTimers();
    const { createPersistentCache } = await import('./serviceHelpers');
    const cache = createPersistentCache<string[]>('test_cache_3', 1000);

    cache.set(['a']);
    vi.advanceTimersByTime(1001);

    expect(cache.get()).toBeNull();
    expect(cache.getStale()).toEqual(['a']);
    vi.useRealTimers();
  });

  it('sobrevive a "reiniciar" el módulo: una nueva instancia con la misma clave recupera lo guardado', async () => {
    const { createPersistentCache: createFirst } = await import('./serviceHelpers');
    createFirst<string[]>('test_cache_4', 1000).set(['persistido']);

    vi.resetModules();
    const { createPersistentCache: createSecond } = await import('./serviceHelpers');
    const reloaded = createSecond<string[]>('test_cache_4', 1000);

    expect(reloaded.get()).toEqual(['persistido']);
  });

  it('clear() borra tanto la memoria como localStorage', async () => {
    const { createPersistentCache } = await import('./serviceHelpers');
    const cache = createPersistentCache<string[]>('test_cache_5', 1000);

    cache.set(['x']);
    cache.clear();

    expect(cache.get()).toBeNull();
    expect(cache.getStale()).toBeNull();
    expect(localStorage.getItem('test_cache_5')).toBeNull();
  });

  it('no lanza si localStorage.getItem lanza al leer (modo privado, etc.)', async () => {
    const { createPersistentCache } = await import('./serviceHelpers');
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('bloqueado'); };

    try {
      expect(() => createPersistentCache<string[]>('test_cache_6', 1000)).not.toThrow();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});

describe('withTimeout', () => {
  it('resuelve con el valor si la petición termina antes del plazo', async () => {
    const { withTimeout } = await import('./serviceHelpers');

    const result = await withTimeout(async () => 'ok', 1000);
    expect(result).toBe('ok');
  });

  it('aborta la señal si la petición no termina dentro del plazo', async () => {
    vi.useFakeTimers();
    const { withTimeout } = await import('./serviceHelpers');

    let receivedSignal: AbortSignal | undefined;
    const pending = withTimeout((signal) => {
      receivedSignal = signal;
      return new Promise(() => {}); // nunca se resuelve
    }, 1000);
    pending.catch(() => {}); // evitar unhandled rejection al avanzar el reloj

    vi.advanceTimersByTime(1001);

    expect(receivedSignal?.aborted).toBe(true);
    vi.useRealTimers();
  });
});
