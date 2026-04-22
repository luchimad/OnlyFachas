/**
 * apiClient.ts
 *
 * Thin HTTP client that calls the Netlify Function proxy instead of
 * hitting the Gemini API directly. This keeps the API key server-side.
 */

import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';

const FUNCTION_URL = '/.netlify/functions/gemini';

// ─── Error mapping ────────────────────────────────────────────────────────────

const mapServerError = (code: string): string => {
  switch (code) {
    case 'SERVER_API_KEY_INVALID':
      return 'La API key del servidor no es válida. Contactá al desarrollador.';
    case 'QUOTA_EXCEEDED':
      return 'Se agotó la cuota de la API. Probá más tarde.';
    case 'SAFETY_BLOCK':
      return 'La IA bloqueó la imagen por contenido inapropiado. Probá con otra foto.';
    case 'RATE_LIMIT':
      return 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.';
    default:
      return 'Error interno del servidor. Probá de nuevo.';
  }
};

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function callFunction<T>(body: object): Promise<T> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(mapServerError(data.error || 'INTERNAL_ERROR'));
  }

  return data as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const apiFachaScore = (
  base64Image: string,
  mimeType: string,
  modelMode: AiMode = 'rapido'
): Promise<FachaResult> =>
  callFunction<FachaResult>({ action: 'facha', base64Image, mimeType, modelMode });

export const apiBattleResult = (
  image1: { base64: string; mimeType: string },
  image2: { base64: string; mimeType: string },
  modelMode: AiMode = 'rapido'
): Promise<FachaBattleResult> =>
  callFunction<FachaBattleResult>({ action: 'battle', image1, image2, modelMode });

export const apiEnhanceFacha = (
  base64Image: string,
  mimeType: string
): Promise<FachaEnhanceResult> =>
  callFunction<FachaEnhanceResult>({ action: 'enhance', base64Image, mimeType });
