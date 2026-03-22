/**
 * Core type definitions for Wassup Scaffolder
 */

// Slang item with detailed information
export interface SlangItem {
  term: string;
  meaning?: string;
  definition?: string;
  context?: string;
  region?: string;
  notes?: string;
  formalityLevel?: 'casual' | 'informal' | 'vulgar' | 'neutral';
}

// App layout mode
export type LayoutMode = 'full' | 'overlay';

// Service status
export interface ServiceStatus {
  isLoading: boolean;
  error: string | null;
}
