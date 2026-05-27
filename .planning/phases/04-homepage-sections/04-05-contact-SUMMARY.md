---
phase: 04-homepage-sections
plan: 05
subsystem: ui

tags: [contact, clipboard-api, motion, lucide, shadcn, asChild, download-attribute, i18n, next-intl]

# Dependency graph
requires:
  - phase: 04-homepage-sections (Wave 0 — 04-00-assets-and-stubs)
    provides: "lib/constants.ts (EMAIL/GITHUB_URL/LINKEDIN_URL), public/cv-fr.pdf + public/cv-en.pdf, wired <Contact /> in app/[locale]/page.tsx, contact.* i18n keys (preserved Phase 1, FR/EN parity)"
  - phase: 03-layout-animation-foundation
    provides: "Phase 3 D-23 lucide substitution pattern (Code2 / Briefcase / Mail — brand icons removed from lucide-react@1.x), shadcn Button asChild via Radix Slot pattern (Footer mailto reuse), AnimatePresence + motion API surface"
  - phase: 02-palette-system
    provides: "Phase 2 D-02 silent-fallback precedent (clipboard rejection mirrors the pattern used for unreliable browser APIs)"
  - phase: 01-foundations
    provides: "shadcn Button primitive (variants default/outline), cn() utility, palette CSS variables for color tokens"
provides:
  - "components/sections/Contact.tsx — 'use client' Contact section component (HOME-07)"
  - "Email copy-to-clipboard with motion icon swap (Copy → Check + 1.5s revert)"
  - "Silent clipboard rejection (no console.* call) — recruiter can still read email + use mailto: fallback"
  - "3 social anchors (GitHub + LinkedIn target/rel hardened, mailto: bare)"
  - "2 CV download buttons via Button asChild + <a href download> (FR primary, EN outline)"
  - "sr-only aria-live='polite' announcement region for screen reader copy feedback"
affects: [phase-7-deploy, phase-6-a11y]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Silent Clipboard API fallback (Phase 2 D-02 precedent applied to Web Clipboard API)"
    - "motion AnimatePresence mode='wait' for sibling icon swap (DIFFERENT from popLayout reserved for ProjectGrid in 04-03)"
    - "shadcn Button asChild wrapping <a href download> for forced-filename PDF downloads"
    - "sr-only aria-live='polite' for screen reader copy feedback (no visual tooltip needed)"

key-files:
  created:
    - "components/sections/Contact.tsx"
  modified:
    - "components/sections/Contact.test.tsx (Wave 0 RED harness expanded to 11 GREEN tests)"

key-decisions:
  - "AnimatePresence mode='wait' for Copy↔Check icon swap — sequential transition matches user expectation for a 2-state icon. popLayout is reserved for ProjectGrid (04-03) where multiple cards reflow."
  - "Silent clipboard rejection: try/catch with empty catch block, NO console.* call. Recruiter can still read the on-screen email and use the mailto: anchor below. v2 deferred idea: fallback select+copy tooltip on rejection."
  - "lucide brand-icon substitutions reused from Phase 3 D-23 (Code2 for GitHub, Briefcase for LinkedIn, Mail unchanged) — avoids forcing a lucide-react downgrade that would cascade through PaletteFab and Phase 3."
  - "Button asChild + <a href download> for CV PDFs — the download attribute forces save-as filename for same-origin static assets without CORS overhead. Variant differentiation (default for FR, outline for EN) signals locale-appropriate visual emphasis."
  - "sr-only aria-live='polite' span carries the emailCopied label — screen readers announce the copy, sighted users see the icon swap. No visible tooltip is needed (the icon swap IS the visual feedback)."

patterns-established:
  - "Web Clipboard API with silent fallback: navigator.clipboard.writeText wrapped in try { ... } catch { /* silent */ }. Future copy-to-clipboard surfaces (e.g., share buttons) should follow."
  - "Phase 3 lucide brand-icon substitution pattern is now used in BOTH Footer and Contact. Future surfaces with brand icon needs should use the same Code2/Briefcase/Mail trio."

requirements-completed: [HOME-07]

# Metrics
duration: 4min
completed: 2026-05-27
---

# Phase 4 Plan 05: Contact Section Summary

**Email copy-to-clipboard with motion icon swap, 3 lucide-substituted social links, and 2 CV download buttons via Button asChild + download attribute — all wired to @/lib/constants for single-edit pre-deploy swap.**

## Performance

- **Duration:** 4 min 19 s (259 s)
- **Started:** 2026-05-27T18:49:40Z
- **Completed:** 2026-05-27T18:53:58Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Shipped `components/sections/Contact.tsx` ('use client', named `Contact` export) wiring HOME-07 to the existing `<section id="contact">` in `app/[locale]/page.tsx`.
- Email copy: Web Clipboard API (`navigator.clipboard.writeText(EMAIL)`) inside a try/catch with **empty catch block** — clipboard rejection is silent per Phase 2 D-02 silent-fallback precedent. No `console.*` call leaks into the silent-fail path.
- motion `<AnimatePresence mode="wait" initial={false}>` swaps a Copy icon for a Check icon after a successful copy + the sr-only `aria-live="polite"` region announces "Address copied!" to screen readers. After 1500 ms a `window.setTimeout` reverts both back to the idle state.
- 3 social anchors using Phase 3 D-23 lucide substitutions (Code2 / Briefcase / Mail). GitHub + LinkedIn carry `target="_blank" rel="noopener noreferrer"`; the `mailto:` anchor does NOT (the OS mail client handles it and target="_blank" causes a blank-window flash in some browsers).
- 2 CV download buttons via shadcn `<Button asChild>` wrapping `<a href download>` — FR `variant="default"` (primary visual emphasis) to `/cv-fr.pdf` and EN `variant="outline"` (secondary) to `/cv-en.pdf`. Download attribute names the saved file `CV_Tanguy_Delrieu_FR.pdf` / `CV_Tanguy_Delrieu_EN.pdf` so recruiters see a clean filename.
- Contact.test.tsx expanded from the Wave 0 single-assertion RED harness to **11 passing tests** covering the full HOME-07 contract.

## Task Commits

Each task was committed atomically with `--no-verify` (parallel execution alongside 04-01 / 04-02 / 04-04):

1. **Task 1: Implement Contact component** — `fcb2437` (feat)
2. **Task 2: Expand Contact.test.tsx with full HOME-07 acceptance suite** — `9331909` (test)

**Plan metadata:** pending (docs commit follows this SUMMARY)

_Note: Task 1 follows TDD — Wave 0 shipped the RED test; this plan turns it GREEN with the implementation. Task 2 then expands the suite to fully exercise HOME-07. The Wave 0 RED harness had a broken motion/react mock (returned a plain object as a JSX child — "Objects are not valid as a React child") which Task 2 fixed by mocking motion.span via React.createElement._

## Files Created/Modified

- `components/sections/Contact.tsx` (created) — 'use client' Contact section with email button + 3 socials + 2 CV downloads
- `components/sections/Contact.test.tsx` (expanded) — 11 tests across 5 describe blocks: email row (4), 3 social links (3), 2 CV download buttons (2), section title + intro (2)

## Decisions Made

- **AnimatePresence mode="wait"** (not `popLayout`) for the Copy↔Check icon swap — sequential transition matches user expectation for a 2-state icon. `popLayout` is reserved for ProjectGrid in 04-03 where multiple cards reflow during filter changes.
- **Silent clipboard rejection** — try/catch with empty catch block per Phase 2 D-02 precedent. No console call. Rationale: the email is also visible on screen and reachable via the mailto: anchor below; a recruiter who can't copy via the API can still proceed. v2 deferred idea: surface a "select + copy" fallback tooltip on rejection.
- **lucide brand-icon substitutions** (Code2 / Briefcase / Mail) reused from Phase 3 D-23 — avoids downgrading lucide-react which would cascade through PaletteFab and the rest of Phase 3.
- **Button asChild + <a href download>** for CV downloads instead of a programmatic `link.click()` — the native HTML attribute is more accessible (Tab-reachable as a real anchor) and forces save-as without JS.
- **sr-only aria-live="polite"** for the emailCopied feedback — screen readers announce the copy; sighted users see the icon swap as the visual feedback. No tooltip needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Wave 0 motion/react mock returned a plain object as JSX child**
- **Found during:** Task 1 verification (when running `npx vitest run components/sections/Contact.test.tsx`)
- **Issue:** The Wave 0 RED harness mocked `motion.span` as `((props) => ({ type: 'span', props }) as unknown as React.ReactElement)` — this is a plain object, not a valid React element, so the reconciler threw "Objects are not valid as a React child" when the AnimatePresence children flowed into the DOM tree.
- **Fix:** Replaced the mock with `React.createElement('span', rest, children)` so motion.span renders a real span element. This is what Task 2 was always going to do (the Wave 0 harness was explicitly RED and labeled "RED until Wave 1 ships"), so the fix is scope-aligned: Task 2 replaces the harness with the full HOME-07 suite.
- **Files modified:** components/sections/Contact.test.tsx
- **Verification:** 11/11 tests pass.
- **Committed in:** 9331909 (Task 2 commit — the test-expansion task)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Bug, in-scope per the Wave 0 RED→GREEN plan structure)
**Impact on plan:** No scope creep. The Wave 0 harness was explicitly RED and Task 2 was designed to replace it; the broken mock was the planned bridge to a working suite.

## Issues Encountered

- **`console.error` in JSDoc comments tripped the contact-impl-ok verifier.** The plan's automated verifier greps the source file for `console.(error|warn|log)` and rejects ANY match. Two JSDoc comments mentioned "no console.error" in their explanatory text, which triggered the regex. Fix: rephrased to "no error log" + "No log call." Behavior unchanged — purely a comment-string adjustment so the silent-fail mandate verifier passes.

## User Setup Required

None — no external service configuration required. Pre-deploy the user still needs to:

1. Update `EMAIL` in `lib/constants.ts` from `tanguy@example.com` to the real address.
2. Update `LINKEDIN_URL` in `lib/constants.ts` to the real LinkedIn profile URL.
3. Replace `public/cv-en.pdf` (currently a copy of the FR PDF from Wave 0) with the real translated EN CV PDF.

These are tracked in the Wave 0 D-06 deferred list and the Phase 4 CONTEXT.md deferred-ideas section. The Contact component requires zero code changes for any of them — the data swap is a 1-file edit.

## Next Phase Readiness

- HOME-07 complete. The Contact section is fully wired to `app/[locale]/page.tsx` via the existing Wave 0 import.
- Compatible with Phase 6 a11y sweep: button has `aria-label`, social anchors have localized `aria-label`, mailto anchor uses `aria-label="Email"`, sr-only `aria-live="polite"` announces copy, CV buttons use real `<a>` semantics with download attribute.
- Compatible with Phase 7 deploy: all swappable data centralized in `lib/constants.ts` (D-06) and the CV PDFs are already in `public/`.
- Wave 1 of Phase 4 contributes Contact alongside Hero (04-01), About (04-02), and Skills (04-04). Wave 2 (04-03 Projects family) is independent and depends only on Wave 0 stub MDX content.

---

## Self-Check: PASSED

- FOUND: components/sections/Contact.tsx
- FOUND: components/sections/Contact.test.tsx
- FOUND: .planning/phases/04-homepage-sections/04-05-contact-SUMMARY.md
- FOUND: commit fcb2437 (Task 1)
- FOUND: commit 9331909 (Task 2)

---

*Phase: 04-homepage-sections*
*Plan: 05-contact*
*Completed: 2026-05-27*
