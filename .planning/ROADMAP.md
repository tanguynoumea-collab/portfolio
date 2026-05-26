# Roadmap: tanguy-portfolio

## Overview

Build a bilingual (FR/EN) creative portfolio whose signature is a runtime palette switcher with WCAG enforcement. The journey is strictly dependency-driven: scaffold the foundation (Next 16 + Tailwind v4 + i18n + CSS variable tokens), ship the palette system (presets + custom picker + harmonic generator + Konami easter egg) so all visual design can be validated against multiple palettes early, then layer in the layout chrome with the Lenis+GSAP single-RAF animation infrastructure, build the homepage sections, fill the MDX project pipeline, polish for Lighthouse 90+ and WCAG AA, and ship to Vercel.

The roadmap collapses what the research SUMMARY proposed as 8 phases into **7 phases** by merging "Animation Infrastructure" (Lenis + GSAP single-RAF + page transitions) with "Layout Chrome" — both land in `app/[locale]/layout.tsx` together, the LenisProvider is mounted alongside Navigation/Footer, and the single-RAF setup is a single focused plan within the broader layout shell. This stays inside the standard granularity window (5-8 phases) and keeps the chosen phase boundaries genuinely independent (no thin 3-req phase).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundations** - Scaffold Next 16, Tailwind v4 with OKLCh CSS variables, shadcn aliased to palette tokens, next-intl `/fr` `/en` routing, MDX loader scaffold (completed 2026-05-26)
- [ ] **Phase 2: Palette System** - Live runtime palette switcher with presets, custom picker, harmonic generator, WCAG matrix validation, FOUC-safe persistence, and Konami easter egg
- [ ] **Phase 3: Layout & Animation Foundation** - Root layout, LenisProvider with single-RAF GSAP integration, page transitions, Navigation, Footer, LanguageSwitcher, CustomCursor, console ASCII art
- [ ] **Phase 4: Homepage Sections** - Hero with SplitText, About, filterable Projects grid, Skills, Contact with CV PDF downloads
- [ ] **Phase 5: Project Content Pipeline** - 12 MDX files (6 projects x 2 locales), discriminated Project type, project detail pages with galleries and parallax
- [ ] **Phase 6: SEO, Accessibility & Polish** - Metadata, sitemap, robots, loading/error states, a11y audit, reduced-motion, palette stress test, Lighthouse 90+, custom 404
- [ ] **Phase 7: Deployment** - Git + GitHub repo, Vercel auto-deploy, Analytics + Speed Insights

## Phase Details

### Phase 1: Foundations
**Goal**: Deliver a runnable Next 16 + Tailwind v4 + next-intl skeleton where every later phase can read `var(--color-*)` and run inside a localized `/fr` or `/en` route without conflicts.
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, ARCH-07, ARCH-08, ARCH-09
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts a Next 16 app with `/` redirecting to `/fr` or `/en` based on browser locale, and both localized roots render
  2. `npm run lint` passes with zero warnings against the flat ESLint config + Prettier
  3. `app/globals.css` declares the six `--color-*` OKLCh variables in `:root`, exposes them through `@theme {}`, and applies the global 400ms transition on `color, background-color, border-color`
  4. The seven shadcn components (button, card, dialog, slider, switch, popover, tabs) render using the palette CSS variables (no hardcoded shadcn colors leak through)
  5. `lib/projects.ts` exports the discriminated `Project = TechProject | DesignProject | BIMProject` union and a `getProjects(locale)` loader compiles a stub MDX file end-to-end
**Plans**: 5 plans
- [x] 01-01-scaffold-PLAN.md — Scaffold Next 16 + tooling + folder structure [ARCH-01, ARCH-02, ARCH-09]
- [x] 01-02-css-variables-PLAN.md — CSS variables foundation + Tailwind v4 @theme wiring [ARCH-03, ARCH-04]
- [x] 01-03-shadcn-aliasing-PLAN.md — shadcn init + 7 components + exhaustive token aliasing [ARCH-05]
- [x] 01-04-i18n-PLAN.md — next-intl bilingual routing + proxy.ts + messages skeleton [ARCH-06, ARCH-07]
- [x] 01-05-mdx-loader-PLAN.md — MDX loader + discriminated Project union + palettes lib + stubs [ARCH-08]
**UI hint**: no

### Phase 2: Palette System
**Goal**: Ship the signature feature — a user can change the entire site palette live, see WCAG compliance in real time, and unlock a secret Vaporwave palette via Konami code, all without a flash on reload.
**Depends on**: Phase 1
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, THEME-06, THEME-07, THEME-08, THEME-09, THEME-10, THEME-11, THEME-12
**Success Criteria** (what must be TRUE):
  1. User can switch between the four visible presets (terra, nordic, bauhaus, ocean) from a FAB-triggered side panel and the entire site updates instantly
  2. User can author a custom palette via 3 HSL inputs OR generate one harmonically from a source color and one of four modes (complementary, triadic, analogous, split-complementary), with all 7 WCAG pairs auto-adjusted to AA
  3. The WCAGBadge always displays the live ratio (numeric, 2 decimals) and status (AA / AAA / Fail with colored icon) for the active palette
  4. The chosen palette persists across reloads with zero FOUC on cold load (no flash from default to stored palette during first paint)
  5. Entering the Konami sequence (when no input is focused) unlocks the Vaporwave palette with a confetti animation
**Plans**: 7 plans (4 waves)
- [x] 02-00-test-infra-PLAN.md — Wave 0: Vitest + RTL + jsdom + tsx install + scripts/validate-palettes.ts gate + Vaporwave WCAG pre-validation [THEME-01]
- [x] 02-01-lib-colors-PLAN.md — Wave 1 (parallel): lib/colors.ts pure helpers (wcagContrast, adjustForAA, validateFullMatrix, generateHarmonic, deriveDefaultTokens, applyMatrixAdjust) [THEME-02, THEME-03]
- [x] 02-02-lib-storage-hooks-PLAN.md — Wave 1 (parallel): lib/storage.ts + lib/hooks/useKonamiCode.ts + lib/hooks/usePrefersReducedMotion.ts [THEME-12]
- [x] 02-03-theme-provider-fouc-PLAN.md — Wave 2: ThemeProvider + PaletteFouCScript + layout wiring + i18n updates (Vaporwave label, Adjusted-for-AA chip) [THEME-04, THEME-05]
- [ ] 02-04-sheet-presets-badge-PLAN.md — Wave 3 (parallel): shadcn Sheet install + Pitfall E mitigation + WCAGBadge + PalettePresets [THEME-06, THEME-09]
- [ ] 02-05-custom-harmonic-switcher-PLAN.md — Wave 3 (parallel): CustomColorPicker + HarmonicGenerator + PaletteSwitcher shell [THEME-07, THEME-08, THEME-10]
- [ ] 02-06-fab-konami-integration-PLAN.md — Wave 4: PaletteFab + canvas-confetti dynamic-import + Konami auto-open Sheet [THEME-11, THEME-12]
**UI hint**: yes

### Phase 3: Layout & Animation Foundation
**Goal**: Build the persistent UI shell (nav, footer, language switcher, custom cursor, console art) on top of a Lenis + GSAP single-RAF animation infrastructure with motion-powered page transitions, so every later section is animated correctly with no scroll desync.
**Depends on**: Phase 2 (visual chrome validates against all palettes)
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05, LAYOUT-06, ANIM-01, EGG-01
**Success Criteria** (what must be TRUE):
  1. Every page in `/fr/*` and `/en/*` is wrapped by the root layout with ThemeProvider, LenisProvider, IntlProvider, and a custom font, with smooth scroll active and ScrollTrigger position staying in sync with Lenis on layout changes
  2. The fixed Navigation, Footer with social links, and LanguageSwitcher (native FR/EN labels, imperative `<html lang>` update) render on every route and switch language without losing scroll context
  3. CustomCursor follows the pointer in motion and tracks the current accent color on desktop only, automatically hiding on touch devices and when `prefers-reduced-motion` is set
  4. Navigating between routes shows a motion `AnimatePresence mode="popLayout"` transition under 350ms with no layout flash
  5. Opening the browser console on cold load prints the bilingual ASCII art with the subtle Konami hint
**Plans**: TBD
**UI hint**: yes

### Phase 4: Homepage Sections
**Goal**: Deliver the full homepage experience — Hero, About, filterable Projects grid, Skills, and Contact (with CV PDF downloads) — all animated, bilingual, and color-coded per domain (Tech / Design / BIM).
**Depends on**: Phase 3
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07
**Success Criteria** (what must be TRUE):
  1. The Hero reveals the name + role bilingual text via GSAP SplitText char stagger on mount, visible above the fold without layout shift
  2. The Projects grid filters live between All / Tech / Design / BIM using motion `AnimatePresence mode="popLayout"` with a fluid layout shift and an empty state when no project matches
  3. ProjectCards show domain-coded badges and a hover micro-interaction (scale + image reveal + accent color animation), linking to `/{locale}/projects/{slug}`
  4. The About and Skills sections reveal at scroll via ScrollTrigger with respect for `prefers-reduced-motion`
  5. The Contact section copies email to clipboard with motion feedback and offers two download buttons for `/cv-fr.pdf` and `/cv-en.pdf`
**Plans**: TBD
**UI hint**: yes

### Phase 5: Project Content Pipeline
**Goal**: Deliver the project case-study system — 12 localized MDX files, the discriminated `Project` type pipeline, and detail pages rendered with `compileMDX`, galleries, custom MDX components, and parallax on images.
**Depends on**: Phase 3 (uses root layout + LenisProvider); can run in parallel with Phase 4
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, ANIM-02
**Success Criteria** (what must be TRUE):
  1. Six projects (2 Tech, 2 Design, 2 BIM) each have an `.fr.mdx` and `.en.mdx` file in `content/projects/`, all with valid discriminated frontmatter
  2. `/{locale}/projects/{slug}` pages are statically generated (one per `locale x slug` pair) and render the MDX content, the frontmatter metadata block (domain-specific fields shown correctly per category), and an image gallery
  3. Custom MDX components (`Image` with zoom modal, `CodeBlock` with rehype-pretty-code highlighting, `Callout` with info/warning/note variants) are usable from any MDX file
  4. Project images receive a subtle parallax effect (factor ~0.3) via GSAP ScrollTrigger that is disabled under `prefers-reduced-motion`
**Plans**: TBD
**UI hint**: yes

### Phase 6: SEO, Accessibility & Polish
**Goal**: Pass the audit gate — generate full metadata + sitemap + robots, ship loading/error/not-found states, hit WCAG AA with axe-core showing zero errors, stress-test the palette switcher with random palettes, and reach Lighthouse 90+ on all four axes.
**Depends on**: Phase 4, Phase 5
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, A11Y-08, EGG-02
**Success Criteria** (what must be TRUE):
  1. Every public route exposes correct metadata (title, description, OG image, hreflang FR/EN), the sitemap covers `/`, `/fr`, `/en`, and all project pages, and robots authorize crawl except `/api/*`
  2. A 404 page (`app/[locale]/not-found.tsx`) renders bilingual humor with a motion entry animation and a styled link back to `/{locale}`, alongside per-route `loading.tsx` and `error.tsx` (with a Reset action)
  3. Axe-core reports zero violations, the entire site is fully keyboard-navigable with visible focus, the PaletteSwitcher honors a focus trap + Esc-to-close, and `prefers-reduced-motion` is respected on every animation (GSAP, motion, CustomCursor, Lenis)
  4. The palette switcher survives a stress test of 10 randomly generated palettes plus the 4 presets without layout breakage or WCAG regression
  5. Lighthouse mobile homepage scores >= 90 on Performance, Accessibility, Best Practices, and SEO
**Plans**: TBD
**UI hint**: yes

### Phase 7: Deployment
**Goal**: Push the site to production on Vercel from a public GitHub repo with auto-deploy on `main`, plus Vercel Analytics and Speed Insights tracking Web Vitals live.
**Depends on**: Phase 6
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. The repo `tanguynoumea/portfolio` exists on GitHub with a baseline README, and `main` carries the production-ready code
  2. Vercel auto-deploys every `main` push and the production URL is publicly reachable
  3. Vercel Analytics and Speed Insights collect Web Vitals from real traffic with no leaks of sensitive `NEXT_PUBLIC_*` env vars
**Plans**: TBD
**UI hint**: no

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundations | 5/5 | Complete    | 2026-05-26 |
| 2. Palette System | 0/7 | Not started | - |
| 3. Layout & Animation Foundation | 0/TBD | Not started | - |
| 4. Homepage Sections | 0/TBD | Not started | - |
| 5. Project Content Pipeline | 0/TBD | Not started | - |
| 6. SEO, Accessibility & Polish | 0/TBD | Not started | - |
| 7. Deployment | 0/TBD | Not started | - |
