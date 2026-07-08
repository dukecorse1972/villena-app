import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('cargosService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getCargosByComparsa devuelve un array vacío sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { getCargosByComparsa } = await import('./cargosService');

    expect(await getCargosByComparsa('c1')).toEqual([]);
  });

  it('getCargosByComparsa devuelve los cargos de la comparsa indicada', async () => {
    const row = { id: 'g1', comparsa_id: 'c1', role: 'Capitán', person_name: 'Juan Pérez', photo_url: null, sort_order: 0 };
    const order = vi.fn().mockResolvedValue({ data: [row], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select }) } as never,
    }));

    const { getCargosByComparsa } = await import('./cargosService');
    const cargos = await getCargosByComparsa('c1');

    expect(eq).toHaveBeenCalledWith('comparsa_id', 'c1');
    expect(cargos).toEqual([
      { id: 'g1', comparsa_id: 'c1', role: 'Capitán', person_name: 'Juan Pérez', photo_url: undefined, sort_order: 0 },
    ]);
  });

  it('createCargo lanza un error sin Supabase configurado', async () => {
    vi.doMock('./supabase', () => ({ isSupabaseConfigured: false, supabase: {} as never }));
    const { createCargo } = await import('./cargosService');

    await expect(createCargo({ comparsa_id: 'c1', role: 'Capitán', person_name: 'Juan' }))
      .rejects.toThrow('Supabase no está configurado');
  });

  it('createCargo inserta y devuelve el cargo creado', async () => {
    const row = { id: 'g1', comparsa_id: 'c1', role: 'Capitán', person_name: 'Juan Pérez', photo_url: null, sort_order: 0 };
    const single = vi.fn().mockResolvedValue({ data: row, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ insert }) } as never,
    }));

    const { createCargo } = await import('./cargosService');
    const result = await createCargo({ comparsa_id: 'c1', role: 'Capitán', person_name: 'Juan Pérez' });

    expect(result.person_name).toBe('Juan Pérez');
  });

  it('updateCargo actualiza los campos indicados', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ update }) } as never,
    }));

    const { updateCargo } = await import('./cargosService');
    await updateCargo('g1', { person_name: 'Nuevo nombre' });

    expect(update).toHaveBeenCalledWith({ person_name: 'Nuevo nombre' });
    expect(eq).toHaveBeenCalledWith('id', 'g1');
  });

  it('deleteCargo borra el cargo indicado', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ delete: del }) } as never,
    }));

    const { deleteCargo } = await import('./cargosService');
    await deleteCargo('g1');

    expect(eq).toHaveBeenCalledWith('id', 'g1');
  });
});
