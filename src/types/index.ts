/**
 * Core type definitions for Wassup
 */

export interface SlangItem {
  term: string;
  meaning?: string;
  definition?: string;
  context?: string;
  region?: string;
  notes?: string;
  formalityLevel?: 'casual' | 'informal' | 'vulgar' | 'neutral';
}

export type LayoutMode = 'full' | 'overlay';

export interface ServiceStatus {
  isLoading: boolean;
  error: string | null;
}

export interface GeminiUsageStats {
  minuteUsed: number;
  minuteLimit: number;
  dayUsed: number;
  dayLimit: number;
}

export interface GeminiConfig {
  apiKey: string;
  enabled: boolean;
}
