---
phase: 02-palette-system
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - vitest.config.ts
  - scripts/validate-palettes.ts
  - lib/palettes.ts
autonomous: true
requirements:
  - THEME-01
must_haves:
  truths:
    - "Vitest 2.x + RTL + jsdom test framework runs `npm test` and exits 0"
    - "All 5 palettes in lib/palettes.ts pass validateFullMatrix (7-pair WCAG AA matrix)"
    - "Vaporwave OKLCh values pre-adjusted at definition time so no runtime adjustForAA needed for the preset path"
  artifacts:
    - path: "vitest.config.ts"
      provides: "Vitest config with jsdom env + @/* alias"
      contains: "environment: 'jsdom'"
    - path: "scripts/validate-palettes.ts"
      provides: "Node-only palette validation gate, exits non-zero on AA failure"
      exports: []
    - path: "package.json"
      provides: "test/test:watch/test:palettes scripts + new dev deps"
      contains: "vitest"
    - path: "lib/palettes.ts"
      provides: "Vaporwave OKLCh adjusted (if validation failed) so all 5 palettes pass"
      contains: "id: 'vaporwave'"
  key_links:
    - from: "package.json scripts.test:palettes"
      to: "scripts/validate-palettes.ts"
      via: "tsx runner"
      pattern: "tsx scripts/validate-palettes.ts"
    - from: "scripts/validate-palettes.ts"
      to: "lib/palettes.ts + lib/colors.ts"
      via: "import PALETTES + validateFullMatrix"
      pattern: "PALETTES.forEach"
---

<objective>
Bootstrap Vitest 2.x + React Testing Library + jsdom + tsx so every downstream plan can ship `vitest run` as its <verify> automation. Then write the one-shot palette validation gate (`scripts/validate-palettes.ts`) that runs `validateFullMatrix` against all 5 palettes — and if Vaporwave fails (the STATE.md blocker), apply `adjustForAA` once at definition time and update `lib/palettes.ts` so every later plan can assume all preset OKLCh values pre-pass WCAG AA.

Purpose: Resolve the Vaporwave WCAG pre-validation blocker noted in STATE.md (textMuted 0.78 on surface 0.26 is borderline 4.5:1) BEFORE ThemeProvider can dispatch SET_PRESET('vaporwave'). Establish the test feedback loop the rest of Phase 2 depends on per 02-VALIDATION.md.
Output: vitest.config.ts, scripts/validate-palettes.ts, updated package.json scripts + devDeps, and (if needed) corrected Vaporwave OKLCh values in lib/palettes.ts.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-palette-system/02-CONTEXT.md
@.planning/phases/02-palette-system/02-RESEARCH.md
@.planning/phases/02-palette-system/02-VALIDATION.md
@lib/palettes.ts
@package.json

<interfaces>
<!-- The existing Vaporwave palette (may need adjustment after validation): -->
From lib/palettes.ts:
```ts
{
  id: 'vaporwave',
  name: '???',
  bg: 'oklch(0.2 0.04 290)',
  surface: 'oklch(0.26 0.055 285)',
  text: 'oklch(0.95 0.025 320)',
  textMuted: 'oklch(0.78 0.06 315)',   // ← borderline 4.5:1 vs surface (0.26)
  accent: 'oklch(0.78 0.175 340)',
  secondary: 'oklch(0.8 0.15 200)',
}
```

<!-- The 7-pair WCAG matrix from PITFALLS.md Pitfall #3 (referenced by scripts/validate-palettes.ts): -->
```ts
const CRITICAL_PAIRS: Array<[fg: keyof Palette, bg: keyof Palette, minRatio: number]> = [
  ['text',      'bg',      4.5],
  ['text',      'surface', 4.5],
  ['textMuted', 'bg',      4.5],
  ['textMuted', 'surface', 4.5],
  ['accent',    'bg',      3.0],  // WCAG 1.4.11 — UI components
  ['accent',    'surface', 3.0],
  ['secondary', 'bg',      3.0],
];
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Vitest + RTL + jsdom + tsx + culori and write vitest.config.ts</name>
  <files>package.json, vitest.config.ts</files>
  <read_first>
    - .planning/phases/02-palette-system/02-CONTEXT.md (locked decisions D-01..D-16, runtime stack constraints)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Validation Architecture section ~line 1033, Standard Stack table for versions)
    - .planning/phases/02-palette-system/02-VALIDATION.md (Test Infrastructure table — exact install command + scripts)
    - package.json (current state — no test scripts, no test deps)
    - CLAUDE.md (TypeScript strict, no `any`)
  </read_first>
  <action>
    1. **Install runtime libraries that downstream plans will consume** (so they appear in package.json now and `tsx` can resolve `culori` when scripts/validate-palettes.ts runs):
       ```bash
       npm install culori canvas-confetti motion
       npm install --save-dev @types/canvas-confetti
       ```
       Verified versions per 02-RESEARCH.md Standard Stack: culori ^4.0.2, canvas-confetti ^1.9.4, motion ^12.40.0. Note: culori v4 ships its own `.d.ts` — no `@types/culori` needed.

    2. **Install Vitest + RTL + jsdom + tsx as devDependencies:**
       ```bash
       npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom tsx
       ```

    3. **Add three scripts to package.json** (insert between existing `"format:check"` and the `}` closing scripts):
       ```json
       "test": "vitest run",
       "test:watch": "vitest",
       "test:palettes": "tsx scripts/validate-palettes.ts"
       ```

    4. **Create `vitest.config.ts` at repo root** with exactly this content:
       ```ts
       import { defineConfig } from 'vitest/config';
       import path from 'node:path';

       export default defineConfig({
         test: {
           environment: 'jsdom',
           globals: true,
           setupFiles: [],
           include: [
             'lib/**/*.{test,spec}.{ts,tsx}',
             'components/**/*.{test,spec}.{ts,tsx}',
             'scripts/**/*.{test,spec}.{ts,tsx}',
           ],
           css: false,
         },
         resolve: {
           alias: {
             '@': path.resolve(__dirname, '.'),
           },
         },
       });
       ```
       Rationale (per 02-VALIDATION.md): `environment: 'jsdom'` enables RTL component tests; `globals: true` lets test files use `describe/it/expect` without imports; `@/*` alias matches tsconfig + shadcn convention from Phase 1; `css: false` skips Tailwind v4 CSS resolution in tests (we test logic, not paint).

    5. **Smoke test:** run `npx vitest --version` — must print the installed version with no error.
  </action>
  <verify>
    <automated>npm test -- --version &amp;&amp; node -e "const pkg = require('./package.json'); if (!pkg.scripts.test || !pkg.scripts['test:palettes'] || !pkg.devDependencies.vitest || !pkg.devDependencies.jsdom || !pkg.dependencies.culori) { console.error('Missing required scripts or deps'); process.exit(1); } console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"vitest"` in devDependencies (any ^2.x version)
    - `package.json` contains `"jsdom"`, `"@testing-library/react"`, `"@testing-library/jest-dom"`, `"@testing-library/user-event"`, `"tsx"`, `"@types/canvas-confetti"` in devDependencies
    - `package.json` contains `"culori"`, `"canvas-confetti"`, `"motion"` in dependencies
    - `package.json` scripts contain `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:palettes": "tsx scripts/validate-palettes.ts"`
    - `vitest.config.ts` exists at repo root
    - `vitest.config.ts` contains the literal string `environment: 'jsdom'`
    - `vitest.config.ts` contains the literal string `'@': path.resolve(__dirname, '.')`
    - `npx vitest --version` exits 0 and prints a version number
  </acceptance_criteria>
  <done>Test framework operational. `npm test` runs Vitest in jsdom mode against `lib/**` and `components/**`. Runtime deps culori + canvas-confetti + motion installed (downstream plans will import them).</done>
</task>

<task type="auto">
  <name>Task 2: Write scripts/validate-palettes.ts and adjust Vaporwave OKLCh values if AA fails</name>
  <files>scripts/validate-palettes.ts, lib/palettes.ts</files>
  <read_first>
    - lib/palettes.ts (current Vaporwave OKLCh values — Task 2 may need to mutate these)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Vaporwave Pre-Validation section ~line 695, Pattern 5 — 7-pair WCAG matrix)
    - .planning/research/PITFALLS.md (Pitfall 3 — CRITICAL_PAIRS array, full validation algorithm)
    - .planning/STATE.md (blocker entry: "Vaporwave preset WCAG compliance — pre-validate in lib/palettes.ts")
  </read_first>
  <action>
    Create `scripts/validate-palettes.ts` as a **standalone Node script** (NOT a Vitest test — this is the test:palettes runner). It MUST NOT depend on lib/colors.ts (which doesn't exist yet — Wave 1 builds it). Inline the validation logic directly using culori:

    ```ts
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
      ['text',      'bg',      4.5],
      ['text',      'surface', 4.5],
      ['textMuted', 'bg',      4.5],
      ['textMuted', 'surface', 4.5],
      ['accent',    'bg',      3.0],
      ['accent',    'surface', 3.0],
      ['secondary', 'bg',      3.0],
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
        console.log(`${marker}  ${r.fg.padEnd(10)} on ${r.bg.padEnd(8)}  ratio=${r.ratio.toFixed(2)}  (min ${r.min})`);
      }
      totalFailures += failures.length;
    }

    if (totalFailures > 0) {
      console.error(`\n${totalFailures} WCAG pair(s) failed across PALETTES. Adjust OKLCh values in lib/palettes.ts.`);
      process.exit(1);
    }
    console.log(`\nAll 5 palettes pass the 7-pair WCAG matrix.`);
    ```

    Then **run** `npm run test:palettes`. Capture the output.

    **If Vaporwave (or any palette) fails:**
    - Read the printed ratios.
    - Apply the OKLCh L-shift heuristic from CONTEXT.md D-11 (only `text`/`textMuted` shift in L; `accent`/`secondary` stay) directly to the relevant token(s) in `lib/palettes.ts`.
    - **Likely candidates per 02-RESEARCH.md line 695**: `textMuted: oklch(0.78 0.06 315)` may need to brighten to ~0.82 or higher to clear 4.5:1 against `surface: oklch(0.26 0.055 285)`. Use binary L-search by hand: try 0.82, then 0.85 if still failing. Keep chroma and hue identical so the visual identity is preserved.
    - Re-run `npm run test:palettes` until exit 0.
    - Update the inline comment in `lib/palettes.ts` next to Vaporwave to note: `// L-adjusted from 0.78 → <new value> at Phase 2 Wave 0 to clear 7-pair AA matrix`.

    **If all 5 pass immediately:** no edits to `lib/palettes.ts` are needed (Vaporwave already complies). Update the JSDoc block at the top of `lib/palettes.ts` lines 1-15 to add a sentence after the existing "NOTE:" paragraph: `// VERIFIED 2026-05-26 (Phase 2 Wave 0): all 5 palettes pass the 7-pair WCAG matrix via scripts/validate-palettes.ts; no adjustForAA needed at definition time.`

    Per CONTEXT.md D-15: Vaporwave's `.name: '???'` field stays unchanged — the i18n key (updated in Wave 2) is the display source.
  </action>
  <verify>
    <automated>npm run test:palettes</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/validate-palettes.ts` exists
    - `scripts/validate-palettes.ts` imports `wcagContrast` from `'culori'` and `PALETTES` from `'../lib/palettes'`
    - `scripts/validate-palettes.ts` contains the literal string `CRITICAL_PAIRS` and the 7 pairs in order: text/bg, text/surface, textMuted/bg, textMuted/surface, accent/bg, accent/surface, secondary/bg
    - `scripts/validate-palettes.ts` calls `process.exit(1)` when any failure detected
    - `npm run test:palettes` exits 0 (all 5 palettes pass 7/7 pairs)
    - Output of `npm run test:palettes` contains the literal substring `[PASS] vaporwave`
    - `lib/palettes.ts` still exports `PALETTES` as `ReadonlyArray<Palette>` of length 5 with ids exactly `terra, nordic, bauhaus, ocean, vaporwave` (no structural changes — only OKLCh value adjustments if needed)
  </acceptance_criteria>
  <done>STATE.md Vaporwave blocker resolved. All 5 palettes verified WCAG AA at definition time. Every downstream task can `import { PALETTES }` and trust that `setPreset(id)` never produces a failing matrix.</done>
</task>

</tasks>

<verification>
- `npm test -- --version` exits 0
- `npm run test:palettes` exits 0 with `[PASS] vaporwave` in output
- `package.json` has all 3 new scripts (test, test:watch, test:palettes)
- `vitest.config.ts` ready for Wave 1 plans to ship `lib/*.test.ts`
- All 5 palettes in `lib/palettes.ts` are AA-compliant
</verification>

<success_criteria>
- Vitest 2.x operational with jsdom + RTL
- `scripts/validate-palettes.ts` is the canonical gate for THEME-01
- Vaporwave OKLCh shipped at definition time satisfies the 7-pair matrix (NO runtime adjustForAA needed for preset switching)
- Wave 1 plans can immediately write `*.test.ts` files using `import { describe, it, expect } from 'vitest'` (or globals)
</success_criteria>

<output>
After completion, create `.planning/phases/02-palette-system/02-00-SUMMARY.md` documenting:
- Final Vaporwave OKLCh values (if changed)
- Exact ratios printed by `validate-palettes.ts` for the worst pair in each palette
- Confirmation that `npm test -- --version` and `npm run test:palettes` both exit 0
</output>
</content>
</invoke>