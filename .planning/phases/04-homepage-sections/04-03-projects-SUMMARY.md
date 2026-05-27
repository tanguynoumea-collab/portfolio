---
phase: 04-homepage-sections
plan: 03
subsystem: ui
tags: [react, motion, animatepresence, popLayout, layoutId, next-image, next-intl, navigation, tdd, vitest]

requires:
  - phase: 01-foundations
    provides: discriminated Project union (TechProject/DesignProject/BIMProject) + getProjects(locale) MDX loader
  - phase: 02-palette-system
    provides: shadcn token alias chain (bg-primary, text-primary-foreground, border-border)
  - phase: 03-layout-animation-foundation
    provides: motion layoutId="lang-indicator" shared-element pattern (LanguageSwitcher D-18) + LenisProvider scroll bridge + i18n/navigation Link factory
  - phase: 04-homepage-sections
    provides: 6 stub MDX projects + shadcn Badge with category-{tech,design,bim} variants + 3 fixed --color-category-* tokens (Wave 0)
provides:
  - CategoryFilter segmented control with motion layoutId="filter-indicator" shared-element transition (HOME-03)
  - ProjectCard locale-aware Link wrapping shadcn Card with discriminated metadata footer + useReducedMotion hover gate (HOME-04)
  - ProjectGrid responsive 1/2/3 column grid with AnimatePresence mode="popLayout" + outer motion.div layout (HOME-05)
  - ProjectsSection state-lifting composer with useMemo filter selector (HOME-05)
affects:
  - phase 05-content-detail (project detail pages consume same Project type; ProjectCard Link.href is /projects/{slug} ready for Phase 5 route handler)
  - phase 06-accessibility-audit (Lighthouse + axe-core need the 4 components rendered)
  - phase 07-final-deploy (placeholder cover images and stub MDX content swapped per slug)

tech-stack:
  added: []  # no new deps — all dependencies already installed in earlier phases
  patterns:
    - "motion layoutId reuse pattern: filter-indicator follows lang-indicator (Phase 3) for shared-element segmented controls"
    - "Discriminated metadata footer: switch on project.category to render category-specific badge sets"
    - "Server -> Client RSC boundary: getProjects(locale) in page.tsx (Server) -> projects prop -> ProjectsSection (Client) -> ProjectGrid"
    - "useReducedMotion === true gate: defaults to motion-enabled when null (SSR / pre-hydration) — Pitfall 4-B mitigation"
    - "AnimatePresence popLayout + outer motion.div layout: Pitfall 4-C — outer wrapper layout prop required so grid height transitions smoothly during position:absolute exit states"
    - "motion.div > Link > Card stack: Pitfall 4-I — motion.div OUTSIDE Link so pointer-enter fires on hover (Link captures pointer events)"
    - "React.createElement mock pattern for motion in jsdom: returns real React elements (NOT plain objects) so JSX reconciliation works"

key-files:
  created:
    - components/sections/CategoryFilter.tsx
    - components/sections/ProjectCard.tsx
    - components/sections/ProjectGrid.tsx
    - components/sections/ProjectsSection.tsx
  modified:
    - components/sections/CategoryFilter.test.tsx (Wave 0 RED -> 12 tests green)
    - components/sections/ProjectCard.test.tsx (Wave 0 RED -> 14 tests green)
    - components/sections/ProjectGrid.test.tsx (Wave 0 RED -> 9 tests green)
    - components/sections/ProjectsSection.test.tsx (Wave 0 RED -> 10 tests green)

key-decisions:
  - "Reuse Phase 3 LanguageSwitcher layoutId pattern verbatim, only changing the identifier string from lang-indicator to filter-indicator — keeps the shared-element morph idiom consistent across the entire site"
  - "useReducedMotion compared to true (not just truthy) so SSR-null defaults to motion-enabled — Pitfall 4-B avoids hover flicker during hydration"
  - "ProjectCard motion.div outside Link (not inside) per Pitfall 4-I so whileHover pointer-enter actually fires (Link captures pointer events)"
  - "AnimatePresence mode=popLayout + outer motion.div layout (BOTH required per Pitfall 4-C) so grid height transitions smoothly during exit animations (popLayout sets exiting cards to position:absolute, removing them from layout flow)"
  - "useMemo filter selector keyed on [projects, active] for stable identity — avoids re-running AnimatePresence reconciliation across unrelated re-renders"
  - "Discriminated metadata footer renders category-specific badge sets: tech.stack[0..2] / design.tools[0..2] / bim.software[0..1]+projectScale — leverages the Phase 1 D-18..D-22 Project union without runtime type checks at the call site"
  - "Mock motion/react in tests via React.createElement (matching Phase 1 Contact.test.tsx pattern) — the Wave 0 RED harnesses returned plain {type,props} objects which fail React reconciliation; the GREEN pattern returns real React elements"

patterns-established:
  - "Motion shared-element indicator across segmented controls: layoutId='{name}-indicator' on motion.span hosted by the active button — pattern works for ANY segmented control (filter, locale, theme tab, etc.)"
  - "Server data load + Client state lifter: server page.tsx calls async loader, passes serialized data through RSC boundary; Client wrapper owns local state + memoized selector"
  - "Mock test pattern for motion components: React.createElement passes children + serializes whileHover/layout/mode props to data attributes so tests can assert behavior without running the actual motion engine"
  - "Lucide icon mock pattern: stub as svg with data-icon='IconName' attribute so tests can find them via container.querySelector('svg[data-icon=\"...\"]')"

requirements-completed: [HOME-03, HOME-04, HOME-05]

duration: 7m 30s
completed: 2026-05-27
---

# Phase 4 Plan 3: Projects (HOME-03/04/05) Summary

**Filterable projects showcase shipped: motion layoutId shared-element filter indicator + AnimatePresence popLayout grid + discriminated metadata footer + locale-aware project links.**

## Performance

- **Duration:** ~7 min 30 sec
- **Started:** 2026-05-27T20:58:55Z
- **Completed:** 2026-05-27T21:06:26Z
- **Tasks:** 3
- **Files modified:** 8 (4 new components + 4 expanded test files)

## Accomplishments

- **HOME-03 CategoryFilter:** segmented control with 4 pill buttons (All/Tech/Design/BIM) from `projects.filters.*` i18n keys. Active button hosts `<motion.span layoutId="filter-indicator">` — same shared-element morph pattern as Phase 3 LanguageSwitcher (D-18), only the layoutId differs. State lifted to parent via `active` + `onChange` props. aria-pressed reflects active state per WCAG/WAI-ARIA segmented control pattern.
- **HOME-04 ProjectCard:** color-coded card combining shadcn `<Card>` + `next/image` 16:10 cover (with blur placeholder) + category Badge (top-left absolute) + year overlay (top-right) + discriminated metadata footer + `ArrowUpRight` lucide icon. Wrapped in motion.div (whileHover scale 1.02 under full motion, undefined under reduced) > Link from `@/i18n/navigation` (locale-aware, NOT next/navigation) > Card. The motion.div OUTSIDE Link mitigates Pitfall 4-I (Link captures pointer-enter otherwise).
- **HOME-05 ProjectGrid:** responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` with `AnimatePresence mode="popLayout"` + outer `motion.div layout`. Empty state with `SearchX` lucide icon + `projects.empty` i18n string. Per-card `<motion.div key={slug} layout initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}>` wrapping.
- **HOME-05 ProjectsSection:** state-lifting composer owning `useState<FilterValue>('all')` default. `useMemo` selector for filtered subset (stable identity across unrelated re-renders avoids running AnimatePresence reconciliation unnecessarily). Composes CategoryFilter + ProjectGrid with state-prop wiring.
- **42 new tests** turning 4 Wave 0 RED harnesses GREEN: CategoryFilter (12) / ProjectCard (14) / ProjectGrid (9) / ProjectsSection (10). Full suite climbs from 180 -> 222 passing (zero regressions).
- **`npm run build` exits 0** — Phase 4 FULLY SHIPS. All 6 prerendered routes (/, /fr, /en homepage) build successfully via Next 16 Turbopack.

## Task Commits

Each task committed atomically:

1. **Task 1: Implement CategoryFilter + ProjectCard** — `e94e3a1` (feat)
2. **Task 2: Implement ProjectGrid + ProjectsSection** — `cc5679d` (feat)
3. **Task 3: Expand 4 Wave 0 RED harnesses into full HOME-03/04/05 acceptance** — `940899e` (test)

**Plan metadata commit:** _added by final state update step below_

## Files Created/Modified

### Created (4 components)

- `components/sections/CategoryFilter.tsx` — HOME-03 segmented control with motion layoutId="filter-indicator" shared-element indicator, 4 pill buttons (All/Tech/Design/BIM), lifted state (active/onChange props), exports `FilterValue` and `Category` types
- `components/sections/ProjectCard.tsx` — HOME-04 color-coded card with discriminated metadata footer, locale-aware Link from `@/i18n/navigation`, useReducedMotion gate for hover (Pitfall 4-B), motion.div > Link > Card stack (Pitfall 4-I)
- `components/sections/ProjectGrid.tsx` — HOME-05 responsive grid with AnimatePresence mode="popLayout" + outer motion.div layout prop (Pitfall 4-C mitigation), empty state with SearchX icon + i18n
- `components/sections/ProjectsSection.tsx` — HOME-05 state-lifting composer with useMemo filter selector, consumes server-loaded projects prop from page.tsx

### Modified (4 expanded tests, Wave 0 RED -> GREEN)

- `components/sections/CategoryFilter.test.tsx` — 12 tests (i18n rendering / aria-pressed / onChange / motion layoutId)
- `components/sections/ProjectCard.test.tsx` — 14 tests (content / cover / category badge variant / discriminated metadata / locale-aware Link / aria-label / useReducedMotion gate)
- `components/sections/ProjectGrid.test.tsx` — 9 tests (1 card per project / empty state / SearchX icon / AnimatePresence mode="popLayout" / outer motion.div layout)
- `components/sections/ProjectsSection.test.tsx` — 10 tests (default state / filter changes per category / useMemo selector / empty edge cases)

## Decisions Made

- **D-13 reuse:** layoutId="filter-indicator" follows the exact same idiom as Phase 3 LanguageSwitcher's layoutId="lang-indicator" — only the identifier string changes. This deliberate consistency means the visual transition idiom is the same across the entire site.
- **D-14 stack order:** motion.div > Link > Card (NOT motion.div > Card > Link) so whileHover's pointer-enter listener attaches to the OUTERMOST node and Link's pointer event capture doesn't swallow the hover. Verified by Pitfall 4-I.
- **D-14 reduced-motion semantics:** `useReducedMotion() === true` (explicit comparison) — null defaults to motion-enabled. Avoids the hover-flicker bug where the SSR null briefly applies hover, then null again post-hydration, then false stays.
- **D-15 popLayout + outer layout:** BOTH are required for Pitfall 4-C. Without the outer wrapper carrying `layout`, the grid height jumps as exiting cards leave layout flow (popLayout sets them position:absolute). With both, the parent height transitions smoothly during exit-only states.
- **D-16 useMemo selector:** keyed on `[projects, active]` so the filter only re-computes when those change. Other re-renders (theme switch, route change) don't break AnimatePresence's `key`-based reconciliation.
- **Discriminated metadata:** `metadataBadges(project)` switches on `project.category` to render `tech.stack[0..2]` / `design.tools[0..2]` / `bim.software[0..1]+projectScale`. TypeScript's discriminated union narrows correctly inside the if-branches so no runtime type checks needed.
- **Mock test pattern:** Wave 0's `{type, props}` plain object pattern broke React reconciliation ("Objects are not valid as a React child"). Replaced with `React.createElement(...)` pattern matching Contact.test.tsx (Wave 1's correct convention) so JSX flows into the DOM properly.

## Deviations from Plan

None — plan executed exactly as written. All 3 tasks shipped with their specified acceptance criteria, the 4 component files implement the exact contracts described in the plan's `<action>` blocks, and the verification automated checks passed first try (`filter-card-impl-ok`, `grid-section-impl-ok`).

The Wave 0 RED test harnesses required mock pattern expansion in Task 3 (from `{type, props}` to `React.createElement`), but this was within scope — the plan explicitly directs Task 3 to expand the Wave 0 harnesses into full HOME-03/04/05 acceptance suites. Following the Contact.test.tsx mock convention (Wave 1's correct pattern) was the natural fit.

## Issues Encountered

None — all 3 tasks completed first-try. Lint clean immediately (one trivial unused-variable warning fixed in seconds). Build green on first attempt. Full 222-test suite green with zero regressions.

Pre-existing TypeScript errors in `About.test.tsx` (line 104) and `Hero.test.tsx` (line 237) from Wave 1 plans were noted but are OUT OF SCOPE for this plan — they don't block `npm run build` (Next's TS checker passes), and per the scope-boundary rule, fixing them would be scope creep. They're tracked for Phase 6 (accessibility-audit) lint hardening.

## User Setup Required

None — no external service configuration required. The placeholder cover images and stub MDX content are committed; user swaps them with real content in Phase 7 deploy prep (already documented in deferred ideas).

## Next Phase Readiness

**Phase 4 COMPLETE.** All 7 HOME-* requirements delivered:

- HOME-01 (Hero) — Plan 04-01
- HOME-02 (About) — Plan 04-02
- HOME-03 (CategoryFilter) — This plan
- HOME-04 (ProjectCard) — This plan
- HOME-05 (ProjectGrid + ProjectsSection) — This plan
- HOME-06 (Skills) — Plan 04-04
- HOME-07 (Contact) — Plan 04-05

**Ready for Phase 5 (Content & Detail Pages):**

- ProjectCard's Link href=`/projects/{slug}` already points to the future Phase 5 route — Phase 5 just needs to add `app/[locale]/projects/[slug]/page.tsx` and the route resolves
- Discriminated Project union from Phase 1 is now consumed by ProjectCard's `metadataBadges` selector — Phase 5's detail pages can reuse the same `categoryVariant()` and discriminated rendering patterns
- 6 stub MDX files in `content/projects/` are ready for Phase 5 to expand with full body content + replace placeholder covers per slug

**Verification gates all green:**

- [x] `npm test` exits 0 — **222/222 tests pass** (180 baseline Phase 1-3 + 42 new Phase 4 tests)
- [x] `npm run lint` exits 0
- [x] `npm run build` exits 0 — **Phase 4 FULLY SHIPS**
- [x] `grep "@/i18n/navigation" components/sections/ProjectCard.tsx` returns ≥ 1 (2 matches: import + comment)
- [x] `grep "from 'next/navigation'" components/sections/ProjectCard.tsx` returns nothing
- [x] `grep 'mode="popLayout"' components/sections/ProjectGrid.tsx` returns 2 matches
- [x] `grep 'layoutId="filter-indicator"' components/sections/CategoryFilter.tsx` returns 2 matches
- [x] `grep "cursor: none" components/sections/` returns nothing (Phase 3 D-26 gate persists)
- [x] No literal colors anywhere in Phase 4 components (oklch/#hex/rgb/hsl) — base64 blur dataURLs OK

## Self-Check: PASSED

All 4 created files exist:
- FOUND: components/sections/CategoryFilter.tsx
- FOUND: components/sections/ProjectCard.tsx
- FOUND: components/sections/ProjectGrid.tsx
- FOUND: components/sections/ProjectsSection.tsx

All 3 task commits exist:
- FOUND: e94e3a1 (Task 1 — CategoryFilter + ProjectCard)
- FOUND: cc5679d (Task 2 — ProjectGrid + ProjectsSection)
- FOUND: 940899e (Task 3 — Expand 4 RED harnesses)

---
*Phase: 04-homepage-sections*
*Completed: 2026-05-27*
