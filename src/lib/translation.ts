/**
 * On-device translation through the browser's built-in Translator and
 * LanguageDetector APIs (Chrome and Edge 138+). No network request, no API key.
 *
 * The engine has no auto-detect mode, so a language pair must always be named.
 * Every failure is typed so callers can fall back deliberately instead of
 * guessing why a translation came back unchanged.
 */

export const LANGUAGE_TAGS: Record<string, string> = {
  English: 'en', Spanish: 'es', French: 'fr', German: 'de', Portuguese: 'pt',
  Italian: 'it', Japanese: 'ja', Korean: 'ko', Chinese: 'zh', Arabic: 'ar',
  Russian: 'ru', Hindi: 'hi', Indonesian: 'id', Vietnamese: 'vi', Thai: 'th',
  Turkish: 'tr', Polish: 'pl', Dutch: 'nl', Swedish: 'sv', Ukrainian: 'uk',
  Romanian: 'ro', Greek: 'el', Hebrew: 'he', Bengali: 'bn', Bulgarian: 'bg',
  Czech: 'cs', Danish: 'da', Finnish: 'fi', Hungarian: 'hu', Norwegian: 'no',
  Slovak: 'sk',
};

/** `needs-activation` means the browser wants a click before it downloads a model. */
export type TranslationFailure = 'unsupported' | 'needs-activation';

export type TranslateResult =
  | { ok: true; text: string }
  | { ok: false; reason: TranslationFailure };

export interface PrepareResult {
  ok: boolean;
  reason?: TranslationFailure;
}

interface TranslatorInstance {
  translate(text: string): Promise<string>;
}

interface TranslatorApi {
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (event: { loaded?: number }) => void;
  }): Promise<TranslatorInstance>;
}

interface DetectorInstance {
  detect(text: string): Promise<Array<{ detectedLanguage: string }>>;
}

interface DetectorApi {
  create(): Promise<DetectorInstance>;
}

/** The engine rejects very long strings, so long messages go sentence by sentence. */
const MAX_CHUNK_LENGTH = 400;

const translators = new Map<string, Promise<TranslatorInstance>>();
let detector: Promise<DetectorInstance> | undefined;

function translatorApi(): TranslatorApi | undefined {
  return (globalThis as { Translator?: TranslatorApi }).Translator;
}

function detectorApi(): DetectorApi | undefined {
  return (globalThis as { LanguageDetector?: DetectorApi }).LanguageDetector;
}

/** True when this browser ships the translation engine at all. */
export function nativeEngineSupported(): boolean {
  return typeof translatorApi()?.create === 'function';
}

function tagsFor(from: string, to: string): [string, string] | null {
  const source = LANGUAGE_TAGS[from];
  const target = LANGUAGE_TAGS[to];
  return source && target && source !== target ? [source, target] : null;
}

/** NotAllowedError is the browser asking for a click; anything else means no model. */
function failureFrom(error: unknown): TranslationFailure {
  return error instanceof Error && error.name === 'NotAllowedError'
    ? 'needs-activation'
    : 'unsupported';
}

function openTranslator(
  source: string,
  target: string,
  onProgress?: (ratio: number) => void
): Promise<TranslatorInstance> {
  const key = `${source}>${target}`;
  const existing = translators.get(key);
  if (existing) return existing;

  const api = translatorApi();
  if (!api) return Promise.reject(new Error('The translation engine is not available'));

  const created = api.create({
    sourceLanguage: source,
    targetLanguage: target,
    monitor: onProgress ? (event) => onProgress(event.loaded ?? 0) : undefined,
  });
  translators.set(key, created);
  // A failed create must not be cached, or every later attempt reuses the failure.
  created.catch(() => translators.delete(key));
  return created;
}

function chunkText(text: string): string[] {
  const sentences = text.split(/(?<=[.!?…])\s+|\n+/).filter((part) => part.trim());
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > MAX_CHUNK_LENGTH) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

/** Download and warm the model for one pair. Call from a click so the browser allows it. */
export async function prepareTranslation(
  from: string,
  to: string,
  onProgress?: (ratio: number) => void
): Promise<PrepareResult> {
  const tags = tagsFor(from, to);
  if (!tags || !nativeEngineSupported()) return { ok: false, reason: 'unsupported' };
  try {
    await openTranslator(tags[0], tags[1], onProgress);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: failureFrom(error) };
  }
}

/** Translate a message on the device. `from` may be `Auto-detect`. */
export async function translateOnDevice(
  text: string,
  from: string,
  to: string
): Promise<TranslateResult> {
  if (!text.trim()) return { ok: true, text };

  const source = from === 'Auto-detect' ? await detectOnDevice(text) : from;
  const tags = source ? tagsFor(source, to) : null;
  if (!tags || !nativeEngineSupported()) return { ok: false, reason: 'unsupported' };

  try {
    const translator = await openTranslator(tags[0], tags[1]);
    let translated = '';
    for (const chunk of chunkText(text)) {
      const part = await translator.translate(chunk);
      translated = translated ? `${translated} ${part}` : part;
    }
    return { ok: true, text: translated || text };
  } catch (error) {
    return { ok: false, reason: failureFrom(error) };
  }
}

/** Detect the language of a message, returned as one of this app's language names. */
export async function detectOnDevice(text: string): Promise<string | null> {
  const api = detectorApi();
  if (!api || !text.trim()) return null;

  try {
    detector ??= api.create();
    const [best] = await (await detector).detect(text);
    if (!best) return null;
    const base = best.detectedLanguage.split('-')[0];
    return Object.keys(LANGUAGE_TAGS).find((name) => LANGUAGE_TAGS[name] === base) ?? null;
  } catch {
    detector = undefined;
    return null;
  }
}
