import { describe, it, expect, afterEach } from 'vitest';
import i18n from './index';
import { STORAGE_KEYS } from '../constants';

describe('i18n', () => {
  afterEach(async () => {
    await i18n.changeLanguage('es');
  });

  it('cambia el idioma activo y lo persiste en localStorage', async () => {
    await i18n.changeLanguage('en');

    expect(i18n.language).toBe('en');
    expect(window.localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe('en');
  });

  it('actualiza document.documentElement.lang al cambiar de idioma', async () => {
    await i18n.changeLanguage('va');

    expect(document.documentElement.lang).toBe('va');
  });

  it('traduce una clave existente en los seis idiomas soportados', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('tabBar.inicio')).toBe('Inicio');

    await i18n.changeLanguage('en');
    expect(i18n.t('tabBar.inicio')).toBe('Home');

    await i18n.changeLanguage('va');
    expect(i18n.t('tabBar.inicio')).toBe('Inici');

    await i18n.changeLanguage('fr');
    expect(i18n.t('tabBar.inicio')).toBe('Accueil');

    await i18n.changeLanguage('de');
    expect(i18n.t('tabBar.inicio')).toBe('Start');

    await i18n.changeLanguage('zh');
    expect(i18n.t('tabBar.inicio')).toBe('首页');
  });
});
