import { translate as trans } from './translate.js';
import franc from 'franc';
import franc from 'franc';

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
    targetLanguage = 'en',
    tone = 'neutral',
    style = 'default',
    projectType = 'web-app',
    features = []
  } = input;
  // Auto-detect input language if not provided or set to 'auto'
  const inputTextForDetection = input.sample || input.text || '';
  let detectedLang = language && language.toLowerCase() !== 'auto' ? language : null;
  if (!detectedLang) {
    const d = detectLanguageFromText(inputTextForDetection);
    detectedLang = d.language;
  }

  // Basic skeleton content using detected language
  const skeleton = [
    `Project Type: ${projectType}`,
    `Source Language: ${detectedLang}`,
    `Target Language: ${targetLanguage}`,
    `Features: ${Array.isArray(features) ? features.join(', ') : features}`
  ].join('\n');
  // Bulk path removed; single-language generation path continues below

  // Single-language path (no bulk)
  let translatedContent = skeleton;
  let translationLog = '';
  if (targetLanguage && targetLanguage.toLowerCase() !== (language || 'en').toLowerCase()) {
    translatedContent = await trans(skeleton, language, targetLanguage);
    translationLog = `Translated ${language} -> ${targetLanguage}`;
  }
  const vibeCheck = computeVibeScore(translatedContent, tone);
  const tweaks = suggestVibeTweaks(translatedContent, tone);
  const scaffolds = { [detectedLang]: translatedContent };
  return {
    scaffolds,
    translationLog,
    vibeScore: vibeCheck,
    tweaks,
    languages: [detectedLang],
    sourceLanguage: detectedLang,
    tenantId,
    status: 'generated'
  };
}

function computeVibeScore(text, tone) {
  // Very lightweight heuristic
  let score = 0;
  if (!text) return score;
  if (tone === 'friendly') score += 1;
  if (tone === 'formal') score += 0.5;
  if (text.toLowerCase().includes('please')) score += 0.5;
  if (text.length < 100) score += 0.2;
  return Math.max(0, Math.min(5, score));
}

function suggestVibeTweaks(text, tone) {
  const tweaks = [];
  if (tone === 'friendly' && !text.toLowerCase().includes('thank you')) {
    tweaks.push('Add a friendly closing line.');
  }
  if (tone === 'formal') {
    tweaks.push('Maintain formal register across sections.');
  }
  return tweaks;
}

export default generateProject;
