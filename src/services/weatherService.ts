// Coordenadas del centro de Villena (mismas que el resto de POIs de la app)
const VILLENA_LAT = 38.6338;
const VILLENA_LNG = -0.8641;

const FORECAST_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${VILLENA_LAT}&longitude=${VILLENA_LNG}` +
  `&current=temperature_2m&timezone=auto`;

/**
 * Temperatura actual en Villena (°C), vía Open-Meteo (API gratuita, sin clave).
 * Devuelve null si la petición falla o la respuesta no trae el dato esperado —
 * la UI debe ocultar el widget en ese caso, nunca mostrar un valor inventado.
 */
export async function getCurrentTemperature(): Promise<number | null> {
  try {
    const res = await fetch(FORECAST_URL);
    if (!res.ok) return null;

    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    return typeof temp === 'number' ? temp : null;
  } catch {
    return null;
  }
}
