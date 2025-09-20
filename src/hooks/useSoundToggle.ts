import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar el toggle de sonidos
 * Persiste la preferencia en localStorage
 */
export const useSoundToggle = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar preferencia desde localStorage al inicializar
  useEffect(() => {
    const savedPreference = localStorage.getItem('onlyfachas_sound_enabled');
    if (savedPreference !== null) {
      setIsSoundEnabled(JSON.parse(savedPreference));
    }
    setIsLoaded(true);
  }, []);

  // Guardar preferencia en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('onlyfachas_sound_enabled', JSON.stringify(isSoundEnabled));
    }
  }, [isSoundEnabled, isLoaded]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  const enableSound = useCallback(() => {
    setIsSoundEnabled(true);
  }, []);

  const disableSound = useCallback(() => {
    setIsSoundEnabled(false);
  }, []);

  const playSound = useCallback((audioSrc: string) => {
    if (!isSoundEnabled || !isLoaded) return;

    try {
      const audio = new Audio(audioSrc);
      audio.volume = 0.3; // Volumen moderado
      audio.play().catch(error => {
        console.warn('Error playing sound:', error);
      });
    } catch (error) {
      console.warn('Sound not available:', error);
    }
  }, [isSoundEnabled, isLoaded]);

  return {
    isSoundEnabled,
    isLoaded,
    toggleSound,
    enableSound,
    disableSound,
    playSound
  };
};
