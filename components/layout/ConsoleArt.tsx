'use client';

/**
 * components/layout/ConsoleArt.tsx — EGG-01 (Phase 3 D-34..D-36).
 *
 * Bilingual ASCII signature printed in the browser console on cold load.
 * Mounted as a sibling of <main> inside LenisProvider (see app/[locale]/layout.tsx
 * provider tree — D-11), the component renders `null` and serves only its
 * mount-time side effect.
 *
 * One-shot guarantee (D-35): a module-level `printed` flag survives React 19
 * Strict Mode's double-invoke AND survives template.tsx remounts across route
 * changes — both situations would otherwise cause the message to log twice.
 * The flag lives at module scope (outside the component function) so two
 * separate <ConsoleArt /> instances mounted by Strict Mode share the same
 * value. Tests reset the flag via the exported `__resetConsoleArt` helper.
 *
 * Test-environment skip (D-36): the guard `process.env.NODE_ENV === 'test'`
 * keeps the console clean during Vitest runs. The guard is checked BEFORE
 * setting `printed = true` so tests never accidentally trip the one-shot
 * flag for a sibling test in the same file.
 *
 * Locale dispatch (D-34): `useLocale()` from next-intl reads the active
 * locale; the value is narrowed to the union 'fr' | 'en' so getAsciiArt can
 * pattern-match without an `as` assertion at the call site. Any unexpected
 * value (e.g. future locale additions) defaults to 'fr' — safer than
 * throwing on a locale boundary that should never reach here.
 *
 * Accent color sourcing (D-35): the console.log uses a CSS `%c` placeholder
 * with a style string. `getComputedStyle(document.documentElement)` reads
 * the current `--color-accent` CSS variable so the message inherits the
 * active palette's accent at print time. Under jsdom (test env), the
 * getPropertyValue call returns '' — we fall back to `inherit` so the
 * console renders whatever its host default is. Under SSR there's no
 * document, but the useEffect body only runs client-side.
 */
import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { getAsciiArt } from '@/lib/ascii';

let printed = false;

export function ConsoleArt() {
  const locale = useLocale();

  useEffect(() => {
    if (printed) return;
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV === 'test') return;
    printed = true;
    const safeLocale: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr';
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim();
    const styleBlock =
      'font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; ' +
      `color: ${accent || 'inherit'}; ` +
      'line-height: 1.3;';
    // eslint-disable-next-line no-console
    console.log('%c' + getAsciiArt(safeLocale), styleBlock);
  }, [locale]);

  return null;
}

/**
 * Test-only helper. Resets the module-level `printed` flag between Vitest
 * cases so a test exercising the development-branch console.log can run
 * after a sibling test that asserts the test-branch skip.
 *
 * Never call this from application code.
 */
export function __resetConsoleArt() {
  printed = false;
}
