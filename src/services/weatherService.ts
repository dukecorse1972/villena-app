import { supabase } from './supabase';

export type WeatherCondition =
  | 'despejado' | 'poco-nuboso' | 'nuboso' | 'cubierto'
  | 'lluvia' | 'chubascos' | 'tormenta' | 'nieve' | 'niebla';

export interface Weather {
  temperature: number;
  condition:   WeatherCondition | null;
}

/**
 * Tiempo actual en Villena: temperatura y condición del cielo, vía la
 * predicción horaria oficial de AEMET (Edge Function `get-weather`, que
 * guarda la clave de AEMET fuera del cliente). Devuelve null si la
 * petición falla — la UI debe ocultar el widget en ese caso, nunca
 * mostrar un valor inventado.
 */
export async function getCurrentWeather(): Promise<Weather | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{ temperature: unknown; condition: unknown }>('get-weather');
    if (error || !data) return null;

    const temperature = data.temperature;
    if (typeof temperature !== 'number') return null;

    const condition = typeof data.condition === 'string' ? (data.condition as WeatherCondition) : null;
    return { temperature, condition };
  } catch {
    return null;
  }
}
