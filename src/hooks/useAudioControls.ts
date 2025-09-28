import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioControls {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  setMusicEnabled: (enabled: boolean) => void;
  setEffectsEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  playEffect: (audioPath: string) => void;
  stopMusic: () => void;
  startMusic: () => void;
}

/**
 * Hook personalizado para manejar controles de audio separados
 * - Música de fondo: control independiente con volumen ajustable
 * - Efectos de voz: control independiente con volumen ajustable
 */
export const useAudioControls = (): AudioControls => {
  // Estados para música de fondo
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.3);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  
  // Estados para efectos de voz
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(false);
  const [effectsVolume, setEffectsVolume] = useState<number>(0.7);
  
  // Referencias para efectos de audio
  const effectsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar configuraciones guardadas al inicializar
  useEffect(() => {
    const savedMusicEnabled = localStorage.getItem('onlyFachas_musicEnabled');
    const savedEffectsEnabled = localStorage.getItem('onlyFachas_effectsEnabled');
    const savedMusicVolume = localStorage.getItem('onlyFachas_musicVolume');
    const savedEffectsVolume = localStorage.getItem('onlyFachas_effectsVolume');

    if (savedMusicEnabled !== null) {
      setMusicEnabled(JSON.parse(savedMusicEnabled));
    }
    if (savedEffectsEnabled !== null) {
      setEffectsEnabled(JSON.parse(savedEffectsEnabled));
    }
    if (savedMusicVolume !== null) {
      setMusicVolume(JSON.parse(savedMusicVolume));
    }
    if (savedEffectsVolume !== null) {
      setEffectsVolume(JSON.parse(savedEffectsVolume));
    }
  }, []);

  // Guardar configuraciones cuando cambien
  useEffect(() => {
    localStorage.setItem('onlyFachas_musicEnabled', JSON.stringify(musicEnabled));
  }, [musicEnabled]);

  useEffect(() => {
    localStorage.setItem('onlyFachas_effectsEnabled', JSON.stringify(effectsEnabled));
  }, [effectsEnabled]);

  useEffect(() => {
    localStorage.setItem('onlyFachas_musicVolume', JSON.stringify(musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('onlyFachas_effectsVolume', JSON.stringify(effectsVolume));
  }, [effectsVolume]);

  // Manejo de música de fondo
  useEffect(() => {
    if (musicEnabled && !backgroundMusic) {
      const music = new Audio('/audios/musica/Deep_Close.mp3');
      music.loop = true;
      music.volume = musicVolume;
      music.preload = 'auto';
      
      music.play().then(() => {
        // Música de fondo iniciada
      }).catch(error => {
        console.warn('Error al reproducir música de fondo:', error);
      });
      
      setBackgroundMusic(music);
    }
    
    if (!musicEnabled && backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      setBackgroundMusic(null);
    }
  }, [musicEnabled, backgroundMusic]);

  // Actualizar volumen de música cuando cambie
  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.volume = musicVolume;
    }
  }, [musicVolume, backgroundMusic]);

  // Función para reproducir efectos de voz
  const playEffect = useCallback((audioPath: string) => {
    if (!effectsEnabled) return;
    
    try {
      // Crear nuevo elemento de audio para efectos
      const audio = new Audio(audioPath);
      audio.volume = effectsVolume;
      audio.preload = 'auto';
      
      // Función para reproducir cuando esté listo
      const playWhenReady = () => {
        audio.pause();
        audio.currentTime = 0;
        
        // Estrategia de silencio para calentar el buffer
        const playSilence = () => {
          const silence = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
          silence.volume = 0.01;
          silence.play().then(() => {
            setTimeout(() => {
              audio.play().catch(error => {
                console.warn('Error al reproducir efecto:', error);
              });
            }, 1000);
          }).catch(() => {
            audio.play().catch(error => {
              console.warn('Error al reproducir efecto:', error);
            });
          });
        };
        
        setTimeout(playSilence, 100);
      };
      
      const handleCanPlay = () => {
        playWhenReady();
      };
      
      audio.addEventListener('canplay', handleCanPlay, { once: true });
      audio.addEventListener('loadeddata', handleCanPlay, { once: true });
      
      setTimeout(() => {
        if (audio.readyState >= 2) {
          playWhenReady();
        }
      }, 300);
      
      effectsAudioRef.current = audio;
      
      return audio;
    } catch (error) {
      console.warn('Error al crear efecto de audio:', error);
      return null;
    }
  }, [effectsEnabled, effectsVolume]);

  // Función para detener música
  const stopMusic = useCallback(() => {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  }, [backgroundMusic]);

  // Función para iniciar música
  const startMusic = useCallback(() => {
    if (backgroundMusic && musicEnabled) {
      backgroundMusic.play().catch(error => {
        console.warn('Error al iniciar música:', error);
      });
    }
  }, [backgroundMusic, musicEnabled]);

  return {
    musicEnabled,
    effectsEnabled,
    musicVolume,
    effectsVolume,
    setMusicEnabled,
    setEffectsEnabled,
    setMusicVolume,
    setEffectsVolume,
    playEffect,
    stopMusic,
    startMusic
  };
};

