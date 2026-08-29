import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ratingsService — validación y reglas de negocio', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('getUserComparsaRating devuelve null si no hay userId', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { getUserComparsaRating } = await import('./ratingsService');

    const rating = await getUserComparsaRating('moros-viejos', null);
    expect(rating).toBeNull();
  });

  it('submitComparsaRating rechaza valores fuera del rango 1..5 o decimales', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: true, supabase: {} as never }));
    const { submitComparsaRating } = await import('./ratingsService');

    await expect(submitComparsaRating('moros-viejos', 'user-1', 0)).rejects.toThrow('entre 1 y 5');
    await expect(submitComparsaRating('moros-viejos', 'user-1', 6)).rejects.toThrow('entre 1 y 5');
    await expect(submitComparsaRating('moros-viejos', 'user-1', 3.5)).rejects.toThrow('entre 1 y 5');
  });

  it('submitComparsaRating lanza error si Supabase no está configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { submitComparsaRating } = await import('./ratingsService');

    await expect(submitComparsaRating('moros-viejos', 'user-1', 5)).rejects.toThrow('Supabase no está configurado');
  });

  it('submitComparsaRating realiza upsert y actualiza la caché local', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ upsert }) } as never,
    }));

    const { submitComparsaRating, getUserComparsaRating } = await import('./ratingsService');
    const result = await submitComparsaRating('moros-viejos', 'user-1', 4);

    expect(result).toBe(4);
    expect(upsert).toHaveBeenCalledWith(
      { comparsa_id: 'moros-viejos', user_id: 'user-1', rating: 4 },
      { onConflict: 'comparsa_id,user_id' },
    );

    // Debe leer de la caché sin llamar a Supabase
    const cached = await getUserComparsaRating('moros-viejos', 'user-1');
    expect(cached).toBe(4);
  });
});
