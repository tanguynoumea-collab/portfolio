# Phase 4: Homepage Sections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 04-CONTEXT.md — this log preserves the alternatives considered
> and the auto-mode rationale for each pick.

**Date:** 2026-05-27
**Phase:** 04-homepage-sections
**Mode:** `--auto` (Claude picked recommended defaults; no interactive AskUserQuestion calls)
**Areas discussed:** Asset Prep, Hero, About, Projects (Filter+Card+Grid bundle), Skills, Contact, Plan Structure

---

## Asset Preparation (Wave 0 prerequisites)

| Decision | Selected | Rationale |
|----------|----------|-----------|
| CV PDF path | `public/cv-fr.pdf` from existing repo-root PDF; `public/cv-en.pdf` as copy placeholder | The HOME-07 buttons point to these exact paths; PDF already on disk; EN translation is user-deferrable |
| About photo source | `public/about-photo.jpg` placeholder, 800×800, abstract gradient + initial | Recognizable as placeholder if accidentally deployed; user swaps later |
| shadcn badge install | YES (via `npx shadcn@latest add badge`) | Needed for Skills + ProjectCard category coding; reuses palette alias chain |
| Seed 6 MDX project stubs | YES — 2 Tech / 2 Design / 2 BIM, full frontmatter + 1-2 paragraph body | Without stubs, ProjectGrid renders empty state forever; Phase 5 expands |
| User constants file | `lib/constants.ts` with `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` | Centralizes swappable user data; Hero/Footer/Contact all import; 1-file change for user pre-deploy |
| Category color tokens | 3 fixed OKLCh tokens in `:root` (`--color-category-{tech,design,bim}`) | Same pattern as Phase 1 `--destructive`: palette-independent; Tech blue / Design magenta / BIM amber |

---

## Hero Section (HOME-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Centered vertical stack (name big / role / tagline / CTA / scroll cue) | Standard creative portfolio hero, content-first | ✓ |
| Left-aligned grid with media on right | Heavier; needs hero media which we don't have | |
| Split-screen (name left / abstract animated panel right) | Adds risk of animated background anti-pattern | |

**Auto-mode pick:** Centered vertical stack.

### Hero sub-decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| SplitText granularity | chars for both name + role | Most dramatic; "Tanguy" + "Tech × Design × BIM" are short enough |
| Stagger timing | 0.04s/char name + 0.025s/char role | Total Hero reveal <1.2s, doesn't make user wait |
| Char animation | opacity 0→1 + Y 24→0, 0.5s power3.out | Classic; ease feels modern |
| Cascade | name → role → tagline (delay 0.8s) → CTA + scroll cue (delay 1.0s) | Cinematic but quick |
| Reduced-motion handling | `gsap.matchMedia()` with `fullMotion` vs `reducedMotion` branches; reduced does `gsap.set(target, {opacity:1, y:0})` | Strict accessibility per PROJECT.md + A11Y-05 |
| Hook | `useGSAP({ scope: heroRef })` | Project convention per PROJECT.md Key Decisions |
| CTA | Single button "Découvrir mon travail" → `#projects` via `useLenis().scrollTo(target, {offset:-64})` with native scrollIntoView fallback | One clear next action |
| Scroll cue | Lucide `ChevronDown` below CTA, motion bounce 2s loop, reduced-motion → static | Affordance without being noisy |
| Above-the-fold guarantee | SSR-stable initial state (Inter preloaded by Phase 3 D-09); GSAP set inside useGSAP (useLayoutEffect semantics) | No layout shift on font swap |

---

## About Section (HOME-02)

| Option | Description | Selected |
|--------|-------------|----------|
| 2-col desktop (photo left / bio right) + stacked mobile | Standard; works for portrait photo | ✓ |
| Centered photo + bio below | Too vertical; bio gets squashed | |
| Full-width hero photo + bio overlay | Risky if photo is placeholder | |

**Auto-mode pick:** 2-col desktop / stacked mobile.

### About sub-decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Photo size | 400×500 (3:4 portrait) | Common headshot ratio |
| next/image config | `priority={false}`, `loading="lazy"`, blur placeholder | Below the fold, no LCP concern |
| Bio length | 2-3 paragraphs, ~80 words each | Enough to convey hybrid identity without being a wall |
| Scroll reveal | ScrollTrigger `start: 'top 75%'`, photo slide-from-left + bio paragraphs stagger 0.15s | Classic ScrollTrigger pattern; subtle |
| Reduced-motion | `gsap.matchMedia()` skip; elements render at final state immediately | A11Y-05 |
| i18n | New `about.paragraphs[]` array key (FR+EN parity) | Translator-friendly + centralized |

---

## Projects (HOME-03 + HOME-04 + HOME-05 bundled)

### CategoryFilter (HOME-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented control (4 pill buttons + motion `layoutId` active indicator) | Same pattern as LanguageSwitcher (Phase 3 D-18); compact; both states visible | ✓ |
| Dropdown menu | More flexible if categories grow; not needed with 4 | |
| Checkbox multi-select | Enables cross-domain filter; deferred to v2 per FEATURES.md P2 | |
| Tabs (shadcn) | Implies content swap not filter | |

**Auto-mode pick:** Segmented control.

### ProjectCard (HOME-04)

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Wrapper | shadcn `<Card>` | Reuses Phase 1 component + alias chain |
| Cover position | Top, 16:10 ratio | Card-standard; next/image with blur placeholder |
| Badge overlay | Category badge top-left + year top-right | Information-dense without crowding |
| Body | title (text-xl) + summary (line-clamp-2) | Scannable; full content on click |
| Footer metadata | Domain-specific (Tech.stack[0..2] / Design.tools[0..2] / BIM.software[0..2]) | Highlights the discriminated union shape |
| Hover micro-interaction | scale 1.02 + image saturate/brightness + border-color reveal + arrow translate-x | Subtle, no scroll-jacking |
| Hover timing | 200-300ms easeOut | Snappy without feeling rushed |
| Reduced-motion | `useReducedMotion()` opt-out (whileHover stays undefined) | A11Y-05 + motion best practice |
| Link wrapper | `<Link>` from `@/i18n/navigation` | Locale-aware routing per Phase 3 D-18 pattern |
| Arrow icon | Lucide `ArrowUpRight` | "External action" signal |

### ProjectGrid (HOME-05)

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Grid layout | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` | Mobile-first responsive |
| Animation wrapper | `<motion.div layout>` + `<AnimatePresence mode="popLayout" initial={false}>` | popLayout > wait for filter transitions (per Phase 3 D-31 + research) |
| Card transition | `initial/exit: {opacity:0, scale:0.9}` + `animate: {opacity:1, scale:1}` | Subtle fade+scale on enter/exit |
| Empty state | Centered text from existing `projects.empty` i18n + Lucide `SearchX` icon, fade-in | Friendly, not alarming |
| Filter logic | `useMemo(() => projects.filter(p => active === 'all' || p.category === active), [projects, active])` | Client-side, server-loaded data |
| Data loading | `getProjects(locale)` in Server Component page.tsx; passed as prop to client `<ProjectsSection>` | Server-side compile, client-side filter |

---

## Skills Section (HOME-06)

| Option | Description | Selected |
|--------|-------------|----------|
| 3 vertical groups (Tech / Design / BIM) with flex-wrap badges | Maps to existing i18n `skills.groups.*` | ✓ |
| Horizontal scroll carousel | Anti-pattern per FEATURES.md scroll-jacking notes | |
| Progress bars / star ratings | Awkward self-assessment; explicitly avoided | |
| Single mega-list | Loses category-coding visual cue | |

**Auto-mode pick:** 3 group flex-wrap.

### Skills sub-decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Badge primitive | shadcn `<Badge>` installed in Wave 0 D-03 | Consistent with palette aliasing |
| Badge variants | Add `category-tech / category-design / category-bim` via CVA pattern | Same color tokens as filter chips |
| Initial skill list | Tech: TS/React/Next/Node/Tailwind/GSAP/Three; Design: Figma/PS/AI/InD/DS/Branding/Typo; BIM: Revit/ArchiCAD/Rhino/GH/AutoCAD/Twinmotion/Lumion | Plausible defaults; user trims |
| i18n shape | `skills.groups.{tech,design,bim}.items[]` arrays in messages JSON | Centralized; FR/EN parity gate |
| Entrance animation | GSAP timeline, per-badge stagger 0.05s within group, 0.15s group cascade, `from: {opacity:0, y:16, scale:0.9}` | Subtle; signals "things to scan" |
| ScrollTrigger | `start: 'top 75%'` | Plays when section is ¼ into viewport |
| Reduced-motion | `gsap.matchMedia()` skip | A11Y-05 |
| Hook | `useGSAP({ scope: skillsRef })` | Project convention |

---

## Contact Section (HOME-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Email as button + copy-to-clipboard + motion feedback | Per HOME-07 + matches the user's "copy-to-clipboard animé" spec | ✓ |
| Email as plain `<a href="mailto:">` only | Loses the copy-feedback affordance | |
| Modal contact form | Backend out of scope per CONTACT-v2-01 | |
| Calendly/scheduling embed | Not in REQs; out of scope | |

**Auto-mode pick:** Button with clipboard + motion icon swap.

### Contact sub-decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Email display | `<button>` with `<span class="font-mono">{EMAIL}</span>` + Lucide `Copy` icon | Inviting + obvious affordance |
| Clipboard mechanism | `navigator.clipboard.writeText(EMAIL)` with try/catch (silent fail = D-02 pattern) | Defensive |
| Success feedback | motion icon swap Copy→Check + `contact.emailCopied` text label (existing key), 1.5s then revert | Per HOME-07 spec |
| Social links | 3 buttons (GitHub / LinkedIn / mailto:); reuse Phase 3 Footer's icon substitutions (Code2 / Briefcase / Mail) due to lucide-react v1.x brand-icon removal | Consistency with Phase 3 + a11y preserved via i18n labels |
| Social link attrs | `target="_blank" rel="noopener noreferrer"` for external; mailto: for email | Security best practice |
| aria-label | Localized via existing `contact.social.{github,linkedin}` i18n keys | i18n + a11y |
| CV PDF buttons | 2 shadcn `<Button>` side-by-side (stacked on mobile): FR=variant=default, EN=variant=outline | Hierarchy without ambiguity |
| CV button labels | Existing i18n keys `contact.cv.fr` ("Télécharger le CV (FR)") + `contact.cv.en` ("Download CV (EN)") | i18n already populated |
| CV `download` attr | `download="CV_Tanguy_Delrieu_FR.pdf"` and `_EN.pdf` | Better default filename when saving |
| Icon | Lucide `FileDown` for both buttons | Clear "download a document" affordance |

---

## Plan Structure & Wave Topology

| Option | Description | Selected |
|--------|-------------|----------|
| 6 plans / 3 waves (asset-prep → 4 parallel sections + Projects bundle) | Maximum parallelism; Projects bundle keeps coupled units together | ✓ |
| 7 plans / 4 waves (split Projects into 3 plans) | Over-granular for a tightly coupled triple (Filter+Card+Grid) | |
| 4 plans / 2 waves (bundle sections by category) | Loses test-scope clarity | |
| 1 mega-plan | Bad context budget | |

**Auto-mode pick:** 6 plans / 3 waves.

### Plan sequence

1. **Wave 0:** `04-00-assets-and-stubs-PLAN.md` — git-mv CV PDF, add placeholder photo, install shadcn badge + customize variants, add category tokens to globals.css, create `lib/constants.ts`, seed 6 MDX stubs with per-project covers, wire all 5 sections into page.tsx.
2. **Wave 1 (parallel):**
   - `04-01-hero-PLAN.md` — Hero with GSAP SplitText
   - `04-02-about-PLAN.md` — About with scroll reveal
   - `04-04-skills-PLAN.md` — Skills with GSAP stagger
   - `04-05-contact-PLAN.md` — Contact with clipboard + CV downloads
3. **Wave 2:** `04-03-projects-PLAN.md` — CategoryFilter + ProjectCard + ProjectGrid bundle (depends on MDX stubs from Wave 0)

Total estimate: ~3 hours.

---

## Claude's Discretion

Areas deferred to planner / researcher:

- Exact placeholder image asset (CC0 source, gradient PNG, AI-generated SVG)
- Exact category color OKLCh values (planner refines against all 5 palettes for 3:1 UI contrast)
- Exact bio placeholder text (planner writes plausible 2-paragraph FR + EN)
- Hover timing 200 vs 300ms (feel test)
- ScrollTrigger threshold 75% vs 80% (planner picks)
- Hero CTA icon (ChevronDown vs ArrowDown vs MouseScroll)
- Project card arrow icon (ArrowUpRight vs ArrowRight vs MoveUpRight)
- Skill list size (7 per category default — planner may trim to 5-6)
- Whether to show "Featured" section before the filter (deferred — featured flag exists but no UI in v1)

---

## Deferred Ideas

(See 04-CONTEXT.md `<deferred>` section for the full list — 20+ items, including real CV PDF EN translation, real photo, real bio, real skill list, cross-domain combo filter, BIM 3D viewer, scroll-pin Projects horizontal, contact form backend, newsletter, etc.)

---

## Folded Todos

None — `gsd-tools todo match-phase 4` returned `todo_count: 0`.

---

*Discussion log generated: 2026-05-27 (auto mode)*
