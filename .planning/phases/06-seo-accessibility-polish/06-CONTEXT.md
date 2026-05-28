# Phase 6: SEO, Accessibility & Polish - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning
**Mode:** `--auto` (Claude picked recommended defaults; selections logged inline in `<decisions>`)

<domain>
## Phase Boundary

Pass the audit gate before deployment. Generate full per-route metadata (title, description, OG image, hreflang FR/EN), a sitemap + robots, ship the route-state trio (`loading.tsx`, `error.tsx`, `not-found.tsx`) with a personality-driven bilingual 404, drive axe-core to zero violations, prove `prefers-reduced-motion` is honored on every animation, audit `next/image` usage, stress-test the palette switcher against random palettes, and confirm Lighthouse ≥ 90 on all four axes against a production build.

Delivers REQ **A11Y-01..08** + **EGG-02** (9 requirements). Concretely:

- **`app/[locale]/layout.tsx`** — expand `generateMetadata` (currently title + description only, Phase 3) to full SEO: `metadataBase`, openGraph (title/description/locale/images/type=website), twitter card, hreflang `alternates.languages` for FR/EN + `x-default`. [A11Y-01]
- **`app/[locale]/projects/[slug]/page.tsx`** — expand its minimal `generateMetadata` (title only, Phase 5) to per-project openGraph (project title + summary + dynamic OG image + hreflang). [A11Y-01]
- **`app/[locale]/opengraph-image.tsx`** + **`app/[locale]/projects/[slug]/opengraph-image.tsx`** — dynamic branded OG cards via Next 16's built-in `ImageResponse` (`next/og`). Terra brand colors (the cold-load default palette) hardcoded since OG snapshots are not theme-reactive. [A11Y-01]
- **`app/sitemap.ts`** — static sitemap covering `/` (FR canonical), `/en`, and all project pages for both locales, with per-URL `alternates.languages`. Reads `getProjectSlugs()`. [A11Y-02]
- **`app/robots.ts`** — allow all, disallow `/api/*`, reference the sitemap URL. [A11Y-02]
- **`app/[locale]/not-found.tsx`** — the EGG-02 custom 404: bilingual playful copy (reuses existing `errors.404` i18n keys), motion entry animation (reduced-motion gated), styled `<Link>` back to `/{locale}`. [A11Y-03, EGG-02]
- **`app/[locale]/error.tsx`** — `'use client'` error boundary with the built-in `reset()` prop wired to a "Réessayer/Retry" button (reuses `errors.500` i18n). [A11Y-03]
- **`app/[locale]/loading.tsx`** (+ optional `app/[locale]/projects/[slug]/loading.tsx`) — lightweight skeleton/spinner respecting reduced-motion. [A11Y-03]
- **axe-core integration** via `vitest-axe` — automated zero-violation assertions on key rendered surfaces (homepage sections, project page shell, PaletteSwitcher) within the existing Vitest + jsdom suite. [A11Y-04]
- **reduced-motion audit + regression gate** — verify every animation entry point gates on `usePrefersReducedMotion` or `gsap.matchMedia` (already true across 15+ files); add a static-analysis test/grep gate to prevent regressions. [A11Y-05]
- **`next/image` audit + gate** — verify all 6 image usages have explicit `width`/`height` (or `fill`) + lazy loading except above-the-fold covers (`priority`); add a grep gate. [A11Y-06]
- **palette stress test** — a Vitest test generating 10 random harmonic palettes via `generateHarmonic` and asserting `validateFullMatrix` holds (after `adjustForAA`) + all 6 tokens parse as valid OKLCh, no NaN. [A11Y-07]
- **Lighthouse ≥ 90** — run `lighthouse` CLI (mobile) against a local production build (`next build && next start`), record the four scores, fix regressions; final on-Vercel confirmation deferred to Phase 7. [A11Y-08]
- **i18n** — the `errors.404` + `errors.500` namespaces already exist (Phase 1 ARCH-07); Phase 6 wires them and may add `errors.404.subtitle` / loading label keys. Parity gate (`scripts/check-i18n-parity.ts`) enforced.

**Out of scope for this phase** (explicit deferrals or owned elsewhere):

- **Actual Vercel deployment + live Lighthouse on the production URL** — Phase 7 (`DEPLOY-01..03`). Phase 6 runs Lighthouse locally against the production build as a pre-deploy gate.
- **`@vercel/analytics` + `@vercel/speed-insights`** — Phase 7 (`DEPLOY-03`).
- **E2E / Playwright test suite** — explicitly OOS per PROJECT.md ("Tests automatisés exhaustifs E2E"). axe runs via `vitest-axe` in jsdom, not a real browser.
- **Per-project unique OG photography** — dynamic OG cards use the project's frontmatter (title/category/year) + brand colors, NOT bespoke per-project social images. Real cover art is a pre-deploy user swap (Phase 7).
- **New animations or features** — Phase 6 audits and polishes existing behavior; it adds route-state pages + the 404, not new homepage/project capabilities.
- **Internationalization beyond FR/EN** — locked at 2 locales.
- **Cookie-consent / GDPR banner** — no analytics in v1 until Phase 7; no third-party trackers, so no banner needed in v1.
- **Structured data / JSON-LD** (Schema.org Person/CreativeWork) — nice-to-have; deferred to v2 unless trivial (planner discretion, but not required by A11Y-01).

</domain>

<decisions>
## Implementation Decisions

### Metadata & SEO (A11Y-01)

- **D-01:** **Add `metadataBase`** to the root `generateMetadata` in `app/[locale]/layout.tsx`. Value sourced from an env-aware constant: `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev')` (placeholder domain — user confirms real domain pre-deploy; centralize in `lib/constants.ts`). Required so OG/twitter image paths resolve to absolute URLs.
  - Auto-selected: **[auto] D-01 → recommended (metadataBase via env-aware constant, placeholder domain)**

- **D-02:** **Full openGraph + twitter blocks** in both `generateMetadata` functions (root + project page). Root: `openGraph: { type: 'website', locale, title, description, siteName: 'Tanguy Delrieu', images: [opengraph-image] }` + `twitter: { card: 'summary_large_image' }`. Project: `type: 'article'`, project title + summary, project-specific OG image. Descriptions localized via existing i18n (`hero.tagline` for root; `summary` frontmatter for projects).
  - Auto-selected: **[auto] D-02 → recommended (full OG + twitter, localized, per-route)**

- **D-03:** **hreflang alternates** via `alternates.languages`. Given `localePrefix: 'as-needed'` (FR canonical at `/`, EN at `/en`): root → `{ 'fr-FR': '/', 'en-US': '/en', 'x-default': '/' }`; project → `{ 'fr-FR': '/projects/{slug}', 'en-US': '/en/projects/{slug}', 'x-default': '/projects/{slug}' }`. **Researcher MUST confirm** the exact next-intl v4 helper for generating locale-aware pathnames (`getPathname` from `@/i18n/navigation` or the `routing` object) so the alternates use real resolved paths, not hand-built strings. Also set `alternates.canonical`.
  - Auto-selected: **[auto] D-03 → recommended (hreflang via next-intl pathname helper, as-needed-aware)**

- **D-04:** **Dynamic OG images via `next/og` `ImageResponse`** (built into Next 16 — ZERO new deps). Two files: `app/[locale]/opengraph-image.tsx` (home — name "Tanguy Delrieu" + role "Tech × Design × BIM" + Terra accent) and `app/[locale]/projects/[slug]/opengraph-image.tsx` (project — title + category badge + year). Both 1200×630. Brand colors are the **Terra default palette converted to hex** (OG snapshots are static, not theme-reactive — using the cold-load default is correct and on-brand). One shared layout helper. A bundled font (Inter subset) loaded via `fs`/`fetch` per the Next 16 OG pattern.
  - **Why dynamic over static:** This is a *design* portfolio — branded, auto-generated share cards demonstrate "attention au détail" (the core value). `next/og` is built-in, so no dependency cost.
  - **FALLBACK (planner/researcher may invoke if `next/og` proves too costly under Next 16 + Turbopack — e.g. font-loading or edge-runtime blockers):** ship a single static `public/og.png` (1200×630) referenced by both routes. A11Y-01 ("og:image") is satisfied either way. Document which path was taken.
  - Auto-selected: **[auto] D-04 → recommended (dynamic next/og branded cards, static fallback documented)**

### Sitemap & Robots (A11Y-02)

- **D-05:** **`app/sitemap.ts`** (static, build-time). Returns entries for: `/` (FR canonical, priority 1.0), `/en` (priority 1.0), and for each slug from `getProjectSlugs()`: `/projects/{slug}` (FR) + `/en/projects/{slug}` (EN). Each entry includes `alternates.languages` mirroring D-03. `lastModified` = build date (or project `year` where meaningful). Uses `metadataBase` for absolute URLs.
  - Auto-selected: **[auto] D-05 → recommended (static sitemap, getProjectSlugs-driven, with alternates)**

- **D-06:** **`app/robots.ts`** — `{ rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }], sitemap: '{metadataBase}/sitemap.xml' }`. (Note: there is no `/api/*` in v1 — the disallow is defensive/future-proofing per the requirement.)
  - Auto-selected: **[auto] D-06 → recommended (allow all, disallow /api/, link sitemap)**

### Route States & Custom 404 (A11Y-03, EGG-02)

- **D-07:** **`app/[locale]/not-found.tsx` IS the EGG-02 404.** Reuses the EXISTING `errors.404` i18n keys (already drafted Phase 1: FR title "Page introuvable", message "Il semble que vous vous soyez perdu dans le pixel art.", back "Retour à l'accueil"). Playful palette/pixel-art themed. Large "404" display, motion entry (`<motion.div>` fade + scale, `useReducedMotion()`-gated to opacity-only under reduced motion), styled shadcn `<Button asChild>` wrapping a `<Link href="/">` from `@/i18n/navigation` back to the locale home. **Server-rendered shell with a small client island** for the motion (not-found.tsx itself can be a Server Component rendering a `'use client'` motion wrapper). May add an `errors.404.subtitle` key if more copy is wanted (FR/EN parity).
  - Auto-selected: **[auto] D-07 → recommended (palette-themed playful 404, reuse errors.404 i18n, motion entry gated)**

- **D-08:** **`app/[locale]/error.tsx`** — MUST be `'use client'` (Next.js error boundaries are inherently client). Receives `{ error, reset }` props. Renders the `errors.500` i18n copy (title "Quelque chose s'est cassé", message "Désolé, j'ai cassé quelque chose. J'enquête.", reset "Réessayer") + a button calling the built-in `reset()` prop.
  - **CLARIFICATION (locks a REQUIREMENTS.md ambiguity):** REQUIREMENTS.md A11Y-03 says "bouton Reset via Server Actions" — this is not applicable: App Router error boundaries are Client Components and use the framework-provided `reset()` function, NOT a Server Action. Phase 6 uses `reset()`. Do NOT attempt to wire a Server Action here. (`error.tsx` cannot read `params`, so locale comes from `useLocale()` / `useTranslations()`.)
  - Auto-selected: **[auto] D-08 → recommended (client error boundary, built-in reset() prop — NOT Server Action)**

- **D-09:** **`app/[locale]/loading.tsx`** — lightweight skeleton: centered brand spinner or a minimal palette-accent pulse (`animate-pulse`, which is CSS-only and respects nothing — so gate behind a reduced-motion-safe approach: prefer a static brand mark + `motion-safe:animate-pulse` Tailwind variant so reduced-motion users get a static state). Also recommend a project-route `app/[locale]/projects/[slug]/loading.tsx` since the dynamic MDX route is the slowest. Uses palette CSS vars only.
  - Auto-selected: **[auto] D-09 → recommended (loading.tsx at locale level + project route, motion-safe pulse)**

### Accessibility Audit (A11Y-04)

- **D-10:** **axe-core via `vitest-axe`** (new dev dep `vitest-axe` + `@types` if needed). Add `*.a11y.test.tsx` files (or extend existing tests) that render key surfaces in jsdom and assert `expect(await axe(container)).toHaveNoViolations()`:
  - The homepage section components (Hero, About, ProjectsSection, Skills, Contact)
  - The project detail page shell (with a mocked Project + mocked MDX, per the Phase 5 jsdom-MDX limitation — assert on the static chrome: metadata strip, gallery, prev/next)
  - The PaletteSwitcher (Sheet open state) + PaletteFab
  - not-found.tsx + error.tsx
  - **No E2E** (respects PROJECT.md OOS). jsdom can't verify focus *order* or live-region announcements — those go to a **manual keyboard pass** tracked in HUMAN-UAT.
  - Auto-selected: **[auto] D-10 → recommended (vitest-axe automated + manual keyboard pass as HUMAN-UAT)**

- **D-11:** **Keyboard-nav + focus-trap verification.** The PaletteSwitcher (shadcn Sheet, Radix) already provides focus trap + Esc-to-close (Phase 2 THEME-10). Phase 6 ADDS: an automated assertion that interactive elements have accessible names (aria-label on icon-only buttons — PaletteFab, social links, copy buttons, language switcher) via axe, plus a documented manual Tab-cycle pass (HUMAN-UAT). Verify a global visible focus ring exists (`:focus-visible` outline using `--ring` = `var(--color-accent)`, Phase 1 D-13) — add it to `globals.css` if missing.
  - Auto-selected: **[auto] D-11 → recommended (axe accessible-name checks + focus-visible ring audit + manual Tab pass)**

### Reduced Motion & Images (A11Y-05, A11Y-06)

- **D-12:** **A11Y-05 is an audit + regression gate, not new implementation.** Reduced-motion gates already exist across 15+ files (Hero, About, Skills, ProjectCard, CustomCursor, LenisProvider, template.tsx, useParallax, PaletteFab, PalettePresets, Image). Phase 6: (1) verify each animation entry point gates correctly (documented checklist), (2) add a static-analysis test or grep gate (`scripts/check-reduced-motion.ts`?) asserting no GSAP `useGSAP`/`gsap.timeline` or `motion` animate without a corresponding `usePrefersReducedMotion`/`gsap.matchMedia`/`useReducedMotion` in the same file. Fill any gap found (e.g., confirm Konami confetti gates — it does, Phase 2).
  - Auto-selected: **[auto] D-12 → recommended (audit + grep/static regression gate, fill gaps)**

- **D-13:** **A11Y-06 is an audit + gate.** All 6 `next/image` usages (About, ProjectCard, ProjectCover, mdx/Image) already use explicit dimensions or `fill`. Phase 6: (1) verify each has `width`+`height` OR `fill`, and `priority` only on above-the-fold (Hero has no image; ProjectCover cover = priority; About/ProjectCard/gallery = lazy), (2) confirm `next.config.ts` image formats default to WebP/AVIF (Next 16 default — verify, add `formats: ['image/avif','image/webp']` if needed), (3) add a grep gate that every `<Image` has dimensions-or-fill. No bare `<img>` allowed.
  - Auto-selected: **[auto] D-13 → recommended (image audit + formats confirm + grep gate)**

### Palette Stress Test (A11Y-07)

- **D-14:** **Vitest deterministic stress test** (`scripts/stress-test-palettes.ts` runnable + a `lib/colors.stress.test.ts` in-suite). Seeded RNG (fixed seed for reproducibility) generates 10 random source colors → run `generateHarmonic` across the 4 modes → for each resulting palette assert: (a) `validateFullMatrix` returns `valid: true` (after the built-in `adjustForAA`), (b) all 6 tokens parse as valid OKLCh via culori (no NaN/undefined), (c) text contrast ≥ 4.5 and UI contrast ≥ 3.0 hold. The 4 presets are asserted too (already pre-validated Phase 2, regression guard). The **visual "no layout breakage"** dimension (random palette doesn't overflow/clip UI) is a **manual browser spot-check** (HUMAN-UAT) — jsdom can't measure layout.
  - Auto-selected: **[auto] D-14 → recommended (seeded Vitest stress test + manual visual spot-check)**

### Lighthouse (A11Y-08)

- **D-15:** **Local Lighthouse against a production build.** Add a `lighthouse` (or `@lhci/cli`) dev dep + an npm script (`"lighthouse": "lighthouse http://localhost:3000 --preset=desktop --only-categories=... "` — actually mobile per REQ). Process: `npm run build && npm run start`, then run Lighthouse mobile on `/` (and optionally a project page), record the four scores (Performance/Accessibility/Best-Practices/SEO) in the SUMMARY/HUMAN-UAT, fix anything < 90 (likely image sizing, font preload, metadata). **The authoritative ≥ 90 confirmation happens on the deployed Vercel URL in Phase 7** (A11Y-08 says "déployée Vercel") — Phase 6 is the local pre-deploy gate. Treated as a **manual/scripted gate** (needs a running server) tracked in HUMAN-UAT, with automated proxies (axe for a11y, bundle/build output for perf) covering what's automatable.
  - Auto-selected: **[auto] D-15 → recommended (local Lighthouse vs prod build as pre-deploy gate; final on Vercel Phase 7)**

### Plan Structure & Wave Topology

- **D-16:** **5 plans across 3 waves:**
  - **Wave 0** (dep install — small bottleneck): `06-00-install-audit-deps-PLAN.md` — add `vitest-axe` (+ types) and `lighthouse`/`@lhci/cli` as dev deps; add the `lighthouse` npm script; confirm `next.config.ts` image formats. Verify `npm test` + `npm run build` still green.
  - **Wave 1** (parallel — disjoint files):
    - `06-01-metadata-seo-PLAN.md` — root + project `generateMetadata` expansion + `metadataBase` + dynamic OG images (`opengraph-image.tsx` × 2) + `sitemap.ts` + `robots.ts` + `lib/constants.ts` SITE_URL (A11Y-01, A11Y-02).
    - `06-02-route-states-PLAN.md` — `not-found.tsx` (EGG-02), `error.tsx`, `loading.tsx` (locale + project route) + i18n wiring/additions (A11Y-03, EGG-02).
    - `06-03-palette-stress-test-PLAN.md` — seeded stress test (A11Y-07).
  - **Wave 2** (audit — depends on Wave 0 deps + Wave 1 pages existing):
    - `06-04-a11y-audit-PLAN.md` — `vitest-axe` a11y tests on all surfaces + focus-visible ring + reduced-motion regression gate + image audit gate (A11Y-04, A11Y-05, A11Y-06).
    - `06-05-lighthouse-PLAN.md` — local Lighthouse run vs prod build, record scores, fix < 90 regressions (A11Y-08).
  - **Why:** Wave 0 unblocks the audit tooling. Wave 1's three plans touch disjoint trees (app metadata files / app route-state files / lib test) → parallel-safe. Wave 2 audits the full surface so it must run after pages exist.
  - Auto-selected: **[auto] D-16 → recommended (5 plans / 3 waves)**

### Claude's Discretion

Deferred to researcher/planner (enough signal to choose well):
- Exact OG card visual layout (font sizes, accent placement, whether to show a palette-swatch strip). Recommendation: name + role + a thin Terra accent bar; project card adds title + category badge + year.
- Whether to bundle Inter or use a system font in the OG `ImageResponse` (Satori needs explicit font data). Recommendation: bundle one Inter weight via `fs.readFileSync` per the Next 16 OG example.
- Exact `lighthouse` vs `@lhci/cli` choice + whether to script it in `package.json` or document manual steps. Recommendation: `lighthouse` CLI + a documented npm script; LHCI is overkill for one-shot.
- Whether the reduced-motion regression gate is a `tsx` script or a Vitest test. Recommendation: a `scripts/check-reduced-motion.ts` grep-style script (matches the `check-mdx-structure.ts` / `check-i18n-parity.ts` precedent).
- 404 visual richness — static playful illustration vs animated palette swatches. Recommendation: keep it lightweight (typographic + one motion entrance); don't over-build.
- Whether to add JSON-LD structured data. Recommendation: skip in v1 unless trivial (not required by A11Y-01).
- `loading.tsx` skeleton fidelity — generic spinner vs section-shaped skeleton. Recommendation: generic centered brand spinner (cheap, good enough; section skeletons are over-engineering for a fast static site).
- Exact `errors.404.subtitle` / extra copy keys — planner writes if the 404 needs more than the existing title/message/back.

### Folded Todos

None — `gsd-tools todo match-phase 6` returned `todo_count: 0`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, constraints (Lighthouse 90+, WCAG AA via ThemeProvider auto-adjust, mobile-first, OKLCh-only, no `any`, Server Components default), Out of Scope (no E2E, no analytics until deploy)
- `.planning/REQUIREMENTS.md` §"SEO, A11y, Robustness" (A11Y-01..08) + §"Easter Eggs & Personality" (EGG-02) + §"Out of Scope" (E2E exhaustive tests excluded → axe via vitest, not Playwright)
- `.planning/ROADMAP.md` §"Phase 6: SEO, Accessibility & Polish" — goal + 5 success criteria + depends on Phase 4 + Phase 5
- `.planning/STATE.md` — Phase 5 complete; 276/276 tests; reduced-motion gates confirmed everywhere by Phase 5 verifier

### Prior phase context
- `.planning/phases/01-foundations/01-CONTEXT.md` — i18n routing `localePrefix: 'as-needed'` (D-14..D-17 — drives hreflang/sitemap structure), shadcn `--ring` = `var(--color-accent)` focus ring (D-13), `errors` i18n namespace established (ARCH-07), `_*` MDX filter (D-24 — sitemap must skip templates)
- `.planning/phases/02-palette-system/02-CONTEXT.md` — `validateFullMatrix` 7-pair contract + `generateHarmonic` 4 modes + `adjustForAA` (drives A11Y-07 stress test), ThemeProvider WCAG auto-adjust (drives A11Y-04 contrast), PaletteSwitcher Sheet focus-trap + Esc (THEME-10, drives A11Y-04 keyboard), `usePrefersReducedMotion` (drives A11Y-05)
- `.planning/phases/03-layout-animation-foundation/03-CONTEXT.md` — CustomCursor 4-gate (incl. reduced-motion + forced-colors, A11Y-05), template.tsx page transitions (A11Y-05), ConsoleArt (EGG-01 — sibling easter egg to EGG-02), Footer/Nav aria-labels (A11Y-04)
- `.planning/phases/04-homepage-sections/04-CONTEXT.md` — next/image usages (About/ProjectCard, A11Y-06), 3 fixed `--color-category-*` tokens, reduced-motion `whileHover` gates
- `.planning/phases/05-project-content-pipeline/05-CONTEXT.md` — project page + `generateMetadata` (title-only, A11Y-01 expands it), `getProjectSlugs()` (drives sitemap), ProjectCover parallax + gallery next/image (A11Y-06), dynamic-import route (sitemap must list these 12 routes)

### Research synthesis (MANDATORY pre-read for downstream agents)
- `.planning/research/FEATURES.md` — §"prefers-reduced-motion handling" (table-stakes, A11Y-05), §"WCAG-aware palette as signature" (A11Y-07 stress test proves the signature is robust), §"CV/SEO complement" (metadata matters — recruiters find via search)
- `.planning/research/PITFALLS.md` — §"Pitfall 1: FOUC" (don't regress the palette restore during metadata work), §"Pitfall 3: 7-pair WCAG matrix" (A11Y-07 reuses CRITICAL_PAIRS), §"Pitfall 4/5: Lenis + reduced-motion" (A11Y-05 audit must confirm Lenis disables under reduced-motion)
- `.planning/research/STACK.md` — `next/og` is built into Next 16 (no @vercel/og dep needed), `next/image` formats, `@vercel/analytics`/`speed-insights` are Phase 7 not Phase 6, sharp auto-bundled

### External docs (downstream researcher fetches via context7)
- **Next.js 16 Metadata API** — `generateMetadata`, `metadataBase`, `openGraph`, `alternates.languages` (hreflang), `twitter`; file-based `opengraph-image.tsx` convention
- **Next.js 16 `next/og` `ImageResponse`** — dynamic OG generation, font loading via `fs`/`fetch`, Satori CSS subset limitations, `size` + `contentType` exports, edge vs node runtime under Turbopack
- **Next.js 16 `sitemap.ts` + `robots.ts`** — `MetadataRoute.Sitemap` / `MetadataRoute.Robots` types, `alternates.languages` in sitemap entries
- **Next.js 16 `loading.tsx` / `error.tsx` / `not-found.tsx`** — error boundary `{ error, reset }` props (client-only), `not-found.tsx` + `notFound()` interaction, App Router conventions
- **next-intl v4** — locale-aware pathname generation for hreflang under `localePrefix: 'as-needed'` (`getPathname`, `routing`), how `/` (FR) vs `/en` resolve; metadata in localized layouts
- **vitest-axe** — `axe(container)` + `toHaveNoViolations()` matcher setup, jsdom limitations (no layout/contrast computation — contrast is covered by validateFullMatrix instead), config
- **Lighthouse CLI** — mobile preset, `--only-categories`, running against a local `next start` server, score interpretation
- **WCAG 2.1** — focus-visible (2.4.7), accessible name (4.1.2), reflow (1.4.10), reduced-motion (2.3.3)

### Existing code (downstream MUST read)
- `app/[locale]/layout.tsx` — current `generateMetadata` (title + hero.tagline description; Phase 6 expands). `<html lang>` + `suppressHydrationWarning` + PaletteFouCScript (don't regress).
- `app/[locale]/projects/[slug]/page.tsx` — current minimal `generateMetadata` (title only; Phase 6 expands) + `getProjectBySlug`/`getProjectSlugs` (sitemap source)
- `app/[locale]/page.tsx` — homepage sections (axe targets)
- `i18n/routing.ts` — `localePrefix: 'as-needed'`, `defaultLocale: 'fr'`, `locales: ['fr','en']` (hreflang/sitemap structure)
- `i18n/navigation.ts` — locale-aware `Link`/`getPathname` (hreflang + 404 back-link)
- `lib/projects.ts` — `getProjectSlugs()` (sitemap), `_*` filter (skip templates)
- `lib/colors.ts` — `generateHarmonic`, `validateFullMatrix`, `adjustForAA`, `CRITICAL_PAIRS`, `oklchToHex` (A11Y-07 stress test + OG hex colors)
- `lib/palettes.ts` — Terra default tokens (OG image brand colors via `oklchToHex`)
- `lib/hooks/usePrefersReducedMotion.ts` — A11Y-05 audit anchor
- `app/globals.css` — `--ring` focus token, 400ms transition, shadcn aliasing (focus-visible audit)
- `messages/fr.json` + `messages/en.json` — `errors.404` + `errors.500` namespaces ALREADY EXIST (wire them; add subtitle/loading keys with parity)
- `scripts/check-i18n-parity.ts` + `scripts/check-mdx-structure.ts` — precedents for the new `check-reduced-motion.ts` / image-audit grep gates
- `next.config.ts` — confirm/add `images.formats` (A11Y-06); MDX wiring (don't regress)
- `components/theme/PaletteSwitcher.tsx` + `PaletteFab.tsx` — axe + keyboard targets (A11Y-04)
- `package.json` — Vitest infra (vitest-axe plugs in); NO @vercel/og needed (next/og built-in); add vitest-axe + lighthouse dev deps only

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`errors.404` + `errors.500` i18n keys** — already drafted in both locales (Phase 1). EGG-02 404 + error.tsx 500 copy is mostly written; Phase 6 wires them.
- **`lib/colors.ts`** — `generateHarmonic` + `validateFullMatrix` + `adjustForAA` + `oklchToHex` power both the A11Y-07 stress test and the OG image brand colors.
- **`getProjectSlugs()`** (lib/projects.ts) — single source for sitemap project routes; already skips `_*` templates.
- **`usePrefersReducedMotion` + `gsap.matchMedia`** — the reduced-motion contract is already implemented in 15+ files; A11Y-05 audits it.
- **shadcn Sheet (PaletteSwitcher)** — Radix focus-trap + Esc already satisfy most of A11Y-04 keyboard; axe verifies.
- **`--ring` = `var(--color-accent)`** (Phase 1 D-13) — focus-visible ring token already exists; A11Y-04 confirms it renders.
- **Vitest + jsdom + RTL** — `vitest-axe` plugs into the existing suite; no new framework.
- **`next/og`** — built into Next 16; dynamic OG needs no new dependency.
- **`scripts/check-*.ts` precedent** — `check-i18n-parity.ts` + `check-mdx-structure.ts` model the new reduced-motion + image grep gates.

### Established Patterns
- **OKLCh-only colors** — OG images are the one place hex appears (Satori needs hex/rgb); derive via `oklchToHex(Terra.token)` so it stays sourced from the palette, not hand-typed.
- **Server Components default** — sitemap.ts/robots.ts/opengraph-image.tsx are server/edge; not-found.tsx server shell + client motion island; error.tsx is the ONLY mandatory `'use client'`.
- **`scripts/check-*.ts` gates run in CI** — new gates follow the same exit-0 contract.
- **i18n parity gate** — any new keys (errors.404.subtitle, loading label) must pass `check-i18n-parity.ts`.
- **next-intl localized metadata** — `generateMetadata` uses `getTranslations({ locale, namespace })` (already the pattern in layout.tsx).

### Integration Points
- **`app/[locale]/layout.tsx`** — expand `generateMetadata` (metadataBase + OG + twitter + hreflang). Add a global `:focus-visible` ring if missing.
- **`app/[locale]/projects/[slug]/page.tsx`** — expand `generateMetadata` (OG + hreflang per project).
- **NEW files:** `app/sitemap.ts`, `app/robots.ts`, `app/[locale]/opengraph-image.tsx`, `app/[locale]/projects/[slug]/opengraph-image.tsx`, `app/[locale]/not-found.tsx`, `app/[locale]/error.tsx`, `app/[locale]/loading.tsx` (+ optional project `loading.tsx`).
- **`lib/constants.ts`** — add `SITE_URL` (metadataBase source).
- **`messages/{fr,en}.json`** — wire errors.404/500; add subtitle/loading keys (parity-gated).
- **`next.config.ts`** — confirm `images.formats`.
- **NEW scripts/tests:** `vitest-axe` a11y test files, `scripts/check-reduced-motion.ts`, image-audit gate, palette stress test.
- **`package.json`** — `vitest-axe` + `lighthouse` dev deps + `lighthouse` script.

</code_context>

<specifics>
## Specific Ideas

- **Plan sequence (D-16):**
  1. `06-00-install-audit-deps-PLAN.md` (W0, ~10 min) — `vitest-axe` (+types) + `lighthouse` dev deps; `lighthouse` npm script; confirm `images.formats` in next.config.ts; suite + build still green.
  2. `06-01-metadata-seo-PLAN.md` (W1 ∥, ~45 min) — metadataBase + full OG/twitter/hreflang on root + project `generateMetadata`; dynamic `opengraph-image.tsx` × 2 via next/og (Terra hex via oklchToHex, bundled Inter); `sitemap.ts` + `robots.ts`; `lib/constants.ts` SITE_URL. (A11Y-01, A11Y-02)
  3. `06-02-route-states-PLAN.md` (W1 ∥, ~40 min) — `not-found.tsx` EGG-02 (reuse errors.404, motion entry gated, Link back), `error.tsx` (client, reset() prop, errors.500), `loading.tsx` (locale + project route). i18n parity. (A11Y-03, EGG-02)
  4. `06-03-palette-stress-test-PLAN.md` (W1 ∥, ~20 min) — seeded 10-random-palette Vitest test asserting validateFullMatrix + OKLCh validity. (A11Y-07)
  5. `06-04-a11y-audit-PLAN.md` (W2, ~50 min) — vitest-axe tests on all surfaces; focus-visible ring; `check-reduced-motion.ts` gate; image-audit gate. (A11Y-04, A11Y-05, A11Y-06)
  6. `06-05-lighthouse-PLAN.md` (W2, ~25 min) — `next build && next start` + lighthouse mobile on `/`, record 4 scores, fix < 90. (A11Y-08)
  Total ~3.5h. W1's three plans touch disjoint trees (app metadata files / app route-state files / lib test) → parallel-safe.

- **hreflang under as-needed (the #1 research must-confirm):** FR is canonical at `/`, EN at `/en`. Per Phase 1 STATE: `/fr` redirects to `/`; `/en` explicit. So `alternates.languages` should point fr→`/`, en→`/en`, x-default→`/`. The researcher confirms whether to use next-intl's `getPathname({ href, locale })` to build these (preferred — survives routing changes) vs hand-built strings. Same for project routes.

- **Dynamic OG `ImageResponse` skeleton (next/og, Next 16):**
  ```tsx
  // app/[locale]/opengraph-image.tsx
  import { ImageResponse } from 'next/og';
  export const size = { width: 1200, height: 630 };
  export const contentType = 'image/png';
  export default async function OG() {
    // Terra brand colors via oklchToHex(PALETTES[0].tokens.*) — static snapshot, not theme-reactive
    // bundled Inter weight via fs.readFileSync(...) for Satori
    return new ImageResponse(<div style={{ /* flex, bg, accent bar, name, role */ }}>…</div>, { ...size, fonts: [...] });
  }
  ```
  Researcher confirms font-loading + runtime (likely `nodejs` runtime, NOT edge, since we read the font from disk) under Next 16 + Turbopack.

- **error.tsx canonical pattern (NOT Server Action):**
  ```tsx
  'use client';
  import { useTranslations } from 'next-intl';
  export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const t = useTranslations('errors.500');
    return (<div role="alert">…<button onClick={() => reset()}>{t('reset')}</button></div>);
  }
  ```

- **not-found.tsx (EGG-02) reuses existing copy:** `errors.404` = { title: "Page introuvable", message: "Il semble que vous vous soyez perdu dans le pixel art.", back: "Retour à l'accueil" }. Motion entry (`<motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}}>`) in a client island; `useReducedMotion()` → opacity-only. shadcn Button asChild → `<Link href="/">`.

- **Palette stress test shape:**
  ```ts
  // seeded RNG → 10 source colors → generateHarmonic(mode, src) for each mode
  // for each palette: expect(validateFullMatrix(p).valid).toBe(true)
  //                   expect(every token parses via culori parse()).toBeTruthy()
  // also re-assert the 4 presets (regression guard)
  ```
  Visual "no layout break" = manual HUMAN-UAT (apply a few random palettes in-browser, confirm no overflow/clipping).

- **vitest-axe usage:**
  ```tsx
  import { axe } from 'vitest-axe';
  import 'vitest-axe/extend-expect'; // or expect.extend(matchers)
  it('Hero has no a11y violations', async () => {
    const { container } = render(<Hero />);
    expect(await axe(container)).toHaveNoViolations();
  });
  ```
  Note: jsdom can't compute color contrast — that dimension is covered by `validateFullMatrix` (the ThemeProvider guarantees AA), so disable axe's `color-contrast` rule and rely on the palette system for contrast.

- **Lighthouse is environment-sensitive** — record scores as evidence, treat ≥90 as a pre-deploy gate. The DEFINITIVE A11Y-08 pass is on the deployed Vercel URL (Phase 7). Don't block the phase on a flaky local 89.

- **Reduced-motion gate script** (`scripts/check-reduced-motion.ts`) — grep every file importing `gsap`/`motion` animate APIs and assert a sibling `usePrefersReducedMotion`/`gsap.matchMedia`/`useReducedMotion`/`motion-safe:` reference. Exit 1 on a gap. Mirrors `check-i18n-parity.ts` exit-0 contract.

- **No new dependencies beyond `vitest-axe` + `lighthouse`.** `next/og` is built-in. No `@vercel/og`, no Playwright (E2E is OOS).

</specifics>

<deferred>
## Deferred Ideas

- **Live Lighthouse ≥90 on the deployed Vercel URL** — Phase 7 (`A11Y-08` final confirmation; Phase 6 is the local pre-deploy gate).
- **`@vercel/analytics` + `@vercel/speed-insights`** — Phase 7 (`DEPLOY-03`).
- **Real production domain for metadataBase** — Phase 7 (user confirms `tanguy.dev` or chosen domain; Phase 6 uses a placeholder env var).
- **JSON-LD structured data (Schema.org Person / CreativeWork)** — v2 nice-to-have; not required by A11Y-01.
- **Per-project bespoke OG photography** — dynamic cards use frontmatter + brand colors; real cover art is a pre-deploy swap.
- **Cookie-consent / GDPR banner** — no third-party trackers in v1 (analytics added Phase 7 are first-party Vercel); revisit only if a tracker with consent obligations is added.
- **Playwright / real-browser E2E + axe-in-browser** — explicitly OOS (PROJECT.md). axe runs in jsdom via vitest-axe; focus-order + live-regions are manual HUMAN-UAT.
- **Automated visual-regression of random palettes** — A11Y-07 visual "no layout break" is a manual spot-check in v1; screenshot diffing is v2.
- **`manifest.ts` / PWA / theme-color meta** — not in REQ; v2 (theme-color is dynamic per palette, awkward for a static meta tag).
- **404 with a mini palette-playground or game** — keep the 404 lightweight in v1; richer easter-egg 404 is v2.
- **Skip-to-content link** — strong a11y nicety; recommend the planner add it cheaply in the a11y plan if low-cost, else v2.
- **axe-core CI integration as a separate GitHub Action** — Phase 7 CI concern; Phase 6 runs vitest-axe in the normal `npm test`.

### Reviewed Todos (not folded)
None — `gsd-tools todo match-phase 6` returned `todo_count: 0`.

</deferred>

---

*Phase: 06-seo-accessibility-polish*
*Context gathered: 2026-05-28 (auto mode — Claude picked recommended defaults; user review encouraged before plan-phase)*
