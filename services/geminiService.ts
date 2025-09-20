import { GoogleGenerativeAI } from "@google/generative-ai";
import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';
import { MOCK_COMMENTS, MOCK_BATTLE_COMMENTS } from '../src/constants/mockData';

const API_KEY = import.meta.env.VITE_API_KEY as string;
if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Some features may not work.");
  // Return mock data instead of throwing error
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const getFachaScore = async (base64Image: string, mimeType: string, modelMode: AiMode = 'rapido'): Promise<FachaResult> => {
  if (!genAI) {
    console.log("Using mock data - API_KEY not configured");
    return getMockFachaResult();
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: modelMode === 'creativo' ? 1.0 : 0.8,
      }
    });

    // Instrucción especial optimista para Gemini 1.5
    const prompt = `Tu tarea es analizar la 'facha' (estilo, apariencia, actitud) de la persona en la imagen y darle un puntaje del 1 al 10. 

PASO 1: Primero identifica si es hombre o mujer para adaptar el lenguaje.

PASO 2: Sé optimista y generoso con las notas, pero no regales. Busca lo positivo en cada persona. Si alguien tiene buena actitud, estilo interesante, o algo que lo destaque, dale una nota alta (7-9). Solo da notas bajas (1-4) si realmente hay problemas serios de presentación. La mayoría de personas deberían estar entre 6-8.5.

PASO 3: Para el comentario, usa jerga argentina y sé picante pero constructivo. Inspírate en estos ejemplos según el puntaje:

FACHAS BAJAS (1-4):
- "Tenés menos onda que un renglón. Hay que empezar de cero, papá."
- "Che, con esa cara de velorio no levantás ni la tapa del inodoro."
- "Te vestiste a oscuras y con el enemigo, ¿no? No se explica ese rejunte."
- "Tu facha está más devaluada que el peso, pero con un buen estilista capaz que repunta."
- "Le ponés la misma onda que un lunes a la mañana. ¡Despertate, rey!"

FACHAS PROMEDIO (5-7):
- "Zafás, eh. No sos Brad Pitt, pero tenés tu no-sé-qué... que tampoco sé bien qué es."
- "Aprobado, pero con lo justo. Te falta un hervor para detonarla."
- "Tenés potencial, pero todavía estás en modo demo. Actualizate, crack."
- "Vas por buen camino, se nota que le metés ganas. No aflojes que casi la rompés."

FACHAS ALTAS (8-10):
- "Uff, ¿sos real o te escapaste de un póster? Estás para romper corazones en serie."
- "Fa, mi loco, con esa facha hasta tu ex te vuelve a escribir. Estás detonado."
- "Ayyyy loquitaaa, con esa cara de atrevida seguro que coleccionás DNI en la mesita de luz."
- "Nivel de facha: ilegal. Deberías pagar un impuesto por caminar por la calle así."
- "Pará un poco, ¿quién te dio permiso para tanta facha? Dejá algo para los demás, egoísta."
- "Sos la razón por la que se inventaron los emojis de fueguito. 🔥"

Responde en formato JSON con:
- rating: número del 1 al 10 (sé optimista pero justo)
- comment: comentario corto y picante en lunfardo argentino, adaptado al género y puntaje
- fortalezas: array de 3-5 fortalezas (busca lo bueno)
- consejos: array de 3-5 consejos para mejorar (motivadores y constructivos)`;

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
    
    const parsedResult = JSON.parse(text) as FachaResult;
    parsedResult.rating = Math.max(1, Math.min(10, parsedResult.rating));

    return parsedResult;
  } catch (error) {
    console.error("Error getting facha score:", error);
    throw new Error("Failed to get facha score from Gemini API");
  }
};

export const getFachaBattleResult = async (
    image1: { base64: string, mimeType: string },
    image2: { base64: string, mimeType: string },
    modelMode: AiMode = 'rapido'
): Promise<FachaBattleResult> => {
    if (!genAI) {
        console.log("Using mock data - API_KEY not configured");
        return getMockBattleResult();
    }
    
    try {
        // Step 1 & 2: Evaluate each image individually and in parallel for efficiency
        const [result1, result2] = await Promise.all([
            getFachaScore(image1.base64, image1.mimeType, modelMode),
            getFachaScore(image2.base64, image2.mimeType, modelMode)
        ]);

        // Step 3: Determine winner based on higher rating
        const winner: 1 | 2 = result1.rating > result2.rating ? 1 : 2;

        // Step 4: Generate a spicy battle comment using Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: modelMode === 'creativo' ? 1.0 : 0.9,
            }
        });

        const prompt = `Genera un comentario corto y picante en lunfardo argentino sobre esta batalla de facha. Persona 1 sacó ${result1.rating.toFixed(1)} y Persona 2 sacó ${result2.rating.toFixed(1)}. El ganador es la Persona ${winner}.

IMPORTANTE: 
- Primero identifica el género de ambas personas para adaptar el lenguaje
- Sé bardero pero AMISTOSO, no hiriente
- Usa jerga argentina divertida (detonar, papi, minusas, papá, loquita, etc.)
- Haz que el perdedor se ría, no que se sienta mal
- Mantén el tono de joda entre amigos
- Máximo 2-3 oraciones
- Inspírate en estos estilos según la diferencia de puntaje:

DIFERENCIA GRANDE (3+ puntos):
- "Papi, la Persona ${winner} te pasó por arriba como un tren. Pero tranqui, que con esa sonrisa seguro que levantas igual"
- "Che, la Persona ${winner} te dio una paliza épica, pero no te hagas drama que tenés onda para rato"
- "Uy, la Persona ${winner} te dejó en el molde, pero mirá que bien que te ves igual"

DIFERENCIA MEDIA (1-2 puntos):
- "Fue re parejo, pero la Persona ${winner} te ganó por un pelo. Casi casi la rompés, crack"
- "Estuvo picante la cosa, pero la Persona ${winner} te sacó ventaja. No aflojes que estás cerca"
- "Reñido hasta el final, pero la Persona ${winner} se llevó la victoria. Seguí así que vas bien"

DIFERENCIA PEQUEÑA (0.5 puntos):
- "Uff, qué batalla! La Persona ${winner} te ganó por poquito, pero estuviste a la altura"
- "Re parejo todo, pero la Persona ${winner} se llevó el triunfo por detalles. Bien jugado"
- "Casi empate, pero la Persona ${winner} se impuso. La próxima seguro la ganás"

Responde en formato JSON con:
- comment: comentario corto, picante pero amistoso sobre quién ganó la batalla`;

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
            throw new Error("Empty response from Gemini API");
        }
        
        const commentResult = JSON.parse(text) as { comment: string };

        // Step 5: Assemble the final battle result object
        const finalResult: FachaBattleResult = {
            winner,
            comment: commentResult.comment,
            score1: result1.rating,
            score2: result2.rating,
        };

        return finalResult;
    } catch (error) {
        console.error("Error getting facha battle result:", error);
        throw new Error("Failed to get facha battle result from Gemini API");
    }
};

export const getEnhancedFacha = async (base64Image: string, mimeType: string): Promise<FachaEnhanceResult> => {
    if (!genAI) {
        console.log("Using mock data - API_KEY not configured");
        return getMockEnhanceResult();
    }
    
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.9,
            }
        });

        const prompt = `Tu tarea es editar la imagen proporcionada para mejorar la 'facha' de la persona, convirtiéndola en una versión 'gigachad'. Realiza ediciones estéticas excesivas como definir muchisimo la mandíbula, mejorar el pelo, y dar una expresión más confiada, pero manteniendo ligeramente el parecido con la persona original. Tu respuesta DEBE contener DOS partes: 1. La IMAGEN EDITADA. 2. Un TEXTO con un comentario corto, picante, bien pero bien subido de tono y en jerga argentina sobre la transformación. Usa palabras como: Detonar, Papi, Minusas, etc. Ejemplo de comentario, no uses el mismo, solo una idea: "Mirá lo que sos ahora, papá. Dejaste de ser un simple mortal para convertirte en el especimen que todas las minitas quieren detonar. Estás para romper corazones y lo sabés. Andá y detonala toda."`;

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
        return getMockEnhanceResult();

    } catch (error) {
        console.error("Error enhancing facha:", error);
        if (error instanceof Error && (error.message.includes('La IA bloqueó') || error.message.includes('La IA devolvió'))) {
            throw error; // Re-throw specific, user-friendly errors
        }
        throw new Error("La IA se rebeló y no quiso mejorar tu facha. Intentá con otra foto.");
    }
};

// Mock data functions for when API_KEY is not available
const getMockFachaResult = (): FachaResult => {
    const rating = Math.random() * 5 + 5; // Random score between 5-10
    const comment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
    
    return {
        rating,
        comment: `¡Modo DEMO! ${comment} (Configurá tu API key para análisis reales)`,
        fortalezas: ["Tienes potencial", "Buen estilo", "Actitud positiva"],
        consejos: ["Configura tu API key", "Subí una foto real", "Disfrutá la experiencia"]
    };
};

const getMockBattleResult = (): FachaBattleResult => {
    const score1 = Math.random() * 5 + 5;
    const score2 = Math.random() * 5 + 5;
    const winner = score1 > score2 ? 1 : 2;
    const difference = Math.abs(score1 - score2);
    
    let comment = "";
    if (difference >= 3) {
        const comments = MOCK_BATTLE_COMMENTS.slice(0, 3);
        comment = comments[Math.floor(Math.random() * comments.length)].replace('{winner}', winner.toString());
    } else if (difference >= 1) {
        const comments = MOCK_BATTLE_COMMENTS.slice(3, 6);
        comment = comments[Math.floor(Math.random() * comments.length)].replace('{winner}', winner.toString());
    } else {
        const comments = MOCK_BATTLE_COMMENTS.slice(6, 9);
        comment = comments[Math.floor(Math.random() * comments.length)].replace('{winner}', winner.toString());
    }
    
    return {
        winner,
        comment: `¡Modo DEMO! ${comment} (Configurá tu API key para batallas reales)`,
        score1,
        score2
    };
};

const getMockEnhanceResult = (): FachaEnhanceResult => ({
    newImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 transparent pixel
    newImageMimeType: "image/png",
    comment: "¡Modo DEMO! Configurá tu API key para mejoras reales."
});