export interface SupportedLanguage {
  code: string;
  name: string;
  img: string;
  imgW: string;
}

// Fase 1: ES/EN/VA. Francés, alemán y chino se añadirán en una tanda
// posterior: crear locales/xx.ts, registrarlo en i18n/index.ts y añadir
// aquí su entrada — sin tocar el resto de la arquitectura.
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'es', name: 'Español', img: 'https://flagcdn.com/es.svg', imgW: 'auto' },
  {
    code: 'va',
    name: 'Valencià',
    img: 'https://openmoji.org/data/color/svg/1F3F4-E0065-E0073-E0076-E0063-E007F.svg',
    imgW: '26px',
  },
  { code: 'en', name: 'English', img: 'https://flagcdn.com/gb.svg', imgW: 'auto' },
];
