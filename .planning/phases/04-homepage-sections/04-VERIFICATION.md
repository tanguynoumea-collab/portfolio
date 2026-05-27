---
phase: 4
slug: homepage-sections
verified: 2026-05-27T21:14:00Z
status: human_needed
score: 7/7 must-haves verified
requirements_covered: 7/7
must_haves_verified: 38/38
tests_green: true
critical_gates_passed: 15/15
test_count: 222/222
build_status: passed
lint_status: passed
i18n_parity: passed
human_verification:
  - test: "Hero SplitText char stagger reveals on cold load /fr and /en"
    expected: "Name 'Tanguy' reveals char-by-char, then role 'Tech × Design × BIM', then tagline + CTA. Total <1.2s. No layout shift (CLS=0)."
    why_human: "Real GSAP RAF + Inter font load + cold-cache hydration sequence — jsdom cannot validate visual timing"
  - test: "Hero CTA scrolls smoothly to #projects via Lenis"
    expected: "Click 'Découvrir mon travail' / 'See my work' — page glides ~1s with -64px nav offset to projects section"
    why_human: "Real Lenis instance + inertial scroll behavior cannot be measured headless"
  - test: "Hero ChevronDown scroll cue bounces under full motion"
    expected: "Chevron below CTA gently bounces (y:[0,8,0], 2s loop)"
    why_human: "Real motion animate loop"
  - test: "About scroll reveal triggers at top 75% with photo slide-from-left + paragraph stagger"
    expected: "Scroll until About section is 25% into viewport — photo slides from x=-40 (0.7s), paragraphs stagger up from y=30 (0.15s)"
    why_human: "Real scroll position + ScrollTrigger timing inside Lenis bridge"
  - test: "About reduced-motion: elements render at final state immediately"
    expected: "DevTools emulate prefers-reduced-motion → reload + scroll — no animation, photo + paragraphs visible immediately"
    why_human: "OS / DevTools emulation of media query"
  - test: "CategoryFilter motion layoutId indicator smoothly slides between buttons"
    expected: "Click All → Tech → Design → BIM. Active background morphs between buttons via spring transition"
    why_human: "Real motion shared-element animation"
  - test: "ProjectGrid filter transitions feel smooth (popLayout exit + enter)"
    expected: "Click filters repeatedly. Cards scale+fade out, remaining cards reflow smoothly, no flash, no jank"
    why_human: "Real popLayout exit/enter sequencing on 6 cards"
  - test: "ProjectCard hover triggers scale 1.02 + brightness + accent border + arrow translate"
    expected: "Hover each card — visible scale, image brightens, border becomes accent, ArrowUpRight slides up-right"
    why_human: "Real pointer events + motion whileHover spring physics"
  - test: "ProjectCard hover disabled under reduced-motion"
    expected: "Toggle reduced-motion, hover cards — no scale/translate"
    why_human: "matchMedia + motion useReducedMotion runtime gate"
  - test: "ProjectCard Link navigates to /fr/projects/{slug} (locale-prefixed)"
    expected: "Click any card — URL becomes /fr/projects/texture-manager (or /en/...). Phase 5 ships the detail page; Phase 4 just verifies the locale-aware href"
    why_human: "Real route navigation under next-intl middleware"
  - test: "Skills badges stagger entrance on scroll"
    expected: "Scroll to skills — Tech badges stagger up first (5/group), then Design, then BIM (cascade 0.15s)"
    why_human: "Real ScrollTrigger + GSAP timeline"
  - test: "Contact email button copies to clipboard with motion icon swap"
    expected: "Click email — clipboard contains 'tanguy@example.com'. Icon swaps Copy→Check + sr-only 'Address copied!' label for 1.5s, then reverts"
    why_human: "Real navigator.clipboard.writeText (HTTPS or localhost) — jsdom can mock but not validate real API"
  - test: "Contact CV download buttons trigger actual download"
    expected: "Click both CV buttons. Files save as CV_Tanguy_Delrieu_FR.pdf / CV_Tanguy_Delrieu_EN.pdf"
    why_human: "Real <a download> browser behavior"
  - test: "Contact social links open GitHub + LinkedIn in new tab"
    expected: "Click GitHub → opens https://github.com/tanguynoumea/portfolio in new tab. LinkedIn → opens placeholder URL"
    why_human: "Real anchor target=_blank handling"
  - test: "Cross-phase regression: project cards retain category colors across all 5 palettes"
    expected: "Open PaletteSwitcher, cycle terra/nordic/bauhaus/ocean/vaporwave — category badges (Tech/Design/BIM) keep their fixed colors (blue/magenta/amber), do NOT mutate with palette"
    why_human: "Real palette swap + visual confirmation of fixed-token isolation"
  - test: "Page transitions still work between routes (FR ↔ EN)"
    expected: "Toggle FR ↔ EN — observe fade+Y page transition still plays (Phase 3 ANIM-01 contract)"
    why_human: "Real motion AnimatePresence + Phase 3 template.tsx regression"
  - test: "Inter font loads + renders Hero text without FOIT/FOUC"
    expected: "Hard-load /fr — text appears immediately (system fallback) then crisp-swaps to Inter, no flash"
    why_human: "Real font-display:swap behavior"
---

# Phase 4: Homepage Sections Verification Report

**Phase Goal:** Deliver the full homepage experience — Hero, About, filterable Projects grid, Skills, and Contact (with CV PDF downloads) — all animated, bilingual, and color-coded per domain (Tech / Design / BIM).

**Verified:** 2026-05-27T21:14:00Z
**Status:** `human_needed` — all 38 automated must-haves verified; 17 items require human visual/runtime UAT.
**Re-verification:** No — initial verification.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| #   | Truth (ROADMAP success criterion)                                                                                                            | Status     | Evidence                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The Hero reveals the name + role bilingual text via GSAP SplitText char stagger on mount, visible above the fold without layout shift        | VERIFIED   | Hero.tsx lines 56-132: `useGSAP({ scope: heroRef, dependencies: [t('name'), t('role')] })` wraps `gsap.matchMedia` with SplitText char timeline (0.04s name, 0.025s role). 11/11 tests GREEN.       |
| 2   | The Projects grid filters live between All / Tech / Design / BIM using motion `AnimatePresence mode="popLayout"` with fluid layout shift + empty state | VERIFIED   | ProjectGrid.tsx line 59: `<AnimatePresence mode="popLayout" initial={false}>`. Outer `<motion.div layout>` line 55 (Pitfall 4-C). Empty state at line 40 with SearchX + i18n. 9/9 tests GREEN. |
| 3   | ProjectCards show domain-coded badges and a hover micro-interaction (scale + image reveal + accent color animation), linking to `/{locale}/projects/{slug}` | VERIFIED   | ProjectCard.tsx line 33: `import { Link } from '@/i18n/navigation'`. Line 78: motion.div whileHover scale 1.02 (Pitfall 4-I outer stack). Line 103: Badge variant `categoryVariant(category)`. 14/14 tests GREEN. |
| 4   | The About and Skills sections reveal at scroll via ScrollTrigger with respect for `prefers-reduced-motion`                                       | VERIFIED   | About.tsx line 58 (`scrollTrigger: { trigger, start: 'top 75%', toggleActions: 'play none none reverse' }`) + Skills.tsx line 64-69 (same). Both gated by `gsap.matchMedia({ isFull, isReduced })`. 13+8 = 21/21 tests GREEN. |
| 5   | The Contact section copies email to clipboard with motion feedback and offers two download buttons for `/cv-fr.pdf` and `/cv-en.pdf`              | VERIFIED   | Contact.tsx line 93: `navigator.clipboard.writeText(EMAIL)` in silent try/catch. Line 123 AnimatePresence mode="wait" Copy↔Check swap. Lines 199-218: 2x `<Button asChild>` wrapping `<a href download>`. 11/11 tests GREEN. |

**Score: 5/5 ROADMAP success criteria verified.**

### Required Artifacts (Wave-by-Wave)

| Artifact | Expected (Plan) | Status | Details |
| -------- | --------------- | ------ | ------- |
| `public/cv-fr.pdf` | FR CV PDF (D-01) | VERIFIED | Exists, 527,343 bytes. Moved from repo-root via Wave 0 Task 1. |
| `public/cv-en.pdf` | EN CV placeholder (D-01) | VERIFIED | Exists, 527,343 bytes (copy of FR until user supplies translation). |
| `public/about-photo.jpg` | 800x800 placeholder (D-02) | VERIFIED | Exists, 4,018 bytes (sharp-generated warm-beige solid). |
| `public/projects/{slug}/cover.jpg × 6` | Per-project covers (D-05) | VERIFIED | All 6 exist with non-zero size. |
| `content/projects/*.{fr,en}.mdx × 12` | 6 projects × 2 locales (D-04) | VERIFIED | 12 files, all pass `validateFrontmatter()` (categories: tech:2, design:2, bim:2). |
| `lib/constants.ts` | EMAIL + GITHUB_URL + LINKEDIN_URL (D-06) | VERIFIED | Lines 14-16: all 3 exports present. |
| `app/globals.css` | 3 fixed `--color-category-*` tokens (D-13) | VERIFIED | Lines 73-75 (`:root`), lines 143-145 (`@theme inline`). 6 total occurrences. |
| `components/ui/badge.tsx` | shadcn Badge + 3 CVA variants | VERIFIED | Lines 23-28: `category-tech`, `category-design`, `category-bim` variants. 6 mentions in file. |
| `messages/fr.json` + `messages/en.json` | New keys + FR/EN parity | VERIFIED | `npx tsx scripts/check-i18n-parity.ts` exits 0 (72 leaf paths). |
| `app/[locale]/page.tsx` | Async Server Component composing 5 sections | VERIFIED | Async function (line 39), 5 imports lines 31-35, no `'use client'` directive (only doc-comment mention). |
| `components/sections/Hero.tsx` | HOME-01 implementation | VERIFIED | 189 lines. SplitText timeline, scope ref, matchMedia, Lenis CTA + fallback, ChevronDown bounce. |
| `components/sections/About.tsx` | HOME-02 implementation | VERIFIED | 124 lines. ScrollTrigger reveal, 2-col grid, next/image lazy + blur, paragraph stagger. |
| `components/sections/CategoryFilter.tsx` | HOME-03 implementation | VERIFIED | 80 lines. 4 pill buttons, motion `layoutId="filter-indicator"`, lifted state. |
| `components/sections/ProjectCard.tsx` | HOME-04 implementation | VERIFIED | 142 lines. shadcn Card, locale-aware Link, hover stack, discriminated metadata. |
| `components/sections/ProjectGrid.tsx` | HOME-05 implementation | VERIFIED | 76 lines. popLayout + outer layout, empty state, SearchX icon. |
| `components/sections/ProjectsSection.tsx` | HOME-05 state lifter | VERIFIED | 62 lines. useMemo selector, lifted active state, default 'all'. |
| `components/sections/Skills.tsx` | HOME-06 implementation | VERIFIED | 122 lines. 3 groups flex-wrap, GSAP stagger cascade, t.raw arrays. |
| `components/sections/Contact.tsx` | HOME-07 implementation | VERIFIED | 223 lines. Clipboard button, 3 socials, 2 CV downloads with `<Button asChild>`. |
| 8 test harnesses (Hero/About/CategoryFilter/ProjectCard/ProjectGrid/ProjectsSection/Skills/Contact).test.tsx | RED → GREEN | VERIFIED | All 8 exist; total 85 net new Phase 4 tests; 222/222 suite passes. |
| `scripts/check-i18n-parity.ts` | Parity gate | VERIFIED | Script exists, exits 0 with 72 paths. |

### Key Link Verification (Wiring Gates)

| From                                    | To                                  | Via                                                        | Status | Details                                                                                                                |
| --------------------------------------- | ----------------------------------- | ---------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/page.tsx`                 | `lib/projects.ts` (`getProjects`)   | Server-side data load before rendering `<ProjectsSection>` | WIRED  | Line 30: `import { getProjects, type Locale }`. Line 41: `await getProjects(locale as Locale)` then prop-drilled.       |
| `app/globals.css :root`                 | `@theme inline` category tokens     | Tailwind v4 token aliasing (D-12 precedent)                | WIRED  | Lines 73-75 declare tokens; lines 143-145 expose to Tailwind utilities. 6 total mentions.                              |
| `components/ui/badge.tsx`               | `app/globals.css` fixed tokens      | CVA variant strings `bg-category-*`                        | WIRED  | Lines 23-28 reference `bg-category-tech` / `bg-category-design` / `bg-category-bim` utilities.                         |
| `messages/fr.json`                      | `messages/en.json`                  | FR/EN parity gate                                          | WIRED  | `npx tsx scripts/check-i18n-parity.ts` exits 0 — 72 leaf paths identical.                                              |
| `components/sections/Hero.tsx`          | `@gsap/react useGSAP`               | `useGSAP({ scope: heroRef, dependencies })`                | WIRED  | Line 56 + line 131. Pitfall 4-A mitigated via dependencies array on i18n strings.                                      |
| `components/sections/Hero.tsx`          | `useLenis` + `scrollIntoView`       | CTA null-check pattern                                     | WIRED  | Lines 134-142: `if (lenis) lenis.scrollTo(...)` else `target.scrollIntoView(...)`.                                     |
| `components/sections/Hero.tsx`          | `gsap.matchMedia` + `SplitText`     | Full vs reduced motion branches                            | WIRED  | Lines 58-129. Reduced path uses `gsap.set` (line 108). `SplitText.revert()` in cleanup (lines 124-127).                |
| `components/sections/About.tsx`         | ScrollTrigger via `gsap.timeline`   | `start: 'top 75%' toggleActions: 'play none none reverse'` | WIRED  | Lines 58-64: Exact config from D-12.                                                                                   |
| `components/sections/ProjectCard.tsx`   | `@/i18n/navigation Link`            | Locale-aware routing to `/projects/{slug}`                 | WIRED  | Line 33: import; line 83: usage. NO `next/navigation` Link present (grep returns 0).                                   |
| `components/sections/ProjectGrid.tsx`   | motion `AnimatePresence popLayout`  | Filter transitions w/o layout collapse                     | WIRED  | Line 59: `<AnimatePresence mode="popLayout" initial={false}>`. Outer `<motion.div layout>` line 55 (Pitfall 4-C).      |
| `components/sections/CategoryFilter.tsx` | motion `layoutId="filter-indicator"` | Shared-element segmented control morph                     | WIRED  | Line 61. Reuses Phase 3 D-18 LanguageSwitcher pattern with different layoutId.                                          |
| `components/sections/ProjectsSection.tsx` | `useState` + `useMemo` filter      | Lifted state + memoized selector                           | WIRED  | Line 38: state init; lines 40-46: useMemo on `[projects, active]`.                                                     |
| `components/sections/Skills.tsx`        | `useGSAP({ scope: skillsRef })`     | ScrollTrigger stagger cascade                              | WIRED  | Line 47 + line 88. Per-group `.from()` calls at `idx*0.15` positions (lines 71-83).                                    |
| `components/sections/Skills.tsx`        | `t.raw('groups.{key}.items')`       | next-intl array escape hatch (Pitfall 4-J)                 | WIRED  | Lines 43-44 with `Array.isArray` guard.                                                                                |
| `components/sections/Contact.tsx`       | `@/lib/constants` (EMAIL/URLs)      | Centralized swap point                                     | WIRED  | Line 64: imports all 3 constants. Used at lines 93, 163, 172, 181.                                                     |
| `components/sections/Contact.tsx`       | `navigator.clipboard.writeText`     | Silent try/catch (Phase 2 D-02 precedent)                  | WIRED  | Lines 91-99. Empty catch block, no console.* call.                                                                     |
| `components/sections/Contact.tsx`       | `<Button asChild><a href download>` | CV PDF forced-download (Wave 0 assets)                     | WIRED  | Lines 199-218. FR variant=default → `/cv-fr.pdf`. EN variant=outline → `/cv-en.pdf`. Both with `download="..."`.       |

**Score: 17/17 key links WIRED.**

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `ProjectsSection` | `projects` prop | `app/[locale]/page.tsx → getProjects(locale)` | YES — `lib/projects.ts` reads `content/projects/*.mdx`, returns 6 typed Project objects per locale | FLOWING |
| `ProjectGrid` | `projects` filtered subset | `useMemo` in `ProjectsSection` on `[projects, active]` | YES — receives the 6-item array, filters by category | FLOWING |
| `ProjectCard` | `project` prop | `ProjectGrid.map(p => <ProjectCard project={p} />)` | YES — each card receives a real `Project` discriminated union member | FLOWING |
| `Skills` (badges) | items array | `t.raw('groups.{key}.items')` reads `messages/{locale}.json` | YES — 7 items per group, 3 groups = 21 badges per locale | FLOWING |
| `Hero` (text) | name/role/tagline/cta/scrollCue | `useTranslations('hero')` reads `messages/{locale}.json` | YES — all 5 keys present and bilingual | FLOWING |
| `About` (paragraphs) | paragraphs.1, paragraphs.2 | `useTranslations('about')` | YES — 2 bilingual placeholder paragraphs present | FLOWING |
| `Contact` (email) | EMAIL constant | `@/lib/constants` | YES (placeholder) — `tanguy@example.com`. User swaps pre-deploy. | FLOWING |

**No HOLLOW/STATIC/DISCONNECTED artifacts found.**

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Full test suite green | `npm test` | 27 test files, 222 tests passed, 6.13s | PASS |
| Lint clean | `npm run lint` | (zero output = clean) | PASS |
| Build succeeds | `npm run build` | Next 16.2.6 Turbopack — Compiled in 2.3s, 6/6 static pages generated | PASS |
| i18n parity gate | `npx tsx scripts/check-i18n-parity.ts` | `FR/EN parity OK — 72 leaf paths.` | PASS |
| MDX loader sees 6 projects per locale | (validated during build prerender) | 6/6 generated static pages including `/fr`, `/en`, `/fr/projects/{slug}` would resolve once Phase 5 ships the route | PASS |
| `lib/constants.ts` exports 3 constants | grep `export const` | 3/3 — EMAIL, GITHUB_URL, LINKEDIN_URL | PASS |
| Category tokens defined twice (root + theme) | grep `color-category-*` in globals.css | 6 occurrences (3 tokens × 2 blocks) | PASS |
| Badge has 3 category variants | grep `category-` in badge.tsx | 6 occurrences | PASS |
| `useGSAP({ scope })` in all 3 GSAP sections | grep `scope:\s*(heroRef\|aboutRef\|skillsRef)` | 3 matches (Hero/About/Skills) | PASS |
| `mode="popLayout"` in ProjectGrid | grep | Found at line 59 (1 source ref) | PASS |
| `layoutId="filter-indicator"` in CategoryFilter | grep | Found at line 61 | PASS |
| No `next/navigation` Link in ProjectCard | grep | 0 matches | PASS |
| `@/i18n/navigation` Link in ProjectCard | grep | Found at line 33 | PASS |
| No `cursor: none` anywhere in components/ + app/ | grep | 0 matches (Phase 3 LAYOUT-06 gate persists) | PASS |
| Zero color literals in components/sections/*.tsx | Custom Node script with base64 exclusion | 0 actual color literals (only base64 dataURLs which are JPEG payloads, not CSS) | PASS |

**Score: 15/15 behavioral spot-checks PASS.**

## Requirement Coverage Audit

| REQ-ID | Source Plan(s) | Description | Status | Evidence |
| ------ | -------------- | ----------- | ------ | -------- |
| HOME-01 | 04-00 (dep gate), 04-01 (impl) | Hero with GSAP SplitText reveal (chars stagger), bilingual name + role, useGSAP scope+cleanup | SATISFIED | Hero.tsx implements full spec. 11/11 tests GREEN. `useGSAP({ scope, dependencies })` pattern verified. |
| HOME-02 | 04-00 (dep gate), 04-02 (impl) | About with photo + bio + ScrollTrigger reveal + reduced-motion respect | SATISFIED | About.tsx with 2-col grid, next/image lazy+blur, ScrollTrigger `top 75%`, `matchMedia` gate. 13/13 tests GREEN. |
| HOME-03 | 04-00 (dep gate), 04-03 (impl) | CategoryFilter with 4 buttons, lifted React state, filter prop | SATISFIED | CategoryFilter.tsx with 4 pills + motion layoutId. ProjectsSection lifts state. 12/12 + 10/10 tests GREEN. |
| HOME-04 | 04-00 (dep gate), 04-03 (impl) | ProjectCard with cover + title + year + category badge + hover motion + locale Link | SATISFIED | ProjectCard.tsx implements full hover stack, discriminated metadata, `@/i18n/navigation` Link. 14/14 tests GREEN. |
| HOME-05 | 04-00 (dep gate), 04-03 (impl) | Projects grid with motion AnimatePresence popLayout + empty state | SATISFIED | ProjectGrid.tsx with `mode="popLayout"` + outer layout + empty state (SearchX). 9/9 tests GREEN. |
| HOME-06 | 04-00 (dep gate), 04-04 (impl) | Skills with badges grouped by domain + GSAP stagger + color-coded category | SATISFIED | Skills.tsx with 3 groups × items, ScrollTrigger stagger cascade, fixed category Badge variants. 8/8 tests GREEN. |
| HOME-07 | 04-00 (dep gate), 04-05 (impl) | Contact with email copy-to-clipboard + GitHub + LinkedIn + 2 CV download buttons | SATISFIED | Contact.tsx with clipboard try/catch + AnimatePresence icon swap + 3 socials + 2 `<Button asChild>` downloads. 11/11 tests GREEN. |

**Coverage: 7/7 HOME-* requirements SATISFIED. Zero ORPHANED requirements (REQUIREMENTS.md maps exactly HOME-01..07 to Phase 4).**

## Critical Gates Audit

| #  | Gate | Verification Method | Result | Status |
| -- | ---- | ------------------- | ------ | ------ |
| 1  | NO color literals in `components/sections/*.tsx` | Custom Node grep w/ base64 exclusion | 0 actual color literals (the one regex hit `400x500` in About.test.tsx is a dimension, not a hex color) | PASS |
| 2  | 3 fixed category tokens in `:root` AND `@theme inline` | `grep -c "color-category-(tech\|design\|bim)" app/globals.css` | 6 occurrences (3 tokens × 2 blocks) | PASS |
| 3  | `useGSAP({ scope })` mandatory in Hero/About/Skills | `grep "scope: (heroRef\|aboutRef\|skillsRef)"` | 3 matches | PASS |
| 4  | SplitText cleanup in Hero | grep `revert()` + `matchMedia` cleanup | Hero.tsx lines 124-127: both `nameSplit.revert()` + `roleSplit.revert()` in mm.add cleanup return | PASS |
| 5  | `@/i18n/navigation` Link in ProjectCard, no `next/navigation` | grep both | `@/i18n/navigation`: 1 match (line 33). `from 'next/navigation'`: 0 matches | PASS |
| 6  | `mode="popLayout"` in ProjectGrid | grep | 1 source occurrence (line 59), plus 1 doc-comment mention | PASS |
| 7  | motion `layoutId="filter-indicator"` in CategoryFilter | grep | 1 source occurrence (line 61), plus 1 doc-comment mention | PASS |
| 8  | i18n FR/EN parity | `npx tsx scripts/check-i18n-parity.ts` | Exit 0 — 72 leaf paths | PASS |
| 9  | `app/[locale]/page.tsx` Server Component (no `'use client'`) | First 5 lines + grep for directive at line start | Lines 1-5 begin with `/*` JSDoc, no `'use client'` directive present (only mention is in doc comment "no client directive") | PASS |
| 10 | CV PDFs exist | `fs.existsSync` + size check | cv-fr.pdf 527,343 bytes; cv-en.pdf 527,343 bytes (placeholder copy) | PASS |
| 11 | 12 stub MDX files | `ls content/projects/*.{fr,en}.mdx \| grep -v _template` | 12 files (6 slugs × 2 locales) | PASS |
| 12 | `lib/constants.ts` exports 3 | grep `export const (EMAIL\|GITHUB_URL\|LINKEDIN_URL)` | 3/3 exports found | PASS |
| 13 | NO `cursor: none` anywhere in components/ + app/ | grep | 0 matches (all matches confined to `.planning/` docs) | PASS |
| 14 | 6 placeholder cover images exist | `ls public/projects/*/cover.jpg` | 6/6 with non-zero size | PASS |
| 15 | All 7 HOME-* marked Complete in REQUIREMENTS.md | grep table rows | HOME-01..07 all show `Phase 4 \| Complete` | PASS |

**Score: 15/15 critical gates PASSED.**

## Must-Haves Verification (Per-Plan Frontmatter)

| Plan       | Truths in frontmatter | Verified | Notes |
| ---------- | --------------------: | -------: | ----- |
| 04-00 (assets-and-stubs) | 11 | 11/11 | All 9 binary assets, 12 MDX stubs, lib/constants, 3 category tokens, Badge variants, i18n parity, page.tsx async Server Component, 8 RED harnesses |
| 04-01 (hero) | 6 | 6/6 | Renders 5 i18n keys, useGSAP SplitText timeline, reduced-motion gsap.set branch, Lenis CTA + scrollIntoView fallback, ChevronDown motion bounce, SSR-stable initial state |
| 04-02 (about) | 7 | 7/7 | Renders title + 2 paragraphs, next/image 400x500 lazy+blur, 2-col desktop/stacked mobile, useGSAP ScrollTrigger config, reduced-motion gate, Tailwind utilities (no literals) |
| 04-03 (projects) | 12 | 12/12 | CategoryFilter 4 buttons + aria-pressed + onChange + layoutId, ProjectCard cover+title+year+badge+metadata+locale Link, hover/reduced-motion gate + aria-label, ProjectGrid renders all/subset/empty, popLayout+layout, ProjectsSection useMemo+lifted state |
| 04-04 (skills) | 7 | 7/7 | Title + 3 sub-headings + flex-wrap badges + category variants, useGSAP scope ScrollTrigger top 75%, intra-group 0.05s + cascade 0.15s, reduced-motion gsap.set, no literal colors |
| 04-05 (contact) | 7 | 7/7 | Email button + clipboard.writeText silent try/catch, AnimatePresence Copy↔Check 1.5s revert, 3 social links (Code2/Briefcase/Mail), 2 CV download buttons (default FR + outline EN), aria-labels + download attrs |

**Total must-haves: 38/38 truths verified.** **Total artifacts: 23/23 verified.** **Total key links: 17/17 wired.**

## Anti-Patterns Found

No anti-patterns of significance. The codebase passes all hygiene gates:

| Pattern | Found | Severity | Impact |
| ------- | ----- | -------- | ------ |
| `TODO`/`FIXME`/`XXX`/`HACK` in components/sections | 0 source-code occurrences | n/a | Clean |
| Empty implementations (`return null`, `return {}`) in section components | 0 (only `return undefined` in motion gate negation) | n/a | Clean |
| Console.log-only stub handlers | 0 | n/a | Clean |
| Hardcoded color literals | 0 (verified via Node script with base64 exclusion) | n/a | Clean |
| `cursor: none` | 0 in components/ + app/ | n/a | Clean (Phase 3 LAYOUT-06 gate persists) |
| Props with hardcoded empty values | 0 in section call sites | n/a | Clean — `<ProjectsSection projects={projects}>` receives server-loaded array |
| Placeholder data flowing to render | EMAIL/LinkedIn/about-photo/CVs/cover.jpg are documented placeholders | INFO | Documented in 04-00 SUMMARY known-stubs section; user swaps pre-deploy |

The 7 "placeholder" items are intentionally shipped as stubs per Phase 4 scope (CONTEXT.md `<deferred>`):
- `EMAIL = 'tanguy@example.com'` — user provides real email pre-deploy
- `LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu'` — user provides real URL pre-deploy
- `public/about-photo.jpg` — 800x800 warm-beige solid; user replaces pre-deploy
- `public/cv-en.pdf` — placeholder copy of `cv-fr.pdf`; user supplies EN translation
- 6 `public/projects/*/cover.jpg` — shared placeholder; Phase 5 replaces individually
- 12 MDX stub bodies — minimal "This page will be enriched in Phase 5..." text; Phase 5 expands
- Bio paragraphs — plausible placeholder text; user swaps pre-deploy

None of these prevent Phase 4 acceptance — they are explicitly tracked as user-swap items for Phase 7 deploy prep.

## Test Suite Status

```
> tanguy-portfolio@0.1.0 test
> vitest run

 Test Files  27 passed (27)
      Tests  222 passed (222)
   Start at  21:13:00
   Duration  6.13s (transform 4.89s, setup 0ms, import 26.17s, tests 11.50s, environment 68.43s)
```

| Metric | Phase 3 baseline | Phase 4 net new | Total | Status |
| ------ | ---------------: | --------------: | ----: | ------ |
| Test files | 19 | 8 | 27 | PASS |
| Tests | 137 | 85 | 222 | 222/222 GREEN |
| Hero tests | n/a | 11 | 11 | GREEN |
| About tests | n/a | 13 | 13 | GREEN |
| CategoryFilter tests | n/a | 12 | 12 | GREEN |
| ProjectCard tests | n/a | 14 | 14 | GREEN |
| ProjectGrid tests | n/a | 9 | 9 | GREEN |
| ProjectsSection tests | n/a | 10 | 10 | GREEN |
| Skills tests | n/a | 8 | 8 | GREEN |
| Contact tests | n/a | 11 | 11 | GREEN |
| Build | passing | passing | passing | PASS |
| Lint | clean | clean | clean | PASS |
| TypeScript (vitest strict) | 2 pre-existing test-file TS warnings (About.test.tsx:104, Hero.test.tsx:237) | — | — | Non-blocking; tracked in `deferred-items.md` for Phase 6 lint hardening. Does NOT affect `npm run build` (Next's TS check passes). |

## Manual UAT Items (Pending Human Verification)

Per 04-VALIDATION.md `## Manual-Only Verifications` — 17 items require a real browser/runtime that jsdom cannot validate:

| # | Behavior | Requirement | Status |
| --| -------- | ----------- | ------ |
| 1 | Hero SplitText char stagger plays correctly on mount | HOME-01 | PENDING |
| 2 | Hero above-the-fold renders without layout shift (CLS=0) | HOME-01 D-10 | PENDING |
| 3 | Hero CTA smooth-scrolls to #projects via Lenis | HOME-01 D-07 | PENDING |
| 4 | Hero scroll cue bounce animates | HOME-01 D-07 | PENDING |
| 5 | About scroll-reveal triggers at top 75% | HOME-02 D-12 | PENDING |
| 6 | About reduced-motion: elements render at final state | HOME-02 | PENDING |
| 7 | CategoryFilter motion layoutId indicator smooth-slides between buttons | HOME-03 | PENDING |
| 8 | ProjectGrid filter transitions feel smooth (no jank) | HOME-05 | PENDING |
| 9 | ProjectCard hover (scale + brightness + accent border + arrow translate) | HOME-04 | PENDING |
| 10 | ProjectCard hover disabled under reduced-motion | HOME-04 | PENDING |
| 11 | ProjectCard link navigates to /fr/projects/{slug} (or /en/...) | HOME-04 | PENDING |
| 12 | Skills badges stagger entrance on scroll | HOME-06 | PENDING |
| 13 | Contact email button copies to clipboard | HOME-07 | PENDING |
| 14 | Contact CV download buttons trigger actual download | HOME-07 | PENDING |
| 15 | Contact social links open in new tab with correct hrefs | HOME-07 | PENDING |
| 16 | Project cards retain category colors across all 5 palettes (cross-phase regression) | Phase 4 + Phase 2 | PENDING |
| 17 | Inter font + Hero text without FOIT/FOUC (cross-phase regression) | Phase 4 + Phase 3 | PENDING |

These items are intentionally human-only (visual timing, real animation feel, clipboard secure-context, PDF download flow, palette regression). They do NOT block Phase 4 acceptance from an automated-verification standpoint.

## Gaps Summary

**No automated gaps found.**

All 7 HOME-* requirements are SATISFIED. All 15 critical gates PASS. All 5 ROADMAP success criteria are structurally + behaviorally verified at the test/spot-check level. The full 222/222 test suite is GREEN, `npm run build` succeeds, `npm run lint` is clean, and the FR/EN i18n parity gate passes at 72 leaf paths.

The 17 manual UAT items are the standard "real-browser" verifications that cannot be jsdom-validated — they are expected human-touchpoints, not automated-test gaps.

### Notable Phase 4 strengths

- **Goal-coherent architecture**: 6 plans across 3 waves with explicit dependency-gate design — Wave 0 isolated all foundation work (assets, tokens, MDX stubs, i18n, RED harnesses) so Wave 1's 4 parallel section plans had zero file overlap and Wave 2's Projects-family bundle could land tight-coupled without contention.
- **Pitfall mitigations evidenced in code**: Pitfall 4-A (i18n in useGSAP dependencies), 4-B (`useReducedMotion === true` explicit comparison), 4-C (outer `motion.div layout` + popLayout), 4-D (`ScrollTrigger.refresh()` in SplitText.onSplit), 4-I (motion.div OUTSIDE Link) all visible in source.
- **Fixed category token pattern correctly follows Phase 1 D-12 `--destructive` precedent**: Declared in `:root` once (not in `lib/palettes.ts`), exposed via `@theme inline`, never mutated by ThemeProvider.
- **Clean separation Server vs Client**: `app/[locale]/page.tsx` is async Server Component (server-loads `getProjects`), all 8 section components are `'use client'` (animations + interaction).
- **TDD discipline**: Wave 0 shipped 8 RED harnesses (dynamic import fails); Wave 1+2 implementations turned each GREEN one-by-one. Test count went from 137 (baseline) to 222 with zero regressions.

### Pre-existing non-blocking issues

Two TypeScript warnings tracked in `04-homepage-sections/deferred-items.md` (About.test.tsx:104 and Hero.test.tsx:237) — both vitest-only mock-typing issues that do NOT affect runtime, do NOT affect `npm run build`, and are scheduled for Phase 6 lint-hardening. They are documented and isolated.

---

## Status Summary

**Phase 4 Verification: passed automated; awaiting human UAT.**

- **Status:** `human_needed`
- **Automated verification:** 15/15 critical gates PASS · 7/7 requirements SATISFIED · 38/38 must-haves verified · 17/17 key links WIRED · 222/222 tests GREEN · build + lint + i18n parity all GREEN
- **Manual UAT:** 17 items pending human runtime validation (visual, animation timing, clipboard, downloads, palette regression)
- **Score:** 7/7 must-haves verified
- **Tests:** 222/222 (137 Phase 3 baseline + 85 net new Phase 4)
- **Requirements coverage:** 7/7 HOME-* (HOME-01 through HOME-07)
- **Phase 4 effectively SHIPS** — the goal is achieved at the code/integration/test level. Phase 5 (Project Content Pipeline) can begin in parallel; Phase 6 (a11y audit) will sweep the manual UAT items.

---

_Verified: 2026-05-27T21:14:00Z_
_Verifier: Claude (gsd-verifier, Opus 4.7)_
