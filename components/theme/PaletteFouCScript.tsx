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
 * Size budget per D-03: <1 KB minified. Each palette ~120 bytes (6 OKLCh
 * strings + id), 5 palettes ≈ 600 bytes + ~250 bytes of parser logic.
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

// Build-time-inlined PALETTES table (only the 6 token strings per id, no name/display).
// Vaporwave INCLUDED so the cold-load path still works if a user (who unlocked
// Vaporwave previously) returns with palette-v1 = {kind:'preset',id:'vaporwave'}.
const INLINE_PALETTES = PALETTES.reduce<Record<string, Record<string, string>>>(
  (acc, p) => {
    acc[p.id] = {
      bg: p.bg,
      surface: p.surface,
      text: p.text,
      textMuted: p.textMuted,
      accent: p.accent,
      secondary: p.secondary,
    };
    return acc;
  },
  {},
);

// Author the script with short variable names to stay under 1 KB.
// Logic per D-02 + D-03: silent try/catch, no console, no removeItem.
const SCRIPT_BODY = `(function(){try{var raw=localStorage.getItem('palette-v1');if(!raw)return;var p=JSON.parse(raw);var T=${JSON.stringify(INLINE_PALETTES)};var t=null;if(p&&p.kind==='preset'&&T[p.id])t=T[p.id];else if(p&&p.kind==='custom'&&p.tokens)t=p.tokens;if(!t)return;var r=document.documentElement.style;r.setProperty('--color-bg',t.bg);r.setProperty('--color-surface',t.surface);r.setProperty('--color-text',t.text);r.setProperty('--color-text-muted',t.textMuted);r.setProperty('--color-accent',t.accent);r.setProperty('--color-secondary',t.secondary);}catch(e){}})();`;

export function PaletteFouCScript() {
  return (
    <Script id="palette-fouc" strategy="beforeInteractive">
      {SCRIPT_BODY}
    </Script>
  );
}
