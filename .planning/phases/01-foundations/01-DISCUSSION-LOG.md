# Phase 1: Foundations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 01-foundations
**Areas discussed:** Repo structure & scaffold, Default palette at cold load, shadcn token mapping, i18n routing & locale detection, `Project` discriminated type, MDX stub for loader validation

---

## Area A — Repo Structure & Scaffold

### A.1 — App location

| Option | Description | Selected |
|---|---|---|
| Root du repo | App lives at the root of `PROJET PORTFOLIO/`. Simple, matches PROJECT.md folder spec. | ✓ |
| Sub-folder (`web/` or `apps/portfolio/`) | Useful if monorepo planned later, not needed for v1. | |

**User's choice:** Root du repo
**Notes:** Recommended option. No monorepo need expressed in PROJECT.md.

### A.2 — `src/` directory

| Option | Description | Selected |
|---|---|---|
| No `src/`, `app/` at root | `create-next-app` default in 2026 when declining `src/`. Matches PROJECT.md structure. | ✓ |
| Yes, everything under `src/` | One extra level in all relative imports. | |

**User's choice:** No `src/`, `app/` at root
**Notes:** Recommended option. Consistent with PROJECT.md folder layout (`app/`, `components/`, `lib/` without `src/` prefix).

### A.3 — Import alias

| Option | Description | Selected |
|---|---|---|
| `@/*` | `create-next-app` default, expected by shadcn. | ✓ |
| `~/*` | Nuxt/Remix-style; would require patching shadcn config. | |

**User's choice:** `@/*`
**Notes:** Recommended option. Required for shadcn compatibility.

### A.4 — `package.json` name

| Option | Description | Selected |
|---|---|---|
| `tanguy-portfolio` | Matches PROJECT.md project name. | ✓ |
| `portfolio` (generic) | Shorter but less identifying. | |

**User's choice:** `tanguy-portfolio`
**Notes:** Recommended option.

---

## Area B — Default Palette at Cold Load

### B.1 — Default palette

| Option | Description | Selected |
|---|---|---|
| Terra & Sage | Warm beige/sage; first palette named in PROJECT.md Key Decisions; warm organic creative tone. | ✓ |
| Atelier Nordique | Light/minimal whites and blue-grays. | |
| Bauhaus Bright | Bold primaries — too aggressive as first impression. | |
| Ocean Studio | Deep blues + coral accent. | |

**User's choice:** Terra & Sage
**Notes:** Recommended option. First palette named in PROJECT.md.

### B.2 — Vaporwave declaration in Phase 1

| Option | Description | Selected |
|---|---|---|
| All 5 palettes in `lib/palettes.ts` from Phase 1 | Types/constants ready for Phase 2 to wire up. Aligns with THEME-01. | ✓ |
| Wait until Phase 2 | Cleaner separation but duplicates OKLCh values. | |

**User's choice:** All 5 palettes in `lib/palettes.ts` from Phase 1
**Notes:** Recommended option. Anticipates Phase 2.

### B.3 — Other design tokens (radius, font) in Phase 1

| Option | Description | Selected |
|---|---|---|
| Color tokens only (6 `--color-*` vars) | Strict to ARCH-04. No overreach. | ✓ |
| Colors + radius + font tokens | Anticipates design system, risks duplication with shadcn defaults. | |

**User's choice:** Color tokens only
**Notes:** Recommended option. Scope discipline.

### B.4 — OKLCh value expression in `:root`

| Option | Description | Selected |
|---|---|---|
| Inline OKLCh literals | Standard CSS, DevTools-readable, overwritten by Phase 2 script. | ✓ |
| Intermediate vars (`--terra-bg`) | Indirection layer Phase 2 won't use. | |

**User's choice:** Inline OKLCh literals
**Notes:** Recommended option.

---

## Area C — shadcn Token Mapping

### C.1 — Global aliasing strategy

| Option | Description | Selected |
|---|---|---|
| Exhaustive (all shadcn tokens → palette) | No hardcoded islands. Guaranteed switcher consistency. | ✓ |
| Minimal (top 6 only) | Faster but risks "color islands" that don't follow switcher. | |

**User's choice:** Exhaustive
**Notes:** Recommended option. Critical for Phase 2 reliability.

### C.2 — Resolving the `--accent` clash

| Option | Description | Selected |
|---|---|---|
| shadcn `--primary` = `--color-accent`; shadcn `--accent` = `--color-surface` | Semantic match: portfolio "accent" is shadcn "primary". | ✓ |
| Both `--primary` and `--accent` = `--color-accent` | Creates visual noise on hover surfaces. | |

**User's choice:** `--primary` = accent; `--accent` = surface
**Notes:** Recommended option.

### C.3 — `--destructive` token

| Option | Description | Selected |
|---|---|---|
| Fixed OKLCh red, palette-independent | "Red = danger" affordance must survive any palette switch. | ✓ |
| Mapped to `--color-secondary` | Breaks affordance, anti-pattern. | |

**User's choice:** Fixed OKLCh red
**Notes:** Recommended option. A11y/affordance critical.

### C.4 — `--border`, `--input`, `--ring`

| Option | Description | Selected |
|---|---|---|
| `--border`/`--input` = `color-mix(in oklch, var(--color-text-muted) 30%, transparent)`; `--ring` = `var(--color-accent)` | Subtle, palette-aware, WCAG focus visible. | ✓ |
| `--border`/`--input` = `var(--color-text-muted)` full opacity; `--ring` = `var(--color-accent)` | Too prominent borders. | |

**User's choice:** `color-mix` borders + accent ring
**Notes:** Recommended option.

---

## Area D — i18n Routing & Locale Detection

### D.1 — Locale detection at `/`

| Option | Description | Selected |
|---|---|---|
| `accept-language` → fallback FR | Standard next-intl, Tanguy francophone, FR primary audience. | ✓ |
| Always redirect to `/fr` | Penalizes EN visitors. | |
| Always redirect to `/en` | Renies primary language. | |

**User's choice:** `accept-language` → fallback FR
**Notes:** Recommended option.

### D.2 — Locale persistence after manual switch

| Option | Description | Selected |
|---|---|---|
| `NEXT_LOCALE` cookie | Standard next-intl pattern, respects user choice. | ✓ |
| No persistence | Re-imposes browser language on every visit. Frustrating. | |

**User's choice:** `NEXT_LOCALE` cookie
**Notes:** Recommended option.

### D.3 — Root `/` behavior

| Option | Description | Selected |
|---|---|---|
| 308 redirect to `/{locale}` | SEO-clean, canonical-friendly. | ✓ |
| Render `/` as `/fr` content | Duplicate content, bad SEO. | |

**User's choice:** 308 redirect
**Notes:** Recommended option.

### D.4 — Locale prefix mode

| Option | Description | Selected |
|---|---|---|
| `as-needed` (prefixes always visible with 2 locales) | Explicit URLs, hreflang trivial, matches ROADMAP. | ✓ |
| `always` | Identical in practice with 2 locales. | |

**User's choice:** `as-needed`
**Notes:** Recommended option.

---

## Area E — `Project` Discriminated Type

### E.1 — Common fields

| Option | Description | Selected |
|---|---|---|
| slug, title, year, category, cover, summary, featured | Minimal vital + summary (1–3 sentences) + featured (home pinning). | ✓ |
| slug, title, year, category, cover only | Strict minimum, limits homepage composition. | |

**User's choice:** Extended common (7 fields)
**Notes:** Recommended option.

### E.2 — Variant-specific fields

| Option | Description | Selected |
|---|---|---|
| Tech: stack+repo?+liveUrl? · Design: tools+client? · BIM: software+projectScale+location? | Covers real-world use cases. | ✓ |
| Minimal: signature arrays only | Limits credibility for real projects. | |

**User's choice:** Enriched variants
**Notes:** Recommended option.

### E.3 — `projectScale` type for BIM

| Option | Description | Selected |
|---|---|---|
| Strict enum: `'concept' \| 'residential' \| 'commercial' \| 'urban'` | Type-safe, autocompletable, prevents typos. | ✓ |
| Free `string` | Loses TS safety. | |

**User's choice:** Strict enum
**Notes:** Recommended option. Aligns with TS strict + no `any` constraint.

### E.4 — `cover` field shape

| Option | Description | Selected |
|---|---|---|
| `cover: string` (path relative to `/public`) | Standard `next/image` pattern. | ✓ |
| `cover: { src, alt, blurDataURL? }` | Over-design for Phase 1. | |

**User's choice:** `cover: string`
**Notes:** Recommended option.

---

## Area F — MDX Stub for Loader Validation

### F.1 — Stub content

| Option | Description | Selected |
|---|---|---|
| 1 credible Tech placeholder × 2 locales | Validates loader + typing + locale pipeline + serves as Phase 5 template. | ✓ |
| Hello-world minimal 1 locale | Insufficient pipeline coverage. | |
| 3 stubs (Tech/Design/BIM) × 2 locales = 6 files | Overkill for Phase 1, postpone real coverage to Phase 5. | |

**User's choice:** 1 credible Tech × 2 locales
**Notes:** Recommended option.

### F.2 — Stub lifecycle

| Option | Description | Selected |
|---|---|---|
| Keep as reusable template, excluded from build (`_*` prefix) | Loader skips `_*` files. Template stays for Phase 5. | ✓ |
| Delete at start of Phase 5 | Risk forgetting and shipping test data. | |

**User's choice:** Keep with `_*` prefix, loader excludes
**Notes:** Recommended option.

---

## Claude's Discretion

The following choices were explicitly deferred to the planner/researcher (recorded in CONTEXT.md "Claude's Discretion" subsection):
- Exact OKLCh values for the 5 palettes (researcher proposes, Phase 2 validates)
- TS strict flag extensions beyond `strict: true`
- Initial structure/keys of `messages/*.json`
- Commit granularity within Phase 1
- Final filename of the Tech stub under the `_*` convention
- Placeholder cover image for the stub

## Deferred Ideas

The following came up implicitly but belong to other phases:
- Custom font choice (Geist vs Inter vs local) — Phase 3 (LAYOUT-01)
- Radius / spacing / font-size design tokens — defer until a design system need surfaces
- Custom domain configuration (e.g., `tanguy.dev`) — Phase 7 (DEPLOY)
- BIM 3D viewer asset readiness — v1.x, dependent on user-provided BIM source files
