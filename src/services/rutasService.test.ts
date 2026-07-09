import { describe, it, expect, vi } from 'vitest';

vi.mock('./supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {} as never,
}));

import { getRutas, createRuta, updateRuta, deleteRuta } from './rutasService';

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
