import { useState, useCallback, useRef } from 'react';
import { FachaResult, FachaBattleResult, FachaEnhanceResult } from '../../types';

// Rate limiting configuration
const RATE_LIMIT_MS = 15000; // 15 seconds between requests
const CACHE_KEY = 'onlyfachas_last_result';
const RATE_LIMIT_KEY = 'onlyfachas_last_request';

// Mock data for fallback when API fails
const MOCK_COMMENTS = [
  "¡Che, tenés una facha que te la regalaron en el kiosco! 🔥",
  "Mirá vos, parece que te vestiste con los ojos cerrados pero igual zafás 😎",
  "Uy, esa facha está más perdida que el Diego en el 94, pero tiene onda ⚽",
  "¡Increíble! Tu facha es tan única que hasta la IA se confundió 🤖",
  "Che, esa facha está más picante que un asado en domingo 🥩",
  "¡Wow! Tenés una facha que hasta los maniquíes se ponen celosos 👔",
  "Uy, esa facha está más brillante que el futuro de Argentina ✨",
  "¡Increíble! Tu facha es tan épica que hasta los espejos se rompen 🪞",
  "Che, esa facha está más fresca que una birra bien fría 🍺",
  "¡Wow! Tenés una facha que hasta los robots te piden consejos 🤖"
];

const MOCK_STRENGTHS = [
  "Tu actitud es imparable",
  "Tenés un estilo único",
  "Tu confianza se nota",
  "Sos auténtico/a",
  "Tu energía es contagiosa"
];

const MOCK_ADVICE = [
  "Probá con colores más vibrantes",
  "Experimentá con diferentes estilos",
  "Confía más en vos mismo/a",
  "Sé más creativo/a con los accesorios",
  "Disfrutá más del proceso"
];

// Interface for the hook return
interface UseApiWithFallbackReturn {
  isLoading: boolean;
  error: string | null;
  isRateLimited: boolean;
  timeUntilNextRequest: number;
  callApi: (apiFunction: (...args: any[]) => Promise<any>, ...args: any[]) => Promise<any>;
  getCachedResult: () => any | null;
  clearCache: () => void;
}

/**
 * Custom hook para manejar llamadas a la API con fallback automático
 * Incluye rate limiting, cache local y manejo de errores robusto
 */
export const useApiWithFallback = (): UseApiWithFallbackReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeUntilNextRequest, setTimeUntilNextRequest] = useState(0);
  
  const rateLimitTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Genera un resultado mock cuando la API falla
   * Mantiene la misma estructura que un resultado real
   */
  const generateMockResult = (type: 'single' | 'battle' | 'enhance' = 'single'): any => {
    const rating = Math.floor(Math.random() * 10) + 1; // 1-10
    const comment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
    const fortalezas = MOCK_STRENGTHS.sort(() => 0.5 - Math.random()).slice(0, 3);
    const consejos = MOCK_ADVICE.sort(() => 0.5 - Math.random()).slice(0, 3);

    const baseResult = {
      rating,
      comment,
      fortalezas,
      consejos,
      isMock: true, // Flag para identificar resultados mock
      timestamp: Date.now()
    };

    // Para battle results, generar dos puntajes
    if (type === 'battle') {
      const rating2 = Math.floor(Math.random() * 10) + 1;
      return {
        score1: rating,
        score2: rating2,
        winner: rating > rating2 ? 1 : 2,
        comment,
        isMock: true,
        timestamp: Date.now()
      } as FachaBattleResult;
    }

    // Para enhance results, agregar campos específicos
    if (type === 'enhance') {
      return {
        ...baseResult,
        newImageBase64: null,
        newImageMimeType: null,
        improvements: consejos
      } as FachaEnhanceResult;
    }

    return baseResult as FachaResult;
  };

  /**
   * Verifica si el usuario puede hacer una nueva request
   * Implementa rate limiting de 15 segundos
   */
  const canMakeRequest = useCallback((): boolean => {
    const lastRequest = localStorage.getItem(RATE_LIMIT_KEY);
    if (!lastRequest) return true;

    const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
    const remainingTime = RATE_LIMIT_MS - timeSinceLastRequest;
    
    if (remainingTime > 0) {
      setIsRateLimited(true);
      setTimeUntilNextRequest(Math.ceil(remainingTime / 1000));
      return false;
    }

    setIsRateLimited(false);
    setTimeUntilNextRequest(0);
    return true;
  }, []);

  /**
   * Actualiza el timer de rate limiting
   */
  const updateRateLimitTimer = useCallback(() => {
    if (rateLimitTimerRef.current) {
      clearInterval(rateLimitTimerRef.current);
    }

    rateLimitTimerRef.current = setInterval(() => {
      const lastRequest = localStorage.getItem(RATE_LIMIT_KEY);
      if (!lastRequest) {
        setIsRateLimited(false);
        setTimeUntilNextRequest(0);
        if (rateLimitTimerRef.current) {
          clearInterval(rateLimitTimerRef.current);
        }
        return;
      }

      const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
      const remainingTime = RATE_LIMIT_MS - timeSinceLastRequest;
      
      if (remainingTime <= 0) {
        setIsRateLimited(false);
        setTimeUntilNextRequest(0);
        if (rateLimitTimerRef.current) {
          clearInterval(rateLimitTimerRef.current);
        }
      } else {
        setTimeUntilNextRequest(Math.ceil(remainingTime / 1000));
      }
    }, 1000);
  }, []);

  /**
   * Función principal para llamar a la API con fallback automático
   * Maneja rate limiting, errores y cache
   */
  const callApi = useCallback(async (
    apiFunction: (...args: any[]) => Promise<any>, 
    ...args: any[]
  ): Promise<any> => {
    // Verificar rate limiting
    if (!canMakeRequest()) {
      throw new Error(`Esperá ${timeUntilNextRequest} segundos antes de enviar otra foto`);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Intentar llamar a la API real
      const result = await apiFunction(...args);
      
      // Si la API funciona, guardar en cache y actualizar rate limit
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ...result,
        timestamp: Date.now()
      }));
      
      updateRateLimitTimer();
      return result;

    } catch (apiError: any) {
      console.warn('API Error, using fallback:', apiError);
      
      // Determinar el tipo de resultado basado en el número de argumentos
      // Single: 3 args (base64, mimeType, aiMode)
      // Battle: 5 args (base64_1, mimeType_1, base64_2, mimeType_2, aiMode)  
      // Enhance: 2 args (base64, mimeType)
      let resultType: 'single' | 'battle' | 'enhance' = 'single';
      if (args.length === 5) resultType = 'battle';
      if (args.length === 2) resultType = 'enhance';

      // Generar resultado mock
      const mockResult = generateMockResult(resultType);
      
      // Guardar mock en cache también
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      localStorage.setItem(CACHE_KEY, JSON.stringify(mockResult));
      
      updateRateLimitTimer();
      
      // Mostrar mensaje amigable al usuario
      setError("El servidor de IA está saturado, te damos un resultado mock de prueba");
      
      return mockResult;
    } finally {
      setIsLoading(false);
    }
  }, [canMakeRequest, timeUntilNextRequest, updateRateLimitTimer]);

  /**
   * Obtiene el último resultado del cache
   */
  const getCachedResult = useCallback((): any | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const result = JSON.parse(cached);
      
      // Verificar que el cache no sea muy viejo (24 horas)
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms
      if (Date.now() - result.timestamp > maxAge) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }, []);

  /**
   * Limpia el cache local
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(RATE_LIMIT_KEY);
    setIsRateLimited(false);
    setTimeUntilNextRequest(0);
  }, []);

  return {
    isLoading,
    error,
    isRateLimited,
    timeUntilNextRequest,
    callApi,
    getCachedResult,
    clearCache
  };
};
