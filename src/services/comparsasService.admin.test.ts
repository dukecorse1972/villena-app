import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('comparsasService — backoffice', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getAllComparsasAdmin devuelve los datos locales sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { getAllComparsasAdmin } = await import('./comparsasService');

    const comparsas = await getAllComparsasAdmin();
    expect(comparsas.length).toBe(14);
  });

  it('updateComparsa lanza un error sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { updateComparsa } = await import('./comparsasService');

    await expect(updateComparsa('c1', { founded_year: 1950 })).rejects.toThrow('Supabase no está configurado');
  });

  it('updateComparsa actualiza los campos indicados', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ update }) } as never,
    }));

    const { updateComparsa } = await import('./comparsasService');
    await updateComparsa('c1', { founded_year: 1950, num_socios: 300 });

    expect(update).toHaveBeenCalledWith({ founded_year: 1950, num_socios: 300 });
    expect(eq).toHaveBeenCalledWith('id', 'c1');
  });
});
