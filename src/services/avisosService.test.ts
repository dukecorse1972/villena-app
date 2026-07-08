import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('avisosService — lectura (fallback local)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getAvisos devuelve los avisos locales sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { getAvisos } = await import('./avisosService');

    const avisos = await getAvisos();
    expect(avisos.length).toBeGreaterThan(0);
  });

  it('timeAgo describe correctamente un instante reciente', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { timeAgo } = await import('./avisosService');

    expect(timeAgo(new Date().toISOString())).toBe('ahora mismo');
  });
});

describe('avisosService — escritura (backoffice)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('createAviso lanza un error sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { createAviso } = await import('./avisosService');

    await expect(createAviso('texto')).rejects.toThrow('Supabase no está configurado');
  });

  it('createAviso inserta y devuelve el aviso creado', async () => {
    const nuevo = { id: 'n1', text: 'Aviso nuevo', is_new: true, created_at: '2026-09-04T10:00:00.000Z' };
    const single = vi.fn().mockResolvedValue({ data: nuevo, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ insert }) } as never,
    }));

    const { createAviso } = await import('./avisosService');
    const result = await createAviso('Aviso nuevo');

    expect(insert).toHaveBeenCalledWith({ text: 'Aviso nuevo', is_new: true });
    expect(result).toEqual(nuevo);
  });

  it('createAviso lanza el error de Supabase si la inserción falla', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ insert }) } as never,
    }));

    const { createAviso } = await import('./avisosService');
    await expect(createAviso('x')).rejects.toThrow('boom');
  });

  it('updateAviso actualiza los campos indicados', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ update }) } as never,
    }));

    const { updateAviso } = await import('./avisosService');
    await updateAviso('n1', { is_new: false });

    expect(update).toHaveBeenCalledWith({ is_new: false });
    expect(eq).toHaveBeenCalledWith('id', 'n1');
  });

  it('deleteAviso borra el aviso indicado', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ delete: del }) } as never,
    }));

    const { deleteAviso } = await import('./avisosService');
    await deleteAviso('n1');

    expect(eq).toHaveBeenCalledWith('id', 'n1');
  });
});
