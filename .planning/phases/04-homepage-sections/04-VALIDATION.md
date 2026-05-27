---
phase: 4
slug: homepage-sections
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth: 04-RESEARCH.md `## Validation Architecture` section.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 + @testing-library/jest-dom 6.9.1 + user-event 14.6.1 |
| **Config file** | `vitest.config.ts` (set up in Phase 2 W0, jsdom + globals + @/* alias) |
| **Quick run command** | `npm test` (= `vitest run`; exit 0 = green) |
| **Full suite command** | `npm test && npm run lint && npm run build` (smoke gate) |
| **Estimated runtime** | ~10-15s for the full suite once Phase 4 tests are added (Phase 3 baseline = 137 tests in ~6s) |

---

## Sampling Rate

- **After every task commit:** `npx vitest run components/sections/<file>.test.tsx` (scoped sub-30s)
- **After every plan wave:** `npm test` (full Vitest suite)
- **Before `/gsd:verify-work`:** Full suite + lint + build + every manual UAT item below checked off
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-00-01 | 00 | 0 | (D-01) move CV PDF | shell + git mv | `test -f public/cv-fr.pdf && test -f public/cv-en.pdf` | n/a (asset) | ⬜ pending |
| 04-00-02 | 00 | 0 | (D-02) placeholder photo | file check | `test -f public/about-photo.jpg` | n/a (asset) | ⬜ pending |
| 04-00-03 | 00 | 0 | (D-03) shadcn badge install | file + variant | `test -f components/ui/badge.tsx && grep -q "category-tech\|category-design\|category-bim" components/ui/badge.tsx` | n/a (CLI) | ⬜ pending |
| 04-00-04 | 00 | 0 | (D-04) 6 stub MDX projects | file count | `ls content/projects/*.{fr,en}.mdx \| grep -v _template \| wc -l` returns 12 | n/a | ⬜ pending |
| 04-00-05 | 00 | 0 | (D-05) per-project covers | file check | `ls public/projects/*/cover.jpg \| wc -l` returns 6 | n/a | ⬜ pending |
| 04-00-06 | 00 | 0 | (D-06) lib/constants.ts | unit | `npm test -- lib/constants` (exports EMAIL/GITHUB_URL/LINKEDIN_URL) | ❌ Wave 0 | ⬜ pending |
| 04-00-07 | 00 | 0 | (D-13) 3 category color tokens | grep + WCAG | `grep -E "--color-category-(tech\|design\|bim)" app/globals.css` returns 3 lines | n/a (CSS) | ⬜ pending |
| 04-00-08 | 00 | 0 | (D-19) new i18n keys + parity | parity script | `node scripts/check-i18n-parity.ts` exit 0 | ❌ Wave 0 (new script or test) | ⬜ pending |
| 04-00-09 | 00 | 0 | (cross) page.tsx wires 5 sections | smoke + import grep | `grep -c "Hero\|About\|ProjectsSection\|Skills\|Contact" app/[locale]/page.tsx` ≥ 5 | n/a | ⬜ pending |
| 04-00-10 | 00 | 0 | (cross) 8 TDD test harnesses | file count | `ls components/sections/*.test.tsx \| wc -l` ≥ 8 | ❌ Wave 0 | ⬜ pending |
| 04-01-01 | 01 | 1 | HOME-01 Hero renders + i18n + useGSAP + SplitText | unit + smoke | `npm test -- Hero` | ❌ Wave 1 | ⬜ pending |
| 04-01-02 | 01 | 1 | HOME-01 Hero CTA lenis.scrollTo + fallback | unit | `npm test -- Hero` | ❌ Wave 1 | ⬜ pending |
| 04-01-03 | 01 | 1 | HOME-01 reduced-motion gate (matchMedia) | unit | `npm test -- Hero` | ❌ Wave 1 | ⬜ pending |
| 04-01-04 | 01 | 1 | HOME-01 above-the-fold no layout shift | manual UAT | (browser observation) | n/a | ⬜ pending |
| 04-02-01 | 02 | 1 | HOME-02 About i18n paragraphs render | unit | `npm test -- About` | ❌ Wave 1 | ⬜ pending |
| 04-02-02 | 02 | 1 | HOME-02 photo next/image attrs | unit | `npm test -- About` | ❌ Wave 1 | ⬜ pending |
| 04-02-03 | 02 | 1 | HOME-02 ScrollTrigger config (start 'top 75%') | unit (mock gsap) | `npm test -- About` | ❌ Wave 1 | ⬜ pending |
| 04-02-04 | 02 | 1 | HOME-02 reduced-motion gate | unit | `npm test -- About` | ❌ Wave 1 | ⬜ pending |
| 04-02-05 | 02 | 1 | HOME-02 reveal feel (visual) | manual UAT | (browser scroll) | n/a | ⬜ pending |
| 04-04-01 | 04 | 1 | HOME-06 Skills 3 group sub-headings i18n | unit | `npm test -- Skills` | ❌ Wave 1 | ⬜ pending |
| 04-04-02 | 04 | 1 | HOME-06 badges per category from items[] | unit | `npm test -- Skills` | ❌ Wave 1 | ⬜ pending |
| 04-04-03 | 04 | 1 | HOME-06 badge variant matches group | unit | `npm test -- Skills` | ❌ Wave 1 | ⬜ pending |
| 04-04-04 | 04 | 1 | HOME-06 useGSAP ScrollTrigger config | unit | `npm test -- Skills` | ❌ Wave 1 | ⬜ pending |
| 04-04-05 | 04 | 1 | HOME-06 reduced-motion gate | unit | `npm test -- Skills` | ❌ Wave 1 | ⬜ pending |
| 04-05-01 | 05 | 1 | HOME-07 email button + EMAIL constant | unit | `npm test -- Contact` | ❌ Wave 1 | ⬜ pending |
| 04-05-02 | 05 | 1 | HOME-07 clipboard.writeText called on click | unit (mock) | `npm test -- Contact` | ❌ Wave 1 | ⬜ pending |
| 04-05-03 | 05 | 1 | HOME-07 icon swap Copy→Check after copy | unit | `npm test -- Contact` | ❌ Wave 1 | ⬜ pending |
| 04-05-04 | 05 | 1 | HOME-07 clipboard rejection silent (no console) | unit | `npm test -- Contact` | ❌ Wave 1 | ⬜ pending |
| 04-05-05 | 05 | 1 | HOME-07 3 social links with hrefs | unit | `npm test -- Contact` | ❌ Wave 1 | ⬜ pending |
| 04-05-06 | 05 | 1 | HOME-07 2 CV download buttons with `<a download>` | unit | `npm test -- Contact` | ❌ Wave 1 | ⬜ pending |
| 04-05-07 | 05 | 1 | HOME-07 CV download triggers actual download | manual UAT | (browser click) | n/a | ⬜ pending |
| 04-05-08 | 05 | 1 | HOME-07 clipboard works on HTTPS | manual UAT | (deployed test) | n/a | ⬜ pending |
| 04-03-01 | 03 | 2 | HOME-03 CategoryFilter renders 4 buttons | unit | `npm test -- CategoryFilter` | ❌ Wave 2 | ⬜ pending |
| 04-03-02 | 03 | 2 | HOME-03 active button aria-pressed true | unit | `npm test -- CategoryFilter` | ❌ Wave 2 | ⬜ pending |
| 04-03-03 | 03 | 2 | HOME-03 click → onChange callback | unit | `npm test -- CategoryFilter` | ❌ Wave 2 | ⬜ pending |
| 04-03-04 | 03 | 2 | HOME-03 motion layoutId="filter-indicator" | smoke (grep) | `grep "filter-indicator" components/sections/CategoryFilter.tsx` ≥ 1 | n/a | ⬜ pending |
| 04-03-05 | 03 | 2 | HOME-03 default 'all' selected | unit | `npm test -- CategoryFilter` | ❌ Wave 2 | ⬜ pending |
| 04-03-06 | 03 | 2 | HOME-04 ProjectCard cover+title+year+badge | unit | `npm test -- ProjectCard` | ❌ Wave 2 | ⬜ pending |
| 04-03-07 | 03 | 2 | HOME-04 Link from @/i18n/navigation → href | unit | `npm test -- ProjectCard` | ❌ Wave 2 | ⬜ pending |
| 04-03-08 | 03 | 2 | HOME-04 domain metadata per category | unit | `npm test -- ProjectCard` | ❌ Wave 2 | ⬜ pending |
| 04-03-09 | 03 | 2 | HOME-04 whileHover opt-out on reduced-motion | unit | `npm test -- ProjectCard` | ❌ Wave 2 | ⬜ pending |
| 04-03-10 | 03 | 2 | HOME-04 aria-label on Link | unit | `npm test -- ProjectCard` | ❌ Wave 2 | ⬜ pending |
| 04-03-11 | 03 | 2 | HOME-05 ProjectGrid renders all when no filter | unit | `npm test -- ProjectGrid` | ❌ Wave 2 | ⬜ pending |
| 04-03-12 | 03 | 2 | HOME-05 filter renders subset | unit | `npm test -- ProjectGrid` | ❌ Wave 2 | ⬜ pending |
| 04-03-13 | 03 | 2 | HOME-05 empty state when projects=[] | unit | `npm test -- ProjectGrid` | ❌ Wave 2 | ⬜ pending |
| 04-03-14 | 03 | 2 | HOME-05 AnimatePresence mode="popLayout" | smoke (grep) | `grep 'mode="popLayout"' components/sections/ProjectGrid.tsx` ≥ 1 | n/a | ⬜ pending |
| 04-03-15 | 03 | 2 | HOME-05 ProjectsSection lifts filter state | unit | `npm test -- ProjectsSection` | ❌ Wave 2 | ⬜ pending |
| 04-03-16 | 03 | 2 | HOME-05 useMemo filter selector | unit | `npm test -- ProjectsSection` | ❌ Wave 2 | ⬜ pending |
| 04-03-17 | 03 | 2 | HOME-05 layout shift feel | manual UAT | (filter clicks) | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 of Phase 4 = the asset prep + page.tsx wiring + TDD harness plan. No new framework install (Vitest infra already in place since Phase 2 W0). Files to create:

**Assets:**
- [ ] `public/cv-fr.pdf` (via `git mv` from `CV_Tanguy_Delrieu_2023.pdf`)
- [ ] `public/cv-en.pdf` (copy of cv-fr.pdf as placeholder)
- [ ] `public/about-photo.jpg` (800×800 placeholder)
- [ ] `public/projects/{slug}/cover.jpg` × 6 (all share one placeholder source initially)

**Source files:**
- [ ] `lib/constants.ts` — `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` exports
- [ ] `components/ui/badge.tsx` — shadcn install via `npx shadcn@latest add badge` + custom `category-tech/design/bim` variants via CVA
- [ ] `app/globals.css` — 3 new fixed tokens in `:root` (after `--destructive`)
- [ ] `messages/fr.json` + `messages/en.json` — add `about.paragraphs.{1,2}`, `skills.groups.{tech,design,bim}.items[]`, `hero.scrollCue` (with FR/EN parity)
- [ ] `app/[locale]/page.tsx` — replace 5 section bodies with `<Hero />`, `<About />`, `<ProjectsSection projects={projects} />`, `<Skills />`, `<Contact />`

**Content (6 stub MDX projects = 12 files):**
- [ ] `content/projects/texture-manager.{fr,en}.mdx` (Tech)
- [ ] `content/projects/agora.{fr,en}.mdx` (Tech)
- [ ] `content/projects/brand-system.{fr,en}.mdx` (Design)
- [ ] `content/projects/editorial-grid.{fr,en}.mdx` (Design)
- [ ] `content/projects/tower-concept.{fr,en}.mdx` (BIM)
- [ ] `content/projects/residential-renovation.{fr,en}.mdx` (BIM)

**TDD test harnesses (failing-first tests Wave 1+2 implement to green):**
- [ ] `components/sections/Hero.test.tsx`
- [ ] `components/sections/About.test.tsx`
- [ ] `components/sections/CategoryFilter.test.tsx`
- [ ] `components/sections/ProjectCard.test.tsx`
- [ ] `components/sections/ProjectGrid.test.tsx`
- [ ] `components/sections/ProjectsSection.test.tsx`
- [ ] `components/sections/Skills.test.tsx`
- [ ] `components/sections/Contact.test.tsx`

Optional cross-cutting:
- [ ] `app/[locale]/page.test.tsx` — verifies page.tsx wires 5 components
- [ ] `messages/parity.test.ts` OR `scripts/check-i18n-parity.ts` — FR/EN parity gate

---

## Manual-Only Verifications

These require a real browser (jsdom can't validate visual rendering, real animation timing, real clipboard API on HTTPS, real PDF download, motion AnimatePresence feel).

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero SplitText char stagger plays correctly on mount | HOME-01 | Real GSAP timeline + RAF + Inter font load | Hard-load `/fr`. Observe name "Tanguy" reveal char-by-char, then role "Tech × Design × BIM", then tagline + CTA. Total < 1.2s |
| Hero above-the-fold renders without layout shift | HOME-01 D-10 | Real Inter font swap + SSR-to-hydration sequence | DevTools Performance recording on cold load — verify CLS = 0 |
| Hero CTA smooth-scrolls to #projects via Lenis | HOME-01 D-07 | Real Lenis scroll + offset calculation | Click "Découvrir mon travail", observe ~1s inertial scroll to projects section |
| Hero scroll cue bounce animates | HOME-01 D-07 | Real motion animate loop | Observe gentle chevron bounce below CTA |
| About scroll-reveal triggers at top 75% | HOME-02 D-12 | Real scroll position + ScrollTrigger timing | Slowly scroll page; observe photo slide-from-left + bio paragraph stagger when section is 25% into viewport |
| About reduced-motion: elements render at final state | HOME-02 | OS / DevTools emulation | Toggle prefers-reduced-motion in DevTools, reload, scroll — no animation, photo + paragraphs visible immediately |
| CategoryFilter motion layoutId indicator smooth-slides between buttons | HOME-03 | Real motion shared-element animation | Click All → Tech → Design → BIM — observe background slides between buttons |
| ProjectGrid filter transitions feel smooth (no jank) | HOME-05 | Real popLayout exit+enter on 6 cards | Click filter buttons repeatedly, observe card scale+fade transitions; no flash, no overlap |
| ProjectGrid empty state shows when no project matches | HOME-05 | (Filterable to empty in dev only — all categories have projects) | Temporarily filter to a category with 0 matches if possible, or unit test only |
| ProjectCard hover (scale + image brightness + accent border + arrow translate) | HOME-04 | Real pointer events + motion whileHover | Hover over each card; observe scale 1.02 + brightened image + accent border + arrow icon slides right/up |
| ProjectCard hover disabled under reduced-motion | HOME-04 | matchMedia + motion useReducedMotion | Toggle reduced-motion, hover again — no scale/translate |
| ProjectCard link navigates to /fr/projects/{slug} (or /en/...) | HOME-04 | Real route navigation (Phase 5 detail page) | Click any card; Phase 4 only verifies the href; full navigation works once Phase 5 ships detail page |
| Skills badges stagger entrance on scroll | HOME-06 | Real ScrollTrigger + GSAP timeline | Scroll to skills section; observe per-badge fade-up cascade across 3 groups |
| Contact email button copies to clipboard | HOME-07 | Real navigator.clipboard.writeText (HTTPS or localhost) | Click email button; verify clipboard contents (paste somewhere). Observe motion icon swap Copy→Check + "Adresse copiée!" label, reverts after 1.5s |
| Contact CV download button triggers actual download | HOME-07 | Real `<a download>` behavior | Click both CV buttons; verify file saves as CV_Tanguy_Delrieu_FR.pdf / _EN.pdf |
| Contact social links open in new tab with correct hrefs | HOME-07 | Real anchor navigation | Click GitHub, LinkedIn — opens in new tab with portfolio repo / placeholder LinkedIn URL |
| Page transitions still work between sections | (cross-phase regression) | Phase 3 ANIM-01 contract | Navigate FR ↔ EN; observe fade+Y page transition still plays |
| Project cards render correctly under all 5 palettes | (cross-phase regression) | Real palette swap | Open PaletteSwitcher, cycle through Terra/Nordic/Bauhaus/Ocean/Vaporwave; verify category badges retain their 3 fixed colors (not mutated by palette) |
| Inter font loads + renders Hero text without FOIT/FOUC | (cross-phase regression) | Real font-display:swap behavior | Hard-load `/fr`; observe text appears immediately (system fallback) then crisp-swaps to Inter |
| All 5 sections render correctly when JS is disabled | (degradation) | Real no-JS browse | Disable JS in DevTools; reload — sections should render content (server-side); animations off |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Manual UAT entry (per the per-task map above)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (mitigated by per-component unit tests + Wave 0 TDD harnesses)
- [ ] Wave 0 covers all MISSING test files (8 new test files + optional 2 cross-cutting)
- [ ] No watch-mode flags (Vitest `run` mode only)
- [ ] Feedback latency < 15s (npm test full run)
- [ ] `nyquist_compliant: true` set in frontmatter (flip on phase-completion)

**Approval:** pending (will be approved after `/gsd:execute-phase 4` finishes and `/gsd:verify-work 4` passes)
