import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCurrentWeather } from './weatherService';

const invokeMock = vi.fn();

vi.mock('./supabase', () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invokeMock(...args) } },
}));

describe('getCurrentWeather', () => {
  afterEach(() => {
    invokeMock.mockReset();
  });

  it('devuelve temperatura y condición cuando la función responde correctamente', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 26.4, condition: 'despejado' }, error: null });

    expect(await getCurrentWeather()).toEqual({ temperature: 26.4, condition: 'despejado' });
  });

  it('devuelve condition null si AEMET no trae estado del cielo', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 18, condition: null }, error: null });

    expect(await getCurrentWeather()).toEqual({ temperature: 18, condition: null });
  });

  it('devuelve null si la función responde con error', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('fallo') });

    expect(await getCurrentWeather()).toBeNull();
  });

  it('devuelve null si la invocación lanza (sin red, etc.)', async () => {
    invokeMock.mockRejectedValue(new Error('network error'));

    expect(await getCurrentWeather()).toBeNull();
  });

  it('devuelve null si el payload no trae una temperatura numérica', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 'N/A' }, error: null });

    expect(await getCurrentWeather()).toBeNull();
  });
});
