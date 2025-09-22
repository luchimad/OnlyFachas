import { useCallback, useRef } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

/**
 * Hook personalizado para manejar la reproducción de audio
 * Soporta diferentes tipos de sonidos según el contexto
 */
export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((audioPath: string, options: AudioOptions = {}) => {
    try {
      // Crear nuevo elemento de audio cada vez para evitar problemas de buffer
      const audio = new Audio(audioPath);
      
      // Configurar opciones
      audio.volume = options.volume || 0.7;
      audio.loop = options.loop || false;
      audio.preload = 'auto';
      
      // Función para reproducir cuando esté completamente listo
      const playWhenReady = () => {
        // Asegurar que esté en el inicio y pausado
        audio.pause();
        audio.currentTime = 0;
        
        // Estrategia: reproducir un silencio de 1 segundo para "calentar" el buffer
        const playSilence = () => {
          // Crear un audio de silencio de 1 segundo
          const silence = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
          silence.volume = 0.01; // Muy bajo para que no se escuche
          silence.play().then(() => {
            // Después del silencio de 1 segundo, reproducir el audio real
            setTimeout(() => {
              audio.play().catch(error => {
                console.warn('Error al reproducir audio:', error);
              });
            }, 1000); // 1 segundo de silencio
          }).catch(() => {
            // Si falla el silencio, reproducir directamente
            audio.play().catch(error => {
              console.warn('Error al reproducir audio:', error);
            });
          });
        };
        
        // Delay para asegurar que el buffer esté listo
        setTimeout(playSilence, 100);
      };
      
      // Esperar a que esté completamente cargado
      const handleCanPlay = () => {
        playWhenReady();
      };
      
      // Múltiples eventos para asegurar que esté listo
      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('canplay', handleCanPlay, { once: true });
      audio.addEventListener('loadeddata', handleCanPlay, { once: true });
      
      // Fallback con delay más largo
      setTimeout(() => {
        if (audio.readyState >= 2) {
          playWhenReady();
        }
      }, 300);
      
      // Guardar referencia
      audioRef.current = audio;
      
      return audio;
    } catch (error) {
      console.warn('Error al crear audio:', error);
      return null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    playAudio,
    stopAudio,
    setVolume
  };
};
