-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 015: Valoraciones de Comparsas
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.comparsa_ratings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  comparsa_id  text        NOT NULL REFERENCES public.comparsas(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       smallint    NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comparsa_ratings_user_comparsa_unique UNIQUE (comparsa_id, user_id)
);

COMMENT ON TABLE public.comparsa_ratings IS 'Valoraciones (1-5 estrellas) por comparsa emitidas por usuarios autenticados.';

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────────
ALTER TABLE public.comparsa_ratings ENABLE ROW LEVEL SECURITY;

-- Lectura: cada usuario consulta únicamente su propia valoración
CREATE POLICY "Valoraciones: leer propias"
  ON public.comparsa_ratings FOR SELECT
  USING (auth.uid() = user_id);

-- Inserción: solo el propio usuario autenticado
CREATE POLICY "Valoraciones: insertar propias"
  ON public.comparsa_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Actualización: solo el propio usuario autenticado
CREATE POLICY "Valoraciones: actualizar propias"
  ON public.comparsa_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Eliminación: solo el propio usuario autenticado
CREATE POLICY "Valoraciones: eliminar propias"
  ON public.comparsa_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ── TRIGGER updated_at ──────────────────────────────────────────────
CREATE TRIGGER trg_comparsa_ratings_updated_at
  BEFORE UPDATE ON public.comparsa_ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ÍNDICES ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comparsa_ratings_user     ON public.comparsa_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_comparsa_ratings_comparsa ON public.comparsa_ratings(comparsa_id);
