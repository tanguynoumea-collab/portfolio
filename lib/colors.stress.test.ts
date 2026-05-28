/**
 * lib/colors.stress.test.ts — A11Y-07 seeded palette stress test (Phase 6 Plan 06-03).
 *
 * Proves the signature WCAG-aware palette switcher is robust: a deterministic
 * Mulberry32 RNG (fixed seed 0xC0FFEE) produces 10 "random" source colors; each
 * runs through `generateHarmonic` across all 4 harmonic modes = 40 generated
 * palettes. For each, after the locked `applyMatrixAdjust` (D-11 silent AA fix-up):
 *   - `validateFullMatrix` returns valid (the 7-pair WCAG matrix passes), and
 *   - all 6 tokens parse as valid OKLCh via culori with no NaN channels.
 *
 * The 5 PALETTES presets (terra/nordic/bauhaus/ocean + the secret vaporwave) are
 * re-asserted against the 7-pair matrix as a Phase-2 regression guard.
 *
 * Deterministic by construction: the fixed seed means the 40 cases are identical
 * every run (no flaky randomness). The visual "no layout breakage" dimension for
 * random palettes is a manual HUMAN-UAT browser spot-check (jsdom can't measure
 * layout) and is intentionally NOT covered here.
 *
 * Mirrors scripts/stress-test-palettes.ts (same seed + assertions, exit-1 gate).
 */
import { describe, it, expect } from 'vitest';
import { parse } from 'culori';
import {
  generateHarmonic,
  validateFullMatrix,
  applyMatrixAdjust,
  type HarmonicMode,
} from '@/lib/colors';
import { PALETTES } from '@/lib/palettes';

// Mulberry32 — deterministic seeded RNG (no dep).
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xc0ffee);
const MODES: HarmonicMode[] = [
  'complementary',
  'triadic',
  'analogous',
  'split-complementary',
];

function randomHex() {
  const h = Math.floor(rand() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `#${h}`;
}

describe('A11Y-07 — palette stress (10 random sources × 4 modes)', () => {
  for (let i = 0; i < 10; i++) {
    const src = randomHex();
    for (const mode of MODES) {
      it(`generateHarmonic(${mode}, ${src}) → valid AA matrix + 6 OKLCh tokens`, () => {
        const tokens = generateHarmonic(mode, src);
        const { palette } = applyMatrixAdjust({ ...tokens }); // D-11 silent AA fix-up
        const result = validateFullMatrix(palette);
        expect(result.valid, result.failures.join('; ')).toBe(true);
        for (const key of [
          'bg',
          'surface',
          'text',
          'textMuted',
          'accent',
          'secondary',
        ] as const) {
          const parsed = parse(palette[key]);
          expect(parsed, `${key}=${palette[key]} unparseable`).toBeTruthy();
          // no NaN in any channel
          for (const v of Object.values(parsed!)) {
            if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false);
          }
        }
      });
    }
  }
  it('4 presets still pass the 7-pair matrix (regression guard)', () => {
    for (const p of PALETTES) {
      expect(validateFullMatrix(p).valid, `${p.id} failed`).toBe(true);
    }
  });
});
