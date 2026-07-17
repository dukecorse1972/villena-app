// ── Rutas de la aplicación ────────────────────────────────────────────────────
export const ROUTES = {
  INICIO:    '/',
  AGENDA:    '/agenda',
  COMPARSAS: '/comparsas',
  MUSICA:    '/musica',
  INFO:      '/info',
  ADMIN:     '/admin',
} as const;

// ── Claves de localStorage ────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  FAVORITES:       'villena_favorites',
  LANGUAGE:        'villena_language',
  // Última copia conocida de contenido de Inicio que depende de red (noticias,
  // próximos eventos) — se muestra al instante al abrir la app mientras se
  // refresca en segundo plano, en vez de dejar la sección vacía unos segundos.
  NEWS_CACHE:      'villena_news_cache',
  FEATURED_EVENTS_CACHE: 'villena_featured_events_cache',
  // Última copia conocida de cada fuente de datos, para que Agenda,
  // Comparsas, Avisos, Rutas y POIs sobrevivan a cerrar la app sin red,
  // igual que ya hacían NEWS_CACHE/FEATURED_EVENTS_CACHE en Inicio.
  ALL_EVENTOS_CACHE:    'villena_all_eventos_cache',
  AVISOS_CACHE:         'villena_avisos_cache',
  RUTAS_CACHE:          'villena_rutas_cache',
  POIS_CACHE:           'villena_pois_cache',
  COMPARSAS_CACHE_CRISTIANAS: 'villena_comparsas_cristianas_cache',
  COMPARSAS_CACHE_MORAS:      'villena_comparsas_moras_cache',
} as const;

// ── Configuración general del festival ───────────────────────────────────────
export const FESTIVAL = {
  CITY:        'Villena',
  YEAR:        2026,
  MONTH:       'Septiembre',
  MONTH_INDEX: 9, // 1-12, para construir fechas ISO (YYYY-MM-DD)
  START_DAY:   4,
  END_DAY:     9,
} as const;
