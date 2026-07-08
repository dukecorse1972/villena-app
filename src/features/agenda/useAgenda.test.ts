import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAgenda } from './useAgenda';

// Stub de useAuth: sin sesión activa, sin llamadas async a Supabase
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user:             null,
    isLoading:        false,
    signInWithGoogle: vi.fn(),
    signInWithEmail:  vi.fn(),
    signUpWithEmail:  vi.fn(),
    signOut:          vi.fn(),
  }),
}));

// Fallback a datos locales (evita llamadas reales a Supabase)
vi.mock('../../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

beforeEach(() => {
  localStorage.clear();
});

describe('useAgenda — estado inicial', () => {
  it('empieza en el día 4 con filtro Todos', () => {
    const { result } = renderHook(() => useAgenda());
    expect(result.current.selectedDay).toBe(4);
    expect(result.current.filter).toBe('Todos');
  });

  it('los eventos filtrados pertenecen al día inicial', async () => {
    const { result } = renderHook(() => useAgenda());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const { filteredEvents, selectedDay } = result.current;
    expect(filteredEvents.every((e) => e.day === selectedDay)).toBe(true);
  });

  it('no hay evento seleccionado al arrancar', () => {
    const { result } = renderHook(() => useAgenda());
    expect(result.current.selectedEvent).toBeNull();
  });

  it('favorites empieza vacío', () => {
    const { result } = renderHook(() => useAgenda());
    expect(result.current.favorites).toEqual({});
  });
});

describe('useAgenda — cambio de día', () => {
  it('setSelectedDay actualiza los eventos filtrados', async () => {
    const { result } = renderHook(() => useAgenda());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setSelectedDay(7));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedDay).toBe(7);
    expect(result.current.filteredEvents.every((e) => e.day === 7)).toBe(true);
  });
});

describe('useAgenda — filtro por tipo', () => {
  it('setFilter limita los eventos al tipo elegido', async () => {
    const { result } = renderHook(() => useAgenda());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setFilter('Desfiles'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filter).toBe('Desfiles');
    expect(result.current.filteredEvents.every((e) => e.type === 'Desfiles')).toBe(true);
  });

  it('filterOptions incluye Todos y los cuatro tipos', () => {
    const { result } = renderHook(() => useAgenda());
    expect(result.current.filterOptions).toContain('Todos');
    expect(result.current.filterOptions).toContain('Desfiles');
    expect(result.current.filterOptions).toContain('Música');
  });
});

describe('useAgenda — favoritos', () => {
  it('toggleFavorite marca y desmarca un evento', () => {
    const { result } = renderHook(() => useAgenda());
    act(() => result.current.toggleFavorite('e1'));
    expect(result.current.favorites['e1']).toBe(true);
    act(() => result.current.toggleFavorite('e1'));
    expect(result.current.favorites['e1']).toBe(false);
  });
});

describe('useAgenda — apertura/cierre de evento', () => {
  it('openEvent selecciona el evento y closeEvent lo limpia', async () => {
    const { result } = renderHook(() => useAgenda());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const ev = result.current.filteredEvents[0];
    act(() => result.current.openEvent(ev));
    expect(result.current.selectedEvent).toEqual(ev);
    act(() => result.current.closeEvent());
    expect(result.current.selectedEvent).toBeNull();
  });
});
