---
phase: 06-seo-accessibility-polish
plan: 00
subsystem: testing
tags: [vitest-axe, axe-core, lighthouse, satori, next-og, og-image, images-avif-webp, metadataBase]

# Dependency graph
requires:
  - phase: 02-palette-system
    provides: lib/colors.ts oklchToHex (Wave 1 OG hex), validateFullMatrix (Wave 1 stress test)
  - phase: 05-project-content-pipeline
    provides: getProjectSlugs (Wave 1 sitemap), project generateMetadata (Wave 1 expands)
provides:
  - "vitest-axe@1.0.0-pre.5 (exact pin) dev dep with toHaveNoViolations matcher wired via setupFiles"
  - "lighthouse@^13.3.0 dev dep + lighthouse + lighthouse:mobile npm scripts"
  - "assets/Inter-SemiBold.ttf — real static ttf (419744 B) for Satori OG font loading"
  - "SITE_URL constant in lib/constants.ts (env-aware metadataBase source)"
  - "next.config.ts images.formats ['image/avif','image/webp'] (A11Y-06)"
  - ".gitignore /.lighthouse/ report dir"
affects: [06-01-metadata-seo, 06-04-a11y-audit, 06-05-lighthouse]

# Tech tracking
tech-stack:
  added: [vitest-axe@1.0.0-pre.5, lighthouse@^13.3.0]
  patterns:
    - "Additive Vitest setupFiles: only extends expect with the axe matcher, does NOT globally extend jest-dom (chai-matcher tests stay intact)"
    - "Exact (no-caret) pin for prerelease dep where the caret would resolve to a stale tag"
    - "Bundled static ttf for Satori (next/font woff2 subsets are unusable by Satori)"

key-files:
  created:
    - vitest-setup.ts
    - vitest-axe.d.ts
    - assets/Inter-SemiBold.ttf
    - .planning/phases/06-seo-accessibility-polish/deferred-items.md
  modified:
    - package.json
    - package-lock.json
    - vitest.config.ts
    - lib/constants.ts
    - next.config.ts
    - .gitignore

key-decisions:
  - "vitest-axe pinned EXACTLY 1.0.0-pre.5 (npm rewrote to caret on install; manually reverted) — the latest tag is the stale 2022 0.1.0 lacking the ./matchers subpath"
  - "Sourced Inter-SemiBold.ttf from the rsms/inter v4.1 release zip (extras/ttf/, 419744 B) — the old docs/font-files/ raw path and google/fonts static dir both 404; google/fonts only ships the 876KB variable font (over Satori's 500KB budget)"
  - "next/og remains the built-in OG path — NO @vercel/og, NO @types/vitest-axe added"

patterns-established:
  - "Additive setupFiles for vitest-axe matcher (no jest-dom global extend)"
  - "Exact-pin a prerelease whose dist-tag is stale"

requirements-completed: [A11Y-04, A11Y-06, A11Y-08, A11Y-01]

# Metrics
duration: 10min
completed: 2026-05-28
---

# Phase 6 Plan 00: Install Audit Deps Summary

**Wave 0 infra gate: vitest-axe@1.0.0-pre.5 (exact) + lighthouse installed, the axe `toHaveNoViolations` matcher wired into the existing 276-test suite without disturbing the chai tests, a real 419KB Inter-SemiBold.ttf bundled for Satori OG, SITE_URL + images.formats added — npm test/lint/build all green.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-28T08:45:00 (local)
- **Completed:** 2026-05-28T06:49:56Z
- **Tasks:** 3
- **Files modified:** 6 modified + 4 created (incl. deferred-items.md)

## Accomplishments
- `vitest-axe@1.0.0-pre.5` pinned EXACTLY (no caret) + `lighthouse@^13.3.0`; `lighthouse` + `lighthouse:mobile` npm scripts added (A11Y-08)
- axe matcher wired: `vitest-setup.ts` (`expect.extend(matchers)`) + `vitest-axe.d.ts` (TS augmentation) + `vitest.config.ts` `setupFiles: ['./vitest-setup.ts']` — additive, so the 276 chai-matcher tests stay green
- Real static `assets/Inter-SemiBold.ttf` (419744 B, valid sfnt `0x00010000`, under the 500KB Satori budget) bundled for Wave 1 OG cards
- `SITE_URL` (env-aware, trailing-slash-stripped) added to `lib/constants.ts` as the `metadataBase` source (D-01)
- `next.config.ts` `images.formats: ['image/avif','image/webp']` (A11Y-06/D-13); MDX + next-intl wiring untouched
- `/.lighthouse/` ignored; verified `npm test` (276), `npm run lint`, `npm run build` all exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Install vitest-axe (exact) + lighthouse + scripts** - `112eb76` (chore)
2. **Task 2: Wire axe matcher + SITE_URL + images.formats + .gitignore** - `f145d5d` (feat)
3. **Task 3: Bundle Inter-SemiBold.ttf + verify suite/build** - `7e7654c` (chore)

**Plan metadata:** (final docs commit — see git log)

## Files Created/Modified
- `package.json` - vitest-axe (exact 1.0.0-pre.5) + lighthouse dev deps; lighthouse + lighthouse:mobile scripts
- `package-lock.json` - lockfile for the two new dev deps (+164 transitive)
- `vitest-setup.ts` - registers vitest-axe matchers via `expect.extend` (additive)
- `vitest-axe.d.ts` - TS augmentation so `toHaveNoViolations()` typechecks (`AxeMatchers`)
- `vitest.config.ts` - `setupFiles: []` → `['./vitest-setup.ts']`
- `lib/constants.ts` - add env-aware `SITE_URL` (kept EMAIL/GITHUB_URL/LINKEDIN_URL)
- `next.config.ts` - add `images.formats` AVIF/WebP (kept pageExtensions + withNextIntl(withMDX))
- `.gitignore` - add `/.lighthouse/`
- `assets/Inter-SemiBold.ttf` - Satori OG font (419744 B static ttf)
- `.planning/phases/06-seo-accessibility-polish/deferred-items.md` - logs out-of-scope pre-existing tsc test-file errors

## Decisions Made
- **Exact pin for vitest-axe:** npm rewrote the install to `^1.0.0-pre.5`; manually reverted to the bare `1.0.0-pre.5`. The `latest` dist-tag is the stale 2022 `0.1.0`, which lacks the `./matchers` subpath and bundles old axe-core. Verified the installed package exposes `./matchers` → `dist/matchers.js` and reports version `1.0.0-pre.5`.
- **Font sourcing:** Both the plan's primary URL (`rsms/inter` `docs/font-files/Inter-SemiBold.ttf`) and the google/fonts `static/` dir return 404 HTML; google/fonts now ships only the 876KB variable font (over Satori's 500KB budget). Fell back to the official `rsms/inter` v4.1 release zip and extracted `extras/ttf/Inter-SemiBold.ttf` (419744 B static SemiBold). This is the plan's own sanctioned fallback ("the Inter release zip on github.com/rsms/inter/releases").
- **No @vercel/og, no @types/vitest-axe** — next/og is built-in; vitest-axe ships its own `.d.ts`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's matchers acceptance command was broken by the package's `exports` map**
- **Found during:** Task 1 (verify vitest-axe `./matchers` export)
- **Issue:** The plan's acceptance command `node -e "require('vitest-axe/package.json').exports..."` throws `ERR_PACKAGE_PATH_NOT_EXPORTED` — vitest-axe's `exports` map does not expose `./package.json`, so the resolver refuses the subpath. This is NOT a stale-package signal; it is the package restricting subpath access.
- **Fix:** Verified the same fact by reading `node_modules/vitest-axe/package.json` from disk directly (`fs.readFileSync`) and confirming `require.resolve('vitest-axe/matchers')` → `dist/matchers.js`. The substantive acceptance (`./matchers` exists, version is `1.0.0-pre.5`) holds.
- **Files modified:** None (verification-command correction only)
- **Verification:** `require.resolve('vitest-axe/matchers')` resolves; installed version `1.0.0-pre.5`
- **Committed in:** N/A (no file change)

**2. [Rule 1 - Blocking] Plan's primary font-download URL 404'd**
- **Found during:** Task 3 (bundle Inter-SemiBold.ttf)
- **Issue:** `curl` of `rsms/inter/raw/master/docs/font-files/Inter-SemiBold.ttf` returned a 306KB GitHub 404 HTML page (first bytes `<!DOCTYPE html>`), not a font. The google/fonts `static/` fallback returned a 14-byte `404:` string.
- **Fix:** Downloaded the official `rsms/inter` v4.1 release zip (33MB, valid `PK` magic), extracted `extras/ttf/Inter-SemiBold.ttf` (419744 B, valid sfnt `0x00010000`) to `assets/`, and deleted the temp zip. This is the plan's documented fallback source.
- **Files modified:** assets/Inter-SemiBold.ttf
- **Verification:** Size 419744 B (>50KB, <500KB), sfnt header `0x00010000`; plan's font-validation node check passes
- **Committed in:** `7e7654c` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 broken verification command corrected, 1 blocking 404 fallback). Plus 1 out-of-scope discovery logged to `deferred-items.md` (5 pre-existing `tsc --noEmit` test-file errors — verified present on the clean baseline, NOT introduced here; do not affect npm test/lint/build).
**Impact on plan:** No scope creep. All shared Wave 0 infra landed exactly as specified; only the literal download URL and one acceptance command needed correcting to known-good equivalents.

## Issues Encountered
- The first `npm install` rewrote the vitest-axe pin to a caret — corrected to the exact literal (and re-verified the installed dir is `1.0.0-pre.5`).
- `npx tsc --noEmit` surfaces 5 pre-existing `vi.fn()` generic-inference errors in test files (About/Hero/useParallax). Confirmed via `git stash` that they exist on the baseline without any Wave 0 edit — out of scope, logged to `deferred-items.md`. `next build`'s own typecheck and `npm test`/`npm run lint` all pass.

## User Setup Required
None - no external service configuration required. (`NEXT_PUBLIC_SITE_URL` is env-overridable but defaults to the `https://tanguy.dev` placeholder; the real domain is a Phase 7 concern.)

## Next Phase Readiness
- **Wave 1 unblocked:** `SITE_URL` (metadataBase) + `assets/Inter-SemiBold.ttf` (OG font) ready for 06-01 (metadata + OG cards); `images.formats` set for the A11Y-06 audit.
- **Wave 2 unblocked:** the `toHaveNoViolations` matcher resolves in the existing suite for 06-04 a11y tests; `lighthouse:mobile` script ready for 06-05.
- No blockers. Pre-existing test-file `tsc` errors are tracked in `deferred-items.md` (candidate cleanup in 06-04).

## Self-Check: PASSED

All claimed files exist on disk; all task commit hashes (`112eb76`, `f145d5d`, `7e7654c`) exist in the git log.

---
*Phase: 06-seo-accessibility-polish*
*Completed: 2026-05-28*
