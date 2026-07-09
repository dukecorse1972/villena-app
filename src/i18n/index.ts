import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { STORAGE_KEYS } from '../constants';
import es from './locales/es';
import en from './locales/en';
import va from './locales/va';
import fr from './locales/fr';
import de from './locales/de';
import zh from './locales/zh';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      va: { translation: va },
      fr: { translation: fr },
      de: { translation: de },
      zh: { translation: zh },
    },
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
  });

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
