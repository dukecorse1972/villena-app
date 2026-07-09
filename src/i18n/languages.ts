export interface SupportedLanguage {
  code: string;
  name: string;
  img: string;
  imgW: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'es', name: 'Español', img: 'https://flagcdn.com/es.svg', imgW: 'auto' },
  {
    code: 'va',
    name: 'Valencià',
    img: 'https://openmoji.org/data/color/svg/1F3F4-E0065-E0073-E0076-E0063-E007F.svg',
    imgW: '26px',
  },
  { code: 'en', name: 'English', img: 'https://flagcdn.com/gb.svg', imgW: 'auto' },
  { code: 'fr', name: 'Français', img: 'https://flagcdn.com/fr.svg', imgW: 'auto' },
  { code: 'de', name: 'Deutsch', img: 'https://flagcdn.com/de.svg', imgW: 'auto' },
  { code: 'zh', name: '中文', img: 'https://flagcdn.com/cn.svg', imgW: 'auto' },
];
