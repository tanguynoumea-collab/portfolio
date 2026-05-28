---
phase: 06-seo-accessibility-polish
plan: 02
subsystem: ui
tags: [next-app-router, route-states, error-boundary, not-found, loading, motion, next-intl, a11y, i18n, vitest]

# Dependency graph
requires:
  - phase: 06-00-install-audit-deps
    provides: vitest-setup.ts (axe matchers wired additively — chai matchers still default)
  - phase: 01-foundations
    provides: errors.404 + errors.500 i18n keys (FR/EN parity), i18n/navigation Link, NextIntlClientProvider in [locale]/layout.tsx
  - phase: 02-palette-system
    provides: palette CSS-var aliases (bg-accent/text-foreground/text-muted-foreground), useReducedMotion reduced-motion contract
provides:
  - "app/[locale]/not-found.tsx — EGG-02 bilingual custom 404 with reduced-motion-gated motion entry + locale-aware back link"
  - "app/[locale]/error.tsx — client error boundary wired to framework reset() prop (NOT a Server Action)"
  - "app/[locale]/loading.tsx — role=status motion-safe spinner (static under reduced motion)"
  - "app/[locale]/projects/[slug]/loading.tsx — re-export fallback for the slowest (MDX) route"
affects: [06-04-a11y-audit, 06-05-lighthouse, phase-07-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route-state trio (loading/error/not-found) at the [locale] segment level"
    - "Client error boundary uses framework reset() prop, never a Server Action (D-08 lock)"
    - "loading.tsx re-export pattern: project route forwards `export { default } from '../../loading'`"
    - "motion-safe:animate-pulse for CSS-only reduced-motion gating (no JS hook needed)"

key-files:
  created:
    - app/[locale]/not-found.tsx
    - app/[locale]/error.tsx
    - app/[locale]/loading.tsx
    - app/[locale]/projects/[slug]/loading.tsx
    - app/[locale]/not-found.test.tsx
    - app/[locale]/error.test.tsx
    - app/[locale]/loading.test.tsx
  modified: []

key-decisions:
  - "Reused existing errors.404 + errors.500 i18n keys verbatim — no new keys authored, FR/EN parity unchanged at 94 leaf paths"
  - "error.tsx kept reset() (stable) over Next 16.2's unstable_retry() per locked D-08; explicitly NOT a Server Action"
  - "loading label kept as literal 'Loading' (aria-label + sr-only) per D-09 — no localized i18n key required"
  - "Project-route loading.tsx re-exports the locale-level fallback (single source, zero divergence)"

patterns-established:
  - "Reduced-motion gate in motion entry: initial/animate become opacity-only ({opacity:0/1}, no scale) when useReducedMotion() is truthy"
  - "Doc comments avoid acceptance-grep literals ('use client', 'use server', next-intl/server) to keep verify scripts deterministic"

requirements-completed: [A11Y-03, EGG-02]

# Metrics
duration: 4min
completed: 2026-05-28
---

# Phase 6 Plan 02: Route States Summary

**The App Router route-state trio at `app/[locale]/` — a reduced-motion-gated bilingual EGG-02 404, a `'use client'` error boundary wired to the framework `reset()` prop, and a motion-safe `role=status` loading fallback (plus a re-export for the slowest MDX route) — all wiring the pre-existing `errors.404`/`errors.500` i18n keys with full FR/EN parity preserved.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-28T07:06:50Z
- **Completed:** 2026-05-28T07:10:08Z
- **Tasks:** 3
- **Files created:** 7

## Accomplishments
- **EGG-02 custom 404** (`not-found.tsx`): large "404", bilingual playful copy from `errors.404`, motion entry gated by `useReducedMotion()` (fade+scale normally, opacity-only when reduced), shadcn `<Button asChild>` wrapping the locale-aware `<Link href="/">` back home.
- **A11Y-03 error boundary** (`error.tsx`): `'use client'`, `role="alert"`, renders `errors.500` copy, recovery button calls the framework `reset()` prop directly — NOT a Server Action (locks the REQUIREMENTS.md A11Y-03 ambiguity per D-08).
- **A11Y-03 loading fallback** (`loading.tsx` ×2): Server Component `role=status` spinner using `motion-safe:animate-pulse` (static dot under reduced motion) + palette `bg-accent`; the project route re-exports it for the slowest dynamic-MDX page.
- **Tests**: 3 new files / 4 tests covering the `reset()` spy, the reduced-motion opacity-only gate assertion, the back-link href, and the `role=status`/`motion-safe` markup. Full suite 287/287 green.

## Task Commits

Each task was committed atomically:

1. **Task 1: not-found.tsx (EGG-02) + error.tsx** — `5062378` (feat)
2. **Task 2: loading.tsx + project-route loading.tsx** — `1a871b9` (feat)
3. **Task 3: unit tests (reset spy + reduced-motion gate + role=status)** — `8834b21` (test)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified
- `app/[locale]/not-found.tsx` - EGG-02 404; client `useTranslations('errors.404')`, `useReducedMotion()`-gated motion entry, `<Link href="/">` back link, palette colors only.
- `app/[locale]/error.tsx` - Client error boundary; `useTranslations('errors.500')`, `role="alert"`, `<Button onClick={() => reset()}>`. No server imports, no metadata export, no Server Action.
- `app/[locale]/loading.tsx` - Server Component `role=status` spinner; `motion-safe:animate-pulse`, `bg-accent`, sr-only "Loading…".
- `app/[locale]/projects/[slug]/loading.tsx` - `export { default } from '../../loading'` (slowest route fallback).
- `app/[locale]/not-found.test.tsx` - errors.404 copy + back href + opacity-only-under-reduced-motion assertion.
- `app/[locale]/error.test.tsx` - errors.500 copy + `reset` spy called once on click.
- `app/[locale]/loading.test.tsx` - `role=status` truthy + `motion-safe:animate-pulse` present.

## Decisions Made
- **Reused existing i18n keys verbatim.** `errors.404` (title/message/back) and `errors.500` (title/message/reset) already existed in both locales from Phase 1; this plan wired them. No new keys → parity gate stays at 94 leaf paths (verified `tsx scripts/check-i18n-parity.ts` exit 0).
- **`reset()` over `unstable_retry()`.** Next 16.2 added `unstable_retry()` and the docs now nudge toward it, but it is unstable-prefixed; `reset()` is stable, documented, and the locked D-08 choice. error.tsx is explicitly NOT a Server Action.
- **`loading` label left as literal.** D-09 sanctions `aria-label="Loading"` + sr-only "Loading…" without a localized key; adding one would have been the only reason to touch `messages/*.json`. Skipped to keep the change surface minimal.
- **Project-route loading re-exports the locale one.** A duplicate JSX body risks divergence; the re-export keeps a single source. Build confirmed the `../../loading` path resolves correctly under Turbopack.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworded doc comments to avoid acceptance-grep literals**
- **Found during:** Task 1 (error.tsx) and Task 2 (loading.tsx)
- **Issue:** The Task 1/Task 2 automated `verify` scripts use literal substring checks (`includes("use server")`, `includes("'use client'")`). My explanatory doc comments contained those literals in prose ("does NOT declare 'use server'", "Server Component (NO 'use client')"), causing the verify scripts to false-positive as if error.tsx were a Server Action / loading.tsx were a client component.
- **Fix:** Reworded the two comments to "does NOT declare a server directive" and "Server Component (no client directive)" — same meaning, no literal collision. The actual code is unchanged and correct (error.tsx IS `'use client'`; loading.tsx is NOT).
- **Files modified:** `app/[locale]/error.tsx`, `app/[locale]/loading.tsx`
- **Verification:** Both Task verify scripts re-run → `OK`. Build + tests green.
- **Committed in:** `5062378` (Task 1), `1a871b9` (Task 2)

---

**Total deviations:** 1 auto-fixed (1 blocking — acceptance-grep literal compliance, the same class of deviation logged in Phases 3/4/5).
**Impact on plan:** Cosmetic comment wording only; zero behavioral change. No scope creep.

## Issues Encountered
- Benign jsdom notice during `npm test`: "HTMLCanvasElement's getContext() method: without installing the canvas npm package" — pre-existing (canvas-confetti, Phase 2), unrelated to this plan, does not fail any test.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- **06-04 (a11y audit)** can now axe the `not-found` and `error` surfaces (D-10 lists both as targets) and confirm `loading.tsx`'s `role=status` semantics.
- **06-05 (lighthouse)** route-state pages exist for the local prod-build run.
- All Wave 1 route-state work complete; no blockers. error.tsx/not-found.tsx/loading.tsx touch DIFFERENT files than 06-01 (metadata) — no merge surface.

## Self-Check: PASSED

All 7 created files verified on disk; all 3 task commit hashes (`5062378`, `1a871b9`, `8834b21`) verified in git history.

---
*Phase: 06-seo-accessibility-polish*
*Completed: 2026-05-28*
