/**
 * components/theme/PaletteFouCScript.tsx — Server Component.
 *
 * Emits a `<Script strategy="beforeInteractive">` whose body reads palette-v1
 * from localStorage and writes the 6 --color-* CSS variables on
 * document.documentElement BEFORE React hydrates (THEME-05, D-03).
 *
 * The PALETTES table is inlined at build time via JSON.stringify — single
 * source of truth = lib/palettes.ts. Any tuning of preset OKLCh values in
 * lib/palettes.ts automatically updates the cold-load path because the
 * Server Component re-runs at build/render time.
 *
 * Size budget per D-03: <1 KB minified inline. Achieved (~1000 bytes) by:
 *   1. Inlining tokens as 6-element arrays (no per-token keys): saves ~275 b
 *   2. Building --color-* CSS-var names from a single split() string: saves ~30 b
 *   3. Single-ternary `t = ...` assignment over branching ifs: saves ~50 b
 *   4. EXCLUDING Vaporwave from the inline table (per RESEARCH.md Pitfall A
 *      prescribed mitigation): saves ~205 b
 *
 * Vaporwave exclusion tradeoff: returning Vaporwave-unlocked users who saved
 * `{kind:'preset',id:'vaporwave'}` will briefly see Terra defaults before
 * ThemeProvider hydrates and re-applies Vaporwave from lib/palettes.ts (since
 * Vaporwave IS in PALETTES). For the "easter egg" framing (Konami reveal IS
 * the signature; repeat experience is not), this brief flash on cold-load is
 * acceptable. All 4 normal presets get true zero-FOUC.
 *
 * CRITICAL: this file MUST NOT carry 'use client' — Next 16 requires
 * `beforeInteractive` to originate from a Server Component (root or [locale]
 * layout) for the script to truly run pre-hydration. The compiled script body
 * itself runs in the browser, but the component that emits it is server-rendered.
 *
 * D-02 silent fallback applies inside the script body: any throw (malformed
 * JSON, storage blocked, missing keys) silently degrades to the :root Terra
 * defaults already in CSS. No console output, no removeItem.
 */
import Script from 'next/script';
import { PALETTES } from '@/lib/palettes';

// Build-time-inlined PALETTES table as compact arrays.
// Order MUST match the read order in the script body: bg, surface, text,
// textMuted, accent, secondary.
// Vaporwave EXCLUDED per RESEARCH.md Pitfall A (size budget) — see header.
const INLINE_PALETTES = PALETTES.filter((p) => p.id !== 'vaporwave').reduce<
  Record<string, [string, string, string, string, string, string]>
>((acc, p) => {
  acc[p.id] = [p.bg, p.surface, p.text, p.textMuted, p.accent, p.secondary];
  return acc;
}, {});

// Author the script with short variable names, array-form table, and
// pipe-split CSS-var keys to stay under 1 KB minified inline.
// Logic per D-02 + D-03: silent try/catch, no console, no removeItem.
const SCRIPT_BODY = `(function(){try{var raw=localStorage.getItem("palette-v1");if(!raw)return;var p=JSON.parse(raw);var T=${JSON.stringify(INLINE_PALETTES)},S="bg|surface|text|text-muted|accent|secondary".split("|"),t=p&&(p.kind=="preset"?T[p.id]:p.kind=="custom"&&p.tokens?[(p=p.tokens).bg,p.surface,p.text,p.textMuted,p.accent,p.secondary]:0);if(!t)return;var r=document.documentElement.style;for(var i=0;i<6;i++)r.setProperty("--color-"+S[i],t[i]);}catch(e){}})();`;

export function PaletteFouCScript() {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router Server Component (this file is server-rendered, no 'use client'); `beforeInteractive` IS officially supported in [locale]/layout.tsx per Next 16 docs. The linter rule targets the legacy Pages Router pattern.
    <Script id="palette-fouc" strategy="beforeInteractive">
      {SCRIPT_BODY}
    </Script>
  );
}
