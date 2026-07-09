import type { KeyboardEvent } from 'react';

/**
 * Activa `onActivate` con Enter o Espacio — replica el comportamiento nativo
 * de un `<button>` en elementos con `role="button"` (divs clicables que no
 * pueden convertirse a `<button>` sin cambiar su estilo por defecto).
 */
export function onActivateKey(onActivate: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };
}
