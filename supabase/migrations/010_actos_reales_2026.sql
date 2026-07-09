-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 010: programa real de actos (edición 2026)
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
--   Es idempotente: se puede volver a ejecutar (ON CONFLICT actualiza
--   la fila en vez de duplicarla), útil si hay que corregir un dato.
--
-- Sustituye el programa de ejemplo (e1..e30, migración 002_seed.sql)
-- por el programa oficial real, facilitado por la Junta Central.
--
-- Las fechas originales venían fechadas en 2025 (última edición
-- celebrada); se trasladan a 2026 (mismo día y mes) para que aparezcan
-- en la Agenda de la próxima edición, que es para la que está
-- configurada la app (FESTIVAL.YEAR en src/constants/index.ts).
--
-- El esquema de `eventos.type` solo admite 4 valores (Desfiles,
-- Religiosos, Música, Cultural — ver migración 009_enum_types.sql).
-- El programa real trae ~16 categorías más específicas (Romería,
-- Embajada, Pasacalles, Ofrenda...); se han mapeado a la categoría más
-- cercana y se conserva la categoría original al principio de la
-- descripción para no perder ese matiz.
-- ═══════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- 1) RETIRAR el programa de ejemplo (e1..e30) — queda sustituido por
--    el programa real de más abajo.
-- ════════════════════════════════════════════════════════════════════

DELETE FROM public.eventos WHERE id IN (
  'e1','e2','e3','e4','e5','e6','e7','e8','e9','e10',
  'e11','e12','e13','e14','e15','e16','e17','e18','e19','e20',
  'e21','e22','e23','e24','e25','e26','e27','e28','e29','e30'
);


-- ════════════════════════════════════════════════════════════════════
-- 2) PROGRAMA REAL 2026 (48 actos)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.eventos (id, title, time, location, type, date, description) VALUES

-- ── Actos previos (agosto) ──
('a2026-01', 'Concierto de los Pasodobles', '22:30', 'Plaza de Santiago', 'Música', '2026-08-29',
 'Concierto. Banda Municipal de Música de Villena'),

('a2026-02', 'Homenaje a los festeros fallecidos', '09:45', 'Plaza de Santiago', 'Cultural', '2026-08-31',
 'Homenaje'),

('a2026-03', 'Pasacalles Anunciador', '10:00', 'Plaza de Santiago (salida)', 'Desfiles', '2026-08-31',
 'Pasacalles. Recorrido oficial'),

('a2026-04', 'Santa Misa', '11:00', 'Santuario Ntra. Sra. de las Virtudes', 'Religiosos', '2026-08-31',
 'Acto religioso. Con paseo de la imagen'),

('a2026-05', 'Santa Misa', '17:00', 'Santuario Ntra. Sra. de las Virtudes', 'Religiosos', '2026-08-31',
 'Acto religioso'),

('a2026-06', 'Romería de Ntra. Sra. María de las Virtudes', '18:00', 'Santuario (salida)', 'Religiosos', '2026-08-31',
 'Romería. Traslado de la Patrona hasta Villena'),

-- ── Día 4 (víspera) ──
('a2026-07', 'Concierto', '19:00', 'Teatro Chapí', 'Música', '2026-09-04',
 'Concierto. Banda Municipal de Música'),

('a2026-08', 'Cena de confraternidad festera', '22:00', 'Locales de las comparsas', 'Cultural', '2026-09-04',
 'Cena'),

-- ── Día 5 ──
('a2026-09', 'Gran Castillo de Fuegos Artificiales', '01:00', 'Castillo de la Atalaya', 'Cultural', '2026-09-05',
 'Fuegos artificiales. Inicio de verbenas al finalizar'),

('a2026-10', 'Rosario y Novena', '08:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-05',
 'Acto religioso. Actos de culto'),

('a2026-11', 'Santa Misa', '08:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-05',
 'Acto religioso. Con salvas y ruedo de banderas'),

('a2026-12', 'Pregón de Fiestas', '12:00', 'Ayuntamiento de Villena', 'Cultural', '2026-09-05',
 'Acto institucional. Incluye izado de bandera e Himno Nacional'),

('a2026-13', 'Fiesta del Pasodoble', '12:30', 'Plaza de Santiago (salida)', 'Desfiles', '2026-09-05',
 'Desfile. Recorrido oficial'),

('a2026-14', 'Gran Entrada', '16:00', 'Calle Nueva', 'Desfiles', '2026-09-05',
 'Desfile. Entrada de Moros y Cristianos'),

('a2026-15', 'Apertura de la Iglesia', '18:00', 'Iglesia de Santiago', 'Cultural', '2026-09-05',
 'Visita. Apertura para visitar a la Patrona'),

-- ── Día 6 ──
('a2026-16', 'Diana', '07:00', 'Plaza de Santiago', 'Desfiles', '2026-09-06',
 'Desfile'),

('a2026-17', 'Santa Misa', '08:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-06',
 'Acto religioso'),

('a2026-18', 'Santa Misa', '09:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-06',
 'Acto religioso'),

('a2026-19', 'Misa Solemne dedicada a la Juventud', '10:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-06',
 'Acto religioso'),

('a2026-20', 'Guerrilla y Embajada del Moro al Cristiano', '12:00', 'Castillo de la Atalaya', 'Cultural', '2026-09-06',
 'Embajada'),

('a2026-21', 'Contrabando', '18:00', 'Plaza María Auxiliadora (salida)', 'Cultural', '2026-09-06',
 'Representación'),

('a2026-22', 'Santo Rosario', '18:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-06',
 'Acto religioso. Primer día del Triduo'),

('a2026-23', 'Santa Misa', '19:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-06',
 'Acto religioso. Primer día del Triduo'),

('a2026-24', 'Gran Cabalgata', '21:00', 'Av. Constitución', 'Desfiles', '2026-09-06',
 'Cabalgata'),

-- ── Día 7 ──
('a2026-25', 'Diana', '07:00', 'Plaza de Santiago', 'Desfiles', '2026-09-07',
 'Desfile'),

('a2026-26', 'Santa Misa', '08:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-07',
 'Acto religioso'),

('a2026-27', 'Santa Misa', '09:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-07',
 'Acto religioso'),

('a2026-28', 'Misa Solemne dedicada a los Enfermos', '11:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-07',
 'Acto religioso'),

('a2026-29', 'Ofrenda a la Patrona', '12:00', 'Av. Constitución (salida)', 'Religiosos', '2026-09-07',
 'Ofrenda. Presentación de infantes'),

('a2026-30', 'Desfile de la Esperanza', '19:00', 'Av. Constitución', 'Desfiles', '2026-09-07',
 'Desfile. Participación infantil'),

('a2026-31', 'Santo Rosario', '19:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-07',
 'Acto religioso. Segundo día del Triduo'),

('a2026-32', 'Santa Misa', '20:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-07',
 'Acto religioso. Segundo día del Triduo'),

('a2026-33', 'Retreta', '23:00', 'Calle Nueva', 'Desfiles', '2026-09-07',
 'Desfile'),

-- ── Día 8 ──
('a2026-34', 'Concierto en Honor a Ntra. Sra. María de las Virtudes', '00:00', 'Iglesia de Santiago', 'Música', '2026-09-08',
 'Concierto. Coral Ambrosio Cotes'),

('a2026-35', 'Alborada en Honor a Ntra. Sra. María de las Virtudes', '01:00', 'Plaza de Santiago', 'Música', '2026-09-08',
 'Acto musical'),

('a2026-36', 'Gran Castillo de Fuegos Artificiales', '01:30', 'Castillo de la Atalaya', 'Cultural', '2026-09-08',
 'Fuegos artificiales'),

('a2026-37', 'Diana', '07:00', 'Plaza de Santiago', 'Desfiles', '2026-09-08',
 'Desfile'),

('a2026-38', 'Santa Misa', '08:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-08',
 'Acto religioso'),

('a2026-39', 'Santa Misa', '09:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-08',
 'Acto religioso'),

('a2026-40', 'Misa Solemne en Honor a la Patrona', '10:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-08',
 'Acto religioso. Tercer día del Triduo'),

('a2026-41', 'Guerrilla y Embajada del Cristiano al Moro', '12:15', 'Castillo de la Atalaya', 'Cultural', '2026-09-08',
 'Embajada'),

('a2026-42', 'Conversión del Moro al Cristianismo', '18:00', 'Iglesia de Santiago', 'Cultural', '2026-09-08',
 'Representación'),

('a2026-43', 'Solemne Procesión', '18:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-08',
 'Procesión. A continuación de la Conversión'),

-- ── Día 9 (clausura) ──
('a2026-44', 'Romería de Despedida', '07:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-09',
 'Romería. Salida de la Patrona'),

('a2026-45', 'Santa Misa', '08:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-09',
 'Acto religioso'),

('a2026-46', 'Santa Misa', '08:30', 'Iglesia de Santiago', 'Religiosos', '2026-09-09',
 'Acto religioso'),

('a2026-47', 'Romería hacia el Santuario', '09:00', 'Iglesia de Santiago', 'Religiosos', '2026-09-09',
 'Romería. Despedida de la Patrona'),

('a2026-48', 'Entrada de Nuevos Capitanes, Alféreces y Madrinas', '17:00', 'Av. Constitución', 'Desfiles', '2026-09-09',
 'Desfile. Proclamación de nuevos cargos')

ON CONFLICT (id) DO UPDATE SET
  title       = EXCLUDED.title,
  time        = EXCLUDED.time,
  location    = EXCLUDED.location,
  type        = EXCLUDED.type,
  date        = EXCLUDED.date,
  description = EXCLUDED.description;
