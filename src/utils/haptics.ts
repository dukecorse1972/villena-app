import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Utilidades hápticas seguras para plataformas nativas (iOS/Android)
 * y tolerantes a entornos de navegador/escritorio.
 */

export const triggerSelectionHaptic = async (): Promise<void> => {
  try {
    await Haptics.selectionChanged();
  } catch {
    // Silencioso en navegadores sin soporte o si la háptica está desactivada
  }
};

export const triggerLightImpact = async (): Promise<void> => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Silencioso
  }
};

export const triggerMediumImpact = async (): Promise<void> => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Silencioso
  }
};

export const triggerSuccessHaptic = async (): Promise<void> => {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Silencioso
  }
};
