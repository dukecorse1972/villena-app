import { useState, useEffect } from 'react';

interface WebkitOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * Dirección hacia la que apunta el dispositivo (0-360°, 0 = norte, sentido
 * horario — igual que un rumbo de brújula), leída del sensor de
 * orientación. `null` si el dispositivo no tiene sensor, no se ha
 * concedido permiso (iOS lo exige de forma explícita), o todavía no ha
 * llegado ninguna lectura.
 */
export function useDeviceHeading(): number | null {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    const handleOrientation = (e: Event) => {
      const event = e as WebkitOrientationEvent;
      if (typeof event.webkitCompassHeading === 'number') {
        setHeading(event.webkitCompassHeading);
      } else if (event.absolute && event.alpha !== null) {
        setHeading(360 - event.alpha);
      }
    };

    let cancelled = false;

    const start = async () => {
      try {
        const DOE = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
        if (typeof DOE?.requestPermission === 'function') {
          const result = await DOE.requestPermission();
          if (result !== 'granted' || cancelled) return;
        }
      } catch {
        return; // iOS sin gesto de usuario reciente, o sensor no soportado.
      }

      if (cancelled) return;
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    };

    start();

    return () => {
      cancelled = true;
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  return heading;
}
