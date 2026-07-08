import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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

  const signInWithGoogle = async () => {
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
