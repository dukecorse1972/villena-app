-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 005: Tokens de notificaciones push
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
-- ═══════════════════════════════════════════════════════════════════

-- ── push_tokens ─────────────────────────────────────────────────────
-- Un token por dispositivo instalado. No requiere sesión: los avisos
-- son públicos para cualquiera que tenga la app, esté o no logueado.
-- user_id es opcional, solo por si en el futuro interesa targeting.
CREATE TABLE IF NOT EXISTS public.push_tokens (
  token      text        PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  platform   text        NOT NULL CHECK (platform IN ('android', 'ios')),
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.push_tokens IS 'Tokens FCM de dispositivos, para el envío de avisos push';

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);


-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Sin política de SELECT: nadie (ni anon ni authenticated) puede leer
-- la lista de tokens desde el cliente. Solo la Edge Function, que usa
-- la service_role key (que salta RLS), puede leerlos para enviar avisos.

-- Cualquiera puede registrar el token de su propio dispositivo.
-- Si viaja un user_id, tiene que coincidir con el usuario autenticado.
CREATE POLICY "Push tokens: registrar propio dispositivo"
  ON public.push_tokens FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Refrescar el propio token (Firebase lo rota de vez en cuando).
CREATE POLICY "Push tokens: refrescar propio dispositivo"
  ON public.push_tokens FOR UPDATE
  USING (true)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Desregistrar el propio dispositivo (p. ej. si desactiva los avisos).
CREATE POLICY "Push tokens: borrar propio dispositivo"
  ON public.push_tokens FOR DELETE
  USING (true);
