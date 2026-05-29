/**
 * lib/ascii.ts — bilingual console ASCII signature for EGG-01 (Phase 3 D-34).
 *
 * Pure ES module — NO React, NO browser globals. Called from the client
 * component `components/layout/ConsoleArt.tsx` which is responsible for the
 * one-shot console.log on cold load (D-35), the NODE_ENV=test guard (D-36),
 * and the accent-color sourcing via getComputedStyle.
 *
 * Content shape per planner:
 *   1. A multi-line ASCII wordmark (FIGlet-style block letters for "Tanguy").
 *   2. 2-3 lines of locale-specific intro text.
 *   3. The portfolio GitHub repo URL (aspirational — invites future code
 *      review per FEATURES.md research; the repo exists, see git remote).
 *   4. A subtle Konami hint at the bottom. NO explanation of what the
 *      sequence unlocks — discoverability IS the easter egg.
 *
 * The Tech × Design × BIM line uses the unicode multiplication sign (U+00D7)
 * which is consistent with how it appears elsewhere in the app (e.g. the
 * <title> in app/[locale]/layout.tsx generateMetadata).
 */

// FIGlet "Calvin S" wordmark for "Tanguy". Compact, readable, and survives
// non-monospace console fonts better than the heavier ANSI Shadow option.
// Indented as a raw template string so the leading whitespace renders as
// intended in the browser console (which uses a monospace font by default).
const WORDMARK = String.raw`
 ╔╦╗┌─┐┌┐┌┌─┐┬ ┬┬ ┬
  ║ ├─┤││││ ┬│ │└┬┘
  ╩ ┴ ┴┘└┘└─┘└─┘ ┴`;

const GITHUB_URL = 'https://github.com/tanguynoumea-collab/portfolio';

// D-34: Konami hint with UTF-8 arrow glyphs. Comment-prefix `//` makes the
// line look like a source code annotation in the console — the discoverability
// IS the easter egg, so we deliberately do NOT explain what it unlocks.
const KONAMI_HINT = '// ↑ ↑ ↓ ↓ ← → ← → B A';

const FR_INTRO =
  'Spécialiste BIM — coordination & modélisation.\n' +
  "Si tu lis ceci, tu aimes jeter un œil sous le capot — bienvenue.";

const EN_INTRO =
  'BIM Specialist — coordination & modeling.\n' +
  'If you are reading this, you are the kind of person who looks under the hood — welcome.';

/**
 * Returns the multi-line ASCII signature for the given locale.
 *
 * @param locale - Either 'fr' or 'en'. The ConsoleArt component dispatches
 *   based on `useLocale()` and falls back to 'fr' for any unexpected value.
 * @returns Multi-line string containing wordmark + intro + GitHub link +
 *   Konami hint, separated by blank lines for readability in the console.
 */
export function getAsciiArt(locale: 'fr' | 'en'): string {
  const intro = locale === 'fr' ? FR_INTRO : EN_INTRO;
  return [
    WORDMARK,
    '',
    intro,
    '',
    `>> ${GITHUB_URL}`,
    '',
    KONAMI_HINT,
  ].join('\n');
}

// Named re-exports so the test + ConsoleArt can reference the literal values
// without re-parsing the composed string. Useful for assertion clarity and
// for letting ConsoleArt log a separate, structured representation if a
// future polish wants to render the URL as a clickable inspector link.
export const ASCII_GITHUB_URL = GITHUB_URL;
export const ASCII_KONAMI_HINT = KONAMI_HINT;
