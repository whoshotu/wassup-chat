export const FREE_GEMINI_MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (default)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
] as const;

export const DEFAULT_GEMINI_MODEL = FREE_GEMINI_MODELS[0].id;

export function getFreeGeminiModel(value: unknown): string {
  return FREE_GEMINI_MODELS.find((model) => model.id === value)?.id ?? DEFAULT_GEMINI_MODEL;
}
