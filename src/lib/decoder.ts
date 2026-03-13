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
  if (t.includes('hola') || t.includes('gracias') || t.includes('amigo') || t.includes('por favor')) return "Spanish";
  if (t.includes('bonjour') || t.includes('merci') || t.includes('coucou') || t.includes('ami') || t.includes('vie')) return "French";
  if (t.includes('hallo') || t.includes('danke') || t.includes('bitte')) return "German";
  if (t.includes('ciao') || t.includes('amore') || t.includes('grazie') || t.includes('prego')) return "Italian";
  if (t.includes('olá') || t.includes('oi') || t.includes('obrigado') || t.includes('tudo bem')) return "Portuguese";
  if (t.includes('apa kabar') || t.includes('terima kasih') || t.includes('halo')) return "Indonesian";
  
  return "English"; // Fallback
}

// Client-side translation fallback (Lite version)
const DICT: Record<string, Record<string, string>> = {
  Spanish: { 
    'hello': 'hola', 'love': 'amor', 'friend': 'amigo', 'beautiful': 'hermosa', 'thanks': 'gracias', 'please': 'por favor', 'how': 'como',
    'de locos': 'insane/amazing',
    'tocho': 'huge/giant',
    'tio': 'guy/dude',
    'guay': 'cool/awesome',
    'chulo': 'cool/nice',
    'pasta': 'money',
    'curro': 'work/job',
    'vale': 'okay/agree',
    'venga': 'come on/let\'s go'
  },
  French: { 
    'hello': 'bonjour', 'love': 'amour', 'friend': 'ami', 'beautiful': 'belle', 'thanks': 'merci', 'life': 'vie', 'this is': "c'est",
    "that's life": "c'est la vie",
    "my friend": "mon ami",
    'ouf': 'crazy/insane',
    'meuf': 'girl/woman',
    'mec': 'guy/man',
    'trop': 'very/really',
    'nickel': 'perfect',
    'boss': 'working/grinding',
    'kiff': 'love/enjoy',
    'grave': 'totally/for real'
  },
  Internet: {
    'no cap': 'for real/honestly',
    'cap': 'lie/fake',
    'rizz': 'charisma/game',
    'skibidi': 'weird/chaotic',
    'gyatt': 'damn (exclamation of surprise)',
    'bussin': 'delicious/amazing',
    'pog': 'awesome/epic',
    'poggers': 'awesome/epic',
    'lfg': 'let\'s freaking go/excited',
    'bet': 'i agree/for sure',
    'finna': 'about to',
    'on god': 'i swear/honestly',
    'fire': 'amazing/cool',
    'lit': 'exciting/great',
    'clutch': 'perfect timing/saving the day',
    'sus': 'suspicious',
    'ratio': 'you got more dislikes than likes',
    'mid': 'average/mediocre',
    'delulu': 'delusional',
    'slay': 'did amazing',
    'w': 'win/great',
    'l': 'loss/bad'
  },
  German: { 'hello': 'hallo', 'love': 'liebe', 'friend': 'freund', 'thanks': 'danke', 'please': 'bitte' },
  Portuguese: { 'hello': 'olá', 'love': 'amor', 'friend': 'amigo', 'thanks': 'obrigado', 'everything': 'tudo' },
  Italian: { 'hello': 'ciao', 'love': 'amore', 'friend': 'amico', 'thanks': 'grazie', 'please': 'prego' },
};

export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to) return text;
  
  // In a real client-side scenario, we might call an external API or use a WASM-based translator.
  // For now, we use a robust offline fallback that the user can expand.
  const dicts = [DICT[from], DICT[to], DICT['Internet']].filter(Boolean);
  let translated = text;
  
  for (const dict of dicts) {
    for (const [en, local] of Object.entries(dict!)) {
      const wordToFind = to === 'English' ? local : en;
      const replacement = to === 'English' ? en : local;
      const re = new RegExp(`\\b${wordToFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      translated = translated.replace(re, replacement);
    }
  }
  
  return translated;
}

export function computeVibeScore(text: string, tones: string[]) {
  let score = 3.0;
  const lower = text.toLowerCase();
  
  if (text.includes('!')) score += 0.5;
  if (text.includes('?')) score -= 0.2;
  
  // Slang weights
  if (lower.includes('lfg') || lower.includes('pog') || lower.includes('fire')) score += 1.0;
  if (lower.includes('no cap') || lower.includes('on god')) score += 0.5;
  if (lower.includes('mid') || lower.includes('sus') || lower.includes('ratio')) score -= 0.8;
  
  if (tones.includes('hype') || tones.includes('excited')) score += 1.0;
  if (tones.includes('flirty') || tones.includes('compliment')) score += 0.5;
  if (tones.includes('negative')) score -= 1.5;
  if (tones.includes('sarcastic')) score -= 0.5;
  
  return Math.max(0, Math.min(5, score));
}

export function detectTones(text: string): string[] {
  const lower = text.toLowerCase();
  const tones: string[] = [];

  // Hype / Excitement
  if (lower.includes('lfg') || lower.includes('pog') || lower.includes('fire') || lower.includes('lit') || lower.includes('wow') || lower.includes('amazing')) tones.push('hype');
  
  // Questions / Confusion
  if (lower.includes('?') || lower.includes('how') || lower.includes('what') || lower.includes('huh') || lower.includes('wait what')) tones.push('question');
  
  // Gratitude / Support
  if (lower.includes('please') || lower.includes('thanks') || lower.includes('thank you') || lower.includes('gg') || lower.includes('nice stream')) tones.push('supportive');
  
  // Flirty / Compliments
  if (lower.includes('love') || lower.includes('beautiful') || lower.includes('sexy') || lower.includes('hot') || lower.includes('baby') || lower.includes('sweetie')) {
     if (lower.includes('baby') || lower.includes('sweetie') || lower.includes('honey')) tones.push('flirty');
     else tones.push('compliment');
  }
  
  // Negative / Aggressive
  if (lower.includes('fuck') || lower.includes('shit') || lower.includes('hate') || lower.includes('bad') || lower.includes('stop')) tones.push('negative');
  
  // Sarcastic (Heuristics)
  if (lower.includes('yeah right') || lower.includes('sure buddy') || lower.includes('okay lol') || lower.includes('nice try')) tones.push('sarcastic');

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
  if (toneTags.includes('positive') || toneTags.includes('excited')) suggestions.push('Keep the energy up! Maybe ask what they like about the stream?');
  if (suggestions.length === 0) {
    if (sourceLanguage !== targetLanguage) {
      suggestions.push(`Acknowledge the message in ${sourceLanguage} if you can!`);
    } else {
      suggestions.push('Ask a follow-up question to keep them engaged.');
    }
  }

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
