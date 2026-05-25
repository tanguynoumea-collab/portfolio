# Project Research Summary

**Project:** tanguy-portfolio
**Domain:** Bilingual creative personal portfolio (hybrid Tech × Design × BIM profile) with runtime palette/theme customization
**Researched:** 2026-05-25
**Confidence:** HIGH

## Executive Summary

The `tanguy-portfolio` is a statically-generated bilingual (FR/EN) portfolio with three infrastructure systems that must coexist cleanly: (1) a **runtime CSS-variable palette switcher** with WCAG enforcement as the signature feature, (2) a **triple animation stack** (GSAP + Lenis + Framer Motion/`motion`) for scroll-driven, micro-interaction, and transition layers, and (3) a **bilingual i18n pipeline** with localized MDX content for 6-10 projects. Each system has specific integration requirements that produce hard-to-debug bugs if ignored.

The recommended build order is strictly dependency-driven: **CSS variables foundation → i18n routing → FOUC prevention + ThemeProvider → palette logic → Lenis+GSAP infrastructure → layout chrome → sections → MDX content → SEO/a11y → deploy**. The signature feature (live harmonic palette generator with WCAG validation) is a genuine differentiator in 2026 but must be framed as "design system playground" not "theme toggle" — the WCAG ratio badge must be prominent in the UI to make the educational value visible.

Top risks: **FOUC on palette restore** (requires blocking `<script>` injection in `<head>`, NOT localStorage read in `useEffect`), **Lenis + ScrollTrigger desync** (requires single `gsap.ticker` RAF loop, not two competing rAF), and **horizontal scroll pin** (mobile-broken + conflicts with `AnimatePresence` filter → cut from v1).

## Key Corrections vs PROJECT.md

⚠️ These are critical version/package updates discovered by Stack research. **Must apply to PROJECT.md before roadmap finalization.**

| PROJECT.md says | Reality (May 2026) | Why it matters |
|-----------------|-------------------|----------------|
| `Next.js 15` | **Next.js 16.2.6** (stable since Oct 2025) | `middleware.ts` → `proxy.ts`; `cookies()`/`headers()`/`params` are async (must `await`); `next lint` removed; Turbopack is default |
| `framer-motion` | Package is now **`motion`** | Install `motion`, import from `motion/react`. Old package is legacy-only. |
| `@studio-freight/lenis` | Package is now **`lenis`** (Darkroom Engineering rebrand) | React wrapper at `lenis/react` (same package). Old `@studio-freight/*` packages unmaintained. |
| `contentlayer` (if considered) | **Abandoned** since 2024 | Use `@next/mdx` + `gray-matter` + `next-mdx-remote/rsc`'s `compileMDX` |
| Tailwind v3 mental model | **Tailwind v4** (`@theme {}` in CSS, no `tailwind.config.ts`) | Architecturally **better** for palette feature — runtime CSS variables are v4's native model, not a workaround |
| GSAP Club plugins need license | **GSAP 100% free** since April 2025 | SplitText, ScrollTrigger, ScrollSmoother all in public `gsap` package |
| `tailwindcss-animate` | Deprecated for v4, replaced by `tw-animate-css` | shadcn auto-installs this; do nothing manually |
| Manual `sharp` install | **Auto-bundled in Next 16** | Skip manual `sharp` install |

## Key Findings

### Recommended Stack

The stack the user pre-selected is essentially correct in intent but needs version/package corrections (see table above). The most architecturally significant change is **Tailwind v4** — its `@theme` directive makes design tokens native CSS custom properties by default, which is exactly the architecture needed for the palette switcher feature. The user accidentally chose a stack that's been made even better-suited to their goal.

**Core technologies:**
- **Next.js 16** (App Router) + React 19.2 + TypeScript 5.6 — moderne, SSG-friendly, Vercel-native
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) — native CSS variables in `@theme {}`, no config file
- **shadcn/ui** (`shadcn@latest`, auto-detects Tailwind v4) — 7 components needed: button, card, dialog, slider, switch, popover, tabs
- **`motion` v12** (formerly `framer-motion`) — page transitions, AnimatePresence for filter, micro-interactions
- **`gsap` v3.13** + `@gsap/react@2.1.2` — `useGSAP` hook for cleanup, SplitText for Hero, ScrollTrigger for scroll reveals
- **`lenis` v1.3** + `lenis/react` — smooth scroll, integrated with GSAP via single `gsap.ticker` RAF
- **`next-intl` v4.12** — bilingual routing via `routing.ts` + `request.ts` + `proxy.ts`
- **`@next/mdx`** + `gray-matter` + `next-mdx-remote/rsc`'s `compileMDX` + `remark-gfm` + `rehype-pretty-code` — MDX content pipeline
- **`culori` v4** — OKLCh color manipulation, WCAG contrast (used internally by Tailwind v4)
- **`next/font/google`** (built-in) — typography
- **`@vercel/analytics` + `@vercel/speed-insights`** — telemetry

**Install order (critical):**
1. `npx create-next-app@latest --yes` → Next 16 + React 19 + Tailwind v4 + ESLint flat + Turbopack + App Router + TS
2. Verify Tailwind v4 works (`npm run dev`) BEFORE `shadcn init`
3. `npx shadcn@latest init` → modifies `globals.css`, sets up `tw-animate-css`
4. `npm i gsap @gsap/react lenis motion` — animation stack as one command
5. `npm i next-intl` then create `proxy.ts` (NOT `middleware.ts`)
6. `npm i @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter remark-gfm rehype-pretty-code` — MDX stack
7. `npm i culori @vercel/analytics @vercel/speed-insights` last

📖 **Full detail:** `.planning/research/STACK.md`

### Expected Features

The user's planned feature set is well-aligned with 2026 expectations. The palette switcher with WCAG validation is **genuinely differentiated** (most portfolios still ship a dark/light toggle). The hybrid Tech×Design×BIM profile requires **domain-specific metadata** per project (Tech: stack, Design: tools, BIM: software like Revit/ArchiCAD + project scale).

**Must have (table stakes — 2026 baseline):**
- Bilingual FR/EN switcher with locale-prefixed URLs
- Project case studies (not just thumbnails) with detail pages
- Mobile-responsive (mobile-first design)
- Lighthouse 90+ on all 4 axes
- Working keyboard navigation + visible focus
- `prefers-reduced-motion` respected
- Real metadata (`generateMetadata`, OG images, sitemap, robots)
- Contact method (mailto + GitHub + LinkedIn)
- 404 page with brand voice

**Should have (differentiators — what makes this portfolio memorable):**
- ⭐ **Palette switcher with live WCAG badge** (signature)
- ⭐ **Harmonic generator with 4 modes** (educational, novel)
- ⭐ **Domain filter** (Tech/Design/BIM) — uniquely surfaces hybrid profile
- Smooth scroll (Lenis) + scroll-driven reveals (GSAP)
- Custom cursor desktop (with accent color)
- Easter eggs (Konami code, ASCII console art)
- Page transitions (motion `AnimatePresence`)
- CV PDF download link (FR + EN) — **flagged as MISSING from user's active requirements**

**Defer (v2+):**
- Blog / writing section
- Real CMS (MDX in repo is correct for 6-10 projects)
- OAuth / accounts / comments
- 3D model viewers for BIM projects (assets dependency — defer to v1.x feature)
- Mobile app
- Backend / API
- Comprehensive automated test suite

**Anti-features (deliberately NOT build):**
- ❌ Cursor takeover that breaks pointer expectations
- ❌ Autoplay sound or unmute prompts
- ❌ Heavy scroll-jacking that breaks navigation gestures
- ❌ Loader > 1s on warm cache
- ❌ Dark/light toggle separate from palette system (the palette system replaces it)
- ❌ Horizontal scroll pin on mobile (breaks gesture, conflicts with AnimatePresence)

📖 **Full detail:** `.planning/research/FEATURES.md`

### Architecture Approach

The architecture must solve four hard problems: **FOUC prevention** (palette must render correctly on first paint, before hydration), **Lenis + GSAP coexistence** (both want their own rAF loop — must merge into one via `gsap.ticker`), **Server/Client component split** (keep Server Components ≥75% for perf; ThemeProvider, LenisProvider, animated components must be Client), and **localized MDX** (one `.mdx` file per project per locale, with `generateStaticParams` returning the `locale × slug` cartesian product).

**Major components:**
1. **CSS variable foundation** (`app/globals.css` with `@theme {}`) — declares all `--color-*` tokens, **MUST be in place before any component uses them**
2. **ThemeProvider** (`components/theme/ThemeProvider.tsx`, client) — Context + setter functions + `<script>` injected pre-hydration in `<head>` to read localStorage and apply CSS vars before first paint (this avoids FOUC, the #1 architectural risk)
3. **LenisProvider** (`components/providers/LenisProvider.tsx`, client) — Lenis instance with `autoRaf: false`, registered to `gsap.ticker` so GSAP + Lenis share one rAF; calls `ScrollTrigger.refresh()` on layout changes
4. **next-intl pipeline** — `routing.ts` (locales config) + `request.ts` (load messages) + `proxy.ts` (replaces `middleware.ts` in Next 16) + `app/[locale]/layout.tsx` (locale-aware root)
5. **MDX pipeline** — `content/projects/{slug}.{fr|en}.mdx` + `lib/projects.ts` (typed loader with discriminated `Project` union: `TechProject | DesignProject | BIMProject`) + `mdx-components.tsx` (Image zoom, CodeBlock, Callout) + `app/[locale]/projects/[slug]/page.tsx` (uses `compileMDX`)
6. **Palette logic** (`lib/colors.ts`) — `wcagContrast()`, `adjustForAA()`, `generateHarmonic(mode, source)` (~30 LOC via OKLCh hue rotation since `culori` ships no built-in harmonic helper)
7. **PaletteSwitcher UI** — atomic split: `PaletteSwitcher` (panel) + `PalettePresets` (4 mini buttons) + `CustomColorPicker` (3 HSL inputs) + `HarmonicGenerator` (source picker + mode tabs + Generate) + `WCAGBadge` (live ratio + AA/AAA) + FAB trigger
8. **Page transitions** — `app/template.tsx` wraps each page with `motion` `<AnimatePresence mode="popLayout">` (popLayout > wait for filter transitions)

📖 **Full detail:** `.planning/research/ARCHITECTURE.md` — patterns 1-5 are critical (FOUC, Lenis+GSAP, MDX, theme provider, build order)

### Critical Pitfalls

Top 5 issues this stack creates, with the prevention recipe for each:

1. **FOUC on palette restore (CRITICAL)** — Reading localStorage in `useEffect` causes a flash of unstyled colors on first render. **Fix:** Inject a blocking `<script>` in `<head>` (via `next/script` with `strategy="beforeInteractive"`) that reads localStorage and sets CSS variables on `:root` synchronously. Don't trust client-side hydration.

2. **Tailwind config color not resolving runtime `var()` (CRITICAL)** — In v4 with `@theme {}`, every token MUST be declared as `--color-name: oklch(...)` (or via reference to another var). Hardcoded hex in the `@theme` block won't be mutable. **Fix:** Author the entire `@theme` block as references to `--color-*` variables defined in a `:root {}` block earlier in `globals.css`.

3. **Lenis + ScrollTrigger position desync (HIGH)** — Two rAF loops cause scroll position drift. ScrollTrigger thinks it's at scroll Y=100, Lenis is actually at Y=104. **Fix:** Pattern from ARCHITECTURE.md §5 — `lenis.options.autoRaf = false`, then `gsap.ticker.add((t) => lenis.raf(t * 1000))`. One RAF, in sync.

4. **WCAG check incomplete (HIGH)** — Checking only `text ↔ bg` lets `accent ↔ bg` (e.g., yellow accent on white bg) silently fail at 2.3:1 ratio. **Fix:** Validate the full 7-pair matrix in `lib/colors.ts` — `text/bg`, `text/surface`, `textMuted/bg`, `textMuted/surface`, `accent/bg`, `accent/surface`, `secondary/bg`. Block "Apply" button if any pair < 4.5:1, OR auto-adjust luminosity via `adjustForAA()`.

5. **shadcn defaults hardcode some colors (HIGH)** — Default shadcn `Button`, `Card`, `Dialog` reference fixed Tailwind tokens like `bg-primary` that point to specific OKLCh values. When palette switches, those references DON'T update. **Fix:** After `shadcn init`, replace `--primary`, `--background`, `--foreground`, `--accent`, `--muted`, `--secondary` in `globals.css` with `var(--color-*)` references to the project's palette tokens. One-time aliasing pass.

📖 **Full detail:** `.planning/research/PITFALLS.md` — 14 pitfalls total with phase mapping and severity

## Implications for Roadmap

Based on dependency analysis from STACK + ARCHITECTURE + PITFALLS, the recommended phase structure is **8 phases**.

### Phase 1: Foundations
**Rationale:** Everything else depends on the CSS variable system + i18n routing + FOUC-safe theme bootstrapping. This must land first, serially, and be verified to work before any UI is built.
**Delivers:** Next 16 scaffolded + Tailwind v4 wired with `@theme` referencing CSS variables + shadcn init + 7 components added + next-intl `proxy.ts` + locale routing + bilingual message files structure + MDX loader scaffold + `ThemeProvider` with pre-hydration `<script>` for FOUC prevention + shadcn token aliasing pass
**Addresses:** Architecture foundations, infrastructure for every later phase
**Avoids:** FOUC (Pitfall #1), hardcoded color disconnect (Pitfall #2), shadcn palette disconnect (Pitfall #5), i18n redirect loop, locale drift

### Phase 2: Palette System (Signature Feature)
**Rationale:** The differentiator. Build it before any section that depends on accent colors, so visual design can be validated against multiple palettes early.
**Delivers:** `lib/palettes.ts` (5 palettes typed) + `lib/colors.ts` (culori-based: `wcagContrast`, `adjustForAA`, `generateHarmonic` with 4 modes) + full PaletteSwitcher UI (8 components: Provider, Switcher panel, Presets, CustomPicker, HarmonicGenerator, WCAGBadge, FAB, Konami hook with input filtering) + persistence + Vaporwave easter egg + WCAG full-matrix validation
**Uses:** culori, motion, shadcn (Slider, Tabs, Popover)
**Implements:** Architecture components 2, 6, 7
**Avoids:** WCAG check incomplete (Pitfall #4), Konami breaking form input

### Phase 3: Animation Infrastructure
**Rationale:** Must precede any animated section. Lenis + GSAP integration is non-obvious — get it right once, in one place.
**Delivers:** `LenisProvider` with `autoRaf: false` + `gsap.ticker` integration + `useGSAP` as project convention with examples + `app/template.tsx` page transitions via motion `AnimatePresence mode="popLayout"` + `ScrollTrigger.refresh()` wiring after layout changes + reduced-motion gate utility
**Uses:** lenis, gsap, @gsap/react, motion
**Implements:** Architecture components 3, 8
**Avoids:** Lenis + ScrollTrigger desync (Pitfall #3), GSAP cleanup leaks under React Strict Mode

### Phase 4: Layout Chrome
**Rationale:** Once palette + animation are stable, build the persistent UI shell (navbar, footer, language switcher, cursor, console art).
**Delivers:** Navigation (fixed, with section links + language switcher) + Footer (bilingual, social links) + `LanguageSwitcher` (native labels, no flags, `aria-label`, imperative `<html lang>` update) + `CustomCursor` (desktop only, accent-coded, hides on touch/reduced-motion) + Console ASCII art (bilingual, with Konami hint)
**Uses:** motion, next-intl
**Implements:** Architecture component 4

### Phase 5: Homepage Sections
**Rationale:** With chrome + theme + animations ready, build content sections. Each section is independent and can be parallelized in plan-phase.
**Delivers:** Hero (GSAP SplitText + stagger, role visible above fold) + About (photo + bilingual bio, scroll reveal) + `CategoryFilter` (All/Tech/Design/BIM) + `ProjectCard` (hover micro-interaction) + Projects grid with motion `AnimatePresence mode="popLayout"` for filter transitions + Skills (badges with domain color-coding, GSAP stagger) + Contact (mailto + GitHub + LinkedIn + copy-to-clipboard + **CV PDF FR + EN download** — currently missing from PROJECT.md)
**Uses:** gsap (SplitText, ScrollTrigger), motion (AnimatePresence)
**Avoids:** Horizontal scroll pin on mobile (cut from v1), AnimatePresence + filter conflicts, reduced-motion violations

### Phase 6: MDX Pipeline + Project Content
**Rationale:** Can run in parallel with Phase 5 (independent surface). Builds the project case study system that homepage Projects section links to.
**Delivers:** Discriminated union `Project` type (`TechProject | DesignProject | BIMProject` with domain-specific metadata: TechProject has `stack`, DesignProject has `tools`, BIMProject has `software` + `projectScale`) + `lib/projects.ts` loader + `mdx-components.tsx` (Image zoom, CodeBlock with rehype-pretty-code, Callout) + 6 seed MDX files × 2 locales = 12 files (2 Tech, 2 Design, 2 BIM) + `app/[locale]/projects/[slug]/page.tsx` with `compileMDX` + galleries + `generateStaticParams(locale × slug)`
**Uses:** @next/mdx, gray-matter, next-mdx-remote/rsc, remark-gfm, rehype-pretty-code
**Implements:** Architecture component 5
**Avoids:** Hydration mismatches from MDX, missing translations breaking layout

### Phase 7: SEO + Accessibility + Polish
**Rationale:** Final pass to hit Lighthouse 90+ and WCAG AA across the full site.
**Delivers:** `generateMetadata` per page (title, description, OG image, hreflang) + `sitemap.ts` + `robots.ts` + per-locale 404 + per-route `loading.tsx` + `error.tsx` + `next/image` everywhere with WebP/AVIF + axe-core run with 0 errors + keyboard-only tab through the entire site + reduced-motion OS test + palette stress test on 10 random palettes
**Avoids:** Inaccessible custom cursor, focus trap leaks on PaletteSwitcher, palette switcher breaking when generated palette is extreme

### Phase 8: Deployment
**Rationale:** Ship it.
**Delivers:** `.gitignore` + initial commit + GitHub repo `tanguynoumea/portfolio` + Vercel project connected + auto-deploy on `main` push + Vercel Analytics + Speed Insights + env var audit (no leaks) + custom domain (if configured)

### Phase Ordering Rationale

- **Phase 1 is serial and blocking** — every later phase reads `var(--color-*)` and runs in a localized route
- **Phase 2 before Phases 4-5** because all visual design decisions must be validated against multiple palettes early (avoid "looks great on terra, breaks on vaporwave")
- **Phase 3 before Phases 4-5** because every animated component depends on `LenisProvider` being mounted and `useGSAP` being the convention
- **Phase 6 can parallelize with Phase 5** (independent surface)
- **Phase 7 is the audit pass** — only meaningful once content + chrome exist
- **Phase 8 is post-everything**

### Research Flags

Phases likely needing deeper research during planning (`research_before_planning: true`):

- **Phase 2 (Palette System):** Custom WCAG full-matrix algorithm + OKLCh harmonic generation aren't covered by any library — research current best practices, edge cases (light text on light accent), and confirm OKLCh hue rotation gives perceptually balanced results
- **Phase 3 (Animation Infrastructure):** Lenis + GSAP single-RAF pattern is non-obvious. Verify exact recipe against current Lenis v1.3 docs (API may have changed since ARCHITECTURE.md Pattern 5 was written)
- **Phase 6 (MDX Pipeline):** Locale-suffix `.fr.mdx` / `.en.mdx` strategy + `generateStaticParams(locale × slug)` + `compileMDX` need pattern validation against next-mdx-remote v5 docs

Phases with standard patterns (skip research-phase):

- **Phase 1:** Official Next 16 + next-intl + Tailwind v4 + shadcn docs are complete and current
- **Phase 4:** Layout chrome is standard App Router work
- **Phase 5:** Sections are application of patterns from Phase 3 — no new infrastructure
- **Phase 7:** Lighthouse + axe-core + Next.js metadata are well-documented
- **Phase 8:** Vercel is zero-config for Next.js

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official May 2026 docs (Next 16, React 19.2, Tailwind v4, etc.) |
| Features | HIGH (table stakes) / MEDIUM (novelty assessment) | Table stakes are universal; differentiation claims based on portfolio review samples |
| Architecture | HIGH | Patterns verified against official Next 16, next-intl, GSAP, Lenis, Tailwind v4 docs |
| Pitfalls | HIGH | Each has official source citation + reproduction conditions |

**Overall confidence:** HIGH

### Gaps to Address

- **Vaporwave palette WCAG compliance** — neon pink on light lavender will likely fail AA. Design with `adjustForAA()` from start, OR pre-validate the 5 preset palettes in `lib/palettes.ts` and store the AA-adjusted text colors there
- **Per-locale MDX authorship strategy** — decide before Phase 6 whether the user authors 6 projects × 2 locales = 12 files manually, or uses an i18n field in single frontmatter. Recommend separate files for translator/editor workflow
- **next-intl v4.12 + Next 16 `proxy.ts` rename** — verify the rename actually applies to the next-intl setup file (research suggests yes, but confirm during Phase 1 planning)
- **BIM 3D asset availability** — 3D model viewers for BIM projects were deferred to v1.x. Confirm with user whether they have the BIM source files to support this later
- **CV PDF FR + EN download link** — flagged as missing from PROJECT.md active requirements. Add during requirements definition
- **Custom font choice** — `next/font/google` (e.g., Inter, Geist) vs `next/font/local` (custom). Deferred to Phase 4 design decision

## Sources

### Primary (HIGH confidence)
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — version pin, breaking changes
- [Next.js v15→v16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — `middleware.ts` → `proxy.ts`, async APIs
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) — `@theme {}` CSS-first, OKLCh native
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — current setup, `tw-animate-css` replacement
- [Webflow makes GSAP 100% free](https://webflow.com/updates/gsap-becomes-free) + [GSAP pricing](https://gsap.com/pricing/) — licensing
- [@gsap/react docs](https://gsap.com/resources/React/) — `useGSAP` API + Strict Mode safety
- [Motion upgrade guide](https://motion.dev/docs/react-upgrade-guide) — `framer-motion` → `motion` rename
- [Lenis (Darkroom Engineering) repo](https://github.com/darkroomengineering/lenis) — package rename + React wrapper
- [next-intl App Router setup](https://next-intl.dev/docs/getting-started/app-router) — `proxy.ts` integration
- [Next.js MDX guide](https://nextjs.org/docs/app/guides/mdx) — `@next/mdx` recommendation
- [Culori API](https://culorijs.org/api/) — `wcagContrast`, OKLCh helpers, no built-in harmonics

### Secondary (MEDIUM confidence)
- [Pro Color Harmonies (OKLCh formulas)](https://github.com/meodai/pro-color-harmonies) — harmonic generation math
- [Contentlayer abandoned analysis](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — confirms unmaintained
- [shadcn vs Base UI vs Radix 2026 comparison](https://www.pkgpulse.com/guides/shadcn-ui-vs-base-ui-vs-radix-components-2026) — Radix remains default
- [PkgPulse culori vs chroma-js vs colorjs.io](https://www.pkgpulse.com/blog/culori-vs-chroma-js-vs-tinycolor2-color-manipulation-javascript-2026) — culori recommended for design systems
- [Lenis scroll prevention discussion #292](https://github.com/darkroomengineering/lenis/discussions/292) — modal interaction patterns
- [Understanding & Fixing FOUC in Next.js App Router](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk) — pre-hydration script pattern

### Tertiary (LOW confidence — verify during planning)
- [Better dynamic themes in Tailwind with OKLCH magic — Evil Martians](https://evilmartians.com/chronicles/better-dynamic-themes-in-tailwind-with-oklch-color-magic) — OKLCh blog post, single source
- [Best Color Palettes for Developer Portfolios (2025) — WebPortfolios.dev](https://www.webportfolios.dev/blog/best-color-palettes-for-developer-portfolio) — palette inspiration, opinion piece

---
*Research completed: 2026-05-25*
*Ready for roadmap: yes — apply Key Corrections to PROJECT.md first*
