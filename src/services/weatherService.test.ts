import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const invokeMock = vi.fn();

vi.mock('./supabase', () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invokeMock(...args) } },
}));

describe('getCurrentWeather', () => {
  // El servicio cachea en memoria del módulo (para que el widget no
  // espere a la red en cada montaje) — hay que reimportarlo "limpio" en
  // cada test para que esa caché no se filtre entre casos.
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    invokeMock.mockReset();
  });

  it('devuelve temperatura y condición cuando la función responde correctamente', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 26.4, condition: 'despejado' }, error: null });
    const { getCurrentWeather } = await import('./weatherService');

    expect(await getCurrentWeather()).toEqual({ temperature: 26.4, condition: 'despejado' });
  });

  it('devuelve condition null si AEMET no trae estado del cielo', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 18, condition: null }, error: null });
    const { getCurrentWeather } = await import('./weatherService');

    expect(await getCurrentWeather()).toEqual({ temperature: 18, condition: null });
  });

  it('devuelve null si la función responde con error y no hay caché previa', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('fallo') });
    const { getCurrentWeather } = await import('./weatherService');

    expect(await getCurrentWeather()).toBeNull();
  });

  it('devuelve null si la invocación lanza y no hay caché previa', async () => {
    invokeMock.mockRejectedValue(new Error('network error'));
    const { getCurrentWeather } = await import('./weatherService');

    expect(await getCurrentWeather()).toBeNull();
  });

  it('devuelve null si el payload no trae una temperatura numérica', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 'N/A' }, error: null });
    const { getCurrentWeather } = await import('./weatherService');

    expect(await getCurrentWeather()).toBeNull();
  });

  it('reutiliza el dato en caché en vez de volver a llamar a la función', async () => {
    invokeMock.mockResolvedValue({ data: { temperature: 30, condition: 'lluvia' }, error: null });
    const { getCurrentWeather } = await import('./weatherService');

    await getCurrentWeather();
    await getCurrentWeather();

    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it('si falla tras expirar la caché, devuelve el último dato conocido en vez de null', async () => {
    vi.useFakeTimers();
    try {
      invokeMock.mockResolvedValueOnce({ data: { temperature: 22, condition: 'nuboso' }, error: null });
      const { getCurrentWeather } = await import('./weatherService');
      await getCurrentWeather();

      vi.advanceTimersByTime(11 * 60 * 1000); // pasa el TTL de 10 minutos
      invokeMock.mockRejectedValueOnce(new Error('network error'));

      expect(await getCurrentWeather()).toEqual({ temperature: 22, condition: 'nuboso' });
    } finally {
      vi.useRealTimers();
    }
  });
});
