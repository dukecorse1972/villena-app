import { describe, it, expect, vi, beforeEach } from 'vitest';

// Este archivo usa vi.doMock + vi.resetModules por test (no vi.mock estático
// como eventsService.test.ts) porque cada caso necesita un comportamiento
// distinto de Supabase (éxito, luego fallo) dentro del mismo test.

describe('getAllEventos — fallback a caché si falla la red', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('si la petición falla y ya había una copia cacheada, devuelve esa en vez de lanzar', async () => {
    const eventoReal = { id: 'e1', date: '2026-09-04', time: '08:00', title: 'Diana General', location: 'Plaza de Santiago', type: 'Desfiles' };
    const order2 = vi.fn()
      .mockReturnValueOnce({ abortSignal: () => Promise.resolve({ data: [eventoReal], error: null }) })
      .mockReturnValueOnce({ abortSignal: () => Promise.reject(new Error('sin red')) });
    const order1 = vi.fn(() => ({ order: order2 }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select: () => ({ order: order1 }) }) } as never,
    }));

    const { getAllEventos } = await import('./eventsService');

    const first = await getAllEventos();
    expect(first).toEqual([eventoReal]);

    vi.useFakeTimers();
    vi.advanceTimersByTime(4 * 60 * 1000);

    const second = await getAllEventos();
    expect(second).toEqual([eventoReal]);
    vi.useRealTimers();
  });

  it('si la petición falla y nunca hubo copia cacheada, propaga el error', async () => {
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: {
        from: () => ({ select: () => ({ order: () => ({ order: () => ({ abortSignal: () => Promise.reject(new Error('sin red')) }) }) }) }),
      } as never,
    }));

    const { getAllEventos } = await import('./eventsService');
    await expect(getAllEventos()).rejects.toThrow('sin red');
  });
});
