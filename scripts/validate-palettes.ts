/**
 * scripts/validate-palettes.ts — pre-flight WCAG AA gate for all 5 palettes.
 *
 * Runs at Phase 2 Wave 0 to confirm every preset (terra, nordic, bauhaus, ocean,
 * vaporwave) passes the 7-pair WCAG matrix BEFORE ThemeProvider can dispatch
 * SET_PRESET. Resolves the STATE.md "Vaporwave WCAG pre-validation" blocker.
 *
 * If a palette fails, the script prints exact ratios and exits non-zero.
 * It does NOT mutate lib/palettes.ts — humans (or this task) update the OKLCh
 * values manually based on the printed diagnostics.
 *
 * Usage: npm run test:palettes
 */
import { wcagContrast } from 'culori';
import { PALETTES, type Palette } from '../lib/palettes';

const CRITICAL_PAIRS: Array<[fg: keyof Palette, bg: keyof Palette, minRatio: number]> = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['textMuted', 'bg', 4.5],
  ['textMuted', 'surface', 4.5],
  ['accent', 'bg', 3.0],
  ['accent', 'surface', 3.0],
  ['secondary', 'bg', 3.0],
];

type PairResult = { fg: string; bg: string; ratio: number; min: number; pass: boolean };

function validateOne(p: Palette): PairResult[] {
  return CRITICAL_PAIRS.map(([fg, bg, min]) => {
    // culori.wcagContrast accepts CSS color strings (oklch(...)) and returns a number
    const fgVal = p[fg];
    const bgVal = p[bg];
    const ratio = wcagContrast(fgVal, bgVal) ?? 0;
    return { fg, bg, ratio, min, pass: ratio >= min };
  });
}

let totalFailures = 0;
for (const palette of PALETTES) {
  const results = validateOne(palette);
  const failures = results.filter((r) => !r.pass);
  const status = failures.length === 0 ? 'PASS' : `FAIL (${failures.length}/7)`;
  console.log(`\n[${status}] ${palette.id} (${palette.name})`);
  for (const r of results) {
    const marker = r.pass ? '  ok' : '  FAIL';
    console.log(
      `${marker}  ${r.fg.padEnd(10)} on ${r.bg.padEnd(8)}  ratio=${r.ratio.toFixed(2)}  (min ${r.min})`,
    );
  }
  totalFailures += failures.length;
}

if (totalFailures > 0) {
  console.error(
    `\n${totalFailures} WCAG pair(s) failed across PALETTES. Adjust OKLCh values in lib/palettes.ts.`,
  );
  process.exit(1);
}
console.log(`\nAll 5 palettes pass the 7-pair WCAG matrix.`);
