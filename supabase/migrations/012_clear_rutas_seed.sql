-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 012: retirar las rutas de ejemplo mal trazadas
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
--
-- Las 2 rutas sembradas en la migración 011 (ruta-av-constitucion,
-- ruta-calle-nueva) eran una aproximación en línea recta explícitamente
-- provisional y no representan bien el recorrido real. Se retiran para
-- volver a crearlas desde el nuevo editor visual del admin (pestaña
-- Rutas), en vez de seguir corrigiéndolas a mano por SQL.
-- ═══════════════════════════════════════════════════════════════════

UPDATE public.eventos SET ruta_id = NULL
  WHERE ruta_id IN ('ruta-av-constitucion', 'ruta-calle-nueva');

DELETE FROM public.rutas
  WHERE id IN ('ruta-av-constitucion', 'ruta-calle-nueva');
