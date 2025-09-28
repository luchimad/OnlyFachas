/**
 * Utilidades para manejo de audio con rotación inteligente
 * Evita repetir el mismo audio consecutivamente
 */

export interface AudioRotationState {
  lastPlayedAudio: string;
  lastPlayedBattleAudio: string;
}

/**
 * Selecciona un audio de facha basado en el rating con rotación inteligente
 * @param rating - Puntaje de facha (1-10)
 * @param lastPlayed - Último audio reproducido para evitar repetición
 * @returns Ruta del audio seleccionado
 */
export const selectFachaAudio = (rating: number, lastPlayed: string = ''): string => {
  let availableAudios: string[] = [];
  
  // Definir audios disponibles según el rango
  if (rating >= 9) {
    // Super facha (9-10): 3 variantes super
    availableAudios = [
      '/audios/frases/individual/facha_detected_super.mp3',
      '/audios/frases/individual/facha_detected_super2.mp3',
      '/audios/frases/individual/facha_detected_super3.mp3'
    ];
  } else if (rating >= 7) {
    // Facha alta (7-8): 2 variantes normales
    availableAudios = [
      '/audios/frases/individual/facha_detected_1.mp3',
      '/audios/frases/individual/facha_detected_2.mp3'
    ];
  } else if (rating >= 5) {
    // Facha media (5-6): 2 variantes medias
    availableAudios = [
      '/audios/frases/individual/facha_detected_mid1.mp3',
      '/audios/frases/individual/facha_detected_mid2.mp3'
    ];
  } else {
    // Facha baja (1-4): 2 variantes bajas
    availableAudios = [
      '/audios/frases/individual/facha_detected_low1.mp3',
      '/audios/frases/individual/facha_detected_low2.mp3'
    ];
  }
  
  // Filtrar el último audio reproducido para evitar repetición
  const filteredAudios = availableAudios.filter(audio => audio !== lastPlayed);
  
  // Si no hay audios disponibles después del filtro, usar todos
  const finalAudios = filteredAudios.length > 0 ? filteredAudios : availableAudios;
  
  // Seleccionar aleatoriamente
  const selectedAudio = finalAudios[Math.floor(Math.random() * finalAudios.length)];
  
  return selectedAudio;
};

/**
 * Selecciona un audio de batalla con rotación inteligente
 * @param lastPlayed - Último audio de batalla reproducido
 * @returns Ruta del audio seleccionado
 */
export const selectBattleAudio = (lastPlayed: string = ''): string => {
  const availableAudios = [
    '/audios/frases/facha-vs-facha/1_wins.mp3',
    '/audios/frases/facha-vs-facha/1_wins_super.mp3',
    '/audios/frases/facha-vs-facha/2_wins.mp3',
    '/audios/frases/facha-vs-facha/2_wins_super.mp3'
  ];
  
  // Filtrar el último audio reproducido
  const filteredAudios = availableAudios.filter(audio => audio !== lastPlayed);
  const finalAudios = filteredAudios.length > 0 ? filteredAudios : availableAudios;
  
  return finalAudios[Math.floor(Math.random() * finalAudios.length)];
};

/**
 * Obtiene el volumen recomendado para efectos de voz según el contexto
 * @param context - Contexto del audio ('facha' | 'battle' | 'notification')
 * @returns Volumen recomendado (0-1)
 */
export const getRecommendedEffectsVolume = (context: 'facha' | 'battle' | 'notification'): number => {
  switch (context) {
    case 'facha':
      return 0.7; // Volumen medio para efectos de facha
    case 'battle':
      return 0.8; // Volumen alto para batallas (más emocionante)
    case 'notification':
      return 0.5; // Volumen bajo para notificaciones
    default:
      return 0.7;
  }
};

/**
 * Obtiene el volumen recomendado para música de fondo según el contexto
 * @param context - Contexto de la música ('background' | 'menu' | 'result')
 * @returns Volumen recomendado (0-1)
 */
export const getRecommendedMusicVolume = (context: 'background' | 'menu' | 'result'): number => {
  switch (context) {
    case 'background':
      return 0.3; // Volumen bajo para no interferir con efectos
    case 'menu':
      return 0.4; // Volumen medio para menús
    case 'result':
      return 0.2; // Volumen muy bajo durante resultados
    default:
      return 0.3;
  }
};

