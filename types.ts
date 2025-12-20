
export enum VerdictType {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  MISLEADING = 'MISLEADING',
  UNVERIFIED = 'UNVERIFIED',
  SATIRE = 'SATIRE'
}

export type Language = 
  | 'en' 
  | 'hi' 
  | 'hinglish' 
  | 'bn' // Bengali
  | 'te' // Telugu
  | 'mr' // Marathi
  | 'ta' // Tamil
  | 'ur' // Urdu
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa'; // Punjabi

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface AnalysisResult {
  verdict: VerdictType;
  confidence: number;
  summary: string;
  detailedAnalysis: string;
  keyPoints: string[];
}

export interface FullAnalysisResponse {
  result: AnalysisResult;
  sources: GroundingSource[];
}

export interface AnalysisError {
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface NewsItem {
  title: string;
  snippet: string;
  source: string;
  url: string;
  publishedTime: string;
}