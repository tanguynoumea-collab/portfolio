# Phase 3: Layout & Animation Foundation - Research

**Researched:** 2026-05-27
**Domain:** Next 16 App Router persistent UI shell (Navigation / LanguageSwitcher / Footer / CustomCursor / ConsoleArt) on a Lenis 1.3 + GSAP 3.13 single-RAF animation infrastructure with motion 12 page transitions, custom font (next/font/google Inter), bilingual i18n, all gated on prefers-reduced-motion.
**Confidence:** HIGH on the canonical patterns (single-RAF, useGSAP, ScrollTrigger.refresh debounce, next-intl navigation, AnimatePresence popLayout, next/font + Tailwind v4 @theme); MEDIUM on the few discretionary tunings (cursor spring constants, IntersectionObserver scroll-threshold, ASCII art glyph choice).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dependency Installation (LAYOUT-02 dep gate)**
- **D-01:** Install in a single dedicated plan as Wave 0 of Phase 3. Versions per `.planning/research/STACK.md`:
  - `gsap@^3.13.0` (free since Apr 2025 — ScrollTrigger + SplitText bundled)
  - `@gsap/react@^2.1.2` (`useGSAP()` cleanup hook)
  - `lenis@^1.3.x` (vanilla + bundled `lenis/react` wrapper — NOT `@studio-freight/*` legacy packages)
  - `motion` is already installed (^12.40.0 from Phase 2 W0) — no install needed

**LenisProvider (LAYOUT-02 — Pitfall 4 + Pitfall 5 mitigation)**
- **D-02:** Single-RAF pattern via `gsap.ticker`. Lenis config `{ lerp: 0.1, autoRaf: false, anchors: true, prevent: (node) => node.hasAttribute('data-lenis-prevent') }`. Bridge: `gsap.ticker.add((t) => lenis.raf(t * 1000))` registered ONCE on provider mount. Cleanup removes the ticker callback + destroys Lenis. MANDATORY pattern per PITFALLS.md §"Pitfall 4" + ARCHITECTURE.md §"Pattern 5".
- **D-03:** `anchors: true` enabled in Lenis config so `<a href="#about">` smooth-scrolls correctly. Required by LAYOUT-03 (nav section anchors).
- **D-04:** `data-lenis-prevent` on Radix overlays. Phase 3 PaletteSwitcher consumer must apply `data-lenis-prevent` to its SheetContent root. Mobile hamburger Sheet content also gets the attribute.
- **D-05:** `ScrollTrigger.refresh()` after palette swap. LenisProvider subscribes to `usePalette()` `paletteId` via a `useEffect`. On change: schedule `requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(), 450))` — 450ms = 400ms color transition + 50ms buffer.
- **D-06:** Lenis disabled under `prefers-reduced-motion: reduce`. When reduced-motion is set, do NOT instantiate Lenis at all — fall back to native scroll.
- **D-07:** Mobile input-focus pause. When `window.matchMedia('(max-width: 768px)').matches` and a form input gains focus, call `lenis.stop()`; on blur, `lenis.start()`.

**Root Layout & Font (LAYOUT-01)**
- **D-08:** `next/font/google` Inter as the primary typeface. Variable font with `latin-ext` subset. Loaded as `--font-sans` CSS variable, wired into Tailwind v4 `@theme { --font-sans: var(--font-sans) }`. Single font, no display/body split.
- **D-09:** Font loading strategy: `display: 'swap'` with `preload: true`. Combined with the existing `<html suppressHydrationWarning>` from Phase 1.
- **D-10:** Font fallback stack: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **D-11:** Provider mount order in `app/[locale]/layout.tsx`:
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
- **D-12:** Base metadata in `app/[locale]/layout.tsx` via `generateMetadata` (placeholder, Phase 6 expands). Phase 3 ships: `title`, localized `description`, `lang`, `viewport`. No OG image yet.

**Navigation (LAYOUT-03)**
- **D-13:** Fixed top, transparent at scroll=0 → solid with `backdrop-blur` after scrolling >50px. Background = `bg-background/80 backdrop-blur-md` once solid. Border-bottom in solid state via `border-b border-border`.
- **D-14:** Layout: logo left → section links centered → `LanguageSwitcher` far right. NO PaletteFab in nav.
- **D-15:** Section links from `nav.*` i18n keys. Each is an `<a href="#section-id">`. Active section highlight via `IntersectionObserver`.
- **D-16:** Mobile collapse below `md`: hamburger menu via `<Sheet side="left">` (reused from Phase 2). Sheet content has `data-lenis-prevent` per D-04.
- **D-17:** Logo treatment: wordmark "Tanguy" in `font-sans font-semibold tracking-tight` styled with `text-primary`. Clicks scroll to top.

**LanguageSwitcher (LAYOUT-05)**
- **D-18:** Segmented control `FR | EN` — two buttons side-by-side with an animated motion-driven active indicator (`<motion.div layoutId="lang-indicator">`). NO flag icons.
- **D-19:** Locale switch via `useRouter().replace(pathname, { locale: target })` from `next-intl/navigation`. Then imperatively set `document.documentElement.lang = target` in a follow-up `useEffect`.
- **D-20:** aria-label localized. Add `nav.lang.*` keys to `messages/{fr,en}.json`. Each button has `aria-pressed={active}` + localized `aria-label`.
- **D-21:** Preserve scroll position on language switch. Capture `lenis.scroll` (or `window.scrollY`), perform router.replace, then `requestAnimationFrame(() => lenis.scrollTo(savedY, { immediate: true }))`.

**Footer (LAYOUT-04)**
- **D-22:** Compact single-row footer. Left = copyright + tagline; right = social icon row (GitHub, LinkedIn, mailto). Mobile: stack to 2 rows.
- **D-23:** Social links from `lucide-react` (Github, Linkedin, Mail). `target="_blank" rel="noopener noreferrer"`. Email = `mailto:`. GitHub link points to `tanguynoumea/portfolio`.
- **D-24:** Copyright year dynamic — `new Date().getFullYear()` rendered server-side and passed as prop. Uses existing `footer.copyright` ICU template.
- **D-25:** Use existing `footer.tagline`. Verify EN parity.

**CustomCursor (LAYOUT-06 — CONSTRAINED per FEATURES.md anti-feature list)**
- **D-26:** Constrained pattern — native cursor STAYS visible. Small `<motion.div>` fixed-positioned circle (8-10px) follows the pointer. On hover over interactive elements, grows to 32-40px with reduced opacity. NEVER uses `cursor: none`.
- **D-27:** Activation gates (all must be true):
  - `window.matchMedia('(pointer: fine)').matches`
  - `!window.matchMedia('(prefers-reduced-motion: reduce)').matches`
  - `!window.matchMedia('(any-pointer: coarse)').matches`
  - `!window.matchMedia('(forced-colors: active)').matches`
  - If any gate fails → component renders `null`.
- **D-28:** Color sourcing via direct CSS variable: `var(--color-accent)`. No JS subscription to palette changes.
- **D-29:** Hover detection via event delegation on `document` for `pointerover`/`pointerout`. Selectors: `'a, button, [role=button], [data-cursor=hover], img[data-zoomable]'`.
- **D-30:** Motion via `motion` (motion/react). `<motion.div animate={{ x, y, scale, opacity }} transition={{ type: 'spring', mass: 0.3, stiffness: 800 }}>`.

**Page Transitions (ANIM-01)**
- **D-31:** `app/template.tsx` with motion `AnimatePresence mode="popLayout"`. NOT `wait`.
- **D-32:** Transition: fade + 8px Y-translate, 300ms duration with `easeOut`. Reduced-motion: instant fade (≤100ms, no translate).
- **D-33:** Pathname key. `<motion.div key={usePathname()}>`.

**Console ASCII Art (EGG-01)**
- **D-34:** Bilingual ASCII content sourced from `lib/ascii.ts`. Two exports: `getAsciiArt('fr')` and `getAsciiArt('en')`. Includes ASCII wordmark, 2-3 intro lines, GitHub repo link (`https://github.com/tanguynoumea/portfolio`), subtle Konami hint `// ↑ ↑ ↓ ↓ ← → ← → B A`.
- **D-35:** Print mechanism: layout-level client effect that runs once on mount. Small `<ConsoleArt />` (`"use client"`) mounted inside `LenisProvider`. Uses `console.log('%c...', 'font-family: monospace; color: ...; line-height: 1.3;')`. Single `useEffect(() => {}, [])`.
- **D-36:** Skip in test environments. Guard with `if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined')`.

**Plan Structure & Wave Topology**
- **D-37:** 6 plans across 4 waves. Wave 0 = dependency install (sequential bottleneck). Wave 1 = LenisProvider + root-layout font wiring (sequential — both touch the layout file). Wave 2 = Navigation + LanguageSwitcher + Footer (parallel). Wave 3 = CustomCursor + page transitions template + console ASCII (parallel).

### Claude's Discretion

- Exact ASCII art glyph design (recommend Figlet "ANSI Shadow" or "Slant" font).
- Exact pixel sizes for cursor (8px default / 32px hover) — planner tunes against feel testing.
- Exact `LanguageSwitcher` button padding / segmented-control border-radius — shadcn defaults are fine starting point.
- Whether the Footer is a `<footer>` semantic landmark inside `<main>` or sibling — recommendation: sibling so screen readers announce it as a separate landmark.
- Nav scroll-state threshold (50px is the suggestion) — planner can tune to 64-100px.
- Whether IntersectionObserver for active section highlight runs in Navigation or as a separate `useActiveSection` hook — hook extraction is cleaner if multiple components need it.
- Page-transition exit-then-enter timing inside `popLayout` — motion handles this automatically; planner tunes the `transition` object if needed.
- Whether `ScrollTrigger.refresh()` debounce in D-05 is implemented as setTimeout vs `lenis.on('scroll', ...)` after settle — both work; setTimeout is simpler.
- i18n key additions to `messages/{fr,en}.json` — recommended: `nav.lang.label`, `nav.lang.fr`, `nav.lang.en`, `nav.lang.switchTo`.
- Sheet (mobile hamburger) `side` value — recommendation `"left"` to avoid colliding with the PaletteFab (`right`).
- Exact Inter `weight` subsets — recommendation `['400', '500', '600', '700']`.

### Deferred Ideas (OUT OF SCOPE)

- Sticky-section / pinned scroll sections (e.g., GSAP scroll-pin on Skills) — Phase 4/5.
- Mobile nav drawer with sub-sections, accordion, etc. — v2 candidate.
- Animated nav-link underline / active indicator beyond text-color change — v2 polish.
- Footer expansion (sitemap link grid, contact subscribe form, etc.).
- CV PDF download buttons — Phase 4 HOME-07 (Contact section).
- CustomCursor "text mode" / contextual labels (e.g., "View →" on project cards) — v2 candidate.
- Page-transition variants per route type — v1 uses one transition everywhere.
- Multi-language support beyond FR/EN — i18n/routing.ts would extend.
- Console ASCII art with animated/colored frames (ANSI sequences) — single static print in v1.
- Stack-trace-styled error console messages for Phase 6 errors.
- Server-side font preloading + critical CSS inlining beyond next/font defaults.
- `ScrollSmoother` (GSAP plugin) instead of Lenis — explicitly rejected by PROJECT.md.
- **NON-NEGOTIABLE: Cursor takeover (`cursor: none` hiding the native cursor).** REQUIREMENTS.md OOS list.
</user_constraints>

## Project Constraints (from CLAUDE.md)

These constraints apply to every plan, task, and verification step in Phase 3. The planner MUST honor them.

| Constraint | Source | Enforcement |
|------------|--------|-------------|
| **Next 16 App Router only** — `proxy.ts` (not middleware.ts), `params`/`cookies()`/`headers()` async, Turbopack default | CLAUDE.md "Constraints" | Lint + build |
| **React 19.2 strict** | CLAUDE.md | Build |
| **TypeScript strict, no `any`** | CLAUDE.md | tsc --noEmit |
| **Tailwind v4 `@theme` in CSS — no `tailwind.config.ts`** | CLAUDE.md | grep for tailwind.config |
| **All colors via `var(--color-*)` CSS variables** — no hex/rgb/hsl/oklch literals in component files | CLAUDE.md, Phase 1 D-06..D-09 | grep + ESLint candidate |
| **`useGSAP()` for every GSAP usage** — never raw `useEffect` | CLAUDE.md "Patterns animations" | Code review |
| **Server Components by default** — `"use client"` only when interaction | CLAUDE.md | Manual audit |
| **One file = one responsibility** | CLAUDE.md "Composants" | Per-component plan |
| **Components in `components/layout/`** for nav/footer/etc.; `components/providers/` for providers | CLAUDE.md | Plan file placement |
| **i18n via `useTranslations()` / `getTranslations()`** — no hardcoded strings | CLAUDE.md | grep for nav.*, footer.* keys |
| **WCAG AA preserved** — focus visible, aria-labels, keyboard nav | CLAUDE.md "Accessibilité" | Manual audit |
| **`prefers-reduced-motion` respected on every animation** | CLAUDE.md + REQUIREMENTS.md A11Y-05 | Audit gate |
| **No `cursor: none`** (CustomCursor takeover is OOS) | REQUIREMENTS.md L130 + FEATURES.md anti-features | Code review |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **LAYOUT-01** | `app/[locale]/layout.tsx` (Server Component) wraps pages with ThemeProvider + LenisProvider + IntlProvider + custom font via `next/font/google` + base metadata | §2 (next/font Inter + variable + Tailwind v4 `@theme` integration); §9 (provider tree); §3 (generateMetadata) |
| **LAYOUT-02** | `LenisProvider` (client) with `autoRaf: false`, registered in `gsap.ticker`, calls `ScrollTrigger.refresh()` after layout changes, exposes native scroll for `data-lenis-prevent` elements | §1 (Lenis 1.3 + GSAP single-RAF), §2 (palette swap → ScrollTrigger.refresh), §11 (reduced-motion gate cascade) |
| **LAYOUT-03** | Fixed `Navigation` with logo + section anchor links + `LanguageSwitcher`; PaletteSwitcher stays a separate FAB | §7 (IntersectionObserver active section), §8 (Sheet mobile hamburger) |
| **LAYOUT-04** | Bilingual `Footer` with social links (GitHub, LinkedIn, email mailto) + dynamic year + tagline | §3 (Server-rendered year prop), §10 (i18n shape) |
| **LAYOUT-05** | `LanguageSwitcher` FR/EN toggle with motion, imperative `<html lang>` update, scroll preservation | §4 (next-intl navigation API + router.replace locale switching) |
| **LAYOUT-06** | `CustomCursor` desktop-only (`pointer: fine`, non-touch, non-reduced-motion); CONSTRAINED — native cursor stays visible | §6 (cursor constraint pattern + activation gates + rAF perf) |
| **ANIM-01** | `app/template.tsx` with motion `AnimatePresence mode="popLayout"` page transitions ≤350ms | §5 (template.tsx + AnimatePresence + reduced-motion) |
| **EGG-01** | Bilingual console ASCII art with subtle Konami hint, printed on cold load | §10 (one-shot print pattern + bilingual content + GitHub link) |
</phase_requirements>

## Executive Summary

1. **LenisProvider is the keystone task.** Use the **vanilla `Lenis` class with manual `gsap.ticker.add`** (NOT the `lenis/react` `ReactLenis` wrapper). Reason: the wrapper's auto-RAF and re-rendering on every `useLenis()` subscription work against the explicit single-RAF / palette-driven `ScrollTrigger.refresh` pattern the project mandates. The vanilla class gives full control over instantiation gates (reduced-motion skip, mobile input-focus pause) and predictable React 19 Strict Mode cleanup via a stable `useEffect` with explicit destroy.

2. **`template.tsx` MUST be a Client Component** (`"use client"` at the top). Per Next 16 docs, templates default to Server Components, but motion's `AnimatePresence` requires the client runtime. `key={usePathname()}` triggers the unmount-mount cycle on route change — that is the contract Next 16 templates expose.

3. **next-intl ships `createNavigation(routing)`** which exports a locale-aware `useRouter` whose `.replace(pathname, { locale: target })` is the canonical locale-switch primitive. `usePathname()` from the same module returns the **locale-stripped** path — exactly what we need to feed back into `.replace`. The imperative `document.documentElement.lang = target` update in D-19 is still required because next-intl's router does not re-render the `<html>` element; it only updates the URL and triggers route data fetches.

4. **The Pitfall E + D-04 + Sheet-data-lenis-prevent triple-stack is the right shape.** Phase 2 already scopes Radix overlay surfaces out of the 400ms global color transition (lines 184-193 of `app/globals.css`). Phase 3 adds `data-lenis-prevent` to those same surfaces' content roots so Lenis virtualization also skips them. Together: Radix overlays use their own ~200-250ms transitions AND their own native scroll. The mobile hamburger Sheet (D-16) inherits this contract automatically since it reuses the existing Phase 2 `components/ui/sheet.tsx`.

5. **CustomCursor must be a `<motion.div>` driven by a `pointermove` handler that uses a `useRef` + `motion`'s spring** — NOT React state. Setting state on every pointer move would re-render at ~120Hz on high-refresh displays and crater Lighthouse TBT. The motion library's spring config interpolates from a ref-stored target position, batched in motion's own scheduler. Activation gates (D-27) collapse the component to `null` early so non-eligible devices pay zero JS cost.

## Standard Stack

### Phase 3 Net-New Dependencies (Verified 2026-05-27)

| Library | Version | Purpose | Verified |
|---------|---------|---------|----------|
| **gsap** | `^3.13.0` | Core animation engine + ScrollTrigger (single-RAF bridge target) | npm view gsap version → **3.15.0** (current); 3.13+ satisfies caret. Free since Apr 2025. |
| **@gsap/react** | `^2.1.2` | `useGSAP()` hook for cleanup + Strict Mode safety | npm view @gsap/react version → **2.1.2** (current) |
| **lenis** | `^1.3.0` | Smooth scroll, RAF-driven; vanilla class drives Lenis from gsap.ticker | npm view lenis version → **1.3.23** (current); 1.3+ satisfies caret. NOT `@studio-freight/lenis`. |

### Already Installed (Phase 1 + 2)

| Library | Version | Purpose |
|---------|---------|---------|
| **motion** | `^12.40.0` | `AnimatePresence`, `<motion.div>` for page transitions + cursor follow + LanguageSwitcher indicator. Imports via `motion/react`. |
| **next-intl** | `^4.12.0` | `createNavigation` for locale-aware Link/useRouter/usePathname |
| **next** | `^16.2.6` | App Router, `next/font/google`, `template.tsx` convention |
| **lucide-react** | `^1.16.0` | Footer social icons (Github, Linkedin, Mail), Menu/X for hamburger |
| **radix-ui** | `^1.4.3` | Sheet primitive (reused for mobile hamburger) — already wrapped in `components/ui/sheet.tsx` |
| **canvas-confetti** | `^1.9.4` | (no Phase 3 use) — already dynamic-imported only on Konami |
| **culori** | `^4.0.2` | (no Phase 3 use) |

### Install Commands (Wave 0)

```bash
npm install gsap@^3.13.0 @gsap/react@^2.1.2 lenis@^1.3.0
```

**Verification gate:** after install, `npm run build` exit 0, `npm run lint` exit 0, `npm run test` 94/94 still green (Phase 2 baseline). No version conflicts expected — gsap and lenis have zero peer-dep overlap with motion 12.

### Why these versions

- **gsap 3.13+ verified free for commercial use** since Webflow acquisition Apr 2025 (STACK.md HIGH confidence, multiple corroborating sources). SplitText / ScrollTrigger / ScrollSmoother bundled in the public `gsap` package; no Club bonus repo needed.
- **@gsap/react 2.1.2** is the React 19 Strict Mode-safe `useGSAP()` hook. Drop-in replacement for `useEffect` that wraps animations in `gsap.context()` for auto-cleanup. Phase 3 doesn't ship GSAP-driven animations directly (those are Phase 4 Hero + Phase 5 parallax), BUT the LenisProvider sets up `gsap.registerPlugin(ScrollTrigger)` and `gsap.ticker.add(...)` once at module load, and Phase 3 PLAN.md should leave a `<contract>` note instructing Phase 4 to use `useGSAP({ scope: ref })`.
- **lenis 1.3.x** is the current Darkroom Engineering package (post Studio Freight rebrand). Bundled React wrapper at `lenis/react` — we deliberately ignore it (see §1 below).

## §1 — Lenis 1.3.x + GSAP 3.13.x Integration in Next 16 App Router

### Key Finding: Use the vanilla `Lenis` class, NOT `ReactLenis`

**Verified pattern (HIGH confidence — Context7-equivalent fetch from github.com/darkroomengineering/lenis README + lenis.dev API surface):**

```typescript
// components/providers/LenisProvider.tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePalette } from '@/components/providers/ThemeProvider';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// MODULE-LEVEL registration — runs once when the module is first imported.
// Idempotent: gsap.registerPlugin is a no-op on repeat calls with the same plugin.
gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { paletteId } = usePalette();
  const reducedMotion = usePrefersReducedMotion();

  // Lifecycle: instantiate Lenis once per cold mount, destroy on unmount.
  // Strict Mode handles the double-invoke correctly because the cleanup
  // destroys the first instance before the second mount creates a new one.
  useEffect(() => {
    if (reducedMotion) return; // D-06: skip Lenis entirely under reduced motion.

    const lenis = new Lenis({
      lerp: 0.1,                                  // D-02 default
      autoRaf: false,                              // D-02 — gsap.ticker drives RAF
      anchors: true,                               // D-03 — smooth-scroll <a href="#section">
      prevent: (node) => node.hasAttribute('data-lenis-prevent'), // D-04
    });
    lenisRef.current = lenis;

    // Drive Lenis from GSAP's single ticker (no double-RAF).
    // gsap.ticker callback receives `time` in seconds; lenis.raf wants milliseconds.
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);                   // Disable lag smoothing for predictable scroll

    // Wire ScrollTrigger's scroll position to Lenis.
    lenis.on('scroll', ScrollTrigger.update);

    // First refresh once the bridge is live so any ScrollTriggers
    // registered later see correct positions from frame 1.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]); // Re-run if user toggles reduced-motion at OS level (rare but real).

  // D-05: ScrollTrigger.refresh after palette swap.
  // 400ms global color transition + 50ms buffer = 450ms.
  // requestAnimationFrame wrapper prevents the "called during scroll" warning.
  useEffect(() => {
    if (reducedMotion) return; // No ScrollTriggers expected without animation infra.
    const id = window.requestAnimationFrame(() => {
      window.setTimeout(() => ScrollTrigger.refresh(), 450);
    });
    return () => window.cancelAnimationFrame(id);
  }, [paletteId, reducedMotion]);

  // D-07: Mobile input-focus pause.
  useEffect(() => {
    if (reducedMotion) return;
    const lenis = lenisRef.current;
    if (!lenis) return;
    const isMobile = window.matchMedia('(max-width: 768px)');
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (!isMobile.matches) return;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') lenis.stop();
    };
    const onBlur = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') lenis.start();
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
```

### Why vanilla class over `ReactLenis`

| Concern | Vanilla `new Lenis()` | `ReactLenis` (`lenis/react`) |
|---------|------------------------|------------------------------|
| Single-RAF (autoRaf:false + gsap.ticker bridge) | Direct API — `lenis.raf(time)` inside `gsap.ticker.add` | Works via `options={{ autoRaf: false }}` + `useRef` for `lenisRef.current.lenis.raf()` (one extra indirection) |
| Reduced-motion early-return (skip Lenis entirely) | Trivial — `if (reducedMotion) return;` in useEffect | Awkward — the wrapper still mounts even when skipped, requires conditional render `<>{reducedMotion ? children : <ReactLenis root ...>{children}</ReactLenis>}</>` which fragments the tree |
| Palette-swap refresh subscription | Same — useEffect on `paletteId` | Same |
| Strict Mode behavior | Predictable — explicit `lenis.destroy()` in cleanup, second mount creates fresh instance | The wrapper also handles cleanup but the `useLenis()` hook's subscription model has documented re-render churn (consumer components re-render on every scroll event) |
| Code readability | One useEffect, all logic visible | Mix of wrapper config + provider internals |

**Trade-off accepted:** vanilla class means we don't get the `useLenis()` hook for free in descendant components. Since Phase 3 components don't consume Lenis programmatically (anchor scroll happens via `anchors: true` config, scroll preservation in LanguageSwitcher uses `lenis.scrollTo()` which we expose via a tiny context), the cost is zero.

### Optional: expose Lenis via a thin context

If LanguageSwitcher (D-21 scroll preservation) or future components need imperative access:

```typescript
// Inside LenisProvider.tsx
const LenisContext = createContext<Lenis | null>(null);
export function useLenis() {
  return useContext(LenisContext);
}
// In the provider's return:
return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>;
```

**Caveat:** the context value is `null` on first render (ref not yet populated) and after unmount. Consumers must null-check (`useLenis()?.scrollTo(...)`).

### SSR safety

Lenis 1.3.x is **window-dependent** (it instantiates a scroll listener on `window`). The `'use client'` directive at the top of `LenisProvider.tsx` is mandatory. The vanilla class does not throw on import — only on instantiation — so the `useEffect` body is the only place it touches the global. The reduced-motion gate further protects against SSR weirdness (returns `false` server-side per `usePrefersReducedMotion`).

## §2 — ScrollTrigger.refresh() Debounce After Palette Swap

### Pattern (verified against GSAP docs)

The CONTEXT.md D-05 spec is correct: schedule `requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(), 450))` after `paletteId` changes. Justification:

- **400ms** is the global color transition in `app/globals.css` line 165-168 (`* { transition: color 400ms ease, ... }`)
- **50ms buffer** absorbs the small lag between CSS variable mutation (synchronous in `useEffect`) and the transition firing on every element
- **`requestAnimationFrame` wrapper** prevents the documented "ScrollTrigger.refresh() called during scroll" warning by deferring the call until the next paint frame
- **`setTimeout` inside the rAF** lets the transition finish before recomputing element positions

### Alternative: `ScrollTrigger.refresh(true)` safe-mode

GSAP exposes `ScrollTrigger.refresh(safe?: boolean)`. With `safe: true`, ScrollTrigger waits up to ~200ms for the next rAF tick before measuring. **Why we don't use it here:** safe-mode waits a fixed cap (~200ms), but our color transition is 400ms — by the time safe-mode fires its measurement, the layout may still be mid-transition. The explicit `setTimeout(..., 450)` matches our specific transition duration exactly. (`safe: true` would be the right choice for ad-hoc DOM toggles where the layout change is "fast and unknown".)

### Alternative: `lenis.on('scroll', ...)` settle detection

Some projects pause refresh until Lenis reports a velocity-below-threshold. Overkill here — palette swap doesn't change layout dimensions, only colors. ScrollTrigger positions only need recomputation if element heights changed (which they shouldn't for a color-only transition). The refresh is a defense-in-depth call; it's nearly free if nothing changed.

### What about font load?

`document.fonts.ready.then(() => ScrollTrigger.refresh())` after Inter loads. The font-loaded layout shift IS a real height change. CONTEXT.md doesn't lock this — recommend adding it as a one-shot in LenisProvider:

```typescript
useEffect(() => {
  if (reducedMotion || typeof document === 'undefined') return;
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}, [reducedMotion]);
```

**Open question for planner:** include this font-ready refresh in the LenisProvider plan? **Recommendation: yes** — it's 4 lines and prevents Phase 4 hero animations from firing at wrong scroll positions.

## §3 — next/font/google Inter v16 Setup

### Verified pattern (Context7-equivalent from nextjs.org/docs/app/api-reference/components/font, lastUpdated 2026-05-19)

```typescript
// In app/[locale]/layout.tsx (top of file, alongside other imports)
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],  // D-08: latin-ext covers FR diacritics (é è à ç ô î ï etc.)
  variable: '--font-sans',           // D-08: expose as CSS variable for Tailwind v4 @theme
  display: 'swap',                   // D-09: paint with fallback, swap when Inter loads
  preload: true,                     // D-09: emit <link rel="preload"> for the route
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'], // D-10
  // No `weight` needed — Inter is a variable font, all weights ship in one file
  adjustFontFallback: true,          // Default; computes font-size-adjust to minimize CLS
});

// In the <html> tag:
<html lang={locale} suppressHydrationWarning className={`${inter.variable} antialiased`}>
```

### Why `latin-ext` (not just `latin`)

The `latin` subset covers ASCII + Western European accented chars (à, é, ô, etc.) but **omits** Central/Eastern European glyphs and a few French ones. `latin-ext` is the safe choice — adds ~5KB to the font file but guarantees `é`, `è`, `à`, `ç`, `î`, `ï`, `ô`, `ù`, `û`, `ÿ`, `œ`, `æ`, `«`, `»`, `…` all render via Inter (not fallback). For a French-speaking primary audience, this is non-negotiable.

### Tailwind v4 @theme wiring

Per the Next docs (verified):

```css
/* In app/globals.css, alongside existing @theme block */
@theme inline {
  --font-sans: var(--font-sans);  /* References the CSS variable injected by next/font */
}
```

The existing `app/globals.css` already has an `@theme` block (lines 97-104) and an `@theme inline` block (lines 116-136). The `--font-sans` entry goes into the **`@theme inline`** block because we want it resolved at runtime via `var()`, exactly like the existing shadcn token aliases.

**Wait — there's a subtle issue.** next/font injects `--font-sans` on the **element** that has `inter.variable` in its className (the `<html>`), not in `:root`. Tailwind v4's `@theme inline` block references the variable name. Because `--font-sans` is set on `<html>`, all descendant elements inherit it via the cascade. The `font-sans` utility resolves to `var(--font-sans)` which resolves to whatever Inter's font-family value is on `<html>`. **This works correctly** — confirmed by the Next docs example using `--font-inter`.

### Verification

After installation:
```bash
npm run build
# Check .next/static/media/ for Inter font files (woff2)
grep -r "var(--font-sans)" .next/static/css/  # should show resolved utilities
```

Manual test: open the deployed site, check `getComputedStyle(document.body).fontFamily` in DevTools — should show `"__Inter_xxxxx", "Inter Fallback", system-ui, -apple-system, ...`.

### FOUT/FOIT interaction with PaletteFouCScript

Currently the FOUC script runs `beforeInteractive`, mutating `--color-*` on `:root`. The font CSS variable lives on `<html>` (set by Next's injected `<style>` tag). These are independent — no collision. The page may briefly render in system-ui before Inter swaps in (`display: 'swap'`), but the palette is correct from the first paint.

## §4 — next-intl Navigation API for Language Switching

### Setup: create the navigation module

Phase 1 has `i18n/routing.ts` already. Phase 3 needs to add `i18n/navigation.ts`:

```typescript
// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

This is the canonical 2026 next-intl 4.12 pattern (verified against next-intl.dev/docs/routing/navigation).

### LanguageSwitcher implementation (verified against next-intl docs + Pitfall 11 mitigation)

```typescript
// components/layout/LanguageSwitcher.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { useEffect, useTransition } from 'react';
import { useLenis } from '@/components/providers/LenisProvider'; // optional thin context

const LOCALES = ['fr', 'en'] as const;
type Locale = (typeof LOCALES)[number];

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();   // locale-stripped
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('nav.lang');
  const [isPending, startTransition] = useTransition();
  const lenis = useLenis();          // null on first render, OK

  // D-19: imperatively keep <html lang> in sync after locale change.
  // next-intl updates the URL via router.replace but does NOT re-render
  // the <html> element — only descendants below the Server boundary.
  // Setting document.documentElement.lang here forces screen readers and
  // CSS :lang() selectors to pick up the new language immediately.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const switchTo = (target: Locale) => {
    if (target === locale) return;
    // D-21: capture scroll position BEFORE navigation
    const scrollY = lenis ? lenis.actualScroll : window.scrollY;
    startTransition(() => {
      // params passed in case the route has dynamic segments
      router.replace({ pathname, params }, { locale: target });
    });
    // Restore scroll on next frame (after route data fetches)
    requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(scrollY, { immediate: true });
      else window.scrollTo(0, scrollY);
    });
  };

  return (
    <div
      role="group"
      aria-label={t('label')}            // "Changer la langue" / "Switch language"
      className="relative inline-flex items-center gap-1 rounded-full border border-border bg-background p-1 text-sm"
    >
      {LOCALES.map((target) => {
        const isActive = target === locale;
        return (
          <button
            key={target}
            type="button"
            onClick={() => switchTo(target)}
            aria-pressed={isActive}
            aria-label={t('switchTo', { target: target.toUpperCase() })}
            disabled={isPending}
            className="relative z-10 px-3 py-1 font-medium transition-colors"
            data-active={isActive ? 'true' : 'false'}
          >
            {isActive && (
              <motion.span
                layoutId="lang-indicator"
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
              />
            )}
            <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
              {target.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

### Why `useTransition` wraps the navigation

Without `startTransition`, the locale switch triggers a synchronous re-render of the entire tree, which the user perceives as a brief "freeze" because next-intl reloads messages. `startTransition` marks the navigation as non-urgent, so React can keep the current UI interactive while the new locale's messages stream in. The `isPending` flag also disables the buttons during the swap so rapid double-clicks don't queue confused state.

### i18n keys to add (`messages/{fr,en}.json`)

```json
// messages/fr.json — under "nav"
{
  "nav": {
    "home": "Accueil",
    "about": "À propos",
    "projects": "Projets",
    "skills": "Compétences",
    "contact": "Contact",
    "lang": {
      "label": "Changer la langue",
      "switchTo": "Passer en {target}"
    }
  }
}

// messages/en.json — under "nav"
{
  "nav": {
    "home": "Home",
    "about": "About",
    "projects": "Projects",
    "skills": "Skills",
    "contact": "Contact",
    "lang": {
      "label": "Switch language",
      "switchTo": "Switch to {target}"
    }
  }
}
```

Parity script (Phase 1) verifies both locales have identical leaf paths.

### Discretion choices for planner

- The button labels themselves (`"FR"` / `"EN"`) are literal characters — fine to hardcode in the component since they're locale codes, not translatable strings.
- The `lang.label` key name is suggested but not locked — planner can rename if a cleaner namespace shape emerges.

## §5 — motion AnimatePresence mode="popLayout" in app/template.tsx

### Pattern (verified against Next 16 template docs + motion v12 AnimatePresence docs)

```typescript
// app/template.tsx
'use client';  // REQUIRED — Next 16 templates default to Server Components

import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();   // full path including /fr or /en
  const reduce = useReducedMotion();

  const transition = reduce
    ? { duration: 0.1, ease: 'linear' as const }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }; // custom easeOut

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={transition}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Why `'use client'` is mandatory

Per Next 16 docs (verified 2026-05-19): **"By default, templates are Server Components."** Motion's `AnimatePresence` and `motion.div` both require React's client runtime (state, refs, event handlers, scheduler interaction). Without `'use client'` at the top, the build fails with "AnimatePresence cannot be used in Server Components."

### Why `mode="popLayout"` (not `wait`)

The CONTEXT.md D-31 spec is correct:

- `mode="wait"`: exit animation completes before enter begins. On rapid navigation, the user perceives a "hang" between pages because the exit blocks the enter.
- `mode="popLayout"`: exit and enter overlap; exiting element is removed from layout (`position: absolute` under the hood), allowing the new element to claim space immediately. Best for fluid page transitions.
- `mode="sync"` (default): both render simultaneously without layout extraction — causes visible overlap during transition.

Phase 4's filterable Projects grid (HOME-05) also uses `mode="popLayout"` on its `AnimatePresence`, so establishing the pattern here keeps the project consistent.

### Why `initial={false}`

`initial={false}` on `AnimatePresence` suppresses the enter animation on the very first mount (cold page load). Without it, the user sees the page fade in by 300ms on every fresh visit. Setting `false` means: only animate enters that happen AFTER the AnimatePresence component first mounted. The user gets an instant first paint + smooth transitions between subsequent routes.

### Interaction with `[locale]/layout.tsx`

Per Next 16 docs: templates wrap **between** layout and page. Our hierarchy:

```
<RootLayout>           // app/layout.tsx (passthrough)
  <LocaleLayout>       // app/[locale]/layout.tsx (providers + chrome)
    <Template>         // app/template.tsx (motion AnimatePresence)  ← NEW Phase 3
      <Page>           // app/[locale]/page.tsx
```

The Template lives at `app/template.tsx`, NOT `app/[locale]/template.tsx`. **Why:** placing it at the locale level would remount on every locale switch (because the segment key would change), making the language-switch transition look like a full page transition. At the root, it remounts only on first-segment change — language switches feel instant (no fade), while route changes (going to /projects, etc.) get the fade.

**Trade-off:** if Phase 4+ adds project detail pages at `app/[locale]/projects/[slug]/page.tsx`, those route changes WILL trigger the template's exit/enter cycle, which is the desired behavior. **Confirmed: place template.tsx at `app/template.tsx`, not inside `[locale]/`.**

### Reduced-motion handling

CONTEXT.md D-32 says "instant fade (≤100ms, no translate)". Using motion's `useReducedMotion()` hook (verified to mirror `matchMedia('(prefers-reduced-motion: reduce)')`) returns boolean, drives the conditional `transition` and `variants` objects above.

**Alternative:** the project's existing `usePrefersReducedMotion()` hook (lib/hooks/usePrefersReducedMotion.ts, Phase 2). Both work identically. **Recommendation: use motion's hook here** since the surrounding component is already a motion consumer — keeps imports tight. The custom hook stays for non-motion code paths (LenisProvider, CustomCursor).

## §6 — CustomCursor Constrained Pattern

### Pattern (combines D-26..D-30 + Pitfall 11 best practices)

```typescript
// components/layout/CustomCursor.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

const HOVER_SELECTORS = 'a, button, [role="button"], [data-cursor=hover], img[data-zoomable]';

function shouldRenderCursor(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia) return false;
  // D-27: 4-gate activation
  if (!window.matchMedia('(pointer: fine)').matches) return false;          // touch-coarse devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(any-pointer: coarse)').matches) return false;     // hybrid devices in coarse mode
  if (window.matchMedia('(forced-colors: active)').matches) return false;   // Windows High Contrast
  return true;
}

export function CustomCursor() {
  // Decide eligibility once on mount. Re-check on resize for hybrid devices.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldRenderCursor());
    const mql = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(any-pointer: coarse)');
    const forced = window.matchMedia('(forced-colors: active)');
    const onChange = () => setEnabled(shouldRenderCursor());
    mql.addEventListener('change', onChange);
    reduce.addEventListener('change', onChange);
    coarse.addEventListener('change', onChange);
    forced.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
      reduce.removeEventListener('change', onChange);
      coarse.removeEventListener('change', onChange);
      forced.removeEventListener('change', onChange);
    };
  }, []);

  // Pointer position as motion values — these are NOT React state.
  // Updating a MotionValue doesn't trigger re-renders, it flows straight
  // into motion's scheduler. At ~120Hz on a 120Hz display, no React work.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { mass: 0.3, stiffness: 800, damping: 30 });
  const ySpring = useSpring(y, { mass: 0.3, stiffness: 800, damping: 30 });
  // Scale + opacity also as motion values for smooth hover transitions
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, { mass: 0.3, stiffness: 600 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    // D-29: event delegation for hover detection
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && 'closest' in t && t.closest?.(HOVER_SELECTORS)) {
        scale.set(4); // 8px base × 4 = 32px hover
      }
    };
    const onOut = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && 'closest' in t && t.closest?.(HOVER_SELECTORS)) {
        // Only reset if the relatedTarget (where we're going) is NOT also a hover target.
        const next = e.relatedTarget as Element | null;
        if (next && 'closest' in next && next.closest?.(HOVER_SELECTORS)) return;
        scale.set(1);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    };
  }, [enabled, x, y, scale]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        // D-28: direct CSS variable. No JS subscription to palette.
        backgroundColor: 'var(--color-accent)',
        // Cursor stays a decorative tracer — native cursor is visible underneath.
        pointerEvents: 'none',
        width: 8,
        height: 8,
        borderRadius: 9999,
        opacity: 0.7,
        x: xSpring,
        y: ySpring,
        scale: scaleSpring,
        // Center on pointer
        translateX: '-50%',
        translateY: '-50%',
        zIndex: 9999,  // above PaletteFab (z-50) and Sheet overlays (z-50)
        // explicit mix-blend so cursor stays visible on any palette/background
        mixBlendMode: 'difference',
      }}
    />
  );
}
```

### Why no `cursor: none`

**NON-NEGOTIABLE per REQUIREMENTS.md L130 + FEATURES.md anti-feature consensus.** Hiding the native cursor:
1. Overrides OS-level cursor accessibility (magnification, high-contrast cursor) — Funka Foundation flags as exclusionary.
2. Confuses users who don't realize the dot IS the cursor.
3. Lags on low-end devices = perceived as broken.

The native pointer is always visible. CustomCursor is a decorative HALO that orbits the pointer.

### Why motion values + spring (not React state)

Setting React state on every `pointermove` would re-render the component at ~120Hz on a high-refresh display. With this pattern:
- `useMotionValue` returns a "store" outside React's render loop
- `useSpring` interpolates from that store via motion's RAF
- The DOM `style.transform` is mutated directly by motion, never through React

Zero React work per frame. The component renders ONCE on mount, then motion takes over.

### Why `mixBlendMode: 'difference'`

Without it, the cursor would be invisible against any background that matches the accent color. `difference` inverts the underlying pixels, guaranteeing visibility on every palette. **Trade-off:** the cursor color won't exactly match the accent (it'll be the inverse of whatever's underneath). For a decorative halo, this is fine and arguably more "magic" than a flat color.

**Alternative:** wrap in an outline ring at higher contrast. Planner can decide based on visual testing.

### Performance

- Zero React state updates during scroll/pointer move
- Motion's scheduler runs at most once per frame
- DOM updates via `transform` (composited, no paint)
- No event listeners on individual elements — pure document delegation

### Activation gate reasoning

| Gate | Why |
|------|-----|
| `(pointer: fine)` | Excludes touch-primary devices (phone, tablet) |
| `!(prefers-reduced-motion: reduce)` | WCAG 2.3.3 + vestibular safety |
| `!(any-pointer: coarse)` | Excludes hybrid devices used in touch mode (2-in-1 laptops with touch) |
| `!(forced-colors: active)` | Windows High Contrast users get their OS cursor; custom cursor would clash with HC theme |

## §7 — IntersectionObserver Active-Section Pattern

### Pattern

```typescript
// lib/hooks/useActiveSection.ts (new file)
'use client';

import { useEffect, useState } from 'react';

const SECTION_IDS = ['home', 'about', 'projects', 'skills', 'contact'] as const;
type SectionId = (typeof SECTION_IDS)[number];

export function useActiveSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersectionRatio among visible ones.
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((best, cur) =>
          cur.intersectionRatio > best.intersectionRatio ? cur : best
        );
        const id = top.target.id as SectionId;
        if (SECTION_IDS.includes(id)) setActive(id);
      },
      {
        // Trigger when section's center crosses the viewport center.
        // -40% top + -40% bottom = section becomes "active" when 20% strip
        // centered on the viewport intersects it.
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return active;
}
```

### Does Lenis virtual scroll break IntersectionObserver?

**No.** Lenis virtualizes scroll by applying a `translate3d` transform to the `<html>` element (or whatever the scroll container is). The actual scroll position (`window.scrollY` and the `IntersectionObserver`'s viewport math) tracks the **transformed** position, NOT the user's perceived scroll. From IntersectionObserver's perspective, elements ARE moving up the viewport as Lenis transforms — so the API works correctly.

**Verified pattern in production:** countless Lenis + ScrollTrigger sites use IntersectionObserver alongside without special wiring. The Lenis README explicitly mentions IntersectionObserver compatibility.

### Why `rootMargin: '-40% 0px -40% 0px'`

This shrinks the observer's effective viewport to a 20% strip centered vertically. A section is "active" only when its content passes through that strip. Without this, multiple sections can be `isIntersecting` simultaneously (e.g., when about and projects are both partially visible during scroll), causing the active-link indicator to flicker between two states.

### Where to call the hook

CONTEXT.md leaves this to discretion. **Recommendation:** call it inside `Navigation.tsx` directly. If a future component (e.g., a TOC sidebar on project pages) needs the same info, extract to a context. For now, one consumer = no abstraction needed.

## §8 — Mobile Hamburger via Existing Sheet Primitive

### Pattern

```typescript
// Inside Navigation.tsx
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

function MobileNav({ links }: { links: Array<{ id: string; label: string }> }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t('lang.label')} // or a dedicated nav.menu.open key
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" data-lenis-prevent className="w-3/4 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{t('home')}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

### Side conflict analysis

- PaletteFab opens **`<Sheet side="right">`** (Phase 2 D-04).
- Mobile hamburger opens **`<Sheet side="left">`** (D-16, recommended).
- Both can be open simultaneously without visual conflict (they slide in from opposite edges).
- Realistically only one is open at a time because both trap focus.

### `data-lenis-prevent` placement

Apply to `SheetContent` root (the slide-in panel). This makes the panel's internal scroll work natively (mouse wheel scrolls the content, not the page behind). PaletteSwitcher's Sheet also needs this attribute (Phase 3 plan should include a tiny patch to the PaletteSwitcher consumer).

### Why reuse Sheet, not build a custom drawer

- Sheet already has focus trap, Esc-to-close, click-outside, aria-modal, focus return on close (all from Radix Dialog underneath)
- Tailwind classes already configured for slide animations via `tw-animate-css`
- Pitfall E mitigation already in place (lines 184-193 of globals.css scope Sheet content out of the 400ms global color transition)

## §9 — app/[locale]/layout.tsx Provider Tree (Detailed)

### Final structure (verified against Phase 2 baseline)

```typescript
// app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { PaletteFouCScript } from '@/components/theme/PaletteFouCScript';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LenisProvider } from '@/components/providers/LenisProvider';   // NEW
import { ConsoleArt } from '@/components/layout/ConsoleArt';            // NEW
import { Navigation } from '@/components/layout/Navigation';            // NEW
import { Footer } from '@/components/layout/Footer';                    // NEW
import { CustomCursor } from '@/components/layout/CustomCursor';        // NEW
import { PaletteFab } from '@/components/theme/PaletteFab';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: `Tanguy Delrieu — ${t('role')}`,
    description: t('tagline'),
  };
}

type Params = Promise<{ locale: string }>;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const year = new Date().getFullYear();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} antialiased`}
    >
      <head>
        <PaletteFouCScript />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <LenisProvider>
              <ConsoleArt />
              <Navigation />
              <main>{children}</main>
              <Footer year={year} />
              <CustomCursor />
              <PaletteFab />
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Why this exact mount order

| Position | Provider | Reason |
|----------|----------|--------|
| Outermost | `NextIntlClientProvider` | All children need `useTranslations()` / `useLocale()` |
| Middle | `ThemeProvider` | Owns palette state; LenisProvider reads `paletteId` from it |
| Inner | `LenisProvider` | Reads `paletteId` for D-05 refresh subscription; provides Lenis context to descendants |
| Sibling of `<main>` | `<ConsoleArt />`, `<Navigation />`, `<Footer />`, `<CustomCursor />`, `<PaletteFab />` | Each participates in palette + i18n + Lenis context. ConsoleArt is mount-only side effect, no DOM (returns null). |

### Where Footer goes (sibling of `<main>` vs inside)

CONTEXT.md D-22 leaves this to discretion. **Recommendation: sibling of `<main>`** (as shown above). Reasons:
- Screen readers announce `<footer>` as a top-level landmark when it's outside `<main>`
- Semantic HTML5: `<main>` should contain page-specific content; `<footer>` is site-wide chrome
- The Lenis scroll handles both equally well

### Server vs Client boundary

The layout itself stays a **Server Component** — it composes the providers and renders the localized metadata. The providers (`NextIntlClientProvider`, `ThemeProvider`, `LenisProvider`) and chrome components (`Navigation`, `Footer`, `CustomCursor`, `ConsoleArt`, `PaletteFab`) are all `"use client"`. `{children}` is passed as a Server-rendered prop and stays server (this is Pattern 3 from ARCHITECTURE.md).

**Verified safe with Next 16:** the async `params` resolution + `setRequestLocale` + `getMessages` chain is the official next-intl App Router pattern. The `await params` is required (sync access removed in Next 16).

## §10 — Console ASCII Art Print Pattern

### Pattern

```typescript
// lib/ascii.ts
const ASCII_WORDMARK = `
████████╗ █████╗ ███╗   ██╗ ██████╗ ██╗   ██╗██╗   ██╗
╚══██╔══╝██╔══██╗████╗  ██║██╔════╝ ██║   ██║╚██╗ ██╔╝
   ██║   ███████║██╔██╗ ██║██║  ███╗██║   ██║ ╚████╔╝
   ██║   ██╔══██║██║╚██╗██║██║   ██║██║   ██║  ╚██╔╝
   ██║   ██║ ╚═╝ ██║██║ ╚████║╚██████╔╝╚██████╔╝   ██║
   ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝    ╚═╝
`;

const FR_BODY = `
Profil Tech × Design × BIM

Code source : https://github.com/tanguynoumea/portfolio

// ↑ ↑ ↓ ↓ ← → ← → B A
`;

const EN_BODY = `
Tech × Design × BIM profile

Source code: https://github.com/tanguynoumea/portfolio

// ↑ ↑ ↓ ↓ ← → ← → B A
`;

export function getAsciiArt(locale: 'fr' | 'en'): string {
  return `${ASCII_WORDMARK}\n${locale === 'fr' ? FR_BODY : EN_BODY}`;
}
```

```typescript
// components/layout/ConsoleArt.tsx
'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { getAsciiArt } from '@/lib/ascii';

// D-36: skip in tests + SSR.
function shouldPrint(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV === 'test') return false;
  return true;
}

// Module-level guard so HMR / Strict Mode double-mount doesn't print twice.
let printed = false;

export function ConsoleArt() {
  const locale = useLocale() as 'fr' | 'en';

  useEffect(() => {
    if (!shouldPrint()) return;
    if (printed) return;
    printed = true;

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() ||
      'oklch(0.62 0.155 35)';

    // %c marker positions the CSS string on the following arg.
    // eslint-disable-next-line no-console
    console.log(
      `%c${getAsciiArt(locale)}`,
      `font-family: monospace; color: ${accent}; line-height: 1.3; font-size: 10px;`
    );
  }, [locale]);

  return null;
}
```

### Why the module-level `printed` flag

React Strict Mode double-mounts components in dev. Without the guard, the ASCII art prints twice on every cold load in development. The `useEffect` itself doesn't help because its cleanup runs between mounts but the effect's body still runs twice. The module-level boolean is the cheapest way to enforce one-shot semantics.

**Edge case:** if the user navigates between routes, the locale changes — should the ASCII art re-print in the new language? **No.** The "easter egg" framing is "I noticed this on cold load." If we re-printed on every locale switch, it would feel like spam. The `printed` guard at module level survives client-side navigation (the module instance persists).

### Why read `--color-accent` via `getComputedStyle`

The console can render `color` via CSS in `%c` substitutions. Reading the live `--color-accent` means the ASCII art uses the current palette's accent color — Vaporwave gets neon pink ASCII, Terra gets terracotta ASCII. Subtle reinforcement of the palette feature.

### Why arrow glyphs (`↑ ↓ ← →`) not ASCII (`up down`)

CONTEXT.md "specifics" calls them out specifically. Modern terminals and DevTools console support Unicode glyphs natively. Falling back to `up up down down left right left right B A` is acceptable as a 2nd attempt, but the glyphs are punchier. **No risk of mojibake on supported environments** — Chrome / Firefox / Safari / Edge DevTools all render Unicode correctly.

## §11 — prefers-reduced-motion Gating Cascade

### Project's existing hook (verified, already shipped)

```typescript
// lib/hooks/usePrefersReducedMotion.ts
import { useSyncExternalStore } from 'react';
// Returns boolean — true when user has prefers-reduced-motion: reduce
```

### Phase 3 consumers and pattern recommendation

| Component | Hook to use | Why |
|-----------|-------------|-----|
| `LenisProvider` | `usePrefersReducedMotion()` (custom) | Non-motion context; the gate skips Lenis instantiation entirely |
| `app/template.tsx` | `useReducedMotion()` (motion/react) | Already inside motion; tighter import |
| `CustomCursor` | Direct `matchMedia('(prefers-reduced-motion: reduce)')` inside the gate function | Combined with other matchMedia checks; idiomatic with the 4-gate pattern |
| `Navigation` (scroll-state transition) | None — uses `transition-colors` CSS class which respects `prefers-reduced-motion` automatically | The `@media (prefers-reduced-motion: reduce)` rule already in globals.css (line 184-193 mitigation block) does NOT cover transition-colors, BUT a CSS reset for prefers-reduced-motion is recommended (see below) |
| `LanguageSwitcher` (motion layout indicator) | `useReducedMotion()` (motion) — fall back to no `layoutId`, instant swap | Motion ships its own reduce-motion semantics |

### Recommended addition to `app/globals.css`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is the catch-all WCAG safety net. Even if a component forgets to gate its animation, this CSS will neutralize it. Pitfall 11 + ARCHITECTURE.md recommend this — currently NOT in `app/globals.css` (verified by reading the file). **Recommendation: add to globals.css in the layout plan.**

### One-place-per-component vs central provider

CONTEXT.md leaves this to discretion. **Recommendation: each component reads its own hook.** Reasoning:
- The "MotionGate" central provider pattern from PITFALLS.md (line 935-952) adds a layer of abstraction that's only valuable if components share complex reduced-motion logic
- For 5 chrome components with 4 different reduced-motion needs (Lenis skip, cursor null, transition instant, indicator instant), the central gate becomes a switch statement that ends up calling the same boolean check 4 ways
- Local hook calls are dead-simple, no abstraction overhead, easier to test

## §12 — Test Patterns for Phase 3 Components

### Existing infrastructure (Phase 2 W0)

- Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 + @testing-library/user-event 14.6.1
- `@/*` alias maps to repo root
- 94 tests green across Phase 2 components

### Per-component test recommendations

| Component | Test type | What to assert |
|-----------|-----------|----------------|
| **LenisProvider** | Mount/cleanup unit test | (a) Component renders children. (b) When `usePrefersReducedMotion` returns true, Lenis is NOT instantiated (mock `lenis` module, assert constructor not called). (c) When false, Lenis is constructed with the correct config. (d) Cleanup calls `lenis.destroy()` + `gsap.ticker.remove`. Mock `gsap` + `lenis` modules — don't try to run a real RAF in jsdom. |
| **Navigation** | Smoke test + a11y | (a) Renders nav landmark. (b) Section links have correct `href="#..."`. (c) Mobile hamburger has correct aria-label. (d) Active section indicator updates when `useActiveSection` returns a value. Use RTL `screen.getByRole('navigation')`. |
| **LanguageSwitcher** | Interaction + accessibility | (a) Both buttons have `aria-pressed` reflecting current locale. (b) Clicking the non-active button calls `router.replace` (mock `useRouter` from `@/i18n/navigation`). (c) `aria-label` localizes correctly. Mock next-intl's locale-aware navigation entirely — don't try to test the real Next router. |
| **Footer** | Smoke test | (a) Year prop renders in the copyright string. (b) Social links have correct `target="_blank" rel="noopener noreferrer"`. (c) Email link is `mailto:`. (d) i18n strings resolve. |
| **CustomCursor** | Rendering gates | (a) Returns null when `matchMedia('(pointer: fine)')` is false (mock `window.matchMedia`). (b) Returns null when reduced-motion is true. (c) When eligible, renders the motion.div. Note: jsdom does NOT support `pointermove` realistically — skip integration of actual pointer movement; assert the listeners are registered. |
| **app/template.tsx (Template)** | Snapshot + key behavior | (a) Renders children inside motion.div. (b) `key` matches `usePathname()`. (c) With reduced-motion, the variants object is the simpler fade-only form. Mock motion's `useReducedMotion`. Don't test AnimatePresence behavior — that's library-internal. |
| **ConsoleArt** | Mock console.log | (a) `useEffect` invokes `console.log` once on mount. (b) FR locale produces FR text in the log message. (c) Test environment guard prevents firing — actually the test environment IS NODE_ENV=test, so the print should be skipped; assert that console.log was NOT called when shouldPrint() returns false. |
| **useActiveSection hook** | Mock IntersectionObserver | Use the standard jsdom-IntersectionObserver-mock pattern (or vitest's `globalThis.IntersectionObserver = vi.fn(...)`). Trigger callbacks manually with synthetic IntersectionObserverEntries; assert `setActive` is called with the expected ID. |

### What NOT to test in Phase 3

- **Real Lenis scroll behavior** — not feasible in jsdom. Manual UAT only.
- **Real GSAP ticker timing** — not feasible. Manual UAT.
- **Real motion AnimatePresence enter/exit timing** — motion library is well-tested; we trust their suite.
- **Real cursor follow** — jsdom lacks layout engine; pointer events are synthetic. Manual UAT.
- **Real font load + ScrollTrigger refresh** — manual UAT.

### Test file colocation

Each new component gets a `.test.tsx` next to it:
```
components/providers/LenisProvider.tsx
components/providers/LenisProvider.test.tsx
components/layout/Navigation.tsx
components/layout/Navigation.test.tsx
... etc.
```

Matches Phase 2 convention.

## §13 — Phase-3-Specific Gotchas / Pitfalls (Beyond Global PITFALLS.md)

### Gotcha 1: motion's `layoutId` on the LanguageSwitcher indicator fights with concurrent AnimatePresence

The LanguageSwitcher uses `<motion.span layoutId="lang-indicator">` inside two buttons; only one is rendered at a time (the active one), so motion auto-animates the indicator from old position to new. **BUT** the surrounding `<Template>` also has `<AnimatePresence>`. If the user switches language while a page transition is in flight, both AnimatePresence instances try to manage the same DOM. **Mitigation:** the `layoutId` is scoped to the LanguageSwitcher's containing `<div role="group">`. Motion's `LayoutGroup` API would scope further if needed (verified — motion 12 ships it). **Recommendation: no action required** — the lang-indicator only animates within its segmented control, which is inside Template but not subject to Template's exit/enter (the Navigation is OUTSIDE `<main>{children}</main>` and so outside Template's wrap). Verified by re-reading the layout structure in §9.

### Gotcha 2: ScrollTrigger registered twice causes silent leaks

`gsap.registerPlugin(ScrollTrigger)` called multiple times is documented as idempotent — but only if the same `ScrollTrigger` import is passed each time. If two files import from different paths (`gsap/ScrollTrigger` vs `gsap/dist/ScrollTrigger`), the registration deduplication can fail. **Mitigation:** register ONCE at module load in `LenisProvider.tsx`. All other components that need ScrollTrigger (Phase 4 Hero, Phase 5 parallax) MUST import `ScrollTrigger` from the same `'gsap/ScrollTrigger'` path. **Recommendation: leave a `<contract>` note in the Phase 3 PLAN.md instructing downstream phases to use this import path.**

### Gotcha 3: Strict Mode double-mount + module-level `printed` flag

Module-level state persists across Strict Mode double-mounts AND across client-side navigations. This is intentional for `ConsoleArt`. But if HMR replaces the module, the flag resets. **Mitigation:** none needed — HMR causes a re-print, which during dev is fine (and arguably useful for visual confirmation).

### Gotcha 4: `usePathname` from next-intl vs next/navigation returns different values

- `usePathname` from `@/i18n/navigation` (next-intl) returns `/about` (locale-stripped)
- `usePathname` from `next/navigation` returns `/fr/about` (full path)

For the `<Template>` keying (§5), we use **`next/navigation`** because we want the FULL path as the unmount-mount key (locale switches should NOT remount the Template). For the LanguageSwitcher pathname capture (§4), we use **`next-intl/navigation`** because we want the locale-stripped path to feed into `router.replace`.

**Easy mistake:** mixing them up. The planner should be explicit in each task.

### Gotcha 5: Hash-only navigation (`#about` → `#contact`) and Template

`<a href="#about">` does NOT trigger a Next.js route change — it's a same-page anchor. `usePathname()` returns the same value. The Template's `key` doesn't change, so no AnimatePresence cycle. ✓ Correct — hash changes shouldn't trigger page transitions.

Verified: next-intl's `anchors: true` Lenis config (D-03) handles the smooth scroll without triggering router events.

### Gotcha 6: motion `useReducedMotion()` returns `null` server-side

Motion's hook returns `boolean | null` — `null` means "unknown" (SSR or first render before matchMedia is available). The template code (`§5`) treats `null` as truthy-ish (`reduce ?` triggers on null too). **Mitigation:** the variants object's spread chooses correctly — `null` reads as falsy in the ternary, so it picks the full motion. Effect: on first SSR render, animations run; immediately after hydration, the hook returns the real value. For motion-aware users, the first animation might play once (cold load) then subsequent transitions are instant. **Acceptable.**

If the planner wants stricter behavior, use `reduce === true` instead of `reduce ?` to treat `null` as "motion allowed."

### Gotcha 7: Lenis + scroll-anchor inside Sheet content

When the Sheet is open and the user clicks an anchor link inside SheetContent (e.g., a "Jump to top" link inside the mobile nav drawer), Lenis's `anchors: true` would normally smooth-scroll. But the SheetContent has `data-lenis-prevent`, so Lenis ignores anchors inside it. **Expected behavior** — the mobile nav anchors should close the sheet first, then scroll. The pattern shown in §8 (`onClick={() => setOpen(false)}`) closes the Sheet, then native anchor navigation occurs on the next frame. Lenis's `anchors: true` config on the global instance applies once SheetContent is unmounted — but by that point the URL has changed and the browser's native hash navigation handles the scroll.

**Edge:** if the user wants smooth scroll AFTER closing the sheet, add a `setTimeout(() => lenis.scrollTo('#section'), 250)` (after Sheet close animation completes). Discretion. Recommend deferring to v2.

### Gotcha 8: Hreflang in metadata

CONTEXT.md D-12 says "no OG image yet." But hreflang IS still expected per FEATURES.md L121 bilingual table. The `generateMetadata` in §9 should include `alternates`:

```typescript
return {
  title: ...,
  description: ...,
  alternates: {
    languages: {
      fr: '/fr',
      en: '/en',
    },
  },
};
```

**Open question for planner:** include hreflang now or defer to Phase 6 (A11Y-01)? **Recommendation: include now** — it's 5 lines of code, hreflang is SEO-critical, and Phase 6 A11Y-01 owns the full metadata expansion (OG, descriptions, per-route alternates). Doing the basic alternates here doesn't conflict.

## §14 — Dependency Install Order (Wave 0)

### Single command (recommended)

```bash
npm install gsap@^3.13.0 @gsap/react@^2.1.2 lenis@^1.3.0
```

### Verification gates

```bash
# 1. Confirm versions
node -p "require('./package.json').dependencies.gsap"          # should match ^3.13.0
node -p "require('./package.json').dependencies['@gsap/react']" # should match ^2.1.2
node -p "require('./package.json').dependencies.lenis"          # should match ^1.3.0

# 2. Verify build passes
npm run build  # exit 0

# 3. Verify lint passes
npm run lint  # exit 0

# 4. Verify Phase 2 tests still green
npm run test  # 94/94 green

# 5. Visual smoke (no UI changes in this plan, just type-check + bundle)
```

### Why a dedicated Wave 0 plan

CONTEXT.md D-01 + D-37 set this. The install is sequential (Wave 1+ can't start without the packages). Bundling install with another task (e.g., putting it inside the LenisProvider plan) would mix concerns and make rollback harder if a version conflict surfaces.

### Peer deps check

- `gsap@^3.13.0` — zero peer deps
- `@gsap/react@^2.1.2` — peer deps `gsap@^3.x`, `react@^17|^18|^19` — satisfied
- `lenis@^1.3.0` — peer deps `react@^17|^18|^19` (only for the `lenis/react` wrapper, which we don't use directly but it's still bundled) — satisfied

No conflicts expected with `motion@^12.40.0`, `next@^16.2.6`, `react@^19.2.4` (all current).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (Phase 2 W0) |
| Quick run command | `npm test` (runs vitest run; exit 0 = green) |
| Full suite command | `npm run test` (identical to quick — single Vitest project, no integration vs unit split) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| LAYOUT-01 | Root layout wires inter.variable + providers + metadata | Manual UAT — visual font check + DevTools `getComputedStyle` | — | n/a (smoke test optional via tsc --noEmit) |
| LAYOUT-01 | Inter loads with FR diacritics rendering | Manual browser check | — | n/a |
| LAYOUT-02 | LenisProvider mounts under non-reduced-motion | unit | `npm test -- LenisProvider.test` | ❌ Wave 1 |
| LAYOUT-02 | LenisProvider skips Lenis instantiation under reduced-motion | unit | `npm test -- LenisProvider.test` | ❌ Wave 1 |
| LAYOUT-02 | Cleanup removes ticker + destroys Lenis | unit (mock gsap + lenis) | `npm test -- LenisProvider.test` | ❌ Wave 1 |
| LAYOUT-02 | ScrollTrigger.refresh fires 450ms after paletteId change | unit (fake timers) | `npm test -- LenisProvider.test` | ❌ Wave 1 |
| LAYOUT-02 | Smooth scroll on `<a href="#anchor">` clicks | Manual UAT — open browser, click nav link, observe smooth scroll | — | n/a |
| LAYOUT-02 | Sheet content scrolls natively (mouse wheel inside Sheet doesn't move page) | Manual UAT | — | n/a |
| LAYOUT-03 | Navigation renders fixed top, section links, mobile hamburger | unit (RTL render + role queries) | `npm test -- Navigation.test` | ❌ Wave 2 |
| LAYOUT-03 | Active section highlight updates on scroll | unit (IntersectionObserver mock) | `npm test -- useActiveSection.test` | ❌ Wave 2 |
| LAYOUT-03 | Nav transparent → blur after 50px scroll | Manual UAT | — | n/a |
| LAYOUT-04 | Footer renders year + tagline + social links | unit (RTL) | `npm test -- Footer.test` | ❌ Wave 2 |
| LAYOUT-04 | Social links have target="_blank" rel="noopener noreferrer" | unit | `npm test -- Footer.test` | ❌ Wave 2 |
| LAYOUT-04 | Footer copyright {year} renders correct integer | unit | `npm test -- Footer.test` | ❌ Wave 2 |
| LAYOUT-05 | LanguageSwitcher renders FR/EN with aria-pressed reflecting locale | unit (RTL with mock router) | `npm test -- LanguageSwitcher.test` | ❌ Wave 2 |
| LAYOUT-05 | Clicking inactive button calls router.replace | unit (mock useRouter) | `npm test -- LanguageSwitcher.test` | ❌ Wave 2 |
| LAYOUT-05 | document.documentElement.lang updates on locale change | unit (in jsdom — works) | `npm test -- LanguageSwitcher.test` | ❌ Wave 2 |
| LAYOUT-05 | Scroll position preserved on language switch | Manual UAT | — | n/a |
| LAYOUT-06 | CustomCursor returns null when matchMedia gates fail | unit (mock window.matchMedia) | `npm test -- CustomCursor.test` | ❌ Wave 3 |
| LAYOUT-06 | Native cursor remains visible (no cursor:none) | Manual UAT — verify in DevTools that `body { cursor }` is the default `auto` | — | n/a |
| LAYOUT-06 | Cursor follows pointer with spring | Manual UAT | — | n/a |
| LAYOUT-06 | Cursor grows on hover over interactive elements | Manual UAT | — | n/a |
| ANIM-01 | Template renders motion.div keyed by pathname | unit | `npm test -- template.test` | ❌ Wave 3 |
| ANIM-01 | Reduced-motion uses opacity-only variants | unit (mock useReducedMotion) | `npm test -- template.test` | ❌ Wave 3 |
| ANIM-01 | Page transitions ≤ 350ms | Manual UAT — DevTools Performance recording | — | n/a |
| EGG-01 | ConsoleArt prints once on mount (one-shot) | unit (spy on console.log) | `npm test -- ConsoleArt.test` | ❌ Wave 3 |
| EGG-01 | FR locale renders FR body text | unit | `npm test -- ConsoleArt.test` | ❌ Wave 3 |
| EGG-01 | Skipped in test environment (NODE_ENV=test) | unit (verified by the test itself NOT seeing the print) | n/a — implicit | n/a |
| EGG-01 | Shows GitHub link + Konami hint | Manual UAT — open DevTools console on prod build | — | n/a |

### Sampling Rate
- **Per task commit:** `npm test` (full Vitest run, < 8s expected total — single project)
- **Per wave merge:** `npm test && npm run lint && npm run build` (smoke gate)
- **Phase gate (before `/gsd:verify-work`):** Full suite + manual UAT items listed above

### Wave 0 Gaps
- [ ] `components/providers/LenisProvider.test.tsx` — covers LAYOUT-02 unit assertions (mock `gsap` + `lenis` modules)
- [ ] `components/layout/Navigation.test.tsx` — covers LAYOUT-03 unit assertions
- [ ] `components/layout/LanguageSwitcher.test.tsx` — covers LAYOUT-05 unit assertions (mock `@/i18n/navigation`)
- [ ] `components/layout/Footer.test.tsx` — covers LAYOUT-04 unit assertions
- [ ] `components/layout/CustomCursor.test.tsx` — covers LAYOUT-06 unit assertions (mock `window.matchMedia`)
- [ ] `app/template.test.tsx` — covers ANIM-01 unit assertions (mock motion's `useReducedMotion`)
- [ ] `components/layout/ConsoleArt.test.tsx` — covers EGG-01 unit assertions
- [ ] `lib/hooks/useActiveSection.test.ts` — IntersectionObserver mock pattern
- [ ] No new framework install — Vitest infra from Phase 2 W0 covers everything

## Code Examples (Verified)

### Pattern A: Lenis + gsap.ticker single-RAF bridge

```typescript
// Source: https://github.com/darkroomengineering/lenis README + .planning/research/PITFALLS.md §"Pitfall 4"
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ autoRaf: false });
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.refresh();
```

### Pattern B: next/font Inter + Tailwind v4 @theme

```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/font (Next 16.2.6, 2026-05-19)
import { Inter } from 'next/font/google';
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});
// Apply: <html className={inter.variable}>
```

```css
/* globals.css */
@theme inline {
  --font-sans: var(--font-sans);
}
```

### Pattern C: next-intl locale-switch with scroll preservation

```typescript
// Source: https://next-intl.dev/docs/routing/navigation (4.12)
import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
const pathname = usePathname();
const router = useRouter();
const params = useParams();
router.replace({ pathname, params }, { locale: 'en' });
```

### Pattern D: motion AnimatePresence popLayout in template.tsx

```typescript
// Source: https://motion.dev/docs (v12 AnimatePresence) + https://nextjs.org/docs/app/api-reference/file-conventions/template
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern E: ScrollTrigger.refresh debounce after palette swap

```typescript
// Source: combination of GSAP ScrollTrigger.refresh docs + .planning/research/PITFALLS.md §"Pitfall 5"
useEffect(() => {
  const id = window.requestAnimationFrame(() => {
    window.setTimeout(() => ScrollTrigger.refresh(), 450);
  });
  return () => window.cancelAnimationFrame(id);
}, [paletteId]);
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scroll | Custom RAF + `transform: translateY(...)` | `lenis@^1.3.0` | Edge cases: trackpad inertia, momentum scroll, browser back-button restore, iOS rubber-band. Lenis solves all. |
| Locale switching with scroll preservation | `next/router.push()` + manual scroll restoration | `@/i18n/navigation` `useRouter().replace({pathname, params}, {locale})` | next-intl handles cookie persistence + URL prefix + serializing dynamic params. Reimplementing courts redirect loops (Pitfall 7). |
| Active section highlight | `scroll` event + `getBoundingClientRect` | `IntersectionObserver` via custom `useActiveSection` hook | IO is native, throttled, performant. Scroll-event polling tanks Lighthouse. |
| Page transitions | CSS keyframes triggered on route change | motion `AnimatePresence` in `template.tsx` | template.tsx is the only Next 16 file convention that remounts on navigation. AnimatePresence handles the timing automatically. |
| Smooth-scroll for `<a href="#anchor">` | `e.preventDefault()` + `element.scrollIntoView({ behavior: 'smooth' })` | Lenis `anchors: true` config | Native `scrollIntoView` ignores Lenis's smooth-scroll easing and looks jarring. Lenis's anchor handling is consistent. |
| Mobile menu drawer | Custom `position: fixed` slide-in + custom focus trap | shadcn `Sheet` (already installed) | Focus trap, Esc-to-close, click-outside, aria-modal — Radix Dialog gives all of these for free. |
| Pointer-following cursor with React state | `useState({x, y})` + `setState` on every move | `useMotionValue` + `useSpring` from motion | Setting state at 120Hz re-renders the component 120 times/sec. MotionValue is outside React's tree — zero re-renders. |
| Font load + zero CLS | `<link href="...woff2" />` + manual `@font-face` rule | `next/font/google` | next/font self-hosts, generates fallback CSS with size-adjust, eliminates external network requests, GDPR-safe. |
| Bilingual frontmatter handling for project content | (Phase 5 concern, not Phase 3) | `{slug}.{fr,en}.mdx` pattern | See ARCHITECTURE.md Pattern 4. |
| WCAG contrast at runtime | Manual ratio math (luminance + Bradford transform) | `wcagContrast` from `culori` (already shipped) | Phase 2 owns this; Phase 3 just consumes. |
| Konami code listener | (already shipped in Phase 2 `useKonamiCode`) | Reuse existing hook for any future easter eggs | Mature, tested across 11 Vitest assertions. |

**Key insight:** Phase 3 is largely a wiring exercise. The libraries already do the hard work — our job is to compose them correctly without hand-rolling primitives.

## Common Pitfalls (Phase-3-Specific Summary)

### Pitfall 4 + 5 (already in global PITFALLS.md) — Lenis + GSAP integration

Documented at length in PITFALLS.md. The single-RAF + `data-lenis-prevent` + `ScrollTrigger.refresh` triple is mandatory and now codified in §1+§2 above.

### Pitfall 11 — Custom cursor accessibility

D-26..D-30 + §6 constrain CustomCursor to a non-takeover pattern with 4 activation gates. The `cursor: none` anti-pattern is explicitly forbidden.

### Phase-3 net-new: template.tsx as Server Component by default

Discovered during research: Next 16 explicitly states templates default to Server. The `"use client"` directive is mandatory for `AnimatePresence` to work. Easy to forget — flag prominently in the ANIM-01 plan.

### Phase-3 net-new: `usePathname` ambiguity

Two different `usePathname` exports (from next/navigation vs from next-intl). Each is correct in its own context. Plans MUST be explicit about which one to import.

### Phase-3 net-new: Lenis instantiation under reduced-motion

If LenisProvider naively renders `<>{children}</>` and instantiates Lenis inside a useEffect regardless of reduced-motion, the page jitters once before the gate kicks in. The early-return inside useEffect (§1) prevents this; the matchMedia listener (via `usePrefersReducedMotion`) handles OS-level changes mid-session.

### Phase-3 net-new: Strict Mode + ConsoleArt double print

Module-level `printed` flag is the cleanest mitigation. useEffect cleanup alone doesn't prevent it because the effect body runs twice in dev.

## Open Questions

**None blocking.** Two recommendations to confirm before planning:

1. **Add `document.fonts.ready.then(() => ScrollTrigger.refresh())` in LenisProvider?** (§2) Recommendation: yes — 4 lines, prevents Phase 4 issues. Planner can decide whether to include it in the LenisProvider plan or defer to Phase 4.

2. **Include hreflang alternates in `generateMetadata` now?** (§13 Gotcha 8) Recommendation: yes — Phase 6 owns full metadata (OG image, descriptions), but basic alternates are 5 lines and SEO-critical.

3. **Add a global `prefers-reduced-motion` CSS reset in `globals.css`?** (§11) Recommendation: yes — catch-all safety net that costs ~6 lines.

All three are "good defaults" — planner can include in the layout plan without scope creep.

## Recommended Plan Structure

CONTEXT.md D-37 proposes **6 plans across 4 waves**. After research, this structure is **CONFIRMED CORRECT** with one optional adjustment.

### Confirmed structure

| Wave | Plan | Title | Reqs | Est. time |
|------|------|-------|------|-----------|
| **0** | 03-00 | `install-deps-PLAN.md` | (gate for LAYOUT-02) | ~10 min |
| **1** (sequential) | 03-01 | `lenis-provider-PLAN.md` | LAYOUT-02 | ~25 min |
| **1** (sequential) | 03-02 | `root-layout-font-PLAN.md` | LAYOUT-01 | ~15 min |
| **2** (parallel) | 03-03 | `navigation-lang-switcher-PLAN.md` | LAYOUT-03, LAYOUT-05 | ~40 min |
| **2** (parallel) | 03-04 | `footer-PLAN.md` | LAYOUT-04 | ~15 min |
| **3** (parallel) | 03-05 | `cursor-transitions-ascii-PLAN.md` | LAYOUT-06, ANIM-01, EGG-01 | ~45 min |

**Total estimate:** ~2.5h.

### Optional adjustment

The Wave 3 plan (03-05) bundles 3 independent components: CustomCursor, app/template.tsx, ConsoleArt. They could be split into 3 plans for cleaner parallelism BUT:

- All three are SMALL (~15min each)
- All three share context (provider tree mount + reduced-motion + i18n)
- Bundling avoids planning overhead for 3 tiny plans
- The plans share a single test infrastructure invocation

**Recommendation: keep as 1 bundled plan (03-05).** If the planner wants finer granularity for parallelism, splitting to 3 is fine and adds no risk.

### Why this is correct

1. **Wave 0 sequential:** install must complete before any Wave 1 plan runs (lenis import will fail otherwise).
2. **Wave 1 sequential:** both plans touch `app/[locale]/layout.tsx`. Running in parallel would create merge conflicts. Order doesn't matter (LenisProvider first vs root-layout-font first), but they must serialize.
3. **Wave 2 parallel:** Navigation+LangSwitcher / Footer / (none) are independent files in `components/layout/`. The Nav plan owns 2 components (Navigation.tsx + LanguageSwitcher.tsx + useActiveSection hook) because they're tightly coupled (Nav consumes LangSwitcher). Footer is fully independent.
4. **Wave 3 parallel:** CustomCursor, template.tsx, ConsoleArt all independent — no shared files.

### Wave dependencies summary

```
Wave 0 (install) ─────→ Wave 1 (LenisProvider, RootLayoutFont) ─────→ Wave 2 (Nav+LangSwitcher, Footer) ─────→ Wave 3 (Cursor, Template, ASCII)
                                       (sequential)                            (parallel)                          (parallel)
```

## Sources

### Primary (HIGH confidence)
- **Next.js 16 template docs** — https://nextjs.org/docs/app/api-reference/file-conventions/template (2026-05-19) — confirms templates default to Server Components, key behavior, no breaking changes from v13.
- **Next.js 16 font docs** — https://nextjs.org/docs/app/api-reference/components/font (2026-05-19) — Inter setup, variable, subsets, display, Tailwind v4 @theme integration verified.
- **next-intl navigation docs** — https://next-intl.dev/docs/routing/navigation — createNavigation(routing) exports, usePathname locale-stripped, router.replace with locale option.
- **Lenis 1.3.x README** — https://github.com/darkroomengineering/lenis — autoRaf, anchors, prevent options + gsap.ticker integration code verified.
- **Lenis React README** — https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md — ReactLenis prop signatures + useLenis hook reviewed; chose vanilla class for this project's needs.
- **motion v12 AnimatePresence** — https://motion.dev/docs/react-animate-presence — mode options (sync/wait/popLayout) verified.
- **GSAP ScrollTrigger.refresh** — https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh() — refresh API + safe parameter behavior.
- **In-repo: PITFALLS.md** — §"Pitfall 4" (Lenis+GSAP single-RAF) + §"Pitfall 5" (useGSAP cleanup) + §"Pitfall 11" (cursor accessibility) — drove §1, §2, §6.
- **In-repo: ARCHITECTURE.md** — §"Pattern 5" + §"Pattern 6" + §"Providers composition" — drove §1, §5, §9.
- **In-repo: STACK.md** — version pins verified via `npm view` (gsap 3.15.0 / @gsap/react 2.1.2 / lenis 1.3.23 / motion 12.40.0 all current 2026-05-27).

### Secondary (MEDIUM confidence)
- **In-repo: FEATURES.md** — custom cursor anti-feature consensus + console ASCII GitHub link recommendation — verified non-negotiable constraint for D-26..D-30.
- **In-repo: SUMMARY.md** — "Key Corrections" table (lenis not @studio-freight, motion not framer-motion) — already incorporated in package.json.
- **Lenis v1.3.23 verified** — `npm view lenis version` 2026-05-27 = 1.3.23.

### Tertiary (LOW — would need validation in production)
- **CustomCursor spring constants (mass 0.3, stiffness 800)** — picked from motion docs example. Planner should tune on feel testing in browser.
- **IntersectionObserver `rootMargin: '-40% 0px -40% 0px'`** — common pattern, but the exact threshold may need adjustment based on section heights.
- **Inter `subsets: ['latin', 'latin-ext']`** — `latin-ext` is the safe choice for FR but adds ~5KB. If perf-critical, planner could test with just `['latin']` first.

## Metadata

**Confidence breakdown:**
- Standard stack & install: **HIGH** — versions verified live against npm
- LenisProvider pattern: **HIGH** — multiple corroborating sources (PITFALLS.md, ARCHITECTURE.md, Lenis README, GSAP docs)
- next-intl navigation: **HIGH** — official docs, no ambiguity
- Template.tsx + AnimatePresence: **HIGH** — Next 16 docs explicit
- CustomCursor pattern: **MEDIUM** — constrained pattern is correct but spring tunings are taste-based
- IntersectionObserver active section: **MEDIUM** — pattern correct, threshold is taste
- Console ASCII art: **HIGH** — straightforward, mostly content choices (which are discretion items)
- prefers-reduced-motion cascade: **HIGH** — patterns documented + project already has the hook

**Research date:** 2026-05-27
**Valid until:** 2026-06-26 (30 days — stable stack, no expected version churn before Phase 3 execution)

## RESEARCH COMPLETE

**Phase:** 3 — Layout & Animation Foundation
**Confidence:** HIGH

### Key Findings

1. **Vanilla `Lenis` class beats `ReactLenis` wrapper** for this project's single-RAF + reduced-motion-skip + palette-swap-refresh contract. Trade-off: no free `useLenis()` hook in descendants; mitigated with a thin optional context.
2. **`app/template.tsx` MUST be `'use client'`** — Next 16 templates default to Server Components, but motion's `AnimatePresence` is client-only.
3. **Two `usePathname` exports** — next/navigation for Template keying (full path), next-intl/navigation for LanguageSwitcher capture (locale-stripped). Plans must be explicit.
4. **CustomCursor uses `useMotionValue` + `useSpring`**, NOT React state — avoids 120Hz re-renders. `mixBlendMode: difference` guarantees visibility on any palette. NEVER `cursor: none` (non-negotiable per REQUIREMENTS.md OOS).
5. **Inter via next/font/google** with `subsets: ['latin', 'latin-ext']` is the safe choice for FR diacritics. `variable: '--font-sans'` wires into Tailwind v4 `@theme inline { --font-sans: var(--font-sans) }`.

### File Created

`C:\Users\Tanguy\Documents\PROGRAMMES\DEV\PROJET PORTFOLIO\.planning\phases\03-layout-animation-foundation\03-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | Versions verified against live npm registry; lenis/gsap/motion pinning matches STACK.md prescriptive list. |
| Architecture | HIGH | Lenis+GSAP single-RAF documented across PITFALLS.md, ARCHITECTURE.md, Lenis README, GSAP docs; provider tree validated against Phase 2 baseline. |
| Pitfalls | HIGH | All Phase 3-specific pitfalls identified beyond global PITFALLS.md (template.tsx server default, usePathname ambiguity, Strict Mode + ConsoleArt). |
| Plan Structure | HIGH | CONTEXT.md D-37 6-plan / 4-wave layout confirmed correct after detailed dependency analysis. |

### Open Questions

Three optional additions to confirm with planner (all "good defaults" — no blocker):
1. `document.fonts.ready.then(() => ScrollTrigger.refresh())` in LenisProvider (4 lines)
2. hreflang alternates in `generateMetadata` (5 lines)
3. Global `@media (prefers-reduced-motion: reduce)` CSS reset in `globals.css` (~6 lines)

### Ready for Planning

Research complete. The planner can now create 6 PLAN.md files following the Wave 0/1/2/3 topology in §"Recommended Plan Structure" with full confidence in:
- exact import paths and code patterns (§1-§10)
- test architecture (§12 + Validation Architecture section)
- requirement-to-task traceability (Phase Requirements table)
- prescriptive answers for every "Claude's Discretion" item in CONTEXT.md
