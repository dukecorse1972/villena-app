import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { STORAGE_KEYS } from '../constants';
import es from './locales/es';

// Solo 'es' viaja en el bundle inicial (es el fallbackLng y el idioma de la
// mayoría de usuarios). El resto se descarga bajo demanda — al detectar el
// idioma del navegador o al cambiarlo manualmente desde el selector de Info —
// para no obligar a todo el mundo a bajar los 6 idiomas de golpe.
const localeLoaders: Record<string, () => Promise<{ default: object }>> = {
  en: () => import('./locales/en'),
  va: () => import('./locales/va'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
  zh: () => import('./locales/zh'),
};

async function loadLanguage(lng: string): Promise<void> {
  if (lng === 'es' || i18n.hasResourceBundle(lng, 'translation')) return;
  const loader = localeLoaders[lng];
  if (!loader) return;
  const mod = await loader();
  i18n.addResourceBundle(lng, 'translation', mod.default);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
    },
    partialBundledLanguages: true,
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'va', 'fr', 'de', 'zh'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => loadLanguage(i18n.language));

// i18next resuelve `changeLanguage` en cuanto reasigna el idioma activo, sin
// esperar a que su bundle (si es perezoso) esté cargado. Envolvemos el método
// para que quien haga `await i18n.changeLanguage(lng)` tenga garantizado que
// las traducciones de `lng` ya están disponibles al continuar.
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = ((lng?: string, callback?: Parameters<typeof originalChangeLanguage>[1]) => {
  const run = async () => {
    if (lng) await loadLanguage(lng);
    return originalChangeLanguage(lng, callback);
  };
  return run();
}) as typeof i18n.changeLanguage;

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  loadLanguage(lng);
});

export default i18n;
