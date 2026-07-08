// ═══════════════════════════════════════════════════════════════════
// Edge Function: get-weather
//
// Proxy a la predicción horaria por municipio de AEMET (fuente oficial,
// más fiable para Villena que un modelo meteorológico genérico) para el
// widget de tiempo de Inicio. Vive en un Edge Function y no se llama
// directo desde el cliente porque:
//   1) La clave de AEMET no debe viajar dentro del bundle/APK — cualquiera
//      podría extraerla y agotar la cuota gratuita.
//   2) AEMET responde en dos pasos (la primera llamada solo da una URL
//      temporal con los datos reales) y en Latin-1/ISO-8859-15 aunque
//      diga UTF-8 — mejor resolverlo aquí y devolver al cliente un JSON
//      simple y ya en la zona horaria correcta.
//
// Secreto requerido (`supabase secrets set AEMET_API_KEY=...`):
//   AEMET_API_KEY — clave gratuita de https://opendata.aemet.es
//
// Municipio: Villena (Alicante), código INE/AEMET 03140.
// ═══════════════════════════════════════════════════════════════════

const MUNICIPIO_VILLENA = '03140';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AemetEnvelope {
  descripcion: string;
  estado:      number;
  datos?:      string;
}

interface HourlyValue {
  periodo: string; // hora en formato "00".."23"
  value:   string;
}

interface DiaPrediccion {
  fecha:        string; // 'YYYY-MM-DDT00:00:00'
  temperatura:  HourlyValue[];
  estadoCielo:  HourlyValue[];
}

interface MunicipioPrediccion {
  prediccion: { dia: DiaPrediccion[] };
}

// AEMET codifica su JSON en ISO-8859-15 aunque el Content-Type diga
// UTF-8 (fallo conocido de su API) — decodificar como UTF-8 corrompería
// tildes/ñ y podría romper el parseo si algún campo de texto las trae.
async function fetchAemetJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const buf  = new Uint8Array(await res.arrayBuffer());
  const text = new TextDecoder('iso-8859-15').decode(buf);
  return JSON.parse(text) as T;
}

/** Condición genérica (para elegir icono) a partir del código estadoCielo de AEMET. */
function toCondition(code: string): string {
  const base  = code.replace('n', '');
  const digit = base[0];

  if (base.startsWith('8')) return 'niebla';
  if (digit === '7') return 'nieve';
  if (digit === '6') return 'chubascos';
  if (digit === '4' || digit === '5') return 'tormenta';
  if (digit === '2' || digit === '3') return 'lluvia';

  // Familia "1x": nivel de nubosidad de despejado (1) a cubierto (6+)
  const tier = Number(base[1] ?? '1');
  if (tier <= 1) return 'despejado';
  if (tier <= 2) return 'poco-nuboso';
  if (tier <= 4) return 'nuboso';
  return 'cubierto';
}

/** Hora local de Madrid como string de 2 dígitos ("00".."23"), como usa AEMET. */
function madridHour(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false }).format(date);
}

function madridDateISO(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(date); // 'YYYY-MM-DD'
}

/** Busca el valor horario más cercano a la hora actual dentro de los días de predicción. */
function findClosestHourly(dias: DiaPrediccion[], field: 'temperatura' | 'estadoCielo', now: Date): string | null {
  const todayISO   = madridDateISO(now);
  const targetHour = Number(madridHour(now));

  let best: { diff: number; value: string } | null = null;

  for (const dia of dias) {
    const diaISO = dia.fecha.slice(0, 10);
    const dayOffset = diaISO === todayISO ? 0 : (new Date(diaISO).getTime() > new Date(todayISO).getTime() ? 24 : -24);

    for (const entry of dia[field]) {
      const hour = Number(entry.periodo);
      if (Number.isNaN(hour)) continue;
      const diff = Math.abs(hour + dayOffset - targetHour);
      if (!best || diff < best.diff) best = { diff, value: entry.value };
    }
  }

  return best?.value ?? null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });

  const apiKey = Deno.env.get('AEMET_API_KEY');
  if (!apiKey) return jsonResponse({ error: 'Falta configurar AEMET_API_KEY' }, 500);

  try {
    const envelope = await fetchAemetJson<AemetEnvelope>(
      `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/${MUNICIPIO_VILLENA}?api_key=${apiKey}`,
    );
    if (!envelope.datos) return jsonResponse({ error: envelope.descripcion || 'AEMET no devolvió datos' }, 502);

    const [municipio] = await fetchAemetJson<MunicipioPrediccion[]>(envelope.datos);
    const dias = municipio?.prediccion?.dia ?? [];

    const now = new Date();
    const temperatureStr = findClosestHourly(dias, 'temperatura', now);
    const skyCode         = findClosestHourly(dias, 'estadoCielo', now);

    if (temperatureStr === null) return jsonResponse({ error: 'AEMET no trae temperatura horaria' }, 502);

    return jsonResponse({
      temperature: Number(temperatureStr),
      condition:   skyCode ? toCondition(skyCode) : null,
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error desconocido' }, 500);
  }
});
