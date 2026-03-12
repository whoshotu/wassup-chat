/**
 * Client-Side Decoder Logic
 * Ported from scaffolder-service/generator.js
 * Optimized for frontend execution without backend dependencies.
 */

export interface DecodeResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  toneTags: string[];
  vibeScore: number;
  suggestions: string[];
  status: string;
}

// Lightweight language detection (regex + heuristics)
export function detectLanguage(text: string = "") {
  const t = text.toLowerCase();
  
  // Scripts
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "Japanese";
  if (/[\uac00-\ud7af]/.test(text)) return "Korean";
  if (/[\u4e00-\u9fff]/.test(text)) return "Chinese";
  if (/[\u0600-\u06FF]/.test(text)) return "Arabic";
  if (/[\u0400-\u04FF]/.test(text)) return "Russian";

  // Common words/phrases heuristics
  if (t.includes('hola') || t.includes('gracias') || t.includes('amigo')) return "Spanish";
  if (t.includes('bonjour') || t.includes('merci') || t.includes('coucou')) return "French";
  if (t.includes('hallo') || t.includes('danke') || t.includes('bits')) return "German";
  if (t.includes('ciao') || t.includes('amore') || t.includes('grazie')) return "Italian";
  if (t.includes('olá') || t.includes('oi') || t.includes('gato')) return "Portuguese";
  if (t.includes('apa kabar') || t.includes('terima kasih')) return "Indonesian";
  
  return "English"; // Fallback
}

// Client-side translation fallback (Lite version)
const DICT: Record<string, Record<string, string>> = {
  Spanish: { 'hello': 'hola', 'love': 'amor', 'friend': 'amigo', 'beautiful': 'hermosa', 'thanks': 'gracias' },
  French: { 'hello': 'bonjour', 'love': 'amour', 'friend': 'ami', 'beautiful': 'belle', 'thanks': 'merci' },
  German: { 'hello': 'hallo', 'love': 'liebe', 'friend': 'freund', 'thanks': 'danke' },
  Portuguese: { 'hello': 'olá', 'love': 'amor', 'friend': 'amigo', 'thanks': 'obrigado' },
  Italian: { 'hello': 'ciao', 'love': 'amore', 'friend': 'amico', 'thanks': 'grazie' },
};

export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to) return text;
  
  // In a real client-side scenario, we might call an external API or use a WASM-based translator.
  // For now, we use a robust offline fallback that the user can expand.
  const dict = DICT[from] || DICT[to] || {};
  let translated = text;
  
  for (const [en, local] of Object.entries(dict)) {
    const wordToFind = to === 'English' ? local : en;
    const replacement = to === 'English' ? en : local;
    const re = new RegExp(`\\b${wordToFind}\\b`, 'gi');
    translated = translated.replace(re, replacement);
  }
  
  return translated;
}

export function computeVibeScore(text: string, tones: string[]) {
  let score = 3.0;
  if (text.includes('!')) score += 0.5;
  if (text.includes('?')) score -= 0.2;
  if (tones.includes('flirty') || tones.includes('compliment') || tones.includes('excited')) score += 1.0;
  if (tones.includes('negative')) score -= 1.5;
  return Math.max(0, Math.min(5, score));
}

export function detectTones(text: string): string[] {
  const lower = text.toLowerCase();
  const tones: string[] = [];

  if (lower.includes('?') || lower.includes('how') || lower.includes('what')) tones.push('question');
  if (lower.includes('please') || lower.includes('thanks') || lower.includes('thank you')) tones.push('grateful');
  if (lower.includes('love') || lower.includes('beautiful') || lower.includes('sexy') || lower.includes('hot')) tones.push('compliment');
  if (lower.includes('baby') || lower.includes('sweetie') || lower.includes('honey')) tones.push('flirty');
  if (lower.includes('fuck') || lower.includes('shit') || lower.includes('hate')) tones.push('negative');
  if (lower.includes('wow') || lower.includes('!') || lower.includes('amazing')) tones.push('excited');

  if (tones.length === 0) tones.push('neutral');
  return tones;
}

export async function decodeMessage(text: string, targetLanguage: string = "English"): Promise<DecodeResult> {
  const sourceLanguage = detectLanguage(text);
  const translatedText = await translateText(text, sourceLanguage, targetLanguage);
  const toneTags = detectTones(text);
  const vibeScore = computeVibeScore(text, toneTags);

  const suggestions: string[] = [];
  if (toneTags.includes('question')) suggestions.push('Answer the question clearly.');
  if (toneTags.includes('compliment')) suggestions.push('Say thank you and send a wink.');
  if (toneTags.includes('flirty')) suggestions.push('Play along and keep it light.');
  if (toneTags.includes('negative')) suggestions.push('Politely decline or ignore.');
  if (suggestions.length === 0) suggestions.push('Keep the conversation going!');

  return {
    originalText: text,
    translatedText,
    sourceLanguage,
    targetLanguage,
    toneTags,
    vibeScore,
    suggestions,
    status: 'generated'
  };
}

export default { decodeMessage, detectLanguage, translateText };
