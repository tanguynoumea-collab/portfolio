---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 02-00-test-infra-PLAN.md (Wave 0 done, Wave 1 ready)
last_updated: "2026-05-26T11:17:51.612Z"
last_activity: 2026-05-26
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 12
  completed_plans: 6
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** Demontrer le profil creatif hybride Tech/Design/BIM via une experience web personnalisable qui prouve la maitrise technique, le sens du design et l'attention aux details.
**Current focus:** Phase 02 — palette-system

## Current Position

Phase: 02 (palette-system) — EXECUTING
Plan: 2 of 7
Status: Ready to execute
Last activity: 2026-05-26

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundations P01 | 9m 9s | 2 tasks | 27 files |
| Phase 01-foundations P02 | 7m 21s | 1 tasks | 1 files |
| Phase 01 P03 | 11m | 2 tasks | 12 files |
| Phase 01-foundations P04 | 6m 44s | 3 tasks | 11 files |
| Phase 01-foundations P05 | 7m 38s | 3 tasks | 7 files |
| Phase 02-palette-system P00 | 2m 55s | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: 7 phases chosen (collapsed SUMMARY's 8 by merging Animation Infrastructure into Layout & Animation Foundation — LenisProvider lands in root layout alongside Nav/Footer)
- Stack: Next 16, Tailwind v4, motion (ex framer-motion), lenis (ex @studio-freight), GSAP free, @next/mdx + compileMDX
- FOUC: blocking `<script>` injected in `<head>` via `next/script strategy="beforeInteractive"` reads localStorage pre-hydration
- Animation: single RAF — Lenis `autoRaf: false` + `gsap.ticker.add((t) => lenis.raf(t * 1000))`
- WCAG: validate full 7-pair matrix in `lib/colors.ts`, auto-adjust text via `adjustForAA`
- [Phase 01-foundations]: Scaffold workaround: create-next-app rejects dir name 'PROJET PORTFOLIO' (caps + space violate npm naming); scaffolded into adjacent temp dir, copied generated files into repo, renamed package to tanguy-portfolio (D-04). Existing .git/.planning/CLAUDE.md preserved 100% intact.
- [Phase 01-foundations]: Dependency ranges use caret prefix (^16.2.6, ^19.2.4) rather than scaffold default exact pins — enables compatible patch upgrades and matches plan acceptance regex.
- [Phase 01-foundations]: CLAUDE.md added to .prettierignore: 28KB of human-curated AI-instruction prose should not be reformatted by Prettier's markdown formatter (would reflow paragraphs and reorder structure unhelpfully).
- [Phase 01-foundations]: Terra OKLCh canonical values authored in :root (D-06, D-09): bg 0.97 0.012 80, surface 0.94 0.018 75, text 0.22 0.018 50, text-muted 0.5 0.02 55, accent 0.62 0.155 35 (terracotta), secondary 0.55 0.075 145 (sage). These define the "terra" preset that Phase 2's lib/palettes.ts will export.
- [Phase 01-foundations]: Pitfall #2 mitigation by structure, not discipline: @theme contains ONLY var(--color-*) references, ZERO oklch() literals (regex-enforced). Future contributors cannot accidentally break runtime palette switching by adding a hardcoded color there.
- [Phase 01-foundations]: Lightning CSS (Tailwind v4 optimizer) auto-generates @supports (color: lab(...)) fallback + hex literals for older browsers. This is desirable browser-compat behavior, not a regression. Source file remains the authoritative OKLCh definition.
- [Phase 01-foundations]: OKLCh-only color authoring established as a project-wide convention: no hex, no rgb(), no hsl() anywhere from this point forward. Aligns with Tailwind v4's color system, culori's API (Phase 2), and the harmonic palette generator's hue-rotation math.
- [Phase 01-foundations]: shadcn 4.8.0 init: 'new-york' style renamed to 'radix-nova' (CLI evolution). Components use umbrella radix-ui@^1.4.3 package, not legacy @radix-ui/react-*. Exhaustive D-10..D-13 aliasing applied: every shadcn token in :root redirects to var(--color-*), fixed OKLCh (destructive D-12), or color-mix() (borders D-13). D-08 enforced: ZERO --radius / --chart-* / --sidebar-* in :root. .dark block removed (palette replaces dark mode).
- [Phase 01-foundations]: Pitfall #5 (shadcn token disconnect) is now structurally impossible. The chain bg-primary -> @theme inline --color-primary -> :root --primary -> var(--color-accent) -> Terra OKLCh resolves automatically. When Phase 2 ThemeProvider mutates --color-accent, every shadcn component using bg-primary / ring-ring / etc. repaints without rebuild.
- [Phase 01-foundations]: next-intl v4.12 wired: proxy.ts (Next 16 rename, NOT middleware.ts) + i18n/{routing,request}.ts + next.config wrapped with createNextIntlPlugin. localePrefix 'as-needed' (D-17) means default locale (fr) is served at canonical / via internal rewrite (HTTP 200 with x-middleware-rewrite: /fr header); /fr explicit form redirects to /; /en served at explicit prefix. Non-default redirects emit HTTP 307 (D-16 specified 308 — accepted deviation; next-intl v4.12 has no API to force 308; tracked as v2 follow-up).
- [Phase 01-foundations]: Pitfall #1 (FOUC) socket-by-structure: app/[locale]/layout.tsx ships <html lang={locale} suppressHydrationWarning> + explicit <head></head> with comment block documenting Phase 2 THEME-05 integration plan. Phase 2 can drop in <Script strategy='beforeInteractive'> without restructuring the layout.
- [Phase 01-foundations]: Pitfall #14 (i18n parity) enforced: messages/fr.json and messages/en.json both contain 63 leaf keys across 9 ARCH-07 namespaces (nav/hero/about/projects/skills/contact/footer/palette/errors). Parity verified by Node script comparing sorted leaf-key path sets — must match before commit. global.d.ts augments IntlMessages interface from typeof messages (fr.json source of truth) for useTranslations() autocomplete.
- [Phase 01-foundations]: Root layout migrated to passthrough (return children); <html>/<head>/<body> wrappers + setRequestLocale + getMessages + NextIntlClientProvider live in app/[locale]/layout.tsx so <html lang> is locale-aware on first paint (next-intl recommended pattern). app/page.tsx is a defensive fallback redirect to /{defaultLocale} in case proxy.ts is bypassed.
- [Phase 01-foundations]: Turbopack MDX plugin spec: pass plugins as string tuples ['package-name', options] not function refs — Next 16 Turbopack rejects function references in loader options across worker threads. Same syntax works under Webpack.
- [Phase 01-foundations]: Discriminated Project union (D-18..D-22) implemented in lib/projects.ts with inline TS type guards (isStringArray, isProjectScale) — no zod dependency in Phase 1; runtime frontmatter validation throws at build time on shape mismatch. Pitfall #8 (untyped MDX frontmatter) mitigated by structure.
- [Phase 01-foundations]: Terra single canonical source-of-truth: lib/palettes.ts terra OKLCh values byte-match :root --color-* in app/globals.css. Plan verify script exit code 8 enforces this. PALETTES[0].name='Terra & Sage'. Vaporwave .name='???' until Phase 2 Konami reveal.
- [Phase 01-foundations]: D-24 _* filter enforced at TWO points: getProjects/getProjectSlugs skip filenames starting with '_', getProjectBySlug rejects slugs starting with '_'. Defense in depth — templates never leak to homepage/sitemap. Smoke test verified both directions: getProjects() returns [], getProjectBySlug('_template') returns null.
- [Phase 02-palette-system]: Vaporwave WCAG blocker resolved as false alarm: actual measured ratio textMuted/surface = 7.68 (well above 4.5). Bauhaus.secondary was the real failing token (was 2.45 vs 3.0 threshold) — L-adjusted 0.7 -> 0.6 preserving hue 250 + chroma 0.18, new ratio 3.63
- [Phase 02-palette-system]: Test infrastructure ESM-first: vitest 4.1.7 + jsdom + RTL + @/* alias matching tsconfig. Standalone tsx-runnable scripts/validate-palettes.ts is canonical THEME-01 gate, decoupled from lib/colors.ts which Wave 1 will build

### Pending Todos

None yet.

### Blockers/Concerns

- Vaporwave preset WCAG compliance — pre-validate in `lib/palettes.ts` with `adjustForAA` applied at definition time (flagged in research SUMMARY gaps)
- Per-locale MDX authoring strategy confirmed: separate `.fr.mdx` / `.en.mdx` files per project (translator-friendly)
- BIM 3D asset availability — deferred to v1.x, confirm with user before scoping
- REQUIREMENTS.md header says 51 v1 requirements but actual REQ-ID count is 52 (header should be updated to 52)

## Session Continuity

Last session: 2026-05-26T11:17:51.609Z
Stopped at: Completed 02-00-test-infra-PLAN.md (Wave 0 done, Wave 1 ready)
Resume file: None
