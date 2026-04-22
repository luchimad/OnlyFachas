/**
 * Netlify Function: gemini.ts
 *
 * Server-side proxy for Google Gemini API calls.
 * The API key never reaches the client – only this function has access to it.
 *
 * POST /.netlify/functions/gemini
 * Body: { action: 'facha' | 'battle' | 'enhance', ...params }
 */

import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Types ───────────────────────────────────────────────────────────────────

type AiMode = 'rapido' | 'creativo';
type Action = 'facha' | 'battle' | 'enhance';

interface FachaPayload {
  action: 'facha';
  base64Image: string;
  mimeType: string;
  modelMode?: AiMode;
}

interface BattlePayload {
  action: 'battle';
  image1: { base64: string; mimeType: string };
  image2: { base64: string; mimeType: string };
  modelMode?: AiMode;
}

interface EnhancePayload {
  action: 'enhance';
  base64Image: string;
  mimeType: string;
}

type RequestPayload = FachaPayload | BattlePayload | EnhancePayload;

// ─── Constants ───────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.5-flash-lite';

// Max base64 image size: ~7.5MB decoded → ~10MB raw base64
const MAX_BASE64_BYTES = 10 * 1024 * 1024;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://onlyfachas.fun',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const jsonResponse = (statusCode: number, body: object): HandlerResponse => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

/** Remove markdown code fences that Gemini sometimes wraps around JSON */
const cleanJsonResponse = (text: string): string => {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) cleaned = match[0];
  }
  return cleaned;
};

const validateBase64 = (b64: string): boolean =>
  typeof b64 === 'string' && b64.length > 0 && b64.length < MAX_BASE64_BYTES;

// ─── Gemini handlers ─────────────────────────────────────────────────────────

async function handleFacha(
  genAI: GoogleGenerativeAI,
  payload: FachaPayload
): Promise<object> {
  const { base64Image, mimeType, modelMode = 'rapido' } = payload;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: modelMode === 'creativo' ? 1.0 : 0.8,
    },
  });

  const prompt = `Tu tarea es analizar la 'facha' (estilo, apariencia, actitud) de la persona en la imagen y darle un puntaje del 1 al 10. 

PASO 1: Primero identifica si es hombre o mujer para adaptar el lenguaje y los rangos de facha. IMPORTANTE: Puedes usar "lokitaaa" para ambos géneros, pero adapta otros términos según el género (para mujeres: "reina", "diosa", "piba", etc. Para hombres: "papi", "rey", "crack", etc.).

PASO 2: Sé optimista y generoso con las notas, pero no regales. Busca lo positivo en cada persona. Si alguien tiene buena actitud, estilo interesante, o algo que lo destaque, dale una nota alta (7.0-9.9). Solo da notas bajas (1.0-4.9) si realmente hay problemas serios de presentación. La mayoría de personas deberían estar entre 6.0-8.9.

IMPORTANTE: Usa números específicos con decimales (ej: 7.1, 7.3, 7.7, 8.2, 8.6, etc.) en lugar de números redondos (7.0, 7.5, 8.0). Esto hace que los puntajes sean más únicos y precisos.

PASO 3: Para el comentario, usa jerga argentina y sé MUY picante y subido de tono. IMPORTANTE sobre el uso de palabras:
- "detonar" = levantar/enganchar minusas (BUENO: "estás para re detonar", "vas a detonar")
- "detonado" = estar mal, re mal (MALO: "estás re detonado", "te re detonaron")
- "loquita" = "ay loquitaaaaaa" o "lokitaaaaa" (más expresivo)

PASO 4: Para fortalezas y consejos, cada uno debe tener MÍNIMO 15 palabras y ser bien bardero.

Responde en formato JSON con:
- rating: número del 1.0 al 10.0 con decimales específicos - sé optimista pero justo
- comment: comentario MUY picante y subido de tono en lunfardo argentino, adaptado al género y puntaje
- fortalezas: array de 3-5 fortalezas (cada una MÍNIMO 15 palabras, bien barderas)
- consejos: array de 3-5 consejos para mejorar (cada uno MÍNIMO 15 palabras, motivadores pero barderos)`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);

  const text = result.response.text();
  if (!text) throw new Error('Empty response from Gemini API');

  const parsed = JSON.parse(cleanJsonResponse(text));
  parsed.rating = Math.max(1, Math.min(10, Number(parsed.rating)));
  return parsed;
}

async function handleBattle(
  genAI: GoogleGenerativeAI,
  payload: BattlePayload
): Promise<object> {
  const { image1, image2, modelMode = 'rapido' } = payload;

  // Evaluate both images in parallel
  const [result1, result2] = await Promise.all([
    handleFacha(genAI, { action: 'facha', base64Image: image1.base64, mimeType: image1.mimeType, modelMode }),
    handleFacha(genAI, { action: 'facha', base64Image: image2.base64, mimeType: image2.mimeType, modelMode }),
  ]) as [any, any];

  const winner: 1 | 2 = result1.rating > result2.rating ? 1 : 2;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: modelMode === 'creativo' ? 1.0 : 0.9,
    },
  });

  const diff = Math.abs(result1.rating - result2.rating);
  const diffLabel = diff >= 3 ? 'GRANDE' : diff >= 1 ? 'MEDIA' : 'PEQUEÑA';

  const prompt = `Genera un comentario MUY picante y bardero en lunfardo argentino sobre esta batalla de facha. Persona 1 sacó ${result1.rating.toFixed(1)} y Persona 2 sacó ${result2.rating.toFixed(1)}. El ganador es la Persona ${winner}. Diferencia: ${diffLabel}.

IMPORTANTE:
- Sé MUY bardero, picante y subido de tono, pero AMISTOSO, no hiriente
- Usa jerga argentina picante (detonar, papi, minusas, papá, ay lokitaaa, levantar, etc.)
- "detonar" = levantar/enganchar minusas (BUENO), "detonado" = estar mal (MALO)
- Haz que el perdedor se ría, no que se sienta mal

Responde en formato JSON con:
- comment: comentario MUY picante y bardero pero amistoso sobre quién ganó la batalla (máximo 2-3 oraciones)
- winnerExplanation: array de exactamente 4 frases explicando por qué la Persona ${winner} detona más`;

  const result = await model.generateContent([prompt]);
  const text = result.response.text();
  if (!text) throw new Error('Empty response from Gemini API');

  const commentResult = JSON.parse(cleanJsonResponse(text));

  return {
    winner,
    comment: commentResult.comment,
    score1: result1.rating,
    score2: result2.rating,
    winnerExplanation: commentResult.winnerExplanation || [],
  };
}

async function handleEnhance(
  genAI: GoogleGenerativeAI,
  payload: EnhancePayload
): Promise<object> {
  const { base64Image, mimeType } = payload;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.9,
    },
  });

  const prompt = `Analizá la imagen de esta persona y actuá como un consultor de imagen y estilo de élite que habla en lunfardo argentino bien picante. Tu misión es decirle exactamente qué cambios específicos tiene que hacer para convertirse en un GigaChad de facha.

Responde en formato JSON con:
- comment: un comentario corto, MUY picante y motivador en lunfardo argentino sobre el potencial de la persona (máximo 2 oraciones)
- recommendations: array de exactamente 5 recomendaciones específicas y concretas para mejorar su facha (cada una con MÍNIMO 20 palabras, muy específicas: qué ropa comprar, qué corte de pelo hacerse, qué actitud tener, qué cambios hacer). Sé bardero pero constructivo.
- gigachadScore: puntaje del 1 al 10 de cuánto GigaChad puede llegar a ser si sigue los consejos`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);

  const text = result.response.text();
  if (!text) throw new Error('Empty response from Gemini API');

  const parsed = JSON.parse(cleanJsonResponse(text));
  return {
    comment: parsed.comment || '',
    recommendations: parsed.recommendations || [],
    gigachadScore: Math.max(1, Math.min(10, Number(parsed.gigachadScore) || 8)),
    // Keep backward-compat fields empty
    newImageBase64: '',
    newImageMimeType: '',
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'API key not configured on server' });
  }

  let payload: RequestPayload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { action } = payload;
  if (!['facha', 'battle', 'enhance'].includes(action)) {
    return jsonResponse(400, { error: 'Invalid action' });
  }

  // Validate image data
  if (action === 'facha' || action === 'enhance') {
    const p = payload as FachaPayload | EnhancePayload;
    if (!validateBase64(p.base64Image)) {
      return jsonResponse(400, { error: 'Invalid or missing image data' });
    }
  }
  if (action === 'battle') {
    const p = payload as BattlePayload;
    if (!validateBase64(p.image1.base64) || !validateBase64(p.image2.base64)) {
      return jsonResponse(400, { error: 'Invalid or missing image data' });
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    let result: object;
    switch (action) {
      case 'facha':
        result = await handleFacha(genAI, payload as FachaPayload);
        break;
      case 'battle':
        result = await handleBattle(genAI, payload as BattlePayload);
        break;
      case 'enhance':
        result = await handleEnhance(genAI, payload as EnhancePayload);
        break;
    }

    return jsonResponse(200, result!);
  } catch (error: any) {
    const msg: string = error?.message || 'Unknown error';

    if (msg.includes('API_KEY_INVALID')) {
      return jsonResponse(500, { error: 'SERVER_API_KEY_INVALID' });
    }
    if (msg.includes('QUOTA_EXCEEDED') || msg.includes('RESOURCE_EXHAUSTED')) {
      return jsonResponse(429, { error: 'QUOTA_EXCEEDED' });
    }
    if (msg.includes('SAFETY')) {
      return jsonResponse(422, { error: 'SAFETY_BLOCK' });
    }
    if (msg.includes('RATE_LIMIT')) {
      return jsonResponse(429, { error: 'RATE_LIMIT' });
    }

    console.error('[gemini function] Unhandled error:', msg);
    return jsonResponse(500, { error: 'INTERNAL_ERROR', detail: msg });
  }
};

export { handler };
