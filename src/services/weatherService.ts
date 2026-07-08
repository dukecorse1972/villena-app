import { supabase } from './supabase';

export type WeatherCondition =
  | 'despejado' | 'poco-nuboso' | 'nuboso' | 'cubierto'
  | 'lluvia' | 'chubascos' | 'tormenta' | 'nieve' | 'niebla';

export interface Weather {
  temperature: number;
  condition:   WeatherCondition | null;
}

// AEMET solo actualiza su predicción horaria una vez por hora, así que
// no tiene sentido volver a pedirla en cada montaje de InicioPage (cada
// vez que se cambia de pestaña y se vuelve). Con esta caché en memoria,
// al volver a Inicio dentro de la misma sesión el widget aparece al
// instante con el último dato conocido en vez de esperar a la Edge
// Function + AEMET de nuevo.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
let cached: { weather: Weather; fetchedAt: number } | null = null;

async function fetchWeather(): Promise<Weather | null> {
  const { data, error } = await supabase.functions.invoke<{ temperature: unknown; condition: unknown }>('get-weather');
  if (error || !data) return null;

  const temperature = data.temperature;
  if (typeof temperature !== 'number') return null;

  const condition = typeof data.condition === 'string' ? (data.condition as WeatherCondition) : null;
  return { temperature, condition };
}

/**
 * Tiempo actual en Villena: temperatura y condición del cielo, vía la
 * predicción horaria oficial de AEMET (Edge Function `get-weather`, que
 * guarda la clave de AEMET fuera del cliente). Devuelve null si la
 * petición falla y no hay nada en caché — la UI debe ocultar el widget
 * en ese caso, nunca mostrar un valor inventado.
 */
export async function getCurrentWeather(): Promise<Weather | null> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.weather;

  try {
    const weather = await fetchWeather();
    if (!weather) return cached?.weather ?? null; // si falla, mejor un dato algo viejo que nada
    cached = { weather, fetchedAt: Date.now() };
    return weather;
  } catch {
    return cached?.weather ?? null;
  }
}
