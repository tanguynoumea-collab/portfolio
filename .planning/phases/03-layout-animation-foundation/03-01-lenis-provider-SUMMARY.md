---
phase: 03-layout-animation-foundation
plan: 01
subsystem: ui
tags: [lenis, gsap, scrolltrigger, smooth-scroll, raf, react19, prefers-reduced-motion, context-api]

# Dependency graph
requires:
  - phase: 03-layout-animation-foundation
    provides: "gsap@3.15.0, @gsap/react@2.1.2, lenis@1.3.23 installed (Plan 00)"
  - phase: 02-palette-system
    provides: "ThemeProvider exposes usePalette().paletteId — subscribed for D-05 refresh"
  - phase: 02-palette-system
    provides: "usePrefersReducedMotion() hook (useSyncExternalStore) — drives D-06 skip"
provides:
  - "components/providers/LenisProvider.tsx: single-RAF Lenis + GSAP bridge"
  - "useLenis() hook: imperative access to live Lenis instance (returns null when reduced-motion or pre-effect)"
  - "Module-level gsap.registerPlugin(ScrollTrigger) — Phase 4+ does NOT repeat"
  - "ScrollTrigger.refresh() ~450ms debounce on paletteId change (D-05)"
  - "data-lenis-prevent contract for Radix overlays (D-04)"
  - "anchors:true smooth-scroll for nav anchor links (D-03)"
  - "Mobile input-focus pause via focusin/focusout listeners (D-07)"
affects: [03-02-root-layout-font, 03-03-navigation-lang-switcher, 03-05-cursor-transitions-ascii, phase-04-home, phase-05-projects-animations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-RAF bridge: gsap.ticker.add((t) => lenis.raf(t * 1000)) with gsap.ticker.lagSmoothing(0)"
    - "Ref-holder context accessor: { getLenis: () => Lenis | null } avoids react-hooks/set-state-in-effect"
    - "Debounced ScrollTrigger.refresh: requestAnimationFrame -> setTimeout(refresh, 450) wrapper"
    - "Reduced-motion early-return inside useEffect (D-06 cascade — Lenis, debounce, focus, font-ready all skip)"
    - "Vanilla `new Lenis()` (NOT ReactLenis wrapper) per RESEARCH §1 trade-off table"

key-files:
  created:
    - "components/providers/LenisProvider.tsx"
    - "components/providers/LenisProvider.test.tsx"
  modified: []

key-decisions:
  - "Vanilla Lenis class chosen over ReactLenis wrapper for unambiguous reduced-motion skip + predictable Strict Mode cleanup + zero useLenis() subscriber re-render churn"
  - "useLenis() returns Lenis | null via a stable ref-holder accessor (not React state) to bypass react-hooks/set-state-in-effect lint rule (same React 19 idiom as ThemeProvider PaletteFab derive-in-render)"
  - "ScrollTrigger.refresh debounce locked at 450ms = 400ms global color transition + 50ms buffer (D-05 verbatim)"
  - "Module-level gsap.registerPlugin(ScrollTrigger) instead of per-component registration — idempotent, runs once per app cold start"

patterns-established:
  - "Pattern A (RESEARCH §1): Single-RAF Lenis + GSAP via gsap.ticker.add bridge"
  - "Pattern E (RESEARCH §2): ScrollTrigger.refresh debounce after palette swap via rAF + setTimeout(450)"
  - "Ref-holder accessor: stable context value over useRef so descendants read current instance without re-renders"
  - "Cascading reduced-motion gates: every Lenis/ScrollTrigger effect early-returns under usePrefersReducedMotion()"

requirements-completed: [LAYOUT-02]

# Metrics
duration: 4m 15s
completed: 2026-05-27
---

# Phase 3 Plan 01: LenisProvider Summary

**Single-RAF Lenis + GSAP bridge with D-02..D-07 contract: vanilla Lenis instance driven by gsap.ticker, ScrollTrigger.refresh debounced 450ms after palette swap, full reduced-motion + mobile input-focus + font-ready handling.**

## Performance

- **Duration:** 4m 15s
- **Started:** 2026-05-27T07:02:00Z
- **Completed:** 2026-05-27T07:06:15Z
- **Tasks:** 2
- **Files modified:** 2 (both created)

## Accomplishments

- `LenisProvider` instantiates vanilla Lenis with `autoRaf: false`, `anchors: true`, `lerp: 0.1`, and a `prevent: (node) => node.hasAttribute('data-lenis-prevent')` predicate — exactly the D-02..D-04 contract.
- `gsap.ticker.add((time) => lenis.raf(time * 1000))` is the single-RAF bridge; `gsap.ticker.lagSmoothing(0)` disables lag smoothing per RESEARCH §1; both teardown via `gsap.ticker.remove` + `lenis.destroy()` in the useEffect cleanup.
- `gsap.registerPlugin(ScrollTrigger)` runs **once at module load** (idempotent). Phase 4 ScrollTrigger consumers see the plugin already registered.
- D-05 palette-swap refresh: `useEffect([paletteId, reducedMotion])` schedules `requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(), 450))` — 400ms transition + 50ms buffer. Cleanup cancels both the rAF and the pending setTimeout.
- D-06 reduced-motion cascade: every useEffect (mount, palette-debounce, mobile-focus, font-ready) early-returns when `usePrefersReducedMotion()` is true. No Lenis instance, no ticker bridge, no listeners. Native scroll takes over.
- D-07 mobile input-focus pause: `document.addEventListener('focusin', ...)` checks `window.matchMedia('(max-width: 768px)').matches` and `INPUT`/`TEXTAREA` target; calls `lenis.stop()` on focus, `lenis.start()` on blur.
- `document.fonts.ready.then(ScrollTrigger.refresh)` runs once when font metrics finalize, so Phase 4 hero reveals fire at correct scroll positions after the Inter swap (RESEARCH §2 recommended addition).
- `useLenis()` hook exposes the live instance for D-21 LanguageSwitcher (scroll-position preservation across locale switch) via a stable ref-holder accessor — returns `null` when reduced-motion is on or before the effect has run.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement components/providers/LenisProvider.tsx** — `305f6ab` (feat)
2. **Task 2: Write components/providers/LenisProvider.test.tsx** — `facc39a` (test)

_Plan metadata commit follows separately._

## Files Created/Modified

- `components/providers/LenisProvider.tsx` (created) — single-RAF Lenis + GSAP bridge with D-02..D-07 contract; exports `LenisProvider` (named) + `useLenis()` (named).
- `components/providers/LenisProvider.test.tsx` (created) — 4-test Vitest spec covering mount/skip/cleanup/palette-swap-refresh behaviors via `vi.mock('gsap')` + `vi.mock('gsap/ScrollTrigger')` + `vi.mock('lenis')` + controllable hook mocks.

## Decisions Made

- **Vanilla Lenis class over `lenis/react` ReactLenis wrapper.** Locked by RESEARCH §1: the wrapper's `useLenis()` hook causes subscriber re-render churn on every scroll event, and the reduced-motion skip path is awkward with the wrapper (would require conditional render fragmenting the tree). Vanilla gives a clean `if (reducedMotion) return` inside the lifecycle effect.
- **`useLenis()` returns `Lenis | null` via a ref-holder accessor instead of React state.** React 19's `react-hooks/set-state-in-effect` lint rule (same one that drove `usePrefersReducedMotion` → `useSyncExternalStore` in Phase 2 and `PaletteFab` → derive-in-render) blocks the naive `setLenisInstance(lenis)` inside `useEffect`. The accessor pattern (`{ getLenis: () => lenisRef.current }`) wrapped in `useMemo([])` is stable for the lifetime of the provider, so context consumers do not re-render from identity churn; descendants read the current instance imperatively via `useLenis()?.scrollTo(...)`. This is the canonical React 19 idiom for "imperative singleton exposed via context."
- **450ms debounce locked verbatim.** 400ms (global color transition in `app/globals.css` line 165-168) + 50ms buffer. Matches D-05 spec exactly. Could not use `ScrollTrigger.refresh(true)` safe-mode here because safe-mode waits up to ~200ms — too short to outlast our 400ms transition.
- **Module-level `gsap.registerPlugin(ScrollTrigger)`.** Phase 4 components inherit the registration. Idempotent — safe even if a future component repeats the call. Documented in the JSDoc header as the contract for Phase 4+ usage (`useGSAP({ scope: ref })` mandatory).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Switched from `useState(Lenis | null)` to ref-holder accessor to satisfy react-hooks/set-state-in-effect**
- **Found during:** Task 1 (initial implementation passed all 4 tests, but `npm run lint` flagged `setLenisInstance(lenis)` inside the lifecycle useEffect).
- **Issue:** Plan action block specified `const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null)` with `setLenisInstance(lenis)` called inside the useEffect body. React 19 + `eslint-config-next` 16 ships a lint rule (`react-hooks/set-state-in-effect`) that explicitly bans synchronous setState in effects to prevent cascading renders. Phase 2 STATE notes confirm the same rule blocked naïve patterns in `PaletteFab` and `CustomColorPicker` — those were fixed via `useSyncExternalStore` / derive-in-render.
- **Fix:** Replaced `useState<Lenis | null>` with a `useRef<Lenis | null>` plus a stable `useMemo<LenisAccessor>(() => ({ getLenis: () => lenisRef.current }), [])` accessor exposed through the context. `useLenis()` now returns `Lenis | null` via `useContext(LenisContext).getLenis()`. Public API surface is unchanged from the consumer's perspective (still null-check-required). The D-07 mobile input-focus effect was updated to read `lenisRef.current` inside the event handlers rather than depend on a state variable — drops a stale dependency and removes the need for the effect to re-run when the instance becomes available.
- **Files modified:** `components/providers/LenisProvider.tsx`
- **Verification:** `npm run lint` exits 0; `npm test` 98/98 green; `npm run build` exits 0; all 25 grep-based acceptance criteria for Task 1 pass; all 9 grep-based acceptance criteria for Task 2 pass.
- **Committed in:** `305f6ab` (Task 1 commit — fix applied before the commit was created).

---

**Total deviations:** 1 auto-fixed (1 bug — React 19 lint compliance).
**Impact on plan:** No scope creep. The fix preserves the documented `useLenis()` contract (returns `Lenis | null`) and the consumer null-check pattern. Required for `npm run lint` to pass — would have blocked the success criteria otherwise. The ref-holder accessor pattern is now established for future imperative-instance-over-context scenarios (e.g., a future LottieProvider or AudioProvider could reuse the same shape).

## Issues Encountered

None — all 4 Vitest tests passed on the first run; the only iteration was the deviation above (lint compliance).

## User Setup Required

None — no external service configuration required.

## Self-Check: PASSED

- `components/providers/LenisProvider.tsx` exists.
- `components/providers/LenisProvider.test.tsx` exists.
- Git log shows commits `305f6ab` and `facc39a` on `master`.
- `npm test` exits 0 with 98 passing tests across 11 test files.
- `npm run lint` exits 0.
- `npm run build` exits 0 with Next 16 Turbopack compilation success.
- 25/25 Task 1 acceptance-criteria grep checks pass.
- 9/9 Task 2 acceptance-criteria grep checks pass.

## Next Phase Readiness

- Plan 02 (`03-02-root-layout-font-PLAN.md`) can now `import { LenisProvider } from '@/components/providers/LenisProvider'` and wire it into `app/[locale]/layout.tsx` per D-11 provider tree (`<NextIntlClientProvider><ThemeProvider><LenisProvider>...</LenisProvider></ThemeProvider></NextIntlClientProvider>`).
- Plan 03 (`03-03-navigation-lang-switcher-PLAN.md`) can `import { useLenis } from '@/components/providers/LenisProvider'` for D-21 scroll-position preservation across locale switch (`const lenis = useLenis(); ... lenis?.scrollTo(scrollY, { immediate: true })`).
- Phase 4 components MUST consume the established contract: `useGSAP({ scope: ref })` from `@gsap/react` for every ScrollTrigger-using animation. The plugin is already registered; no `gsap.registerPlugin` calls needed.
- The `data-lenis-prevent` attribute is now active — Phase 3 Sheet consumers (mobile hamburger in Plan 03; existing PaletteFab Sheet) must add it to their content root to opt out of Lenis virtualization.

---

*Phase: 03-layout-animation-foundation*
*Completed: 2026-05-27*
