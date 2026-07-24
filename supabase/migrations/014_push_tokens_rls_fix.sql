-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 014: Cierra el RLS demasiado permisivo de
-- push_tokens (UPDATE/DELETE usaban USING (true), sin comprobar
-- propietario).
--
-- Antes: cualquier cliente (autenticado o anónimo) podía actualizar o
-- borrar el token push de CUALQUIER dispositivo, incluido el de otro
-- usuario logueado — permite sabotear/desuscribir avisos ajenos.
--
-- Ahora: solo se puede tocar un registro cuyo user_id sea NULL
-- (dispositivo anónimo, sin sesión) o coincida con el usuario
-- autenticado (auth.uid() = user_id). Un usuario ya no puede tocar el
-- token de otro usuario logueado.
--
-- Limitación conocida y aceptada: los dispositivos SIN sesión
-- (user_id IS NULL) no tienen forma de demostrar "soy el mismo
-- dispositivo" ante Postgres, así que siguen siendo mutuamente
-- accesibles entre sí. Es una limitación inherente al modelo actual
-- (avisos públicos sin exigir login), no algo que esta migración deje
-- sin resolver por descuido.
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Push tokens: refrescar propio dispositivo" ON public.push_tokens;
CREATE POLICY "Push tokens: refrescar propio dispositivo"
  ON public.push_tokens FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Push tokens: borrar propio dispositivo" ON public.push_tokens;
CREATE POLICY "Push tokens: borrar propio dispositivo"
  ON public.push_tokens FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);
