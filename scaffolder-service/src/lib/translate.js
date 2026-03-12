import axios from 'axios';

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';
// Simple in-memory translation cache (production-ready usage should use a distributed cache)
const translationCache = new Map();
// Offline dictionaries for a minimal fallback when self-hosting translation locally
const offlineDictionaries = {
  Spanish: { 'hello': 'hola', 'hi': 'hola', 'please': 'por favor', 'thank you': 'gracias', 'thanks': 'gracias', 'love': 'amor', 'friend': 'amigo', 'good': 'bueno' },
  French: { 'hello': 'bonjour', 'hi': 'salut', 'please': 's il vous plaît', 'thank you': 'merci', 'love': 'amour' },
  German: { 'hello': 'hallo', 'hi': 'hallo', 'please': 'bitte', 'thank you': 'danke', 'love': 'liebe' },
  Portuguese: { 'hello': 'olá', 'hi': 'olá', 'please': 'por favor', 'thank you': 'obrigado', 'love': 'amor' },
  Italian: { 'hello': 'ciao', 'hi': 'ciao', 'please': 'per favore', 'thank you': 'grazie', 'love': 'amore' },
  Japanese: { 'hello': 'こんにちは', 'hi': 'こんにちは', 'please': 'お願いします', 'thank you': 'ありがとう', 'love': '愛' }
};
function offlineTranslateFallback(text, to) {
  if (!text) return '';
  const dict = offlineDictionaries[to] || {};
  if (!Object.keys(dict).length) return text;
  let out = text;
  for (const [k, v] of Object.entries(dict)) {
    const re = new RegExp(`\\b${k}\\b`, 'gi');
    out = out.replace(re, v);
  }
  return out;
}

export async function translate(text, from = 'auto', to = 'en') {
  const cacheKey = `${from}:${to}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  if (!text) return '';
  if (to.toLowerCase() === from.toLowerCase()) return text;
  try {
    const payload = { q: text, source: from, target: to, format: 'text' };
    const res = await axios.post(`${LIBRETRANSLATE_URL}/translate`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = res.data;
    let translated = text;
    if (typeof data?.translatedText === 'string') translated = data.translatedText;
    else if (typeof data?.translation === 'string') translated = data.translation;
    else if (data?.translations && data.translations[0]?.translatedText) translated = data.translations[0].translatedText;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.warn('LibreTranslate unavailable, using offline dictionary fallback.');
    const fallback = offlineTranslateFallback(text, to);
    translationCache.set(cacheKey, fallback);
    return fallback;
  }
}

export default translate;
