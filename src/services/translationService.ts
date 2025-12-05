import { SlangItem } from '@/contexts/MessageHistoryContext';

// Translation result interface
export interface TranslationResult {
  detectedLanguage: string;
  region: string;
  plainExplanation: string;
  slangItems: SlangItem[];
  toneTags: string[];
}

// Translation service interface - can be implemented by different providers
export interface TranslationProvider {
  translate: (
    text: string,
    sourceLang?: string,
    targetLang?: string
  ) => Promise<TranslationResult>;
  detectLanguage: (text: string) => Promise<{ language: string; region: string }>;
}

// Mock slang database
const slangDatabase: Record<string, SlangItem[]> = {
  Spanish: [
    { term: 'bb', definition: 'Baby/babe', context: 'Term of endearment, casual flirting' },
    { term: 'hermosa', definition: 'Beautiful', context: 'Compliment, romantic interest' },
    { term: 'papi/mami', definition: 'Daddy/mommy', context: 'Flirtatious term, can be playful or sexual' },
    { term: 'guapa', definition: 'Hot/pretty', context: 'Common compliment' },
    { term: 'te quiero', definition: 'I love you (casual)', context: 'Expression of affection' },
  ],
  French: [
    { term: 'bb', definition: 'Bébé (baby)', context: 'Term of endearment' },
    { term: 'ma belle', definition: 'My beautiful', context: 'Romantic compliment' },
    { term: 'coucou', definition: 'Hey/hi', context: 'Casual, friendly greeting' },
    { term: 'bisous', definition: 'Kisses', context: 'Affectionate sign-off' },
  ],
  German: [
    { term: 'süße', definition: 'Sweetie', context: 'Term of endearment' },
    { term: 'schatz', definition: 'Treasure/darling', context: 'Affectionate term' },
    { term: 'hübsch', definition: 'Pretty', context: 'Compliment' },
  ],
  Portuguese: [
    { term: 'gata', definition: 'Hot girl/babe', context: 'Compliment, can be flirtatious' },
    { term: 'linda', definition: 'Beautiful', context: 'Compliment' },
    { term: 'amor', definition: 'Love', context: 'Term of endearment' },
    { term: 'gostosa', definition: 'Hot/sexy', context: 'Flirtatious, can be inappropriate' },
  ],
  Japanese: [
    { term: 'かわいい (kawaii)', definition: 'Cute', context: 'Common compliment' },
    { term: 'すごい (sugoi)', definition: 'Amazing/awesome', context: 'Expression of admiration' },
    { term: '綺麗 (kirei)', definition: 'Beautiful', context: 'Compliment' },
  ],
  Korean: [
    { term: '예쁘다 (yeppeuda)', definition: 'Pretty', context: 'Compliment' },
    { term: '사랑해 (saranghae)', definition: 'I love you', context: 'Expression of affection' },
    { term: '대박 (daebak)', definition: 'Amazing/awesome', context: 'Expression of excitement' },
  ],
  Italian: [
    { term: 'bella', definition: 'Beautiful', context: 'Common compliment' },
    { term: 'ciao bella', definition: 'Hi beautiful', context: 'Friendly/flirty greeting' },
    { term: 'amore', definition: 'Love', context: 'Term of endearment' },
  ],
  Russian: [
    { term: 'красивая (krasivaya)', definition: 'Beautiful', context: 'Compliment' },
    { term: 'привет (privet)', definition: 'Hi', context: 'Casual greeting' },
  ],
};

// Tone detection logic
function detectTone(text: string): string[] {
  const tones: string[] = [];
  const lowerText = text.toLowerCase();

  // Positive indicators
  if (
    lowerText.includes('beautiful') ||
    lowerText.includes('gorgeous') ||
    lowerText.includes('amazing') ||
    lowerText.includes('love') ||
    lowerText.includes('❤️') ||
    lowerText.includes('😍') ||
    lowerText.includes('hermosa') ||
    lowerText.includes('linda') ||
    lowerText.includes('belle') ||
    lowerText.includes('bella') ||
    lowerText.includes('kawaii') ||
    lowerText.includes('かわいい')
  ) {
    tones.push('friendly');
    tones.push('compliment');
  }

  // Flirty indicators
  if (
    lowerText.includes('sexy') ||
    lowerText.includes('hot') ||
    lowerText.includes('baby') ||
    lowerText.includes('bb') ||
    lowerText.includes('papi') ||
    lowerText.includes('mami') ||
    lowerText.includes('😘') ||
    lowerText.includes('😏') ||
    lowerText.includes('gata') ||
    lowerText.includes('gostosa')
  ) {
    tones.push('flirty');
  }

  // Question indicators
  if (lowerText.includes('?') || lowerText.includes('how') || lowerText.includes('what') || lowerText.includes('where')) {
    tones.push('question');
  }

  // Negative indicators
  if (
    lowerText.includes('rude') ||
    lowerText.includes('stupid') ||
    lowerText.includes('ugly') ||
    lowerText.includes('hate') ||
    lowerText.includes('fuck') ||
    lowerText.includes('bitch')
  ) {
    tones.push('negative');
  }

  // Joking indicators
  if (lowerText.includes('lol') || lowerText.includes('haha') || lowerText.includes('😂') || lowerText.includes('jk')) {
    tones.push('joking');
  }

  // Request indicators
  if (lowerText.includes('please') || lowerText.includes('can you') || lowerText.includes('show') || lowerText.includes('do')) {
    tones.push('request');
  }

  // Default to neutral if no specific tone detected
  if (tones.length === 0) {
    tones.push('neutral');
  }

  return [...new Set(tones)]; // Remove duplicates
}

// Slang detection
function detectSlang(text: string, language: string): SlangItem[] {
  const detectedSlang: SlangItem[] = [];
  const languageSlang = slangDatabase[language] || [];

  languageSlang.forEach((slang) => {
    if (text.toLowerCase().includes(slang.term.toLowerCase().split(' ')[0])) {
      detectedSlang.push(slang);
    }
  });

  return detectedSlang;
}

// Language detection based on character patterns
function detectLanguageFromText(text: string): { language: string; region: string } {
  // Japanese characters
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return { language: 'Japanese', region: 'Japan' };
  }
  // Korean characters
  if (/[\uAC00-\uD7AF]/.test(text)) {
    return { language: 'Korean', region: 'South Korea' };
  }
  // Chinese characters (simplified/traditional)
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
  if (/[áéíóúñ¿¡]/.test(text)) {
    return { language: 'Spanish', region: 'Latin America' };
  }
  // French indicators
  if (/[àâçèéêëîïôùûüœæ]/.test(text)) {
    return { language: 'French', region: 'France' };
  }
  // German indicators
  if (/[äöüß]/.test(text)) {
    return { language: 'German', region: 'Germany' };
  }
  // Portuguese indicators
  if (/[ãõâêô]/.test(text)) {
    return { language: 'Portuguese', region: 'Brazil' };
  }
  // Italian indicators
  if (/[àèéìòù]/.test(text) && text.toLowerCase().includes('ciao')) {
    return { language: 'Italian', region: 'Italy' };
  }

  return { language: 'English', region: 'General' };
}

// Generate explanation based on detected language and content
function generateExplanation(text: string, language: string, tones: string[]): string {
  const toneDescription = tones.length > 0 
    ? tones.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ').toLowerCase()
    : 'neutral';

  const explanations: Record<string, string> = {
    Spanish: `This viewer is saying: "${text}". They're being ${toneDescription}. This is a common way Spanish-speaking viewers show appreciation and engage with streamers.`,
    French: `This viewer wrote: "${text}". They're expressing themselves in a ${toneDescription} way, typical of French communication style.`,
    German: `The viewer is saying: "${text}". This is a ${toneDescription} message in German, showing their engagement with your stream.`,
    Portuguese: `This message says: "${text}". Brazilian/Portuguese viewers often use ${toneDescription} language to show they're enjoying the stream.`,
    Japanese: `The viewer wrote: "${text}". This is a ${toneDescription} comment, which is common in Japanese chat culture.`,
    Korean: `This says: "${text}". Korean viewers often use ${toneDescription} language to show support and appreciation.`,
    Italian: `The viewer is saying: "${text}". Italian viewers tend to be ${toneDescription} and expressive in their messages.`,
    Russian: `This message means: "${text}". The viewer is being ${toneDescription} in their communication.`,
    Chinese: `The viewer wrote: "${text}". This is a ${toneDescription} message from a Chinese-speaking viewer.`,
    Arabic: `This message says: "${text}". The viewer is communicating in a ${toneDescription} manner.`,
    English: `This viewer is saying: "${text}". ${
      tones.includes('compliment')
        ? "They're giving you a compliment."
        : tones.includes('question')
        ? "They're asking you a question."
        : tones.includes('flirty')
        ? "They're being flirtatious."
        : tones.includes('negative')
        ? "This message may be inappropriate or negative."
        : "They're engaging with your stream."
    }`,
  };

  return explanations[language] || `The viewer wrote: "${text}". This appears to be a ${language} message with a ${toneDescription} tone.`;
}

// Default mock translation provider
class MockTranslationProvider implements TranslationProvider {
  async translate(
    text: string,
    sourceLang?: string,
    _targetLang?: string
  ): Promise<TranslationResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

    const { language, region } = sourceLang 
      ? { language: sourceLang, region: 'General' }
      : detectLanguageFromText(text);
    
    const toneTags = detectTone(text);
    const slangItems = detectSlang(text, language);
    const plainExplanation = generateExplanation(text, language, toneTags);

    return {
      detectedLanguage: language,
      region,
      plainExplanation,
      slangItems,
      toneTags,
    };
  }

  async detectLanguage(text: string): Promise<{ language: string; region: string }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return detectLanguageFromText(text);
  }
}

// Singleton instance of the current provider
let currentProvider: TranslationProvider = new MockTranslationProvider();

// Client-side translation service
export const translationService = {
  // Main translation function
  translateClientSide: async (
    message: string,
    sourceLang?: string,
    targetLang: string = 'English'
  ): Promise<TranslationResult> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }
    return currentProvider.translate(message, sourceLang, targetLang);
  },

  // Detect language only
  detectLanguage: async (text: string): Promise<{ language: string; region: string }> => {
    return currentProvider.detectLanguage(text);
  },

  // Set a different translation provider
  setProvider: (provider: TranslationProvider) => {
    currentProvider = provider;
  },

  // Get current provider (for testing)
  getProvider: (): TranslationProvider => currentProvider,
};

// Supported languages list
export const supportedLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Japanese',
  'Korean',
  'Italian',
  'Russian',
  'Chinese',
  'Arabic',
  'Hindi',
  'Dutch',
  'Polish',
  'Turkish',
];

export default translationService;
