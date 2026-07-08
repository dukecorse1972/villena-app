import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';

/**
 * En Android, el botón/gesto "atrás" del sistema cierra la app entera si
 * nadie lo gestiona (el WebView no tiene historial de navegación propio
 * para Capacitor). Aquí lo conectamos a la navegación de React Router:
 * atrás dentro de la app en cualquier pantalla salvo Inicio, y solo
 * minimiza la app cuando ya no queda a dónde volver.
 * No hace nada en web ni en iOS (el evento no se dispara).
 */
export function useAndroidBackButton(): void {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (pathname === ROUTES.INICIO) {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => { listenerPromise.then((listener) => listener.remove()); };
  }, [navigate, pathname]);
}
