import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('avisosService — lectura (fallback local)', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
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

describe('avisosService — fallback a caché si falla la red', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('si la petición falla y ya había una copia cacheada, devuelve esa en vez de lanzar', async () => {
    const avisoReal = { id: 'a1', text: 'Aviso real', is_new: true, created_at: '2026-09-04T10:00:00.000Z' };
    const order = vi.fn()
      .mockReturnValueOnce({ abortSignal: () => Promise.resolve({ data: [avisoReal], error: null }) })
      .mockReturnValueOnce({ abortSignal: () => Promise.reject(new Error('sin red')) });
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select: () => ({ order }) }) } as never,
    }));

    const { getAvisos } = await import('./avisosService');

    const first = await getAvisos();
    expect(first).toEqual([avisoReal]);

    // Fuerza a que la caché en memoria se considere expirada para el segundo intento.
    vi.useFakeTimers();
    vi.advanceTimersByTime(4 * 60 * 1000);

    const second = await getAvisos();
    expect(second).toEqual([avisoReal]);
    vi.useRealTimers();
  });

  it('si la petición falla y nunca hubo copia cacheada, propaga el error', async () => {
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: {
        from: () => ({
          select: () => ({
            order: () => ({ abortSignal: () => Promise.reject(new Error('sin red')) }),
          }),
        }),
      } as never,
    }));

    const { getAvisos } = await import('./avisosService');
    await expect(getAvisos()).rejects.toThrow('sin red');
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
