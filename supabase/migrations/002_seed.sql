-- ═══════════════════════════════════════════════════════════════════
-- VILLENA APP — Migration 002: Datos iniciales (seed)
-- Cómo ejecutar:
--   Supabase Studio → SQL Editor → New query → pegar y ejecutar
--   Es idempotente: se puede ejecutar varias veces sin errores.
-- ═══════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- EVENTOS (30 actos del programa oficial)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.eventos (id, title, time, location, type, day, year, img_url, description) VALUES

-- Día 4
('e1',  'Diana General',
 '08:00', 'Plaza de Santiago', 'Desfiles', 4, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Las comparsas desfilan por las principales calles de Villena al son de las bandas de música, mostrando sus espectaculares trajes festeros. El cortejo parte desde el norte de la Avenida de la Constitución y recorre el centro histórico hasta la Plaza Mayor, con paradas y saludos ante las autoridades.'),

('e2',  'Alarde de Infantería',
 '12:00', 'Av. Constitución', 'Desfiles', 4, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Las comparsas desfilan por las principales calles de Villena al son de las bandas de música, mostrando sus espectaculares trajes festeros. El cortejo parte desde el norte de la Avenida de la Constitución y recorre el centro histórico hasta la Plaza Mayor.'),

('e3',  'Misa de Campaña',
 '20:00', 'Iglesia de Santiago', 'Religiosos', 4, 2025,
 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
 'Acto de devoción y fe en el que los festeros acompañan a la Virgen de las Virtudes, patrona de Villena, en un emotivo recorrido por la ciudad histórica. Las comparsas participan con total recogimiento, fusionando la celebración popular con la tradición religiosa.'),

-- Día 5
('e4',  'Entrada Cristiana',
 '23:00', 'Av. Constitución', 'Desfiles', 5, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Las comparsas del bando cristiano hacen su entrada oficial en la ciudad en uno de los actos más multitudinarios de las fiestas. Miles de festeros y espectadores congregados a lo largo del trayecto viven la noche con una emoción sin igual.'),

('e5',  'Contrabando',
 '11:00', 'Casco Antiguo', 'Desfiles', 6, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Las comparsas desfilan por las principales calles de Villena al son de las bandas de música, mostrando sus espectaculares trajes festeros en el corazón histórico de la ciudad.'),

('e11', 'Diana General',
 '09:00', 'Plaza de Santiago', 'Música', 5, 2025,
 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=800&fit=crop&auto=format&q=90',
 'Las bandas festeras de las distintas comparsas interpretan las marchas más emblemáticas recorriendo el casco antiguo al amanecer, despertando a los villeneros con el sonido inconfundible de los tambores y las trompetas.'),

('e12', 'Alarde de Infantería',
 '11:30', 'Paseo Chapí', 'Desfiles', 5, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Las comparsas exhiben su formación y desfilan por el bulevar festero por excelencia de Villena, el Paseo Chapí.'),

('e13', 'Entrada Cristiana',
 '17:00', 'Av. Constitución', 'Desfiles', 5, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Las comparsas del bando cristiano desfilan por la avenida principal mostrando sus espectaculares trajes y bandas de música en un acto festero de primer nivel.'),

('e14', 'Entrada Mora',
 '23:00', 'Av. Constitución', 'Desfiles', 5, 2025,
 'https://images.unsplash.com/photo-1677055380601-393348dc342c?w=800&fit=crop&auto=format&q=90',
 'Las comparsas del bando moro hacen su entrada oficial en la ciudad en uno de los actos más espectaculares de las fiestas. Los trajes orientales y la música crean una atmósfera única e irrepetible.'),

-- Día 6
('e6',  'Procesión del Estandarte',
 '17:00', 'Casco Histórico', 'Religiosos', 6, 2025,
 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
 'La Virgen de las Virtudes es acompañada en procesión por el casco histórico de Villena. Las comparsas participan con total recogimiento en este acto de devoción y fe que da sentido espiritual a las fiestas.'),

('e15', 'Misa de Campaña',
 '10:00', 'Basílica Virgen', 'Religiosos', 6, 2025,
 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
 'Celebración eucarística solemne en la Basílica de la Virgen de las Virtudes con la participación de todas las comparsas y autoridades municipales.'),

('e16', 'Concierto Diana Festera',
 '12:30', 'Plaza Mayor', 'Música', 6, 2025,
 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=800&fit=crop&auto=format&q=90',
 'Las bandas festeras interpretan las marchas más emblemáticas de las fiestas en la Plaza Mayor en un ambiente de celebración colectiva y alegría que congrega a cientos de villeneros.'),

('e17', 'Embajada Mora al Castillo',
 '18:00', 'Castillo Atalaya', 'Cultural', 6, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'Actividad cultural que pone en valor la historia y las tradiciones de las Fiestas de Moros y Cristianos de Villena. Una oportunidad única para conocer el rico patrimonio festero de la ciudad en el escenario histórico del Castillo de la Atalaya.'),

('e18', 'Retreta de Comparsas',
 '22:00', 'Paseo Chapí', 'Música', 6, 2025,
 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=800&fit=crop&auto=format&q=90',
 'Las comparsas recorren el Paseo Chapí en una noche festiva, con sus bandas de música interpretando las marchas más populares mientras los festeros y espectadores disfrutan del ambiente único.'),

-- Día 7
('e7',  'Entrada Mora',
 '23:00', 'Av. Constitución', 'Desfiles', 7, 2025,
 'https://images.unsplash.com/photo-1677055380601-393348dc342c?w=800&fit=crop&auto=format&q=90',
 'Las comparsas del bando moro hacen su gran entrada oficial en la ciudad. Los trajes orientales, las bandas de música y la espectacular puesta en escena crean una atmósfera única que concentra a miles de personas.'),

('e19', 'Procesión del Santísimo',
 '09:30', 'Basílica Virgen', 'Religiosos', 7, 2025,
 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
 'Solemne procesión en la que el Santísimo Sacramento recorre las calles de Villena acompañado por las comparsas y miles de fieles en un acto de profunda devoción.'),

('e20', 'Alardo de Pólvora',
 '11:00', 'Plaza de Santiago', 'Desfiles', 7, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Espectacular acto en el que las comparsas hacen sonar sus arcabuces y armas de pólvora en la Plaza de Santiago, llenando la ciudad de humo y el olor característico de la fiesta.'),

('e21', 'Guerrilla Festera',
 '16:00', 'Casco Antiguo', 'Cultural', 7, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'Recreación histórica del enfrentamiento entre los bandos moro y cristiano en las calles del casco antiguo de Villena, con espectaculares coreografías y el característico estallido de la pólvora.'),

('e22', 'Concierto Bandas Festeras',
 '20:30', 'Plaza Mayor', 'Música', 7, 2025,
 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=800&fit=crop&auto=format&q=90',
 'Las mejores bandas festeras de las comparsas ofrecen un concierto en la Plaza Mayor interpretando las marchas más queridas y populares de las Fiestas de Villena.'),

-- Día 8
('e8',  'Concierto de Bandas',
 '10:00', 'Plaza Mayor', 'Música', 8, 2025,
 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=800&fit=crop&auto=format&q=90',
 'Las bandas festeras de todas las comparsas interpretan en la Plaza Mayor las marchas más emblemáticas de las fiestas en un ambiente de celebración colectiva.'),

('e9',  'Festival Cultural Festero',
 '19:00', 'Centro Cultural', 'Cultural', 8, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'Actividad cultural que pone en valor la historia y tradiciones de las Fiestas de Moros y Cristianos de Villena, declaradas Fiesta de Interés Turístico Internacional.'),

('e23', 'Misa Solemne al Santísimo',
 '10:00', 'Basílica Virgen', 'Religiosos', 8, 2025,
 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
 'Misa solemne celebrada en la Basílica de la Virgen de las Virtudes con la participación de las autoridades, comparsas y todos los festeros villenaenses.'),

('e24', 'Parlamento Festero',
 '13:00', 'Ayuntamiento', 'Cultural', 8, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'Los representantes de ambos bandos protagonizan el Parlamento Festero ante las autoridades en el Ayuntamiento de Villena, en un emotivo acto lleno de simbolismo y tradición.'),

('e25', 'Embajada Cristiana al Castillo',
 '17:30', 'Castillo Atalaya', 'Cultural', 8, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'La embajada cristiana sube al Castillo de la Atalaya en un acto cargado de simbolismo histórico. El diálogo festero entre los bandos culmina con la recreación de la conquista del castillo.'),

('e26', 'Desfile de Antorchas',
 '21:00', 'Av. Constitución', 'Desfiles', 8, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'Uno de los actos más emotivos y espectaculares de las fiestas. Las comparsas desfilan a la luz de las antorchas por la Avenida de la Constitución en una noche de ensueño.'),

-- Día 9
('e10', 'Desfile de Gala',
 '16:00', 'Av. Constitución', 'Desfiles', 9, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'El gran desfile de clausura de las Fiestas de Villena. Las comparsas exhiben sus mejores galas en un espectáculo visual de primer orden que pone el broche final a seis días de celebración.'),

('e27', 'Procesión de la Virgen',
 '10:00', 'Basílica Virgen', 'Religiosos', 9, 2025,
 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
 'La Virgen de las Virtudes es acompañada en procesión por las calles de Villena en el acto de clausura religiosa de las fiestas, con la participación emocionada de todos los festeros.'),

('e28', 'Guerrilla de Pólvora Final',
 '12:00', 'Plaza Mayor', 'Desfiles', 9, 2025,
 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
 'La última guerrilla de pólvora de las fiestas llena la Plaza Mayor de humo y emoción. Las comparsas se despiden de su público con un último y épico enfrentamiento festero.'),

('e29', 'Recreación Histórica Conquista',
 '18:00', 'Castillo Atalaya', 'Cultural', 9, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'La recreación histórica de la conquista del Castillo de la Atalaya por Alfonso X el Sabio cierra el ciclo festero con un espectáculo que combina historia, tradición y espectáculo.'),

('e30', 'Traca Final y Fuegos Artificiales',
 '22:30', 'Paseo Chapí', 'Cultural', 9, 2025,
 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
 'El cierre más esperado de las Fiestas de Villena. La traca final y los fuegos artificiales iluminan el cielo de Villena poniendo un espectacular punto final a otro año de celebración.')

ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- COMPARSAS (7 Cristianas + 7 Moras)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.comparsas (id, name, bando, color, img_url) VALUES
  ('c1', 'Estudiantes',       'Cristiano', '#1a1a1a', '/logos/estudiantes.png'),
  ('c2', 'Marinos Corsarios', 'Cristiano', '#5a0a0a', '/logos/marinos-corsarios.png'),
  ('c3', 'Andaluces',         'Cristiano', '#3a2210', '/logos/andaluces.png'),
  ('c4', 'Maseros',           'Cristiano', '#3a2a10', '/logos/maseros.png'),
  ('c5', 'Ballesteros',       'Cristiano', '#2a3a10', '/logos/ballesteros.png'),
  ('c6', 'Almogávares',       'Cristiano', '#1a3a2e', '/logos/almogavares.png'),
  ('c7', 'Cristianos',        'Cristiano', '#1a1a3a', '/logos/cristianos.png'),
  ('m1', 'Moros Viejos',      'Moro',      '#1a1a1a', '/logos/moros-viejos-v2.png'),
  ('m2', 'Moros Nuevos',      'Moro',      '#5a0a0a', '/logos/moros-nuevos-v2.png'),
  ('m3', 'Marruecos',         'Moro',      '#1a1a1a', '/logos/marruecos-v2.png'),
  ('m4', 'Realistas',         'Moro',      '#3a2210', '/logos/realistas-v2.png'),
  ('m5', 'Nazaríes',          'Moro',      '#5a0a0a', '/logos/nazaries-v2.png'),
  ('m6', 'Bereberes',         'Moro',      '#2a1800', '/logos/bereberes-v2.png'),
  ('m7', 'Piratas',           'Moro',      '#1a0808', '/logos/piratas-v2.png')
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- PUNTOS DE INTERÉS (9 POIs de Villena)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.pois (id, name, description, lat, lng, category, icon) VALUES
  ('poi1', 'Plaza Mayor',
   'Centro neurálgico de las fiestas. Escenario de los conciertos de bandas y actos culturales.',
   38.6325, -0.8680, 'Cultural', 'map'),

  ('poi2', 'Plaza de Santiago',
   'Punto de inicio de las Dianas y concentración de comparsas. Rodeada de bares típicos festeros.',
   38.6330, -0.8685, 'Festero', 'flag'),

  ('poi3', 'Av. Constitución',
   'La avenida principal de los desfiles. Aquí pasan las entradas Cristiana y Mora.',
   38.6315, -0.8690, 'Desfiles', 'route'),

  ('poi4', 'Basílica de la Virgen',
   'Sede de las celebraciones religiosas. Alberga a la patrona de Villena, la Virgen de las Virtudes.',
   38.6320, -0.8675, 'Religioso', 'church'),

  ('poi5', 'Castillo de la Atalaya',
   'Castillo medieval que preside la ciudad. Escenario de las Embajadas y la Recreación Histórica.',
   38.6380, -0.8650, 'Monumento', 'castle'),

  ('poi6', 'Paseo Chapí',
   'Bulevar festero por excelencia. Sede de la Retreta de Comparsas y los fuegos artificiales finales.',
   38.6310, -0.8695, 'Festero', 'star'),

  ('poi7', 'Casco Antiguo',
   'El corazón histórico de Villena. Escenario del Contrabando y las Guerrillas Festeras.',
   38.6335, -0.8672, 'Histórico', 'home'),

  ('poi8', 'Centro Cultural',
   'Espacio para exposiciones, conferencias y el Festival Cultural Festero.',
   38.6318, -0.8678, 'Cultural', 'info'),

  ('poi9', 'Ayuntamiento de Villena',
   'Sede del Parlamento Festero y actos oficiales de las Fiestas de Moros y Cristianos.',
   38.6322, -0.8680, 'Oficial', 'building')

ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- AVISOS (5 avisos de ejemplo de la Junta)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.avisos (text, is_new, created_at) VALUES
  ('Mañana comienza la Diana General a las 08:00h en la Plaza de Santiago',
   true, now() - interval '2 hours'),

  ('Cambio de última hora: El Contrabando se adelanta a las 16:30h por previsión de lluvia',
   true, now() - interval '4 hours'),

  ('Nueva noticia: El Capitán Moro presenta su indumentaria en acto multitudinario',
   false, now() - interval '1 day'),

  ('Recuerda: la Entrada Cristiana parte desde Av. Constitución esquina con C/ Mayor',
   false, now() - interval '2 days'),

  ('El alcalde de Villena invita a todos los ciudadanos a participar activamente en los festejos',
   false, now() - interval '3 days');

-- Nota: los avisos no tienen ON CONFLICT porque su PK es uuid generado automáticamente.
-- Ejecutar el seed solo una vez para evitar duplicados en avisos.
