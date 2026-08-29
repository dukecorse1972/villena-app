// ═══════════════════════════════════════════════════════════════════
// Edge Function: delete-user
//
// Elimina la cuenta del usuario autenticado actual de `auth.users`
// utilizando la clave `service_role` de Supabase (requisito estricto
// de Apple App Store Guideline 5.1.1(v) y RGPD).
//
// Flujo de seguridad:
//   1. Lee el JWT de la cabecera `Authorization` de la petición.
//   2. Valida la identidad del usuario con `supabase.auth.getUser(jwt)`.
//   3. Si es válido, invoca `supabaseAdmin.auth.admin.deleteUser(user.id)`.
//   4. La base de datos (ON DELETE CASCADE) limpia automáticamente
//      sus favoritos, tokens push y valoraciones.
//
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase solo.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Cabecera Authorization no proporcionada' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return jsonResponse({ error: 'Configuración del servidor incompleta' }, 500);
  }

  // 1. Verificar identidad del usuario que hace la llamada con su JWT
  const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ error: 'Sesión no válida o expirada' }, 401);
  }

  // 2. Ejecutar borrado administrativo en auth.users con service_role
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return jsonResponse({ error: deleteError.message }, 500);
  }

  return jsonResponse({ success: true, message: 'Cuenta eliminada correctamente' }, 200);
});
