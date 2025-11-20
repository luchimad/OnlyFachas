import { GoogleGenerativeAI } from "@google/generative-ai";
import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';
import { generateMockFachaResult, generateMockBattleComment, generateMockWinnerExplanation } from '../constants/mockData';

// Funciones para trackear Analytics (se inyectan desde el hook)
let trackApiUsage: ((isMock: boolean, apiType: 'facha' | 'battle' | 'enhance', score?: number) => void) | null = null;
let trackSuccessfulAnalysis: ((apiType: 'facha' | 'battle' | 'enhance', isMock: boolean, score?: number) => void) | null = null;
let trackFailedAnalysis: ((apiType: 'facha' | 'battle' | 'enhance', errorType: string) => void) | null = null;

export const setAnalyticsTracker = (tracker: (isMock: boolean, apiType: 'facha' | 'battle' | 'enhance', score?: number) => void) => {
  trackApiUsage = tracker;
};

export const setSuccessfulAnalysisTracker = (tracker: (apiType: 'facha' | 'battle' | 'enhance', isMock: boolean, score?: number) => void) => {
  trackSuccessfulAnalysis = tracker;
};

export const setFailedAnalysisTracker = (tracker: (apiType: 'facha' | 'battle' | 'enhance', errorType: string) => void) => {
  trackFailedAnalysis = tracker;
};

// Variables globales para dev mode (se setean desde el hook)
let devModeSettings = {
  useMockData: false,
  forceScore: null as number | null
};

export const setDevModeSettings = (settings: { useMockData: boolean; forceScore: number | null }) => {
  devModeSettings = settings;
};

const API_KEY = import.meta.env.VITE_API_KEY as string;
if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Some features may not work.");
  // Return mock data instead of throwing error
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Función para limpiar JSON que viene con formato markdown
const cleanJsonResponse = (text: string): string => {
  // Remover markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remover espacios en blanco al inicio y final
  cleaned = cleaned.trim();
  
  // Si aún no es JSON válido, buscar el objeto JSON dentro del texto
  if (!cleaned.startsWith('{')) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }
  
  return cleaned;
};

export const getFachaScore = async (base64Image: string, mimeType: string, modelMode: AiMode = 'rapido'): Promise<FachaResult> => {
  // Verificar si hay puntaje forzado
  if (devModeSettings.forceScore !== null) {
    console.log(`🎯 [DEV MODE] Puntaje forzado: ${devModeSettings.forceScore} - Usando mock data`);
    const mockResult = generateMockFachaResult();
    const result = {
      ...mockResult,
      rating: devModeSettings.forceScore
    };
    
    // Trackear uso de puntaje forzado
    if (trackApiUsage) {
      trackApiUsage(true, 'facha', devModeSettings.forceScore);
    }

    // Trackear análisis exitoso (forzado)
    if (trackSuccessfulAnalysis) {
      trackSuccessfulAnalysis('facha', true, devModeSettings.forceScore);
    }
    
    return result;
  }

  // Verificar si se debe usar mock data
  if (devModeSettings.useMockData || !genAI) {
    const reason = devModeSettings.useMockData ? 'DEV MODE activado' : 'API_KEY no configurada';
    console.log(`🎭 [MOCK DATA] Análisis de facha - ${reason} - Puntaje: ${generateMockFachaResult().rating}`);
    const result = generateMockFachaResult();
    
    // Trackear uso de mock data
    if (trackApiUsage) {
      trackApiUsage(true, 'facha', result.rating);
    }

    // Trackear análisis exitoso (mock)
    if (trackSuccessfulAnalysis) {
      trackSuccessfulAnalysis('facha', true, result.rating);
    }
    
    return result;
  }
  
  try {
    console.log(`🤖 [GEMINI API] Iniciando análisis de facha con modelo: gemini-2.5-flash-lite (${modelMode})`);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: modelMode === 'creativo' ? 1.0 : 0.8,
      }
    });

    // Instrucción especial optimista para Gemini 2.5
    const prompt = `Tu tarea es analizar la 'facha' (estilo, apariencia, actitud) de la persona en la imagen y darle un puntaje del 1 al 10. 

PASO 1: Primero identifica si es hombre o mujer para adaptar el lenguaje y los rangos de facha. IMPORTANTE: Puedes usar "lokitaaa" para ambos géneros, pero adapta otros términos según el género (para mujeres: "reina", "diosa", "piba", etc. Para hombres: "papi", "rey", "crack", etc.).

PASO 2: Sé optimista y generoso con las notas, pero no regales. Busca lo positivo en cada persona. Si alguien tiene buena actitud, estilo interesante, o algo que lo destaque, dale una nota alta (7.0-9.9). Solo da notas bajas (1.0-4.9) si realmente hay problemas serios de presentación. La mayoría de personas deberían estar entre 6.0-8.9.

IMPORTANTE: Usa números específicos con decimales (ej: 7.1, 7.3, 7.7, 8.2, 8.6, etc.) en lugar de números redondos (7.0, 7.5, 8.0). Esto hace que los puntajes sean más únicos y precisos.

PASO 3: Para el comentario, usa jerga argentina y sé MUY picante y subido de tono. IMPORTANTE sobre el uso de palabras:
- "detonar" = levantar/enganchar minusas (BUENO: "estás para re detonar", "vas a detonar")
- "detonado" = estar mal, re mal (MALO: "estás re detonado", "te re detonaron")
- "loquita" = "ay loquitaaaaaa" o "lokitaaaaa" (más expresivo)

Inspírate en estos ejemplos según el puntaje:

FACHAS BAJAS (1-4):
- "Che, con esa facha de velorio no levantás ni la tapa del inodoro, papá. Hay que empezar de cero y con ganas de detonar."
- "Tenés menos onda que un lunes a la mañana y más cara de culo que un mono. ¡Despertate, rey! Las minitas se te cagan de risa."
- "Te vestiste a oscuras y con el enemigo, ¿no? Con esa cara de culo no vas a levantar ni una mosca, hermano."
- "Tu facha está más devaluada que el peso y más triste que un funeral. Pero tranqui, con un buen estilista capaz que repuntás y empezás a levantar."

FACHAS PROMEDIO (5-7):
- "Zafás, eh. No sos Brad Pitt pero tenés tu no-sé-qué que las minitas notan. Te falta un hervor para detonarla completamente."
- "Aprobado pero con lo justo, crack. Tenés potencial pero todavía estás en modo demo. Actualizate y vas a empezar a levantar en serio."
- "Vas por buen camino y se nota que le metés ganas, pero todavía no estás para romper corazones. No aflojes que casi la rompés."

FACHAS ALTAS (8-10):
- "Uff, ¿sos real o te escapaste de un póster? Con esa facha estás para romper corazones en serie y coleccionar DNI en la mesita de luz."
- "Fa, mi loco, con esa cara de atrevido hasta tu ex te vuelve a escribir y las minitas se pelean por vos. Estás para re detonar."
- "Ayyyy lokitaaaaa, con esa facha de modelo sos la razón por la que se inventaron los emojis de fueguito. Deberías pagar impuesto por caminar así."
- "Nivel de facha: ilegal. Con esa cara de galán las minitas se vuelven locas y vos sabés que estás para detonar corazones en serie."

PASO 4: Para fortalezas y consejos, cada uno debe tener MÍNIMO 15 palabras y ser bien bardero:

FORTALEZAS (ejemplos - cada una 15+ palabras):
- "Tenés una mirada que mata y una sonrisa que hace que las minitas se derritan como helado al sol, papá."
- "Tu estilo tiene esa onda única que hace que te miren en la calle y las pibas se vuelvan locas por vos."
- "Tu actitud de confianza es tan fuerte que hasta los tipos te envidian y las minitas se pelean por tu atención."

CONSEJOS (ejemplos - cada uno 15+ palabras):
- "Che, si querés levantar más minitas, empezá a vestirte como si fueras a conquistar el mundo y no como si fueras a comprar pan."
- "Tu facha tiene potencial pero necesitás más actitud de galán y menos cara de culo para que las pibas se vuelvan locas por vos."
- "Para detonar en serio, tenés que creerte más el cuento y mostrar esa confianza que hace que las minitas se derritan por vos."

Responde en formato JSON con:
- rating: número del 1.0 al 10.0 con decimales específicos (ej: 7.1, 7.3, 7.7, 8.2, 8.6) - sé optimista pero justo
- comment: comentario MUY picante y subido de tono en lunfardo argentino, adaptado al género y puntaje
- fortalezas: array de 3-5 fortalezas (cada una MÍNIMO 15 palabras, bien barderas)
- consejos: array de 3-5 consejos para mejorar (cada uno MÍNIMO 15 palabras, motivadores pero barderos)`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    
    const cleanedText = cleanJsonResponse(text);
    const parsedResult = JSON.parse(cleanedText) as FachaResult;
    parsedResult.rating = Math.max(1, Math.min(10, parsedResult.rating));

    console.log(`✅ [GEMINI API] Análisis exitoso - Puntaje: ${parsedResult.rating} - Comentario: "${parsedResult.comment.substring(0, 50)}..."`);

    // Trackear uso exitoso de API real
    if (trackApiUsage) {
      trackApiUsage(false, 'facha', parsedResult.rating);
    }

    // Trackear análisis exitoso
    if (trackSuccessfulAnalysis) {
      trackSuccessfulAnalysis('facha', false, parsedResult.rating);
    }

    return parsedResult;
  } catch (error: any) {
    console.error("Error getting facha score:", error);
    
    // Trackear análisis fallido
    if (trackFailedAnalysis) {
      trackFailedAnalysis('facha', 'api_error');
    }
    
    // Manejar errores específicos de la API
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error("La API key no es válida. Contactá al desarrollador.");
    } else if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error("Se agotó la cuota de la API. Probá más tarde.");
    } else if (error?.message?.includes('SAFETY')) {
      throw new Error("La IA bloqueó la imagen por contenido inapropiado. Probá con otra foto.");
    } else if (error?.message?.includes('RATE_LIMIT')) {
      throw new Error("Demasiadas solicitudes. Esperá un momento e intentá de nuevo.");
    } else if (error?.message?.includes('NETWORK')) {
      throw new Error("Problema de conexión. Verificá tu internet e intentá de nuevo.");
    } else {
      // Fallback a mock data en caso de error desconocido
      console.warn("❌ [GEMINI API] Error desconocido, fallback a mock data:", error);
      const mockResult = generateMockFachaResult();
      console.log(`🎭 [FALLBACK] Usando mock data - Puntaje: ${mockResult.rating} - Comentario: "${mockResult.comment.substring(0, 50)}..."`);
      
      // Trackear uso de mock data como fallback
      if (trackApiUsage) {
        trackApiUsage(true, 'facha', mockResult.rating);
      }
      if (trackSuccessfulAnalysis) {
        trackSuccessfulAnalysis('facha', true, mockResult.rating);
      }
      
      return mockResult;
    }
  }
};

export const getFachaBattleResult = async (
    image1: { base64: string, mimeType: string },
    image2: { base64: string, mimeType: string },
    modelMode: AiMode = 'rapido'
): Promise<FachaBattleResult> => {
    if (!genAI) {
        console.log(`🎭 [MOCK DATA] Batalla de fachas - API_KEY no configurada - Usando mock data`);
        const mockResult = getMockBattleResult();
        console.log(`🎭 [MOCK DATA] Batalla mock - Puntaje 1: ${mockResult.score1} - Puntaje 2: ${mockResult.score2} - Ganador: ${mockResult.winner}`);
        
        // Trackear uso de mock data para batalla
        if (trackApiUsage) {
          trackApiUsage(true, 'battle', Math.max(mockResult.score1, mockResult.score2));
        }

        // Trackear análisis exitoso para batalla (mock)
        if (trackSuccessfulAnalysis) {
          trackSuccessfulAnalysis('battle', true, Math.max(mockResult.score1, mockResult.score2));
        }
        
        return mockResult;
    }
    
    try {
        console.log(`🤖 [GEMINI API] Iniciando batalla de fachas con modelo: gemini-2.5-flash-lite (${modelMode})`);
        // Step 1 & 2: Evaluate each image individually and in parallel for efficiency
        const [result1, result2] = await Promise.all([
            getFachaScore(image1.base64, image1.mimeType, modelMode),
            getFachaScore(image2.base64, image2.mimeType, modelMode)
        ]);

        // Step 3: Determine winner based on higher rating
        const winner: 1 | 2 = result1.rating > result2.rating ? 1 : 2;
        console.log(`🤖 [GEMINI API] Análisis individual completado - Fachas: ${result1.rating} vs ${result2.rating} - Ganador: ${winner}`);

        // Step 4: Generate a spicy battle comment using Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: modelMode === 'creativo' ? 1.0 : 0.9,
            }
        });

        const prompt = `Genera un comentario MUY picante y bardero en lunfardo argentino sobre esta batalla de facha. Persona 1 sacó ${result1.rating.toFixed(1)} y Persona 2 sacó ${result2.rating.toFixed(1)}. El ganador es la Persona ${winner}.

IMPORTANTE: 
- Primero identifica el género de ambas personas para adaptar el lenguaje
- Sé MUY bardero, picante y subido de tono, pero AMISTOSO, no hiriente
- Usa jerga argentina picante (detonar, papi, minusas, papá, ay lokitaaa, levantar, etc.)
- IMPORTANTE: "detonar" = levantar/enganchar minusas (BUENO), "detonado" = estar mal (MALO)
- Puedes usar "lokitaaa" para ambos géneros, pero adapta otros términos según corresponda
- Haz que el perdedor se ría, no que se sienta mal
- Mantén el tono de joda entre amigos pero con MÁS actitud y picante
- Máximo 2-3 oraciones pero bien picantes y barderas
- Inspírate en estos estilos según la diferencia de puntaje:

DIFERENCIA GRANDE (3+ puntos):
- "Papi, la Persona ${winner} te pasó por arriba como un tren y te dejó en el molde. Pero tranqui, que con esa sonrisa seguro que levantás igual y las minitas se vuelven locas por vos."
- "Che, la Persona ${winner} te dio una paliza épica y te dejó más seco que un desierto. Pero no te hagas drama que tenés onda para rato y las pibas se derriten por vos."
- "Uy, la Persona ${winner} te destrozó completamente y te dejó sin argumentos. Pero mirá que bien que te ves igual y seguro que levantás en serio."

DIFERENCIA MEDIA (1-2 puntos):
- "Fue re parejo y estuvo picante la cosa, pero la Persona ${winner} te ganó por un pelo y te sacó ventaja. Casi casi la rompés, crack, seguí así que vas bien."
- "Estuvo reñido hasta el final y la cosa estuvo caliente, pero la Persona ${winner} se llevó la victoria por un pelo. No aflojes que estás cerca de detonar."
- "Reñido hasta el final y bien picante, pero la Persona ${winner} te sacó ventaja por poquito. Seguí así que vas bien y casi la rompés."

DIFERENCIA PEQUEÑA (0.5 puntos):
- "Uff, qué batalla épica! La Persona ${winner} te ganó por poquito pero estuvo re picante la cosa. Estuviste a la altura y casi la rompés, crack."
- "Re parejo todo y bien caliente, pero la Persona ${winner} se llevó el triunfo por detalles mínimos. Bien jugado y seguí así que vas a detonar."
- "Casi empate total y estuvo reñido hasta el final, pero la Persona ${winner} se impuso por un pelo. La próxima seguro la ganás y levantás en serio."

Responde en formato JSON con:
- comment: comentario MUY picante y bardero pero amistoso sobre quién ganó la batalla
- winnerExplanation: array de exactamente 4 frases explicando por qué la Persona ${winner} detona más que la otra. Cada frase debe ser picante, bardera y explicar una razón diferente (estilo, actitud, presencia, etc.). Usa jerga argentina y sé creativo. Ejemplos de estilo:
  * "La Persona ${winner} tiene esa actitud de galán que hace que las minitas se vuelvan locas y se peleen por su atención."
  * "Su estilo es tan detonador que hasta los tipos le piden consejos de moda y las pibas se derriten cuando pasa."
  * "Tiene esa confianza que mata y esa mirada que hace que cualquiera se enamore al instante."
  * "Su presencia es tan fuerte que cuando entra a un lugar todos se dan vuelta y las minitas se vuelven locas por él/ella."`;

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
            throw new Error("Empty response from Gemini API");
        }
        
        const cleanedText = cleanJsonResponse(text);
        const commentResult = JSON.parse(cleanedText) as { comment: string; winnerExplanation: string[] };

        // Step 5: Assemble the final battle result object
        const finalResult: FachaBattleResult = {
            winner,
            comment: commentResult.comment,
            score1: result1.rating,
            score2: result2.rating,
            winnerExplanation: commentResult.winnerExplanation || [],
        };

        console.log(`✅ [GEMINI API] Batalla completada exitosamente - Ganador: ${winner} - Comentario: "${commentResult.comment.substring(0, 50)}..."`);

        // Trackear uso exitoso de API real para batalla
        if (trackApiUsage) {
          trackApiUsage(false, 'battle', Math.max(result1.rating, result2.rating));
        }

        // Trackear análisis exitoso para batalla
        if (trackSuccessfulAnalysis) {
          trackSuccessfulAnalysis('battle', false, Math.max(result1.rating, result2.rating));
        }

        return finalResult;
    } catch (error: any) {
        console.error("Error getting facha battle result:", error);
        
        // Trackear análisis fallido para batalla
        if (trackFailedAnalysis) {
          trackFailedAnalysis('battle', 'api_error');
        }
        
        // Fallback a mock data en caso de error
        console.warn("❌ [GEMINI API] Error en batalla, fallback a mock data:", error);
        const mockResult = getMockBattleResult();
        console.log(`🎭 [FALLBACK] Batalla mock - Puntaje 1: ${mockResult.score1} - Puntaje 2: ${mockResult.score2} - Ganador: ${mockResult.winner}`);
        
        // Trackear uso de mock data como fallback
        if (trackApiUsage) {
          trackApiUsage(true, 'battle', Math.max(mockResult.score1, mockResult.score2));
        }
        if (trackSuccessfulAnalysis) {
          trackSuccessfulAnalysis('battle', true, Math.max(mockResult.score1, mockResult.score2));
        }
        
        return mockResult;
    }
};

export const getEnhancedFacha = async (base64Image: string, mimeType: string): Promise<FachaEnhanceResult> => {
    if (!genAI) {
        console.log(`🎭 [MOCK DATA] Mejora de facha - API_KEY no configurada - Usando mock data`);
        const mockResult = getMockEnhanceResult();
        console.log(`🎭 [MOCK DATA] Mejora mock - Comentario: "${mockResult.comment.substring(0, 50)}..."`);
        
        // Trackear uso de mock data para mejora
        if (trackApiUsage) {
          trackApiUsage(true, 'enhance');
        }

        // Trackear análisis exitoso para mejora (mock)
        if (trackSuccessfulAnalysis) {
          trackSuccessfulAnalysis('enhance', true);
        }
        
        return mockResult;
    }
    
    try {
        console.log(`🤖 [GEMINI API] Iniciando mejora de facha con modelo: gemini-2.5-flash-lite`);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                temperature: 0.9,
            }
        });

        const prompt = `Tu tarea es editar la imagen proporcionada para mejorar la 'facha' de la persona, convirtiéndola en una versión 'gigachad'. Realiza ediciones estéticas excesivas como definir muchisimo la mandíbula, mejorar el pelo, y dar una expresión más confiada, pero manteniendo ligeramente el parecido con la persona original. Tu respuesta DEBE contener DOS partes: 1. La IMAGEN EDITADA. 2. Un TEXTO con un comentario corto, picante, bien pero bien subido de tono y en jerga argentina sobre la transformación. IMPORTANTE: "detonar" = levantar/enganchar minusas (BUENO), "detonado" = estar mal (MALO). Usa palabras como: Detonar, Papi, Minusas, ay loquitaaaaaa/lokitaaaaa, etc. Ejemplo de comentario, no uses el mismo, solo una idea: "Mirá lo que sos ahora, papá. Dejaste de ser un simple mortal para convertirte en el especimen que todas las minitas quieren detonar. Estás para romper corazones y lo sabés. Andá y detonala toda."`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        
        if (!text) {
            throw new Error("Empty response from Gemini API");
        }

        // For now, return mock data since image generation is complex
        // In a real implementation, you'd need to handle image generation differently
        console.log(`✅ [GEMINI API] Mejora de facha completada - Usando mock data (generación de imagen no implementada)`);
        const mockResult = getMockEnhanceResult();
        console.log(`🎭 [MOCK DATA] Mejora mock - Comentario: "${mockResult.comment.substring(0, 50)}..."`);
        
        // Trackear uso de mock data para mejora (siempre mock por ahora)
        if (trackApiUsage) {
          trackApiUsage(true, 'enhance');
        }

        // Trackear análisis exitoso para mejora (mock)
        if (trackSuccessfulAnalysis) {
          trackSuccessfulAnalysis('enhance', true);
        }
        
        return mockResult;

    } catch (error) {
        console.error("Error enhancing facha:", error);
        
        // Trackear análisis fallido para mejora
        if (trackFailedAnalysis) {
          trackFailedAnalysis('enhance', 'api_error');
        }
        
        if (error instanceof Error && (error.message.includes('La IA bloqueó') || error.message.includes('La IA devolvió'))) {
            throw error; // Re-throw specific, user-friendly errors
        }
        // Fallback a mock data en caso de error
        console.warn("❌ [GEMINI API] Error en mejora, fallback a mock data:", error);
        const mockResult = getMockEnhanceResult();
        console.log(`🎭 [FALLBACK] Mejora mock - Comentario: "${mockResult.comment.substring(0, 50)}..."`);
        
        // Trackear uso de mock data como fallback
        if (trackApiUsage) {
          trackApiUsage(true, 'enhance');
        }
        if (trackSuccessfulAnalysis) {
          trackSuccessfulAnalysis('enhance', true);
        }
        
        return mockResult;
    }
};

// Mock data functions for when API_KEY is not available

const getMockBattleResult = (): FachaBattleResult => {
    const score1 = Math.random() * 9 + 1; // 1-10
    const score2 = Math.random() * 9 + 1; // 1-10
    const winner = score1 > score2 ? 1 : 2;
    
    const comment = generateMockBattleComment(winner);
    const winnerExplanation = generateMockWinnerExplanation(winner);
    
    return {
        winner,
        comment,
        score1: Math.round(score1 * 10) / 10,
        score2: Math.round(score2 * 10) / 10,
        winnerExplanation
    };
};

const getMockEnhanceResult = (): FachaEnhanceResult => ({
    newImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 transparent pixel
    newImageMimeType: "image/png",
    comment: "La IA mejoró tu facha pero no pudo procesar la imagen correctamente."
});

