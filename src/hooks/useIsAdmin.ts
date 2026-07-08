import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkIsAdmin } from '../services/adminService';

export interface IsAdminResult {
  isAdmin:   boolean;
  isLoading: boolean;
}

/**
 * Indica si el usuario autenticado actual es administrador del backoffice.
 * Depende de useAuth: mientras la sesión no está resuelta, isLoading es true.
 */
export function useIsAdmin(): IsAdminResult {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin]     = useState(false);
  // Empieza en true: hasta que el efecto resuelva si hay usuario y si es
  // admin, no se puede afirmar "no tiene acceso" sin arriesgar un falso
  // negativo momentáneo.
  const [checking, setChecking]   = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Responde a un cambio de sesión externo (logout), no a un valor
      // derivable en render — mismo patrón ya usado en useAuth/useAgenda.
      setIsAdmin(false); // eslint-disable-line react-hooks/set-state-in-effect
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    checkIsAdmin(user.id)
      .then((result) => { if (!cancelled) setIsAdmin(result); })
      .finally(() => { if (!cancelled) setChecking(false); });

    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { isAdmin, isLoading: authLoading || checking };
}
