import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

/**
 * Posición del usuario en tiempo real (se actualiza sola al moverse).
 * Devuelve `null` mientras no hay permiso o no hay dato todavía — el mapa
 * simplemente no dibuja el punto propio en ese caso, sin bloquear nada.
 */
export function useUserLocation(): [number, number] | null {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    let watchId: string | null = null;
    let cancelled = false;

    const start = async () => {
      try {
        const perms = await Geolocation.requestPermissions();
        if (perms.location !== 'granted' && perms.coarseLocation !== 'granted') return;
        if (cancelled) return;

        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
          if (cancelled || err || !pos) return;
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        });
      } catch {
        // Sin permiso o sin soporte (p. ej. navegador de escritorio sin
        // geolocalización): el mapa se queda sin el punto propio.
      }
    };

    start();

    return () => {
      cancelled = true;
      if (watchId) Geolocation.clearWatch({ id: watchId });
    };
  }, []);

  return position;
}
