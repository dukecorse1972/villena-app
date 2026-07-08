import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { NATIVE_AUTH_REDIRECT } from '../constants';

export interface AuthActions {
  user:              User | null;
  isLoading:         boolean;
  signInWithGoogle:  () => Promise<void>;
  signInWithEmail:   (email: string, password: string) => Promise<void>;
  signUpWithEmail:   (email: string, password: string) => Promise<void>;
  signOut:           () => Promise<void>;
}

export function useAuth(): AuthActions {
  const [user,      setUser]      = useState<User | null>(null);
  // Sin Supabase configurado no hay sesión que cargar: se sabe desde el
  // primer render, así que se calcula aquí en vez de fijarlo en un efecto.
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Cambios de sesión en tiempo real (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // En la app nativa el redirect de Google no puede volver a "window.location"
  // (no existe una URL real que Supabase pueda abrir): en su lugar la vuelta
  // llega como un deep link (es.villena.fiestas://auth-callback#access_token=...)
  // que capturamos aquí y usamos para completar la sesión a mano.
  useEffect(() => {
    if (!isSupabaseConfigured || !Capacitor.isNativePlatform()) return;

    const listenerPromise = CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith(NATIVE_AUTH_REDIRECT)) return;

      const fragment = url.split('#')[1] ?? '';
      const params = new URLSearchParams(fragment);
      const access_token  = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
      await Browser.close();
    });

    return () => { listenerPromise.then((listener) => listener.remove()); };
  }, []);

  const signInWithGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true },
      });
      if (error) throw new Error(error.message);
      if (data.url) await Browser.open({ url: data.url });
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut };
}
