---
phase: 04-homepage-sections
plan: 01
subsystem: ui
tags: [hero, gsap, splittext, motion, lenis, scroll, react-19, next-intl, accessibility, reduced-motion]

# Dependency graph
requires:
  - phase: 03-layout-animation-foundation
    provides: LenisProvider (useLenis null contract), ScrollTrigger module-registered, gsap@3.15 + @gsap/react@2.1.2 + motion@12.40 installed, usePrefersReducedMotion canonical hook
  - phase: 04-homepage-sections-00
    provides: Hero.test.tsx RED harness, hero.scrollCue i18n key, Wave 0 page.tsx wiring <Hero /> inside <section id="home">
provides:
  - components/sections/Hero.tsx — 'use client' Hero with GSAP SplitText char-stagger
  - Hero.test.tsx GREEN (11 tests across 5 describe blocks)
  - Pattern 1 (useGSAP({ scope }) + matchMedia + SplitText) precedent for Hero/About/Skills convergence
  - Locale-switch-safe SplitText (Pitfall 4-A) via dependencies array
  - ScrollTrigger.refresh in SplitText.onSplit (Pitfall 4-D) — downstream About/Skills triggers see fresh layout
  - HOME-01 requirement satisfied
affects: [04-02-about, 04-04-skills, 04-03-projects, 04-05-contact, 05-content, 06-polish, 07-deploy]

# Tech tracking
tech-stack:
  added: []  # no new npm installs; everything was in place from Phases 1-3 + Wave 0
  patterns:
    - "Pattern 1: useGSAP({ scope, dependencies: [t(i18n keys)] }) wrapping gsap.matchMedia branches — full motion timeline vs reduced motion gsap.set"
    - "Pitfall 4-A: pass i18n strings as useGSAP dependencies so SplitText re-runs on locale switch (next-intl FR/EN flip)"
    - "Pitfall 4-D: SplitText.onSplit → ScrollTrigger.refresh() so downstream sections snapshot fresh positions after Hero's char-div injection"
    - "Lenis CTA pattern: useLenis()-null-check → lenis.scrollTo(target, { offset, duration }) → scrollIntoView fallback"

key-files:
  created:
    - components/sections/Hero.tsx
    - .planning/phases/04-homepage-sections/04-01-hero-PLAN.md
  modified:
    - components/sections/Hero.test.tsx

key-decisions:
  - "Hero component renders <div ref={heroRef}> not <section> — parent page.tsx already provides <section id='home'>; Hero is a leaf block (D-07 refinement)"
  - "Module-scope gsap.registerPlugin(SplitText) over inside-component registration — idempotent, mirrors LenisProvider's ScrollTrigger pattern"
  - "useGSAP dependencies array carries [t('name'), t('role')] — re-runs the entire matchMedia + SplitText pipeline on locale switch (Pitfall 4-A structural mitigation)"
  - "ScrollTrigger.refresh() called from SplitText.onSplit callback — deterministic Pitfall 4-D mitigation, not relying on document.fonts.ready timing"
  - "Reduced-motion path uses gsap.set() inside matchMedia branch, not a separate code path — same DOM structure, same data-hero-* sentinels, same SplitText chars exist for AT consistency"
  - "Belt-and-suspenders SplitText.revert() in matchMedia cleanup return — useGSAP auto-reverts on unmount but matchMedia can tear down independently when OS reduced-motion toggles at runtime"
  - "usePrefersReducedMotion (project canonical hook from Phase 2) over motion's useReducedMotion — explicit boolean, avoids Pitfall 4-B null-on-SSR; also drives the ChevronDown bounce loop"
  - "5 describe blocks / 11 it() cases (plan asked ≥4 / ≥6) — extra coverage on defensive #projects-absent path + localized scroll-cue aria-label rendering"

patterns-established:
  - "Phase 4 sections that need GSAP timeline + i18n text-content awareness MUST pass i18n strings in the useGSAP dependencies array"
  - "When a section creates SplitText, it MUST call ScrollTrigger.refresh() in onSplit so peer sections registered AFTER mount snapshot fresh positions"
  - "All animated text MUST stay rendered statically at final position in SSR — the GSAP timeline tweens FROM 0→1 not 1→0, so initial paint is layout-stable (CLS 0)"

requirements-completed: [HOME-01]

# Metrics
duration: ~4m 5s
completed: 2026-05-27
---

# Phase 4 Plan 01: Hero Section Summary

**GSAP SplitText char-stagger Hero with name/role/tagline/CTA + Lenis-bridged scroll-to-projects + reduced-motion-gated ChevronDown bounce cue, all locale-switch-safe via useGSAP dependencies array**

## Performance

- **Duration:** ~4m 5s (well under 25-35 min estimate)
- **Started:** 2026-05-27T18:49:28Z
- **Completed:** 2026-05-27T18:53:33Z
- **Tasks:** 2 (both committed atomically)
- **Files modified:** 3 (Hero.tsx new, Hero.test.tsx extended, 04-01-hero-PLAN.md new for traceability)
- **Tests:** 11/11 GREEN (Wave 0 RED harness turned GREEN + 9 new acceptance assertions)
- **Lint:** clean
- **Color-literal gate:** zero `oklch(`, `rgb(`, `hsl(`, `#XXXXXX` in Hero.tsx

## Accomplishments

- **HOME-01 shipped.** Hero renders the bilingual identity (name "Tanguy", role "Tech × Design × BIM"), localized tagline + CTA, and a scroll cue from `hero.*` i18n keys. Above-the-fold first-impression is in place.
- **GSAP SplitText timeline composed.** Name 0.04s/char, role 0.025s/char (overlapped via `-=0.3` time offset), tagline opacity fade at 0.8s, CTA + scroll cue at 1.0s — total Hero reveal completes in <1.2s.
- **Reduced-motion semantics correct.** `gsap.matchMedia()` gates both branches: full motion runs the timeline; reduced motion snaps to final state via `gsap.set([...], { opacity: 1, y: 0 })`. The same 5 data-hero-* targets exist in both modes so screen readers and DOM queries are consistent.
- **Lenis CTA wired with fallback.** `useLenis()?.scrollTo(target, { offset: -64, duration: 1.0 })` when Lenis is available; `target.scrollIntoView({ behavior: 'smooth', block: 'start' })` fallback when Lenis is null (reduced-motion users, pre-hydration, etc.).
- **ChevronDown scroll cue animated.** motion.div with `y: [0, 8, 0]` 2s ease-in-out infinite loop under full motion; `animate={undefined}` and `transition={undefined}` under reduced motion (no animation prop applied). aria-label localized via `hero.scrollCue`.
- **Pitfall 4-A & 4-D structurally mitigated.** Locale-switch re-runs the entire matchMedia + SplitText pipeline because `t('name')` and `t('role')` are in the useGSAP `dependencies` array. SplitText's `onSplit` callback fires `ScrollTrigger.refresh()` so downstream About/Skills triggers (Wave 1 siblings) see Hero's post-split height.

## Task Commits

Each task was committed atomically with `--no-verify` per parallel_execution protocol:

1. **Task 1: Implement Hero component** — `183b492` (feat)
   - Created components/sections/Hero.tsx (189 lines)
   - Created .planning/phases/04-homepage-sections/04-01-hero-PLAN.md (traceability)
   - 678 insertions, 0 deletions
2. **Task 2: Expand Hero.test.tsx with full HOME-01 acceptance assertions** — `e6e9bda` (test)
   - Extended components/sections/Hero.test.tsx from 2 tests → 11 tests
   - 242 insertions, 25 deletions

_Note: this plan is `tdd="true"` on Task 1, but the RED phase was already shipped in Wave 0 (04-00-assets-and-stubs Task 7). My Task 1 is the GREEN phase only — implementing against the existing failing harness. Task 2 is the additional REFACTOR/expansion of the test suite to cover the full acceptance contract beyond the initial smoke checks._

## Files Created/Modified

- `components/sections/Hero.tsx` — **NEW.** 'use client' Hero component. Exports named `Hero`. Module-scope `gsap.registerPlugin(SplitText)`. useGSAP({ scope: heroRef, dependencies: [t('name'), t('role')] }) wraps gsap.matchMedia with full/reduced branches. CTA onClick: lenis.scrollTo path + scrollIntoView fallback. 5 data-hero-* sentinels (name/role/tagline/cta/cue). All colors via Tailwind utilities backed by `--color-*` tokens (text-foreground, text-primary, text-muted-foreground) — zero color literals.
- `components/sections/Hero.test.tsx` — **EXTENDED.** Wave 0 ship had 1 describe / 2 tests. Now 5 describes / 11 tests covering i18n rendering, useGSAP wiring (scope + dependencies), CTA Lenis-path + scrollIntoView fallback + defensive no-op, matchMedia full vs reduced branches, and data-hero-* sentinel presence + module-load SplitText registration.
- `.planning/phases/04-homepage-sections/04-01-hero-PLAN.md` — **NEW (committed).** The plan file was committed alongside Task 1 to record traceability between the planning artifact and the executed code.

## Decisions Made

- **Hero is a leaf `<div>`, not a `<section>`.** page.tsx already wraps `<Hero />` in `<section id="home" className="flex min-h-screen items-center justify-center">`. Adding a nested `<section>` would create two landmarks for the same region. The Hero component uses `<div ref={heroRef} className="w-full">` to provide the GSAP scope without duplicating the landmark. (Plan explicitly flagged this decision under Task 1 behavior; documented here for downstream awareness.)
- **Module-scope `gsap.registerPlugin(SplitText)` over function-scope.** Mirrors LenisProvider's ScrollTrigger registration pattern. `registerPlugin` is idempotent so re-imports across HMR / Strict-Mode double-mount don't cause issues.
- **useGSAP dependencies array carries i18n strings, not just locale.** Reading `t('name')` and `t('role')` directly (instead of `locale`) is more semantically tight — it tracks the actual text content that SplitText splits, not just the language code. Identical effect in practice but makes the dependency relationship self-documenting.
- **`usePrefersReducedMotion` (project canonical) over `motion/react`'s `useReducedMotion`.** The project hook returns explicit boolean (false on SSR) and uses `useSyncExternalStore` per React 19 best practice. motion's hook returns `null | boolean` and would trigger Pitfall 4-B if used naively. Reuses Phase 2 W1 infrastructure.
- **Bounce animation duration: 2s.** Matches D-07 spec ("gentle bounce"). 8px peak amplitude — large enough to read as motion, small enough not to compete with the SplitText reveal that completes ~1.2s prior.
- **CTA falls back to `scrollIntoView({ behavior: 'smooth', block: 'start' })`, not `instant`.** Even under reduced-motion (when Lenis is null), users still expect the page to glide to the target. The browser respects OS-level reduced-motion by suppressing the smooth-scroll automatically — so `behavior: 'smooth'` becomes `behavior: 'auto'` at the platform level. Best of both worlds.

## Deviations from Plan

None — plan executed exactly as written, with one minor self-discovered nuance during Task 2 testing.

### Self-discovered nuance during Task 2 (not a deviation, but worth noting)

The initial Task 2 test for "registers the SplitText plugin at module load" failed because `registerPluginSpy.mockReset()` ran in `beforeEach()`, wiping the history of the one-time module-load side effect that fires when `./Hero` is first imported. Fix: removed `registerPluginSpy` from the `beforeEach` reset list and documented why with an inline comment. The module is cached across tests in the same file (Vitest default), so the registration fires exactly once and the spy carries the call across all tests. This is correct behavior — the plugin SHOULD only register once per process.

No code change was needed in Hero.tsx; only the test harness was adjusted to correctly assert the module-load side effect.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Wave 1 parallel siblings (04-02 About, 04-04 Skills, 04-05 Contact) all running concurrently in their own scopes; no file overlap with my Hero work confirmed via `git show --stat` on my two commits.
- Wave 2 (04-03 Projects) will land after Wave 1 closes. The `#projects` section target that the Hero CTA scrolls to is the Phase 4 Wave 0 stub `<section id="projects">` (Wave 2 fills the body with `<ProjectsSection />`).
- Pattern 1 (useGSAP({ scope, dependencies }) + gsap.matchMedia + SplitText/ScrollTrigger creation inside the matchMedia callback) is now battle-tested in Hero and ready for About / Skills to reuse.
- ScrollTrigger.refresh() in SplitText.onSplit ensures downstream About + Skills ScrollTrigger reveals will snapshot Hero's post-split height correctly — Pitfall 4-D is closed at the source, not deferred to each consumer.
- HOME-01 ✅. Phase 4 progress: 2/7 plans complete (04-00 + 04-01).

---

## Self-Check: PASSED

**Created files verified on disk:**
- `components/sections/Hero.tsx` — FOUND
- `components/sections/Hero.test.tsx` — FOUND (extended)
- `.planning/phases/04-homepage-sections/04-01-hero-PLAN.md` — FOUND
- `.planning/phases/04-homepage-sections/04-01-hero-SUMMARY.md` — FOUND (this file)

**Commits verified in git log:**
- `183b492` — feat(04-01): implement Hero section with GSAP SplitText reveal — FOUND
- `e6e9bda` — test(04-01): expand Hero.test.tsx to full HOME-01 acceptance contract — FOUND

**Acceptance gates verified:**
- `'use client'` directive: PRESENT (line 1)
- `useGSAP` call with `scope: heroRef` AND `dependencies: [t('name'), t('role')]`: PRESENT
- `gsap.registerPlugin(SplitText)` at module load: PRESENT
- `gsap.matchMedia()` reduced-motion gate: PRESENT
- `nameSplit.revert()` + `roleSplit.revert()` in matchMedia cleanup: PRESENT
- `useLenis()` null-check + `lenis.scrollTo(target, { offset: -64 ... })`: PRESENT
- `scrollIntoView` fallback: PRESENT
- `ChevronDown` from lucide-react + motion.div with `y: [0, 8, 0]`: PRESENT
- 5 data-hero-* attributes (name/role/tagline/cta/cue): PRESENT
- `usePrefersReducedMotion` import + usage: PRESENT
- `ScrollTrigger.refresh()` in SplitText.onSplit (Pitfall 4-D): PRESENT
- Named export `Hero` (not default): PRESENT
- Zero color literals: VERIFIED
- 11/11 tests GREEN: VERIFIED via `npx vitest run components/sections/Hero.test.tsx`
- ESLint clean: VERIFIED via `npm run lint`
- TypeScript: Hero.tsx + Hero.test.tsx compile clean (unrelated TS errors in 04-02/03/04/05 sibling work are outside my scope per parallel_execution boundary)

---
*Phase: 04-homepage-sections*
*Plan: 01-hero*
*Completed: 2026-05-27*
