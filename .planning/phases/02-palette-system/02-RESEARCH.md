# Phase 2: Palette System - Research

**Researched:** 2026-05-26
**Domain:** Runtime CSS-variable theming, OKLCh color science, WCAG enforcement, FOUC-free persistence, Sheet UX, Konami easter egg
**Confidence:** HIGH (Phase 1 deliverables already shipped; stack pre-locked from CONTEXT.md; library APIs verified against official docs)

## Summary

Phase 2 is the signature feature delivery — wire a 5-palette runtime switcher into the foundation that Phase 1 shipped (CSS variables in `:root`, shadcn alias chain, FOUC `<head>` socket, typed `PALETTES` constant). The work splits into three pure-logic concerns and one UI concern:

1. **`lib/colors.ts`** — six exported functions (`wcagContrast`, `adjustForAA`, `validateFullMatrix`, `generateHarmonic`, `pickTextOnAccent`, `deriveDefaultTokens`) wrapping culori's OKLCh primitives and the 7-pair WCAG matrix from PITFALLS.md Pitfall #3. No React, no DOM.
2. **`lib/storage.ts`** — read/write/validate `palette-v1` and `palette-secrets-v1` with silent fallback (D-02), shared by ThemeProvider and the FOUC script source.
3. **FOUC `<Script strategy="beforeInteractive">`** — Next.js auto-injects it into `<head>`; the inline JS reads localStorage and writes 6 `--color-*` properties before React hydrates. Build-time-inlined `PALETTES` table keeps it self-contained.
4. **`components/theme/*`** — ThemeProvider (state + Konami listener + CSS-var writer + persistence) + Sheet-based PaletteSwitcher (Presets / Custom / Generate tabs with sticky WCAGBadge footer) + FAB.

**Primary recommendation:** Build pure logic first (`lib/colors.ts` + `lib/storage.ts` + Vaporwave WCAG pre-validation), then ThemeProvider scaffolding (state + FOUC script), then UI components in this order: WCAGBadge → PalettePresets → CustomColorPicker → HarmonicGenerator → PaletteSwitcher shell → PaletteFab → useKonamiCode integration. Each layer has a clean API surface; downstream layers consume `usePalette()` and never reach into provider internals.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Persistence & FOUC**
- **D-01:** Hybrid localStorage shape under two keys:
  - `palette-v1` — `{ kind: 'preset', id: PaletteId }` OR `{ kind: 'custom', tokens: { bg, surface, text, textMuted, accent, secondary }, source: 'picker' | 'harmonic' }`
  - `palette-secrets-v1` — `{ vaporwave: boolean }` (object shape, extensible)
- **D-02:** Silent hard fallback to Terra on any storage error. `try/catch` around parse + shape validation. On failure: do nothing, leave storage intact, no console.error, no toast. Defaults in `:root` already render Terra.
- **D-03:** FOUC `<Script strategy="beforeInteractive">` in `app/[locale]/layout.tsx` `<head>` socket. Build-time-inlined `PALETTES` table from `lib/palettes.ts`. Script reads `palette-v1`, looks up preset id or applies stored tokens via `document.documentElement.style.setProperty`. Wrapped in `try/catch`. Target size <1 KB minified.

**PaletteSwitcher Form Factor**
- **D-04:** Install shadcn `Sheet` via `npx shadcn@latest add sheet`. Right-anchored (`side="right"`). Brings focus trap, Esc-to-close, overlay.
- **D-05:** Responsive Sheet width. Below `md`: full-width with backdrop dimmer. At `md`+: 400-440px with backdrop dimmer.
- **D-06:** WCAGBadge in sticky footer of Sheet, visible across all 3 tabs. Bottom strip (~40px) shows live ratio (2 decimals) + status (AA / AAA / Fail). When `adjustForAA` triggered a fix, "Adjusted for AA" chip appears with hover tooltip.
- **D-07:** Always default to Presets tab on Sheet open. No last-used-tab persistence.
- **D-08:** FAB uses Lucide `palette` icon. Hover: scale 1.0→1.08 + rotate 5deg, 200ms ease. While Sheet open: rotate 180deg + crossfade to Lucide X. `prefers-reduced-motion`: opacity-only feedback. Position: fixed bottom-right with safe-area-inset padding.

**Custom + Harmonic UX**
- **D-09:** Custom picker uses 3 native `<input type="color">` for bg, accent, secondary. culori converts returned hex → OKLCh internally. (REQ THEME-07 "3 HSL inputs" reframed to 3 visual color pickers.)
- **D-10:** Token derivation when user customizes 3 of 6 tokens:
  - `surface` = `bg` with ~3% L shift (lighten on light bg, darken on dark)
  - `text` = OKLCh near-black (`0.15 0 0`) or near-white (`0.95 0 0`), whichever passes 4.5:1 vs bg
  - `textMuted` = OKLCh interpolation halfway between text and bg, clamped via `adjustForAA(textMuted, bg)` to 4.5:1
- **D-11:** Silent WCAG auto-adjust via `adjustForAA`. Only `text`/`textMuted` shift in L (accent/secondary preserved). Failing combos never reach `:root`. "Adjusted for AA" chip when fix applied.
- **D-12:** Harmonic preview inline inside Generate tab. 6-swatch grid with `Aa` sample text overlaid in resolved `text` color. Sticky-footer WCAGBadge updates live. "Apply" button commits to `:root` + storage. Generate tab stays active after apply.

**Konami Unlock UX**
- **D-13:** Confetti via `canvas-confetti` (dynamic-imported only when Konami completes). Particle colors from Vaporwave.accent + Vaporwave.secondary.
- **D-14:** On unlock: confetti burst → `setPreset('vaporwave')` → Sheet auto-opens on Presets tab with Vaporwave card highlighted active.
- **D-15:** Post-unlock, Vaporwave card shows real name "Vaporwave". `messages/{fr,en}.json` `palette.presets.vaporwave` changes from "???" to "Vaporwave". `PalettePresets` filters Vaporwave out when `!isVaporwaveUnlocked`.
- **D-16:** `useKonamiCode` hook lives inside ThemeProvider. Sequence: ArrowUp×2, ArrowDown×2, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, KeyB, KeyA. Filters when `document.activeElement` is INPUT/TEXTAREA/[contenteditable].

### Claude's Discretion

- Exact `surface` L-shift amount for D-10 (~3% is starting point; researcher confirms against culori behavior on light vs dark bgs).
- `adjustForAA` algorithm internals — iterative L-shift binary search vs single-pass with chroma reduction. Either is fine if contract holds (input + minRatio → output meets minRatio with minimal perceptual change).
- Exact desktop Sheet width (400 vs 420 vs 440px) — planner picks.
- Exact transition timing on Sheet open/close. Phase 1 global 400ms transition covers palette swap but NOT Sheet transform/opacity.
- canvas-confetti parameters (particleCount, duration, spread, gravity).
- `useKonamiCode` inter-keystroke timeout (suggest yes, ~1-2s, to avoid accidental re-triggers).
- Where ThemeProvider sits in the layout tree — default **inside** `NextIntlClientProvider` (palette UI uses i18n).
- Console output on Konami unlock — optional flourish.
- `prefers-reduced-motion` fallback for confetti — suggest fade-only.

### Deferred Ideas (OUT OF SCOPE)

- `tw-animate-css` integration check for Sheet (planner notes; likely fine, transforms not in global transition list).
- Palette export/import (URL share, JSON download) — THEME-v2-01.
- Preview-before-application for Custom tab — THEME-v2-02. v1 ships Custom as direct-apply.
- Audio cue on Konami unlock — explicit anti-feature.
- More harmonic modes (tetradic, square, monochromatic).
- Last-used tab persistence — rejected per D-07.
- "Reset to active preset" button in Custom tab.
- "Randomize source color" shortcut in Generate.
- `ScrollTrigger.refresh()` after palette swap — Phase 3 concern. ThemeProvider exposes a `paletteChangeEvent` or similar hook for the LenisProvider to consume.
- Cookie-based SSR palette restore — not in REQs.
- "NEW" badge on Vaporwave card post-unlock — rejected.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THEME-01 | 5 typed palettes in `lib/palettes.ts`, all pre-validated WCAG AA | Phase 1 shipped 5 palettes; this phase adds Vaporwave WCAG pre-validation (run `validateFullMatrix(vaporwavePalette)`; if fails, apply `adjustForAA` at definition time and update OKLCh values in `lib/palettes.ts`). See "Vaporwave Pre-Validation" below. |
| THEME-02 | `lib/colors.ts` exports `wcagContrast`, `adjustForAA`, `validateFullMatrix` (7-pair) returning `{valid, failures}` | culori's `wcagContrast()` returns a number. CRITICAL_PAIRS array from PITFALLS.md Pitfall #3. `adjustForAA` algorithm: iterative L-shift in OKLCh. |
| THEME-03 | `generateHarmonic(mode, sourceColor)` — 4 modes via OKLCh hue rotation, auto-adjusted to AA | culori has no built-in harmonic generator. Rotate hue: complementary +180°, triadic +120°/+240°, analogous ±30°, split-complementary +150°/+210°. ~30 LOC. |
| THEME-04 | `ThemeProvider` (client) — Context, applies CSS vars to `:root`, exposes `usePalette()` returning `{palette, paletteId, setPreset, setCustomColor, setHarmonic, isCustom}`, persists to localStorage | React Context + `useReducer` (recommended for multi-action state). `usePalette()` consumer hook. Persistence via storage helpers from D-01. |
| THEME-05 | Inline `<Script strategy="beforeInteractive">` reads localStorage + applies CSS vars pre-hydration — zero FOUC | Next.js auto-moves `beforeInteractive` scripts into `<head>`. `dangerouslySetInnerHTML` for inline script body. Build-time-inlined PALETTES (~600 bytes). |
| THEME-06 | `PalettePresets` — 4 mini-aperçus carrés cliquables (vaporwave hidden until unlock), motion animation on selection, active indicator | Server-driven static cards reading `PALETTES`. Filter via `!isVaporwaveUnlocked`. motion `motion/react` for select animation, gated on `useReducedMotion`. |
| THEME-07 | `CustomColorPicker` — 3 native `<input type="color">` (bg/accent/secondary), live preview, `setCustomColor` updates palette, derives 3 missing tokens via `lib/colors.ts` | culori `parse(hex)` → OKLCh. Token derivation per D-10. |
| THEME-08 | `HarmonicGenerator` — source color picker + 4-mode selector + Generate button + preview | Inline preview per D-12. Calls `generateHarmonic(mode, source)`. Source picker is `<input type="color">` for consistency with D-09. |
| THEME-09 | `WCAGBadge` — live ratio (2 decimals) + status AA/AAA/Fail with colored icon, updates instantly on palette change | Reads `usePalette()`. Computes worst-pair ratio across 7-pair matrix. Lucide icons (Check / CheckCheck / X). |
| THEME-10 | `PaletteSwitcher` — right-anchored Sheet with 3 tabs (Presets/Custom/Generate), keyboard navigable (Tab, Esc, focus trap) | shadcn Sheet ships focus trap + Esc + aria-modal via Radix Dialog. Sticky footer per D-06. |
| THEME-11 | FAB bottom-right with Lucide palette icon, opens PaletteSwitcher, visible on all pages, localized aria-label | Mounted as sibling to `{children}` inside ThemeProvider. `useTranslations('palette')` for aria-label. Per D-08 motion. |
| THEME-12 | `useKonamiCode()` hook — listens for ↑↑↓↓←→←→BA, filters when input/textarea/contentEditable focused, unlocks Vaporwave + confetti | Lives inside ThemeProvider per D-16. Pattern from PITFALLS.md Pitfall #12. Dynamic-import canvas-confetti per D-13. |

## Standard Stack

### Core (already locked from Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.2.6 | App Router, `next/script` | Already installed |
| react | ^19.2.4 | UI runtime | Already installed |
| typescript | ^5 (5.6+ recommended) | strict, no `any` | Already installed |
| tailwindcss | ^4 | `@theme inline` to CSS vars | Already configured |
| next-intl | ^4.12.0 | Translations for palette UI labels + aria-labels | Already wired |
| radix-ui | ^1.4.3 (umbrella) | Sheet primitive (under shadcn Sheet) | Already installed |
| lucide-react | ^1.16.0 | `palette`, `x`, `check`, `check-check` icons for FAB, close, WCAG badge | Already installed |
| tw-animate-css | ^1.4.0 | Sheet slide-in animations | Already installed |

### NEW for Phase 2

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **culori** | ^4.0.2 | OKLCh ↔ hex conversion, `wcagContrast`, `interpolate`, OKLCh hue arithmetic | Modern ESM, perceptually uniform OKLCh, used by Tailwind v4 and Radix Colors. **No built-in harmonic generator** — we compose ~30 LOC. Tree-shakeable via `culori/fn` subpath. Verified 4.0.2 (Apr 2025, 11 months old, stable). |
| **canvas-confetti** | ^1.9.4 | Konami unlock celebration | ~4 KB gzip, MIT, mature, dynamic-imported only on unlock so zero cold-load cost. Verified 1.9.4 latest. |
| **motion** | ^12.40.0 | FAB hover/rotate animation, `useReducedMotion` hook | NOT yet installed — install in Phase 2. `framer-motion` rebranded to `motion`, import from `motion/react`. Already specified in STACK.md. Verified 12.40.0 latest. |
| **shadcn `sheet`** | (via shadcn CLI) | Right-anchored panel with focus trap | Install via `npx shadcn@latest add sheet`. Brings `@radix-ui/react-dialog` patterns. Already 7 shadcn primitives installed; `sheet` is the 8th. |

**Installation:**

```bash
npm install culori canvas-confetti motion
npm install --save-dev @types/canvas-confetti
npx shadcn@latest add sheet
```

**Note on culori types:** culori v4 ships `.d.ts` natively — no `@types/culori` needed. Verified via `npm view culori` (255 dependents, 11 months stable).

**Version verification commands** (run pre-install to confirm currency):
```bash
npm view culori version           # → 4.0.2
npm view canvas-confetti version  # → 1.9.4
npm view motion version           # → 12.40.0
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| culori | chroma-js, colorjs.io, colord, tinycolor2 | chroma-js larger and CommonJS-first; colorjs.io reference but heavier; colord lacks OKLCh. culori wins on Tailwind v4 alignment. (Already locked in STACK.md.) |
| canvas-confetti | party-js, tsParticles | canvas-confetti is smallest + most mature for one-shot bursts. tsParticles is overkill. |
| shadcn Sheet | Custom motion-driven slide-in | Sheet ships focus trap + Esc + ARIA out of the box via Radix Dialog. Building from scratch = retrofitting a11y. |
| 3 native `<input type="color">` | HSL sliders, custom popover color picker | Native picker is OS-familiar, zero JS overhead, well-tested a11y. D-09 locked. |

## Architecture Patterns

### Recommended Project Structure

```
components/
├── providers/
│   └── ThemeProvider.tsx          # Client. Context, state (useReducer), CSS-var writer,
│                                  # persistence, Konami listener mount.
├── theme/
│   ├── PaletteFouCScript.tsx      # Server. Renders <Script strategy="beforeInteractive">
│   │                              # with inline JS + build-time PALETTES table.
│   ├── PaletteFab.tsx             # Client. Lucide palette icon, hover/open motion,
│   │                              # opens Sheet via prop.
│   ├── PaletteSwitcher.tsx        # Client. Sheet shell with Tabs, sticky footer slot.
│   ├── PalettePresets.tsx         # Client. 4 (or 5) preset cards, motion on select.
│   ├── CustomColorPicker.tsx      # Client. 3 native color inputs, derivation logic.
│   ├── HarmonicGenerator.tsx      # Client. Source picker + 4 modes + preview grid + apply.
│   └── WCAGBadge.tsx              # Client. Live ratio + AA/AAA/Fail icon + adjusted chip.
└── ui/
    └── sheet.tsx                  # NEW — shadcn add sheet.

lib/
├── colors.ts                      # wcagContrast, adjustForAA, validateFullMatrix,
│                                  # generateHarmonic, pickTextOnAccent, deriveDefaultTokens.
├── storage.ts                     # read/write/validate palette-v1 + palette-secrets-v1.
└── hooks/
    ├── useKonamiCode.ts           # The sequence listener with input filtering.
    └── usePrefersReducedMotion.ts # SSR-safe matchMedia wrapper.
```

### Pattern 1: ThemeProvider with useReducer

**What:** Single source of truth for palette + unlock state. `useReducer` handles multi-action transitions cleanly.

**When to use:** Anywhere multiple distinct actions mutate the same state (setPreset / setCustomColor / setHarmonic / unlockVaporwave). useState becomes a tangle of setters; useReducer makes it explicit.

**State shape:**

```ts
type Palette = {
  bg: string;       // OKLCh CSS string
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  secondary: string;
};

type ThemeState = {
  palette: Palette;                    // ALWAYS the full 6 tokens — single derived source
  paletteId: PaletteId | 'custom';     // discriminator for UI ("which preset card is active")
  isCustom: boolean;                   // derived from paletteId === 'custom'
  customSource: 'picker' | 'harmonic' | null;
  isVaporwaveUnlocked: boolean;
  wasAdjustedForAA: boolean;           // drives "Adjusted for AA" chip in WCAGBadge
};

type ThemeAction =
  | { type: 'SET_PRESET'; id: PaletteId }
  | { type: 'SET_CUSTOM_FROM_PICKER'; userInput: { bg: string; accent: string; secondary: string } }
  | { type: 'SET_HARMONIC'; mode: HarmonicMode; sourceColor: string }
  | { type: 'UNLOCK_VAPORWAVE' };
```

**Why "full 6 tokens always present":** Avoids `paletteId vs overrides` split that creates two sources of truth. Every consumer (`WCAGBadge`, `CustomColorPicker` preview, FOUC script) reads from the same `palette` object. `isCustom` is derived (not stored), `wasAdjustedForAA` is set by the reducer when `adjustForAA` returned a different value than input.

**Example:**

```tsx
// components/providers/ThemeProvider.tsx
'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { PALETTES, getPaletteById, DEFAULT_PALETTE_ID, type Palette, type PaletteId } from '@/lib/palettes';
import { adjustForAA, generateHarmonic, deriveDefaultTokens } from '@/lib/colors';
import { readPaletteV1, writePaletteV1, readSecretsV1, writeSecretsV1 } from '@/lib/storage';
import { useKonamiCode } from '@/lib/hooks/useKonamiCode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function reducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_PRESET': {
      const preset = getPaletteById(action.id);
      // Vaporwave already pre-validated at definition time — no adjustForAA needed
      return { ...state, palette: preset, paletteId: action.id, isCustom: false,
               customSource: null, wasAdjustedForAA: false };
    }
    case 'SET_CUSTOM_FROM_PICKER': {
      const derived = deriveDefaultTokens(action.userInput);  // produces surface/text/textMuted
      const { palette: adjusted, wasAdjusted } = applyMatrixAdjust(derived);
      return { ...state, palette: adjusted, paletteId: 'custom', isCustom: true,
               customSource: 'picker', wasAdjustedForAA: wasAdjusted };
    }
    case 'SET_HARMONIC': {
      const generated = generateHarmonic(action.mode, action.sourceColor);  // returns full 6-token Palette
      const { palette: adjusted, wasAdjusted } = applyMatrixAdjust(generated);
      return { ...state, palette: adjusted, paletteId: 'custom', isCustom: true,
               customSource: 'harmonic', wasAdjustedForAA: wasAdjusted };
    }
    case 'UNLOCK_VAPORWAVE': {
      return { ...state, isVaporwaveUnlocked: true };
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initFromStorage);

  // Write CSS variables on every palette change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', state.palette.bg);
    root.style.setProperty('--color-surface', state.palette.surface);
    root.style.setProperty('--color-text', state.palette.text);
    root.style.setProperty('--color-text-muted', state.palette.textMuted);
    root.style.setProperty('--color-accent', state.palette.accent);
    root.style.setProperty('--color-secondary', state.palette.secondary);
  }, [state.palette]);

  // Persist palette
  useEffect(() => {
    if (state.paletteId === 'custom') {
      writePaletteV1({ kind: 'custom', tokens: state.palette, source: state.customSource! });
    } else {
      writePaletteV1({ kind: 'preset', id: state.paletteId });
    }
  }, [state.palette, state.paletteId, state.customSource]);

  // Persist unlock state
  useEffect(() => {
    writeSecretsV1({ vaporwave: state.isVaporwaveUnlocked });
  }, [state.isVaporwaveUnlocked]);

  // Konami listener — globally scoped
  useKonamiCode(() => {
    // confetti dynamic import, then UNLOCK + SET_PRESET('vaporwave')
    handleUnlock();
  });

  // ... context value, return JSX
}
```

### Pattern 2: FOUC `<Script strategy="beforeInteractive">` Generation

**What:** A Server Component renders `<Script strategy="beforeInteractive">` with an inline body generated server-side that embeds the PALETTES table. Next.js auto-moves the script into `<head>` regardless of where it's placed in the tree.

**Key Next 16 facts (verified against nextjs.org/docs):**
- `beforeInteractive` scripts MUST be placed inside the root layout (or `[locale]/layout.tsx`).
- Next.js auto-injects the script into `<head>` — placement in JSX doesn't matter, only that it's in a server component.
- Inline scripts via children + template literal work.
- `onLoad` / `onError` / `onReady` are NOT compatible with `beforeInteractive`. We don't need them — fire-and-forget pre-paint.

**Example:**

```tsx
// components/theme/PaletteFouCScript.tsx — Server Component
import Script from 'next/script';
import { PALETTES, DEFAULT_PALETTE_ID } from '@/lib/palettes';

const INLINE_PALETTES = PALETTES.reduce(
  (acc, p) => {
    acc[p.id] = { bg: p.bg, surface: p.surface, text: p.text,
                  textMuted: p.textMuted, accent: p.accent, secondary: p.secondary };
    return acc;
  },
  {} as Record<string, Record<string, string>>,
);

const SCRIPT_BODY = `
(function(){try{
  var raw=localStorage.getItem('palette-v1');
  if(!raw)return;
  var p=JSON.parse(raw);
  var T=${JSON.stringify(INLINE_PALETTES)};
  var t=null;
  if(p&&p.kind==='preset'&&T[p.id])t=T[p.id];
  else if(p&&p.kind==='custom'&&p.tokens)t=p.tokens;
  if(!t)return;
  var r=document.documentElement.style;
  r.setProperty('--color-bg',t.bg);
  r.setProperty('--color-surface',t.surface);
  r.setProperty('--color-text',t.text);
  r.setProperty('--color-text-muted',t.textMuted);
  r.setProperty('--color-accent',t.accent);
  r.setProperty('--color-secondary',t.secondary);
}catch(e){}})();
`.trim();

export function PaletteFouCScript() {
  return (
    <Script id="palette-fouc" strategy="beforeInteractive">
      {SCRIPT_BODY}
    </Script>
  );
}
```

**Mount point** in `app/[locale]/layout.tsx` `<head>` (lines 27-42 of existing layout):

```tsx
<head>
  <PaletteFouCScript />
</head>
```

**Size budget:** 5 palettes × 6 OKLCh strings ≈ 600 bytes + ~250 bytes parser. Under 1 KB target. Verifiable post-build with `next build && cat .next/server/app/[locale]/layout.html | grep palette-fouc | wc -c`.

### Pattern 3: OKLCh Hue Rotation for `generateHarmonic`

**What:** culori has no built-in harmonic generator. The implementation rotates the `h` (hue) channel of an OKLCh color and constructs new OKLCh swatches. ~30 LOC.

**culori API used:**
- `parse(hexString) → Color | undefined` — converts hex from `<input type="color">` to whatever color space is encoded.
- `converter('oklch') → fn` — gives a converter from any color space to OKLCh.
- `formatCss('oklch', oklchObject) → 'oklch(L C H)' string` — back to CSS for `:root`.

**Pattern:**

```ts
// lib/colors.ts
import { parse, converter, formatCss } from 'culori';

const toOklch = converter('oklch');

export type HarmonicMode = 'complementary' | 'triadic' | 'analogous' | 'split-complementary';

const HUE_OFFSETS: Record<HarmonicMode, number[]> = {
  complementary: [0, 180],
  triadic: [0, 120, 240],
  analogous: [-30, 0, 30],
  'split-complementary': [0, 150, 210],
};

function rotateHue(oklch: { l: number; c: number; h?: number }, deltaDeg: number) {
  const h = ((oklch.h ?? 0) + deltaDeg + 360) % 360;
  return { mode: 'oklch' as const, l: oklch.l, c: oklch.c, h };
}

export function generateHarmonic(mode: HarmonicMode, sourceHex: string): Palette {
  const sourceOklch = toOklch(parse(sourceHex));
  if (!sourceOklch) throw new Error(`Invalid source color: ${sourceHex}`);

  const offsets = HUE_OFFSETS[mode];
  const accent = formatCss(sourceOklch);
  const secondary = formatCss(rotateHue(sourceOklch, offsets[1] ?? 180));

  // Derive bg, surface from source: low chroma, near-white if source is dark, near-black if light
  const isLightSource = sourceOklch.l > 0.5;
  const bg = isLightSource
    ? `oklch(0.97 0.01 ${sourceOklch.h ?? 0})`
    : `oklch(0.95 0.012 ${sourceOklch.h ?? 0})`;
  const surface = isLightSource
    ? `oklch(0.94 0.015 ${sourceOklch.h ?? 0})`
    : `oklch(0.91 0.018 ${sourceOklch.h ?? 0})`;

  // text + textMuted derived to pass 4.5:1 vs bg via existing helpers
  const { text, textMuted } = deriveTextTokens(bg);

  return { bg, surface, text, textMuted, accent, secondary };
}
```

### Pattern 4: `adjustForAA` Algorithm — Iterative L-Shift

**What:** Given a text color and bg color, shift the OKLCh `l` channel of the text until `wcagContrast(text, bg) >= minRatio`. Preserve chroma and hue.

**When to use:** Every time a custom palette is applied. The "Adjusted for AA" chip displays when this fires.

**Algorithm (binary search variant, ~12 iterations max for 0.5 → 0 or 0.5 → 1):**

```ts
export function adjustForAA(textColor: string, bgColor: string, minRatio = 4.5): {
  adjusted: string;
  wasAdjusted: boolean;
} {
  const { wcagContrast, parse, converter, formatCss } = require('culori');
  const toOklch = converter('oklch');
  const textOklch = toOklch(parse(textColor));
  const bgOklch = toOklch(parse(bgColor));
  if (!textOklch || !bgOklch) return { adjusted: textColor, wasAdjusted: false };

  // Already passes?
  if (wcagContrast(textColor, bgColor) >= minRatio) {
    return { adjusted: textColor, wasAdjusted: false };
  }

  // Determine direction: if bg is light, push text darker (lower L); if dark, push lighter
  const direction = bgOklch.l > 0.5 ? -1 : 1;

  // Binary search on L
  let lo = direction === -1 ? 0 : textOklch.l;
  let hi = direction === -1 ? textOklch.l : 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const candidate = { mode: 'oklch' as const, l: mid, c: textOklch.c, h: textOklch.h };
    const candidateStr = formatCss(candidate);
    const ratio = wcagContrast(candidateStr, bgColor);
    if (ratio >= minRatio && ratio < minRatio + 0.1) {
      return { adjusted: candidateStr, wasAdjusted: true };
    }
    if (ratio < minRatio) {
      // Need more contrast: continue in direction
      if (direction === -1) hi = mid; else lo = mid;
    } else {
      if (direction === -1) lo = mid; else hi = mid;
    }
  }
  // Edge case: even L=0 or L=1 can't pass (would mean accent is mid-saturated AND mid-L)
  // Fall back to near-black or near-white
  const fallback = direction === -1 ? 'oklch(0.15 0 0)' : 'oklch(0.95 0 0)';
  return { adjusted: fallback, wasAdjusted: true };
}
```

**Edge case handling:** When `pickTextOnAccent(accent)` is needed (button text on accent bg, focus ring on accent), iterate through candidate colors before falling back:

```ts
export function pickTextOnAccent(accent: string, preferredText: string, bg: string): string {
  const candidates = [preferredText, bg, 'oklch(0.15 0 0)', 'oklch(0.98 0.005 80)'];
  for (const c of candidates) {
    if (wcagContrast(c, accent) >= 4.5) return c;
  }
  // Last resort: adjustForAA against accent
  return adjustForAA(preferredText, accent).adjusted;
}
```

**Performance note:** `adjustForAA` runs on every palette change. For the harmonic preview, this means recomputing on every source-color picker change. Debouncing the picker input (~100ms) prevents over-computation but is optional — culori's `wcagContrast` is fast (<0.1ms per call).

### Pattern 5: 7-Pair WCAG Matrix Validation

**What:** Validate all 7 critical color pairs against minimum ratios (4.5 for text pairs, 3.0 for UI element pairs). Returns `{valid, failures}`.

**Source:** PITFALLS.md Pitfall #3, verbatim CRITICAL_PAIRS structure.

```ts
const CRITICAL_PAIRS: Array<[keyof Palette, keyof Palette, number]> = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['textMuted', 'bg', 4.5],
  ['textMuted', 'surface', 4.5],
  ['accent', 'bg', 3.0],          // WCAG 1.4.11 — focus ring, icon on bg
  ['accent', 'surface', 3.0],
  ['secondary', 'bg', 3.0],
];

export function validateFullMatrix(p: Palette): { valid: boolean; failures: string[] } {
  const failures: string[] = [];
  for (const [fg, bg, min] of CRITICAL_PAIRS) {
    const ratio = wcagContrast(p[fg], p[bg]);
    if (ratio < min) {
      failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
    }
  }
  return { valid: failures.length === 0, failures };
}
```

### Pattern 6: `applyMatrixAdjust` — Auto-Adjust Before Commit (D-11)

**What:** Take a candidate palette, run validateFullMatrix; if any text/textMuted pair fails, apply `adjustForAA` to that token; return adjusted palette + `wasAdjusted` flag.

```ts
export function applyMatrixAdjust(candidate: Palette): { palette: Palette; wasAdjusted: boolean } {
  let wasAdjusted = false;
  const result = { ...candidate };

  // Adjust text against worst-case bg
  for (const bgKey of ['bg', 'surface'] as const) {
    if (wcagContrast(result.text, result[bgKey]) < 4.5) {
      const { adjusted, wasAdjusted: did } = adjustForAA(result.text, result[bgKey], 4.5);
      result.text = adjusted;
      wasAdjusted = wasAdjusted || did;
    }
    if (wcagContrast(result.textMuted, result[bgKey]) < 4.5) {
      const { adjusted, wasAdjusted: did } = adjustForAA(result.textMuted, result[bgKey], 4.5);
      result.textMuted = adjusted;
      wasAdjusted = wasAdjusted || did;
    }
  }

  // Note: accent/secondary not adjusted (D-11) — they are preserved. If accent fails 3.0 vs bg,
  // that's exposed in the WCAGBadge "Fail" path but only in TRANSIENT validation states;
  // committed-to-:root palette never fails because we adjust text to compensate.

  return { palette: result, wasAdjusted };
}
```

### Pattern 7: Konami Code Hook with Input Filtering

**What:** Global `keydown` listener, sequence-tracking via ref, input-target filter, reset on wrong key.

**Source:** PITFALLS.md Pitfall #12 verbatim (already audited).

```ts
// lib/hooks/useKonamiCode.ts
'use client';

import { useEffect, useRef } from 'react';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function useKonamiCode(onUnlock: () => void, options?: { resetMs?: number }) {
  const progress = useRef(0);
  const lastKeyAt = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Filter input targets
      const t = document.activeElement as HTMLElement | null;
      if (!t) return;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
      if (t.isContentEditable) return;

      // Reset if too much time has passed since last key
      const now = Date.now();
      const resetMs = options?.resetMs ?? 1500;
      if (now - lastKeyAt.current > resetMs) progress.current = 0;
      lastKeyAt.current = now;

      // Match against sequence using e.code (KeyB, KeyA, ArrowUp — keyboard-layout-independent)
      const expected = SEQUENCE[progress.current];
      if (e.code === expected) {
        progress.current += 1;
        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          onUnlock();
        }
      } else {
        // Wrong key — reset, but check if THIS key starts the sequence
        progress.current = e.code === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUnlock, options?.resetMs]);
}
```

**Note on `e.code` vs `e.key`:** Using `e.code` (KeyB, KeyA, ArrowUp) makes the sequence keyboard-layout-independent (AZERTY French keyboards still produce KeyA when pressing A). `e.key` would require lowercasing and special-handling 'a' vs 'A' for shift states. CONTEXT.md D-16 specifies "ArrowUp×2, ArrowDown×2, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, KeyB, KeyA" — using `e.code` directly aligns with this naming.

### Pattern 8: `usePrefersReducedMotion` Custom Hook

**Note:** motion's `useReducedMotion` (from `motion/react`) works perfectly but only inside Motion components and may not be ideal for non-motion contexts (e.g., gating canvas-confetti). A small custom hook is more portable:

```ts
// lib/hooks/usePrefersReducedMotion.ts
'use client';

import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  // SSR-safe initial value (false = animations enabled, so unrequested motion doesn't
  // accidentally render on SSR when client would prefer reduced)
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

For motion-driven animations (FAB hover, preset card select), `useReducedMotion` from `motion/react` is fine. For canvas-confetti gating, use the custom hook.

### Pattern 9: Sheet Sticky Footer (D-06)

shadcn Sheet provides `SheetHeader` and `SheetFooter` slots. The `SheetFooter` in shadcn's stock implementation is NOT sticky by default — it's a flex container at the bottom of the scrollable content. To achieve a sticky footer that stays pinned across all 3 tabs scrolling, wrap the Tabs and footer in a flexbox:

```tsx
// components/theme/PaletteSwitcher.tsx (sketch)
<SheetContent side="right" className="w-full md:max-w-[420px] p-0 flex flex-col">
  <SheetHeader className="p-6 border-b">
    <SheetTitle>{t('title')}</SheetTitle>
  </SheetHeader>

  {/* Scrollable middle area */}
  <Tabs defaultValue="presets" className="flex-1 flex flex-col overflow-hidden">
    <TabsList className="mx-6 mt-4">
      <TabsTrigger value="presets">{t('tabs.presets')}</TabsTrigger>
      <TabsTrigger value="custom">{t('tabs.custom')}</TabsTrigger>
      <TabsTrigger value="generate">{t('tabs.generate')}</TabsTrigger>
    </TabsList>

    <div className="flex-1 overflow-y-auto p-6">
      <TabsContent value="presets"><PalettePresets /></TabsContent>
      <TabsContent value="custom"><CustomColorPicker /></TabsContent>
      <TabsContent value="generate"><HarmonicGenerator /></TabsContent>
    </div>
  </Tabs>

  {/* Sticky footer — sibling of Tabs, naturally pinned */}
  <div className="border-t bg-background/95 backdrop-blur p-4">
    <WCAGBadge />
  </div>
</SheetContent>
```

**Key insight:** `SheetContent` is a flex column; `Tabs` takes `flex-1` and scrolls internally; the footer `<div>` sits below as a sibling, naturally pinned to the bottom. No `position: sticky` required.

### Anti-Patterns to Avoid

- **Don't use `useState` for theme state with many actions.** Use `useReducer`. Each action has a single intent (SET_PRESET vs SET_CUSTOM_FROM_PICKER vs UNLOCK_VAPORWAVE) and the reducer keeps state transitions explicit.
- **Don't read `palette-v1` in the ThemeProvider via `useEffect` initial mount.** That's the FOUC path. Read via `useReducer` lazy initializer that runs synchronously on mount AND via the `<Script beforeInteractive>` so CSS vars are already set before React hydrates.
- **Don't `setProperty` on every keystroke during slider drag.** culori is fast but React reconciliation isn't. Debounce custom picker inputs at the React state level (~100ms) before dispatching.
- **Don't use `e.preventDefault()` in the Konami listener.** It breaks Tab navigation, Enter form submission, and slider arrow-key adjustments.
- **Don't hardcode hex/rgb anywhere.** Only OKLCh literals in `lib/palettes.ts` and `app/globals.css`. culori is the conversion boundary for user-input hex from `<input type="color">`.
- **Don't put `"use client"` on the FouC script component.** It's a Server Component that renders `<Script>`. The script body runs in the browser pre-hydration, but the component that emits it must be a Server Component (Next.js docs: beforeInteractive must be in root layout).
- **Don't write `palette-v1` on every render.** Use the persistence `useEffect` triggered only on palette/paletteId change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OKLCh ↔ hex conversion | Custom math | culori `parse` + `converter('oklch')` + `formatCss` | OKLCh involves perceptual luminance compensation; getting it slightly wrong produces "ugly" generated colors. |
| WCAG contrast ratio | Custom L1/L2 formula | culori `wcagContrast(c1, c2)` | Per WCAG 2.0 spec, includes correct sRGB linearization. Easy to get the gamma curve wrong. |
| Modal with focus trap + Esc + ARIA | Custom dialog with `motion.div` | shadcn Sheet (Radix Dialog under) | Building focus management correctly takes days. Radix has WAI-ARIA-compliant primitives. |
| Native color picker UI | Custom popover with HSL sliders | `<input type="color">` (D-09) | Browser-native, OS-familiar, zero JS overhead, accessible by default. |
| Confetti animation | Custom particles in canvas | canvas-confetti | ~4 KB, optimized for one-shot bursts, configurable. Building particles correctly = 200+ LOC + perf tuning. |
| `prefers-reduced-motion` matchMedia wrapper | Inline matchMedia calls | `useReducedMotion` from `motion/react` OR custom hook | Centralize SSR-safety, listener cleanup, and the boolean semantics. |

**Key insight:** Phase 2's complexity is concentrated in `lib/colors.ts` (~200 LOC of OKLCh math + WCAG) and the FOUC script (~30 lines of inline JS). Everything else is composition of well-tested primitives (Radix Dialog → shadcn Sheet, culori's color math, canvas-confetti's bursts). Don't reinvent any of them.

## Runtime State Inventory

**Skip condition:** Phase 2 is greenfield code addition (new files in `components/theme/`, `components/providers/`, `lib/`, plus i18n key additions). No renames, no migrations, no refactors of existing runtime state.

The one runtime state concern is **the existing `palette-v1` localStorage key** — if it had been used by a previous Phase 2 attempt with an incompatible shape, parsing would fail. D-02 (silent fallback to Terra) handles this gracefully. No data migration step needed.

**Confirmed:**
- Stored data: NONE — `palette-v1` and `palette-secrets-v1` will be created on first user palette change. Validated by `lib/storage.ts` schema check on every read; silent fallback to Terra on shape mismatch.
- Live service config: NONE — no external services in Phase 2.
- OS-registered state: NONE — no OS hooks.
- Secrets/env vars: NONE — no env var changes.
- Build artifacts: NONE — npm install adds culori/canvas-confetti/motion + shadcn add sheet; standard package manager flow.

## Vaporwave WCAG Pre-Validation (STATE.md blocker)

The current Vaporwave palette in `lib/palettes.ts`:

```ts
{
  id: 'vaporwave',
  bg: 'oklch(0.2 0.04 290)',          // very dark indigo
  surface: 'oklch(0.26 0.055 285)',
  text: 'oklch(0.95 0.025 320)',      // near-white with pink tint
  textMuted: 'oklch(0.78 0.06 315)',
  accent: 'oklch(0.78 0.175 340)',    // neon pink
  secondary: 'oklch(0.8 0.15 200)',   // cyan
}
```

**Expected behavior:**
- text(0.95) on bg(0.2) — should pass 4.5:1 easily (high L-delta, low-chroma text)
- text(0.95) on surface(0.26) — should pass 4.5:1 (still wide L-gap)
- textMuted(0.78) on bg(0.2) — borderline; needs validation
- textMuted(0.78) on surface(0.26) — borderline; possibly fails
- accent(0.78) on bg(0.2) — likely passes 3.0:1
- accent(0.78) on surface(0.26) — borderline 3.0:1
- secondary(0.8) on bg(0.2) — likely passes 3.0:1

**Action required during Phase 2 (early task, before ThemeProvider can use Vaporwave):**

1. Implement `validateFullMatrix` in `lib/colors.ts`.
2. Write a one-shot script `scripts/validate-palettes.ts` or a unit test that runs `validateFullMatrix(p)` for all 5 palettes.
3. If Vaporwave fails any pair, apply `adjustForAA` to compute the corrected OKLCh values.
4. **Update `lib/palettes.ts`** with the corrected Vaporwave OKLCh values — these become the canonical definition shipped to all users.
5. Re-run `validateFullMatrix`; assert all 5 palettes pass.

**No `globals.css` change needed.** Vaporwave is NOT in `:root` (Terra is). Only `lib/palettes.ts` ships the corrected values; the FOUC script reads them at build time.

**Per CONTEXT.md "Specific Ideas":** *"Researcher confirms which tokens need shifting."* The likely candidates are `textMuted` and possibly `accent`/`secondary` against `surface`. Concrete values depend on running culori's `wcagContrast`; cannot be confirmed without execution. Plan a task that runs the validation and prints exact ratios.

## Common Pitfalls

### Pitfall A: FOUC script size grows past 1 KB

**What goes wrong:** Inlining all 5 palettes' OKLCh strings + parsing logic + try/catch + setProperty calls accumulates. If unminified, easily 1.5+ KB.

**Why it happens:** Developer authors the script with comments, whitespace, longer variable names, multi-line conditions.

**How to avoid:**
- Author the inline body with short variable names (`var r=document.documentElement.style;`).
- Use `JSON.stringify(INLINE_PALETTES)` (no whitespace) for the table.
- Test post-build: `next build && grep -A 2 'id="palette-fouc"' .next/server/app/[locale]/layout.js | wc -c` — target <1000 bytes.
- If approaching limit: drop Vaporwave from the inline table (Vaporwave is hidden until Konami unlock; cold load never needs it). Saves ~120 bytes.

**Warning signs:** Lighthouse "Reduce unused JavaScript" flags the inline script. Performance audits show the script blocks render >50ms.

### Pitfall B: ThemeProvider re-mounts cause palette flicker

**What goes wrong:** React Strict Mode double-mounts ThemeProvider in dev. Each mount runs the `useReducer` lazy initializer which reads `palette-v1` from localStorage. If between mounts the storage gets touched, the second initializer can produce a different value, briefly flickering the palette.

**Why it happens:** Strict Mode intentionally double-renders to catch impure initializers.

**How to avoid:**
- Make `initFromStorage` pure: it only reads, never writes.
- Wrap localStorage access in try/catch with D-02 fallback.
- Persistence `useEffect` only writes on real state change (use dependency array correctly).
- Test in dev with Strict Mode enabled and reload several times; ensure no flicker.

**Warning signs:** Dev console shows the palette CSS vars getting set twice in DevTools "Recently used" panel.

### Pitfall C: `<input type="color">` returns hex, not OKLCh

**What goes wrong:** Developer assumes the color input gives them OKLCh. It returns `#RRGGBB` only. Passing it directly to `setProperty('--color-accent', '#ff00aa')` breaks the OKLCh-only invariant from Phase 1.

**Why it happens:** Spec — `HTMLInputElement.value` for type=color is always 7-char hex.

**How to avoid:**
- Convert hex to OKLCh CSS string immediately on the `onChange` handler.
- `formatCss(toOklch(parse(hexInput.value)))` is a one-liner.
- Never store hex in ThemeState — always store OKLCh strings.

**Warning signs:** `:root` style inspector shows `--color-accent: #ff00aa` instead of `oklch(0.6 0.2 350)`.

### Pitfall D: Konami listener fires during Sheet content interaction

**What goes wrong:** User opens PaletteSwitcher, types arrow keys to navigate sliders or interacts with native color picker. Konami progress increments — eventually unlocks Vaporwave accidentally inside the Sheet.

**Why it happens:** Sliders, color inputs, and tabs use arrow keys for native interaction but native arrow handling doesn't change `document.activeElement.tagName`.

**How to avoid:**
- D-16 input filter handles INPUT/TEXTAREA/contentEditable, but `<input type="color">` is INPUT (passes filter — Konami won't trigger).
- shadcn Slider uses a custom div with `role="slider"` and `tabIndex=0` — NOT an INPUT. Need to also check `e.target.closest('[role="slider"]')` or similar to exclude Radix interactive widgets.
- Defensive addition to the hook:
  ```ts
  if (t.closest('[role="dialog"][data-state="open"]')) return;
  ```
  (already in PITFALLS.md #12 example)
- Test: open Sheet → navigate sliders with arrow keys → confirm Konami does NOT progress.

**Warning signs:** User reports "I tried to use the slider and the Vaporwave palette activated."

### Pitfall E: Global 400ms transition fights Sheet open/close animation

**What goes wrong:** Phase 1's global `* { transition: color, background-color, border-color 400ms ease; }` applies to EVERY element — including the Sheet overlay backdrop. When the overlay's `bg-black/10` fades in, the transition makes it sluggish (400ms instead of shadcn's intended ~150ms).

**Why it happens:** Universal selector wins specificity battle; shadcn's `data-open:fade-in-0` adds opacity transitions but the background-color transition is governed by the global rule.

**How to avoid:**
- Audit Sheet animations after install. If overlay/backdrop feels slow:
  - Add `transition-none` className to `SheetOverlay` and `SheetContent` (overrides the global).
  - OR scope the global transition to exclude `[data-slot="sheet-overlay"], [data-slot="sheet-content"]` (CSS approach).
- Preferable: shadcn Sheet's own transitions handle opacity + transform only (not color/bg-color). The Phase 1 global rule targets `color, background-color, border-color` specifically — Sheet's `bg-popover` is a background-color, which IS affected.
- Test: open and close the Sheet multiple times; verify the backdrop dims smoothly (~150-200ms feel), not laggy (400ms).

**Warning signs:** Sheet feels "sluggish" or "rubbery" on open. The backdrop dimming visibly trails the slide animation.

### Pitfall F: `motion` package useReducedMotion returns null on SSR

**What goes wrong:** Some versions of motion's `useReducedMotion` can return `null` (not booleanish) during SSR/initial render before matchMedia is evaluated. Using `if (shouldReduceMotion)` short-circuits incorrectly.

**Why it happens:** SSR-safe defaults differ across motion versions.

**How to avoid:**
- Verify in motion 12.40.0: `useReducedMotion()` returns boolean (`false` initially before mq evaluates).
- Or use custom `usePrefersReducedMotion` (Pattern 8) for predictable boolean behavior.
- Treat `null` as `false` defensively: `const reduced = useReducedMotion() === true;`

**Warning signs:** Animation runs once on SSR mount even when user has reduced-motion enabled, then stops.

### Pitfall G: Vaporwave card visible in DevTools before unlock

**What goes wrong:** Even though `PalettePresets` filters Vaporwave from rendering when `!isVaporwaveUnlocked`, the palette data (name, OKLCh values) ships in the FOUC script's inline table and in client bundle (lib/palettes.ts). A motivated user can grep for "vaporwave" in DevTools sources.

**Why it happens:** It's client-side data. There's no server-side gating.

**How to avoid:**
- This is acceptable per PROJECT.md "easter egg" framing. The Konami code is the UNLOCK gesture; the data being discoverable is fine.
- Don't try to obfuscate. Don't move Vaporwave data to a server endpoint behind authentication.
- D-15: Vaporwave's `.name` field stays `"???"` in `lib/palettes.ts` even post-unlock; the UI displays the i18n-localized "Vaporwave" string. This is a minor obfuscation that satisfies the "preserve mystery" intent without complex gating.

**Warning signs:** A user discovers Vaporwave via DevTools and reports the easter egg is "broken." Reply: working as intended.

### Pitfall H: ThemeProvider context value identity churn causes re-renders

**What goes wrong:** Every render of ThemeProvider creates a new context value object literal (`{ palette, paletteId, setPreset, ... }`). All consuming components re-render even when only one field changed.

**Why it happens:** React Context compares value identity, not deep equality.

**How to avoid:**
- Memoize the context value with `useMemo`:
  ```tsx
  const value = useMemo(
    () => ({ palette: state.palette, paletteId: state.paletteId, isCustom: state.isCustom,
             isVaporwaveUnlocked: state.isVaporwaveUnlocked, wasAdjustedForAA: state.wasAdjustedForAA,
             setPreset, setCustomColor, setHarmonic }),
    [state, setPreset, setCustomColor, setHarmonic]
  );
  ```
- Setters from `useReducer`'s `dispatch` are stable (React guarantees) — wrap them in `useCallback`-stable bound functions.
- For high-frequency renders (harmonic preview while dragging source color), consider splitting context: `PaletteContext` (state) + `PaletteActionsContext` (dispatchers). Consumers that only need actions don't re-render on state change.

**Warning signs:** React DevTools Profiler shows PaletteFab re-rendering on every Sheet tab change despite no relevant prop change.

## Code Examples

### `lib/storage.ts` skeleton

```ts
// lib/storage.ts
import { type PaletteId } from './palettes';

export type StoredPalette =
  | { kind: 'preset'; id: PaletteId }
  | { kind: 'custom'; tokens: { bg: string; surface: string; text: string;
                                 textMuted: string; accent: string; secondary: string };
      source: 'picker' | 'harmonic' };

export type StoredSecrets = { vaporwave: boolean };

const PALETTE_KEY = 'palette-v1';
const SECRETS_KEY = 'palette-secrets-v1';

function isValidPaletteShape(v: unknown): v is StoredPalette {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (o.kind === 'preset') return typeof o.id === 'string';
  if (o.kind === 'custom') {
    return typeof o.tokens === 'object' && o.tokens !== null &&
           typeof o.source === 'string' &&
           ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary']
             .every(k => typeof (o.tokens as Record<string, unknown>)[k] === 'string');
  }
  return false;
}

export function readPaletteV1(): StoredPalette | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PALETTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidPaletteShape(parsed)) return null;
    return parsed;
  } catch {
    return null;  // D-02: silent fallback
  }
}

export function writePaletteV1(value: StoredPalette): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(value));
  } catch {
    // Storage quota / disabled — silent
  }
}

export function readSecretsV1(): StoredSecrets {
  if (typeof localStorage === 'undefined') return { vaporwave: false };
  try {
    const raw = localStorage.getItem(SECRETS_KEY);
    if (!raw) return { vaporwave: false };
    const parsed = JSON.parse(raw);
    return { vaporwave: parsed?.vaporwave === true };
  } catch {
    return { vaporwave: false };
  }
}

export function writeSecretsV1(value: StoredSecrets): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SECRETS_KEY, JSON.stringify(value));
  } catch {
    // Silent
  }
}
```

### Confetti dynamic import (Pattern verified vs canvas-confetti docs)

```ts
async function fireConfetti(palette: Palette) {
  if (typeof window === 'undefined') return;
  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors: [oklchToHex(palette.accent), oklchToHex(palette.secondary)],
    startVelocity: 35,
    gravity: 0.9,
    ticks: 200,
  });
}

function oklchToHex(oklch: string): string {
  // culori: parse OKLCh CSS string → rgb → hex
  const { parse, formatHex } = require('culori');
  return formatHex(parse(oklch)) ?? '#ffffff';
}
```

**Note on colors API:** canvas-confetti's `colors` is `string[]` of hex. culori's `formatHex` produces standard `#RRGGBB`.

### FAB with motion gating (D-08)

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Palette, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PaletteFab({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const t = useTranslations('palette');
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={open ? t('close') : t('open')}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-primary text-primary-foreground
                 p-3 shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]
                 pr-[max(1rem,env(safe-area-inset-right))]"
      whileHover={reduced ? {} : { scale: 1.08, rotate: 5 }}
      whileTap={reduced ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.span
        animate={reduced ? {} : { rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="block"
      >
        {open ? <X size={20} /> : <Palette size={20} />}
      </motion.span>
    </motion.button>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` (from `motion/react`) | 2024 rebrand | Already documented in Phase 1 STACK.md. No API surface change. |
| RGB triplet stored as `"245 244 240"` for Tailwind opacity | OKLCh native via Tailwind v4 `@theme` | Tailwind v4 release | Phase 1 already uses OKLCh; Phase 2 inherits. |
| `tailwindcss-animate` for shadcn anims | `tw-animate-css` | Tailwind v4 / shadcn migration | Phase 1 already installed. Sheet brings new animations. |
| Cookie-based palette persistence (research SUMMARY suggestion) | localStorage with two keys | This phase per D-01 | localStorage scales to multiple custom palettes more naturally; FOUC script reads localStorage. |
| `next-themes` library | Custom ThemeProvider | This project | next-themes manages a class attribute (dark/light); not designed for 6-variable palettes with WCAG enforcement. |

**Deprecated/outdated:**
- Hex-based palette storage (e.g., `"#ec5f3c"`): replaced by OKLCh strings (`"oklch(0.62 0.155 35)"`).
- `localStorage.getItem` inside `useEffect` for theme restore: replaced by the `beforeInteractive` blocking script.
- Single-pair WCAG validation (text/bg only): replaced by 7-pair matrix (PITFALLS.md Pitfall #3).

## Open Questions

1. **Exact ~3% L-shift for surface derivation (D-10).** Should it be additive (`bg.l + 0.03`) or multiplicative (`bg.l * 1.03`)? Additive is more predictable across the L range. Recommend: `surface.l = isLight ? bg.l - 0.03 : bg.l + 0.03`, clamped to [0, 1].

2. **Should the FOUC script include the `<html>` `data-palette` attribute?** Architecture research suggests this for SSR-friendliness, but localStorage-based persistence doesn't need it. Recommend: skip the attribute. Script only touches `style` properties; `:root` defaults handle no-stored-palette case.

3. **Should the harmonic preview commit to `:root` on every preview, or only on Apply?** D-12 specifies inline preview ("the sticky-footer WCAGBadge updates live"). Two interpretations:
   - (a) Preview shows the generated palette in the 6-swatch grid only; `:root` reflects active palette. Apply commits to `:root`.
   - (b) Preview commits to `:root` immediately (full-page preview); Apply just writes to storage.
   Recommend (a): non-destructive preview matches the Generate tab's purpose (iterate without committing). Confirm with planner.

4. **Should `applyMatrixAdjust` also adjust `accent`/`secondary` when they fail 3.0:1 vs bg?** D-11 says "only text and textMuted shift in L (accent/secondary preserved)." This is correct for color identity preservation, but means the "Fail" WCAGBadge state IS reachable in committed-to-:root state for adventurous custom palettes. Recommend: keep D-11 as-is; if accent fails 3.0:1, surface the fail in WCAGBadge but don't auto-adjust accent. Planner picks UX presentation.

5. **Should we add `palette.wcag.adjusted` message key in this phase or defer?** D-06 requires the chip; D-15 already requires updating `palette.presets.vaporwave`. Recommend: add `palette.wcag.adjusted` ("Adjusted for AA" / "Ajusté pour AA") in this phase. Cost: 2 keys × 2 locales = 4 lines of JSON.

## Environment Availability

**Skip condition:** No new external tools, services, or runtimes required. All dependencies are npm packages (culori, canvas-confetti, motion + shadcn CLI). Node 20+ already in use.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **None yet detected** — Phase 1 shipped without test infrastructure. Wave 0 must set up. |
| Config file | None — see Wave 0 |
| Quick run command | TBD — see Wave 0 recommendation below |
| Full suite command | TBD — see Wave 0 recommendation below |

**Wave 0 recommendation:** Install Vitest 2.x with React Testing Library for component tests, plus a Node-only script for palette validation.

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom \
                       @testing-library/user-event jsdom
```

Rationale: Vitest is the modern choice for Vite/SWC-based projects, fast (uses Vite's transform pipeline), supports ESM (culori is ESM-only), and has excellent TS DX. Jest works but is slower with ESM. The project already uses ESM (Next 16 + Tailwind v4 + culori).

Add to `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:palettes": "tsx scripts/validate-palettes.ts"
}
```

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THEME-01 | All 5 palettes pre-validated WCAG AA | unit | `npx tsx scripts/validate-palettes.ts` | ❌ Wave 0 — `scripts/validate-palettes.ts` |
| THEME-02 | `wcagContrast`, `adjustForAA`, `validateFullMatrix` correctness | unit | `vitest run lib/colors.test.ts` | ❌ Wave 0 — `lib/colors.test.ts` |
| THEME-03 | `generateHarmonic` produces valid 6-token palette for each of 4 modes | unit | `vitest run lib/colors.test.ts -t "generateHarmonic"` | ❌ Wave 0 — same file |
| THEME-04 | ThemeProvider state transitions (setPreset, setCustomColor, setHarmonic, unlock) | integration | `vitest run components/providers/ThemeProvider.test.tsx` | ❌ Wave 0 — `ThemeProvider.test.tsx` |
| THEME-04 | `usePalette()` returns expected shape | integration | same | ❌ Wave 0 |
| THEME-04 | localStorage persistence + silent fallback (D-02) | integration | `vitest run lib/storage.test.ts` | ❌ Wave 0 — `lib/storage.test.ts` |
| THEME-05 | FOUC: stored palette applied before paint (no flash) | **manual** | DevTools Network throttle to Slow 3G + clear cache + reload with non-Terra palette set | n/a — manual checklist |
| THEME-05 | Inline script size <1 KB minified | manual | `next build && grep palette-fouc .next/.../*.js && wc -c` | n/a — build verification step |
| THEME-06 | PalettePresets renders 4 cards, 5th if unlocked, active indicator | integration | `vitest run components/theme/PalettePresets.test.tsx` | ❌ Wave 0 |
| THEME-07 | CustomColorPicker derives missing 3 tokens via D-10 rules | integration | `vitest run components/theme/CustomColorPicker.test.tsx` | ❌ Wave 0 |
| THEME-08 | HarmonicGenerator computes preview + applies on click | integration | `vitest run components/theme/HarmonicGenerator.test.tsx` | ❌ Wave 0 |
| THEME-09 | WCAGBadge displays correct status for AA/AAA/Fail thresholds | integration | `vitest run components/theme/WCAGBadge.test.tsx` | ❌ Wave 0 |
| THEME-10 | PaletteSwitcher: keyboard nav (Tab/Esc/focus trap) | **manual** | Keyboard-only walkthrough checklist | n/a — manual checklist (Radix handles trap, verify visually) |
| THEME-11 | FAB visible across all pages, aria-label localized | integration | `vitest run components/theme/PaletteFab.test.tsx` | ❌ Wave 0 |
| THEME-12 | useKonamiCode triggers unlock; input filter blocks INPUT/TEXTAREA | unit | `vitest run lib/hooks/useKonamiCode.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `vitest run lib/colors.test.ts lib/storage.test.ts` (quick subset, <2s)
- **Per wave merge:** `vitest run` (full suite, <10s expected)
- **Phase gate:** Full suite green + manual FOUC test on Slow 3G + keyboard nav checklist before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Install Vitest + React Testing Library + jsdom: `npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- [ ] Install tsx for the validation script: `npm install --save-dev tsx`
- [ ] Create `vitest.config.ts` with jsdom env, alias `@/*`
- [ ] Create `scripts/validate-palettes.ts` — runs `validateFullMatrix` on all 5 palettes, prints ratios, exits non-zero on failure (covers THEME-01)
- [ ] Create `lib/colors.test.ts` — covers THEME-02, THEME-03
- [ ] Create `lib/storage.test.ts` — covers D-01, D-02
- [ ] Create `lib/hooks/useKonamiCode.test.ts` — covers THEME-12 (sequence match, input filter, reset)
- [ ] Create `components/providers/ThemeProvider.test.tsx` — covers THEME-04 (state transitions, persistence)
- [ ] Create `components/theme/{PalettePresets,CustomColorPicker,HarmonicGenerator,WCAGBadge,PaletteFab}.test.tsx` — covers THEME-06..09, 11
- [ ] Add `package.json` scripts: `test`, `test:watch`, `test:palettes`
- [ ] (Optional but valuable) Add `@axe-core/playwright` for automated a11y; defer to Phase 6 — Phase 2 ships with manual checklist

## i18n Message Additions Required

This phase **MUST add** the following keys to `messages/fr.json` and `messages/en.json`:

```json
{
  "palette": {
    "wcag": {
      "adjusted": "Ajusté pour AA"   // FR
      // "adjusted": "Adjusted for AA" // EN
    }
  }
}
```

This phase **MUST update** (D-15):

```json
// Both fr.json and en.json
{
  "palette": {
    "presets": {
      "vaporwave": "Vaporwave"   // was "???" in both — brand name, locale-neutral
    }
  }
}
```

**Note:** `palette.presets.vaporwave` is updated AT THE BEGINNING of the phase (during the static i18n key prep task). At runtime, `PalettePresets` filters Vaporwave out when `!isVaporwaveUnlocked`, so the key being present has no UI effect until unlock. Per D-15: `lib/palettes.ts` `.name: '???'` stays as a defensive fallback (never displayed since components prefer i18n).

Optional additions (Claude's discretion):
- `palette.harmonic.applied`: "Palette appliquée" / "Palette applied" — confirmation message after Apply in Generate tab.
- `palette.custom.derivedNotice`: "Tokens dérivés automatiquement" / "Tokens derived automatically" — info chip on Custom tab explaining D-10 derivation.
- `palette.wcag.adjustedTooltip`: longer explanation for the chip's hover tooltip. e.g., "Texte ajusté en luminosité pour atteindre le ratio AA 4.5:1" / "Text adjusted in lightness to reach AA 4.5:1 ratio".

Planner picks which optional keys to ship.

## Component Decomposition (Atomic, 1 File = 1 Responsibility)

Files to create in Phase 2:

| File | Responsibility | Client/Server | Approx. LOC |
|------|----------------|---------------|------|
| `lib/colors.ts` | `wcagContrast`, `adjustForAA`, `validateFullMatrix`, `generateHarmonic`, `pickTextOnAccent`, `deriveDefaultTokens`, `applyMatrixAdjust` | Pure module | ~250 |
| `lib/storage.ts` | `readPaletteV1`, `writePaletteV1`, `readSecretsV1`, `writeSecretsV1` | Pure module | ~80 |
| `lib/hooks/useKonamiCode.ts` | Konami sequence listener with input filtering | Client | ~60 |
| `lib/hooks/usePrefersReducedMotion.ts` | SSR-safe matchMedia wrapper | Client | ~25 |
| `components/providers/ThemeProvider.tsx` | Context, reducer, CSS-var writer, persistence, Konami integration | Client | ~150 |
| `components/theme/PaletteFouCScript.tsx` | Server-rendered `<Script beforeInteractive>` with inlined PALETTES | Server | ~40 |
| `components/theme/PaletteFab.tsx` | FAB button with motion + Lucide icon | Client | ~50 |
| `components/theme/PaletteSwitcher.tsx` | Sheet shell with Tabs + sticky footer | Client | ~80 |
| `components/theme/PalettePresets.tsx` | 4-5 preset cards | Client | ~80 |
| `components/theme/CustomColorPicker.tsx` | 3 color inputs + derivation logic | Client | ~120 |
| `components/theme/HarmonicGenerator.tsx` | Source picker + mode selector + preview + apply | Client | ~140 |
| `components/theme/WCAGBadge.tsx` | Live ratio + status icon + adjusted chip | Client | ~70 |
| `components/ui/sheet.tsx` | shadcn Sheet (auto-generated by `npx shadcn add sheet`) | Client | ~120 (generated) |
| `scripts/validate-palettes.ts` | One-shot Node script: validate all 5 palettes, exit non-zero on failure | Node | ~30 |

**Total new LOC: ~1,300 (plus generated Sheet + test files).** This is in line with PROJECT.md's "1 file = 1 responsibility" — each file does one clearly-named thing.

## Integration with Existing shadcn Alias Chain

**Critical verification:** Phase 1 wired the full alias chain (`bg-primary` → `--primary` → `var(--color-accent)` → Terra OKLCh in `:root`). Phase 2's ThemeProvider must mutate **only** the 6 `--color-*` properties — never the shadcn aliases.

**Mutation surface (the only properties touched at runtime):**
```
--color-bg
--color-surface
--color-text
--color-text-muted
--color-accent
--color-secondary
```

All shadcn aliases (`--background`, `--card`, `--primary`, etc.) are CSS-resolved via `var()` indirection. When `--color-accent` mutates, `--primary` (which equals `var(--color-accent)`) instantly updates, and every shadcn component using `bg-primary` repaints.

**Test verification:** Use a smoke test (manual or scripted):
1. Open dev server with Terra palette active.
2. In DevTools, inspect a `<button class="bg-primary">`. Check computed `background-color`.
3. Open palette switcher, select Nordic.
4. Re-inspect button. `background-color` should reflect Nordic's accent OKLCh.
5. No rebuild needed; no class change needed.

**Pitfall to avoid:** If a future contributor accidentally writes ThemeProvider code that sets `document.documentElement.style.setProperty('--primary', ...)` directly, it would break the alias chain (overriding the `var(--color-accent)` indirection with a literal). Code review must catch this. Convention: ThemeProvider only ever touches `--color-*` (the 6 palette tokens), never shadcn-named tokens.

## Sources

### Primary (HIGH confidence)

- **culori API docs** — https://culorijs.org/api/ — `wcagContrast(c1, c2) → number`, `parse(str) → color`, `formatCss(color) → string`, `interpolate(colors, mode, overrides)`, tree-shaking via `culori/fn` subpath.
- **culori npm registry** — `npm view culori` — version 4.0.2 (published 11 months ago), MIT, no deps, ESM-native, ships `.d.ts`.
- **canvas-confetti GitHub** — https://github.com/catdad/canvas-confetti — `confetti(options) → Promise|null`, options include `colors: string[]` (hex), `particleCount`, `spread`, `gravity`, `startVelocity`, `origin`. Default export.
- **canvas-confetti npm registry** — version 1.9.4 (latest).
- **Next.js Script component docs** — https://nextjs.org/docs/app/api-reference/components/script — Verified Next 16.2.6: `beforeInteractive` scripts MUST be in root layout, auto-injected into `<head>` regardless of placement, inline content via children supported. `onLoad`/`onError`/`onReady` NOT compatible with `beforeInteractive`.
- **Motion useReducedMotion** — https://motion.dev/docs/react-use-reduced-motion — Confirmed import path `motion/react`, returns boolean (false initially), responds to OS preference changes.
- **Motion npm registry** — version 12.40.0 (latest).
- **shadcn Sheet docs** — https://ui.shadcn.com/docs/components/sheet — Install: `npx shadcn@latest add sheet`. Exports: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose`. Side prop: `'left' | 'right' | 'top' | 'bottom'`. Built on Radix Dialog — focus trap, Esc-to-close, aria-modal included.
- **Next.js 16 release** — https://nextjs.org/blog/next-16 — `proxy.ts` rename verified (Phase 1 already migrated).

### Secondary (MEDIUM confidence — corroborated by multiple sources)

- **OKLCh harmonic hue offsets** — Mathematically definitional (complementary +180°, triadic ±120°, analogous ±30°, split-complementary +150°/+210°). Sources: pro-color-harmonies repo, coloraide docs. Verified consistent across sources.
- **WCAG 2.1 1.4.11 non-text contrast** — 3:1 ratio for UI components (icons, focus rings). Standard well-established.
- **Konami code with input filtering** — Pattern from PITFALLS.md Pitfall #12, codementor.io, and non-traditional.dev. Multiple sources agree on `tagName` check + `isContentEditable` + Radix dialog check.

### Tertiary (LOW confidence — single source, flag for runtime verification)

- **Exact Vaporwave WCAG pass/fail state** — UNVERIFIED until `validateFullMatrix(vaporwavePalette)` actually runs at task execution time. The Vaporwave OKLCh values in `lib/palettes.ts` may or may not pass the 7-pair check. Plan must include the validation step + corrective `adjustForAA` task.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via `npm view`, APIs verified via official docs.
- Architecture (ThemeProvider + FOUC + storage): HIGH — patterns from Phase 1 CONTEXT, ARCHITECTURE.md, and PITFALLS.md align.
- Pitfalls: HIGH — most pitfalls already documented in PITFALLS.md (specifically #1, #3, #12) verbatim. Phase-2-specific pitfalls (A-H) derived from research conflicts (e.g., global transition × Sheet anim).
- Code examples: HIGH for library APIs (culori, canvas-confetti, motion); MEDIUM for algorithmic details (`adjustForAA` binary search — algorithm is sound but specific iteration count and edge-case fallbacks may need tuning).
- Validation architecture: MEDIUM — Vitest is the recommended choice but project has no test infrastructure yet; Wave 0 setup is required. Recommendation grounded in project stack (ESM, Vite-compatible).

**Research date:** 2026-05-26
**Valid until:** 2026-06-26 (30 days for stable libraries; recheck culori/canvas-confetti if Phase 2 execution slips past June 2026)
