import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCurrentTemperature } from './weatherService';

describe('getCurrentTemperature', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('devuelve la temperatura cuando la API responde correctamente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 26.4 } }),
    }));

    expect(await getCurrentTemperature()).toBe(26.4);
  });

  it('devuelve null si la respuesta no es OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    expect(await getCurrentTemperature()).toBeNull();
  });

  it('devuelve null si la petición falla (sin red, etc.)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    expect(await getCurrentTemperature()).toBeNull();
  });

  it('devuelve null si el payload no trae el campo esperado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    expect(await getCurrentTemperature()).toBeNull();
  });
});
