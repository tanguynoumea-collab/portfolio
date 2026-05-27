# Phase 5: Project Content Pipeline - Discussion Log (Auto Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 05-project-content-pipeline
**Mode:** `--auto` (Claude picked recommended defaults — no user interaction)
**Areas analyzed:** MDX Content Authoring, Project Detail Page Layout, Custom MDX Components, Parallax (ANIM-02), Project Type Extension, Plan Structure

---

## MDX Content Authoring (CONTENT-01)

### D-01 — Case study narrative structure

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal stub (1 paragraph "to be enriched later") | Lowest effort, defers real authoring | |
| Structured case study (4 H2 sections: Contexte/Défi/Processus/Résultat, 250-400 words) | 2026 standard per FEATURES.md P1, plausible placeholders the user replaces | ✓ |
| Named MDX components (`<Hook>`/`<Problem>`/`<Process>`/`<Outcome>`) | More structured but adds component surface + i18n complexity | |

**Claude's choice (auto):** Structured case study with raw markdown headings.
**Reason:** FEATURES.md explicitly flags "MDX with gallery" as 2018-era; case-study narrative is the 2026 standard recruiters in Tech/Design/BIM all expect. Raw headings (not named components) keep MDX portable and FR/EN parity flat.

### D-02 — Frontmatter changes

| Option | Description | Selected |
|--------|-------------|----------|
| Frontmatter unchanged + add `gallery?: string[]` | Backward-compat, single optional addition | ✓ |
| Restructure frontmatter for case-study fields (`hook`, `metrics`, etc.) | More expressive but breaks existing 12 stubs + planner cycles | |

**Claude's choice (auto):** Frontmatter unchanged, +1 optional `gallery` field.

### D-03 — Gallery seeding

| Option | Description | Selected |
|--------|-------------|----------|
| 0 gallery seeds (frontmatter empty for all 6 projects, demo flag only) | Lowest disk cost | |
| 4 placeholder gallery images per project (24 files total, all same JPEG) + 2 projects ship with `gallery` populated | Demonstrates auto-render + per-project paths for surgical swap | ✓ |
| 6+ unique placeholders per project | Visual variety but wasted effort before real assets land | |

**Claude's choice (auto):** 4 placeholder images per project, 2 projects ship `gallery` populated.

---

## Project Detail Page Layout (CONTENT-02)

### D-04 — Layout structure

| Option | Description | Selected |
|--------|-------------|----------|
| Long-form magazine (cover → metadata → MDX in `max-w-prose` → gallery → footer nav) | Narrative-first, FEATURES.md case-study positioning, max-w-prose for serious reading | ✓ |
| Side-by-side (metadata sidebar + main content) | Common pattern but cramped on mobile + competes with the cover for visual focus | |
| Tab-based (Overview / Process / Outcome) | Adds JS state for navigation that the structured H2 sections already provide | |

**Claude's choice (auto):** Long-form magazine layout.

### D-05 — Parallax scope

| Option | Description | Selected |
|--------|-------------|----------|
| Cover image only (factor 0.3, max 50px, matchMedia gate) | Minimal motion-sickness risk; FEATURES.md: "Light parallax is fine. Heavy parallax = motion sickness." | ✓ |
| Cover + gallery images all parallax | Visual richness but compounds motion + breaks tactile feel of grid | |
| No parallax — drop ANIM-02 from Phase 5 | Easiest but fails REQ | |

**Claude's choice (auto):** Cover only.

### D-06 — Static generation strategy

| Option | Description | Selected |
|--------|-------------|----------|
| `generateStaticParams` returns all locale × slug combos | All 12 routes pre-built, perfect Vercel caching, zero per-request work | ✓ |
| Dynamic with ISR | Overhead for unchanging content | |
| Dynamic without ISR | Wastes Vercel function invocations | |

**Claude's choice (auto):** Full static pre-render.

### D-07 — Invalid slug handling

| Option | Description | Selected |
|--------|-------------|----------|
| `notFound()` from `next/navigation` (inherits Phase 6 custom page later) | Simplest + inherits future Phase 6 localized 404 | ✓ |
| Custom inline error UI in the project page | Premature — Phase 6 owns localized error pages | |

**Claude's choice (auto):** `notFound()`.

### D-08 — Prev/next navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Both back-to-projects + prev/next with wrap-around | Avoids dead-end UX, increases dwell time, modern portfolio standard | ✓ |
| Back-to-projects only | Simplest but signals "end of journey" prematurely | |
| Prev/next only (no back link) | User loses way back to filtered grid | |

**Claude's choice (auto):** Both, prev/next wraps around.

---

## Custom MDX Components (CONTENT-03)

### D-09 — `<Image>` zoom modal pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse shadcn Dialog (already installed) + `data-lenis-prevent` | Zero new deps, accessible by default (Radix focus trap + Esc), matches LenisProvider contract | ✓ |
| Custom portal + backdrop blur | Reinvents Dialog without a11y guarantees | |
| Third-party lightbox library (yet-another-react-lightbox, photoswipe, etc.) | Adds dep, fights palette CSS vars, larger bundle | |

**Claude's choice (auto):** shadcn Dialog + next/image + data-lenis-prevent.

### D-10 — `<CodeBlock>` strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Pure markdown fenced blocks + thin `<pre>` override (copy button + language label) | Reuses rehype-pretty-code already in next.config.ts, zero ceremony for authors, server-side highlight | ✓ |
| Custom `<CodeBlock language="ts">…</CodeBlock>` wrapper authors must use | Extra MDX surface, duplicates fenced-block ergonomics | |
| Client-side syntax highlighting (Prism / highlight.js) | Heavier, ships JS to client (per PROJECT.md: NOT to use) | |

**Claude's choice (auto):** Pure fenced blocks + `<pre>` override.

### D-11 — `<Callout>` variant set

| Option | Description | Selected |
|--------|-------------|----------|
| 3 variants `info` / `warning` / `note` (per REQUIREMENTS.md) + Lucide icon + palette-aliased bg | Matches REQ literally, palette-aware, accessible | ✓ |
| 4 variants `info` / `success` / `warning` / `danger` (Tailwind UI common pattern) | More expressive but exceeds REQ | |
| shadcn Alert primitive (install) | Larger surface than needed; hand-rolled is 30 LOC | |

**Claude's choice (auto):** 3 variants matching REQ.

### D-12 — `mdx-components.tsx` extension

| Option | Description | Selected |
|--------|-------------|----------|
| Wire Image + Callout + `<pre>` override + `<a>` external-link override | Covers CONTENT-03 + a11y best-practice for external links | ✓ |
| Wire Image + Callout only (skip `<pre>` + `<a>`) | Leaves copy button + external-link safety on the table | |
| Wire all built-in HTML tags (`<h1>`/`<h2>`/etc. overrides) | Premature customization | |

**Claude's choice (auto):** Wire Image/Callout/pre/a per D-12.

---

## Parallax Hook (ANIM-02)

### D-13 — `useParallax` hook design

| Option | Description | Selected |
|--------|-------------|----------|
| Hook with `(ref, { factor, maxTranslate })` signature + matchMedia gate | Reusable, single source of truth for parallax pattern, encapsulates ScrollTrigger boilerplate | ✓ |
| Inline ScrollTrigger setup in the cover component | Less reusable, harder to test in isolation | |
| Reuse Lenis velocity directly (skip ScrollTrigger) | Couples cover to Lenis (which is reduced-motion-gated), breaks under reduced motion | |

**Claude's choice (auto):** Hook with `(ref, options)` signature.

---

## Type Extension

### D-14 — Project type changes

| Option | Description | Selected |
|--------|-------------|----------|
| Extend `CommonFields` with optional `gallery?: string[]` | All 3 variants inherit, backward-compat | ✓ |
| Add `gallery` per-variant (Tech.gallery / Design.gallery / etc.) | Triplicates the field, no semantic difference | |
| Skip type change, parse gallery dynamically | Loses type safety | |

**Claude's choice (auto):** `CommonFields.gallery?: string[]`.

---

## Plan Structure & Wave Topology

### D-15 — Plan breakdown

| Option | Description | Selected |
|--------|-------------|----------|
| 4 plans / 3 waves (W0 content+assets, W1 parallel MDX components + parallax hook, W2 project page) | Clean dependency chain, Wave 1 fully parallel (zero file overlap) | ✓ |
| 3 plans / 2 waves (W0 content+assets, W1 components+hook+page bundled) | Less parallelism, larger single-plan surface | |
| 1 plan total | Too coarse — hard to test wave-by-wave | |
| 5+ plans (split MDX components into 3 separate plans) | Over-granularized; the 3 components share infrastructure | |

**Claude's choice (auto):** 4 plans / 3 waves.

---

## Claude's Discretion

The following decisions were deferred to the gsd-phase-researcher / gsd-planner during the
plan-phase step. Each has enough signal in CONTEXT.md to be made well by downstream agents:

- Exact 250-400 word case-study placeholder copy per project (FR + EN)
- Whether `<Image>` exposes optional `caption?: string` prop
- Whether `<Callout>` exposes optional `title?: string` prop
- CodeBlock copy button hover-reveal vs always-visible
- Gallery layout breakpoints (1/2 col default, refine if needed)
- Prev/next visual treatment (text-only vs thumbnail card — v1 text-only)
- Exact `data-language` extraction syntax from rehype-pretty-code (planner verifies version)
- Whether project page emits its own `generateMetadata` with title (recommended yes — Phase 6 expands)

## Deferred Ideas

23 deferred ideas captured in CONTEXT.md `<deferred>` section, ranging from Phase 6 metadata
ownership (`A11Y-01..03`) to v2 candidates (before/after slider, video reel, 3D viewer, etc.).
See CONTEXT.md for the complete list.
