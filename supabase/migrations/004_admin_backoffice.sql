-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 004: cimientos del backoffice (admins + cargos)
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
-- ═══════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- TABLA: admins
-- ════════════════════════════════════════════════════════════════════
-- Usuarios con permiso de administración (backoffice JCF).
-- El alta es SIEMPRE manual (Supabase Studio), nunca desde el cliente:
-- no hay política de INSERT/UPDATE/DELETE para authenticated/anon.

CREATE TABLE IF NOT EXISTS public.admins (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.admins IS 'Usuarios con permiso de administración (backoffice JCF). Alta manual únicamente.';

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Un usuario solo puede comprobar SI ÉL MISMO es admin (para gatear la UI) —
-- no puede ver la lista completa de administradores.
CREATE POLICY "Admins: comprobar el propio estado"
  ON public.admins FOR SELECT
  USING (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════════
-- TABLA: cargos (Capitán, Sargento... por comparsa y año)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.cargos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  comparsa_id text        NOT NULL REFERENCES public.comparsas(id) ON DELETE CASCADE,
  role        text        NOT NULL,   -- 'Capitán', 'Sargento', 'Abanderado'...
  person_name text        NOT NULL,
  photo_url   text,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.cargos IS 'Cargos festeros del año por comparsa (Capitán, Sargento...).';

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública: cargos"
  ON public.cargos FOR SELECT USING (true);

CREATE POLICY "Cargos: escritura solo admins"
  ON public.cargos FOR ALL
  USING       (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK  (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_cargos_comparsa ON public.cargos(comparsa_id);

CREATE TRIGGER trg_cargos_updated_at
  BEFORE UPDATE ON public.cargos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ════════════════════════════════════════════════════════════════════
-- PERMISOS DE ESCRITURA PARA ADMINS EN LAS TABLAS DE CONTENIDO
-- ════════════════════════════════════════════════════════════════════
-- Hasta ahora, INSERT/UPDATE/DELETE en eventos/avisos/comparsas estaba
-- bloqueado para todo el mundo excepto service_role (sin política =
-- denegado con RLS activada). Estas políticas abren la escritura SOLO
-- a usuarios que estén en la tabla admins; la lectura pública existente
-- no se toca.

CREATE POLICY "Eventos: escritura solo admins"
  ON public.eventos FOR ALL
  USING       (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK  (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Avisos: escritura solo admins"
  ON public.avisos FOR ALL
  USING       (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK  (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Comparsas: escritura solo admins"
  ON public.comparsas FOR ALL
  USING       (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK  (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));


-- ════════════════════════════════════════════════════════════════════
-- ALTA DEL PRIMER ADMINISTRADOR (editar antes de ejecutar)
-- ════════════════════════════════════════════════════════════════════
-- 1) Inicia sesión al menos una vez en la app con la cuenta que quieres
--    convertir en admin (Google o email/contraseña), para que exista
--    en auth.users.
-- 2) Sustituye 'tu-email@ejemplo.com' por ese email y ejecuta:
--
-- INSERT INTO public.admins (user_id)
-- SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com'
-- ON CONFLICT (user_id) DO NOTHING;
