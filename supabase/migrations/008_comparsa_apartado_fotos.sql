-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 008: fotos de los apartados de la comparsa
-- (imagen de desfile, traje de gala, estandarte)
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.comparsas
  ADD COLUMN IF NOT EXISTS desfile_img_url     text,
  ADD COLUMN IF NOT EXISTS traje_gala_img_url  text,
  ADD COLUMN IF NOT EXISTS estandarte_img_url  text;

COMMENT ON COLUMN public.comparsas.desfile_img_url    IS 'Foto de la comparsa en el desfile (hero de la ficha).';
COMMENT ON COLUMN public.comparsas.traje_gala_img_url IS 'Foto del traje de gala.';
COMMENT ON COLUMN public.comparsas.estandarte_img_url IS 'Foto del estandarte.';
