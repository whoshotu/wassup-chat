import { franc } from 'franc';
import trans from './translate.js';

// Lightweight language detection (input text -> language)
export function detectLanguageFromText(text = '') {
  const t = (text || '').toLowerCase();
  // Try fast IR language detection using franc as a fallback
  try {
    const code = franc(text);
    const codeMap = {
      eng: 'English',
      spa: 'Spanish',
      fra: 'French',
      deu: 'German',
      por: 'Portuguese',
      ita: 'Italian',
      jpn: 'Japanese',
      kor: 'Korean',
      rus: 'Russian',
      cmn: 'Chinese',
      ara: 'Arabic',
      hin: 'Hindi',
      ind: 'Indonesian',
      vie: 'Vietnamese',
      tha: 'Thai',
      fil: 'Filipino'
    };
    const mapped = codeMap[code];
    if (mapped) {
      return { language: mapped, region: 'General' };
    }
  } catch (e) {
    // ignore franc failures and fall back to heuristics
  }
  // Scripts
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return { language: 'Japanese', region: 'Japan' };
  }
  if (/[\uac00-\ud7af]/.test(text)) {
    return { language: 'Korean', region: 'South Korea' };
  }
  if (/[\u4e00-\u9fff]/.test(text)) {
    return { language: 'Chinese', region: 'China' };
  }
  if (/[\u0600-\u06FF]/.test(text)) {
    return { language: 'Arabic', region: 'Middle East' };
  }
  if (/[\u0400-\u04FF]/.test(text)) {
    return { language: 'Russian', region: 'Russia' };
  }

  // Common words/phrases heuristics
  if (t.includes('hola') || t.includes('gracias') || t.includes('amigo')) {
    return { language: 'Spanish', region: 'Latin America' };
  }
  if (t.includes('bonjour') || t.includes('merci') || t.includes('coucou')) {
    return { language: 'French', region: 'France' };
  }
  if (t.includes('hallo') || t.includes('danke') || t.includes('bits')) {
    return { language: 'German', region: 'Germany' };
  }
  if (t.includes('ciao') || t.includes('amore') || t.includes('grazie')) {
    return { language: 'Italian', region: 'Italy' };
  }
  if (t.includes('olá') || t.includes('oi') || t.includes('gato')) {
    return { language: 'Portuguese', region: 'Brazil' };
  }
  if (t.includes('hello') || t.includes('hi') || t.includes('hey')) {
    return { language: 'English', region: 'General' };
  }

  // Fallback to English
  return { language: 'English', region: 'General' };
}

// Lightweight scaffold generator (open-source friendly)
// Map of country names to language lists (for starter coverage)
function mapCountriesToLanguages(countries = []) {
  const map = {
    'America': ['English'],
    'United States': ['English'],
    'America (USA)': ['English'],
    'Brazil': ['Portuguese'],
    'Philippines': ['Filipino'],
    'Argentina': ['Spanish'],
    'Italy': ['Italian'],
    'Asia': ['Chinese', 'Japanese', 'Korean', 'Hindi', 'Indonesian', 'Vietnamese', 'Thai'],
    'Japan': ['Japanese'],
  };
  const langs = [];
  for (const c of countries) {
    const key = (c || '').toString().trim();
    if (!key) continue;
    // allow case-insensitive match by normalizing
    const found = Object.keys(map).find(k => k.toLowerCase() === key.toLowerCase());
    if (found && map[found]) {
      langs.push(...map[found]);
    }
  }
  // Deduplicate
  return Array.from(new Set(langs));
}

const TENANCY_ENABLED = (process.env.TENANCY_ENABLED === 'true');
const BULK_LANG_GEN = (process.env.BULK_LANG_GEN === 'true');

export async function generateProject(input = {}, tenantId = '') {
  const {
    language = 'auto',
    targetLanguage = 'English',
    text = '',
    sample = ''
  } = input;

  const contentToAnalyze = text || sample || '';
  if (!contentToAnalyze) {
    throw new Error('No text provided for analysis');
  }

  // Auto-detect input language
  let detectedLang = language && language.toLowerCase() !== 'auto' ? language : null;
  if (!detectedLang) {
    const d = detectLanguageFromText(contentToAnalyze);
    detectedLang = d.language;
  }

  // Translate the actual content
  let translatedText = contentToAnalyze;
  if (targetLanguage && targetLanguage !== detectedLang) {
    translatedText = await trans(contentToAnalyze, detectedLang, targetLanguage);
  }

  // Detect Tone and Vibe
  const lowerText = contentToAnalyze.toLowerCase();
  const tones = [];
  
  // Simple heuristics for tone
  if (lowerText.includes('?') || lowerText.includes('how') || lowerText.includes('what')) tones.push('question');
  if (lowerText.includes('please') || lowerText.includes('thanks') || lowerText.includes('thank you')) tones.push('grateful');
  if (lowerText.includes('love') || lowerText.includes('beautiful') || lowerText.includes('sexy') || lowerText.includes('hot')) tones.push('compliment');
  if (lowerText.includes('baby') || lowerText.includes('sweetie') || lowerText.includes('honey')) tones.push('flirty');
  if (lowerText.includes('fuck') || lowerText.includes('shit') || lowerText.includes('hate')) tones.push('negative');
  if (lowerText.includes('wow') || lowerText.includes('!') || lowerText.includes('amazing')) tones.push('excited');
  
  if (tones.length === 0) tones.push('neutral');

  // Vibe score
  const vibeScore = computeVibeScore(contentToAnalyze, tones);

  // Suggested Responses
  const suggestions = [];
  if (tones.includes('question')) suggestions.push('Answer the question clearly.');
  if (tones.includes('compliment')) suggestions.push('Say thank you and send a wink.');
  if (tones.includes('flirty')) suggestions.push('Play along and keep it light.');
  if (tones.includes('negative')) suggestions.push('Politely decline or ignore.');
  if (suggestions.length === 0) suggestions.push('Keep the conversation going!');

  return {
    originalText: contentToAnalyze,
    translatedText,
    sourceLanguage: detectedLang,
    targetLanguage,
    toneTags: tones,
    vibeScore,
    suggestions,
    status: 'generated'
  };
}

function computeVibeScore(text, tones) {
  let score = 3.0; // Baseline
  if (text.includes('!')) score += 0.5;
  if (text.includes('?')) score -= 0.2;
  if (tones.includes('friendly') || tones.includes('flirty') || tones.includes('compliment')) score += 1.0;
  if (text.length > 50) score += 0.3;
  return Math.max(0, Math.min(5, score));
}

export default generateProject;
