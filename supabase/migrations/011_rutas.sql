-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 011: recorridos de desfile (rutas)
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
--
-- Los actos de tipo Desfiles no son un punto, son un recorrido por
-- varias calles, y varios desfiles reales comparten la misma calle
-- (Av. Constitución, Calle Nueva...). En vez de duplicar coordenadas
-- por evento, se modela el recorrido una vez en `rutas` y cada acto de
-- Desfiles lo referencia opcionalmente por `ruta_id`.
--
-- El trazado de `path` de este seed es una APROXIMACIÓN en línea recta
-- entre puntos ya conocidos de la app (ver src/data/events.ts
-- locCoords) — pendiente de sustituir por coordenadas GPS reales de
-- cada calle cuando se tengan.
-- ═══════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- TABLA: rutas
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.rutas (
  id         text        PRIMARY KEY,
  name       text        NOT NULL,
  path       jsonb       NOT NULL, -- array ordenado de [lat, lng]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.rutas IS 'Recorridos de desfile (calle o conjunto de calles), reutilizables entre varios actos.';

ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública: rutas"
  ON public.rutas FOR SELECT USING (true);

CREATE POLICY "Rutas: escritura solo admins"
  ON public.rutas FOR ALL
  USING       (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK  (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE TRIGGER trg_rutas_updated_at
  BEFORE UPDATE ON public.rutas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ════════════════════════════════════════════════════════════════════
-- eventos.ruta_id — solo relevante para actos de tipo Desfiles
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS ruta_id text REFERENCES public.rutas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_eventos_ruta ON public.eventos(ruta_id);


-- ════════════════════════════════════════════════════════════════════
-- SEED: recorridos conocidos (aproximación, ver nota de cabecera)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.rutas (id, name, path) VALUES
  ('ruta-av-constitucion', 'Av. Constitución',
   '[[38.6300,-0.8700],[38.6315,-0.8690],[38.6330,-0.8680]]'::jsonb),
  ('ruta-calle-nueva', 'Calle Nueva',
   '[[38.6328,-0.8680],[38.6335,-0.8672],[38.6340,-0.8665]]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  path = EXCLUDED.path;


-- ════════════════════════════════════════════════════════════════════
-- Enlazar los actos reales de Desfiles (migración 010) con su recorrido
-- ════════════════════════════════════════════════════════════════════

UPDATE public.eventos SET ruta_id = 'ruta-av-constitucion'
  WHERE id IN ('a2026-24', 'a2026-30', 'a2026-48');

UPDATE public.eventos SET ruta_id = 'ruta-calle-nueva'
  WHERE id IN ('a2026-14', 'a2026-33');
