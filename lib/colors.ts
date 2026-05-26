/**
 * lib/colors.ts — pure OKLCh + WCAG + harmonic helpers (Phase 2 Plan 02-01).
 *
 * Consumes only `culori` + the `Palette` type from `lib/palettes.ts`.
 *
 * NO React, NO DOM, NO localStorage. Consumed by:
 *   - scripts/validate-palettes.ts (Node, via shared CRITICAL_PAIRS contract)
 *   - components/providers/ThemeProvider (browser) — Wave 2
 *   - components/theme/WCAGBadge, CustomColorPicker, HarmonicGenerator — Wave 3
 *   - Konami confetti integration — Wave 4 (via oklchToHex)
 *
 * Contract documented in 02-RESEARCH.md Patterns 3-6 and locked by lib/colors.test.ts.
 */
import {
  parse,
  converter,
  formatCss,
  formatHex,
  wcagContrast as culoriWcagContrast,
} from 'culori';
import type { Palette } from './palettes';

const toOklch = converter('oklch');

// -------------------- Type exports --------------------

export type HarmonicMode =
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'split-complementary';

export type DerivableInput = {
  bg: string;
  accent: string;
  secondary: string;
};

export type DerivedTokens = Omit<Palette, 'id' | 'name'>;

// -------------------- 7-pair WCAG matrix --------------------

/**
 * The 7 critical contrast pairs from PITFALLS.md Pitfall #3.
 *
 * Order matters — scripts/validate-palettes.ts mirrors this exact order.
 * Min ratios: 4.5:1 for text pairs (WCAG 1.4.3 normal text);
 * 3.0:1 for accent/secondary pairs (WCAG 1.4.11 UI components).
 */
export const CRITICAL_PAIRS: ReadonlyArray<
  readonly [fg: keyof DerivedTokens, bg: keyof DerivedTokens, minRatio: number]
> = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['textMuted', 'bg', 4.5],
  ['textMuted', 'surface', 4.5],
  ['accent', 'bg', 3.0],
  ['accent', 'surface', 3.0],
  ['secondary', 'bg', 3.0],
] as const;

// -------------------- wcagContrast --------------------

/**
 * WCAG 2.1 contrast ratio. Thin wrapper around culori for type cleanliness
 * (culori returns `number | undefined`; we coerce missing to 1 = no contrast).
 */
export function wcagContrast(c1: string, c2: string): number {
  return culoriWcagContrast(c1, c2) ?? 1;
}

// -------------------- adjustForAA --------------------

/**
 * Binary-search the OKLCh L channel of `text` until wcagContrast(text, bg) >= minRatio.
 *
 * Preserves chroma and hue. Direction picked from `bg.l`:
 *   - light bg (L > 0.5) → push text darker
 *   - dark bg  (L <= 0.5) → push text lighter
 *
 * If no L in [0..1] reaches `minRatio` within 20 iterations (e.g., accent text on
 * accent bg with identical mid-L), falls back to near-black / near-white.
 *
 * Returns `{adjusted, wasAdjusted}`. `wasAdjusted` is true whenever the output
 * differs from the input.
 */
export function adjustForAA(
  text: string,
  bg: string,
  minRatio = 4.5,
): { adjusted: string; wasAdjusted: boolean } {
  const parsedText = parse(text);
  const parsedBg = parse(bg);
  const textOk = parsedText ? toOklch(parsedText) : undefined;
  const bgOk = parsedBg ? toOklch(parsedBg) : undefined;
  if (!textOk || !bgOk) return { adjusted: text, wasAdjusted: false };

  if (wcagContrast(text, bg) >= minRatio) {
    return { adjusted: text, wasAdjusted: false };
  }

  // Direction: light bg → darker text; dark bg → lighter text
  const direction: -1 | 1 = bgOk.l > 0.5 ? -1 : 1;
  let lo = direction === -1 ? 0 : textOk.l;
  let hi = direction === -1 ? textOk.l : 1;

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const candidate = formatCss({
      mode: 'oklch',
      l: mid,
      c: textOk.c,
      h: textOk.h,
    });
    if (!candidate) break;
    const ratio = wcagContrast(candidate, bg);
    if (ratio >= minRatio && ratio < minRatio + 0.5) {
      return { adjusted: candidate, wasAdjusted: true };
    }
    if (ratio < minRatio) {
      // Need MORE contrast — push further in `direction`
      if (direction === -1) hi = mid;
      else lo = mid;
    } else {
      // Have headroom — backtrack toward original L
      if (direction === -1) lo = mid;
      else hi = mid;
    }
  }
  // Edge case: extremes fail too → fall back to near-black or near-white
  const fallback = direction === -1 ? 'oklch(0.15 0 0)' : 'oklch(0.95 0 0)';
  return { adjusted: fallback, wasAdjusted: true };
}

// -------------------- validateFullMatrix --------------------

/**
 * Runs the full 7-pair WCAG matrix check. Returns `{valid, failures}` where
 * `failures` is a list of `"<fg> on <bg>: <ratio> < <min>"` diagnostic strings.
 *
 * Accepts a full Palette OR a DerivedTokens-shaped object (i.e., the 6 color
 * fields are sufficient; `id` and `name` are accepted but ignored).
 */
export function validateFullMatrix(
  p: DerivedTokens & Partial<Pick<Palette, 'id' | 'name'>>,
): {
  valid: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const [fg, bg, min] of CRITICAL_PAIRS) {
    const ratio = wcagContrast(p[fg], p[bg]);
    if (ratio < min) {
      failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
    }
  }
  return { valid: failures.length === 0, failures };
}

// -------------------- pickTextOnAccent --------------------

/**
 * Choose a readable text color to place on an `accent` background.
 * Tries in order: preferredText → bg → near-black → near-white.
 * Falls back to `adjustForAA(preferredText, accent)` if none pass.
 */
export function pickTextOnAccent(
  accent: string,
  preferredText: string,
  bg: string,
): string {
  const candidates = [
    preferredText,
    bg,
    'oklch(0.15 0 0)',
    'oklch(0.98 0.005 80)',
  ];
  for (const c of candidates) {
    if (wcagContrast(c, accent) >= 4.5) return c;
  }
  return adjustForAA(preferredText, accent).adjusted;
}

// -------------------- deriveDefaultTokens (D-10) --------------------

/**
 * D-10 derivation rule: from user-controlled (bg, accent, secondary), produce
 * the 6-token DerivedTokens with auto-derived surface / text / textMuted.
 *
 *   surface  ~ bg ± 0.03 L (darker on light bg, lighter on dark bg)
 *   text     near-black on light bg / near-white on dark bg, AA-clamped vs bg
 *   textMuted midpoint L between text and bg, AA-clamped vs bg
 *
 * All output strings are OKLCh — never hex. Accent + secondary pass through unchanged.
 */
export function deriveDefaultTokens(input: DerivableInput): DerivedTokens {
  const parsedBg = parse(input.bg);
  const bgOk = parsedBg ? toOklch(parsedBg) : undefined;
  if (!bgOk) {
    throw new Error(
      `[lib/colors] deriveDefaultTokens: invalid bg ${input.bg}`,
    );
  }

  const isLight = bgOk.l > 0.5;

  // surface: ~3% L shift (darker on light bg, lighter on dark bg)
  const surfaceL = Math.max(
    0,
    Math.min(1, isLight ? bgOk.l - 0.03 : bgOk.l + 0.03),
  );
  const surface =
    formatCss({ mode: 'oklch', l: surfaceL, c: bgOk.c, h: bgOk.h }) ?? input.bg;

  // text: near-black for light bg, near-white for dark bg, then adjust if borderline
  const rawText = isLight ? 'oklch(0.15 0 0)' : 'oklch(0.95 0 0)';
  const { adjusted: text } = adjustForAA(rawText, input.bg, 4.5);

  // textMuted: midpoint between text and bg in L, clamped via adjustForAA
  const parsedText = parse(text);
  const textOk = parsedText ? toOklch(parsedText) : undefined;
  const mutedL = textOk ? (textOk.l + bgOk.l) / 2 : bgOk.l;
  const rawMuted =
    formatCss({ mode: 'oklch', l: mutedL, c: bgOk.c, h: bgOk.h }) ?? text;
  const { adjusted: textMuted } = adjustForAA(rawMuted, input.bg, 4.5);

  return {
    bg: input.bg,
    surface,
    text,
    textMuted,
    accent: input.accent,
    secondary: input.secondary,
  };
}

// -------------------- generateHarmonic (THEME-03) --------------------

/**
 * Per-mode (sourceOffset, secondaryOffset) — the second offset is the hue
 * rotation applied to derive `secondary`. The accent simply uses the source.
 */
const HUE_OFFSETS: Record<HarmonicMode, readonly [number, number]> = {
  complementary: [0, 180],
  triadic: [0, 120],
  analogous: [0, 30],
  'split-complementary': [0, 150],
};

/**
 * Generate a full 6-token palette by rotating the OKLCh hue of `sourceHex`.
 *
 * Modes (secondary hue offset vs source):
 *   complementary       +180°
 *   triadic             +120°
 *   analogous           +30°
 *   split-complementary +150°
 *
 * Bg/surface/text/textMuted are derived via deriveDefaultTokens so the output
 * passes the 7-pair WCAG matrix (after a downstream applyMatrixAdjust pass).
 *
 * Throws Error("Invalid source color ...") if culori can't parse `sourceHex`.
 */
export function generateHarmonic(
  mode: HarmonicMode,
  sourceHex: string,
): DerivedTokens {
  const parsed = parse(sourceHex);
  const sourceOklch = parsed ? toOklch(parsed) : undefined;
  if (!sourceOklch) {
    throw new Error(
      `[lib/colors] generateHarmonic: Invalid source color ${sourceHex}`,
    );
  }

  const secondOffset = HUE_OFFSETS[mode][1];
  const sourceH = sourceOklch.h ?? 0;
  const secondaryH = (sourceH + secondOffset + 360) % 360;

  const accent =
    formatCss({
      mode: 'oklch',
      l: sourceOklch.l,
      c: sourceOklch.c,
      h: sourceH,
    }) ?? sourceHex;
  const secondary =
    formatCss({
      mode: 'oklch',
      l: sourceOklch.l,
      c: sourceOklch.c,
      h: secondaryH,
    }) ?? sourceHex;

  // Derive bg/surface low-chroma neutrals tinted by source hue.
  // Always pick a LIGHT bg here; user can flip via Custom tab if dark mode desired.
  const bg = `oklch(0.97 0.01 ${sourceH.toFixed(2)})`;

  return deriveDefaultTokens({ bg, accent, secondary });
}

// -------------------- applyMatrixAdjust (D-11) --------------------

/**
 * D-11 silent AA fix-up: take a candidate palette, run validateFullMatrix
 * mentally, and if text/textMuted fail against bg or surface, shift those
 * tokens via adjustForAA until they pass.
 *
 * INVARIANT: accent + secondary are NEVER modified. Only text + textMuted shift.
 * This preserves the user's color intent on the brand-defining tokens.
 *
 * Returns `{palette, wasAdjusted}`. `wasAdjusted` is true if ANY shift occurred.
 */
export function applyMatrixAdjust(
  candidate: {
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    secondary: string;
  } & Partial<Pick<Palette, 'id' | 'name'>>,
): {
  palette: DerivedTokens & Pick<Palette, 'id' | 'name'>;
  wasAdjusted: boolean;
} {
  let wasAdjusted = false;
  const result: DerivedTokens & Pick<Palette, 'id' | 'name'> = {
    id: (candidate.id ?? 'terra') as Palette['id'],
    name: candidate.name ?? '',
    bg: candidate.bg,
    surface: candidate.surface,
    text: candidate.text,
    textMuted: candidate.textMuted,
    accent: candidate.accent,
    secondary: candidate.secondary,
  };

  // D-11: only text + textMuted shift; accent/secondary preserved
  for (const bgKey of ['bg', 'surface'] as const) {
    if (wcagContrast(result.text, result[bgKey]) < 4.5) {
      const { adjusted, wasAdjusted: did } = adjustForAA(
        result.text,
        result[bgKey],
        4.5,
      );
      result.text = adjusted;
      wasAdjusted = wasAdjusted || did;
    }
    if (wcagContrast(result.textMuted, result[bgKey]) < 4.5) {
      const { adjusted, wasAdjusted: did } = adjustForAA(
        result.textMuted,
        result[bgKey],
        4.5,
      );
      result.textMuted = adjusted;
      wasAdjusted = wasAdjusted || did;
    }
  }

  return { palette: result, wasAdjusted };
}

// -------------------- oklchToHex (Wave 4 confetti) --------------------

/**
 * Convert an OKLCh CSS string → hex string. Used by the Konami confetti
 * integration (Wave 4) because canvas-confetti's `colors` API requires hex.
 * Falls back to '#ffffff' when parsing fails.
 */
export function oklchToHex(oklch: string): string {
  const parsed = parse(oklch);
  if (!parsed) return '#ffffff';
  return formatHex(parsed) ?? '#ffffff';
}
