import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface AuthActions {
  user:              User | null;
  isLoading:         boolean;
  signInWithGoogle:  () => Promise<void>;
  signInWithEmail:   (email: string, password: string) => Promise<void>;
  signUpWithEmail:   (email: string, password: string) => Promise<void>;
  signOut:           () => Promise<void>;
  deleteAccount:     () => Promise<void>;
}

// El picker de cuenta nativo de Google necesita el Client ID antes de la
// primera llamada a login() — se inicializa una sola vez (mismo enfoque que
// src/i18n/index.ts al arrancar), no en cada intento de login.
let socialLoginInitPromise: Promise<void> | null = null;
function ensureSocialLoginInitialized(): Promise<void> {
  if (!socialLoginInitPromise) {
    socialLoginInitPromise = SocialLogin.initialize({
      google: {
        webClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
        iOSClientId: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID,
        mode: 'online',
      },
    });
  }
  return socialLoginInitPromise;
}

// Supabase exige el nonce sin hashear; el SDK nativo de Google exige la
// versión SHA-256 (hex) del mismo valor. `crypto.subtle` ya está disponible
// en el WebView, sin dependencia nueva.
function randomNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
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

  const signInWithGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      // Selector de cuenta nativo (Android/iOS) en vez de un navegador con el
      // flujo OAuth de Supabase — evita la pantalla "Ir a [dominio]" de Chrome
      // Custom Tabs. Si el usuario cancela el selector, SocialLogin.login()
      // lanza con code 'USER_CANCELLED', que se propaga tal cual a quien
      // llame a signInWithGoogle (LoginSection ya lo captura y muestra).
      await ensureSocialLoginInitialized();

      const rawNonce = randomNonce();
      const hashedNonce = await sha256Hex(rawNonce);

      // No se pasan `scopes` custom: el plugin ya añade email/profile/openid
      // por defecto, y pedirlos explícitamente exige modificar MainActivity.java
      // (ver ee.forgr...GoogleProvider#login) sin aportar nada distinto.
      const { result } = await SocialLogin.login({
        provider: 'google',
        options: { nonce: hashedNonce },
      });

      if (result.responseType !== 'online' || !result.idToken) {
        throw new Error('No se pudo completar el inicio de sesión con Google');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.idToken,
        nonce: rawNonce,
      });
      if (error) throw new Error(error.message);
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

  const deleteAccount = async () => {
    if (!user) return;
    if (isSupabaseConfigured) {
      try {
        await supabase.from('favoritos').delete().eq('user_id', user.id);
        await supabase.from('push_tokens').delete().eq('user_id', user.id);
      } catch {
        // Ignorar fallos de limpieza en cascada si no hay permisos
      }
    }
    await signOut();
  };

  return { user, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, deleteAccount };
}
