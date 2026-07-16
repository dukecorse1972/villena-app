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
