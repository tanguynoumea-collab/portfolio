---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: "Phase 7: 07-00 done; 07-01 Task 1 done (repo pushed to tanguynoumea-collab/portfolio); PAUSED awaiting user Vercel connect (Tasks 2-4)"
last_updated: "2026-05-28T15:43:02.693Z"
last_activity: 2026-05-28
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 36
  completed_plans: 36
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** Demontrer le profil creatif hybride Tech/Design/BIM via une experience web personnalisable qui prouve la maitrise technique, le sens du design et l'attention aux details.
**Current focus:** Phase 07 — deployment

## Current Position

Phase: 07
Plan: Not started
Status: Ready to execute
Last activity: 2026-05-28

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
| Phase 03-layout-animation-foundation P02 | 5m 7s | 3 tasks | 7 files |
| Phase 03-layout-animation-foundation P04 | 7m 0s | 2 tasks | 2 files |
| Phase 03-layout-animation-foundation P03 | 8m 22s | 4 tasks | 8 files |
| Phase 04-homepage-sections P00 | 8m | 7 tasks | 33 files |
| Phase 04 P02 | 4min | 2 tasks | 2 files |
| Phase 04-homepage-sections P04 | 3m 33s | 2 tasks | 2 files |
| Phase 04-homepage-sections P01 | 4m 5s | 2 tasks | 3 files |
| Phase 04-homepage-sections P05 | 4min | 2 tasks | 2 files |
| Phase 04-homepage-sections P03 | 7m 30s | 3 tasks | 8 files |
| Phase 05-project-content-pipeline P00 | 6m | 3 tasks | 41 files |
| Phase 05-project-content-pipeline P01 | 5m 22s | 3 tasks | 9 files |
| Phase 05-project-content-pipeline P02 | 7m | 1 tasks | 2 files |
| Phase 05-project-content-pipeline P03 | 6min | 3 tasks | 6 files |
| Phase 06-seo-accessibility-polish P00 | 10min | 3 tasks | 10 files |
| Phase 06-seo-accessibility-polish P01 | 9min | 3 tasks | 12 files |
| Phase 06-seo-accessibility-polish P02 | 4min | 3 tasks | 7 files |
| Phase 06-seo-accessibility-polish P03 | 4m 30s | 2 tasks | 4 files |
| Phase 06-seo-accessibility-polish P04 | 13min | 3 tasks | 17 files |
| Phase 06-seo-accessibility-polish P05 | 4m 22s | 1 tasks | 0 files |
| Phase 07-deployment P00 | 6m 0s | 3 tasks | 9 files |

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
- [Phase 03-layout-animation-foundation]: Plan 03-02 used stub-first wave decoupling: 4 'return null' stub components (Navigation, Footer, CustomCursor, ConsoleArt) shipped in components/layout/ during Wave 1's layout edit so Wave 2/3 plans Edit only the component bodies, never touch app/[locale]/layout.tsx. Eliminates wave merge conflicts on the shared layout file.
- [Phase 03-layout-animation-foundation]: Inter via next/font/google with subsets=['latin','latin-ext'], variable='--font-sans', display='swap', preload=true, no explicit weight array (variable font ships all weights 100-900 in single woff2 per unicode-range). Tailwind v4 @theme inline wires --font-sans: var(--font-sans, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif) so the font-sans utility resolves to Inter at runtime with graceful fallback if Inter fails to load. Build emits 7 woff2 subsets in .next/static/media/.
- [Phase 03-layout-animation-foundation]: D-11 Phase 3 provider tree assembled in app/[locale]/layout.tsx as Server Component (no 'use client'): NextIntlClientProvider > ThemeProvider > LenisProvider > [ConsoleArt + Navigation + <main>{children}</main> + Footer year={server-rendered new Date().getFullYear()} + CustomCursor + PaletteFab]. PaletteFab stays LAST child inside LenisProvider (unchanged from Phase 2, just relocated one level deeper). <main> landmark owned by layout — page.tsx renders only <section> tree as fragment.
- [Phase 03-layout-animation-foundation]: lucide-react@^1.16.0 ships without Github/Linkedin brand icons (removed in v1.0 upstream release). Footer.tsx substitutes Code2 (for GitHub link) + Briefcase (for LinkedIn link) + Mail. Accessible names preserved via tSocial('github'/'linkedin'). Pattern to watch: any future Phase 3+ component that imports lucide brand icons must substitute or pin a downgraded version.
- [Phase 03-layout-animation-foundation]: Footer mailto: anchor omits target=_blank/rel by design — mailto: hands off to the OS mail client; target=_blank causes a blank-window flash in Chrome. aria-label='Email' provides accessible name. Pattern: external https → full target+rel security; mailto: → aria-label only.
- [Phase 03-layout-animation-foundation]: Navigation LAYOUT-03 + LanguageSwitcher LAYOUT-05 + useActiveSection IntersectionObserver hook + i18n/navigation barrel: 4 TDD tasks (10 commits) shipped 9/9 tests green, build/lint clean. Mobile hamburger via shadcn Sheet side='left' with data-lenis-prevent on SheetContent root (D-04+D-16). LanguageSwitcher imports useRouter/usePathname from @/i18n/navigation (locale-aware, NOT next/navigation) — the structural disambiguation locked by test asserting router.replace({pathname,params}, {locale:target}) call shape. Motion layoutId='lang-indicator' shared-element indicator. Scroll preservation: lenis.actualScroll captured before navigation, lenis.scrollTo(savedY, {immediate:true}) on next rAF. nav.lang.* keys added to both messages files preserving 66-leaf-key parity. 3 deviations (all acceptance-grep literal compliance: jest-dom matcher swap, PaletteFab/cursor:none literals in doc comments).
- [Phase 04-homepage-sections]: Wave 0 dependency-gate complete: 9 assets + 12 MDX stubs + 3 fixed --color-category-* tokens (palette-independent, D-13) + shadcn Badge with category-{tech,design,bim} variants + i18n parity at 72 paths (skills.groups restructured string -> {label,items[]}) + page.tsx async Server Component composing 5 sections + 8 RED TDD harnesses ready for Wave 1+2 to GREEN.
- [Phase 04-homepage-sections]: Wave 0 build is intentionally RED — page.tsx imports 5 section components from components/sections/ that don't exist until Wave 1 (Hero/About/Skills/Contact) and Wave 2 (CategoryFilter/ProjectCard/ProjectGrid/ProjectsSection) ship them. This is the dependency-gate design: Wave 0 isolates all foundation work (CSS tokens, i18n keys, MDX stubs, Badge variants), Wave 1+2 then execute in parallel without file-conflict risk.
- [Phase 04-homepage-sections]: RED TDD harness pattern: each of 8 test files uses dynamic 'await import(./ComponentName)' so vitest reports 'Failed to resolve import' at runtime (not parse error). Files parse cleanly under lint+vitest discover, but every test FAILS until Wave 1+2 ships the named-export component file. Confirmed via 'npm test components/sections/' showing 'Test Files 8 failed (8)'.
- [Phase 04]: About section uses side-effect-only 'gsap/ScrollTrigger' import for TS type merging — LenisProvider owns the actual registerPlugin (Phase 3 module-load contract)
- [Phase 04]: MatchMediaController Vitest pattern: capture matchMedia callback for deterministic dual-branch testing of gsap.matchMedia reduced-motion gates — reusable for any ScrollTrigger-revealed section
- [Phase 04-homepage-sections]: Skills (HOME-06): GroupKey ReadonlyArray + variantFor() narrowing → 3-group GROUPS.map iteration with shadcn Badge category-{tech,design,bim} CVA variants from Wave 0; useGSAP({ scope: skillsRef }) + gsap.matchMedia full/reduced branches; ScrollTrigger timeline (start 'top 75%', toggleActions 'play none none reverse') with per-group tl.from() at position=idx*0.15 and intra-stagger 0.05s; reduced-motion calls gsap.set('[data-skill-badge]') snap-to-final; next-intl t.raw('groups.{key}.items') with Array.isArray + as unknown as string[] narrowing; outer <span data-skill-badge data-group> wraps Badge so GSAP selector stays stable across shadcn upgrades; Vitest mocks use native chai matchers (not jest-dom) matching Phase 3 setupFiles:[] precedent; 3 deviations auto-fixed in Wave 0 harness (Badge mock returning raw object, jest-dom matchers, vi.fn() generic inference)
- [Phase 04-homepage-sections]: [Phase 04-homepage-sections] HOME-01 Hero shipped — Pattern 1 (useGSAP scope + dependencies + matchMedia + SplitText) precedent established. Pitfall 4-A mitigated structurally via deps array [t('name'), t('role')] forcing matchMedia re-run on locale switch. Pitfall 4-D mitigated by ScrollTrigger.refresh() in SplitText.onSplit so downstream About/Skills triggers see Hero's post-split height. CTA: useLenis().scrollTo with offset -64 + scrollIntoView fallback. ChevronDown bounce y:[0,8,0] 2s gated by usePrefersReducedMotion. 11/11 tests, lint clean, zero color literals. Hero is leaf div not section (parent page.tsx owns the landmark).
- [Phase 04-homepage-sections]: 04-05: Contact uses AnimatePresence mode='wait' for Copy↔Check icon swap; popLayout reserved for ProjectGrid (04-03).
- [Phase 04-homepage-sections]: 04-05: Clipboard rejection is silent (empty catch) per Phase 2 D-02 silent-fallback precedent; recruiter still has mailto: + visible email as fallback.
- [Phase 04-homepage-sections]: 04-05: Reused Phase 3 D-23 lucide brand-icon substitutions (Code2/Briefcase/Mail) in Contact to avoid lucide-react downgrade cascade.
- [Phase 04-homepage-sections]: HOME-03 CategoryFilter: motion layoutId='filter-indicator' shared-element pattern reused verbatim from Phase 3 LanguageSwitcher D-18; only identifier string differs. Lifted state via active+onChange props (parent ProjectsSection owns). aria-pressed on each button. 4 OPTIONS const ['all','tech','design','bim']
- [Phase 04-homepage-sections]: HOME-04 ProjectCard: motion.div whileHover > Link from @/i18n/navigation > shadcn Card stack (Pitfall 4-I — motion OUTSIDE Link or pointer-enter never fires). useReducedMotion === true explicit check (Pitfall 4-B — null SSR state defaults to motion-enabled, avoids hover flicker during hydration). Discriminated metadata footer: tech.stack[0..2] / design.tools[0..2] / bim.software[0..1]+projectScale via metadataBadges(project) switch on project.category. Category badge uses categoryVariant() helper -> Wave 0 Badge variants (category-tech/design/bim, palette-independent fixed tokens). aria-label includes viewProject + title. ArrowUpRight icon with hover translate (x:4 y:-4) gated by same reducedMotion check
- [Phase 04-homepage-sections]: HOME-05 ProjectGrid: BOTH AnimatePresence mode='popLayout' AND outer motion.div with layout prop are required (Pitfall 4-C — popLayout removes exiting cards from layout flow as position:absolute; outer layout prop transitions parent height smoothly during exit states). initial={false} on AnimatePresence suppresses initial mount animation (cards visible immediately on page load; only filter changes trigger enter/exit). Empty state: SearchX lucide icon + projects.empty i18n + motion fade-in. Per-card motion.div key={slug} layout initial={opacity:0,scale:0.9} animate={opacity:1,scale:1} exit={opacity:0,scale:0.9} duration 0.3 easeOut
- [Phase 04-homepage-sections]: HOME-05 ProjectsSection: Server -> Client RSC boundary pattern. page.tsx (Server Component) calls await getProjects(locale) and passes the serialized discriminated Project union as a prop to <ProjectsSection projects={projects} /> (Client). ProjectsSection owns useState<FilterValue>('all') default + useMemo selector keyed [projects, active] for stable identity (avoids running AnimatePresence reconciliation unnecessarily across unrelated re-renders). Renders h2 title + CategoryFilter (with active+onChange) + ProjectGrid (with filtered). max-w-6xl container with md:flex-row title+filter layout
- [Phase 04-homepage-sections]: Test mock pattern correction: Wave 0 RED harnesses returned plain {type, props} objects which fail React reconciliation ('Objects are not valid as a React child'). Task 3 expanded harnesses use React.createElement(...) instead — matches Contact.test.tsx Wave 1 convention. Result: 42 new GREEN tests across 4 files. Full suite 222/222 (180 baseline + 42 new). motion.div/span/AnimatePresence mocks serialize whileHover/layout/mode props as data attributes so behavior is verifiable without running the actual motion engine in jsdom
- [Phase 05-project-content-pipeline]: 05-00: CommonFields.gallery?: string[] added (D-14) — validator accepts-but-not-requires via (s): s is string predicate + conditional spread (no any); all 12 pre-existing stubs still validate. texture-manager + brand-system carry gallery; 4 others omit it (skip path).
- [Phase 05-project-content-pipeline]: 05-00: projects.detail.* namespace = exactly 22 leaf keys/locale incl. meta.{tech,design,bim} category labels + meta.scale.{concept,residential,commercial,urban} consumed by 05-03 via t(meta.${category}) / t(meta.scale.${scale}); FR/EN parity at 94 leaf paths.
- [Phase 05-project-content-pipeline]: 05-00: New CONTENT-01 gate scripts/check-mdx-structure.ts (gray-matter parse + per-locale H2 markers + split(/\s+/) word count 250-400, exit 1 on any failure) modeled on check-i18n-parity.ts; skips _* templates. 12 bodies pass.
- [Phase 05-project-content-pipeline]: 05-01: data-lenis-prevent on DialogContent ONLY (Pitfall 5C); CodeBlock copies preRef.textContent (Pitfall 5F, raw 1:1, no transformer); warning Callout uses fixed --destructive (D-12), not --color-* alias; reused Phase 4 Contact D-20 clipboard pattern verbatim. Added root-level vitest include glob so root-convention mdx-components.test.tsx is discovered (Rule 3).
- [Phase 05-project-content-pipeline]: 05-02: useParallax hook (ANIM-02/D-13) authored verbatim from 05-RESEARCH Code Example #2 — useGSAP({scope,dependencies:[maxTranslate]}) + gsap.matchMedia dual-branch; full motion installs ScrollTrigger scrub:0.5 on [data-parallax-image] (y:-maxTranslate, ease:none), reduced motion gsap.set y:0 + no ScrollTrigger. factor kept in signature but unused (maxTranslate drives translate). Side-effect-only import 'gsap/ScrollTrigger' — never re-registers (LenisProvider owns it); reworded doc comment to drop literal 'registerPlugin' for acceptance-grep compliance. MatchMediaController test extended with toSpy; 10 tests, suite 267.
- [Phase 05-project-content-pipeline]: 05-03: project page (CONTENT-02) loads MDX via a RELATIVE dynamic import (../../../../content/projects/${slug}.${locale}.mdx) — the @/ alias fails Turbopack static analysis (Pitfall 5B). dynamicParams=false + generateStaticParams flatMap(routing.locales × getProjectSlugs()) emits exactly 12 static routes; notFound() on null slug. Server page + tiny ProjectCover 'use client' island (only the parallax DOM hook is client). Discriminated narrowing (project.category) drives the metadata strip with zero casts/any.
- [Phase 05-project-content-pipeline]: 05-03: build-time gotcha — the dynamic-import glob matches ALL content/projects/*.*.mdx including _template.{fr,en}.mdx; @next/mdx parses imported .mdx WITHOUT stripping frontmatter, so a bare <slug> placeholder in a template frontmatter comment became an unclosed JSX tag and broke the build. Fixed by rewording <slug> → [slug] in both templates (Rule 3). lib/projects.ts still filters _* at runtime (D-24). ProjectCover gradient scrim from-black/60 is the one sanctioned non-palette color. Code2 substitutes the removed lucide Github (Phase 3 D-23). jsdom page tests never render past the dynamic import.
- [Phase 06-seo-accessibility-polish]: 06-00: vitest-axe pinned EXACTLY 1.0.0-pre.5 (npm rewrote to caret on install; reverted). The latest dist-tag is the stale 2022 0.1.0 lacking the ./matchers subpath + modern axe-core. Verified ./matchers resolves to dist/matchers.js.
- [Phase 06-seo-accessibility-polish]: 06-00: Satori OG font sourced from rsms/inter v4.1 release zip (extras/ttf/Inter-SemiBold.ttf, 419744 B static) — the old docs/font-files raw path and google/fonts static dir both 404; google/fonts ships only the 876KB variable font (over Satori 500KB budget). next/font woff2 subsets are unusable by Satori.
- [Phase 06-seo-accessibility-polish]: 06-00: axe matcher wired additively (vitest-setup.ts expect.extend + vitest.config.ts setupFiles) — does NOT globally extend jest-dom, so the 276 chai-matcher tests stay green. No @vercel/og (next/og built-in), no @types/vitest-axe (ships own .d.ts).
- [Phase 06-seo-accessibility-polish]: 06-01: OG image routes render dynamically (ƒ) not statically prerendered — Next 16 defaults file-based OG routes under dynamic segments ([locale]/[slug]) to on-demand; functionally correct (card renders on first request + cached), satisfies A11Y-01, no static public/og.png fallback needed (D-04 fallback unused).
- [Phase 06-seo-accessibility-polish]: 06-01: sitemap.ts is canonical-<loc>-with-alternates (FR canonical at / and /projects/{slug}; fr/en <xhtml:link> alternates per entry). Slug-driven via getProjectSlugs (7 entries = 1 home + 6 projects). Build-verified sitemap.xml has correct as-needed hreflang (FR no prefix, EN /en).
- [Phase 06-seo-accessibility-polish]: 06-01: metadata/sitemap hreflang tests mock @/i18n/navigation with a faithful as-needed getPathname — next-intl react-client createNavigation statically imports bare 'next/navigation' which Vitest can't resolve under jsdom (node_modules externalized, resolve.alias doesn't reach it). Same module page.test.tsx already mocks. Real getPathname proven correct by build output.
- [Phase 06-seo-accessibility-polish]: 06-02: route-state trio at app/[locale]/ wires EXISTING errors.404/errors.500 keys verbatim (no new keys, parity stays 94 leaf paths). error.tsx is 'use client' + framework reset() prop (NOT a Server Action, D-08 lock; kept reset() over Next 16.2 unstable_retry). not-found.tsx motion entry gates on useReducedMotion → opacity-only (no scale) when reduced. loading.tsx is a Server Component role=status spinner with motion-safe:animate-pulse (static dot under reduced motion); project route re-exports it via export { default } from '../../loading'. Doc comments reworded to avoid acceptance-grep literals ('use client'/'use server'/next-intl/server) — same Rule-3 deviation class as Phases 3/4/5.
- [Phase 06-seo-accessibility-polish]: 06-03: A11Y-07 seeded stress test (lib/colors.stress.test.ts, Mulberry32 0xC0FFEE) drives 10 random sources x 4 modes = 40 palettes, each valid via validateFullMatrix after applyMatrixAdjust + all 6 tokens parse OKLCh no-NaN; re-asserts all 5 PALETTES. tsx gate scripts/stress-test-palettes.ts (npm run test:stress) mirrors it with the same seed, exit-1 on failure. Deterministic (same seed -> same pass).
- [Phase 06-seo-accessibility-polish]: 06-03: Fixed a real A11Y-07 defect in generateHarmonic — pale/high-L sources yielded accent/secondary below the 3.0 UI contrast threshold against the derived light bg (as low as 1.22), and applyMatrixAdjust (D-11) can't fix them (only shifts text/textMuted). Added clampUiContrast (L-only shift, hue+chroma preserved) clamping accent/secondary against bg + surface at generation time. D-11 invariant + Test 27 intact; harmonic hue offsets preserved.
- [Phase 06-seo-accessibility-polish]: 06-04: A11Y-04/05/06 audit shipped — 8 vitest-axe surfaces (color-contrast disabled ONLY) incl. PaletteFab icon-only accessible-name proof; global :focus-visible ring via var(--ring); check-reduced-motion.ts + check-image-audit.ts executable gates (exit 0). Suite 336 green.
- [Phase 06-seo-accessibility-polish]: 06-04: reduced-motion gate caught 5 real ungated motion animations (CategoryFilter/LanguageSwitcher layoutId morph, Contact/CodeBlock icon swap, ProjectGrid filter+layout) — each now gates on useReducedMotion; their test mocks gained useReducedMotion:()=>false. Dropped a dotAll s regex flag in check-image-audit (es2018 vs ES2017 target broke next build TS check).
- [Phase 06-seo-accessibility-polish]: 06-05: Local Lighthouse mobile gate (A11Y-08) recorded against prod build (/en): Perf 69, A11y 92, BP 96, SEO 92. Perf<90 is env-sensitive (Pitfall 5: GSAP+Lenis+Motion main-thread + local next start vs edge CDN) + architectural (code-split deferred per CLAUDE.md); no deterministic in-scope fix (images all score 1, metadata green, font preloaded). Authoritative >=90 deferred to deployed Vercel URL in Phase 7 per A11Y-08 wording. chrome-launcher EPERM temp-cleanup race on Windows fires after report is written (benign). 336 tests green, lint clean, build exit 0 preserved.
- [Phase 07-deployment]: 07-00: @vercel/analytics@^2 + @vercel/speed-insights@^2 mounted from /next (NOT /react) as last <body> children in app/[locale]/layout.tsx; layout STAYS a Server Component (the /next wrappers carry their own client boundary, no top-level 'use client'). check-analytics gate enforces the 4 markers + no client directive.
- [Phase 07-deployment]: 07-00: 3 new tsx exit-0/1 gates modeled on check-i18n-parity.ts — check-analytics (DEPLOY-03 mount), check-env-leak (D-08: git ls-files tracked-tree scan, only NEXT_PUBLIC_SITE_URL allowed + secret heuristics), check-readme (DEPLOY-01: rejects scaffold boilerplate + requires portfolio markers + asserts GITHUB_URL consistency across constants.ts/ascii.ts/README so D-02 owner change moves all three together). Aliased check:analytics/check:env-leak/check:readme.
- [Phase 07-deployment]: 07-00: ci.yml uses locked research YAML verbatim (Node 22 + npm cache; ci+lint+test+palette/i18n/mdx/reduced-motion/image gates+build); lighthouse deliberately EXCLUDED (env-sensitive, needs running server+headless Chrome — deployed measurement is D-09 HUMAN-UAT in 07-01). Branch renamed master->main (D-01).

### Pending Todos

None yet.

### Blockers/Concerns

- Vaporwave preset WCAG compliance — pre-validate in `lib/palettes.ts` with `adjustForAA` applied at definition time (flagged in research SUMMARY gaps)
- Per-locale MDX authoring strategy confirmed: separate `.fr.mdx` / `.en.mdx` files per project (translator-friendly)
- BIM 3D asset availability — deferred to v1.x, confirm with user before scoping
- REQUIREMENTS.md header says 51 v1 requirements but actual REQ-ID count is 52 (header should be updated to 52)

## Session Continuity

Last session: 2026-05-28T13:55:30.240Z
Stopped at: Phase 7: 07-00 done; 07-01 Task 1 done (repo pushed to tanguynoumea-collab/portfolio); PAUSED awaiting user Vercel connect (Tasks 2-4)
Resume file: .planning/phases/07-deployment/07-01-go-live-PLAN.md
