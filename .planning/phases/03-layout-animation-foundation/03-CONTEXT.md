# Phase 3: Layout & Animation Foundation - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning
**Mode:** `--auto` (Claude picked recommended defaults; selections logged inline in `<decisions>`)

<domain>
## Phase Boundary

Build the persistent UI shell — Navigation, Footer, LanguageSwitcher, CustomCursor — on top of a Lenis + GSAP single-RAF animation infrastructure, with motion-powered page transitions, a custom font, and a bilingual console ASCII easter egg. Wires the root layout so every later phase inherits smooth-scroll, page transitions, and chrome that automatically validates against the Phase 2 palette switcher.

Delivers REQ **LAYOUT-01..06**, **ANIM-01**, **EGG-01** (8 requirements). Concretely:

- Install the animation deps (`gsap` + `@gsap/react` + `lenis` + plugins); `motion` is already on disk from Phase 2 W0.
- `LenisProvider` with `autoRaf: false` + `gsap.ticker` bridge + `data-lenis-prevent` for Radix overlays + ScrollTrigger.refresh on palette swap.
- Root layout (`app/[locale]/layout.tsx`) wires `next/font/google` (Inter) + ThemeProvider + LenisProvider + IntlProvider (already in place); body uses `font-sans` from `@theme`.
- `Navigation` fixed top with logo + section anchors + `LanguageSwitcher` (PaletteFab stays a separate FAB).
- `Footer` bilingual compact-row with social links + dynamic copyright.
- `LanguageSwitcher` segmented "FR | EN" control with motion + imperative `<html lang>` update.
- `CustomCursor` strictly constrained (native cursor stays visible; only enhances on hover over interactive elements; disabled on touch + `prefers-reduced-motion`).
- `app/template.tsx` adds motion `AnimatePresence mode="popLayout"` page transitions ≤350ms.
- `useConsoleArt()` (or layout-level effect) prints bilingual ASCII art with GitHub link + Konami hint on cold load.

**Out of scope for this phase** (already on the v2 list or explicit deferrals):

- Custom cursor *takeover* hiding the native cursor — explicitly OOS per REQUIREMENTS.md + FEATURES.md anti-feature consensus.
- Scroll-driven hero / About / Skills reveals — Phase 4 (`HOME-01..06`) consumes the LenisProvider + GSAP setup shipped here.
- Project-card parallax — Phase 5 (`ANIM-02`).
- A11y audit / Lighthouse 90+ pass / `axe-core` zero-error sweep — Phase 6 (this phase keeps a11y bar high but doesn't run the audit gate).
- Sitemap / metadata / loading / error / 404 pages — Phase 6 (`A11Y-01..03`, `EGG-02`).
- Deploy & Vercel Analytics — Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Dependency Installation (LAYOUT-02 dep gate)

- **D-01:** **Install in a single dedicated plan** as Wave 0 of Phase 3. Versions per `.planning/research/STACK.md`:
  - `gsap@^3.13.0` (free since Apr 2025 — ScrollTrigger + SplitText bundled)
  - `@gsap/react@^2.1.2` (`useGSAP()` cleanup hook)
  - `lenis@^1.3.x` (vanilla + bundled `lenis/react` wrapper — NOT `@studio-freight/*` legacy packages)
  - `motion` is already installed (^12.40.0 from Phase 2 W0) — no install needed
  - Auto-selected: **[auto] D-01 → recommended (single dependency-install plan)**

### LenisProvider (LAYOUT-02 — Pitfall 4 + Pitfall 5 mitigation)

- **D-02:** **Single-RAF pattern via `gsap.ticker`.** Lenis config `{ lerp: 0.1, autoRaf: false, anchors: true, prevent: (node) => node.hasAttribute('data-lenis-prevent') }`. Bridge: `gsap.ticker.add((t) => lenis.raf(t * 1000))` registered ONCE on provider mount. Cleanup removes the ticker callback + destroys Lenis. This is the mandatory pattern per `.planning/research/PITFALLS.md` §"Pitfall 4" and `ARCHITECTURE.md` §"Pattern 5". (Recommended)
  - Auto-selected: **[auto] D-02 → recommended (single-RAF via gsap.ticker)**

- **D-03:** **`anchors: true` enabled in Lenis config** so `<a href="#about">` smooth-scrolls correctly instead of native-jumping. Required by LAYOUT-03 (nav section anchors).
  - Auto-selected: **[auto] D-03 → recommended (anchors: true)**

- **D-04:** **`data-lenis-prevent` on Radix overlays.** The existing Sheet/Dialog/Popover content already uses Radix data-slot attributes (see `app/globals.css` Pitfall E mitigation). LenisProvider's `prevent: (node) => node.hasAttribute('data-lenis-prevent')` lets nested scrollable surfaces (long content inside the PaletteSwitcher Sheet at small viewport heights, future modals) keep native scroll. Phase 3 PaletteSwitcher consumer must apply `data-lenis-prevent` to its SheetContent root.
  - Auto-selected: **[auto] D-04 → recommended (data-lenis-prevent contract)**

- **D-05:** **`ScrollTrigger.refresh()` after palette swap.** LenisProvider subscribes to `usePalette()` `paletteId` via a `useEffect`. On change: schedule `requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(), 450))` — 450ms = 400ms color transition + 50ms buffer. Wrapped in rAF to avoid the "called during scroll" warning. (No Phase 3 component creates ScrollTriggers yet — this contract is installed now so Phase 4 Hero/About/Skills reveals + Phase 5 parallax inherit it correctly.)
  - Auto-selected: **[auto] D-05 → recommended (debounced refresh after palette swap)**

- **D-06:** **Lenis disabled under `prefers-reduced-motion: reduce`.** When reduced-motion is set, do NOT instantiate Lenis at all — fall back to native scroll. The `usePrefersReducedMotion()` hook (already shipped in Phase 2) drives this branch. ScrollTrigger still works against native scroll; no special wiring needed.
  - Auto-selected: **[auto] D-06 → recommended (skip Lenis under reduced-motion)**

- **D-07:** **Mobile input-focus pause.** When `window.matchMedia('(max-width: 768px)').matches` and a form input gains focus, call `lenis.stop()`; on blur, `lenis.start()`. Mitigates Pitfall 4's "mobile keyboard hides input" failure mode. (Implemented as a layout-level effect inside LenisProvider; doesn't affect desktop.)
  - Auto-selected: **[auto] D-07 → recommended (input-focus pause on mobile)**

### Root Layout & Font (LAYOUT-01)

- **D-08:** **`next/font/google` Inter** as the primary typeface. Variable font with `latin-ext` subset (covers French diacritics: é, è, à, ç, ï, etc.). Loaded as `--font-sans` CSS variable, wired into Tailwind v4 `@theme { --font-sans: var(--font-sans) }` so utilities like `font-sans` resolve. Single font (no display/body split) to keep load weight light.
  - **Why Inter over Geist:** Inter has a more balanced personality (works for tech + design + BIM); Geist reads as overtly "Vercel/tech" and would skew the hybrid identity. Inter is also more widely tested for accessibility (good x-height, distinct letterforms).
  - Auto-selected: **[auto] D-08 → recommended (Inter via next/font/google + latin-ext)**

- **D-09:** **Font loading strategy: `display: 'swap'` with `preload: true`.** Lets the page paint immediately with the system fallback, then swaps to Inter when ready. No FOIT (flash of invisible text). Combined with the existing `<html suppressHydrationWarning>` from Phase 1, layout shift is bounded by the fallback stack.
  - Auto-selected: **[auto] D-09 → recommended (swap + preload)**

- **D-10:** **Font fallback stack:** `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Declared via `next/font` `fallback` array and mirrored in Tailwind `@theme` `--font-sans`.
  - Auto-selected: **[auto] D-10 → recommended (system-ui fallback chain)**

- **D-11:** **Provider mount order in `app/[locale]/layout.tsx`** (extends the Phase 2 structure already in place):
  ```
  <html lang={locale} suppressHydrationWarning className={`${inter.variable}`}>
    <head><PaletteFouCScript /></head>
    <body>
      <NextIntlClientProvider>
        <ThemeProvider>
          <LenisProvider>           ← NEW Phase 3
            <ConsoleArt />          ← NEW Phase 3 (mount-only side effect)
            <Navigation />          ← NEW Phase 3 (fixed top)
            <main>{children}</main> ← unchanged
            <Footer />              ← NEW Phase 3
            <CustomCursor />        ← NEW Phase 3
            <PaletteFab />          ← unchanged (Phase 2)
          </LenisProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </body>
  </html>
  ```
  Rationale: LenisProvider INSIDE ThemeProvider so it can `usePalette()` for the D-05 refresh subscription. Navigation + Footer + CustomCursor INSIDE LenisProvider so they participate in smooth scroll (anchor links + cursor positioning).
  - Auto-selected: **[auto] D-11 → recommended (provider tree above)**

- **D-12:** **Base metadata in `app/[locale]/layout.tsx`** via `generateMetadata` (placeholder, Phase 6 expands). Phase 3 ships: `title: "Tanguy Delrieu — Tech × Design × BIM"`, `description` localized, `lang` via locale, `viewport` standard. No OG image yet (Phase 6 owns A11Y-01).
  - Auto-selected: **[auto] D-12 → recommended (minimal placeholder metadata)**

### Navigation (LAYOUT-03)

- **D-13:** **Fixed top, transparent at scroll=0 → solid with `backdrop-blur` after scrolling >50px.** Background = `bg-background/80 backdrop-blur-md` once solid. Tracks scroll via a `useEffect` listening on Lenis's `scroll` event (or native scroll under reduced-motion). Subtle border-bottom in the solid state via `border-b border-border`.
  - Auto-selected: **[auto] D-13 → recommended (transparent → blur-on-scroll)**

- **D-14:** **Layout:** logo/wordmark left → section links centered (or left-adjacent to logo on mobile) → `LanguageSwitcher` far right. **No PaletteFab in nav** (it's a separate bottom-right FAB per Phase 2 D-08).
  - Auto-selected: **[auto] D-14 → recommended (left logo / center links / right lang switcher)**

- **D-15:** **Section links from `nav.*` i18n keys** (`home`, `about`, `projects`, `skills`, `contact`). Each is an `<a href="#section-id">`. Lenis `anchors: true` handles the smooth-scroll. Active section highlight via `IntersectionObserver` watching `<section id="...">` elements.
  - Auto-selected: **[auto] D-15 → recommended (anchor links + IO active-state)**

- **D-16:** **Mobile collapse:** below `md` viewport, section links collapse into a hamburger menu (`<Sheet side="left">` reused from Phase 2 install — no new dep). Logo + LanguageSwitcher stay visible. Sheet content has `data-lenis-prevent` per D-04.
  - Auto-selected: **[auto] D-16 → recommended (hamburger via existing Sheet primitive)**

- **D-17:** **Logo treatment:** wordmark "Tanguy" in `font-sans font-semibold tracking-tight` styled as the accent color (`text-primary` via shadcn alias = `var(--color-accent)`). Clicks scroll to top (or navigates to `/{locale}` if on a project sub-page).
  - Auto-selected: **[auto] D-17 → recommended (text wordmark, accent color)**

### LanguageSwitcher (LAYOUT-05)

- **D-18:** **Segmented control `FR | EN`** — two buttons side-by-side with an animated motion-driven active indicator (`<motion.div layoutId="lang-indicator">`). Inactive label uses `text-muted-foreground`; active uses `text-foreground font-medium`. **No flag icons** (explicitly excluded by LAYOUT-05).
  - Auto-selected: **[auto] D-18 → recommended (segmented FR|EN with motion indicator)**

- **D-19:** **Locale switch mechanics:** click triggers `useRouter().replace(pathname, { locale: target })` from `next-intl/navigation`. Then imperatively set `document.documentElement.lang = target` (the `<html lang>` attribute) in a follow-up `useEffect` watching `useLocale()` — covers cases where Next's router doesn't re-render the `<html>` element. Cookie `NEXT_LOCALE` is written automatically by next-intl per Phase 1 D-15.
  - Auto-selected: **[auto] D-19 → recommended (router.replace + imperative html.lang)**

- **D-20:** **aria-label localized.** Add `palette.aria` namespace-style key — `nav.languageSwitcher` (FR: "Changer la langue", EN: "Switch language"). Each individual button has `aria-pressed={active}` + `aria-label={`Passer en ${target}`}` (FR) / `Switch to ${target}` (EN). Add the keys to `messages/{fr,en}.json` `nav.lang.*`.
  - Auto-selected: **[auto] D-20 → recommended (localized aria-label + aria-pressed)**

- **D-21:** **Preserve scroll position on language switch.** When swapping locale, capture `window.scrollY` (or `lenis.scroll`), perform router.replace, then `requestAnimationFrame(() => lenis.scrollTo(savedY, { immediate: true }))`. Without this, the user is teleported to top — bad UX for someone deep in a project page.
  - Auto-selected: **[auto] D-21 → recommended (scroll-position preservation)**

### Footer (LAYOUT-04)

- **D-22:** **Compact single-row footer** at the bottom of `<main>` (outside `<main>` is also acceptable; recommendation: inside the LenisProvider's child tree, sibling to `<main>{children}</main>`). Layout: left = copyright + "Built with Next.js + ❤️" tagline; right = social icon row (GitHub, LinkedIn, mailto:). Mobile: stack to 2 rows (copyright top, socials bottom).
  - Auto-selected: **[auto] D-22 → recommended (compact single-row)**

- **D-23:** **Social links from `lucide-react`** (Github, Linkedin, Mail icons). Each is a `<a>` with `aria-label` from `messages.contact.social.*` (already populated in Phase 1) + opens in new tab via `target="_blank" rel="noopener noreferrer"`. Email uses `mailto:`. The GitHub link points to the portfolio repo `tanguynoumea/portfolio` (per FEATURES.md research — invites code review).
  - Auto-selected: **[auto] D-23 → recommended (lucide icons + mailto + portfolio repo)**

- **D-24:** **Copyright year is dynamic** — `new Date().getFullYear()` rendered server-side in `app/[locale]/layout.tsx` and passed as a prop. Uses the existing `footer.copyright` i18n template (`"© {year} Tanguy Delrieu. Tous droits réservés."` / EN equivalent). The `{year}` ICU placeholder is already in `messages/fr.json` line 55.
  - Auto-selected: **[auto] D-24 → recommended (server-rendered year + ICU template)**

- **D-25:** **Tagline already in fr.json:** `footer.tagline: "Construit avec Next.js et beaucoup de café."` — Phase 3 ships this verbatim. No "Built with ❤️" change needed; the existing tagline is on-brand. EN equivalent should be added/verified in `messages/en.json` during this phase.
  - Auto-selected: **[auto] D-25 → recommended (use existing footer.tagline; verify EN parity)**

### CustomCursor (LAYOUT-06 — CONSTRAINED per FEATURES.md anti-feature list)

- **D-26:** **Constrained pattern — native cursor STAYS visible.** Implementation: a small `<motion.div>` fixed-positioned circle (8-10px) that follows the pointer. On hover over interactive elements (links, buttons, image cards), it grows to 32-40px with reduced opacity and centers on the target. **Never uses `cursor: none`.** The native pointer is always visible; the custom cursor is a decorative tracer/halo, NOT a takeover.
  - **Why:** FEATURES.md anti-feature consensus + REQUIREMENTS.md OOS list ("Cursor takeover" explicitly excluded). LAYOUT-06 must respect this constraint or the audit fails.
  - Auto-selected: **[auto] D-26 → recommended (constrained tracer, native cursor visible)**

- **D-27:** **Activation gates (all must be true):**
  - `window.matchMedia('(pointer: fine)').matches` (no touch / coarse pointer)
  - `!window.matchMedia('(prefers-reduced-motion: reduce)').matches`
  - `!window.matchMedia('(any-pointer: coarse)').matches` (no hybrid devices in coarse mode)
  - Optional: detect high-contrast cursor via `(forced-colors: active)` and disable
  
  If any gate fails → component renders `null` (no JS overhead, no DOM).
  - Auto-selected: **[auto] D-27 → recommended (4-gate activation)**

- **D-28:** **Color sourcing via direct CSS variable.** The cursor's `background-color` (or `border-color` if hollow ring) is `var(--color-accent)`. No JS subscription to palette changes — direct CSS var means the cursor auto-recolors instantly when ThemeProvider mutates `--color-accent`. Inside Sheet/Dialog overlays, the cursor stays positioned but may swap to a more-visible variant (e.g. higher chroma) if needed; v1 keeps it uniform.
  - Auto-selected: **[auto] D-28 → recommended (direct var(--color-accent))**

- **D-29:** **Hover detection via event delegation** on `document` for `pointerover`/`pointerout`. Selectors: `'a, button, [role=button], [data-cursor=hover], img[data-zoomable]'`. When entering one of these, set `state: 'hover'` → motion `<motion.div animate>` interpolates size + opacity. When leaving, return to default.
  - Auto-selected: **[auto] D-29 → recommended (event-delegated hover detection)**

- **D-30:** **Motion via `motion`** (already installed). Uses `motion/react` `<motion.div>` with `animate={{ x, y, scale, opacity }}` and `transition={{ type: 'spring', mass: 0.3, stiffness: 800 }}` for a tight follow (no laggy lerp). NOT GSAP-driven — keeps GSAP focused on scroll-driven and timeline work.
  - Auto-selected: **[auto] D-30 → recommended (motion spring follow)**

### Page Transitions (ANIM-01)

- **D-31:** **`app/template.tsx` with motion `AnimatePresence mode="popLayout"`.** `popLayout` (not `wait`) per ROADMAP / REQUIREMENTS — important because Phase 4's filter grid (HOME-05) needs the same `popLayout` mode and ANIM-01 sets the precedent here.
  - Auto-selected: **[auto] D-31 → recommended (popLayout mode)**

- **D-32:** **Transition: fade + 8px Y-translate, 300ms duration with `easeOut`.** Enter: `opacity 0→1 + translateY 8px→0`. Exit: `opacity 1→0 + translateY 0→-8px`. Under 350ms ceiling per REQ. Reduced-motion: instant fade (≤100ms, no translate).
  - Auto-selected: **[auto] D-32 → recommended (fade + Y-translate 300ms)**

- **D-33:** **Pathname key.** `<motion.div key={usePathname()}>` — each route gets a unique key so `AnimatePresence` mounts/unmounts cleanly across navigations. Hash-only changes (`#about` → `#projects` on same page) don't re-mount because the pathname is identical.
  - Auto-selected: **[auto] D-33 → recommended (pathname-keyed)**

### Console ASCII Art (EGG-01)

- **D-34:** **Bilingual ASCII content sourced from `lib/ascii.ts`** (new file). Two exports: `getAsciiArt('fr')` and `getAsciiArt('en')`. Each returns a multi-line template string. Content:
  - ASCII signature/wordmark (block letters for "Tanguy" or a creative glyph — planner picks).
  - 2-3 lines of intro text per locale ("Profil Tech × Design × BIM" / "Tech × Design × BIM profile").
  - GitHub repo link: `https://github.com/tanguynoumea/portfolio` (per FEATURES.md research recommendation).
  - Subtle Konami hint at the bottom: `// ↑ ↑ ↓ ↓ ← → ← → B A` — no explanation of what it does.
  - Auto-selected: **[auto] D-34 → recommended (bilingual ascii + github link + konami hint)**

- **D-35:** **Print mechanism: layout-level client effect that runs once on mount.** Place as a tiny `<ConsoleArt />` component (`"use client"`) mounted inside `LenisProvider` (per D-11). Uses `console.log('%c...', 'font-family: monospace; color: ...; line-height: 1.3;')` with the accent color sourced from `getComputedStyle(document.documentElement).getPropertyValue('--color-accent')`. Single `useEffect(() => {}, [])` ensures one print per page load (not per route transition).
  - Auto-selected: **[auto] D-35 → recommended (one-shot console.log on cold mount)**

- **D-36:** **Skip in test environments.** Guard with `if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined')`. Avoids spamming Vitest logs and SSR ReferenceErrors.
  - Auto-selected: **[auto] D-36 → recommended (env + window guards)**

### Plan Structure & Wave Topology

- **D-37:** **6 plans across 4 waves** — see `<specifics>` for the canonical plan sequence. Wave 0 = dependency install (sequential bottleneck). Wave 1 = LenisProvider + root-layout font wiring (sequential — both touch the layout file). Wave 2 = Navigation + LanguageSwitcher + Footer (parallel — independent components). Wave 3 = CustomCursor + page transitions template + console ASCII (parallel — independent components).
  - Auto-selected: **[auto] D-37 → recommended (6 plans / 4 waves)**

### Claude's Discretion

Decisions deferred to the researcher/planner — enough signal exists to choose well:

- **Exact ASCII art glyph design** — researcher / planner can use a generator (e.g., patorjk.com/figlet) and pick a readable, on-brand font; recommendation: "ANSI Shadow" or "Slant" Figlet font.
- **Exact pixel sizes for cursor (8px default / 32px hover)** — planner tunes against feel testing.
- **Exact `LanguageSwitcher` button padding / segmented-control border-radius** — shadcn defaults are fine starting point.
- **Whether the Footer is a `<footer>` semantic landmark inside `<main>` or sibling** — planner picks; recommendation: sibling so screen readers announce it as a separate landmark.
- **Nav scroll-state threshold (50px is the suggestion)** — planner can tune to 64-100px if it looks better.
- **Whether IntersectionObserver for active section highlight runs in Navigation or as a separate `useActiveSection` hook** — planner picks; hook extraction is cleaner if multiple components need it.
- **Page-transition exit-then-enter timing inside `popLayout`** — motion handles this automatically; planner tunes the `transition` object if needed.
- **Whether `ScrollTrigger.refresh()` debounce in D-05 is implemented as setTimeout vs `lenis.on('scroll', ...)` after settle** — both work; setTimeout is simpler.
- **i18n key additions to `messages/{fr,en}.json`** — recommended adds: `nav.lang.label`, `nav.lang.fr`, `nav.lang.en`, `nav.lang.switchTo` (or similar). Planner picks final key shape and ensures FR/EN parity (parity script already in place from Phase 1).
- **Sheet (mobile hamburger) `side` value** — recommendation `"left"` to avoid colliding with the PaletteFab (`right`). Planner confirms.
- **Exact Inter `weight` subsets** — recommendation `['400', '500', '600', '700']` to cover body, links, headings, and emphasis without over-fetching.

### Folded Todos

None — `gsd-tools todo match-phase 3` returned zero matches (`todo_count: 0`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, constraints (Next 16 / Tailwind v4 / GSAP+Lenis+motion / OKLCh / no `any` / structure dossiers), Key Decisions table (esp. single-RAF + useGSAP everywhere)
- `.planning/REQUIREMENTS.md` §"Layout & Core Components" (LAYOUT-01..06), §"Animations Avancées" (ANIM-01), §"Easter Eggs & Personality" (EGG-01)
- `.planning/REQUIREMENTS.md` §"Out of Scope" — esp. "Cursor takeover (cache complètement le curseur natif)" → drives D-26 CustomCursor constraint
- `.planning/ROADMAP.md` §"Phase 3: Layout & Animation Foundation" — phase goal + 5 success criteria
- `.planning/STATE.md` — current position, Phase 2 completion notes, accumulated decisions

### Prior phase context
- `.planning/phases/01-foundations/01-CONTEXT.md` — Repo structure (D-01..D-05), CSS vars + Terra default (D-06..D-09), shadcn aliasing chain (D-10..D-13), i18n routing + cookie persistence (D-14..D-17), discriminated Project type (D-18..D-22), `_*` filter convention (D-23..D-24)
- `.planning/phases/02-palette-system/02-CONTEXT.md` — Palette persistence shape (D-01..D-02), FOUC `<Script>` socket in `<head>` (D-03), shadcn Sheet installed (D-04), Sheet form factor + WCAGBadge sticky footer (D-05..D-07), PaletteFab styling (D-08), Custom + Harmonic UX (D-09..D-12), Konami unlock flow (D-13..D-16)
- `app/[locale]/layout.tsx` — current provider tree (NextIntlClientProvider → ThemeProvider → PaletteFab). Phase 3 inserts LenisProvider + chrome between ThemeProvider and PaletteFab per D-11

### Research synthesis (MANDATORY pre-read for downstream agents)
- `.planning/research/SUMMARY.md` — "Key Corrections vs PROJECT.md" table (motion not framer-motion, lenis not @studio-freight, sharp auto-bundled, etc.)
- `.planning/research/ARCHITECTURE.md` — **§"Pattern 5: Lenis + GSAP via Single RAF Loop"** (mandatory, drives D-02), §"Providers composition" (drives D-11), §"Pattern 8: Build order"
- `.planning/research/PITFALLS.md` — **§"Pitfall 4: Lenis breaks modals, anchor links, ScrollTrigger positions"** (drives D-02..D-07), **§"Pitfall 5: GSAP re-runs / refresh missed after palette swap"** (drives D-05 + future `useGSAP()` usage)
- `.planning/research/FEATURES.md` — **§"Custom cursor (full-page takeover) flagged as 2026 anti-feature"** (drives D-26..D-29 constraints — non-negotiable), §"Console ASCII art" (drives D-34: include GitHub link + Konami hint)
- `.planning/research/STACK.md` — exact install commands + versions for `gsap`, `@gsap/react`, `lenis` (drives D-01)

### External docs (downstream researcher fetches via context7)
- **GSAP** — `useGSAP()` hook API, `gsap.ticker.add` / `remove`, `ScrollTrigger.refresh()` semantics, plugin registration (`gsap.registerPlugin(ScrollTrigger)` once per app)
- **Lenis** — `new Lenis({ autoRaf, lerp, anchors, prevent })` config surface, `lenis.raf(time)` for external RAF, `lenis.stop()` / `start()`, `lenis.on('scroll', ...)`, the `lenis/react` bundled `ReactLenis` wrapper and `useLenis()` hook
- **motion** — `AnimatePresence mode="popLayout"`, `<motion.div layoutId>`, `useReducedMotion`, spring transition config
- **next-intl** — `useRouter`, `usePathname` (locale-aware), how `Link` / `useRouter().replace` handle locale switching while preserving path
- **Next.js 16 `template.tsx`** — vs `layout.tsx` lifecycle, instance re-creation per navigation (this is what enables `AnimatePresence` exit animations)
- **next/font/google** — `Inter` config (`subsets`, `weight`, `display`, `variable`, `preload`, `fallback`)

### Existing code (Phase 1 + 2 deliverables that downstream MUST read)
- `app/layout.tsx` — passthrough root layout (do not modify; only `app/[locale]/layout.tsx` changes)
- `app/[locale]/layout.tsx` — Phase 2 final state (NextIntlClientProvider + ThemeProvider + PaletteFab). Phase 3 inserts LenisProvider + chrome
- `app/[locale]/page.tsx` — minimal home page, will gain `<section id="hero|about|projects|skills|contact">` anchor IDs (likely a Phase 4 concern, but Nav's `IntersectionObserver` from D-15 needs the IDs to exist; Phase 3 can ship placeholder `<section>` shells in `page.tsx` if Phase 4 hasn't run yet)
- `app/globals.css` — Pitfall E mitigation already scopes Radix overlays out of the 400ms global color transition (lines 184-193). Phase 3 layout work shouldn't touch this.
- `components/providers/ThemeProvider.tsx` — exposes `usePalette()` with `paletteId` + `vaporwaveUnlockNonce`. LenisProvider's D-05 effect reads `paletteId` from here.
- `components/theme/PaletteFab.tsx` — bottom-right FAB, unchanged in Phase 3 (Nav must NOT include a palette button per D-14)
- `components/ui/sheet.tsx` — shadcn Sheet primitive, reused by Phase 3 mobile hamburger (D-16)
- `lib/hooks/usePrefersReducedMotion.ts` — drives D-06 (Lenis skip), D-26..D-30 (CustomCursor + page-transition reduced-motion fallback)
- `i18n/routing.ts` — `locales: ['fr', 'en']`, `defaultLocale: 'fr'`, `localePrefix: 'as-needed'`. LanguageSwitcher D-19 uses next-intl navigation helpers backed by this.
- `messages/{fr,en}.json` — existing keys for nav, footer, palette. Phase 3 adds `nav.lang.*` per D-20 + verifies `footer.tagline` EN parity per D-25.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`lib/hooks/usePrefersReducedMotion.ts`** — already shipped in Phase 2 W1. Drives D-06 (Lenis skip), D-27 (CustomCursor gate), D-32 (page transition reduce mode). Uses `useSyncExternalStore` (React 19 idiom).
- **`lib/hooks/useKonamiCode.ts`** — already shipped, hooked into ThemeProvider; not directly reused in Phase 3 but the ConsoleArt hint (D-34) advertises the sequence.
- **`components/providers/ThemeProvider.tsx`** — exposes `usePalette()` API. LenisProvider's D-05 palette-swap subscription reads `paletteId` from this.
- **`components/ui/sheet.tsx`** — shadcn Sheet primitive installed in Phase 2 (W3). Reused for Phase 3 mobile hamburger menu (D-16) — no new shadcn add needed.
- **`app/[locale]/layout.tsx`** — existing provider tree (NextIntlClientProvider → ThemeProvider → PaletteFab). Phase 3 inserts LenisProvider + Navigation + ConsoleArt + Footer + CustomCursor between ThemeProvider and PaletteFab per D-11.
- **`messages/{fr,en}.json`** — `nav.*`, `footer.*`, `contact.social.*` namespaces already populated from Phase 1 (63 leaf keys total). Phase 3 only adds `nav.lang.*` keys (D-20) and verifies `footer.tagline` EN parity (D-25).
- **`app/globals.css`** — Pitfall E mitigation (line 184-193) already scopes Radix overlays out of the 400ms transition; Phase 3 layout work doesn't touch this file.
- **`lib/utils.ts`** — `cn()` helper, used throughout new components.
- **`i18n/routing.ts`** — `locales`, `defaultLocale`. LanguageSwitcher D-19 uses next-intl navigation helpers backed by this config.
- **`canvas-confetti`** + **`motion`** — already installed (Phase 2). Phase 3 only needs `gsap`, `@gsap/react`, `lenis`.

### Established Patterns

- **shadcn token alias chain** (Phase 1 D-10..D-13) — `bg-primary` → `--primary` → `var(--color-accent)`. Phase 3 chrome components MUST use Tailwind utilities backed by these aliases (e.g., `bg-background`, `text-foreground`, `border-border`, `text-primary`). **Never hardcode OKLCh, hex, rgb, or hsl literals** anywhere.
- **OKLCh-only color authoring** (Phase 1 + 2 convention). CustomCursor reads `var(--color-accent)` directly via CSS, no hex/rgb conversion at boundaries except where culori is already the gateway (Phase 2 W3).
- **Server Components by default; `"use client"` only when interaction.** LenisProvider, Navigation, LanguageSwitcher, Footer, CustomCursor, ConsoleArt are ALL `"use client"` because they hook into browser APIs (scroll, pointer, console, router). `app/[locale]/layout.tsx` stays a Server Component (it composes the providers).
- **1 file = 1 responsibility** (atomic components). Expect ~5 new components in `components/layout/` (new directory): `Navigation.tsx`, `LanguageSwitcher.tsx`, `Footer.tsx`, `CustomCursor.tsx`, `ConsoleArt.tsx`. LenisProvider lives in `components/providers/LenisProvider.tsx` per existing convention.
- **No animations without `prefers-reduced-motion` gate** — D-06 (Lenis), D-27 (CustomCursor), D-30 (CustomCursor follow), D-32 (page transition).
- **next-intl** — `useTranslations()` in client components, `getTranslations({ locale })` in server. Never hardcode strings.
- **Test pattern** — every new component gets a `*.test.tsx` next to it (Phase 2 W0 set up Vitest + RTL + jsdom). LenisProvider can have a basic mount/cleanup test; UI components get smoke tests + a11y assertions.

### Integration Points

- **`app/[locale]/layout.tsx`** — Phase 3's main edit target. Adds:
  - `import { Inter } from 'next/font/google'` + setup (D-08..D-10)
  - `<html className={`${inter.variable} font-sans`}>` (D-08 + D-11)
  - New providers/components between `<ThemeProvider>` and `<PaletteFab />` per D-11
  - Optional `generateMetadata` (D-12)
- **`app/template.tsx`** — NEW file for `AnimatePresence` page transitions (D-31..D-33). This file did not exist in Phase 1 or 2.
- **`app/[locale]/page.tsx`** — needs `<section id="home">`, `<section id="about">`, etc. anchor targets for D-15 IntersectionObserver to find. Phase 3 can ship placeholder empty sections (Phase 4 fills them with content).
- **`messages/{fr,en}.json`** — add `nav.lang.label`, `nav.lang.switchTo` (or similar) keys per D-20. Maintain FR/EN parity (Phase 1's parity script gates).
- **Tailwind v4 `@theme` in `app/globals.css`** — add `--font-sans: var(--font-sans)` reference so `font-sans` utility resolves to Inter (D-08 ties this to `next/font`'s injected `--font-sans` CSS variable on `<html>`).
- **`ThemeProvider` hook surface** — already exposes everything LenisProvider needs (`paletteId` for D-05 subscription). No changes to ThemeProvider.

</code_context>

<specifics>
## Specific Ideas

- **Plan sequence (`<decisions>` D-37):**
  1. `03-00-install-deps-PLAN.md` — Wave 0: install `gsap@^3.13.0`, `@gsap/react@^2.1.2`, `lenis@^1.3.x`; verify `npm run build` passes. (LAYOUT-02 dep gate.) ~10 min.
  2. `03-01-lenis-provider-PLAN.md` — Wave 1: `components/providers/LenisProvider.tsx` (autoRaf:false + gsap.ticker bridge + data-lenis-prevent + ScrollTrigger.refresh after palette swap + reduced-motion skip + mobile input-focus pause). Vitest mount/cleanup test. (LAYOUT-02.) ~25 min.
  3. `03-02-root-layout-font-PLAN.md` — Wave 1: wire `next/font/google Inter` into `app/[locale]/layout.tsx` + provider tree per D-11 + base metadata + Tailwind `@theme --font-sans` reference. (LAYOUT-01.) ~15 min.
  4. `03-03-navigation-lang-switcher-PLAN.md` — Wave 2 (parallel with 03-04, 03-05): `components/layout/Navigation.tsx` + `components/layout/LanguageSwitcher.tsx` + mobile hamburger via Sheet + IntersectionObserver active section + i18n keys + tests. (LAYOUT-03, LAYOUT-05.) ~40 min.
  5. `03-04-footer-PLAN.md` — Wave 2 (parallel): `components/layout/Footer.tsx` + lucide social icons + dynamic year + EN parity check. (LAYOUT-04.) ~15 min.
  6. `03-05-cursor-transitions-ascii-PLAN.md` — Wave 3 (parallel — all three are independent and small): `components/layout/CustomCursor.tsx` (LAYOUT-06) + `app/template.tsx` motion page transitions (ANIM-01) + `components/layout/ConsoleArt.tsx` + `lib/ascii.ts` (EGG-01). Tests for each. ~45 min.

  Total ~2.5h estimate. Planner may split 03-05 into 3 plans if parallelism gets cleaner, but the 3 components share enough context (provider tree mount + reduced-motion + i18n) that bundling is fine.

- **Pitfall 4 hands-on checklist (LenisProvider plan):**
  - Verify clicking a nav link like `<a href="#about">` smooth-scrolls (anchors: true in config).
  - Verify Sheet content (PaletteSwitcher) can be scrolled with mouse wheel without Lenis hijacking — apply `data-lenis-prevent` to `SheetContent` root.
  - Verify ScrollTrigger position stays in sync — sanity-test with a basic ScrollTrigger that pins/unpins; before/after `ScrollTrigger.refresh()` call, log `lenis.scroll` vs `window.scrollY`.
  - Test mobile keyboard scenario: focus a form input on `(max-width: 768px)` viewport, expect `lenis.stop()` (verify with a flag). Blur → expect `lenis.start()`.
  - Test palette swap: click a different preset, wait 450ms, verify `ScrollTrigger.refresh()` was called (spy).

- **`<html className>` setup:** `next/font/google` exposes `inter.variable` (something like `__variable_xyz`). Apply to `<html>`: `<html lang={locale} className={`${inter.variable} font-sans`} suppressHydrationWarning>`. The `font-sans` Tailwind utility resolves via `@theme { --font-sans: var(--font-sans, ...) }` — Inter loaded; system fallback otherwise.

- **CustomCursor accessibility safeguard:** if `(forced-colors: active)` matches (Windows High Contrast), skip rendering. Add explicit test for this gate alongside touch + reduced-motion.

- **Footer EN parity check:** `messages/en.json` should mirror `footer.tagline` and `footer.copyright`. Run the existing parity script (or planner-equivalent grep) after editing.

- **Konami hint in ASCII** — print exactly `↑ ↑ ↓ ↓ ← → ← → B A` (with arrow glyphs) or fall back to `// up up down down left right left right B A` if console font doesn't render arrows reliably. No explanation text — the discoverability IS the easter egg.

- **GitHub link in console** — point to `https://github.com/tanguynoumea/portfolio` even though the repo doesn't exist yet (Phase 7 creates it). Soft-fail if user clicks; the message is aspirational + invites future code review per FEATURES.md research.

- **Lenis + Pitfall E synergy:** the existing `[data-slot='sheet-overlay']` etc. selectors in `app/globals.css` (lines 184-193) opt them OUT of the 400ms color transition. Phase 3 LenisProvider opts them OUT of Lenis scroll virtualization via `data-lenis-prevent`. Together, Radix overlays use their own ~200-250ms transitions AND native scroll — clean separation.

- **`useGSAP()` policy:** Phase 3 doesn't ship any GSAP-driven animations directly (those land in Phase 4 Hero + Phase 5 parallax). But the LenisProvider sets up the `gsap.ticker.add(...)` bridge and `gsap.registerPlugin(ScrollTrigger)` (called once at module load). Phase 4 components MUST use `useGSAP({ scope: ref })` per PROJECT.md key decision — Phase 3 PLAN.md should leave a `<contract>` note for downstream phases to honor this.

- **CustomCursor follow performance:** use `requestAnimationFrame` for pointer position state, NOT raw `pointermove` setState (would re-render at ~120Hz on high-refresh displays). motion's spring config already throttles internally — the React state update should batch via rAF.

- **Test setup reuse:** Phase 2 W0 shipped Vitest + RTL + jsdom + the `@/*` alias. Phase 3 component tests reuse this — no new test infra plan needed.

- **No new shadcn components needed.** Phase 2 already added Sheet; mobile hamburger reuses it. Existing 8 shadcn primitives (button, card, dialog, popover, sheet, slider, switch, tabs) cover all Phase 3 UI needs.

</specifics>

<deferred>
## Deferred Ideas

- **Sticky-section / pinned scroll sections** (e.g., GSAP scroll-pin on Skills) — out of scope for Phase 3 chrome; if Phase 4 wants it, ScrollTrigger is already registered and `useGSAP()` is the entry point.
- **Mobile nav drawer with sub-sections, accordion, etc.** — Phase 3 ships a simple hamburger; richer mobile nav UX is a v2 candidate.
- **Animated nav-link underline / active indicator beyond text-color change** — keep simple in v1; if a designer-y underline (motion `layoutId`) is wanted later, easy add.
- **Footer expansion (sitemap link grid, contact subscribe form, etc.)** — explicitly out of scope; v1 is compact-row only.
- **CV PDF download buttons** — LAYOUT-04 doesn't include them; HOME-07 (Phase 4) ships those in the Contact section. (REQUIREMENTS.md line 70 confirms Contact owns this, not Footer.)
- **CustomCursor "text mode" / contextual labels** (e.g., "View →" on project cards) — FEATURES.md suggests this as an alternative to cursor takeover; Phase 3 ships the simpler ring + scale enhancement first. Labels are a v2 candidate if hover feedback feels weak.
- **Page-transition variants per route type** (e.g., different motion for project pages vs. homepage) — v1 uses one transition everywhere. Variant routing is a future polish.
- **Multi-language support beyond FR/EN** (e.g., ES, DE) — `i18n/routing.ts` would extend, LanguageSwitcher D-18 segmented control would need a dropdown variant. Not in v1.
- **Console ASCII art with animated/colored frames (ANSI sequences)** — single static print in v1 per D-35. Animated console output is a fun future polish.
- **Stack-trace-styled error console messages for Phase 6 errors** — Phase 6 owns A11Y-03 `error.tsx` styling; out of Phase 3.
- **Server-side font preloading + critical CSS inlining beyond next/font defaults** — next/font already does this optimally; manual tuning is a Phase 6/7 perf concern.
- **`ScrollSmoother` (GSAP plugin) instead of Lenis** — explicitly rejected by PROJECT.md (Lenis is the chosen smooth-scroll lib). Both work; not revisiting.

### Reviewed Todos (not folded)

None — `gsd-tools todo match-phase 3` returned `todo_count: 0`.

</deferred>

---

*Phase: 03-layout-animation-foundation*
*Context gathered: 2026-05-27 (auto mode — Claude picked recommended defaults; user review encouraged before plan-phase)*
