---
phase: 06-seo-accessibility-polish
plan: 01
subsystem: seo
tags: [next-metadata, opengraph, next-og, satori, sitemap, robots, hreflang, next-intl, oklch]

# Dependency graph
requires:
  - phase: 06-00-install-audit-deps
    provides: SITE_URL constant (lib/constants.ts) + bundled Inter-SemiBold.ttf OG font (assets/)
  - phase: 05-project-content-pipeline
    provides: project page + title-only generateMetadata + getProjectSlugs + getProjectBySlug
  - phase: 02-palette-system
    provides: oklchToHex (lib/colors.ts) + PALETTES[0] Terra tokens (lib/palettes.ts)
  - phase: 01-foundations
    provides: i18n routing (as-needed) + getPathname (i18n/navigation.ts)
provides:
  - Root generateMetadata with metadataBase + openGraph(website) + twitter + hreflang(fr-FR/en-US/x-default) + canonical
  - Project generateMetadata with openGraph(article) + per-project summary + hreflang + canonical
  - Two dynamic branded OG cards (home + project[slug]) via next/og ImageResponse with bundled Inter + Terra-derived hex
  - Slug-driven app/sitemap.ts (7 entries, each with fr/en alternates)
  - app/robots.ts (allow / + disallow /api/ + sitemap reference)
affects: [06-04-a11y-audit, 06-05-lighthouse, 07-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next/og ImageResponse for branded OG cards (Node runtime, readFile font, Satori flexbox-only)"
    - "hreflang/sitemap URLs via next-intl getPathname (as-needed-aware, never hand-built)"
    - "lib/og.tsx is the ONE sanctioned hex boundary (Terra OKLCh -> hex via oklchToHex)"

key-files:
  created:
    - lib/og.tsx
    - app/[locale]/opengraph-image.tsx
    - app/[locale]/projects/[slug]/opengraph-image.tsx
    - app/sitemap.ts
    - app/robots.ts
    - lib/og.test.ts
    - app/[locale]/layout.metadata.test.ts
    - app/[locale]/projects/[slug]/metadata.test.ts
    - app/sitemap.test.ts
    - app/robots.test.ts
  modified:
    - app/[locale]/layout.tsx
    - app/[locale]/projects/[slug]/page.tsx

key-decisions:
  - "OG image routes render dynamically (ƒ) not statically prerendered — Next defaults dynamic-segment OG routes to on-demand; functionally correct, cards still served + cached"
  - "Sitemap structure: canonical-<loc>-with-alternates (FR canonical, en in alternates) — Google-preferred, matches Next docs localized example"
  - "Metadata hreflang tests mock @/i18n/navigation with a faithful as-needed getPathname (next-intl react-client build's bare next/navigation import is unresolvable under jsdom — same reason the repo's page.test.tsx mocks this module)"

patterns-established:
  - "OG cards: lib/og.tsx shared OgCard + OG_COLORS(Terra hex via oklchToHex) + OG_SIZE; per-route opengraph-image.tsx reads bundled font and returns ImageResponse"
  - "Localized SEO: generateMetadata composes ${SITE_URL}${getPathname({href, locale})} for canonical + alternates"

requirements-completed: [A11Y-01, A11Y-02]

# Metrics
duration: 9min
completed: 2026-05-28
---

# Phase 6 Plan 01: Metadata & SEO Summary

**Full per-route SEO (metadataBase + openGraph + twitter + hreflang/canonical via next-intl getPathname), two dynamic branded next/og cards using the bundled Inter font and Terra-derived hex, plus a slug-driven sitemap.xml (7 entries with fr/en alternates) and robots.txt.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-05-28T08:53Z (local)
- **Completed:** 2026-05-28T09:02Z (local)
- **Tasks:** 3
- **Files modified:** 12 (10 created, 2 modified)

## Accomplishments
- Expanded root `generateMetadata` (layout.tsx) from title+description to full SEO: `metadataBase`, `openGraph(type:website)`, `twitter(summary_large_image)`, hreflang `alternates.languages` (fr-FR `/`, en-US `/en`, x-default `/`) + `canonical` — all locale-aware via `getPathname`, FOUC script untouched.
- Expanded project `generateMetadata` (page.tsx) to `openGraph(type:article)` + per-project `summary` description + per-project hreflang + canonical, without regressing the page body / dynamic MDX import / `generateStaticParams`.
- Shipped `lib/og.tsx` (shared Satori-safe `OgCard` + `OG_COLORS` derived from Terra via `oklchToHex` — the one sanctioned hex boundary) + two `opengraph-image.tsx` routes (home + project) rendering branded 1200×630 cards via `next/og` `ImageResponse` with the bundled `Inter-SemiBold.ttf` (Node runtime, no edge).
- Shipped slug-driven `app/sitemap.ts` (1 home + 6 projects = 7 entries, each with fr/en alternates) and `app/robots.ts` (allow `/`, disallow `/api/`, sitemap reference). Build emits `sitemap.xml` (verified 7 `<loc>` + `<xhtml:link>` alternates) and `robots.txt`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared OG layout helper + both opengraph-image.tsx routes** - `59ea939` (feat)
2. **Task 2: Expand root + project generateMetadata (metadataBase, OG, twitter, hreflang)** - `db89a57` (feat)
3. **Task 3: app/sitemap.ts + app/robots.ts + tests** - `534ff1f` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified
- `lib/og.tsx` - Shared Satori-safe `OgCard` + `OG_COLORS` (Terra OKLCh→hex via `oklchToHex`) + `OG_SIZE` (1200×630). No raw hex literals.
- `app/[locale]/opengraph-image.tsx` - Home OG card; Node runtime; `readFile` bundled Inter font; `ImageResponse`.
- `app/[locale]/projects/[slug]/opengraph-image.tsx` - Project OG card; `await params` (Next 16); title/year/category from frontmatter.
- `app/[locale]/layout.tsx` - Expanded `generateMetadata` (metadataBase + OG + twitter + hreflang + canonical) + `hreflangMap` helper. FOUC `<head>` + `suppressHydrationWarning` unchanged.
- `app/[locale]/projects/[slug]/page.tsx` - Expanded `generateMetadata` (article OG + per-project hreflang); added `Metadata` type + `getPathname`/`SITE_URL` imports. Page body untouched.
- `app/sitemap.ts` - Slug-driven `MetadataRoute.Sitemap` (7 entries, fr/en alternates).
- `app/robots.ts` - `MetadataRoute.Robots` (allow `/`, disallow `/api/`, sitemap).
- `lib/og.test.ts` - Asserts `OG_COLORS` are valid hex derived from Terra (not the `#ffffff` fallback), `OG_SIZE` 1200×630.
- `app/[locale]/layout.metadata.test.ts` - Asserts root metadata shape + hreflang URLs.
- `app/[locale]/projects/[slug]/metadata.test.ts` - Asserts project `type:article` + per-project hreflang + `{}` on not-found.
- `app/sitemap.test.ts` - Asserts `1 + slugs.length` entries (slug-list-driven), home/project canonical, en alternates.
- `app/robots.test.ts` - Asserts allow `/`, disallow `/api/`, sitemap reference.

## Decisions Made
- **OG routes are dynamic (`ƒ`), not statically prerendered.** Next 16 defaults file-based OG routes under dynamic segments (`[locale]`, `[slug]`) to on-demand rendering. This is functionally correct — the branded card renders on first request and is cached — and satisfies A11Y-01 ("og:image" + branded cards render). The research's "statically optimized at build" expectation does not hold for dynamic-segment OG routes under Turbopack; no static `public/og.png` fallback was needed (D-04 fallback unused — dynamic works).
- **Sitemap structure:** canonical-`<loc>`-with-alternates (FR canonical at `/` and `/projects/{slug}`; fr/en `<xhtml:link>` alternates per entry). Matches the Next docs localized example and is Google-preferred. Under `as-needed`, `/fr` redirects to `/`, so the canonical `<loc>` is `/` and `/en` lives in the alternates — covering A11Y-02's `/`, `/fr`, `/en`, project pages.
- **Did NOT list the OG image in `openGraph.images`** — the file-based `opengraph-image.tsx` route auto-injects `og:image`, and `metadataBase` makes it absolute.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Metadata/sitemap tests: faithful `@/i18n/navigation` getPathname mock instead of the real module**
- **Found during:** Task 2 (metadata tests) and Task 3 (sitemap test)
- **Issue:** The plan's example tests left `@/i18n/navigation` real to compute hreflang URLs. But importing the real module under jsdom fails: next-intl's `react-client` build of `createNavigation` statically imports the bare specifier `next/navigation`, which Vitest's resolver cannot map (it throws `Cannot find module .../next/navigation`; node_modules are externalized so a `resolve.alias` does not reach next-intl's internal import). Confirmed three resolution approaches failed (no-mock, `vi.importActual`, `resolve.alias` in vitest.config.ts).
- **Fix:** Mocked `@/i18n/navigation` with a faithful `getPathname` reproducing the documented `localePrefix:'as-needed'` contract (`fr` → no prefix, `en` → `/en` prefix). This is the SAME module the repo's sibling `app/[locale]/projects/[slug]/page.test.tsx` already mocks for the same reason. The hreflang assertions still verify the load-bearing logic — that `generateMetadata`/`sitemap` compose `${SITE_URL}${getPathname(...)}` into the correct alternates shape. Reverted the temporary `vitest.config.ts` alias (no shared-infra change).
- **Files modified:** app/[locale]/layout.metadata.test.ts, app/[locale]/projects/[slug]/metadata.test.ts, app/sitemap.test.ts (test files only; production code unaffected)
- **Verification:** All 5 new test files green (7 tests); the REAL getPathname is exercised end-to-end by `npm run build`, which emitted `sitemap.xml` with correct as-needed hreflang (FR no prefix, EN `/en`) — proving the production `getPathname` composition is correct independent of the test mock.
- **Committed in:** db89a57 (Task 2), 534ff1f (Task 3)

**2. [Rule 1 - Bug] Test type error reading `openGraph.type`**
- **Found during:** Task 2 (typecheck of metadata tests)
- **Issue:** `md.openGraph?.type` failed `tsc` (TS2339) — `Metadata.openGraph` is a broad `OpenGraph` union where `type` is only on specific variants.
- **Fix:** Read via narrowing cast `(md.openGraph as { type?: string })?.type` (consistent with the plan's own `md.twitter as { card?: string }` pattern).
- **Files modified:** app/[locale]/layout.metadata.test.ts, app/[locale]/projects/[slug]/metadata.test.ts
- **Verification:** `npx tsc --noEmit` clean for all plan files; tests green.
- **Committed in:** db89a57 (Task 2)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug) — both in test code only.
**Impact on plan:** Production code matches the verbatim research snippets exactly. The test-only deviations were forced by a next-intl + Vitest ESM interop limitation (already an established repo pattern) and a TS union-narrowing nuance. No scope creep; all production behavior verified by the build output.

## Issues Encountered
- **next-intl react-client `next/navigation` resolution under jsdom** — see Deviation 1. Resolved by faithful mocking (the established repo pattern). The build (real getPathname) confirms correctness.
- **Benign jsdom warning** during the full suite: `HTMLCanvasElement's getContext()` (canvas-confetti from Phase 2) — pre-existing, unrelated, tests pass.

## Self-Check: PASSED

All 10 created files verified on disk; all 3 task commits (`59ea939`, `db89a57`, `534ff1f`) verified in git history.

## User Setup Required
None - no external service configuration required. `NEXT_PUBLIC_SITE_URL` remains a placeholder (`https://tanguy.dev`); the real domain is set in Phase 7 (DEPLOY).

## Next Phase Readiness
- **06-04 (a11y audit):** OG/metadata/sitemap/robots routes exist; the a11y plan can axe the route-state surfaces independently.
- **06-05 (lighthouse):** metadata + sitemap + robots are in place for the SEO category; OG cards render on demand.
- **Note for verifier:** OG routes are `ƒ` (dynamic). To visually confirm a branded card, run `npm run build && npm run start` and visit `/en/opengraph-image` (HUMAN-UAT). `sitemap.xml`/`robots.txt` are static and verified in the build output.

## Test/Build Verification
- `npx vitest run` (full suite): **283 passed** (276 baseline + 7 new), 40 files.
- `npm run lint`: exit 0 (clean).
- `npm run build`: exit 0. Route table emits `ƒ /-/opengraph-image`, `ƒ /-/projects/-/opengraph-image`, `○ /robots.txt`, `○ /sitemap.xml`, plus `/[locale]` (fr/en) and 12 project routes. Generated `sitemap.xml.body` verified: 7 `<loc>` entries with fr/en `<xhtml:link>` alternates; `robots.txt.body` verified: allow `/`, disallow `/api/`, sitemap reference.

---
*Phase: 06-seo-accessibility-polish*
*Completed: 2026-05-28*
