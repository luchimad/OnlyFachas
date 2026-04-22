/**
 * geminiService.ts
 *
 * Orchestrates AI calls through the server-side Netlify Function proxy.
 * The Gemini API key is NEVER sent to the client – only the server has it.
 *
 * This module keeps:
 *   - Mock data logic for dev mode / API fallback
 *   - Analytics tracking hooks
 *   - Dev mode settings (forceScore, useMockData)
 *
 * Real API calls are delegated to apiClient.ts → /.netlify/functions/gemini
 */

import { FachaResult, FachaBattleResult, FachaEnhanceResult, AiMode } from '../types';
import { generateMockFachaResult, generateMockBattleComment, generateMockWinnerExplanation } from '../constants/mockData';
import { apiFachaScore, apiBattleResult, apiEnhanceFacha } from './apiClient';

// ─── Analytics hooks (injected by useAnalytics) ───────────────────────────────

let trackApiUsage: ((isMock: boolean, apiType: 'facha' | 'battle' | 'enhance', score?: number) => void) | null = null;
let trackSuccessfulAnalysis: ((apiType: 'facha' | 'battle' | 'enhance', isMock: boolean, score?: number) => void) | null = null;
let trackFailedAnalysis: ((apiType: 'facha' | 'battle' | 'enhance', errorType: string) => void) | null = null;

export const setAnalyticsTracker = (
  tracker: (isMock: boolean, apiType: 'facha' | 'battle' | 'enhance', score?: number) => void
) => { trackApiUsage = tracker; };

export const setSuccessfulAnalysisTracker = (
  tracker: (apiType: 'facha' | 'battle' | 'enhance', isMock: boolean, score?: number) => void
) => { trackSuccessfulAnalysis = tracker; };

export const setFailedAnalysisTracker = (
  tracker: (apiType: 'facha' | 'battle' | 'enhance', errorType: string) => void
) => { trackFailedAnalysis = tracker; };

// ─── Dev mode settings ────────────────────────────────────────────────────────

let devModeSettings = {
  useMockData: false,
  forceScore: null as number | null,
};

export const setDevModeSettings = (settings: { useMockData: boolean; forceScore: number | null }) => {
  devModeSettings = settings;
};

// ─── Mock result generators ───────────────────────────────────────────────────

const getMockBattleResult = (): FachaBattleResult => {
  const score1 = Math.round((Math.random() * 9 + 1) * 10) / 10;
  const score2 = Math.round((Math.random() * 9 + 1) * 10) / 10;
  const winner: 1 | 2 = score1 > score2 ? 1 : 2;
  return {
    winner,
    comment: generateMockBattleComment(winner),
    score1,
    score2,
    winnerExplanation: generateMockWinnerExplanation(winner),
  };
};

const getMockEnhanceResult = (): FachaEnhanceResult => ({
  newImageBase64: '',
  newImageMimeType: '',
  comment: 'Trabajá el estilo, la actitud y la confianza. Con eso ya vas a estar para detonar.',
  recommendations: [
    'Actualizá tu corte de pelo con algo más moderno que te marque la mandíbula.',
    'Invertí en 2-3 prendas clave de calidad en lugar de muchas prendas baratas.',
    'Cuidá tu piel con una rutina básica: limpiador, hidratante y protector solar.',
    'Mantené una postura correcta: hombros hacia atrás, cabeza en alto, camina con propósito.',
    'Trabajá la confianza: sonríe, contacto visual, y camina como si supieras adonde vas.',
  ],
  gigachadScore: 8,
});

// ─── Exported API functions ───────────────────────────────────────────────────

export const getFachaScore = async (
  base64Image: string,
  mimeType: string,
  modelMode: AiMode = 'rapido'
): Promise<FachaResult> => {
  // Dev: forced score
  if (devModeSettings.forceScore !== null) {
    const mock = generateMockFachaResult();
    const result = { ...mock, rating: devModeSettings.forceScore };
    trackApiUsage?.(true, 'facha', result.rating);
    trackSuccessfulAnalysis?.('facha', true, result.rating);
    return result;
  }

  // Dev: forced mock data
  if (devModeSettings.useMockData) {
    const result = generateMockFachaResult();
    trackApiUsage?.(true, 'facha', result.rating);
    trackSuccessfulAnalysis?.('facha', true, result.rating);
    return result;
  }

  try {
    const result = await apiFachaScore(base64Image, mimeType, modelMode);
    trackApiUsage?.(false, 'facha', result.rating);
    trackSuccessfulAnalysis?.('facha', false, result.rating);
    return result;
  } catch (error: any) {
    trackFailedAnalysis?.('facha', 'api_error');

    // Surface user-friendly errors instead of silently using mock
    const msg: string = error?.message || '';
    if (msg.includes('bloqueó') || msg.includes('inapropiado')) throw error;
    if (msg.includes('Esperá') || msg.includes('Quota') || msg.includes('cuota')) throw error;

    // Generic fallback to mock data
    const mockResult = generateMockFachaResult();
    trackApiUsage?.(true, 'facha', mockResult.rating);
    trackSuccessfulAnalysis?.('facha', true, mockResult.rating);
    return { ...mockResult, isMock: true } as FachaResult;
  }
};

export const getFachaBattleResult = async (
  image1: { base64: string; mimeType: string },
  image2: { base64: string; mimeType: string },
  modelMode: AiMode = 'rapido'
): Promise<FachaBattleResult> => {
  if (devModeSettings.useMockData) {
    const mock = getMockBattleResult();
    trackApiUsage?.(true, 'battle', Math.max(mock.score1, mock.score2));
    trackSuccessfulAnalysis?.('battle', true, Math.max(mock.score1, mock.score2));
    return mock;
  }

  try {
    const result = await apiBattleResult(image1, image2, modelMode);
    trackApiUsage?.(false, 'battle', Math.max(result.score1, result.score2));
    trackSuccessfulAnalysis?.('battle', false, Math.max(result.score1, result.score2));
    return result;
  } catch (error: any) {
    trackFailedAnalysis?.('battle', 'api_error');

    const msg: string = error?.message || '';
    if (msg.includes('bloqueó') || msg.includes('inapropiado')) throw error;
    if (msg.includes('Esperá') || msg.includes('cuota')) throw error;

    const mock = getMockBattleResult();
    trackApiUsage?.(true, 'battle', Math.max(mock.score1, mock.score2));
    trackSuccessfulAnalysis?.('battle', true, Math.max(mock.score1, mock.score2));
    return mock;
  }
};

export const getEnhancedFacha = async (
  base64Image: string,
  mimeType: string
): Promise<FachaEnhanceResult> => {
  if (devModeSettings.useMockData) {
    const mock = getMockEnhanceResult();
    trackApiUsage?.(true, 'enhance');
    trackSuccessfulAnalysis?.('enhance', true);
    return mock;
  }

  try {
    const result = await apiEnhanceFacha(base64Image, mimeType);
    trackApiUsage?.(false, 'enhance');
    trackSuccessfulAnalysis?.('enhance', false);
    return result;
  } catch (error: any) {
    trackFailedAnalysis?.('enhance', 'api_error');

    const msg: string = error?.message || '';
    if (msg.includes('bloqueó') || msg.includes('inapropiado')) throw error;

    const mock = getMockEnhanceResult();
    trackApiUsage?.(true, 'enhance');
    trackSuccessfulAnalysis?.('enhance', true);
    return mock;
  }
};
