---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 03-01-lenis-provider-PLAN.md
last_updated: "2026-05-27T07:07:50.429Z"
last_activity: 2026-05-27
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 18
  completed_plans: 14
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** Demontrer le profil creatif hybride Tech/Design/BIM via une experience web personnalisable qui prouve la maitrise technique, le sens du design et l'attention aux details.
**Current focus:** Phase 3 — Layout & Animation Foundation

## Current Position

Phase: 3 (Layout & Animation Foundation) — EXECUTING
Plan: 3 of 6
Status: Ready to execute
Last activity: 2026-05-27

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
| Phase 02-palette-system P01 | 4m 36s | 2 tasks | 4 files |
| Phase 02-palette-system P02 | 7m 36s | 3 tasks | 7 files |
| Phase 02-palette-system P03 | 8m 31s | 4 tasks | 7 files |
| Phase 02-palette-system P04 | 4m 54s | 3 tasks | 6 files |
| Phase 02-palette-system P06 | 7m 6s | 3 tasks | 5 files |
| Phase 03-layout-animation-foundation P00 | 1m 32s | 1 tasks | 2 files |
| Phase 03-layout-animation-foundation P01 | 4m 15s | 2 tasks | 2 files |

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
- [Phase 02-palette-system]: lib/colors.ts shipped TDD: 10 exports (8 functions + CRITICAL_PAIRS const + 3 types) make 29 Vitest tests green. Pure module — NO React, NO DOM. Locks the deterministic OKLCh-WCAG-harmonic contract for all Phase 2 consumers (ThemeProvider Wave 2, UI components Wave 3, confetti Wave 4).
- [Phase 02-palette-system]: Installed @types/culori@^4.0.1 (Rule 3 blocker): 02-RESEARCH claimed culori v4 ships native .d.ts but it does NOT. Fix resolves TS7016 in lib/colors.ts AND retroactively in pre-existing scripts/validate-palettes.ts (Wave 0 shipped with same latent issue).
- [Phase 02-palette-system]: Test 5 fixture corrected (Rule 1 plan bug): plan asserted adjustForAA('oklch(0.5 0 0)','oklch(0.97 0 0)') triggers adjustment, but ratio is already 5.5 (>4.5). Changed input text to oklch(0.55 0 0) (ratio 4.45 — actually fails) so 'darkens until passing' semantic holds. Added precondition assertion to self-document.
- [Phase 02-palette-system]: lib/storage.ts D-02 silent fallback is structural (4 try/catch with empty catches, 4 SSR guards, 0 console calls, 0 removeItem). Test 13 asserts no console output across ALL failure paths simultaneously — adding a console.error to any catch breaks the test immediately. Defense-by-structure not defense-by-discipline.
- [Phase 02-palette-system]: useKonamiCode uses e.code (KeyB/KeyA/ArrowUp) NOT e.key — Konami sequence works on AZERTY French keyboards (Tanguy's locale) AND QWERTY without special-casing. Plus defensive 'inside open Radix dialog' filter so PaletteSwitcher slider arrow-key nav cannot accidentally unlock Vaporwave (PITFALLS.md Pitfall D).
- [Phase 02-palette-system]: usePrefersReducedMotion uses useSyncExternalStore not useState+useEffect+setState — React 19 lint rule react-hooks/set-state-in-effect fires on naive pattern. useSyncExternalStore is the React-blessed primitive for external mutable sources: sync getSnapshot read (no setState), automatic subscribe cleanup, true SSR via getServerSnapshot returning false unconditionally.
- [Phase 02-palette-system]: useKonamiCode defensive contentEditable check: 't.isContentEditable || t.contentEditable === "true"' — jsdom does NOT implement isContentEditable getter (returns undefined) but real browsers do. OR-fallback makes the filter work in both environments without weakening production behavior (real browsers short-circuit on isContentEditable=true before reaching the string check).
- [Phase 02-palette-system]: ThemeProvider (THEME-04) shipped with useReducer + 4 actions + lazy initFromStorage + useMemo-stable context value (Pitfall H mitigation): single API surface usePalette() exposes {palette, paletteId, isCustom, customSource, isVaporwaveUnlocked, wasAdjustedForAA, setPreset, setCustomColor, setHarmonic, unlockVaporwave} for all Wave 3+ UI components
- [Phase 02-palette-system]: FOUC script (THEME-05) shipped at 1000 bytes rendered (within <1024 budget) via RESEARCH.md Pitfall A mitigation: array-form inline table + split-string CSS-var keys + single-ternary t= + Vaporwave EXCLUDED from cold-load table. Tradeoff: returning Vaporwave-unlocked users get a brief Terra flash before ThemeProvider rehydrates; acceptable per easter-egg framing. All 4 normal presets get true zero-FOUC.
- [Phase 02-palette-system]: D-14 Konami unlock sequence locked: handleUnlock dispatches UNLOCK_VAPORWAVE FIRST then SET_PRESET('vaporwave') — order matters because Wave 4 confetti will gate on isVaporwaveUnlocked. ThemeProvider mounts INSIDE NextIntlClientProvider in app/[locale]/layout.tsx so palette UI can use useTranslations() (per 02-CONTEXT.md code_context + RESEARCH.md Discretion).
- [Phase 02-palette-system]: ESLint @next/next/no-before-interactive-script-outside-document rule fires false-positive on App-Router beforeInteractive in [locale]/layout.tsx Server Component. Resolved with targeted eslint-disable-next-line + inline justification (Rule 3 blocker) — rule targets legacy Pages Router pattern and has not been updated for App Router architecture.
- [Phase 02-palette-system]: WCAGBadge worst-pair heuristic uses ratio/min normalized score (not raw margin) — picks pair proportionally furthest from passing across 4.5-text vs 3.0-UI thresholds. AAA only awarded when worst pair is text-class (min=4.5) AND ratio>=7 — WCAG 2.1 has no AAA tier for UI components.
- [Phase 02-palette-system]: Pitfall E mitigated by ADDING a scope-exclude rule (5 Radix overlay data-slot selectors get opacity 200ms + transform 250ms), NOT removing the global 400ms color transition. Original rule preserved verbatim — attribute selectors win specificity for those elements only; palette swap still animates smoothly everywhere else.
- [Phase 02-palette-system]: PalettePresets uses motion.button with whileHover scale 1.02 + whileTap scale 0.98 (150ms ease-out). D-15 label sourcing via t('palette.presets.<id>') over palette.name — lib/palettes.ts .name remains as defensive fallback never displayed; i18n is the only display source. Card visibility filter via useMemo gated on isVaporwaveUnlocked.
- [Phase 02-palette-system]: PaletteFab uses vaporwaveUnlockNonce monotonic counter (incremented on every UNLOCK_VAPORWAVE dispatch) for FAB ↔ ThemeProvider reconciliation — chosen over callback prop / new context / useEffect-on-isVaporwaveUnlocked alternatives. Nonce starts at 0 every cold mount so returning users (secrets.vaporwave=true) do NOT auto-open Sheet across sessions; only fresh in-session Konami unlocks trigger setOpen(true).
- [Phase 02-palette-system]: canvas-confetti dynamic-imported inside fireConfetti() (ThemeProvider) — zero top-level imports verified by grep. ~4KB gzipped chunk loaded only when Konami fires (1% of visitors). Colors sourced from oklchToHex(Vaporwave.accent + secondary) via Wave 1 helper. Silent try/catch (D-02 spirit) — easter egg should never crash.
- [Phase 02-palette-system]: PaletteFab D-14 auto-open uses React 19 derive-during-render pattern (useState prev-nonce + comparison in render body) instead of plan-specified useEffect — React 19's react-hooks/set-state-in-effect lint rule blocks the naive setState-in-effect approach. Same idiom Wave 1 used for usePrefersReducedMotion (useSyncExternalStore) and CustomColorPicker (useMemo). useEffectEvent (React 19.2 stable) was tried but the lint rule sees through it; the derive-in-render approach is the React-blessed alternative per react.dev/reference/react/useState#storing-information-from-previous-renders.
- [Phase 02-palette-system]: Phase 2 COMPLETE — all 12 THEME requirements (THEME-01..THEME-12) delivered across plans 00-06. THEME-11 (FAB visible bottom-right + localized aria-label + Lucide palette icon + motion hover/rotate) + THEME-12 (Konami unlocks Vaporwave + confetti via dynamic import + Sheet auto-opens on Presets tab with Vaporwave as 5th preset card). 94/94 Vitest tests green; npm run build exit 0; lint clean; all 5 palettes pass 7-pair WCAG matrix. usePalette() context exposes the full API surface for Phase 3+ consumers.
- [Phase 03-layout-animation-foundation]: Caret-prefix locked at ^3.13/^2.1.2/^1.3 per D-01; npm resolved to gsap@3.15.0 + @gsap/react@2.1.2 + lenis@1.3.23. Wave 0 install gate cleared; motion@^12.40 preserved unchanged from Phase 2 W0; no @studio-freight/* legacy packages.
- [Phase 03-layout-animation-foundation]: LenisProvider uses vanilla Lenis class + ref-holder accessor pattern: useLenis() returns Lenis|null via stable useMemo({ getLenis: () => lenisRef.current }, []) instead of useState — same React 19 react-hooks/set-state-in-effect avoidance idiom as Phase 2 PaletteFab. autoRaf:false + gsap.ticker.add bridge + gsap.ticker.lagSmoothing(0). ScrollTrigger.refresh 450ms debounce on paletteId change (rAF + setTimeout). Module-level gsap.registerPlugin(ScrollTrigger). All useEffects early-return under usePrefersReducedMotion.

### Pending Todos

None yet.

### Blockers/Concerns

- Vaporwave preset WCAG compliance — pre-validate in `lib/palettes.ts` with `adjustForAA` applied at definition time (flagged in research SUMMARY gaps)
- Per-locale MDX authoring strategy confirmed: separate `.fr.mdx` / `.en.mdx` files per project (translator-friendly)
- BIM 3D asset availability — deferred to v1.x, confirm with user before scoping
- REQUIREMENTS.md header says 51 v1 requirements but actual REQ-ID count is 52 (header should be updated to 52)

## Session Continuity

Last session: 2026-05-27T07:07:50.425Z
Stopped at: Completed 03-01-lenis-provider-PLAN.md
Resume file: None
