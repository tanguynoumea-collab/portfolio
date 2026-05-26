'use client';

/**
 * components/theme/HarmonicGenerator.tsx — Client Component (THEME-08 + D-12).
 *
 * Inline harmonic-palette playground with NON-DESTRUCTIVE preview.
 *
 * Layout:
 *   - Source color picker (native <input type="color"> for D-09 consistency)
 *   - 4-mode shadcn Tabs (complementary / triadic / analogous / split-complementary)
 *   - Inline 6-swatch preview grid with "Aa" overlay in resolved text color (D-12)
 *   - "Apply" button (Button primitive) — only this dispatches setHarmonic
 *
 * Data flow (D-12 + Open Q3 answer (a) — non-destructive preview):
 *   1. Local state holds sourceHex + mode (does NOT affect :root)
 *   2. useMemo computes previewTokens via generateHarmonic + applyMatrixAdjust
 *      — pure local computation; ThemeProvider state untouched
 *   3. Swatches render previewTokens directly via inline backgroundColor styles
 *   4. Apply button → setHarmonic(mode, sourceHex) → ThemeProvider runs the
 *      full reducer pipeline (generateHarmonic + applyMatrixAdjust again
 *      internally) and commits to :root
 *
 * Why two computations (preview + commit)? The preview must reflect what the
 * apply will produce, but commit must go through the reducer for state-machine
 * consistency (wasAdjustedForAA flag, paletteId='custom', customSource='harmonic',
 * persistence). The preview useMemo mirrors the reducer's algorithm; the two
 * paths converge on the same DerivedTokens output.
 *
 * The sticky-footer WCAGBadge reads ThemeProvider state, so it reflects the
 * LAST APPLIED palette, NOT the preview — intended UX per D-12 ("WCAGBadge
 * updates live" referring to live application, not live preview tracking).
 * The Aa overlay in each swatch IS the inline contrast preview for the
 * unapplied state.
 */
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { usePalette } from '@/components/providers/ThemeProvider';
import {
  applyMatrixAdjust,
  generateHarmonic,
  type HarmonicMode,
} from '@/lib/colors';
import { cn } from '@/lib/utils';

const MODES: ReadonlyArray<HarmonicMode> = [
  'complementary',
  'triadic',
  'analogous',
  'split-complementary',
];

const SWATCH_KEYS = [
  'bg',
  'surface',
  'accent',
  'secondary',
  'text',
  'textMuted',
] as const;

export function HarmonicGenerator() {
  const t = useTranslations('palette.generate');
  const tabsT = useTranslations('palette.generate.modes');
  const { setHarmonic } = usePalette();

  const [sourceHex, setSourceHex] = useState<string>('#3366cc');
  const [mode, setMode] = useState<HarmonicMode>('complementary');

  // Compute preview tokens locally (does NOT mutate ThemeProvider state).
  // Mirrors the reducer's SET_HARMONIC path: generateHarmonic → applyMatrixAdjust.
  // The two converge on identical DerivedTokens output so the preview is faithful.
  const previewTokens = useMemo(() => {
    try {
      const raw = generateHarmonic(mode, sourceHex);
      const { palette } = applyMatrixAdjust({
        ...raw,
        id: 'terra',
        name: 'preview',
      });
      return palette;
    } catch {
      return null;
    }
  }, [mode, sourceHex]);

  const onApply = () => {
    // Defensive: only commit if preview computed successfully. If
    // generateHarmonic throws (invalid source hex), Apply becomes a no-op
    // and the button stays disabled per the JSX below.
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
          className="border-border h-10 w-16 cursor-pointer rounded border bg-transparent"
        />
      </label>

      {/* Mode selector (4 shadcn Tabs) */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as HarmonicMode)}>
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
          {MODES.map((m) => (
            <TabsTrigger key={m} value={m} className="text-xs">
              {tabsT(m)}
            </TabsTrigger>
          ))}
        </TabsList>
        {MODES.map((m) => (
          // Empty TabsContent for each mode — preview is driven by the `mode`
          // state above and rendered below the Tabs primitive. Radix requires
          // a TabsContent per value to satisfy the role=tabpanel ARIA contract;
          // we keep them empty so the swatch grid lives outside the panel
          // structure (visible across all 4 mode selections).
          <TabsContent key={m} value={m} className="m-0" />
        ))}
      </Tabs>

      {/* Inline 6-swatch preview with Aa overlay (D-12) */}
      {previewTokens ? (
        <div
          className="grid grid-cols-3 gap-2"
          data-testid="harmonic-preview"
          aria-label="harmonic-preview"
        >
          {SWATCH_KEYS.map((key) => (
            <div
              key={key}
              data-token={key}
              className={cn(
                'border-border relative flex h-16 flex-col items-center justify-center overflow-hidden rounded-md border',
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

      <Button
        onClick={onApply}
        disabled={!previewTokens}
        data-testid="apply-harmonic"
      >
        {t('generate')}
      </Button>
    </div>
  );
}
