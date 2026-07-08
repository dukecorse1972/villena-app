import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Comprueba si un usuario es administrador (backoffice JCF).
 * El alta en la tabla `admins` es siempre manual (Supabase Studio);
 * este servicio solo consulta si el usuario dado ya está en ella.
 *
 * Sin Supabase configurado no hay backoffice posible: siempre false.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return false;
  return data !== null;
}
