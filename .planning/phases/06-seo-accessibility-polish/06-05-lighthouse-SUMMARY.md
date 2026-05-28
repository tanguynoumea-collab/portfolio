---
phase: 06-seo-accessibility-polish
plan: 05
subsystem: testing
tags: [lighthouse, performance, seo, accessibility, best-practices, pre-deploy-gate, human-uat]

# Dependency graph
requires:
  - phase: 06-00-install-audit-deps
    provides: lighthouse@^13.3.0 dev dep + lighthouse / lighthouse:mobile npm scripts + /.lighthouse/ gitignore
  - phase: 06-01-metadata-seo
    provides: metadata/OG/sitemap/robots that the SEO + BP categories score against
  - phase: 06-02-route-states
    provides: loading/error/not-found route states present in the production build
provides:
  - Four recorded Lighthouse mobile scores for the homepage (/en) against a production build — A11Y-08 local pre-deploy evidence
  - Confirmed lighthouse:mobile npm script runs end-to-end (build -> next start -> headless Chrome -> report)
affects: [phase-07-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lighthouse local gate: npm run build -> npm run start (background) -> poll :3000 until ready -> npx lighthouse <url> --form-factor=mobile --output=html --output=json --output-path=./.lighthouse/mobile (parent dir must exist first; multi-output appends .report.html/.report.json)"
    - "On Windows, chrome-launcher's destroyTmp can throw EPERM during post-run temp cleanup AFTER the report is already written — treat as a benign cleanup race, not a measurement failure (verify the report files exist)"

key-files:
  created:
    - .lighthouse/mobile.report.html (gitignored — local audit artifact)
    - .lighthouse/mobile.report.json (gitignored — local audit artifact)
  modified: []

key-decisions:
  - "Performance 69 (< 90) is NOT a blocker: driven by the GSAP+Lenis+Motion JS bundle main-thread cost (TBT 580ms, TTI 5.7s, LCP 4.5s on text) + local `next start` lacking edge CDN compression/HTTP-2 — both environment-sensitive (Pitfall 5) and/or architectural (code-splitting deferred per CLAUDE.md). No deterministic in-scope fix exists (images all score 1, metadata green, fonts already preload:true). Authoritative >=90 is on the deployed Vercel URL in Phase 7 (A11Y-08 wording: 'deployee Vercel')."
  - "Lighthouse run against /en (explicit EN route) per the script + plan; FR canonical / rewrites internally and returns 200."
  - "Created the .lighthouse/ output dir (06-00 only gitignored it); multi-output Lighthouse needs the parent dir to pre-exist."

metrics:
  duration: 6m
  tasks_completed: 1
  files_created: 0
  files_modified: 0
  completed: 2026-05-28
---

# Phase 6 Plan 5: Lighthouse Local Pre-Deploy Gate Summary

Built the production bundle and ran Lighthouse mobile against the local production server (`/en`), recording the four category scores as A11Y-08 pre-deploy evidence. Three of four meet the >=90 target; Performance is below target for environment/architectural reasons that are out of scope for this audit phase and deferred to the authoritative Vercel run in Phase 7.

## What Was Built

- A clean production build (`npm run build`, exit 0) confirming all Phase 6 additions compile and prerender for production: the two dynamic `opengraph-image` routes (home + project `[slug]`), `sitemap.xml`, `robots.txt`, plus the 12 SSG project routes and the `[locale]` shell.
- An end-to-end local Lighthouse mobile run (headless Chrome via the existing `lighthouse:mobile` toolchain) producing an HTML + JSON report, with the four category scores extracted and recorded below.

## Lighthouse Mobile Scores (A11Y-08 evidence)

**Target:** Performance / Accessibility / Best Practices / SEO each >= 90.
**Run:** `http://localhost:3000/en` · Lighthouse 13.3.0 · `--form-factor=mobile` · throttling `simulate` (4x CPU, slow 4G) · production build via `next start` · 2026-05-28.

| Category | Score | Target | Status |
|----------|-------|--------|--------|
| Performance | **69** | >= 90 | BELOW — env/architectural, deferred to Phase 7 (see below) |
| Accessibility | **92** | >= 90 | PASS |
| Best Practices | **96** | >= 90 | PASS |
| SEO | **92** | >= 90 | PASS |

### Core metrics (mobile, simulated throttling)

| Metric | Value | Score |
|--------|-------|-------|
| First Contentful Paint | 1.1 s | 1.00 |
| Speed Index | 2.3 s | 0.98 |
| Largest Contentful Paint | 4.5 s | 0.36 |
| Total Blocking Time | 580 ms | 0.51 |
| Time to Interactive | 5.7 s | 0.68 |
| Cumulative Layout Shift | 0 | 1.00 |

### Why Performance is 69 (and why it is NOT a phase blocker)

FCP (1.1s) and CLS (0) are excellent. The drag is LCP (4.5s) + TBT (580ms) + TTI (5.7s), driven by:

- **Animation-library main-thread cost (architectural, deferred):** top failing diagnostics are `unused-javascript` (~118 KiB), `legacy-javascript` (~13 KiB), `mainthread-work-breakdown` (3.4s), and `forced-reflow` — the signature of GSAP + Lenis + Motion running in parallel, exactly as CLAUDE.md anticipates ("split the homepage into route-level chunks via `next/dynamic`"). The LCP element is the GSAP-revealed hero **text** (no image), so its delay is the JS animation settling under 4x CPU throttling, not an asset-loading issue. Code-splitting the animation stack is an architectural change explicitly out of scope for Phase 6 (this phase audits/polishes; it adds route-state pages, not homepage perf re-architecture).
- **Local `next start` vs edge CDN (environment-sensitive — Pitfall 5):** the two render-blocking resources are Tailwind's own CSS chunks (~230ms) served by a cold local `next start` without Brotli/gzip compression, HTTP-2 multiplexing, or edge caching. On Vercel these are compressed and edge-cached.

**No deterministic in-scope fix was available:** the image audits all score 1.00 (`unsized-images`, `image-size-responsive`, responsive/modern-format — A11Y-06 holds), metadata is complete (A11Y-01), and the Inter font is already `preload: true`. The plan and D-15 are explicit that the **authoritative >= 90 confirmation is on the deployed Vercel URL in Phase 7** (A11Y-08 wording: "deployee Vercel"); Phase 6 is the best-effort local pre-deploy gate and must not block on a throttled local Performance number.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Production build + Lighthouse mobile + record 4 scores | (docs commit below) | `.lighthouse/mobile.report.{html,json}` (gitignored artifacts) |

The checkpoint task (`checkpoint:human-verify`) was **auto-approved** under the active `--auto` chain (`workflow._auto_chain_active = true`), per the execution prompt's pre-approval instruction. The automatable measurement (the four scores) was run and is recorded above; the browser-only manual items are persisted as HUMAN-UAT below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created the `.lighthouse/` output directory**
- **Found during:** Task 1 (first Lighthouse invocation)
- **Issue:** Lighthouse multi-output (`--output=html --output=json`) appends `.report.html` / `.report.json` to `--output-path` and requires the parent dir to pre-exist; 06-00 only added `/.lighthouse/` to `.gitignore`, it never created the dir. First run errored `(./.lighthouse/mobile) cannot be written to`.
- **Fix:** Created `.lighthouse/` (already gitignored — confirmed line 18 of `.gitignore`); re-ran successfully.
- **Files modified:** none committed (the dir + its reports are gitignored local artifacts).

### Environment notes (not deviations)

- **chrome-launcher EPERM on Windows cleanup:** the run wrote both reports successfully, then `chrome-launcher`'s `destroyTmp` threw `EPERM` removing its temp profile dir (`%LOCALAPPDATA%\Temp\lighthouse.*`) — a known Windows cleanup race that fires AFTER measurement completes. Both report files (1.0 MB HTML, 1.3 MB JSON) were verified present and the scores parsed cleanly, so this was treated as benign, not a measurement failure.
- **Lighthouse target = `/en`:** the EN route is explicit; the FR canonical `/` rewrites internally (both verified 200). This matches the `lighthouse:mobile` script and the plan.

## HUMAN-UAT (carried to Phase 7 / pre-deploy)

These are browser-only and cannot run in this headless CI-style environment; they are the manual items from the plan's checkpoint, persisted for a human pass on the running app (`npm run build && npm run start`):

1. **A11Y-08 authoritative Performance >= 90** — re-run Lighthouse mobile on the **deployed Vercel URL** in Phase 7; this is the definitive A11Y-08 confirmation per the requirement wording.
2. **A11Y-04 keyboard pass** — Tab through the homepage: visible focus ring on every interactive element, logical order, no traps. (axe covers static violations in 06-04; focus *order* + live-regions are jsdom-impossible.)
3. **A11Y-04 PaletteSwitcher focus trap** — open the FAB: focus trapped inside, Esc closes, focus returns to the FAB.
4. **A11Y-07 random-palette layout** — apply 3-4 random harmonic palettes (Generate tab): no overflow/clipping, text stays readable. (Contrast/validity proven by the seeded stress test in 06-03; visual layout is manual.)
5. **EGG-02 404 motion** — visit a bad URL (e.g. `/en/nonexistent`): the playful 404 animates in and the back link returns home.
6. **A11Y-01 OG render** — visit `/en/opengraph-image` and a project's OG route: the branded Terra card renders with the accent bar + correct text.

## Verification

- `npm run build` — exit 0; output includes `opengraph-image` (home + project), `sitemap.xml`, `robots.txt`, and 12 SSG project routes.
- `npm run lighthouse:mobile` toolchain — ran end-to-end; `./.lighthouse/mobile.report.{html,json}` produced; four scores recorded.
- `npm test` — 336 passed (52 files); baseline preserved (no source changes).
- `npm run lint` — clean (exit 0).

## Self-Check: PASSED
