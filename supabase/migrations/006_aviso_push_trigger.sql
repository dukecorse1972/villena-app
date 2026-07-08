-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 006: Trigger que dispara el push al crear un aviso
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → sustituir
--   REPLACE_WITH_AVISO_WEBHOOK_SECRET por el valor real del secreto
--   AVISO_WEBHOOK_SECRET (Edge Functions → Secrets) → pegar y ejecutar
--
-- Reemplaza a la función de "Database Webhooks" del dashboard (ya no
-- existe como pantalla en algunas versiones): un trigger de Postgres +
-- la extensión pg_net hace la misma llamada HTTP a la Edge Function
-- `send-aviso-push`.
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_aviso_push()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://fzetusdxlbghtykuudnl.supabase.co/functions/v1/send-aviso-push',
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-webhook-secret', 'REPLACE_WITH_AVISO_WEBHOOK_SECRET'
    ),
    body := jsonb_build_object(
      'type',   'INSERT',
      'table',  'avisos',
      'record', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_aviso_push
  AFTER INSERT ON public.avisos
  FOR EACH ROW EXECUTE FUNCTION public.trigger_aviso_push();
