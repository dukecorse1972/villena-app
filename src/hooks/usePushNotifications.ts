import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useAuth } from './useAuth';
import { registerPushToken } from '../services/pushTokensService';
import { ROUTES } from '../constants';

const AVISOS_CHANNEL_ID = 'avisos';

/**
 * Pide permiso, registra el dispositivo en FCM/APNs y guarda el token en
 * Supabase. Al tocar una notificación, navega directo a la pantalla de
 * Avisos. No hace nada en web — solo tiene sentido dentro de la app nativa.
 */
export function usePushNotifications(): void {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const setup = async () => {
      if (Capacitor.getPlatform() === 'android') {
        await PushNotifications.createChannel({
          id: AVISOS_CHANNEL_ID,
          name: 'Avisos de la Junta Central',
          description: 'Avisos oficiales de las Fiestas de Moros y Cristianos de Villena',
          importance: 4,
        });
      }

      const current = await PushNotifications.checkPermissions();
      const granted = current.receive === 'granted'
        ? true
        : (await PushNotifications.requestPermissions()).receive === 'granted';

      if (!cancelled && granted) {
        await PushNotifications.register();
      }
    };

    setup().catch((err) => console.error('[push] fallo al preparar notificaciones', err));

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const registrationListener = PushNotifications.addListener('registration', (token) => {
      const platform = Capacitor.getPlatform() as 'android' | 'ios';
      registerPushToken(token.value, platform, user?.id ?? null).catch((err) => {
        console.error('[push] fallo al guardar el token en Supabase', err);
      });
    });

    const registrationErrorListener = PushNotifications.addListener('registrationError', (err) => {
      console.error('[push] fallo al registrar el dispositivo en FCM', err);
    });

    const tapListener = PushNotifications.addListener('pushNotificationActionPerformed', () => {
      navigate(`${ROUTES.INFO}?view=avisos`);
    });

    return () => {
      registrationListener.then((l) => l.remove());
      registrationErrorListener.then((l) => l.remove());
      tapListener.then((l) => l.remove());
    };
  }, [navigate, user?.id]);
}
