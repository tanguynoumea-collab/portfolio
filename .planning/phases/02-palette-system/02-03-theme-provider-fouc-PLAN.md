---
phase: 02-palette-system
plan: 03
type: execute
wave: 2
depends_on:
  - 02-palette-system/00
  - 02-palette-system/01
  - 02-palette-system/02
files_modified:
  - components/providers/ThemeProvider.tsx
  - components/providers/ThemeProvider.test.tsx
  - components/theme/PaletteFouCScript.tsx
  - app/[locale]/layout.tsx
  - messages/fr.json
  - messages/en.json
autonomous: true
requirements:
  - THEME-04
  - THEME-05
must_haves:
  truths:
    - "ThemeProvider exposes usePalette() returning { palette, paletteId, isCustom, customSource, isVaporwaveUnlocked, wasAdjustedForAA, setPreset, setCustomColor, setHarmonic }"
    - "ThemeProvider mutates --color-bg/--color-surface/--color-text/--color-text-muted/--color-accent/--color-secondary on document.documentElement when palette state changes"
    - "ThemeProvider persists palette to palette-v1 and unlock state to palette-secrets-v1 via lib/storage.ts"
    - "PaletteFouCScript is a Server Component rendering <Script id='palette-fouc' strategy='beforeInteractive'> with PALETTES inlined at build time"
    - "Inline FOUC script body is wrapped in try/catch and is <1 KB minified"
    - "ThemeProvider mounts inside NextIntlClientProvider in app/[locale]/layout.tsx (so client palette UI can use useTranslations)"
    - "messages/{fr,en}.json palette.presets.vaporwave is 'Vaporwave' (was '???')"
    - "messages/{fr,en}.json palette.wcag.adjusted exists ('Ajusté pour AA' / 'Adjusted for AA')"
  artifacts:
    - path: "components/providers/ThemeProvider.tsx"
      provides: "Client context provider with useReducer, CSS-var writer, persistence, Konami listener integration"
      exports: ["ThemeProvider", "usePalette"]
    - path: "components/theme/PaletteFouCScript.tsx"
      provides: "Server component rendering <Script beforeInteractive> with build-time-inlined PALETTES"
      exports: ["PaletteFouCScript"]
    - path: "app/[locale]/layout.tsx"
      provides: "Wires PaletteFouCScript into <head> AND ThemeProvider inside NextIntlClientProvider"
      contains: "PaletteFouCScript"
    - path: "messages/fr.json"
      provides: "Vaporwave label + wcag.adjusted chip text in FR"
      contains: "Vaporwave"
    - path: "messages/en.json"
      provides: "Vaporwave label + wcag.adjusted chip text in EN"
      contains: "Vaporwave"
  key_links:
    - from: "components/providers/ThemeProvider.tsx"
      to: "document.documentElement.style"
      via: "setProperty('--color-*', ...)"
      pattern: "setProperty\\(['\"]--color-(bg|surface|text|text-muted|accent|secondary)"
    - from: "components/providers/ThemeProvider.tsx"
      to: "lib/storage.ts"
      via: "writePaletteV1 / writeSecretsV1 in useEffect"
      pattern: "writePaletteV1|writeSecretsV1"
    - from: "components/providers/ThemeProvider.tsx"
      to: "lib/hooks/useKonamiCode.ts"
      via: "useKonamiCode(handleUnlock)"
      pattern: "useKonamiCode\\("
    - from: "components/theme/PaletteFouCScript.tsx"
      to: "lib/palettes.ts"
      via: "import { PALETTES } from '@/lib/palettes'; build-time JSON.stringify inlined into script body"
      pattern: "JSON\\.stringify\\(.*PALETTES|INLINE_PALETTES"
    - from: "app/[locale]/layout.tsx <head>"
      to: "PaletteFouCScript"
      via: "JSX render in head"
      pattern: "<PaletteFouCScript"
    - from: "app/[locale]/layout.tsx <body>"
      to: "ThemeProvider wrapping {children}"
      via: "JSX nesting inside NextIntlClientProvider"
      pattern: "<ThemeProvider>"
---

<objective>
Wire the runtime palette engine: client-side `ThemeProvider` with full reducer + CSS-var writer + persistence + Konami integration, plus the pre-hydration `PaletteFouCScript` that eliminates FOUC. Mount both inside `app/[locale]/layout.tsx` correctly (script in `<head>`, provider inside `NextIntlClientProvider` in `<body>`). Update i18n keys for D-15 (Vaporwave label) and D-06 (Adjusted for AA chip).

Purpose: Deliver THEME-04 (ThemeProvider) + THEME-05 (FOUC script) and unblock Wave 3 UI components which all consume `usePalette()`.
Output: 2 source components + 1 test file + 3 file updates (layout, fr.json, en.json).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-palette-system/02-CONTEXT.md
@.planning/phases/02-palette-system/02-RESEARCH.md
@.planning/research/PITFALLS.md
@lib/palettes.ts
@lib/colors.ts
@lib/storage.ts
@lib/hooks/useKonamiCode.ts
@lib/hooks/usePrefersReducedMotion.ts
@app/[locale]/layout.tsx
@messages/fr.json
@messages/en.json

<interfaces>
<!-- From Wave 1 lib/colors.ts (consumed by ThemeProvider reducer): -->
```ts
export function deriveDefaultTokens(input: { bg: string; accent: string; secondary: string }): DerivedTokens;
export function generateHarmonic(mode: HarmonicMode, sourceHex: string): DerivedTokens;
export function applyMatrixAdjust(candidate: Palette | DerivedTokens): { palette: DerivedTokens & {id; name}; wasAdjusted: boolean };
export type HarmonicMode = 'complementary' | 'triadic' | 'analogous' | 'split-complementary';
```

<!-- From Wave 1 lib/storage.ts (consumed by persistence useEffects): -->
```ts
export type StoredPalette =
  | { kind: 'preset'; id: PaletteId }
  | { kind: 'custom'; tokens: {...6 tokens...}; source: 'picker' | 'harmonic' };
export type StoredSecrets = { vaporwave: boolean };
export function readPaletteV1(): StoredPalette | null;
export function writePaletteV1(value: StoredPalette): void;
export function readSecretsV1(): StoredSecrets;
export function writeSecretsV1(value: StoredSecrets): void;
```

<!-- From Wave 1 lib/hooks/useKonamiCode.ts: -->
```ts
export function useKonamiCode(onUnlock: () => void, options?: { resetMs?: number }): void;
```

<!-- Current Phase 1 socket in app/[locale]/layout.tsx (lines 27-42 = empty <head> with comment, body wraps NextIntlClientProvider around children): -->
```tsx
<html lang={locale} suppressHydrationWarning>
  <head>
    {/* THEME-05 socket */}
  </head>
  <body>
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  </body>
</html>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update messages/{fr,en}.json — D-15 Vaporwave label + D-06 wcag.adjusted chip</name>
  <files>messages/fr.json, messages/en.json</files>
  <read_first>
    - messages/fr.json (current state — palette.presets.vaporwave = '???', no palette.wcag.adjusted key)
    - messages/en.json (same)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-15: change '???' → 'Vaporwave'; D-06 + RESEARCH.md "i18n Message Additions Required" line 1097: add palette.wcag.adjusted)
  </read_first>
  <action>
    Both files require two edits each. **Preserve byte-for-byte parity of all 9 namespaces / 63 existing keys** (Phase 1 added a build-time parity guard implicitly via global.d.ts typeof messages).

    **messages/fr.json:**
    - Replace `"vaporwave": "???"` (under `palette.presets`) with `"vaporwave": "Vaporwave"`
    - Inside the existing `palette.wcag` object (which currently has `ratio`, `aa`, `aaa`, `fail`), add a new key `"adjusted": "Ajusté pour AA"` as the 5th key (after `fail`).

    **messages/en.json:**
    - Replace `"vaporwave": "???"` with `"vaporwave": "Vaporwave"` under `palette.presets`
    - Inside `palette.wcag`, add `"adjusted": "Adjusted for AA"` as the 5th key.

    Rationale per D-15: Vaporwave is a brand name; it stays in English in both locales. The key is added now (Wave 2) so PalettePresets (Wave 3) and WCAGBadge (Wave 3) can use them without further i18n churn.

    Note: per D-15 "lib/palettes.ts `.name: '???'` stays as a defensive fallback" — do NOT touch lib/palettes.ts in this task. PalettePresets (Wave 3) will prefer `t('palette.presets.vaporwave')` over `palette.name`.
  </action>
  <verify>
    <automated>node -e "const fr=require('./messages/fr.json'); const en=require('./messages/en.json'); if (fr.palette.presets.vaporwave !== 'Vaporwave') { console.error('FR vaporwave label wrong'); process.exit(1); } if (en.palette.presets.vaporwave !== 'Vaporwave') { console.error('EN vaporwave label wrong'); process.exit(1); } if (fr.palette.wcag.adjusted !== 'Ajusté pour AA') { console.error('FR adjusted chip missing'); process.exit(1); } if (en.palette.wcag.adjusted !== 'Adjusted for AA') { console.error('EN adjusted chip missing'); process.exit(1); } console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `messages/fr.json` contains `"vaporwave": "Vaporwave"` (NOT `"???"`)
    - `messages/en.json` contains `"vaporwave": "Vaporwave"` (NOT `"???"`)
    - `messages/fr.json` contains `"adjusted": "Ajusté pour AA"` inside `palette.wcag` namespace
    - `messages/en.json` contains `"adjusted": "Adjusted for AA"` inside `palette.wcag` namespace
    - Both files are still valid JSON (no parse errors)
    - Key parity: `node -e "const fr=Object.keys(require('./messages/fr.json').palette.wcag).sort().join(','); const en=Object.keys(require('./messages/en.json').palette.wcag).sort().join(','); if (fr!==en) {console.error('parity break',fr,en); process.exit(1)}"` exits 0
  </acceptance_criteria>
  <done>i18n keys ready for Wave 3 consumers. D-15 + D-06 satisfied at the message-file level.</done>
</task>

<task type="auto">
  <name>Task 2: Build components/theme/PaletteFouCScript.tsx (Server Component, THEME-05)</name>
  <files>components/theme/PaletteFouCScript.tsx</files>
  <read_first>
    - lib/palettes.ts (PALETTES — Server Component will JSON.stringify these)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-03 FOUC inline script spec + size budget <1 KB)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Pattern 2 lines 289-352, Pitfall A lines 733-746)
    - .planning/research/PITFALLS.md (Pitfall 1 lines 11-75 — exact <head> shape)
    - app/[locale]/layout.tsx (FOUC socket comment at lines 27-42)
  </read_first>
  <action>
    Create `components/theme/PaletteFouCScript.tsx` as a **Server Component** (no `'use client'` directive). Renders a Next.js `<Script>` with `strategy="beforeInteractive"`. Build-time-inlines PALETTES so the script body is self-contained at <1 KB minified.

    ```tsx
    /**
     * components/theme/PaletteFouCScript.tsx — Server Component.
     *
     * Emits a `<Script strategy="beforeInteractive">` whose body reads palette-v1
     * from localStorage and writes the 6 --color-* CSS variables on
     * document.documentElement BEFORE React hydrates (THEME-05, D-03).
     *
     * The PALETTES table is inlined at build time via JSON.stringify — single
     * source of truth = lib/palettes.ts.
     *
     * Size budget per D-03: <1 KB minified. Each palette ~120 bytes (6 OKLCh
     * strings + id), 5 palettes ≈ 600 bytes + ~250 bytes of parser logic.
     */
    import Script from 'next/script';
    import { PALETTES } from '@/lib/palettes';

    // Build-time-inlined PALETTES table (only the 6 token strings per id, no name/display).
    // Vaporwave INCLUDED so the cold-load path still works if a user (who unlocked
    // Vaporwave previously) returns with palette-v1 = {kind:'preset',id:'vaporwave'}.
    const INLINE_PALETTES = PALETTES.reduce<Record<string, Record<string, string>>>((acc, p) => {
      acc[p.id] = {
        bg: p.bg,
        surface: p.surface,
        text: p.text,
        textMuted: p.textMuted,
        accent: p.accent,
        secondary: p.secondary,
      };
      return acc;
    }, {});

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
    ```

    **Critical** per RESEARCH.md Pattern 2 (lines 293-298): the FOUC script source file MUST NOT carry `'use client'` — Next 16 requires `beforeInteractive` to originate from a Server Component (root or [locale] layout) for the script to truly run pre-hydration. The compiled script body itself runs in the browser, but the component that emits it is server-rendered.

    Verify byte-size after build (deferred to Task 4 verify step): `next build && grep "palette-fouc" .next/server/app/**/*.html | wc -c` should be under 1500 bytes including the surrounding `<script>` tag wrapper.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const src=fs.readFileSync('components/theme/PaletteFouCScript.tsx','utf8'); if (src.startsWith(\"'use client'\")) {console.error('Must be Server Component'); process.exit(1)} if (!src.includes('strategy=\"beforeInteractive\"')) {console.error('beforeInteractive missing'); process.exit(1)} if (!src.includes('JSON.stringify(INLINE_PALETTES)')) {console.error('inlining missing'); process.exit(1)} if (!src.includes('palette-v1')) {console.error('storage key missing'); process.exit(1)} if (!src.includes('try{') || !src.includes('catch')) {console.error('try/catch missing'); process.exit(1)} console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `components/theme/PaletteFouCScript.tsx` exists
    - File does NOT start with `'use client'` directive
    - File imports `Script` from `'next/script'`
    - File imports `PALETTES` from `'@/lib/palettes'`
    - File contains `strategy="beforeInteractive"`
    - File contains `id="palette-fouc"` on the Script tag
    - File contains the literal `JSON.stringify(INLINE_PALETTES)` (build-time inlining per D-03)
    - File reads `localStorage.getItem('palette-v1')` and handles both `kind:'preset'` and `kind:'custom'` branches
    - File wraps the body in `try{...}catch(e){}` (D-02 silent fallback)
    - File calls `setProperty` for all 6 tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`
    - File exports `PaletteFouCScript` function
  </acceptance_criteria>
  <done>FOUC script Server Component ready. Task 4 wires it into the layout `<head>`.</done>
</task>

<task type="auto">
  <name>Task 3: Build components/providers/ThemeProvider.tsx + tests (THEME-04, D-04..D-16 integration)</name>
  <files>components/providers/ThemeProvider.tsx, components/providers/ThemeProvider.test.tsx</files>
  <read_first>
    - lib/palettes.ts (PALETTES, getPaletteById, PaletteId)
    - lib/colors.ts (deriveDefaultTokens, generateHarmonic, applyMatrixAdjust, HarmonicMode)
    - lib/storage.ts (readPaletteV1, writePaletteV1, readSecretsV1, writeSecretsV1, StoredPalette)
    - lib/hooks/useKonamiCode.ts (useKonamiCode)
    - .planning/phases/02-palette-system/02-CONTEXT.md (state shape D-01..D-16, especially D-11 wasAdjustedForAA flag, D-14 unlock sequence)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Pattern 1 lines 175-287 — full reducer + provider sketch, Pitfall B re-mount, Pitfall H context memoization)
  </read_first>
  <action>
    Create `components/providers/ThemeProvider.tsx` (Client Component) per RESEARCH.md Pattern 1, with full reducer pattern + persistence useEffects + Konami integration. Then create `components/providers/ThemeProvider.test.tsx` with integration tests.

    **components/providers/ThemeProvider.tsx:**

    ```tsx
    'use client';

    import {
      createContext,
      useCallback,
      useContext,
      useEffect,
      useMemo,
      useReducer,
      type ReactNode,
    } from 'react';
    import {
      PALETTES,
      DEFAULT_PALETTE_ID,
      getPaletteById,
      type Palette,
      type PaletteId,
    } from '@/lib/palettes';
    import {
      applyMatrixAdjust,
      deriveDefaultTokens,
      generateHarmonic,
      type HarmonicMode,
    } from '@/lib/colors';
    import {
      readPaletteV1,
      readSecretsV1,
      writePaletteV1,
      writeSecretsV1,
      type StoredPalette,
    } from '@/lib/storage';
    import { useKonamiCode } from '@/lib/hooks/useKonamiCode';

    type ActivePaletteId = PaletteId | 'custom';

    type ThemeState = {
      palette: Omit<Palette, 'id' | 'name'>;
      paletteId: ActivePaletteId;
      isCustom: boolean;
      customSource: 'picker' | 'harmonic' | null;
      isVaporwaveUnlocked: boolean;
      wasAdjustedForAA: boolean;
    };

    type ThemeAction =
      | { type: 'SET_PRESET'; id: PaletteId }
      | { type: 'SET_CUSTOM_FROM_PICKER'; userInput: { bg: string; accent: string; secondary: string } }
      | { type: 'SET_HARMONIC'; mode: HarmonicMode; sourceColor: string }
      | { type: 'UNLOCK_VAPORWAVE' };

    function toTokens(p: Palette): Omit<Palette, 'id' | 'name'> {
      return {
        bg: p.bg, surface: p.surface, text: p.text,
        textMuted: p.textMuted, accent: p.accent, secondary: p.secondary,
      };
    }

    function reducer(state: ThemeState, action: ThemeAction): ThemeState {
      switch (action.type) {
        case 'SET_PRESET': {
          const preset = getPaletteById(action.id);
          return {
            ...state,
            palette: toTokens(preset),
            paletteId: action.id,
            isCustom: false,
            customSource: null,
            wasAdjustedForAA: false,
          };
        }
        case 'SET_CUSTOM_FROM_PICKER': {
          const derived = deriveDefaultTokens(action.userInput);
          const { palette: adjusted, wasAdjusted } = applyMatrixAdjust({
            ...derived, id: 'terra', name: 'custom',
          });
          return {
            ...state,
            palette: toTokens({ ...adjusted, id: 'terra', name: 'custom' }),
            paletteId: 'custom',
            isCustom: true,
            customSource: 'picker',
            wasAdjustedForAA: wasAdjusted,
          };
        }
        case 'SET_HARMONIC': {
          const generated = generateHarmonic(action.mode, action.sourceColor);
          const { palette: adjusted, wasAdjusted } = applyMatrixAdjust({
            ...generated, id: 'terra', name: 'gen',
          });
          return {
            ...state,
            palette: toTokens({ ...adjusted, id: 'terra', name: 'gen' }),
            paletteId: 'custom',
            isCustom: true,
            customSource: 'harmonic',
            wasAdjustedForAA: wasAdjusted,
          };
        }
        case 'UNLOCK_VAPORWAVE': {
          return { ...state, isVaporwaveUnlocked: true };
        }
        default:
          return state;
      }
    }

    function initFromStorage(): ThemeState {
      const defaultPalette = getPaletteById(DEFAULT_PALETTE_ID);
      const stored = readPaletteV1();
      const secrets = readSecretsV1();
      const baseTokens = toTokens(defaultPalette);

      let palette = baseTokens;
      let paletteId: ActivePaletteId = DEFAULT_PALETTE_ID;
      let isCustom = false;
      let customSource: 'picker' | 'harmonic' | null = null;

      if (stored?.kind === 'preset') {
        palette = toTokens(getPaletteById(stored.id));
        paletteId = stored.id;
      } else if (stored?.kind === 'custom') {
        palette = stored.tokens;
        paletteId = 'custom';
        isCustom = true;
        customSource = stored.source;
      }

      return {
        palette,
        paletteId,
        isCustom,
        customSource,
        isVaporwaveUnlocked: secrets.vaporwave,
        wasAdjustedForAA: false,
      };
    }

    // ----------------------- Context value type -----------------------

    export type PaletteContextValue = {
      palette: Omit<Palette, 'id' | 'name'>;
      paletteId: ActivePaletteId;
      isCustom: boolean;
      customSource: 'picker' | 'harmonic' | null;
      isVaporwaveUnlocked: boolean;
      wasAdjustedForAA: boolean;
      setPreset: (id: PaletteId) => void;
      setCustomColor: (input: { bg: string; accent: string; secondary: string }) => void;
      setHarmonic: (mode: HarmonicMode, sourceHex: string) => void;
      unlockVaporwave: () => void;
    };

    const ThemeContext = createContext<PaletteContextValue | null>(null);

    export function usePalette(): PaletteContextValue {
      const ctx = useContext(ThemeContext);
      if (!ctx) {
        throw new Error('[ThemeProvider] usePalette() must be called inside <ThemeProvider>.');
      }
      return ctx;
    }

    export function ThemeProvider({ children }: { children: ReactNode }) {
      const [state, dispatch] = useReducer(reducer, undefined, initFromStorage);

      // CSS variable writer — applies on every palette change
      useEffect(() => {
        const r = document.documentElement.style;
        r.setProperty('--color-bg', state.palette.bg);
        r.setProperty('--color-surface', state.palette.surface);
        r.setProperty('--color-text', state.palette.text);
        r.setProperty('--color-text-muted', state.palette.textMuted);
        r.setProperty('--color-accent', state.palette.accent);
        r.setProperty('--color-secondary', state.palette.secondary);
      }, [state.palette]);

      // Persist palette
      useEffect(() => {
        let value: StoredPalette;
        if (state.paletteId === 'custom') {
          value = {
            kind: 'custom',
            tokens: state.palette,
            source: state.customSource ?? 'picker',
          };
        } else {
          value = { kind: 'preset', id: state.paletteId };
        }
        writePaletteV1(value);
      }, [state.palette, state.paletteId, state.customSource]);

      // Persist unlock state
      useEffect(() => {
        writeSecretsV1({ vaporwave: state.isVaporwaveUnlocked });
      }, [state.isVaporwaveUnlocked]);

      // Konami integration — D-14 sequence: UNLOCK first (so Wave 4 can fire confetti
      // using the *new* unlocked state), then SET_PRESET so the next render shows
      // Vaporwave with the card highlighted. Wave 4 PaletteFab also opens the Sheet
      // after this sequence.
      const handleUnlock = useCallback(() => {
        dispatch({ type: 'UNLOCK_VAPORWAVE' });
        dispatch({ type: 'SET_PRESET', id: 'vaporwave' });
      }, []);
      useKonamiCode(handleUnlock);

      // Stable action creators
      const setPreset = useCallback((id: PaletteId) => dispatch({ type: 'SET_PRESET', id }), []);
      const setCustomColor = useCallback(
        (input: { bg: string; accent: string; secondary: string }) =>
          dispatch({ type: 'SET_CUSTOM_FROM_PICKER', userInput: input }),
        [],
      );
      const setHarmonic = useCallback(
        (mode: HarmonicMode, sourceHex: string) =>
          dispatch({ type: 'SET_HARMONIC', mode, sourceColor: sourceHex }),
        [],
      );
      const unlockVaporwave = useCallback(() => dispatch({ type: 'UNLOCK_VAPORWAVE' }), []);

      // Memoize context value to prevent identity churn (Pitfall H)
      const value = useMemo<PaletteContextValue>(
        () => ({
          palette: state.palette,
          paletteId: state.paletteId,
          isCustom: state.isCustom,
          customSource: state.customSource,
          isVaporwaveUnlocked: state.isVaporwaveUnlocked,
          wasAdjustedForAA: state.wasAdjustedForAA,
          setPreset,
          setCustomColor,
          setHarmonic,
          unlockVaporwave,
        }),
        [state, setPreset, setCustomColor, setHarmonic, unlockVaporwave],
      );

      return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
    }
    ```

    **components/providers/ThemeProvider.test.tsx:**

    ```tsx
    import { describe, it, expect, beforeEach } from 'vitest';
    import { renderHook, act } from '@testing-library/react';
    import { ThemeProvider, usePalette } from './ThemeProvider';
    import { PALETTES } from '@/lib/palettes';
    import type { ReactNode } from 'react';

    const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

    beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('style');
    });

    describe('ThemeProvider — setPreset (THEME-04)', () => {
      it('setPreset writes 6 --color-* vars onto document.documentElement', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        act(() => result.current.setPreset('nordic'));
        const nordic = PALETTES.find((p) => p.id === 'nordic')!;
        expect(document.documentElement.style.getPropertyValue('--color-bg')).toBe(nordic.bg);
        expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe(nordic.accent);
      });
      it('setPreset persists to palette-v1', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        act(() => result.current.setPreset('ocean'));
        expect(JSON.parse(localStorage.getItem('palette-v1')!)).toEqual({ kind: 'preset', id: 'ocean' });
      });
      it('setPreset updates paletteId and clears isCustom', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        act(() => result.current.setPreset('bauhaus'));
        expect(result.current.paletteId).toBe('bauhaus');
        expect(result.current.isCustom).toBe(false);
        expect(result.current.customSource).toBeNull();
      });
    });

    describe('ThemeProvider — setCustomColor (THEME-04 + D-10 + D-11)', () => {
      it('derives missing tokens and writes them all', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        act(() =>
          result.current.setCustomColor({
            bg: 'oklch(0.97 0.012 80)',
            accent: 'oklch(0.62 0.155 35)',
            secondary: 'oklch(0.55 0.075 145)',
          }),
        );
        expect(result.current.isCustom).toBe(true);
        expect(result.current.paletteId).toBe('custom');
        expect(result.current.customSource).toBe('picker');
        expect(document.documentElement.style.getPropertyValue('--color-text')).not.toBe('');
        expect(document.documentElement.style.getPropertyValue('--color-text-muted')).not.toBe('');
        expect(document.documentElement.style.getPropertyValue('--color-surface')).not.toBe('');
      });
      it('persists custom palette with full tokens object', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        act(() =>
          result.current.setCustomColor({
            bg: 'oklch(0.97 0.012 80)',
            accent: 'oklch(0.62 0.155 35)',
            secondary: 'oklch(0.55 0.075 145)',
          }),
        );
        const stored = JSON.parse(localStorage.getItem('palette-v1')!);
        expect(stored.kind).toBe('custom');
        expect(stored.source).toBe('picker');
        expect(Object.keys(stored.tokens).sort()).toEqual(
          ['accent', 'bg', 'secondary', 'surface', 'text', 'textMuted'],
        );
      });
    });

    describe('ThemeProvider — setHarmonic (THEME-04 + THEME-03)', () => {
      it('applies harmonic palette and marks customSource=harmonic', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        act(() => result.current.setHarmonic('complementary', '#3366cc'));
        expect(result.current.isCustom).toBe(true);
        expect(result.current.customSource).toBe('harmonic');
        const stored = JSON.parse(localStorage.getItem('palette-v1')!);
        expect(stored.kind).toBe('custom');
        expect(stored.source).toBe('harmonic');
      });
    });

    describe('ThemeProvider — Konami unlock (THEME-12 integration, D-14)', () => {
      it('unlocks vaporwave + switches to vaporwave preset on Konami', () => {
        const { result } = renderHook(() => usePalette(), { wrapper });
        const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
        act(() => {
          for (const code of SEQUENCE) {
            window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
          }
        });
        expect(result.current.isVaporwaveUnlocked).toBe(true);
        expect(result.current.paletteId).toBe('vaporwave');
        const secrets = JSON.parse(localStorage.getItem('palette-secrets-v1')!);
        expect(secrets).toEqual({ vaporwave: true });
      });
    });

    describe('ThemeProvider — initFromStorage rehydration', () => {
      it('restores preset from storage on mount', () => {
        localStorage.setItem('palette-v1', JSON.stringify({ kind: 'preset', id: 'ocean' }));
        const { result } = renderHook(() => usePalette(), { wrapper });
        expect(result.current.paletteId).toBe('ocean');
      });
      it('restores custom palette from storage on mount', () => {
        const tokens = {
          bg: 'oklch(0.97 0 0)', surface: 'oklch(0.94 0 0)',
          text: 'oklch(0.15 0 0)', textMuted: 'oklch(0.5 0 0)',
          accent: 'oklch(0.62 0.155 35)', secondary: 'oklch(0.55 0.075 145)',
        };
        localStorage.setItem('palette-v1', JSON.stringify({ kind: 'custom', tokens, source: 'harmonic' }));
        const { result } = renderHook(() => usePalette(), { wrapper });
        expect(result.current.isCustom).toBe(true);
        expect(result.current.customSource).toBe('harmonic');
        expect(result.current.palette).toEqual(tokens);
      });
      it('restores vaporwave unlock from secrets', () => {
        localStorage.setItem('palette-secrets-v1', JSON.stringify({ vaporwave: true }));
        const { result } = renderHook(() => usePalette(), { wrapper });
        expect(result.current.isVaporwaveUnlocked).toBe(true);
      });
    });

    describe('usePalette outside provider', () => {
      it('throws a helpful error', () => {
        // Suppress React's error log
        const origError = console.error;
        console.error = () => {};
        expect(() => renderHook(() => usePalette())).toThrow(/usePalette/);
        console.error = origError;
      });
    });
    ```

    Run `npx vitest run components/providers/ThemeProvider.test.tsx` → must pass. Commit: `feat(02-03): implement ThemeProvider + tests (THEME-04, THEME-12 integration)`.
  </action>
  <verify>
    <automated>npx vitest run components/providers/ThemeProvider.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `components/providers/ThemeProvider.tsx` exists with `'use client'` on line 1
    - File exports `ThemeProvider` component and `usePalette` hook + `PaletteContextValue` type
    - File uses `useReducer` with action types: `SET_PRESET`, `SET_CUSTOM_FROM_PICKER`, `SET_HARMONIC`, `UNLOCK_VAPORWAVE`
    - File initializes state via `useReducer(reducer, undefined, initFromStorage)` (lazy init pattern per RESEARCH.md Pitfall B)
    - File contains exactly 6 `setProperty('--color-*', ...)` calls in the CSS-var useEffect (bg/surface/text/text-muted/accent/secondary)
    - File calls `useKonamiCode(handleUnlock)` where handleUnlock dispatches BOTH `UNLOCK_VAPORWAVE` and `SET_PRESET('vaporwave')` (D-14 sequence)
    - File memoizes context value via `useMemo` (Pitfall H)
    - File contains zero `: any` annotations
    - `components/providers/ThemeProvider.test.tsx` exists with at least 10 tests covering setPreset, setCustomColor, setHarmonic, Konami unlock, rehydration from storage, and provider-not-mounted error
    - `npx vitest run components/providers/ThemeProvider.test.tsx` exits 0
  </acceptance_criteria>
  <done>ThemeProvider operational. usePalette() is the single API surface for all Wave 3 UI components. State transitions persist to localStorage and apply to :root in one atomic effect.</done>
</task>

<task type="auto">
  <name>Task 4: Wire PaletteFouCScript + ThemeProvider into app/[locale]/layout.tsx</name>
  <files>app/[locale]/layout.tsx</files>
  <read_first>
    - app/[locale]/layout.tsx (current state — empty <head> at lines 27-42 with comment, NextIntlClientProvider wrapping children)
    - components/theme/PaletteFouCScript.tsx (just created in Task 2)
    - components/providers/ThemeProvider.tsx (just created in Task 3)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-03 FOUC mount point, code_context: ThemeProvider inside NextIntlClientProvider)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Discretion: "Where ThemeProvider sits in the layout tree — default inside NextIntlClientProvider")
  </read_first>
  <action>
    Edit `app/[locale]/layout.tsx`. Two integration points:

    1. **`<head>`** — replace the comment block (lines 27-42) with `<PaletteFouCScript />`. Add the import at the top.

    2. **`<body>`** — wrap `{children}` inside `<ThemeProvider>` which sits INSIDE `<NextIntlClientProvider>` (per RESEARCH.md Discretion + CONTEXT.md code_context: "ThemeProvider wraps {children} inside NextIntlClientProvider so palette UI can use useTranslations").

    Final shape of the file:

    ```tsx
    import type { ReactNode } from 'react';
    import { notFound } from 'next/navigation';
    import { NextIntlClientProvider, hasLocale } from 'next-intl';
    import { setRequestLocale, getMessages } from 'next-intl/server';
    import { routing } from '@/i18n/routing';
    import { PaletteFouCScript } from '@/components/theme/PaletteFouCScript';
    import { ThemeProvider } from '@/components/providers/ThemeProvider';

    export function generateStaticParams() {
      return routing.locales.map((locale) => ({ locale }));
    }

    type Params = Promise<{ locale: string }>;

    export default async function LocaleLayout({
      children,
      params,
    }: {
      children: ReactNode;
      params: Params;
    }) {
      const { locale } = await params;
      if (!hasLocale(routing.locales, locale)) notFound();
      setRequestLocale(locale);
      const messages = await getMessages();

      return (
        <html lang={locale} suppressHydrationWarning>
          <head>
            {/* THEME-05 (Phase 2): pre-hydration palette restore.
                See components/theme/PaletteFouCScript.tsx for the inlined logic. */}
            <PaletteFouCScript />
          </head>
          <body>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ThemeProvider>{children}</ThemeProvider>
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }
    ```

    Verify:
    - `npm run build` exits 0 (Next 16 must accept beforeInteractive Script inside server-component `<head>`)
    - `npm run dev` starts cleanly
    - DevTools on first load with a non-Terra palette stored in localStorage: no flash of Terra defaults before paint. This is a manual check deferred to Plan 02-VALIDATION.md UAT (Phase gate). Build success is the automatable gate here.

    Commit: `feat(02-03): wire PaletteFouCScript + ThemeProvider into [locale]/layout (THEME-05)`.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/layout.tsx` imports `PaletteFouCScript` from `'@/components/theme/PaletteFouCScript'`
    - `app/[locale]/layout.tsx` imports `ThemeProvider` from `'@/components/providers/ThemeProvider'`
    - `app/[locale]/layout.tsx` `<head>` contains `<PaletteFouCScript />` (or `<PaletteFouCScript/>`)
    - `app/[locale]/layout.tsx` body wraps `{children}` inside `<ThemeProvider>` which is inside `<NextIntlClientProvider>`
    - `app/[locale]/layout.tsx` retains `<html lang={locale} suppressHydrationWarning>` (Pitfall 1 — REQUIRED for FOUC script to mutate :root pre-hydration without React warnings)
    - `npm run build` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>FOUC script + ThemeProvider live in production layout. THEME-05 + THEME-04 integration complete. Wave 3 plans can render UI components anywhere in the tree and consume usePalette().</done>
</task>

</tasks>

<verification>
- `npx vitest run components/providers/ThemeProvider.test.tsx` exits 0
- `npm run build` exits 0 (verifies PaletteFouCScript renders inside `<head>` per Next 16 rules)
- `npm run lint` exits 0
- Both messages/{fr,en}.json contain `"Vaporwave"` (not `"???"`) and `palette.wcag.adjusted` key
- Manual FOUC test deferred to Phase-gate manual checklist per 02-VALIDATION.md
</verification>

<success_criteria>
- THEME-04 (ThemeProvider + usePalette + persistence) fully satisfied
- THEME-05 (FOUC script <head> beforeInteractive) fully satisfied
- D-02 silent fallback verified end-to-end through both ThemeProvider initFromStorage and the inline FOUC script
- D-14 unlock sequence (UNLOCK_VAPORWAVE + SET_PRESET('vaporwave')) wired in ThemeProvider — Wave 4 PaletteFab will add the confetti + Sheet open
- D-15 + D-06 i18n keys ready for Wave 3 consumers
</success_criteria>

<output>
After completion, create `.planning/phases/02-palette-system/02-03-SUMMARY.md` documenting:
- ThemeProvider LOC + reducer action count
- Test count in ThemeProvider.test.tsx
- Measured FOUC script size in the build output (run `grep -A 1 "palette-fouc" .next/server/app/**/*.html | head -50` and report bytes)
- Confirmation that the global 400ms color transition from app/globals.css picks up CSS-var changes (visible visually when switching presets in the dev server)
- The usePalette() API surface that Wave 3 will consume
</output>
</content>
</invoke>