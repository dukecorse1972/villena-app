import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../hooks/useAuth';
import { getAllEventos, filterEventsByDayAndType, toggleFavorite } from '../../services/eventsService';
import { syncFavoritesFromDB, addFavorite, removeFavorite } from '../../services/favoritosService';
import { isSupabaseConfigured } from '../../services/supabase';
import { STORAGE_KEYS } from '../../constants';
import { festivalISODate, festivalTodayDay } from '../../utils/dates';
import type { FiestaEvent, Favorites } from '../../types';

const FILTER_OPTIONS = ['Todos', 'Desfiles', 'Religiosos', 'Música', 'Cultural'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export function useAgenda() {
  const { user } = useAuth();

  // Arranca en el día real de hoy si hoy cae dentro de las fiestas;
  // si no, en el primer día del programa (ver festivalTodayDay).
  const [selectedDay, setSelectedDay]     = useState<number>(() => festivalTodayDay());
  const [filter, setFilter]               = useState<FilterOption>('Todos');
  const [selectedEvent, setSelectedEvent] = useState<FiestaEvent | null>(null);
  const [favorites, setFavorites]         = useLocalStorage<Favorites>(STORAGE_KEYS.FAVORITES, {});

  const [allEventos, setAllEventos] = useState<FiestaEvent[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const selectedDate = festivalISODate(selectedDay);

  // El programa completo se pide una sola vez (getAllEventos ya cachea con
  // persistencia y cae a la última copia conocida si falla la red); cambiar
  // de día o de filtro filtra en el propio cliente (filterEventsByDayAndType,
  // ~30 actos, instantáneo) en vez de disparar una petición de red distinta
  // por cada combinación día+filtro.
  useEffect(() => {
    let cancelled = false;

    getAllEventos()
      .then((data) => { if (!cancelled) setAllEventos(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filteredEvents = useMemo(
    () => filterEventsByDayAndType(allEventos, selectedDate, filter),
    [allEventos, selectedDate, filter],
  );

  // Sincroniza favoritos desde Supabase cuando el usuario inicia sesión
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    syncFavoritesFromDB(user.id)
      .then((dbFavs) => {
        setFavorites((prev) => ({ ...prev, ...dbFavs }));
      })
      .catch(() => { /* mantener favoritos locales si falla */ });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleFavorite = (eventId: string) => {
    const newFavs = toggleFavorite(eventId, favorites);
    setFavorites(newFavs);

    // Si hay sesión activa, sincroniza en Supabase en background
    if (user && isSupabaseConfigured) {
      if (newFavs[eventId]) {
        addFavorite(user.id, eventId).catch(() => {});
      } else {
        removeFavorite(user.id, eventId).catch(() => {});
      }
    }
  };

  const openEvent  = (ev: FiestaEvent) => setSelectedEvent(ev);
  const closeEvent = () => setSelectedEvent(null);

  return {
    selectedDay,
    setSelectedDay,
    filter,
    setFilter,
    filterOptions: FILTER_OPTIONS,
    filteredEvents,
    isLoading,
    error,
    selectedEvent,
    openEvent,
    closeEvent,
    favorites,
    toggleFavorite: handleToggleFavorite,
    user,
  };
}
