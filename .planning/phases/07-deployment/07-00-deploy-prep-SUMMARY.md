---
phase: 07-deployment
plan: 00
subsystem: infra
tags: [vercel, analytics, speed-insights, ci, github-actions, deployment, next16, tsx-gates]

# Dependency graph
requires:
  - phase: 06-seo-accessibility-polish
    provides: "SITE_URL/metadataBase + the gate-script pattern (check-i18n-parity / check-mdx-structure / check-reduced-motion / check-image-audit) + 336-test suite"
  - phase: 03-layout-animation-foundation
    provides: "app/[locale]/layout.tsx Server-Component provider tree (PaletteFab is the last <body> child the analytics components mount after)"
provides:
  - "Vercel Web Analytics + Speed Insights mounted from /next in app/[locale]/layout.tsx (layout stays a Server Component)"
  - "3 new headless gates: check-analytics (DEPLOY-03 mount), check-env-leak (D-08 NEXT_PUBLIC_* leak), check-readme (DEPLOY-01 README + repo-URL consistency)"
  - "Real portfolio README replacing the create-next-app scaffold"
  - ".github/workflows/ci.yml (Node 22: ci + lint + test + 6 gates + build; no lighthouse)"
  - "Branch renamed master -> main"
  - "PRE-DEPLOY-CHECKLIST.md enumerating every content placeholder (D-10)"
affects: [07-go-live, deployment, milestone-v1.0-close]

# Tech tracking
tech-stack:
  added: ["@vercel/analytics@^2.0.1", "@vercel/speed-insights@^2.0.0", "GitHub Actions CI"]
  patterns: ["RSC-safe /next analytics wrappers mounted as last <body> children with NO top-level 'use client'", "tsx exit-0/1 gate scripts modeled on check-i18n-parity.ts", "git ls-files tracked-tree scan for leak detection"]

key-files:
  created:
    - scripts/check-analytics.ts
    - scripts/check-env-leak.ts
    - scripts/check-readme.ts
    - .github/workflows/ci.yml
    - .planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md
  modified:
    - app/[locale]/layout.tsx
    - package.json
    - package-lock.json
    - README.md

key-decisions:
  - "Both analytics deps pinned at ^2 (STACK.md's ^1.x was stale); imported from /next (NOT /react) for App Router route tracking"
  - "Analytics + SpeedInsights mounted as plain last <body> children outside the provider tree — they need no i18n/Theme/Lenis context"
  - "Layout stays a Server Component — the /next wrappers carry their own client boundary; check-analytics asserts no top-level 'use client'"
  - "ci.yml uses the locked research YAML verbatim (Node 22, all 6 existing gates + build, lighthouse deliberately excluded as env-sensitive HUMAN-UAT)"
  - "check-env-leak scans only git-tracked source files (git ls-files), allowlisting NEXT_PUBLIC_SITE_URL and flagging secret heuristics"

patterns-established:
  - "RSC-safe analytics wrappers: /next entry points let a Server Component layout host client-only beacons without a 'use client' directive"
  - "Repo-URL single-source-of-truth gate: check-readme cross-checks GITHUB_URL across constants.ts + ascii.ts + README so D-02's owner change forces all three together"

requirements-completed: [DEPLOY-01, DEPLOY-03]

# Metrics
duration: 6min
completed: 2026-05-28
---

# Phase 7 Plan 00: Deploy Prep Summary

**Vercel Analytics + Speed Insights mounted from `/next` in the Server-Component layout, 3 new headless deploy gates (analytics-mount / NEXT_PUBLIC_ leak / README + repo-URL consistency), a real portfolio README, a Node-22 CI workflow, and `master`→`main` — all green and push-ready (DEPLOY-01 + DEPLOY-03 automatable halves).**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-28T13:09:15Z
- **Completed:** 2026-05-28T13:15:07Z
- **Tasks:** 3
- **Files modified:** 9 (5 created, 4 modified)

## Accomplishments

- Installed `@vercel/analytics@^2.0.1` + `@vercel/speed-insights@^2.0.0` and mounted `<Analytics />` + `<SpeedInsights />` from `/next` as the last `<body>` children — the layout stays a Server Component (no top-level `'use client'`); production build (Next 16 / Turbopack) exits 0 with all 20 static pages + 12 project routes intact.
- Wrote 3 headless `tsx` gates (modeled on `check-i18n-parity.ts`): `check-analytics` (asserts both `/next` imports + both components + no client directive), `check-env-leak` (D-08 — scans the git-tracked tree, only `NEXT_PUBLIC_SITE_URL` allowed, secret heuristics flagged), `check-readme` (DEPLOY-01 — rejects scaffold boilerplate, requires portfolio markers, asserts `GITHUB_URL` consistency across `constants.ts`/`ascii.ts`/`README`). Aliased all 3 in `package.json`.
- Replaced the create-next-app scaffold README with a real portfolio README (pitch, signature features, Next.js 16 stack, local dev, scripts table, deploy note) consistent with `tanguynoumea/portfolio`.
- Added `.github/workflows/ci.yml` (Node 22, npm cache): `npm ci` + lint + test + palette/i18n/mdx/reduced-motion/image gates + build — no lighthouse (env-sensitive, stays HUMAN-UAT).
- Renamed the branch `master` → `main`; generated `PRE-DEPLOY-CHECKLIST.md` enumerating all 10 content placeholders (bio, photo, email, LinkedIn, GitHub URL, covers/gallery, MDX bodies, CV-EN, `NEXT_PUBLIC_SITE_URL`, skills).
- Full pre-push suite green locally: **336 Vitest tests**, all 5 palettes pass the 7-pair WCAG matrix, 40-palette stress, i18n parity (94 paths), MDX (12 files), reduced-motion, images, all 3 new gates, `npm run build` exit 0 — so CI will be green when 07-01 pushes.

## Task Commits

Each task was committed atomically (all on `main` after the Task-2 rename):

1. **Task 1: Vercel deps + analytics mount + 3 gates + aliases** - `660e222` (feat)
2. **Task 2: README rewrite + ci.yml + master→main + checklist** - `4e553c9` (docs)
3. **Task 3 fix: check-readme return-type under noUncheckedIndexedAccess** - `a9bb266` (fix)

**Plan metadata:** _(final docs commit — SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md)_

_Note: Task 3 was verification + commit; its only code change was the auto-fix in `a9bb266` (see Deviations). The plan's 9 files were committed across 660e222 + 4e553c9; the rename is git state._

## Files Created/Modified

- `app/[locale]/layout.tsx` - Mounted `<Analytics />` + `<SpeedInsights />` from `@vercel/analytics/next` + `@vercel/speed-insights/next` as last `<body>` children; layout unchanged otherwise (FOUC script / providers / metadata byte-identical).
- `scripts/check-analytics.ts` - DEPLOY-03 static gate: 4 required markers + no top-level `'use client'`.
- `scripts/check-env-leak.ts` - D-08 gate: `git ls-files` tracked-tree scan; only `NEXT_PUBLIC_SITE_URL`; secret heuristics.
- `scripts/check-readme.ts` - DEPLOY-01 gate: no scaffold boilerplate + portfolio markers + repo-URL consistency.
- `README.md` - Real portfolio README (replaced scaffold).
- `.github/workflows/ci.yml` - Node-22 CI (lint + test + gates + build).
- `.planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md` - D-10 placeholder enumeration.
- `package.json` - 2 runtime deps at `^2` + 3 `check:*` aliases.
- `package-lock.json` - Lockfile updated for the 2 new deps.

## Decisions Made

- **`/next` not `/react`** for both analytics imports — `/react` silently drops App Router route tracking (Pitfall 1). Verified the layout stays a Server Component (Pitfall 3).
- **Both deps at `^2`** — re-verified at plan time (analytics 2.0.1, speed-insights 2.0.0); STACK.md's `^1.x` was stale. Basic `<Analytics />`/`<SpeedInsights />` API is unchanged across the major.
- **ci.yml verbatim from research** — Node 22 matches Vercel's build runtime; lighthouse intentionally excluded (needs a running server + headless Chrome; the deployed measurement is D-09 / HUMAN-UAT in 07-01).
- **`check-env-leak` scans only `git ls-files`** — matches the "tracked tree" requirement; `.env*.local`/`.vercel` are `.gitignore`d and out of scope. Self-skips the two gate scripts that name `NEXT_PUBLIC_*` in prose/regex.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] check-readme `ownerRepo` return type under `noUncheckedIndexedAccess`**
- **Found during:** Task 3 (full-suite verification — `npm run build`)
- **Issue:** The repo's `tsconfig` has `noUncheckedIndexedAccess: true` (per CLAUDE.md), so `m[1]` is typed `string | undefined`, which is not assignable to the declared `string | null` return of `ownerRepo()`. `next build`'s TypeScript pass (which type-checks the whole repo including `scripts/`) failed with exit 1. This was a bug in code written earlier in this same plan (Task 1), surfaced only by the build's stricter whole-repo check.
- **Fix:** Changed `return m ? m[1] : null;` to `return m?.[1] ?? null;` (collapses `undefined` to `null`).
- **Files modified:** `scripts/check-readme.ts`
- **Verification:** `npx tsx scripts/check-readme.ts` still exits 0 (gate behavior unchanged); `npx eslint scripts/check-readme.ts` clean; `npm run build` then exits 0.
- **Committed in:** `a9bb266`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for the build to pass; gate semantics unchanged. No scope creep. All other tasks executed exactly as written.

## Issues Encountered

- **CRLF normalization warnings** on every commit (`LF will be replaced by CRLF`) — benign Windows line-ending behavior, pre-existing repo configuration, no functional impact.
- **`HTMLCanvasElement.getContext()` jsdom info line** during `npm test` — benign (canvas-confetti under jsdom); the 336 tests still pass.
- **`EBADENGINE` npm warning** for a transitive dep (`mute-stream`) preferring a slightly newer Node patch than local v24.14.1 — benign, install succeeded; CI runs Node 22.

## User Setup Required

None in this plan. **07-01 (go-live) carries the human-action checkpoints:** GitHub repo owner confirmation (D-02), Vercel OAuth/connect + `NEXT_PUBLIC_SITE_URL` env var + Enable Analytics/Speed Insights in the dashboard (D-06/D-08), and the deployed Lighthouse measurement (D-09). See `PRE-DEPLOY-CHECKLIST.md` for the content swaps.

## Next Phase Readiness

- The repo is **push-ready on `main`**: analytics instrumented, README real, CI rail in place, all gates + build green locally (⇒ green in CI).
- **07-01 takes over** for the `gh repo create … --push` (D-02 account checkpoint) + the Vercel connect/env/deploy human-action checkpoints + deployed Lighthouse. None of those are headless-automatable — they correctly pause for the user.
- **Watch item:** local Perf-69 (Phase 6) is pessimistic; D-09 measures the deployed Vercel URL first and only code-splits below-fold sections (NEVER Hero) if deployed Perf < 90.

## Self-Check: PASSED

All 8 created/modified files verified present; all 3 task commits (`660e222`, `4e553c9`, `a9bb266`) verified in history.

---
*Phase: 07-deployment*
*Completed: 2026-05-28*
