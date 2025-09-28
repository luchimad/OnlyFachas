import { useState, useEffect, useCallback } from 'react';

// Funciones para trackear dev mode (se inyectan desde el componente)
let trackDevModeAccess: (() => void) | null = null;
let trackMockModeToggle: ((enabled: boolean) => void) | null = null;
let trackForcedScore: ((score: number, apiType: 'facha' | 'battle' | 'enhance') => void) | null = null;

export const setDevModeTracker = (tracker: () => void) => {
  trackDevModeAccess = tracker;
};

export const setMockModeToggleTracker = (tracker: (enabled: boolean) => void) => {
  trackMockModeToggle = tracker;
};

export const setForcedScoreTracker = (tracker: (score: number, apiType: 'facha' | 'battle' | 'enhance') => void) => {
  trackForcedScore = tracker;
};

interface DevModeSettings {
  isDevMode: boolean;
  forceScore: number | null;
  useMockData: boolean;
  showDevMenu: boolean;
}

const useDevMode = () => {
  const [devSettings, setDevSettings] = useState<DevModeSettings>({
    isDevMode: false,
    forceScore: null,
    useMockData: false,
    showDevMenu: false
  });

  const [, setKeySequence] = useState<string[]>([]);

  // Función para manejar la secuencia de teclas DEV MODE
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    setKeySequence(prev => {
      const newSequence = [...prev, key];
      
      // Mantener solo los últimos 8 caracteres
      if (newSequence.length > 8) {
        newSequence.shift();
      }
      
      // Verificar si la secuencia es "devmode"
      const sequenceString = newSequence.join('');
      if (sequenceString.includes('devmode')) {
        setDevSettings(prev => ({
          ...prev,
          isDevMode: true,
          showDevMenu: true
        }));
        
        // Trackear acceso al dev mode
        if (trackDevModeAccess) {
          trackDevModeAccess();
        }
        
        return []; // Resetear secuencia
      }
      
      return newSequence;
    });
  }, []);

  // Función para cerrar el menú de desarrollador
  const closeDevMenu = useCallback(() => {
    setDevSettings(prev => ({
      ...prev,
      showDevMenu: false
    }));
  }, []);

  // Función para activar/desactivar modo mock
  const toggleMockData = useCallback(() => {
    setDevSettings(prev => {
      const newValue = !prev.useMockData;
      
      // Trackear cambio de modo mock
      if (trackMockModeToggle) {
        trackMockModeToggle(newValue);
      }
      
      return {
        ...prev,
        useMockData: newValue
      };
    });
  }, []);

  // Función para establecer puntaje forzado
  const setForceScore = useCallback((score: number | null) => {
    setDevSettings(prev => ({
      ...prev,
      forceScore: score
    }));
    
    // Trackear puntaje forzado (solo si no es null)
    if (score !== null && trackForcedScore) {
      trackForcedScore(score, 'facha'); // Por defecto facha, se puede cambiar según el contexto
    }
  }, []);

  // Función para resetear todas las configuraciones
  const resetDevSettings = useCallback(() => {
    setDevSettings({
      isDevMode: false,
      forceScore: null,
      useMockData: false,
      showDevMenu: false
    });
    setKeySequence([]);
  }, []);

  // Agregar event listener para las teclas
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Resetear configuraciones al cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      resetDevSettings();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resetDevSettings]);

  return {
    devSettings,
    closeDevMenu,
    toggleMockData,
    setForceScore,
    resetDevSettings
  };
};

export default useDevMode;
