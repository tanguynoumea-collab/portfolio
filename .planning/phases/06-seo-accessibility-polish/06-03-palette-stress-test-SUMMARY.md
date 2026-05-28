---
phase: 06-seo-accessibility-polish
plan: 03
subsystem: testing
tags: [a11y, wcag, oklch, culori, palette, vitest, harmonic, stress-test]

# Dependency graph
requires:
  - phase: 02-palette-system
    provides: lib/colors.ts (generateHarmonic, validateFullMatrix, applyMatrixAdjust, CRITICAL_PAIRS) + lib/palettes.ts (5 presets)
  - phase: 06-seo-accessibility-polish (06-00)
    provides: audit-deps shipped (vitest-axe + lighthouse); vitest-setup.ts additive matcher wiring
provides:
  - Seeded deterministic palette stress test (A11Y-07) — 10 random sources x 4 harmonic modes = 40 palettes proven AA-valid
  - tsx-runnable gate (scripts/stress-test-palettes.ts) + npm run test:stress for CI/manual
  - generateHarmonic accent/secondary AA-safety fix (high-L sources no longer yield invisible accents)
affects: [06-04-a11y-audit, 06-05-lighthouse, phase-07-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seeded Mulberry32 RNG (fixed 0xC0FFEE) for reproducible 'random' palette generation — same seed -> same 40 palettes -> same pass every run"
    - "tsx-runnable gate mirrors in-suite Vitest test with identical seed + assertions (exit-1 contract, relative imports)"
    - "UI-token L-clamp (preserve hue + chroma) to satisfy the 3.0 WCAG UI-component threshold at generation time"

key-files:
  created:
    - lib/colors.stress.test.ts
    - scripts/stress-test-palettes.ts
  modified:
    - lib/colors.ts
    - package.json

key-decisions:
  - "Stress test mirrors the ACTUAL runtime flow: ThemeProvider SET_HARMONIC + HarmonicGenerator preview both do generateHarmonic -> applyMatrixAdjust and nothing more, so testing that exact pipeline is faithful to the user-facing switcher"
  - "Fixed generateHarmonic (not applyMatrixAdjust) for the accent/secondary contrast gap — D-11 invariant (accent/secondary NEVER modified by applyMatrixAdjust) is preserved + its regression test (Test 27) stays green"
  - "Preset regression guard iterates ALL 5 PALETTES (incl. secret Vaporwave), stronger than the 4 visible presets"

patterns-established:
  - "Seeded RNG stress testing: deterministic reproducibility over flaky randomness for property-style WCAG assertions"
  - "clampUiContrast: shift ONLY OKLCh L until a UI color clears a contrast threshold against a bg, preserving hue+chroma (brand intent) — UI-threshold sibling to adjustForAA's text-threshold logic"

requirements-completed: [A11Y-07]

# Metrics
duration: 4m 30s
completed: 2026-05-28
---

# Phase 6 Plan 03: Palette Stress Test Summary

**Seeded deterministic stress test (10 random sources x 4 harmonic modes = 40 palettes) proves every user-generated harmonic palette passes the 7-pair WCAG matrix, plus a generateHarmonic fix so pale source colors no longer produce an invisible accent.**

## Performance

- **Duration:** 4m 30s
- **Started:** 2026-05-28T12:07:35Z
- **Completed:** 2026-05-28T12:12:05Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- `lib/colors.stress.test.ts`: seeded Mulberry32 (0xC0FFEE) drives 10 random source colors x 4 modes = 40 generated palettes; each asserts `validateFullMatrix(...).valid` after `applyMatrixAdjust`, and all 6 tokens parse as valid OKLCh with no NaN channels. Plus a regression guard re-asserting all 5 PALETTES presets. 41 tests, deterministic across runs.
- `scripts/stress-test-palettes.ts`: tsx-runnable gate mirroring the in-suite test with the same seed + assertions; `process.exit(1)` on any failure (verified), success line otherwise; relative imports for tsx. Wired as `npm run test:stress`.
- **Fixed a real A11Y-07 robustness defect** in `generateHarmonic`: pale/high-L random sources produced accent/secondary tokens with as little as 1.22 contrast against the derived light bg (< 3.0 UI threshold) — and `applyMatrixAdjust` (D-11) structurally cannot fix them since it only shifts text/textMuted. Added `clampUiContrast` to bring accent/secondary to AA at generation time.

## Task Commits

Each task was committed atomically:

1. **Task 1: lib/colors.stress.test.ts (seeded 10x4 + preset regression guard) + generateHarmonic fix** - `3c5eb4c` (fix)
2. **Task 2: scripts/stress-test-palettes.ts (tsx gate mirror) + test:stress script** - `93ea0f9` (test)

**Plan metadata:** `630bc9f` (docs: complete plan — SUMMARY + STATE + ROADMAP + REQUIREMENTS)

## Files Created/Modified
- `lib/colors.stress.test.ts` - Seeded in-suite stress test (A11Y-07): 40 generated palettes + 1 preset regression `it`, 41 tests total
- `scripts/stress-test-palettes.ts` - tsx-runnable A11Y-07 gate, exit-1 on any failure, same 0xC0FFEE seed as the test
- `lib/colors.ts` - Added `clampUiContrast` helper + rewired `generateHarmonic` to clamp accent/secondary against bg + derived surface (L-only, hue+chroma preserved)
- `package.json` - Added `"test:stress": "tsx scripts/stress-test-palettes.ts"`

## Decisions Made
- **Tested the real pipeline, not a hypothetical one.** Read `ThemeProvider.tsx` (SET_HARMONIC reducer) + `HarmonicGenerator.tsx` (preview useMemo) — both do exactly `generateHarmonic(mode, src)` then `applyMatrixAdjust(...)` and nothing else. The stress test exercises that identical pipeline, so a green test genuinely proves the user-facing switcher is robust.
- **Fixed `generateHarmonic`, not `applyMatrixAdjust`.** The D-11 invariant ("accent + secondary are NEVER modified by applyMatrixAdjust") is locked and has an explicit regression test (colors.test.ts Test 27). The right place to guarantee accent/secondary AA is at generation time, where hue+chroma intent is set. This keeps D-11 intact.
- **Preset guard iterates all 5 PALETTES** (including the secret Vaporwave), per the plan's note — stronger than only the 4 visible presets.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug / Rule 2 - Missing Critical A11y] generateHarmonic produced sub-AA accent/secondary for pale source colors**
- **Found during:** Task 1 (stress test) — 12 of 40 generated palettes failed `validateFullMatrix` on first run
- **Issue:** `generateHarmonic` builds accent + secondary at the *source color's own lightness* (`l: sourceOklch.l`) against a fixed light bg (`oklch(0.97 ...)`). For medium-to-high-L sources (e.g. `#c6ddbe` L=0.87, `#c7ac34` L=0.75, `#aa862e` L=0.64), accent/secondary contrast against bg/surface fell as low as 1.22 — well below the 3.0 WCAG 1.4.11 UI-component threshold the locked 7-pair matrix (CRITICAL_PAIRS) enforces. `applyMatrixAdjust` (D-11) only shifts text/textMuted, so it could never fix this — meaning the live palette switcher could let a user generate a theme where the accent button is invisible. The function's own docstring claimed "the output passes the 7-pair WCAG matrix (after a downstream applyMatrixAdjust pass)" — which was false for these sources. This is exactly the genuine A11Y-07 finding the plan's Task 1 NOTE anticipated.
- **Fix:** Added `clampUiContrast(uiColor, bg, minRatio=3.0)` — a binary-search on the OKLCh L channel (preserving hue + chroma) that shifts a UI color toward AA against a bg, direction picked from bg.L (mirrors `adjustForAA`'s logic but for the 3.0 UI threshold). `generateHarmonic` now derives the neutrals first (to know the surface L — the binding constraint, ~3% darker than bg on light palettes), then clamps accent and secondary against BOTH bg and surface. Only L moves, so harmonic hue offsets (the secondary's +180/+120/+30/+150 rotation) are untouched.
- **Files modified:** `lib/colors.ts`
- **Verification:** All 29 pre-existing `colors.test.ts` tests stay green (incl. Tests 13-16 secondary-hue-offset and Test 27 accent/secondary-preserved); all 40 generated palettes + 1 preset regression now pass; already-passing sources (`#3366cc`, `#ff0000`) are no-ops (unchanged L); deterministic across two runs.
- **Committed in:** `3c5eb4c` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug / missing-critical-a11y, in-scope — directly in the harmonic path A11Y-07 validates)
**Impact on plan:** The fix is the whole point of A11Y-07 — proving and ensuring the signature WCAG-aware palette stays accessible for any random source. No scope creep; D-11 invariant preserved; no architectural change (a pure-function bug fix honoring the module's own documented contract).

## Issues Encountered
- tsx/node could not resolve `culori` from the OS temp dir during diagnosis — ran throwaway diagnostic scripts from inside the project root instead (node_modules resolution). No impact on deliverables; all temp files removed before committing.

## User Setup Required
None - no external service configuration required. The stress test runs in the normal `npm test` suite; the gate is available via `npm run test:stress`.

## Next Phase Readiness
- A11Y-07 satisfied (automated). The visual "no layout breakage for random palettes" dimension remains a manual HUMAN-UAT browser spot-check (jsdom cannot measure layout) — to be exercised in the 06-04 / 06-05 audit + Lighthouse passes.
- The `generateHarmonic` AA-safety fix hardens the live ThemeProvider/HarmonicGenerator flow, which the 06-04 a11y-audit will render under vitest-axe.
- No blockers.

## Self-Check: PASSED

- FOUND: `lib/colors.stress.test.ts`
- FOUND: `scripts/stress-test-palettes.ts`
- FOUND: `.planning/phases/06-seo-accessibility-polish/06-03-palette-stress-test-SUMMARY.md`
- FOUND commit `3c5eb4c` (Task 1)
- FOUND commit `93ea0f9` (Task 2)
- FOUND `test:stress` script in package.json
- Full suite: 328 passed (44 files) = 287 baseline + 41 new; lint clean; deterministic on repeat run

---
*Phase: 06-seo-accessibility-polish*
*Completed: 2026-05-28*
