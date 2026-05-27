# Phase 5: Project Content Pipeline - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning
**Mode:** `--auto` (Claude picked recommended defaults; selections logged inline in `<decisions>`)

<domain>
## Phase Boundary

Fill the 6 stub MDX projects with real case-study bodies, ship the project detail page
template (`app/[locale]/projects/[slug]/page.tsx`) that renders MDX via `compileMDX` with
static generation, deliver the 3 custom MDX components required by CONTENT-03 (`<Image>`
with zoom modal, `<CodeBlock>` with syntax highlighting + copy-to-clipboard, `<Callout>`
with info/warning/note variants), and add a subtle GSAP parallax (factor ≈ 0.3) on the
project cover image with `prefers-reduced-motion` opt-out.

Delivers REQ **CONTENT-01..03** + **ANIM-02** (4 requirements). Concretely:

- **`content/projects/{slug}.{fr,en}.mdx`** — 12 files already exist (Phase 4 stubs). Phase 5
  enriches each body with a structured case-study narrative (Contexte / Défi / Processus /
  Résultat). Frontmatter unchanged. Adds optional `gallery?: string[]` to the discriminated
  Project type so each project can list its asset paths declaratively.
- **`components/mdx/Image.tsx`** — Client component wrapper around `next/image` with click-to-zoom
  via shadcn `Dialog` (already installed in Phase 2; `data-lenis-prevent` on content per
  LenisProvider D-04). Fullscreen view with backdrop, Esc/click-backdrop to close.
- **`components/mdx/CodeBlock.tsx`** — Thin `<pre>` override that reuses `rehype-pretty-code`
  (already wired in `next.config.ts`, Shiki-based, build-time, zero client cost) for syntax
  highlighting, and adds a copy-to-clipboard button (lucide `Copy → Check` icon swap, ~1.5s
  revert — same pattern as Contact section from Phase 4 D-20) + language label badge.
- **`components/mdx/Callout.tsx`** — 3 variants (`info` / `warning` / `note`) with border-left
  + colored Lucide icon (`Info` / `AlertTriangle` / `StickyNote`) + matching tinted background
  via palette CSS vars (zero hardcoded colors). MDX children = body text.
- **`mdx-components.tsx`** — Extends the existing scaffold (Phase 1) by wiring the 3 new
  components + a custom `<a>` override (external links → `target="_blank" rel="noopener noreferrer"`,
  internal links → next/link).
- **`lib/hooks/useParallax.ts`** — Reusable hook wrapping `useGSAP({ scope })` + ScrollTrigger
  with scrub: scope ref, factor (default 0.3), max translate (default 50px), `gsap.matchMedia()`
  reduced-motion gate skips entirely. Used by the project detail page on the cover image.
- **`app/[locale]/projects/[slug]/page.tsx`** — Async Server Component. `await getProjectBySlug(slug, locale)`,
  `notFound()` on null, render long-form magazine layout (full-width cover hero with parallax →
  metadata strip → `<MDXContent />` via `compileMDX` in `max-w-prose` → gallery grid →
  "← Back to projects" + prev/next pair footer). `generateStaticParams()` pre-renders all
  `locale × slug` combos (12 routes for current 6 projects × 2 locales).
- **`lib/projects.ts`** — Extend `CommonFields` with `gallery?: string[]` (optional). Validator
  accepts but doesn't require. Backward-compatible with existing 12 MDX stubs (they don't list
  galleries yet).
- **`public/projects/{slug}/[1-6].jpg`** — 4-6 placeholder gallery images per project (user
  swaps with real assets pre-deploy). All initially the same shared placeholder JPEG, copied
  to per-project paths so Phase 5+ Real Content can swap individually.
- **i18n** — Add `projects.detail.{back, prev, next, gallery, meta.year, meta.stack, meta.tools, meta.software, meta.scale, meta.location, meta.repo, meta.live, meta.client}` namespace
  to `messages/{fr,en}.json` (parity gate enforced by `scripts/check-i18n-parity.ts` from Phase 4).

**Out of scope for this phase** (already on the v2 list, explicit deferrals, or owned by other phases):

- Per-route `metadata` generation with OG image, hreflang alternates, twitter:card — Phase 6 (`A11Y-01`).
- `loading.tsx`, `error.tsx`, custom `not-found.tsx` per locale — Phase 6 (`A11Y-03`).
  Phase 5 uses default Next 16 404 fallback when `notFound()` is called.
- Sitemap entries for project routes — Phase 6 (`A11Y-02`).
- Before/after slider MDX component — FEATURES.md P2 v2 (not in REQs).
- Video reel / YouTube embed MDX component — FEATURES.md P2 v2 (not in REQs).
- 3D model viewer / Sketchfab embed for BIM projects — `BIM-v2-01` deferred.
- PDF plan viewer for architecture projects — v2 candidate (FEATURES.md).
- Related projects / "more from this category" footer block — v2 (no REQ).
- Reading time estimate or publish date display — out of REQs.
- Project search box, filtering inside `/projects` index page — v1 has 6 projects + homepage filter is enough.
- Cross-domain combo filter — FEATURES.md P2 v2 (already deferred in Phase 4).
- Pinned scroll / scrollytelling on project pages — explicitly OOS per REQUIREMENTS.md
  (conflicts with the popLayout filter; we ship a single subtle parallax only).
- MDX-driven theming overrides (per-project palette swap on entry) — v2 candidate.
- Server Action contact form on project pages — `CONTACT-v2-01` deferred.
- Real photographic project assets — Phase 5 ships placeholders; user replaces pre-deploy (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### MDX Content Authoring (CONTENT-01)

- **D-01:** **Structured case study narrative per project** — each MDX body uses 4 H2 sections
  for narrative consistency. Author the body in standard markdown headings (no named MDX
  components like `<Hook>`/`<Problem>` — keeps authoring simple and FR/EN parity-friendly):
  - `## Contexte` / `## Context` — 2-3 sentences framing the project, who it's for, why it
    matters
  - `## Défi` / `## Challenge` — 1 paragraph naming the problem to solve
  - `## Processus` / `## Process` — 2-3 paragraphs showing the work; MAY embed `<Callout>`
    or `<Image>` components for process artifacts
  - `## Résultat` / `## Outcome` — 1 paragraph naming what shipped + a metric or qualitative
    win where plausible
  - Total length per locale: ~250-400 words. Plausible placeholder copy (NOT lorem ipsum)
    that reads as real but is clearly swappable.
  - **Why:** FEATURES.md P1 explicitly flags "MDX with gallery" as 2018-era and recommends
    case-study narrative structure as the 2026 standard. Recruiters in Tech/Design/BIM all
    expect this. Authoring as raw markdown headings (not named components) keeps the i18n
    surface flat and the MDX itself portable.
  - Auto-selected: **[auto] D-01 → recommended (4-heading case study, 250-400 words/locale, plausible placeholders)**

- **D-02:** **Frontmatter unchanged from Phase 4** — every project's frontmatter already
  satisfies the discriminated `Project` union (Phase 1 D-18..D-22) with realistic values.
  Phase 5 adds ONE optional field: `gallery?: string[]` of asset paths under `/public/projects/{slug}/`.
  Frontmatter remains the only typed metadata source; case-study body lives in MDX prose.
  - Auto-selected: **[auto] D-02 → recommended (frontmatter unchanged, +1 optional gallery array)**

- **D-03:** **Initial gallery seed: 4 placeholder images per project**, named `1.jpg` through
  `4.jpg` under `public/projects/{slug}/`. All 24 image files initially share the same source
  JPEG (or, even simpler, a procedurally-generated abstract gradient). User replaces with
  real photography/screenshots/renders pre-deploy. Per-project paths mean Phase 6+ swap is
  surgical (one file at a time, no MDX edits needed).
  - 2 projects (one Tech + one Design) get `gallery` listed in frontmatter — Phase 5 demonstrates
    the auto-render path. Remaining 4 projects ship without `gallery` (their pages skip the
    gallery section gracefully — optional field).
  - Auto-selected: **[auto] D-03 → recommended (4 placeholder images per project, 2 projects ship with `gallery` populated)**

### Project Detail Page Layout (CONTENT-02)

- **D-04:** **Long-form magazine layout** — single column, scroll-driven, NOT side-by-side
  metadata sidebar. Order top-to-bottom:
  1. **Cover hero** — full viewport width (edge-to-edge), 60vh tall on desktop / 50vh mobile,
     `next/image` `fill` + `priority` for above-the-fold, `object-cover`, dark gradient
     overlay at bottom for the metadata strip to remain readable on any cover.
  2. **Metadata strip** — overlays the bottom of the cover (`absolute bottom-0`): title
     (`<h1>` text-4xl/5xl), year + category badge + domain-specific badges
     (`stack[0..3]` / `tools[0..3]` / `software[0..3]` + `projectScale`), optional `repo` /
     `liveUrl` / `client` / `location` link row (icons + text via lucide-react).
  3. **MDX body** — `<article className="max-w-prose mx-auto px-4 py-12">` for ideal reading
     measure (~65 chars per line). All 4 heading sections from D-01 flow vertically.
  4. **Gallery grid** — only renders when `frontmatter.gallery` is non-empty. Responsive grid
     `grid grid-cols-1 md:grid-cols-2 gap-4` (large images on wide viewports). Each cell is
     a `<MDXImage>` (the same component used inline in MDX) so all gallery images get the
     click-to-zoom UX for free.
  5. **Footer navigation** — "← Tous les projets" / "← All projects" link on the left
     (returns to homepage `#projects` anchor), prev/next project pair on the right (wraps
     around the project list — last project's "next" cycles back to the first). All labels
     come from new `projects.detail.{back, prev, next}` i18n keys.
  - **Why:** FEATURES.md case-study positioning prefers narrative-first layout over side-by-side
    metadata. `max-w-prose` is the standard for serious reading content (Stripe, Linear,
    Vercel blog all use this).
  - Auto-selected: **[auto] D-04 → recommended (long-form magazine: cover → metadata strip → MDX → gallery → footer nav)**

- **D-05:** **Cover image parallax** wraps the cover `<Image>` in a `<div ref={parallaxRef}>`
  consumed by `useParallax({ ref, factor: 0.3, maxTranslate: 50 })`. The hook creates a
  GSAP timeline with `ScrollTrigger.create({ trigger: ref.current, start: 'top top',
  end: 'bottom top', scrub: 0.5, animation: gsap.to(img, { y: -50, ease: 'none' }) })`.
  `gsap.matchMedia()` registers BOTH branches:
  - `(prefers-reduced-motion: no-preference)` — installs the scrub animation
  - `(prefers-reduced-motion: reduce)` — `gsap.set(img, { y: 0 })` — no animation, no ScrollTrigger
  Cleanup happens automatically via `useGSAP({ scope })` semantics. The cover image
  remains visually anchored (no overflow weirdness) because the wrapper has
  `overflow-hidden` and the image is ~120% height inside.
  - **Why:** FEATURES.md notes "Light parallax is fine. Heavy parallax = motion sickness."
    Factor 0.3 + 50px cap = subtle. ANIM-02 explicitly requires `prefers-reduced-motion` honour.
  - Auto-selected: **[auto] D-05 → recommended (cover-only parallax, factor 0.3, max 50px, matchMedia gate)**

- **D-06:** **`generateStaticParams` pre-renders all `locale × slug` combos.**
  ```typescript
  export async function generateStaticParams() {
    const slugs = await getProjectSlugs();
    return routing.locales.flatMap((locale) =>
      slugs.map((slug) => ({ locale, slug }))
    );
  }
  ```
  Returns 12 entries (6 projects × 2 locales) at current scale. All routes pre-built at
  `next build` time — no per-request work, perfect Vercel cache behavior. Future project
  additions just need to be MDX files (no code change).
  - Auto-selected: **[auto] D-06 → recommended (full static pre-render via getProjectSlugs × locales)**

- **D-07:** **`notFound()` for invalid slugs** — when `getProjectBySlug(slug, locale)` returns
  null, the page calls `notFound()` from `next/navigation`. Next 16 surfaces its default 404
  in v1; Phase 6 (`A11Y-03`) wires the localized `not-found.tsx` that gives the custom
  bilingual 404 experience.
  - Auto-selected: **[auto] D-07 → recommended (notFound() — inherits Phase 6 custom page later)**

- **D-08:** **Prev/Next project navigation wraps around.** Uses `getProjectSlugs()` to read
  the full slug list (locale-agnostic — derived from `.fr.mdx` set), finds the index of the
  current slug, computes `slugs[(i + 1) % slugs.length]` and `slugs[(i - 1 + slugs.length) % slugs.length]`.
  Renders as `<Link>` from `@/i18n/navigation` (locale-aware), with the title of the target
  project as the link label (fetched via a second `getProjectBySlug` per neighbour at build).
  Pre-rendered statically.
  - **Why:** Modern portfolios (Linear, Vercel cases, Awwwards entries) all use prev/next.
    Increases dwell time, helps recruiters explore. Wrap-around avoids dead-end UX on first/last.
  - Auto-selected: **[auto] D-08 → recommended (prev/next with wrap, locale-aware Link)**

### Custom MDX Components (CONTENT-03)

- **D-09:** **`<Image>` MDX component (`components/mdx/Image.tsx`)** — `"use client"` because
  it owns Dialog open state. Props mirror `next/image` API: `src` (required), `alt`
  (required), `width` + `height` (required for unconstrained MDX usage). Renders the image
  in normal flow (clickable, cursor pointer); on click, opens a shadcn `<Dialog>` whose
  `<DialogContent>` is `max-w-7xl max-h-screen` and includes `data-lenis-prevent`
  (LenisProvider D-04 contract). Inside the Dialog: same image at full size with
  `object-contain`. Close on backdrop click + Esc (Dialog defaults).
  - **a11y:** Image has `aria-label` from i18n key `projects.detail.imageZoom`. Dialog
    overlay traps focus per Radix defaults.
  - Reuses `<motion.div>` (already imported via other components) for a subtle scale-on-hover
    cue (1.0 → 1.02, 200ms) gated by `useReducedMotion()`.
  - Auto-selected: **[auto] D-09 → recommended (shadcn Dialog + next/image + data-lenis-prevent)**

- **D-10:** **`<CodeBlock>` strategy: pure markdown fenced blocks + `<pre>` override.**
  rehype-pretty-code (already in `next.config.ts` with `github-dark-dimmed` theme,
  `keepBackground: false`) processes ```` ```ts ```` blocks at build time → emits `<pre>`
  with Shiki-tokenized `<span>`s. Phase 5 adds a `pre` key to the `mdx-components.tsx` return:
  it renders the original `<pre>` plus an absolutely-positioned copy-to-clipboard button
  (`navigator.clipboard.writeText` + lucide `Copy → Check` swap, ~1.5s revert — reuses the
  Phase 4 Contact `D-20` pattern) and a language label badge (extracted from the `data-language`
  attribute rehype-pretty-code adds). Wrapper is `relative group` so the button shows on
  hover/focus.
  - **Why:** Wrapping the entire `<CodeBlock>` as a custom MDX component would mean MDX
    authors write `<CodeBlock language="ts">...</CodeBlock>` instead of ```` ```ts ```` —
    extra ceremony. Overriding `<pre>` keeps MDX prose-friendly + reuses the build-time
    Shiki pipeline (zero new deps, zero client JS for highlighting).
  - Auto-selected: **[auto] D-10 → recommended (pure fenced blocks + `<pre>` override with copy button + lang badge)**

- **D-11:** **`<Callout>` 3 variants (`info` / `warning` / `note`)** — `"use client"` not
  required (pure presentational; renders MDX children). Props: `variant: 'info' | 'warning' | 'note'`
  (defaults to `'note'`). Layout: `flex gap-3 rounded-lg border-l-4 p-4 my-6` with:
  - **`info`:** border-left + icon = `Info` lucide, background tinted via `bg-primary/5`
    (uses `--color-accent` through shadcn alias)
  - **`warning`:** border-left + icon = `AlertTriangle` lucide, background tinted via
    `bg-destructive/5` (uses the fixed `--destructive` per Phase 1 D-12 — yellow/red signals
    warning consistently across palettes)
  - **`note`:** border-left + icon = `StickyNote` lucide, background tinted via `bg-muted`
    (palette-neutral surface)
  - All 3 use Tailwind utilities backed by the palette aliasing chain — no hardcoded colors,
    auto-recolors on palette swap.
  - MDX usage: `<Callout variant="info">Mon mot d'auteur ici.</Callout>`
  - Auto-selected: **[auto] D-11 → recommended (3 variants, lucide icons, palette-aliased bg, MDX children as body)**

- **D-12:** **`mdx-components.tsx` extension** — keep the Phase 1 scaffold structure
  (`useMDXComponents(components)`); ADD wiring for the 3 new components + a custom `<a>`
  override:
  ```typescript
  import Image from '@/components/mdx/Image';
  import CodeBlock from '@/components/mdx/CodeBlock';
  import { Callout } from '@/components/mdx/Callout';
  import { Link } from '@/i18n/navigation';

  export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
      ...components,
      Image,
      Callout,
      pre: CodeBlock,
      a: ({ href, children, ...rest }) => {
        if (!href) return <a {...rest}>{children}</a>;
        if (href.startsWith('http://') || href.startsWith('https://')) {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
        return <Link href={href as never} {...rest}>{children}</Link>;
      },
    };
  }
  ```
  - **a11y:** External link `<a>` could optionally include a visual indicator (lucide
    `ExternalLink` mini-icon) — planner decides; recommended yes for accessibility per
    WCAG G201.
  - Auto-selected: **[auto] D-12 → recommended (mdx-components.tsx wires Image/Callout/pre/a)**

### Parallax Hook (ANIM-02)

- **D-13:** **`lib/hooks/useParallax.ts`** — reusable hook (location: alongside
  `usePrefersReducedMotion.ts` and `useKonamiCode.ts`). Signature:
  ```typescript
  function useParallax(
    ref: React.RefObject<HTMLElement | null>,
    options?: { factor?: number; maxTranslate?: number }
  ): void;
  ```
  Default `factor = 0.3`, `maxTranslate = 50` (px). Body uses `useGSAP()` from `@gsap/react`
  with `{ scope: ref }`, registers ScrollTrigger inside `gsap.matchMedia()` with both
  full-motion and reduced-motion branches. Hook returns nothing (effect only).
  - `gsap.registerPlugin(ScrollTrigger)` is already called once at LenisProvider module load
    (Phase 3) — this hook does NOT re-register.
  - Cleanup via `useGSAP({ scope })` semantics (automatic on unmount).
  - **Why:** Encapsulates the parallax pattern so future phases (or v2 features) can reuse
    it without duplicating ScrollTrigger boilerplate. Single source of truth for the
    reduced-motion gate.
  - Auto-selected: **[auto] D-13 → recommended (lib/hooks/useParallax with factor + maxTranslate + matchMedia)**

### Type Extension

- **D-14:** **Extend `CommonFields` with optional `gallery?: string[]`** in `lib/projects.ts`.
  All 3 variants (TechProject / DesignProject / BIMProject) inherit it automatically. The
  validator accepts but doesn't require the field (`Array.isArray(data.gallery) && data.gallery.every(s => typeof s === 'string')` → keep; else drop). Backward-compatible: existing
  stubs without `gallery` continue to validate.
  - Auto-selected: **[auto] D-14 → recommended (CommonFields.gallery?: string[] optional)**

### Plan Structure & Wave Topology

- **D-15:** **4 plans across 3 waves:**
  - **Wave 0** (independent prerequisites — unblocks Wave 2):
    `05-00-content-and-assets-PLAN.md` — extend `Project` type with `gallery?`, write 12 MDX
    case-study bodies (D-01 per project), seed 24 placeholder gallery images
    (`public/projects/{slug}/[1-4].jpg` — all same JPEG), add `projects.detail.*` i18n keys
    in `messages/{fr,en}.json` (parity-verified), update `_template.{fr,en}.mdx` to match
    the new case-study structure as the future authoring template.
  - **Wave 1** (parallel — 2 plans, no file overlap):
    - `05-01-mdx-components-PLAN.md` — `components/mdx/Image.tsx`, `components/mdx/CodeBlock.tsx`,
      `components/mdx/Callout.tsx`, `mdx-components.tsx` wiring (D-09..D-12). Vitest tests for
      each (mock shadcn Dialog, assert MDX children render, assert clipboard call, assert
      variant → icon mapping). 3 new component files + 1 root-level wiring file.
    - `05-02-parallax-hook-PLAN.md` — `lib/hooks/useParallax.ts` + Vitest test using
      MatchMediaController pattern (already established in Phase 4 About.test.tsx) for
      dual-branch coverage (full motion installs ScrollTrigger; reduced motion sets y:0
      and exits early). Single hook file + test.
  - **Wave 2** (depends on Wave 0 stubs + Wave 1 components):
    `05-03-project-page-PLAN.md` — `app/[locale]/projects/[slug]/page.tsx` (Server Component
    async + `getProjectBySlug` + `notFound()` + `compileMDX` + cover hero with parallax +
    metadata strip + MDX body + gallery + prev/next footer) + `generateStaticParams`. Tests
    cover: 404 path, prev/next wrap-around, gallery render-when-non-empty, metadata strip
    by category, MDX integration mock. The page consumes `useParallax` (Wave 1.2) on the
    cover wrapper and uses the 3 MDX components (Wave 1.1) through the
    `mdx-components.tsx` registry automatically.
  - **Why this topology:** Wave 0 is content+type+i18n+assets (unblocks Wave 2's MDX
    rendering). Wave 1 is two genuinely independent code surfaces (MDX components in
    `components/mdx/` vs hook in `lib/hooks/`) — zero file overlap → safe parallel.
    Wave 2 is the integrator that consumes everything Wave 0+1 ships.
  - Auto-selected: **[auto] D-15 → recommended (4 plans / 3 waves)**

### Claude's Discretion

Decisions deferred to the researcher/planner (enough signal exists to choose well):

- **Exact bilingual case-study placeholder copy** — planner writes plausible 250-400 word FR
  + EN bodies for each of the 6 projects. Tone: first-person, "I worked on…", specific tech
  + outcomes ("loaded 50× faster", "shipped to 200 users", "saved 3 weeks of modeling time"
  — phrased to sound real, easy for user to swap with truth).
- **Exact placeholder gallery image content** — Wave 0 ships a single shared abstract
  gradient JPEG copied to 24 paths (4 per slug × 6 slugs). Planner decides whether to
  vary the gradient by category or keep one image for all (recommendation: one shared
  image, lowest friction).
- **Exact placeholder font for gallery image** — if planner generates a fresh placeholder
  vs reuses Phase 4's `_placeholder-cover.jpg`-equivalent, either is fine.
- **Cover hero exact height** (60vh desktop / 50vh mobile suggested). Planner tunes if
  needed.
- **Whether `<MDXImage>` exposes a `caption?: string` prop** (additional caption text under
  the image). Recommendation: yes if low cost (1-2 LOC), no otherwise. v1 ships without
  unless trivial.
- **Whether `<Callout>` accepts a `title?: string` prop** for an optional heading line.
  Recommendation: yes (defaults to no heading; MDX author can pass `<Callout variant="info"
  title="Note technique">...</Callout>`). 5 LOC extra, scales authoring.
- **CodeBlock copy button position** — top-right absolute by default. Planner may tune to
  `opacity-0 group-hover:opacity-100` for hover-only reveal (less visual noise) — recommend
  this pattern.
- **Whether the gallery uses `next/image priority={false} loading="lazy"`** — recommend yes
  for everything except the cover (priority + fetchpriority=high).
- **Gallery layout responsive breakpoints** — `grid-cols-1 md:grid-cols-2 gap-4` is the
  default. Could refine to `md:grid-cols-3` if user provides many small assets later.
- **Prev/next visual treatment** — text-only `<Link>` with `< Title` / `Title >` arrow
  formatting recommended. Could become small card with thumbnail in v2.
- **Exact `data-language` extraction syntax** — depends on rehype-pretty-code's emitted
  attributes (planner verifies against current version 0.14.x).
- **Whether the project page emits its own `<title>` via `generateMetadata`** — Phase 6
  owns `A11Y-01` for full metadata, but Phase 5 should at MINIMUM set page title to
  `${project.title} — Tanguy Delrieu` so browser tabs read correctly. Recommend yes;
  Phase 6 expands with OG image + hreflang + description.

### Folded Todos

None — `gsd-tools todo match-phase 5` returned `todo_count: 0`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, Key Decisions (esp. `useGSAP()` everywhere, OKLCh-only colors, Server Components default, MDX in `content/projects/` with `@next/mdx` + `gray-matter` + `compileMDX`)
- `.planning/REQUIREMENTS.md` §"Project Content (MDX)" (CONTENT-01..03), §"Animations Avancées" (ANIM-02), §"Out of Scope" (no horizontal pin / no scrolly-telling)
- `.planning/ROADMAP.md` §"Phase 5: Project Content Pipeline" (goal + 4 success criteria + depends on Phase 3)
- `.planning/STATE.md` — Phase 4 complete; 222/222 tests baseline; 12 MDX stubs + per-project cover paths in place

### Prior phase context
- `.planning/phases/01-foundations/01-CONTEXT.md` — Discriminated Project type (D-18..D-22), `_*` filter convention (D-23..D-24), MDX loader scaffold convention
- `.planning/phases/02-palette-system/02-CONTEXT.md` — shadcn Dialog installed (used by `<Image>` zoom modal D-09), palette CSS-var alias chain (used by `<Callout>` D-11), silent fallback pattern for clipboard ops (D-02 — reused for CodeBlock copy)
- `.planning/phases/03-layout-animation-foundation/03-CONTEXT.md` — LenisProvider `data-lenis-prevent` contract (D-04 — Dialog content must apply), `useGSAP({ scope })` mandatory pattern (D-11), useLenis() returns null contract, ScrollTrigger pre-registered at LenisProvider module load
- `.planning/phases/04-homepage-sections/04-CONTEXT.md` — Contact section clipboard pattern (D-20 — reused for CodeBlock copy), `<ProjectsSection>` server-loads `getProjects(locale)` then passes to client (same pattern but inverted: project page reads `getProjectBySlug` server-side and renders fully server-side except client MDX components like `<Image>`), 3 fixed `--color-category-*` tokens (consumed by category badges on project page metadata strip)

### Research synthesis (MANDATORY pre-read for downstream agents)
- `.planning/research/FEATURES.md` §"Project case studies with structured narrative (problem → process → outcome)" — P1, drives D-01; §"Custom MDX components (Image with zoom, CodeBlock, Callout)" — P1, drives D-09..D-11; §"High-res zoomable image (lightbox)" — P1, drives D-09; §"Parallaxe douce sur images projet via GSAP ScrollTrigger" — drives D-05 ("Light parallax is fine. Heavy parallax = motion sickness. Must respect `prefers-reduced-motion`"); §"BIM dimension under-served" — informs MDX content recommendation for BIM projects (BIM v2 features like 3D viewer remain deferred)
- `.planning/research/ARCHITECTURE.md` §"Pattern 5: Lenis + GSAP via Single RAF Loop" (parallax must use ScrollTrigger inside the existing LenisProvider — D-05 + D-13), §"Pattern 6: MDX RSC boundary" (project page is Server Component; MDX-embedded client components like `<Image>` must declare `'use client'` themselves)
- `.planning/research/PITFALLS.md` **§"Pitfall 8: MDX in App Router — RSC boundary confusion, frontmatter not typed, dev hot reload broken"** (drives the explicit Server/Client split in D-04 + D-09 + D-12; `mdx-components.tsx` is the App Router convention NOT `MDXProvider` context), §"Pitfall 5: GSAP re-runs / refresh missed after palette swap" (LenisProvider Phase 3 D-05 already debounces refresh on palette swap → cover parallax doesn't need its own handling)
- `.planning/research/STACK.md` §"@next/mdx", "@mdx-js/loader", "rehype-pretty-code" (already installed in package.json — Phase 5 adds zero new deps)

### External docs (downstream researcher fetches via context7)
- **@next/mdx `compileMDX` API** — `import { compileMDX } from 'next-mdx-remote/rsc'` vs `import('@next/mdx')` direct file imports — the second is what we use since each project IS one MDX file; consult Next 16 MDX guide for the `mdx-components.tsx` registry pattern
- **`mdx-components.tsx` convention** (Next.js App Router) — required at project root, exports `useMDXComponents(components: MDXComponents): MDXComponents`
- **`rehype-pretty-code` v0.14.x** — `data-language`, `data-theme`, `data-highlighted-line` attributes emitted; how `<pre>` and `<code>` are nested; theming via Shiki VS Code grammars
- **GSAP `ScrollTrigger` + `scrub`** — scrub config (number = lerp, true = direct sync), interaction with Lenis's `gsap.ticker` bridge from Phase 3 LenisProvider
- **GSAP `gsap.matchMedia()`** — `mm.add({ fullMotion, reducedMotion }, ctx => {...})` pattern for prefers-reduced-motion branching
- **`@gsap/react` `useGSAP()` scope** — automatic context cleanup on unmount, scope binds selector queries
- **shadcn `Dialog`** — `<DialogTrigger>`, `<DialogContent>`, `<DialogClose>`, controlling open state via `open` + `onOpenChange` props; `data-lenis-prevent` placement on `DialogContent`
- **next/image** — `fill` + `object-cover` for cover hero, blur placeholders for gallery images, `priority` only for above-the-fold (cover), `loading="lazy"` for gallery
- **next-intl `Link` from `@/i18n/navigation`** — locale-aware routing; signature for `href` typed against `pathnames` if defined; prev/next links use this
- **Web Clipboard API** — `navigator.clipboard.writeText`, permission denial silent fallback (same Phase 4 D-20 pattern reused)
- **gray-matter** — frontmatter parsing already in place via `lib/projects.ts`; no changes

### Existing code (Phases 1+2+3+4 deliverables that downstream MUST read)
- `lib/projects.ts` — `getProjects(locale)`, `getProjectBySlug(slug, locale)`, `getProjectSlugs()`, discriminated `Project` union, frontmatter validator. **Phase 5 extends `CommonFields` with optional `gallery?: string[]` and adds validator support.** Backward-compatible with existing 12 stub MDX files.
- `mdx-components.tsx` — Phase 1 scaffold (passthrough). Phase 5 wires Image/Callout/pre/a overrides per D-12.
- `next.config.ts` — `@next/mdx` + `remark-gfm` + `rehype-pretty-code` (`github-dark-dimmed` theme, `keepBackground: false`) already wired. Phase 5 reuses without changes.
- `content/projects/*.mdx` — 12 stub files (6 projects × 2 locales) + 2 template files (`_template.{fr,en}.mdx`). Phase 5 fills bodies; frontmatter unchanged except optional `gallery` array on demo projects.
- `content/projects/_template.{fr,en}.mdx` — reusable template. Phase 5 updates it to reflect the case-study heading structure for future projects.
- `public/projects/{slug}/cover.jpg` — 6 cover images (all same placeholder JPEG). Phase 5 ADDS 4 gallery images per project (`1.jpg`–`4.jpg`, all same source initially).
- `app/[locale]/page.tsx` — homepage with 5 sections including `<ProjectsSection projects={projects} />`. Phase 5 does NOT modify this — links from ProjectCard go to `/{locale}/projects/{slug}` which is Phase 5's new route.
- `app/[locale]/layout.tsx` — provider tree (NextIntlClientProvider → ThemeProvider → LenisProvider → chrome + main). Phase 5 does NOT modify; the project page renders inside `<main>{children}</main>`.
- `components/providers/LenisProvider.tsx` — `useLenis()` returns Lenis | null. Single-RAF bridge to `gsap.ticker`. `data-lenis-prevent` contract (Image zoom Dialog applies this). `ScrollTrigger.registerPlugin` happens at module load.
- `components/ui/dialog.tsx` — shadcn Dialog primitive (Phase 1 install), reused by `<Image>` zoom.
- `components/ui/button.tsx` — reused for copy-to-clipboard button in `<CodeBlock>`.
- `components/sections/Contact.tsx` — Phase 4 D-20 clipboard pattern (`navigator.clipboard.writeText` + AnimatePresence Copy↔Check + 1.5s revert) reused by `<CodeBlock>`.
- `lib/hooks/usePrefersReducedMotion.ts` — drives motion gates in `<Image>` hover + `useParallax` (the matchMedia is GSAP's own, but the hook still informs other reduced-motion-sensitive UI choices).
- `lib/hooks/useKonamiCode.ts` — unrelated to Phase 5, but the `lib/hooks/` directory convention is where `useParallax.ts` lives.
- `lib/constants.ts` — `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` (Phase 4 D-06). Phase 5 doesn't add new constants; project links come from MDX frontmatter.
- `messages/fr.json` + `messages/en.json` — Phase 5 ADDS the `projects.detail.*` namespace; preserves all existing keys; `scripts/check-i18n-parity.ts` (Phase 4) gates the addition.
- `i18n/navigation.ts` — locale-aware `<Link>` + `useRouter`; prev/next navigation uses this.
- `package.json` — gsap@^3.15.0, @gsap/react@^2.1.2, lenis@^1.3.23, motion@^12.40.0, @next/mdx@^16.2.6, gray-matter@^4.0.3, rehype-pretty-code@^0.14.3, remark-gfm@^4.0.1, lucide-react@^1.16.0, radix-ui@^1.4.3 — all already installed. **Phase 5 adds ZERO new dependencies.**
- `scripts/check-i18n-parity.ts` (Phase 4) — must pass after `projects.detail.*` keys added (FR/EN parity gate; CI exit 0).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`lib/projects.ts`** — `getProjects(locale)`, `getProjectBySlug(slug, locale)`, `getProjectSlugs()` are all implemented and tested in Phase 1. Phase 5 makes the latter two functions actually used at runtime (homepage's `getProjects` was used in Phase 4; detail page now uses `getProjectBySlug` + `getProjectSlugs`). Validator accepts new optional `gallery` field per D-14.
- **`mdx-components.tsx`** — scaffold from Phase 1 (passthrough). Phase 5 fills it with Image/Callout/pre/a per D-12.
- **`next.config.ts`** — `@next/mdx` + `remark-gfm` + `rehype-pretty-code` (theme: github-dark-dimmed, keepBackground: false) already wired in Phase 1. Phase 5 reuses without changes.
- **`components/ui/dialog.tsx`** — shadcn Dialog primitive (Phase 1). Phase 5 `<Image>` MDX component wraps it for zoom modal.
- **`components/ui/button.tsx`** + **`components/ui/badge.tsx`** (added in Phase 4) — reused on the project page metadata strip and for CodeBlock copy button.
- **`components/providers/LenisProvider.tsx`** — `useLenis()` (page can use for prev/next smooth-scroll on click if needed; not required but available). `data-lenis-prevent` contract applies to the Image zoom Dialog content.
- **`useGSAP({ scope })` from `@gsap/react`** — Phase 5 `useParallax` hook wraps this.
- **`gsap` + `ScrollTrigger`** — pre-registered at LenisProvider module load (Phase 3); Phase 5 just imports `import 'gsap/ScrollTrigger'` for type merging (side-effect-only — same pattern as Phase 4 About).
- **`motion/react`** — used by `<Image>` hover scale + `<CodeBlock>` AnimatePresence icon swap.
- **`@/i18n/navigation` `Link`** — locale-aware navigation for prev/next + custom MDX `<a>` override (internal links).
- **`navigator.clipboard.writeText` pattern** from Phase 4 D-20 (Contact section) — reused verbatim in `<CodeBlock>`.
- **Existing i18n keys** — Phase 5 only adds `projects.detail.*` (back/prev/next/gallery + meta.* per discriminator). All existing namespaces preserved.

### Established Patterns

- **shadcn token alias chain** (Phase 1 D-10..D-13) — Phase 5 components use `bg-card`, `text-foreground`, `border-border`, `text-primary` (= `var(--color-accent)`), `bg-destructive/5`, `bg-primary/5`, `bg-muted`. Zero hardcoded colors.
- **OKLCh-only color authoring** — Phase 5 inherits; no hex/rgb anywhere.
- **`useGSAP({ scope: ref })` mandatory pattern** — `useParallax` hook respects this exactly.
- **`gsap.matchMedia()` for reduced-motion** — `useParallax` registers both branches.
- **`motion/react` AnimatePresence + Copy↔Check swap** — reuses Phase 4 D-20 Contact pattern in `<CodeBlock>`.
- **Server Components by default; `"use client"` only when interaction** — project page = server (compileMDX is server-side); `<Image>` MDX = client (Dialog state); `<CodeBlock>` = client (clipboard + Copy↔Check); `<Callout>` = server (no interaction).
- **next-intl `useTranslations` in client components** — `<Image>` may use `useTranslations('projects.detail')` for aria-label; project page uses server-side `getTranslations({ locale, namespace: 'projects.detail' })`.
- **1 file = 1 responsibility** — `components/mdx/` (new directory) gets 3 atomic files (Image, CodeBlock, Callout) + `mdx-components.tsx` (root-level registry).
- **Test pattern** — every new component + hook gets a `*.test.tsx` next to it. Vitest + RTL + jsdom set up since Phase 2 W0.
- **MatchMediaController pattern** (Phase 4 About.test.tsx) — Phase 5 `useParallax.test.tsx` reuses this for dual-branch dual-state testing.
- **i18n FR/EN parity gate** (`scripts/check-i18n-parity.ts`, Phase 4) — must pass after `projects.detail.*` additions.

### Integration Points

- **`app/[locale]/projects/[slug]/page.tsx`** — NEW file, Phase 5's main deliverable. Server Component, `async`, reads params per Next 16 async-params contract, calls `getProjectBySlug` + `notFound` + `compileMDX` + `getProjectSlugs` for prev/next.
- **`mdx-components.tsx`** — extended per D-12 (Image, Callout, pre override, a override).
- **`lib/projects.ts`** — `CommonFields.gallery?: string[]` added; validator updated; backward-compatible (existing 12 stubs validate unchanged).
- **`lib/hooks/useParallax.ts`** — NEW file.
- **`components/mdx/Image.tsx`** + **`components/mdx/CodeBlock.tsx`** + **`components/mdx/Callout.tsx`** — NEW directory + 3 NEW files.
- **`content/projects/*.mdx`** — body bodies enriched per D-01 (12 files updated). 2 projects (one Tech + one Design recommended) gain `gallery: [...]` in frontmatter.
- **`content/projects/_template.{fr,en}.mdx`** — body updated to reflect the case-study heading structure (future authoring template).
- **`public/projects/{slug}/[1-4].jpg`** — 24 new placeholder gallery images (4 per project × 6 projects). All initially share one source JPEG.
- **`messages/{fr,en}.json`** — `projects.detail.{back, prev, next, gallery, imageZoom, copy, copied, meta.year, meta.stack, meta.tools, meta.software, meta.scale, meta.location, meta.repo, meta.live, meta.client}` keys added. Maintains parity. Approx. 16 new leaf keys × 2 locales = 32 additions.

</code_context>

<specifics>
## Specific Ideas

- **Plan sequence (D-15 confirmed):**
  1. `05-00-content-and-assets-PLAN.md` (Wave 0, ~50 min)
     - Extend `Project` type with `gallery?: string[]` + validator support + 1 unit test for backward-compat.
     - Write 12 MDX case-study bodies (250-400 words each, per D-01 heading structure).
     - Add `gallery` arrays to 2 projects' frontmatter (e.g., `texture-manager.{fr,en}.mdx` + `brand-system.{fr,en}.mdx`).
     - Seed 24 placeholder gallery images (`public/projects/{slug}/[1-4].jpg`) — all copy of one source JPEG.
     - Update `_template.{fr,en}.mdx` body to use the case-study heading scaffolding as future authoring template.
     - Add `projects.detail.*` i18n keys + verify parity.
  2. `05-01-mdx-components-PLAN.md` (Wave 1 parallel, ~50 min)
     - `components/mdx/Image.tsx` (Dialog zoom + `data-lenis-prevent` + motion hover) + test.
     - `components/mdx/CodeBlock.tsx` (`<pre>` override + copy button + lang badge) + test.
     - `components/mdx/Callout.tsx` (3 variants with lucide icons + palette-aliased bg) + test.
     - `mdx-components.tsx` extended with Image/Callout/pre/a wiring per D-12.
  3. `05-02-parallax-hook-PLAN.md` (Wave 1 parallel, ~25 min)
     - `lib/hooks/useParallax.ts` (factor 0.3, maxTranslate 50, matchMedia gate) + test (MatchMediaController dual-branch).
  4. `05-03-project-page-PLAN.md` (Wave 2, ~80 min)
     - `app/[locale]/projects/[slug]/page.tsx`:
       - Server Component async params per Next 16
       - `getProjectBySlug(slug, locale)` + `notFound()`
       - `compileMDX` rendering with MDXComponents registry from Phase 5.1
       - Cover hero (full-width, 60vh / 50vh) with `useParallax` wrapper (client island via `<ProjectCover>` micro-component)
       - Metadata strip (title + year + category badge + domain-specific badges + repo/live/client/location links)
       - Article body `max-w-prose mx-auto px-4 py-12`
       - Gallery grid (renders if `project.gallery?.length`)
       - Footer nav: back-to-projects link + prev/next pair (uses `getProjectSlugs` for wrap-around)
     - `generateStaticParams` returns all locale × slug combos.
     - `generateMetadata` returns minimal `{ title: '${project.title} — Tanguy Delrieu' }` (Phase 6 expands).
     - Tests: 404 path (invalid slug → notFound), prev/next wrap-around (last project → first), gallery render-when-non-empty, metadata strip by category (renders stack vs tools vs software).

  Total estimate ~3.5h. 05-01 and 05-02 run in parallel inside Wave 1 (zero file overlap).
  05-00 is sequential blocker for 05-03 (MDX bodies + i18n keys required for project page to render).

- **Wave 1 parallelism guarantee:** `components/mdx/*` and `lib/hooks/useParallax.ts` share
  ZERO files. Wave 1 plans are guaranteed conflict-free.

- **Wave 2 cover image as Client Island:** Since `useParallax` is a client-side GSAP hook
  but the project page is a Server Component, the cover image wrapper becomes a tiny
  client island `<ProjectCover src={cover} alt={title}>` (`'use client'`, ~30 LOC). The
  rest of the page (metadata, MDX, gallery, footer) stays server-rendered for SEO.

- **MDX RSC boundary pattern** (per PITFALLS.md Pitfall 8):
  ```typescript
  // app/[locale]/projects/[slug]/page.tsx (Server Component)
  import { compileMDX } from 'next-mdx-remote/rsc';
  // ... but actually: @next/mdx + file-system route gives us this for free
  import ProjectMDX from '@/content/projects/${slug}.${locale}.mdx';
  // FAILS at runtime — dynamic import of MDX is broken in production (PITFALLS.md Pitfall 8).
  ```
  **Correct pattern:** read MDX source via Node `fs`, then `compileMDX({source, options: {mdxOptions}})`
  from `next-mdx-remote/rsc`. Researcher must verify if we need to add `next-mdx-remote` to
  dependencies or if Next 16's @next/mdx exposes a server-side `compileMDX` directly. Likely
  add `next-mdx-remote` (lightweight, MIT, already RSC-compatible) since `@next/mdx` is
  designed for compile-time `import` of static MDX files.

  **Decision (D-XX, finalize in research):** prefer `next-mdx-remote/rsc` for dynamic `[slug]`
  routes since `@next/mdx` direct `import('./${slug}.mdx')` fails in production builds.

- **`generateStaticParams` example:**
  ```typescript
  import { getProjectSlugs } from '@/lib/projects';
  import { routing } from '@/i18n/routing';

  export async function generateStaticParams() {
    const slugs = await getProjectSlugs();
    return routing.locales.flatMap((locale) =>
      slugs.map((slug) => ({ locale, slug }))
    );
  }
  ```

- **`<Image>` MDX example usage in body:**
  ```mdx
  ## Processus

  La grille modulaire de 12 colonnes a permis…

  <Image src="/projects/brand-system/process-1.jpg" alt="Premier croquis de grille" width={1200} height={800} />

  L'itération suivante a réduit la densité…
  ```

- **`<Callout>` MDX example usage in body:**
  ```mdx
  <Callout variant="info">
    Ce composant est compatible avec Three.js r165 ; les versions antérieures nécessitent un polyfill.
  </Callout>
  ```

- **`<CodeBlock>` (= `<pre>` override) MDX example usage in body:**
  ````mdx
  Implémentation du shader :

  ```glsl
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec3 color = vec3(sin(time + vUv.x * 10.0));
    gl_FragColor = vec4(color, 1.0);
  }
  ```
  ````
  The `<pre>` override picks up the rehype-pretty-code-generated `data-language="glsl"`
  attribute and displays a small badge. Copy button is absolutely positioned top-right.

- **Parallax usage on cover:**
  ```typescript
  // components/mdx/ProjectCover.tsx (small client island)
  'use client';
  import { useRef } from 'react';
  import Image from 'next/image';
  import { useParallax } from '@/lib/hooks/useParallax';

  export function ProjectCover({ src, alt }: { src: string; alt: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useParallax(ref, { factor: 0.3, maxTranslate: 50 });

    return (
      <div ref={ref} className="relative h-[60vh] w-full overflow-hidden md:h-[50vh]">
        <Image src={src} alt={alt} fill priority className="object-cover" style={{ scale: 1.2 }} />
      </div>
    );
  }
  ```
  The `style={{ scale: 1.2 }}` ensures the image extends 20% past the wrapper so the
  parallax translate (max 50px) never reveals the underlying surface.

- **Prev/next wrap-around:**
  ```typescript
  const slugs = await getProjectSlugs();
  const idx = slugs.indexOf(slug);
  const nextSlug = slugs[(idx + 1) % slugs.length];
  const prevSlug = slugs[(idx - 1 + slugs.length) % slugs.length];
  const nextProject = await getProjectBySlug(nextSlug, locale);
  const prevProject = await getProjectBySlug(prevSlug, locale);
  ```

- **`<Callout>` variant → icon mapping:**
  - `info` → `Info` (lucide) + `border-l-primary bg-primary/5 text-foreground` + icon `text-primary`
  - `warning` → `AlertTriangle` (lucide) + `border-l-destructive bg-destructive/5 text-foreground` + icon `text-destructive`
  - `note` → `StickyNote` (lucide) + `border-l-border bg-muted text-foreground` + icon `text-muted-foreground`

- **i18n keys to add (in `projects.detail.*` namespace):**
  - `back` — "Tous les projets" / "All projects"
  - `prev` — "Précédent" / "Previous"
  - `next` — "Suivant" / "Next"
  - `gallery` — "Galerie" / "Gallery"
  - `imageZoom` — "Zoomer l'image" / "Zoom image"
  - `copy` — "Copier" / "Copy"
  - `copied` — "Copié !" / "Copied!"
  - `meta.year` — "Année" / "Year"
  - `meta.stack` — "Stack" / "Stack" (same in both — technical term)
  - `meta.tools` — "Outils" / "Tools"
  - `meta.software` — "Logiciels" / "Software"
  - `meta.scale` — "Échelle" / "Scale"
  - `meta.location` — "Lieu" / "Location"
  - `meta.repo` — "Code" / "Source"
  - `meta.live` — "Voir en ligne" / "Live demo"
  - `meta.client` — "Client" / "Client"

- **Animation discipline reminder:** Parallax is the ONLY new animation Phase 5 adds. Gallery
  images get NO parallax (motion-sickness risk per FEATURES.md). Click-to-zoom is a Dialog
  fade-in (Radix default, palette-respecting). No scroll-pinned sections. No horizontal scroll.
  No autoplay video.

- **Per-project gallery seeding strategy:** Wave 0 copies `public/projects/agora/cover.jpg`
  (or any existing placeholder) to `public/projects/{slug}/[1-4].jpg` for all 6 slugs. 24
  identical placeholder images means visual repetition is obvious in dev, signaling the user
  to replace before deploy. Phase 6+ (or pre-deploy in Phase 7) swaps with real assets.

- **Test infrastructure reuse:** No new test setup needed. Vitest + jsdom + RTL + @/* alias
  + MatchMediaController pattern all already in place.

- **MDX hot reload** (PITFALLS.md Pitfall 8 mention): Next 16 with Turbopack handles MDX hot
  reload acceptably; if regressions appear during Wave 0 content authoring, fall back to
  `npm run dev` restart between body edits. No structural code change needed.

- **`compileMDX` dependency uncertainty:** Wave 0 / Wave 1 don't depend on this. Wave 2's
  plan-phase research step (gsd-phase-researcher) MUST resolve whether `@next/mdx` exposes
  a server-side `compileMDX` or if we need `next-mdx-remote` added to package.json. The
  planner blocks until this is confirmed. Expected answer: add `next-mdx-remote` (zero
  client cost, ~3KB RSC bundle, official Vercel maintained).

</specifics>

<deferred>
## Deferred Ideas

- **Per-route SEO metadata (OG image, hreflang alternates, twitter:card)** — Phase 6 (`A11Y-01`). Phase 5 ships minimal `title` only.
- **Sitemap entries for project routes** — Phase 6 (`A11Y-02`).
- **Localized `not-found.tsx` page** — Phase 6 (`A11Y-03`). Phase 5 uses Next default 404 when `notFound()` is called.
- **Localized `loading.tsx` skeleton during navigation** — Phase 6.
- **Localized `error.tsx` for project page render failures** — Phase 6 with Server Action Reset button.
- **Before/after slider MDX component** — FEATURES.md P2 v2. If 2+ Design/BIM projects benefit, add in v2.
- **Video reel / YouTube/Vimeo embed MDX component** — FEATURES.md P2 v2.
- **3D model viewer for BIM projects (Sketchfab / model-viewer)** — `BIM-v2-01` deferred (requires user-provided 3D assets).
- **PDF plan viewer for architecture projects** — v2 (requires user-provided PDFs).
- **MDX-driven per-project palette overrides** — v2 (could let MDX frontmatter set a palette per project entry, fun but scope creep).
- **Project reading time estimate** — not in REQs; v2 candidate.
- **Project publish/update date display** — not in REQs; v2 candidate.
- **Related projects "more from this domain" footer** — not in REQs; v2 candidate (current prev/next already provides sequential navigation).
- **Comments / Disqus / Giscus on project pages** — Phase 6 anti-feature; remains out of scope (no commenting on personal portfolio per PROJECT.md).
- **Gallery lightbox with arrow-key navigation between gallery images** — v1 ships click-to-zoom per image (Dialog opens single image). Multi-image lightbox is v2 polish.
- **CodeBlock with "Edit this code" / online sandbox link** — v2 candidate.
- **CodeBlock with line highlighting / line numbers** — rehype-pretty-code supports both; v1 ships without (clean default); v2 if specific Tech projects need it.
- **`<Callout>` with collapsible body** — v2.
- **MDX-driven case study sub-sections beyond the 4 standard headings** — v1 ships 4 fixed sections (Contexte/Défi/Processus/Résultat). MDX authors can add `###` sub-headings within; convention stays at H2 for top-level structure.
- **Parallax on About section photo or Skills badges** — Phase 5 ships ONLY cover-image parallax per REQ ANIM-02. Other parallax additions are v2.
- **Scrollytelling / scroll-driven multi-step storytelling on project pages** — explicitly OOS per FEATURES.md anti-feature consensus.
- **Real photographic project covers + gallery assets** — Phase 5 ships placeholder JPEGs. User replaces pre-deploy (Phase 7 deploy checklist verifies).
- **Real case-study body content** — Phase 5 ships plausible 250-400 word placeholders per locale. User replaces with real bodies pre-deploy.
- **MDX content authoring guide / README in `content/projects/`** — v2 nice-to-have; `_template.{fr,en}.mdx` already serves as the de-facto authoring example.
- **Project filtering on a dedicated `/projects` index page** — homepage already provides filterable grid; v1 doesn't need a separate index route. v2 if portfolio grows past 10 projects.

### Reviewed Todos (not folded)

None — `gsd-tools todo match-phase 5` returned `todo_count: 0`.

</deferred>

---

*Phase: 05-project-content-pipeline*
*Context gathered: 2026-05-27 (auto mode — Claude picked recommended defaults; user review encouraged before plan-phase)*
