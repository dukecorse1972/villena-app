import { describe, it, expect, vi } from 'vitest';
import type { Favorites } from '../types';

// Forzar fallback a datos locales para que los tests sean deterministas
// independientemente de si .env.local tiene claves de Supabase configuradas.
vi.mock('./supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {} as never,
}));

import { getEvents, toggleFavorite, getFavoriteEvents } from './eventsService';

describe('getEvents', () => {
  it('devuelve solo los eventos del día solicitado', async () => {
    const events = await getEvents(4, 'Todos');
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.day === 4)).toBe(true);
  });

  it('filtra por tipo de evento', async () => {
    const events = await getEvents(4, 'Desfiles');
    expect(events.every((e) => e.type === 'Desfiles')).toBe(true);
  });

  it('devuelve array vacío para un día sin eventos', async () => {
    const events = await getEvents(99, 'Todos');
    expect(events).toHaveLength(0);
  });

  it('con filtro Todos devuelve todos los tipos del día', async () => {
    const todos   = await getEvents(8, 'Todos');
    const desfiles = await getEvents(8, 'Desfiles');
    expect(todos.length).toBeGreaterThanOrEqual(desfiles.length);
  });
});

describe('toggleFavorite', () => {
  it('marca un evento como favorito', () => {
    const result = toggleFavorite('e1', {});
    expect(result['e1']).toBe(true);
  });

  it('desmarca un evento ya favorito', () => {
    const result = toggleFavorite('e1', { e1: true });
    expect(result['e1']).toBe(false);
  });

  it('no altera otros favoritos existentes', () => {
    const result = toggleFavorite('e1', { e2: true });
    expect(result['e2']).toBe(true);
  });

  it('devuelve un objeto nuevo (inmutabilidad)', () => {
    const original = { e1: true };
    const result = toggleFavorite('e2', original);
    expect(result).not.toBe(original);
  });
});

describe('getFavoriteEvents', () => {
  it('devuelve los favoritos del día indicado', () => {
    const favs: Favorites = { e1: true, e2: true };
    const results = getFavoriteEvents(favs, 4);
    expect(results.every((e) => e.day === 4)).toBe(true);
    expect(results.every((e) => !!favs[e.id])).toBe(true);
  });

  it('devuelve array vacío si no hay favoritos', () => {
    expect(getFavoriteEvents({}, 4)).toHaveLength(0);
  });

  it('no devuelve favoritos de otro día', () => {
    const favs = { e1: true }; // e1 es día 4
    const results = getFavoriteEvents(favs, 7);
    expect(results.every((e) => e.day === 7)).toBe(true);
  });
});
