---
phase: 03-layout-animation-foundation
plan: 03
subsystem: ui
tags: [navigation, i18n, language-switcher, intersection-observer, motion-layoutid, next-intl, sheet, hamburger, tdd]

# Dependency graph
requires:
  - phase: 03-layout-animation-foundation
    provides: "Plan 03-01 LenisProvider (useLenis context for D-21 scroll preservation), Plan 03-02 root layout (stub Navigation already wired into D-11 provider tree), Plan 03-02 placeholder sections in app/[locale]/page.tsx (5 section IDs home|about|projects|skills|contact for IntersectionObserver targets)"
  - phase: 02-palette-system
    provides: "shadcn Sheet primitive (components/ui/sheet.tsx — reused for mobile hamburger), shadcn alias chain bg-primary -> --primary -> var(--color-accent) for the lang indicator + logo accent, ThemeProvider context (no new subscription needed here — colors flow via CSS vars)"
  - phase: 01-foundations
    provides: "next-intl v4.12 with routing.ts (locales fr/en, localePrefix 'as-needed'), messages/{fr,en}.json (existing nav.* namespace under which nav.lang.* now sits), i18n parity invariant (66 leaf keys per locale)"
provides:
  - "Navigation fixed-top component (LAYOUT-03): wordmark logo + 5 section anchor links + LanguageSwitcher + mobile hamburger Sheet"
  - "LanguageSwitcher segmented FR|EN control (LAYOUT-05): motion layoutId indicator + locale-aware router.replace + html.lang sync + scroll preservation"
  - "useActiveSection hook: IntersectionObserver-based active-section detector, returns 'home' | 'about' | 'projects' | 'skills' | 'contact' | null"
  - "i18n/navigation.ts barrel: createNavigation(routing) re-exports (Link, redirect, usePathname, useRouter, getPathname) — the canonical next-intl 4.12 locale-aware module"
  - "nav.lang.label + nav.lang.switchTo i18n keys added to both messages/fr.json and messages/en.json (FR/EN parity preserved at 66 leaf keys)"
affects: [04-homepage-sections, 06-a11y-seo, language-switching-anywhere, intersection-observer-consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next-intl createNavigation locale-aware barrel at i18n/navigation.ts (Link/useRouter/usePathname re-exports — usePathname returns locale-stripped path)"
    - "Motion layoutId shared-element transition for segmented control active indicator (motion v12 / motion/react)"
    - "IntersectionObserver with rootMargin '-40% 0px -40% 0px' (20% viewport band) + multi-threshold [0, 0.1, 0.5, 1] for stable active-section highlight"
    - "Imperative document.documentElement.lang sync inside useEffect on useLocale() change — next-intl router does NOT re-render <html>"
    - "Scroll-position preservation across locale swap: lenis.actualScroll captured before navigation, lenis.scrollTo(savedY, {immediate: true}) on next rAF (window.scrollTo fallback under reduced-motion)"
    - "Sheet side='left' for mobile hamburger to avoid collision with palette switcher's right-anchored Sheet (Phase 2)"
    - "data-lenis-prevent on SheetContent root: Lenis virtualization skips menu internal scroll (D-04 contract)"
    - "TDD red-green per task: failing test commit, then implementation commit (test 7c8407d -> impl 0a277a4; test 9218fc3 -> impl 7794b72; test 6cee75c -> impl a8631ec)"

key-files:
  created:
    - "i18n/navigation.ts (5 re-exports from createNavigation(routing))"
    - "lib/hooks/useActiveSection.ts (hook + SectionId type + NAV_SECTION_IDS readonly array)"
    - "lib/hooks/useActiveSection.test.ts (4 Vitest cases)"
    - "components/layout/LanguageSwitcher.tsx (segmented FR|EN control with motion layoutId)"
    - "components/layout/LanguageSwitcher.test.tsx (4 Vitest cases)"
    - "components/layout/Navigation.test.tsx (5 Vitest cases)"
  modified:
    - "components/layout/Navigation.tsx (replaced Plan 02 stub body with full LAYOUT-03 implementation)"
    - "messages/fr.json (added nav.lang.label + nav.lang.switchTo)"
    - "messages/en.json (added nav.lang.label + nav.lang.switchTo)"

key-decisions:
  - "next-intl createNavigation barrel lives at i18n/navigation.ts (not co-located inside components) so any server-side helper (route handlers, Server Actions) can use the same Link/redirect/getPathname module"
  - "useActiveSection is a separate hook in lib/hooks/ (not inlined into Navigation) so future consumers (e.g., a TOC component or a section-progress indicator) can reuse the same logic"
  - "Hamburger Sheet uses side='left' explicitly to leave the right side free for the palette switcher Sheet (Phase 2 D-04) and the palette FAB — collision-free coexistence"
  - "Mock harness in Navigation.test.tsx: next/link is mocked to a plain <a> wrapper because the test asserts on href/aria-current of the anchors, not on Next router internals; LanguageSwitcher mocked as a div with data-testid because its full behavior is covered separately in LanguageSwitcher.test.tsx"
  - "LanguageSwitcher test asserts the precise locale-aware router.replace call shape ({pathname, params}, {locale: target}) — this is the structural proof that the import came from @/i18n/navigation rather than next/navigation (the disambiguation that the prompt explicitly called out as a correctness gate)"
  - "Replaced .toBeInTheDocument() in Navigation test with .toBeTruthy() — @testing-library/jest-dom matchers are not wired into the project's vitest setup; getByTestId already throws if the element is missing, so .toBeTruthy() provides the same guarantee without needing an extra setup file"

patterns-established:
  - "Pattern: locale-aware navigation re-exports — every component that needs to navigate across locales (LanguageSwitcher, future locale-aware Links) imports from @/i18n/navigation, NOT from next/navigation. Acceptance gate: grep '@/i18n/navigation' on any new locale-switching component must return ≥1"
  - "Pattern: motion segmented control with layoutId — apply to future segmented switchers (palette mode toggles, view-mode switchers, etc.) by changing the layoutId string only"
  - "Pattern: TDD with mock-first failing test — RED commit before GREEN commit makes test intent visible in git log and provides documentation for the contract being implemented"

requirements-completed: [LAYOUT-03, LAYOUT-05]

# Metrics
duration: 8m 22s
completed: 2026-05-27
---

# Phase 3 Plan 03: Navigation + LanguageSwitcher Summary

**Fixed-top navigation with wordmark logo + 5 section anchor links + motion-driven FR|EN segmented switcher; mobile hamburger via shadcn Sheet side="left"; locale swap preserves scroll position via Lenis and imperatively syncs `<html lang>`.**

## Performance

- **Duration:** 8m 22s
- **Started:** 2026-05-27T07:20:46Z
- **Completed:** 2026-05-27T07:29:08Z
- **Tasks:** 4
- **Files modified:** 8 (3 new components, 2 hooks, 1 i18n barrel, 2 messages files updated)

## Accomplishments

- **Navigation (LAYOUT-03):** transparent at scrollY=0 → bg-background/80 + backdrop-blur-md + border-b after scrolling >50px; wordmark "Tanguy" in text-primary; 5 anchor links centered (md+) with aria-current on the active section; LanguageSwitcher always visible far-right; below md, section links collapse into a Sheet side="left" hamburger with data-lenis-prevent on the SheetContent root. PaletteFab is NOT inside Nav — it stays a sibling FAB (D-14 boundary preserved).
- **LanguageSwitcher (LAYOUT-05):** segmented FR|EN control with a motion `<motion.span layoutId="lang-indicator" />` shared-element indicator (motion v12); clicking the inactive locale calls `router.replace({pathname, params}, {locale: target})` from `@/i18n/navigation` inside a startTransition; html.lang imperatively synced via useEffect on useLocale(); scroll position captured via `lenis.actualScroll` (or `window.scrollY` fallback) BEFORE navigation, then restored via `lenis.scrollTo(savedY, {immediate: true})` on the next rAF.
- **useActiveSection hook (D-15 support):** IntersectionObserver with rootMargin `-40% 0px -40% 0px` (20% viewport band) and multi-threshold; returns the section id with the largest intersectionRatio among visible entries; null until first observation; disconnects on unmount.
- **i18n parity preserved:** added `nav.lang.label` + `nav.lang.switchTo` (ICU `{target}` placeholder) to both messages/fr.json and messages/en.json. Deep-leaf parity verified: 66 leaf keys per locale.

## Task Commits

Each task was committed atomically. Per parallel-execution instructions, all commits used `--no-verify` (the orchestrator validates hooks once after the wave completes).

1. **Task 1: i18n/navigation barrel + nav.lang.* keys** — `350bd6e` (feat)
2. **Task 2: useActiveSection hook (TDD)**
   - RED: `7c8407d` (test) — 4 failing IntersectionObserver tests
   - GREEN: `0a277a4` (feat) — hook + SectionId + NAV_SECTION_IDS; 4/4 tests pass
3. **Task 3: Navigation component (TDD)**
   - RED: `9218fc3` (test) — 5 failing tests for LAYOUT-03 contract
   - GREEN: `7794b72` (feat) — replaces Plan 02 stub body; 5/5 tests pass (after minor jest-dom fix)
4. **Task 4: LanguageSwitcher component (TDD)**
   - RED: `6cee75c` (test) — 4 failing tests for LAYOUT-05 contract
   - GREEN: `a8631ec` (feat) — segmented FR|EN switcher; 4/4 tests pass

**Cleanup commits (post-impl polish, all 9/9 tests still pass after each):**
- `05ecbf9` (chore) — drop unused `_ns` param from LanguageSwitcher test mock (lint warning)
- `3ca7064` (fix) — remove `PaletteFab` literal from Navigation comments (acceptance gate: grep returns 0)
- `05caa2d` (fix) — drop `cursor: none` literal from doc comments (acceptance gate: grep returns 0)

**Plan metadata commit:** to follow this summary.

_Note: TDD tasks produced 2 commits each (test → feat). Task 1 had no test because it's pure data (the createNavigation barrel + JSON edits are verified by parity script + build)._

## Files Created/Modified

**Created:**
- `i18n/navigation.ts` — 5 re-exports from createNavigation(routing). 33 lines.
- `lib/hooks/useActiveSection.ts` — IntersectionObserver hook + SectionId type + NAV_SECTION_IDS const. 68 lines.
- `lib/hooks/useActiveSection.test.ts` — 4 Vitest cases (null, largest ratio, ratio change, disconnect). 111 lines.
- `components/layout/LanguageSwitcher.tsx` — segmented FR|EN control. 144 lines.
- `components/layout/LanguageSwitcher.test.tsx` — 4 Vitest cases. 120 lines.
- `components/layout/Navigation.test.tsx` — 5 Vitest cases. 120 lines.

**Modified:**
- `components/layout/Navigation.tsx` — Plan 02 stub (return null) replaced with full LAYOUT-03 implementation. 157 lines.
- `messages/fr.json` — added `nav.lang.label: "Changer la langue"`, `nav.lang.switchTo: "Passer en {target}"`. 4 new lines.
- `messages/en.json` — added `nav.lang.label: "Switch language"`, `nav.lang.switchTo: "Switch to {target}"`. 4 new lines.

## Decisions Made

- **next-intl `createNavigation(routing)` barrel at `i18n/navigation.ts`** (not co-located inside components) — supports both client (hooks) and server (redirect/getPathname) consumers from a single import path.
- **`useActiveSection` extracted as a standalone hook in `lib/hooks/`** (per CONTEXT.md Discretion guidance) — leaves the door open for future TOC, section-progress, or scroll-spy reuse.
- **Hamburger Sheet uses `side="left"`** to leave the right side free for the existing palette switcher Sheet + palette FAB (Phase 2). Collision-free coexistence at all viewports.
- **Tests use precise structural assertions** on `router.replace` call shape `({pathname, params}, {locale: target})` — the disambiguation that proves `useRouter` came from `@/i18n/navigation` rather than `next/navigation`. The prompt's `<wave_context>` flagged this as a correctness gate.
- **Navigation test uses `.toBeTruthy()` instead of `.toBeInTheDocument()`** — `@testing-library/jest-dom` matchers are not wired into the project's vitest setup; `getByTestId` already throws if the element is missing.

## Deviations from Plan

3 minor deviations, all auto-handled per Rule 1 (bug) / Rule 2 (missing critical) / Rule 3 (blocker). Total post-impl polish overhead: ~3 minutes.

### Auto-fixed Issues

**1. [Rule 3 - Blocker] `.toBeInTheDocument()` matcher not available**
- **Found during:** Task 3 (Navigation test execution, GREEN phase)
- **Issue:** Plan's test snippet used `expect(elem).toBeInTheDocument()`. This matcher comes from `@testing-library/jest-dom` but the project's `vitest.config.ts` has an empty `setupFiles: []` — the extended matchers are not registered. Test failed with "Invalid Chai property: toBeInTheDocument".
- **Fix:** Replaced with `expect(elem).toBeTruthy()` — same guarantee since `getByTestId` already throws if the element is not in the document.
- **Files modified:** `components/layout/Navigation.test.tsx`
- **Verification:** 5/5 Navigation tests pass; existing test files in the repo (PaletteFab.test.tsx, etc.) follow the same `getBy* + .toBeTruthy()` pattern.
- **Committed in:** `7794b72` (Task 3 GREEN commit, included alongside the impl)

**2. [Rule 1 - Bug] `PaletteFab` literal in Navigation.tsx comments triggered acceptance grep**
- **Found during:** Post-impl acceptance gate verification
- **Issue:** Plan acceptance criterion: "File DOES NOT contain the literal string `PaletteFab`". The Navigation impl's documentation comments used the literal "PaletteFab" 3 times to explain why it's NOT inside Nav. Comments are correct in intent but violate the strict literal gate.
- **Fix:** Reworded the 3 comments to use descriptive phrasing — "palette FAB", "palette switcher", "floating button". Same intent, zero literal matches. `grep -c "PaletteFab" components/layout/Navigation.tsx` now returns 0.
- **Files modified:** `components/layout/Navigation.tsx`
- **Verification:** Grep returns 0 matches; 9/9 tests still pass; the structural assertion in the test (`container.innerHTML.not.toMatch(/PaletteFab/)`) was already passing — this fix is for the static-file gate.
- **Committed in:** `3ca7064`

**3. [Rule 1 - Bug] `cursor: none` literal in doc comments triggered acceptance grep**
- **Found during:** Post-impl acceptance gate verification (same sweep as #2)
- **Issue:** Plan acceptance criterion: "File DOES NOT contain `cursor: none`". Two comments (Navigation + LanguageSwitcher) used the literal "cursor: none" to document the anti-feature exclusion. Same correct intent, same literal-gate violation as #2.
- **Fix:** Reworded both comments to reference the underlying constraint by name (REQUIREMENTS.md L130 CustomCursor takeover exclusion) instead of quoting the CSS literal.
- **Files modified:** `components/layout/Navigation.tsx`, `components/layout/LanguageSwitcher.tsx`
- **Verification:** Grep returns 0 matches in either file; 9/9 tests still pass; lint clean.
- **Committed in:** `05caa2d`

**Lint cleanup (chore, not a deviation):**
- **`05ecbf9`** (chore) — dropped an unused `_ns` parameter from a mock arrow function in LanguageSwitcher.test.tsx that triggered `@typescript-eslint/no-unused-vars` (warning, not error). 4/4 tests still green.

---

**Total deviations:** 3 auto-fixed (1 Rule 3 blocker, 2 Rule 1 bugs — all literal-grep gate compliance fixes)
**Impact on plan:** Zero scope creep. All three fixes are strict-literal-gate compliance — the underlying behavior of the components was correct from the GREEN commit; the comments around them got polished. No behavioral changes to ship.

## Issues Encountered

- **Footer.tsx modification by parallel 03-04 agent appeared in my git status mid-execution.** This is expected — both agents are running concurrently. My commits stage only the files I own (Navigation.tsx, LanguageSwitcher.tsx, useActiveSection.ts, useActiveSection.test.ts, Navigation.test.tsx, LanguageSwitcher.test.tsx, i18n/navigation.ts, messages/{fr,en}.json) — never used `git add .` or `git add -A`. Zero overlap with 03-04's file set.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Ready for downstream:**
- Plan 03-05 (Wave 3) can now visually verify the LanguageSwitcher's motion indicator in the live nav (alongside CustomCursor + page transitions + ConsoleArt).
- Phase 4 Hero (HOME-01) inherits a fully-functional Navigation with active-section tracking — the IntersectionObserver hook will fire as soon as Phase 4 fills the home `<section>` body with content.
- Phase 4's filterable Projects grid (HOME-05) reuses motion's `popLayout` AnimatePresence pattern; LanguageSwitcher's `layoutId` shared-element pattern is the same primitive applied to a different shape.

**Acceptance gates final state:**
- `grep "@/i18n/navigation" components/layout/LanguageSwitcher.tsx` → 2 ✓
- `grep "PaletteFab" components/layout/Navigation.tsx` → 0 ✓
- `grep "layoutId" components/layout/LanguageSwitcher.tsx` → 2 ✓
- `grep "data-lenis-prevent" components/layout/Navigation.tsx` → 3 ✓
- `grep "lang" messages/{fr,en}.json` → both contain `"lang":` block ✓
- `npm test` → 119/119 passing ✓
- `npm run lint` → 0 errors, 0 warnings ✓
- `npm run build` → exit 0 ✓
- LAYOUT-03 + LAYOUT-05 requirements satisfied ✓

**No blockers** for Plan 03-04 (Footer — parallel, already complete) or Plan 03-05 (Wave 3 — CustomCursor + page transitions + ConsoleArt).

## Self-Check: PASSED

All claimed files exist on disk:
- `i18n/navigation.ts` ✓
- `lib/hooks/useActiveSection.ts` + `.test.ts` ✓
- `components/layout/Navigation.tsx` + `.test.tsx` ✓
- `components/layout/LanguageSwitcher.tsx` + `.test.tsx` ✓
- `messages/fr.json` (updated) ✓
- `messages/en.json` (updated) ✓

All claimed commit hashes resolve in git log:
- `350bd6e`, `7c8407d`, `0a277a4`, `9218fc3`, `6cee75c`, `7794b72`, `a8631ec`, `05ecbf9`, `3ca7064`, `05caa2d` ✓

---

*Phase: 03-layout-animation-foundation*
*Plan: 03-03 navigation-lang-switcher*
*Completed: 2026-05-27*
