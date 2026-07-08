import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('eventsService — backoffice', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getAllEventos devuelve los datos locales sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { getAllEventos } = await import('./eventsService');

    const eventos = await getAllEventos();
    expect(eventos.length).toBeGreaterThan(0);
  });

  it('createEvento lanza un error sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { createEvento } = await import('./eventsService');

    await expect(createEvento({
      id: 'e99', title: 'Test', time: '10:00', location: 'Plaza', type: 'Cultural', date: '2026-09-10',
    })).rejects.toThrow('Supabase no está configurado');
  });

  it('createEvento inserta y devuelve el evento creado', async () => {
    const nuevo = { id: 'e99', title: 'Test', time: '10:00', location: 'Plaza', type: 'Cultural' as const, date: '2026-09-10' };
    const single = vi.fn().mockResolvedValue({ data: nuevo, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ insert }) } as never,
    }));

    const { createEvento } = await import('./eventsService');
    const result = await createEvento(nuevo);

    expect(insert).toHaveBeenCalledWith(nuevo);
    expect(result).toEqual(nuevo);
  });

  it('updateEvento actualiza los campos indicados', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ update }) } as never,
    }));

    const { updateEvento } = await import('./eventsService');
    await updateEvento('e1', { title: 'Nuevo título' });

    expect(update).toHaveBeenCalledWith({ title: 'Nuevo título' });
    expect(eq).toHaveBeenCalledWith('id', 'e1');
  });

  it('deleteEvento borra el evento indicado', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ delete: del }) } as never,
    }));

    const { deleteEvento } = await import('./eventsService');
    await deleteEvento('e1');

    expect(eq).toHaveBeenCalledWith('id', 'e1');
  });
});
