# Phase 6: SEO, Accessibility & Polish - Research

**Researched:** 2026-05-28
**Domain:** Next.js 16 App Router metadata/SEO + dynamic OG (`next/og`) + route-state files + axe-core a11y (vitest-axe) + reduced-motion/image audit gates + palette stress test + local Lighthouse
**Confidence:** HIGH (all 5 open questions resolved against Next.js 16.2.6 official docs + next-intl v4 docs + npm registry verification; in-repo precedents read directly)

## Summary

Every load-bearing unknown the CONTEXT.md flagged is now resolved against current (2026-05-27 lastUpdated) Next.js 16.2.6 docs and the npm registry. **Dynamic `next/og` works correctly under Next 16 + Turbopack for the dynamic `[slug]` segment** — `params` is a `Promise` as of v16.0.0, fonts load via `readFile(join(process.cwd(), ...))`, images are statically optimized at build time, and Satori supports flexbox only (no `grid`). No static `public/og.png` fallback is needed. **next-intl `getPathname({ href, locale })` is the correct hreflang helper** under `localePrefix: 'as-needed'`: it returns `/` for the default locale (fr) and `/en/...` for the non-default — exactly the as-needed URLs required. **`error.tsx` and `not-found.tsx` both use `useTranslations` (client)** per next-intl's own error-files guide; the existing `[locale]/layout.tsx` already wraps everything in `NextIntlClientProvider` with the full message bundle, so both work without reading `params`. **`vitest-axe` has a stale `latest` tag (`0.1.0`, 2022)** — the planner should install `vitest-axe@1.0.0-pre.5` (proper `./matchers` + `./extend-expect` subpath exports, `axe-core@^4.10.2`, peer `vitest >=1`). jest-axe/vitest-axe already disable `color-contrast` under jsdom, but the plan should disable it explicitly and rely on `validateFullMatrix` as the contrast proxy.

The only divergence from training-data assumptions worth flagging: Next 16.2.0 added an `unstable_retry` prop to `error.tsx` and the docs now say "In most cases, you should use `unstable_retry()` instead" of `reset()`. **`reset()` is still stable and documented** — keep CONTEXT.md D-08's `reset()` (locked decision; `unstable_retry` is unstable-prefixed and not worth the churn for a portfolio).

**Primary recommendation:** Implement exactly as CONTEXT.md decided (dynamic `next/og`, vitest-axe, local Lighthouse, palette-themed 404 reusing `errors.404`, 5 plans / 3 waves). Use the verified code patterns below verbatim in task `<action>` blocks. Install `vitest-axe@1.0.0-pre.5` (NOT `latest`) + `lighthouse@^13`. `next/og` is built-in — zero OG dependency.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions (D-01..D-16 — research HOW, do NOT re-litigate)

- **D-01:** Add `metadataBase` to root `generateMetadata` via env-aware constant: `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev')`. Placeholder domain; centralize in `lib/constants.ts`.
- **D-02:** Full `openGraph` + `twitter` blocks in BOTH `generateMetadata` (root + project). Root: `type:'website'`, `locale`, `title`, `description`, `siteName:'Tanguy Delrieu'`, images. Project: `type:'article'`, project title + `summary`, project OG image. Descriptions localized (`hero.tagline` root; `summary` frontmatter projects).
- **D-03:** hreflang via `alternates.languages`. Root → `{ 'fr-FR':'/', 'en-US':'/en', 'x-default':'/' }`; project → `{ 'fr-FR':'/projects/{slug}', 'en-US':'/en/projects/{slug}', 'x-default':'/projects/{slug}' }`. MUST use next-intl pathname helper (resolved here: `getPathname`). Also set `alternates.canonical`.
- **D-04:** Dynamic OG via `next/og` `ImageResponse` (built-in, ZERO new deps). Two files: home + project `[slug]`. 1200×630. Terra palette → hex via `oklchToHex`. Bundled Inter weight via `fs`/`readFile`. One shared layout helper. **Static `public/og.png` fallback sanctioned IF `next/og` proves too costly** — resolved below: NOT needed, dynamic works.
- **D-05:** `app/sitemap.ts` (static, build-time). Entries: `/` (priority 1.0), `/en` (1.0), each `getProjectSlugs()` slug × {fr,en}. Per-entry `alternates.languages` mirroring D-03. `metadataBase` for absolute URLs.
- **D-06:** `app/robots.ts` — `{ rules: [{ userAgent:'*', allow:'/', disallow:'/api/' }], sitemap: '{metadataBase}/sitemap.xml' }`.
- **D-07:** `app/[locale]/not-found.tsx` IS the EGG-02 404. Reuses existing `errors.404` keys. Playful palette/pixel-art themed, large "404", motion entry (`useReducedMotion()`-gated to opacity-only), shadcn `<Button asChild>` wrapping `<Link href="/">` from `@/i18n/navigation`. May add `errors.404.subtitle` (FR/EN parity).
- **D-08:** `app/[locale]/error.tsx` MUST be `'use client'`. Receives `{ error, reset }`. Renders `errors.500` copy + button calling `reset()`. **CLARIFICATION (locks REQUIREMENTS.md ambiguity):** A11Y-03 says "bouton Reset via Server Actions" — NOT applicable. App Router error boundaries are Client Components using the framework `reset()`. Do NOT wire a Server Action. Locale via `useLocale()`/`useTranslations()`.
- **D-09:** `app/[locale]/loading.tsx` — lightweight skeleton/spinner. Use `motion-safe:animate-pulse` so reduced-motion users get a static state. Recommend project-route `loading.tsx` too. Palette CSS vars only.
- **D-10:** axe-core via `vitest-axe` (new dev dep + `@types` if needed). `*.a11y.test.tsx` rendering key surfaces in jsdom asserting `toHaveNoViolations()`. Surfaces: homepage sections (Hero/About/ProjectsSection/Skills/Contact), project page shell (mocked), PaletteSwitcher (Sheet open) + PaletteFab, not-found + error. No E2E. Focus order / live-regions → manual keyboard pass (HUMAN-UAT).
- **D-11:** Keyboard-nav + focus-trap. PaletteSwitcher already has focus trap + Esc (Phase 2 THEME-10). ADD: axe assertion for accessible names on icon-only buttons + documented manual Tab pass (HUMAN-UAT). Verify global `:focus-visible` ring exists (`--ring` = `var(--color-accent)`); add to globals.css if missing.
- **D-12:** A11Y-05 is audit + regression gate, NOT new implementation. Gates exist across 15+ files. (1) verify each animation entry point gates; (2) add static-analysis grep gate (`scripts/check-reduced-motion.ts`).
- **D-13:** A11Y-06 is audit + gate. All 6 `next/image` usages already have dims-or-`fill`. (1) verify dims-or-fill + `priority` only above-fold; (2) confirm `next.config.ts` formats default WebP/AVIF (add if needed); (3) add grep gate; no bare `<img>`.
- **D-14:** Seeded Vitest stress test (`lib/colors.stress.test.ts` in-suite + `scripts/stress-test-palettes.ts` runnable). Seeded RNG → 10 random source colors → `generateHarmonic` 4 modes → assert `validateFullMatrix` valid (after `adjustForAA`), all 6 tokens parse as valid OKLCh (no NaN), text ≥4.5 / UI ≥3.0. Also re-assert 4 presets (regression guard). Visual "no layout breakage" = manual HUMAN-UAT.
- **D-15:** Local Lighthouse vs production build. `lighthouse` dev dep + npm script. `npm run build && npm run start` → Lighthouse **mobile** on `/` (+ optional project page), record 4 scores, fix <90. Authoritative ≥90 on deployed Vercel URL = Phase 7. Treat as manual/scripted gate (HUMAN-UAT) + automated proxies.
- **D-16:** 5 plans / 3 waves (Wave 0 deps; Wave 1 parallel metadata+route-states+stress-test; Wave 2 audit a11y+lighthouse). See Validation Architecture for wave→test mapping.

### Claude's Discretion (resolved recommendations below)
- OG card visual layout → name + role + thin Terra accent bar; project card adds title + category badge + year (see Code Examples).
- Bundle Inter vs system font in OG → bundle ONE Inter weight (`Inter-SemiBold.ttf` or `.otf`) via `readFile`. Resolved: Satori needs explicit font data; system font is unreliable in the Satori sandbox.
- `lighthouse` vs `@lhci/cli` → **`lighthouse` CLI** + documented npm script. LHCI is overkill for one-shot.
- Reduced-motion gate as tsx script vs Vitest → **`scripts/check-reduced-motion.ts`** grep-style (matches `check-mdx-structure.ts` / `check-i18n-parity.ts` precedent; exit-0 contract).
- 404 visual richness → typographic + one motion entrance; don't over-build.
- JSON-LD → skip in v1 unless trivial (not required by A11Y-01).
- `loading.tsx` fidelity → generic centered brand spinner (section skeletons over-engineer a fast static site).
- `errors.404.subtitle` / extra keys → planner writes if 404 needs more than existing title/message/back (parity-gated).

### Deferred Ideas (OUT OF SCOPE)
- Live Lighthouse ≥90 on deployed Vercel URL (Phase 7 final A11Y-08 confirmation).
- `@vercel/analytics` + `@vercel/speed-insights` (Phase 7 DEPLOY-03).
- Real production domain for `metadataBase` (Phase 7; placeholder env var here).
- JSON-LD structured data (v2).
- Per-project bespoke OG photography (dynamic cards use frontmatter + brand colors; real cover art = pre-deploy swap).
- Cookie-consent / GDPR banner (no third-party trackers in v1).
- Playwright / real-browser E2E + axe-in-browser (explicitly OOS per PROJECT.md; focus-order + live-regions are manual HUMAN-UAT).
- Automated visual-regression of random palettes (manual spot-check v1; screenshot diffing v2).
- `manifest.ts` / PWA / theme-color meta (v2; theme-color is dynamic per palette).
- 404 mini palette-playground/game (lightweight 404 in v1).
- Skip-to-content link — planner may add cheaply in the a11y plan if low-cost, else v2.
- axe-core CI as separate GitHub Action (Phase 7; vitest-axe runs in normal `npm test`).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| A11Y-01 | `generateMetadata` per page (root + projects + 404) with title, description, og:image, og:locale, hreflang FR/EN | Metadata API + `metadataBase` + `alternates.languages` + `getPathname` hreflang (Open Q2) + dynamic `next/og` `opengraph-image.tsx` × 2 (Open Q1). Code Examples §1-4. |
| A11Y-02 | `app/sitemap.ts` covering `/`, `/fr`, `/en`, project pages; `app/robots.ts` allow all except `/api/*` | `MetadataRoute.Sitemap`/`Robots` types verified; per-entry `alternates.languages`; `getProjectSlugs()` source. Code Examples §5-6. |
| A11Y-03 | `loading.tsx`, `error.tsx`, `not-found.tsx` at `app/[locale]/`; error.tsx Reset (resolved: `reset()` prop, NOT Server Action) | Next 16 error/not-found/loading conventions (Open Q4); next-intl error-files pattern. Code Examples §7-9. |
| A11Y-04 | axe-core 0 violations + focus visible + aria-labels + keyboard nav | `vitest-axe@1.0.0-pre.5` setup (Open Q3); jsdom disables color-contrast; manual keyboard = HUMAN-UAT. Code Examples §10. |
| A11Y-05 | `prefers-reduced-motion` on all animations (GSAP+motion+CustomCursor+Lenis) | Audit + `scripts/check-reduced-motion.ts` grep gate. 15+ files already gated (verified). Code Examples §12. |
| A11Y-06 | All images via `next/image` with width/height, WebP/AVIF, lazy except above-fold | Audit + grep gate. 4 image files verified (ProjectCover `fill`+`priority`, About/ProjectCard/mdx `width`+`height`+lazy). Code Examples §13. |
| A11Y-07 | Palette robustness: 4 presets + 10 random `generateHarmonic` palettes pass a11y, no layout break | Seeded stress test against `validateFullMatrix` + culori parse. Visual = HUMAN-UAT. Code Examples §11. |
| A11Y-08 | Lighthouse ≥90 (Perf/A11y/BP/SEO) mobile on deployed Vercel | Local `lighthouse` CLI vs prod build (pre-deploy gate); final on Vercel = Phase 7. HUMAN-UAT + automated proxies. Code Examples §14. |
| EGG-02 | Custom 404 (`not-found.tsx`) with motion entry, bilingual humor, styled back link | Reuses `errors.404`; `useTranslations` (client); motion gated. Code Examples §8. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Next.js 16** App Router + React 19.2 + TypeScript 5.6 **strict, no `any`**. `params`/`cookies()`/`headers()` are async (await). Turbopack default.
- **OKLCh-only colors** everywhere — OG images are the ONE sanctioned hex exception, derived via `oklchToHex(Terra.token)` (NOT hand-typed hex). Satori requires hex/rgb, so this is the boundary.
- **Server Components default**; `"use client"` only when interaction. `error.tsx` is the ONLY mandatorily-client route file. `not-found.tsx` uses `useTranslations` (client) per next-intl but renders inside the IntlProvider tree.
- **Atomic files** (1 file = 1 responsibility).
- **Tailwind v4** `@theme {}` in CSS, no `tailwind.config.ts`. New CSS additions (focus-visible ring, reduced-motion block) go in `app/globals.css`.
- **`next lint` removed in Next 16** — run `eslint` directly (already configured as `"lint": "eslint"`).
- **i18n parity gate** (`scripts/check-i18n-parity.ts`) — any new `errors.404.subtitle` / loading key must keep FR/EN parity.
- **No bare `<img>`** — all images via `next/image`.

## Standard Stack

### Core (already installed — verified in package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.2.6 | `next/og` `ImageResponse` (built-in), Metadata API, sitemap/robots/error/not-found conventions | All Phase 6 SEO + OG + route-state primitives are first-party. ZERO new SEO/OG deps. |
| next-intl | ^4.12.0 | `getPathname` (hreflang), `getTranslations` (server metadata), `useTranslations`/`useLocale` (error/not-found) | App-Router-native; `getPathname` is the as-needed-aware pathname builder. |
| culori | ^4.0.2 | `parse`, `wcagContrast`, `oklchToHex` (already wrapped in `lib/colors.ts`) | OG hex conversion + stress-test OKLCh validation. |
| vitest | ^4.1.7 | Test runner (jsdom) | a11y tests + stress test run in the existing suite. `vitest-axe@1.0.0-pre.5` peer = `vitest >=1` (satisfied). |

### New dev dependencies (ONLY these two)
| Library | Version | Purpose | Why this exact version |
|---------|---------|---------|------------------------|
| **vitest-axe** | **`1.0.0-pre.5`** (NOT `latest`/`0.1.0`) | axe-core matcher for Vitest (A11Y-04) | **`latest` = `0.1.0` is stale (2022)**: no `./matchers`/`./extend-expect` subpath exports, bundles `axe-core@^4.4.2`, no `@vitest/pretty-format`. `1.0.0-pre.5` has proper `exports` map (`./matchers`, `./extend-expect`), `axe-core@^4.10.2`, `@vitest/pretty-format@^3.0.3`, peer `vitest >=1`. The modern documented API only exists in the prerelease. (Verified via `npm view`.) |
| **lighthouse** | `^13.3.0` | Local Lighthouse CLI vs prod build (A11Y-08) | Latest stable (13.3.0). One-shot CLI; `@lhci/cli` is overkill (D-15 discretion). Install as devDep + npm script. |

**`@types`:** vitest-axe ships its own `.d.ts` (`dist/matchers.d.ts`, `dist/extend-expect.d.ts` in the prerelease). NO separate `@types/vitest-axe` needed. axe-core ships types. `lighthouse` ships types; if `import` is needed in a `.ts` runner, `lighthouse` types are bundled (else run it as a CLI via npm script — no import).

**`next/og` is built-in — confirm NO `@vercel/og` is installed or added.** Verified: package.json has no `@vercel/og`. `import { ImageResponse } from 'next/og'`.

**Installation:**
```bash
npm install --save-dev vitest-axe@1.0.0-pre.5 lighthouse
```

**Version verification (run in Wave 0 before pinning):**
```bash
npm view vitest-axe@1.0.0-pre.5 version exports   # confirm ./matchers + ./extend-expect subpaths exist
npm view lighthouse version                         # confirm ^13 still current
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `vitest-axe@1.0.0-pre.5` | `vitest-axe@0.1.0` (latest tag) | `0.1.0` works but only via default import (`import { axe } from 'vitest-axe'` + manual `expect.extend` against its single entry). No subpath exports, older axe-core. The prerelease matches the documented API and is the de-facto current release (the project already pins prereleases/caret elsewhere). |
| dynamic `next/og` | static `public/og.png` (D-04 fallback) | Fallback is sanctioned but NOT needed — dynamic works under Next 16 (Open Q1). Static would lose the per-project branded card (the "attention au détail" value). |
| `lighthouse` CLI | `@lhci/cli` | LHCI adds assertion config + history server — overkill for a one-shot local pre-deploy gate. |
| `reset()` (D-08 locked) | `unstable_retry()` (new in Next 16.2) | Docs now prefer `unstable_retry`, but it's unstable-prefixed. `reset()` is stable and matches the locked decision — keep `reset()`. |

## Architecture Patterns

### File Layout (new files this phase)
```
app/
├── sitemap.ts                                   # NEW (D-05) — MetadataRoute.Sitemap, build-time
├── robots.ts                                    # NEW (D-06) — MetadataRoute.Robots
└── [locale]/
    ├── layout.tsx                               # EDIT — expand generateMetadata (D-01/02/03)
    ├── opengraph-image.tsx                      # NEW (D-04) — home OG, dynamic next/og
    ├── not-found.tsx                            # NEW (D-07/EGG-02) — client, useTranslations('errors.404')
    ├── error.tsx                                # NEW (D-08) — 'use client', {error, reset}
    ├── loading.tsx                              # NEW (D-09) — server, motion-safe spinner
    └── projects/[slug]/
        ├── page.tsx                             # EDIT — expand generateMetadata (D-02/03)
        ├── opengraph-image.tsx                  # NEW (D-04) — project OG, dynamic [slug] segment
        └── loading.tsx                          # NEW (D-09, optional) — slowest route
lib/
├── constants.ts                                 # EDIT — add SITE_URL (D-01)
├── og.tsx (or lib/og-layout.tsx)                # NEW (D-04) — shared OG JSX layout helper + Terra hex
└── colors.stress.test.ts                        # NEW (D-14) — seeded stress test
scripts/
├── check-reduced-motion.ts                      # NEW (D-12) — grep gate
├── check-image-audit.ts                         # NEW (D-13) — grep gate (or fold into check-reduced-motion)
└── stress-test-palettes.ts                      # NEW (D-14) — tsx-runnable mirror of the in-suite test
assets/                                          # NEW — bundled OG font (Inter-SemiBold.ttf/.otf)
└── Inter-SemiBold.ttf
public/                                          # (optional) og fallback NOT needed
**/*.a11y.test.tsx                               # NEW (D-10) — vitest-axe surfaces
vitest.config.ts                                 # EDIT — add setupFiles for vitest-axe matchers
vitest-setup.ts (or vitest.setup.ts)             # NEW — expect.extend(vitest-axe matchers)
messages/{fr,en}.json                            # EDIT — optional errors.404.subtitle + loading label (parity)
next.config.ts                                   # EDIT (verify) — images.formats
```

### Pattern 1: Localized metadata via `getTranslations` (server) — ALREADY the repo pattern
**What:** `generateMetadata` is a Server Component export; use `getTranslations({ locale, namespace })` (NOT the client `useTranslations`). The repo's `layout.tsx` already does this (`getTranslations({ locale, namespace: 'hero' })`). Phase 6 only expands the returned object.
**When:** root layout + project page metadata.

### Pattern 2: hreflang via `getPathname` (as-needed-aware) — Open Q2
**What:** `getPathname({ href, locale })` from `@/i18n/navigation` returns the locale-correct pathname. Under `localePrefix:'as-needed'` with `defaultLocale:'fr'`: `getPathname({href:'/', locale:'fr'})` → `'/'` (no prefix); `getPathname({href:'/', locale:'en'})` → `'/en'`. Compose with `SITE_URL` for absolute hreflang URLs. **Do NOT hand-build strings** — `getPathname` survives any future routing change.
**When:** `alternates.languages` + `alternates.canonical` in both `generateMetadata`, and per-entry `alternates.languages` in `sitemap.ts`.

### Pattern 3: Dynamic OG `ImageResponse` — Open Q1 (RESOLVED: works, use it)
**What:** File-based `opengraph-image.tsx` default-exports an async function returning `new ImageResponse(<jsx>, { ...size, fonts })`. Node runtime (default for file-based metadata routes; `readFile` from `process.cwd()`). Statically optimized at build time (no `await params` dynamic data → static). For `[slug]`: `params` is a `Promise<{ locale, slug }>` (Next 16). Use `generateStaticParams`-equivalent: the OG route inherits the page's static params, but to be safe and explicit, export `generateImageMetadata` is NOT needed — the route prerenders per the colocated dynamic segment's generated params.
**When:** home + project OG cards.
**Satori CSS limits (verified):** flexbox + absolute positioning + custom fonts + text wrap/center + nested images. **NO `display:grid`.** Max bundle 500KB (JSX+CSS+fonts+images). Fonts: ttf/otf/woff (ttf/otf preferred). Every element with >1 child MUST set `display:flex` explicitly.

### Pattern 4: Route-state files — Open Q4 (RESOLVED)
**What:**
- `not-found.tsx`: Server Component by default and accepts NO props. **next-intl recommends `useTranslations` (client)** — works because `not-found.tsx` renders inside `[locale]/layout.tsx`'s `NextIntlClientProvider`. Rendered when a segment calls `notFound()` (the project page does on null slug — verified) AND for unmatched URLs under root. Locale: do NOT read params; use `useLocale()` if needed, but the `<Link href="/">` from `@/i18n/navigation` auto-prefixes the active locale.
- `error.tsx`: MUST be `'use client'`. Props `{ error: Error & { digest?: string }, reset: () => void }`. Uses `useTranslations('errors.500')` + `<button onClick={() => reset()}>`. Does NOT wrap the same-segment `layout.tsx` (only page/nested). For root-layout errors use `global-error.tsx` (NOT in scope — A11Y-03 only requires `[locale]/error.tsx`).
- `loading.tsx`: Server Component, instant Suspense fallback. Renders while the segment streams. `motion-safe:animate-pulse` for reduced-motion safety.
**When:** all three at `app/[locale]/`; optional `loading.tsx` at the project route.

### Pattern 5: vitest-axe in jsdom — Open Q3 (RESOLVED)
**What:** Add a setup file that does `expect.extend(matchers)` from `vitest-axe/matchers`, wire it via `vitest.config.ts` `setupFiles`. Render a surface with RTL, `expect(await axe(container, { rules: { 'color-contrast': { enabled: false } } })).toHaveNoViolations()`. jsdom can't compute layout/contrast → disable `color-contrast` (jest-axe/vitest-axe already do, but be explicit) and rely on `validateFullMatrix` (the ThemeProvider guarantees AA). The existing tests use `setupFiles: []` and native chai matchers — adding a setup file for vitest-axe matchers is additive and doesn't break the chai-matcher tests (jest-dom is NOT globally extended; only the axe matcher is added).
**When:** `*.a11y.test.tsx` for each surface.

### Anti-Patterns to Avoid
- **`display:grid` in OG JSX** → Satori silently ignores it; layout collapses. Use flexbox.
- **Hand-built hreflang strings** (`'/en/projects/' + slug`) → breaks if routing changes; use `getPathname`.
- **Hardcoded hex in OG** → derive via `oklchToHex(PALETTES[0].xxx)` (Terra). Hex is sanctioned ONLY inside OG files.
- **`useTranslations` in `generateMetadata`** → it's a server export; use `getTranslations`.
- **Reading `params` in `not-found.tsx`/`error.tsx`** → not-found accepts no props; error can't read params. Use `useLocale()`/`useTranslations()` (IntlProvider is up-tree).
- **Wiring a Server Action for error reset** → App Router error boundaries use the framework `reset()` (D-08 clarification).
- **Adding the canonical locale to its OWN `alternates.languages` in sitemap** → the Next docs localized example lists only the OTHER locales per entry. Either approach validates; mirror D-03 (which DOES include both + x-default in metadata `alternates`). Be consistent; document choice.
- **`vitest-axe@latest`** → installs stale `0.1.0`. Pin `1.0.0-pre.5`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image rendering | Custom canvas/puppeteer screenshotter | `next/og` `ImageResponse` (built-in) | Satori + Resvg, statically optimized at build, zero deps, zero runtime cost. |
| hreflang URL building | String concatenation per locale | `getPathname({ href, locale })` | as-needed-aware, routing-change-proof. |
| sitemap XML | Manual XML string | `MetadataRoute.Sitemap` (`app/sitemap.ts`) | Type-safe, auto-serializes `<xhtml:link>` alternates. |
| robots.txt | Manual text file | `MetadataRoute.Robots` (`app/robots.ts`) | Type-safe, composes sitemap reference. |
| Error boundary | Custom React class boundary | `app/[locale]/error.tsx` with `{error, reset}` | Framework boundary with built-in recovery. |
| 404 detection | Custom routing logic | `not-found.tsx` + `notFound()` (already called in project page) | Convention-based; returns 404 status + auto `noindex`. |
| a11y assertions | Manual ARIA checks | `vitest-axe` `axe()` + `toHaveNoViolations()` | axe-core rule engine; only manual for focus-order/live-regions. |
| WCAG contrast in tests | Re-implement contrast math in stress test | `validateFullMatrix` + `wcagContrast` (lib/colors.ts) | Already the locked 7-pair contract; reuse `CRITICAL_PAIRS`. |

**Key insight:** Phase 6 is almost entirely first-party Next.js conventions + existing `lib/colors.ts` helpers. The only genuinely new code is JSX layout (OG cards, 404/error/loading UI) and grep gates. Resist building anything the framework provides.

## Common Pitfalls (Phase-6-specific)

### Pitfall 1: Satori CSS subset — `display:grid` and unset `display` silently break OG layout
**What goes wrong:** OG card renders blank or mis-stacked. Satori only supports flexbox; any element with multiple children that lacks `display:flex` throws or collapses.
**Why:** `next/og` uses Satori → "Only flexbox and a subset of CSS properties are supported. Advanced layouts (e.g. `display: grid`) will not work." (Next 16 docs, verbatim.)
**How to avoid:** Every multi-child `<div>` in OG JSX sets `display:'flex'` explicitly (+ `flexDirection`). No grid, no `gap` reliance on grid. Inline `style={{}}` objects only (no Tailwind classes — Satori doesn't run Tailwind).
**Warning signs:** Blank 1200×630 PNG; `og-playground.vercel.app` shows the error. Test by visiting `/en/opengraph-image` in dev.

### Pitfall 2: as-needed hreflang — default locale must NOT get a `/fr` prefix
**What goes wrong:** Emitting `hreflang="fr-FR" href=".../fr"` when the canonical FR URL is `/`. Google sees a redirect (`/fr` → `/`) on the hreflang target → hreflang ignored.
**Why:** `localePrefix:'as-needed'` serves fr at `/` (internal rewrite) and redirects `/fr` → `/`. Hand-built strings get this wrong.
**How to avoid:** Use `getPathname({ href:'/', locale:'fr' })` → returns `/` (verified). Resolved URLs: FR=`{SITE_URL}/`, EN=`{SITE_URL}/en`, x-default=`{SITE_URL}/`.
**Warning signs:** Google Search Console "hreflang points to redirect"; sitemap `<loc>` differs from the canonical.

### Pitfall 3: axe `color-contrast` in jsdom — false negatives, NOT real coverage
**What goes wrong:** Plan assumes axe verifies contrast; jsdom has no layout/paint, so axe can't compute contrast. Either it errors or silently passes — neither is real coverage.
**Why:** "Color contrast checks do not work in JSDOM so are turned off in jest-axe" (and vitest-axe forks it).
**How to avoid:** Disable explicitly: `axe(container, { rules: { 'color-contrast': { enabled: false } } })`. Document that contrast is covered by `validateFullMatrix` (A11Y-07) + the ThemeProvider auto-adjust + manual Lighthouse a11y (A11Y-08). Real contrast verification is the stress test + Lighthouse, NOT axe-in-jsdom.
**Warning signs:** axe passing while a known-bad palette ships; treating axe green as contrast-proof.

### Pitfall 4: `error.tsx` client-only — `metadata`/`generateMetadata` and server imports forbidden
**What goes wrong:** Importing `getTranslations` (server) or exporting `metadata` from `error.tsx` → build error.
**Why:** Error boundaries are Client Components; metadata exports unsupported there.
**How to avoid:** `'use client'` at top; `useTranslations('errors.500')` + `useLocale()`. No `next-intl/server` imports. No `metadata` export. The IntlProvider in `[locale]/layout.tsx` already supplies messages (verified: layout passes the FULL `messages` bundle, so `errors.500` is available client-side).
**Warning signs:** `"useTranslations is not a function"` / `"metadata export not supported in Client Component"`.

### Pitfall 5: Lighthouse flakiness — don't block the phase on a local 89
**What goes wrong:** Local Lighthouse on `next start` is environment-sensitive (CPU throttling, cold cache, background processes). A flaky 88-89 blocks the gate.
**Why:** Lighthouse mobile simulates throttling; local hardware variance is high. The authoritative number is on Vercel's edge (Phase 7).
**How to avoid:** Record scores as evidence (HUMAN-UAT), treat ≥90 as a target; if 88-89 on a transient run, re-run from a clean state (close apps, fresh `next start`). Automated proxies (axe a11y green, build output bundle check, metadata/sitemap tests) cover what's deterministic. **Definitive A11Y-08 = Phase 7 deployed URL.**
**Warning signs:** Score swings ±5 between runs; one slow run failing the gate.

### Pitfall 6 (regression guard): FOUC palette restore — do NOT touch `PaletteFouCScript` or `suppressHydrationWarning`
**What goes wrong:** Metadata work in `layout.tsx` accidentally removes/reorders `<head>`'s `PaletteFouCScript` or drops `suppressHydrationWarning` → reintroduces Pitfall 1 (FOUC) from the research PITFALLS.md.
**Why:** The metadata edit is in the same `layout.tsx` file as the FOUC script.
**How to avoid:** `generateMetadata` is a separate export from the default component — expanding it does NOT touch `<head>`/`<html>`. Verify `PaletteFouCScript` + `suppressHydrationWarning` are unchanged in the diff. The existing FOUC test (Phase 2) should stay green.
**Warning signs:** FOUC flash on cold load with a stored non-Terra palette; hydration mismatch warnings return.

## Code Examples

> All patterns verified against Next.js 16.2.6 docs (2026-05-27) + next-intl v4 + in-repo precedents. Drop into task `<action>` blocks. **Colors via `oklchToHex(PALETTES[0].xxx)` in OG files only; everywhere else use palette utilities.**

### §1 — Root `generateMetadata` expansion (A11Y-01, D-01/02/03)
```tsx
// app/[locale]/layout.tsx — expand the EXISTING generateMetadata (do NOT touch <head>/FOUC script)
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';

type Params = Promise<{ locale: string }>;

// hreflang helper: absolute URL per locale via as-needed-aware getPathname.
function hreflangMap(href: string) {
  return {
    'fr-FR': `${SITE_URL}${getPathname({ href, locale: 'fr' })}`, // → {SITE_URL}/...
    'en-US': `${SITE_URL}${getPathname({ href, locale: 'en' })}`, // → {SITE_URL}/en/...
    'x-default': `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  const canonical = `${SITE_URL}${getPathname({ href: '/', locale })}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: 'Tanguy Delrieu — Tech × Design × BIM',
    description: t('tagline'),
    alternates: {
      canonical,
      languages: hreflangMap('/'),
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: 'Tanguy Delrieu — Tech × Design × BIM',
      description: t('tagline'),
      siteName: 'Tanguy Delrieu',
      url: canonical,
      // opengraph-image.tsx auto-injects og:image — no need to list it here.
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tanguy Delrieu — Tech × Design × BIM',
      description: t('tagline'),
    },
  };
}
```
**Resolved hreflang URLs (home):** `fr-FR` → `https://tanguy.dev/`, `en-US` → `https://tanguy.dev/en`, `x-default` → `https://tanguy.dev/`. (Assumes `SITE_URL='https://tanguy.dev'` placeholder.)

### §2 — `lib/constants.ts` SITE_URL (D-01)
```ts
// lib/constants.ts — ADD (keep existing EMAIL/GITHUB_URL/LINKEDIN_URL)
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev'
).replace(/\/$/, ''); // strip trailing slash so `${SITE_URL}${pathname}` never double-slashes
```

### §3 — Project page `generateMetadata` expansion (A11Y-01, D-02/03)
```tsx
// app/[locale]/projects/[slug]/page.tsx — expand the EXISTING title-only generateMetadata
import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import { getProjectBySlug, type Locale } from '@/lib/projects';

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};

  const href = `/projects/${slug}`;
  const canonical = `${SITE_URL}${getPathname({ href, locale })}`;

  return {
    title: `${project.title} — Tanguy Delrieu`,
    description: project.summary,
    alternates: {
      canonical,
      languages: {
        'fr-FR': `${SITE_URL}${getPathname({ href, locale: 'fr' })}`,
        'en-US': `${SITE_URL}${getPathname({ href, locale: 'en' })}`,
        'x-default': `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: project.title,
      description: project.summary,
      url: canonical,
    },
    twitter: { card: 'summary_large_image', title: project.title, description: project.summary },
  };
}
```
**Note on `getPathname` typing for dynamic hrefs:** `getPathname` may need the object form `getPathname({ href: { pathname: '/projects/[slug]', params: { slug } }, locale })` if the pathname helper expects the route pattern. The repo already uses `href={\`/projects/${prevSlug}\` as never}` in page.tsx (string form with `as never` cast) — the planner should try the plain string `/projects/${slug}` first; if next-intl's typed pathnames reject it, use the object form. Both resolve identically at runtime.

### §4 — Shared OG layout helper + home/project OG (A11Y-01, D-04 — Open Q1 RESOLVED)
```tsx
// lib/og.tsx — shared Satori-safe JSX + Terra hex (the ONE sanctioned hex boundary)
import { PALETTES } from '@/lib/palettes';
import { oklchToHex } from '@/lib/colors';

const terra = PALETTES[0]!; // DEFAULT_PALETTE_ID === 'terra' (PALETTES[0])
export const OG_COLORS = {
  bg: oklchToHex(terra.bg),
  surface: oklchToHex(terra.surface),
  text: oklchToHex(terra.text),
  textMuted: oklchToHex(terra.textMuted),
  accent: oklchToHex(terra.accent),
  secondary: oklchToHex(terra.secondary),
};

export const OG_SIZE = { width: 1200, height: 630 } as const;

// Satori: flex ONLY, no grid. Every multi-child div sets display:flex.
export function OgCard(props: { title: string; subtitle: string; badge?: string }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', backgroundColor: OG_COLORS.bg,
      padding: '64px', fontFamily: 'Inter',
    }}>
      <div style={{ display: 'flex', height: '12px', width: '160px', backgroundColor: OG_COLORS.accent, borderRadius: '6px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {props.badge && (
          <div style={{ display: 'flex', alignSelf: 'flex-start', backgroundColor: OG_COLORS.secondary, color: OG_COLORS.bg, fontSize: 28, padding: '6px 18px', borderRadius: '999px', marginBottom: '20px' }}>
            {props.badge}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 600, color: OG_COLORS.text, lineHeight: 1.1 }}>{props.title}</div>
        <div style={{ display: 'flex', fontSize: 36, color: OG_COLORS.textMuted, marginTop: '16px' }}>{props.subtitle}</div>
      </div>
    </div>
  );
}
```
```tsx
// app/[locale]/opengraph-image.tsx — home OG (statically optimized at build)
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OgCard, OG_SIZE } from '@/lib/og';

export const alt = 'Tanguy Delrieu — Tech × Design × BIM';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  const inter = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));
  return new ImageResponse(
    <OgCard title="Tanguy Delrieu" subtitle="Tech × Design × BIM" />,
    { ...size, fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }] },
  );
}
```
```tsx
// app/[locale]/projects/[slug]/opengraph-image.tsx — project OG (dynamic [slug]; params is a Promise in Next 16)
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OgCard, OG_SIZE } from '@/lib/og';
import { getProjectBySlug, type Locale } from '@/lib/projects';

export const alt = 'Project — Tanguy Delrieu';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  const inter = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));
  return new ImageResponse(
    <OgCard
      title={project?.title ?? 'Tanguy Delrieu'}
      subtitle={String(project?.year ?? '')}
      badge={project?.category?.toUpperCase()}
    />,
    { ...size, fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }] },
  );
}
```
> **Open Q1 verdict:** Dynamic `next/og` WORKS under Next 16 + Turbopack. `params` resolves to `Promise` (v16.0.0 changelog). Node runtime is default for file-based metadata routes — `readFile` from `process.cwd()` is the official pattern. Because the OG route is colocated under `[slug]` (which has `generateStaticParams` + `dynamicParams = false`), the OG images prerender for the 12 routes at build. **No static `public/og.png` fallback needed.** Font asset: place a real `Inter-SemiBold.ttf` (or `.otf`) in `assets/` (Wave 0 task — download from the Inter release or extract from `next/font` cache). Keep total OG bundle < 500KB (one weight only).

### §5 — `app/sitemap.ts` (A11Y-02, D-05)
```ts
// app/sitemap.ts — build-time static sitemap (default export may be async)
import type { MetadataRoute } from 'next';
import { getPathname } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/constants';
import { getProjectSlugs } from '@/lib/projects';

function abs(href: string, locale: 'fr' | 'en') {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs(); // skips _* templates (D-24)
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: abs('/', 'fr'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages: { 'fr-FR': abs('/', 'fr'), 'en-US': abs('/', 'en') } },
  };

  const projects: MetadataRoute.Sitemap = slugs.map((slug) => {
    const href = `/projects/${slug}`;
    return {
      url: abs(href, 'fr'),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: { languages: { 'fr-FR': abs(href, 'fr'), 'en-US': abs(href, 'en') } },
    };
  });

  return [home, ...projects];
}
```
> **Sitemap structure note:** The Next docs localized example uses ONE entry per logical URL with `<loc>` = canonical (fr) + `<xhtml:link>` alternates for each locale. The above mirrors that (12 project entries + 1 home = 13 entries, each with fr/en alternates). REQUIREMENTS A11Y-02 mentions `/`, `/fr`, `/en` explicitly — note `/fr` redirects to `/` under as-needed, so the canonical `<loc>` is `/` (NOT `/fr`); the fr/en alternates cover both. If the verifier wants literal `/en` rows too, the planner can emit separate fr and en `<loc>` entries instead — both are valid; document the choice in the plan. Recommended: canonical-`<loc>`-with-alternates (Google-preferred).

### §6 — `app/robots.ts` (A11Y-02, D-06)
```ts
// app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

### §7 — `app/[locale]/error.tsx` (A11Y-03, D-08 — client, reset())
```tsx
'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.500');
  useEffect(() => {
    // optional: report error; keep silent in prod per project console hygiene
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-foreground text-3xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('message')}</p>
      <Button onClick={() => reset()}>{t('reset')}</Button>
    </div>
  );
}
```
> `errors.500` keys already exist (`title`/`message`/`reset`). `reset()` is the stable prop (Next 16.2 added `unstable_retry` and now prefers it, but `reset()` remains documented and matches locked D-08). The IntlProvider in `[locale]/layout.tsx` supplies messages client-side (verified — full bundle passed).

### §8 — `app/[locale]/not-found.tsx` (A11Y-03, EGG-02, D-07)
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('errors.404');
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <span className="text-accent text-8xl font-bold tracking-tight">404</span>
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('message')}</p>
        <Button asChild>
          <Link href="/">{t('back')}</Link>
        </Button>
      </motion.div>
    </div>
  );
}
```
> next-intl recommends `useTranslations` (client) for localized not-found — works because it renders inside `[locale]/layout.tsx`'s IntlProvider. `not-found.tsx` accepts NO props (don't read params). `<Link href="/">` from `@/i18n/navigation` auto-prefixes the active locale (fr→`/`, en→`/en`). `useReducedMotion()` from `motion/react` gates scale→opacity-only (Pitfall 11 in research PITFALLS.md). The whole component being `'use client'` is fine — it's a leaf 404, no SEO cost (404s are `noindex`).

### §9 — `app/[locale]/loading.tsx` (A11Y-03, D-09)
```tsx
// Server Component (no 'use client'). motion-safe: pulse → static under reduced-motion.
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="bg-accent h-10 w-10 rounded-full opacity-80 motion-safe:animate-pulse" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
```
> `motion-safe:animate-pulse` is a Tailwind variant (`@media (prefers-reduced-motion: no-preference)`) — reduced-motion users get a static dot. Optional duplicate at `app/[locale]/projects/[slug]/loading.tsx` (slowest route). If an `errors`/`common.loading` i18n label is wanted, add `errors.loading` (or `common.loading`) to BOTH locales (parity gate).

### §10 — vitest-axe setup + a11y test (A11Y-04, D-10 — Open Q3 RESOLVED)
```ts
// vitest-setup.ts — NEW setup file (additive; does NOT globally extend jest-dom)
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';
expect.extend(matchers);
```
```ts
// vitest.config.ts — EDIT: add the setup file (existing setupFiles: [] → [path])
//   setupFiles: ['./vitest-setup.ts'],
```
```ts
// vitest-axe.d.ts — NEW: TS augmentation so toHaveNoViolations typechecks
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';
declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
```
```tsx
// components/sections/Hero.a11y.test.tsx — one surface example
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

// Mock motion/next-intl/gsap exactly as the existing Hero.test.tsx does
// (reuse the established mock shapes — motion via React.createElement, next-intl flat resolver).

describe('Hero (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { Hero } = await import('./Hero');
    const { container } = render(<Hero />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } }, // jsdom can't compute contrast — validateFullMatrix covers it
    });
    expect(results).toHaveNoViolations();
  });
});
```
> **Install `vitest-axe@1.0.0-pre.5`** (NOT `latest`). The `./matchers` + `./extend-expect` subpaths only exist in the prerelease. Reuse the existing per-component mock conventions (read each surface's `*.test.tsx` for the exact mock shape — motion/react via `React.createElement`, next-intl flat key resolver). For the project page shell, mock `getProjectBySlug` + the MDX dynamic import (the page never renders past the import in jsdom — see `page.test.tsx`); axe the static chrome only (metadata strip via a fixture, gallery, prev/next).

### §11 — Palette stress test (A11Y-07, D-14)
```ts
// lib/colors.stress.test.ts — seeded, deterministic
import { describe, it, expect } from 'vitest';
import { parse } from 'culori';
import {
  generateHarmonic, validateFullMatrix, applyMatrixAdjust,
  type HarmonicMode,
} from '@/lib/colors';
import { PALETTES } from '@/lib/palettes';

// Mulberry32 — deterministic seeded RNG (no dep).
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xC0FFEE);
const MODES: HarmonicMode[] = ['complementary', 'triadic', 'analogous', 'split-complementary'];

function randomHex() {
  const h = Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0');
  return `#${h}`;
}

describe('A11Y-07 — palette stress (10 random sources × 4 modes)', () => {
  for (let i = 0; i < 10; i++) {
    const src = randomHex();
    for (const mode of MODES) {
      it(`generateHarmonic(${mode}, ${src}) → valid AA matrix + 6 OKLCh tokens`, () => {
        const tokens = generateHarmonic(mode, src);
        const { palette } = applyMatrixAdjust({ ...tokens }); // D-11 silent AA fix-up
        const result = validateFullMatrix(palette);
        expect(result.valid, result.failures.join('; ')).toBe(true);
        for (const key of ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary'] as const) {
          const parsed = parse(palette[key]);
          expect(parsed, `${key}=${palette[key]} unparseable`).toBeTruthy();
          // no NaN in any channel
          for (const v of Object.values(parsed!)) {
            if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false);
          }
        }
      });
    }
  }
  it('4 presets still pass the 7-pair matrix (regression guard)', () => {
    for (const p of PALETTES) {
      expect(validateFullMatrix(p).valid, `${p.id} failed`).toBe(true);
    }
  });
});
```
```ts
// scripts/stress-test-palettes.ts — tsx-runnable mirror (exit 1 on any failure), for CI/manual.
//   Reuse the same RNG + assertions; console.error + process.exit(1) on failure (matches check-* precedent).
```
> Reuses the locked `validateFullMatrix` + `applyMatrixAdjust` (D-11) from `lib/colors.ts`. `generateHarmonic` may throw on an unparseable source — `randomHex` always produces a valid hex, so no throw. Add `npm run test:stress` script if a standalone gate is wanted (mirrors `test:palettes`).

### §12 — `scripts/check-reduced-motion.ts` (A11Y-05, D-12)
```ts
// scripts/check-reduced-motion.ts — grep gate, exit-0 contract (mirrors check-i18n-parity.ts).
// For every .tsx under components/ that imports a motion API (useGSAP / gsap.timeline /
// gsap.matchMedia / motion. / whileHover / animate=), assert a sibling reduced-motion guard
// reference EXISTS in the same file: usePrefersReducedMotion | useReducedMotion |
// gsap.matchMedia | 'prefers-reduced-motion' | motion-safe: | motion-reduce:.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['components', 'app'];
const ANIM = /useGSAP|gsap\.timeline|gsap\.to\(|gsap\.from\(|whileHover|whileTap|animate=|motion\./;
const GUARD = /usePrefersReducedMotion|useReducedMotion|gsap\.matchMedia|prefers-reduced-motion|motion-safe:|motion-reduce:/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.tsx') && !/\.(test|spec)\.tsx$/.test(p)) out.push(p);
  }
  return out;
}

const failures: string[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    if (ANIM.test(src) && !GUARD.test(src)) {
      failures.push(`❌ ${file}: animates but no reduced-motion guard found`);
    }
  }
}
if (failures.length) {
  console.error('Reduced-motion gate FAILED.');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('✅ Reduced-motion gate OK — every animating file has a guard.');
```
> **Audit first (D-12):** run the gate; expect it to pass (15+ files already gated per STATE.md + verified About/Image/ProjectCard). If a file trips (e.g., a `motion.` import used only for a non-animating element), refine the regex or add a guard. Known-safe files: `About.tsx` (gsap.matchMedia), `Image.tsx` (usePrefersReducedMotion), `ProjectCard.tsx` (useReducedMotion), `not-found.tsx` (useReducedMotion, NEW). Tune `ANIM`/`GUARD` to avoid false positives on `motion`-imported-but-static components.

### §13 — `scripts/check-image-audit.ts` (A11Y-06, D-13)
```ts
// scripts/check-image-audit.ts — grep gate: every next/image <Image> has width+height OR fill;
// no bare lowercase <img>. exit-0 contract.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir: string): string[] { /* same walker as §12, .tsx non-test */ return []; }

const failures: string[] = [];
for (const root of ['components', 'app']) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    // bare <img ...> (lowercase) is forbidden
    if (/<img[\s>]/.test(src)) failures.push(`❌ ${file}: bare <img> — use next/image`);
    // each <Image ...> (or aliased NextImage) block must contain fill OR width+height
    const blocks = src.match(/<(?:Image|NextImage)\b[^>]*\/?>/gs) ?? [];
    for (const b of blocks) {
      const hasFill = /\bfill\b/.test(b);
      const hasDims = /\bwidth=/.test(b) && /\bheight=/.test(b);
      if (!hasFill && !hasDims) failures.push(`❌ ${file}: <Image> missing fill or width+height`);
    }
  }
}
if (failures.length) { console.error('Image audit FAILED.'); failures.forEach((f) => console.error(`  ${f}`)); process.exit(1); }
console.log('✅ Image audit OK.');
```
> **Audit findings (verified):** 4 files use `next/image`: `ProjectCover.tsx` (`fill` + `priority` — above-fold cover, correct), `About.tsx` (`width=400 height=500` + `loading="lazy"`, correct), `ProjectCard.tsx` (check `width`/`height`), `mdx/Image.tsx` (`width`/`height` + `loading="lazy"`, correct). `next.config.ts` does NOT currently set `images.formats` — Next 16 default already serves AVIF/WebP, but D-13 says add explicitly: `images: { formats: ['image/avif', 'image/webp'] }` in `next.config.ts` (Wave 0).

### §14 — Lighthouse npm script (A11Y-08, D-15)
```jsonc
// package.json scripts — ADD
{
  "lighthouse": "lighthouse http://localhost:3000/en --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./.lighthouse/report.html --chrome-flags=\"--headless\"",
  "lighthouse:mobile": "lighthouse http://localhost:3000/en --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./.lighthouse/mobile.html --chrome-flags=\"--headless\""
}
```
> **Process (HUMAN-UAT):** `npm run build && npm run start` in one terminal, then `npm run lighthouse:mobile` in another (A11Y-08 specifies MOBILE). Record the 4 scores in the SUMMARY. Fix <90 (likely image sizing/font preload/metadata). Lighthouse default IS mobile (`--preset=desktop` forces desktop); for mobile, OMIT `--preset` or use `--form-factor=mobile`. Add `.lighthouse/` to `.gitignore`. **Authoritative ≥90 = Phase 7 deployed URL** — don't block the phase on a flaky local 89 (Pitfall 5).

### §15 — Global `:focus-visible` ring (A11Y-04, D-11) — add to globals.css IF missing
```css
/* app/globals.css — ADD if no global focus-visible rule exists (verified: NONE currently).
   --ring already = var(--color-accent). globals.css has `* { @apply ... outline-ring/50 }`
   in @layer base, but no explicit :focus-visible. Add a visible focus ring: */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
/* Optional reduced-motion CSS safety net (research PITFALLS.md Pitfall 11) — NOT currently present: */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
> **Verified:** globals.css has the `@layer base * { outline-ring/50 }` line but no explicit `:focus-visible` selector and NO `@media (prefers-reduced-motion)` block. D-11 says add the focus ring if missing. The reduced-motion CSS net is a belt-and-suspenders for A11Y-05 (JS gates already cover it, but the CSS `!important` block neutralizes the global 400ms color transition + any stray CSS animation). **Caution:** the global `* { transition: color/bg/border 400ms }` (ARCH-04) is a *color* transition — the reduced-motion block will flatten it to 0.01ms, which is acceptable (palette swaps become instant under reduced motion). Verify this doesn't break the Phase 2 Pitfall-E overlay transitions test.

## Runtime State Inventory

> Phase 6 is additive (new files + audits), NOT a rename/refactor/migration. No stored data, live-service config, OS-registered state, or build artifacts carry a renamed string. **Inventory N/A — verified: no rename/migration in scope.** The only env var introduced is `NEXT_PUBLIC_SITE_URL` (D-01) which has a code default (`'https://tanguy.dev'`) and is set in Phase 7; no migration of existing data.

## Validation Architecture

> Nyquist Dimension 8 — REQUIRED (`workflow.nyquist_validation: true` in config.json).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 + jsdom 29 + @testing-library/react 16 (existing) |
| Config file | `vitest.config.ts` (EDIT: add `setupFiles: ['./vitest-setup.ts']` for vitest-axe matchers) |
| Quick run command | `npx vitest run <path>` (single file) |
| Full suite command | `npm test` (`vitest run`) — currently 276/276 green |
| Standalone gates | `tsx scripts/check-i18n-parity.ts`, `tsx scripts/check-mdx-structure.ts` (precedents); NEW: `check-reduced-motion.ts`, `check-image-audit.ts`, `stress-test-palettes.ts` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| A11Y-01 | Root `generateMetadata` returns `openGraph` + `alternates.languages` (fr/en/x-default) + `metadataBase` | unit | `npx vitest run app/[locale]/layout.metadata.test.ts` (call `generateMetadata({params})`, assert keys) | ❌ Wave 1 |
| A11Y-01 | Project `generateMetadata` returns `type:'article'` + per-project OG + hreflang | unit | `npx vitest run app/[locale]/projects/[slug]/metadata.test.ts` | ❌ Wave 1 |
| A11Y-01 | `getPathname` hreflang map: fr→`/`, en→`/en`, x-default→`/` (as-needed) | unit | assert `hreflangMap('/')` resolves to expected absolute URLs | ❌ Wave 1 |
| A11Y-01 | Build emits `opengraph-image` routes for home + 12 project routes | build (HUMAN-UAT proxy) | `npm run build` then grep `.next` for `opengraph-image` outputs; visit `/en/opengraph-image` in dev | ❌ Wave 1 |
| A11Y-02 | `sitemap()` returns 13 entries (1 home + 12 projects), each with fr/en `alternates` | unit | `npx vitest run app/sitemap.test.ts` (call default export, assert length + alternates shape) | ❌ Wave 1 |
| A11Y-02 | `robots()` disallows `/api/`, allows `/`, references `{SITE_URL}/sitemap.xml` | unit | `npx vitest run app/robots.test.ts` | ❌ Wave 1 |
| A11Y-03 | `error.tsx` renders `errors.500` + a button that calls `reset` | unit | `npx vitest run app/[locale]/error.test.tsx` (render, click, assert `reset` spy called) | ❌ Wave 1 |
| A11Y-03 / EGG-02 | `not-found.tsx` renders `errors.404` title/message + back `<Link href="/">` | unit | `npx vitest run app/[locale]/not-found.test.tsx` (assert text + anchor) | ❌ Wave 1 |
| A11Y-03 | `loading.tsx` renders a `role="status"` spinner with `motion-safe:animate-pulse` | unit | `npx vitest run app/[locale]/loading.test.tsx` | ❌ Wave 1 |
| EGG-02 | 404 motion entry gates on `useReducedMotion` (opacity-only when reduced) | unit | assert `initial`/`animate` props differ by reduce flag (mock `useReducedMotion`) | ❌ Wave 1 |
| A11Y-04 | Each surface (Hero/About/ProjectsSection/Skills/Contact/PaletteSwitcher/PaletteFab/not-found/error) → `toHaveNoViolations` (color-contrast disabled) | unit (axe) | `npx vitest run "**/*.a11y.test.tsx"` | ❌ Wave 2 |
| A11Y-04 | Icon-only buttons have accessible names (covered by axe `button-name` rule) | unit (axe) | same a11y suite (axe flags missing names) | ❌ Wave 2 |
| A11Y-04 | Full keyboard Tab cycle + focus order + Esc-close + live-region announce | **MANUAL (HUMAN-UAT)** | jsdom cannot verify focus order/live-regions | N/A — manual |
| A11Y-05 | Every animating file has a reduced-motion guard | static gate | `tsx scripts/check-reduced-motion.ts` (exit 0) | ❌ Wave 2 |
| A11Y-05 | Lenis disabled under reduced motion (research Pitfall 4/5) | unit (existing) | LenisProvider.test.tsx already covers reduced-motion skip (verify still green) | ✅ exists |
| A11Y-06 | Every `<Image>` has `fill` or `width`+`height`; no bare `<img>` | static gate | `tsx scripts/check-image-audit.ts` (exit 0) | ❌ Wave 2 |
| A11Y-06 | `next.config.ts` sets `images.formats: ['image/avif','image/webp']` | config assertion | grep `next.config.ts` | ❌ Wave 0 |
| A11Y-07 | 10 seeded random `generateHarmonic` palettes × 4 modes pass `validateFullMatrix` (after `applyMatrixAdjust`) + all 6 tokens parse OKLCh, no NaN | unit | `npx vitest run lib/colors.stress.test.ts` | ❌ Wave 1 |
| A11Y-07 | 4 presets still pass 7-pair matrix (regression) | unit | same file | ❌ Wave 1 |
| A11Y-07 | Random palette doesn't overflow/clip UI (visual layout) | **MANUAL (HUMAN-UAT)** | jsdom can't measure layout | N/A — manual |
| A11Y-08 | Lighthouse mobile ≥90 on Perf/A11y/BP/SEO vs prod build | **MANUAL/SCRIPTED (HUMAN-UAT)** | `npm run build && npm run start` + `npm run lighthouse:mobile`; record 4 scores | N/A — env-sensitive |
| A11Y-08 (proxy) | Build succeeds; bundle not bloated; metadata/sitemap tests green | automated proxy | `npm run build` + the A11Y-01/02 unit tests | ❌ Wave 1/2 |

### Sampling Rate
- **Per task commit:** `npx vitest run <touched test>` + relevant gate (`tsx scripts/check-*.ts`).
- **Per wave merge:** `npm test` (full suite) + all `tsx scripts/check-*.ts` gates + `npm run lint`.
- **Phase gate:** Full suite green + all gates exit 0 + `npm run build` succeeds + Lighthouse scores recorded (HUMAN-UAT) before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `npm install --save-dev vitest-axe@1.0.0-pre.5 lighthouse` — A11Y-04, A11Y-08
- [ ] `vitest-setup.ts` + `vitest-axe.d.ts` + `vitest.config.ts` setupFiles edit — A11Y-04 (Wave 0 so Wave 2 a11y tests have matchers)
- [ ] `assets/Inter-SemiBold.ttf` (or `.otf`) bundled font — A11Y-01 OG (Wave 0/1)
- [ ] `next.config.ts` `images.formats` — A11Y-06 (Wave 0)
- [ ] `lib/constants.ts` `SITE_URL` — A11Y-01 (Wave 0 or start of Wave 1 metadata plan)
- [ ] `.lighthouse/` added to `.gitignore` — A11Y-08

*(Test files for metadata/sitemap/robots/error/not-found/loading/stress/a11y are authored in their respective Wave 1/2 plans, not Wave 0 — but the vitest-axe matcher infra + font + config MUST land in Wave 0 so the Wave 2 audit plan can run.)*

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | ✓ (Next 16 requires ≥20.9) | per machine | — |
| `next/og` (Satori/Resvg) | A11Y-01 OG | ✓ built into `next@16.2.6` | bundled | static `public/og.png` (sanctioned, NOT needed) |
| Chrome/Chromium (Lighthouse) | A11Y-08 | ⚠️ Lighthouse auto-downloads or uses system Chrome | — | Run on Vercel (Phase 7) if local Chrome unavailable |
| `vitest-axe@1.0.0-pre.5` | A11Y-04 | ✗ (to install) | 1.0.0-pre.5 | `0.1.0` default-import (older API) |
| `lighthouse` | A11Y-08 | ✗ (to install) | ^13.3.0 | manual DevTools Lighthouse panel |
| Inter font file | A11Y-01 OG | ✗ (to add to `assets/`) | — | extract from `node_modules/.next` font cache, or system font (unreliable in Satori) |

**Missing dependencies with no fallback:** None hard-blocking. Lighthouse needs Chrome — if the dev machine lacks it, `lighthouse` npm package auto-fetches a Chromium, OR defer to Phase 7 Vercel (A11Y-08 is environment-sensitive by design).

**Missing dependencies with fallback:** `vitest-axe` (prerelease preferred, `0.1.0` fallback), Inter font (download vs system).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@vercel/og` standalone package | `next/og` built-in (`import { ImageResponse } from 'next/og'`) | Next 14 (moved from `next/server` → `next/og`) | ZERO OG dependency; CONTEXT.md D-04 correct. |
| `error.tsx` `reset()` only | `error.tsx` `unstable_retry()` preferred (`reset()` still works) | Next 16.2.0 | Keep `reset()` (stable, locked D-08). `unstable_retry` is opt-in/unstable. |
| OG `params` synchronous | OG `params` is a `Promise` | Next 16.0.0 | `await params` in `[slug]/opengraph-image.tsx` (Code §4). |
| `vitest-axe` default import | `vitest-axe/matchers` + `vitest-axe/extend-expect` subpaths | `1.0.0-pre.x` (the `0.1.0` latest tag predates subpaths) | Install the prerelease for the documented API. |
| Manual `sharp` install | Next 16 auto-bundles sharp | Next 16 | No action (next/image optimization works on build/Vercel). |

**Deprecated/outdated:**
- `@vercel/og` as a dependency — superseded by built-in `next/og`. Do NOT add.
- `metadata.themeColor` — deprecated since Next 14 (use `viewport` config). Not needed (no theme-color in scope, D deferred).
- `next lint` — removed in Next 16; use `eslint` directly (already configured).

## Open Questions

**All 5 CONTEXT.md-flagged open questions are RESOLVED (see Summary + Code Examples). No remaining blockers.** Residual minor items for the planner (low risk, decide in-plan):

1. **`getPathname` typed-href for dynamic routes** — try plain string `/projects/${slug}` first; if next-intl's typed `Pathnames` rejects it, use the object form `{ pathname: '/projects/[slug]', params: { slug } }`. Both resolve identically. (The repo already casts with `as never` in page.tsx for string hrefs.)
   - Recommendation: string form + `as` cast if TS complains; runtime is identical.
2. **Sitemap `<loc>` shape** — canonical-fr-`<loc>`-with-fr/en-alternates (recommended, Google-preferred, matches Next docs example) vs separate fr + en `<loc>` rows. A11Y-02 mentions `/`, `/fr`, `/en` literally; note `/fr`→`/` redirect makes `/` the canonical. Document the choice; verifier may accept either.
   - Recommendation: canonical-with-alternates (13 entries).
3. **Inter font sourcing** — download `Inter-SemiBold.ttf` from the Inter GitHub release into `assets/`, OR a system-font OG (unreliable in Satori). Wave 0 task.
   - Recommendation: bundle one real ttf weight (~100-300KB, well under the 500KB OG budget).

## Sources

### Primary (HIGH confidence — Next.js 16.2.6 official docs, lastUpdated 2026-05-27)
- Next.js `ImageResponse` (`next/og`) — https://nextjs.org/docs/app/api-reference/functions/image-response — Satori flexbox-only/no-grid, 500KB bundle, ttf/otf/woff, `readFile` font loading, `fonts` option shape.
- Next.js `opengraph-image`/`twitter-image` — https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image — dynamic `[slug]` support, `params` is `Promise` (v16.0.0), static optimization, `alt`/`size`/`contentType` exports, Node-runtime local-asset example.
- Next.js `generateMetadata` — https://nextjs.org/docs/app/api-reference/functions/generate-metadata — `metadataBase`, `alternates.languages`/`canonical`, `openGraph`, `twitter`, URL composition, `x-default` is a valid `languages` key (hreflang).
- Next.js `sitemap.xml` — https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap — `MetadataRoute.Sitemap`, async default export OK, per-entry `alternates.languages`, localized example (canonical `<loc>` + `<xhtml:link>` alternates).
- Next.js `robots.txt` — https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots — `MetadataRoute.Robots`, `rules` array, `sitemap` field.
- Next.js `not-found.js` — https://nextjs.org/docs/app/api-reference/file-conventions/not-found — Server Component default, NO props, renders on `notFound()`, client-hook caveat.
- Next.js `error.js` — https://nextjs.org/docs/app/api-reference/file-conventions/error — `'use client'` required, `{error, reset}` (+ `unstable_retry` new in 16.2.0), wraps page/nested not same-segment layout.
- next-intl error files — https://next-intl.dev/docs/environments/error-files — `useTranslations` (client) for not-found + error; IntlProvider supplies messages; unknown-locale `notFound()` in layout.
- next-intl navigation — https://next-intl.dev/docs/routing/navigation — `getPathname({ href, locale })` returns `/` for default locale under as-needed, `/en/...` for non-default.

### Secondary (MEDIUM — verified against official sources / npm registry)
- vitest-axe README — https://github.com/chaance/vitest-axe/blob/main/README.md — `vitest-axe/matchers` + `vitest-axe/extend-expect`, `axe(html, { rules })`, TS `AxeMatchers` augmentation.
- npm registry (`npm view`) — `vitest-axe@0.1.0` (latest, stale, no subpath exports) vs `1.0.0-pre.5` (proper `exports`, `axe-core@^4.10.2`, peer `vitest >=1`); `axe-core@4.11.4`; `lighthouse@13.3.0`. (HIGH for versions.)
- jest-axe/vitest-axe color-contrast-in-jsdom — multiple sources (npm jest-axe, DEV/Medium articles) — contrast checks disabled in jsdom.

### In-repo precedents (read directly — HIGH)
- `app/[locale]/layout.tsx` — existing `generateMetadata` (getTranslations), `PaletteFouCScript` + `suppressHydrationWarning` (regression guard), full-`messages` IntlProvider.
- `app/[locale]/projects/[slug]/page.tsx` — title-only `generateMetadata`, `getProjectBySlug`/`getProjectSlugs`, `dynamicParams=false`, `generateStaticParams` (12 routes), `notFound()` on null, `Link` from `@/i18n/navigation`.
- `lib/colors.ts` — `generateHarmonic`, `validateFullMatrix`, `applyMatrixAdjust`, `CRITICAL_PAIRS`, `oklchToHex`, `parse` (culori).
- `lib/palettes.ts` — `PALETTES[0]` = Terra (DEFAULT_PALETTE_ID), 6 OKLCh tokens.
- `lib/projects.ts` — `getProjectSlugs()` (skips `_*`), discriminated `Project` union.
- `lib/constants.ts` — existing EMAIL/GITHUB_URL/LINKEDIN_URL (add SITE_URL).
- `i18n/routing.ts` — `localePrefix:'as-needed'`, `defaultLocale:'fr'`, `locales:['fr','en']`.
- `i18n/navigation.ts` — `getPathname` + `Link` exported from `createNavigation(routing)`.
- `messages/fr.json` — `errors.404` (title/message/back) + `errors.500` (title/message/reset) EXIST.
- `vitest.config.ts` — jsdom, `setupFiles: []`, `@/*` alias, include globs (root-level + app/components/lib/scripts).
- `app/[locale]/projects/[slug]/page.test.tsx` + `components/sections/Contact.test.tsx` — jsdom mock conventions (motion via `React.createElement`, next-intl flat resolver, no jest-dom global extend, native chai matchers).
- `scripts/check-i18n-parity.ts` + `scripts/check-mdx-structure.ts` — exit-0 gate precedent for `check-reduced-motion.ts` / `check-image-audit.ts`.
- `app/globals.css` — `--ring` = `var(--color-accent)`, `@layer base * { outline-ring/50 }`, global 400ms color transition; NO explicit `:focus-visible`, NO `@media (prefers-reduced-motion)` (both to add per D-11/A11Y-05).
- `next.config.ts` — MDX wiring (don't regress); NO `images.formats` yet (add per D-13).
- `components/sections/{About,ProjectCover,ProjectCard}.tsx` + `components/mdx/Image.tsx` — the 4 `next/image` usages (image audit).
- `lib/hooks/usePrefersReducedMotion.ts` — `useSyncExternalStore` reduced-motion hook (A11Y-05 anchor).
- `proxy.ts` — `next-intl/middleware` + matcher excluding `/api`, `_next`, files (note: uses `middleware` import not the Next-16 `proxy` API name, but is existing/working — OUT OF SCOPE to change).

## Metadata

**Confidence breakdown:**
- Open Q1 (dynamic next/og): HIGH — Next 16.2.6 docs show dynamic `[slug]` + `params` Promise + Node `readFile` font loading explicitly; Satori limits documented verbatim.
- Open Q2 (as-needed hreflang): HIGH — `getPathname` returns `/` for default locale confirmed; matches D-03 expected URLs.
- Open Q3 (vitest-axe): HIGH — npm registry inspected directly; `0.1.0` vs `1.0.0-pre.5` exports diff confirmed; jsdom color-contrast behavior confirmed.
- Open Q4 (error/not-found/loading): HIGH — Next 16.2.6 + next-intl error-files docs; existing layout IntlProvider verified to supply messages client-side.
- Open Q5 (Lighthouse): HIGH — `lighthouse@13.3.0` confirmed; mobile-preset + environment-sensitivity flagged.
- Stress test / gates: HIGH — reuse locked `lib/colors.ts` contract + existing script precedents.

**Research date:** 2026-05-28
**Valid until:** ~2026-06-28 (Next.js 16 stable, next-intl v4 stable; vitest-axe may promote `1.0.0` out of prerelease — re-check the tag at install time).
