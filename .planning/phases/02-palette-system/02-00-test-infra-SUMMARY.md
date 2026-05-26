---
phase: 02
plan: 00
subsystem: test-infra
tags: [vitest, rtl, jsdom, culori, wcag, palettes, validation, tsx, motion, canvas-confetti]
dependency_graph:
  requires:
    - lib/palettes.ts (5 typed palettes from Phase 1)
    - package.json (Phase 1 scripts socket)
  provides:
    - vitest.config.ts (jsdom env + @/* alias for Wave 1+)
    - scripts/validate-palettes.ts (canonical WCAG AA gate, THEME-01)
    - package.json scripts test/test:watch/test:palettes
    - 9 dev deps (vitest, @vitest/ui, RTL trio, jsdom, tsx, @types/canvas-confetti)
    - 3 runtime deps (culori, canvas-confetti, motion) used by downstream Phase 2 plans
  affects:
    - lib/palettes.ts (Bauhaus.secondary L-adjusted 0.7 -> 0.6 to clear AA matrix)
tech_stack:
  added:
    - vitest@^4.1.7 (ESM-native, React 19 + RTL out of box)
    - "@vitest/ui@^4.1.7"
    - "@testing-library/react@^16.3.2"
    - "@testing-library/jest-dom@^6.9.1"
    - "@testing-library/user-event@^14.6.1"
    - jsdom@^29.1.1
    - tsx@^4.22.3 (Node TypeScript runner for validate-palettes script)
    - culori@^4.0.2 (OKLCh + wcagContrast, used by validate-palettes today + lib/colors.ts in Wave 1)
    - canvas-confetti@^1.9.4 (Konami unlock burst, dynamic-imported in Wave 4)
    - motion@^12.40.0 (FAB hover animation in Wave 4)
    - "@types/canvas-confetti@^1.9.0"
  patterns:
    - "Pre-flight validation gate: standalone Node script consuming canonical palette data, exits non-zero with diagnostic ratios on failure"
    - "Test infrastructure ESM-first: vitest + jsdom + @/* alias matching tsconfig"
key_files:
  created:
    - vitest.config.ts
    - scripts/validate-palettes.ts
    - .planning/phases/02-palette-system/02-00-test-infra-SUMMARY.md
  modified:
    - package.json (added scripts + 12 deps total)
    - lib/palettes.ts (Bauhaus secondary L 0.7 -> 0.6; JSDoc VERIFIED block added)
decisions:
  - "Bauhaus.secondary L-shift 0.7 -> 0.6: hue 250 + chroma 0.18 preserved to keep blue identity; new ratio 3.63 vs bg (was 2.45) gives comfortable margin above 3.0 UI threshold without overdarkening the visual"
  - "Vaporwave pre-validation blocker (STATE.md) RESOLVED as non-issue: all 7 pairs pass with original OKLCh values; worst pair textMuted/surface = 7.68 ratio, well above 4.5"
  - "validate-palettes.ts is standalone (NOT a vitest test) — does not depend on lib/colors.ts which Wave 1 will build; inlines the 7-pair CRITICAL_PAIRS matrix directly using culori.wcagContrast"
  - "vitest.config.ts include glob covers lib/**, components/**, scripts/** — scripts/ included so future scripts/*.test.ts (if ever added) are picked up automatically"
  - "globals: true in vitest config — test files can use describe/it/expect without imports (less boilerplate for Wave 1+ test authors)"
  - "css: false in vitest config — Tailwind v4 CSS resolution skipped in tests; we test logic, not paint"
metrics:
  duration: "2m 55s"
  completed: "2026-05-26T11:16:20Z"
  tasks: 2
  files: 4
  commits: 2
---

# Phase 2 Plan 00: Test Infrastructure Summary

Bootstrapped Vitest 4.x + RTL + jsdom + tsx + culori so every downstream Phase 2 plan can ship `vitest run` as automated verification, and shipped `scripts/validate-palettes.ts` as the canonical THEME-01 WCAG AA gate that exits 0 on success / non-zero with diagnostics on failure. Verified all 5 palettes (terra, nordic, bauhaus, ocean, vaporwave) pass the 7-pair WCAG matrix at definition time, resolving the STATE.md Vaporwave pre-validation blocker (which turned out to be a false alarm — Vaporwave passed unchanged; Bauhaus secondary was the actual culprit and got L-adjusted 0.7 → 0.6 to clear the 3.0 UI threshold).

## What Shipped

### Vitest 4.1.7 + RTL + jsdom test framework operational

- `vitest.config.ts` at repo root with `environment: 'jsdom'`, `globals: true`, `@/*` alias matching tsconfig + shadcn convention, `css: false` (logic-only tests), include globs for `lib/**`, `components/**`, `scripts/**`
- 9 new devDependencies: `vitest@^4.1.7`, `@vitest/ui@^4.1.7`, `@testing-library/react@^16.3.2`, `@testing-library/jest-dom@^6.9.1`, `@testing-library/user-event@^14.6.1`, `jsdom@^29.1.1`, `tsx@^4.22.3`, `@types/canvas-confetti@^1.9.0`
- 3 new package.json scripts: `test` (vitest run), `test:watch` (vitest), `test:palettes` (tsx scripts/validate-palettes.ts)
- Smoke test: `npx vitest --version` → `vitest/4.1.7 win32-x64 node-v24.14.1` (exit 0)

### Runtime libraries pre-installed for downstream Phase 2 plans

- `culori@^4.0.2` — consumed today by validate-palettes.ts; consumed by lib/colors.ts in Wave 1 (`wcagContrast`, `parse`, `converter('oklch')`, `formatCss`)
- `canvas-confetti@^1.9.4` — dynamic-imported only on Konami unlock in Wave 4 (zero cold-load cost)
- `motion@^12.40.0` — FAB hover animation + `useReducedMotion` hook in Wave 4

### `scripts/validate-palettes.ts` — canonical THEME-01 gate

Standalone Node script (NOT a vitest test — deliberately decoupled from `lib/colors.ts` which Wave 1 will build). Inlines the 7-pair CRITICAL_PAIRS matrix directly:

| Pair | Min Ratio | Source |
|------|-----------|--------|
| text on bg | 4.5 | WCAG 1.4.3 normal text |
| text on surface | 4.5 | WCAG 1.4.3 |
| textMuted on bg | 4.5 | WCAG 1.4.3 |
| textMuted on surface | 4.5 | WCAG 1.4.3 |
| accent on bg | 3.0 | WCAG 1.4.11 UI components |
| accent on surface | 3.0 | WCAG 1.4.11 |
| secondary on bg | 3.0 | WCAG 1.4.11 |

Iterates `PALETTES`, prints per-palette `[PASS]/[FAIL (n/7)]` status + every pair's exact ratio, sums failures, `process.exit(1)` if any. Runnable via `npm run test:palettes`.

## Worst-pair ratio per palette (final, all PASS)

| Palette | Worst Pair | Ratio | Threshold | Margin |
|---------|-----------|-------|-----------|--------|
| terra (Terra & Sage) | accent on surface | 3.26 | 3.0 | +0.26 |
| nordic (Atelier Nordique) | secondary on bg | 3.63 | 3.0 | +0.63 |
| bauhaus (Bauhaus Bright) | accent on bg | 3.30 | 3.0 | +0.30 |
| ocean (Ocean Studio) | secondary on bg | 3.10 | 3.0 | +0.10 |
| vaporwave (???) | accent on surface | 7.25 | 3.0 | +4.25 |

**Tightest preset:** Ocean's secondary on bg (3.10 vs 3.0 = +0.10 margin). Future preset edits to Ocean.secondary must re-run `npm run test:palettes` to confirm continued AA compliance.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bauhaus.secondary failed WCAG AA — L-adjusted 0.7 → 0.6**

- **Found during:** Task 2 (first `npm run test:palettes` run)
- **Issue:** `Bauhaus.secondary: oklch(0.7 0.18 250)` gave ratio 2.45 vs `bg: oklch(0.97 0.005 90)`, below the 3.0 UI threshold from WCAG 1.4.11. The plan's prediction was that Vaporwave.textMuted would be the failing token; the actual failure was elsewhere.
- **Fix:** Binary-searched L values (`node -e "..."` script) to find minimal shift that clears 3.0 with comfortable margin. L=0.65 → 2.97 (still fails), L=0.6 → 3.63 (passes with +0.63 margin). Chose L=0.6 — minimal perceptual change vs preserving the Bauhaus blue identity (chroma 0.18, hue 250 unchanged).
- **Why not 0.65 or 0.62:** Floating-point boundary cases + cross-browser sRGB rounding can shave ~0.05 off computed ratios; +0.63 margin is robust.
- **Files modified:** `lib/palettes.ts` (Bauhaus.secondary OKLCh value + inline comment + JSDoc VERIFIED block)
- **Commit:** `0acfcb9`

**2. [Rule 1 - Bug] Plan-predicted Vaporwave adjustment was unnecessary**

- **Found during:** Task 2
- **Issue:** The plan + STATE.md flagged `Vaporwave.textMuted: oklch(0.78 0.06 315)` as "borderline 4.5:1 vs surface". Actual measured ratio: **7.68** — well above 4.5.
- **Resolution:** Vaporwave shipped unchanged. The STATE.md blocker "Vaporwave preset WCAG compliance — pre-validate" is **resolved**. The plan's adjustment-comment template (`L-adjusted from 0.78 → <new value>`) was instead applied to the actual failing token (Bauhaus.secondary).
- **Why the false alarm:** Visual intuition (dark surface 0.26 + medium-bright textMuted 0.78 looks similar in greyscale) overweights the L difference; OKLCh's perceptual uniformity means even mid-L pinkish text gets enough relative luminance contrast against very dark indigo.

### No architectural deviations (Rule 4)

The Bauhaus L-shift is a single-line preset definition change — no schema changes, no API changes, no new files beyond what the plan specified. CONTEXT.md D-11 (runtime rule "only text/textMuted shift in L; accent/secondary stay") is **not violated** because D-11 governs the runtime ThemeProvider adjustForAA flow for user-generated palettes, not the author-time preset definition flow. The two flows have different invariants and the plan's `<action>` step explicitly authorized "the OKLCh L-shift heuristic from CONTEXT.md D-11" applied to whichever token was failing.

## Authentication gates

None — Phase 2 Wave 0 is local-only (npm install + filesystem writes + Node script runs). No external services, no auth flows.

## Known Stubs

None — no UI rendering yet (Wave 0 is pure infrastructure). No empty arrays/placeholder values that would mislead the verifier.

## How downstream plans consume this

- **Wave 1 plans** (`02-01-lib-colors-PLAN.md`, `02-02-lib-storage-hooks-PLAN.md`): write `lib/colors.test.ts`, `lib/storage.test.ts`, `lib/hooks/*.test.ts`, run with `vitest run`. All tests inherit `globals: true` (`describe/it/expect` ambient) and the `@/*` alias.
- **Wave 2-4 plans** (theme-provider, sheet, fab, konami): write `components/**/*.test.tsx` for ThemeProvider + each palette UI component. RTL + jest-dom matchers available; jsdom environment auto-applied.
- **Every plan** that mutates `lib/palettes.ts` or adds a new preset MUST re-run `npm run test:palettes` before commit. Bauhaus.secondary 0.6, Ocean.secondary, and Bauhaus/Terra.accent all sit close to their thresholds — any future tuning needs the gate.
- **CI / phase-verify**: Add `npm run test:palettes && npm test` to the Phase 2 verification gate.

## Self-Check: PASSED

**Files exist (4/4):**
- FOUND: vitest.config.ts
- FOUND: scripts/validate-palettes.ts
- FOUND: lib/palettes.ts (modified)
- FOUND: package.json (modified)

**Commits exist (2/2):**
- FOUND: d91d31f (chore(02-00): install Vitest + RTL + culori stack)
- FOUND: 0acfcb9 (feat(02-00): add validate-palettes script + L-adjust Bauhaus)

**Verifications green (3/3):**
- `npx vitest --version` → vitest/4.1.7 (exit 0)
- `npm run test:palettes` → "All 5 palettes pass the 7-pair WCAG matrix" (exit 0)
- `[PASS] vaporwave` substring present in output

All Wave 0 success criteria satisfied. Phase 2 Wave 1 unblocked.
