/**
 * Core type definitions for Wassup
 * These types define the data model for the application
 */

// Subscription plan types
export type PlanType = 'free' | 'pro_weekly' | 'pro_monthly' | 'pro_yearly';

// Subscription status
export interface Subscription {
  planType: PlanType;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  primaryLanguage: string;
  commonViewerLanguages: string[];
  commonRegions: string[];
  createdAt: string;
  updatedAt: string;
  // Subscription fields
  subscription: Subscription;
  decodesUsedToday: number;
  lastDecodeDate: string;
}

// Slang item with detailed information
export interface SlangItem {
  term: string;
  meaning: string;
  region: string;
  notes?: string;
  formalityLevel: 'casual' | 'informal' | 'vulgar' | 'neutral';
}

// Tone tag types
export type ToneType = 
  | 'friendly'
  | 'compliment'
  | 'flirty'
  | 'sexual'
  | 'joke'
  | 'sarcastic'
  | 'rude'
  | 'insult'
  | 'question'
  | 'request'
  | 'neutral'
  | 'confused'
  | 'excited'
  | 'grateful';

// Decoded message structure
export interface DecodedMessage {
  id: string;
  originalText: string;
  detectedLanguage: string;
  region: string;
  plainExplanation: string;
  slangItems: SlangItem[];
  toneTags: ToneType[];
  createdAt: string;
  favorited: boolean;
}

// Decode request parameters
export interface DecodeRequest {
  text: string;
  sourceLang?: string;
  targetLang?: string;
  region?: string;
}

// Decode response from service
export interface DecodeResponse {
  originalText: string;
  detectedLanguage: string;
  region: string;
  plainExplanation: string;
  slangItems: SlangItem[];
  toneTags: ToneType[];
  createdAt: string;
}

// Auth types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile | null;
  error: string | null;
}

// App layout mode
export type LayoutMode = 'full' | 'overlay';

// Service status
export interface ServiceStatus {
  isLoading: boolean;
  error: string | null;
}
