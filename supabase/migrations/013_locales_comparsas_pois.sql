-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 014: locales sociales de las comparsas (POIs)
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
--
-- El acto "Cena de confraternidad festera" ocurre en "Locales de las
-- comparsas" — no es un punto único, es uno por comparsa. En vez de
-- forzar una ubicación falsa, se añade un POI real por cada local
-- (categoría 'Local de comparsa'); EventModal los muestra todos juntos
-- para ese acto en concreto.
--
-- Direcciones reales tomadas de las fichas oficiales de cada comparsa en
-- juntacentral.com (agosto 2026); coordenadas resueltas con Nominatim/OSM.
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.pois (id, name, description, lat, lng, category, icon) VALUES
  ('poi-local-estudiantes',       'Estudiantes',       'Local social — Plaza Las Malvas, 5 (La Troyica)',        38.6334, -0.8669, 'Local de comparsa', 'home'),
  ('poi-local-marinos',           'Marinos Corsarios',  'Local social — La Tercia, 1',                            38.6303, -0.8603, 'Local de comparsa', 'home'),
  ('poi-local-andaluces',         'Andaluces',          'Local social — Maestro Moltó, 14',                       38.6325, -0.8622, 'Local de comparsa', 'home'),
  ('poi-local-maseros',           'Maseros',            'Local social — Plaza de Santa María, 14',                38.6304, -0.8615, 'Local de comparsa', 'home'),
  ('poi-local-ballesteros',       'Ballesteros',        'Local social — Maestro Moltó, 11',                       38.6330, -0.8608, 'Local de comparsa', 'home'),
  ('poi-local-almogavares',       'Almogávares',        'Local social — San Cristóbal, 33',                       38.6348, -0.8674, 'Local de comparsa', 'home'),
  ('poi-local-cristianos',        'Cristianos',         'Local social — Plaza Mayor, 12',                         38.6302, -0.8623, 'Local de comparsa', 'home'),
  ('poi-local-moros-viejos',      'Moros Viejos',       'Local social — C/ Parrales, 10',                         38.6347, -0.8663, 'Local de comparsa', 'home'),
  ('poi-local-moros-nuevos',      'Moros Nuevos',       'Local social — C/ Teniente Hernández Menor, 16 (La Jaima)', 38.6307, -0.8624, 'Local de comparsa', 'home'),
  ('poi-local-marruecos',         'Marruecos',          'Local social — C/ Ferriz, 8',                            38.6291, -0.8645, 'Local de comparsa', 'home'),
  ('poi-local-realistas',         'Realistas',          'Local social — C/ San Benito, 1',                        38.6294, -0.8624, 'Local de comparsa', 'home'),
  ('poi-local-nazaries',          'Nazaríes',           'Local social — C/ La Tercia, 7',                         38.6305, -0.8601, 'Local de comparsa', 'home'),
  ('poi-local-bereberes',         'Bereberes',          'Local social — C/ Congregación, 3',                      38.6332, -0.8672, 'Local de comparsa', 'home'),
  ('poi-local-piratas',           'Piratas',            'Local social — C/ Ferriz, 6 (La Guarida)',               38.6293, -0.8643, 'Local de comparsa', 'home')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  lat         = EXCLUDED.lat,
  lng         = EXCLUDED.lng,
  category    = EXCLUDED.category,
  icon        = EXCLUDED.icon;
