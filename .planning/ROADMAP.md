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
- [x] **Phase 3: Layout & Animation Foundation** - Root layout, LenisProvider with single-RAF GSAP integration, page transitions, Navigation, Footer, LanguageSwitcher, CustomCursor, console ASCII art (completed 2026-05-27)
- [x] **Phase 4: Homepage Sections** - Hero with SplitText, About, filterable Projects grid, Skills, and Contact with CV PDF downloads (completed 2026-05-27)
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
- [x] 02-04-sheet-presets-badge-PLAN.md — Wave 3 (parallel): shadcn Sheet install + Pitfall E mitigation + WCAGBadge + PalettePresets [THEME-06, THEME-09]
- [x] 02-05-custom-harmonic-switcher-PLAN.md — Wave 3 (parallel): CustomColorPicker + HarmonicGenerator + PaletteSwitcher shell [THEME-07, THEME-08, THEME-10]
- [x] 02-06-fab-konami-integration-PLAN.md — Wave 4: PaletteFab + canvas-confetti dynamic-import + Konami auto-open Sheet [THEME-11, THEME-12]
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
**Plans**: 6 plans (4 waves)
- [x] 03-00-install-deps-PLAN.md — Wave 0: install gsap@^3.13 + @gsap/react@^2.1.2 + lenis@^1.3 [LAYOUT-02 dep gate]
- [x] 03-01-lenis-provider-PLAN.md — Wave 1: components/providers/LenisProvider.tsx (single-RAF + gsap.ticker bridge + data-lenis-prevent + ScrollTrigger.refresh on palette swap + reduced-motion skip + mobile input pause) + Vitest spec [LAYOUT-02]
- [x] 03-02-root-layout-font-PLAN.md — Wave 1 (sequential w/ 01 — same layout.tsx): next/font/google Inter wiring + Tailwind @theme inline --font-sans + D-11 provider tree + generateMetadata + 4 stub component files + 5 section placeholders in [locale]/page.tsx [LAYOUT-01]
- [x] 03-03-navigation-lang-switcher-PLAN.md — Wave 2 (parallel): Navigation.tsx + LanguageSwitcher.tsx + lib/hooks/useActiveSection.ts + i18n/navigation.ts + nav.lang.* i18n keys + tests [LAYOUT-03, LAYOUT-05]
- [x] 03-04-footer-PLAN.md — Wave 2 (parallel): Footer.tsx (compact-row, lucide social icons, server-rendered year, mailto, FR/EN parity check) + test [LAYOUT-04]
- [ ] 03-05-cursor-transitions-ascii-PLAN.md — Wave 3: CustomCursor.tsx (4-gate constrained tracer, no cursor:none) + app/template.tsx (motion AnimatePresence popLayout) + ConsoleArt.tsx + lib/ascii.ts + tests [LAYOUT-06, ANIM-01, EGG-01]
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
**Plans**: 6 plans (3 waves)
- [x] 04-00-assets-and-stubs-PLAN.md — Wave 0: git-mv CV PDF + placeholder photo + 6 stub MDX projects (12 files) + 6 placeholder covers + lib/constants.ts + shadcn badge install with 3 category-* CVA variants + 3 fixed --color-category-* tokens in globals.css + new i18n keys (about.paragraphs, skills.groups.*.items, hero.scrollCue) + i18n FR/EN parity gate script + page.tsx wired (server-loads getProjects + composes 5 sections) + 8 TDD test harnesses [HOME-01..07 dep gate]
- [x] 04-01-hero-PLAN.md — Wave 1 (parallel): components/sections/Hero.tsx + Hero.test.tsx — useGSAP scope, SplitText char stagger (name + role + tagline + CTA + cue cascade), CTA scroll via useLenis with scrollIntoView fallback, ChevronDown bouncing scroll cue, gsap.matchMedia reduced-motion gate, ScrollTrigger.refresh in onSplit (Pitfall 4-D), i18n dependencies (Pitfall 4-A) [HOME-01]
- [x] 04-02-about-PLAN.md — Wave 1 (parallel): components/sections/About.tsx + About.test.tsx — 2-col desktop / stacked mobile, next/image 400x500 lazy+blur, 2 paragraphs from about.paragraphs.{1,2}, useGSAP ScrollTrigger (start='top 75%', toggleActions='play none none reverse'), photo slide-from-x:-40 + bio paragraph stagger y:30, gsap.matchMedia reduced-motion gate [HOME-02]
- [x] 04-03-projects-PLAN.md — Wave 2: components/sections/CategoryFilter.tsx + ProjectCard.tsx + ProjectGrid.tsx + ProjectsSection.tsx (+ 4 test files) — motion layoutId='filter-indicator' filter + shadcn Card + dual-overlay badges + locale-aware Link from @/i18n/navigation + motion whileHover with reducedMotion===true gate + AnimatePresence mode='popLayout' + outer motion.div layout + empty state + useState/useMemo lifted state [HOME-03, HOME-04, HOME-05]
- [x] 04-04-skills-PLAN.md — Wave 1 (parallel): components/sections/Skills.tsx + Skills.test.tsx — 3 group sub-headings from skills.groups.*.label + flex-wrap shadcn Badge with category-{tech,design,bim} variants + useGSAP ScrollTrigger timeline with intra-group stagger 0.05s + group cascade 0.15s + gsap.matchMedia reduced-motion gate + t.raw for array reads [HOME-06]
- [x] 04-05-contact-PLAN.md — Wave 1 (parallel): components/sections/Contact.tsx + Contact.test.tsx — email button + navigator.clipboard.writeText silent try/catch + motion AnimatePresence Copy<->Check icon swap + 1.5s revert + 3 social links (Code2/Briefcase/Mail) + 2 CV download buttons (Button asChild + a href download FR primary / EN outline) [HOME-07]
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
**Plans**: 4 plans (3 waves)
- [x] 05-00-content-and-assets-PLAN.md — Wave 0: gallery? type extension + 12 MDX case-study bodies + 24 placeholder images + projects.detail.* i18n + check-mdx-structure.ts gate [CONTENT-01]
- [x] 05-01-mdx-components-PLAN.md — Wave 1 (parallel): Image (Dialog zoom) + CodeBlock (pre override + copy) + Callout (3 variants) + mdx-components.tsx wiring [CONTENT-03]
- [x] 05-02-parallax-hook-PLAN.md — Wave 1 (parallel): lib/hooks/useParallax.ts (matchMedia dual-branch, no re-register) [ANIM-02]
- [x] 05-03-project-page-PLAN.md — Wave 2: app/[locale]/projects/[slug]/page.tsx (relative dynamic import + generateStaticParams + notFound + cover parallax + metadata strip + gallery + prev/next) + ProjectCover island [CONTENT-02, ANIM-02]
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
| 3. Layout & Animation Foundation | 0/6 | Complete    | 2026-05-27 |
| 4. Homepage Sections | 0/6 | Complete    | 2026-05-27 |
| 5. Project Content Pipeline | 0/4 | Not started | - |
| 6. SEO, Accessibility & Polish | 0/TBD | Not started | - |
| 7. Deployment | 0/TBD | Not started | - |
