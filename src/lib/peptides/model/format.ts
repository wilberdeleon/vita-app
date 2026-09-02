/**
 * Display formatting for catalog content.
 *
 * The problem this solves: research values are authored in plain lowercase
 * ("type 2 diabetes", "GLP-1 receptor") because that is how they read as data,
 * and rendering them raw makes a detail page look like a database dump. The
 * fix is one presentation layer rather than 71 hand-cased definitions, which
 * would drift the moment anyone added an entry.
 *
 * **A generic `toTitleCase()` would be wrong here.** It would produce "Glp-1
 * Receptor", "Mots-C", "Ghk-Cu", and "Hcg". So the rule is inverted: a token
 * that already contains a capital letter is *scientifically cased on purpose*
 * and is left exactly as the author wrote it. That single rule covers GLP-1,
 * GIP, MC1R, hCG, MOTS-c, c-Met, GHS-R1a, TGF-β, NAD+ and every future one,
 * without a maintained exception list that someone has to remember to update.
 */

/** Words that stay lowercase inside a phrase, but not at either end. */
const MINOR_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

function capitalizeWord(word: string): string {
  if (word.length === 0) return word;
  // Hyphenated words capitalize each part — "Dysfunction-Associated" — but
  // only where that part is itself all-lowercase, so "BPC-157" is untouched.
  return word
    .split('-')
    .map((part) => (part.length === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('-');
}

/**
 * A short content value, cased for display.
 *
 * "type 2 diabetes" → "Type 2 Diabetes"
 * "GLP-1 receptor"  → "GLP-1 Receptor"
 * "obesity & weight management" → "Obesity & Weight Management"
 * "diagnostic assessment of growth hormone secretion"
 *                   → "Diagnostic Assessment of Growth Hormone Secretion"
 * "MOTS-c"          → "MOTS-c"   (already capitalized somewhere: untouched)
 */
export function formatLabel(value: string): string {
  const words = value.trim().split(/\s+/);

  return words
    .map((word, index) => {
      // Already-capitalized tokens are deliberate scientific casing.
      if (/[A-Z]/.test(word)) return word;

      const isEdge = index === 0 || index === words.length - 1;
      const bare = word.replace(/[^a-z]/g, '');
      if (!isEdge && MINOR_WORDS.has(bare)) return word;

      return capitalizeWord(word);
    })
    .join(' ');
}

/** Formats a list of short values for display. */
export function formatLabels(values: readonly string[]): string[] {
  return values.map(formatLabel);
}
