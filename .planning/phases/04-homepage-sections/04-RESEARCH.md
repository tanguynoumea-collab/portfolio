# Phase 4: Homepage Sections - Research

**Researched:** 2026-05-27
**Domain:** GSAP SplitText + ScrollTrigger + motion AnimatePresence + Clipboard API + next/image inside Lenis-bridged provider tree
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Asset Preparation (Wave 0)**

- **D-01:** Move existing CV PDF (`CV_Tanguy_Delrieu_2023.pdf` at repo root) to `public/cv-fr.pdf` via `git mv` (preserves history). Copy as `public/cv-en.pdf` until EN translation is supplied.
- **D-02:** Placeholder `public/about-photo.jpg` — 800×800 portrait JPEG, CC0 or procedurally generated.
- **D-03:** Install shadcn `badge` via `npx shadcn@latest add badge`.
- **D-04:** Seed 6 stub MDX projects in `content/projects/` (2 Tech / 2 Design / 2 BIM), 12 files total (`{slug}.fr.mdx` + `{slug}.en.mdx`). Recommended slugs: `texture-manager`, `agora`, `brand-system`, `editorial-grid`, `tower-concept`, `residential-renovation`.
- **D-05:** Per-project cover paths `public/projects/{slug}/cover.jpg` — all initially the same placeholder JPEG copied to 6 locations.
- **D-06:** `lib/constants.ts` exposes `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` for Hero/Footer/Contact.

**Hero Section (HOME-01)**

- **D-07:** Centered stack — name `text-7xl md:text-8xl lg:text-9xl`, role `text-2xl md:text-3xl text-accent` (= `text-primary` via shadcn chain), tagline `text-lg text-muted-foreground max-w-2xl`, CTA shadcn `<Button>` → `#projects` via `useLenis()?.scrollTo()`. Lucide `ChevronDown` scroll cue with motion `y: [0, 8, 0]` 2s loop.
- **D-08:** GSAP SplitText char stagger. Name 0.04s/char, role 0.025s/char, `{ opacity: 0, y: 24 }` → `{ opacity: 1, y: 0 }` duration 0.5s `ease: 'power3.out'`. Tagline fade delay 0.8s, CTA + cue delay 1.0s. Reduced-motion via `gsap.matchMedia()` → `gsap.set()` instant.
- **D-09:** `useGSAP({ scope: heroRef })`. Required pattern.
- **D-10:** SSR-stable initial state + `gsap.set()` pre-tween to eliminate layout shift on font load.

**About Section (HOME-02)**

- **D-11:** Desktop 2-col (photo 1/3 + bio 2/3), mobile stacked. `next/image` 400×500 `priority={false}` `loading="lazy"` `placeholder="blur"`. Bio = 2-3 paragraphs from new `about.paragraphs.{1,2,3}` i18n keys.
- **D-12:** Photo slides from `x: -40`, bio paragraphs stagger 0.15s from `y: 30`. `ScrollTrigger.create({ trigger: aboutRef, start: 'top 75%', toggleActions: 'play none none reverse' })`. Reduced-motion via `gsap.matchMedia()`.

**Projects Grid (HOME-03 + 04 + 05 — bundled)**

- **D-13:** CategoryFilter — 4 pills, lifted state in parent `<ProjectsSection>`, motion `layoutId="filter-indicator"`. NEW: 3 fixed category color tokens `--color-category-{tech,design,bim}` in `:root` (follow Phase 1 D-12 `--destructive` precedent — palette-independent).
- **D-14:** ProjectCard = shadcn `<Card>` + cover image + category badge (top-left overlay) + year (top-right) + title + summary + footer metadata badges. Hover (motion `whileHover`): card scale 1.02 (200ms easeOut), image brightness 1.05/saturate 1.1, accent border reveal, `ArrowUpRight` translate 4px right + 4px up. Wrapped in `<Link>` from `@/i18n/navigation` to `/projects/${slug}`.
- **D-15:** ProjectGrid `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` with outer `<motion.div layout>`. Inner `<AnimatePresence mode="popLayout" initial={false}>` wraps filtered cards, each with `key={p.slug} layout exit/initial/animate` (opacity + scale 0.9 → 1). Empty state with Lucide `SearchX` + `projects.empty` i18n.
- **D-16:** `useMemo` filter; projects server-loaded via `getProjects(locale)` in page.tsx and prop-drilled to `<ProjectsSection>` (client).

**Skills Section (HOME-06)**

- **D-17:** 3 sub-headings (`skills.groups.{tech,design,bim}`), each = `flex flex-wrap gap-2` of `<Badge variant="category-tech|design|bim">`. Add 3 CVA variants to `components/ui/badge.tsx` using the fixed category tokens from D-13.
- **D-18:** `useGSAP({ scope: skillsRef })` — badges `from: { opacity: 0, y: 16, scale: 0.9 }`, intra-group stagger 0.05s, group cascade 0.15s, ScrollTrigger `start: 'top 75%'`, `gsap.matchMedia()` for reduced motion.
- **D-19:** New i18n keys `skills.groups.{tech,design,bim}.items[]`. Recommended initials: Tech (TypeScript, React, Next.js, Node.js, Tailwind, GSAP, Three.js), Design (Figma, Photoshop, Illustrator, InDesign, Design System, Branding, Typography), BIM (Revit, ArchiCAD, Rhino, Grasshopper, AutoCAD, Twinmotion, Lumion). FR/EN parity required.

**Contact Section (HOME-07)**

- **D-20:** Email `<button>` with `<span class="font-mono">{EMAIL}</span>` + Lucide `Copy` icon. Click → `navigator.clipboard.writeText(EMAIL)` → motion `AnimatePresence` icon swap (`Copy` → `Check`) + `contact.emailCopied` label, 1.5s revert. Silent failure (`try/catch`).
- **D-21:** 3 social buttons reusing Phase 3 lucide substitutions (Code2 for GitHub, Briefcase for LinkedIn, Mail). `target="_blank" rel="noopener noreferrer"` for https; mailto: no target/rel.
- **D-22:** 2 CV PDF buttons — FR `<Button variant="default">` href `/cv-fr.pdf` download `CV_Tanguy_Delrieu_FR.pdf` + Lucide `FileDown`, EN `<Button variant="outline">` href `/cv-en.pdf` download `CV_Tanguy_Delrieu_EN.pdf`.

**Plan Structure (D-23)**

6 plans across 3 waves:
- **Wave 0:** `04-00-assets-and-stubs-PLAN.md` (CV mv, photo, MDX stubs, lib/constants.ts, category tokens in globals.css, shadcn badge install, page.tsx wiring).
- **Wave 1 (parallel):** `04-01-hero-PLAN.md`, `04-02-about-PLAN.md`, `04-04-skills-PLAN.md`, `04-05-contact-PLAN.md`.
- **Wave 2:** `04-03-projects-PLAN.md` (CategoryFilter + ProjectCard + ProjectGrid bundle; depends on Wave 0 stubs).

### Claude's Discretion

- Exact placeholder photo source (CC0 stock vs SVG-to-JPEG vs gradient + initial "T")
- Exact placeholder cover content (single shared JPEG, abstract Bauhaus-style geometric composition)
- Exact 3 category color OKLCh values (planner refines vs WCAG check — research below validates v1 values)
- Initial bio paragraph text (FR + EN) — planner writes plausible 2-paragraph placeholder
- "View all projects" link below grid (deferred: only meaningful when >6 projects)
- Hero CTA scroll mechanism (`useLenis().scrollTo` vs `scrollIntoView` fallback — both planned)
- Hover animation timing 200ms vs 300ms
- ArrowUpRight vs ArrowRight vs MoveUpRight for ProjectCard
- ScrollTrigger start thresholds 75% vs 80%
- Skill list pruning (7 → 5-6 if visual density too high)
- Whether to expose placeholder data as dev-only flag (recommend: no)

### Deferred Ideas (OUT OF SCOPE)

- Real CV EN translation, real photo, real bio, real email/LinkedIn URL, real project cover images, real skill list (all replaced pre-deploy by user; Phase 7 checklist)
- Cross-domain combo filter, multi-select filter, skills proficiency, About page expansion, Hero animated background, project sorting, project search, "View all" pagination
- Contact form backend (CONTACT-v2-01 — `mailto:` only in v1)
- Newsletter signup
- GSAP scroll-pinned scrolly-telling (OOS per ROADMAP/FEATURES)
- 3D model viewer for BIM projects (BIM-v2-01)
- PDF plan embed for architecture (v2)
- Before/after sliders, video reel embeds (v2)
- Hover sound effects (anti-feature)
- Per-project tags beyond Tech/Design/BIM
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **HOME-01** | Hero with GSAP SplitText reveal (name + bilingual role), no layout shift, `useGSAP({ scope })` with auto-cleanup | §1 SplitText API + §2 useGSAP composition + §16 Layout shift prevention |
| **HOME-02** | About with photo + bio + ScrollTrigger reveal + `prefers-reduced-motion` | §3 ScrollTrigger inside Lenis-bridged tree + §13 next/image best practices + §17 Reduced-motion cascade |
| **HOME-03** | CategoryFilter with 4 buttons + lifted React state + motion layoutId indicator | §6 CategoryFilter motion layoutId + §12 Fixed category OKLCh values |
| **HOME-04** | ProjectCard with cover + title + year + color-coded badge + hover motion + locale-aware Link | §8 i18n navigation Link + §11 shadcn badge variants + §13 next/image + §17 useReducedMotion hover gate |
| **HOME-05** | ProjectGrid filterable + AnimatePresence popLayout + empty state | §4 AnimatePresence popLayout + §7 getProjects data flow + §20 Pitfalls (popLayout fix at boundary) |
| **HOME-06** | Skills 3 groups with GSAP stagger + color-coded badges | §2 useGSAP composition + §11 shadcn badge variants + §12 category tokens |
| **HOME-07** | Contact email copy-to-clipboard + 3 social + 2 CV PDF buttons | §9 Clipboard API + §10 CV PDF `<a download>` + §5 motion whileHover/AnimatePresence icon swap |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

The following directives from `./CLAUDE.md` apply to every Phase 4 plan and task:

| Directive | Source | How Phase 4 Honors It |
|-----------|--------|----------------------|
| **Next.js 16 + React 19.2 + TypeScript 5.6 strict, no `any`** | Tech stack | All HomeXxx components use typed props; Project union from Phase 1 already discriminated |
| **Tailwind v4 `@theme {}` in CSS, no `tailwind.config.ts`** | Tech stack | New category tokens added under `:root` + `@theme` in `app/globals.css` (no JS config) |
| **All colors via OKLCh CSS variables `var(--color-*)`** | Tech stack | Hero/About/Skills/Contact use Tailwind utilities (`text-foreground`, `bg-primary`, etc.). Category badges use 3 new `--color-category-*` tokens declared in `:root` |
| **GSAP via `useGSAP()` for cleanup** | Patterns | Hero, About, Skills all wrap timelines in `useGSAP({ scope: ref })`. NO raw `useEffect` for GSAP |
| **Lenis wraps app except modal zones (data-lenis-prevent)** | Patterns | Phase 4 doesn't add modals; existing Lenis bridge is consumed via `useLenis()` (Hero CTA only) |
| **Server Components by default, `"use client"` only when needed** | Components | About is mostly server with client reveal leaf; Hero, ProjectsSection, CategoryFilter, ProjectCard, Skills, Contact are client (animations + interaction). page.tsx stays server (loads `getProjects(locale)`) |
| **1 file = 1 responsibility** | Conventions | Hero, About, CategoryFilter, ProjectCard, ProjectGrid, ProjectsSection, Skills, Contact each in their own file under `components/sections/` |
| **Sections in `components/sections/`** | Conventions | All Phase 4 components land here |
| **No hardcoded colors** | Conventions | Verified by grep at end of phase: zero `oklch(`, `rgb(`, `hsl(`, or `#XXX` literals in `components/sections/**` |
| **Content projects in `content/projects/*.mdx`** | Conventions | 6 stubs × 2 locales = 12 MDX files added in Wave 0 |
| **Translations in `messages/`** | Conventions | New keys (about.paragraphs, skills.groups.*.items, hero.scrollCue) added to both fr.json + en.json with parity |
| **WCAG AA — focus visible, aria-labels, keyboard nav** | Accessibility | All buttons have aria-labels; CategoryFilter is `role="radiogroup"` or button group with `aria-pressed`; CV download has accessible name + `download` attr; ProjectCard `<Link>` has `aria-label` |
| **Mobile-first responsive sm/md/lg/xl** | Performance | Grid 1/2/3 cols; About 1 col → 2 col at md; Hero typography scales; Contact buttons stack on mobile |
| **`prefers-reduced-motion` respected on all animations** | Constraints | All GSAP via `gsap.matchMedia()`; all motion `whileHover` via `useReducedMotion()` from `motion/react`; the bouncing scroll cue is static under reduced motion |
| **GSD workflow only — no direct edits** | GSD enforcement | All Phase 4 work happens inside `/gsd:execute-phase` |

## Summary

Phase 4 ships the full homepage by populating the 5 placeholder `<section>` shells already in `app/[locale]/page.tsx` with real content built from a single, prescriptive stack: **GSAP 3.15** (free since Apr 2025, SplitText bundled — verified in `node_modules/gsap/dist/SplitText.js`), **@gsap/react 2.1.2** `useGSAP({ scope })` with automatic SplitText + ScrollTrigger reversion, **motion 12.40** (`motion/react` re-exports framer-motion 12.40 — verified by `node_modules/motion/dist/react.d.ts: export * from 'framer-motion'`) for `AnimatePresence mode="popLayout"` + `useReducedMotion()` + `whileHover`, **Lenis 1.3.23** consumed via the existing `useLenis()` accessor for the Hero CTA smooth-scroll, **next-intl 4.12** locale-aware `<Link>` from `@/i18n/navigation` for ProjectCard, **next/image** for About photo + ProjectCard covers with blur placeholders, and **shadcn `<Badge>`** (one new install) with 3 new CVA variants for category color coding.

Every section follows the same pattern: `'use client'` at the top, refs scoped via `useGSAP({ scope })` (Hero/About/Skills), motion components for filter transitions (Projects) and hover micro-interactions (ProjectCard), and a `prefers-reduced-motion` gate that is honored by GSAP via `gsap.matchMedia()` and by motion via `useReducedMotion()`. Phase 3's LenisProvider already registers `ScrollTrigger` at module load, so no Phase 4 component needs to call `gsap.registerPlugin(ScrollTrigger)` — only `gsap.registerPlugin(SplitText)` is added inside the Hero component (or at module scope inside its file).

**Primary recommendation:** Implement the 6-plan / 3-wave structure from D-23. Wave 0 (asset prep + page.tsx wiring) unblocks Wave 1's four parallel section plans (Hero, About, Skills, Contact — zero file overlap) and Wave 2's bundled Projects plan (CategoryFilter + ProjectCard + ProjectGrid + ProjectsSection — tightly coupled and depends on Wave 0 MDX stubs being present to render meaningfully).

## Standard Stack

### Core (already installed — verified in package.json + node_modules)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **gsap** | `^3.15.0` | Hero SplitText timeline + About/Skills ScrollTrigger reveal | Free since Apr 2025 (Webflow acquisition); SplitText IS bundled in 3.15 (verified: `node_modules/gsap/dist/SplitText.js` exists). Industry standard. LenisProvider already registers ScrollTrigger at module scope. |
| **@gsap/react** | `^2.1.2` | `useGSAP({ scope })` hook with auto-revert | Drop-in replacement for `useEffect` that wraps animations in `gsap.context()`. Auto-cleanup of GSAP animations, ScrollTriggers, **AND SplitText instances** on unmount (verified via official docs). Strict Mode safe. Required pattern per PROJECT.md + Pitfall #5. |
| **motion** | `^12.40.0` | AnimatePresence popLayout for filter, whileHover for cards, layoutId for filter indicator, useReducedMotion gate | `motion/react` re-exports framer-motion (verified: `node_modules/motion/dist/react.d.ts → export * from 'framer-motion'`). API identical to framer-motion 12.x. |
| **lenis** | `^1.3.23` | Hero CTA smooth scroll via existing `useLenis()` accessor | Phase 3's LenisProvider exports `useLenis()` — returns `Lenis \| null`. Hero CTA must null-check. |
| **next-intl** | `^4.12.0` | `useTranslations` in client components + locale-aware `<Link>` for ProjectCard hrefs | `Link`/`useRouter` from `@/i18n/navigation` generate locale-prefixed paths automatically |
| **next/image** | bundled | About photo + ProjectCard cover images | Auto WebP/AVIF, blur placeholder, lazy by default, sharp bundled in Next 16 |
| **lucide-react** | `^1.16.0` | Icon set (ChevronDown, Copy, Check, FileDown, ArrowUpRight, SearchX, Code2, Briefcase, Mail) | Already installed for Phase 3. Brand icons removed in v1.0 — substitutions Code2/Briefcase already used by Footer. ChevronDown/ArrowUpRight/Copy/Check/FileDown/SearchX/Mail/Code2/Briefcase all confirmed available. |
| **shadcn `<Button>`, `<Card>`, `<Sheet>`** | radix-ui ^1.4.3 | Hero CTA, ProjectCard wrapper, CV download buttons | Already installed |
| **shadcn `<Badge>`** | NEW Wave 0 | Category badges on ProjectCard, skill badges in Skills | Install: `npx shadcn@latest add badge`. Customize CVA variants for `category-{tech,design,bim}` |

### Alternatives Considered

| Instead of | Could Use | Why We're Not |
|-----------|-----------|---------------|
| GSAP SplitText | Manual `<span>` per char wrapper | Loses `revert()` semantics, no `mask`/`aria` automatic handling, more code. SplitText is free as of Apr 2025. |
| GSAP SplitText | motion's `staggerChildren` on text | Doesn't split chars natively; would require manual splitting upstream. Same complexity, fewer features. |
| `motion AnimatePresence popLayout` | CSS `view-transition-name` + new View Transitions API | Browser support uneven in 2026; framer-motion popLayout is battle-tested for grid filtering. AnimatePresence is the industry standard for React grid filter transitions. |
| `useGSAP({ scope })` | raw `useEffect` + manual `gsap.context()` | Required pattern per PROJECT.md Key Decisions. Pitfall #5 documents the leaks. |
| `clipboard.writeText` | `document.execCommand('copy')` (deprecated) | execCommand is fully deprecated. `navigator.clipboard.writeText` is the only modern path. Fallback = silent failure (Phase 2 D-02 precedent). |
| Custom modal for "address copied" feedback | motion `AnimatePresence` icon swap inline | Cleaner UX. No new component. |

**No new npm install needed beyond `npx shadcn@latest add badge`.** Verified.

**Version verification (run during Wave 0):**

```bash
npm view gsap version       # confirms 3.15.x — already installed
npm view @gsap/react version # confirms 2.1.x — already installed
npm view motion version     # confirms 12.40.x — already installed
```

(Already verified during research: gsap 3.15.0, motion 12.40.0 installed.)

## Architecture Patterns

### Recommended Project Structure (additions for Phase 4)

```
app/
└── [locale]/
    └── page.tsx                    # MODIFIED: server-loads getProjects(locale), composes 5 sections
components/
└── sections/                       # NEW directory contents:
    ├── Hero.tsx                    # 'use client' — useGSAP SplitText + CTA + scroll cue
    ├── Hero.test.tsx               # Vitest: renders translations, SplitText scoped, CTA scroll
    ├── About.tsx                   # 'use client' — useGSAP ScrollTrigger photo+bio reveal
    ├── About.test.tsx              # Vitest: renders paragraphs, image present, scroll trigger created
    ├── CategoryFilter.tsx          # 'use client' — 4 buttons with motion layoutId
    ├── CategoryFilter.test.tsx     # Vitest: aria-pressed, onChange, 'all' default
    ├── ProjectCard.tsx             # 'use client' — Card + cover + hover stack + Link
    ├── ProjectCard.test.tsx        # Vitest: renders correct meta per category, href correct, badge variant
    ├── ProjectGrid.tsx             # 'use client' — AnimatePresence popLayout grid
    ├── ProjectGrid.test.tsx        # Vitest: renders cards, filter affects rendered set, empty state
    ├── ProjectsSection.tsx         # 'use client' — composes CategoryFilter + ProjectGrid, owns filter state
    ├── ProjectsSection.test.tsx    # Vitest: filter state lifted, useMemo selector
    ├── Skills.tsx                  # 'use client' — useGSAP stagger badges per group
    ├── Skills.test.tsx             # Vitest: renders 3 groups, badges from i18n arrays
    ├── Contact.tsx                 # 'use client' — email copy + social + CV downloads
    └── Contact.test.tsx            # Vitest: clipboard called, icon swap, CV hrefs correct
components/ui/
└── badge.tsx                       # NEW Wave 0 (via shadcn add badge) — customize CVA variants
content/projects/                   # NEW Wave 0:
├── texture-manager.fr.mdx
├── texture-manager.en.mdx
├── agora.fr.mdx
├── agora.en.mdx
├── brand-system.fr.mdx
├── brand-system.en.mdx
├── editorial-grid.fr.mdx
├── editorial-grid.en.mdx
├── tower-concept.fr.mdx
├── tower-concept.en.mdx
├── residential-renovation.fr.mdx
└── residential-renovation.en.mdx
lib/
└── constants.ts                    # NEW Wave 0 — EMAIL, GITHUB_URL, LINKEDIN_URL
public/
├── cv-fr.pdf                       # Wave 0: git mv from repo root
├── cv-en.pdf                       # Wave 0: copy of cv-fr.pdf (placeholder)
├── about-photo.jpg                 # Wave 0: 800×800 placeholder
└── projects/
    ├── texture-manager/cover.jpg   # Wave 0: shared placeholder JPEG, copied
    ├── agora/cover.jpg             # Wave 0: same JPEG copied
    ├── brand-system/cover.jpg      # …
    ├── editorial-grid/cover.jpg
    ├── tower-concept/cover.jpg
    └── residential-renovation/cover.jpg
```

### Pattern 1: useGSAP({ scope }) with SplitText cleanup (HOME-01)

**What:** `@gsap/react`'s `useGSAP` automatically reverts all GSAP animations, ScrollTriggers, AND SplitText instances created inside the callback when the component unmounts. Documented behavior (verified via official docs).

**When to use:** All Phase 4 GSAP-driven components — Hero (SplitText), About (ScrollTrigger), Skills (ScrollTrigger + stagger).

**Code pattern (Hero, simplified):**

```tsx
// Source: https://gsap.com/resources/React/ + project Phase 3 LenisProvider precedent
'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useLenis } from '@/components/providers/LenisProvider';
// ScrollTrigger already registered at LenisProvider module load.
// SplitText is registered HERE (module-level, idempotent).
gsap.registerPlugin(SplitText);

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const t = useTranslations('hero');
  const lenis = useLenis();

  useGSAP(
    () => {
      // matchMedia handles both motion modes; revert is automatic on unmount.
      const mm = gsap.matchMedia();
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const nameSplit = new SplitText('[data-hero-name]', { type: 'chars', aria: 'auto' });
          const roleSplit = new SplitText('[data-hero-role]', { type: 'chars', aria: 'auto' });

          if (ctx.conditions?.isFull) {
            const tl = gsap.timeline();
            tl.from(nameSplit.chars, {
              opacity: 0, y: 24, duration: 0.5, stagger: 0.04, ease: 'power3.out',
            })
              .from(roleSplit.chars, {
                opacity: 0, y: 24, duration: 0.5, stagger: 0.025, ease: 'power3.out',
              }, '-=0.3')
              .from('[data-hero-tagline]', { opacity: 0, duration: 0.5 }, 0.8)
              .from('[data-hero-cta]', { opacity: 0, y: 12, duration: 0.5 }, 1.0)
              .from('[data-hero-cue]', { opacity: 0, duration: 0.5 }, 1.0);
          } else {
            // Reduced: instant final state.
            gsap.set(
              [nameSplit.chars, roleSplit.chars, '[data-hero-tagline]', '[data-hero-cta]', '[data-hero-cue]'],
              { opacity: 1, y: 0 }
            );
          }

          // useGSAP auto-reverts the SplitText; explicit return cleanup also
          // works if matchMedia recreates the context.
          return () => {
            nameSplit.revert();
            roleSplit.revert();
          };
        }
      );
    },
    { scope: heroRef }
  );

  function onCta() {
    const target = document.getElementById('projects');
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.0 });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section ref={heroRef} id="home" className="flex min-h-screen items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 data-hero-name className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-foreground">
          {t('name')}
        </h1>
        <p data-hero-role className="text-2xl md:text-3xl text-primary">
          {t('role')}
        </p>
        <p data-hero-tagline className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('tagline')}
        </p>
        <button data-hero-cta onClick={onCta} /* …Button shadcn… */>
          {t('cta')}
        </button>
        {/* scroll cue: motion bouncing arrow */}
      </div>
    </section>
  );
}
```

**Key points:**
- `gsap.matchMedia()` is the recommended GSAP pattern for `prefers-reduced-motion` (auto-revert when conditions change at runtime, e.g., user toggles OS setting).
- SplitText instances are auto-reverted on unmount via `useGSAP` (confirmed by official docs). Explicit `split.revert()` in the matchMedia return is belt-and-suspenders: ensures cleanup if matchMedia tears down context independently before unmount.
- `aria: 'auto'` (default) on SplitText auto-injects `aria-label` with original text and `aria-hidden` on split children → screen readers announce the whole word, not letter-by-letter (Pitfall 5 docs confirm this).
- `useLenis()` returns null under reduced-motion OR before effect runs → must null-check (LenisProvider contract).

### Pattern 2: ScrollTrigger inside the Lenis-bridged provider tree (HOME-02 + HOME-06)

**What:** Phase 3's LenisProvider already does:
```ts
gsap.registerPlugin(ScrollTrigger);                         // module scope
gsap.ticker.add((time) => lenis.raf(time * 1000));         // single RAF
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);                  // bridge
ScrollTrigger.refresh();                                   // initial sync
```

So Phase 4 components MUST NOT call `gsap.registerPlugin(ScrollTrigger)` again, and MUST NOT add another ticker callback. They simply create `ScrollTrigger.create({...})` instances inside `useGSAP({ scope })` and rely on the bridge.

**When to use:** Any `start: 'top XX%'` reveal — About paragraphs, Skills stagger.

**Trigger position semantics under Lenis:** Lenis writes its virtual scroll position via `lenis.on('scroll', ScrollTrigger.update)`. ScrollTrigger reads `window.scrollY` and gets the synthetic value Lenis writes. `start: 'top 75%'` means "trigger fires when the top of the element is 75% down the viewport (i.e., when 25% of the element is visible)". This works correctly because Lenis is bridged.

**Code pattern (About reveal):**

```tsx
// Source: GSAP ScrollTrigger docs + Phase 3 ARCHITECTURE.md Pattern 5
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// NO registerPlugin here — LenisProvider already did it at module load.

export function About() {
  const aboutRef = useRef<HTMLElement>(null);
  const t = useTranslations('about');
  const paragraphs = [t('paragraphs.1'), t('paragraphs.2')];  // …more if 3

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          if (!ctx.conditions?.isFull) {
            // Reduced: set final state, no ScrollTrigger needed.
            gsap.set('[data-about-photo], [data-about-paragraph]', { opacity: 1, x: 0, y: 0 });
            return;
          }
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: aboutRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          });
          tl.from('[data-about-photo]', { opacity: 0, x: -40, duration: 0.7, ease: 'power2.out' })
            .from(
              '[data-about-paragraph]',
              { opacity: 0, y: 30, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
              '-=0.4'
            );
        }
      );
    },
    { scope: aboutRef }
  );

  return (
    <section ref={aboutRef} id="about" className="flex min-h-screen items-center justify-center px-4">
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
        <div data-about-photo className="md:col-span-1">
          <Image
            src="/about-photo.jpg"
            alt={t('title')}
            width={400}
            height={500}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/2wBDAA…"  // generate at build
            sizes="(max-width: 768px) 100vw, 33vw"
            className="rounded-lg object-cover"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} data-about-paragraph className="text-lg text-foreground">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**No `ScrollTrigger.scrollerProxy()` needed.** Lenis 1.x writes the virtual scroll position to `window.scrollY` directly, so the standard ScrollTrigger works (confirmed by ARCHITECTURE.md Pattern 5: "ScrollTrigger.scrollerProxy() is NOT needed in Lenis 1.x"). Verified by Phase 3's working ScrollTrigger.refresh patterns in LenisProvider.

### Pattern 3: AnimatePresence mode="popLayout" with parent `<motion.div layout>` (HOME-05)

**What:** `popLayout` removes exiting children from layout flow (sets them to `position: absolute` during exit) so the parent layout reflows immediately, then animates the remaining children to new positions. Compared to `mode="wait"` (slow, sequenced) and `mode="sync"` (overlapping), `popLayout` is the canonical pattern for grid filtering (PITFALLS.md Pitfall 6 + motion docs).

**When to use:** ProjectGrid filter transitions — the ONLY grid in Phase 4.

**Code pattern (ProjectGrid):**

```tsx
// Source: motion docs + Phase 4 D-15 + PITFALLS.md Pitfall 6
'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';
import type { Project } from '@/lib/projects';
import { ProjectCard } from './ProjectCard';

type Props = {
  projects: Project[];
};

export function ProjectGrid({ projects }: Props) {
  const t = useTranslations('projects');

  if (projects.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center gap-3 text-muted-foreground py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SearchX className="h-12 w-12" aria-hidden="true" />
        <p>{t('empty')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Pitfall fix from PITFALLS.md Pitfall 6:** "Don't combine `layout` with `whileHover={{ scale: ... }}` on the same element; nest a motion child instead." ProjectCard internally uses motion `whileHover scale: 1.02` — so the outer wrapper here ONLY has `layout` + `initial/animate/exit`, and ProjectCard renders its OWN inner motion node for hover. Two-level motion tree avoids the layout-vs-transform fight.

### Pattern 4: motion `layoutId` shared-element transition (HOME-03)

**What:** Same pattern Phase 3 D-18 used for LanguageSwitcher (`layoutId="lang-indicator"`). The active button hosts a `<motion.span layoutId="filter-indicator">` background — motion's layout engine morphs it across as the active state changes.

**Code pattern (CategoryFilter):**

```tsx
'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type Category = 'tech' | 'design' | 'bim';
export type FilterValue = Category | 'all';

type Props = {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
};

const OPTIONS: ReadonlyArray<FilterValue> = ['all', 'tech', 'design', 'bim'] as const;

export function CategoryFilter({ active, onChange }: Props) {
  const t = useTranslations('projects.filters');
  return (
    <div role="radiogroup" aria-label={t('all')} className="inline-flex items-center gap-1 rounded-full border border-border bg-background p-1">
      {OPTIONS.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className="relative z-10 px-4 py-1.5 text-sm font-medium transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId="filter-indicator"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
              />
            )}
            <span className={cn(isActive ? 'text-primary-foreground' : 'text-muted-foreground')}>
              {t(option)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

**Verification:** Phase 3 D-18 LanguageSwitcher already proven (137/137 tests). Same pattern; only the `layoutId` string differs ("lang-indicator" → "filter-indicator").

### Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Do This Instead |
|--------------|--------------|-----------------|
| `useEffect(() => { gsap.from(...) })` | Strict Mode double-play, ScrollTrigger leak, no cleanup | `useGSAP({ scope: ref })` |
| `gsap.registerPlugin(ScrollTrigger)` in a section component | Idempotent but redundant; muddies the contract — LenisProvider OWNS this | Only register `SplitText` (new for Phase 4); ScrollTrigger is already registered |
| `useState(0); useEffect(() => setState(matchMedia(...).matches), [])` for reduced-motion gate | `react-hooks/set-state-in-effect` lint rule fires (Phase 2 + 3 precedent) | Use `usePrefersReducedMotion()` (already in `lib/hooks/`) OR motion's `useReducedMotion()` OR GSAP's `gsap.matchMedia()` |
| `<motion.div layout whileHover={{ scale: 1.02 }}>` on the same node | Layout animation fights transform animation; visual artifacts | Nest: outer `<motion.div layout>` for grid; inner `<motion.div whileHover>` for hover |
| `import Link from 'next/link'` for project links | Doesn't prefix locale; routes to `/projects/foo` not `/fr/projects/foo` | `import { Link } from '@/i18n/navigation'` |
| `<a href="/cv-fr.pdf">` without `download` attr | Browser may render PDF inline in a new tab | Add `download="CV_Tanguy_Delrieu_FR.pdf"` to force download with friendly filename |
| Hardcoded category colors `text-[#3b82f6]` | Defeats palette switcher (PITFALL #2). Also OKLCh policy violation | Use `text-category-tech` Tailwind utility wired to `var(--color-category-tech)` (declared once in `:root`, never mutated) |
| `text-blue-500 bg-blue-100` for category badges | Same — Tailwind preset colors are hex, not OKLCh, not palette-aware | Same fix as above |
| Skipping `data-lenis-prevent` on a scrolling Sheet | Lenis virtualizes the modal scroll, broken UX | Phase 4 doesn't add new Sheets/Dialogs, so this isn't an issue here, but keep the rule for future |
| Reading `getProjects(locale)` from a Client Component | `lib/projects.ts` uses `node:fs` — fails on client | Server-load in `page.tsx`, prop-drill to `<ProjectsSection projects={...}>` |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Character-by-character text reveal | Manual `<span>` per char with stagger via setTimeout | GSAP SplitText | Free, handles aria correctly, has `revert()`, integrates with timelines |
| Grid filter exit/enter animation | Manual mount/unmount with setTimeout exits | `<AnimatePresence mode="popLayout">` | Handles layout reflow during exit, prevents collapse, sync with React reconciliation |
| Smooth-scroll to anchor under Lenis | `element.scrollIntoView({behavior:'smooth'})` only | `useLenis()?.scrollTo(target, { offset: -64 })` with scrollIntoView fallback | Lenis virtualizes scroll; native API may fight virtualization. Lenis exposes `scrollTo(node, opts)` for this exact case. |
| Active filter indicator transition | CSS class toggle + transitions | `motion.span` with `layoutId` | Shared-element transition gives the gliding effect users expect; same pattern Phase 3 D-18 already shipped (proven). |
| Email copy-to-clipboard | Hidden `<textarea>` + `document.execCommand('copy')` | `navigator.clipboard.writeText()` in try/catch | execCommand fully deprecated. Modern API is one call with built-in permission handling. |
| Reduced-motion gate per animation | `useState(false) + useEffect(matchMedia)` | `usePrefersReducedMotion()` (already exists in `lib/hooks/`) OR motion's `useReducedMotion()` OR `gsap.matchMedia()` inside useGSAP | Three options, each with their own niche: GSAP timelines → gsap.matchMedia; motion components → useReducedMotion; non-Motion JS code paths → usePrefersReducedMotion. All three are SSR-safe. |
| Blur placeholder generation for cover images | Manual base64 dataURL | `placeholder="blur"` + auto blurDataURL via `next/image` static import (preferred) OR `plaiceholder` for dynamic paths | Next/Image generates blur dataURL automatically when imported statically. For dynamic paths (our case — `/projects/{slug}/cover.jpg`), pre-generate at build OR provide explicit `blurDataURL` props. |
| Per-category badge variant with conditional className | Switch statement returning `'bg-blue-100 text-blue-700'` strings | shadcn `<Badge variant="category-tech">` with CVA | CVA is the shadcn convention; new variants are 3-line additions. Type-safe variant names. |
| PDF download trigger | `<button onClick={() => fetch(...).then(blob => ...)}>` | `<a href="/cv-fr.pdf" download="CV.pdf">` | Same-origin static asset; browser handles MIME + filename via standard attributes. No JS, no fetch, no blob wrangling. |

**Key insight:** Every Phase 4 interaction has a direct, idiomatic library API. Custom solutions introduce edge cases (clipboard fallback complexity, scroll-jacking, focus loss after copy, character-by-character a11y bugs). Resist hand-rolling.

## Common Pitfalls (Phase-4 specific — beyond global PITFALLS.md)

### Pitfall 4-A: SplitText breaks on i18n locale switch — text re-renders, but split DOM doesn't re-split

**What goes wrong:** User switches FR ↔ EN. The `<h1>` re-renders with the new translation. But the existing SplitText instance still wraps the OLD chars. The new translation renders unsplit, the old split chars are stale, animation skipped.

**Why it happens:** SplitText mutates the DOM at mount. React re-renders the parent text, but SplitText doesn't observe textContent changes by default.

**How to avoid:** Pass `t('name')` as a `dependencies` array to `useGSAP`:

```tsx
useGSAP(() => { /* SplitText + timeline */ }, { scope: heroRef, dependencies: [t('name'), t('role')] });
```

`useGSAP` will tear down its context (reverting all SplitText + timelines) and re-run the callback when dependencies change. Standard `useGSAP` API.

**Warning signs:** Switch language while watching `<h1>`, animation runs in FR but not EN (or vice versa); inspect DOM and see leftover empty char `<div>`s.

### Pitfall 4-B: motion `useReducedMotion()` returns `null` on SSR, boolean post-hydration

**What goes wrong:** Reading the hook value during initial render gives `null`. Naive code: `whileHover={reducedMotion ? undefined : { scale: 1.02 }}` — when `reducedMotion === null`, treats as falsy and APPLIES the hover, then flips to `null` again post-hydration causing UI flicker.

**Why it happens:** Motion's `useReducedMotion()` returns `null` on server and during first client render before media query is read.

**How to avoid:** Compare to `true` explicitly:

```tsx
const reducedMotion = useReducedMotion();
return (
  <motion.div
    whileHover={reducedMotion === true ? undefined : { scale: 1.02 }}
  >
```

(With strict null-or-boolean handling: `reducedMotion === true` means reduce; `false` OR `null` both mean allow motion. Treats SSR-default state as "allow motion".)

**Alternative:** Use `usePrefersReducedMotion()` from `lib/hooks/usePrefersReducedMotion.ts` which returns explicit boolean (false on SSR).

### Pitfall 4-C: AnimatePresence popLayout collapses parent height to zero during exit-only state

**What goes wrong:** Filter changes from "all" (6 cards) to "Tech" (2 cards). 4 cards exit via popLayout. During exit (200-300ms), they're `position: absolute` so they're out of flow. The remaining 2 cards reflow up. The grid parent may not have explicit row height, so height "jumps" before settling.

**Why it happens:** Grid auto-row sizing depends on in-flow children. Out-of-flow exit children don't contribute to row height calculation.

**How to avoid:** The fix is simple — use the outer `<motion.div layout>` (already specced in D-15). Motion's `layout` prop animates the parent height transition smoothly, preventing the jump. **Critical: the outer wrapper MUST have `layout` prop set.** Without it, the grid jumps.

**Warning signs:** Visible "snap" in row height during filter; cards below the grid jump up briefly.

### Pitfall 4-D: ScrollTrigger fires at wrong position after Hero SplitText injects char `<div>`s into DOM

**What goes wrong:** Page loads. About's ScrollTrigger calculates trigger position at top of About section. Then Hero's SplitText runs, wrapping each char in `<div>` — Hero's height changes by a few pixels (depending on line-height math). About's calculated trigger position is now stale by Hero's height-delta. Animation fires "too late" by N pixels.

**Why it happens:** `ScrollTrigger.create` snapshots positions at creation. SplitText changes layout AFTER creation. No automatic refresh.

**How to avoid:** Two options:
1. **Recommended:** Hero's useGSAP runs SplitText synchronously inside `useLayoutEffect` semantics (useGSAP uses isomorphic layoutEffect). About's useGSAP runs after Hero's. Order is correct, BUT both are in different components. Solution: Hero's SplitText completes BEFORE About's ScrollTrigger is created because of the React render order (Hero is above About in the JSX tree). **However**, SplitText DOM wrapping might still cause a small layout shift between Hero's useGSAP and About's useGSAP since they both fire on mount.

   **Best fix:** Call `ScrollTrigger.refresh()` after SplitText splits in Hero. Use SplitText's `onSplit` callback:
   ```tsx
   const split = new SplitText('[data-hero-name]', {
     type: 'chars',
     onSplit: () => ScrollTrigger.refresh(),
   });
   ```

2. **Alternative:** Rely on LenisProvider's existing `document.fonts.ready.then(() => ScrollTrigger.refresh())` — fonts ready fires AFTER Hero's SplitText runs (because SplitText runs in useGSAP which runs in useLayoutEffect, before the first paint that triggers font swap). This already happens in Phase 3. **Test required to confirm timing.**

**Recommendation:** Use option 1 (explicit `ScrollTrigger.refresh()` in onSplit) — defensive and deterministic.

### Pitfall 4-E: Clipboard API requires HTTPS or localhost

**What goes wrong:** Site deployed to staging via HTTP. `navigator.clipboard.writeText(EMAIL)` throws `TypeError: Cannot read properties of undefined (reading 'writeText')` or rejects the Promise.

**Why it happens:** `navigator.clipboard` is gated to secure contexts (HTTPS, localhost, `file://`). Strict browser policy since Chrome 76.

**How to avoid:** Wrap in `try/catch`, silent failure on rejection. Vercel deploys are HTTPS by default so this is fine for production. Local dev = localhost = secure context. **No action needed beyond the silent try/catch already specced in D-20.** Phase 2 D-02 silent-fallback precedent.

**Warning signs:** Email "copy" doesn't trigger icon swap on staging deploys via HTTP; works locally.

### Pitfall 4-F: shadcn Badge install adds `tw-animate-css` import that already exists in globals.css

**What goes wrong:** `npx shadcn@latest add badge` may try to add `@import "tw-animate-css"` to globals.css (or its config). Already there (`globals.css` line 2). Duplicate import or conflict warning at build.

**Why it happens:** shadcn add command idempotently adds dependencies but may not detect already-present CSS imports.

**How to avoid:** After running `shadcn add badge`, manually diff globals.css and remove any duplicate imports the CLI added. Existing globals.css line 2 (`@import 'tw-animate-css';`) is already correct. Wave 0 task: verify single import after badge install.

### Pitfall 4-G: lucide-react v1.16 brand icons removed — Code2/Briefcase substitutions already in Phase 3

**What goes wrong:** New developer copy-pastes a "Github" lucide import for Contact's social link. Build fails: `Github is not exported from 'lucide-react'`.

**Why it happens:** lucide-react v1.0 (current) removed brand-trademarked icons. Code2, Briefcase, Mail are the substitutions Phase 3 Footer already uses.

**How to avoid:** Contact section imports `Code2, Briefcase, Mail` from lucide-react — reusing the same substitution pattern Footer documented. No new icon discovery needed. Documented in Phase 3 commit log.

### Pitfall 4-H: stub MDX without `featured: false` defaults to `undefined` and fails validation

**What goes wrong:** `lib/projects.ts validateFrontmatter` requires `featured: boolean`. Stub omits the field. Validator coerces to `false` (line 85) — actually fine. But if author forgets `summary` or `year`, throws at build.

**Why it happens:** Validator checks `if (!common.title || !common.year || !common.cover || !common.summary)` — missing any of these = build error.

**How to avoid:** Wave 0 MDX stubs MUST include ALL required common fields: `slug, title, year, category, cover, summary, featured` PLUS the per-category required fields (`stack[]` for tech, `tools[]` for design, `software[]` + `projectScale` for bim). Use `_template.fr.mdx` as the reference template — already exercises the full TechProject shape.

### Pitfall 4-I: motion `whileHover` doesn't fire when `<Link>` wraps the card

**What goes wrong:** ProjectCard wraps in `<Link href=...>` from `@/i18n/navigation`. Hover state goes to the Link, not the motion.div inside. `whileHover` on the inner card doesn't fire.

**Why it happens:** `whileHover` listens to pointer enter on the motion node itself.

**How to avoid:** Two options:
1. **Recommended:** Put motion ON the outermost element — `<motion.div whileHover>` wraps the `<Link>`. Or use motion's `<motion.a>` as the Link.
2. **Alternative:** Use CSS group-hover instead — Tailwind utility `group` on Link parent, `group-hover:scale-[1.02]` on card. Loses motion's spring physics but works.

**Recommendation:** Option 1. Pattern:
```tsx
<motion.div
  whileHover={reducedMotion === true ? undefined : { scale: 1.02 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  <Link href={`/projects/${project.slug}`} aria-label={`${t('viewProject')} ${project.title}`}>
    <Card> {/* shadcn */}
      …
    </Card>
  </Link>
</motion.div>
```

### Pitfall 4-J: Skills i18n array access in TypeScript strict — `noUncheckedIndexedAccess` may flag

**What goes wrong:** `skills.groups.tech.items` from JSON is typed as `string[]`. If `tsconfig.json` has `noUncheckedIndexedAccess: true`, accessing `items[0]` is typed `string | undefined`.

**Why it happens:** Phase 1 D-Discretion mentioned this strict flag as recommendation; check tsconfig.

**How to avoid:** Use array `.map()` instead of indexed access. Already the natural pattern for rendering badges:
```tsx
const items = useTranslations('skills.groups').raw('tech.items') as string[];
// OR use next-intl's array iteration utility
{items.map((skill) => <Badge variant="category-tech" key={skill}>{skill}</Badge>)}
```

(next-intl supports JSON arrays via `useMessages().skills.groups.tech.items` or `t.raw('skills.groups.tech.items')`.)

## Code Examples

### Email copy-to-clipboard with motion icon swap

```tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { EMAIL } from '@/lib/constants';

export function CopyEmailButton() {
  const t = useTranslations('contact');
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent fallback per Phase 2 D-02 precedent.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={t('email')}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-mono hover:bg-muted transition-colors"
    >
      <span>{EMAIL}</span>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
            <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
            <Copy className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">{copied ? t('emailCopied') : ''}</span>
    </button>
  );
}
```

### CV PDF download buttons

```tsx
// Source: HTML download attr spec — same-origin static asset
import Link from 'next/link';   // can use native <a> here; not locale-prefixed (it's an asset)
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export function CVDownloads() {
  const t = useTranslations('contact');
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="default">
        <a href="/cv-fr.pdf" download="CV_Tanguy_Delrieu_FR.pdf" className="inline-flex items-center gap-2">
          <FileDown className="h-4 w-4" aria-hidden="true" />
          {t('cv.fr')}
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href="/cv-en.pdf" download="CV_Tanguy_Delrieu_EN.pdf" className="inline-flex items-center gap-2">
          <FileDown className="h-4 w-4" aria-hidden="true" />
          {t('cv.en')}
        </a>
      </Button>
    </div>
  );
}
```

Notes: `<a>` is native (no Link from `@/i18n/navigation` — these aren't routes). The PDFs live in `public/` and are served from same origin, so `download` attribute works without CORS issues. shadcn `<Button asChild>` passes button styling to the `<a>` child via Radix Slot.

### shadcn Badge variants for category colors

```tsx
// components/ui/badge.tsx — after `npx shadcn@latest add badge`, modify variants:
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        // NEW: 3 category variants — bg uses --color-category-* (fixed tokens)
        'category-tech': 'border-transparent bg-[var(--color-category-tech)] text-white',
        'category-design': 'border-transparent bg-[var(--color-category-design)] text-white',
        'category-bim': 'border-transparent bg-[var(--color-category-bim)] text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
```

**Important:** the `bg-[var(--color-category-tech)]` Tailwind arbitrary value is the ONLY safe way to reference a CSS variable that isn't wired through `@theme`. To get a proper Tailwind utility `bg-category-tech`, add the tokens to `@theme` AND `:root`:

```css
/* app/globals.css — add to :root (after --destructive, D-12 precedent) */
:root {
  /* …existing… */
  /* Fixed category tokens — palette-independent, ARCH/D-13 follows D-12 --destructive precedent */
  --color-category-tech: oklch(0.55 0.15 240);     /* cool blue */
  --color-category-design: oklch(0.65 0.20 330);   /* magenta */
  --color-category-bim: oklch(0.60 0.13 60);       /* warm amber */
}

/* Add to @theme inline (after --color-ring) so Tailwind generates bg-category-tech / text-category-tech utilities */
@theme inline {
  /* …existing… */
  --color-category-tech: var(--color-category-tech);
  --color-category-design: var(--color-category-design);
  --color-category-bim: var(--color-category-bim);
}
```

Then the badge variant becomes the cleaner `bg-category-tech text-white`. **Recommended.**

### MDX stub example (texture-manager.fr.mdx)

```mdx
---
slug: texture-manager
title: Texture Manager
year: 2024
category: tech
cover: /projects/texture-manager/cover.jpg
summary: Outil de gestion de textures procédurales pour environnements 3D temps réel.
featured: true
stack: ['TypeScript', 'Three.js', 'React', 'Vite']
repo: https://github.com/tanguynoumea/texture-manager
---

## Contexte

Cette page sera enrichie en Phase 5 du plan portfolio.
```

EN equivalent: same frontmatter, translated `title` and `summary`, English body.

## Runtime State Inventory

Phase 4 is a **greenfield phase** — it adds new files and modifies one (`page.tsx` + `globals.css` + `messages/*.json`). There is no rename, refactor, or migration. **Step 2.5 SKIPPED** — no runtime state inventory needed.

**Exception (worth noting):** Wave 0 D-01 does a `git mv` of `CV_Tanguy_Delrieu_2023.pdf` from repo root to `public/cv-fr.pdf`. This is a file system move tracked by git; no databases, no live services, no OS-registered state references the PDF by path. The Contact section is the only consumer and it ships in Phase 4 simultaneously. No migration risk.

## Environment Availability

Phase 4 has zero new external dependencies. All required tools were installed in earlier phases.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| gsap | Hero/About/Skills GSAP | yes | 3.15.0 | — |
| @gsap/react | useGSAP scope | yes | 2.1.2 | — |
| motion | AnimatePresence/whileHover/layoutId | yes | 12.40.0 | — |
| lenis | Hero CTA scroll | yes | 1.3.23 | — |
| next-intl | i18n + navigation | yes | 4.12.0 | — |
| lucide-react | icons | yes | 1.16.0 | — |
| culori | not needed in components (Phase 2's lib) | yes | 4.0.2 | — |
| shadcn CLI | install badge | yes | 4.8.0 | — |
| Vitest + RTL + jsdom | tests | yes | vitest 4.1.7 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

**Verified by:** `package.json` inspection + `ls node_modules/{gsap,motion,@gsap/react,lenis,lucide-react}` confirms all installed; `node_modules/gsap/dist/SplitText.js` confirms SplitText IS bundled in gsap 3.15 free package.

## Validation Architecture

Workflow `nyquist_validation` is `true` per `.planning/config.json`. This section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 + @testing-library/jest-dom 6.9.1 |
| Config file | `vitest.config.ts` (jsdom + globals + `@/*` alias) |
| Quick run command | `npm test` (alias for `vitest run`) |
| Full suite command | `npm test` + `npm run lint` + `npm run build` |
| Per-component spec command | `npx vitest run components/sections/Hero.test.tsx` |
| Watch | `npm run test:watch` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| HOME-01 | Hero renders name + role + tagline from i18n | unit | `npx vitest run components/sections/Hero.test.tsx` | wave 0 (test file) |
| HOME-01 | Hero CTA calls `lenis.scrollTo` when Lenis available | unit | (same) — mock `useLenis` returning `{ scrollTo: vi.fn() }` | wave 1 |
| HOME-01 | Hero CTA falls back to `scrollIntoView` when Lenis is null | unit | (same) — mock returning null | wave 1 |
| HOME-01 | Hero animation runs through useGSAP scope (motion direction) | smoke | grep `useGSAP\(.*scope: heroRef` in Hero.tsx — structural enforcement | wave 1 |
| HOME-01 | Reduced-motion: SplitText still creates chars, no tween | unit | mock `matchMedia('(prefers-reduced-motion: reduce)')` returning matches=true; assert chars rendered, no `gsap.from()` called (or mock gsap and verify gsap.set is called instead) | wave 1 |
| HOME-01 | No layout shift on font load | manual UAT | browser test in 04-HUMAN-UAT.md | — (manual) |
| HOME-02 | About renders 2-3 paragraphs from `about.paragraphs.{1,2,3}` i18n | unit | `npx vitest run components/sections/About.test.tsx` | wave 0 (test file) |
| HOME-02 | About photo renders with next/image attributes (width, height, alt, blur) | unit | (same) — mock `next/image` as a stub component asserting props | wave 1 |
| HOME-02 | ScrollTrigger.create called with `start: 'top 75%'` | unit | (same) — mock `gsap.timeline` with `scrollTrigger` config; spy on the trigger config | wave 1 |
| HOME-02 | Reduced-motion: paragraphs render but no animation | unit | matchMedia mock; assert gsap.set called, not gsap.timeline | wave 1 |
| HOME-02 | Reveal feel (visual) | manual UAT | scroll the page, observe slide-fade | — (manual) |
| HOME-03 | CategoryFilter renders 4 buttons with i18n labels | unit | `npx vitest run components/sections/CategoryFilter.test.tsx` | wave 0 (test file) |
| HOME-03 | Active button has `aria-checked="true"`, others `false` | unit | (same) | wave 2 |
| HOME-03 | Click on inactive button calls `onChange` with target value | unit | (same) — fireEvent.click + assertion | wave 2 |
| HOME-03 | motion layoutId="filter-indicator" present on active button | smoke | grep `layoutId="filter-indicator"` in CategoryFilter.tsx — structural | wave 2 |
| HOME-03 | Default = `'all'` selected | unit | (same) | wave 2 |
| HOME-04 | ProjectCard renders cover, title, year, category badge with correct variant | unit | `npx vitest run components/sections/ProjectCard.test.tsx` | wave 0 (test file) |
| HOME-04 | ProjectCard wraps in `<Link>` from `@/i18n/navigation` → href `/projects/{slug}` | unit | (same) — mock the Link component, assert href prop | wave 2 |
| HOME-04 | ProjectCard footer shows correct metadata per category (stack vs tools vs software+scale) | unit | (same) — 3 tests, one per category | wave 2 |
| HOME-04 | Hover: motion whileHover with scale 1.02 (NOT applied when reducedMotion=true) | unit | (same) — mock `useReducedMotion`; assert prop value | wave 2 |
| HOME-04 | aria-label includes project title for screen readers | unit | (same) | wave 2 |
| HOME-05 | ProjectGrid renders all projects when no filter | unit | `npx vitest run components/sections/ProjectGrid.test.tsx` | wave 0 (test file) |
| HOME-05 | ProjectGrid filters correctly when projects prop is subset | unit | (same) — pass 2 projects, assert 2 cards rendered | wave 2 |
| HOME-05 | Empty state renders when projects=[] | unit | (same) — `projects.empty` text + SearchX icon | wave 2 |
| HOME-05 | AnimatePresence mode="popLayout" present | smoke | grep `mode="popLayout"` in ProjectGrid.tsx — structural | wave 2 |
| HOME-05 | layout shift smooth (filter feel) | manual UAT | filter All → Tech → BIM → All, observe transitions | — (manual) |
| HOME-05 | ProjectsSection lifts filter state, passes to CategoryFilter + ProjectGrid | unit | `npx vitest run components/sections/ProjectsSection.test.tsx` | wave 2 |
| HOME-05 | useMemo filter selector returns correct subset for each category | unit | (same) — 4 tests | wave 2 |
| HOME-06 | Skills renders 3 group sub-headings from i18n | unit | `npx vitest run components/sections/Skills.test.tsx` | wave 0 (test file) |
| HOME-06 | Each group renders badges from `skills.groups.{tech,design,bim}.items` arrays | unit | (same) — 3 tests | wave 1 |
| HOME-06 | Badge variant matches group (`category-tech` etc.) | unit | (same) — DOM has correct className/variant | wave 1 |
| HOME-06 | useGSAP creates ScrollTrigger with start='top 75%' | unit | (same) — mock gsap, assert config | wave 1 |
| HOME-06 | Reduced-motion: badges rendered at final state, no animation | unit | (same) | wave 1 |
| HOME-07 | Contact renders email button with EMAIL constant | unit | `npx vitest run components/sections/Contact.test.tsx` | wave 0 (test file) |
| HOME-07 | Click email button calls `navigator.clipboard.writeText(EMAIL)` | unit | (same) — mock clipboard.writeText | wave 1 |
| HOME-07 | After successful copy, Copy icon swaps to Check + label "Address copied!" | unit | (same) — awaitable, assert state after click | wave 1 |
| HOME-07 | Clipboard rejection is silent (no console, no thrown error) | unit | (same) — mock clipboard.writeText returning rejected Promise; assert no console | wave 1 |
| HOME-07 | 3 social links present with correct hrefs (GITHUB_URL, LINKEDIN_URL, mailto:EMAIL) | unit | (same) — query by aria-label | wave 1 |
| HOME-07 | 2 CV PDF buttons render with `<a href="/cv-{locale}.pdf" download="...">` | unit | (same) | wave 1 |
| HOME-07 | CV button click actually downloads (browser-level) | manual UAT | click in browser, confirm download | — (manual) |
| HOME-07 | Clipboard works on HTTPS deployed site | manual UAT | click after Vercel deploy | — (manual) |
| (cross) | Wave 0 page.tsx wires `<Hero />`, `<About />`, `<ProjectsSection projects={projects} />`, `<Skills />`, `<Contact />` correctly | unit | `npx vitest run app/[locale]/page.test.tsx` | wave 0 (test file) |
| (cross) | i18n FR/EN parity preserved after adding new keys | unit | augment existing parity check script `scripts/check-i18n-parity.ts` if exists, OR add the comparison as a unit test | wave 0 |
| (cross) | No hex/rgb/hsl/oklch literals in `components/sections/**/*.tsx` | smoke | grep gate during phase verify | wave 0 (script if not exists) |
| (cross) | `npm run build` succeeds | smoke | `npm run build` — exit 0 | every wave merge |
| (cross) | `npm run lint` clean | smoke | `npm run lint` — exit 0 | every wave merge |

### Sampling Rate

- **Per task commit:** `npx vitest run components/sections/{component}.test.tsx` (sub-30s, scoped to file)
- **Per wave merge:** `npm test` (full Vitest suite — ~137 prior + new Phase 4 tests; budget ~10-20s)
- **Phase gate:** `npm test` + `npm run lint` + `npm run build` + visual UAT for the items marked "manual UAT"

### Wave 0 Gaps

Wave 0 MUST seed these new test files (each as a failing-test-first TDD harness for Wave 1+2 to implement):

- [ ] `components/sections/Hero.test.tsx` — covers HOME-01
- [ ] `components/sections/About.test.tsx` — covers HOME-02
- [ ] `components/sections/CategoryFilter.test.tsx` — covers HOME-03
- [ ] `components/sections/ProjectCard.test.tsx` — covers HOME-04
- [ ] `components/sections/ProjectGrid.test.tsx` — covers HOME-05 (grid)
- [ ] `components/sections/ProjectsSection.test.tsx` — covers HOME-05 (filter state)
- [ ] `components/sections/Skills.test.tsx` — covers HOME-06
- [ ] `components/sections/Contact.test.tsx` — covers HOME-07

Optional (cross-cutting):
- [ ] `app/[locale]/page.test.tsx` — proves page.tsx composition wires the 5 components correctly
- [ ] `scripts/check-i18n-parity.ts` augmentation OR new `messages/parity.test.ts` to assert FR/EN key set is identical post-D-19 additions

**Framework install:** None — Vitest + RTL + jsdom + jest-dom + user-event all installed since Phase 2 W0.

## Open Questions

1. **MDX stub body content for Phase 5 to expand later.** Phase 4 ships 1-2 paragraphs per locale per stub. Phase 5 expands. Recommendation: write a placeholder sentence "This page will be enriched in Phase 5 of the portfolio plan." in both locales — same pattern as `_template`. No blocker.

2. **Skill list length: 7 items vs 5-6.** D-19 recommends 7 but flags discretion. Recommendation: ship 7 items per group; trim post-UAT if visual density is too high (cheap change to messages JSON).

3. **About bio body — exact paragraph count: 2 or 3?** D-11 says "2-3 paragraphs". Recommendation: 2 paragraphs in i18n keys `about.paragraphs.1` and `about.paragraphs.2`. Allow the planner to add `paragraphs.3` if needed during visual review.

4. **CategoryFilter: A11y — radiogroup vs button group?** Two valid patterns:
   - **`role="radiogroup"` + `role="radio" aria-checked={isActive}`** — semantically correct (mutually exclusive filter is a radio group)
   - **No role override + `aria-pressed={isActive}` on buttons** — Phase 3 LanguageSwitcher D-20 uses this; matches existing precedent
   
   Recommendation: **Follow Phase 3 LanguageSwitcher precedent** — `aria-pressed`. Lower behavior risk, screen-reader tested via Phase 3. Trade-off: radio-group is more technically accurate but aria-pressed is the project's established pattern.

5. **Should CategoryFilter pre-include category counts ("Tech (2)")?** FEATURES.md research P1 suggests yes. CONTEXT.md D-13 doesn't mention counts. Recommendation: defer to Phase 6 (polish) — Phase 4 ships pure labels.

**All non-blocking in --auto mode.** Planner picks defaults consistent with prior phase conventions.

## Recommended Plan Structure

Confirms D-23 — 6 plans across 3 waves. Validated by checking file-touch overlap.

### Wave 0 — Asset Prep + Wiring (~25 min)
**Plan 04-00-assets-and-stubs-PLAN.md** — single-author. Must complete before Wave 1.

Touches:
- `CV_Tanguy_Delrieu_2023.pdf` → `public/cv-fr.pdf` (git mv)
- `public/cv-en.pdf` (cp from cv-fr.pdf)
- `public/about-photo.jpg` (new)
- `public/projects/{texture-manager,agora,brand-system,editorial-grid,tower-concept,residential-renovation}/cover.jpg` (6 new files, all same placeholder JPEG)
- `content/projects/{slug}.{fr,en}.mdx` (12 new MDX files)
- `lib/constants.ts` (new)
- `app/globals.css` (add 3 category tokens to `:root` AND `@theme inline`)
- `messages/fr.json` + `messages/en.json` (add `about.paragraphs.{1,2}`, `skills.groups.{tech,design,bim}.items[]`, optionally `hero.scrollCue`)
- `components/ui/badge.tsx` (install via shadcn CLI + customize CVA variants)
- `app/[locale]/page.tsx` (wire `<Hero />`, `<About />`, `<ProjectsSection projects={projects} />`, `<Skills />`, `<Contact />` + server-load `getProjects(locale)`)
- 8-9 new test files (failing harnesses — TDD seed for Wave 1+2)

### Wave 1 — Parallel sections (~30 min each, 4 plans in parallel — ~30 min wall clock)

ZERO file-touch overlap between these four plans. Each owns its component file + test file + maybe one i18n key:

**Plan 04-01-hero-PLAN.md** — Hero with GSAP SplitText.
Files: `components/sections/Hero.tsx`, `components/sections/Hero.test.tsx` only.

**Plan 04-02-about-PLAN.md** — About section with photo + bio + ScrollTrigger.
Files: `components/sections/About.tsx`, `components/sections/About.test.tsx` only. The `about.paragraphs.*` i18n keys were added in Wave 0 (the parallelism guarantee requires Wave 0 to seed all i18n keys this wave consumes).

**Plan 04-04-skills-PLAN.md** — Skills section with 3 group flex-wrap + GSAP stagger.
Files: `components/sections/Skills.tsx`, `components/sections/Skills.test.tsx` only. `skills.groups.*.items` from Wave 0.

**Plan 04-05-contact-PLAN.md** — Contact section.
Files: `components/sections/Contact.tsx`, `components/sections/Contact.test.tsx` only. Imports from `lib/constants.ts` (Wave 0).

**Wave 1 parallelism guarantee:** Verified — none of these touch `page.tsx`, `globals.css`, `messages/*.json`, or each other. All i18n keys + assets pre-seeded in Wave 0.

### Wave 2 — Projects bundle (~50 min)

**Plan 04-03-projects-PLAN.md** — CategoryFilter + ProjectCard + ProjectGrid + ProjectsSection composer. Tightly coupled; bundled.

Files:
- `components/sections/CategoryFilter.tsx` + `.test.tsx`
- `components/sections/ProjectCard.tsx` + `.test.tsx`
- `components/sections/ProjectGrid.tsx` + `.test.tsx`
- `components/sections/ProjectsSection.tsx` + `.test.tsx`

Depends on:
- Wave 0 MDX stubs (need projects to render)
- Wave 0 `<Badge>` install + category variants (needed for ProjectCard category badge)
- Wave 0 category color tokens in globals.css (Badge consumes them)
- Wave 0 `app/[locale]/page.tsx` already wired to pass `projects` prop (Wave 0 prepared the structure; Wave 2 plugs in the component)

**Total estimated wall clock: ~25 + 30 + 50 = ~105 minutes ≈ 1h45min** (with 4-way parallelism in Wave 1).

Falls within the 3h budget D-23 cited.

## State of the Art

| Old Approach | Current (2026) Approach | When Changed | Impact |
|--------------|------------------------|--------------|--------|
| `useEffect(() => { gsap.from(...) }, [])` | `useGSAP({ scope: ref })` from `@gsap/react@2.x` | 2024 (@gsap/react release) | Strict Mode safe, auto-cleanup of animations + ScrollTriggers + SplitText. Required pattern. |
| `import { motion, AnimatePresence } from 'framer-motion'` | `import { motion, AnimatePresence } from 'motion/react'` | 2024-2025 (rebrand) | API identical; `framer-motion` is now legacy. `motion/react` re-exports `framer-motion` internally. |
| Manual `<span>` per char wrapping | `new SplitText(selector, { type: 'chars' })` (GSAP free since Apr 2025) | Apr 2025 (Webflow acquisition) | SplitText now free for commercial use. Cleanup via `split.revert()` or auto via `useGSAP`. |
| `document.execCommand('copy')` | `navigator.clipboard.writeText(text)` | Long since (execCommand deprecated since ~2018) | Promise-based, async, requires HTTPS or localhost. |
| `tailwindcss-animate` for keyframe utilities | `tw-animate-css` (Tailwind v4) | Tailwind v4 release Jan 2025 | Already in globals.css line 2 (Phase 1+2). Phase 4 doesn't add new keyframe utilities. |
| Pinned horizontal scroll on Projects (GSAP `pin: true`) | Standard responsive grid with `AnimatePresence popLayout` filter | 2026 consensus (mobile fragility + scroll-jacking concerns) | OOS per REQUIREMENTS.md L120. FEATURES.md flags as anti-feature. Already deferred. |

**Deprecated/outdated:**

- `framer-motion` as a direct dependency name → replaced by `motion`. Old name still works but ships as legacy.
- `@studio-freight/lenis` and `@studio-freight/react-lenis` → both retired; project uses `lenis` correctly since Phase 3.
- `Github`, `Linkedin`, `Twitter` lucide icons → removed from lucide-react v1.0. Phase 3 + Phase 4 use `Code2`, `Briefcase`, `Mail` substitutions.
- GSAP "Club" paywall → fully removed Apr 2025. Premium plugins (SplitText, MorphSVG, etc.) all in public npm package.

## Sources

### Primary (HIGH confidence)

- **GSAP SplitText official docs** — https://gsap.com/docs/v3/Plugins/SplitText/ — confirmed via WebFetch: registration pattern `gsap.registerPlugin(SplitText)`, `type: "chars,words,lines"`, `aria: "auto"` default behavior, `split.revert()` cleanup contract. (HIGH)
- **@gsap/react useGSAP official docs** — https://gsap.com/resources/React/ — confirmed via WebFetch: useGSAP auto-cleans animations, ScrollTriggers, AND SplitText instances; `gsap.matchMedia()` works inside callback. (HIGH)
- **GSAP types verified locally** — `node_modules/gsap/types/split-text.d.ts` — confirmed SplitText is bundled in gsap@3.15.0, exports `SplitText.create(target, vars)` static method + instance `revert()`, `kill()`, `split(vars)`. (HIGH)
- **motion 12.40 React types** — `node_modules/motion/dist/react.d.ts` — confirmed `motion/react` re-exports framer-motion 12.x (`export * from 'framer-motion'; export { m, motion } from 'framer-motion'`). All Phase 4 hooks (`AnimatePresence`, `useReducedMotion`, `useMotionValue`) available. (HIGH)
- **culori wcagContrast verified locally** — computed via `node` REPL on the 3 candidate category colors vs 5 palette backgrounds; v1 candidates (Tech `oklch(0.55 0.15 240)`, Design `oklch(0.65 0.20 330)`, BIM `oklch(0.60 0.13 60)`) ALL pass 3:1 against all 5 backgrounds with margin. (HIGH)
- **Phase 3 LenisProvider source** — confirmed `gsap.registerPlugin(ScrollTrigger)` at module scope, `lenis.on('scroll', ScrollTrigger.update)` bridge, `ScrollTrigger.refresh()` on init + on paletteId change + on `document.fonts.ready`. Phase 4 inherits this — no additional Lenis/GSAP plumbing needed. (HIGH — Phase 3 shipped 137/137 tests.)
- **Phase 3 LanguageSwitcher source** — `components/layout/LanguageSwitcher.tsx` proven implementation of motion `layoutId` + `useRouter().replace` + scroll preservation. CategoryFilter copies the layoutId pattern. (HIGH — Phase 3 shipped.)
- **`lib/projects.ts` discriminated union + filter** — confirmed `getProjects(locale)` filters `_*` files, validates frontmatter for each variant, throws on shape mismatch. Phase 4 stubs MUST match `TechProject` / `DesignProject` / `BIMProject` exactly. (HIGH — Phase 1 shipped, tested.)
- **`@/i18n/navigation` Link** — confirmed `components/layout/LanguageSwitcher.tsx` and Phase 3 RESEARCH.md §4 establish `import { Link, useRouter, usePathname } from '@/i18n/navigation'` as the canonical locale-aware import. (HIGH)
- **Next.js Image docs** — https://nextjs.org/docs/app/api-reference/components/image — confirmed `placeholder="blur"`, `priority` flag, explicit `width`/`height` for CLS, automatic AVIF/WebP negotiation. (HIGH — bundled with Next 16.)
- **MDN Clipboard API** — `navigator.clipboard.writeText()` requires secure context (HTTPS/localhost). Vercel = HTTPS by default. Silent failure pattern is industry standard. (HIGH — MDN reference.)
- **HTML download attribute spec** — `<a href download="...">` works for same-origin static assets without CORS. PDFs in `public/` are same-origin. (HIGH — MDN reference.)

### Secondary (MEDIUM confidence, cross-referenced with HIGH)

- **PITFALLS.md Pitfall 5 + 6** (project-internal research) — useGSAP cleanup contract + AnimatePresence mode strategies. Already cross-verified with @gsap/react official docs (HIGH). (MEDIUM, corroborated.)
- **ARCHITECTURE.md Pattern 5** (project-internal research) — Lenis + GSAP single-RAF integration. Already implemented and verified by Phase 3 LenisProvider (137/137 tests). (MEDIUM, corroborated.)
- **FEATURES.md** (project-internal research) — SplitText is "baseline polish in 2026, not differentiator" — sets expectation that Hero's value is the content + role + tagline, not the SplitText effect. (MEDIUM — research synthesis.)

### Tertiary (No LOW confidence findings — all critical claims verified)

None. All Phase-4-critical claims (GSAP free, SplitText auto-revert, ScrollTrigger no-scrollerProxy under Lenis 1.x, motion 12.40 API, clipboard secure context) are HIGH-confidence with primary source verification.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every library + version verified via `npm view` + `node_modules` inspection
- Architecture patterns: HIGH — patterns are direct application of Phase 3 precedent + Context7-verified GSAP/motion APIs
- Pitfalls: HIGH — Phase-specific risks derived from already-proven Phase 3 issues + general PITFALLS.md (multiple sources)
- Category colors WCAG: HIGH — computed via culori wcagContrast, verified all 3 candidates pass 3:1 against all 5 palettes
- Plan structure: HIGH — D-23 from CONTEXT.md, parallelism guarantee verified by file-touch audit
- Test architecture: HIGH — Vitest infrastructure already proven (137/137 in Phase 3); test patterns mirror Phase 3 LanguageSwitcher / Footer / CustomCursor

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (30 days — stack is mature, APIs stable). After this date, re-verify `npm view gsap @gsap/react motion lenis lucide-react version` in case patch updates shift behavior.

## RESEARCH COMPLETE
