export type AiMode = 'rapido' | 'creativo';

export interface FachaResult {
  rating: number;
  comment: string;
  fortalezas: string[];
  consejos: string[];
}

export interface FachaBattleResult {
  winner: 1 | 2;
  comment: string;
  score1: number;
  score2: number;
  winnerExplanation: string[];
}

export interface FachaEnhanceResult {
  newImageBase64: string;
  newImageMimeType: string;
  comment: string;
}

export interface StoredFachaResult extends FachaResult {
  id: string;
  name: string;
  imageSrc: string;
  timestamp: number;
}
