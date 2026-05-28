---
phase: 05-project-content-pipeline
plan: 03
subsystem: ui
tags: [nextjs16, mdx, app-router, dynamic-import, generateStaticParams, gsap, parallax, server-component, i18n, next-intl]

# Dependency graph
requires:
  - phase: 05-00-content-and-assets
    provides: 12 MDX case-study bodies, CommonFields.gallery?, projects.detail.* i18n keys (22 leaf keys/locale)
  - phase: 05-01-mdx-components
    provides: mdx-components.tsx registry (Image/CodeBlock/Callout/a/prose), MDXImage default export reused for gallery cells
  - phase: 05-02-parallax-hook
    provides: useParallax(ref, options?) hook (matchMedia dual-branch, scrub:0.5 on [data-parallax-image])
provides:
  - app/[locale]/projects/[slug]/page.tsx — async Server Component project detail page (CONTENT-02)
  - components/sections/ProjectCover.tsx — 'use client' cover parallax island (ANIM-02 on the live page)
  - 12 statically-generated project routes (6 slugs × 2 locales) via generateStaticParams + dynamicParams=false
  - RELATIVE dynamic-import MDX pattern proven under Turbopack production build
affects: [phase-06-seo-a11y, phase-07-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RELATIVE dynamic MDX import (../../../../content/projects/${slug}.${locale}.mdx) — never the @/ alias (Pitfall 5B / Turbopack static analysis)"
    - "dynamicParams=false + generateStaticParams flatMap over routing.locales × getProjectSlugs() = full static pre-render"
    - "Server page + tiny 'use client' island (ProjectCover) so only the parallax DOM hook is client; rest stays server-rendered"
    - "Discriminated-union narrowing (project.category === 'tech'|'design'|'bim') drives the metadata strip with zero casts / zero any"
    - "jsdom page tests never render past the dynamic import — assert pre-import logic + data-derived decisions on typed fixtures; full MDX render is the manual smoke"

key-files:
  created:
    - app/[locale]/projects/[slug]/page.tsx
    - app/[locale]/projects/[slug]/page.test.tsx
    - components/sections/ProjectCover.tsx
    - components/sections/ProjectCover.test.tsx
  modified:
    - content/projects/_template.fr.mdx
    - content/projects/_template.en.mdx

key-decisions:
  - "Code2 substitutes the removed lucide-react Github brand icon for the repo link (Phase 3 D-23 precedent)"
  - "_template MDX <slug> placeholder reworded to [slug] so the dynamic-import glob compiles the templates as valid MDX (Rule 3 blocker)"
  - "SUMMARY filename uses the full 05-03-project-page-SUMMARY.md form to match sibling summaries and the success criteria"

patterns-established:
  - "Pattern: cover-only parallax via a thin client island wrapping next/image (fill priority scale:1.2) inside an overflow-hidden wrapper — translate never reveals the bg"
  - "Pattern: gallery <section> gated on project.gallery && project.gallery.length > 0, each cell reusing MDXImage for free click-to-zoom"
  - "Pattern: prev/next wrap via modulo over getProjectSlugs() (last→first, first→last), locale-aware Links labelled by target project title"

requirements-completed: [CONTENT-02, ANIM-02]

# Metrics
duration: 6min
completed: 2026-05-28
---

# Phase 5 Plan 03: Project Detail Page Summary

**Async Server Component project page rendering MDX via a RELATIVE dynamic import + generateStaticParams (12 routes) + discriminated metadata strip + gated gallery + wrapped prev/next, with a `ProjectCover` client island wiring cover-only GSAP parallax.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-28T05:25:18Z
- **Completed:** 2026-05-28T05:31:00Z
- **Tasks:** 3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- `app/[locale]/projects/[slug]/page.tsx` — the CONTENT-02 deliverable: async Server Component that loads each project's MDX through a RELATIVE dynamic import (Pitfall 5B), 404s unknown slugs via `notFound()` + `dynamicParams=false`, and renders the D-04 magazine layout (cover hero → metadata strip → MDX body → gated gallery → prev/next footer).
- `components/sections/ProjectCover.tsx` — the second half of ANIM-02: a `'use client'` island that wraps the cover `next/image` (fill / priority / scale:1.2) in a parallax-scoped ref via `useParallax`, marked `[data-parallax-image]`, inside an `overflow-hidden` responsive wrapper (h-[50vh] md:h-[60vh]).
- Production build emits exactly **12 static project routes** (agora, brand-system, editorial-grid, residential-renovation, texture-manager, tower-concept × fr/en) — the canonical CONTENT-02 smoke.
- 9 new passing tests (4 ProjectCover + 5 page); full suite 276/276 green (was 267).

## Task Commits

1. **Task 1: ProjectCover client island (TDD)** — `7da9c81` (test, RED) → `123ee38` (feat, GREEN)
2. **Task 2: project page Server Component** — `c3197d1` (feat; includes the `_template` MDX Rule 3 fix)
3. **Task 3: project page unit tests** — `d003b8d` (test)

**Plan metadata:** (this commit) `docs(05-03): complete project-page plan`

_Note: Task 1 is TDD (test → feat); no refactor commit was needed (RESEARCH Code Example #3 was already clean)._

## Files Created/Modified

- `app/[locale]/projects/[slug]/page.tsx` — async Server Component detail page: `dynamicParams=false`, `generateStaticParams` (12 combos), `generateMetadata` (minimal title), `getProjectBySlug` + `notFound()`, RELATIVE dynamic MDX import, discriminated metadata strip, gated gallery (reuses MDXImage), wrapped prev/next footer. All palette-aliased colors.
- `app/[locale]/projects/[slug]/page.test.tsx` — GROUP A (generateStaticParams=12, notFound-on-null, prev/next wrap math) + GROUP B (gallery-gating predicate + 3-category discriminator on typed fixtures). Never renders past the dynamic import.
- `components/sections/ProjectCover.tsx` — cover parallax client island.
- `components/sections/ProjectCover.test.tsx` — prop-dump next/image stub + vi.fn() useParallax mock; asserts fill/priority/data-parallax-image, responsive overflow-hidden wrapper, and useParallax(ref) wiring.
- `content/projects/_template.{fr,en}.mdx` — reworded the `<slug>` frontmatter-comment placeholder to `[slug]` so the templates compile as valid MDX (see Deviations).

## Decisions Made

- **Code2 for the repo link.** `lucide-react` v1.16 ships without the `Github` brand icon (confirmed at runtime; matches the Phase 3 D-23 / Footer / Contact precedent). The plan explicitly sanctioned this substitution. Accessible label still comes from `t('meta.repo')`.
- **SUMMARY filename.** Used `05-03-project-page-SUMMARY.md` (full-name form) to match the three sibling summaries and the plan's success criteria, rather than the `<output>` block's shorthand `05-03-SUMMARY.md`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `_template.{fr,en}.mdx` broke the production build**
- **Found during:** Task 2 (project page Server Component — first `npm run build`)
- **Issue:** The RELATIVE dynamic import `../../../../content/projects/${slug}.${locale}.mdx` resolves to a Turbopack context module matching every `content/projects/*.*.mdx` file — including the `_template.fr.mdx` / `_template.en.mdx` templates. Those templates contained a bare `<slug>` placeholder in a frontmatter comment line; `@next/mdx` parses the imported `.mdx` without stripping frontmatter, so `<slug>` was treated as an unclosed JSX tag and the build failed with `Expected a closing tag for <slug>` (2 errors). The real project files compiled fine.
- **Fix:** Reworded the placeholder from `public/projects/<slug>/` to `public/projects/[slug]/` in both template files (angle brackets were the only MDX-invalid token; verified via grep that no other `<tag>` patterns remain in any project MDX). `lib/projects.ts` still filters `_*` at runtime (D-24), so the templates never appear as real projects regardless.
- **Files modified:** content/projects/_template.fr.mdx, content/projects/_template.en.mdx
- **Verification:** `npm run build` then exits 0 and emits 12 project routes; `npm test` 276/276; lint clean.
- **Committed in:** `c3197d1` (part of the Task 2 commit, since the fix is required for the page to build)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was a minimal, surgical correction to placeholder prose in two excluded-from-runtime template files — necessary for the dynamic-import build to succeed. No scope creep; no change to the page's design or the real project content.

## Issues Encountered

- **Page test module-graph resolution.** The first `npm test` run on the page test failed with `Cannot find module 'next/navigation'` because the page imports `@/i18n/navigation` (whose `createNavigation` internally imports `next/navigation`), and the partial `vi.mock('next/navigation', { notFound })` left next-intl's deeper resolution broken. Resolved by additionally stubbing `@/i18n/navigation` (Link), `@/components/sections/ProjectCover`, and `@/components/mdx/Image` so the page module graph loads cleanly under jsdom — these are never exercised since the tests never render past the dynamic import. Native chai matchers throughout. (Resolution within planned Task 3 work, not a plan deviation.)

## User Setup Required

None - no external service configuration required. (Placeholder gallery images and placeholder MDX case-study copy remain Wave 0 deliverables the user swaps with real assets/content pre-deploy — Phase 7 checklist.)

## Next Phase Readiness

- CONTENT-02 + ANIM-02 satisfied; the project route is live and statically generated. Phase 6 (A11Y-01/02/03) can now expand `generateMetadata` (OG image, hreflang, twitter:card), add sitemap entries for the 12 routes, and ship localized `not-found.tsx` / `loading.tsx` / `error.tsx`.
- Manual smoke (per VALIDATION.md Manual-Only table) remains for execute-phase UAT: visit `/fr/projects/agora` + `/en/projects/texture-manager` — cover parallax under full motion (disabled under reduced-motion), gallery shows for texture-manager (not agora), Image zoom opens, code blocks render with copy button, Callouts display, prev/next navigate. jsdom cannot perform this full-MDX-render verification.

## Self-Check: PASSED

All claimed files exist on disk:
- `app/[locale]/projects/[slug]/page.tsx` ✓
- `app/[locale]/projects/[slug]/page.test.tsx` ✓
- `components/sections/ProjectCover.tsx` ✓
- `components/sections/ProjectCover.test.tsx` ✓
- `.planning/phases/05-project-content-pipeline/05-03-project-page-SUMMARY.md` ✓

All claimed commits exist: `7da9c81` (test), `123ee38` (feat), `c3197d1` (feat), `d003b8d` (test).

Verification: `npm test` 276/276 green · `npm run lint` exit 0 · `npm run build` exit 0 with 12 project routes emitted.

---
*Phase: 05-project-content-pipeline*
*Completed: 2026-05-28*
