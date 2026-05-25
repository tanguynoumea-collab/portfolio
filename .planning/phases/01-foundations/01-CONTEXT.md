# Phase 1: Foundations - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold a runnable Next 16 + Tailwind v4 + next-intl + shadcn skeleton where every later phase can read `var(--color-*)` and run inside a localized `/fr` or `/en` route without conflicts. Delivers the CSS variable foundation, shadcn token aliasing pass, i18n routing pipeline, MDX loader scaffold with discriminated `Project` type, and a runnable `npm run dev` + clean `npm run lint`.

This phase is **pure infrastructure** — no visual feature, no animation, no content. Its success criterion is that Phase 2 can start without re-litigating any choice made here.

</domain>

<decisions>
## Implementation Decisions

### Repo Structure & Scaffold

- **D-01:** The Next.js app lives at the **root of the repo** (no sub-folder like `web/` or `apps/portfolio/`). `package.json`, `app/`, `components/`, `lib/`, `content/`, `messages/`, `public/` all sit directly under `PROJET PORTFOLIO/`. Matches PROJECT.md's existing structure spec.
- **D-02:** **No `src/` directory**. `app/` is at the root. Aligns with PROJECT.md folder layout and avoids one level of indirection in every import.
- **D-03:** **Import alias `@/*`** (the `create-next-app` default). Required for shadcn compatibility — shadcn generates code with `@/components/ui/button` imports and breaks if the alias differs.
- **D-04:** **`package.json` name = `tanguy-portfolio`** (kebab-case, matches PROJECT.md project name). Internal only — not published to npm.
- **D-05:** Scaffold via `npx create-next-app@latest . --yes` (accepts 2026 defaults: TypeScript, Tailwind v4, ESLint flat config, App Router, Turbopack, alias `@/*`). Then verify Tailwind v4 works (`npm run dev`) BEFORE running `shadcn init`.

### CSS Variable Foundation & Default Palette

- **D-06:** **Default palette at cold load = Terra & Sage**. The 6 `--color-*` CSS variables in `:root` are hardcoded with Terra's OKLCh values. First impression matches the warm/organic/creative tone of the Tech×Design×BIM hybrid profile.
- **D-07:** **All 5 palettes (including Vaporwave) declared in `lib/palettes.ts` from Phase 1**. The typed constants live now so Phase 2 only has to wire UI to them. Aligns with THEME-01 (5 palettes typed).
- **D-08:** **Color tokens only in Phase 1** — strictly the 6 `--color-*` variables required by ARCH-04 (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`). No `--radius`, `--font-*`, or other design tokens added preemptively. Tailwind v4 defaults + shadcn defaults handle the rest.
- **D-09:** **OKLCh literals inline in `:root`** (e.g., `--color-bg: oklch(0.97 0.012 80);`). Phase 2's `beforeInteractive` script will overwrite these via `document.documentElement.style.setProperty()` if a stored palette exists in localStorage.

### shadcn Token Aliasing Strategy

- **D-10:** **Exhaustive aliasing pass** — ALL shadcn tokens redirect to `var(--color-*)` from the palette system, not just the principal four. Guarantees no shadcn component (Card, Dialog, Popover, Slider, Switch, Tabs, Button) has a hardcoded color "island" that ignores the palette switcher.
- **D-11:** **Resolve `--accent` clash:** shadcn `--primary` = `var(--color-accent)` (portfolio signature color → buttons, focus, CTAs). shadcn `--accent` (= discrete hover surface on Dropdown/Select) = `var(--color-surface)`. The portfolio's "accent" is semantically what shadcn calls "primary".
- **D-12:** **`--destructive` is palette-independent** (fixed OKLCh red, e.g., `oklch(0.6 0.22 25)`). Affordance "red = danger" must survive any palette switch — Vaporwave must not turn errors pink.
- **D-13:** **Borders via `color-mix`:** `--border` and `--input` = `color-mix(in oklch, var(--color-text-muted) 30%, transparent)`. Subtle, palette-aware, readable on any preset. **Focus ring:** `--ring` = `var(--color-accent)` (focus stays signature-coded, WCAG-friendly).

### Token Map Reference (palette system → shadcn)

Authoritative one-time mapping for `globals.css`:

| shadcn token | Aliased to |
|---|---|
| `--background` | `var(--color-bg)` |
| `--foreground` | `var(--color-text)` |
| `--card` | `var(--color-surface)` |
| `--card-foreground` | `var(--color-text)` |
| `--popover` | `var(--color-surface)` |
| `--popover-foreground` | `var(--color-text)` |
| `--primary` | `var(--color-accent)` |
| `--primary-foreground` | `var(--color-bg)` |
| `--secondary` | `var(--color-secondary)` |
| `--secondary-foreground` | `var(--color-text)` |
| `--muted` | `var(--color-surface)` |
| `--muted-foreground` | `var(--color-text-muted)` |
| `--accent` | `var(--color-surface)` |
| `--accent-foreground` | `var(--color-text)` |
| `--destructive` | `oklch(0.6 0.22 25)` (fixed) |
| `--destructive-foreground` | `oklch(0.98 0.01 80)` (fixed) |
| `--border` | `color-mix(in oklch, var(--color-text-muted) 30%, transparent)` |
| `--input` | `color-mix(in oklch, var(--color-text-muted) 30%, transparent)` |
| `--ring` | `var(--color-accent)` |

### i18n Routing & Locale Detection

- **D-14:** **Locale detection at `/`:** read `accept-language` header in `proxy.ts`. If browser prefers EN → redirect `/en`. If browser prefers FR or neither → fallback `/fr` (Tanguy is francophone, FR is primary audience).
- **D-15:** **Locale persistence via `NEXT_LOCALE` cookie**. When user clicks LanguageSwitcher (Phase 3), write the cookie. On subsequent visits, `proxy.ts` reads the cookie first, then falls back to `accept-language`. Standard next-intl pattern.
- **D-16:** **`/` always 308-redirects to `/{locale}`**. No content served at `/`. SEO-clean canonical, no duplicate-content trap.
- **D-17:** **Locale prefix mode `as-needed`** in next-intl `routing.ts`. With 2 locales this means both `/fr` and `/en` are always explicitly prefixed in URLs. Hreflang and switcher logic stay trivial.

### `Project` Discriminated Type & MDX Loader

- **D-18:** **Common fields across all variants** (in frontmatter of every project MDX):
  - `slug: string` (URL slug, must match filename)
  - `title: string` (translated per locale)
  - `year: number`
  - `category: 'tech' | 'design' | 'bim'` (discriminant)
  - `cover: string` (path relative to `/public`, e.g., `'/projects/agora/cover.jpg'`)
  - `summary: string` (1–3 sentences, translated)
  - `featured: boolean` (allows pinning 2–3 projects in homepage hero/grid)
- **D-19:** **`TechProject` adds:** `stack: string[]` (required), `repo?: string` (optional GitHub URL), `liveUrl?: string` (optional deployed URL).
- **D-20:** **`DesignProject` adds:** `tools: string[]` (required), `client?: string` (optional, omitted for personal work).
- **D-21:** **`BIMProject` adds:** `software: string[]` (required), `projectScale: 'concept' | 'residential' | 'commercial' | 'urban'` (required strict enum), `location?: string` (optional).
- **D-22:** **`cover` is a plain `string`** (path relative to `/public`). The card consumer passes it as `<Image src={cover}>`. No structured `{src, alt, blurDataURL}` object — alt comes from `title`, blur from Next/Image defaults.

### MDX Stub for Loader Validation

- **D-23:** **Stub content = 1 credible Tech placeholder × 2 locales** at `content/projects/_template.fr.mdx` + `_template.en.mdx`. Frontmatter exercises the full Tech variant (`stack`, `repo`, `liveUrl`, all common fields). Body has 2–3 paragraphs of plausible French/English copy. Validates the loader, the discriminated typing, AND serves as a copy-paste template for Phase 5's real projects.
- **D-24:** **The MDX loader (`lib/projects.ts`) excludes files whose name starts with `_`**. Stub stays in the repo as a reusable template but does not appear in `getProjects()` output, so it never leaks into homepage/sitemap.

### Claude's Discretion

Decisions deferred to the planner/researcher (they have enough signal to choose well):
- Exact OKLCh values for the 5 palettes (researcher proposes values; Phase 2's `validateFullMatrix` enforces AA at definition time)
- Exact `tsconfig.json` strict flags beyond `strict: true` (planner picks; recommendation: enable `noUncheckedIndexedAccess` for safer array access in MDX loader)
- Exact content of the bilingual `messages/*.json` skeleton (planner provides empty/placeholder keys for the structure ARCH-07 demands)
- Commit granularity within Phase 1 (planner decides: one commit per ARCH requirement vs. one commit per concern — scaffold/tailwind/shadcn/intl/mdx)
- Exact filename of the Tech stub (`_template`, `_starter`, `_example`, etc.) — stays under `_*` convention
- Choice of the placeholder cover image for the stub (researcher picks something free + appropriately licensed, or generates a placeholder)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, core value, constraints (Next 16, Tailwind v4, OKLCh, motion/lenis/gsap, no `any`, structure dossiers), Key Decisions table
- `.planning/REQUIREMENTS.md` §"Architecture & Foundations" (ARCH-01..09) — acceptance criteria for this phase
- `.planning/ROADMAP.md` §"Phase 1: Foundations" — phase goal + 5 success criteria
- `.planning/STATE.md` — current position, accumulated decisions

### Research synthesis (apply corrections — these supersede PROJECT.md where they differ)
- `.planning/research/SUMMARY.md` — executive summary; "Key Corrections vs PROJECT.md" table is mandatory reading (Next 15→16, framer-motion→motion, lenis rename, contentlayer abandoned, Tailwind v4, GSAP free, sharp auto-bundled)
- `.planning/research/STACK.md` — exact versions, install order, compatibility matrix, what NOT to use
- `.planning/research/ARCHITECTURE.md` — patterns (FOUC, Lenis+GSAP single-RAF, MDX, theme provider, build order) — Phase 1 implements patterns 1, 5 (foundations) and lays groundwork for 2, 3, 6, 7 used in later phases
- `.planning/research/PITFALLS.md` — Pitfall #1 (FOUC), Pitfall #2 (Tailwind runtime var resolution), Pitfall #5 (shadcn token disconnect) — directly relevant to Phase 1 deliverables

### External docs (downstream researcher should fetch with context7)
- Next.js 16 docs — `proxy.ts` (replaces `middleware.ts`), async `cookies()`/`headers()`/`params`, `next lint` removed, Turbopack default
- Next.js v15→v16 upgrade guide — full breaking change list
- Tailwind CSS v4 docs — `@theme {}` in CSS, `@import "tailwindcss"`, `@tailwindcss/postcss`
- shadcn/ui Tailwind v4 docs — current init command, `tw-animate-css` auto-install
- next-intl App Router docs — `routing.ts` + `request.ts` + `proxy.ts` (Next 16) setup
- Next.js MDX guide — `@next/mdx` + `next-mdx-remote/rsc compileMDX` + `gray-matter`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

**None** — this is a greenfield project. Only `CV_Tanguy_Delrieu_2023.pdf` exists at the repo root (will be moved to `public/cv-fr.pdf` later in Phase 4).

### Established Patterns

No code patterns to establish yet — Phase 1 IS the pattern-establishing phase for everything downstream. Constraints to apply from PROJECT.md:
- Server Components by default; `"use client"` only when interaction
- 1 file = 1 responsibility (atomic components)
- TypeScript strict, no `any`
- No hardcoded colors anywhere
- Components in `components/`; sections in `components/sections/`; theme in `components/theme/`; providers in `components/providers/`

### Integration Points

Phase 1 creates the integration sockets that later phases plug into:
- `app/[locale]/layout.tsx` — slot where Phase 3 will mount ThemeProvider + LenisProvider + IntlProvider + font
- `app/globals.css` — `:root` CSS vars + `@theme {}` + shadcn aliasing — Phase 2 writes the dynamic palette script that overwrites these vars
- `proxy.ts` — Phase 1 sets up locale detection; later phases don't touch it
- `lib/projects.ts` — `getProjects(locale)` is the API surface; Phase 5 fills `content/projects/` with real files
- `messages/{fr,en}.json` — Phase 1 creates the structure with empty values; later phases (3, 4, 6) fill keys as their UI lands

</code_context>

<specifics>
## Specific Ideas

- Use the `_underscore` prefix convention for the MDX stub so the loader can filter it out with a simple `if (filename.startsWith('_')) continue;` — same convention used by Sass partials and many static-site generators, instantly recognizable.
- The shadcn aliasing pass is a **one-time edit** at the end of Phase 1 (after `shadcn init` writes its default CSS vars). It must run before any shadcn component is used in Phase 3+. Bake this into a "Verify" step: after init, grep `globals.css` for any `oklch(` or `hsl(` literal under `--background`/`--foreground`/etc. — there should be ZERO; everything is `var(--color-*)`.
- Run `npx create-next-app@latest . --yes` inside the existing repo directory (the `.` is important — installs in current dir). The repo has a `.git` already so the scaffold should not overwrite it; verify `.gitignore` post-scaffold and merge any new entries with the existing ignore list.

</specifics>

<deferred>
## Deferred Ideas

- **Custom font (Geist vs Inter vs Local file):** LAYOUT-01 (Phase 3) decision, not Phase 1. Phase 1 ships without `next/font` to keep scope tight.
- **Radius / spacing / font-size design tokens:** Phase 1 ships color tokens only. If a design system needs custom radius later (e.g., card edges), add `--radius` then.
- **Domain configuration (e.g., `tanguy.dev`):** Phase 7 (Deployment) decision.
- **TypeScript strict flag extensions (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`):** Planner choice during Phase 1, defaults documented in research/STACK.md.
- **Commit granularity within Phase 1:** Planner decides — likely 1 commit per ARCH requirement OR per concern (scaffold / tailwind / shadcn / intl / mdx).
- **Placeholder cover image for stub:** Researcher picks an appropriately licensed placeholder, or a procedurally generated SVG.

</deferred>

---

*Phase: 01-foundations*
*Context gathered: 2026-05-25*
