-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 003: eventos.day + eventos.year → eventos.date
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
--
-- Sustituye los campos sueltos `day` (1-30) + `year` por una única
-- columna `date` (fecha ISO real). Con una fecha real por fila, dos
-- ediciones del festival nunca pueden mezclarse en la misma consulta
-- (antes había que acordarse de filtrar también por `year`).
--
-- Esta migración asume que todos los eventos existentes son de
-- septiembre (mes 9) — cierto para todo el historial de esta tabla
-- hasta ahora. A partir de aquí, las fechas nuevas ya no asumen mes.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Añadir la columna nueva (nullable de momento, para poder rellenarla)
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS date date;

-- 2) Rellenar `date` a partir de los datos existentes (day + year, mes = 9)
UPDATE public.eventos
SET date = make_date(year, 9, day)
WHERE date IS NULL;

-- 3) Ahora que todas las filas tienen fecha, hacerla obligatoria
ALTER TABLE public.eventos ALTER COLUMN date SET NOT NULL;

-- 4) Sustituir el índice antiguo de day+year por uno sobre date
DROP INDEX IF EXISTS idx_eventos_day_year;
CREATE INDEX IF NOT EXISTS idx_eventos_date ON public.eventos(date);

-- 5) Corte limpio: eliminar las columnas antiguas (y su CHECK asociado)
ALTER TABLE public.eventos DROP COLUMN IF EXISTS day;
ALTER TABLE public.eventos DROP COLUMN IF EXISTS year;
