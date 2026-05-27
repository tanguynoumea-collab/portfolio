# Phase 4: Homepage Sections - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning
**Mode:** `--auto` (Claude picked recommended defaults; selections logged inline in `<decisions>`)

<domain>
## Phase Boundary

Fill the 5 placeholder section shells from Phase 3 with the actual homepage experience: Hero (GSAP SplitText reveal), About (photo + bio with ScrollTrigger), CategoryFilter (4-button hybrid filter), ProjectCard (hover micro-interaction), Projects grid (motion `AnimatePresence mode="popLayout"`), Skills (GSAP stagger by category), and Contact (email copy-to-clipboard + CV PDF downloads).

Delivers REQ **HOME-01..07** (7 requirements). Concretely:

- `components/sections/Hero.tsx` — `useGSAP({ scope })` SplitText char stagger for name + bilingual role; CTA → `#projects`.
- `components/sections/About.tsx` — photo (next/image with priority=false, lazy) + 2-3 paragraph bio + ScrollTrigger fade+Y reveal under `useGSAP()`.
- `components/sections/CategoryFilter.tsx` — 4 pill buttons (All / Tech / Design / BIM) with motion `layoutId="filter-indicator"` active background; React state lifted by parent.
- `components/sections/ProjectCard.tsx` — domain-coded category badge + cover image (next/image), motion hover (scale 1.02 + image saturation + accent border + arrow translate-x), `<Link>` from `@/i18n/navigation` to `/{locale}/projects/{slug}`.
- `components/sections/ProjectGrid.tsx` — `motion.div` parent with `AnimatePresence mode="popLayout"` wrapping the filtered cards; empty state when filter returns 0; responsive 1/2/3 column.
- `components/sections/Skills.tsx` — 3 groups (skills.groups.tech/design/bim already in i18n) × badges (use shadcn Badge installed in 04-00), GSAP timeline with stagger ≤80ms revealed on `ScrollTrigger.create({ trigger, start: 'top 80%' })`.
- `components/sections/Contact.tsx` — email displayed as `<button>` with copy-to-clipboard + motion feedback (checkmark icon swap, 1.5s revert), 3 social links (GitHub / LinkedIn / mailto:), 2 prominent CV download buttons → `/cv-fr.pdf` + `/cv-en.pdf`.
- Asset prep: move `CV_Tanguy_Delrieu_2023.pdf` → `public/cv-fr.pdf` + `public/cv-en.pdf` (EN placeholder until user provides translation), add `public/about-photo.jpg` placeholder, install shadcn `badge` primitive, seed 6 minimal stub MDX projects in `content/projects/` (2 Tech / 2 Design / 2 BIM) — Phase 5 expands these.

**Out of scope for this phase** (already on the v2 list or explicit deferrals):

- Project detail pages (`/{locale}/projects/{slug}`) — Phase 5 (`CONTENT-02`).
- MDX custom components (Image zoom, CodeBlock, Callout) — Phase 5 (`CONTENT-03`).
- Parallax on project images — Phase 5 (`ANIM-02`).
- Scroll horizontal pin on Projects desktop — explicitly OOS per REQUIREMENTS.md (conflicts with `popLayout` filter + breaks mobile gestures).
- Cross-domain combo filter (e.g., "Tech + Design") — flagged as v2 by FEATURES.md research P2.
- 3D model viewer for BIM projects — `BIM-v2-01` deferred.
- Animated background canvas / WebGL hero — flagged as anti-feature in FEATURES.md.
- Contact form backend (Resend / Vercel Function) — `CONTACT-v2-01` deferred; v1 uses `mailto:`.
- Real bio text + photo + email + social URLs — Phase 4 ships placeholders the user replaces before deploy (Phase 7 final pass).
- Lighthouse 90+ audit + axe-core zero-error sweep — Phase 6 (`A11Y-08`, `A11Y-04`).
- Custom 404 page — Phase 6 (`EGG-02`).

</domain>

<decisions>
## Implementation Decisions

### Asset Preparation (Wave 0 — unblocks Hero photo, Projects grid content, Contact CV downloads)

- **D-01:** **Move existing CV PDF to `public/cv-fr.pdf`**. Source = repo-root `CV_Tanguy_Delrieu_2023.pdf` (already on disk from earlier dev). Use `git mv` so history is preserved. Add a `public/cv-en.pdf` as a copy of the FR PDF — placeholder until user provides translated version. Document in deferred ideas.
  - Auto-selected: **[auto] D-01 → recommended (move + EN placeholder)**

- **D-02:** **Placeholder `public/about-photo.jpg`** — committed as a 800×800 JPEG portrait crop. Use a CC0 placeholder (e.g., the Next.js OG image or a procedurally-generated SVG-to-JPEG). User swaps for their real photo pre-deploy. Document in deferred ideas.
  - Auto-selected: **[auto] D-02 → recommended (placeholder + swap note)**

- **D-03:** **Install shadcn `badge` primitive** via `npx shadcn@latest add badge`. Skills section needs badges; ProjectCard's category badge also needs a consistent badge component. Re-uses the existing shadcn aliasing chain — no new color tokens.
  - Auto-selected: **[auto] D-03 → recommended (install badge via shadcn CLI)**

- **D-04:** **Seed 6 minimal stub MDX projects** in `content/projects/{slug}.{fr,en}.mdx` — 2 Tech / 2 Design / 2 BIM. Each stub has:
  - Full discriminated frontmatter (per Phase 1 D-18..D-22) with realistic but placeholder values
  - Cover image path pointing to `public/projects/{slug}/cover.jpg` (we ship a single shared placeholder cover for all 6, repeated)
  - 1-2 paragraph body — Phase 5 expands these
  
  **Slugs** (planner picks final names, recommendations):
  - Tech: `texture-manager`, `agora` (already mentioned in REQUIREMENTS.md CONTENT-01)
  - Design: `brand-system`, `editorial-grid`
  - BIM: `tower-concept`, `residential-renovation`
  
  Each slug → 2 files (fr + en) → 12 MDX files seeded. They DON'T leak through the `_*` filter (no underscore prefix). They DO appear in `getProjects()` output.
  - Auto-selected: **[auto] D-04 → recommended (6 stub MDX projects with placeholder content)**

- **D-05:** **Shared placeholder cover image** at `public/projects/_placeholder-cover.jpg` (with `_` prefix so it's clearly placeholder; OR per project: `public/projects/{slug}/cover.jpg` — both copy the same JPEG). Planner picks: recommend per-project paths so Phase 5 can replace individually without retouching every MDX file.
  - Auto-selected: **[auto] D-05 → recommended (per-project cover paths, all share one placeholder JPEG initially)**

- **D-06:** **`lib/constants.ts`** for swappable user-specific values: `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL`. Hero/Footer/Contact all import from this. User swaps these 3 constants before deploy (Phase 7).
  - Initial values:
    - `EMAIL = 'tanguy@example.com'` (placeholder — flag in deferred)
    - `GITHUB_URL = 'https://github.com/tanguynoumea/portfolio'` (matches Footer + ConsoleArt from Phase 3)
    - `LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu'` (placeholder — flag in deferred)
  - Auto-selected: **[auto] D-06 → recommended (centralized lib/constants.ts)**

### Hero Section (HOME-01)

- **D-07:** **Hero layout — centered, name big, role below, tagline, CTA + scroll cue.**
  - Vertical stack centered, min-h-screen minus nav height.
  - Name "Tanguy" — `text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-foreground`. GSAP SplitText splits into chars.
  - Role "Tech × Design × BIM" — `text-2xl md:text-3xl text-accent` (uses `var(--color-accent)` via `text-primary` shadcn alias). Same SplitText timeline, delayed.
  - Tagline (existing `hero.tagline` i18n) — `text-lg text-muted-foreground max-w-2xl`.
  - CTA button (shadcn `<Button>`, existing `hero.cta` i18n key "Découvrir mon travail" / "Discover my work") — scrolls to `#projects` via Lenis `useLenis()?.scrollTo('#projects')` with fallback `document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })`.
  - Scroll cue: subtle Lucide `ChevronDown` icon below the CTA, motion gentle bounce (`animate={{ y: [0, 8, 0] }}` 2s loop, reduced-motion → static).
  - Auto-selected: **[auto] D-07 → recommended (centered stack, sized scale, single CTA + bounce cue)**

- **D-08:** **SplitText animation pattern.**
  - Use `gsap.SplitText` (free since Apr 2025, bundled in gsap@3.13+).
  - Split BOTH the name and role into chars (preferred) or words. Recommend chars for "Tanguy" (6 chars, dramatic) and chars for "Tech × Design × BIM" (16 chars + 2 separators, more granular).
  - Stagger: 0.04s per char for name, 0.025s per char for role. Total Hero reveal completes in <1.2s.
  - Animation: `{ opacity: 0, y: 24 }` → `{ opacity: 1, y: 0 }`, duration 0.5s per char, `ease: 'power3.out'`.
  - Tagline: simple opacity fade after both stagger timelines complete (delay 0.8s).
  - CTA + scroll cue: fade-in last (delay 1.0s).
  - Reduced-motion: SplitText still runs structurally but `gsap.set(target, { opacity: 1, y: 0 })` skips the tween — text appears instantly. Implement via `gsap.matchMedia()`.
  - Auto-selected: **[auto] D-08 → recommended (char-by-char SplitText with cascaded delays)**

- **D-09:** **`useGSAP({ scope })`** with a ref to the hero `<section>`. Cleanup is automatic. Required pattern per PROJECT.md Key Decisions.
  - Auto-selected: **[auto] D-09 → recommended (useGSAP scoped)**

- **D-10:** **Above-the-fold guarantee** — no layout shift on font load. Inter is already preloaded by Phase 3 D-09 (`display: 'swap'` + `preload: true`). SplitText doesn't run until React hydration so the initial paint shows the static text via SSR; the animation reveals on mount. No FOUC because the initial state IS the final state (with `gsap.set` before tween, applied in `useGSAP` which runs in `useLayoutEffect` semantically).
  - Auto-selected: **[auto] D-10 → recommended (SSR-stable initial state + gsap.set pre-tween)**

### About Section (HOME-02)

- **D-11:** **Two-column desktop / stacked mobile layout.**
  - Desktop (`md+`): photo left (1/3 width), bio right (2/3 width). Centered vertically.
  - Mobile: photo top (full width, max-w-sm, centered), bio below.
  - Photo: `next/image` with `width={400}` `height={500}` (3:4 portrait), `priority={false}` (below the fold), `loading="lazy"`, `placeholder="blur"` with blurDataURL.
  - Bio: 2-3 paragraphs from new i18n keys `about.paragraphs.1/2/3` (FR + EN) — Phase 4 ships placeholder text, user swaps. Tone: hybrid Tech × Design × BIM profile, creative-but-grounded.
  - Auto-selected: **[auto] D-11 → recommended (2-col desktop / stacked mobile)**

- **D-12:** **ScrollTrigger fade-in reveal.**
  - `useGSAP({ scope: aboutRef })` inside `'use client'` component.
  - Photo: `from: { opacity: 0, x: -40 }` (slide-from-left).
  - Bio paragraphs: stagger 0.15s, `from: { opacity: 0, y: 30 }`.
  - Trigger: `ScrollTrigger.create({ trigger: aboutRef, start: 'top 75%', toggleActions: 'play none none reverse' })` — plays when section is 25% into viewport.
  - Reduced-motion: `gsap.matchMedia()` skip — elements render at final state immediately.
  - Auto-selected: **[auto] D-12 → recommended (slide-fade reveal under matchMedia)**

### Projects Grid (HOME-03 + HOME-04 + HOME-05 — bundled because tightly coupled)

- **D-13:** **CategoryFilter as a controlled segmented control.**
  - 4 pill buttons in a row: `All` / `Tech` / `Design` / `BIM` (i18n keys already in `projects.filters.*`).
  - State lifted: `useState<Category | 'all'>` in the parent `<ProjectsSection>` component; CategoryFilter receives `active` + `onChange` props.
  - Active button: `<motion.span layoutId="filter-indicator">` background — same pattern as LanguageSwitcher from Phase 3 D-18.
  - Default = `'all'`.
  - Color coding via inline marker: All = `var(--color-accent)`, Tech = `oklch(0.55 0.15 240)` (cool blue), Design = `oklch(0.65 0.20 330)` (pink/magenta), BIM = `oklch(0.60 0.13 60)` (warm amber). These 3 category colors are NEW design tokens — declared in `app/globals.css` `:root` as `--color-category-tech`, `--color-category-design`, `--color-category-bim`. They are NOT mutated by ThemeProvider — they stay fixed across palettes (per Phase 1 D-12 pattern for `--destructive`).
  - Auto-selected: **[auto] D-13 → recommended (segmented control + lifted state + 3 fixed category tokens)**

- **D-14:** **ProjectCard — card layout + hover micro-interaction.**
  - shadcn `<Card>` wrapper (Phase 1 component).
  - Top: cover image `next/image` (16:10 ratio, blur placeholder).
  - Below image: category badge (top-left absolute over image), year (top-right absolute).
  - Body: title (`text-xl font-semibold`), summary (`text-sm text-muted-foreground line-clamp-2`).
  - Footer row: domain-specific metadata badges (Tech.stack[0..2] / Design.tools[0..2] / BIM.software[0..2] + BIM.projectScale).
  - Hover (motion `whileHover`):
    - Card scale 1.02 (200ms easeOut)
    - Image: brightness 1.05 + saturate 1.1 (CSS filter via Tailwind utility transition)
    - Accent border-color reveal (`border-transparent` → `border-primary`)
    - Arrow icon (Lucide `ArrowUpRight`) translates 4px right + 4px up on hover
  - Reduced-motion: all `whileHover` props omitted via `useReducedMotion()` from `motion/react`.
  - Wrapped in `<Link href={\`/projects/${slug}\`}>` from `@/i18n/navigation` so locale-prefix is automatic and Lenis anchors don't fight.
  - Auto-selected: **[auto] D-14 → recommended (Card + cover + dual-overlay badges + hover stack)**

- **D-15:** **ProjectGrid — responsive grid + AnimatePresence popLayout.**
  - Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
  - Outer: `<motion.div>` with `layout` prop.
  - Inner: `<AnimatePresence mode="popLayout" initial={false}>` wrapping the filtered `projects.map(p => <motion.div key={p.slug} layout exit={{ opacity: 0, scale: 0.9 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>...)`.
  - Empty state: when `filtered.length === 0`, render `<motion.div>` with the `projects.empty` i18n string + a subtle Lucide `SearchX` icon centered, fade-in.
  - Auto-selected: **[auto] D-15 → recommended (1/2/3 col + popLayout + scale-fade exit/enter)**

- **D-16:** **Filtering logic.**
  - `useMemo(() => projects.filter(p => active === 'all' || p.category === active), [projects, active])`.
  - Projects are loaded server-side via `getProjects(locale)` in the locale page (Server Component) and passed as a prop to the `<ProjectsSection>` Client Component.
  - Auto-selected: **[auto] D-16 → recommended (useMemo + server-loaded + client-filtered)**

### Skills Section (HOME-06)

- **D-17:** **3 group layout.**
  - `<section id="skills">` already exists from Phase 3.
  - Title: "Compétences" / "Skills" (existing `skills.title` i18n).
  - 3 sub-headings stacked: `skills.groups.tech` / `skills.groups.design` / `skills.groups.bim`.
  - Each group: `flex flex-wrap gap-2 mt-3` row of `<Badge>` (shadcn, installed in D-03).
  - Badge variants for each category use the same fixed category tokens from D-13 (Tech / Design / BIM colors). Add `badge variant=category-tech|category-design|category-bim` via the existing CVA pattern shadcn uses.
  - Badge content: skill names (initial set per category, see specifics).
  - Auto-selected: **[auto] D-17 → recommended (3 group flex-wrap with category-colored badges)**

- **D-18:** **GSAP stagger entrance.**
  - `useGSAP({ scope: skillsRef })`.
  - Each badge: `from: { opacity: 0, y: 16, scale: 0.9 }`, stagger 0.05s within each group, group-to-group stagger 0.15s.
  - Trigger: ScrollTrigger `start: 'top 75%'`.
  - Reduced-motion: skip via `gsap.matchMedia()`.
  - Auto-selected: **[auto] D-18 → recommended (per-badge stagger + group cascade)**

- **D-19:** **i18n keys for skills.**
  - New keys: `skills.groups.tech.items[]`, `skills.groups.design.items[]`, `skills.groups.bim.items[]`. Each is an array of skill names.
  - Recommended initial items (FR — EN parity required):
    - Tech: `TypeScript`, `React`, `Next.js`, `Node.js`, `Tailwind`, `GSAP`, `Three.js`
    - Design: `Figma`, `Photoshop`, `Illustrator`, `InDesign`, `Design System`, `Branding`, `Typography`
    - BIM: `Revit`, `ArchiCAD`, `Rhino`, `Grasshopper`, `AutoCAD`, `Twinmotion`, `Lumion`
  - User edits these post-Phase 4. The list is centralized in messages JSON, not hardcoded in the component.
  - Auto-selected: **[auto] D-19 → recommended (i18n-driven skill arrays with realistic-but-swappable defaults)**

### Contact Section (HOME-07)

- **D-20:** **Email row with copy-to-clipboard.**
  - Display: `<button>` containing `<span class="font-mono">{EMAIL}</span>` + Lucide `Copy` icon (or `Mail`).
  - Click: `navigator.clipboard.writeText(EMAIL)`. On success: motion `<AnimatePresence>` swap of icon (`Copy` → `Check`) + tooltip-style label "Adresse copiée !" / "Address copied!" (existing `contact.emailCopied` i18n) for 1.5s, then revert.
  - On failure: silent — same defensive-pattern as Phase 2 D-02. (Could add a deferred retry button as v2.)
  - Auto-selected: **[auto] D-20 → recommended (button + clipboard + motion icon swap + 1.5s revert)**

- **D-21:** **Social links row.**
  - 3 buttons (or `<a>`-styled-as-button) in a row: GitHub / LinkedIn / Email (mailto:).
  - Each: lucide icon (Github → Code2 due to lucide-react v1.x removal of brand icons per Phase 3 D-23; or use simple-icons fallback if available; for simplicity, reuse Phase 3 substitutions: Code2 / Briefcase / Mail).
  - aria-label localized via existing `contact.social.*` i18n keys.
  - target="_blank" rel="noopener noreferrer" for GitHub + LinkedIn; mailto: for email.
  - Auto-selected: **[auto] D-21 → recommended (3-button row reusing Phase 3 lucide substitutions)**

- **D-22:** **CV PDF download buttons.**
  - 2 prominent buttons side-by-side (stacked on mobile):
    - Button 1: "Télécharger le CV (FR)" (from existing `contact.cv.fr` i18n) → `href="/cv-fr.pdf" download="CV_Tanguy_Delrieu_FR.pdf"` + Lucide `FileDown` icon.
    - Button 2: "Download CV (EN)" (from `contact.cv.en`) → `href="/cv-en.pdf" download="CV_Tanguy_Delrieu_EN.pdf"` + same icon.
  - Both labeled and accessible. shadcn `<Button variant="default">` for FR (primary visual), `<Button variant="outline">` for EN (secondary).
  - Auto-selected: **[auto] D-22 → recommended (2 prominent buttons FR primary / EN outline)**

### Plan Structure & Wave Topology

- **D-23:** **6 plans across 3 waves:**
  - **Wave 0** (independent prerequisites): `04-00-assets-and-stubs-PLAN.md` — git-mv CV PDF + add placeholder photo + add 6 stub MDX files + add `lib/constants.ts` + add 3 fixed category color tokens to globals.css + install shadcn badge primitive.
  - **Wave 1** (parallel — all 4 are independent sections, none touch each other's files):
    - `04-01-hero-PLAN.md` — Hero with GSAP SplitText
    - `04-02-about-PLAN.md` — About with photo + scroll reveal
    - `04-04-skills-PLAN.md` — Skills with GSAP stagger + new i18n arrays
    - `04-05-contact-PLAN.md` — Contact with copy-to-clipboard + CV buttons
  - **Wave 2** (depends on Wave 0 stubs): `04-03-projects-PLAN.md` — CategoryFilter + ProjectCard + ProjectGrid (HOME-03+04+05 bundled). Needs the MDX stubs from W0 so the grid renders projects.
  - Auto-selected: **[auto] D-23 → recommended (6 plans / 3 waves)**

### Claude's Discretion

Decisions deferred to the researcher/planner (enough signal exists to choose well):

- Exact placeholder photo source (CC0 stock image, AI-generated SVG, or simple gradient PNG). Recommendation: a 800×800 abstract gradient + initial "T" SVG — recognizable as placeholder, never embarrassing if accidentally deployed.
- Exact placeholder cover image content (single shared JPEG for all 6 project covers initially, swapped per-project later). Recommendation: an abstract Bauhaus-style geometric composition matching the project's category color.
- Exact 3 category color OKLCh values (planner can refine via WCAG contrast check against all 5 palettes — must pass 3:1 UI contrast minimum on the lightest preset background).
- Initial bio paragraph text (FR + EN) — planner writes plausible 2-paragraph placeholder; user swaps post-Phase 4.
- Whether to add a "View all projects" link below the grid (deferred; only meaningful when there are >6 projects, currently we ship 6).
- Whether the Hero CTA uses `lenis.scrollTo('#projects', { offset: -navHeight })` or just `scrollIntoView`. Recommendation: prefer `useLenis()` access pattern; fallback to scrollIntoView under reduced-motion.
- Hover animation timing — 200ms vs 300ms. Planner can A/B against feel.
- ProjectCard arrow icon — `ArrowUpRight` vs `ArrowRight` vs `MoveUpRight`. Recommendation: `ArrowUpRight` (signals "external action" without literally being external).
- ScrollTrigger `start` thresholds — `'top 75%'` vs `'top 80%'`. Planner tunes.
- Skill list pruning — 7 items per category is the suggested starting point; planner can trim to 5-6 per group if visual density is too high.
- Whether to expose the placeholder data as a `dev` flag visible in dev mode only. Recommendation: no — stubs are committed as real content (Phase 5 expands), and "PLACEHOLDER" markers aren't necessary at this stage.

### Folded Todos

None — `gsd-tools todo match-phase 4` returned `todo_count: 0`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, Key Decisions (esp. useGSAP() everywhere, OKLCh, Server Components default), Validated Phase 3 block (Inter + provider tree + LenisProvider)
- `.planning/REQUIREMENTS.md` §"Homepage Sections" (HOME-01..07), §"Out of Scope" (Cursor takeover, scroll-jacking, autoplay sound — drives Contact + Hero constraints)
- `.planning/ROADMAP.md` §"Phase 4: Homepage Sections" (goal + 5 success criteria + depends on Phase 3)
- `.planning/STATE.md` — Phase 3 just completed; 137/137 tests; LenisProvider + chrome shipped

### Prior phase context
- `.planning/phases/01-foundations/01-CONTEXT.md` — Discriminated Project type (D-18..D-22), MDX loader convention, `_*` filter (D-23..D-24)
- `.planning/phases/02-palette-system/02-CONTEXT.md` — ThemeProvider `usePalette()` API, fixed `--destructive` precedent (D-12 — same pattern for 3 fixed category tokens in this phase)
- `.planning/phases/03-layout-animation-foundation/03-CONTEXT.md` — Provider tree D-11 (LenisProvider wraps Phase 4 sections), useGSAP via @gsap/react (D-09 reuse), `useLenis()` returns null contract (Hero CTA must null-check), category badge precedent for motion `layoutId` (Phase 3 D-18 LanguageSwitcher)

### Research synthesis (MANDATORY pre-read for downstream agents)
- `.planning/research/FEATURES.md` §"Filterable Projects grid" (HOME-05 differentiator), §"GSAP SplitText" ("baseline polish in 2026, not differentiator — content matters more"), §"Downloadable CV PDF" (HOME-07 essential), §"Scroll-jacking anti-pattern" (drives ScrollTrigger usage — no `pin` on Projects)
- `.planning/research/ARCHITECTURE.md` §"Pattern 5: Lenis + GSAP single-RAF" (Hero/About/Skills useGSAP must register inside this scope), §"Server vs Client component split" (sections that need GSAP/motion = client; sections that just render content = server when possible)
- `.planning/research/PITFALLS.md` §"Pitfall 4: Lenis breaks anchors / ScrollTrigger" (Hero CTA scroll, About/Skills ScrollTrigger triggers), §"Pitfall 5: GSAP re-runs" (useGSAP scoped to ref, no leaked listeners)
- `.planning/research/STACK.md` — gsap (incl. SplitText free since Apr 2025), motion, next/image, lucide-react

### External docs (downstream researcher fetches via context7)
- **GSAP SplitText** — split by chars/words, callback into timeline, `SplitText.revert()` cleanup
- **GSAP ScrollTrigger** — `start: 'top 75%'`, `toggleActions`, `gsap.matchMedia()` for reduced-motion
- **motion AnimatePresence + popLayout** — exit-then-enter timing inside grid layout shifts
- **motion useReducedMotion** — for `whileHover` opt-out pattern (matches Phase 3 D-32 reduced-motion fallback)
- **next/image** — blur placeholders, priority vs lazy, formats negotiation
- **next/font/google + Inter variable** — already wired in Phase 3 D-08 (Hero inherits via Tailwind utility)
- **next-intl Link from @/i18n/navigation** — for locale-aware project links
- **Web Clipboard API** — `navigator.clipboard.writeText`, permission handling, fallback

### Existing code (Phases 1+2+3 deliverables that downstream MUST read)
- `app/[locale]/page.tsx` — 5 placeholder sections (Phase 4's edit target; each section's body is replaced by a `<HomeXxx>` component)
- `app/[locale]/layout.tsx` — provider tree (Phase 4 doesn't modify)
- `app/globals.css` — Tailwind v4 @theme inline + shadcn aliasing (Phase 4 ADDS 3 fixed category color tokens here)
- `lib/projects.ts` — `getProjects(locale)` loader (Phase 4 stub MDX files become visible through this)
- `lib/palettes.ts` — 5 palette definitions (not modified by Phase 4)
- `lib/hooks/usePrefersReducedMotion.ts` — drives all `useGSAP({ ... matchMedia })` and motion `useReducedMotion()` gates
- `lib/hooks/useActiveSection.ts` — Navigation's IntersectionObserver hook (Phase 4 sections must have correct `id` attributes — already in place from Phase 3 page.tsx)
- `components/providers/LenisProvider.tsx` — `useLenis()` hook (Hero CTA + About/Skills ScrollTrigger consumers)
- `components/providers/ThemeProvider.tsx` — `usePalette()` (Phase 4 components don't subscribe; they use CSS vars directly)
- `components/ui/badge.tsx` — INSTALL via shadcn CLI in Wave 0 (currently absent)
- `components/ui/button.tsx`, `card.tsx`, `dialog.tsx` — existing shadcn primitives
- `components/layout/Navigation.tsx` — `useActiveSection` already wired to home/about/projects/skills/contact IDs
- `messages/fr.json` + `messages/en.json` — Phase 4 ADDS `about.paragraphs`, `skills.groups.{tech,design,bim}.items`, possibly `hero.scrollCue`; preserves all existing keys
- `content/projects/_template.{fr,en}.mdx` — reference for the 6 stub MDX files added in D-04
- `i18n/routing.ts` + `i18n/navigation.ts` — locale config + Link/useRouter exports (used by ProjectCard `<Link>` and Hero CTA)
- `package.json` — gsap@^3.15.0 + @gsap/react@^2.1.2 + lenis@^1.3.23 + motion@^12.40.0 + next-intl@^4.12.0 (all already installed)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`app/[locale]/page.tsx`** — already has 5 `<section id="…">` shells with min-h-screen. Phase 4 replaces their bodies with the actual section components, NOT the section wrappers themselves.
- **`components/sections/`** — empty directory ready (created in Phase 1). Phase 4 fills it with Hero/About/CategoryFilter/ProjectCard/ProjectGrid/Skills/Contact + their tests.
- **`components/ui/card.tsx`** + **`components/ui/button.tsx`** — shadcn primitives already styled via the palette alias chain. ProjectCard uses Card; Hero CTA + CV download buttons use Button.
- **`components/ui/badge.tsx`** — NOT yet installed. Wave 0 task: `npx shadcn@latest add badge`.
- **`lib/projects.ts`** — `getProjects(locale)` already implemented and tested in Phase 1. Currently returns `[]` because only `_template` exists (filtered). Wave 0 seeding 6 real stubs makes it return 6 projects per locale.
- **`lib/palettes.ts`** — Tech/Design/BIM category colors are NOT in this file. They live in `globals.css` as fixed tokens (D-13). This separates per-domain category coding from per-user palette choice — the same logic as `--destructive` from Phase 1.
- **`useLenis()`** hook from `components/providers/LenisProvider.tsx` — Hero CTA imports this for smooth scroll to `#projects`.
- **`useGSAP({ scope })`** from `@gsap/react` — Hero/About/Skills + ProjectCard hover all use this pattern.
- **`motion/react`** for AnimatePresence (ProjectGrid + Contact icon swap), `<motion.div layout>` (CategoryFilter indicator), `useReducedMotion()` (universal gate).
- **`next/image`** — About photo + ProjectCard cover.
- **`@/i18n/navigation`** Link — ProjectCard wraps the card in a locale-aware Link.
- **Existing i18n keys** — `nav.*`, `hero.*` (name/role/tagline/cta), `about.title/intro/details` (placeholder text already in fr.json — replaceable), `projects.title/filters/empty/viewProject`, `skills.title/groups.{tech,design,bim}`, `contact.title/intro/email/emailCopied/cv.{fr,en}/social.{github,linkedin}`, `footer.tagline/copyright` (Phase 3).

### Established Patterns

- **shadcn token alias chain** (Phase 1 D-10..D-13) — Phase 4 sections use Tailwind utilities like `bg-card`, `text-foreground`, `border-border`, `text-primary` (= `var(--color-accent)`). Never hardcoded colors.
- **Fixed color tokens precedent** (Phase 1 D-12 `--destructive`) — Phase 4's 3 category tokens (`--color-category-tech/design/bim`) follow the same pattern: declared once in `:root`, never mutated by ThemeProvider, palette-independent.
- **useGSAP scoped + matchMedia for reduced-motion** — pattern from PROJECT.md Key Decisions. Phase 4 Hero/About/Skills must follow this exactly.
- **motion `whileHover` + `useReducedMotion()` opt-out** — pattern from Phase 3 D-30 (CustomCursor). Phase 4 ProjectCard hover follows the same gate.
- **next-intl `useTranslations` in client components** — Phase 4 sections use `useTranslations('hero')`, `useTranslations('about')`, etc.
- **Lifted React state for filter** — CategoryFilter receives `active + onChange` props from parent; parent owns the state. Pattern matches Phase 2 PaletteSwitcher tabs (lifted vs internal).
- **Test pattern** — every new component gets a `*.test.tsx` next to it (Vitest + RTL set up in Phase 2 W0).

### Integration Points

- **`app/[locale]/page.tsx`** — Phase 4's main edit target. Replaces each section's body with `<Hero />`, `<About />`, `<ProjectsSection projects={projects} />`, `<Skills />`, `<Contact />`. The `id="…"` attributes stay (Navigation depends on them via `useActiveSection`).
- **`app/[locale]/page.tsx`** also becomes server-side data loader for `getProjects(locale)` — passes the array as a prop to the client `<ProjectsSection>`.
- **`app/globals.css`** — adds 3 new tokens in the `:root` block (next to `--destructive`), AND extends `@theme inline` if needed for the category tokens to be reachable via Tailwind utility (e.g., `bg-category-tech`).
- **`lib/constants.ts`** — NEW file (D-06) for swappable user contact data. Hero CTA + Contact import from here.
- **`content/projects/*.{fr,en}.mdx`** — 12 new files seeded (6 projects × 2 locales).
- **`public/cv-fr.pdf` + `public/cv-en.pdf`** — moved/copied from repo-root PDF.
- **`public/about-photo.jpg`** — new placeholder.
- **`public/projects/{slug}/cover.jpg`** — 6 placeholder covers (all initially the same JPEG, planner copies the file 6 times to different paths so Phase 5 can swap individually).
- **`messages/{fr,en}.json`** — adds `about.paragraphs[]`, `skills.groups.{tech,design,bim}.items[]`, possibly `hero.scrollCue`. Maintains FR/EN parity (Phase 1 D-15 parity gate).
- **`components/ui/badge.tsx`** — installed via `shadcn@latest add badge`. Customized with 3 new variants (`category-tech`, `category-design`, `category-bim`).

</code_context>

<specifics>
## Specific Ideas

- **Plan sequence (D-23 confirmed):**
  1. `04-00-assets-and-stubs-PLAN.md` (Wave 0, ~25 min) — git-mv CV PDF, add placeholder photo, install shadcn badge + customize variants, add 3 fixed category tokens to globals.css, create `lib/constants.ts`, seed 6 MDX stubs (12 files) with per-project cover placeholders.
  2. `04-01-hero-PLAN.md` (Wave 1 parallel, ~30 min) — Hero with GSAP SplitText char stagger + CTA scroll-to-projects via useLenis + bouncing scroll cue + useGSAP scoped + matchMedia reduced-motion gate + Vitest test.
  3. `04-02-about-PLAN.md` (Wave 1 parallel, ~25 min) — About section with photo + bio + ScrollTrigger reveal + i18n paragraphs + Vitest test.
  4. `04-03-projects-PLAN.md` (Wave 2, ~50 min) — CategoryFilter (segmented control with motion layoutId) + ProjectCard (hover stack + locale-aware Link) + ProjectGrid (AnimatePresence popLayout + empty state) — bundled for tight coupling. Connects to `getProjects(locale)`. Multiple Vitest tests.
  5. `04-04-skills-PLAN.md` (Wave 1 parallel, ~25 min) — Skills section with 3 group flex-wrap + i18n badge arrays + GSAP stagger entrance + Vitest test.
  6. `04-05-contact-PLAN.md` (Wave 1 parallel, ~30 min) — Contact with email copy-to-clipboard + motion icon swap + 3 social links + 2 CV download buttons + Vitest test.

  Total estimate ~3h. 04-01/02/04/05 run in parallel inside Wave 1; 04-03 in Wave 2 because it needs the MDX stubs from W0 to render meaningfully.

- **Wave 1 parallelism guarantee:** Hero/About/Skills/Contact have ZERO file overlap. Each touches its own component file + test + maybe one i18n key. None mutates `page.tsx` directly — they all just export a component. The final `page.tsx` wiring lands in plan 04-03 (Projects section) since that's the last plan and 04-03 already owns the parent wrapper that holds the array prop. Alternative: page.tsx wiring in plan 04-00. Recommendation: in 04-00 to keep Wave 1 independent.

- **fixed category tokens — exact OKLCh values (planner refines):**
  - `--color-category-tech: oklch(0.55 0.15 240)` — cool blue, contrast vs Terra bg (0.97) ≈ 4.8:1 ✓
  - `--color-category-design: oklch(0.65 0.20 330)` — magenta/pink, contrast vs Terra bg ≈ 3.4:1 ✓ (UI threshold 3.0)
  - `--color-category-bim: oklch(0.60 0.13 60)` — warm amber, contrast vs Terra bg ≈ 3.6:1 ✓
  - Each must pass 3:1 against all 5 palettes' `--color-bg`. Planner runs a quick `validateFullMatrix`-style check or relies on the existing `lib/colors.ts` helpers.

- **GSAP SplitText reduced-motion handling:**
  ```typescript
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({
      reducedMotion: '(prefers-reduced-motion: reduce)',
      fullMotion: '(prefers-reduced-motion: no-preference)',
    }, (ctx) => {
      const split = new SplitText(...);
      const tl = gsap.timeline();
      if (ctx.conditions?.fullMotion) {
        tl.from(split.chars, { opacity: 0, y: 24, stagger: 0.04, duration: 0.5, ease: 'power3.out' });
      } else {
        gsap.set(split.chars, { opacity: 1, y: 0 });
      }
      return () => split.revert();
    });
  }, { scope: heroRef });
  ```
  Important: `split.revert()` cleanup is mandatory — SplitText creates DOM nodes that must be reclaimed on unmount.

- **Lenis CTA scroll pattern:**
  ```typescript
  const lenis = useLenis();
  function scrollToProjects() {
    const target = document.getElementById('projects');
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -64 /* nav height */, duration: 1.0 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  ```

- **ProjectCard hover with reduced-motion gate:**
  ```typescript
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      ...
    </motion.div>
  );
  ```

- **Stub MDX example (`content/projects/texture-manager.fr.mdx`):**
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
  Phase 5 expands the body section. Frontmatter is final.

- **Per-project placeholder cover:** Wave 0 task copies the same source JPEG to 6 paths so each slug has its own cover.jpg file. Phase 5 individually replaces. This decouples Phase 4 from Phase 5 visually.

- **About bio placeholder text (FR — EN parity required):**
  - FR: 2 paragraphs, ~80 words each, written in first person, mentioning the hybrid Tech × Design × BIM profile + 1-2 specific projects + a call-to-conversation tone.
  - EN: translated equivalent.
  - These ship as plausible placeholders — the user replaces with their real bio before deploy.

- **Inline contact data substitution warning:** Hero + Footer + ConsoleArt (Phase 3) all reference `tanguynoumea/portfolio` as a placeholder GitHub URL. Phase 4 inherits this for Contact. Wave 0 `lib/constants.ts` centralizes these so the swap is a 1-file change.

- **No new shadcn install beyond badge.** Hero CTA reuses `<Button>` (Phase 1); Contact reuses `<Button>` (Phase 1). Skills + Categories use the new `<Badge>` (Wave 0). No other primitives needed.

- **Animation infrastructure already in place from Phase 3:** gsap@3.15.0 + @gsap/react@2.1.2 + lenis@1.3.23 + motion@12.40.0 are installed; gsap.registerPlugin(ScrollTrigger) runs at LenisProvider module load. Phase 4 components just call `useGSAP({ scope })` and create their timelines — no provider setup needed.

</specifics>

<deferred>
## Deferred Ideas

- **Real CV PDF EN translation** — Phase 4 ships a copy of the FR PDF at `public/cv-en.pdf`. User must translate and replace before deploy. Phase 7 deploy checklist should verify.
- **Real "about" photo** — Phase 4 ships a placeholder portrait image. User swaps with their real photo before deploy.
- **Real bio text + email + LinkedIn URL** — `lib/constants.ts` + i18n `about.paragraphs` ship plausible placeholders. User replaces before deploy.
- **Real project cover images** — Phase 4 ships 6 stub MDX files with a shared placeholder cover. Phase 5 (CONTENT-01..03) expands MDX bodies AND replaces covers.
- **Real skill list** — `messages/{fr,en}.json` `skills.groups.{tech,design,bim}.items[]` ship recommended defaults. User trims/expands.
- **Cross-domain combo filter ("Tech + Design")** — FEATURES.md P2 v2; current filter is single-select.
- **Filter combination via multi-select** — same.
- **Skills proficiency/years visualization** (progress bars, star ratings, "level: senior") — explicitly NOT in v1 to avoid the awkward self-assessment problem common in dev portfolios.
- **About page expansion** (timeline, certifications, experience grid) — v2 only if Contact-section bio runs out of room.
- **Hero animated background** (canvas/WebGL particles) — flagged as anti-feature in FEATURES.md.
- **Project sorting** (by year desc / by category) — v1 ships natural file-order; Phase 5 might add a `featured: boolean` filter (already in Project type from Phase 1) for "show featured first".
- **Project search box** — v1 has 6 projects, search adds no value; v2 if catalog grows.
- **"View all" pagination** — v1 has 6 projects, all fit on one screen.
- **Contact form with backend** — `CONTACT-v2-01` deferred; v1 uses `mailto:` + buttons only.
- **Newsletter signup** — `NEWSLETTER-v2-01` deferred.
- **GSAP scroll-pinned scrolly-telling** — explicitly OOS per ROADMAP/FEATURES.
- **3D model viewer for BIM projects** — `BIM-v2-01` deferred to Phase 5+ or v2.
- **PDF plan embed for architecture projects** — same.
- **Before/after sliders for design/BIM** — FEATURES.md P2 — v2.
- **Video reel embeds on project cards** — v2.
- **Hover sound effects on cards** — flagged anti-feature.
- **Per-project tags / categories beyond Tech/Design/BIM** — v1 single discriminant; v2 could add tag arrays.

### Reviewed Todos (not folded)

None — `gsd-tools todo match-phase 4` returned `todo_count: 0`.

</deferred>

---

*Phase: 04-homepage-sections*
*Context gathered: 2026-05-27 (auto mode — Claude picked recommended defaults; user review encouraged before plan-phase)*
