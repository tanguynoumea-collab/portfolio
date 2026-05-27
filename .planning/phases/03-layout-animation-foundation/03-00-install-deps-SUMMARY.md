---
phase: 03-layout-animation-foundation
plan: 00
subsystem: infra
tags: [gsap, lenis, react, animation, scroll, dependencies]

# Dependency graph
requires:
  - phase: 02-palette-system
    provides: motion@^12.40.0 (already installed Phase 2 W0; preserved unchanged)
provides:
  - gsap@^3.15.0 in dependencies (bundles ScrollTrigger + SplitText, free since Apr 2025)
  - "@gsap/react@^2.1.2 in dependencies (useGSAP hook with React 19 cleanup semantics)"
  - lenis@^1.3.23 in dependencies (smooth-scroll engine, Darkroom Engineering rebrand)
  - Phase 3 Wave 0 install gate unblocked — Wave 1 (LenisProvider, root-layout font) can now import
affects: [03-01-lenis-provider, 03-02-root-layout-font, 03-03-navigation-lang-switcher, 03-04-footer, 03-05-cursor-transitions-ascii]

# Tech tracking
tech-stack:
  added: [gsap@3.15.0, "@gsap/react@2.1.2", lenis@1.3.23]
  patterns: [
    "Caret-prefix locked semver per CONTEXT.md D-01 (^3.13.0 / ^2.1.2 / ^1.3.0) — npm resolved to latest compatible minors",
    "Single npm install command for atomic dep-graph resolution",
    "All animation deps live in dependencies (NOT devDependencies) — required at runtime"
  ]

key-files:
  created: []
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Used caret-prefix semver (^3.13.0/^2.1.2/^1.3.0) so npm resolved to latest compatible minors: gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.23"
  - "Did NOT install @studio-freight/lenis or @studio-freight/react-lenis (legacy/abandoned packages — Lenis rebranded to plain `lenis` after Darkroom Engineering split from Studio Freight)"
  - "Did NOT install ScrollTrigger separately — it ships bundled inside gsap since the April 2025 Webflow acquisition made the Club plugins free"
  - "Did NOT touch motion@^12.40.0 — already on disk from Phase 2 W0, preserved unchanged"
  - "All three packages went into `dependencies` (NOT devDependencies) — they are imported at runtime by client components"

patterns-established:
  - "Wave 0 install gate convention: single atomic npm install with all wave's net-new deps + lint+build+test verification before any code lands"
  - "Phase 2 baseline preservation: every Wave 0 install must keep the 94/94 Vitest baseline green (canary for peer-dep regressions)"

requirements-completed: [LAYOUT-02]

# Metrics
duration: 1m 32s
completed: 2026-05-27
---

# Phase 3 Plan 00: Install Animation Deps Summary

**gsap@3.15.0 + @gsap/react@2.1.2 + lenis@1.3.23 installed at locked caret versions; Phase 2's 94/94 Vitest baseline preserved; lint+build+test all exit 0**

## Performance

- **Duration:** 1m 32s
- **Started:** 2026-05-27T06:57:14Z
- **Completed:** 2026-05-27T06:58:46Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Phase 3 Wave 0 install gate cleared — three net-new animation dependencies added to `package.json` dependencies block in a single atomic `npm install`.
- `gsap@^3.13.0` resolved to `3.15.0` (bundles ScrollTrigger + SplitText since the April 2025 Webflow/GSAP-free transition — no separate `gsap-trial` or Club access needed).
- `@gsap/react@^2.1.2` resolved to `2.1.2` exact (the `useGSAP()` hook with React 19 strict-mode-double-invoke + cleanup-on-unmount semantics; required by CLAUDE.md "GSAP toujours dans hooks `useGSAP()` pour cleanup automatique").
- `lenis@^1.3.0` resolved to `1.3.23` (Darkroom Engineering rebrand, NOT the legacy `@studio-freight/lenis` package; ships the React wrapper at `lenis/react` in the same package).
- `motion@^12.40.0` preserved untouched from Phase 2 W0 (verified via `grep "motion"` of package.json before+after).
- Phase 2 baseline of 94/94 Vitest tests still green — `npm test` exit 0 confirmed no peer-dep regression.
- `npm run lint` exit 0 (no new code, so this catches accidental package.json formatting drift only — clean).
- `npm run build` exit 0 — Next.js 16.2.6 + TypeScript strict resolves the new dep graph in 1989ms compile + 2.7s TS pass; static routes (`/`, `/_not-found`, `/[locale]`) generate cleanly.
- No `@studio-freight/*` legacy packages present anywhere in `package.json` (verified by grep).

## Task Commits

Each task was committed atomically:

1. **Task 1: Install gsap + @gsap/react + lenis at locked versions** — `37cca57` (chore)

_Note: This is a one-task plan (Wave 0 install gate). The plan metadata commit will follow this SUMMARY._

## Files Created/Modified

- `package.json` — Added 3 entries to `dependencies` (alphabetical: `@gsap/react`, `gsap`, `lenis`); other 24 deps unchanged
- `package-lock.json` — npm regenerated with 3 new top-level packages + their transitive deps (audit: "added 3 packages, audited 985 packages")

## Decisions Made

- **Caret-prefix semver (per CONTEXT.md D-01):** Used `^3.13.0` / `^2.1.2` / `^1.3.0` instead of exact pins so npm can upgrade to compatible minors without manual intervention. Outcome: resolved to 3.15.0 / 2.1.2 / 1.3.23 at install time. The recorded `package.json` entries match the acceptance-criteria regexes `"gsap": "\^3\.1[0-9]"`, `"@gsap/react": "\^2\.1"`, `"lenis": "\^1\.3"`.
- **Single `npm install` for all three packages:** One command so npm resolves the dep graph in a single pass and lockfile reflects an atomic snapshot. Alternative (three separate installs) would produce three lockfile-mutating commits and a chattier diff.
- **No `ScrollTrigger` separate install:** Confirmed via the GSAP April-2025 free-tier announcement that ScrollTrigger, SplitText, and ScrollSmoother now ship inside the main `gsap` package — no `gsap-trial` or Club registration. Plan 03-01 (LenisProvider) will `import { ScrollTrigger } from 'gsap/ScrollTrigger'` and `gsap.registerPlugin(ScrollTrigger)`; both resolve from the single `gsap@3.15.0` install.
- **`motion@^12.40.0` left untouched:** PROJECT.md and Phase 2 SUMMARY confirm `motion` was installed in Phase 2 W0. Running `npm install motion` again would have been a no-op but might have shifted the lockfile resolution. Confirmed via pre-/post-install grep that the `"motion": "^12.40.0"` line is identical.

## Deviations from Plan

None — plan executed exactly as written.

**Total deviations:** 0
**Impact on plan:** Plan was a clean Wave 0 install gate. No code changes, no API discoveries, no scope adjustments. Acceptance criteria all met on first verification pass.

## Issues Encountered

- **Pre-existing npm warning (informational, not a regression):** `npm install` emitted `npm warn EBADENGINE` for `mute-stream@4.0.0` (declares engines `node: '^22.22.2 || ^24.15.0 || >=26.0.0'` but local Node is `v24.14.1`). This is a transitive dep of an existing toolchain package (likely from `shadcn` or `eslint`), NOT introduced by this install, and is silent for `next build` / `next dev`. Out of scope per execute-plan.md SCOPE BOUNDARY rule (pre-existing warnings in unrelated tree).
- **Pre-existing `npm audit` advisory (informational, not a regression):** `2 moderate severity vulnerabilities` reported, pre-existing from prior phases. Out of scope per SCOPE BOUNDARY rule.

## User Setup Required

None — no external service configuration required. This is a pure dependency install.

## Next Phase Readiness

**Wave 1 (this phase) ready to start:**
- `03-01-lenis-provider-PLAN.md` can now `import Lenis from 'lenis'` and `import { useGSAP } from '@gsap/react'` and `import gsap from 'gsap'` + `import { ScrollTrigger } from 'gsap/ScrollTrigger'`.
- The single-RAF pattern from CLAUDE.md / Key Decisions ("Single RAF Lenis + GSAP via `gsap.ticker`") is unblocked at the import layer.

**Wave 2/3 (this phase) ready to start (transitively):**
- `03-02-root-layout-font-PLAN.md` (font wiring) does not consume these deps directly but blocks on `LenisProvider` being available.
- `03-03..05` (Nav, Footer, Cursor/Transitions/ASCII) can import the same animation primitives.

**No blockers introduced.** No environment variables, no external services, no DB migrations.

## Self-Check: PASSED

All acceptance criteria verified post-install:

- [x] `package.json` line matches regex `"gsap": "\^3\.1[0-9]"` → `"gsap": "^3.15.0"` (15>=10, passes)
- [x] `package.json` line matches regex `"@gsap/react": "\^2\.1"` → `"@gsap/react": "^2.1.2"`
- [x] `package.json` line matches regex `"lenis": "\^1\.3"` → `"lenis": "^1.3.23"`
- [x] `package.json` does NOT contain `@studio-freight/lenis` (grep: 0 matches)
- [x] `package.json` does NOT contain `@studio-freight/react-lenis` (grep: 0 matches)
- [x] `package.json` still contains `"motion": "^12.40.0"` (unchanged from Phase 2)
- [x] `node_modules/gsap/package.json` exists (943-byte verified)
- [x] `node_modules/@gsap/react/package.json` exists (2550-byte verified)
- [x] `node_modules/lenis/package.json` exists (2568-byte verified, version 1.3.23 confirmed)
- [x] `npm run lint` exit 0
- [x] `npm run build` exit 0 (Next 16.2.6 Turbopack, 1989ms compile, TS 2.7s)
- [x] `npm test` exit 0 with 94 passing tests (Phase 2 baseline)
- [x] Commit `37cca57` exists in git log

---
*Phase: 03-layout-animation-foundation*
*Completed: 2026-05-27*
