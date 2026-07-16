import { webcrypto } from 'node:crypto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// jsdom no implementa crypto.subtle de forma fiable; usamos el Web Crypto
// real de Node (idéntico en comportamiento al del navegador/WebView) solo
// para este archivo, sin tocar el setup global de tests.
vi.stubGlobal('crypto', webcrypto);

const isNativePlatformMock = vi.fn();
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: (...args: unknown[]) => isNativePlatformMock(...args) },
}));

const socialLoginInitializeMock = vi.fn();
const socialLoginLoginMock = vi.fn();
vi.mock('@capgo/capacitor-social-login', () => ({
  SocialLogin: {
    initialize: (...args: unknown[]) => socialLoginInitializeMock(...args),
    login: (...args: unknown[]) => socialLoginLoginMock(...args),
  },
}));

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signInWithOAuthMock = vi.fn();
const signInWithIdTokenMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const signUpMock = vi.fn();
const signOutMock = vi.fn();
let isSupabaseConfiguredMock = true;

vi.mock('../services/supabase', () => ({
  get isSupabaseConfigured() { return isSupabaseConfiguredMock; },
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
      onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
      signInWithOAuth: (...args: unknown[]) => signInWithOAuthMock(...args),
      signInWithIdToken: (...args: unknown[]) => signInWithIdTokenMock(...args),
      signInWithPassword: (...args: unknown[]) => signInWithPasswordMock(...args),
      signUp: (...args: unknown[]) => signUpMock(...args),
      signOut: (...args: unknown[]) => signOutMock(...args),
    },
  },
}));

async function sha256Hex(value: string): Promise<string> {
  const digest = await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetModules();
    isSupabaseConfiguredMock = true;
    isNativePlatformMock.mockReset();
    socialLoginInitializeMock.mockReset().mockResolvedValue(undefined);
    socialLoginLoginMock.mockReset();
    getSessionMock.mockReset().mockResolvedValue({ data: { session: null } });
    onAuthStateChangeMock.mockReset().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    signInWithOAuthMock.mockReset().mockResolvedValue({ error: null });
    signInWithIdTokenMock.mockReset().mockResolvedValue({ error: null });
    signInWithPasswordMock.mockReset().mockResolvedValue({ error: null });
    signUpMock.mockReset().mockResolvedValue({ error: null });
    signOutMock.mockReset().mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('sesión inicial', () => {
    it('sin Supabase configurado, isLoading empieza en false y no consulta la sesión', async () => {
      isSupabaseConfiguredMock = false;
      const { useAuth } = await import('./useAuth');

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(getSessionMock).not.toHaveBeenCalled();
      expect(onAuthStateChangeMock).not.toHaveBeenCalled();
    });

    it('con Supabase configurado, carga la sesión inicial y actualiza isLoading', async () => {
      const user = { id: 'u1', email: 'festero@example.com' };
      getSessionMock.mockResolvedValue({ data: { session: { user } } });
      const { useAuth } = await import('./useAuth');

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.user).toEqual(user);
    });

    it('reacciona a los cambios de sesión de onAuthStateChange', async () => {
      let capturedCallback: ((event: string, session: unknown) => void) | undefined;
      onAuthStateChangeMock.mockImplementation((cb: (event: string, session: unknown) => void) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });
      const { useAuth } = await import('./useAuth');

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newUser = { id: 'u2', email: 'nuevo@example.com' };
      act(() => { capturedCallback?.('SIGNED_IN', { user: newUser }); });

      expect(result.current.user).toEqual(newUser);
    });
  });

  describe('signInWithGoogle — web', () => {
    it('usa el flujo de navegador de Supabase cuando no es plataforma nativa', async () => {
      isNativePlatformMock.mockReturnValue(false);
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await act(async () => { await result.current.signInWithGoogle(); });

      expect(signInWithOAuthMock).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      expect(socialLoginLoginMock).not.toHaveBeenCalled();
    });
  });

  describe('signInWithGoogle — nativo', () => {
    it('completa sesión con signInWithIdToken usando un nonce consistente', async () => {
      isNativePlatformMock.mockReturnValue(true);
      socialLoginLoginMock.mockResolvedValue({
        provider: 'google',
        result: { responseType: 'online', idToken: 'id-token-123', profile: {} },
      });
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await act(async () => { await result.current.signInWithGoogle(); });

      expect(socialLoginInitializeMock).toHaveBeenCalledWith({
        google: {
          webClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
          iOSClientId: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID,
          mode: 'online',
        },
      });

      const loginArgs = socialLoginLoginMock.mock.calls[0][0];
      const hashedNonceSentToGoogle = loginArgs.options.nonce as string;

      const idTokenArgs = signInWithIdTokenMock.mock.calls[0][0];
      expect(idTokenArgs.provider).toBe('google');
      expect(idTokenArgs.token).toBe('id-token-123');
      const rawNonceSentToSupabase = idTokenArgs.nonce as string;

      // El nonce que recibe Google debe ser el SHA-256 del que recibe Supabase.
      expect(hashedNonceSentToGoogle).toBe(await sha256Hex(rawNonceSentToSupabase));
    });

    it('inicializa SocialLogin una sola vez aunque se llame dos veces', async () => {
      isNativePlatformMock.mockReturnValue(true);
      socialLoginLoginMock.mockResolvedValue({
        provider: 'google',
        result: { responseType: 'online', idToken: 'tok', profile: {} },
      });
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await act(async () => { await result.current.signInWithGoogle(); });
      await act(async () => { await result.current.signInWithGoogle(); });

      expect(socialLoginInitializeMock).toHaveBeenCalledTimes(1);
      expect(socialLoginLoginMock).toHaveBeenCalledTimes(2);
    });

    it('lanza un error si Google no devuelve idToken (modo offline/sin token)', async () => {
      isNativePlatformMock.mockReturnValue(true);
      socialLoginLoginMock.mockResolvedValue({
        provider: 'google',
        result: { responseType: 'offline', serverAuthCode: 'code' },
      });
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => { await result.current.signInWithGoogle(); }),
      ).rejects.toThrow('No se pudo completar el inicio de sesión con Google');
      expect(signInWithIdTokenMock).not.toHaveBeenCalled();
    });

    it('propaga el rechazo si el usuario cancela el selector de cuenta', async () => {
      isNativePlatformMock.mockReturnValue(true);
      const cancelError = Object.assign(new Error('User cancelled'), { code: 'USER_CANCELLED' });
      socialLoginLoginMock.mockRejectedValue(cancelError);
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => { await result.current.signInWithGoogle(); }),
      ).rejects.toThrow('User cancelled');
    });

    it('lanza el error de Supabase si signInWithIdToken falla', async () => {
      isNativePlatformMock.mockReturnValue(true);
      socialLoginLoginMock.mockResolvedValue({
        provider: 'google',
        result: { responseType: 'online', idToken: 'tok', profile: {} },
      });
      signInWithIdTokenMock.mockResolvedValue({ error: { message: 'audience mismatch' } });
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => { await result.current.signInWithGoogle(); }),
      ).rejects.toThrow('audience mismatch');
    });
  });

  describe('email/contraseña y sesión', () => {
    it('signInWithEmail lanza el error de Supabase si falla', async () => {
      signInWithPasswordMock.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => { await result.current.signInWithEmail('a@a.com', 'wrong'); }),
      ).rejects.toThrow('Invalid login credentials');
    });

    it('signInWithEmail no lanza si la llamada tiene éxito', async () => {
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => { await result.current.signInWithEmail('a@a.com', 'right'); }),
      ).resolves.not.toThrow();
      expect(signInWithPasswordMock).toHaveBeenCalledWith({ email: 'a@a.com', password: 'right' });
    });

    it('signUpWithEmail lanza el error de Supabase si falla', async () => {
      signUpMock.mockResolvedValue({ error: { message: 'ya existe' } });
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => { await result.current.signUpWithEmail('a@a.com', '123456'); }),
      ).rejects.toThrow('ya existe');
    });

    it('signOut llama a supabase.auth.signOut', async () => {
      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await act(async () => { await result.current.signOut(); });

      expect(signOutMock).toHaveBeenCalled();
    });
  });
});
