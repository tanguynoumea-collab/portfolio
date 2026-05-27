# Phase 3: Layout & Animation Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 03-CONTEXT.md — this log preserves the alternatives considered
> and the auto-mode rationale for each pick.

**Date:** 2026-05-27
**Phase:** 03-layout-animation-foundation
**Mode:** `--auto` (Claude picked recommended defaults; no interactive AskUserQuestion calls)
**Areas discussed:** Dependency Install, LenisProvider Config, Root Layout & Font, Navigation, LanguageSwitcher, Footer, CustomCursor, Page Transitions, Console ASCII Art, Plan Structure

---

## Dependency Install

| Option | Description | Selected |
|--------|-------------|----------|
| Single dedicated install plan (Wave 0) | Install `gsap`, `@gsap/react`, `lenis` in one plan, verify build before any feature work | ✓ (recommended) |
| Bundle install with LenisProvider plan | Install + scaffold in same plan | |
| Install per consumer plan (lazy) | Each plan adds the deps it needs | |

**Auto-mode pick:** Single dedicated install plan.
**Why recommended:** Isolates dependency upgrade risk to one atomic commit; `npm run build` verification gate before LenisProvider work begins; matches Phase 2 W0 pattern (test-infra-PLAN.md).

---

## LenisProvider Config (single-RAF + Pitfall 4 mitigation)

| Option | Description | Selected |
|--------|-------------|----------|
| Single RAF via `gsap.ticker` (autoRaf:false) | Lenis driven from GSAP's ticker; one frame loop for both | ✓ (recommended) |
| Dual RAF (Lenis self-drives, GSAP self-drives) | Default Lenis behavior; risks 1-2 frame desync with ScrollTrigger | |
| ScrollSmoother (GSAP) instead of Lenis | Drop Lenis entirely | (rejected — PROJECT.md mandates Lenis) |

**Auto-mode pick:** Single RAF via `gsap.ticker`.
**Why recommended:** Mandatory per PROJECT.md Key Decisions table, ARCHITECTURE.md Pattern 5, and PITFALLS.md Pitfall 4. No reasonable alternative.

### Lenis options sub-decisions

| Decision | Option chosen | Rationale |
|----------|---------------|-----------|
| `anchors` | `true` | LAYOUT-03 nav uses `href="#section"` anchors — must smooth-scroll, not jump |
| `prevent` | `(node) => node.hasAttribute('data-lenis-prevent')` | Lets Radix Sheet/Dialog content scroll natively; pairs with existing Pitfall E mitigation in globals.css |
| `lerp` | `0.1` | Lenis docs recommendation; balanced ease without sluggishness |
| `autoRaf` | `false` | Required by D-02 (single-RAF) |
| reduced-motion behavior | skip Lenis init entirely | Falls back to native scroll, ScrollTrigger still works |
| mobile input-focus | `lenis.stop()` on focus, `lenis.start()` on blur (< 768px) | Pitfall 4 mitigation for mobile keyboard hiding input |
| ScrollTrigger.refresh after palette swap | `rAF + setTimeout(refresh, 450ms)` watching `paletteId` | Lets the 400ms global color transition finish before recalculating positions |

---

## Root Layout & Font

| Option | Description | Selected |
|--------|-------------|----------|
| Inter via `next/font/google` | Variable font, latin-ext subset, balanced personality | ✓ (recommended) |
| Geist via `next/font/google` | Vercel's font; more technical/cold feel | |
| Two fonts (display + body) | More personality, more load weight | |
| Local custom font file | next/font/local | (planner can swap if user provides custom asset later) |

**Auto-mode pick:** Inter via `next/font/google`.
**Why recommended:** Inter balances tech / design / BIM hybrid identity; Geist skews too "Vercel-y". Inter has battle-tested accessibility (good x-height, distinct letterforms, full French diacritic coverage via `latin-ext`). Variable font means weight changes don't fetch new files.

### Font sub-decisions

| Decision | Option chosen |
|----------|---------------|
| Loading strategy | `display: 'swap'` + `preload: true` (no FOIT) |
| Subsets | `['latin', 'latin-ext']` (FR diacritics) |
| Weights | `['400', '500', '600', '700']` (body, links, headings, emphasis) |
| Fallback stack | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| Variable wiring | `inter.variable` on `<html>` className + `@theme { --font-sans: ... }` in globals.css |

### Provider mount order

Selected tree (per D-11):
```
NextIntlClientProvider
  └ ThemeProvider
      └ LenisProvider           ← NEW
          ├ ConsoleArt          ← NEW (mount-only)
          ├ Navigation          ← NEW
          ├ <main>{children}</main>
          ├ Footer              ← NEW
          ├ CustomCursor        ← NEW
          └ PaletteFab          (unchanged — Phase 2)
```

**Why:** LenisProvider inside ThemeProvider so it can `usePalette()` for D-05 refresh; chrome inside Lenis so anchor scrolling + cursor positioning work; PaletteFab unchanged.

---

## Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed top, transparent → blur on scroll | Modern, content-first, common on Awwwards-style sites | ✓ (recommended) |
| Fixed top, always solid | Safer but heavier visually | |
| Sticky with hide-on-scroll-down | Saves vertical space but adds complexity | |
| Side rail | Unusual for portfolio; bad mobile fit | |

**Auto-mode pick:** Fixed top, transparent → `bg-background/80 backdrop-blur-md` after >50px scroll.

### Navigation sub-decisions

| Decision | Option chosen |
|----------|---------------|
| Layout | logo left / section links center / LanguageSwitcher right |
| Section links | from `nav.*` i18n keys (home/about/projects/skills/contact) |
| Active-section highlight | IntersectionObserver on `<section id="...">` |
| Mobile collapse | hamburger via existing Sheet (side="left") |
| Logo | text wordmark "Tanguy" in `text-primary` |
| PaletteFab in nav? | NO — stays separate FAB per Phase 2 D-08 |

---

## LanguageSwitcher (LAYOUT-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented control `FR | EN` with motion indicator | Compact, both labels visible, animated active state | ✓ (recommended) |
| Dropdown menu | More flexible if more locales added | |
| Single toggle button (cycles FR ↔ EN) | Smallest footprint but hides current state | |
| Flag icons | (REJECTED — REQ LAYOUT-05 explicitly excludes flags) | ✗ |

**Auto-mode pick:** Segmented control with `<motion.div layoutId="lang-indicator">` driving the active background.

### LanguageSwitcher sub-decisions

| Decision | Option chosen |
|----------|---------------|
| Mechanics | `useRouter().replace(pathname, { locale })` + imperative `document.documentElement.lang = target` |
| Scroll preservation | capture scrollY before swap, `lenis.scrollTo` immediate post-swap |
| aria-label | localized via new `nav.lang.*` keys + `aria-pressed` on each button |
| Cookie | `NEXT_LOCALE` written automatically by next-intl (Phase 1 D-15) |

---

## Footer (LAYOUT-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Compact single-row | minimal, doesn't distract from content | ✓ (recommended) |
| Multi-column (about / projects / contact link grid) | corporate-y, heavy for portfolio | |
| Center-aligned hero footer | designer-y but big CLS | |

**Auto-mode pick:** Compact single-row.

### Footer sub-decisions

| Decision | Option chosen |
|----------|---------------|
| Layout | left = copyright + tagline / right = social icons / mobile = stacked |
| Social icons | `lucide-react` Github, Linkedin, Mail (mailto:) |
| GitHub link target | `https://github.com/tanguynoumea/portfolio` (per FEATURES.md "invites code review") |
| Copyright year | `new Date().getFullYear()` server-rendered + ICU `{year}` template |
| Tagline | use existing `footer.tagline` from `messages/fr.json` line 54; verify EN parity |
| Semantic landmark | `<footer>` sibling to `<main>` (separate screen-reader landmark) |
| CV PDF buttons? | NO — Phase 4 HOME-07 owns those in Contact section, not footer |

---

## CustomCursor (LAYOUT-06 — CRITICAL anti-feature constraints)

| Option | Description | Selected |
|--------|-------------|----------|
| Constrained tracer (native cursor visible + enhance on hover) | Small dot follows pointer, grows on interactive hover, NEVER hides native cursor | ✓ (recommended) |
| Full cursor takeover (`cursor: none`) | REJECTED — REQUIREMENTS.md OOS list + FEATURES.md anti-feature consensus | ✗ |
| Contextual hover labels only ("View →" on cards, no cursor) | FEATURES.md suggested alternative; cleaner but not what LAYOUT-06 requests | |
| Skip CustomCursor entirely | Drop the feature | (rejected — LAYOUT-06 is in REQ scope) |

**Auto-mode pick:** Constrained tracer.
**Why recommended:** REQUIREMENTS.md Out-of-Scope explicitly excludes "Cursor takeover (cache complètement le curseur natif)". FEATURES.md research lists full cursor takeover as a 2026 accessibility anti-pattern. The constrained pattern (native visible + decorative tracer) is the only one that satisfies LAYOUT-06 without violating OOS.

### CustomCursor sub-decisions

| Decision | Option chosen |
|----------|---------------|
| Activation gates | `pointer:fine` + `!reduced-motion` + `!any-pointer:coarse` + `!forced-colors:active` (all must be true) |
| Default size | 8-10px circle |
| Hover size | 32-40px (scaled via motion) |
| Hover targets | `'a, button, [role=button], [data-cursor=hover], img[data-zoomable]'` (event-delegated) |
| Color sourcing | direct CSS `background-color: var(--color-accent)` — auto-syncs on palette swap |
| Animation | `motion/react` spring (mass 0.3, stiffness 800) |
| `cursor: none` ever | NEVER (per OOS) |

---

## Page Transitions (ANIM-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Fade + 8px Y translate, 300ms, `popLayout` | Subtle, fast, doesn't fight content | ✓ (recommended) |
| Cross-dissolve only | Simplest; less personality | |
| Slide across | Awwwards-style but heavy for SPA nav | |
| No transitions | (rejected — ANIM-01 is in REQ scope) | ✗ |

**Auto-mode pick:** Fade + 8px Y translate, 300ms `easeOut`, `popLayout` mode.
**Why recommended:** Under the 350ms ceiling per REQ; `popLayout` aligns with Phase 4 HOME-05 filter grid which also needs `popLayout`; pathname-keyed prevents hash-only changes from re-mounting.

### Page transition sub-decisions

| Decision | Option chosen |
|----------|---------------|
| File | `app/template.tsx` (NEW) |
| AnimatePresence mode | `popLayout` (not `wait`) |
| Key | `usePathname()` |
| Reduced motion | instant fade ≤100ms, no translate |

---

## Console ASCII Art (EGG-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Bilingual signature ASCII + GitHub link + Konami hint | Personality + invites code review + advertises easter egg | ✓ (recommended) |
| Generic logo ASCII | Lower effort, less personality | |
| Haiku / poem per locale | More creative but verbose | |
| No console art | (rejected — EGG-01 is in REQ scope) | ✗ |

**Auto-mode pick:** Bilingual signature ASCII + GitHub link + subtle Konami hint.
**Why recommended:** FEATURES.md research explicitly suggests adding the GitHub repo link (invites code review) and Konami hint (discoverability). Matches the "creative-dev portfolio" persona established in PROJECT.md.

### Console ASCII sub-decisions

| Decision | Option chosen |
|----------|---------------|
| Source | `lib/ascii.ts` with `getAsciiArt('fr' | 'en')` exports |
| Glyph design | planner picks Figlet font (recommendation: "ANSI Shadow" or "Slant") |
| GitHub link | `https://github.com/tanguynoumea/portfolio` (forward reference; repo created Phase 7) |
| Konami hint | `↑ ↑ ↓ ↓ ← → ← → B A` (arrows; ASCII fallback if console can't render) — no explanation |
| Print mechanism | `<ConsoleArt />` client effect (`useEffect`, runs once on mount, not per route) |
| Accent color | `getComputedStyle(:root).getPropertyValue('--color-accent')` |
| Test guard | skip if `NODE_ENV === 'test'` or `typeof window === 'undefined'` |

---

## Plan Structure & Wave Topology

| Option | Description | Selected |
|--------|-------------|----------|
| 6 plans / 4 waves | install → LenisProvider+layout → chrome(parallel) → cursor+transitions+ascii(parallel) | ✓ (recommended) |
| Mega-plan (one big file) | All Phase 3 in one plan | |
| Per-component plan (8+ plans) | One plan per REQ | (over-granular for this size) |

**Auto-mode pick:** 6 plans / 4 waves.

### Plan sequence

1. `03-00-install-deps-PLAN.md` (Wave 0) — install gsap/@gsap/react/lenis, verify build
2. `03-01-lenis-provider-PLAN.md` (Wave 1) — LenisProvider single-RAF + all Pitfall 4 mitigations
3. `03-02-root-layout-font-PLAN.md` (Wave 1) — Inter via next/font/google + provider tree + `@theme --font-sans`
4. `03-03-navigation-lang-switcher-PLAN.md` (Wave 2 parallel) — Navigation + LanguageSwitcher + mobile Sheet + i18n keys
5. `03-04-footer-PLAN.md` (Wave 2 parallel) — Footer + social icons + EN parity check
6. `03-05-cursor-transitions-ascii-PLAN.md` (Wave 3 parallel sub-tasks) — CustomCursor + template.tsx + ConsoleArt + lib/ascii.ts

Planner may sub-split plan 03-05 if parallelism gets cleaner; bundling is acceptable given shared concerns (provider tree mount, reduced-motion gating, i18n locale source).

---

## Claude's Discretion

Areas deferred to planner / researcher (auto-mode noted but did not lock specific values):

- Exact ASCII glyph design (Figlet font choice, line breaks)
- Exact cursor sizes (8px default / 32px hover are starting suggestions)
- Exact LanguageSwitcher button padding / segmented-control border-radius
- Whether Footer is `<footer>` inside `<main>` or sibling (recommendation: sibling)
- Nav scroll-state threshold (50px starting point; planner may tune 64-100px)
- Whether IntersectionObserver lives in Nav or as `useActiveSection` hook
- Exact `lenis.scrollTo` timing for scroll-position preservation on language swap
- i18n key shape for `nav.lang.*` (final key names; ensure FR/EN parity)
- Whether to add the existing GitHub link in Footer + ConsoleArt before Phase 7 creates the repo (recommendation: yes, soft-fail)

---

## Deferred Ideas

Out-of-scope items captured during analysis (mirrored in 03-CONTEXT.md `<deferred>`):

- Sticky / pinned scroll sections — Phase 4+
- Mobile drawer with sub-sections / accordion — v2
- Animated nav-link underline beyond text-color change — v2
- Footer expansion (sitemap, subscribe form) — explicitly OOS
- CV PDF download buttons in Footer — Phase 4 HOME-07 owns them in Contact section
- CustomCursor contextual labels ("View →") instead of ring — v2 alternative
- Per-route page-transition variants — v2 polish
- Multi-language beyond FR/EN — v2 (requires LanguageSwitcher dropdown variant)
- Animated console output (ANSI sequences) — v2 polish
- Stack-trace-styled error pages — Phase 6 (A11Y-03)
- ScrollSmoother instead of Lenis — explicitly rejected by PROJECT.md

---

## Folded Todos

None — `gsd-tools todo match-phase 3` returned `todo_count: 0`.

---

*Discussion log generated: 2026-05-27 (auto mode)*
