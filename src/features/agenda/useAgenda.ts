import { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../hooks/useAuth';
import { getEvents, toggleFavorite } from '../../services/eventsService';
import { syncFavoritesFromDB, addFavorite, removeFavorite } from '../../services/favoritosService';
import { isSupabaseConfigured } from '../../services/supabase';
import { STORAGE_KEYS, FESTIVAL } from '../../constants';
import type { FiestaEvent, Favorites } from '../../types';

const FILTER_OPTIONS = ['Todos', 'Desfiles', 'Religiosos', 'Música', 'Cultural'] as const;

export function useAgenda() {
  const { user } = useAuth();

  const [selectedDay, setSelectedDay]     = useState(4);
  const [filter, setFilter]               = useState('Todos');
  const [selectedEvent, setSelectedEvent] = useState<FiestaEvent | null>(null);
  const [favorites, setFavorites]         = useLocalStorage<Favorites>(STORAGE_KEYS.FAVORITES, {});

  const [filteredEvents, setFilteredEvents] = useState<FiestaEvent[]>([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  // Carga eventos cuando cambia el día o el filtro.
  // setIsLoading/setError se marcan de forma síncrona al principio del efecto
  // a propósito, para que la UI muestre "cargando" desde el primer render tras
  // el cambio — es el patrón de fetching en efectos que documenta React.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setError(null);

    getEvents(FESTIVAL.YEAR, selectedDay, filter)
      .then((data) => { if (!cancelled) setFilteredEvents(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [selectedDay, filter]);

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
