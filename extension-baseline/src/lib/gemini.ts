/**
 * Gemini API Client
 * Uses gemini-1.5-flash for enhanced translation, tone analysis, slang breakdown, and suggestions.
 * Single API call per decode — structured JSON response.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_GEMINI_MODEL } from './geminiModels';

export interface GeminiAnalysis {
  translatedText: string;
  sourceLanguage: string;
  slangTerms: { term: string; meaning: string; context: string }[];
  toneTags: string[];
  suggestedReplies: { source: string; target: string }[];
  vibeScore: number;
}

const MODEL = DEFAULT_GEMINI_MODEL;

const SYSTEM_PROMPT = `You are a chat message analyzer for a content creator app. The creator receives messages from international viewers in multiple languages.

Analyze the message and return ONLY valid JSON with this exact structure:
{
  "translatedText": "Natural translation into the creator's primary language",
  "sourceLanguage": "The actual detected language name, or Unknown when uncertain",
  "slangTerms": [
    { "term": "slang word found", "meaning": "what it means", "context": "cultural or situational context" }
  ],
  "toneTags": ["array of tone labels like: friendly, flirty, excited, negative, supportive, question, neutral, sarcastic, threatening"],
  "suggestedReplies": [
    { "source": "short reply in the viewer's language, ready to paste", "target": "same reply in the creator's primary language" }
  ],
  "vibeScore": 3
}

Rules:
- vibeScore is 0-5 (0=hostile, 1=negative, 2=neutral, 3=positive, 4=enthusiastic, 5=euphoric)
- Detect the language from the whole message. Use script, grammar, and several words together; do not guess from one shared word. Distinguish Spanish from Portuguese and return "Unknown" when evidence is weak.
- Translate the message into the creator's requested primary language, not always English. If it is already in that language, preserve the message.
- suggestedReplies: provide exactly 3 short, distinct, context-aware replies the creator could send back. Keep them casual, warm, and natural for a live creator/viewer chat. Respond to the actual question or compliment when present; avoid generic filler, robotic phrasing, and repeating the same idea. Keep boundaries friendly for hostile or explicit messages.
- For every suggestion, "source" must be in the viewer's detected language and ready to paste; "target" must be the same reply translated into the creator's requested primary language.
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
