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
  suggestions: { source: string; target: string }[];
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
  if (t.includes('hola') || t.includes('gracias') || t.includes('amigo') || t.includes('por favor') || t.includes('de locos')) return "Spanish";
  if (t.includes('bonjour') || t.includes('merci') || t.includes('coucou') || t.includes('ami') || t.includes('vie') || t.includes('ouf')) return "French";
  if (t.includes('hallo') || t.includes('danke') || t.includes('bitte')) return "German";
  if (t.includes('ciao') || t.includes('amore') || t.includes('grazie') || t.includes('prego')) return "Italian";
  if (t.includes('olá') || t.includes('oi') || t.includes('obrigado') || t.includes('tudo') || t.includes('quero') || t.includes('bom') || t.includes('jeito')) return "Portuguese";
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
  Portuguese: { 
    'hello': 'olá', 'love': 'amor', 'friend': 'amigo', 'thanks': 'obrigado', 'everything': 'tudo',
    'good': 'bom',
    'so': 'tão',
    'way': 'jeito',
    'hurt': 'machucar',
    'you': 'te',
    'want': 'quero',
    'i want to hurt you in such a good way': 'quero te machucar de um jeito tão bom'
  },
  Italian: { 'hello': 'ciao', 'love': 'amore', 'friend': 'amico', 'thanks': 'grazie', 'please': 'prego' },
};

// Pre-compile Regexes for performance
const compiledInternetDict = Object.entries(DICT['Internet']).map(([slang, meaning]) => ({
  regex: new RegExp(`\\b${slang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
  meaning
}));

export async function translateText(text: string, from: string, to: string, customDict: Record<string, string> = {}): Promise<string> {
  if (!text) return text;
  
  let preProcessedText = text;
  
  // 0. Pass: Apply User-Defined Custom CRUD Dictionary
  for (const [slang, translation] of Object.entries(customDict)) {
    const regex = new RegExp(`\\b${slang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    preProcessedText = preProcessedText.replace(regex, translation);
  }
  
  // 1. First Pass: Apply pre-compiled Internet/Slang dictionary (Slang -> Clear English)
  for (const item of compiledInternetDict) {
    preProcessedText = preProcessedText.replace(item.regex, item.meaning);
  }

  try {
    // 2. Second Pass: Global Client-Side Translation via Google API
    const langCodes: Record<string, string> = {
      'Auto-detect': 'auto', 'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
      'Portuguese': 'pt', 'Italian': 'it', 'Japanese': 'ja', 'Korean': 'ko',
      'Hindi': 'hi', 'Indonesian': 'id', 'Vietnamese': 'vi', 'Thai': 'th',
      'Arabic': 'ar', 'Bengali': 'bn', 'Bulgarian': 'bg', 'Chinese': 'zh-CN',
      'Czech': 'cs', 'Danish': 'da', 'Dutch': 'nl', 'Finnish': 'fi', 'Greek': 'el',
      'Hungarian': 'hu', 'Norwegian': 'no', 'Polish': 'pl', 'Romanian': 'ro',
      'Russian': 'ru', 'Slovak': 'sk', 'Swedish': 'sv', 'Turkish': 'tr', 'Ukrainian': 'uk'
    };
    
    const sourceCode = langCodes[from] || 'auto';
    const targetCode = langCodes[to] || 'en';

    // Hybrid Strategy: Use GET for short strings (more reliable), POST for long ones.
    const isLong = preProcessedText.length > 1500;
    const baseUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&dj=1&ie=UTF-8&oe=UTF-8`;
    
    let response;
    if (!isLong) {
      const getUrl = `${baseUrl}&q=${encodeURIComponent(preProcessedText)}`;
      response = await fetch(getUrl);
    } else {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ q: preProcessedText })
      });
    }
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const json = await response.json();
    let finalTranslation = '';
    
    // Handle both standard and dj=1 response formats
    if (json.sentences) {
        json.sentences.forEach((s: any) => { if (s.trans) finalTranslation += s.trans; });
    } else if (json[0]) {
        json[0].forEach((segment: any) => { if (segment[0]) finalTranslation += segment[0]; });
    }

    return finalTranslation || preProcessedText;
  } catch (error) {
    console.error('Client-side translation API failed, falling back to basic dictionary:', error);
    
    // 3. Fallback: Local Dictionary Loop if API fails (offline mode)
    const dicts = [DICT[from], DICT[to]].filter(Boolean);
    let translated = preProcessedText;
    
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

export async function decodeMessage(text: string, targetLanguage: string = "English", customDict: Record<string, string> = {}): Promise<DecodeResult> {
  // Use local detection for tone analysis, but trust Google API for the actual translation path
  const detectedSource = detectLanguage(text);
  const translatedText = await translateText(text, 'Auto-detect', targetLanguage, customDict);
  const toneTags = detectTones(text);
  const vibeScore = computeVibeScore(text, toneTags);

  const baseSuggestions: string[] = [];
  if (toneTags.includes('question')) baseSuggestions.push('That is a great question, let me think about it for a second.');
  if (toneTags.includes('compliment')) baseSuggestions.push('Thank you so much! You are too sweet. 😉');
  if (toneTags.includes('flirty')) baseSuggestions.push('Oh really? Tell me more... 😏');
  if (toneTags.includes('negative')) baseSuggestions.push('I appreciate the feedback, but lets keep it positive here.');
  if (toneTags.includes('positive') || toneTags.includes('excited')) baseSuggestions.push('I love the energy! What is your favorite part so far?');
  if (baseSuggestions.length === 0) {
    if (detectedSource !== targetLanguage) {
      baseSuggestions.push('Thanks for hanging out! Where are you watching from?');
    } else {
      baseSuggestions.push('How is everyone doing today?');
    }
  }

  // Translate suggestions back to source language
  const pairedSuggestions: { source: string; target: string }[] = [];
  for (const suggestion of baseSuggestions) {
    // target represents the user's language (base text is in English, so we translate English -> Target)
    const targetText = targetLanguage !== 'English' ? await translateText(suggestion, 'English', targetLanguage) : suggestion;
    
    // source represents the input language (base text is in English, so we translate English -> Source)
    let sourceText = suggestion;
    if (detectedSource !== 'English') {
      sourceText = await translateText(suggestion, 'English', detectedSource);
    } else if (detectedSource === targetLanguage) {
      sourceText = targetText;
    }
    
    pairedSuggestions.push({ source: sourceText, target: targetText });
  }

  return {
    originalText: text,
    translatedText,
    sourceLanguage: detectedSource,
    targetLanguage,
    toneTags,
    vibeScore,
    suggestions: pairedSuggestions,
    status: 'generated'
  };
}

export default { decodeMessage, detectLanguage, translateText };
