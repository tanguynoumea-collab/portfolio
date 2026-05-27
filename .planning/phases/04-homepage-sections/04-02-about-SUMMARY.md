---
phase: 04-homepage-sections
plan: 02
subsystem: ui
tags: [react, gsap, scrolltrigger, next-image, next-intl, vitest, animation, reduced-motion]

# Dependency graph
requires:
  - phase: 03-layout-animation-foundation
    provides: LenisProvider with module-load ScrollTrigger registration + Lenis ↔ ScrollTrigger bridge + Inter font swap + ScrollTrigger.refresh on font-ready
  - phase: 04-homepage-sections
    provides: Wave 0 placeholder /public/about-photo.jpg + about.paragraphs.{1,2} bilingual i18n keys + page.tsx [locale] section wiring (<About /> mounted inside <section id="about">) + RED About.test.tsx harness
provides:
  - About section component (HOME-02) rendering title + 2 i18n paragraphs + lazy next/image portrait
  - Photo slide-in (x:-40) and paragraph stagger (y:30, 0.15s) ScrollTrigger reveal under prefers-reduced-motion gate via gsap.matchMedia
  - Vitest acceptance suite covering i18n rendering, next/image attributes, ScrollTrigger config, reduced-motion gate, data-attribute selectors (13 tests, 5 describe blocks)
affects: [04-03-projects, 04-04-skills, phase-05-content, phase-06-polish-a11y]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ScrollTrigger via useGSAP({ scope: ref }) inside Lenis-bridged provider tree — no re-registration, trust the LenisProvider bridge"
    - "gsap.matchMedia({ isFull, isReduced }) two-branch reduced-motion gate inside useGSAP — timeline under full-motion, gsap.set to final state under reduced"
    - "Side-effect-only `import 'gsap/ScrollTrigger'` for TS type merging into gsap.timeline scrollTrigger config (LenisProvider does the actual registerPlugin)"
    - "next/image lazy below-the-fold pattern: width/height + loading=lazy + priority=false + placeholder=blur + explicit blurDataURL"
    - "Vitest mock pattern: MatchMediaController captures the matchMedia callback so both motion branches can be exercised deterministically from a single render"

key-files:
  created:
    - components/sections/About.tsx
  modified:
    - components/sections/About.test.tsx

key-decisions:
  - "ScrollTrigger plugin registration delegated to LenisProvider (module load) — About.tsx uses side-effect-only `import 'gsap/ScrollTrigger'` for type merging only"
  - "Reduced-motion branch uses a single combined selector `[data-about-photo], [data-about-paragraph]` in gsap.set for both the photo and paragraphs"
  - "Stagger offset `-=0.4` causes the paragraph stagger to begin while the photo slide-in is still settling — overlap creates the cohesive reveal feel without two distinct entrance moments"
  - "MatchMediaController test pattern over gsap.matchMedia stub: captures the registered callback + queries so the test can invoke it explicitly with either { isFull: true } or { isFull: false } conditions"

patterns-established:
  - "Section-component shape: 'use client' → useRef → useTranslations → useGSAP({ scope }) with gsap.matchMedia gate → render with data-* selectors targeted by the GSAP timeline. Phase 4 plans 04-04 (Skills) and any future ScrollTrigger-revealed sections will mirror this exact shape."
  - "Test harness shape: mock @gsap/react + gsap + gsap/ScrollTrigger + next/image + next-intl; capture matchMedia callback via a controller object; serialize next/image props to a string stub for attribute assertions via container.textContent regex matches."

requirements-completed: [HOME-02]

# Metrics
duration: 4min
completed: 2026-05-27
---

# Phase 4 Plan 02: About Section Summary

**About section ships HOME-02 with a 2-col desktop / stacked mobile layout, lazy next/image portrait, and a ScrollTrigger slide+stagger reveal gated by gsap.matchMedia for reduced-motion.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-27T18:48:59Z
- **Completed:** 2026-05-27T18:52:13Z
- **Tasks:** 2
- **Files modified:** 2 (1 created + 1 extended)

## Accomplishments

- About.tsx component (HOME-02) implements the 2-col desktop (md:grid-cols-3 — photo col-span-1, bio col-span-2) / stacked mobile layout with next/image 400x500 portrait (loading=lazy, priority=false, placeholder=blur with explicit blurDataURL), title (h2) plus 2 paragraphs from the i18n keys about.title / about.paragraphs.1 / about.paragraphs.2.
- ScrollTrigger reveal wired via useGSAP({ scope: aboutRef }): photo slides from x:-40 (0.7s power2.out), paragraphs stagger from y:30 (0.6s, 0.15s stagger, power2.out) with -0.4s overlap. Trigger fires at `start: 'top 75%'` with `toggleActions: 'play none none reverse'` (plays on enter, reverses on leave-back).
- gsap.matchMedia two-branch gate: full-motion runs the timeline, reduced-motion calls gsap.set on the combined selector with { opacity:1, x:0, y:0 } — elements render at their final state without animation. ScrollTrigger plugin already registered by LenisProvider at module load (Phase 3 contract); About uses a side-effect-only `import 'gsap/ScrollTrigger'` for the TS type merge into gsap.timeline only.
- About.test.tsx Vitest suite expanded from the Wave 0 RED single-assertion harness to 13 tests across 5 describe blocks covering: i18n rendering (title + paragraphs + h2 semantic), next/image attributes (width=400 height=500 placeholder=blur blurDataURL loading=lazy priority=false src=/about-photo.jpg), GSAP reveal configuration (matchMedia queries + timeline scrollTrigger start/toggleActions), reduced-motion gate (gsap.set called with correct selector + final state vars; no timeline created), data-attribute selectors (1 [data-about-photo] + 2 [data-about-paragraph]). All 13 GREEN.

## Task Commits

Each task was committed atomically (with --no-verify per the parallel-execution contract):

1. **Task 1: Implement About component** — `441006d` (feat)
2. **Task 2: Expand About test suite** — `e5ba197` (test)

## Files Created/Modified

- `components/sections/About.tsx` — Created. 'use client' section component, 124 lines. Imports useRef + Image (next/image) + useTranslations (next-intl) + useGSAP (@gsap/react) + gsap + side-effect 'gsap/ScrollTrigger'. Single named export `About`. Inner `<div ref={aboutRef}>` is the GSAP scope (the `<section id="about">` wrapper is owned by app/[locale]/page.tsx). All colors via Tailwind utilities backed by --color-* tokens (text-foreground, rounded-lg, etc.) — no hex/rgb/hsl/oklch literals.
- `components/sections/About.test.tsx` — Extended from 1 test to 13 tests across 5 describe blocks. New MatchMediaController mock pattern captures the registered matchMedia queries + callback for deterministic branch testing. next/image mock now serializes all relevant props so attribute checks run via container.textContent regex matches. Reset state in beforeEach so each test runs against a fresh import.

## Decisions Made

- **ScrollTrigger import strategy:** Side-effect-only `import 'gsap/ScrollTrigger'` (not `import { ScrollTrigger } from 'gsap/ScrollTrigger'` and not a registerPlugin call). The import merges the ScrollTrigger types into gsap's typedef so `gsap.timeline({ scrollTrigger: ... })` typechecks, and registration is owned exclusively by LenisProvider (Phase 3 D-02 module-load contract). This keeps the LenisProvider/section boundary clean.
- **Timeline overlap:** The paragraph stagger begins at `-=0.4` (0.4s before the photo's slide-in completes). Without overlap the two entrance moments feel disjoint; with overlap the bio reads as a single cohesive reveal that emerges with the photo.
- **Single combined selector under reduced-motion:** Rather than two separate gsap.set calls (one per data attribute), a single call with `'[data-about-photo], [data-about-paragraph]'` sets both — fewer GSAP operations, cleaner test surface, identical visual outcome.
- **MatchMediaController test pattern:** Instead of mocking gsap.matchMedia to invoke its callback synchronously (which forces a single branch per render), the mock stores the registered queries + callback on a controller object. Tests then invoke the captured callback explicitly with either `{ isFull: true }` or `{ isFull: false }` conditions to exercise both branches from a single render. This pattern generalizes to any matchMedia-gated GSAP component (Skills in 04-04 will reuse it).

## Deviations from Plan

None - plan executed exactly as written. The plan's `<action>` block was followed verbatim; the only minor enhancement (added explicit `priority={false}` prop to the Image — the plan said "priority=false" in interfaces but the action block omitted it) reinforces the planner's stated intent rather than deviates from it.

## Issues Encountered

- **TypeScript whole-project check shows errors from sibling Wave 1 plans:** `npx tsc --noEmit` reports missing modules for `@/components/sections/ProjectsSection`, `@/components/sections/Contact`, `./CategoryFilter`, `./Contact`, `./ProjectCard`, `./ProjectGrid`, `./ProjectsSection`. These belong to plans 04-03 and 04-05 (Wave 1 parallel + Wave 2) and are out of scope for 04-02. About.tsx and About.test.tsx compile cleanly in isolation; lint exit 0 and the scoped test run exits 0. Logged as expected during parallel execution.

## User Setup Required

None — no external service configuration required. The placeholder portrait at `public/about-photo.jpg` (committed by Wave 0) remains the deploy-blocker: user must swap with their real photo before Phase 7 deploy. This was already documented in 04-CONTEXT.md `<deferred>` and is owned by the Wave 0 SUMMARY.

## Next Phase Readiness

- About section is GREEN and ready for the Phase 4 verifier sweep + the eventual Phase 6 a11y/Lighthouse audit.
- The MatchMediaController test pattern is a reusable building block for plan 04-04 (Skills) which also uses gsap.matchMedia for its ScrollTrigger stagger.
- No blockers introduced. The placeholder photo dependency carries over from Wave 0 unchanged.

## Self-Check: PASSED

- [x] `components/sections/About.tsx` exists — verified
- [x] `components/sections/About.test.tsx` exists — verified
- [x] Commit `441006d` exists in `git log` — verified
- [x] Commit `e5ba197` exists in `git log` — verified
- [x] `npx vitest run components/sections/About.test.tsx` — 13/13 GREEN
- [x] `npm run lint` — exit 0
- [x] `head -1 components/sections/About.tsx` contains `'use client'` — verified
- [x] `grep "useGSAP\|ScrollTrigger" components/sections/About.tsx` ≥ 2 — found 11
- [x] `grep "matchMedia" components/sections/About.tsx` ≥ 1 — found 2
- [x] `grep "next/image" components/sections/About.tsx` ≥ 1 — found 1
- [x] No color literals (`oklch(`, `#XXX`, `rgb(`, `hsl(`) — verified via custom grep (base64 blur exception OK)

---
*Phase: 04-homepage-sections*
*Plan: 02-about*
*Completed: 2026-05-27*
