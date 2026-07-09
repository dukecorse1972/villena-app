import { useState, useEffect, type DependencyList, type Dispatch, type SetStateAction } from 'react';

export interface UseAsyncListResult<T> {
  data: T[];
  setData: Dispatch<SetStateAction<T[]>>;
  isLoading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  reload: () => void;
}

/**
 * Encapsula el patrón de "cargar una lista desde un servicio con
 * isLoading/error/reload" repetido en los paneles de administración
 * (AdminAvisosPanel, AdminEventosPanel, AdminComparsasPanel).
 *
 * `deps` funciona igual que en useEffect: la lista se recarga cuando
 * cambia alguno de sus valores (p. ej. el id de la comparsa seleccionada).
 */
export function useAsyncList<T>(fetcher: () => Promise<T[]>, deps: DependencyList = []): UseAsyncListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setIsLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  // Mismo patrón de fetching-en-efecto documentado en useAgenda: setIsLoading
  // se marca de forma síncrona al principio para que la UI muestre "cargando"
  // desde el primer render tras el cambio de deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(reload, deps);

  return { data, setData, isLoading, error, setError, reload };
}
