import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('isSupabaseConfigured', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('es true cuando la URL y la clave anon están presentes', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(true);
  });

  it('es false si falta la URL', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('es false si falta la clave anon', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('es false si faltan ambas', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('exporta un cliente de Supabase real (con .auth)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

    const { supabase } = await import('./supabase');
    expect(supabase.auth).toBeDefined();
  });
});
