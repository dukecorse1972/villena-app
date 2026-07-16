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
