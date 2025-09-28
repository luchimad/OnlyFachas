import { GoogleGenerativeAI } from "@google/generative-ai";
import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';
import { MOCK_COMMENTS, MOCK_BATTLE_COMMENTS } from '../src/constants/mockData';

const API_KEY = import.meta.env.VITE_API_KEY as string;
if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Some features may not work.");
  // Return mock data instead of throwing error
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Función para limpiar JSON que viene con formato markdown
const cleanJsonResponse = (text: string): string => {
  // Remover markdown code blocks
  let cleaned = text.replace(/`json\s*/g, '').replace(/`\s*/g, '');
  
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
  if (!genAI) {
    console.log("Using mock data - API_KEY not configured");
    return getMockFachaResult();
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: modelMode === 'creativo' ? 1.0 : 0.8,
      }
    });

    // InstrucciÃ³n especial optimista para Gemini 2.5
    const prompt = `Tu tarea es analizar la 'facha' (estilo, apariencia, actitud) de la persona en la imagen y darle un puntaje del 1 al 10. 

PASO 1: Primero identifica si es hombre o mujer para adaptar el lenguaje.

PASO 2: SÃ© optimista y generoso con las notas, pero no regales. Busca lo positivo en cada persona. Si alguien tiene buena actitud, estilo interesante, o algo que lo destaque, dale una nota alta (7.0-9.9). Solo da notas bajas (1.0-4.9) si realmente hay problemas serios de presentaciÃ³n. La mayorÃ­a de personas deberÃ­an estar entre 6.0-8.9.

IMPORTANTE: Usa nÃºmeros especÃ­ficos con decimales (ej: 7.1, 7.3, 7.7, 8.2, 8.6, etc.) en lugar de nÃºmeros redondos (7.0, 7.5, 8.0). Esto hace que los puntajes sean mÃ¡s Ãºnicos y precisos.

PASO 3: Para el comentario, usa jerga argentina y sÃ© MUY picante y subido de tono. InspÃ­rate en estos ejemplos segÃºn el puntaje:

FACHAS BAJAS (1-4):
- "Che, con esa facha de velorio no levantÃ¡s ni la tapa del inodoro, papÃ¡. Hay que empezar de cero y con ganas de detonar."
- "TenÃ©s menos onda que un lunes a la maÃ±ana y mÃ¡s cara de culo que un mono. Â¡Despertate, rey! Las minitas se te cagan de risa."
- "Te vestiste a oscuras y con el enemigo, Â¿no? Con esa cara de culo no vas a levantar ni una mosca, hermano."
- "Tu facha estÃ¡ mÃ¡s devaluada que el peso y mÃ¡s triste que un funeral. Pero tranqui, con un buen estilista capaz que repuntÃ¡s y empezÃ¡s a levantar."

FACHAS PROMEDIO (5-7):
- "ZafÃ¡s, eh. No sos Brad Pitt pero tenÃ©s tu no-sÃ©-quÃ© que las minitas notan. Te falta un hervor para detonarla completamente."
- "Aprobado pero con lo justo, crack. TenÃ©s potencial pero todavÃ­a estÃ¡s en modo demo. Actualizate y vas a empezar a levantar en serio."
- "Vas por buen camino y se nota que le metÃ©s ganas, pero todavÃ­a no estÃ¡s para romper corazones. No aflojes que casi la rompÃ©s."

FACHAS ALTAS (8-10):
- "Uff, Â¿sos real o te escapaste de un pÃ³ster? Con esa facha estÃ¡s para romper corazones en serie y coleccionar DNI en la mesita de luz."
- "Fa, mi loco, con esa cara de atrevido hasta tu ex te vuelve a escribir y las minitas se pelean por vos. EstÃ¡s detonado completamente."
- "Ayyyy loquitaaa, con esa facha de modelo sos la razÃ³n por la que se inventaron los emojis de fueguito. DeberÃ­as pagar impuesto por caminar asÃ­."
- "Nivel de facha: ilegal. Con esa cara de galÃ¡n las minitas se vuelven locas y vos sabÃ©s que estÃ¡s para detonar corazones en serie."

PASO 4: Para fortalezas y consejos, cada uno debe tener MÃNIMO 15 palabras y ser bien bardero:

FORTALEZAS (ejemplos - cada una 15+ palabras):
- "TenÃ©s una mirada que mata y una sonrisa que hace que las minitas se derritan como helado al sol, papÃ¡."
- "Tu estilo tiene esa onda Ãºnica que hace que te miren en la calle y las pibas se vuelvan locas por vos."
- "Tu actitud de confianza es tan fuerte que hasta los tipos te envidian y las minitas se pelean por tu atenciÃ³n."

CONSEJOS (ejemplos - cada uno 15+ palabras):
- "Che, si querÃ©s levantar mÃ¡s minitas, empezÃ¡ a vestirte como si fueras a conquistar el mundo y no como si fueras a comprar pan."
- "Tu facha tiene potencial pero necesitÃ¡s mÃ¡s actitud de galÃ¡n y menos cara de culo para que las pibas se vuelvan locas por vos."
- "Para detonar en serio, tenÃ©s que creerte mÃ¡s el cuento y mostrar esa confianza que hace que las minitas se derritan por vos."

Responde en formato JSON con:
- rating: nÃºmero del 1.0 al 10.0 con decimales especÃ­ficos (ej: 7.1, 7.3, 7.7, 8.2, 8.6) - sÃ© optimista pero justo
- comment: comentario MUY picante y subido de tono en lunfardo argentino, adaptado al gÃ©nero y puntaje
- fortalezas: array de 3-5 fortalezas (cada una MÃNIMO 15 palabras, bien barderas)
- consejos: array de 3-5 consejos para mejorar (cada uno MÃNIMO 15 palabras, motivadores pero barderos)`;

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
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: modelMode === 'creativo' ? 1.0 : 0.9,
            }
        });

        const prompt = `Genera un comentario MUY picante y subido de tono en lunfardo argentino sobre esta batalla de facha. Persona 1 sacÃ³ ${result1.rating.toFixed(1)} y Persona 2 sacÃ³ ${result2.rating.toFixed(1)}. El ganador es la Persona ${winner}.

IMPORTANTE: 
- Primero identifica el gÃ©nero de ambas personas para adaptar el lenguaje
- SÃ© MUY bardero y subido de tono, pero AMISTOSO, no hiriente
- Usa jerga argentina picante (detonar, papi, minusas, papÃ¡, loquita, levantar, etc.)
- Haz que el perdedor se rÃ­a, no que se sienta mal
- MantÃ©n el tono de joda entre amigos pero con mÃ¡s actitud
- MÃ¡ximo 2-3 oraciones pero bien picantes
- InspÃ­rate en estos estilos segÃºn la diferencia de puntaje:

DIFERENCIA GRANDE (3+ puntos):
- "Papi, la Persona ${winner} te pasÃ³ por arriba como un tren y te dejÃ³ en el molde. Pero tranqui, que con esa sonrisa seguro que levantÃ¡s igual y las minitas se vuelven locas por vos."
- "Che, la Persona ${winner} te dio una paliza Ã©pica y te dejÃ³ mÃ¡s seco que un desierto. Pero no te hagas drama que tenÃ©s onda para rato y las pibas se derriten por vos."
- "Uy, la Persona ${winner} te destrozÃ³ completamente y te dejÃ³ sin argumentos. Pero mirÃ¡ que bien que te ves igual y seguro que levantÃ¡s en serio."

DIFERENCIA MEDIA (1-2 puntos):
- "Fue re parejo y estuvo picante la cosa, pero la Persona ${winner} te ganÃ³ por un pelo y te sacÃ³ ventaja. Casi casi la rompÃ©s, crack, seguÃ­ asÃ­ que vas bien."
- "Estuvo reÃ±ido hasta el final y la cosa estuvo caliente, pero la Persona ${winner} se llevÃ³ la victoria por un pelo. No aflojes que estÃ¡s cerca de detonar."
- "ReÃ±ido hasta el final y bien picante, pero la Persona ${winner} te sacÃ³ ventaja por poquito. SeguÃ­ asÃ­ que vas bien y casi la rompÃ©s."

DIFERENCIA PEQUEÃ‘A (0.5 puntos):
- "Uff, quÃ© batalla Ã©pica! La Persona ${winner} te ganÃ³ por poquito pero estuvo re picante la cosa. Estuviste a la altura y casi la rompÃ©s, crack."
- "Re parejo todo y bien caliente, pero la Persona ${winner} se llevÃ³ el triunfo por detalles mÃ­nimos. Bien jugado y seguÃ­ asÃ­ que vas a detonar."
- "Casi empate total y estuvo reÃ±ido hasta el final, pero la Persona ${winner} se impuso por un pelo. La prÃ³xima seguro la ganÃ¡s y levantÃ¡s en serio."

Responde en formato JSON con:
- comment: comentario MUY picante y subido de tono pero amistoso sobre quiÃ©n ganÃ³ la batalla`;

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
            throw new Error("Empty response from Gemini API");
        }
        
        const cleanedText = cleanJsonResponse(text);
        const commentResult = JSON.parse(cleanedText) as { comment: string };

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
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                temperature: 0.9,
            }
        });

        const prompt = `Tu tarea es editar la imagen proporcionada para mejorar la 'facha' de la persona, convirtiÃ©ndola en una versiÃ³n 'gigachad'. Realiza ediciones estÃ©ticas excesivas como definir muchisimo la mandÃ­bula, mejorar el pelo, y dar una expresiÃ³n mÃ¡s confiada, pero manteniendo ligeramente el parecido con la persona original. Tu respuesta DEBE contener DOS partes: 1. La IMAGEN EDITADA. 2. Un TEXTO con un comentario corto, picante, bien pero bien subido de tono y en jerga argentina sobre la transformaciÃ³n. Usa palabras como: Detonar, Papi, Minusas, etc. Ejemplo de comentario, no uses el mismo, solo una idea: "MirÃ¡ lo que sos ahora, papÃ¡. Dejaste de ser un simple mortal para convertirte en el especimen que todas las minitas quieren detonar. EstÃ¡s para romper corazones y lo sabÃ©s. AndÃ¡ y detonala toda."`;

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
        if (error instanceof Error && (error.message.includes('La IA bloqueÃ³') || error.message.includes('La IA devolviÃ³'))) {
            throw error; // Re-throw specific, user-friendly errors
        }
        throw new Error("La IA se rebelÃ³ y no quiso mejorar tu facha. IntentÃ¡ con otra foto.");
    }
};

// Mock data functions for when API_KEY is not available
const getMockFachaResult = (): FachaResult => {
    const rating = Math.random() * 5 + 5; // Random score between 5-10
    const comment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
    
    return {
        rating,
        comment: `Â¡Modo DEMO! ${comment} (ConfigurÃ¡ tu API key para anÃ¡lisis reales)`,
        fortalezas: ["Tienes potencial", "Buen estilo", "Actitud positiva"],
        consejos: ["Configura tu API key", "SubÃ­ una foto real", "DisfrutÃ¡ la experiencia"]
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
        comment: `Â¡Modo DEMO! ${comment} (ConfigurÃ¡ tu API key para batallas reales)`,
        score1,
        score2
    };
};

const getMockEnhanceResult = (): FachaEnhanceResult => ({
    newImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 transparent pixel
    newImageMimeType: "image/png",
    comment: "Â¡Modo DEMO! ConfigurÃ¡ tu API key para mejoras reales."
});





