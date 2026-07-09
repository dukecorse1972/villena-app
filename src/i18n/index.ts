import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { STORAGE_KEYS } from '../constants';
import es from './locales/es';
import en from './locales/en';
import va from './locales/va';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      va: { translation: va },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'va'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
