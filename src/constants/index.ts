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
  FAVORITES: 'villena_favorites',
  LANGUAGE:  'villena_language',
} as const;

// ── Auth ──────────────────────────────────────────────────────────────────────
// Debe coincidir con el scheme registrado en AndroidManifest.xml (intent-filter)
// e Info.plist (CFBundleURLTypes), y con la Redirect URL permitida en Supabase.
export const NATIVE_AUTH_REDIRECT = 'es.villena.fiestas://auth-callback';

// ── Configuración general del festival ───────────────────────────────────────
export const FESTIVAL = {
  CITY:        'Villena',
  YEAR:        2026,
  MONTH:       'Septiembre',
  MONTH_INDEX: 9, // 1-12, para construir fechas ISO (YYYY-MM-DD)
  START_DAY:   4,
  END_DAY:     9,
} as const;
