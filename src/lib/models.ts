/**
 * Gemini model catalogue shared by the web app and the extension.
 *
 * Only current, stable, free-tier text models belong here. Google shut down
 * gemini-1.5-flash on 2025-09-29 (requests now return 404) and restricts the 2.5
 * family to accounts that already used it, so neither is a safe default.
 * See https://ai.google.dev/gemini-api/docs/deprecations
 */

export const FREE_GEMINI_MODELS = [
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (default)' },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
] as const;

export const DEFAULT_GEMINI_MODEL = FREE_GEMINI_MODELS[0].id;

/** Coerce any stored value back to a model this app supports. */
export function getFreeGeminiModel(value: unknown): string {
  return FREE_GEMINI_MODELS.find((model) => model.id === value)?.id ?? DEFAULT_GEMINI_MODEL;
}

/** The other supported free model, used as a retry target when one is unavailable. */
export function getFallbackGeminiModel(value: unknown): string | undefined {
  const primary = getFreeGeminiModel(value);
  return FREE_GEMINI_MODELS.find((model) => model.id !== primary)?.id;
}
