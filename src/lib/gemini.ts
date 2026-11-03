/**
 * Gemini API Client
 * Uses a current free-tier Gemini model for enhanced translation, tone analysis,
 * slang breakdown, and suggestions. Single API call per decode, structured JSON.
 *
 * The model catalogue lives in ./models so the web app and the extension agree.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_GEMINI_MODEL, getFallbackGeminiModel, getFreeGeminiModel } from './models';
import type { GeminiAnalysis } from './types';

const SYSTEM_PROMPT = `You are a chat message analyzer for a content creator app. The creator receives messages from international viewers in multiple languages.

Analyze the message and return ONLY valid JSON with this exact structure:
{
  "translatedText": "Natural translation into the creator's primary language",
  "sourceLanguage": "The detected language name, or Unknown when uncertain",
  "slangTerms": [
    { "term": "slang word found", "meaning": "what it means", "context": "cultural or situational context" }
  ],
  "toneTags": ["array of tone labels like: friendly, flirty, excited, negative, supportive, question, neutral, sarcastic, threatening"],
  "suggestedReplies": [
    { "source": "short reply in the viewer's language, ready to send", "target": "the same reply in the creator's primary language" }
  ],
  "vibeScore": 3
}

Rules:
- vibeScore is 0-5 (0=hostile, 1=negative, 2=neutral, 3=positive, 4=enthusiastic, 5=euphoric)
- Detect language from the whole message using script, grammar, and several words; do not guess from one shared word. Distinguish Spanish from Portuguese and use "Unknown" if evidence is weak.
- Translate into the creator's primary language, not always English. If the message is already in that language, preserve it.
- suggestedReplies: exactly 3 short, distinct, context-aware replies. Keep them casual, warm, and natural for live creator/viewer chat. Respond to the actual question or compliment; avoid generic filler, robotic wording, and repeating the same idea. Keep boundaries friendly for hostile or explicit messages.
- In every suggestion, "source" must be in the viewer's detected language and ready to send; "target" must be the same reply translated into the creator's requested primary language.
- slangTerms: include internet slang, cultural idioms, abbreviations, and regional expressions
- toneTags: be context-aware, not just keyword matching
- If the message contains anything illegal (CSAM, animal abuse, trafficking), return toneTags with "illegal" and vibeScore of 0
- Return ONLY the JSON object, no extra text or markdown
- Do NOT include any explanation outside the JSON`;

const PARAPHRASE_PROMPT =
  'You are an assistant that rewrites messages in clear, neutral English while preserving the original intent. Return ONLY the rewritten sentence, no extra text.';

/** A 404/NOT_FOUND style failure means the model itself is gone; a different model may still work. */
function isModelUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /404|not\s*found|no longer available|unsupported model|is not supported/i.test(message);
}

async function generate(
  apiKey: string,
  modelId: string,
  systemInstruction: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId, systemInstruction });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Run a request against the requested model, retrying once with the other
 * supported free model when the first one is unavailable.
 */
async function generateWithFallback(
  apiKey: string,
  requestedModel: string,
  systemInstruction: string,
  prompt: string
): Promise<string> {
  const primary = getFreeGeminiModel(requestedModel);
  try {
    return await generate(apiKey, primary, systemInstruction, prompt);
  } catch (error) {
    const fallback = getFallbackGeminiModel(primary);
    if (!fallback || !isModelUnavailable(error)) throw error;
    console.warn(`[wassup] ${primary} unavailable, retrying with ${fallback}`);
    return generate(apiKey, fallback, systemInstruction, prompt);
  }
}

export async function paraphraseWithGemini(
  text: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<string> {
  const prompt = `Paraphrase this message in neutral English, preserving meaning:\n"${text}"`;
  const raw = await generateWithFallback(apiKey, model, PARAPHRASE_PROMPT, prompt);
  // Remove any surrounding backticks or markdown fences
  return raw.replace(/^```\s*\n?/i, '').replace(/\n?```$/i, '').trim();
}

export async function analyzeWithGemini(
  text: string,
  targetLanguage: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<GeminiAnalysis> {
  const prompt = `Analyze this chat message. The creator's primary language is ${targetLanguage}.\n\nMessage: "${text}"`;
  const rawText = await generateWithFallback(apiKey, model, SYSTEM_PROMPT, prompt);

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate and normalize the response
  return {
    translatedText: typeof parsed.translatedText === 'string' ? parsed.translatedText : text,
    sourceLanguage: typeof parsed.sourceLanguage === 'string' ? parsed.sourceLanguage : 'Unknown',
    slangTerms: Array.isArray(parsed.slangTerms) ? parsed.slangTerms : [],
    toneTags: Array.isArray(parsed.toneTags) && parsed.toneTags.length > 0 ? parsed.toneTags : ['neutral'],
    suggestedReplies: Array.isArray(parsed.suggestedReplies)
      ? parsed.suggestedReplies.filter((reply: any) => reply && typeof reply.source === 'string' && typeof reply.target === 'string').slice(0, 3)
      : [],
    vibeScore: typeof parsed.vibeScore === 'number' ? Math.max(0, Math.min(5, parsed.vibeScore)) : 3,
  };
}
