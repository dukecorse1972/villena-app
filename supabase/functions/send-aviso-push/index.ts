// ═══════════════════════════════════════════════════════════════════
// Edge Function: send-aviso-push
//
// Se dispara desde un Database Webhook de Supabase cuando se inserta
// una fila en `avisos`. Manda un push (FCM HTTP v1) a todos los
// dispositivos registrados en `push_tokens`.
//
// Secretos requeridos (Project Settings → Edge Functions → Secrets,
// o `supabase secrets set NOMBRE=valor`):
//   FCM_SERVICE_ACCOUNT_KEY  — el JSON completo de la cuenta de servicio
//                              de Firebase (Project Settings → Cuentas
//                              de servicio → Generar nueva clave privada)
//   AVISO_WEBHOOK_SECRET     — cadena aleatoria propia, para comprobar
//                              que la llamada viene del webhook y no de
//                              cualquiera que adivine la URL
//
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase solo,
// no hace falta configurarlos.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ServiceAccount {
  project_id:  string;
  client_email: string;
  private_key: string;
}

interface WebhookPayload {
  type:   string;
  table:  string;
  record: { id: string; text: string };
}

// ── JWT firmado con la cuenta de servicio, para pedir un access token OAuth2 ──
async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  const header  = { alg: 'RS256', typ: 'JWT' };
  const now     = Math.floor(Date.now() / 1000);
  const claims  = {
    iss:   sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  };

  const b64url = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const enc = new TextEncoder();
  const unsigned = `${b64url(enc.encode(JSON.stringify(header)))}.${b64url(enc.encode(JSON.stringify(claims)))}`;

  const pemBody = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(unsigned));
  const jwt = `${unsigned}.${b64url(new Uint8Array(signature))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  if (!res.ok) throw new Error(`No se pudo obtener el access token de Google: ${await res.text()}`);
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  const expectedSecret = Deno.env.get('AVISO_WEBHOOK_SECRET');
  const givenSecret     = req.headers.get('x-webhook-secret');
  if (!expectedSecret || givenSecret !== expectedSecret) {
    return new Response('No autorizado', { status: 401 });
  }

  const payload = await req.json() as WebhookPayload;
  if (payload.table !== 'avisos' || payload.type !== 'INSERT') {
    return new Response('Ignorado (no es un aviso nuevo)', { status: 200 });
  }

  const saJson = Deno.env.get('FCM_SERVICE_ACCOUNT_KEY');
  if (!saJson) return new Response('Falta FCM_SERVICE_ACCOUNT_KEY', { status: 500 });
  const sa = JSON.parse(saJson) as ServiceAccount;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: tokens, error } = await supabase.from('push_tokens').select('token');
  if (error) return new Response(`Error leyendo tokens: ${error.message}`, { status: 500 });
  if (!tokens || tokens.length === 0) return new Response('Sin dispositivos registrados', { status: 200 });

  const accessToken = await getFcmAccessToken(sa);
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

  const deadTokens: string[] = [];
  let sent = 0;

  for (const { token } of tokens) {
    const res = await fetch(fcmUrl, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          // Data-only: así el mensaje SIEMPRE pasa por nuestro
          // MyFirebaseMessagingService en el dispositivo (también con la
          // app en segundo plano), que es quien construye la notificación
          // a mano con el logo real como avatar circular (largeIcon). Con
          // un campo "notification" aquí, Android la auto-mostraría él
          // solo sin darnos esa opción.
          android: { priority: 'high' },
          data: {
            avisoId: payload.record.id,
            title:   'Aviso de la Junta Central de Fiestas',
            body:    payload.record.text,
          },
        },
      }),
    });

    if (res.ok) {
      sent++;
    } else {
      const body = await res.text();
      // Token de un dispositivo que ya no existe (desinstalado, etc.) — se limpia.
      if (body.includes('UNREGISTERED') || body.includes('NOT_FOUND')) deadTokens.push(token);
    }
  }

  if (deadTokens.length > 0) {
    await supabase.from('push_tokens').delete().in('token', deadTokens);
  }

  return new Response(
    JSON.stringify({ sent, total: tokens.length, removed: deadTokens.length }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
