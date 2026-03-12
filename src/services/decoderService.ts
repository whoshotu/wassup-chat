/**
 * Decoder Service
 * Client-side message decoding and translation service
 * Abstracted to allow plugging in real APIs (OpenAI, DeepL, Google Translate, etc.)
 */

import type { DecodeRequest, DecodeResponse, SlangItem, ToneType } from '@/types';

// Simulated network delay
const simulateDelay = (ms: number = 600) => 
  new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400));

// Comprehensive slang database by language
const slangDatabase: Record<string, SlangItem[]> = {
  Spanish: [
    { term: 'bb', meaning: 'Baby/babe', region: 'Latin America', formalityLevel: 'casual', notes: 'Common term of endearment' },
    { term: 'hermosa', meaning: 'Beautiful', region: 'General', formalityLevel: 'casual', notes: 'Romantic compliment' },
    { term: 'papi', meaning: 'Daddy (flirty)', region: 'Latin America', formalityLevel: 'informal', notes: 'Flirtatious, can be playful or sexual' },
    { term: 'mami', meaning: 'Mommy (flirty)', region: 'Latin America', formalityLevel: 'informal', notes: 'Flirtatious term for attractive woman' },
    { term: 'guapa', meaning: 'Hot/pretty', region: 'Spain', formalityLevel: 'casual', notes: 'Common compliment' },
    { term: 'chula', meaning: 'Cute/pretty', region: 'Mexico', formalityLevel: 'casual', notes: 'Affectionate compliment' },
    { term: 'te quiero', meaning: 'I love you (casual)', region: 'General', formalityLevel: 'casual', notes: 'Less intense than te amo' },
    { term: 'rica', meaning: 'Hot/delicious', region: 'Latin America', formalityLevel: 'informal', notes: 'Can be sexual' },
    { term: 'nena', meaning: 'Babe/girl', region: 'General', formalityLevel: 'casual', notes: 'Affectionate term' },
    { term: 'que linda', meaning: 'How pretty', region: 'General', formalityLevel: 'casual', notes: 'Compliment' },
  ],
  French: [
    { term: 'bb', meaning: 'Bébé (baby)', region: 'France', formalityLevel: 'casual', notes: 'Term of endearment' },
    { term: 'ma belle', meaning: 'My beautiful', region: 'France', formalityLevel: 'casual', notes: 'Romantic compliment' },
    { term: 'coucou', meaning: 'Hey/hi', region: 'France', formalityLevel: 'casual', notes: 'Friendly greeting' },
    { term: 'bisous', meaning: 'Kisses', region: 'France', formalityLevel: 'casual', notes: 'Affectionate sign-off' },
    { term: 'ma chérie', meaning: 'My darling', region: 'France', formalityLevel: 'casual', notes: 'Term of endearment' },
    { term: 'canon', meaning: 'Hot/gorgeous', region: 'France', formalityLevel: 'informal', notes: 'Slang for attractive' },
    { term: 'mdr', meaning: 'LOL (mort de rire)', region: 'France', formalityLevel: 'casual', notes: 'Laughing' },
  ],
  German: [
    { term: 'süße', meaning: 'Sweetie', region: 'Germany', formalityLevel: 'casual', notes: 'Term of endearment' },
    { term: 'schatz', meaning: 'Treasure/darling', region: 'Germany', formalityLevel: 'casual', notes: 'Affectionate term' },
    { term: 'hübsch', meaning: 'Pretty', region: 'Germany', formalityLevel: 'casual', notes: 'Compliment' },
    { term: 'geil', meaning: 'Cool/hot', region: 'Germany', formalityLevel: 'informal', notes: 'Can be sexual in context' },
    { term: 'hallo schöne', meaning: 'Hello beautiful', region: 'Germany', formalityLevel: 'casual', notes: 'Greeting compliment' },
  ],
  Portuguese: [
    { term: 'gata', meaning: 'Hot girl/babe', region: 'Brazil', formalityLevel: 'informal', notes: 'Flirtatious compliment' },
    { term: 'linda', meaning: 'Beautiful', region: 'General', formalityLevel: 'casual', notes: 'Common compliment' },
    { term: 'amor', meaning: 'Love', region: 'General', formalityLevel: 'casual', notes: 'Term of endearment' },
    { term: 'gostosa', meaning: 'Hot/sexy', region: 'Brazil', formalityLevel: 'vulgar', notes: 'Sexual compliment' },
    { term: 'delícia', meaning: 'Delicious/hot', region: 'Brazil', formalityLevel: 'informal', notes: 'Flirtatious' },
    { term: 'gatinha', meaning: 'Kitten/cutie', region: 'Brazil', formalityLevel: 'casual', notes: 'Affectionate' },
    { term: 'oi bb', meaning: 'Hi baby', region: 'Brazil', formalityLevel: 'casual', notes: 'Casual greeting' },
  ],
  Italian: [
    { term: 'bella', meaning: 'Beautiful', region: 'Italy', formalityLevel: 'casual', notes: 'Common compliment' },
    { term: 'ciao bella', meaning: 'Hi beautiful', region: 'Italy', formalityLevel: 'casual', notes: 'Friendly/flirty greeting' },
    { term: 'amore', meaning: 'Love', region: 'Italy', formalityLevel: 'casual', notes: 'Term of endearment' },
    { term: 'tesoro', meaning: 'Treasure/darling', region: 'Italy', formalityLevel: 'casual', notes: 'Affectionate' },
    { term: 'sei bellissima', meaning: 'You are gorgeous', region: 'Italy', formalityLevel: 'casual', notes: 'Strong compliment' },
  ],
  Japanese: [
    { term: 'かわいい', meaning: 'Cute (kawaii)', region: 'Japan', formalityLevel: 'casual', notes: 'Common compliment' },
    { term: 'すごい', meaning: 'Amazing (sugoi)', region: 'Japan', formalityLevel: 'casual', notes: 'Expression of admiration' },
    { term: '綺麗', meaning: 'Beautiful (kirei)', region: 'Japan', formalityLevel: 'casual', notes: 'Compliment' },
    { term: 'www', meaning: 'LOL', region: 'Japan', formalityLevel: 'casual', notes: 'Laughing (warai)' },
    { term: '好き', meaning: 'I like you (suki)', region: 'Japan', formalityLevel: 'casual', notes: 'Expression of affection' },
  ],
  Korean: [
    { term: '예쁘다', meaning: 'Pretty (yeppeuda)', region: 'South Korea', formalityLevel: 'casual', notes: 'Compliment' },
    { term: '사랑해', meaning: 'I love you (saranghae)', region: 'South Korea', formalityLevel: 'casual', notes: 'Expression of love' },
    { term: '대박', meaning: 'Amazing (daebak)', region: 'South Korea', formalityLevel: 'casual', notes: 'Excitement' },
    { term: 'ㅋㅋㅋ', meaning: 'LOL', region: 'South Korea', formalityLevel: 'casual', notes: 'Laughing' },
    { term: '누나', meaning: 'Older sister (noona)', region: 'South Korea', formalityLevel: 'casual', notes: 'Term of respect/affection' },
  ],
  Russian: [
    { term: 'красивая', meaning: 'Beautiful (krasivaya)', region: 'Russia', formalityLevel: 'casual', notes: 'Compliment' },
    { term: 'привет', meaning: 'Hi (privet)', region: 'Russia', formalityLevel: 'casual', notes: 'Casual greeting' },
    { term: 'милая', meaning: 'Sweet/cute (milaya)', region: 'Russia', formalityLevel: 'casual', notes: 'Affectionate' },
    { term: 'солнышко', meaning: 'Sunshine', region: 'Russia', formalityLevel: 'casual', notes: 'Term of endearment' },
  ],
  English: [
    { term: 'bb', meaning: 'Baby', region: 'Internet', formalityLevel: 'casual', notes: 'Common abbreviation' },
    { term: 'bae', meaning: 'Babe/significant other', region: 'Internet', formalityLevel: 'casual', notes: 'Term of endearment' },
    { term: 'lol', meaning: 'Laughing out loud', region: 'Internet', formalityLevel: 'casual', notes: 'Amusement' },
    { term: 'ngl', meaning: 'Not gonna lie', region: 'Internet', formalityLevel: 'casual', notes: 'Honesty marker' },
    { term: 'tbh', meaning: 'To be honest', region: 'Internet', formalityLevel: 'casual', notes: 'Honesty marker' },
    { term: 'lowkey', meaning: 'Secretly/somewhat', region: 'Internet', formalityLevel: 'casual', notes: 'Modifier' },
    { term: 'highkey', meaning: 'Obviously/very much', region: 'Internet', formalityLevel: 'casual', notes: 'Modifier' },
    { term: 'simp', meaning: 'Someone overly devoted', region: 'Internet', formalityLevel: 'informal', notes: 'Can be teasing' },
    { term: 'fire', meaning: 'Amazing/hot', region: 'Internet', formalityLevel: 'casual', notes: 'Compliment' },
    { term: 'goat', meaning: 'Greatest of all time', region: 'Internet', formalityLevel: 'casual', notes: 'High praise' },
  ],
};

// Tone detection patterns
const tonePatterns: { pattern: RegExp | string[]; tone: ToneType; weight: number }[] = [
  // Positive/Friendly
  { pattern: ['beautiful', 'gorgeous', 'amazing', 'love', 'hermosa', 'linda', 'bella', 'kawaii', '❤️', '😍', '🥰', '💕'], tone: 'compliment', weight: 2 },
  { pattern: ['hi', 'hello', 'hey', 'hola', 'coucou', 'привет', 'ciao', 'oi'], tone: 'friendly', weight: 1 },
  { pattern: ['thank', 'gracias', 'merci', 'danke', 'obrigado', 'arigatou'], tone: 'grateful', weight: 2 },
  
  // Flirty/Sexual
  { pattern: ['sexy', 'hot', 'bb', 'baby', 'babe', 'papi', 'mami', 'gostosa', '😘', '😏', '🔥', '💋'], tone: 'flirty', weight: 2 },
  { pattern: ['show', 'naked', 'nude', 'private', 'pvt', 'c2c', 'cam2cam'], tone: 'sexual', weight: 3 },
  
  // Questions/Requests
  { pattern: ['?', 'how', 'what', 'where', 'when', 'why', 'can you', 'could you', 'would you'], tone: 'question', weight: 1 },
  { pattern: ['please', 'can i', 'want', 'need', 'give me', 'show me'], tone: 'request', weight: 2 },
  
  // Humor
  { pattern: ['lol', 'haha', 'lmao', 'rofl', '😂', '🤣', 'jk', 'joke', 'mdr', 'www', 'ㅋㅋ'], tone: 'joke', weight: 2 },
  { pattern: ['sure', 'right', 'yeah right', 'obviously', '/s'], tone: 'sarcastic', weight: 1 },
  
  // Negative
  { pattern: ['ugly', 'stupid', 'dumb', 'hate', 'worst', 'terrible', 'fake'], tone: 'rude', weight: 3 },
  { pattern: ['fuck', 'bitch', 'whore', 'slut', 'idiot', 'loser'], tone: 'insult', weight: 4 },
  
  // Excitement
  { pattern: ['omg', 'wow', 'amazing', 'incredible', '!!!', '🎉', '🤩', 'daebak', 'sugoi'], tone: 'excited', weight: 2 },
];

// Language detection based on character patterns
function detectLanguageFromText(text: string): { language: string; region: string } {
  // Japanese (Hiragana, Katakana)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return { language: 'Japanese', region: 'Japan' };
  }
  // Korean (Hangul)
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
    return { language: 'Korean', region: 'South Korea' };
  }
  // Chinese (CJK without Japanese)
  if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return { language: 'Chinese', region: 'China' };
  }
  // Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(text)) {
    return { language: 'Russian', region: 'Russia' };
  }
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) {
    return { language: 'Arabic', region: 'Middle East' };
  }
  // Spanish indicators
  if (/[áéíóúñ¿¡]/.test(text) || /\b(hola|hermosa|guapa|papi|mami|amor)\b/i.test(text)) {
    return { language: 'Spanish', region: 'Latin America' };
  }
  // French indicators
  if (/[àâçèéêëîïôùûüœæ]/.test(text) || /\b(coucou|bisous|belle|chérie)\b/i.test(text)) {
    return { language: 'French', region: 'France' };
  }
  // German indicators
  if (/[äöüß]/.test(text) || /\b(schatz|süße|hübsch|geil)\b/i.test(text)) {
    return { language: 'German', region: 'Germany' };
  }
  // Portuguese indicators
  if (/[ãõâêô]/.test(text) || /\b(gata|linda|gostosa|delícia)\b/i.test(text)) {
    return { language: 'Portuguese', region: 'Brazil' };
  }
  // Italian indicators
  if (/\b(ciao|bella|amore|tesoro|bellissima)\b/i.test(text)) {
    return { language: 'Italian', region: 'Italy' };
  }

  return { language: 'English', region: 'General' };
}

// Detect tones in message
function detectTones(text: string): ToneType[] {
  const lowerText = text.toLowerCase();
  const detectedTones: Map<ToneType, number> = new Map();

  for (const { pattern, tone, weight } of tonePatterns) {
    let matched = false;
    
    if (Array.isArray(pattern)) {
      matched = pattern.some(p => lowerText.includes(p.toLowerCase()));
    } else {
      matched = pattern.test(lowerText);
    }
    
    if (matched) {
      const currentWeight = detectedTones.get(tone) || 0;
      detectedTones.set(tone, currentWeight + weight);
    }
  }

  // Sort by weight and return top tones
  const sortedTones = Array.from(detectedTones.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tone]) => tone);

  // Return at least 'neutral' if no tones detected
  return sortedTones.length > 0 ? sortedTones.slice(0, 4) : ['neutral'];
}

// Detect slang in message
function detectSlang(text: string, language: string): SlangItem[] {
  const lowerText = text.toLowerCase();
  const detected: SlangItem[] = [];
  
  // Check language-specific slang
  const languageSlang = slangDatabase[language] || [];
  for (const slang of languageSlang) {
    const termLower = slang.term.toLowerCase().split(' ')[0];
    if (lowerText.includes(termLower)) {
      detected.push(slang);
    }
  }
  
  // Also check English internet slang for all messages
  if (language !== 'English') {
    const englishSlang = slangDatabase['English'] || [];
    for (const slang of englishSlang) {
      const termLower = slang.term.toLowerCase();
      if (lowerText.includes(termLower) && !detected.some(d => d.term === slang.term)) {
        detected.push(slang);
      }
    }
  }
  
  return detected;
}

// Translation dictionary for common phrases
const translationDictionary: Record<string, Record<string, string>> = {
  Spanish: {
    'hola': 'hello',
    'hermosa': 'beautiful',
    'linda': 'pretty/beautiful',
    'guapa': 'hot/pretty',
    'papi': 'daddy (flirty)',
    'mami': 'mommy (flirty)',
    'amor': 'love',
    'te quiero': 'I love you (casual)',
    'te amo': 'I love you (deep)',
    'bb': 'baby',
    'nena': 'babe/girl',
    'rica': 'hot/delicious',
    'chula': 'cute/pretty',
    'que linda': 'how pretty',
    'eres': 'you are',
    'muy': 'very',
    'bonita': 'pretty',
    'eres bonita': 'you are pretty',
    'eres muy bonita': 'you are very pretty',
    'como estas': 'how are you',
    'bien': 'good',
    'gracias': 'thank you',
    'por favor': 'please',
    'quiero': 'I want',
    'ver': 'to see',
    'mas': 'more',
    'hoy': 'today',
    'ahora': 'now',
    // translations for common phrases retained from earlier entries
    'preciosa': 'gorgeous',
  },
  French: {
    'coucou': 'hey',
    'salut': 'hi',
    'bonjour': 'hello',
    'ma belle': 'my beautiful',
    'ma chérie': 'my darling',
    'bisous': 'kisses',
    'bb': 'baby',
    'canon': 'gorgeous',
    'mdr': 'LOL',
    'je t\'aime': 'I love you',
    'tu es': 'you are',
    'tu es belle': 'you are beautiful',
    'tu es très belle': 'you are very beautiful',
    'très': 'very',
    'belle': 'beautiful',
    'jolie': 'pretty',
    'comment ça va': 'how are you',
    'bien': 'good',
    'merci': 'thank you',
    's\'il te plaît': 'please',
    'je veux': 'I want',
    'voir': 'to see',
    'plus': 'more',
  },
  German: {
    'hallo': 'hello',
    'süße': 'sweetie',
    'schatz': 'treasure/darling',
    'hübsch': 'pretty',
    'geil': 'cool/hot',
    'schön': 'beautiful',
    'du bist': 'you are',
    'sehr': 'very',
    'danke': 'thank you',
    'bitte': 'please',
    'ich will': 'I want',
    'mehr': 'more',
    'heute': 'today',
    'jetzt': 'now',
  },
  Portuguese: {
    'oi': 'hi',
    'olá': 'hello',
    'gata': 'hot girl/babe',
    'gatinha': 'kitten/cutie',
    // 'linda' duplicated in this language; keep first occurrence only
    'amor': 'love',
    'delícia': 'delicious/hot',
    'bb': 'baby',
    'você é': 'you are',
    'você é linda': 'you are beautiful',
    'você é muito linda': 'you are very beautiful',
    'muito': 'very',
    'bonita': 'pretty',
    'obrigado': 'thank you',
    'por favor': 'please',
    'quero': 'I want',
    'ver': 'to see',
    'mais': 'more',
    'te amo': 'I love you',
  },
  Italian: {
    'ciao': 'hi',
    'ciao bella': 'hi beautiful',
    'bella': 'beautiful',
    'bellissima': 'gorgeous',
    'sei bellissima': 'you are gorgeous',
    'amore': 'love',
    'amore mio': 'my love',
    'tesoro': 'darling',
    'sei': 'you are',
    'molto': 'very',
    'molto bella': 'very beautiful',
    'grazie': 'thank you',
    'per favore': 'please',
    'voglio': 'I want',
    'vedere': 'to see',
    'più': 'more',
    'ti amo': 'I love you',
  },
  Japanese: {
    'かわいい': 'cute',
    'すごい': 'amazing',
    '綺麗': 'beautiful',
    'www': 'LOL',
    '好き': 'I like you',
    '大好き': 'I really like you',
    'こんにちは': 'hello',
    'ありがとう': 'thank you',
    'お願い': 'please',
    'もっと': 'more',
    '見せて': 'show me',
  },
  Korean: {
    '예쁘다': 'pretty',
    '예뻐요': 'you are pretty',
    '사랑해': 'I love you',
    '대박': 'amazing',
    'ㅋㅋㅋ': 'LOL',
    '누나': 'older sister',
    '안녕': 'hello',
    '안녕하세요': 'hello',
    '감사합니다': 'thank you',
    '제발': 'please',
    '더': 'more',
    '보여줘': 'show me',
  },
  Russian: {
    'привет': 'hi',
    'привет красавица': 'hi beautiful',
    'красивая': 'beautiful',
    'ты красивая': 'you are beautiful',
    'милая': 'sweet',
    'солнышко': 'sunshine',
    'ты': 'you',
    'очень': 'very',
    'очень красивая': 'very beautiful',
    'спасибо': 'thank you',
    'пожалуйста': 'please',
    'хочу': 'I want',
    'больше': 'more',
    'люблю тебя': 'I love you',
  },
};

// Generate a rough translation of the message
function generateTranslation(text: string, language: string): string {
  if (language === 'English') return text;
  
  const dict = translationDictionary[language] || {};
  let translation = text.toLowerCase();
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedTerms = Object.keys(dict).sort((a, b) => b.length - a.length);
  
  for (const term of sortedTerms) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translation = translation.replace(regex, dict[term]);
  }
  
  // Clean up the translation - capitalize first letter
  translation = translation.charAt(0).toUpperCase() + translation.slice(1);
  
  return translation;
}

// Generate plain language explanation
function generateExplanation(
  text: string, 
  language: string, 
  tones: ToneType[],
  slangItems: SlangItem[],
  targetLang: string = 'English'
): string {
  const toneDescriptions: Record<ToneType, string> = {
    friendly: 'being friendly and warm',
    compliment: 'giving you a compliment',
    flirty: 'being flirtatious and showing romantic interest',
    sexual: 'making a sexual comment or request',
    joke: 'joking around or being playful',
    sarcastic: 'being sarcastic',
    rude: 'being rude or disrespectful',
    insult: 'being insulting or offensive',
    question: 'asking you a question',
    request: 'making a request or asking for something',
    neutral: 'making a casual comment',
    confused: 'expressing confusion',
    excited: 'expressing excitement and enthusiasm',
    grateful: 'expressing gratitude and appreciation',
  };

  const mainTone = tones[0] || 'neutral';
  const toneDesc = toneDescriptions[mainTone];
  
  // Start explanation (translation is now shown separately in the UI)
  let explanation = '';
  
  // Add meaning section
  explanation += `**What they're saying:** `;
  
  // Build contextual meaning based on detected content
  const lowerText = text.toLowerCase();
  
  // Greeting detection
  const greetings = ['hola', 'coucou', 'salut', 'bonjour', 'hallo', 'oi', 'olá', 'ciao', 'привет', 'hi', 'hello', 'hey', 'こんにちは', '안녕'];
  const hasGreeting = greetings.some(g => lowerText.includes(g));
  
  // Compliment detection
  const compliments = ['hermosa', 'linda', 'guapa', 'bella', 'belle', 'beautiful', 'gorgeous', 'pretty', 'hot', 'sexy', 'cute', 'かわいい', '예쁘다', 'красивая', 'hübsch', 'schön', 'gata', 'gostosa'];
  const hasCompliment = compliments.some(c => lowerText.includes(c));
  
  // Love/affection detection
  const loveTerms = ['te quiero', 'te amo', 'je t\'aime', 'love', 'amor', 'amore', '사랑해', '好き'];
  const hasLove = loveTerms.some(l => lowerText.includes(l));
  
  // Question detection
  const hasQuestion = text.includes('?') || /\b(how|what|where|when|why|can|could|would|como|que|où|quand|pourquoi)\b/i.test(text);
  
  // Build the meaning
  if (hasGreeting && hasCompliment) {
    explanation += `This viewer is greeting you with a compliment. They're saying hello and telling you that you look ${hasLove ? 'amazing and expressing affection' : 'attractive'}. `;
  } else if (hasGreeting) {
    explanation += `This viewer is saying hello and trying to start a conversation with you. `;
  } else if (hasCompliment && hasLove) {
    explanation += `This viewer is expressing strong attraction and affection. They're complimenting your appearance and expressing romantic feelings. `;
  } else if (hasCompliment) {
    explanation += `This viewer is complimenting your appearance. They find you attractive and want you to know it. `;
  } else if (hasLove) {
    explanation += `This viewer is expressing romantic feelings or strong affection toward you. `;
  } else if (hasQuestion) {
    explanation += `This viewer is asking you a question and wants a response. `;
  } else {
    explanation += `This viewer is ${toneDesc}. `;
  }
  
  // Add tone context
  explanation += `\n\n**Tone:** The overall tone is ${mainTone}`;
  if (tones.length > 1) {
    explanation += ` with hints of ${tones.slice(1, 3).join(' and ')}`;
  }
  explanation += '. ';
  
  // Add specific slang context if present
  if (slangItems.length > 0) {
    explanation += `\n\n**Key terms used:** `;
    const slangExplanations = slangItems.slice(0, 3).map(s => 
      `"${s.term}" means "${s.meaning}"${s.notes ? ` (${s.notes})` : ''}`
    );
    explanation += slangExplanations.join('; ') + '. ';
  }
  
  // Add actionable context based on tone combinations
  explanation += '\n\n**How to respond:** ';
  
  if (tones.includes('sexual')) {
    explanation += 'This message has sexual content. Respond based on your comfort level and platform rules. You can acknowledge, redirect, or set a boundary.';
  } else if (tones.includes('rude') || tones.includes('insult')) {
    explanation += 'This is a negative or disrespectful message. Consider ignoring, blocking, or setting a firm boundary if this behavior continues.';
  } else if (tones.includes('compliment') && tones.includes('flirty')) {
    explanation += 'They\'re being flirty and trying to get your attention. A simple "thank you" or playful response works well if you want to engage.';
  } else if (tones.includes('compliment')) {
    explanation += 'A simple "thank you" or acknowledgment is appropriate. They\'re being positive and supportive.';
  } else if (tones.includes('question') || tones.includes('request')) {
    explanation += 'They want something from you. Decide if you want to engage based on what they\'re asking.';
  } else if (tones.includes('joke') || tones.includes('sarcastic')) {
    explanation += 'They\'re being playful. A light response or emoji reaction works well.';
  } else if (tones.includes('grateful')) {
    explanation += 'They\'re showing appreciation. A warm acknowledgment keeps the positive energy going.';
  } else {
    explanation += 'This is a casual interaction. Respond naturally based on your mood and the conversation flow.';
  }
  
  return explanation.trim();
}

// Generate suggested responses based on detected tones
function generateSuggestedResponses(tones: ToneType[]): string[] {
  const responses: string[] = [];
  
  if (tones.includes('sexual')) {
    responses.push('Set a boundary: "Let\'s keep it fun and friendly 😊"');
    responses.push('Redirect: "Thanks! Check out my tip menu 💕"');
    responses.push('Ignore and move on');
  } else if (tones.includes('rude') || tones.includes('insult')) {
    responses.push('Ignore the message');
    responses.push('Set a boundary: "Please be respectful"');
    responses.push('Block/mute if it continues');
  } else if (tones.includes('compliment') && tones.includes('flirty')) {
    responses.push('Thank them: "Aww thank you! 💕"');
    responses.push('Playful response: "You\'re too sweet!"');
    responses.push('Engage: "Thanks babe! How are you?"');
  } else if (tones.includes('compliment')) {
    responses.push('Simple thanks: "Thank you! 😊"');
    responses.push('Warm response: "That\'s so sweet of you!"');
    responses.push('Engage more: "Thanks! What brings you here today?"');
  } else if (tones.includes('question')) {
    responses.push('Answer directly if comfortable');
    responses.push('Redirect to tip menu/rules');
    responses.push('Playful deflection if too personal');
  } else if (tones.includes('request')) {
    responses.push('Check your tip menu');
    responses.push('Set expectations: "Sure, for X tokens!"');
    responses.push('Politely decline if not comfortable');
  } else if (tones.includes('grateful')) {
    responses.push('Acknowledge: "You\'re welcome! 💕"');
    responses.push('Keep it warm: "Glad you enjoyed it!"');
    responses.push('Encourage: "Thanks for being here!"');
  } else if (tones.includes('joke') || tones.includes('sarcastic')) {
    responses.push('Play along: "Haha 😂"');
    responses.push('React with an emoji');
    responses.push('Light banter back');
  } else if (tones.includes('friendly')) {
    responses.push('Friendly reply: "Hey! 👋"');
    responses.push('Engage: "How\'s it going?"');
    responses.push('Warm welcome: "Nice to see you!"');
  } else {
    responses.push('Acknowledge with a smile');
    responses.push('Keep the conversation going');
    responses.push('React naturally');
  }
  
  return responses.slice(0, 3);
}

/**
 * Decoder Service - main interface for message decoding
 */
export const decoderService = {
  /**
   * Decode a chat message
   */
  async decodeMessage(request: DecodeRequest): Promise<DecodeResponse> {
    const { text, sourceLang, targetLang = 'English' } = request;
    
    if (!text || !text.trim()) {
      throw new Error('Message text is required');
    }
    
    // Simulate API delay
    await simulateDelay();
    
    // Detect language if not provided
    const { language, region } = sourceLang 
      ? { language: sourceLang, region: request.region || 'General' }
      : detectLanguageFromText(text);
    
    // Detect tones
    const toneTags = detectTones(text);
    
    // Detect slang
    const slangItems = detectSlang(text, language);
    
    // Generate translation
    const translation = language !== 'English' 
      ? generateTranslation(text, language)
      : text;
    
    // Generate explanation
    const plainExplanation = generateExplanation(text, language, toneTags, slangItems, targetLang);
    
    // Generate suggested responses based on tone
    const suggestedResponses = generateSuggestedResponses(toneTags);
    
    return {
      originalText: text,
      detectedLanguage: language,
      region,
      translation,
      plainExplanation,
      slangItems,
      toneTags,
      suggestedResponses,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Detect language only (quick check)
   */
  async detectLanguage(text: string): Promise<{ language: string; region: string }> {
    await simulateDelay(200);
    return detectLanguageFromText(text);
  },

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'English',
      'Spanish',
      'French',
      'German',
      'Portuguese',
      'Italian',
      'Japanese',
      'Korean',
      'Russian',
      'Chinese',
      'Arabic',
      'Dutch',
      'Polish',
      'Turkish',
      'Hindi',
      'Filipino',
      'Indonesian',
      'Vietnamese',
      'Thai',
    ];
  },

  /**
   * Get common regions
   */
  getCommonRegions(): string[] {
    return [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Mexico',
      'Spain',
      'Brazil',
      'France',
      'Germany',
      'Italy',
      'Japan',
      'South Korea',
      'Russia',
      'China',
      'India',
      'Middle East',
      'Latin America',
      'Europe',
    ];
  },

  /**
   * Map regions to their primary languages
   */
  getLanguagesForRegions(regions: string[]): string[] {
    const regionToLanguage: Record<string, string[]> = {
      'United States': ['English'],
      'United Kingdom': ['English'],
      'Canada': ['English', 'French'],
      'Australia': ['English'],
      'Mexico': ['Spanish'],
      'Spain': ['Spanish'],
      'Brazil': ['Portuguese'],
      'France': ['French'],
      'Germany': ['German'],
      'Italy': ['Italian'],
      'Japan': ['Japanese'],
      'Philippines': ['Filipino'],
      'Indonesia': ['Indonesian'],
      'Vietnam': ['Vietnamese'],
      'Thailand': ['Thai'],
      'South Korea': ['Korean'],
      'Russia': ['Russian'],
      'China': ['Chinese'],
      'India': ['Hindi', 'English'],
      'India/Subcontinent': ['Hindi', 'English'],
      'Middle East': ['Arabic'],
      'Latin America': ['Spanish', 'Portuguese'],
      'Europe': ['German', 'French', 'Spanish', 'Italian', 'Dutch', 'Polish'],
    };

    const languages = new Set<string>();
    for (const region of regions) {
      const langs = regionToLanguage[region] || [];
      langs.forEach(lang => languages.add(lang));
    }
    return Array.from(languages);
  },

  /**
   * Preload translation dictionaries for selected languages
   * This simulates downloading/caching language packs
   */
  async preloadLanguages(languages: string[]): Promise<{ loaded: string[]; status: string }> {
    await simulateDelay(300);
    
    // In a real app, this would download language packs from a server
    // For now, we just verify the languages are supported
    const supportedLangs = this.getSupportedLanguages();
    const loaded = languages.filter(lang => supportedLangs.includes(lang));
    
    // Store preloaded languages in localStorage for quick access
    const existing = JSON.parse(localStorage.getItem('preloadedLanguages') || '[]');
    const combined = [...new Set([...existing, ...loaded])];
    localStorage.setItem('preloadedLanguages', JSON.stringify(combined));
    
    console.log(`Preloaded ${loaded.length} language(s):`, loaded);
    
    return {
      loaded,
      status: `${loaded.length} language pack(s) ready`,
    };
  },

  /**
   * Get preloaded languages
   */
  getPreloadedLanguages(): string[] {
    return JSON.parse(localStorage.getItem('preloadedLanguages') || '[]');
  },
};

export default decoderService;
