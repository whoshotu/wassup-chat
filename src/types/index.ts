/**
 * Core type definitions for Wassup.
 * Decode types live in src/lib/types.ts so the extension can share them.
 */

export type {
  CustomDictionary,
  DecodeResult,
  GeminiAnalysis,
  SlangTerm,
  Suggestion,
} from '../lib/types';

export interface GeminiUsageStats {
  minuteUsed: number;
  minuteLimit: number;
  dayUsed: number;
  dayLimit: number;
}
