-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 001: Schema inicial
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensiones ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════════════
-- TABLAS
-- ════════════════════════════════════════════════════════════════════

-- ── eventos ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.eventos (
  id          text        PRIMARY KEY,
  title       text        NOT NULL,
  time        text        NOT NULL,             -- formato 'HH:MM'
  location    text        NOT NULL,
  type        text        NOT NULL
              CHECK (type IN ('Desfiles', 'Religiosos', 'Música', 'Cultural')),
  day         integer     NOT NULL CHECK (day BETWEEN 1 AND 30),
  year        integer     NOT NULL DEFAULT 2026,
  img_url     text,                             -- foto del tipo de acto
  description text,                             -- descripción larga
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.eventos IS 'Actos oficiales del programa de fiestas de Villena';

-- ── comparsas ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comparsas (
  id            text        PRIMARY KEY,
  name          text        NOT NULL,
  bando         text        NOT NULL CHECK (bando IN ('Cristiano', 'Moro')),
  color         text        NOT NULL DEFAULT '#1a1a1a', -- color de emblema fallback
  img_url       text,                                   -- logo/escudo
  description   text,
  founded_year  integer,
  num_socios    integer,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.comparsas IS 'Las 14 comparsas (7 Cristianas + 7 Moras) de Villena';

-- ── avisos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avisos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  text        text        NOT NULL,
  is_new      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.avisos IS 'Avisos y notificaciones de la Junta Central de Fiestas';

-- ── pois ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pois (
  id          text           PRIMARY KEY,
  name        text           NOT NULL,
  description text,
  lat         numeric(10,7)  NOT NULL,
  lng         numeric(10,7)  NOT NULL,
  category    text           NOT NULL,
  icon        text           NOT NULL DEFAULT 'map',
  created_at  timestamptz    NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pois IS 'Puntos de interés con coordenadas GPS de Villena';

-- ── favoritos (preparada para Tanda 3 — auth) ───────────────────────
CREATE TABLE IF NOT EXISTS public.favoritos (
  user_id    uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evento_id  text  NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, evento_id)
);
COMMENT ON TABLE public.favoritos IS 'Favoritos por usuario autenticado. Preparada para Tanda 3.';


-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.eventos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparsas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pois       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos  ENABLE ROW LEVEL SECURITY;

-- Lectura pública (anon + authenticated pueden leer)
CREATE POLICY "Lectura pública: eventos"
  ON public.eventos FOR SELECT USING (true);

CREATE POLICY "Lectura pública: comparsas"
  ON public.comparsas FOR SELECT USING (true);

CREATE POLICY "Lectura pública: avisos"
  ON public.avisos FOR SELECT USING (true);

CREATE POLICY "Lectura pública: pois"
  ON public.pois FOR SELECT USING (true);

-- Escritura de contenido: solo service_role (Supabase Studio / admin)
-- INSERT / UPDATE / DELETE de anon y authenticated está bloqueado por defecto

-- Favoritos: cada usuario gestiona solo los suyos
CREATE POLICY "Favoritos: leer propios"
  ON public.favoritos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Favoritos: insertar propios"
  ON public.favoritos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Favoritos: eliminar propios"
  ON public.favoritos FOR DELETE
  USING (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════════
-- ÍNDICES
-- ════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_eventos_day_year  ON public.eventos(day, year);
CREATE INDEX IF NOT EXISTS idx_eventos_type      ON public.eventos(type);
CREATE INDEX IF NOT EXISTS idx_comparsas_bando   ON public.comparsas(bando);
CREATE INDEX IF NOT EXISTS idx_favoritos_user    ON public.favoritos(user_id);


-- ════════════════════════════════════════════════════════════════════
-- TRIGGER: mantener updated_at automático
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_comparsas_updated_at
  BEFORE UPDATE ON public.comparsas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
