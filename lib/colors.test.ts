/**
 * lib/colors.test.ts — TDD RED phase contract tests for lib/colors.ts.
 *
 * Authored at Wave 1 Plan 02-01 (Phase 2 palette-system) per the documented
 * API contract from 02-RESEARCH.md Patterns 3-6 + CONTEXT.md D-10, D-11.
 *
 * Covers 27 behavioral expectations across 7 describe blocks (one per export).
 * On the first run, every test fails with "Cannot find module './colors'" —
 * lib/colors.ts is implemented in Task 2 to make these green.
 */
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
    expect(
      wcagContrast('oklch(0.97 0.012 80)', 'oklch(0.22 0.018 50)'),
    ).toBeGreaterThan(4.5);
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
    const { adjusted, wasAdjusted } = adjustForAA(
      'oklch(0.15 0 0)',
      'oklch(0.97 0 0)',
    );
    expect(wasAdjusted).toBe(false);
    expect(adjusted).toBe('oklch(0.15 0 0)');
  });
  it('darkens text on light bg until passing (Test 5)', () => {
    // Input L=0.55 on near-white gives ratio ~4.45 (fails 4.5 by hair) so
    // adjustForAA MUST shift darker. Plan's original L=0.5 already passes
    // (~5.5 ratio) — deviation [Rule 1 - Bug]: fixed fixture to one that
    // actually fails AA so the "until passing" semantic is real.
    const startText = 'oklch(0.55 0 0)';
    const bg = 'oklch(0.97 0 0)';
    expect(wcagContrast(startText, bg)).toBeLessThan(4.5);
    const { adjusted, wasAdjusted } = adjustForAA(startText, bg);
    expect(wasAdjusted).toBe(true);
    expect(wcagContrast(adjusted, bg)).toBeGreaterThanOrEqual(4.5);
    const adjL = toOklch(parse(adjusted)!)!.l;
    expect(adjL).toBeLessThan(0.55);
  });
  it('lightens text on dark bg until passing (Test 6)', () => {
    const { adjusted, wasAdjusted } = adjustForAA(
      'oklch(0.5 0 0)',
      'oklch(0.2 0 0)',
    );
    expect(wasAdjusted).toBe(true);
    expect(wcagContrast(adjusted, 'oklch(0.2 0 0)')).toBeGreaterThanOrEqual(
      4.5,
    );
    const adjL = toOklch(parse(adjusted)!)!.l;
    expect(adjL).toBeGreaterThan(0.5);
  });
  it('honors minRatio override for AAA (Test 7)', () => {
    const { adjusted } = adjustForAA('oklch(0.5 0 0)', 'oklch(0.97 0 0)', 7);
    expect(wcagContrast(adjusted, 'oklch(0.97 0 0)')).toBeGreaterThanOrEqual(7);
  });
  it('falls back to near-black/white when impossible (Test 8)', () => {
    // text and bg are identical (contrast 1) — neither L=0 nor L=1 path will be ideal
    // implementation falls back to a known constant when 20 iterations exhaust
    const { adjusted, wasAdjusted } = adjustForAA(
      'oklch(0.55 0.3 30)',
      'oklch(0.55 0.3 30)',
    );
    expect(wasAdjusted).toBe(true);
    // Acceptable fallbacks per implementation contract (RESEARCH Pattern 4)
    expect(['oklch(0.15 0 0)', 'oklch(0.95 0 0)']).toContain(adjusted);
  });
});

describe('validateFullMatrix + CRITICAL_PAIRS', () => {
  it('CRITICAL_PAIRS has exactly 7 entries in documented order (Test 11)', () => {
    expect(CRITICAL_PAIRS).toHaveLength(7);
    expect(CRITICAL_PAIRS.map((p) => `${p[0]}/${p[1]}`)).toEqual([
      'text/bg',
      'text/surface',
      'textMuted/bg',
      'textMuted/surface',
      'accent/bg',
      'accent/surface',
      'secondary/bg',
    ]);
  });
  it('all 5 PALETTES pass (Test 9)', () => {
    for (const p of PALETTES) {
      const result = validateFullMatrix(p);
      expect(
        result.valid,
        `${p.id} failures: ${result.failures.join('; ')}`,
      ).toBe(true);
    }
  });
  it('deliberately broken palette returns failures (Test 10)', () => {
    const broken = {
      ...PALETTES[0]!,
      text: 'oklch(0.6 0 0)',
      bg: 'oklch(0.65 0 0)',
    };
    const result = validateFullMatrix(broken);
    expect(result.valid).toBe(false);
    expect(result.failures.some((f) => f.startsWith('text on bg'))).toBe(true);
  });
});

describe('generateHarmonic', () => {
  const modes: HarmonicMode[] = [
    'complementary',
    'triadic',
    'analogous',
    'split-complementary',
  ];
  const expectedOffset: Record<HarmonicMode, number> = {
    complementary: 180,
    triadic: 120,
    analogous: 30,
    'split-complementary': 150,
  };
  for (const mode of modes) {
    it(`${mode} produces 6 OKLCh tokens (Test 12)`, () => {
      const result = generateHarmonic(mode, '#ff0000');
      for (const key of [
        'bg',
        'surface',
        'text',
        'textMuted',
        'accent',
        'secondary',
      ] as const) {
        expect(result[key]).toMatch(/^oklch\(/);
      }
    });
    it(`${mode} secondary hue offset matches spec (Tests 13-16)`, () => {
      const result = generateHarmonic(mode, '#ff0000');
      const sourceH = toOklch(parse('#ff0000')!)!.h ?? 0;
      const secondaryH = toOklch(parse(result.secondary)!)!.h ?? 0;
      const expected = (sourceH + expectedOffset[mode] + 360) % 360;
      expect(Math.abs(secondaryH - expected)).toBeLessThan(1);
    });
  }
  it('generated + applyMatrixAdjust passes validateFullMatrix (Test 17)', () => {
    const raw = generateHarmonic('triadic', '#3366cc');
    const { palette: adjusted } = applyMatrixAdjust({
      ...raw,
      id: 'terra',
      name: 'gen',
    });
    const { valid } = validateFullMatrix({
      ...adjusted,
      id: 'terra',
      name: 'gen',
    });
    expect(valid).toBe(true);
  });
  it('throws on invalid hex (Test 18)', () => {
    expect(() => generateHarmonic('complementary', 'not-a-color')).toThrow(
      /Invalid source color/,
    );
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
    const result = pickTextOnAccent(
      'oklch(0.95 0.05 30)',
      'oklch(0.95 0 0)',
      'oklch(0.1 0 0)',
    );
    expect(wcagContrast(result, 'oklch(0.95 0.05 30)')).toBeGreaterThanOrEqual(
      4.5,
    );
  });
  it('returns near-black or near-white when both fail (Test 21)', () => {
    const result = pickTextOnAccent(
      'oklch(0.5 0.2 30)',
      'oklch(0.5 0 0)',
      'oklch(0.5 0 0)',
    );
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
    for (const key of [
      'bg',
      'surface',
      'text',
      'textMuted',
      'accent',
      'secondary',
    ] as const) {
      expect(result[key]).toMatch(/^oklch\(/);
    }
    const bgL = toOklch(parse(result.bg)!)!.l;
    const surfL = toOklch(parse(result.surface)!)!.l;
    expect(Math.abs(bgL - surfL - 0.03)).toBeLessThan(0.01);
    expect(wcagContrast(result.text, result.bg)).toBeGreaterThanOrEqual(4.5);
    expect(wcagContrast(result.textMuted, result.bg)).toBeGreaterThanOrEqual(
      4.5,
    );
  });
  it('dark bg → lighter surface + near-white text (Test 23)', () => {
    const result = deriveDefaultTokens({
      bg: 'oklch(0.2 0 0)',
      accent: 'oklch(0.6 0.2 30)',
      secondary: 'oklch(0.7 0.15 200)',
    });
    const bgL = toOklch(parse(result.bg)!)!.l;
    const surfL = toOklch(parse(result.surface)!)!.l;
    expect(surfL - bgL).toBeCloseTo(0.03, 1);
    expect(wcagContrast(result.text, result.bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('applyMatrixAdjust (D-11)', () => {
  it('no-op when already valid (Test 25)', () => {
    const { palette, wasAdjusted } = applyMatrixAdjust(PALETTES[0]!);
    expect(wasAdjusted).toBe(false);
    expect(palette.bg).toBe(PALETTES[0]!.bg);
    expect(palette.surface).toBe(PALETTES[0]!.surface);
    expect(palette.text).toBe(PALETTES[0]!.text);
    expect(palette.textMuted).toBe(PALETTES[0]!.textMuted);
    expect(palette.accent).toBe(PALETTES[0]!.accent);
    expect(palette.secondary).toBe(PALETTES[0]!.secondary);
  });
  it('shifts text when failing, makes palette valid (Test 26)', () => {
    const broken = { ...PALETTES[0]!, text: 'oklch(0.85 0 0)' };
    const { palette: result, wasAdjusted } = applyMatrixAdjust(broken);
    expect(wasAdjusted).toBe(true);
    const validation = validateFullMatrix({
      ...result,
      id: broken.id,
      name: broken.name,
    });
    expect(
      validation.valid,
      `failures after adjust: ${validation.failures.join('; ')}`,
    ).toBe(true);
  });
  it('never modifies accent or secondary (Test 27)', () => {
    const broken = { ...PALETTES[0]!, text: 'oklch(0.85 0 0)' };
    const { palette: result } = applyMatrixAdjust(broken);
    expect(result.accent).toBe(broken.accent);
    expect(result.secondary).toBe(broken.secondary);
  });
});
