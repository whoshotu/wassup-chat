// Idiom / phrase helper for disambiguation
// Provides a lightweight client‑side mechanism to detect ambiguous idioms
// and replace them with neutral English meanings before translation.

interface IdiomMap {
  [lang: string]: { [idiom: string]: string };
}

/** Load the static idiom JSON bundled with the app */
export function loadIdioms(): IdiomMap {
  // The JSON is imported at build time (Vite/Webpack can handle JSON imports).
  // Using a dynamic import to keep it lazy and allow bundling.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../data/idioms.json') as IdiomMap;
}

/** Detect whether a text likely contains ambiguous idioms.
 * Returns an object indicating if ambiguous and a list of matched idioms.
 */
export function detectAmbiguity(text: string, language: string): { ambiguous: boolean; matches: string[] } {
  const idioms = loadIdioms();
  const lower = text.toLowerCase();
  const langKey = language.toLowerCase();
  const matches: string[] = [];
  if (idioms[langKey]) {
    for (const idiom of Object.keys(idioms[langKey])) {
      if (lower.includes(idiom.toLowerCase())) {
        matches.push(idiom);
      }
    }
  }
  // Short‑sentence heuristic – if <=5 words and few common English words,
  // treat as ambiguous (could be idiomatic).
  const words = lower.trim().split(/\s+/);
  const short = words.length <= 5;
  const commonEnglish = ['the', 'and', 'you', 'for', 'that', 'with', 'this', 'have', 'from'];
  const commonCount = words.filter(w => commonEnglish.includes(w)).length;
  const heuristic = short && commonCount < 2;
  return { ambiguous: matches.length > 0 || heuristic, matches };
}

/** Replace idioms with their neutral meaning.
 * Returns the clarified text and a note summarising what was replaced.
 */
export function applyLocalDisambiguation(
  text: string,
  matches: string[],
  language: string
): { clarified: string; note: string } {
  const idioms = loadIdioms();
  const langKey = language.toLowerCase();
  let clarified = text;
  const replacements: string[] = [];
  for (const idiom of matches) {
    const meaning = idioms[langKey][idiom];
    if (meaning) {
      const re = new RegExp(idiom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'gi');
      clarified = clarified.replace(re, meaning);
      replacements.push(`"${idiom}" → "${meaning}"`);
    }
  }
  const note = replacements.length ? `Clarified idioms: ${replacements.join(', ')}` : '';
  return { clarified, note };
}
