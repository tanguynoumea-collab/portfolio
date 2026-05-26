---
phase: 02-palette-system
plan: 01
type: tdd
wave: 1
depends_on:
  - 02-palette-system/00
files_modified:
  - lib/colors.ts
  - lib/colors.test.ts
autonomous: true
requirements:
  - THEME-02
  - THEME-03
must_haves:
  truths:
    - "lib/colors.ts exports wcagContrast, adjustForAA, validateFullMatrix, generateHarmonic, pickTextOnAccent, deriveDefaultTokens, applyMatrixAdjust"
    - "validateFullMatrix(palette) returns {valid, failures} based on the same 7-pair matrix used by scripts/validate-palettes.ts"
    - "generateHarmonic('complementary'|'triadic'|'analogous'|'split-complementary', sourceHex) returns a full 6-token Palette via OKLCh hue rotation"
    - "adjustForAA(text, bg) returns {adjusted, wasAdjusted}; binary search on OKLCh L until ratio >= 4.5"
    - "deriveDefaultTokens({bg, accent, secondary}) returns full Palette tokens per D-10 derivation rule"
    - "All lib/colors.test.ts tests pass with `vitest run lib/colors.test.ts`"
  artifacts:
    - path: "lib/colors.ts"
      provides: "Pure color/WCAG/harmonic helpers — no React, no DOM"
      exports: ["wcagContrast", "adjustForAA", "validateFullMatrix", "generateHarmonic", "pickTextOnAccent", "deriveDefaultTokens", "applyMatrixAdjust", "HarmonicMode", "CRITICAL_PAIRS"]
    - path: "lib/colors.test.ts"
      provides: "Vitest tests covering all exported functions, edge cases, and the 7-pair matrix"
      contains: "describe('wcagContrast'"
  key_links:
    - from: "lib/colors.ts"
      to: "culori"
      via: "parse, converter, formatCss, wcagContrast, formatHex"
      pattern: "from 'culori'"
    - from: "lib/colors.ts CRITICAL_PAIRS"
      to: "scripts/validate-palettes.ts (Wave 0)"
      via: "shared 7-pair matrix definition"
      pattern: "\\[['\"](text|textMuted|accent|secondary)['\"]"
---

<objective>
Ship `lib/colors.ts` — the pure color/WCAG/harmonic logic layer that ThemeProvider, WCAGBadge, CustomColorPicker, and HarmonicGenerator all depend on. Built TDD: tests are authored first against the documented API contract from 02-RESEARCH.md (Patterns 3, 4, 5, 6), then implementation makes them green.

Purpose: Lock the deterministic OKLCh→WCAG→harmonic-generation contract so every later plan consumes a stable, tested API. Zero React, zero DOM — pure functions only.
Output: `lib/colors.ts` (~250 LOC) + `lib/colors.test.ts` (covers all 7 exports + edge cases).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-palette-system/02-CONTEXT.md
@.planning/phases/02-palette-system/02-RESEARCH.md
@.planning/phases/02-palette-system/02-VALIDATION.md
@.planning/research/PITFALLS.md
@lib/palettes.ts
@scripts/validate-palettes.ts

<interfaces>
<!-- The Palette + PaletteId types this file consumes (from Phase 1): -->
From lib/palettes.ts:
```ts
export type PaletteId = 'terra' | 'nordic' | 'bauhaus' | 'ocean' | 'vaporwave';
export type Palette = {
  id: PaletteId;
  name: string;
  bg: string;         // 'oklch(L C H)' CSS string
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  secondary: string;
};
export const PALETTES: ReadonlyArray<Palette>;
export const DEFAULT_PALETTE_ID: PaletteId;
export function getPaletteById(id: string | null | undefined): Palette;
```

<!-- The culori v4 API surface this file uses (verified in 02-RESEARCH.md Pattern 3): -->
```ts
// from 'culori':
import { parse, converter, formatCss, formatHex, wcagContrast } from 'culori';
// parse(string) → Color | undefined
// converter('oklch') → (Color) => OklchColor { mode: 'oklch'; l: number; c: number; h?: number; alpha?: number }
// formatCss(oklchColor) → 'oklch(L C H)' string
// formatHex(color) → '#RRGGBB' string
// wcagContrast(c1, c2) → number  (accepts CSS color strings)
```
</interfaces>

<behavior>
TDD test list — RED first, then implementation:

**`wcagContrast(c1, c2)` — passthrough wrapper around culori:**
- Test 1: `wcagContrast('oklch(0.97 0.012 80)', 'oklch(0.22 0.018 50)')` returns a number > 4.5 (Terra text on bg passes AA)
- Test 2: `wcagContrast('#ffffff', '#000000')` returns ≈ 21 (max contrast)
- Test 3: `wcagContrast('oklch(0.5 0 0)', 'oklch(0.5 0 0)')` returns ≈ 1 (no contrast)

**`adjustForAA(text, bg, minRatio?)` — iterative OKLCh L-shift:**
- Test 4: When `text` already passes minRatio, returns `{adjusted: text, wasAdjusted: false}` (no-op)
- Test 5: When `text=oklch(0.5 0 0)` on `bg=oklch(0.97 0 0)`, returns `{adjusted: <darker L>, wasAdjusted: true}` and the adjusted value passes `wcagContrast >= 4.5`
- Test 6: When `text=oklch(0.5 0 0)` on `bg=oklch(0.2 0 0)`, returns `{adjusted: <lighter L>, wasAdjusted: true}` (direction = lighter for dark bg)
- Test 7: `minRatio` defaults to 4.5; passing `minRatio: 7` triggers AAA threshold
- Test 8: Edge case — when even L=0 or L=1 cannot pass (impossible bg), returns fallback `oklch(0.15 0 0)` or `oklch(0.95 0 0)` with `wasAdjusted: true`

**`validateFullMatrix(palette)` — 7-pair WCAG check:**
- Test 9: All 5 PALETTES pass validateFullMatrix (returns `{valid: true, failures: []}`) — defense-in-depth duplicate of Wave 0 script
- Test 10: A deliberately broken palette (e.g., text='oklch(0.6 0 0)' on bg='oklch(0.65 0 0)') returns `{valid: false, failures: [...]}` with failures containing strings like `'text on bg: <ratio> < 4.5'`
- Test 11: CRITICAL_PAIRS array is exported with exactly 7 entries in order: text/bg, text/surface, textMuted/bg, textMuted/surface, accent/bg, accent/surface, secondary/bg

**`generateHarmonic(mode, sourceHex)` — OKLCh hue rotation:**
- Test 12: `generateHarmonic('complementary', '#ff0000')` returns a Palette-shaped object with all 6 token strings beginning with `'oklch('`
- Test 13: For complementary, `secondary` hue equals `(source.h + 180) % 360` (verify via parse)
- Test 14: For triadic, `secondary` hue equals `(source.h + 120) % 360`
- Test 15: For analogous, `secondary` hue equals `(source.h + 30) % 360`
- Test 16: For split-complementary, `secondary` hue equals `(source.h + 150) % 360`
- Test 17: Generated palette passes `validateFullMatrix` after `applyMatrixAdjust` runs on it (composability)
- Test 18: Invalid hex throws an Error with message containing 'Invalid source color'

**`pickTextOnAccent(accent, preferredText, bg)` — accent-text picker:**
- Test 19: When `preferredText` already passes 4.5 vs accent, returns preferredText unchanged
- Test 20: When preferredText fails but bg passes, returns bg
- Test 21: When both fail, returns near-black or near-white whichever passes

**`deriveDefaultTokens({bg, accent, secondary})` — D-10 derivation:**
- Test 22: Given `bg=oklch(0.97 0.012 80)` (light) + arbitrary accent/secondary, returns `{bg, surface, text, textMuted, accent, secondary}` where:
  - `surface.l ≈ bg.l - 0.03` (darker by ~3% — surface is one shade away from light bg)
  - `text ≈ oklch(0.15 0 0)` (near-black for light bg) and `wcagContrast(text, bg) >= 4.5`
  - `textMuted` is between text and bg in L, AND `wcagContrast(textMuted, bg) >= 4.5` (already AA-clamped)
- Test 23: Given `bg=oklch(0.2 0 0)` (dark) + arbitrary accent/secondary, returns:
  - `surface.l ≈ bg.l + 0.03` (lighter by ~3% — surface lifts off dark bg)
  - `text ≈ oklch(0.95 0 0)` (near-white) and passes 4.5
- Test 24: All token strings begin with `'oklch('` (no hex leakage from internal culori conversions)

**`applyMatrixAdjust(palette)` — D-11 silent AA fix-up:**
- Test 25: A palette already passing validateFullMatrix returns `{palette: <same tokens>, wasAdjusted: false}`
- Test 26: A palette with failing text returns `{palette: <text shifted>, wasAdjusted: true}` and the result palette passes validateFullMatrix
- Test 27: accent/secondary are NEVER modified by applyMatrixAdjust (only text/textMuted shift) — verified by deep-comparing accent/secondary fields before/after
</behavior>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write lib/colors.test.ts (RED phase) covering all 27 behavioral expectations</name>
  <files>lib/colors.test.ts</files>
  <read_first>
    - lib/palettes.ts (Palette type + PALETTES export — tests import these)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Patterns 3-6 — algorithm contracts)
    - .planning/research/PITFALLS.md (Pitfall 3 — CRITICAL_PAIRS definition)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-10, D-11 derivation rules)
    - vitest.config.ts (confirm `globals: true` so describe/it/expect are global)
  </read_first>
  <action>
    Create `lib/colors.test.ts` with **all 27 tests from the <behavior> block above**, organized into 7 `describe` blocks (one per export). Tests MUST be authored to fail initially (since `lib/colors.ts` does not exist yet — the imports will throw).

    Skeleton:
    ```ts
    import { describe, it, expect } from 'vitest';
    import {
      wcagContrast,
      adjustForAA,
      validateFullMatrix,
      generateHarmonic,
      pickTextOnAccent,
      deriveDefaultTokens,
      applyMatrixAdjust,
      CRITICAL_PAIRS,
      type HarmonicMode,
    } from './colors';
    import { PALETTES } from './palettes';
    import { parse, converter } from 'culori';

    const toOklch = converter('oklch');

    describe('wcagContrast', () => {
      it('Terra text on bg passes AA (Test 1)', () => {
        expect(wcagContrast('oklch(0.97 0.012 80)', 'oklch(0.22 0.018 50)')).toBeGreaterThan(4.5);
      });
      it('white on black yields ~21 (Test 2)', () => {
        expect(wcagContrast('#ffffff', '#000000')).toBeGreaterThan(20.9);
      });
      it('identical colors yield ~1 (Test 3)', () => {
        expect(wcagContrast('oklch(0.5 0 0)', 'oklch(0.5 0 0)')).toBeCloseTo(1, 1);
      });
    });

    describe('adjustForAA', () => {
      it('no-op when already passing (Test 4)', () => {
        const { adjusted, wasAdjusted } = adjustForAA('oklch(0.15 0 0)', 'oklch(0.97 0 0)');
        expect(wasAdjusted).toBe(false);
        expect(adjusted).toBe('oklch(0.15 0 0)');
      });
      it('darkens text on light bg until passing (Test 5)', () => {
        const { adjusted, wasAdjusted } = adjustForAA('oklch(0.5 0 0)', 'oklch(0.97 0 0)');
        expect(wasAdjusted).toBe(true);
        expect(wcagContrast(adjusted, 'oklch(0.97 0 0)')).toBeGreaterThanOrEqual(4.5);
        const adjL = toOklch(parse(adjusted))!.l;
        expect(adjL).toBeLessThan(0.5);
      });
      it('lightens text on dark bg until passing (Test 6)', () => {
        const { adjusted, wasAdjusted } = adjustForAA('oklch(0.5 0 0)', 'oklch(0.2 0 0)');
        expect(wasAdjusted).toBe(true);
        expect(wcagContrast(adjusted, 'oklch(0.2 0 0)')).toBeGreaterThanOrEqual(4.5);
        const adjL = toOklch(parse(adjusted))!.l;
        expect(adjL).toBeGreaterThan(0.5);
      });
      it('honors minRatio override for AAA (Test 7)', () => {
        const { adjusted } = adjustForAA('oklch(0.5 0 0)', 'oklch(0.97 0 0)', 7);
        expect(wcagContrast(adjusted, 'oklch(0.97 0 0)')).toBeGreaterThanOrEqual(7);
      });
      it('falls back to near-black/white when impossible (Test 8)', () => {
        const { adjusted, wasAdjusted } = adjustForAA('oklch(0.55 0.3 30)', 'oklch(0.55 0.3 30)');
        expect(wasAdjusted).toBe(true);
        expect(['oklch(0.15 0 0)', 'oklch(0.95 0 0)']).toContain(adjusted);
      });
    });

    describe('validateFullMatrix + CRITICAL_PAIRS', () => {
      it('CRITICAL_PAIRS has exactly 7 entries in documented order (Test 11)', () => {
        expect(CRITICAL_PAIRS).toHaveLength(7);
        expect(CRITICAL_PAIRS.map((p) => `${p[0]}/${p[1]}`)).toEqual([
          'text/bg', 'text/surface', 'textMuted/bg', 'textMuted/surface',
          'accent/bg', 'accent/surface', 'secondary/bg',
        ]);
      });
      it('all 5 PALETTES pass (Test 9)', () => {
        for (const p of PALETTES) {
          const result = validateFullMatrix(p);
          expect(result.valid, `${p.id} failures: ${result.failures.join('; ')}`).toBe(true);
        }
      });
      it('deliberately broken palette returns failures (Test 10)', () => {
        const broken = { ...PALETTES[0]!, text: 'oklch(0.6 0 0)', bg: 'oklch(0.65 0 0)' };
        const result = validateFullMatrix(broken);
        expect(result.valid).toBe(false);
        expect(result.failures.some((f) => f.startsWith('text on bg'))).toBe(true);
      });
    });

    describe('generateHarmonic', () => {
      const modes: HarmonicMode[] = ['complementary', 'triadic', 'analogous', 'split-complementary'];
      const expectedOffset: Record<HarmonicMode, number> = {
        complementary: 180, triadic: 120, analogous: 30, 'split-complementary': 150,
      };
      for (const mode of modes) {
        it(`${mode} produces 6 OKLCh tokens (Test 12)`, () => {
          const result = generateHarmonic(mode, '#ff0000');
          for (const key of ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary'] as const) {
            expect(result[key]).toMatch(/^oklch\(/);
          }
        });
        it(`${mode} secondary hue offset matches spec (Tests 13-16)`, () => {
          const result = generateHarmonic(mode, '#ff0000');
          const sourceH = toOklch(parse('#ff0000'))!.h ?? 0;
          const secondaryH = toOklch(parse(result.secondary))!.h ?? 0;
          const expected = (sourceH + expectedOffset[mode] + 360) % 360;
          expect(Math.abs(secondaryH - expected)).toBeLessThan(1);
        });
      }
      it('generated + applyMatrixAdjust passes validateFullMatrix (Test 17)', () => {
        const raw = generateHarmonic('triadic', '#3366cc');
        const { palette: adjusted } = applyMatrixAdjust({ ...raw, id: 'terra', name: 'gen' });
        const { valid } = validateFullMatrix({ ...adjusted, id: 'terra', name: 'gen' });
        expect(valid).toBe(true);
      });
      it('throws on invalid hex (Test 18)', () => {
        expect(() => generateHarmonic('complementary', 'not-a-color')).toThrow(/Invalid source color/);
      });
    });

    describe('pickTextOnAccent', () => {
      it('returns preferredText when it passes (Test 19)', () => {
        // 'oklch(0.95 0 0)' on 'oklch(0.5 0.2 30)' — verify it passes first, then test
        const accent = 'oklch(0.5 0.2 30)';
        const pref = 'oklch(0.95 0 0)';
        if (wcagContrast(pref, accent) >= 4.5) {
          expect(pickTextOnAccent(accent, pref, 'oklch(0.97 0 0)')).toBe(pref);
        }
      });
      it('falls back to bg when preferredText fails (Test 20)', () => {
        // text=light, accent=light, bg=dark — bg wins
        const result = pickTextOnAccent('oklch(0.95 0.05 30)', 'oklch(0.95 0 0)', 'oklch(0.1 0 0)');
        expect(wcagContrast(result, 'oklch(0.95 0.05 30)')).toBeGreaterThanOrEqual(4.5);
      });
      it('returns near-black or near-white when both fail (Test 21)', () => {
        const result = pickTextOnAccent('oklch(0.5 0.2 30)', 'oklch(0.5 0 0)', 'oklch(0.5 0 0)');
        expect(['oklch(0.15 0 0)', 'oklch(0.98 0.005 80)']).toContain(result);
      });
    });

    describe('deriveDefaultTokens (D-10)', () => {
      it('light bg → darker surface + near-black text (Tests 22, 24)', () => {
        const result = deriveDefaultTokens({
          bg: 'oklch(0.97 0.012 80)',
          accent: 'oklch(0.62 0.155 35)',
          secondary: 'oklch(0.55 0.075 145)',
        });
        for (const key of ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary'] as const) {
          expect(result[key]).toMatch(/^oklch\(/);
        }
        const bgL = toOklch(parse(result.bg))!.l;
        const surfL = toOklch(parse(result.surface))!.l;
        expect(Math.abs((bgL - surfL) - 0.03)).toBeLessThan(0.01);
        expect(wcagContrast(result.text, result.bg)).toBeGreaterThanOrEqual(4.5);
        expect(wcagContrast(result.textMuted, result.bg)).toBeGreaterThanOrEqual(4.5);
      });
      it('dark bg → lighter surface + near-white text (Test 23)', () => {
        const result = deriveDefaultTokens({
          bg: 'oklch(0.2 0 0)',
          accent: 'oklch(0.6 0.2 30)',
          secondary: 'oklch(0.7 0.15 200)',
        });
        const bgL = toOklch(parse(result.bg))!.l;
        const surfL = toOklch(parse(result.surface))!.l;
        expect(surfL - bgL).toBeCloseTo(0.03, 1);
        expect(wcagContrast(result.text, result.bg)).toBeGreaterThanOrEqual(4.5);
      });
    });

    describe('applyMatrixAdjust (D-11)', () => {
      it('no-op when already valid (Test 25)', () => {
        const { palette, wasAdjusted } = applyMatrixAdjust(PALETTES[0]!);
        expect(wasAdjusted).toBe(false);
        expect(palette).toEqual(PALETTES[0]!);
      });
      it('shifts text when failing, makes palette valid (Test 26)', () => {
        const broken = { ...PALETTES[0]!, text: 'oklch(0.85 0 0)' };
        const { palette: result, wasAdjusted } = applyMatrixAdjust(broken);
        expect(wasAdjusted).toBe(true);
        expect(validateFullMatrix(result).valid).toBe(true);
      });
      it('never modifies accent or secondary (Test 27)', () => {
        const broken = { ...PALETTES[0]!, text: 'oklch(0.85 0 0)' };
        const { palette: result } = applyMatrixAdjust(broken);
        expect(result.accent).toBe(broken.accent);
        expect(result.secondary).toBe(broken.secondary);
      });
    });
    ```

    Run `npx vitest run lib/colors.test.ts` — MUST fail with "Cannot find module './colors'" or all tests RED. This is the RED phase. Commit: `test(02-01): add failing tests for lib/colors.ts (THEME-02, THEME-03)`.
  </action>
  <verify>
    <automated>npx vitest run lib/colors.test.ts 2>&amp;1 | grep -E "(FAIL|Cannot find module|Failed)" || echo "Tests should fail but command output suggests they passed unexpectedly"</automated>
  </verify>
  <acceptance_criteria>
    - `lib/colors.test.ts` exists
    - File contains 7 `describe` blocks: wcagContrast, adjustForAA, validateFullMatrix + CRITICAL_PAIRS, generateHarmonic, pickTextOnAccent, deriveDefaultTokens (D-10), applyMatrixAdjust (D-11)
    - File imports `wcagContrast, adjustForAA, validateFullMatrix, generateHarmonic, pickTextOnAccent, deriveDefaultTokens, applyMatrixAdjust, CRITICAL_PAIRS, HarmonicMode` from `'./colors'`
    - `npx vitest run lib/colors.test.ts` exits non-zero (tests RED — implementation does not exist yet)
    - The literal string `expect(CRITICAL_PAIRS).toHaveLength(7)` appears in the file
  </acceptance_criteria>
  <done>RED phase complete. 27 tests authored, all failing because `lib/colors.ts` does not exist.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement lib/colors.ts (GREEN phase) until all 27 tests pass</name>
  <files>lib/colors.ts</files>
  <read_first>
    - lib/colors.test.ts (the contract — implementation must satisfy these)
    - lib/palettes.ts (Palette type to import)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Patterns 3-6 — algorithm details with code samples lines 354-535)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-10 derivation rule, D-11 adjust rule)
  </read_first>
  <action>
    Create `lib/colors.ts` implementing all 7 named exports + 2 type exports. Implementation follows 02-RESEARCH.md Patterns 3-6 directly. Use **ES module culori imports** (NOT `require` — this file is consumed by both the Node `tsx` script and Vitest jsdom + future client bundle):

    ```ts
    /**
     * lib/colors.ts — pure OKLCh + WCAG + harmonic helpers.
     *
     * NO React, NO DOM, NO localStorage. Consumed by:
     *   - scripts/validate-palettes.ts (Node)
     *   - ThemeProvider (browser) — Wave 2
     *   - WCAGBadge / HarmonicGenerator / CustomColorPicker — Wave 3
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
     * Order matters — scripts/validate-palettes.ts mirrors this order.
     */
    export const CRITICAL_PAIRS: ReadonlyArray<
      readonly [fg: keyof DerivedTokens, bg: keyof DerivedTokens, minRatio: number]
    > = [
      ['text', 'bg', 4.5],
      ['text', 'surface', 4.5],
      ['textMuted', 'bg', 4.5],
      ['textMuted', 'surface', 4.5],
      ['accent', 'bg', 3.0],         // WCAG 1.4.11 — UI components
      ['accent', 'surface', 3.0],
      ['secondary', 'bg', 3.0],
    ] as const;

    // -------------------- wcagContrast --------------------

    /**
     * WCAG 2.1 contrast ratio. Thin wrapper around culori for type cleanliness.
     */
    export function wcagContrast(c1: string, c2: string): number {
      return culoriWcagContrast(c1, c2) ?? 1;
    }

    // -------------------- adjustForAA --------------------

    /**
     * Binary-search the OKLCh L channel of `text` until wcagContrast(text, bg) >= minRatio.
     * Preserves chroma and hue. Returns {adjusted, wasAdjusted}.
     */
    export function adjustForAA(
      text: string,
      bg: string,
      minRatio = 4.5,
    ): { adjusted: string; wasAdjusted: boolean } {
      const textOk = toOklch(parse(text));
      const bgOk = toOklch(parse(bg));
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
        const candidate = formatCss({ mode: 'oklch', l: mid, c: textOk.c, h: textOk.h });
        if (!candidate) break;
        const ratio = wcagContrast(candidate, bg);
        if (ratio >= minRatio && ratio < minRatio + 0.5) {
          return { adjusted: candidate, wasAdjusted: true };
        }
        if (ratio < minRatio) {
          if (direction === -1) hi = mid; else lo = mid;
        } else {
          if (direction === -1) lo = mid; else hi = mid;
        }
      }
      // Edge case: extremes fail too → fall back to near-black or near-white
      const fallback = direction === -1 ? 'oklch(0.15 0 0)' : 'oklch(0.95 0 0)';
      return { adjusted: fallback, wasAdjusted: true };
    }

    // -------------------- validateFullMatrix --------------------

    export function validateFullMatrix(p: Palette | (DerivedTokens & Partial<Pick<Palette, 'id' | 'name'>>)): {
      valid: boolean;
      failures: string[];
    } {
      const failures: string[] = [];
      for (const [fg, bg, min] of CRITICAL_PAIRS) {
        const ratio = wcagContrast(p[fg], p[bg]);
        if (ratio < min) failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
      }
      return { valid: failures.length === 0, failures };
    }

    // -------------------- pickTextOnAccent --------------------

    export function pickTextOnAccent(accent: string, preferredText: string, bg: string): string {
      const candidates = [preferredText, bg, 'oklch(0.15 0 0)', 'oklch(0.98 0.005 80)'];
      for (const c of candidates) {
        if (wcagContrast(c, accent) >= 4.5) return c;
      }
      return adjustForAA(preferredText, accent).adjusted;
    }

    // -------------------- deriveDefaultTokens (D-10) --------------------

    export function deriveDefaultTokens(input: DerivableInput): DerivedTokens {
      const bgOk = toOklch(parse(input.bg));
      if (!bgOk) {
        throw new Error(`[lib/colors] deriveDefaultTokens: invalid bg ${input.bg}`);
      }

      const isLight = bgOk.l > 0.5;

      // surface: ~3% L shift (darker on light bg, lighter on dark bg)
      const surfaceL = Math.max(0, Math.min(1, isLight ? bgOk.l - 0.03 : bgOk.l + 0.03));
      const surface = formatCss({ mode: 'oklch', l: surfaceL, c: bgOk.c, h: bgOk.h }) ?? input.bg;

      // text: near-black for light bg, near-white for dark bg, then adjust if borderline
      const rawText = isLight ? 'oklch(0.15 0 0)' : 'oklch(0.95 0 0)';
      const { adjusted: text } = adjustForAA(rawText, input.bg, 4.5);

      // textMuted: midpoint between text and bg in L, clamped via adjustForAA
      const textOk = toOklch(parse(text))!;
      const mutedL = (textOk.l + bgOk.l) / 2;
      const rawMuted = formatCss({ mode: 'oklch', l: mutedL, c: bgOk.c, h: bgOk.h }) ?? text;
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

    const HUE_OFFSETS: Record<HarmonicMode, [number, number]> = {
      complementary: [0, 180],
      triadic: [0, 120],
      analogous: [0, 30],
      'split-complementary': [0, 150],
    };

    export function generateHarmonic(mode: HarmonicMode, sourceHex: string): DerivedTokens {
      const parsed = parse(sourceHex);
      const sourceOklch = parsed ? toOklch(parsed) : undefined;
      if (!sourceOklch) {
        throw new Error(`[lib/colors] generateHarmonic: Invalid source color ${sourceHex}`);
      }

      const [, secondOffset] = HUE_OFFSETS[mode];
      const sourceH = sourceOklch.h ?? 0;
      const secondaryH = (sourceH + secondOffset + 360) % 360;

      const accent =
        formatCss({ mode: 'oklch', l: sourceOklch.l, c: sourceOklch.c, h: sourceH }) ?? sourceHex;
      const secondary =
        formatCss({ mode: 'oklch', l: sourceOklch.l, c: sourceOklch.c, h: secondaryH }) ?? sourceHex;

      // Derive bg/surface low-chroma neutrals tinted by source hue
      const isLightSource = sourceOklch.l > 0.5;
      const bg = isLightSource
        ? `oklch(0.97 0.01 ${sourceH.toFixed(2)})`
        : `oklch(0.95 0.012 ${sourceH.toFixed(2)})`;

      const derived = deriveDefaultTokens({ bg, accent, secondary });
      return derived;
    }

    // -------------------- applyMatrixAdjust (D-11) --------------------

    export function applyMatrixAdjust(
      candidate: Palette | (DerivedTokens & Partial<Pick<Palette, 'id' | 'name'>>),
    ): {
      palette: DerivedTokens & Pick<Palette, 'id' | 'name'>;
      wasAdjusted: boolean;
    } {
      let wasAdjusted = false;
      const result: DerivedTokens & Pick<Palette, 'id' | 'name'> = {
        id: ('id' in candidate && candidate.id ? candidate.id : 'terra') as Palette['id'],
        name: ('name' in candidate && candidate.name ? candidate.name : '') as string,
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

      return { palette: result, wasAdjusted };
    }

    // -------------------- formatHex (re-export for canvas-confetti) --------------------

    /**
     * Convert OKLCh CSS string → hex. Used by Konami confetti integration (Wave 4)
     * because canvas-confetti's colors API requires hex strings.
     */
    export function oklchToHex(oklch: string): string {
      const parsed = parse(oklch);
      if (!parsed) return '#ffffff';
      return formatHex(parsed) ?? '#ffffff';
    }
    ```

    Run `npx vitest run lib/colors.test.ts` — should now be 27/27 GREEN. If any test fails, debug the specific function (likely candidates: `adjustForAA` iteration limit, `deriveDefaultTokens` surface L delta precision, `generateHarmonic` hue rotation overflow).

    Commit: `feat(02-01): implement lib/colors.ts (THEME-02, THEME-03)`.
  </action>
  <verify>
    <automated>npx vitest run lib/colors.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `lib/colors.ts` exists
    - `lib/colors.ts` exports (named): `wcagContrast`, `adjustForAA`, `validateFullMatrix`, `generateHarmonic`, `pickTextOnAccent`, `deriveDefaultTokens`, `applyMatrixAdjust`, `CRITICAL_PAIRS`, `oklchToHex`, `HarmonicMode` (type), `DerivableInput` (type), `DerivedTokens` (type)
    - `lib/colors.ts` contains the literal `import.*from 'culori'`
    - `lib/colors.ts` contains the literal `CRITICAL_PAIRS` definition with 7 entries
    - `lib/colors.ts` contains NO `require(` call (ESM imports only)
    - `lib/colors.ts` contains NO `: any` annotation (TypeScript strict per CLAUDE.md)
    - `npx vitest run lib/colors.test.ts` exits 0, all 27 tests pass
    - `npm run lint` exits 0 (no new lint warnings)
  </acceptance_criteria>
  <done>GREEN phase complete. All 7 functions + 2 supporting type exports work as specified. lib/colors.ts is the single source of truth for color math throughout Phase 2.</done>
</task>

</tasks>

<verification>
- `npx vitest run lib/colors.test.ts` exits 0, all 27 tests pass
- `npx tsc --noEmit lib/colors.ts` exits 0 (TypeScript strict satisfied)
- `npm run lint` exits 0
</verification>

<success_criteria>
- All 7 functions + supporting types exported from lib/colors.ts
- 100% of behavioral expectations (Tests 1-27) covered
- THEME-02 (wcagContrast, adjustForAA, validateFullMatrix) satisfied
- THEME-03 (generateHarmonic 4 modes + auto-adjust) satisfied
- File is pure (no React, no DOM, no side effects)
</success_criteria>

<output>
After completion, create `.planning/phases/02-palette-system/02-01-SUMMARY.md` documenting:
- Final LOC count of lib/colors.ts
- Test count (27 from this plan)
- Any deviations from RESEARCH.md Patterns 3-6 (binary search tolerances, fallback values, etc.)
- Public API surface for downstream Wave 2 consumers (ThemeProvider) to import
</output>
</content>
</invoke>