-- Convierte eventos.type y comparsas.bando de `text` + CHECK a ENUM nativo
-- de Postgres. El conjunto de valores permitido no cambia (era exactamente
-- el mismo que ya imponía el CHECK); lo único que cambia es que ahora el
-- generador de tipos de Supabase produce una unión literal en vez de
-- `string` genérico, así que src/services/eventsService.ts ya no necesita
-- castear `row.type as EventType` a mano.

CREATE TYPE public.evento_type AS ENUM ('Desfiles', 'Religiosos', 'Música', 'Cultural');
CREATE TYPE public.comparsa_bando AS ENUM ('Cristiano', 'Moro');

ALTER TABLE public.eventos DROP CONSTRAINT eventos_type_check;
ALTER TABLE public.eventos
  ALTER COLUMN type TYPE public.evento_type USING type::public.evento_type;

ALTER TABLE public.comparsas DROP CONSTRAINT comparsas_bando_check;
ALTER TABLE public.comparsas
  ALTER COLUMN bando TYPE public.comparsa_bando USING bando::public.comparsa_bando;
