import { useState, useCallback } from 'react';

// Interfaces para tipado fuerte
export interface GeminiAnalysisResult {
  puntaje: number;
  comentarios: string[];
  fortalezas: string[];
  consejos: string[];
}

export interface UseGeminiSafeReturn {
  data: GeminiAnalysisResult | null;
  error: string | null;
  isFallback: boolean;
  isLoading: boolean;
  analyzeImage: (file: File) => Promise<void>;
}

export interface UseGeminiSafeConfig {
  rateLimitSeconds?: number;
  apiKey?: string;
}

// Datos mock para fallback
const MOCK_COMMENTS = [
  "Che, tenés una facha que te la regalaron en el kiosco! 🔥",
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
  "Tu energía es contagiosa",
  "Tu sonrisa ilumina todo",
  "Tenés carisma natural",
  "Tu personalidad brilla"
];

const MOCK_ADVICE = [
  "Probá con colores más vibrantes",
  "Experimentá con diferentes estilos",
  "Confía más en vos mismo/a",
  "Sé más creativo/a con los accesorios",
  "Disfrutá más del proceso",
  "Probá con peinados diferentes",
  "Experimentá con la iluminación",
  "Sé más expresivo/a en las fotos"
];

// Claves para localStorage
const RATE_LIMIT_KEY = 'gemini_safe_last_request';
const RATE_LIMIT_DEFAULT = 10000; // 10 segundos por defecto

/**
 * Hook para manejar requests seguros a la API de Gemini con rate limiting y fallback
 */
export const useGeminiSafe = (config: UseGeminiSafeConfig = {}): UseGeminiSafeReturn => {
  const {
    rateLimitSeconds = 10,
    apiKey = import.meta.env.VITE_API_KEY
  } = config;

  const [data, setData] = useState<GeminiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Genera datos mock para fallback
   */
  const generateMockData = useCallback((): GeminiAnalysisResult => {
    const puntaje = Math.floor(Math.random() * 4) + 6; // 6-9
    const comentarios = MOCK_COMMENTS.sort(() => 0.5 - Math.random()).slice(0, 3);
    const fortalezas = MOCK_STRENGTHS.sort(() => 0.5 - Math.random()).slice(0, 3);
    const consejos = MOCK_ADVICE.sort(() => 0.5 - Math.random()).slice(0, 3);

    return {
      puntaje,
      comentarios,
      fortalezas,
      consejos
    };
  }, []);

  /**
   * Verifica si se puede hacer una nueva request según el rate limit
   */
  const checkRateLimit = useCallback((): boolean => {
    const lastRequest = localStorage.getItem(RATE_LIMIT_KEY);
    if (!lastRequest) return true;

    const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
    const rateLimitMs = rateLimitSeconds * 1000;

    return timeSinceLastRequest >= rateLimitMs;
  }, [rateLimitSeconds]);

  /**
   * Actualiza el timestamp del último request
   */
  const updateLastRequest = useCallback(() => {
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
  }, []);

  /**
   * Convierte un archivo a base64
   */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }, []);

  /**
   * Llama a la API de Gemini
   */
  const callGeminiAPI = useCallback(async (base64Image: string, mimeType: string): Promise<GeminiAnalysisResult> => {
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza la 'facha' (estilo, apariencia, actitud) de la persona en la imagen y dale un puntaje del 1 al 10. Responde en formato JSON con:
          - puntaje: número del 1 al 10
          - comentarios: array de 3 comentarios cortos en lunfardo argentino
          - fortalezas: array de 3 fortalezas
          - consejos: array de 3 consejos para mejorar`
          }, {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(`API_ERROR_${response.status}`);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('INVALID_RESPONSE');
    }

    const content = result.candidates[0].content.parts[0].text;
    const parsedResult = JSON.parse(content) as GeminiAnalysisResult;

    // Validar que el puntaje esté en el rango correcto
    parsedResult.puntaje = Math.max(1, Math.min(10, parsedResult.puntaje));

    return parsedResult;
  }, [apiKey]);

  /**
   * Función principal para analizar una imagen
   */
  const analyzeImage = useCallback(async (file: File): Promise<void> => {
    // Resetear estados
    setError(null);
    setIsFallback(false);
    setIsLoading(true);

    try {
      // 1. Verificar rate limit
      if (!checkRateLimit()) {
        const lastRequest = localStorage.getItem(RATE_LIMIT_KEY);
        const timeSinceLastRequest = Date.now() - parseInt(lastRequest || '0');
        const remainingTime = Math.ceil((rateLimitSeconds * 1000 - timeSinceLastRequest) / 1000);
        
        throw new Error(`RATE_LIMIT: Esperá ${remainingTime} segundos antes de hacer otra request`);
      }

      // 2. Convertir archivo a base64
      const base64Image = await fileToBase64(file);
      const mimeType = file.type;

      // 3. Actualizar timestamp
      updateLastRequest();

      // 4. Llamar a la API
      const result = await callGeminiAPI(base64Image, mimeType);
      
      setData(result);
      setIsFallback(false);

    } catch (err: any) {
      console.warn('Gemini API failed, using fallback:', err.message);
      
      // Generar datos mock
      const mockData = generateMockData();
      setData(mockData);
      setIsFallback(true);
      
      // Establecer error solo si no es rate limit
      if (err.message.includes('RATE_LIMIT')) {
        setError(err.message);
      } else {
        setError('API_ERROR: Usando datos de ejemplo');
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkRateLimit, updateLastRequest, callGeminiAPI, generateMockData, rateLimitSeconds]);

  return {
    data,
    error,
    isFallback,
    isLoading,
    analyzeImage
  };
};
