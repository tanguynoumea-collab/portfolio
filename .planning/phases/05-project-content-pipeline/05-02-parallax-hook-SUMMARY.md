---
phase: 05-project-content-pipeline
plan: 02
subsystem: ui
tags: [gsap, scrolltrigger, parallax, useGSAP, matchMedia, prefers-reduced-motion, react-hook]

# Dependency graph
requires:
  - phase: 03-layout-animation-foundation
    provides: "LenisProvider module-load gsap.registerPlugin(ScrollTrigger) + gsap.ticker single-RAF bridge (ScrollTrigger reads Lenis scroll automatically)"
  - phase: 04-homepage-sections
    provides: "About.tsx useGSAP({scope}) + gsap.matchMedia dual-branch pattern + About.test.tsx MatchMediaController test scaffold"
provides:
  - "lib/hooks/useParallax.ts — reusable cover-image parallax hook (factor + maxTranslate + matchMedia reduced-motion gate)"
  - "useParallax(ref, { factor=0.3, maxTranslate=50 }) → installs ScrollTrigger scrub:0.5 on [data-parallax-image] under full motion, gsap.set y:0 under reduced motion"
affects: [05-03-project-page, ProjectCover, ANIM-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reusable GSAP hook: useGSAP({ scope, dependencies }) wrapping gsap.matchMedia dual-branch, side-effect-only ScrollTrigger import (no re-registration)"
    - "MatchMediaController test extended with toSpy alongside setSpy to drive both gsap.to (full) and gsap.set (reduced) branches deterministically"

key-files:
  created:
    - lib/hooks/useParallax.ts
    - lib/hooks/useParallax.test.tsx
  modified: []

key-decisions:
  - "Hook authored verbatim from 05-RESEARCH.md Code Example #2 — no improvisation on the D-05 ScrollTrigger config"
  - "factor param accepted in signature (D-13 contract) but unused in current impl; maxTranslate drives the y translate directly; documented inline"
  - "Reworded the registration doc-comment to drop the literal token 'registerPlugin' for acceptance-grep literal compliance (Phase 3/4 precedent) — the must-have 'never calls registerPlugin' is structurally true (only side-effect import 'gsap/ScrollTrigger')"

patterns-established:
  - "Parallax reduced-motion gate is single-source-of-truth inside the hook — consumers (ProjectCover) never re-implement the matchMedia branch"
  - "Defensive: missing ctx.conditions treated as reduced (snap y:0, no ScrollTrigger)"

requirements-completed: [ANIM-02]

# Metrics
duration: 7min
completed: 2026-05-28
---

# Phase 5 Plan 02: Parallax Hook Summary

**Reusable `useParallax` hook — GSAP ScrollTrigger scrub:0.5 cover-image parallax inside `useGSAP({ scope })`, fully gated by `gsap.matchMedia` so reduced-motion snaps the image to y:0 with zero ScrollTrigger, never re-registering the plugin (LenisProvider owns it).**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-05-28T07:18:00Z
- **Completed:** 2026-05-28T07:25:00Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2 (both created)

## Accomplishments
- Shipped `lib/hooks/useParallax.ts` satisfying ANIM-02 (hook half) and D-13 — verbatim from 05-RESEARCH.md Code Example #2.
- Full-motion branch: `gsap.to('[data-parallax-image]', { y: -maxTranslate, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.5 } })`.
- Reduced-motion branch: `gsap.set('[data-parallax-image]', { y: 0 })` — no ScrollTrigger created.
- 10 dual-branch tests green via the MatchMediaController pattern (extended with `toSpy`). Full suite 267 passing (257 baseline + 10), lint clean.
- Zero new dependencies; the hook inherits the Phase 3 LenisProvider `gsap.ticker` bridge automatically (no scroller-proxy).

## Task Commits

Each task was committed atomically (TDD test → feat):

1. **Task 1 (RED): failing dual-branch test for useParallax** - `b7ede5f` (test)
2. **Task 1 (GREEN): implement useParallax hook** - `76a6a30` (feat)

**Plan metadata:** (final docs commit — this SUMMARY + STATE + ROADMAP)

_Note: REFACTOR step skipped — the verified verbatim hook needed no cleanup._

## Files Created/Modified
- `lib/hooks/useParallax.ts` - Reusable parallax hook: `useGSAP({ scope: ref, dependencies: [maxTranslate] })` + `gsap.matchMedia` dual-branch; side-effect-only `import 'gsap/ScrollTrigger'`; no `any`; selector is the `[data-parallax-image]` data attribute (Pitfall 5D), never a bare `'img'`.
- `lib/hooks/useParallax.test.tsx` - 10 tests across 5 behavior groups: matchMedia registration (both queries, exactly once), full-motion (scrub:0.5 config + custom maxTranslate + no gsap.set), reduced-motion (y:0 + no gsap.to + defensive missing-conditions), never-registerPlugin, useGSAP scope lifecycle (runs once, unmount no-throw). Native chai matchers, no jest-dom.

## Decisions Made
- **Authored from canonical research:** the hook body matches 05-RESEARCH.md §"Code Examples" #2 exactly, including the `isReduced`/`isFull` query keys that make the About.test.tsx MatchMediaController pattern transfer 1:1.
- **`factor` kept but unused:** D-13 mandates the `{ factor?, maxTranslate? }` signature. Current impl uses `maxTranslate` directly (the 50px clamp). `factor` is reserved for future tuning and documented inline so the contract holds without dead-logic confusion.
- **Doc-comment literal compliance:** rewrote the opening comment from "gsap.registerPlugin(ScrollTrigger) is already done..." to "ScrollTrigger plugin registration is already done..." so a literal `grep registerPlugin` returns zero — matching the Phase 3/4 acceptance-grep-literal precedent. Behavior unchanged (the hook genuinely never registers).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Acceptance-grep literal compliance] Removed literal `registerPlugin` token from doc comment**
- **Found during:** Task 1 (GREEN, post-implementation acceptance verification)
- **Issue:** The verbatim research comment contained the string `gsap.registerPlugin(ScrollTrigger) is already done...`. The acceptance criterion "lib/hooks/useParallax.ts does NOT contain 'registerPlugin'" is a literal grep; the explanatory comment would have failed it even though no call exists.
- **Fix:** Reworded the comment to "ScrollTrigger plugin registration is already done at LenisProvider module load (Phase 3 D-11)." No code change; the only `gsap/ScrollTrigger` usage remains the side-effect-only import.
- **Files modified:** lib/hooks/useParallax.ts
- **Verification:** `grep registerPlugin lib/hooks/useParallax.ts` → 0 occurrences; 10 tests still green; lint clean.
- **Committed in:** `76a6a30` (Task 1 GREEN commit — edit applied before commit)

---

**Total deviations:** 1 auto-fixed (1 acceptance-grep literal compliance)
**Impact on plan:** Cosmetic comment wording only; preserves the documented "registration owned by LenisProvider" intent while satisfying the literal grep gate. No scope creep, no behavior change.

## Issues Encountered
None. RED failed as expected (module-not-found before the hook existed); GREEN passed on first implementation run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ANIM-02 hook half is done. Wave 2's `05-03-project-page-PLAN.md` can now build `components/sections/ProjectCover.tsx` (`'use client'` island) that wraps the cover `next/image` in a `ref` and calls `useParallax(ref)` on a `[data-parallax-image]`-tagged image.
- Wave 1 parallel-safety confirmed: this plan touched ONLY `lib/hooks/*` — zero overlap with 05-01 (`components/mdx/*` + `mdx-components.tsx`).
- No blockers.

## Self-Check: PASSED

---
*Phase: 05-project-content-pipeline*
*Completed: 2026-05-28*
