/**
 * scripts/stress-test-palettes.ts — tsx-runnable A11Y-07 gate (exit 1 on any failure).
 *
 * A plain-script mirror of lib/colors.stress.test.ts using the SAME seeded
 * Mulberry32 RNG (fixed seed 0xc0ffee) so the script and the in-suite test
 * exercise identical palettes. Generates 10 random source colors × 4 harmonic
 * modes = 40 palettes; for each, after applyMatrixAdjust (D-11) it asserts
 * validateFullMatrix is valid and all 6 tokens parse as OKLCh with no NaN.
 * Re-asserts the PALETTES presets against the 7-pair matrix (regression guard).
 *
 * Exit contract mirrors scripts/check-i18n-parity.ts + scripts/validate-palettes.ts:
 * console.error + process.exit(1) on any failure; a single ✅ success line otherwise.
 *
 * Uses RELATIVE imports (../lib/colors, ../lib/palettes) — the script runs via
 * `tsx`, where the `@/` alias (a Vitest/Next config) is not available.
 *
 * Usage: npm run test:stress
 */
import { parse } from 'culori';
import {
  generateHarmonic,
  validateFullMatrix,
  applyMatrixAdjust,
  type HarmonicMode,
} from '../lib/colors';
import { PALETTES } from '../lib/palettes';

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
const randomHex = () =>
  `#${Math.floor(rand() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;

const failures: string[] = [];

for (let i = 0; i < 10; i++) {
  const src = randomHex();
  for (const mode of MODES) {
    const { palette } = applyMatrixAdjust({ ...generateHarmonic(mode, src) });
    const result = validateFullMatrix(palette);
    if (!result.valid)
      failures.push(`❌ ${mode} ${src}: ${result.failures.join('; ')}`);
    for (const key of [
      'bg',
      'surface',
      'text',
      'textMuted',
      'accent',
      'secondary',
    ] as const) {
      const parsed = parse(palette[key]);
      if (!parsed) {
        failures.push(`❌ ${mode} ${src}: ${key}=${palette[key]} unparseable`);
        continue;
      }
      for (const v of Object.values(parsed)) {
        if (typeof v === 'number' && Number.isNaN(v))
          failures.push(`❌ ${mode} ${src}: ${key} has NaN channel`);
      }
    }
  }
}
for (const p of PALETTES) {
  if (!validateFullMatrix(p).valid)
    failures.push(`❌ preset ${p.id} fails the 7-pair matrix`);
}

if (failures.length) {
  console.error('Palette stress test FAILED.');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  '✅ Palette stress test OK — 40 random palettes + presets pass the 7-pair matrix.',
);
