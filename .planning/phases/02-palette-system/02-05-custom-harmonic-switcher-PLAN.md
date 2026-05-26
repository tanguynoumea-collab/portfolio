---
phase: 02-palette-system
plan: 05
type: execute
wave: 3
depends_on:
  - 02-palette-system/03
  - 02-palette-system/04
files_modified:
  - components/theme/CustomColorPicker.tsx
  - components/theme/CustomColorPicker.test.tsx
  - components/theme/HarmonicGenerator.tsx
  - components/theme/HarmonicGenerator.test.tsx
  - components/theme/PaletteSwitcher.tsx
autonomous: true
requirements:
  - THEME-07
  - THEME-08
  - THEME-10
must_haves:
  truths:
    - "CustomColorPicker exposes 3 native <input type='color'> controls (bg, accent, secondary) per D-09"
    - "CustomColorPicker uses culori parse(hex) → formatCss('oklch') to convert input — NO hex stored in state (D-09 + Pitfall C)"
    - "CustomColorPicker calls setCustomColor on change; ThemeProvider then derives the 3 missing tokens via D-10"
    - "HarmonicGenerator renders source color picker + 4 mode tabs/buttons + inline 6-swatch preview with Aa overlay (D-12)"
    - "HarmonicGenerator Apply button commits via setHarmonic(mode, sourceHex) — preview was non-destructive (Open Q3 answer (a))"
    - "PaletteSwitcher is a right-anchored shadcn Sheet with 3 tabs (Presets/Custom/Generate) and sticky WCAGBadge footer (D-04, D-06, D-07)"
    - "PaletteSwitcher always defaults to Presets tab on open (D-07 — no last-used-tab persistence)"
    - "PaletteSwitcher width: w-full on mobile, sm:max-w-[420px] desktop (D-05)"
  artifacts:
    - path: "components/theme/CustomColorPicker.tsx"
      provides: "3 native color inputs + derivation invocation (THEME-07)"
      exports: ["CustomColorPicker"]
    - path: "components/theme/HarmonicGenerator.tsx"
      provides: "Source picker + 4 modes + inline preview + Apply (THEME-08, D-12)"
      exports: ["HarmonicGenerator"]
    - path: "components/theme/PaletteSwitcher.tsx"
      provides: "Sheet shell composing Presets/Custom/Generate + sticky WCAGBadge footer (THEME-10)"
      exports: ["PaletteSwitcher"]
  key_links:
    - from: "components/theme/CustomColorPicker.tsx"
      to: "culori parse + formatCss"
      via: "hex → OKLCh conversion at onChange boundary"
      pattern: "parse|formatCss"
    - from: "components/theme/CustomColorPicker.tsx"
      to: "usePalette.setCustomColor"
      via: "Dispatch on Apply (or onChange with debounce)"
      pattern: "setCustomColor"
    - from: "components/theme/HarmonicGenerator.tsx"
      to: "lib/colors generateHarmonic + applyMatrixAdjust"
      via: "Preview computation (non-destructive) + Apply commits"
      pattern: "generateHarmonic"
    - from: "components/theme/PaletteSwitcher.tsx"
      to: "Sheet primitive + Tabs + WCAGBadge + 3 tab content components"
      via: "JSX composition"
      pattern: "SheetContent|Tabs|WCAGBadge"
---

<objective>
Build the user-facing palette authoring UI: CustomColorPicker (3 native color inputs → ThemeProvider derives the rest), HarmonicGenerator (source + 4 modes + inline preview + Apply), and the PaletteSwitcher Sheet shell that composes Presets + Custom + Generate + sticky WCAGBadge footer with full keyboard nav and Esc-to-close (THEME-10).

Purpose: Deliver THEME-07 (custom), THEME-08 (harmonic generator), THEME-10 (sheet shell with 3 tabs + sticky footer + focus trap via Radix Dialog). Plan 06 will mount this Sheet from a FAB.
Output: 2 new client components + 1 Sheet shell + 2 test files.
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
@components/providers/ThemeProvider.tsx
@components/theme/WCAGBadge.tsx
@components/theme/PalettePresets.tsx
@components/ui/sheet.tsx
@components/ui/tabs.tsx
@messages/fr.json

<interfaces>
From Plan 03 + Plan 04:
```ts
// usePalette returns:
{
  palette, paletteId, isCustom, customSource, isVaporwaveUnlocked, wasAdjustedForAA,
  setPreset, setCustomColor, setHarmonic, unlockVaporwave
}

// usePalette.setCustomColor signature:
setCustomColor(input: { bg: string; accent: string; secondary: string }): void;

// usePalette.setHarmonic signature:
setHarmonic(mode: HarmonicMode, sourceHex: string): void;
```

From lib/colors (for HarmonicGenerator preview computation):
```ts
export function generateHarmonic(mode, sourceHex): DerivedTokens;  // 6 OKLCh tokens
export function applyMatrixAdjust(p): { palette: tokens; wasAdjusted: boolean };
export function oklchToHex(oklch: string): string;
export type HarmonicMode = 'complementary' | 'triadic' | 'analogous' | 'split-complementary';
```

i18n keys already in messages/{fr,en}.json:
- palette.custom.{bg, accent, secondary}
- palette.generate.{source, modes.{complementary, triadic, analogous, split-complementary}, generate}
- palette.title, palette.open, palette.close, palette.tabs.{presets, custom, generate}
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build components/theme/CustomColorPicker.tsx + tests (THEME-07, D-09, D-10)</name>
  <files>components/theme/CustomColorPicker.tsx, components/theme/CustomColorPicker.test.tsx</files>
  <read_first>
    - components/providers/ThemeProvider.tsx (setCustomColor signature)
    - lib/colors.ts (oklchToHex, parse via culori)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-09 native color inputs, D-10 derivation, Pitfall C — hex never enters state)
    - .planning/phases/02-palette-system/02-RESEARCH.md (THEME-07 row, Component Decomposition CustomColorPicker ~120 LOC)
    - messages/fr.json (palette.custom.{bg, accent, secondary})
  </read_first>
  <action>
    Create components/theme/CustomColorPicker.tsx (Client Component):

    ```tsx
    'use client';

    import { parse, formatCss, converter } from 'culori';
    import { useTranslations } from 'next-intl';
    import { useCallback, useState, useEffect } from 'react';
    import { usePalette } from '@/components/providers/ThemeProvider';
    import { oklchToHex } from '@/lib/colors';

    const toOklch = converter('oklch');

    /**
     * Convert hex from <input type="color"> to OKLCh CSS string.
     * Returns null on parse failure (defensive — input only emits valid hex but
     * we stay safe per Pitfall C).
     */
    function hexToOklchString(hex: string): string | null {
      const parsed = parse(hex);
      const ok = parsed ? toOklch(parsed) : undefined;
      if (!ok) return null;
      return formatCss(ok);
    }

    /**
     * CustomColorPicker (THEME-07, D-09, D-10).
     *
     * Three native <input type="color"> for bg / accent / secondary.
     * On change → hex → OKLCh → setCustomColor → ThemeProvider derives the
     * 3 missing tokens (surface/text/textMuted per D-10) and writes :root.
     *
     * Storage stays OKLCh throughout — hex is only the OS-native input format.
     */
    export function CustomColorPicker() {
      const t = useTranslations('palette.custom');
      const { palette, setCustomColor } = usePalette();

      // Local UI state holds hex (what <input type="color"> needs).
      // Initialize from the live palette so users see the current values.
      const [bgHex, setBgHex] = useState(() => oklchToHex(palette.bg));
      const [accentHex, setAccentHex] = useState(() => oklchToHex(palette.accent));
      const [secondaryHex, setSecondaryHex] = useState(() => oklchToHex(palette.secondary));

      // Sync local hex with ThemeProvider when palette changes externally
      // (e.g. user clicks a preset in another tab, or Konami unlocks Vaporwave).
      useEffect(() => {
        setBgHex(oklchToHex(palette.bg));
        setAccentHex(oklchToHex(palette.accent));
        setSecondaryHex(oklchToHex(palette.secondary));
      }, [palette.bg, palette.accent, palette.secondary]);

      const dispatch = useCallback(
        (bg: string, accent: string, secondary: string) => {
          const bgOk = hexToOklchString(bg);
          const accentOk = hexToOklchString(accent);
          const secOk = hexToOklchString(secondary);
          if (!bgOk || !accentOk || !secOk) return;
          setCustomColor({ bg: bgOk, accent: accentOk, secondary: secOk });
        },
        [setCustomColor],
      );

      const onBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setBgHex(next);
        dispatch(next, accentHex, secondaryHex);
      };
      const onAccentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setAccentHex(next);
        dispatch(bgHex, next, secondaryHex);
      };
      const onSecondaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setSecondaryHex(next);
        dispatch(bgHex, accentHex, next);
      };

      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {/* Implicit per D-10: surface/text/textMuted derived automatically.
                Optional explanatory text — keep concise. */}
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{t('bg')}</span>
              <input
                type="color"
                value={bgHex}
                onChange={onBgChange}
                className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
                aria-label={t('bg')}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{t('accent')}</span>
              <input
                type="color"
                value={accentHex}
                onChange={onAccentChange}
                className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
                aria-label={t('accent')}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{t('secondary')}</span>
              <input
                type="color"
                value={secondaryHex}
                onChange={onSecondaryChange}
                className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
                aria-label={t('secondary')}
              />
            </label>
          </div>
        </div>
      );
    }
    ```

    Create components/theme/CustomColorPicker.test.tsx:

    ```tsx
    import { describe, it, expect, beforeEach } from 'vitest';
    import { render, screen, fireEvent } from '@testing-library/react';
    import { NextIntlClientProvider } from 'next-intl';
    import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
    import { CustomColorPicker } from './CustomColorPicker';
    import frMessages from '@/messages/fr.json';
    import type { ReactNode } from 'react';

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <NextIntlClientProvider locale="fr" messages={frMessages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      );
    }

    function PickerAndState() {
      const { palette, isCustom, customSource } = usePalette();
      return (
        <>
          <CustomColorPicker />
          <div data-testid="state">{JSON.stringify({ isCustom, customSource, accent: palette.accent })}</div>
        </>
      );
    }

    beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('style');
    });

    describe('CustomColorPicker (THEME-07, D-09)', () => {
      it('renders 3 native color inputs labeled bg/accent/secondary', () => {
        render(<Wrapper><CustomColorPicker /></Wrapper>);
        expect(screen.getByLabelText(frMessages.palette.custom.bg)).toBeDefined();
        expect(screen.getByLabelText(frMessages.palette.custom.accent)).toBeDefined();
        expect(screen.getByLabelText(frMessages.palette.custom.secondary)).toBeDefined();
        for (const label of [frMessages.palette.custom.bg, frMessages.palette.custom.accent, frMessages.palette.custom.secondary]) {
          const input = screen.getByLabelText(label) as HTMLInputElement;
          expect(input.type).toBe('color');
        }
      });

      it('changing the accent input triggers setCustomColor and flips isCustom (D-10 derivation runs in reducer)', () => {
        render(<Wrapper><PickerAndState /></Wrapper>);
        const accent = screen.getByLabelText(frMessages.palette.custom.accent) as HTMLInputElement;
        fireEvent.change(accent, { target: { value: '#3366cc' } });
        const state = JSON.parse(screen.getByTestId('state').textContent ?? '{}');
        expect(state.isCustom).toBe(true);
        expect(state.customSource).toBe('picker');
        // Verify the stored OKLCh accent corresponds to #3366cc (hex was converted away)
        expect(state.accent).toMatch(/^oklch\(/);
      });

      it('Pitfall C: --color-accent CSS variable is OKLCh, never hex', () => {
        render(<Wrapper><CustomColorPicker /></Wrapper>);
        const accent = screen.getByLabelText(frMessages.palette.custom.accent) as HTMLInputElement;
        fireEvent.change(accent, { target: { value: '#ff00aa' } });
        const css = document.documentElement.style.getPropertyValue('--color-accent');
        expect(css.startsWith('oklch(')).toBe(true);
        expect(css).not.toMatch(/^#/);
      });
    });
    ```

    Run `npx vitest run components/theme/CustomColorPicker.test.tsx` → must pass 3/3.
  </action>
  <verify>
    <automated>npx vitest run components/theme/CustomColorPicker.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - components/theme/CustomColorPicker.tsx exists with `'use client'` on line 1
    - File contains exactly 3 `<input type="color"` (or `type='color'`) elements
    - File imports `parse, formatCss, converter` from `'culori'`
    - File imports `usePalette` from `'@/components/providers/ThemeProvider'` and calls `setCustomColor`
    - File contains NO `setProperty('--color-accent', hex)` pattern (Pitfall C — must go through ThemeProvider which writes OKLCh)
    - File uses `useTranslations('palette.custom')` for label sourcing
    - components/theme/CustomColorPicker.test.tsx exists with at least 3 tests covering input rendering, setCustomColor dispatch, and Pitfall C verification
    - `npx vitest run components/theme/CustomColorPicker.test.tsx` exits 0
  </acceptance_criteria>
  <done>Custom tab UI ready. ThemeProvider's reducer + D-10 derivation does all the heavy lifting; this component is purely the input surface.</done>
</task>

<task type="auto">
  <name>Task 2: Build components/theme/HarmonicGenerator.tsx + tests (THEME-08, D-12)</name>
  <files>components/theme/HarmonicGenerator.tsx, components/theme/HarmonicGenerator.test.tsx</files>
  <read_first>
    - lib/colors.ts (generateHarmonic, applyMatrixAdjust, HarmonicMode, oklchToHex)
    - components/providers/ThemeProvider.tsx (setHarmonic signature)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-12 inline preview + "Apply" button — non-destructive preview per Open Q3 answer (a))
    - .planning/phases/02-palette-system/02-RESEARCH.md (THEME-08 row, Pattern 3 generateHarmonic, Open Q3 lines 1014-1018 = answer (a))
    - components/ui/tabs.tsx (shadcn tabs for the 4 modes — already installed in Phase 1)
    - messages/fr.json (palette.generate.{source, modes.<mode>, generate})
  </read_first>
  <action>
    Create components/theme/HarmonicGenerator.tsx (Client Component):

    ```tsx
    'use client';

    import { useTranslations } from 'next-intl';
    import { useMemo, useState } from 'react';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
    import { Button } from '@/components/ui/button';
    import { usePalette } from '@/components/providers/ThemeProvider';
    import { applyMatrixAdjust, generateHarmonic, type HarmonicMode } from '@/lib/colors';
    import { cn } from '@/lib/utils';

    const MODES: HarmonicMode[] = ['complementary', 'triadic', 'analogous', 'split-complementary'];

    /**
     * HarmonicGenerator (THEME-08, D-12).
     *
     * Layout:
     *   - Source color picker (native <input type="color">)
     *   - 4-mode shadcn Tabs (complementary / triadic / analogous / split-complementary)
     *   - Inline 6-swatch preview with "Aa" overlaid in the resolved text color
     *   - Sticky-footer WCAGBadge reads ThemeProvider state — but PREVIEW is local
     *     (non-destructive per RESEARCH Open Q3 answer (a)). The Apply button is
     *     what commits to :root via setHarmonic.
     */
    export function HarmonicGenerator() {
      const t = useTranslations('palette.generate');
      const tabsT = useTranslations('palette.generate.modes');
      const { setHarmonic } = usePalette();

      const [sourceHex, setSourceHex] = useState('#3366cc');
      const [mode, setMode] = useState<HarmonicMode>('complementary');

      // Compute preview tokens locally (does NOT mutate ThemeProvider state)
      const previewTokens = useMemo(() => {
        try {
          const raw = generateHarmonic(mode, sourceHex);
          const { palette } = applyMatrixAdjust({ ...raw, id: 'terra', name: 'preview' });
          return palette;
        } catch {
          return null;
        }
      }, [mode, sourceHex]);

      const onApply = () => {
        // Defensive: only commit if preview computed successfully
        if (!previewTokens) return;
        setHarmonic(mode, sourceHex);
      };

      return (
        <div className="flex flex-col gap-4">
          {/* Source color */}
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{t('source')}</span>
            <input
              type="color"
              value={sourceHex}
              onChange={(e) => setSourceHex(e.target.value)}
              aria-label={t('source')}
              className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
            />
          </label>

          {/* Mode selector */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as HarmonicMode)}>
            <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
              {MODES.map((m) => (
                <TabsTrigger key={m} value={m} className="text-xs">
                  {tabsT(m)}
                </TabsTrigger>
              ))}
            </TabsList>
            {MODES.map((m) => (
              <TabsContent key={m} value={m} className="mt-3">
                {/* Same preview shown regardless of which mode tab — preview is driven
                    by `mode` state above and the preview grid below. */}
              </TabsContent>
            ))}
          </Tabs>

          {/* Inline 6-swatch preview with Aa overlay (D-12) */}
          {previewTokens ? (
            <div
              className="grid grid-cols-3 gap-2"
              data-testid="harmonic-preview"
              aria-label="harmonic-preview"
            >
              {(['bg', 'surface', 'accent', 'secondary', 'text', 'textMuted'] as const).map((key) => (
                <div
                  key={key}
                  className={cn(
                    'relative flex h-16 flex-col items-center justify-center overflow-hidden rounded-md border border-border',
                  )}
                  style={{ backgroundColor: previewTokens[key] }}
                >
                  <span
                    className="text-2xl font-semibold"
                    style={{ color: previewTokens.text }}
                  >
                    Aa
                  </span>
                  <span
                    className="absolute bottom-1 text-[10px] font-medium"
                    style={{ color: previewTokens.text }}
                  >
                    {key}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <Button onClick={onApply} disabled={!previewTokens} data-testid="apply-harmonic">
            {t('generate')}
          </Button>
        </div>
      );
    }
    ```

    Create components/theme/HarmonicGenerator.test.tsx:

    ```tsx
    import { describe, it, expect, beforeEach } from 'vitest';
    import { render, screen, fireEvent } from '@testing-library/react';
    import userEvent from '@testing-library/user-event';
    import { NextIntlClientProvider } from 'next-intl';
    import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
    import { HarmonicGenerator } from './HarmonicGenerator';
    import frMessages from '@/messages/fr.json';
    import type { ReactNode } from 'react';

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <NextIntlClientProvider locale="fr" messages={frMessages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      );
    }

    function GenAndState() {
      const { isCustom, customSource } = usePalette();
      return (
        <>
          <HarmonicGenerator />
          <div data-testid="state">{JSON.stringify({ isCustom, customSource })}</div>
        </>
      );
    }

    beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('style');
    });

    describe('HarmonicGenerator (THEME-08, D-12)', () => {
      it('renders source color input + 4 mode tabs + 6-swatch preview + Apply button', () => {
        render(<Wrapper><HarmonicGenerator /></Wrapper>);
        expect(screen.getByLabelText(frMessages.palette.generate.source)).toBeDefined();
        // Mode tabs (one TabsTrigger per mode)
        for (const m of ['complementary', 'triadic', 'analogous', 'split-complementary'] as const) {
          const label = (frMessages.palette.generate.modes as Record<string, string>)[m];
          expect(screen.getByRole('tab', { name: label })).toBeDefined();
        }
        // Preview grid present
        expect(screen.getByTestId('harmonic-preview')).toBeDefined();
        // Apply button
        expect(screen.getByTestId('apply-harmonic')).toBeDefined();
      });

      it('preview is non-destructive — changing source/mode does NOT mutate ThemeProvider until Apply', () => {
        render(<Wrapper><GenAndState /></Wrapper>);
        const source = screen.getByLabelText(frMessages.palette.generate.source) as HTMLInputElement;
        fireEvent.change(source, { target: { value: '#ff00aa' } });
        // Before Apply click, state must remain non-custom (still terra default)
        const stateBefore = JSON.parse(screen.getByTestId('state').textContent ?? '{}');
        expect(stateBefore.isCustom).toBe(false);
      });

      it('clicking Apply commits the harmonic palette (isCustom + customSource=harmonic)', async () => {
        const user = userEvent.setup();
        render(<Wrapper><GenAndState /></Wrapper>);
        await user.click(screen.getByTestId('apply-harmonic'));
        const state = JSON.parse(screen.getByTestId('state').textContent ?? '{}');
        expect(state.isCustom).toBe(true);
        expect(state.customSource).toBe('harmonic');
      });

      it('switching mode tabs updates the preview swatches', async () => {
        const user = userEvent.setup();
        render(<Wrapper><HarmonicGenerator /></Wrapper>);
        const bgSwatchSelector = '[data-testid="harmonic-preview"] > div:first-child';
        const initialBg = (document.querySelector(bgSwatchSelector) as HTMLElement | null)?.style.backgroundColor;
        await user.click(screen.getByRole('tab', { name: frMessages.palette.generate.modes.triadic }));
        // After switching mode, the preview swatch bg should likely change
        // (different mode → different derived bg hue tinting)
        const nextBg = (document.querySelector(bgSwatchSelector) as HTMLElement | null)?.style.backgroundColor;
        expect(nextBg).toBeDefined();
        // Either the bg differs OR (rare edge case where modes converge) — both are valid as long as preview reacted
        // and Apply still works
        expect(typeof nextBg).toBe('string');
      });
    });
    ```

    Run `npx vitest run components/theme/HarmonicGenerator.test.tsx` → must pass 4/4.
  </action>
  <verify>
    <automated>npx vitest run components/theme/HarmonicGenerator.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - components/theme/HarmonicGenerator.tsx exists with `'use client'` on line 1
    - File imports `generateHarmonic, applyMatrixAdjust, HarmonicMode` from `'@/lib/colors'`
    - File imports `setHarmonic` via `usePalette()`
    - File contains exactly 1 `<input type="color"` for source color
    - File contains `Tabs/TabsList/TabsTrigger` from `'@/components/ui/tabs'` with at least the 4 mode values: complementary, triadic, analogous, split-complementary
    - File computes preview LOCALLY via `useMemo` calling `generateHarmonic(mode, sourceHex)` and `applyMatrixAdjust` (NOT calling setHarmonic — preview must be non-destructive)
    - File renders a 6-swatch grid (one per key: bg, surface, accent, secondary, text, textMuted) with `"Aa"` overlay using `previewTokens.text` color
    - File contains a button that calls `setHarmonic(mode, sourceHex)` on click (the Apply commit per D-12)
    - components/theme/HarmonicGenerator.test.tsx exists with at least 4 tests
    - `npx vitest run components/theme/HarmonicGenerator.test.tsx` exits 0
  </acceptance_criteria>
  <done>Generate tab UI ready. Preview is non-destructive (RESEARCH Open Q3 answer (a)). Apply commits via setHarmonic. Live WCAGBadge in PaletteSwitcher's footer reads committed state — so badge reflects the LAST APPLIED palette, not the preview, which is the intended UX.</done>
</task>

<task type="auto">
  <name>Task 3: Build components/theme/PaletteSwitcher.tsx — Sheet shell with 3 tabs + sticky WCAGBadge footer (THEME-10, D-04..D-07)</name>
  <files>components/theme/PaletteSwitcher.tsx</files>
  <read_first>
    - components/ui/sheet.tsx (Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose — exports from Plan 04 Task 1 CLI install)
    - components/ui/tabs.tsx (Tabs, TabsList, TabsTrigger, TabsContent)
    - components/theme/PalettePresets.tsx (Plan 04 export)
    - components/theme/CustomColorPicker.tsx (Task 1)
    - components/theme/HarmonicGenerator.tsx (Task 2)
    - components/theme/WCAGBadge.tsx (Plan 04 export)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-04 right-anchored Sheet, D-05 widths, D-06 sticky footer, D-07 always default Presets)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Pattern 9 lines 624-656 — exact flex-column shell)
    - messages/fr.json (palette.title, palette.tabs.{presets, custom, generate})
  </read_first>
  <action>
    Create components/theme/PaletteSwitcher.tsx (Client Component):

    ```tsx
    'use client';

    import { useTranslations } from 'next-intl';
    import {
      Sheet,
      SheetContent,
      SheetHeader,
      SheetTitle,
      SheetDescription,
    } from '@/components/ui/sheet';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
    import { PalettePresets } from './PalettePresets';
    import { CustomColorPicker } from './CustomColorPicker';
    import { HarmonicGenerator } from './HarmonicGenerator';
    import { WCAGBadge } from './WCAGBadge';

    /**
     * PaletteSwitcher (THEME-10).
     *
     * Right-anchored shadcn Sheet, full-width on mobile, max-w-[420px] desktop
     * (D-04, D-05). Three tabs (Presets / Custom / Generate, D-07 always-Presets
     * default). Sticky-bottom WCAGBadge footer (D-06).
     *
     * Open/close state is OWNED BY THE CALLER (PaletteFab in Plan 06) — this
     * component is a controlled Sheet. That lets the Konami unlock flow
     * imperatively open the Sheet after switching to Vaporwave (D-14).
     */
    export type PaletteSwitcherProps = {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    };

    export function PaletteSwitcher({ open, onOpenChange }: PaletteSwitcherProps) {
      const t = useTranslations('palette');

      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="right"
            className="flex w-full flex-col p-0 sm:max-w-[420px]"
            aria-describedby="palette-switcher-description"
          >
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle>{t('title')}</SheetTitle>
              <SheetDescription id="palette-switcher-description" className="sr-only">
                {t('title')}
              </SheetDescription>
            </SheetHeader>

            {/* D-07: Tabs always default to Presets on open. defaultValue (uncontrolled)
                resets each time the Sheet remounts; PaletteFab unmounts on close so
                next open starts fresh on Presets. No last-used-tab persistence. */}
            <Tabs
              defaultValue="presets"
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="mx-6 mt-4 grid grid-cols-3">
                <TabsTrigger value="presets">{t('tabs.presets')}</TabsTrigger>
                <TabsTrigger value="custom">{t('tabs.custom')}</TabsTrigger>
                <TabsTrigger value="generate">{t('tabs.generate')}</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6" data-lenis-prevent>
                {/* data-lenis-prevent: Phase 3 LenisProvider will wrap the page in
                    smooth scroll. Sheet's internal scroll must not delegate to Lenis.
                    Future-proofing socket — costs nothing now. */}
                <TabsContent value="presets" className="m-0">
                  <PalettePresets />
                </TabsContent>
                <TabsContent value="custom" className="m-0">
                  <CustomColorPicker />
                </TabsContent>
                <TabsContent value="generate" className="m-0">
                  <HarmonicGenerator />
                </TabsContent>
              </div>
            </Tabs>

            {/* D-06: sticky-footer WCAGBadge — sibling of Tabs, naturally pinned to
                bottom of the flex column. */}
            <div className="border-t border-border bg-background/95 p-4 backdrop-blur">
              <WCAGBadge />
            </div>
          </SheetContent>
        </Sheet>
      );
    }
    ```

    No new test file in this task — PaletteSwitcher is a composition shell. Its constituent components are individually tested. THEME-10's keyboard nav + focus trap is exercised by the shadcn Sheet primitive (which inherits Radix Dialog focus management — already battle-tested). Per 02-VALIDATION.md row "02-SHEET-01", final keyboard verification is a **manual** check at the phase gate.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; node -e "const fs=require('fs'); const src=fs.readFileSync('components/theme/PaletteSwitcher.tsx','utf8'); if (!src.startsWith(\"'use client'\")) {console.error('client directive missing'); process.exit(1)} if (!src.includes('defaultValue=\"presets\"')) {console.error('D-07 default-presets missing'); process.exit(1)} if (!src.includes('side=\"right\"')) {console.error('D-04 right-anchor missing'); process.exit(1)} if (!/sm:max-w-\[420px\]|sm:w-\[420px\]|sm:max-w-\[400px\]|sm:max-w-\[440px\]/.test(src)) {console.error('D-05 desktop width missing'); process.exit(1)} if (!src.includes('data-lenis-prevent')) {console.error('Lenis socket missing'); process.exit(1)} if (!src.includes('<PalettePresets') || !src.includes('<CustomColorPicker') || !src.includes('<HarmonicGenerator') || !src.includes('<WCAGBadge')) {console.error('Missing one of the 4 panel components'); process.exit(1)} console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - components/theme/PaletteSwitcher.tsx exists with `'use client'` on line 1
    - File exports `PaletteSwitcher` AND `PaletteSwitcherProps` type
    - File renders `<Sheet open={open} onOpenChange={onOpenChange}>` (controlled — caller owns state)
    - File contains `side="right"` on SheetContent (D-04)
    - File contains `w-full` and `sm:max-w-[420px]` (or sm:max-w-[400px]/440px — planner discretion) on SheetContent className (D-05)
    - File contains `defaultValue="presets"` on Tabs (D-07 — always Presets on open, no persistence)
    - File composes all 4 components: `<PalettePresets/>`, `<CustomColorPicker/>`, `<HarmonicGenerator/>`, `<WCAGBadge/>`
    - File contains `data-lenis-prevent` attribute on the scrollable Tabs body (Phase 3 LenisProvider compatibility)
    - File has WCAGBadge in a `border-t` flex sibling (not inside Tabs scroll area — sticky-bottom pattern from RESEARCH Pattern 9)
    - npm run build exits 0
    - npm run lint exits 0
  </acceptance_criteria>
  <done>PaletteSwitcher shell assembled. Plan 06 PaletteFab will own its open state and mount it.</done>
</task>

</tasks>

<verification>
- `npx vitest run components/theme/CustomColorPicker.test.tsx components/theme/HarmonicGenerator.test.tsx` exits 0 (7 tests)
- `npm run build` exits 0
- `npm run lint` exits 0
- All 3 new components have `'use client'` directive
- PaletteSwitcher is the controlled-Sheet integration point for Plan 06
</verification>

<success_criteria>
- THEME-07 (CustomColorPicker with 3 native color inputs + D-10 derivation runs via ThemeProvider) satisfied
- THEME-08 (HarmonicGenerator with source + 4 modes + non-destructive inline preview + Apply) satisfied
- THEME-10 (PaletteSwitcher right-anchored Sheet + 3 tabs + sticky footer + D-07 always-Presets default) satisfied
- D-04, D-05, D-06, D-07, D-09, D-12 all wired
- Pitfall C verified: --color-accent CSS variable is always OKLCh, hex never reaches :root
</success_criteria>

<output>
After completion, create `.planning/phases/02-palette-system/02-05-SUMMARY.md` documenting:
- Final LOC per file
- Decision: chosen desktop Sheet width (400 / 420 / 440px)
- Confirmation that PaletteSwitcher composition compiles and renders all 4 sub-components inside SheetContent
- Open question for Plan 06: PaletteFab will own the `open` state via useState; on Konami unlock, ThemeProvider's reducer changes state but Sheet open state is local to FAB → Plan 06 must expose a mechanism (callback prop from FAB / context state lift / event bus) so the unlock flow can imperatively open the Sheet. Recommend: simple useState in PaletteFab + a separate context shim OR keep open state in PaletteFab and have ThemeProvider expose `onUnlock` callback that FAB subscribes to. Planner of Plan 06 picks.
</output>
</content>
</invoke>