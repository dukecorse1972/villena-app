-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 007: bucket de Storage para fotos de comparsas y cargos
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('comparsas', 'comparsas', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública: logos de comparsa y fotos de cargos se muestran en la
-- app sin necesidad de estar logueado.
CREATE POLICY "Comparsas storage: lectura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'comparsas');

-- Escritura (subir/actualizar/borrar) solo para admins del backoffice.
CREATE POLICY "Comparsas storage: escritura solo admins"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'comparsas'
    AND EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'comparsas'
    AND EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  );
