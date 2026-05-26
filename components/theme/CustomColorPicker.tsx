'use client';

/**
 * components/theme/CustomColorPicker.tsx — Client Component (THEME-07 + D-09 + D-10).
 *
 * Three native <input type="color"> controls for bg / accent / secondary per D-09
 * (REQ THEME-07 "3 HSL inputs" reframed to "3 visual color pickers" — OS-native
 * picker is familiar UX, accessible by default, zero JS overhead).
 *
 * Data flow:
 *   1. OS color picker returns hex via input.value
 *   2. onChange handler converts hex → OKLCh CSS string via culori (parse + formatCss)
 *      — NEVER stores hex in ThemeState (Pitfall C invariant)
 *   3. setCustomColor dispatches SET_CUSTOM_FROM_PICKER → ThemeProvider reducer
 *      runs deriveDefaultTokens (D-10: surface/text/textMuted derived) then
 *      applyMatrixAdjust (D-11: auto-shift text/textMuted to clear AA; accent
 *      and secondary preserved verbatim) before the CSS-var writer effect
 *      mutates document.documentElement.
 *
 * Local UI state holds hex (what <input type="color"> requires for its `value`
 * attribute). Initialized from the live palette via oklchToHex(). Synced back
 * via useEffect when the palette changes externally (e.g., user clicks a
 * different preset in the Presets tab, or Konami unlocks Vaporwave).
 *
 * Pitfall C structural mitigation: the only OKLCh strings reaching :root flow
 * through usePalette().setCustomColor → ThemeProvider reducer → CSS-var writer.
 * This component never calls setProperty directly; it never even imports the
 * document object. The conversion boundary is hexToOklchString() and it always
 * produces an `oklch(...)` CSS string (or returns null on parse failure — the
 * dispatch is then skipped, leaving the live palette unchanged).
 *
 * Layout: three labeled rows with the swatch input right-aligned. No "Apply"
 * button per D-09 (direct-apply matches the inline-preview philosophy of D-12
 * for the Generate tab — Custom commits instantly so the user sees the result
 * of their color choice on the live page through the open Sheet's transparent
 * regions and the sticky-footer WCAGBadge ratio update).
 */
import { parse, converter, formatCss } from 'culori';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, type ChangeEvent } from 'react';
import { usePalette } from '@/components/providers/ThemeProvider';
import { oklchToHex } from '@/lib/colors';

const toOklch = converter('oklch');

/**
 * Convert hex from <input type="color"> to OKLCh CSS string.
 * Returns null on parse failure (defensive — `<input type=color>` only emits
 * valid 7-char hex but we stay safe per Pitfall C — invalid input never
 * propagates to :root).
 */
function hexToOklchString(hex: string): string | null {
  const parsed = parse(hex);
  const ok = parsed ? toOklch(parsed) : undefined;
  if (!ok) return null;
  return formatCss(ok) ?? null;
}

export function CustomColorPicker() {
  const t = useTranslations('palette.custom');
  const { palette, setCustomColor } = usePalette();

  // Derive hex values directly from the live OKLCh palette. No local mirror
  // state — the dispatch flow is synchronous (setCustomColor → reducer →
  // state.palette updates → component re-renders with new hex). This avoids
  // the setState-in-effect anti-pattern (React 19 lint rule
  // react-hooks/set-state-in-effect) and makes the input a fully controlled
  // mirror of ThemeProvider state, so external palette changes (preset clicks
  // from the Presets tab, Konami unlock) reflect instantly without an
  // intermediate effect-sync step.
  const bgHex = useMemo(() => oklchToHex(palette.bg), [palette.bg]);
  const accentHex = useMemo(
    () => oklchToHex(palette.accent),
    [palette.accent],
  );
  const secondaryHex = useMemo(
    () => oklchToHex(palette.secondary),
    [palette.secondary],
  );

  /**
   * Dispatch a SET_CUSTOM_FROM_PICKER action with all 3 user-controlled tokens
   * converted from hex to OKLCh CSS strings. ThemeProvider's reducer then runs
   * deriveDefaultTokens (D-10) + applyMatrixAdjust (D-11) and the CSS-var
   * writer effect mutates document.documentElement.
   *
   * If any of the 3 hex strings fail to parse, the entire dispatch is skipped
   * (Pitfall C — invalid input never reaches :root). In practice this never
   * happens because <input type="color"> guarantees 7-char hex output.
   */
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

  const onBgChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(e.target.value, accentHex, secondaryHex);
  };
  const onAccentChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(bgHex, e.target.value, secondaryHex);
  };
  const onSecondaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(bgHex, accentHex, e.target.value);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{t('bg')}</span>
        <input
          type="color"
          value={bgHex}
          onChange={onBgChange}
          className="border-border h-10 w-16 cursor-pointer rounded border bg-transparent"
          aria-label={t('bg')}
        />
      </label>
      <label className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{t('accent')}</span>
        <input
          type="color"
          value={accentHex}
          onChange={onAccentChange}
          className="border-border h-10 w-16 cursor-pointer rounded border bg-transparent"
          aria-label={t('accent')}
        />
      </label>
      <label className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{t('secondary')}</span>
        <input
          type="color"
          value={secondaryHex}
          onChange={onSecondaryChange}
          className="border-border h-10 w-16 cursor-pointer rounded border bg-transparent"
          aria-label={t('secondary')}
        />
      </label>
    </div>
  );
}
