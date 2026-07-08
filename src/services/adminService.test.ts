import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('checkIsAdmin', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('devuelve false si Supabase no está configurado (sin backoffice posible)', async () => {
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: false,
      supabase: {} as never,
    }));

    const { checkIsAdmin } = await import('./adminService');
    expect(await checkIsAdmin('u1')).toBe(false);
  });

  it('devuelve true si el usuario está en la tabla admins', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { user_id: 'u1' }, error: null });
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) } as never,
    }));

    const { checkIsAdmin } = await import('./adminService');
    expect(await checkIsAdmin('u1')).toBe(true);
  });

  it('devuelve false si el usuario no está en la tabla admins', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) } as never,
    }));

    const { checkIsAdmin } = await import('./adminService');
    expect(await checkIsAdmin('u2')).toBe(false);
  });

  it('devuelve false si la consulta falla', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) } as never,
    }));

    const { checkIsAdmin } = await import('./adminService');
    expect(await checkIsAdmin('u3')).toBe(false);
  });
});
