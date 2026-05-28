---
phase: 06-seo-accessibility-polish
plan: 04
subsystem: testing
tags: [vitest-axe, axe-core, accessibility, wcag, reduced-motion, next-image, focus-visible]

# Dependency graph
requires:
  - phase: 06-00-install-audit-deps
    provides: vitest-axe@1.0.0-pre.5 + vitest-setup.ts toHaveNoViolations matcher + vitest-axe.d.ts
  - phase: 06-01-metadata-seo
    provides: surfaces under audit exist (sections render in the app)
  - phase: 06-02-route-states
    provides: not-found.tsx + error.tsx (two of the 8 axe surfaces)
provides:
  - 8 vitest-axe *.a11y.test.tsx surfaces asserting zero violations (color-contrast disabled, all other rules active)
  - global :focus-visible ring in globals.css via var(--ring) (WCAG 2.4.7)
  - prefers-reduced-motion CSS safety net in globals.css
  - scripts/check-reduced-motion.ts executable gate (exit-0 contract)
  - scripts/check-image-audit.ts executable gate (exit-0 contract)
  - check:reduced-motion + check:images npm scripts
affects: [06-05-lighthouse, deployment, phase-07-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "*.a11y.test.tsx co-located beside *.test.tsx — reuse the unit test's mock shape so the surface renders identically; only the assertion differs (axe vs structural)"
    - "axe(container, { rules: { 'color-contrast': { enabled: false } } }) — disable ONLY color-contrast (jsdom can't compute it); contrast covered by validateFullMatrix (A11Y-07) + Lighthouse (A11Y-08)"
    - "Static grep gates (check-reduced-motion / check-image-audit) follow the check-i18n-parity.ts exit-0/1 contract — walk dirs, collect failures, process.exit(1)"
    - "Reduced-motion guard contract extended: every motion.* animate + every gsap animation API gates on useReducedMotion / usePrefersReducedMotion / gsap.matchMedia in the SAME file"

key-files:
  created:
    - components/sections/Hero.a11y.test.tsx
    - components/sections/About.a11y.test.tsx
    - components/sections/ProjectsSection.a11y.test.tsx
    - components/sections/Skills.a11y.test.tsx
    - components/sections/Contact.a11y.test.tsx
    - components/theme/PaletteFab.a11y.test.tsx
    - app/[locale]/not-found.a11y.test.tsx
    - app/[locale]/error.a11y.test.tsx
    - scripts/check-reduced-motion.ts
    - scripts/check-image-audit.ts
  modified:
    - app/globals.css
    - package.json
    - components/sections/CategoryFilter.tsx
    - components/layout/LanguageSwitcher.tsx
    - components/sections/Contact.tsx
    - components/mdx/CodeBlock.tsx
    - components/sections/ProjectGrid.tsx

key-decisions:
  - "Audited 8 surfaces via PaletteFab (icon-only-button accessible-name proof) instead of the open-state PaletteSwitcher Sheet — the Radix portal is hard in jsdom; the Sheet focus-trap/Esc stays covered by Phase 2 tests + HUMAN-UAT"
  - "ProjectsSection a11y test renders the REAL CategoryFilter/ProjectGrid/ProjectCard child tree (mocking only leaf libs) so axe checks real Card/Badge/link/image-alt markup, not stubs"
  - "About + ProjectsSection mock next/image to a REAL <img> (not a string dump) so axe's image-alt rule is genuinely exercised"
  - "Reduced-motion CSS net flattens the ARCH-04 global 400ms color transition to instant under reduced motion — accepted tradeoff (palette swaps become instant)"

patterns-established:
  - "a11y surface test = unit-test mocks + axe(container, color-contrast off) + toHaveNoViolations"
  - "Gate scripts are executable (RUN + exit 0), not file-existence assertions"

requirements-completed: [A11Y-04, A11Y-05, A11Y-06]

# Metrics
duration: 13min
completed: 2026-05-28
---

# Phase 6 Plan 04: Accessibility Audit Summary

**8 vitest-axe surfaces assert zero violations (color-contrast off, accessible-name rules on), a global `:focus-visible` ring via `var(--ring)`, and two executable static gates (`check-reduced-motion`, `check-image-audit`) that RUN and exit 0 — the reduced-motion gate caught and fixed 5 real ungated `motion` animations.**

## Performance

- **Duration:** ~13 min
- **Started:** 2026-05-28T12:13Z
- **Completed:** 2026-05-28T12:26Z
- **Tasks:** 3
- **Files modified/created:** 17 (10 created, 7 modified)

## Accomplishments
- A11Y-04: 8 key surfaces (Hero, About, ProjectsSection, Skills, Contact, PaletteFab, not-found, error) pass axe `toHaveNoViolations` with ONLY `color-contrast` disabled; the icon-only PaletteFab proves accessible-name coverage (axe `button-name` rule active).
- A11Y-04 / D-11: global `:focus-visible` ring added to `globals.css` using `outline: 2px solid var(--ring)` (repaints live on palette switch, no hardcoded color) + a `prefers-reduced-motion` CSS safety net.
- A11Y-05: `scripts/check-reduced-motion.ts` static gate RUNS and exits 0 — every animating file now has a reduced-motion guard (5 real gaps fixed, see Deviations).
- A11Y-06: `scripts/check-image-audit.ts` static gate RUNS and exits 0 — every `<Image>`/`<NextImage>`/`<MDXImage>` has `fill` or `width`+`height`; no bare `<img>`.
- Full suite **336/336** green (328 baseline + 8 new a11y tests); lint clean; all 3 gates (reduced-motion, image, i18n-parity) exit 0; `npm run build` exit 0.

## Task Commits

Each task was committed atomically:

1. **Task 1: focus-visible ring + check-reduced-motion.ts + check-image-audit.ts (run, exit 0)** - `6928bcf` (feat)
2. **Task 2: vitest-axe a11y tests for the 5 homepage sections** - `b0687b7` (test)
3. **Task 3: a11y tests for PaletteFab + not-found + error; full-suite + lint + gates green** - `bafc84e` (test)

**Plan metadata:** (this commit — docs)

## Files Created/Modified
- `components/sections/{Hero,About,ProjectsSection,Skills,Contact}.a11y.test.tsx` - axe zero-violation surfaces for the 5 homepage sections
- `components/theme/PaletteFab.a11y.test.tsx` - icon-only-button accessible-name proof (button-name rule active)
- `app/[locale]/{not-found,error}.a11y.test.tsx` - axe surfaces for the route-state pages
- `scripts/check-reduced-motion.ts` - A11Y-05 grep gate (animating file ⇒ reduced-motion guard; `process.exit(1)` on gap)
- `scripts/check-image-audit.ts` - A11Y-06 grep gate (every Image sized; no bare `<img>`; `process.exit(1)` on violation)
- `app/globals.css` - global `:focus-visible` ring + `@media (prefers-reduced-motion: reduce)` net
- `package.json` - `check:reduced-motion` + `check:images` npm scripts
- `components/sections/CategoryFilter.tsx`, `components/layout/LanguageSwitcher.tsx`, `components/sections/Contact.tsx`, `components/mdx/CodeBlock.tsx`, `components/sections/ProjectGrid.tsx` - reduced-motion guards added (gate-driven fixes)

## Decisions Made
- **PaletteFab over open-state PaletteSwitcher** as the icon-only axe target — the Sheet's Radix portal is unreliable in jsdom; the FAB cleanly covers the accessible-name requirement, and the Sheet's focus-trap/Esc is already covered by Phase 2 tests + manual HUMAN-UAT.
- **ProjectsSection renders its real child tree** (CategoryFilter → ProjectGrid → ProjectCard → shadcn Card/Badge + Link + next/image) so axe verifies the real accessible markup, not stub placeholders.
- **next/image mocked to a real `<img>`** in About + ProjectsSection a11y tests so the `image-alt` rule is genuinely exercised.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Closed 5 ungated `motion` animations flagged by check-reduced-motion**
- **Found during:** Task 1 (running the new reduced-motion gate — AUDIT-FIRST step)
- **Issue:** The gate (correctly, per D-12) found 5 files with `motion` animate APIs and NO reduced-motion guard — a real WCAG 2.3.3 / A11Y-05 gap left by earlier phases: `CategoryFilter.tsx` + `LanguageSwitcher.tsx` (shared-element `layoutId` spring morph), `Contact.tsx` + `CodeBlock.tsx` (Copy↔Check icon-swap scale/opacity), `ProjectGrid.tsx` (filter enter/exit + `layout` reflow).
- **Fix:** Added `useReducedMotion()` (from `motion/react`) to each; under reduced motion the layout morph drops `layoutId` + uses `{ duration: 0 }`, the icon swaps drop their tween props, and the grid disables `layout` + per-card enter/exit. The plan/STATE explicitly required the gate to exit 0 by fixing real gaps (not weakening the regex).
- **Files modified:** CategoryFilter.tsx, LanguageSwitcher.tsx, Contact.tsx, CodeBlock.tsx, ProjectGrid.tsx (+ their `.test.tsx` mocks gained a `useReducedMotion: () => false` export so the existing full-motion assertions stay green)
- **Verification:** `tsx scripts/check-reduced-motion.ts` exits 0; the 5 components' unit tests (39) stay green.
- **Committed in:** `6928bcf` (Task 1 commit)

**2. [Rule 1 - Bug / Documented false positive] Tuned check-image-audit regex to skip a prose `<Image>` in a JSDoc comment**
- **Found during:** Task 1 (AUDIT-FIRST run of the image gate)
- **Issue:** The gate tripped on `components/mdx/Image.tsx` because its module JSDoc contains the prose reference `* <Image> MDX component …` — a false positive (a real next/image usage always has attributes), exactly the case 06-RESEARCH §12 says to tune narrowly.
- **Fix:** Required whitespace after the element name (`<(?:Image|NextImage|MDXImage)\s…`) so a bare prose `<Image>` is not matched; the two real `<NextImage>` usages (both `width`+`height`) still match and pass.
- **Files modified:** scripts/check-image-audit.ts
- **Verification:** `tsx scripts/check-image-audit.ts` exits 0; debug confirmed the 3 regex hits are the prose `<Image>` (now excluded) + 2 sized `<NextImage>`.
- **Committed in:** `6928bcf` (Task 1 commit)

**3. [Rule 3 - Blocking] Dropped redundant dotAll `s` regex flag (broke `next build` TS type-check)**
- **Found during:** Task 3 (`npm run build` final verification)
- **Issue:** `next build`'s TypeScript check covers `scripts/**`; the `s` (dotAll) flag on the image-audit regex requires tsconfig `target` ≥ es2018, but the project targets `ES2017` → `Type error: This regular expression flag is only available when targeting 'es2018' or later`.
- **Fix:** Removed the `s` flag. The regex uses `[^>]*` (a negated char class that already spans newlines), so dropping `s` is behavior-preserving — no tsconfig change needed (changing `target` would have been an unwarranted architectural change).
- **Files modified:** scripts/check-image-audit.ts
- **Verification:** image gate still exits 0; `npm run build` exits 0.
- **Committed in:** `bafc84e` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 missing-critical, 1 bug/false-positive, 1 blocking)
**Impact on plan:** All necessary for correctness. Deviation #1 is the AUDIT producing real findings (exactly the gate's purpose) and meaningfully improves reduced-motion coverage. #2 and #3 are gate-script robustness. No scope creep — no new features.

## Issues Encountered
- Adding `useReducedMotion` to 5 source components broke the matching `*.test.tsx` files that mock `motion/react` without exporting that hook — resolved by adding `useReducedMotion: () => false` to each mock (default false = full motion, so existing layoutId/popLayout/icon-swap assertions stay valid). LanguageSwitcher's test does not mock `motion/react`, so it uses the real (jsdom-safe) hook unchanged.

## Known Stubs
None — no stub/placeholder data introduced. The PaletteSwitcher-mocked-to-null in PaletteFab.a11y.test.tsx is a test isolation choice (the FAB button is the audit target), not a product stub.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- A11Y-04/05/06 audit coverage complete and executable in `npm test` + `npm run check:*`. Ready for 06-05 (local Lighthouse vs prod build).
- Manual HUMAN-UAT still owed (per 06-VALIDATION.md): keyboard Tab cycle + focus order + Esc-close on PaletteSwitcher + screen-reader live-region announce (jsdom cannot verify these).

## Self-Check: PASSED

- All 10 created files + SUMMARY.md verified present on disk.
- All 3 task commit hashes (`6928bcf`, `b0687b7`, `bafc84e`) verified in git history.

---
*Phase: 06-seo-accessibility-polish*
*Completed: 2026-05-28*
