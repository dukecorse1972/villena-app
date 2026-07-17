import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {} as never,
}));

import { getRutas, createRuta, updateRuta, deleteRuta } from './rutasService';

beforeEach(() => {
  localStorage.clear();
});

describe('getRutas', () => {
  it('devuelve un array vacío cuando Supabase no está configurado', async () => {
    // No hay rutas de ejemplo fiables que ofrecer sin Supabase: se dibujan
    // desde el editor visual del admin y viven solo en la base de datos real.
    const rutas = await getRutas();
    expect(rutas).toEqual([]);
  });
});

describe('mutaciones sin Supabase configurado', () => {
  const input = { id: 'r1', name: 'Prueba', path: [[38.63, -0.87], [38.631, -0.869]] as [number, number][] };

  it('createRuta lanza', async () => {
    await expect(createRuta(input)).rejects.toThrow();
  });

  it('updateRuta lanza', async () => {
    await expect(updateRuta('r1', { name: 'Otra' })).rejects.toThrow();
  });

  it('deleteRuta lanza', async () => {
    await expect(deleteRuta('r1')).rejects.toThrow();
  });
});

describe('getRutas — fallback a caché si falla la red', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('si la petición falla y ya había una copia cacheada, devuelve esa en vez de lanzar', async () => {
    const rutaReal = { id: 'r1', name: 'Av. Constitución', path: [[38.63, -0.87], [38.631, -0.869]] };
    const order = vi.fn()
      .mockReturnValueOnce({ abortSignal: () => Promise.resolve({ data: [rutaReal], error: null }) })
      .mockReturnValueOnce({ abortSignal: () => Promise.reject(new Error('sin red')) });
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select: () => ({ order }) }) } as never,
    }));

    const { getRutas: getRutasWithNetwork } = await import('./rutasService');

    const first = await getRutasWithNetwork();
    expect(first).toEqual([rutaReal]);

    vi.useFakeTimers();
    vi.advanceTimersByTime(4 * 60 * 1000);

    const second = await getRutasWithNetwork();
    expect(second).toEqual([rutaReal]);
    vi.useRealTimers();
  });

  it('si la petición falla y nunca hubo copia cacheada, propaga el error', async () => {
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: {
        from: () => ({ select: () => ({ order: () => ({ abortSignal: () => Promise.reject(new Error('sin red')) }) }) }),
      } as never,
    }));

    const { getRutas: getRutasWithNetwork } = await import('./rutasService');
    await expect(getRutasWithNetwork()).rejects.toThrow('sin red');
  });
});
