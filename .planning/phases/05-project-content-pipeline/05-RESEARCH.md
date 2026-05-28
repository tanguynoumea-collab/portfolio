# Phase 5: Project Content Pipeline - Research

**Researched:** 2026-05-27
**Domain:** Next.js 16 App Router MDX dynamic-route pipeline + GSAP parallax + custom MDX components (Dialog zoom, clipboard copy, palette-aliased callout)
**Confidence:** HIGH (Next 16 official docs verified, rehype-pretty-code source code inspected, all existing infrastructure in repo confirmed)

## Summary

Phase 5 has **two genuinely-uncertain technical questions** that the planner needs answered before it can write task content; this RESEARCH.md resolves both definitively, plus answers every Discretion item from `05-CONTEXT.md`.

**Resolution 1 — `compileMDX` strategy (THE critical blocker):**
**DO NOT add `next-mdx-remote` to `package.json`.** The package was **archived on 2026-04-09** by HashiCorp and is no longer maintained. Next.js 16 official docs (last updated 2026-05-19) explicitly demonstrate the **native dynamic `await import()` pattern** for exactly this use case (1 MDX file per project, dynamic `[slug]` route). The pattern works in production with Turbopack provided a single requirement is honoured: **use a relative path, not the `@/` alias** (e.g., `await import(\`../../../../content/projects/${slug}.${locale}.mdx\`)`). The existing `next.config.ts` `@next/mdx` + `remark-gfm` + `rehype-pretty-code` wiring already applies all transforms at build time when the MDX is imported this way — no additional configuration needed. **Phase 5 adds ZERO new dependencies.**

**Resolution 2 — `rehype-pretty-code` `data-language` extraction:**
**Verified via source inspection** (`packages/core/src/index.ts` lines 94 and 101): rehype-pretty-code 0.14.3 emits `data-language="ts"` on **BOTH the `<pre>` AND the `<code>` element**. The Phase 5 `<pre>` override consumes `props['data-language']` (string fallback `'text'`) — no transformer needed, no extra plugin. The wrapping `<figure>` carries `data-rehype-pretty-code-figure=""`.

**Resolution 3 — Parallax + Lenis ticker compatibility:**
The Phase 3 LenisProvider `gsap.ticker.add((time) => lenis.raf(time * 1000))` bridge already feeds Lenis's virtualized scroll position to `ScrollTrigger.update` (`lenis.on('scroll', ScrollTrigger.update)` at module load). A `ScrollTrigger.create({ scrub: 0.5, ... })` registered inside `useGSAP({ scope })` inherits this bridge automatically — no scroller-proxy setup needed. The Phase 4 `About.tsx` already proved `gsap.matchMedia()` + `useGSAP({ scope })` works under React 19 + jsdom + MatchMediaController test pattern. `useParallax` reuses verbatim.

**Primary recommendation:** Wave 0 ships content + types + i18n + placeholder assets. Wave 1 ships the 3 MDX components and the parallax hook in parallel (zero file overlap). Wave 2 wires the project detail page using the native dynamic-import pattern. Total: 4 plans, 3 waves, ~3.5 h.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

The planner is bound to these 15 decisions verbatim — research investigates HOW to implement them, not WHETHER they are correct.

- **D-01** Structured case-study narrative per project — 4 H2 sections (`## Contexte`/`## Context` → `## Défi`/`## Challenge` → `## Processus`/`## Process` → `## Résultat`/`## Outcome`), 250–400 words/locale, plausible placeholders (NOT lorem ipsum).
- **D-02** Frontmatter unchanged from Phase 4 except ONE optional field: `gallery?: string[]`.
- **D-03** 4 placeholder images per project (24 total = 4 × 6 slugs), all sharing one source JPEG; only 2 projects (one Tech + one Design) ship with `gallery` populated in frontmatter.
- **D-04** Long-form magazine layout: cover hero (60vh desktop / 50vh mobile, full-width, dark gradient overlay) → metadata strip overlay → MDX body (`max-w-prose mx-auto px-4 py-12`) → gallery grid (`grid-cols-1 md:grid-cols-2 gap-4`, render only if `gallery?.length`) → footer (back link + prev/next pair).
- **D-05** Cover-only parallax: `factor = 0.3`, `maxTranslate = 50 px`, `ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.5, animation: gsap.to(img, { y: -50, ease: 'none' }) })`, `gsap.matchMedia()` dual-branch (full motion installs scrub; reduced motion does `gsap.set(img, { y: 0 })`). Wrapper has `overflow-hidden`; image rendered at `scale: 1.2` so 50 px translate never reveals the underlying surface.
- **D-06** `generateStaticParams` returns ALL `locale × slug` combos (12 entries: 6 projects × 2 locales).
- **D-07** Invalid slug → `notFound()` from `next/navigation`. Phase 5 inherits Next's default 404; Phase 6 ships the custom `not-found.tsx`.
- **D-08** Prev/next navigation wraps around (`slugs[(i + 1) % slugs.length]`, `slugs[(i - 1 + slugs.length) % slugs.length]`); locale-aware `<Link>` from `@/i18n/navigation`; label is target project title.
- **D-09** `<Image>` MDX component: `'use client'`, shadcn `<Dialog>` zoom modal, `data-lenis-prevent` on `<DialogContent>`, props mirror `next/image` (`src`, `alt`, `width`, `height`), Esc/backdrop close (Radix defaults), `useReducedMotion()` gates the hover scale 1.0 → 1.02 / 200 ms cue.
- **D-10** `<CodeBlock>` = pure markdown fenced blocks (e.g., ```` ```ts ````) + `<pre>` override in `mdx-components.tsx`. rehype-pretty-code already wired (`github-dark-dimmed`, `keepBackground: false`) — Phase 5 does NOT touch `next.config.ts`. Override adds copy-to-clipboard button (Phase 4 Contact `D-20` clipboard pattern verbatim, `Copy → Check` swap, ~1.5 s revert) + language label badge extracted from `data-language` attribute.
- **D-11** `<Callout>` 3 variants (`info` / `warning` / `note`) — Server component (no interaction), `flex gap-3 rounded-lg border-l-4 p-4 my-6`, lucide icons (`Info` / `AlertTriangle` / `StickyNote`), palette-aliased tinted backgrounds (`bg-primary/5` for info, `bg-destructive/5` for warning, `bg-muted` for note), MDX children = body. Optional `title?: string` prop (planner discretion — recommended).
- **D-12** `mdx-components.tsx` extends Phase 1 scaffold: wires `Image`, `Callout`, `pre: CodeBlock`, and custom `a` override (external → `target="_blank" rel="noopener noreferrer"`; internal → `Link` from `@/i18n/navigation`).
- **D-13** `lib/hooks/useParallax.ts` — reusable hook signature `useParallax(ref, { factor = 0.3, maxTranslate = 50 })`. Body: `useGSAP({ scope: ref })` + `gsap.matchMedia()` dual-branch. `gsap.registerPlugin(ScrollTrigger)` is ALREADY called at LenisProvider module load (Phase 3) — hook does NOT re-register; just imports `import 'gsap/ScrollTrigger'` for type merging.
- **D-14** `CommonFields.gallery?: string[]` added in `lib/projects.ts`. All 3 variants inherit. Validator accepts but does NOT require. Backward-compatible with the 12 existing stubs.
- **D-15** 4 plans across 3 waves:
  - Wave 0 (blocker for Wave 2): `05-00-content-and-assets-PLAN.md` — type extension + 12 MDX bodies + i18n keys + 24 placeholder gallery images + `_template.{fr,en}.mdx` update.
  - Wave 1 (parallel, no file overlap): `05-01-mdx-components-PLAN.md` (Image + CodeBlock + Callout + `mdx-components.tsx` wiring) and `05-02-parallax-hook-PLAN.md` (`useParallax` + test).
  - Wave 2 (depends on Wave 0 stubs + Wave 1 components): `05-03-project-page-PLAN.md` (the integrator).

### Claude's Discretion

Items the planner decides without escalating:

- Exact bilingual placeholder copy for all 12 MDX bodies (250–400 words/locale, first-person, plausible specifics: "loaded 50× faster", "shipped to 200 users", "saved 3 weeks of modeling time").
- Whether to vary the placeholder gradient by category or use ONE shared JPEG for all 24 paths — recommendation: one shared image (lowest friction, signals "swap before deploy").
- Cover hero exact height (60 vh desktop / 50 vh mobile suggested).
- `<MDXImage>` `caption?: string` prop (recommend: yes if ≤2 LOC).
- `<Callout>` `title?: string` prop (recommend: yes, ~5 LOC).
- CodeBlock copy-button position — `opacity-0 group-hover:opacity-100` for hover-only reveal (recommended).
- Gallery `loading="lazy"` everywhere except cover (`priority` + `fetchpriority=high`).
- Gallery layout breakpoints — `grid-cols-1 md:grid-cols-2 gap-4` default.
- Prev/next visual treatment — text-only with `< Title` / `Title >` formatting recommended.
- Exact `data-language` extraction syntax (resolved in §"Code Examples" below — it's `props['data-language']`).
- `generateMetadata` minimum: `{ title: \`${project.title} — Tanguy Delrieu\` }`; Phase 6 expands.

### Deferred Ideas (OUT OF SCOPE)

The planner MUST NOT include any of these in Phase 5 plans:

- Per-route SEO metadata (OG image, hreflang, twitter:card) — Phase 6 `A11Y-01`.
- Sitemap entries for project routes — Phase 6 `A11Y-02`.
- Localized `not-found.tsx`, `loading.tsx`, `error.tsx` — Phase 6 `A11Y-03`.
- Before/after slider MDX component — v2.
- Video reel / YouTube/Vimeo embed MDX component — v2.
- 3D model viewer / Sketchfab embed for BIM projects — `BIM-v2-01`.
- PDF plan viewer for architecture — v2.
- Related projects "more from this domain" footer — v2.
- MDX-driven per-project palette overrides — v2.
- Project reading time estimate, publish/update date — not in REQs.
- Multi-image gallery lightbox with arrow-key nav between images — v2.
- CodeBlock "Edit this code" / sandbox link — v2.
- CodeBlock line highlighting / line numbers — v2.
- `<Callout>` with collapsible body — v2.
- Parallax anywhere except the cover image (NOT on About photo, Skills badges, gallery images, etc.) — Phase 5 ships ONLY cover parallax per `ANIM-02`.
- Scrollytelling / scroll-pinned storytelling on project pages — explicitly OOS per `REQUIREMENTS.md`.
- Real photographic project assets — Phase 5 ships placeholders; user replaces pre-deploy (Phase 7).
- Real case-study body content — Phase 5 ships plausible placeholders; user replaces pre-deploy.
- MDX content authoring guide / README — `_template.{fr,en}.mdx` IS the de-facto authoring example.
- Standalone `/projects` index page — homepage already provides filterable grid.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **CONTENT-01** | 6 projects × 2 locales = 12 `.mdx` files in `content/projects/` with discriminated frontmatter | `lib/projects.ts` already implements the discriminated `Project` union (Phase 1 D-18..D-22). Phase 5 enriches the existing 12 stub bodies per D-01 + adds the optional `gallery?: string[]` field per D-02/D-14. No new loader needed. |
| **CONTENT-02** | `/{locale}/projects/{slug}` renders MDX via `compileMDX`, statically generated (`locale × slug`), shows frontmatter metadata + gallery + MDX content | **Resolved below in §"Standard Stack" + §"Code Examples"** — use **native `await import()` with a RELATIVE path**, NOT `next-mdx-remote/rsc` (which is archived). `generateStaticParams` returns 12 entries; `notFound()` on invalid slug. |
| **CONTENT-03** | `mdx-components.tsx` provides `Image` (zoom modal), `CodeBlock` (rehype-pretty-code + copy + lang badge), `Callout` (info/warning/note + border-left) | `Image` reuses Phase 1 shadcn `Dialog` with `data-lenis-prevent` per LenisProvider D-04. `CodeBlock` is a `<pre>` override consuming `props['data-language']` (verified emit by rehype-pretty-code source, see §"Code Examples"). `Callout` is a Server Component using lucide icons + palette-aliased Tailwind utilities. |
| **ANIM-02** | Subtle parallax on project images via GSAP ScrollTrigger in `useGSAP()` hooks, respects `prefers-reduced-motion` | `lib/hooks/useParallax.ts` wraps `useGSAP({ scope })` + `ScrollTrigger.create({ scrub: 0.5 })` + `gsap.matchMedia()` dual-branch. ScrollTrigger reads Lenis's virtualized scroll position via the Phase 3 LenisProvider `gsap.ticker` bridge — no scroller-proxy needed. |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

The planner MUST verify every Phase 5 task complies with these:

- **No `any` in TypeScript.** All MDX component props, loader return types, hook signatures must be fully typed. `data-language` extraction uses a string narrowing helper (not `as any`).
- **No hardcoded colors anywhere.** Every Callout / CodeBlock / Image / project-page surface uses Tailwind utilities backed by the palette CSS-var chain (`bg-card`, `text-foreground`, `border-border`, `bg-primary/5`, `bg-destructive/5`, `bg-muted`). The wrapping `.dark` class is gone (per Phase 1 D-10).
- **`useGSAP()` everywhere GSAP is used.** `useParallax` wraps `useGSAP({ scope })` — never raw `useEffect`.
- **OKLCh-only color authoring.** No hex, no rgb, no hsl — purely CSS variables.
- **Server Components default, `'use client'` only when interaction.** Project page = server, `<ProjectCover>` micro-island = client (parallax needs DOM), `<Image>` MDX = client (Dialog state), `<CodeBlock>` = client (clipboard + Copy↔Check), `<Callout>` = server.
- **MDX in `content/projects/`** — never in `app/`.
- **Atomic components (1 file = 1 responsibility).** `components/mdx/Image.tsx`, `components/mdx/CodeBlock.tsx`, `components/mdx/Callout.tsx` are atomic; `mdx-components.tsx` is the registry-only file.
- **Translations in `messages/{fr,en}.json`** — parity-gated by `scripts/check-i18n-parity.ts` (Phase 4). New keys MUST appear in both locales.
- **Next 16 conventions.** `proxy.ts` (not `middleware.ts`); `await params` / `await cookies()` / `await headers()`; Turbopack the default.
- **GSD workflow enforcement.** Phase 5 work goes through `/gsd:plan-phase` → `/gsd:execute-phase` — no direct repo edits outside that flow.

## Standard Stack

### Core (ALL already installed in `package.json` — Phase 5 adds ZERO new dependencies)

| Library | Installed Version | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| **`next`** | 16.2.6 | App Router framework, native dynamic-import MDX support, generateStaticParams | Next 16's MDX guide (verified 2026-05-19) demonstrates the canonical `await import('../../content/${slug}.mdx')` pattern for dynamic `[slug]` routes. This is THE supported way to render dynamic MDX per-slug in 2026 without a runtime compiler. |
| **`@next/mdx`** | 16.2.6 | `next.config.ts` MDX integration → applies remark-gfm + rehype-pretty-code at import time | Already wired in `next.config.ts`. When you `await import()` an MDX file, this pipeline runs automatically — no manual `compileMDX` call needed. |
| **`gray-matter`** | 4.0.3 | Frontmatter parser for `lib/projects.ts` | Already wired. Frontmatter unchanged in Phase 5 except optional `gallery?: string[]`. |
| **`rehype-pretty-code`** | 0.14.3 | Shiki-based syntax highlighting at build time | Already wired in `next.config.ts` (`theme: 'github-dark-dimmed'`, `keepBackground: false`). Phase 5 consumes the emitted `data-language` attribute (confirmed by source inspection — see §"Code Examples"). |
| **`remark-gfm`** | 4.0.1 | GFM (tables, strikethrough) | Already wired. No change. |
| **`gsap`** | 3.15.0 | ScrollTrigger for cover parallax | Already installed. `gsap.registerPlugin(ScrollTrigger)` happens at LenisProvider module load (Phase 3). `useParallax` does NOT re-register. |
| **`@gsap/react`** | 2.1.2 | `useGSAP({ scope })` for cleanup + React 19 Strict Mode safety | Already installed. Same pattern Phase 4 About.tsx uses. |
| **`lenis`** | 1.3.23 | Smooth scroll — already bridged to gsap.ticker | Already installed. `ScrollTrigger` reads Lenis's scroll position automatically via the bridge. |
| **`motion`** | 12.40.0 | `<motion.div>` hover cue on `<Image>`, `AnimatePresence` Copy↔Check swap in `<CodeBlock>` | Already installed. Import from `motion/react`. |
| **`lucide-react`** | 1.16.0 | Icons: `Copy`, `Check`, `Info`, `AlertTriangle`, `StickyNote`, `ExternalLink`, `ChevronLeft`, `ChevronRight`, `Github`/`Code2`, `Briefcase`, etc. | Already installed. Reuses Phase 3 D-23 substitutions (no GitHub/LinkedIn brand icons in v1.16). |
| **`radix-ui`** | 1.4.3 | shadcn `<Dialog>` primitive for `<Image>` zoom | Already installed via `radix-ui` umbrella package. Phase 5 reuses `components/ui/dialog.tsx` (Phase 1). |

### Supporting

| Library | Installed Version | Purpose | When to Use |
|---------|-------------------|---------|-------------|
| **`next-intl`** | 4.12.0 | `useTranslations` in client components, `getTranslations({ locale })` in server | `<Image>` uses `useTranslations('projects.detail')` for aria-label; project page uses server-side `getTranslations`. |
| **`@/i18n/navigation`** (project barrel) | n/a | Locale-aware `<Link>` + `useRouter` + `usePathname` | Prev/next links, custom MDX `<a>` override (internal) all use this. Phase 3 D-21 contract. |
| **`@mdx-js/loader`** | 3.1.1 | Transforms MDX → React via `@next/mdx` | Peer dep, no direct usage. |
| **`@mdx-js/react`** | 3.1.1 | MDX → React renderer | Peer dep. NOTE: do NOT use `MDXProvider` context — `mdx-components.tsx` is the App Router convention (per PITFALLS.md Pitfall 8). |
| **`@types/mdx`** | 2.0.13 | TS types for `import('./*.mdx')` | Already installed. Enables `import('@/content/projects/foo.fr.mdx')` to typecheck. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff | Decision |
|------------|-----------|----------|----------|
| **Native `await import()`** (RECOMMENDED) | `next-mdx-remote/rsc` `compileMDX` | next-mdx-remote was ARCHIVED 2026-04-09 — no maintenance. compileMDX requires a separate plugin re-config (remark-gfm + rehype-pretty-code applied via `mdxOptions` instead of `next.config.ts`). | **Use native `await import()` with relative path.** |
| **Native `await import()`** | `next-mdx-remote-client` (community fork) | Maintained fork by ipikuka, but adds a new dependency for marginal benefit. Native pattern works. | **Stick with native — zero new deps.** |
| Dynamic import in `app/[locale]/projects/[slug]/page.tsx` | Hard-code 6 imports + dispatch | Hard-coding means every new project requires a code change. Dynamic import + `generateStaticParams` is the official Next 16 pattern (verified). | **Dynamic import.** |
| `<pre>` override consuming `data-language` | `@rehype-pretty/transformers` `transformerCopyButton` | Adds a runtime client-side script the plugin injects globally; less control over UI; conflicts with our motion AnimatePresence Copy↔Check pattern (reused from Phase 4 D-20). | **`<pre>` override** — total control, reuses Contact clipboard pattern. |
| Single `useParallax` hook | Inline ScrollTrigger.create in `<ProjectCover>` | Inline = no reuse + duplicate matchMedia logic. Hook is single source of truth for the reduced-motion gate. | **Hook in `lib/hooks/useParallax.ts`.** |

**Installation:**

```bash
# Phase 5 adds ZERO new dependencies.
# All required packages are already in package.json.
# Verify with:
npm ls @next/mdx gray-matter rehype-pretty-code remark-gfm gsap @gsap/react lenis motion lucide-react radix-ui
```

**Version verification (npm registry, verified 2026-05-27):**
- `rehype-pretty-code`: `0.14.3` ✓ (matches installed; published February 2026 per npm)
- `@next/mdx`: `16.2.6` ✓ (matches installed; matches Next core major)
- `gray-matter`: `4.0.3` ✓ (matches installed; long-stable since 2018)

## Architecture Patterns

### Recommended Project Structure (additions for Phase 5)

```
content/projects/
├── _template.fr.mdx                 # Updated body to reflect case-study heading structure
├── _template.en.mdx                 # Updated body to reflect case-study heading structure
├── agora.fr.mdx                     # Enriched body per D-01 (4 H2 sections, 250-400 words)
├── agora.en.mdx                     # Enriched body
├── {slug2}.fr.mdx                   # ... × 5 more projects
└── ...

components/mdx/                      # NEW directory
├── Image.tsx                        # Client. shadcn Dialog zoom + data-lenis-prevent + motion hover cue.
├── Image.test.tsx
├── CodeBlock.tsx                    # Client. <pre> override + copy button + lang badge.
├── CodeBlock.test.tsx
├── Callout.tsx                      # Server. 3 variants + lucide icons + palette-aliased bg.
└── Callout.test.tsx

mdx-components.tsx                   # Extended: wires Image/Callout/pre/a override per D-12.

lib/
├── hooks/
│   ├── useParallax.ts               # NEW. Reusable hook (factor + maxTranslate + matchMedia).
│   └── useParallax.test.tsx
└── projects.ts                      # MODIFIED. CommonFields.gallery?: string[] + validator.

app/[locale]/projects/[slug]/
├── page.tsx                         # NEW. Server Component. await params, getProjectBySlug,
│                                    #   notFound(), dynamic import MDX, gallery, prev/next.
└── page.test.tsx                    # (defer if planner judges low-value; project page is
                                     #   integration-heavy; per-component tests cover the units)

components/sections/
└── ProjectCover.tsx                 # NEW micro-island ('use client'). Wraps next/image + useParallax.
                                     #   (Lives in components/sections/ since it's section-level,
                                     #   not MDX-content-level.)

public/projects/{slug}/              # 4 placeholder gallery images per slug × 6 slugs = 24 files
├── 1.jpg
├── 2.jpg
├── 3.jpg
└── 4.jpg

messages/fr.json                     # +1 projects.detail.* namespace (16 leaf keys)
messages/en.json                     # +1 projects.detail.* namespace (16 leaf keys)
```

### Pattern 1: Native dynamic MDX import (CRITICAL — resolves the Wave 2 blocker)

**What:** Use Next 16's first-class dynamic `await import()` pattern with `generateStaticParams` for per-slug MDX routes. Per the official Next.js MDX guide (verified 2026-05-19), this is THE supported pattern for "one MDX file per slug" routing.

**When to use:** Phase 5's `app/[locale]/projects/[slug]/page.tsx`.

**MUST-FOLLOW constraint (Pitfall 8B):** The dynamic import path MUST use a **relative path** (`../../../../content/projects/${slug}.${locale}.mdx`), NOT the `@/` alias. Turbopack's module-graph analyzer cannot statically resolve aliased template literals (`@/content/${slug}.mdx`) but DOES correctly resolve relative-path template literals. This is the Next.js team's currently-documented workaround.

**Example:**

```tsx
// app/[locale]/projects/[slug]/page.tsx (Server Component)
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjectSlugs, type Locale } from '@/lib/projects';
import { routing } from '@/i18n/routing';
import { useMDXComponents } from '@/mdx-components';

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  return { title: `${project.title} — Tanguy Delrieu` };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();

  // MUST be relative path — Turbopack cannot statically analyze `@/` alias template literals.
  // Path resolves from app/[locale]/projects/[slug]/ up 4 levels to repo root, then into content/.
  const { default: MDXContent } = await import(
    `../../../../content/projects/${slug}.${locale}.mdx`
  );

  // ... render: <ProjectCover> + metadata strip + <MDXContent /> + <Gallery> + <PrevNext>
}
```

**Why this is correct (and Pitfall 8 is now SOLVED in Next 16):**
- `PITFALLS.md` Pitfall 8 documented dynamic-import failures in older Next versions where Webpack/Turbopack lost track of the dynamic specifier. Next 16's MDX guide explicitly demonstrates this pattern WITH `generateStaticParams` and notes it works in production. The relative-path constraint is the only remaining gotcha.
- `mdx-components.tsx`'s `useMDXComponents` is auto-discovered by `@next/mdx` at build time when the MDX is processed by the import — components inject into the rendered MDX without an explicit `components={...}` prop.
- All remark/rehype plugins configured in `next.config.ts` (remark-gfm, rehype-pretty-code) run automatically on the imported MDX.

### Pattern 2: `<pre>` override consuming `data-language`

**What:** rehype-pretty-code 0.14.3 emits `data-language="${lang}"` on the `<pre>` element after processing a fenced code block. Phase 5's `mdx-components.tsx` overrides the `pre` MDX component with a custom `CodeBlock` that reads `props['data-language']`, displays a badge, and overlays a copy button.

**Verified via source inspection** of `packages/core/src/index.ts`:
```
Line 94:  pre.properties['data-language'] = lang;
Line 101: code.properties['data-language'] = lang;
```
The wrapping `<figure>` carries `data-rehype-pretty-code-figure=""` (line 60). The plugin also emits `data-theme`, `data-line`, `data-highlighted-line`, etc. — Phase 5 does not consume these.

**When to use:** Phase 5's `components/mdx/CodeBlock.tsx` — see §"Code Examples" for the full implementation.

### Pattern 3: `useParallax` hook over the LenisProvider gsap.ticker bridge

**What:** Build the parallax effect inside `useGSAP({ scope: ref })` so it inherits Phase 3's LenisProvider single-RAF bridge automatically. ScrollTrigger reads `lenis.actualScroll` via the `lenis.on('scroll', ScrollTrigger.update)` listener registered at LenisProvider module load — NO `scroller-proxy` setup needed for Lenis 1.3+ (per Architecture Pattern 5).

**When to use:** `lib/hooks/useParallax.ts` for the cover image; potential v2 reuse for other parallax surfaces (Skills section, About photo).

**Trade-offs:**
- **vs raw `useEffect`:** `useGSAP({ scope })` provides automatic cleanup (Strict Mode safety) and selector scoping — same pattern Phase 4 About.tsx uses.
- **vs `motion`-based `useScroll/useTransform`:** GSAP ScrollTrigger gives `scrub: 0.5` lerp behaviour native to Lenis's frame loop. Motion's `useScroll` reads `window.scrollY` directly and DOES desync from Lenis 1-2 frames (documented in Pitfall 4).
- **vs `gsap.matchMedia({ ... })` at consumer level:** Encapsulating matchMedia inside the hook is the single source of truth for the reduced-motion gate — consumers don't have to re-implement it.

### Pattern 4: MDX RSC boundary (per PITFALLS.md Pitfall 8 + ARCHITECTURE.md Pattern 6)

**What:** The project page (`app/[locale]/projects/[slug]/page.tsx`) is a Server Component (async, no `'use client'`). The MDX components it renders are mixed:
- `<Image>` = client (Dialog state)
- `<CodeBlock>` = client (clipboard + AnimatePresence icon swap)
- `<Callout>` = server (pure presentation)
- `<ProjectCover>` (cover-image client island) = client (uses `useParallax` hook)

Importing a `'use client'` component into MDX works automatically — Next handles the boundary. **Do NOT use `MDXProvider` context** (RSC doesn't support React Context); `mdx-components.tsx` is the App Router convention.

### Anti-Patterns to Avoid

- **❌ Adding `next-mdx-remote` to `package.json`.** Archived 2026-04-09 by HashiCorp. The README header explicitly says "⚠️ This project is archived and is no longer supported ⚠️". Native `await import()` covers our use case.
- **❌ Using `@/content/${slug}.mdx` in the dynamic import.** Turbopack fails to statically analyze aliased template literals. Use relative paths.
- **❌ Re-calling `gsap.registerPlugin(ScrollTrigger)` in `useParallax`.** LenisProvider already does this at module load (Phase 3 D-11). Re-registration is idempotent but redundant. Only `import 'gsap/ScrollTrigger'` for type merging.
- **❌ Wrapping the entire `<CodeBlock>` as a custom MDX component.** Authors would have to write `<CodeBlock language="ts">...</CodeBlock>` instead of ```` ```ts ````. The `<pre>` override keeps MDX prose-friendly.
- **❌ Adding `data-lenis-prevent` on the Dialog `Overlay` or `Trigger`.** Per LenisProvider D-04 contract, it MUST go on `<DialogContent>` (the inner scrollable element). The Overlay is the backdrop (not scrollable); the Trigger is the button.
- **❌ Reading the dynamic-import return value as `mod.default` without destructuring.** Use `const { default: MDXContent } = await import(...)` so TypeScript narrows the component type correctly via `@types/mdx`.
- **❌ Wrapping the project page itself in `'use client'`.** Demotes the whole subtree to client. Only the `<ProjectCover>` micro-island needs `'use client'`.
- **❌ Adding parallax anywhere else.** ANIM-02 requires parallax ONLY on the cover. Gallery images get no parallax (motion-sickness risk per FEATURES.md).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime MDX rendering | Custom MDX→React compiler | Native `await import()` + `@next/mdx` build-time pipeline | Already configured; Next 16 supports dynamic imports for `[slug]` routes officially. |
| Frontmatter parsing | Regex YAML parser | `gray-matter` (already installed) | Edge cases (quoted strings with `:`, multi-line values, escape chars). |
| Syntax highlighting | Prism.js or highlight.js shipped to client | `rehype-pretty-code` (build-time Shiki, zero client cost) | Already configured. Shiki is more accurate (VS Code grammars) and runs at build. |
| Click-to-zoom image modal | Custom modal with overlay + Esc handler | shadcn `<Dialog>` (Radix Dialog under the hood) | Focus trap, Esc, backdrop click, `aria-modal`, focus return — all WCAG-correct. |
| Copy-to-clipboard with feedback | Custom event listener + setState | `navigator.clipboard.writeText` + Phase 4 Contact D-20 pattern | Already proven across 222 tests. Silent fallback on rejection. |
| Smooth scroll desync mitigation | scrollerProxy setup | LenisProvider's `gsap.ticker` bridge (Phase 3 D-02) | Already in place. ScrollTrigger reads Lenis position automatically. |
| Reduced-motion detection | `window.matchMedia('(prefers-reduced-motion: reduce)')` manual listener | `gsap.matchMedia()` for GSAP code; `usePrefersReducedMotion()` (Phase 2) for non-GSAP UI cues | Automatic cleanup on unmount, declarative branches. |
| External-link security | Manual `if (href.startsWith('http'))` everywhere | One `a` override in `mdx-components.tsx` (D-12) | Single audit point; `noopener noreferrer` on every external link in MDX. |

**Key insight:** Every "hard" capability Phase 5 needs already exists in the repo or in installed dependencies. The work is integration and content authoring — NOT new library evaluation.

## Common Pitfalls

### Pitfall 5A: `next-mdx-remote` adoption trap

**What goes wrong:** Following 2024-era guides that recommend `compileMDX` from `next-mdx-remote/rsc` for dynamic MDX. Adding the dependency in May 2026 means consuming an ARCHIVED package; future Next/React updates may break it without a fix.

**Why it happens:** Older PITFALLS.md guidance and 2024 blog posts heavily promoted next-mdx-remote. The archive status was announced on the GitHub repo page on 2026-04-09 but not propagated through tutorials.

**How to avoid:** Use the native `await import()` pattern documented in Next 16's official MDX guide (verified 2026-05-19). Confirm package status before adopting any community MDX library.

**Warning signs:**
- Project repo `git log` shows last commit on next-mdx-remote ≥ 6 months ago.
- README header banner reads "⚠️ This project is archived and is no longer supported ⚠️".
- Releases page stops at v6.0.0 (Feb 2026) with no further activity.

### Pitfall 5B: Dynamic-import aliased path silently breaks in production

**What goes wrong:** `await import(\`@/content/projects/${slug}.${locale}.mdx\`)` works in dev, breaks in `npm run build` with `Module not found`. Turbopack's static analysis can resolve concrete paths but not template-literal aliased paths.

**Why it happens:** Aliases like `@/` are resolved by tsconfig + bundler at build; Turbopack's Rust-based module-graph analyzer requires a syntactically resolvable specifier (relative paths and string literals work; aliases + template literals don't combine).

**How to avoid:** ALWAYS use a relative path in the dynamic import:

```tsx
// FROM: app/[locale]/projects/[slug]/page.tsx
// TO:   content/projects/{slug}.{locale}.mdx
// Distance: up 4 directories (slug → projects → [locale] → app → repo-root → into content)

const { default: MDXContent } = await import(
  `../../../../content/projects/${slug}.${locale}.mdx`
);
```

Add a build-time test (or verification step) that builds the app and verifies the project pages render.

**Warning signs:**
- `npm run dev` works, `npm run build` fails on a project route with `Module not found`.
- Error mentions `@/content/...` as the unresolved path.

### Pitfall 5C: `data-lenis-prevent` on wrong Dialog element

**What goes wrong:** Image zoom Dialog opens; Lenis still scrolls the page behind it when the user scrolls inside the modal. Or worse, ESC works but click-outside-to-close doesn't fire because Lenis intercepted the click.

**Why it happens:** LenisProvider D-04 sets `prevent: (node) => node.hasAttribute('data-lenis-prevent')`. The attribute must go on the **innermost scrollable element**, which for shadcn `Dialog` is the `<DialogContent>` (renders inside `<DialogPortal>` → `<DialogOverlay>` → `<DialogContent>`). Putting it on the Overlay does nothing (Overlay is fixed-position backdrop, not scrollable). Putting it on the Trigger is meaningless (Trigger is the click target, not the panel).

**How to avoid:** Place `data-lenis-prevent` directly on `<DialogContent>`:

```tsx
<DialogContent
  data-lenis-prevent
  className="max-h-screen w-full max-w-7xl p-0"
>
  <Image src={src} alt={alt} width={width} height={height} className="object-contain" />
</DialogContent>
```

**Warning signs:**
- Page scrolls visibly when user scrolls inside the modal.
- Click-outside-to-close fires intermittently.
- Modal scroll feels jittery on desktop (Lenis fighting native).

### Pitfall 5D: `useGSAP({ scope })` selector escapes the ref

**What goes wrong:** `gsap.to('img', { y: -50 })` inside `useGSAP({ scope: ref })` accidentally animates ALL `<img>` elements in the document because the planner forgot to use a data attribute or ref-scoped selector.

**Why it happens:** `useGSAP({ scope })` only scopes selectors that are unambiguous within the ref's DOM subtree. Plain tag selectors like `'img'` can leak to descendants nested deep, including portaled Radix content. The safer pattern is to use a data attribute like `'[data-parallax-image]'` or pass the element directly.

**How to avoid:** Use a data attribute scoped to the parallax target:

```tsx
// Inside <ProjectCover>:
<div ref={ref} className="...">
  <Image data-parallax-image src={src} alt={alt} fill priority />
</div>

// Inside useParallax:
gsap.to('[data-parallax-image]', { y: -maxTranslate, ease: 'none', scrollTrigger: {...} });
```

This matches the Phase 4 Skills pattern (`[data-skill-badge]`) and About pattern (`[data-about-photo]`, `[data-about-paragraph]`).

**Warning signs:**
- Other images on the page also translate during scroll.
- Tests fail with `gsap.to called with selector matching 3 elements, expected 1`.

### Pitfall 5E: rehype-pretty-code `<pre>` is wrapped in a `<figure>` — overriding `pre` doesn't help

**What goes wrong:** You override the `pre` MDX component to add the copy button, but visually the badge appears outside the figure wrapper, or the figure adds unwanted padding/margins around your custom component.

**Why it happens:** rehype-pretty-code wraps each code block in `<figure data-rehype-pretty-code-figure>` → `<pre data-language="...">`. The `pre` override receives ONLY the `<pre>` children, not the figure. If you want the copy button INSIDE the figure (visually adjacent to the pre), you can rely on positioning: the `<pre>` override renders `relative` and the button is `absolute top-2 right-2`. The figure's CSS reset is benign (no padding by default in our setup).

**How to avoid:** Use `relative` on the `<pre>` and `absolute` on the button — DO NOT try to override `figure` separately (you'd lose the data attribute).

```tsx
// CodeBlock.tsx
return (
  <pre data-slot="code-block" className={cn('relative group', props.className)} {...rest}>
    {language && (
      <span className="absolute top-2 left-3 text-xs text-muted-foreground font-mono">
        {language}
      </span>
    )}
    <CopyButton text={rawText} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
    {children}
  </pre>
);
```

**Warning signs:**
- The copy button shows up outside the syntax-highlighted block.
- The figure wrapper has unexpected margins (it doesn't — but if you see them, check `globals.css` for `figure` styles).

### Pitfall 5F: Extracting "raw text" for copy-to-clipboard requires a transformer

**What goes wrong:** The `<pre>` override receives React children (a tree of `<code>` → `<span data-line>` → `<span style="color: ...">text</span>` ...), NOT the raw source string. Calling `navigator.clipboard.writeText(children)` writes `[object Object]` or the rendered DOM string with all the syntax-highlighting spans inlined.

**Why it happens:** rehype-pretty-code runs at build time and converts the fenced source to a styled hAST tree. The original raw text is discarded by the time React renders.

**How to avoid:** Two options, in order of preference:

1. **Use a custom transformer to preserve the raw text on the `<pre>` element** (simplest, no new dependency):

```ts
// next.config.ts — add this transformer in the rehype-pretty-code options
const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-gfm', {}]],
    rehypePlugins: [
      ['rehype-pretty-code', {
        theme: 'github-dark-dimmed',
        keepBackground: false,
        transformers: [
          {
            name: 'preserve-raw',
            // pre = the figure's <pre>; this transformer runs after highlighting.
            pre(node: any) {
              // Find the raw text (rehype-pretty-code stores it during processing).
              const code = node.children.find((c: any) => c.tagName === 'code');
              if (code && code.children) {
                const raw = extractText(code);
                node.properties['data-raw'] = raw;  // Now <pre data-raw="...">
              }
            },
          },
        ],
      }],
    ],
  },
});

function extractText(node: any): string {
  if (node.type === 'text') return node.value;
  if (!node.children) return '';
  return node.children.map(extractText).join('');
}
```

**However** — this adds non-serializable function values to `next.config.ts` options, and Next 16 Turbopack rejects non-serializable plugin options (per `next.config.ts` JSDoc + Next 16 MDX guide warning). The current `next.config.ts` deliberately uses string-form plugin specs.

2. **RECOMMENDED for Phase 5 — extract raw text client-side from the rendered DOM** (no transformer, no config change):

```tsx
// CodeBlock.tsx — Client Component
'use client';
import { useRef } from 'react';
// ...
export default function CodeBlock(props: React.HTMLAttributes<HTMLPreElement> & { 'data-language'?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const language = typeof props['data-language'] === 'string' ? props['data-language'] : 'text';

  const onCopy = async () => {
    if (!preRef.current) return;
    // textContent strips all spans, gives back the original source.
    const raw = preRef.current.textContent ?? '';
    try { await navigator.clipboard.writeText(raw); } catch {} // silent fallback (Phase 2 D-02)
    // ... setCopied(true) etc.
  };

  return (
    <pre ref={preRef} {...props}>
      <CopyButton onClick={onCopy} ... />
      {props.children}
    </pre>
  );
}
```

`preRef.current.textContent` walks the DOM and concatenates all text — preserves the original code 1:1 because Shiki only wraps tokens in spans without inserting/removing characters. This is the simplest, most portable approach.

**Warning signs:**
- Pasted text contains HTML spans (`<span style="color: ...">...</span>`).
- Pasted text is `[object Object]`.
- Pasted text has missing line breaks.

### Pitfall 5G: 4 H2 sections in MDX clash with `max-w-prose` heading sizes

**What goes wrong:** MDX renders `## Contexte` as `<h2>` with default Tailwind sizing, which inside `max-w-prose` (65ch) might look smaller than expected on desktop. Authors then add `<h2 className="text-3xl">` overrides per file, defeating the convention.

**Why it happens:** No prose typography is wired in `globals.css`. `max-w-prose` only constrains width, not heading sizes.

**How to avoid:** Add `h1/h2/h3/p/ul/ol/a/blockquote` overrides to `mdx-components.tsx` (per D-12 it's the convention point):

```tsx
// mdx-components.tsx — Phase 5 extends Phase 1 scaffold
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Image,
    Callout,
    pre: CodeBlock,
    h1: ({ children, ...rest }) => <h1 className="text-4xl font-semibold mt-12 mb-6 text-foreground" {...rest}>{children}</h1>,
    h2: ({ children, ...rest }) => <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground" {...rest}>{children}</h2>,
    h3: ({ children, ...rest }) => <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground" {...rest}>{children}</h3>,
    p: ({ children, ...rest }) => <p className="text-foreground/90 leading-relaxed my-4" {...rest}>{children}</p>,
    ul: ({ children, ...rest }) => <ul className="list-disc pl-6 my-4 space-y-2 text-foreground/90" {...rest}>{children}</ul>,
    ol: ({ children, ...rest }) => <ol className="list-decimal pl-6 my-4 space-y-2 text-foreground/90" {...rest}>{children}</ol>,
    blockquote: ({ children, ...rest }) => <blockquote className="border-l-4 border-primary/40 pl-4 italic my-6 text-muted-foreground" {...rest}>{children}</blockquote>,
    a: ({ href, children, ...rest }) => {
      if (!href) return <a {...rest}>{children}</a>;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline" {...rest}>{children}</a>;
      }
      return <Link href={href as never} className="text-primary underline-offset-4 hover:underline" {...rest}>{children}</Link>;
    },
  };
}
```

**Warning signs:**
- Default MDX prose looks like Tailwind reset (no headings sized, no list bullets) — that's the default if you don't override.
- Body width is `max-w-prose` (good) but headings look identical to body text (bad — needs the override).

## Code Examples

Verified patterns ready for the planner to paste into task content.

### 1. `lib/projects.ts` extension (D-14)

```typescript
// Patch to existing lib/projects.ts — add 1 optional field to CommonFields.
// All 3 variant types inherit it automatically.
// Validator accepts but does NOT require the field — backward-compatible with all 12 existing stubs.

type CommonFields = {
  slug: string;
  title: string;
  year: number;
  cover: string;
  summary: string;
  featured: boolean;
  gallery?: string[];  // NEW (D-14) — optional. Asset paths under /public/projects/{slug}/.
};

// In validateFrontmatter() — after building `common`:
const galleryValid =
  data.gallery === undefined ||
  (Array.isArray(data.gallery) && data.gallery.every((s): s is string => typeof s === 'string'));

if (!galleryValid) {
  throw new Error(
    `[lib/projects] '${slug}' has invalid 'gallery': expected string[] or undefined, got ${typeof data.gallery}.`,
  );
}

const common = {
  slug,
  title: typeof data.title === 'string' ? data.title : '',
  year: typeof data.year === 'number' ? data.year : 0,
  cover: typeof data.cover === 'string' ? data.cover : '',
  summary: typeof data.summary === 'string' ? data.summary : '',
  featured: typeof data.featured === 'boolean' ? data.featured : false,
  ...(Array.isArray(data.gallery) ? { gallery: data.gallery as string[] } : {}),
};
```

### 2. `lib/hooks/useParallax.ts` (D-13, ANIM-02)

```typescript
// lib/hooks/useParallax.ts — Client-only hook (consumers must be in 'use client' files).
// gsap.registerPlugin(ScrollTrigger) is already done at LenisProvider module load (Phase 3 D-11).
// This hook just imports ScrollTrigger for type merging (side-effect-only import).

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import 'gsap/ScrollTrigger';  // Type merge only — registration already done.
import type { RefObject } from 'react';

export type UseParallaxOptions = {
  factor?: number;       // Default 0.3 — fraction of scroll distance to translate.
  maxTranslate?: number; // Default 50 (px) — clamp so we never reveal the wrapper bg.
};

/**
 * useParallax — wraps a ref-scoped element so its [data-parallax-image] child
 * translates upward as the wrapper scrolls past the viewport top.
 *
 * D-05 contract:
 *   - factor: 0.3 (default), maxTranslate: 50 (default)
 *   - ScrollTrigger.create on the wrapper ref:
 *       start: 'top top', end: 'bottom top', scrub: 0.5
 *       animation: gsap.to('[data-parallax-image]', { y: -maxTranslate, ease: 'none' })
 *   - gsap.matchMedia dual-branch:
 *       (prefers-reduced-motion: no-preference) — installs scrub animation
 *       (prefers-reduced-motion: reduce)        — gsap.set y:0, no ScrollTrigger
 *   - useGSAP({ scope }) provides automatic cleanup on unmount + Strict Mode safety.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  options: UseParallaxOptions = {},
): void {
  const { maxTranslate = 50 } = options;
  // factor is reserved for future tuning; current implementation uses maxTranslate directly.

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
            // Reduced-motion: snap image to neutral position, no ScrollTrigger.
            gsap.set('[data-parallax-image]', { y: 0 });
            return;
          }
          gsap.to('[data-parallax-image]', {
            y: -maxTranslate,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        },
      );
    },
    { scope: ref, dependencies: [maxTranslate] },
  );
}
```

### 3. `components/sections/ProjectCover.tsx` (Wave 2 client island)

```tsx
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useParallax } from '@/lib/hooks/useParallax';

export type ProjectCoverProps = {
  src: string;
  alt: string;
};

/**
 * ProjectCover — small client island wrapping the cover image in a parallax-scoped ref.
 *
 * D-04: 60vh desktop / 50vh mobile (responsive via Tailwind).
 * D-05: image rendered at scale: 1.2 so the parallax translate (max 50px upward) never
 *       reveals the wrapper's bg through the bottom edge.
 *       overflow-hidden on wrapper clips the overshoot.
 * D-13: useParallax({ factor: 0.3, maxTranslate: 50 }) — defaults match D-05.
 */
export function ProjectCover({ src, alt }: ProjectCoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref);  // Use defaults — factor 0.3, maxTranslate 50.

  return (
    <div
      ref={ref}
      className="relative h-[50vh] w-full overflow-hidden md:h-[60vh]"
    >
      <Image
        data-parallax-image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ scale: 1.2 }}
      />
      {/* Dark gradient overlay for metadata strip readability */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
      />
    </div>
  );
}
```

### 4. `components/mdx/Image.tsx` (D-09, CONTENT-03)

```tsx
'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

export type MDXImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;  // Discretion: planner recommended yes.
};

/**
 * <Image> MDX component — click-to-zoom modal via shadcn Dialog.
 *
 * D-09 contract:
 *   - 'use client' (owns Dialog open state).
 *   - data-lenis-prevent on <DialogContent> (LenisProvider D-04 contract).
 *   - useReducedMotion gates the hover scale 1.0 → 1.02 / 200ms cue.
 *   - aria-label via projects.detail.imageZoom i18n key.
 *
 * Pitfall 5C: attribute MUST be on DialogContent, not Overlay, not Trigger.
 */
export default function MDXImage({ src, alt, width, height, caption }: MDXImageProps) {
  const t = useTranslations('projects.detail');
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          type="button"
          aria-label={t('imageZoom')}
          whileHover={reducedMotion ? undefined : { scale: 1.02 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="my-6 block w-full cursor-zoom-in overflow-hidden rounded-lg"
        >
          <NextImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="(max-width: 768px) 100vw, 800px"
            loading="lazy"
            className="h-auto w-full object-cover"
          />
          {caption && (
            <span className="mt-2 block text-sm text-muted-foreground">{caption}</span>
          )}
        </motion.button>
      </DialogTrigger>
      <DialogContent
        data-lenis-prevent
        showCloseButton={true}
        className="max-h-screen w-full max-w-7xl p-2"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="100vw"
          className="h-auto max-h-[90vh] w-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 5. `components/mdx/CodeBlock.tsx` (D-10, CONTENT-03)

```tsx
'use client';

import { useRef, useState, type HTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * <pre> override consumed by mdx-components.tsx D-12.
 *
 * D-10 contract:
 *   - rehype-pretty-code 0.14.3 emits data-language="<lang>" on <pre> (verified by
 *     source inspection of packages/core/src/index.ts line 94).
 *   - <pre> is wrapped in <figure data-rehype-pretty-code-figure> automatically.
 *   - This component renders the original <pre> with:
 *     * Language badge (absolute top-left)
 *     * Copy-to-clipboard button (absolute top-right, hover-reveal via group)
 *   - Copy button: reuses Phase 4 Contact D-20 pattern verbatim.
 *     navigator.clipboard.writeText → silent fallback on rejection (Phase 2 D-02).
 *     AnimatePresence mode='wait' swaps Copy ↔ Check (1.5s revert).
 *
 * Pitfall 5F: raw text extracted via preRef.current.textContent (walks DOM, gives
 * back original source 1:1 since Shiki wraps tokens without inserting/removing chars).
 */

export default function CodeBlock({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLPreElement> & {
  'data-language'?: string;
  'data-theme'?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const t = useTranslations('projects.detail');
  const [copied, setCopied] = useState(false);

  const language =
    typeof props['data-language'] === 'string' ? props['data-language'] : 'text';

  const onCopy = async () => {
    if (!preRef.current) return;
    const raw = preRef.current.textContent ?? '';
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent fallback per Phase 2 D-02 precedent.
    }
  };

  return (
    <pre
      ref={preRef}
      data-slot="code-block"
      className={cn(
        'group relative my-6 overflow-x-auto rounded-lg bg-card p-4 text-sm',
        className,
      )}
      {...props}
    >
      <span className="absolute top-2 left-3 z-10 text-xs font-mono text-muted-foreground select-none">
        {language}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? t('copied') : t('copy')}
        className="absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group-hover:opacity-100"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {children}
    </pre>
  );
}
```

### 6. `components/mdx/Callout.tsx` (D-11, CONTENT-03)

```tsx
// Server Component — no 'use client' (pure presentational).
import type { ReactNode } from 'react';
import { Info, AlertTriangle, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutVariant = 'info' | 'warning' | 'note';

export type CalloutProps = {
  variant?: CalloutVariant;
  title?: string;  // Discretion: planner recommended yes.
  children: ReactNode;
};

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { Icon: typeof Info; container: string; iconColor: string }
> = {
  info: {
    Icon: Info,
    container: 'border-l-primary bg-primary/5',
    iconColor: 'text-primary',
  },
  warning: {
    Icon: AlertTriangle,
    container: 'border-l-destructive bg-destructive/5',
    iconColor: 'text-destructive',
  },
  note: {
    Icon: StickyNote,
    container: 'border-l-border bg-muted',
    iconColor: 'text-muted-foreground',
  },
};

/**
 * <Callout> MDX component — info/warning/note variants.
 *
 * D-11 contract:
 *   - Server component (pure presentation, no interaction).
 *   - flex gap-3 rounded-lg border-l-4 p-4 my-6.
 *   - info: bg-primary/5, border-l-primary, icon Info text-primary.
 *   - warning: bg-destructive/5, border-l-destructive, icon AlertTriangle text-destructive.
 *     (destructive token is fixed OKLCh per Phase 1 D-12 — palette-independent warning signal.)
 *   - note: bg-muted, border-l-border, icon StickyNote text-muted-foreground.
 *   - MDX children render as <div className="flex-1">{children}</div> (paragraphs inherit
 *     the prose styling from mdx-components.tsx h2/p overrides — no nested re-styling).
 *
 * Usage in MDX:
 *   <Callout variant="info" title="Note technique">
 *     Body text here.
 *   </Callout>
 */
export function Callout({ variant = 'note', title, children }: CalloutProps) {
  const { Icon, container, iconColor } = VARIANT_CONFIG[variant];

  return (
    <div
      role="note"
      className={cn(
        'my-6 flex gap-3 rounded-lg border-l-4 p-4 text-foreground',
        container,
      )}
    >
      <Icon
        className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)}
        aria-hidden="true"
      />
      <div className="flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
```

### 7. `mdx-components.tsx` extension (D-12, CONTENT-03)

```tsx
import type { MDXComponents } from 'mdx/types';
import MDXImage from '@/components/mdx/Image';
import CodeBlock from '@/components/mdx/CodeBlock';
import { Callout } from '@/components/mdx/Callout';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * mdx-components.tsx — App Router convention (required by @next/mdx).
 *
 * D-12: extends Phase 1 scaffold with:
 *   - Image (zoom modal)
 *   - Callout (3 variants)
 *   - pre: CodeBlock (override <pre> for copy button + lang badge)
 *   - a (external → target=_blank+rel; internal → locale-aware Link from @/i18n/navigation)
 *   - h1/h2/h3/p/ul/ol/blockquote (prose styling — Pitfall 5G mitigation)
 *
 * Pitfall 8 (PITFALLS.md): mdx-components.tsx is the App Router convention.
 *   Do NOT use MDXProvider context from @mdx-js/react — RSC doesn't support React Context.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Custom MDX components (D-09..D-11).
    Image: MDXImage,
    Callout,

    // <pre> override for syntax-highlighted code blocks (D-10).
    pre: CodeBlock,

    // External vs internal link routing (D-12).
    a: ({ href, children, className, ...rest }) => {
      if (!href) return <a className={cn('text-primary underline-offset-4 hover:underline', className)} {...rest}>{children}</a>;
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('text-primary underline-offset-4 hover:underline', className)}
            {...rest}
          >
            {children}
          </a>
        );
      }
      // Internal link → next-intl locale-aware Link.
      return (
        <Link
          href={href as never}
          className={cn('text-primary underline-offset-4 hover:underline', className)}
        >
          {children}
        </Link>
      );
    },

    // Prose styling (Pitfall 5G).
    h1: ({ children, ...rest }) => (
      <h1 className="mt-12 mb-6 text-4xl font-semibold text-foreground" {...rest}>
        {children}
      </h1>
    ),
    h2: ({ children, ...rest }) => (
      <h2 className="mt-10 mb-4 text-2xl font-semibold text-foreground" {...rest}>
        {children}
      </h2>
    ),
    h3: ({ children, ...rest }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground" {...rest}>
        {children}
      </h3>
    ),
    p: ({ children, ...rest }) => (
      <p className="my-4 leading-relaxed text-foreground/90" {...rest}>
        {children}
      </p>
    ),
    ul: ({ children, ...rest }) => (
      <ul className="my-4 list-disc space-y-2 pl-6 text-foreground/90" {...rest}>
        {children}
      </ul>
    ),
    ol: ({ children, ...rest }) => (
      <ol className="my-4 list-decimal space-y-2 pl-6 text-foreground/90" {...rest}>
        {children}
      </ol>
    ),
    blockquote: ({ children, ...rest }) => (
      <blockquote className="my-6 border-l-4 border-primary/40 pl-4 italic text-muted-foreground" {...rest}>
        {children}
      </blockquote>
    ),
  };
}
```

### 8. `app/[locale]/projects/[slug]/page.tsx` (D-04..D-08, CONTENT-02)

```tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import NextImage from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Github,
  Briefcase,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getProjectBySlug, getProjectSlugs, type Locale } from '@/lib/projects';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { ProjectCover } from '@/components/sections/ProjectCover';
import MDXImage from '@/components/mdx/Image';  // For gallery cells (reuse zoom UX).

type Params = Promise<{ locale: Locale; slug: string }>;

// D-06: pre-render all locale × slug combos.
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

// Phase 5 minimum metadata. Phase 6 (A11Y-01) expands to full OG + hreflang.
export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  return { title: `${project.title} — Tanguy Delrieu` };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();  // D-07

  // Pitfall 5B: MUST be relative path — Turbopack cannot statically analyze @/ in template literals.
  // From app/[locale]/projects/[slug]/page.tsx → repo root → content/projects/ = up 4 levels.
  const { default: MDXContent } = await import(
    `../../../../content/projects/${slug}.${locale}.mdx`
  );

  // D-08: prev/next wrap-around.
  const slugs = await getProjectSlugs();
  const idx = slugs.indexOf(slug);
  const nextSlug = slugs[(idx + 1) % slugs.length];
  const prevSlug = slugs[(idx - 1 + slugs.length) % slugs.length];
  const nextProject = await getProjectBySlug(nextSlug, locale);
  const prevProject = await getProjectBySlug(prevSlug, locale);

  const t = await getTranslations({ locale, namespace: 'projects.detail' });

  return (
    <article>
      {/* D-04 Step 1: Cover hero with parallax (client island). */}
      <ProjectCover src={project.cover} alt={project.title} />

      {/* D-04 Step 2: Metadata strip (overlay on cover bottom). */}
      <div className="-mt-32 mb-12 px-4">
        <div className="mx-auto max-w-5xl space-y-4 rounded-lg bg-card p-6 shadow-lg">
          <h1 className="text-4xl font-semibold text-card-foreground md:text-5xl">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {project.year}
            </span>
            <Badge variant={`category-${project.category}`}>
              {t(`meta.${project.category}`)}
            </Badge>
            {/* Discriminated metadata per category */}
            {project.category === 'tech' && (
              <>
                {project.stack.slice(0, 4).map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('meta.repo')}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                    {t('meta.repo')}
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('meta.live')}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {t('meta.live')}
                  </a>
                )}
              </>
            )}
            {project.category === 'design' && (
              <>
                {project.tools.slice(0, 4).map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
                {project.client && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                    {t('meta.client')}: {project.client}
                  </span>
                )}
              </>
            )}
            {project.category === 'bim' && (
              <>
                {project.software.slice(0, 4).map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
                <Badge variant="outline">{t(`meta.scale.${project.projectScale}`)}</Badge>
                {project.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {project.location}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* D-04 Step 3: MDX body. */}
      <div className="mx-auto max-w-prose px-4 py-12">
        <MDXContent />
      </div>

      {/* D-04 Step 4: Gallery grid — only if frontmatter.gallery is non-empty. */}
      {project.gallery && project.gallery.length > 0 && (
        <section aria-labelledby="gallery-heading" className="mx-auto max-w-5xl px-4 py-12">
          <h2 id="gallery-heading" className="mb-6 text-2xl font-semibold text-foreground">
            {t('gallery')}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {project.gallery.map((src, i) => (
              <MDXImage
                key={src}
                src={src}
                alt={`${project.title} — ${i + 1}`}
                width={1200}
                height={800}
              />
            ))}
          </div>
        </section>
      )}

      {/* D-04 Step 5: Footer nav (back + prev/next). */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <Link
            href={{ pathname: '/', hash: 'projects' } as never}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('back')}
          </Link>
          <div className="flex items-center gap-4">
            {prevProject && (
              <Link
                href={`/projects/${prevSlug}` as never}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('prev')}:</span>
                <span className="font-medium">{prevProject.title}</span>
              </Link>
            )}
            {nextProject && (
              <Link
                href={`/projects/${nextSlug}` as never}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <span className="font-medium">{nextProject.title}</span>
                <span className="hidden sm:inline">:{t('next')}</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}
```

### 9. i18n keys to add (`messages/{fr,en}.json` `projects.detail.*` namespace)

```json
// messages/fr.json — additive change to existing structure
{
  "projects": {
    "detail": {
      "back": "Tous les projets",
      "prev": "Précédent",
      "next": "Suivant",
      "gallery": "Galerie",
      "imageZoom": "Zoomer l'image",
      "copy": "Copier",
      "copied": "Copié !",
      "meta": {
        "tech": "Tech",
        "design": "Design",
        "bim": "BIM",
        "year": "Année",
        "stack": "Stack",
        "tools": "Outils",
        "software": "Logiciels",
        "scale": {
          "concept": "Concept",
          "residential": "Résidentiel",
          "commercial": "Commercial",
          "urban": "Urbain"
        },
        "location": "Lieu",
        "repo": "Code",
        "live": "Voir en ligne",
        "client": "Client"
      }
    }
  }
}

// messages/en.json — parity-equivalent
{
  "projects": {
    "detail": {
      "back": "All projects",
      "prev": "Previous",
      "next": "Next",
      "gallery": "Gallery",
      "imageZoom": "Zoom image",
      "copy": "Copy",
      "copied": "Copied!",
      "meta": {
        "tech": "Tech",
        "design": "Design",
        "bim": "BIM",
        "year": "Year",
        "stack": "Stack",
        "tools": "Tools",
        "software": "Software",
        "scale": {
          "concept": "Concept",
          "residential": "Residential",
          "commercial": "Commercial",
          "urban": "Urban"
        },
        "location": "Location",
        "repo": "Source",
        "live": "Live demo",
        "client": "Client"
      }
    }
  }
}
```

Total: 22 new leaf keys per locale × 2 locales = 44 additions. `scripts/check-i18n-parity.ts` (Phase 4) MUST pass after.

### 10. MDX body template (per D-01)

```mdx
---
slug: agora
title: Agora
year: 2023
category: tech
cover: /projects/agora/cover.jpg
summary: Plateforme web de discussions thématiques avec modération communautaire.
featured: true
stack:
  - Next.js
  - TypeScript
  - Prisma
  - PostgreSQL
repo: https://github.com/tanguynoumea/agora
gallery:
  - /projects/agora/1.jpg
  - /projects/agora/2.jpg
  - /projects/agora/3.jpg
  - /projects/agora/4.jpg
---

## Contexte

Agora est née d'un constat simple : les forums en ligne traditionnels privilégient
le volume au détriment de la qualité des échanges. J'ai conçu cette plateforme pour
explorer comment un système de modération communautaire couplé à des fils thématiques
courts pouvait inverser cette tendance, et la tester avec une promotion de 80 étudiants
sur trois mois.

## Défi

Le défi technique principal était de bâtir un système de votes pondérés par la
réputation des utilisateurs — sans pour autant créer une hiérarchie figée qui aurait
découragé les nouvelles voix. Côté produit, il fallait trouver l'équilibre entre
le contrôle automatisé (anti-spam, anti-toxicité) et l'agilité de modération humaine.

## Processus

J'ai démarré par une semaine de prototypes Figma testés en chambre auprès de 6
utilisateurs cibles. Les retours ont conduit à abandonner un système initial de
"karma" trop proche de Reddit, au profit d'un score de pertinence local à chaque
thématique. Côté backend, j'ai opté pour PostgreSQL avec Prisma plutôt que MongoDB
pour pouvoir exprimer les contraintes relationnelles complexes (votes ↔ utilisateurs
↔ fils ↔ tags) sans gymnastique.

<Callout variant="info" title="Choix technique">
  Prisma + PostgreSQL plutôt que Mongo : la modélisation relationnelle des votes
  pondérés impose des jointures fréquentes que MongoDB rendait verbeuses.
</Callout>

Le déploiement initial a tourné sur un VPS Hetzner à 5 €/mois, ce qui a forcé une
optimisation continue des requêtes SQL via `EXPLAIN ANALYZE` — un exercice formateur
que je referais.

## Résultat

Sur 3 mois d'usage, Agora a hébergé 1 200 messages dans 80 fils thématiques, avec
un taux de modération automatique de 84 % (le reste traité par 4 modérateurs
volontaires). La latence p95 est restée sous 200 ms malgré le matériel modeste.
Le projet est aujourd'hui en pause — le besoin pédagogique initial étant rempli — mais
le code reste ouvert sur GitHub pour quiconque voudrait s'en inspirer.
```

Apply the same 4-heading scaffold to all 12 stub files (6 projects × 2 locales). Use category-specific frontmatter (Tech = `stack` + optional `repo`/`liveUrl`; Design = `tools` + optional `client`; BIM = `software` + `projectScale` + optional `location`). Only 2 projects (one Tech + one Design, planner's choice — recommend `texture-manager.{fr,en}.mdx` + a Design slug) ship with `gallery` populated; the other 4 omit it (validates the optional-field behaviour).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-mdx-remote/rsc` `compileMDX` for dynamic MDX routes | Native `await import()` with `generateStaticParams` (Next 16 official pattern) | next-mdx-remote ARCHIVED 2026-04-09; Next 16 MDX guide formalized the dynamic-import pattern | Zero new dependencies; rehype-pretty-code + remark-gfm continue to run via `next.config.ts` automatically |
| Aliased dynamic import (`@/content/${slug}.mdx`) | Relative dynamic import (`../../../../content/projects/${slug}.${locale}.mdx`) | Turbopack module-graph constraint (Next 16 default bundler) | Slightly less ergonomic path but proven to work in production |
| `Lottie` for animated micro-icons | Inline lucide-react + motion's `<motion.svg>` or GSAP timeline | Lottie's bundle cost (50KB+) for a single icon is disproportionate | Smaller bundle, palette-aware coloring via `currentColor` |
| `tailwindcss-animate` | `tw-animate-css` (default in shadcn for Tailwind v4) | shadcn migration to Tailwind v4 (2025) | Phase 5 inherits — no action needed |
| `MDXProvider` context from `@mdx-js/react` | `mdx-components.tsx` convention | App Router doesn't support React Context in Server Components | Single registry file, no provider boilerplate |

**Deprecated/outdated:**
- `next-mdx-remote` (`hashicorp/next-mdx-remote`): Archived 2026-04-09 by HashiCorp; no longer accepts contributions, no future React/Next compatibility patches. **DO NOT add as new dependency in May 2026.** Native Next 16 pattern is the replacement.
- `@studio-freight/lenis`: Renamed to `lenis` (Phase 3 STACK.md). Already migrated.
- `framer-motion`: Renamed to `motion`. Already migrated (Phase 2 W0).
- `middleware.ts` for next-intl in Next 16: Renamed to `proxy.ts`. Already migrated (Phase 1).
- PITFALLS.md Pitfall 8's "dynamic imports fail in production": Outdated for Next 16 — official MDX guide (2026-05-19) demonstrates the pattern. The relative-path constraint replaces the broader "don't use dynamic imports" advice.

## Open Questions

None — all D-01..D-15 decisions are locked, all Discretion items have recommendations in §"Code Examples" or §"User Constraints", all critical technical questions resolved.

The single residual unknown is **which 2 projects to populate `gallery` on** — this is Discretion. Recommendation: `texture-manager.{fr,en}.mdx` (Tech, demonstrates code + screenshots) + `casa-tropical.{fr,en}.mdx` (or whichever Design slug exists, demonstrates visual gallery).

## Runtime State Inventory

> Phase 5 is **net-additive content + components**, not a rename/refactor. This section is included for completeness (per researcher protocol Step 2.5) but most categories return "none".

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no DB, no Mem0, no Redis, no localStorage state new in Phase 5 | None |
| Live service config | None — no n8n workflows, no Datadog, no external service config | None |
| OS-registered state | None — Phase 5 is build-time + runtime only | None |
| Secrets/env vars | None — Phase 5 introduces no new env vars (no analytics keys yet — Phase 7) | None |
| Build artifacts | **`.next/` cache MUST be invalidated** after adding `gallery?: string[]` to `CommonFields` because the frontmatter validator branch changes (existing stubs validate, new ones with gallery validate too) | Run `rm -rf .next && npm run build` to confirm clean build after Wave 0 type extension |

## Environment Availability

> Phase 5 depends on tools already in use (Phase 4 ships 222/222 tests). This audit is a sanity check, not a discovery exercise.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All builds | ✓ | ≥ 20.9 (per Next 16 minimum) | — |
| npm | Dependency install | ✓ | bundled with Node | — |
| Vitest | Unit + component tests | ✓ | 4.1.7 | — |
| jsdom | DOM environment for Vitest | ✓ | 29.1.1 | — |
| @testing-library/react | RTL render + queries | ✓ | 16.3.2 | — |
| @testing-library/jest-dom | Custom matchers (note: Phase 4 used native chai matchers in setupFiles:[] mode — Phase 5 follows precedent) | ✓ | 6.9.1 | Native chai matchers |
| Image placeholder (existing JPEG) | Wave 0 seed for `public/projects/{slug}/[1-4].jpg` × 24 | ✓ | n/a | Generate gradient PNG via `node` if needed |
| `scripts/check-i18n-parity.ts` | Verify projects.detail.* parity FR/EN | ✓ | Phase 4 | — |
| Turbopack | Default bundler — must NOT silently break dynamic import | ✓ | bundled with Next 16.2.6 | Webpack via `--no-turbo` flag (escape hatch only) |
| shadcn `<Dialog>` component | `<Image>` zoom modal | ✓ | `components/ui/dialog.tsx` Phase 1 | — |
| shadcn `<Button>` component | `<CodeBlock>` copy button styling consistency | ✓ | `components/ui/button.tsx` Phase 1 | — |
| shadcn `<Badge>` component | Project metadata strip variants | ✓ | `components/ui/badge.tsx` Phase 4 W0 | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None — every dependency is already installed and tested.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (set up Phase 2 W0) |
| Quick run command | `npm test components/mdx/` (~5 s) for Wave 1; `npm test lib/hooks/useParallax` (~3 s) for Wave 1.2 |
| Full suite command | `npm test` (~30 s, current baseline 222/222 green) |
| Per-task commit | `npm test {touched-test-file}` |
| Per-wave merge | `npm test` + `npm run lint` + `npm run build` (verifies dynamic-import build success) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **CONTENT-01** | All 12 MDX bodies have the 4 H2 sections (Contexte/Défi/Processus/Résultat in FR; Context/Challenge/Process/Outcome in EN) | unit (Node) | `npx tsx scripts/check-mdx-structure.ts` — reads each `content/projects/*.mdx`, parses with gray-matter, asserts body contains 4 H2 markers matching the locale | ❌ Wave 0 |
| **CONTENT-01** | Each MDX body has 250-400 words (excluding frontmatter) | unit (Node) | Same script — counts words via `body.split(/\s+/).filter(Boolean).length`, asserts range | ❌ Wave 0 |
| **CONTENT-01** | i18n parity FR/EN at `projects.detail.*` namespace | unit (Node) | `npx tsx scripts/check-i18n-parity.ts` (already exists per Phase 4) | ✅ (Phase 4) |
| **CONTENT-02** | `generateStaticParams` returns 12 entries (6 slugs × 2 locales) | unit | `npm test app/[locale]/projects/[slug]/page.test.tsx -t 'generateStaticParams returns 12'` | ❌ Wave 2 |
| **CONTENT-02** | `notFound()` called when invalid slug passed | unit | `npm test app/[locale]/projects/[slug]/page.test.tsx -t 'notFound on invalid slug'` (mock `getProjectBySlug` to return null, assert `notFound` mock called) | ❌ Wave 2 |
| **CONTENT-02** | Gallery section renders ONLY when `gallery?.length > 0` | unit | `npm test app/[locale]/projects/[slug]/page.test.tsx -t 'gallery render gating'` (two cases: with-gallery renders `<section>`, without-gallery does not) | ❌ Wave 2 |
| **CONTENT-02** | Metadata strip renders discriminated badges per category | unit | `npm test app/[locale]/projects/[slug]/page.test.tsx -t 'metadata strip discriminator'` (three cases: tech → stack badges + repo/live links; design → tools + client; bim → software + scale + location) | ❌ Wave 2 |
| **CONTENT-02** | Prev/next wraps around (last → first, first → last) | unit | `npm test app/[locale]/projects/[slug]/page.test.tsx -t 'prev next wrap'` | ❌ Wave 2 |
| **CONTENT-02** | Production build emits 12 static `.html` files | smoke | `npm run build && ls .next/server/app/fr/projects/*/index.html .next/server/app/en/projects/*/index.html | wc -l` should equal 12 | manual or CI step |
| **CONTENT-03** | `<Image>` opens Dialog with `data-lenis-prevent` on DialogContent | unit | `npm test components/mdx/Image.test.tsx -t 'Dialog opens with data-lenis-prevent'` (mock shadcn Dialog, assert `data-lenis-prevent` attribute on Content render) | ❌ Wave 1 |
| **CONTENT-03** | `<Image>` Dialog Esc/backdrop close | manual | manual smoke during execute-phase | manual UAT |
| **CONTENT-03** | `<CodeBlock>` extracts `data-language` and renders badge | unit | `npm test components/mdx/CodeBlock.test.tsx -t 'extracts data-language attribute'` (render with `data-language="ts"`, assert badge text "ts") | ❌ Wave 1 |
| **CONTENT-03** | `<CodeBlock>` copy button fires `navigator.clipboard.writeText` with raw text | unit | `npm test components/mdx/CodeBlock.test.tsx -t 'copy button calls clipboard'` (mock `navigator.clipboard`, fire click, assert call with `preRef.current.textContent`) | ❌ Wave 1 |
| **CONTENT-03** | `<CodeBlock>` Copy↔Check icon swap + 1.5s revert | unit | `npm test components/mdx/CodeBlock.test.tsx -t 'icon swap and revert'` (use `vi.useFakeTimers`, advance 1500ms, assert Copy icon back) | ❌ Wave 1 |
| **CONTENT-03** | `<Callout>` renders 3 variants with correct icons | unit | `npm test components/mdx/Callout.test.tsx -t 'variant icon mapping'` (3 cases: info → Info icon name, warning → AlertTriangle, note → StickyNote) | ❌ Wave 1 |
| **CONTENT-03** | `<Callout>` uses palette-aliased Tailwind classes | unit | `npm test components/mdx/Callout.test.tsx -t 'no hardcoded colors'` (assert class strings contain `bg-primary/5` / `bg-destructive/5` / `bg-muted`, NO hex/rgb literals) | ❌ Wave 1 |
| **CONTENT-03** | `mdx-components.tsx` wires `pre: CodeBlock`, `Image`, `Callout`, `a` override | unit | `npm test mdx-components.test.tsx -t 'wires all MDX components'` | ❌ Wave 1 |
| **CONTENT-03** | External `<a>` gets `target=_blank rel=noopener noreferrer`; internal `<a>` uses next-intl `Link` | unit | Same test file — two cases | ❌ Wave 1 |
| **ANIM-02** | `useParallax` installs ScrollTrigger under full motion (matchMedia branch isFull) | unit | `npm test lib/hooks/useParallax.test.tsx -t 'full motion installs ScrollTrigger'` (MatchMediaController pattern from Phase 4 About.test.tsx — capture matchMedia callback, set isFull=true, assert ScrollTrigger.create mock called with `scrub: 0.5`) | ❌ Wave 1 |
| **ANIM-02** | `useParallax` skips ScrollTrigger under reduced motion (matchMedia branch isReduced) | unit | `npm test lib/hooks/useParallax.test.tsx -t 'reduced motion skips ScrollTrigger'` (set isReduced=true, assert ScrollTrigger.create NOT called, assert `gsap.set('[data-parallax-image]', { y: 0 })` called) | ❌ Wave 1 |
| **ANIM-02** | `useParallax` cleanup on unmount | unit | `npm test lib/hooks/useParallax.test.tsx -t 'cleanup on unmount'` (mount → unmount → assert matchMedia cleanup function called) | ❌ Wave 1 |

### Sampling Rate

- **Per task commit:** `npm test {touched-test-file}` (~2-5 s).
- **Per wave merge:** `npm test` (full suite, ~30 s) + `npm run lint` + `npm run build`.
- **Phase gate (before `/gsd:verify-work`):** Full suite green (224+ tests after Phase 5 adds ~15) + `npm run build` exit 0 + manual smoke: visit `/fr/projects/agora` and `/en/projects/agora`, verify cover renders + parallax fires under full motion + Image zoom opens + CodeBlock copies + Callout displays.

### Wave 0 Gaps

- [ ] `scripts/check-mdx-structure.ts` — new script that asserts 4 H2 sections present per locale + word count in 250-400 range (covers CONTENT-01)
- [ ] `lib/projects.test.ts` extension — new test cases for `gallery?: string[]` optional field (covers D-14 backward-compat)
- [ ] `components/mdx/Image.test.tsx`, `CodeBlock.test.tsx`, `Callout.test.tsx` — Wave 1 ships these alongside the components (TDD per Phase 4 pattern)
- [ ] `lib/hooks/useParallax.test.tsx` — Wave 1 ships alongside the hook (MatchMediaController dual-branch — pattern proven in `components/sections/About.test.tsx`)
- [ ] `mdx-components.test.tsx` — Wave 1 ships alongside the registry extension
- [ ] `app/[locale]/projects/[slug]/page.test.tsx` — Wave 2 ships alongside the page (covers CONTENT-02 unit cases; build smoke is manual)

(No framework install needed — Vitest is already in place since Phase 2 W0.)

## Sources

### Primary (HIGH confidence)

- **Next.js 16 MDX official guide** — https://nextjs.org/docs/app/guides/mdx — version 16.2.6, last updated 2026-05-19. Explicitly demonstrates the `await import('@/content/${slug}.mdx')` dynamic-import pattern with `generateStaticParams` and `dynamicParams = false`. THIS IS THE CANONICAL PATTERN for "1 MDX file per slug" routing.
- **rehype-pretty-code source code** — `packages/core/src/index.ts` from `rehype-pretty/rehype-pretty-code` on GitHub (v0.14.3) — lines 60, 94, 101 verbatim confirm `<figure data-rehype-pretty-code-figure>`, `<pre data-language="${lang}">`, and `<code data-language="${lang}">` emissions.
- **next-mdx-remote README** — https://github.com/hashicorp/next-mdx-remote — verified via `gh api` 2026-05-27. Header banner reads "⚠️ This project is archived and is no longer supported ⚠️". Last release v6.0.0 (2026-02-12), repo archived 2026-04-09.
- **Next.js Discussion #82837 "Dynamic imports of MDX"** — https://github.com/vercel/next.js/discussions/82837 — confirms relative-path workaround vs `@/` alias for dynamic MDX imports.
- **Next.js 16.2 Turbopack release blog** — https://nextjs.org/blog/next-16-2-turbopack — confirms Turbopack is default for `next dev` and `next build`; documents template-literal static analysis limitations.
- **`.planning/phases/04-homepage-sections/04-CONTEXT.md` D-20** — Phase 4 clipboard pattern verbatim reused in `<CodeBlock>`.
- **`components/providers/LenisProvider.tsx`** — Phase 3 `data-lenis-prevent` contract D-04 (line 127), `gsap.registerPlugin(ScrollTrigger)` at module load (line 72), `lenis.on('scroll', ScrollTrigger.update)` bridge (line 140).
- **`components/sections/About.tsx`** — Phase 4 reference for `useGSAP({ scope }) + gsap.matchMedia` dual-branch pattern (lines 40-85); MatchMediaController test pattern in `About.test.tsx`.

### Secondary (MEDIUM confidence)

- **`next-mdx-remote-client` (community fork by ipikuka)** — https://github.com/ipikuka/next-mdx-remote-client — maintained alternative; mentioned but NOT recommended because native pattern works.
- **ClarityDev blog "Copy to Clipboard Button In MDX with Next.js"** — https://claritydev.net/blog/copy-to-clipboard-button-nextjs-mdx-rehype — confirms `data-language` extraction pattern from `<pre>` props (article is 2023, verified still current via source inspection).
- **Hosted rehype-pretty docs** — https://rehype-pretty.pages.dev/ — confirms `data-rehype-pretty-code-figure` selector, lists other data attributes; explicit `data-language` mention is in source code (primary source) not on hosted docs.

### Tertiary (LOW confidence — none load-bearing)

None — every load-bearing claim has a HIGH or MEDIUM source.

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH — all 11 packages verified against installed `package.json`; current versions confirmed via `npm view`.
- **Architecture (dynamic-import pattern):** HIGH — confirmed via Next 16 official docs (last updated 2026-05-19) explicitly demonstrating the pattern with `generateStaticParams` and `dynamicParams = false`. Relative-path constraint confirmed via Next.js Discussion #82837.
- **`rehype-pretty-code` `data-language` emission:** HIGH — confirmed via SOURCE CODE inspection (`packages/core/src/index.ts` lines 94, 101) on GitHub via `gh api`.
- **Parallax + Lenis ticker compatibility:** HIGH — pattern already proven by Phase 4 About.tsx (in repo, 222/222 tests green) and Phase 3 LenisProvider (line 140 bridge).
- **Callout palette-aliased Tailwind utilities:** HIGH — verified against existing `globals.css` aliasing chain (Phase 1 D-10..D-13), Badge component (Phase 4 W0).
- **i18n parity gate:** HIGH — Phase 4 `scripts/check-i18n-parity.ts` already in repo, already covers 72-paths baseline.
- **`next-mdx-remote` archival status:** HIGH — verified via direct README fetch on 2026-05-27 ("⚠️ This project is archived and is no longer supported ⚠️" banner present).
- **Pitfalls (5A–5G):** HIGH for all 7 — each rooted in a verified source code/docs reference or an existing in-repo precedent.

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (30 days — Next 16 + Tailwind v4 + the MDX pipeline are stable; only watch for: rehype-pretty-code 0.15.x major bump, Next 16.3+ Turbopack dynamic-import changes, motion library v13 if released).
