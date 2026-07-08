import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Punto único para abrir URLs externas (streaming en directo, Google Maps...).
 * En la app nativa usa el navegador in-app de Capacitor, para no navegar el
 * WebView principal fuera de la app; en web abre una pestaña nueva normal.
 */
export function openExternalLink(url: string): void {
  if (Capacitor.isNativePlatform()) {
    void Browser.open({ url });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
