
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';

const API_KEY = process.env.API_KEY as string;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Some features may not work.");
  // Return mock data instead of throwing error
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    rating: {
      type: Type.NUMBER,
      description: "Un número del 1 al 10 para medir la facha, con un decimal para más precisión (ej: 8.7). Sin vueltas."
    },
    comment: {
      type: Type.STRING,
      description: "Un comentario corto, picante y con humor argentino (bien subido de tono) sobre la facha del pibe/mina."
    },
    fortalezas: {
        type: Type.ARRAY,
        description: "Una lista corta (2-3 puntos) de las fortalezas de la facha de la persona. Sé directo y canchero.",
        items: { type: Type.STRING }
    },
    consejos: {
        type: Type.ARRAY,
        description: "Una lista corta (2-3 puntos) de consejos barderos para mejorar la facha. Tírale la posta sin filtro.",
        items: { type: Type.STRING }
    }
  },
  required: ["rating", "comment", "fortalezas", "consejos"],
};

const battleCommentSchema = {
    type: Type.OBJECT,
    properties: {
        comment: {
            type: Type.STRING,
            description: "Un comentario bien zarpado y bardero explicando quién ganó y por qué, basándote en los puntajes y análisis provistos. Hacete el picante, como si fueras el jurado de una batalla de gallos pero de facha."
        }
    },
    required: ["comment"],
};


export const getFachaScore = async (base64Image: string, mimeType: string, modelMode: AiMode = 'rapido'): Promise<FachaResult> => {
  if (!ai) {
    console.log("Using mock data - API_KEY not configured");
    return getMockFachaResult();
  }
  
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const creativePromptBonus = modelMode === 'creativo' 
      ? "Dale un toque extra de creatividad, originalidad y zarpá con tu análisis. Que sea memorable." 
      : "";

    const textPart = {
      text: `Actuá como un jurado de facha argentino, un pibe o mina que la tiene re clara con la onda, pero con un humor bien zarpado y picante, al estilo 'el Bananero'. Usá lenguaje de acá, bien canchero y actual (facha, pinta, manija, re piola, god, banco, detonar, cheto, pibe, mina, etc.).
    
    Tu misión es analizar la 'facha' de la persona en la foto en una escala del 1 al 10. 'Facha' es todo: el estilo, la ropa, la actitud, la confianza, el 'flow'. Analizá SOLAMENTE a la persona: su cara, pelo, ropa, actitud, etc. IGNORÁ COMPLETAMENTE el fondo de la foto, no importa si es un baño o el caribe.
    
    El comentario, las fortalezas y los consejos tienen que ser realistas, juveniles y sin filtro. No uses estereotipos básicos. Y de vez en cuando tira uno bien subido de tono.
    
    **REGLA DE ORO INQUEBRANTABLE:** JAMÁS, pero JAMÁS, des un 'consejo' para mejorar algo que listaste como una 'fortaleza'. Por ejemplo, si una fortaleza es "El pelo la rompe", un consejo NO PUEDE ser "Andá a cortarte el pelo". Tu coherencia es clave, si no, quedás como un boludo.
    
    ${creativePromptBonus}

    Para que te des una idea del tono, acá te tiro unos ejemplos, usalos asi como estan y ademas crea unos nuevos en ese mismo estilo:
    - "Tenés cara de que recién te levantás y ya estás fachero, alto privilegio."
    - "Con esa facha detonás seguro, olvidate."
    - "Te hacés el que no le importa, pero la facha te vende solo."
    - "Tenés menos facha que empanada de polenta, pero la actitud suma, papá."
    - "Ayyyy loquitaaa, te hacés la misteriosa pero tenés pinta de que le pedís plata a tu abuela para el telo."
    - "Fa mi loco, con esa cara hasta la suegra te manda nudes."
    
    Si el puntaje es de 7 para arriba, podés tirar comentarios más sucios y zarpados como los últimos ejemplos. Si el puntaje es más bajo, sé igual de bardero pero apuntando a lo que le falta. La idea es que sea gracioso y sin pelos en la lengua.
    
    Si en la foto no se ve una persona o está toda borrosa, clavale un puntaje bajo y explicá por qué, en plan 'che, no se ve nada, imposible medir la facha así'.
    
    Devolvé tu respuesta SIEMPRE en el formato JSON que te pido, sin excepción.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: modelMode === 'creativo' ? 1.0 : 0.8,
        }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("Empty response from Gemini API");
    }
    const parsedResult = JSON.parse(jsonText) as FachaResult;
    
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
    if (!ai) {
        console.log("Using mock data - API_KEY not configured");
        return getMockBattleResult();
    }
    
    try {
        // Step 1 & 2: Evaluate each image individually and in parallel for efficiency
        const [result1, result2] = await Promise.all([
            getFachaScore(image1.base64, image1.mimeType, modelMode),
            getFachaScore(image2.base64, image2.mimeType, modelMode)
        ]);

        // Step 3: Determine the winner based on the individual scores
        const winner: 1 | 2 = result1.rating >= result2.rating ? 1 : 2;
        
        const creativePromptBonus = modelMode === 'creativo' 
          ? "Zarpate con el comentario, que sea una obra de arte del bardaje." 
          : "";

        // Step 4: Generate a final, comparative comment based on the results
        const commentPrompt = {
            text: `Sos el juez supremo de la facha y acabas de presenciar una batalla épica. Ya tenés los resultados, ahora te toca dar el veredicto final con tu estilo característico: picante, sin filtro y con humor argentino bien bardero.

            Aquí están los datos:
            - **Contendiente 1:**
              - Puntaje: ${result1.rating.toFixed(1)}
              - Puntos Fuertes: ${result1.fortalezas.join('; ')}
              - Para Mejorar: ${result1.consejos.join('; ')}
            - **Contendiente 2:**
              - Puntaje: ${result2.rating.toFixed(1)}
              - Puntos Fuertes: ${result2.fortalezas.join('; ')}
              - Para Mejorar: ${result2.consejos.join('; ')}

            **El Ganador es: Contendiente ${winner}**

            Tu misión es escribir UN ÚNICO comentario final. Compará a los dos, explicá por qué ganó el que ganó, y bardea un poco al perdedor (con cariño, o no). Que sea memorable. ${creativePromptBonus} No repitas los puntajes en el comentario, enfocate en el porqué.
            
            Devolvé tu respuesta en el formato JSON que te pido, solo con el comentario.`,
        };
        
        // Also provide the images for visual context for the final comment generation
        const imagePart1 = { inlineData: { data: image1.base64, mimeType: image1.mimeType } };
        const imagePart2 = { inlineData: { data: image2.base64, mimeType: image2.mimeType } };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [commentPrompt, imagePart1, imagePart2] },
            config: {
                responseMimeType: "application/json",
                responseSchema: battleCommentSchema,
                temperature: modelMode === 'creativo' ? 1.0 : 0.9,
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("Empty response from Gemini API");
        }
        const commentResult = JSON.parse(jsonText) as { comment: string };

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
    if (!ai) {
        console.log("Using mock data - API_KEY not configured");
        return getMockEnhanceResult();
    }
    
    try {
        const imagePart = { inlineData: { data: base64Image, mimeType: mimeType } };
        const textPart = {
            text: `Tu tarea es editar la imagen proporcionada para mejorar la 'facha' de la persona, convirtiéndola en una versión 'gigachad'. Realiza ediciones estéticas excesivas como definir muchisimo la mandíbula, mejorar el pelo, y dar una expresión más confiada, pero manteniendo ligeramente el parecido con la persona original. Tu respuesta DEBE contener DOS partes: 1. La IMAGEN EDITADA. 2. Un TEXTO con un comentario corto, picante, bien pero bien subido de tono y en jerga argentina sobre la transformación. Usa palabras como: Detonar, Papi, Minusas, etc. Ejemplo de comentario, no uses el mismo, solo una idea: "Mirá lo que sos ahora, papá. Dejaste de ser un simple mortal para convertirte en el especimen que todas las minitas quieren detonar. Estás para romper corazones y lo sabés. Andá y detonala toda."`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts) {
            console.error("Invalid response structure from Gemini API:", JSON.stringify(response, null, 2));
            if (response.promptFeedback?.blockReason) {
                 throw new Error(`La IA bloqueó el pedido por seguridad (${response.promptFeedback.blockReason}). Probá con otra foto.`);
            }
            throw new Error("La IA devolvió una respuesta vacía. No se pudo tunear la facha.");
        }

        let newImageBase64: string | null = null;
        let newImageMimeType: string | null = null;
        let comment: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
                newImageBase64 = part.inlineData.data;
                newImageMimeType = part.inlineData.mimeType;
            } else if (part.text) {
                comment = part.text;
            }
        }

        if (!newImageBase64 || !newImageMimeType || !comment) {
            console.error("Incomplete parts in Gemini response:", JSON.stringify(response.candidates[0].content.parts, null, 2));
            throw new Error("La IA no pudo procesar la imagen o generar un comentario. ¡Tu facha original es demasiado poderosa!");
        }

        return { newImageBase64, newImageMimeType, comment };

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
