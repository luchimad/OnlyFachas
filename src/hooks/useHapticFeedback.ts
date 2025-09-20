import { useCallback } from 'react';

/**
 * Hook para manejar haptic feedback en dispositivos móviles
 * Proporciona diferentes tipos de vibración según la acción
 */
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    // Verificar si el navegador soporta vibración
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Haptic feedback not supported:', error);
      }
    }
  }, []);

  const light = useCallback(() => {
    vibrate(30);
  }, [vibrate]);

  const medium = useCallback(() => {
    vibrate(50);
  }, [vibrate]);

  const heavy = useCallback(() => {
    vibrate(100);
  }, [vibrate]);

  const success = useCallback(() => {
    vibrate([50, 30, 50]);
  }, [vibrate]);

  const error = useCallback(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  const warning = useCallback(() => {
    vibrate([200, 100, 200]);
  }, [vibrate]);

  const celebration = useCallback(() => {
    vibrate([50, 30, 50, 30, 100]);
  }, [vibrate]);

  const buttonPress = useCallback(() => {
    vibrate(20);
  }, [vibrate]);

  const swipe = useCallback(() => {
    vibrate([30, 20, 30]);
  }, [vibrate]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    celebration,
    buttonPress,
    swipe
  };
};
