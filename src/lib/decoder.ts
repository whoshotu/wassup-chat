/**
 * Client-Side Decoder Logic
 * Optimized for frontend execution without backend dependencies.
 * Optional Gemini AI integration for enhanced analysis.
 */

import { analyzeWithGemini, paraphraseWithGemini } from './gemini';
import { canUseGemini, canDisambiguate, recordUsage } from './geminiRateLimit';
import { detectAmbiguity, applyLocalDisambiguation } from './idiomHelper';

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
  disambiguated?: boolean;
  disambiguationNote?: string;
}


// Content safety detection - flags ONLY illegal activities
// Adult/NSFW content is allowed - this app is for cam models
export function detectSafetyWarnings(text: string, translatedText: string): string | undefined {
  const combined = `${text} ${translatedText}`.toLowerCase();

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

  if (/\b(traffick|forced\s*(sex|labor|prostit)|slave|exploit\s*(girl|boy|teen|minor)|sell\s*(girl|boy|teen|minor))\b/i.test(combined)) {
    return "ILLEGAL CONTENT DETECTED: This message appears to reference human trafficking or exploitation, which is a serious crime. Do NOT engage with this user. Report to the National Human Trafficking Hotline (1-888-373-7888) and local law enforcement.";
  }

  if (/\b(kill\s*you|i.ll\s*kill|murder|death\s*threat|dox|doxx|x\s*(your|ur)\s*address|find\s*(your|ur)\s*(house|address|home|family))\b/i.test(combined)) {
    return "WARNING: This message may contain threats of violence or doxxing, which are criminal offenses. Save this message and report to local law enforcement.";
  }

  return undefined;
}

// Language detection — script-based first, then exclusive vocabulary per language
// Portuguese checked before Spanish to avoid shared-word false matches
export function detectLanguage(text: string = "") {
  const t = text.toLowerCase();

  // Script-based (unambiguous)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "Japanese";
  if (/[\uac00-\ud7af]/.test(text)) return "Korean";
  if (/[\u4e00-\u9fff]/.test(text)) return "Chinese";
  if (/[\u0600-\u06FF]/.test(text)) return "Arabic";
  if (/[\u0400-\u04FF]/.test(text)) return "Russian";
  if (/[\u0e00-\u0e7f]/.test(text)) return "Thai";
  if (/[\u0900-\u097f]/.test(text)) return "Hindi";

  // Portuguese-exclusive (before Spanish — many shared words)
  if (/\b(você|voce|tudo bem|obrigado|obrigada|tchau|saudade|olá|não\b|também|então|isso|aqui|gente|bom dia|boa tarde|boa noite|arrasou|mano\b)\b/.test(t)) return "Portuguese";

  // Spanish-exclusive
  if (/\b(hola|gracias|amigo|amiga|por favor|quiero|tengo|está|muy|pero|también|puedo|necesito|bonita|hermoso|cariño|buenas|buenos|claro|chico|chica|señor|señora|usted|vosotros|nosotros|chévere|órale|chido)\b/.test(t)) return "Spanish";

  // French-exclusive
  if (/\b(bonjour|merci|coucou|salut|bonsoir|oui\b|être|avoir|faire|très|aussi|mais|avec|dans|c'est|j'ai|je suis|tu es|vous|pourquoi|parce que|trop\b|meuf|mec\b|kiff|grave\b|chelou)\b/.test(t)) return "French";

  // German-exclusive
  if (/\b(hallo|danke|bitte|nicht|ist\b|ein\b|eine|und\b|aber|auch|kann|wir\b|haben|werden|warum|guten|morgen|abend|nacht|schön|krass|geil\b|alter\b|digga)\b/.test(t)) return "German";

  // Italian-exclusive
  if (/\b(ciao|grazie|prego|buongiorno|buonasera|sono\b|sei\b|noi\b|loro|anche|però|puoi|possiamo|perché|quanto|bello|bella|dai\b|boh\b|magari|figurati)\b/.test(t)) return "Italian";

  // Indonesian-exclusive
  if (/\b(apa kabar|terima kasih|saya|kamu|dengan|untuk|selamat|bagaimana|sangat|sudah|belum|bisa|tidak)\b/.test(t)) return "Indonesian";

  // Vietnamese — diacritics + common words
  if (/[àáâãèéêìíòóôõùúýăđơư]/.test(t) && /\b(bạn|tôi|không|được|này|với|cho|của|và|trong)\b/.test(t)) return "Vietnamese";

  return "English";
}

// Client-side translation fallback dictionary
const DICT: Record<string, Record<string, string>> = {
  Spanish: {
    'hello': 'hola', 'love': 'amor', 'friend': 'amigo', 'beautiful': 'hermosa',
    'thanks': 'gracias', 'please': 'por favor',
    'de locos': 'insane/amazing', 'tocho': 'huge/giant', 'tio': 'guy/dude',
    'guay': 'cool/awesome', 'chulo': 'cool/nice', 'pasta': 'money',
    'curro': 'work/job', 'vale': 'okay/agree', 'venga': 'come on/lets go',
    'chévere': 'cool/great', 'buena onda': 'good vibes', 'qué padre': 'how cool',
    'órale': 'alright/lets go', 'chido': 'cool', 'mande': 'excuse me/yes',
  },
  French: {
    'hello': 'bonjour', 'love': 'amour', 'friend': 'ami', 'beautiful': 'belle',
    'thanks': 'merci', "that's life": "c'est la vie", "my friend": "mon ami",
    'ouf': 'crazy/insane', 'meuf': 'girl/woman', 'mec': 'guy/man',
    'trop': 'very/really', 'nickel': 'perfect', 'kiff': 'love/enjoy',
    'grave': 'totally/for real', 'chelou': 'sketchy/weird',
    'carrément': 'absolutely', 'laisse tomber': 'forget it',
    'ça roule': 'all good', 'trop bien': 'so good', 'chanmé': 'awesome',
  },
  Internet: {
    'no cap': 'for real/honestly', 'cap': 'lie/fake', 'rizz': 'charisma/charm',
    'skibidi': 'weird/chaotic', 'gyatt': 'wow', 'bussin': 'amazing/delicious',
    'pog': 'awesome/epic', 'poggers': 'awesome/epic', 'lfg': 'lets go/excited',
    'bet': 'i agree/for sure', 'finna': 'about to', 'on god': 'i swear/honestly',
    'fire': 'amazing/cool', 'lit': 'exciting/great', 'clutch': 'perfect timing',
    'sus': 'suspicious', 'ratio': 'more dislikes than likes', 'mid': 'average/mediocre',
    'delulu': 'delusional', 'slay': 'did amazing', 'w': 'win/great', 'l': 'loss/bad',
    'npc': 'someone acting robotic/clueless', 'based': 'respectable opinion',
    'cringe': 'embarrassing', 'lowkey': 'kind of/secretly', 'highkey': 'very much/openly',
    'hits different': 'feels uniquely special', 'understood the assignment': 'did perfectly',
    'its giving': 'it feels like', 'sending me': 'making me laugh hard',
    'rent free': 'stuck in my head', 'simp': 'overly devoted to someone',
    'goat': 'greatest of all time', 'fr fr': 'for real', 'periodt': 'and thats final',
    'sheesh': 'wow/impressive', 'gg': 'good game/well done', 'hype': 'excited',
    'vibe check': 'checking the mood', 'ate': 'did an amazing job',
    'serving': 'looking amazing', 'mother': 'icon/legend',
    'clout': 'social media fame', 'caught in 4k': 'caught on camera',
    'w rizz': 'very charming', 'no rizz': 'no charm at all',
    'y': 'why', 'u': 'you', 'r': 'are', 'ur': 'your', 'bc': 'because', 'rn': 'right now', 'tbh': 'to be honest', 'imo': 'in my opinion',
  },
  German: {
    'hello': 'hallo', 'love': 'liebe', 'friend': 'freund', 'thanks': 'danke',
    'please': 'bitte', 'krass': 'crazy/intense', 'geil': 'awesome',
    'alter': 'dude/man', 'digga': 'dude (informal)',
  },
  Portuguese: {
    'hello': 'olá', 'love': 'amor', 'friend': 'amigo', 'thanks': 'obrigado',
    'saudade': 'longing/missing someone deeply', 'arrasou': 'you killed it',
    'mano': 'dude/bro', 'cara': 'dude', 'que saudade': 'i missed you so much',
    'boa': 'nice/good job',
  },
  Italian: {
    'hello': 'ciao', 'love': 'amore', 'friend': 'amico', 'thanks': 'grazie',
    'please': 'prego', 'dai': 'come on', 'boh': 'i dont know',
    'magari': 'maybe/i wish', 'figurati': 'dont mention it',
    'mamma mia': 'oh my goodness',
  },
};

export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to) return text;

  // Pre-process internet slang
  let preProcessedText = text;
  for (const [en, local] of Object.entries(DICT['Internet'])) {
    const regex = new RegExp(`\\b${local.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    preProcessedText = preProcessedText.replace(regex, en);
  }

  try {
    const langCodes: Record<string, string> = {
      'Auto-detect': 'auto', 'English': 'en', 'Spanish': 'es', 'French': 'fr',
      'German': 'de', 'Portuguese': 'pt', 'Italian': 'it', 'Japanese': 'ja',
      'Korean': 'ko', 'Chinese': 'zh', 'Arabic': 'ar', 'Russian': 'ru',
      'Hindi': 'hi', 'Indonesian': 'id', 'Vietnamese': 'vi', 'Thai': 'th',
      'Turkish': 'tr', 'Polish': 'pl', 'Dutch': 'nl', 'Swedish': 'sv',
      'Ukrainian': 'uk', 'Romanian': 'ro', 'Greek': 'el', 'Hebrew': 'he',
    };

    const sourceCode = from === 'Auto-detect' ? 'auto' : (langCodes[from] || 'auto');
    const targetCode = langCodes[to] || 'en';

    // MyMemory API — free, no key required, 5000 words/day per IP
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(preProcessedText)}&langpair=${sourceCode}|${targetCode}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error('MyMemory request failed');

    const json = await response.json();
    if (json?.responseStatus === 200 && json?.responseData?.translatedText) {
      const result = json.responseData.translatedText;
      if (result.toUpperCase().includes('PLEASE SELECT')) return preProcessedText;
      return result;
    }
    throw new Error('MyMemory returned no translation');
  } catch (error) {
    console.error('Translation API failed, falling back to dictionary:', error);

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
  if (lower.includes('lfg') || lower.includes('pog') || lower.includes('fire')) score += 1.0;
  if (lower.includes('no cap') || lower.includes('on god')) score += 0.5;
  if (lower.includes('mid') || lower.includes('sus') || lower.includes('ratio')) score -= 0.8;
  if (tones.includes('hype') || tones.includes('excited')) score += 1.0;
  if (tones.includes('flirty') || tones.includes('compliment')) score += 0.5;
  if (tones.includes('negative')) score -= 1.5;
  if (tones.includes('sarcastic')) score -= 0.5;

  return Math.max(0, Math.min(5, score));
}

// Words that signal excitement even when paired with swearing
const HYPE_AMPLIFIERS = [
  'amazing', 'awesome', 'insane', 'incredible', 'unbelievable', 'love',
  'great', 'best', 'goat', 'fire', 'lit', 'pog', 'poggers', 'lfg',
  'sheesh', 'bussin', 'slay', 'ate', 'serving', 'killed it', 'goated',
];

export function detectTones(text: string): string[] {
  const lower = text.toLowerCase();
  const tones: string[] = [];

  // Hype / Excitement
  if (/\b(lfg|pog|poggers|fire|lit|wow|amazing|insane|sheesh|bussin|goat|slay|ate|incredible|unbelievable)\b/.test(lower) || text.includes('!!')) {
    tones.push('hype');
  }

  // Questions
  if (lower.includes('?') || /\b(how|what|when|where|why|who|huh|wait what)\b/.test(lower)) {
    tones.push('question');
  }

  // Gratitude / Support
  if (/\b(please|thanks|thank you|gg|good game|nice stream|appreciate|love your|great stream)\b/.test(lower)) {
    tones.push('supportive');
  }

  // Flirty / Compliments
  if (/\b(love|beautiful|sexy|hot|baby|sweetie|honey|gorgeous|stunning|cutie|handsome)\b/.test(lower)) {
    if (/\b(baby|sweetie|honey|gorgeous|stunning|cutie|my love)\b/.test(lower)) {
      tones.push('flirty');
    } else {
      tones.push('compliment');
    }
  }

  // Negative — only flag if NOT alongside hype amplifiers
  const hasSwear = /\b(fuck|shit|hate|stupid|idiot|terrible|worst|awful|garbage|trash)\b/.test(lower);
  if (hasSwear) {
    const hasHypeContext = HYPE_AMPLIFIERS.some(word => lower.includes(word));
    if (!hasHypeContext) {
      tones.push('negative');
    } else {
      if (!tones.includes('hype')) tones.push('hype');
    }
  }

  // Aggressive (always flag regardless of context)
  if (/\b(hate you|kill|die|shut up|get out|go away|loser|worthless)\b/.test(lower)) {
    if (!tones.includes('negative')) tones.push('negative');
  }

  // Sarcastic
  if (/\b(yeah right|sure buddy|okay lol|nice try|totally|definitely not|obviously)\b/.test(lower)) {
    tones.push('sarcastic');
  }

  // All caps or triple exclamation = excited
  if (text.includes('!!!') || (text === text.toUpperCase() && text.replace(/\s/g, '').length > 3)) {
    if (!tones.includes('hype')) tones.push('excited');
  }

  if (tones.length === 0) tones.push('neutral');
  return [...new Set(tones)];
}

export async function decodeMessage(
  text: string,
  targetLanguage: string = "English",
  geminiApiKey?: string
): Promise<DecodeResult> {
  const original = text;
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
          disambiguated: false,
          disambiguationNote: '',
        };
      } catch (err) {
        console.warn('Gemini failed, falling back to free decoder:', err);
      }
    }
  }

  let sourceLanguage = detectLanguage(text);
  if (sourceLanguage === "English") {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const englishWords = ['the', 'and', 'you', 'are', 'for', 'that', 'with', 'this', 'have', 'from', 'they', 'been', 'will', 'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like', 'just', 'over', 'such', 'take', 'than', 'them', 'some', 'could', 'other', 'more', 'very', 'also', 'after', 'well', 'only', 'into', 'year', 'your', 'good', 'know', 'want', 'dont', "don't", 'think', 'really', 'should'];
    const englishCount = words.filter(w => englishWords.includes(w)).length;
    const englishRatio = words.length > 0 ? englishCount / words.length : 1;
    if (englishRatio < 0.2 && words.length >= 3) {
      sourceLanguage = "Auto-detect";
    }
  }
  
  // ----- Disambiguation step -----
  let disambiguated = false;
  let disambiguationNote = '';
  const { ambiguous, matches } = detectAmbiguity(text, sourceLanguage);
  if (ambiguous) {
    // Try Gemini disambiguation first if key is present and quota allows
    if (geminiApiKey && canDisambiguate().allowed) {
      try {
        const paraphrased = await paraphraseWithGemini(text, geminiApiKey);
        text = paraphrased;
        disambiguated = true;
        disambiguationNote = 'Gemini paraphrase used';
        // Record usage for this Gemini call (separate from analysis call)
        recordUsage();
      } catch (e) {
        console.warn('Gemini disambiguation failed, falling back to local:', e);
      }
    }
    if (!disambiguated) {
      const result = applyLocalDisambiguation(text, matches, sourceLanguage);
      text = result.clarified;
      disambiguated = true;
      disambiguationNote = result.note;
    }
  }

  const translatedText = await translateText(text, sourceLanguage, targetLanguage);
  const toneTags = detectTones(text);
  const vibeScore = computeVibeScore(text, toneTags);

  const baseSuggestions: string[] = [];
  if (toneTags.includes('question')) baseSuggestions.push('That is a great question, let me think about it for a second.');
  if (toneTags.includes('compliment')) baseSuggestions.push('Thank you so much! You are too sweet.');
  if (toneTags.includes('flirty')) baseSuggestions.push('Oh really? Tell me more...');
  if (toneTags.includes('negative')) baseSuggestions.push('I appreciate the feedback, but lets keep it positive here.');
  if (toneTags.includes('hype') || toneTags.includes('excited')) baseSuggestions.push('I love the energy! What is your favorite part so far?');
  if (baseSuggestions.length === 0) {
    baseSuggestions.push(sourceLanguage !== targetLanguage
      ? 'Thanks for hanging out! Where are you watching from?'
      : 'How is everyone doing today?'
    );
  }

  const pairedSuggestions: { source: string; target: string }[] = [];
  for (const suggestion of baseSuggestions) {
    const targetText = targetLanguage !== 'English' ? await translateText(suggestion, 'English', targetLanguage) : suggestion;
    let sourceText = suggestion;
    if (sourceLanguage !== 'English' && sourceLanguage !== 'Auto-detect') {
      sourceText = await translateText(suggestion, 'English', sourceLanguage);
    } else if (sourceLanguage === 'Auto-detect' || sourceLanguage === targetLanguage) {
      sourceText = targetText;
    }
    pairedSuggestions.push({ source: sourceText, target: targetText });
  }

  return {
    originalText: original,
    translatedText,
    sourceLanguage,
    targetLanguage,
    toneTags,
    vibeScore,
    suggestions: pairedSuggestions,
    status: 'generated',
    safetyWarning: detectSafetyWarnings(original, translatedText),
    usedGemini: false,
    disambiguated,
    disambiguationNote,
  };
}

export default { decodeMessage, detectLanguage, translateText };
