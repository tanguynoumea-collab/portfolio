'use client';

/**
 * components/theme/WCAGBadge.tsx — Client Component (THEME-09 + D-06 + D-11 chip).
 *
 * Live WCAG status display for the active palette. Shows the WORST-pair ratio
 * across the 7 CRITICAL_PAIRS (most conservative honest measure — surfaces
 * failing pairs even when the headline text/bg pair would suggest "pass"),
 * plus an AA / AAA / Fail status icon. When the active palette went through
 * applyMatrixAdjust (i.e., usePalette().wasAdjustedForAA === true), an
 * "Adjusted for AA" chip appears next to the badge — D-06 + D-11.
 *
 * Designed to mount inside PaletteSwitcher's sticky footer (D-06): visible
 * across all 3 tabs (Presets / Custom / Generate), instantly reflects every
 * palette change because it reads from usePalette() context which re-renders
 * on every state.palette identity swap.
 *
 * Worst-pair heuristic: compares `ratio / min` (not raw `ratio - min` margin)
 * across the 7 pairs. This normalizes 4.5-threshold text pairs against
 * 3.0-threshold UI pairs — a 2.8/3.0 UI pair (margin -0.2, ratio/min ≈ 0.93)
 * scores worse than a 4.3/4.5 text pair (margin -0.2, ratio/min ≈ 0.96).
 * Picks the pair closest to (or furthest below) its required minimum.
 *
 * AAA classification: only awarded when ALL pairs meet 7.0 against text-pair
 * thresholds (worst pair has min=4.5 AND ratio>=7) — WCAG AAA enhanced
 * contrast applies only to text, not UI components.
 */
import { Check, CheckCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { usePalette } from '@/components/providers/ThemeProvider';
import { CRITICAL_PAIRS, wcagContrast } from '@/lib/colors';
import { cn } from '@/lib/utils';

type Status = 'aaa' | 'aa' | 'fail';

export function WCAGBadge() {
  const t = useTranslations('palette.wcag');
  const { palette, wasAdjustedForAA } = usePalette();

  const { worstRatio, status } = useMemo(() => {
    let worstRatio = Number.POSITIVE_INFINITY;
    let worstMin = 4.5;
    let worstScore = Number.POSITIVE_INFINITY;
    for (const [fg, bg, min] of CRITICAL_PAIRS) {
      const r = wcagContrast(palette[fg], palette[bg]);
      // Normalize across the 4.5 (text) vs 3.0 (UI) thresholds by dividing.
      // Smaller score = worse pair. We track the minimum across the 7 pairs.
      const score = r / min;
      if (score < worstScore) {
        worstScore = score;
        worstRatio = r;
        worstMin = min;
      }
    }
    let s: Status;
    if (worstRatio < worstMin) {
      s = 'fail';
    } else if (worstRatio >= 7 && worstMin === 4.5) {
      // AAA only meaningful for text pairs (min=4.5); UI pairs (min=3.0) are
      // not graded AAA by WCAG 2.1 — they cap at AA enhanced.
      s = 'aaa';
    } else {
      s = 'aa';
    }
    return { worstRatio, status: s };
  }, [palette]);

  const Icon = status === 'aaa' ? CheckCheck : status === 'aa' ? Check : X;
  const statusLabel =
    status === 'aaa' ? t('aaa') : status === 'aa' ? t('aa') : t('fail');
  const iconClass = cn(
    'h-4 w-4 shrink-0',
    status === 'fail' ? 'text-destructive' : 'text-primary',
  );

  return (
    <div
      className="flex items-center justify-between gap-3 text-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Icon className={iconClass} aria-hidden="true" />
        <span className="font-mono tabular-nums">{worstRatio.toFixed(2)}</span>
        <span className="text-muted-foreground">·</span>
        <span className="font-medium">{statusLabel}</span>
      </div>
      {wasAdjustedForAA ? (
        <span
          className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          title={t('adjusted')}
        >
          {t('adjusted')}
        </span>
      ) : null}
    </div>
  );
}
