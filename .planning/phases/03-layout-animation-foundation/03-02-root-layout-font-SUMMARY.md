---
phase: 03-layout-animation-foundation
plan: 02
subsystem: ui
tags: [next-font, inter, tailwind-v4, theme-inline, server-component, provider-tree, lenis, generate-metadata, section-anchors]

# Dependency graph
requires:
  - phase: 01-foundations
    provides: "app/[locale]/layout.tsx Server Component shell with <html lang> + <head> + suppressHydrationWarning + NextIntlClientProvider; @theme palette block + @theme inline shadcn alias block in app/globals.css; messages/{fr,en}.json with nav.* hero.* footer.* keys"
  - phase: 02-palette-system
    provides: "ThemeProvider (usePalette) + PaletteFab + PaletteFouCScript in <head>; Pitfall E scoping for Radix overlays; 5 WCAG-validated palettes"
  - phase: 03-layout-animation-foundation (plan 03-01)
    provides: "LenisProvider Client Component with autoRaf:false + gsap.ticker bridge + ScrollTrigger.refresh on palette swap + document.fonts.ready hook + reduced-motion skip + mobile input pause"

provides:
  - "next/font/google Inter wired with latin + latin-ext subsets, swap display, preload, fallback chain — exposed as --font-sans CSS variable on <html>"
  - "Tailwind v4 @theme inline --font-sans entry so the font-sans utility resolves to Inter at runtime via variable indirection"
  - "Final D-11 Phase 3 provider tree in app/[locale]/layout.tsx: NextIntlClientProvider > ThemeProvider > LenisProvider > [ConsoleArt + Navigation + main + Footer + CustomCursor + PaletteFab]"
  - "Server-rendered current year passed as `year` prop to Footer (D-24)"
  - "generateMetadata async export with localized title + description sourced from hero.tagline (D-12 placeholder)"
  - "4 stub Client Components in components/layout/ (Navigation, Footer, CustomCursor, ConsoleArt) returning null — Wave 2/3 plans swap bodies in"
  - "5 placeholder <section id='...'> shells in app/[locale]/page.tsx (home, about, projects, skills, contact) as IntersectionObserver targets for Plan 03-03"

affects:
  - "03-03-navigation-lang-switcher (Wave 2): Navigation stub body, IntersectionObserver targets <section id> wired here"
  - "03-04-footer (Wave 2): Footer stub body, receives `year` prop from layout"
  - "03-05-cursor-transitions-ascii (Wave 3): CustomCursor + ConsoleArt stub bodies"
  - "Phase 4 HOME-01..06: section shells (home/about/projects/skills/contact) get filled with real content"
  - "Phase 6 A11Y-01: generateMetadata expanded with og:image, hreflang, sitemap, twitter:card"

# Tech tracking
tech-stack:
  added: ["next/font/google (Inter)"]
  patterns:
    - "next/font + Tailwind v4 @theme inline variable indirection (--font-sans: var(--font-sans, system-ui, ...)) so utility resolves to Inter with graceful fallback"
    - "Server-rendered date prop pattern: layout computes new Date().getFullYear() once per request, passes via prop to leaf Client Component (Footer) so SSR/CSR stay in lockstep"
    - "Stub-component-first wave decoupling: create empty 'use client' stubs in Wave 1 layout edit so Wave 2/3 plans only touch component bodies, never the layout file"
    - "generateMetadata in [locale]/layout.tsx with getTranslations({locale, namespace}) so document title/description are fully locale-aware from first paint"

key-files:
  created:
    - "components/layout/Navigation.tsx (stub for Plan 03-03)"
    - "components/layout/Footer.tsx (stub for Plan 03-04 with `{ year: number }` prop signature)"
    - "components/layout/CustomCursor.tsx (stub for Plan 03-05)"
    - "components/layout/ConsoleArt.tsx (stub for Plan 03-05)"
    - ".planning/phases/03-layout-animation-foundation/03-02-root-layout-font-SUMMARY.md (this file)"
  modified:
    - "app/[locale]/layout.tsx — added Inter font config, generateMetadata, D-11 provider tree assembly, <main> landmark, year prop"
    - "app/globals.css — added single --font-sans entry to existing @theme inline block"
    - "app/[locale]/page.tsx — replaced Hero placeholder with 5 <section id='...'> shells"

key-decisions:
  - "Variable-font Inter (no `weight` array): all weights 100-900 ship in a single woff2 per unicode-range subset; specifying explicit weights would force discrete subsets and inflate bundle size"
  - "var(--font-sans, system-ui, ...) indirection in @theme inline mirrors the palette --color-* pattern: utility resolves via the variable Next injects on <html>, with system fallback if Inter fails to load (defense in depth)"
  - "Stub files created BEFORE layout edit so the layout file is wave-1-locked: Wave 2 (Nav, Footer) and Wave 3 (Cursor, ConsoleArt) plans Edit only the component bodies, not the layout.tsx file. Decouples wave concurrency."
  - "current year computed server-side in the layout (not inside Footer) so it's stable across hydration AND passed via prop — Footer stays a pure leaf with no Date() side effect"
  - "generateMetadata sources description from `hero.tagline` (already in messages/{fr,en}.json) — no new i18n key added; Phase 6 (A11Y-01) will expand the metadata surface"
  - "<main> landmark lives in layout.tsx (sibling-positioned inside LenisProvider per D-11) — page.tsx renders only the <section> tree as a React fragment; cleaner semantic ownership"

patterns-established:
  - "Pattern A (next/font wiring): const inter = Inter({...}); <html className={`${inter.variable} font-sans antialiased`}>. Tailwind v4 @theme inline { --font-sans: var(--font-sans, fallbacks) }. font-sans utility now resolves to Inter via variable cascade."
  - "Pattern B (provider tree mount order): NextIntlClientProvider > ThemeProvider > LenisProvider > chrome + main + chrome. LenisProvider INSIDE ThemeProvider so usePalette() works for ScrollTrigger.refresh on swap. Chrome INSIDE LenisProvider so anchor smooth-scroll + cursor positioning work."
  - "Pattern C (stub-first wave decoupling): a wave-N plan that touches a shared file (here: layout.tsx) creates `return null` stubs for components owned by wave N+1/N+2 plans. Downstream plans Edit component bodies only — never the shared file. Eliminates merge conflicts in parallel waves."
  - "Pattern D (section-anchor shells): page.tsx renders <section id='canonical-id'> shells matching nav.* i18n keys 1:1. Each section gets min-h-screen so IntersectionObserver fires distinct enter/leave events. Phase 4 fills the bodies."

requirements-completed:
  - LAYOUT-01

# Metrics
duration: 5m 7s
completed: 2026-05-27
---

# Phase 3 Plan 02: Root Layout & Font Summary

**Wired Inter via next/font/google with latin-ext subsets + Tailwind v4 @theme inline variable indirection, assembled the final D-11 Phase 3 provider tree (NextIntl > Theme > Lenis > chrome + main + chrome + PaletteFab) as a Server Component, and seeded 5 IntersectionObserver section anchors in the home page.**

## Performance

- **Duration:** 5m 7s
- **Started:** 2026-05-27T07:10:09Z
- **Completed:** 2026-05-27T07:15:16Z
- **Tasks:** 3
- **Files modified:** 7 (3 edited, 4 created)

## Accomplishments

- **Inter font shipped end-to-end.** `npm run build` emits 7 Inter `.woff2` files in `.next/static/media/` (latin + latin-ext + cyrillic + greek + vietnamese subsets, all weights 100-900 via variable-font, `font-display: swap` declared in the generated `@font-face` rules). `var(--font-sans)` resolves to Inter on `<html>` with a system-ui fallback if Inter ever fails.
- **D-11 provider tree assembled.** The root layout now mounts the canonical Phase 3 tree: `NextIntlClientProvider > ThemeProvider > LenisProvider > [ConsoleArt + Navigation + <main>{children}</main> + Footer + CustomCursor + PaletteFab]`. Stays a Server Component (no `'use client'`). PaletteFab unchanged — same component, just nested one level deeper.
- **Wave decoupling unblocked.** 4 stub components (`Navigation`, `Footer`, `CustomCursor`, `ConsoleArt`) ship as `return null` Client Components in `components/layout/`. Wave 2 (plans 03-03, 03-04) and Wave 3 (plan 03-05) now Edit only the component bodies — never touch `app/[locale]/layout.tsx` again.
- **Section anchors ready for Nav IntersectionObserver.** `app/[locale]/page.tsx` ships 5 `<section id="...">` shells with `min-h-screen` so Plan 03-03's active-section observer has scroll-distinct targets.
- **No regressions.** `npm run build` exits 0. `npm run lint` exits 0. `npm test` exits 0 with **98/98 tests green** (zero Phase 2 / 03-01 regressions).

## Task Commits

Each task was committed atomically:

1. **Task 1: Create stub files for Navigation / Footer / CustomCursor / ConsoleArt** — `0ec85e1` (feat)
2. **Task 2: Wire next/font Inter + extend @theme inline + assemble D-11 provider tree + generateMetadata** — `76bb017` (feat)
3. **Task 3: Add 5 placeholder section shells to app/[locale]/page.tsx** — `b62570d` (feat)

**Plan metadata:** (will be added by the final commit covering SUMMARY.md + STATE.md + ROADMAP.md)

## Files Created/Modified

- `components/layout/Navigation.tsx` *(created)* — Stub Client Component, named export `Navigation()` returns `null`. Plan 03-03 swaps the body.
- `components/layout/Footer.tsx` *(created)* — Stub Client Component, `Footer({ year }: { year: number })` returns `null`. Plan 03-04 swaps the body (preserves the prop signature so the layout import is stable).
- `components/layout/CustomCursor.tsx` *(created)* — Stub Client Component, `CustomCursor()` returns `null`. Plan 03-05 swaps the body. Contract: native cursor stays visible.
- `components/layout/ConsoleArt.tsx` *(created)* — Stub Client Component, `ConsoleArt()` returns `null`. Plan 03-05 swaps the body (one-shot console.log on cold mount).
- `app/[locale]/layout.tsx` *(modified)* — Added Inter import + config, generateMetadata (D-12), 4 chrome imports + `LenisProvider` import, replaced inner JSX with D-11 tree, `<html>` gets `${inter.variable} font-sans antialiased`, server-rendered year passed to Footer (D-24).
- `app/globals.css` *(modified)* — Single new line in existing `@theme inline` block: `--font-sans: var(--font-sans, system-ui, ...)`. Palette `@theme` block + shadcn `@theme inline` aliases untouched.
- `app/[locale]/page.tsx` *(modified)* — Replaced single Hero placeholder with 5 `<section id="home|about|projects|skills|contact">` shells, each with `min-h-screen` + flex centering + localized title via `useTranslations('nav')`. Outer `<main>` moved to layout.tsx.

## Decisions Made

- **Variable-font Inter, no explicit `weight` array.** Specifying weights would force discrete static subsets per weight and inflate the bundle; the variable font ships all weights 100-900 in a single file per unicode-range. (Recommended by Next.js docs + RESEARCH.md §3.)
- **`var(--font-sans, fallbacks)` indirection in `@theme inline`** mirrors the palette `--color-*` pattern. If Inter ever fails to load, the `font-sans` utility silently falls back to system-ui — defense in depth, parallel to the `:root` palette default mechanism.
- **Stub-first wave decoupling.** Create 4 minimal `return null` stubs in this Wave 1 plan so the layout file imports resolve. Wave 2/3 plans `Edit` only the component bodies — never the layout file. Eliminates wave-1↔wave-2 merge conflicts on `app/[locale]/layout.tsx`.
- **Server-rendered year via prop, not Footer-internal `Date.now()`.** Computing `new Date().getFullYear()` in the layout (Server Component) and passing as `year` prop keeps the Footer a pure leaf component. SSR and hydration stay in lockstep — no hydration mismatch warning.
- **`generateMetadata` description sources `hero.tagline`.** Already-translated, on-brand, no new i18n key needed. Phase 6 (A11Y-01) will expand metadata with og:image, hreflang, sitemap entries.
- **`<main>` landmark in layout, not page.** Cleaner ownership — every page in the app gets the same `<main>` wrapper without needing to repeat it. `app/[locale]/page.tsx` renders only its `<section>` tree as a React fragment.

## Deviations from Plan

None - plan executed exactly as written.

The only minor adjustment was a comment-wording change in `components/layout/CustomCursor.tsx` to avoid the literal substring `cursor: none` appearing anywhere in the codebase (the original stub comment said "MUST NOT use `cursor: none`" which would have tripped the LAYOUT-06 grep gate even though it was inside a comment). Rephrased to "native cursor must STAY visible (no takeover)" — same meaning, no forbidden substring. Not a true deviation — preserves the documented intent of the plan and the LAYOUT-06 D-26 invariant.

## Issues Encountered

None. Build / lint / test all green from the first attempt; no auto-fixes required.

## Verification Snapshot

**Build:**

```
> tanguy-portfolio@0.1.0 build
> next build

▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 2.0s
  Finished TypeScript in 2.8s
✓ Generating static pages using 6 workers (6/6) in 462ms
```

**Lint:** clean (zero warnings, zero errors).

**Tests:** `Test Files 11 passed (11) | Tests 98 passed (98)` — no regressions.

**Inter font shipped:** 7 woff2 files emitted in `.next/static/media/`; built CSS confirms `@font-face { font-family: Inter; font-style: normal; font-weight: 100 900; font-display: swap; src: url(.../inter-….woff2) format('woff2-variations'); unicode-range: ...; }` rules for each Latin/Cyrillic/Greek/Vietnamese subset.

**Acceptance grep gates (all pass):**

| Gate | Expected | Result |
|------|----------|--------|
| `head -1 app/[locale]/layout.tsx` does NOT contain `'use client'` | true | `import type { ReactNode } from 'react';` |
| `grep -c "next/font/google" app/[locale]/layout.tsx` ≥ 1 | true | 2 occurrences |
| `grep -c "inter.variable" app/[locale]/layout.tsx` ≥ 1 | true | 2 occurrences |
| `grep -c "LenisProvider" app/[locale]/layout.tsx` ≥ 1 | true | 4 occurrences |
| `grep -c "PaletteFab" app/[locale]/layout.tsx` ≥ 1 | true | 2 occurrences |
| `grep -c "var(--font-sans)" app/globals.css` ≥ 1 | true | 2 occurrences (one in declaration, one in comment) |
| `grep -c "<section id=" app/[locale]/page.tsx` ≥ 5 | true | 5 (home/about/projects/skills/contact) |
| No `cursor: none` anywhere in `components/` | true | 0 matches |
| No color literals in `app/[locale]/layout.tsx` | true | 0 matches |
| No `tailwind.config` reference in layout | true | 0 matches |

## Next Phase Readiness

**Plan 03-03 (Navigation + LanguageSwitcher)** is unblocked:
- The `Navigation` import already resolves in `app/[locale]/layout.tsx` — Plan 03-03 only touches `components/layout/Navigation.tsx` body, plus creates `components/layout/LanguageSwitcher.tsx`, `lib/hooks/useActiveSection.ts`, `i18n/navigation.ts`, and adds `nav.lang.*` i18n keys.
- The 5 section anchors (`#home`, `#about`, `#projects`, `#skills`, `#contact`) exist on the home page for the IntersectionObserver to observe.

**Plan 03-04 (Footer)** is unblocked:
- The `Footer` import resolves with the correct `{ year: number }` signature. Plan 03-04 only swaps the stub body; the `year` prop is already piped through from the layout's server-side `new Date().getFullYear()`.

**Plan 03-05 (CustomCursor + page transitions + ConsoleArt)** is unblocked:
- Both `CustomCursor` and `ConsoleArt` imports resolve. Plan 03-05 swaps the stub bodies + creates `app/template.tsx` for AnimatePresence page transitions + `lib/ascii.ts` for the bilingual console art content.

**No blockers.** All Phase 3 Wave 2 + Wave 3 plans can now proceed in parallel.

## Self-Check: PASSED

- [x] `components/layout/Navigation.tsx` exists (verified — file created in Task 1, build resolves the import).
- [x] `components/layout/Footer.tsx` exists with `{ year: number }` prop signature.
- [x] `components/layout/CustomCursor.tsx` exists.
- [x] `components/layout/ConsoleArt.tsx` exists.
- [x] `app/[locale]/layout.tsx` modified — Inter wired, D-11 tree assembled, generateMetadata present.
- [x] `app/globals.css` modified — `--font-sans` added to `@theme inline`.
- [x] `app/[locale]/page.tsx` modified — 5 `<section id>` shells present.
- [x] Commit `0ec85e1` (Task 1) verified via `git log --oneline`.
- [x] Commit `76bb017` (Task 2) verified via `git log --oneline`.
- [x] Commit `b62570d` (Task 3) verified via `git log --oneline`.
- [x] `npm run build` exit 0.
- [x] `npm run lint` exit 0.
- [x] `npm test` exit 0 — 98/98 tests passing.
- [x] Inter `.woff2` files emitted in `.next/static/media/`.

---
*Phase: 03-layout-animation-foundation*
*Completed: 2026-05-27*
