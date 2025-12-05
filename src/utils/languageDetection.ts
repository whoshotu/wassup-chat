import { SlangItem } from '@/contexts/MessageHistoryContext';

// Mock language detection and translation service
// In production, this would integrate with a real API like Google Translate, DeepL, or OpenAI

interface DetectionResult {
  detectedLanguage: string;
  region: string;
  plainExplanation: string;
  slangItems: SlangItem[];
  toneTags: string[];
}

// Mock slang database
const slangDatabase: Record<string, SlangItem[]> = {
  Spanish: [
    { term: 'bb', definition: 'Baby/babe', context: 'Term of endearment, casual flirting' },
    { term: 'hermosa', definition: 'Beautiful', context: 'Compliment, romantic interest' },
    { term: 'papi/mami', definition: 'Daddy/mommy', context: 'Flirtatious term, can be playful or sexual' },
  ],
  French: [
    { term: 'bb', definition: 'Bébé (baby)', context: 'Term of endearment' },
    { term: 'ma belle', definition: 'My beautiful', context: 'Romantic compliment' },
    { term: 'coucou', definition: 'Hey/hi', context: 'Casual, friendly greeting' },
  ],
  German: [
    { term: 'süße', definition: 'Sweetie', context: 'Term of endearment' },
    { term: 'schatz', definition: 'Treasure/darling', context: 'Affectionate term' },
  ],
  Portuguese: [
    { term: 'gata', definition: 'Hot girl/babe', context: 'Compliment, can be flirtatious' },
    { term: 'linda', definition: 'Beautiful', context: 'Compliment' },
    { term: 'amor', definition: 'Love', context: 'Term of endearment' },
  ],
  Japanese: [
    { term: 'かわいい (kawaii)', definition: 'Cute', context: 'Common compliment' },
    { term: 'すごい (sugoi)', definition: 'Amazing/awesome', context: 'Expression of admiration' },
  ],
  Korean: [
    { term: '예쁘다 (yeppeuda)', definition: 'Pretty', context: 'Compliment' },
    { term: '사랑해 (saranghae)', definition: 'I love you', context: 'Expression of affection' },
  ],
};

// Mock tone detection
function detectTone(text: string, language: string): string[] {
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
    lowerText.includes('belle')
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
    lowerText.includes('😏')
  ) {
    tones.push('flirty');
  }

  // Question indicators
  if (lowerText.includes('?') || lowerText.includes('how') || lowerText.includes('what')) {
    tones.push('question');
  }

  // Negative indicators
  if (
    lowerText.includes('rude') ||
    lowerText.includes('stupid') ||
    lowerText.includes('ugly') ||
    lowerText.includes('hate')
  ) {
    tones.push('negative');
  }

  // Joking indicators
  if (lowerText.includes('lol') || lowerText.includes('haha') || lowerText.includes('😂')) {
    tones.push('joking');
  }

  // Default to neutral if no specific tone detected
  if (tones.length === 0) {
    tones.push('neutral');
  }

  return tones;
}

// Mock slang detection
function detectSlang(text: string, language: string): SlangItem[] {
  const detectedSlang: SlangItem[] = [];
  const languageSlang = slangDatabase[language] || [];

  languageSlang.forEach((slang) => {
    if (text.toLowerCase().includes(slang.term.toLowerCase())) {
      detectedSlang.push(slang);
    }
  });

  return detectedSlang;
}

export async function detectAndDecodeMessage(
  text: string,
  manualLanguage?: string
): Promise<DetectionResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock language detection based on common patterns
  let detectedLanguage = manualLanguage || 'English';
  let region = 'General';

  if (!manualLanguage) {
    // Simple pattern matching for demo purposes
    if (/[áéíóúñ¿¡]/i.test(text)) {
      detectedLanguage = 'Spanish';
      region = 'Latin America';
    } else if (/[àâçèéêëîïôùûü]/i.test(text)) {
      detectedLanguage = 'French';
      region = 'France';
    } else if (/[äöüß]/i.test(text)) {
      detectedLanguage = 'German';
      region = 'Germany';
    } else if (/[ãõâêô]/i.test(text)) {
      detectedLanguage = 'Portuguese';
      region = 'Brazil';
    } else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      detectedLanguage = 'Japanese';
      region = 'Japan';
    } else if (/[\uAC00-\uD7AF]/.test(text)) {
      detectedLanguage = 'Korean';
      region = 'South Korea';
    }
  }

  // Mock translation and explanation
  const plainExplanation = generateExplanation(text, detectedLanguage);
  const slangItems = detectSlang(text, detectedLanguage);
  const toneTags = detectTone(text, detectedLanguage);

  return {
    detectedLanguage,
    region,
    plainExplanation,
    slangItems,
    toneTags,
  };
}

function generateExplanation(text: string, language: string): string {
  // Mock explanations based on language
  const explanations: Record<string, string> = {
    Spanish: `This viewer is saying: "${text}". They're being friendly and complimentary. This is a common way Spanish-speaking viewers show appreciation.`,
    French: `This viewer wrote: "${text}". They're expressing interest in a polite, charming way typical of French communication style.`,
    German: `The viewer is saying: "${text}". This is a straightforward compliment in German, showing appreciation.`,
    Portuguese: `This message says: "${text}". Brazilian viewers often use warm, affectionate language to show they're enjoying the stream.`,
    Japanese: `The viewer wrote: "${text}". This is a positive comment expressing admiration, which is common in Japanese chat culture.`,
    Korean: `This says: "${text}". Korean viewers often use affectionate language to show support and appreciation.`,
    English: `This viewer is saying: "${text}". ${
      text.toLowerCase().includes('beautiful') || text.toLowerCase().includes('gorgeous')
        ? "They're giving you a compliment."
        : text.toLowerCase().includes('?')
        ? "They're asking you a question."
        : "They're engaging with your stream."
    }`,
  };

  return explanations[language] || `The viewer wrote: "${text}". This appears to be a ${language} message.`;
}

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
];
