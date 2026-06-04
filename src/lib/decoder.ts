/**
 * Client-Side Decoder Logic
 * Optimized for frontend execution without backend dependencies.
 * Optional Gemini AI integration for enhanced analysis.
 */

import { analyzeWithGemini } from './gemini';
import { canUseGemini, recordUsage } from './geminiRateLimit';

export interface DecodeResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  toneTags: string[];
  vibeScore: number;
  suggestions: { source: string; target: string }[];
  status: string;
  safetyWarning?: string;
  slangTerms?: { term: string; meaning: string; context: string }[];
  usedGemini?: boolean;
}

// Content safety detection - flags ONLY illegal activities
// Adult/NSFW content is allowed - this app is for cam models
export function detectSafetyWarnings(text: string, translatedText: string): string | undefined {
  const combined = `${text} ${translatedText}`.toLowerCase();

  // CSAM / Child exploitation (hard no - illegal everywhere)
  // Covers: cp, csam, pedo, grooming, child/kid/teen abuse, Spanish/Portuguese terms
  const csamPatterns = [
    /\b(cp|c\.p|c_p|csam|pedo|paedo|pedofile|jailbait|loli)\b/i,
    /child\s*(porn|sex|exploit|abuse|traffick|nude|video|pic|image|content)/i,
    /kid\s*(porn|sex|exploit|abuse|nude|video|pic|image|content)/i,
    /teen\s*(porn|sex|nude|leak|video|pic|image)/i,
    /\bunder\s*age\b/i,
    /\bpreteen\b/i,
    /\bgroom(ing|er|ed)\b/i,
    /boylove|girllove/i,
    /porno\s*infantil/i,
    /ni[ñn]o\s*(porn|sex|nude|video)/i,
    /ni[ñn]a\s*(porn|sex|nude|video)/i,
    /menor\s*(de\s*edad|porn|sex|nude)/i,
    /pedófilo/i,
    /sell\s*(cp|child|kid|teen|minor|underage)/i,
    /\b(cp|child|kid)\s*(collection|archive|videos?|pics?|images?|content)\b/i,
    /child\s*abuse/i,
    /abuso\s*infantil/i,
    /sexual\s*(abuse|exploit)\s*(of|with)\s*(child|kid|minor|teen)/i,
  ];
  for (const pattern of csamPatterns) {
    if (pattern.test(combined)) {
      return "ILLEGAL CONTENT DETECTED: This message appears to reference child sexual abuse material (CSAM) or child exploitation. This is a serious crime. Do NOT engage with this user. Report immediately to NCMEC CyberTipline (CyberTipline.org) and the platform. Preserve all evidence.";
    }
  }

  // Animal abuse
  const animalPatterns = [
    /animal\s*(abuse|cruelt|hurt|torture|kill)/i,
    /\bbestialit/i,
    /\bzoophile/i,
    /\bzoo\s*sex\b/i,
    /fuck(ing)?\s*(a|the)\s*(dog|cat|horse|animal)/i,
    /dog\s*(sex|fuck)/i,
    /cat\s*(sex|fuck)/i,
    /animal\s*(sex|fuck)/i,
    /\banimal\s*cruelty\b/i,
    /\bpuppy\s*(abuse|torture|hurt|kill)/i,
    /\bkitten\s*(abuse|torture|hurt|kill)/i,
  ];
  for (const pattern of animalPatterns) {
    if (pattern.test(combined)) {
      return "ILLEGAL CONTENT DETECTED: This message appears to reference animal abuse or bestiality, which is a criminal offense. Do NOT engage with this user. Report to local law enforcement and the platform.";
    }
  }

  // Human trafficking / exploitation of minors
  if (/\b(traffick|forced\s*(sex|labor|prostit)|slave|exploit\s*(girl|boy|teen|minor)|sell\s*(girl|boy|teen|minor))\b/i.test(combined)) {
    return "ILLEGAL CONTENT DETECTED: This message appears to reference human trafficking or exploitation, which is a serious crime. Do NOT engage with this user. Report to the National Human Trafficking Hotline (1-888-373-7888) and local law enforcement.";
  }

  // Threats of violence / doxxing (criminal)
  if (/\b(kill\s*you|i.ll\s*kill|murder|death\s*threat|dox|doxx|x\s*(your|ur)\s*address|find\s*(your|ur)\s*(house|address|home|family))\b/i.test(combined)) {
    return "WARNING: This message may contain threats of violence or doxxing, which are criminal offenses. Save this message and report to local law enforcement.";
  }

  return undefined;
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
  if (t.includes('hola') || t.includes('gracias') || t.includes('amigo') || t.includes('por favor') || t.includes('de locos') || t.includes('qué') || t.includes('que ') || t.includes('quiero') || t.includes('tengo') || t.includes('está') || t.includes('como ') || t.includes('tú ') || t.includes('tu ') || t.includes('muy') || t.includes('pero') || t.includes('también') || t.includes('puedo') || t.includes('necesito') || t.includes('quieres') || t.includes('vendes') || t.includes('refieres') || t.includes('tuyos') || t.includes('bonita') || t.includes('hermoso') || t.includes('mi amor') || t.includes('bebé') || t.includes('cariño') || t.includes('español')) return "Spanish";
  if (t.includes('bonjour') || t.includes('merci') || t.includes('coucou') || t.includes('ami') || t.includes('vie') || t.includes('ouf') || t.includes('je ') || t.includes('tu ') || t.includes('toi') || t.includes('nous') || t.includes('ils') || t.includes('elles') || t.includes('peux') || t.includes('être') || t.includes('avoir') || t.includes('faire') || t.includes('très') || t.includes('aussi') || t.includes('mais') || t.includes('avec') || t.includes('pour') || t.includes('dans') || t.includes('cest') || t.includes('c\'est') || t.includes('français')) return "French";
  if (t.includes('hallo') || t.includes('danke') || t.includes('bitte') || t.includes('ich ') || t.includes('du ') || t.includes('nicht') || t.includes('ist ') || t.includes('ein ') || t.includes('eine') || t.includes('und ') || t.includes('aber') || t.includes('auch') || t.includes('kann') || t.includes('wir') || t.includes('haben') || t.includes('werden') || t.includes('deutsch')) return "German";
  if (t.includes('ciao') || t.includes('amore') || t.includes('grazie') || t.includes('prego') || t.includes('sono') || t.includes('sei ') || t.includes('tu ') || t.includes('noi') || t.includes('loro') || t.includes('anche') || t.includes('però') || t.includes('puoi') || t.includes('possiamo') || t.includes('italiano')) return "Italian";
  if (t.includes('olá') || t.includes('oi ') || t.includes('obrigado') || t.includes('tudo') || t.includes('quero') || t.includes('bom ') || t.includes('jeito') || t.includes('você') || t.includes('está') || t.includes('não') || t.includes('também') || t.includes('para') || t.includes('como') || t.includes('porque') || t.includes('português')) return "Portuguese";
  if (t.includes('apa kabar') || t.includes('terima kasih') || t.includes('halo') || t.includes('saya') || t.includes('kamu') || t.includes('ini') || t.includes('itu') || t.includes('dengan') || t.includes('untuk') || t.includes('indonesia')) return "Indonesian";
  
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

export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to) return text;
  
  // 1. First Pass: Apply custom Internet/Slang dictionary (keeps our edge)
  let preProcessedText = text;
  for (const [en, local] of Object.entries(DICT['Internet'])) {
    const regex = new RegExp(`\\b${local.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    preProcessedText = preProcessedText.replace(regex, en);
  }

  try {
    // 2. Second Pass: Global Client-Side Translation via Free API (e.g. Google's public endpoint)
    // Map language names to basic ISO codes
    const langCodes: Record<string, string> = {
      'Auto-detect': 'auto', 'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
      'Portuguese': 'pt', 'Italian': 'it', 'Japanese': 'ja', 'Korean': 'ko',
      'Hindi': 'hi', 'Indonesian': 'id', 'Vietnamese': 'vi', 'Thai': 'th'
    };
    
    // Default to 'auto' if source language not in our list
    const sourceCode = langCodes[from] || 'auto';
    const targetCode = langCodes[to] || 'en';

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(preProcessedText)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation request failed');
    
    const json = await response.json();
    
    // Google Translate returns an array of arrays: json[0] is the translated segments
    let finalTranslation = '';
    if (json && json[0]) {
       json[0].forEach((segment: any) => {
          if (segment[0]) finalTranslation += segment[0];
       });
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

export async function decodeMessage(
  text: string,
  targetLanguage: string = "English",
  geminiApiKey?: string
): Promise<DecodeResult> {
  // Try Gemini AI path if key is provided
  if (geminiApiKey) {
    const { allowed } = canUseGemini();
    if (allowed) {
      try {
        const analysis = await analyzeWithGemini(text, targetLanguage, geminiApiKey);
        recordUsage();
        const safetyWarning = detectSafetyWarnings(text, analysis.translatedText);
        return {
          originalText: text,
          translatedText: analysis.translatedText,
          sourceLanguage: analysis.sourceLanguage,
          targetLanguage,
          toneTags: analysis.toneTags,
          vibeScore: analysis.vibeScore,
          suggestions: analysis.suggestedReplies,
          status: 'generated',
          safetyWarning,
          slangTerms: analysis.slangTerms,
          usedGemini: true,
        };
      } catch (err) {
        console.warn('Gemini failed, falling back to free decoder:', err);
        // Fall through to free flow below
      }
    }
  }

  // Free flow: Google Translate + local analysis
  let sourceLanguage = detectLanguage(text);
  
  // Fallback: if heuristic says English but text has very few English words, use auto-detect
  if (sourceLanguage === "English") {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const englishWords = ['the', 'and', 'you', 'are', 'for', 'that', 'with', 'this', 'have', 'from', 'they', 'been', 'will', 'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like', 'just', 'over', 'such', 'take', 'than', 'them', 'some', 'could', 'other', 'more', 'very', 'also', 'after', 'well', 'only', 'into', 'year', 'your', 'good', 'know', 'want', 'dont', "don't", 'think', 'really', 'should', 'could', 'would'];
    const englishCount = words.filter(w => englishWords.includes(w)).length;
    const englishRatio = words.length > 0 ? englishCount / words.length : 1;
    // If less than 20% of words are common English words, use auto-detect
    if (englishRatio < 0.2 && words.length >= 3) {
      sourceLanguage = "Auto-detect";
    }
  }

  const translatedText = await translateText(text, sourceLanguage, targetLanguage);
  const toneTags = detectTones(text);
  const vibeScore = computeVibeScore(text, toneTags);

  const baseSuggestions: string[] = [];
  if (toneTags.includes('question')) baseSuggestions.push('That is a great question, let me think about it for a second.');
  if (toneTags.includes('compliment')) baseSuggestions.push('Thank you so much! You are too sweet. 😉');
  if (toneTags.includes('flirty')) baseSuggestions.push('Oh really? Tell me more... 😏');
  if (toneTags.includes('negative')) baseSuggestions.push('I appreciate the feedback, but lets keep it positive here.');
  if (toneTags.includes('positive') || toneTags.includes('excited')) baseSuggestions.push('I love the energy! What is your favorite part so far?');
  if (baseSuggestions.length === 0) {
    if (sourceLanguage !== targetLanguage) {
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
    if (sourceLanguage !== 'English' && sourceLanguage !== 'Auto-detect') {
      sourceText = await translateText(suggestion, 'English', sourceLanguage);
    } else if (sourceLanguage === 'Auto-detect') {
      // When auto-detect was used, translate to target language as best effort
      sourceText = targetText;
    } else if (sourceLanguage === targetLanguage) {
      sourceText = targetText;
    }
    
    pairedSuggestions.push({ source: sourceText, target: targetText });
  }

  return {
    originalText: text,
    translatedText,
    sourceLanguage,
    targetLanguage,
    toneTags,
    vibeScore,
    suggestions: pairedSuggestions,
    status: 'generated',
    safetyWarning: detectSafetyWarnings(text, translatedText),
    usedGemini: false,
  };
}

export default { decodeMessage, detectLanguage, translateText };
