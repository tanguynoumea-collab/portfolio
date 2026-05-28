---
phase: 06-seo-accessibility-polish
plan: 03
type: execute
wave: 1
depends_on: ["06-00"]
files_modified:
  - lib/colors.stress.test.ts
  - scripts/stress-test-palettes.ts
autonomous: true
requirements: [A11Y-07]
must_haves:
  truths:
    - "A seeded, deterministic test generates 10 random source colors × 4 harmonic modes (40 palettes) and asserts validateFullMatrix is valid after applyMatrixAdjust"
    - "Every generated palette's 6 tokens parse as valid OKLCh via culori with no NaN channels"
    - "The 4 visible presets still pass the 7-pair WCAG matrix (regression guard)"
    - "A tsx-runnable scripts/stress-test-palettes.ts mirrors the assertions and exits 1 on any failure"
  artifacts:
    - path: "lib/colors.stress.test.ts"
      provides: "Seeded in-suite stress test (A11Y-07)"
      contains: "generateHarmonic"
      min_lines: 40
    - path: "scripts/stress-test-palettes.ts"
      provides: "tsx-runnable gate mirror, exit-1 on failure"
      contains: "process.exit"
  key_links:
    - from: "lib/colors.stress.test.ts"
      to: "lib/colors validateFullMatrix + applyMatrixAdjust + generateHarmonic"
      via: "reuse the locked 7-pair contract"
      pattern: "validateFullMatrix|applyMatrixAdjust"
    - from: "lib/colors.stress.test.ts"
      to: "culori parse"
      via: "OKLCh token validity"
      pattern: "parse\\("
---

<objective>
Deliver A11Y-07: prove the signature palette switcher is robust. A seeded (deterministic) RNG produces 10 random source colors; each runs through `generateHarmonic` across all 4 modes (complementary, triadic, analogous, split-complementary) = 40 palettes. For each, assert `validateFullMatrix` returns valid AFTER the locked `applyMatrixAdjust` (D-11 silent AA fix-up), and that all 6 tokens parse as valid OKLCh via culori with no NaN. Re-assert the 4 visible presets pass the 7-pair matrix (regression guard). Provide a tsx-runnable mirror for CI/manual gating.

Purpose: The WCAG-aware palette is the portfolio's signature — this test is the evidence that any random user-generated palette stays accessible. (The visual "no layout breakage" dimension is a manual HUMAN-UAT browser spot-check; jsdom can't measure layout.)
Output: lib/colors.stress.test.ts (seeded, deterministic) + scripts/stress-test-palettes.ts (tsx gate).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-seo-accessibility-polish/06-RESEARCH.md

<interfaces>
<!-- Verified lib/colors.ts contracts (read directly) — no exploration needed. -->

lib/colors.ts exports (verified signatures):
  - `export type HarmonicMode = 'complementary' | 'triadic' | 'analogous' | 'split-complementary'`
  - `export function generateHarmonic(mode: HarmonicMode, sourceHex: string): DerivedTokens`
      → returns { bg, surface, text, textMuted, accent, secondary } (all OKLCh strings). Throws on unparseable source (randomHex always produces a valid 6-digit hex → no throw).
  - `export function applyMatrixAdjust(candidate: {bg,surface,text,textMuted,accent,secondary} & Partial<{id,name}>): { palette: DerivedTokens & {id,name}; wasAdjusted: boolean }`
      → INVARIANT: only text + textMuted shift; accent/secondary preserved. Returns `{ palette, wasAdjusted }`.
  - `export function validateFullMatrix(palette): { valid: boolean; failures: string[] }`
      → checks the 7 critical pairs (text/bg, text/surface, textMuted/bg, textMuted/surface, accent/bg, accent/surface, secondary/bg).

lib/palettes.ts: `export const PALETTES` — array; the 4 VISIBLE presets (terra/nordic/bauhaus/ocean) are pre-validated; Vaporwave is index 4 (secret). Each palette is `{ id, name, bg, surface, text, textMuted, accent, secondary }`.

culori: `import { parse } from 'culori'` — `parse(str)` returns a color object or undefined.

Existing gate-script precedent: scripts/check-i18n-parity.ts + scripts/check-mdx-structure.ts (exit-0 on pass, console.error + process.exit(1) on failure, tsx-runnable).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: lib/colors.stress.test.ts (seeded 10×4 + preset regression guard)</name>
  <read_first>
    - 06-RESEARCH.md §11 (the full verbatim stress-test snippet incl. mulberry32 RNG, MODES, randomHex, the per-palette assertions)
    - lib/colors.ts applyMatrixAdjust return shape `{ palette }` + validateFullMatrix `{ valid, failures }` (see interfaces)
    - lib/palettes.ts PALETTES (the visible presets to regression-guard)
  </read_first>
  <action>
    Create `lib/colors.stress.test.ts` VERBATIM from 06-RESEARCH §11. The seeded Mulberry32 RNG makes it deterministic (no flaky randomness); 10 sources × 4 modes = 40 generated palettes:

    ```ts
    import { describe, it, expect } from 'vitest';
    import { parse } from 'culori';
    import {
      generateHarmonic, validateFullMatrix, applyMatrixAdjust,
      type HarmonicMode,
    } from '@/lib/colors';
    import { PALETTES } from '@/lib/palettes';

    // Mulberry32 — deterministic seeded RNG (no dep).
    function mulberry32(seed: number) {
      return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rand = mulberry32(0xC0FFEE);
    const MODES: HarmonicMode[] = ['complementary', 'triadic', 'analogous', 'split-complementary'];

    function randomHex() {
      const h = Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0');
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
            for (const key of ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary'] as const) {
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
    ```

    NOTE on the preset regression guard: the snippet iterates ALL of `PALETTES` (which includes Vaporwave at index 4). Vaporwave was pre-validated WCAG-AA in Phase 2 (STATE.md confirms the measured ratios pass after the Bauhaus.secondary + Vaporwave fix-ups), so iterating all 5 is correct and stronger than only the 4 visible. If the Vaporwave entry somehow fails `validateFullMatrix` here, that is a real Phase-2 regression to surface — do NOT silence it; report it as a blocker.

    If `applyMatrixAdjust` cannot make a particular random source pass (validateFullMatrix still false), that is a genuine A11Y-07 finding — investigate whether the source produces an out-of-gamut accent/secondary that adjustForAA (which only shifts text/textMuted) can't compensate for. Document any such case; the locked contract is that text/textMuted shift to reach AA against bg/surface, and accent/secondary contrast against bg is checked too. The seeded RNG (`0xC0FFEE`) is fixed, so the 40 cases are reproducible — if one fails, it fails identically every run.
  </action>
  <verify>
    <automated>npx vitest run lib/colors.stress.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `lib/colors.stress.test.ts` imports `generateHarmonic`, `validateFullMatrix`, `applyMatrixAdjust` from `@/lib/colors` and `parse` from `culori`
    - Generates exactly 10 sources × 4 modes (40 generated-palette `it` blocks) + 1 preset regression `it`
    - Each generated palette asserts `validateFullMatrix(...).valid === true` after `applyMatrixAdjust`, and all 6 tokens parse via culori with no NaN
    - `npx vitest run lib/colors.stress.test.ts` exits 0 (all 41 tests pass)
  </acceptance_criteria>
  <done>Seeded 10×4 stress test green; presets regression-guarded; deterministic (fixed seed).</done>
</task>

<task type="auto">
  <name>Task 2: scripts/stress-test-palettes.ts (tsx-runnable gate mirror)</name>
  <read_first>
    - 06-RESEARCH.md §11 ("scripts/stress-test-palettes.ts — tsx-runnable mirror (exit 1 on any failure)")
    - scripts/check-i18n-parity.ts (the exit-0 contract: console.error + process.exit(1) on failure, console.log on success)
  </read_first>
  <action>
    Create `scripts/stress-test-palettes.ts` — a tsx-runnable mirror of the in-suite test using the SAME seeded RNG + assertions, but as a plain script (no vitest) that `process.exit(1)`s on any failure and prints a success line otherwise (mirrors scripts/check-i18n-parity.ts):

    ```ts
    // scripts/stress-test-palettes.ts — tsx-runnable A11Y-07 gate (exit 1 on any failure).
    import { parse } from 'culori';
    import {
      generateHarmonic, validateFullMatrix, applyMatrixAdjust,
      type HarmonicMode,
    } from '../lib/colors';
    import { PALETTES } from '../lib/palettes';

    function mulberry32(seed: number) {
      return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rand = mulberry32(0xc0ffee);
    const MODES: HarmonicMode[] = ['complementary', 'triadic', 'analogous', 'split-complementary'];
    const randomHex = () => `#${Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0')}`;

    const failures: string[] = [];

    for (let i = 0; i < 10; i++) {
      const src = randomHex();
      for (const mode of MODES) {
        const { palette } = applyMatrixAdjust({ ...generateHarmonic(mode, src) });
        const result = validateFullMatrix(palette);
        if (!result.valid) failures.push(`❌ ${mode} ${src}: ${result.failures.join('; ')}`);
        for (const key of ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary'] as const) {
          const parsed = parse(palette[key]);
          if (!parsed) { failures.push(`❌ ${mode} ${src}: ${key}=${palette[key]} unparseable`); continue; }
          for (const v of Object.values(parsed)) {
            if (typeof v === 'number' && Number.isNaN(v)) failures.push(`❌ ${mode} ${src}: ${key} has NaN channel`);
          }
        }
      }
    }
    for (const p of PALETTES) {
      if (!validateFullMatrix(p).valid) failures.push(`❌ preset ${p.id} fails the 7-pair matrix`);
    }

    if (failures.length) {
      console.error('Palette stress test FAILED.');
      for (const f of failures) console.error(`  ${f}`);
      process.exit(1);
    }
    console.log('✅ Palette stress test OK — 40 random palettes + presets pass the 7-pair matrix.');
    ```
    Use RELATIVE imports (`../lib/colors`, `../lib/palettes`) — scripts run via `tsx` and the `@/` alias is a Vitest/Next config, not a tsx default. Mirror the `0xc0ffee` seed so the script and the test exercise identical palettes.

    Add an npm script to package.json (mirrors `test:palettes`): `"test:stress": "tsx scripts/stress-test-palettes.ts"`.
  </action>
  <verify>
    <automated>npx tsx scripts/stress-test-palettes.ts</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/stress-test-palettes.ts` exists, uses relative imports (`../lib/colors`, `../lib/palettes`), and `process.exit(1)` on failure
    - `npx tsx scripts/stress-test-palettes.ts` exits 0 and prints the ✅ success line
    - `package.json` contains a `test:stress` script
  </acceptance_criteria>
  <done>tsx gate mirror passes (exit 0); test:stress script added.</done>
</task>

</tasks>

<verification>
- `npx vitest run lib/colors.stress.test.ts` exits 0 (40 generated + 1 preset regression = 41 tests green)
- `npx tsx scripts/stress-test-palettes.ts` exits 0 with the success line
- Deterministic: re-running gives identical results (fixed seed 0xC0FFEE)
- Visual "no layout break" for random palettes is recorded as a manual HUMAN-UAT item (not automatable in jsdom)
</verification>

<success_criteria>
A11Y-07: 10 seeded random source colors × 4 harmonic modes all produce palettes that pass the 7-pair WCAG matrix after applyMatrixAdjust, with all tokens valid OKLCh (no NaN); the 4 visible presets (+ Vaporwave) remain valid. Both an in-suite test and a tsx gate exist and pass.
</success_criteria>

<output>
After completion, create `.planning/phases/06-seo-accessibility-polish/06-03-SUMMARY.md`
</output>
