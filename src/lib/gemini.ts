/**
 * Gemini API Client
 * Uses gemini-2.0-flash for enhanced translation, tone analysis, slang breakdown, and suggestions.
 * Single API call per decode — structured JSON response.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type DecodeResult } from './decoder';

export interface GeminiAnalysis {
  translatedText: string;
  sourceLanguage: string;
  slangTerms: { term: string; meaning: string; context: string }[];
  toneTags: string[];
  suggestedReplies: { source: string; target: string }[];
  vibeScore: number;
}

const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are a chat message analyzer for a content creator app. The creator receives messages from international viewers in multiple languages.

Analyze the message and return ONLY valid JSON with this exact structure:
{
  "translatedText": "English translation of the message",
  "sourceLanguage": "Detected language name (e.g. Spanish, French, Japanese)",
  "slangTerms": [
    { "term": "slang word found", "meaning": "what it means", "context": "cultural or situational context" }
  ],
  "toneTags": ["array of tone labels like: friendly, flirty, excited, negative, supportive, question, neutral, sarcastic, threatening"],
  "suggestedReplies": [
    { "source": "reply in the viewer's language", "target": "English translation of the reply" }
  ],
  "vibeScore": 3
}

Rules:
- vibeScore is 0-5 (0=hostile, 1=negative, 2=neutral, 3=positive, 4=enthusiastic, 5=euphoric)
- If message is already in English, set sourceLanguage to "English" and translatedText to the original
- suggestedReplies: 2-3 short, natural replies the creator could send back
- slangTerms: include internet slang, cultural idioms, abbreviations, and regional expressions
- toneTags: be context-aware, not just keyword matching
- If the message contains anything illegal (CSAM, animal abuse, trafficking), return toneTags with "illegal" and vibeScore of 0
- Return ONLY the JSON object, no extra text or markdown
- Do NOT include any explanation outside the JSON`;

export async function analyzeWithGemini(
  text: string,
  targetLanguage: string,
  apiKey: string
): Promise<GeminiAnalysis> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = `Analyze this chat message. The creator's primary language is ${targetLanguage}.\n\nMessage: "${text}"`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const rawText = response.text().trim();

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate and normalize the response
  return {
    translatedText: typeof parsed.translatedText === 'string' ? parsed.translatedText : text,
    sourceLanguage: typeof parsed.sourceLanguage === 'string' ? parsed.sourceLanguage : 'Unknown',
    slangTerms: Array.isArray(parsed.slangTerms) ? parsed.slangTerms : [],
    toneTags: Array.isArray(parsed.toneTags) && parsed.toneTags.length > 0 ? parsed.toneTags : ['neutral'],
    suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [],
    vibeScore: typeof parsed.vibeScore === 'number' ? Math.max(0, Math.min(5, parsed.vibeScore)) : 3,
  };
}
