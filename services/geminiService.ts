import { GoogleGenerativeAI } from "@google/generative-ai";
import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';

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

    const prompt = `Tu tarea es analizar la 'facha' (estilo, apariencia, actitud) de la persona en la imagen y darle un puntaje del 1 al 10. Sé muy crítico pero justo. 1 = terrible facha, 10 = facha increíble. También da consejos específicos para mejorar. Usa jerga argentina y sé picante pero constructivo.

Responde en formato JSON con:
- rating: número del 1 al 10
- comment: comentario corto y picante en lunfardo argentino
- fortalezas: array de 3-5 fortalezas
- consejos: array de 3-5 consejos para mejorar`;

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

        const prompt = `Generate a short, spicy comment in Argentine slang about who won this facha battle. Person 1 scored ${result1.rating.toFixed(1)} and Person 2 scored ${result2.rating.toFixed(1)}. The winner is Person ${winner}. Be creative and use words like: detonar, papi, minusas, etc.

Responde en formato JSON con:
- comment: comentario corto y picante sobre quién ganó la batalla`;

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
const getMockFachaResult = (): FachaResult => ({
    rating: Math.random() * 5 + 5, // Random score between 5-10
    comment: "¡Tu facha está en modo DEMO! Configurá tu API key para análisis reales.",
    fortalezas: ["Tienes potencial", "Buen estilo", "Actitud positiva"],
    consejos: ["Configura tu API key", "Subí una foto real", "Disfrutá la experiencia"]
});

const getMockBattleResult = (): FachaBattleResult => ({
    winner: Math.random() > 0.5 ? 1 : 2,
    comment: "¡Batalla DEMO! Configurá tu API key para batallas reales.",
    score1: Math.random() * 5 + 5,
    score2: Math.random() * 5 + 5
});

const getMockEnhanceResult = (): FachaEnhanceResult => ({
    newImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 transparent pixel
    newImageMimeType: "image/png",
    comment: "¡Modo DEMO! Configurá tu API key para mejoras reales."
});