---
phase: 02-palette-system
plan: 06
type: execute
wave: 4
depends_on:
  - 02-palette-system/04
  - 02-palette-system/05
files_modified:
  - components/providers/ThemeProvider.tsx
  - components/theme/PaletteFab.tsx
  - components/theme/PaletteFab.test.tsx
  - app/[locale]/layout.tsx
autonomous: true
requirements:
  - THEME-11
  - THEME-12
must_haves:
  truths:
    - "PaletteFab renders a fixed bottom-right button with the Lucide palette icon on every route"
    - "PaletteFab has localized aria-label sourced from t('palette.open') / t('palette.close') (THEME-11)"
    - "PaletteFab owns the open state of PaletteSwitcher via useState; clicking toggles, Sheet onOpenChange closes"
    - "PaletteFab applies motion hover scale 1.0→1.08 + rotate 5deg (D-08); while open rotates 180deg + crossfades to Lucide X"
    - "PaletteFab gates animations on usePrefersReducedMotion: opacity-only feedback when reduced"
    - "ThemeProvider's Konami unlock fires confetti via dynamic-import('canvas-confetti') with Vaporwave accent+secondary hex colors (D-13)"
    - "On Konami unlock, the Sheet auto-opens on the Presets tab (D-14) — wired via context/state-lift between ThemeProvider and PaletteFab"
    - "Confetti is gated on prefers-reduced-motion: skipped or fade-only fallback (D-13 + Research Discretion)"
  artifacts:
    - path: "components/theme/PaletteFab.tsx"
      provides: "Fixed FAB owning open state + motion icon + mounts PaletteSwitcher"
      exports: ["PaletteFab"]
    - path: "components/providers/ThemeProvider.tsx"
      provides: "Updated to fire canvas-confetti + emit a subscribable unlock event (FAB consumes)"
      contains: "canvas-confetti"
    - path: "app/[locale]/layout.tsx"
      provides: "Wires PaletteFab as a sibling of {children} inside ThemeProvider"
      contains: "<PaletteFab"
  key_links:
    - from: "components/theme/PaletteFab.tsx"
      to: "components/theme/PaletteSwitcher"
      via: "Renders <PaletteSwitcher open={open} onOpenChange={setOpen} />"
      pattern: "<PaletteSwitcher"
    - from: "components/providers/ThemeProvider.tsx"
      to: "canvas-confetti (dynamic import)"
      via: "await import('canvas-confetti') only in onUnlock handler"
      pattern: "await import\\(['\"]canvas-confetti"
    - from: "components/providers/ThemeProvider.tsx onUnlock"
      to: "FAB open state"
      via: "context-exposed callback / event mechanism so FAB opens Sheet without polling"
      pattern: "onVaporwaveUnlock|subscribeUnlock|isVaporwaveUnlocked"
---

<objective>
Ship the FAB (THEME-11) and complete the Konami unlock UX (THEME-12) with confetti + auto-open Sheet (D-13, D-14). This plan:
- Adds the PaletteFab client component (Lucide palette icon, motion hover/rotate, FAB-owns-Sheet-state pattern, prefers-reduced-motion gate).
- Updates ThemeProvider to fire canvas-confetti (dynamic import per D-13) and expose a mechanism so FAB can react to the unlock event by opening the Sheet (D-14 sequence step 5).
- Mounts PaletteFab into app/[locale]/layout.tsx as a sibling of {children}, inside ThemeProvider.

Purpose: Finish Phase 2. THEME-11 + THEME-12 complete; all 12 REQs covered across the 7-plan set.
Output: 1 new client component + 1 test file + ThemeProvider update + layout wiring.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-palette-system/02-CONTEXT.md
@.planning/phases/02-palette-system/02-RESEARCH.md
@lib/palettes.ts
@lib/colors.ts
@lib/hooks/usePrefersReducedMotion.ts
@components/providers/ThemeProvider.tsx
@components/theme/PaletteSwitcher.tsx
@app/[locale]/layout.tsx
@messages/fr.json

<interfaces>
From Plan 03 (ThemeProvider — must be UPDATED here):
```ts
// Current usePalette return shape (Plan 03):
{
  palette, paletteId, isCustom, customSource, isVaporwaveUnlocked, wasAdjustedForAA,
  setPreset, setCustomColor, setHarmonic, unlockVaporwave
}

// Plan 06 adds (so FAB can react to unlock):
// - The reducer's UNLOCK_VAPORWAVE handler will also fire confetti (dynamic import)
//   AND set a transient state flag the FAB watches to open the Sheet exactly once
//   per unlock.
```

From Plan 05 (PaletteSwitcher controlled-Sheet API):
```ts
type PaletteSwitcherProps = { open: boolean; onOpenChange: (open: boolean) => void };
```

From Plan 02 (usePrefersReducedMotion):
```ts
export function usePrefersReducedMotion(): boolean;
```

From Plan 01 (lib/colors):
```ts
export function oklchToHex(oklch: string): string;  // for confetti colors (D-13)
```

Lucide icons used: `Palette`, `X` (from lucide-react which is already in deps).
motion package: `motion/react` — already installed via Wave 0.
canvas-confetti: `canvas-confetti` + `@types/canvas-confetti` — already installed via Wave 0.

i18n keys: palette.open, palette.close (already in messages/{fr,en}.json from Phase 1).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update components/providers/ThemeProvider.tsx — fire confetti on unlock + expose subscribable open trigger</name>
  <files>components/providers/ThemeProvider.tsx</files>
  <read_first>
    - components/providers/ThemeProvider.tsx (current Plan 03 state — reducer + Konami listener)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-13 confetti spec + D-14 sequence + D-08 prefers-reduced-motion fallback)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Confetti dynamic import lines 932-952, Discretion: "prefers-reduced-motion fallback for the confetti burst — suggest fade-only")
    - lib/palettes.ts (Vaporwave palette accent + secondary — confetti colors source)
    - lib/colors.ts (oklchToHex helper from Plan 01)
  </read_first>
  <action>
    Edit `components/providers/ThemeProvider.tsx` to:

    1. **Add `vaporwaveUnlockNonce` to the state** — a counter that increments on every `UNLOCK_VAPORWAVE` action. FAB subscribes to this nonce; whenever it changes, FAB opens the Sheet exactly once. This avoids the "polling isVaporwaveUnlocked then opening Sheet on every render when it's already true" anti-pattern.

    2. **Replace the simple `handleUnlock`** with one that:
       - Dispatches `UNLOCK_VAPORWAVE` (increments nonce + sets isVaporwaveUnlocked)
       - Dispatches `SET_PRESET id=vaporwave`
       - Dynamically imports `canvas-confetti` and fires the burst with Vaporwave accent + secondary hex colors
       - Gates the confetti on `usePrefersReducedMotion()` — when reduced, skip the visual burst (fade-only is implicit since we just don't render particles)

    3. **Expose the nonce** in the context value (so PaletteFab can `useEffect(() => setOpen(true), [vaporwaveUnlockNonce])`)

    Concrete diff — replace the existing reducer + provider with the updated version. The full file becomes:

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
      oklchToHex,
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
    import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

    type ActivePaletteId = PaletteId | 'custom';

    type ThemeState = {
      palette: Omit<Palette, 'id' | 'name'>;
      paletteId: ActivePaletteId;
      isCustom: boolean;
      customSource: 'picker' | 'harmonic' | null;
      isVaporwaveUnlocked: boolean;
      wasAdjustedForAA: boolean;
      vaporwaveUnlockNonce: number;
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
          return {
            ...state,
            isVaporwaveUnlocked: true,
            vaporwaveUnlockNonce: state.vaporwaveUnlockNonce + 1,
          };
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
        vaporwaveUnlockNonce: 0,
      };
    }

    export type PaletteContextValue = {
      palette: Omit<Palette, 'id' | 'name'>;
      paletteId: ActivePaletteId;
      isCustom: boolean;
      customSource: 'picker' | 'harmonic' | null;
      isVaporwaveUnlocked: boolean;
      wasAdjustedForAA: boolean;
      vaporwaveUnlockNonce: number;
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

    /**
     * Fire canvas-confetti dynamically (D-13).
     * Module loaded only on Konami unlock — zero cold-load cost.
     * Colors sourced from Vaporwave.accent + Vaporwave.secondary (D-13).
     */
    async function fireConfetti(): Promise<void> {
      if (typeof window === 'undefined') return;
      try {
        const { default: confetti } = await import('canvas-confetti');
        const vw = PALETTES.find((p) => p.id === 'vaporwave');
        const colors: string[] = vw
          ? [oklchToHex(vw.accent), oklchToHex(vw.secondary)]
          : ['#ff66cc', '#66ccff'];
        await confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.7 },
          colors,
          startVelocity: 35,
          gravity: 0.9,
          ticks: 200,
        });
      } catch {
        // D-02 spirit: silent on failure. Easter egg should never crash.
      }
    }

    export function ThemeProvider({ children }: { children: ReactNode }) {
      const [state, dispatch] = useReducer(reducer, undefined, initFromStorage);
      const reducedMotion = usePrefersReducedMotion();

      // CSS variable writer
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
        const value: StoredPalette =
          state.paletteId === 'custom'
            ? {
                kind: 'custom',
                tokens: state.palette,
                source: state.customSource ?? 'picker',
              }
            : { kind: 'preset', id: state.paletteId };
        writePaletteV1(value);
      }, [state.palette, state.paletteId, state.customSource]);

      // Persist unlock state
      useEffect(() => {
        writeSecretsV1({ vaporwave: state.isVaporwaveUnlocked });
      }, [state.isVaporwaveUnlocked]);

      // D-14: Konami unlock sequence
      const handleUnlock = useCallback(() => {
        dispatch({ type: 'UNLOCK_VAPORWAVE' });
        dispatch({ type: 'SET_PRESET', id: 'vaporwave' });
        // D-13 + Discretion: skip the visual burst when reduced motion is set
        if (!reducedMotion) {
          void fireConfetti();
        }
      }, [reducedMotion]);

      useKonamiCode(handleUnlock);

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

      const value = useMemo<PaletteContextValue>(
        () => ({
          palette: state.palette,
          paletteId: state.paletteId,
          isCustom: state.isCustom,
          customSource: state.customSource,
          isVaporwaveUnlocked: state.isVaporwaveUnlocked,
          wasAdjustedForAA: state.wasAdjustedForAA,
          vaporwaveUnlockNonce: state.vaporwaveUnlockNonce,
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

    The existing ThemeProvider.test.tsx tests from Plan 03 should still pass — `vaporwaveUnlockNonce` starts at 0 and increments to 1 after the test's Konami sequence. Add ONE new test verifying the nonce increments on UNLOCK:

    Append to existing `components/providers/ThemeProvider.test.tsx` (inside the existing Konami describe block):

    ```ts
    it('increments vaporwaveUnlockNonce on each unlock (D-14 trigger)', () => {
      const { result } = renderHook(() => usePalette(), { wrapper });
      expect(result.current.vaporwaveUnlockNonce).toBe(0);
      act(() => result.current.unlockVaporwave());
      expect(result.current.vaporwaveUnlockNonce).toBe(1);
      act(() => result.current.unlockVaporwave());
      expect(result.current.vaporwaveUnlockNonce).toBe(2);
    });
    ```

    Confetti is NOT directly testable in jsdom (no canvas paint). The dynamic import boundary is verified by the existence of the literal `await import('canvas-confetti')` in the source (acceptance criterion).
  </action>
  <verify>
    <automated>npx vitest run components/providers/ThemeProvider.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - components/providers/ThemeProvider.tsx contains the literal `vaporwaveUnlockNonce`
    - The `UNLOCK_VAPORWAVE` reducer case increments `vaporwaveUnlockNonce` by 1 each dispatch
    - File contains the literal `await import('canvas-confetti')` inside the `fireConfetti` function
    - The confetti `colors` array is sourced from `oklchToHex(vw.accent)` and `oklchToHex(vw.secondary)` (Vaporwave palette) — D-13
    - File reads `usePrefersReducedMotion()` and gates the `fireConfetti()` call behind `if (!reducedMotion)` — D-13 + Discretion
    - The context value exposes `vaporwaveUnlockNonce` to consumers
    - components/providers/ThemeProvider.test.tsx contains the new "increments vaporwaveUnlockNonce" test
    - `npx vitest run components/providers/ThemeProvider.test.tsx` exits 0 (all previous + new tests pass)
    - File contains zero `: any` annotations
  </acceptance_criteria>
  <done>ThemeProvider fires confetti on unlock with prefers-reduced-motion gating. The `vaporwaveUnlockNonce` is the signal Plan 06 Task 2's PaletteFab will subscribe to for auto-opening the Sheet.</done>
</task>

<task type="auto">
  <name>Task 2: Build components/theme/PaletteFab.tsx + tests (THEME-11 + D-08 motion + D-14 auto-open)</name>
  <files>components/theme/PaletteFab.tsx, components/theme/PaletteFab.test.tsx</files>
  <read_first>
    - components/providers/ThemeProvider.tsx (just updated — vaporwaveUnlockNonce + usePalette)
    - components/theme/PaletteSwitcher.tsx (controlled-Sheet API: open + onOpenChange)
    - lib/hooks/usePrefersReducedMotion.ts (gate for motion)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-08 FAB motion spec, D-14 unlock sequence: setOpen(true) on Presets tab)
    - .planning/phases/02-palette-system/02-RESEARCH.md (FAB sketch lines 956-991, Discretion on prefers-reduced-motion fallback)
    - messages/fr.json (palette.open, palette.close)
  </read_first>
  <action>
    Create components/theme/PaletteFab.tsx (Client Component):

    ```tsx
    'use client';

    import { motion } from 'motion/react';
    import { Palette as PaletteIcon, X } from 'lucide-react';
    import { useTranslations } from 'next-intl';
    import { useEffect, useState } from 'react';
    import { PaletteSwitcher } from './PaletteSwitcher';
    import { usePalette } from '@/components/providers/ThemeProvider';
    import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

    /**
     * PaletteFab (THEME-11).
     *
     * Fixed bottom-right FAB. Lucide palette icon. Opens PaletteSwitcher.
     *
     * Motion (D-08):
     *   - whileHover: scale 1.08 + rotate 5deg (200ms ease)
     *   - whileTap: scale 0.95
     *   - When open: icon rotates 180deg + cross-fades to Lucide X
     *   - prefers-reduced-motion: animation props disabled (opacity-only feedback via Tailwind hover:)
     *
     * Auto-open on Konami (D-14):
     *   - Subscribes to vaporwaveUnlockNonce from usePalette
     *   - On nonce change (> 0), calls setOpen(true). Sheet's defaultValue="presets"
     *     ensures the Presets tab is active — D-14 sequence step 5.
     */
    export function PaletteFab() {
      const t = useTranslations('palette');
      const reduced = usePrefersReducedMotion();
      const { vaporwaveUnlockNonce } = usePalette();
      const [open, setOpen] = useState(false);

      // D-14 auto-open on Konami unlock (nonce increments on every unlock dispatch)
      useEffect(() => {
        if (vaporwaveUnlockNonce > 0) {
          setOpen(true);
        }
      }, [vaporwaveUnlockNonce]);

      return (
        <>
          <motion.button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('close') : t('open')}
            data-testid="palette-fab"
            className={[
              'fixed bottom-6 right-6 z-40',
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-primary text-primary-foreground shadow-lg',
              'pb-[max(0px,env(safe-area-inset-bottom))]',
              'pr-[max(0px,env(safe-area-inset-right))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              reduced ? 'transition-opacity hover:opacity-80' : '',
            ].filter(Boolean).join(' ')}
            whileHover={reduced ? {} : { scale: 1.08, rotate: 5 }}
            whileTap={reduced ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.span
              className="block"
              animate={reduced ? {} : { rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {open ? <X size={20} aria-hidden /> : <PaletteIcon size={20} aria-hidden />}
            </motion.span>
          </motion.button>

          <PaletteSwitcher open={open} onOpenChange={setOpen} />
        </>
      );
    }
    ```

    Create components/theme/PaletteFab.test.tsx:

    ```tsx
    import { describe, it, expect, beforeEach } from 'vitest';
    import { render, screen, act } from '@testing-library/react';
    import userEvent from '@testing-library/user-event';
    import { NextIntlClientProvider } from 'next-intl';
    import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
    import { PaletteFab } from './PaletteFab';
    import frMessages from '@/messages/fr.json';
    import enMessages from '@/messages/en.json';
    import type { ReactNode } from 'react';

    function FrWrapper({ children }: { children: ReactNode }) {
      return (
        <NextIntlClientProvider locale="fr" messages={frMessages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      );
    }
    function EnWrapper({ children }: { children: ReactNode }) {
      return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      );
    }

    function FabAndUnlock() {
      const { unlockVaporwave } = usePalette();
      return (
        <>
          <PaletteFab />
          <button data-testid="trigger-unlock" onClick={() => unlockVaporwave()}>unlock</button>
        </>
      );
    }

    beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('style');
    });

    describe('PaletteFab (THEME-11)', () => {
      it('renders FAB with FR localized aria-label "Ouvrir le sélecteur de palette" by default', () => {
        render(<FrWrapper><PaletteFab /></FrWrapper>);
        const fab = screen.getByTestId('palette-fab');
        expect(fab.getAttribute('aria-label')).toBe(frMessages.palette.open);
      });

      it('renders FAB with EN localized aria-label "Open palette switcher" by default', () => {
        render(<EnWrapper><PaletteFab /></EnWrapper>);
        const fab = screen.getByTestId('palette-fab');
        expect(fab.getAttribute('aria-label')).toBe(enMessages.palette.open);
      });

      it('clicking FAB toggles open state — Sheet content becomes accessible', async () => {
        const user = userEvent.setup();
        render(<FrWrapper><PaletteFab /></FrWrapper>);
        const fab = screen.getByTestId('palette-fab');
        await user.click(fab);
        // After open, the Sheet's title (palette.title = "Palette") is rendered
        expect(screen.getAllByText(frMessages.palette.title).length).toBeGreaterThan(0);
        // aria-label switches to close text
        expect(fab.getAttribute('aria-label')).toBe(frMessages.palette.close);
      });
    });

    describe('PaletteFab — D-14 auto-open on Konami unlock', () => {
      it('FAB opens Sheet when vaporwaveUnlockNonce increments', () => {
        render(<FrWrapper><FabAndUnlock /></FrWrapper>);
        // Initially closed
        expect(screen.getByTestId('palette-fab').getAttribute('aria-label')).toBe(frMessages.palette.open);
        // Trigger unlock dispatch (simulating Konami completion)
        act(() => screen.getByTestId('trigger-unlock').click());
        // FAB aria-label should now reflect open=true
        expect(screen.getByTestId('palette-fab').getAttribute('aria-label')).toBe(frMessages.palette.close);
      });
    });
    ```

    Run `npx vitest run components/theme/PaletteFab.test.tsx` → must pass 4/4.
  </action>
  <verify>
    <automated>npx vitest run components/theme/PaletteFab.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - components/theme/PaletteFab.tsx exists with `'use client'` on line 1
    - File imports `motion` from `'motion/react'` (NOT framer-motion)
    - File imports `Palette as PaletteIcon, X` from `'lucide-react'`
    - File imports `useTranslations` from `'next-intl'` and reads `palette.open` and `palette.close`
    - File imports `PaletteSwitcher` from `'./PaletteSwitcher'`
    - File imports `usePrefersReducedMotion` from `'@/lib/hooks/usePrefersReducedMotion'`
    - File contains `useState(false)` for the local `open` boolean
    - File contains `useEffect(...)` watching `vaporwaveUnlockNonce` that calls `setOpen(true)` when nonce > 0 (D-14)
    - File contains `whileHover` with `scale: 1.08, rotate: 5` AND `whileHover={reduced ? {} : ...}` gating (D-08 prefers-reduced-motion)
    - File contains `animate` with `rotate: open ? 180 : 0` (D-08 — open state rotates 180deg)
    - File contains className `fixed bottom-6 right-6` (positioning) and `safe-area-inset-bottom` reference
    - File renders `<PaletteSwitcher open={open} onOpenChange={setOpen} />`
    - components/theme/PaletteFab.test.tsx exists with at least 4 tests (FR aria-label, EN aria-label, click-to-open, auto-open on nonce increment)
    - `npx vitest run components/theme/PaletteFab.test.tsx` exits 0
  </acceptance_criteria>
  <done>PaletteFab ships. Owns the Sheet open state, reacts to Konami unlock via vaporwaveUnlockNonce subscription, motion-gated by prefers-reduced-motion.</done>
</task>

<task type="auto">
  <name>Task 3: Mount PaletteFab in app/[locale]/layout.tsx (THEME-11 — visible on every route)</name>
  <files>app/[locale]/layout.tsx</files>
  <read_first>
    - app/[locale]/layout.tsx (current state after Plan 03 Task 4 — PaletteFouCScript in head, ThemeProvider inside NextIntlClientProvider in body)
    - components/theme/PaletteFab.tsx (just created)
    - .planning/phases/02-palette-system/02-CONTEXT.md (code_context: "FAB mount point — also inside ThemeProvider, sibling to {children}. Visible on every route.")
  </read_first>
  <action>
    Edit `app/[locale]/layout.tsx`. Add an import for `PaletteFab` and mount it as a sibling of `{children}` INSIDE `ThemeProvider` (so it can consume `usePalette()`).

    Final state of the file body section:

    ```tsx
    <body>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          {children}
          <PaletteFab />
        </ThemeProvider>
      </NextIntlClientProvider>
    </body>
    ```

    Add the import next to the existing PaletteFouCScript + ThemeProvider imports at the top:

    ```tsx
    import { PaletteFab } from '@/components/theme/PaletteFab';
    ```

    Verify:
    - `npm run build` exits 0
    - `npm run dev` starts cleanly — manual visit to http://localhost:3000/fr shows the FAB bottom-right
    - Both `/fr` and `/en` routes render the FAB (it's in the [locale] layout so this is guaranteed structurally)
  </action>
  <verify>
    <automated>npm run build &amp;&amp; node -e "const fs=require('fs'); const layout=fs.readFileSync('app/[locale]/layout.tsx','utf8'); if (!layout.includes(\"import { PaletteFab } from '@/components/theme/PaletteFab'\") &amp;&amp; !layout.includes('from \"@/components/theme/PaletteFab\"')) { console.error('PaletteFab import missing'); process.exit(1); } if (!layout.includes('<PaletteFab')) { console.error('PaletteFab not mounted'); process.exit(1); } if (!/<ThemeProvider>[\s\S]*<PaletteFab[\s\S]*<\/ThemeProvider>/.test(layout)) { console.error('PaletteFab not inside ThemeProvider'); process.exit(1); } console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/layout.tsx` imports `PaletteFab` from `'@/components/theme/PaletteFab'`
    - `app/[locale]/layout.tsx` renders `<PaletteFab />` as a sibling of `{children}` INSIDE `<ThemeProvider>` (so it can read context)
    - `app/[locale]/layout.tsx` still renders `<PaletteFouCScript />` in `<head>` (Plan 03 wiring preserved)
    - `app/[locale]/layout.tsx` still wraps `{children}` in `<ThemeProvider>` inside `<NextIntlClientProvider>` (Plan 03 wiring preserved)
    - `npm run build` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>FAB visible on every `/fr/*` and `/en/*` route. Konami unlock works end-to-end: type sequence → ThemeProvider reducer updates state → vaporwaveUnlockNonce increments → FAB useEffect opens Sheet → user sees Vaporwave preset card as 5th option, highlighted active.</done>
</task>

</tasks>

<verification>
- `npx vitest run` (full suite) exits 0 — all Phase 2 tests green
- `npm run build` exits 0
- `npm run lint` exits 0
- `npm run test:palettes` exits 0 (palette WCAG gate from Wave 0 still holds)
- Manual phase-gate verification (per 02-VALIDATION.md "Manual-Only Verifications" table): FOUC no-flash on Slow 3G + saved palette, Sheet keyboard nav (Tab/Esc/focus trap), full Konami flow including confetti + auto-switch
</verification>

<success_criteria>
- THEME-11 (FAB visible everywhere, opens PaletteSwitcher, localized aria-label) satisfied
- THEME-12 (Konami unlocks Vaporwave + fires confetti + auto-opens Sheet on Presets tab) satisfied
- D-08 motion + prefers-reduced-motion gating verified
- D-13 dynamic-import canvas-confetti + Vaporwave-colored particles + reduced-motion skip verified
- D-14 unlock sequence end-to-end: UNLOCK_VAPORWAVE → SET_PRESET('vaporwave') → confetti → Sheet auto-open on Presets tab
- All 12 THEME requirements (THEME-01..THEME-12) implemented across Plans 00-06
</success_criteria>

<output>
After completion, create `.planning/phases/02-palette-system/02-06-SUMMARY.md` documenting:
- Final updated ThemeProvider LOC (note delta vs Plan 03 baseline)
- PaletteFab LOC + test count
- Confirmation that `npx vitest run` reports the total test count for Phase 2 (expected ~50+ across all plans)
- Confirmation that `npm run build` produces a zero-warning build
- Note on the FAB → Sheet state mechanism chosen (the `vaporwaveUnlockNonce` subscription approach) and rationale vs alternatives (callback-prop down the tree, event emitter, etc.)
- Surface-level numbers: dynamic-import boundary keeps canvas-confetti out of initial bundle. Check with `next build` chunk analysis if curious.
- Final list of all manual phase-gate checks deferred to `/gsd:verify-work` from 02-VALIDATION.md
</output>
</content>
</invoke>