# Pitfalls Research

**Domain:** Next.js 15 App Router creative portfolio with runtime palette theming, multi-library animation stack (GSAP + Lenis + Framer Motion), bilingual i18n (next-intl), MDX content, hybrid Tech × Design × BIM profile
**Researched:** 2026-05-25
**Confidence:** HIGH (Context7 + official docs + multiple verified community sources for every pitfall)

---

## Critical Pitfalls

### Pitfall 1: White FOUC on initial load when palette is restored from localStorage

**Severity:** CRITICAL

**What goes wrong:**
On first paint, the user sees the default palette (or worse, a white/unstyled page). 200-800ms later, the React hydration completes, the `ThemeProvider` reads `localStorage`, and the palette suddenly swaps. The flash is jarring, screams "amateur", and contradicts the entire signature feature of the portfolio.

**Why it happens:**
Three failure modes, all common:
1. Reading `localStorage` inside `useEffect` — by definition runs AFTER first paint.
2. Reading `localStorage` inside the `ThemeProvider` body — fails on SSR (`localStorage is not defined`), forcing developers to gate it behind a `typeof window !== 'undefined'` check, which means the server still emits the default palette.
3. Trying to read the palette from a cookie in a Server Component — works for SSR but breaks if the user changes palette client-side without a round trip.

**How to avoid:**
Use a synchronous blocking inline script in `<head>` that runs BEFORE React hydration. Do NOT rely on `next-themes` blindly — it has unresolved React 19 bugs and only manages a single class attribute, not 6+ CSS variables.

Concrete pattern in `app/layout.tsx`:

```tsx
// app/layout.tsx (Server Component)
const themeScript = `
(function() {
  try {
    var raw = localStorage.getItem('palette-v1');
    if (!raw) return;
    var p = JSON.parse(raw);
    var r = document.documentElement;
    if (p.bg) r.style.setProperty('--color-bg', p.bg);
    if (p.surface) r.style.setProperty('--color-surface', p.surface);
    if (p.text) r.style.setProperty('--color-text', p.text);
    if (p.textMuted) r.style.setProperty('--color-text-muted', p.textMuted);
    if (p.accent) r.style.setProperty('--color-accent', p.accent);
    if (p.secondary) r.style.setProperty('--color-secondary', p.secondary);
    r.setAttribute('data-palette-loaded', 'true');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Critical companion patterns:
- Add `suppressHydrationWarning` on `<html>` (NOT on `<body>` or descendants — it only goes one level deep).
- The `ThemeProvider` must read its initial state from `document.documentElement.style.getPropertyValue('--color-bg')` rather than from the default palette object, so React's in-memory state matches what the blocking script wrote.
- Serialize the palette as a single JSON string in localStorage, not 6 separate keys, to keep the blocking script tiny and atomic.
- Use HSL or RGB triplet string format (`"220 90% 50%"`) so the blocking script doesn't need to parse hex or convert — keep it under 1KB minified.

**Warning signs:**
- Visible flash in DevTools Network throttling (Slow 3G) on first load.
- Lighthouse flags CLS (Cumulative Layout Shift) > 0.1 even though no layout moves — caused by color contrast shifts being perceived as layout instability by some tooling.
- Console warning `Hydration failed because the initial UI does not match what was rendered on the server` when the user has a custom palette saved.

**Phase to address:**
Phase 1 (Foundations) — must be implemented BEFORE the palette switcher UI is built. Retrofitting FOUC prevention after the fact requires rewriting the ThemeProvider's bootstrap logic.

---

### Pitfall 2: Tailwind config hardcodes hex colors, defeating the palette switcher entirely

**Severity:** CRITICAL

**What goes wrong:**
The developer wires CSS variables in `globals.css`, then writes `tailwind.config.ts` with `accent: '#ec4899'` instead of `accent: 'var(--color-accent)'`. Result: all utility classes (`bg-accent`, `text-accent`) emit the hex at build time. Changing the CSS variable at runtime does NOTHING — the compiled CSS doesn't reference it. The feature is silently broken; the dev only notices when QA reports the palette switcher "doesn't change anything except inline styles."

A second, more subtle failure: developer correctly writes `accent: 'var(--color-accent)'`, but then `bg-accent/50` (opacity modifier) produces invalid CSS `background-color: var(--color-accent) / 0.5` instead of `rgb(var(--color-accent) / 0.5)`. All opacity utilities silently fail.

**Why it happens:**
Tailwind's color system was originally built for static palettes. Dynamic CSS variables require an explicit opt-in pattern: storing colors as space-separated RGB triplets (not hex, not full `rgb()`) and using `rgb(var(--x) / <alpha-value>)` in the config so Tailwind's opacity modifier system works.

**How to avoid:**

Step 1 — CSS variables stored as RGB triplets (NOT hex, NOT full `rgb()` syntax):
```css
/* globals.css */
:root {
  --color-bg: 245 244 240;          /* NOT #f5f4f0, NOT rgb(245,244,240) */
  --color-surface: 255 255 255;
  --color-text: 28 28 30;
  --color-text-muted: 100 100 110;
  --color-accent: 230 95 60;
  --color-secondary: 70 130 130;
}
```

Step 2 — Tailwind config uses the `<alpha-value>` placeholder:
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
    },
  },
};
```

Step 3 — ThemeProvider writes triplets too:
```ts
document.documentElement.style.setProperty('--color-accent', `${r} ${g} ${b}`);
// NOT: setProperty('--color-accent', `rgb(${r},${g},${b})`)
```

Step 4 — Enforce via ESLint rule or grep: forbid hex colors anywhere except `globals.css` and the `palettes.ts` source file. Add a CI grep:
```bash
grep -rE "#[0-9a-fA-F]{3,8}" app components --include="*.tsx" --include="*.css"
# Should return zero matches outside globals.css and palettes.ts
```

Note: Tailwind v4 (`@theme` directive) changes the syntax slightly. If the project uses Tailwind v4, use `@theme { --color-accent: rgb(var(--color-accent-raw) / <alpha-value>); }` with the raw triplet in a separate variable.

**Warning signs:**
- `bg-accent/50` renders fully opaque in DevTools.
- Changing `--color-accent` in DevTools changes inline styles but NOT Tailwind utilities.
- Computed style of a `bg-accent` element shows a literal hex code instead of `rgb(... / ...)`.

**Phase to address:**
Phase 1 (Foundations) — Tailwind config and CSS variable format are foundational. Wrong here = full rewrite of every component later.

---

### Pitfall 3: WCAG enforcement only checks text/bg, leaving text/surface and accent/bg unreadable

**Severity:** CRITICAL

**What goes wrong:**
The harmonic generator produces a beautiful palette. Auto-adjustment ensures `--color-text` on `--color-bg` passes 4.5:1. The user is happy. Then they navigate to a `ProjectCard`:
- Card uses `--color-surface` (slightly different from bg) — text/surface ratio is 3.8:1, fails AA.
- Button uses `--color-accent` as background with white text — yellow/white combos fail 1.5:1.
- Muted text on bg passes 4.5:1 but on surface fails 4.2:1.
- Focus ring uses `--color-accent` on `--color-bg` — fails the 3:1 non-text contrast requirement (WCAG 1.4.11).

The "WCAG AA guaranteed" claim is technically false, and a single screenshot from a screen reader user destroys the portfolio's credibility.

**Why it happens:**
Naive contrast enforcement checks ONE pair (text/bg). Real UIs use 6+ surfaces, and accent colors are the most dangerous because they're chosen for vibrance, not legibility. Yellow (#ffd700) has a contrast of 1.07:1 against white and 12.6:1 against black — there's no "white text on yellow accent" path that passes WCAG. The bug manifests only with specific palette combinations, so manual testing of 4 presets won't catch it.

**How to avoid:**

Validate the full contrast matrix, not just one pair. In `lib/colors.ts`:

```ts
type Palette = { bg: string; surface: string; text: string; textMuted: string; accent: string; secondary: string };

const CRITICAL_PAIRS: Array<[keyof Palette, keyof Palette, number]> = [
  // [foreground, background, minRatio]
  ['text', 'bg', 4.5],           // AA normal text on page
  ['text', 'surface', 4.5],      // AA normal text on cards
  ['textMuted', 'bg', 4.5],      // muted text legibility
  ['textMuted', 'surface', 4.5],
  ['accent', 'bg', 3.0],         // WCAG 1.4.11 non-text (focus rings, icons)
  ['accent', 'surface', 3.0],
  ['secondary', 'bg', 3.0],
];

// For accent backgrounds, auto-determine text color
function pickTextOnAccent(accent: string, text: string, bg: string): string {
  // Try text color, then bg color, then black, then white — pick first that passes 4.5
  for (const candidate of [text, bg, '#000000', '#ffffff']) {
    if (wcagContrast(candidate, accent) >= 4.5) return candidate;
  }
  // Fallback: darken or lighten accent until contrast works
  return adjustForAA(text, accent);
}

export function validatePalette(p: Palette): { valid: boolean; failures: string[] } {
  const failures: string[] = [];
  for (const [fg, bg, min] of CRITICAL_PAIRS) {
    const ratio = wcagContrast(p[fg], p[bg]);
    if (ratio < min) failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
  }
  return { valid: failures.length === 0, failures };
}
```

The `WCAGBadge` component should show the WORST pair's ratio, not just text/bg, with a "Show all" expandable list. If any pair fails, auto-adjustment runs across ALL of them iteratively (luminance shift on text colors, hue rotation kept fixed).

Critical edge case: button color choice. Never hardcode `bg-accent text-white` — always derive text color from `pickTextOnAccent()` at runtime and expose as `--color-on-accent` CSS variable.

**Warning signs:**
- The Vaporwave palette (which uses neon pink/cyan accents) shows "AA ✓" in the badge but `text-accent` on `bg-surface` is clearly hard to read.
- Lighthouse Accessibility audit drops below 100.
- `axe-core` browser extension reports contrast failures the badge says don't exist.

**Phase to address:**
Phase 2 (Palette system) — before shipping the harmonic generator. The validation matrix must be designed alongside the palette data model, not bolted on after.

---

### Pitfall 4: Lenis breaks modals, anchor links, ScrollTrigger positions, and form autoscroll — silently

**Severity:** CRITICAL

**What goes wrong:**
After wrapping the app in `<LenisProvider>`, smooth scroll feels great on the homepage. Then:
- **Modal scrolling** — opening the PaletteSwitcher dialog still scrolls the page behind it; user scrolls inside the modal but the body scrolls too.
- **Anchor links** — clicking "About" in the nav jumps instantly (Lenis ignores native hash navigation by default in some configs).
- **ScrollTrigger positions** — animations trigger 100-300px before/after the actual element because Lenis's virtual scroll position drifts from native.
- **scrollIntoView** — `element.scrollIntoView()` inside a form (e.g., focus on validation error) does nothing or jumps without animation.
- **Native form autoscroll** — mobile keyboards push the page up; Lenis fights this, causing the input to be hidden behind the keyboard.
- **Layout shifts after palette change** — fonts re-render at different metrics; ScrollTrigger trigger points are now stale.

**Why it happens:**
Lenis virtualizes the scroll position. By default it intercepts wheel/touch events on the entire document, including nested scrollable areas. ScrollTrigger reads `window.scrollY`, which Lenis doesn't update natively — they desync by 1-2 frames unless explicitly synced via `gsap.ticker`. Anchor support is opt-in via the `anchors: true` config. Layout-changing events (font load, palette swap, image load) invalidate ScrollTrigger's cached positions until `ScrollTrigger.refresh()` is called.

**How to avoid:**

**1. Sync Lenis with GSAP ticker and ScrollTrigger (mandatory pattern):**

```tsx
// components/providers/LenisProvider.tsx
'use client';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{ lerp: 0.1, anchors: true, prevent: (node) => node.hasAttribute('data-lenis-prevent') }}>
      {children}
    </ReactLenis>
  );
}
```

**2. Required `data-lenis-prevent` audit checklist** (add to every component of these types):
- `<Dialog>` content (shadcn DialogContent) — add `data-lenis-prevent` to inner scrollable container.
- `<Sheet>` / drawer content (PaletteSwitcher slide-out panel).
- `<Popover>` and `<Tooltip>` if they contain scrollable lists.
- Any `<select>` dropdowns (Radix Select content).
- Code blocks (`<pre>` with horizontal overflow in MDX).
- The HarmonicGenerator's color picker (color pickers often have internal scroll).

**3. Refresh ScrollTrigger after layout-shifting events:**

```tsx
// In ThemeProvider, after applying palette:
useEffect(() => {
  // Wait one frame for CSS variables to apply, then refresh
  const id = requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => cancelAnimationFrame(id);
}, [palette]);

// Also on font load:
useEffect(() => {
  if (typeof document === 'undefined') return;
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}, []);

// And on image load completion:
// Use a counter + ScrollTrigger.refresh() in <ProjectCard> useEffect on image onLoad
```

**4. Form/input handling:**
- Disable Lenis temporarily when a form input is focused on mobile: `lenis.stop()` on focus, `lenis.start()` on blur (only if `window.matchMedia('(max-width: 768px)').matches`).
- For `scrollIntoView`, use `lenis.scrollTo(element, { offset: -100 })` instead.

**5. Anchor links:**
Pass `anchors: true` in Lenis options (NOT default). Verify by clicking nav links and confirming animated scroll.

**Warning signs:**
- Modal scroll moves the page behind it.
- ScrollTrigger animations trigger "too early" or "too late" relative to the element being scrolled into view.
- Console error `ScrollTrigger.refresh() called during scroll` — wrap refresh in `requestAnimationFrame`.
- Visible jitter on scroll-pinned sections (1-2 frame stutter).
- iOS Safari rubber-band scroll feels "stuck" — Lenis virtualization conflicts with native bounce.

**Phase to address:**
Phase 3 (Animations setup) — Lenis must be configured WITH ScrollTrigger sync from day one, with the prevent audit checklist enforced. Retrofitting is painful because every modal/popover needs auditing.

---

### Pitfall 5: GSAP animations re-run on Strict Mode, duplicate ScrollTriggers leak on re-render, refresh missed after palette swap

**Severity:** HIGH

**What goes wrong:**
Three failures stack:
1. **Strict Mode double-execution** — using raw `useEffect` for GSAP code, animations play twice (visible blink on mount), ScrollTriggers get registered twice (one leaks).
2. **Re-renders without cleanup** — palette change triggers `ThemeProvider` re-render, which re-renders child components; if GSAP code lives in `useEffect`, every render adds a new ScrollTrigger. After 5 palette swaps, the page has 5x the triggers, scroll feels laggy.
3. **Missed refresh after layout** — font loads, palette changes element heights via different font metrics, but `ScrollTrigger.refresh()` was never called. Triggers fire at wrong scroll positions.

**Why it happens:**
- `useEffect` runs twice in Strict Mode (intentional, for catching cleanup bugs). GSAP without `gsap.context()` leaks.
- `useLayoutEffect` SSR warning leads developers to use `useEffect`, but that runs after paint so animations flicker.
- Developers don't know `ScrollTrigger.refresh()` exists or when to call it.
- `useGSAP()` from `@gsap/react` solves all three but requires installing `@gsap/react` separately — easy to miss.

**How to avoid:**

**1. Install `@gsap/react` and use `useGSAP` exclusively** (never raw useEffect for GSAP):

```tsx
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Hero() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Automatically cleaned up on unmount; handles Strict Mode
    gsap.from('.hero-title', { y: 50, opacity: 0, duration: 0.8, stagger: 0.1 });
    ScrollTrigger.create({
      trigger: container.current,
      start: 'top center',
      onEnter: () => { /* ... */ },
    });
  }, { scope: container }); // scope restricts selector to container

  return <div ref={container}>...</div>;
}
```

**2. Use `contextSafe` for event handlers triggered after mount:**

```tsx
const { contextSafe } = useGSAP({ scope: container });
const onClick = contextSafe(() => {
  gsap.to('.button', { scale: 1.1 });
});
```

Without `contextSafe`, click-triggered animations escape the auto-cleanup.

**3. Refresh ScrollTrigger on every layout-changing event:**

In the root `ThemeProvider`:
```tsx
useEffect(() => {
  const id = requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => cancelAnimationFrame(id);
}, [palette]); // palette change can shift heights via CSS color transitions

useEffect(() => {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}, []);

// On window resize (debounced)
useEffect(() => {
  let timeout: NodeJS.Timeout;
  const onResize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  window.addEventListener('resize', onResize);
  return () => { window.removeEventListener('resize', onResize); clearTimeout(timeout); };
}, []);
```

**4. ESLint rule** (if available) or code review checklist:
- No raw `useEffect(() => { gsap.something() })` — must be `useGSAP`.
- Every `gsap.registerPlugin` call must include `useGSAP` and the plugin.
- Every `ScrollTrigger.create` inside `useGSAP` (auto-cleanup).

**Warning signs:**
- Hero animation plays twice on dev server (Strict Mode).
- Scroll feels progressively laggier after multiple palette swaps.
- DevTools Performance tab shows hundreds of `ScrollTrigger.update` calls per frame.
- Animations trigger at wrong scroll positions after window resize.

**Phase to address:**
Phase 3 (Animations setup) — establish `useGSAP` as the only entry point for GSAP code via a coding standard before writing any animation.

---

### Pitfall 6: Framer Motion AnimatePresence skips exit animations on App Router navigation; `mode` choice breaks layout

**Severity:** HIGH

**What goes wrong:**
Page transitions with `<AnimatePresence>` work in dev. On production navigation:
- Exit animation is skipped entirely; new page just appears.
- Or: old page exits, briefly nothing renders, new page enters — visible flash.
- Or with `mode="wait"`: clicking links during transition queues badly, navigation feels sluggish.
- For grid filtering (CategoryFilter): `mode="wait"` causes items to fully disappear before new ones appear (slow); `mode="popLayout"` causes items to overlap during animation (visual glitch).

**Why it happens:**
- Next.js App Router unmounts the old page immediately on navigation — `AnimatePresence` never sees the old children to animate out.
- `mode="wait"` requires only ONE child at a time; on rapid clicks, second click is queued behind first transition.
- `mode="popLayout"` removes exiting children from DOM flow (using `position: absolute`) — but if their layout is computed via flexbox/grid, parent height collapses momentarily.
- `mode="sync"` (default) renders both children simultaneously — causes overlap during transition.

**How to avoid:**

**1. Page transitions in App Router require a template.tsx, not layout.tsx:**

```tsx
// app/[locale]/template.tsx
'use client';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

`template.tsx` creates a new instance on each navigation (unlike `layout.tsx`), enabling enter animations. For exit animations, you need a custom router pattern (intercept route changes, freeze old page during exit) — for v1, skip exit animations on route changes (use enter-only).

**2. CategoryFilter grid (Projects section) — use `popLayout` with explicit layout prop:**

```tsx
<AnimatePresence mode="popLayout">
  {filteredProjects.map((p) => (
    <motion.div
      key={p.slug}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <ProjectCard project={p} />
    </motion.div>
  ))}
</AnimatePresence>
```

The `layout` prop makes Framer Motion smoothly animate position changes when grid reflows. The parent grid container must have explicit `min-height` or fixed row sizing to prevent collapse.

**3. Avoid `layout` prop on elements with `transform` or `filter` CSS** — they fight each other. Don't combine `layout` with `whileHover={{ scale: 1.05 }}` on the same element; nest a motion child instead.

**4. LanguageSwitcher animation** — use simple `motion.div` with key change, not AnimatePresence (single element swap).

**5. Performance:** `layout` animations are expensive. Disable on mobile via:
```tsx
const shouldReduceMotion = useReducedMotion();
const isMobile = useMediaQuery('(max-width: 768px)');
<motion.div layout={!shouldReduceMotion && !isMobile} ... />
```

**Warning signs:**
- Page transitions work locally but flicker in production (App Router doesn't render `template.tsx` exit).
- Grid items "teleport" instead of animating to new positions.
- Layout animations cause frame drops visible in DevTools Performance.

**Phase to address:**
Phase 3 (Animations) — decide AnimatePresence mode strategy per component (page = template only; grid = popLayout + layout) during initial animation architecture.

---

### Pitfall 7: next-intl middleware causes redirect loops; static export fails; locale strategy mismatch

**Severity:** HIGH

**What goes wrong:**
Common failure modes:
1. **Redirect loop** — middleware sees `/`, redirects to `/fr`. Browser requests `/fr`, middleware doesn't recognize it (matcher misconfigured), redirects to `/fr/fr`. Infinite loop until browser kills the request.
2. **Static export breaks** — adding `output: 'export'` to `next.config.js` fails because next-intl middleware can't run in static mode. Error: `middleware cannot be used with output: export`.
3. **`localePrefix: 'as-needed'` causes bugs** — `next-intl` v3.x has a documented bug where `redirect()` to default locale navigates to previously visited locale instead. (GitHub issue #1845.)
4. **Client/server translation mix** — calling `useTranslations()` in a Server Component works, but passing the function to a Client Component breaks (functions aren't serializable). Forgetting to use `NextIntlClientProvider` causes "useTranslations is only available inside NextIntlClientProvider" errors.

**Why it happens:**
- Middleware matcher is regex-based and excludes static files, but if not configured exactly per docs, it matches `/fr` and re-runs.
- Static export needs prefix-only routing (always `/fr` and `/en`), no negotiation, no middleware.
- `localePrefix: 'as-needed'` has historical bugs and requires extra care with the `redirect` API.
- Server Components and Client Components have different translation APIs that are easy to confuse.

**How to avoid:**

**1. Use `localePrefix: 'always'` (always `/fr` and `/en`)** — NOT `as-needed`:
- Avoids the redirect bug.
- Cleaner URLs for SEO (both locales are explicit).
- Works with static export if needed later.

```ts
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
});
```

**2. Exact middleware matcher pattern:**

```ts
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except: api, _next, _vercel, files with extensions
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

Verify by testing: `/`, `/fr`, `/en`, `/fr/about`, `/en/projects/some-slug`, `/api/xxx`, `/favicon.ico`. Each must not loop.

**3. Server vs Client translation pattern:**

```tsx
// Server Component (default in App Router)
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations('Hero');
  return <h1>{t('title')}</h1>;
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';
export function PaletteSwitcher() {
  const t = useTranslations('Palette');
  return <button>{t('open')}</button>;
}
```

In `app/[locale]/layout.tsx`, wrap children in `NextIntlClientProvider` (passing `messages` as prop) so Client Components get translations. Pass ONLY the namespaces needed by client (filter via `pick`), not all messages (bundle size).

**4. Missing translation safety net:**

```ts
// i18n/request.ts
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter(Boolean).join('.');
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${path} (${locale})`);
      }
      // Fallback to key path (not blank)
      return path;
    },
  };
});
```

**5. Skip static export for v1.** The site uses Vercel (which supports middleware natively). If static export is later needed: use `localePrefix: 'always'`, remove middleware, generate static params for both locales, accept no automatic locale detection.

**Warning signs:**
- Browser console: "ERR_TOO_MANY_REDIRECTS" on any locale.
- Build error referencing `output: export` and middleware incompatibility.
- Runtime error: `useTranslations is only available inside NextIntlClientProvider`.
- Translation key displayed literally in production (e.g., "Hero.title" instead of "Bonjour").

**Phase to address:**
Phase 1 (Foundations) — i18n routing decision must be made in initial setup. Changing `localePrefix` strategy later requires URL redirects to preserve SEO.

---

### Pitfall 8: MDX in App Router — RSC boundary confusion, frontmatter not typed, dev hot reload broken

**Severity:** MEDIUM

**What goes wrong:**
- **RSC boundary** — developer puts a `useState`-using component inside MDX. MDX file is rendered as Server Component. Error: `useState is not a function` (no React Context in RSC).
- **Frontmatter not typed** — `import projectData from './my-project.mdx'` gives `any`, no autocomplete, typos in frontmatter slip through. Project metadata gets out of sync between MDX files.
- **Dynamic imports fail in production** — `import(`@/content/projects/${slug}.mdx`)` works in dev, fails in production because Webpack can't statically analyze the path.
- **Hot reload breaks** — editing an MDX file requires full server restart; in-page hot reload doesn't pick up changes.
- **MDXProvider doesn't work in RSC** — passing custom components via `MDXProvider` context fails because RSC doesn't support React Context. Documented in Next.js.

**Why it happens:**
- `@next/mdx` (build-time) compiles MDX to RSC by default. Any client-only React features require `'use client'` boundary.
- Frontmatter is not extracted automatically by `@next/mdx` — needs a remark plugin (`remark-frontmatter` + `remark-mdx-frontmatter`).
- Dynamic imports with template strings disable Webpack's static analysis.
- `next-mdx-remote` solves several issues but has its own gotcha: "do NOT put serialization code in utility files" — Next can't tree-shake server-only code into client bundles.

**How to avoid:**

**1. Choose MDX strategy upfront:**

For 6-10 projects with stable content, use `@next/mdx` with file-system routing:
```
content/projects/my-project.mdx  →  imported in app/[locale]/projects/[slug]/page.tsx
```

Use a Node-based glob loader at build time, not dynamic imports:
```ts
// lib/projects.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type ProjectFrontmatter = {
  slug: string;
  title: { fr: string; en: string };
  category: 'tech' | 'design' | 'bim';
  year: number;
  stack?: string[];
  software?: string[];   // for BIM: ['Revit', 'ArchiCAD']
  scale?: string;        // for BIM: '12,000 m²'
  cover: string;
};

export function getAllProjects(): ProjectFrontmatter[] {
  const dir = path.join(process.cwd(), 'content/projects');
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data } = matter(raw);
      return { ...data, slug: f.replace('.mdx', '') } as ProjectFrontmatter;
    });
}

export async function getProject(slug: string) {
  // Use dynamic import with literal interpolation (Next can analyze)
  const mod = await import(`@/content/projects/${slug}.mdx`);
  return { Content: mod.default, frontmatter: mod.frontmatter };
}
```

**2. Type frontmatter via a Zod schema or a TypeScript module augmentation:**

```ts
// types/mdx.d.ts
declare module '*.mdx' {
  export const frontmatter: ProjectFrontmatter;
  const Component: React.ComponentType;
  export default Component;
}
```

Add a build-time validation that parses every MDX and zod-validates frontmatter. CI fails if a project file has a typo or missing field.

**3. Client components inside MDX — explicit boundary:**

```mdx
import { ImageZoom } from '@/components/mdx/ImageZoom'; // a 'use client' component

# My Project

<ImageZoom src="/projects/hero.jpg" alt="..." />
```

The `ImageZoom` component has `'use client'` at the top. Importing a Client Component into MDX works fine; the boundary is automatic. Don't use MDXProvider context — pass components explicitly via the `components` prop on `<MDXRemote>` (if using next-mdx-remote) or via `mdx-components.tsx`.

**4. Use the `mdx-components.tsx` convention** (Next.js 15 standard for App Router):

```tsx
// mdx-components.tsx (at project root)
import type { MDXComponents } from 'mdx/types';
import { ImageZoom } from '@/components/mdx/ImageZoom';
import { Callout } from '@/components/mdx/Callout';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: ImageZoom,
    Callout,
    h1: (props) => <h1 className="font-display text-5xl mt-12 mb-6" {...props} />,
  };
}
```

**5. Avoid client-side dynamic MDX rendering** unless required (CMS-driven content). For 6-10 static projects, build-time MDX is simpler, faster, and more reliable.

**Warning signs:**
- Dev: `Error: useState is not defined` when rendering an MDX page.
- Build: `Module not found: Can't resolve '@/content/projects/...'` (dynamic import failure).
- Frontmatter typo deploys to production silently because no type check catches it.
- Hot reload requires full `pnpm dev` restart.

**Phase to address:**
Phase 4 (Content & MDX) — establish loader pattern and frontmatter schema before writing the 6 project files.

---

### Pitfall 9: shadcn/ui components hardcode color tokens that don't follow palette; Radix focus ring uses wrong variable

**Severity:** MEDIUM

**What goes wrong:**
shadcn/ui's default components use specific Tailwind tokens (`bg-primary`, `text-primary-foreground`, `ring-ring`, `border-input`) that are wired to a fixed CSS variable set (`--primary`, `--ring`, `--border`, etc.). The portfolio defines its own variables (`--color-accent`, `--color-bg`). Result: every shadcn component looks default; palette switching has no effect on Dialog, Button, Slider, Switch, Popover, Tabs.

Specific bugs:
- Radix focus ring uses `--ring` which is undefined → invisible focus state on keyboard navigation (accessibility regression).
- shadcn Dialog backdrop uses `bg-black/80` (hardcoded) — clashes with light palettes.
- shadcn Slider thumb uses `bg-background` — invisible on accent-colored track.

**Why it happens:**
shadcn/ui assumes you adopt its variable naming convention. The portfolio's design system uses a different convention. Manually editing each shadcn component re-introduces "ejecting" and loses upgrade path.

**How to avoid:**

**Option A (recommended): Adopt shadcn's variable names as aliases.**

Map shadcn's variables to the portfolio's variables in `globals.css`:

```css
:root {
  /* Portfolio palette (source of truth) */
  --color-bg: 245 244 240;
  --color-surface: 255 255 255;
  --color-text: 28 28 30;
  --color-text-muted: 100 100 110;
  --color-accent: 230 95 60;
  --color-secondary: 70 130 130;

  /* shadcn/ui aliases (point to portfolio vars) */
  --background: var(--color-bg);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-bg);  /* or computed contrast color */
  --secondary: var(--color-secondary);
  --secondary-foreground: var(--color-bg);
  --muted: var(--color-surface);
  --muted-foreground: var(--color-text-muted);
  --accent: var(--color-accent);
  --accent-foreground: var(--color-bg);
  --destructive: 220 60 60;
  --destructive-foreground: 255 255 255;
  --border: var(--color-text-muted);
  --input: var(--color-surface);
  --ring: var(--color-accent);
  --radius: 0.5rem;
}
```

This way:
- shadcn components work out of the box with the palette.
- Updating shadcn components via CLI continues to work (no ejection).
- Palette switching automatically updates shadcn UI.

**Option B: When adding a shadcn component, audit it for hardcoded colors:**

```bash
pnpm dlx shadcn@latest add dialog
# Then immediately grep:
grep -E "(bg-(black|white)|text-(black|white)|#[0-9a-f]{3,6})" components/ui/dialog.tsx
```

Replace any hits with palette variables.

**3. Focus ring critical fix:**

Verify `--ring` is defined (or aliased to `--color-accent`). Add visible test in `app/[locale]/page.tsx` — Tab key through all interactive elements; every focus should have a visible ring.

**4. Dialog/Popover backdrop:**

If `data-[state=open]:bg-black/80` is hardcoded on Dialog overlay, change to `data-[state=open]:bg-background/80`.

**5. Dark palette (Vaporwave) compatibility:**

Test every shadcn component in the Vaporwave palette. Common issue: `border-input` (which maps to `--input` = surface color) becomes invisible against a dark background. Add explicit border colors via `--border: var(--color-text-muted)`.

**Warning signs:**
- Buttons retain default blue color despite changing palette.
- Tab key produces no visible focus ring.
- Dialog backdrop is always black, regardless of palette.
- Slider thumb invisible in dark/Vaporwave palette.

**Phase to address:**
Phase 1-2 (Foundations + Palette system) — alias shadcn variables to portfolio variables in `globals.css` at the same time CSS variables are defined. Audit each shadcn component as it's added.

---

### Pitfall 10: Vercel deployment leaks env vars, image domains misconfigured, Lighthouse collapses in production

**Severity:** MEDIUM

**What goes wrong:**
- **`NEXT_PUBLIC_` leak** — developer puts `NEXT_PUBLIC_API_KEY=xyz` in `.env.local`, it ships to client bundle. Anyone can read it in DevTools. (For this portfolio: low risk since no API keys planned, but still applies if analytics keys are added.)
- **Image domains** — external images (e.g., GitHub avatars) fail with "Invalid src prop" because domain not in `next.config.js` `images.remotePatterns`.
- **MDX build timeout** — 6 MDX projects with full image galleries can push build time over Vercel's hobby tier limit (45 min) if images aren't optimized externally.
- **Lighthouse collapse** — in dev, scores are 90+. In production:
  - Client bundle includes GSAP, Lenis, Framer Motion → 200KB+ gzip just for animation libs.
  - Hydration of palette switcher, theme provider, language switcher, custom cursor all run on every page → TBT spike.
  - Initial LCP image is GIF or unoptimized PNG instead of WebP/AVIF.
  - Custom font with `font-display: block` blocks paint.

**Why it happens:**
- `NEXT_PUBLIC_` is intentional escape hatch — naming convention easy to forget consequences of.
- Next.js requires explicit allowlist for external image domains (security feature).
- Vercel build cache can serve stale env vars (Nx-style cached builds restore old `NEXT_PUBLIC_` values).
- Animation libs are heavy; client-side palette system requires hydration; Lighthouse mobile profile is unforgiving.

**How to avoid:**

**1. Env var hygiene:**
- `.env.local` is gitignored — verify in initial commit.
- Only use `NEXT_PUBLIC_` for things that are TRULY public (Vercel analytics ID, public Sentry DSN). Never for keys.
- Vercel project settings → Environment Variables → ensure no `NEXT_PUBLIC_` values are secret.

**2. `next.config.ts` image config:**

```ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // Add others as needed
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

**3. Reduce hydration weight:**
- Mark as many components as possible as Server Components. Only `ThemeProvider`, `LenisProvider`, `PaletteSwitcher`, `LanguageSwitcher`, `CustomCursor`, `ProjectCard` (hover) need `'use client'`.
- Use `dynamic()` imports for non-critical client components: `const PaletteSwitcher = dynamic(() => import('./PaletteSwitcher'), { ssr: false });` — defers until idle.
- Tree-shake GSAP plugins: import only what's used (`import { ScrollTrigger } from 'gsap/ScrollTrigger'`, not `import * from 'gsap/all'`).

**4. Font loading:**
Use `next/font` (Geist, Inter, or a custom Variable font). It self-hosts, eliminates layout shift, and inlines critical CSS:

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
```

**5. Image optimization:**
- All project cover images: WebP/AVIF, max 1920px wide, `<200KB` each.
- Use `<Image priority>` only on the hero image; lazy-load all others.
- Provide explicit `width` and `height` props to prevent CLS.

**6. Pre-deploy Lighthouse checks:**
- Run `pnpm build && pnpm start` locally.
- Run Lighthouse mobile profile from incognito.
- Targets: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO ≥ 95.
- If Performance < 90: check TBT (likely GSAP/Framer Motion hydration), LCP (likely hero image).

**7. Vercel Speed Insights + Analytics:**
Add `@vercel/speed-insights` and `@vercel/analytics` packages — they're tiny (~1KB) and give real-user metrics.

**Warning signs:**
- `pnpm build` shows client bundle > 250KB for any page.
- Vercel deployment log shows "Function exceeded maximum execution time" (build timeout).
- Lighthouse mobile Performance < 80 in production.
- DevTools Network tab shows external images blocked by Next.js Image proxy.

**Phase to address:**
Phase 5 (SEO/A11y) and Phase 6 (Deployment) — Lighthouse audit and bundle inspection should happen before merging the deployment phase. Image domain config when first external image is added.

---

### Pitfall 11: Custom cursor blocks keyboard navigation; reduced-motion not respected; palette modal traps focus poorly

**Severity:** HIGH

**What goes wrong:**
- **Custom cursor + keyboard** — `CustomCursor` component uses `pointer-events: none` correctly, but the cursor follows mouse position only. Keyboard users navigating via Tab see no cursor feedback; focus rings might be hidden by the cursor's visual style.
- **Reduced motion ignored** — `prefers-reduced-motion: reduce` is set, but GSAP animations, Lenis smooth scroll, Framer Motion transitions, custom cursor lag effect, and confetti animation all still run. Vestibular disorders: real harm.
- **Palette switcher modal** — opens but Tab moves focus to elements behind the modal (focus not trapped). Esc key doesn't close it. Screen readers don't announce the modal opening.
- **Language switcher** — toggle changes route but doesn't announce language change to screen readers; doesn't update `<html lang>` immediately (only on full page reload).
- **Konami code activation** — confetti animation triggers without warning, no way to skip; runs even with reduced-motion preference.

**Why it happens:**
- Custom cursors are visual flair; accessibility is an afterthought.
- `prefers-reduced-motion` requires explicit handling per library (GSAP, Lenis, Framer Motion each have their own way).
- Building focus traps from scratch is error-prone; using Radix Dialog (via shadcn) handles it correctly but devs sometimes use a `motion.div` directly instead.
- `<html lang>` is set at the server level; client-side switching requires updating it imperatively.

**How to avoid:**

**1. Custom cursor — respect reduced motion + only render on pointer devices:**

```tsx
'use client';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    setIsPointer(window.matchMedia('(pointer: fine)').matches);
  }, []);

  if (shouldReduceMotion || !isPointer) return null;
  // ... cursor logic
}
```

Verify focus rings remain visible (use `outline-2 outline-accent outline-offset-2` on focus, not `ring-` which can be hidden by cursor layer).

**2. Global reduced-motion gate:**

In `ThemeProvider` or a dedicated `MotionProvider`:
```tsx
'use client';
import { useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { gsap } from 'gsap';

export function MotionGate({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      gsap.globalTimeline.timeScale(1000); // effectively instant
      // Or: gsap.ticker.lagSmoothing(0); + use gsap.set() instead of gsap.to() conditionally
    }
  }, [shouldReduceMotion]);

  return <>{children}</>;
}
```

In Lenis:
```tsx
<ReactLenis options={{ lerp: shouldReduceMotion ? 1 : 0.1, smoothWheel: !shouldReduceMotion }}>
```

In every Framer Motion component, conditional transitions:
```tsx
const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.4 };
```

Add CSS fallback in `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**3. PaletteSwitcher modal — use shadcn Dialog or Sheet (Radix under the hood):**

Don't build the modal with raw `motion.div`. Use shadcn `<Sheet>` (already in dependencies) which provides:
- Focus trap (Tab cycles within modal).
- Esc key to close.
- Click-outside to close.
- `aria-modal="true"` and proper focus return on close.
- Initial focus on first focusable element.

If custom slide-in animation is needed beyond shadcn defaults, wrap shadcn's content in a `motion.div` for animation, but don't replace the Radix Dialog primitives.

**4. Language switcher — proper announcement:**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  const switchLanguage = () => {
    // Update <html lang> imperatively
    document.documentElement.lang = otherLocale;
    // Navigate
    router.replace(`/${otherLocale}${window.location.pathname.replace(/^\/(fr|en)/, '')}`);
  };

  return (
    <button
      onClick={switchLanguage}
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
      lang={otherLocale}
    >
      {otherLocale.toUpperCase()}
    </button>
  );
}
```

**5. Konami confetti — respect motion + skippable:**

```tsx
if (shouldReduceMotion) {
  // Just unlock palette, skip confetti
  setPalette(VAPORWAVE);
  return;
}
// ... confetti animation
```

Add `aria-live="polite"` announcement: "Vaporwave palette unlocked!"

**6. Accessibility audit checklist (before deploy):**
- [ ] Tab through every page in keyboard-only mode — every interactive element reachable, focus visible.
- [ ] Open PaletteSwitcher with keyboard, Tab cycles within, Esc closes.
- [ ] `prefers-reduced-motion: reduce` set in OS → all animations disabled or instant.
- [ ] Screen reader (NVDA on Windows) reads page hierarchy correctly.
- [ ] Lighthouse Accessibility = 100.
- [ ] axe-core extension: 0 errors.

**Warning signs:**
- Focus ring invisible when custom cursor is on top.
- Modal opens but Tab key escapes to background page.
- OS reduced-motion enabled, animations still play.
- `<html lang="fr">` stays after switching to English (visible in DevTools Elements panel).

**Phase to address:**
Phase 5 (SEO/A11y) — but `useReducedMotion` hooks should be wired into animation components from Phase 3 (Animations), not bolted on at the end.

---

### Pitfall 12: Konami code listener breaks form inputs and shadcn dialogs

**Severity:** MEDIUM

**What goes wrong:**
Global `window.addEventListener('keydown', ...)` for Konami code detection captures EVERY keystroke, including:
- Typing in the HarmonicGenerator's color hex input — typing "↑" arrow key for spinner increment gets consumed by Konami listener.
- Typing in MDX content editor (if a contact form is added later).
- Tab navigation gets logged into the Konami buffer.
- `preventDefault()` on the keydown event blocks normal browser behavior (e.g., Tab focus movement, Enter form submission).

Result: Konami code "works" in random places, but form interaction feels broken. User types in a search field and the Vaporwave palette suddenly activates because they typed B and A consecutively.

**Why it happens:**
Global keydown listeners don't know about input context. Default implementations from tutorials don't include input-target filtering.

**How to avoid:**

**1. Filter input-like targets:**

```tsx
'use client';
import { useEffect, useRef } from 'react';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function useKonami(onUnlock: () => void) {
  const buffer = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if focus is inside an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if inside an open dialog (Radix sets data-state="open")
      if (target.closest('[role="dialog"][data-state="open"]')) {
        return;
      }

      // Use e.key, normalize letters to lowercase
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer.current = [...buffer.current, key].slice(-KONAMI.length);
      if (buffer.current.join('') === KONAMI.join('')) {
        buffer.current = [];
        onUnlock();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUnlock]);
}
```

**2. NEVER call `e.preventDefault()`** inside the listener — let normal keyboard behavior pass through (Tab, Enter, arrow keys for sliders).

**3. Don't listen on `document` capture phase** — use `window` bubble phase so input components can stopPropagation if needed.

**4. Test matrix:**
- Type Konami in body — unlocks. ✓
- Type Konami inside a `<input>` — does NOT unlock. ✓
- Type Konami inside open PaletteSwitcher modal — does NOT unlock. ✓
- Tab key after partial Konami sequence — Tab works normally. ✓

**Warning signs:**
- Vaporwave palette unlocks while typing in color hex input.
- Tab key stops working on certain pages.
- Console: increasing memory usage from buffer not being trimmed.

**Phase to address:**
Phase 2 (Palette system) — implement Konami hook with input filtering from day one.

---

### Pitfall 13: BIM projects framed with developer-portfolio metadata (stack, repo) instead of architecture metadata

**Severity:** MEDIUM (project-specific, but signature value)

**What goes wrong:**
The portfolio claims a hybrid Tech × Design × BIM profile. But the `ProjectCard` and project detail page show identical metadata for all categories:
- "Stack: React, Next.js, TypeScript"
- "GitHub: link/to/repo"
- "Live: link/to/site"

For a BIM project (a residential building model in Revit), these fields are nonsensical. There's no GitHub for the Revit file; the "live" link doesn't exist. Forcing dev-portfolio framing onto architecture work makes both the dev work AND the BIM work look weaker. Reviewers can't evaluate BIM expertise (scale, software, role on team, deliverables).

**Why it happens:**
Most portfolio templates are built for one discipline. The "Project" type definition typically assumes web/code work.

**How to avoid:**

**1. Discriminated union for the `Project` type:**

```ts
type BaseProject = {
  slug: string;
  title: { fr: string; en: string };
  year: number;
  cover: string;
  summary: { fr: string; en: string };
  gallery?: string[];
};

type TechProject = BaseProject & {
  category: 'tech';
  stack: string[];           // ['Next.js 15', 'TypeScript', 'PostgreSQL']
  repo?: string;             // GitHub URL
  live?: string;             // deployed URL
  role: 'solo' | 'lead' | 'contributor';
};

type DesignProject = BaseProject & {
  category: 'design';
  tools: string[];           // ['Figma', 'Adobe Illustrator', 'After Effects']
  deliverables: string[];    // ['Brand identity', 'Web mockups', 'Motion reel']
  client?: string;
  duration?: string;         // '3 months'
};

type BIMProject = BaseProject & {
  category: 'bim';
  software: string[];        // ['Revit 2024', 'ArchiCAD 27', 'Navisworks']
  scale?: string;            // '12,500 m²', '8 floors'
  buildingType: string;      // 'Residential', 'Commercial', 'Mixed-use'
  role: string;              // 'BIM Coordinator', 'Architect', 'Modeler'
  team?: string;             // 'Studio XYZ, team of 6'
  deliverables: string[];    // ['IFC export', 'Clash detection report', '4D simulation']
  phase?: 'concept' | 'DD' | 'CD' | 'construction' | 'as-built';
};

export type Project = TechProject | DesignProject | BIMProject;
```

**2. Conditional rendering in `ProjectCard` and detail page:**

```tsx
function ProjectMeta({ project }: { project: Project }) {
  if (project.category === 'tech') {
    return <TechMeta stack={project.stack} repo={project.repo} live={project.live} />;
  }
  if (project.category === 'design') {
    return <DesignMeta tools={project.tools} deliverables={project.deliverables} />;
  }
  if (project.category === 'bim') {
    return <BIMMeta software={project.software} scale={project.scale} buildingType={project.buildingType} />;
  }
}
```

**3. Different cover image treatment per category:**
- Tech: screenshot or UI mockup, light background.
- Design: full-bleed artwork.
- BIM: rendered axonometric, plan view, or photographic render of the model.

**4. Categories must be first-class in i18n:**
```json
// messages/fr.json
{ "Categories": { "tech": "Développement", "design": "Design", "bim": "BIM / Architecture" } }
// messages/en.json
{ "Categories": { "tech": "Development", "design": "Design", "bim": "BIM / Architecture" } }
```

**5. Filter UI shows category count:**
```
[All (6)] [Tech (2)] [Design (2)] [BIM (2)]
```

This signals the hybrid profile at a glance.

**Warning signs:**
- Recruiter (architecture firm) opens portfolio, sees "Stack: React, Next.js" on a BIM project, closes tab.
- A BIM project has empty `stack` field, breaking layout.
- Frontmatter validation fails because Tech and BIM fields are mixed in one MDX file.

**Phase to address:**
Phase 4 (Content & MDX) — type definition must be designed before writing the 6 MDX files, otherwise rewriting both schema and content.

---

### Pitfall 14: Bilingual content drift, missing translations break layout, text expansion FR↔EN breaks fixed-width designs

**Severity:** MEDIUM

**What goes wrong:**
- **Drift** — adding a new section in French, forgetting English; or rewording French marketing copy without updating English. Site becomes inconsistent across locales.
- **Missing keys** — typo in `t('Hero.titel')` (should be `title`) — production shows literal "Hero.titel" or empty string. Or: `messages/en.json` missing a key present in `fr.json`. English users see broken UI.
- **Layout break** — button has `w-32` (fixed width). French label fits ("Voir"), English doesn't ("View project" overflows). Or vice versa: English "Send" is short, French "Envoyer" wraps awkwardly.
- **MDX content drift** — project description in FR has 200 words, EN has 150 words. Card heights differ between locales.

Average text expansion: FR ↔ EN ~ 15-30%, but short UI strings can vary by 100%+ ("OK" stays "OK" but "Submit" → "Soumettre" is 60% longer).

**Why it happens:**
- Manual translation maintenance has no enforcement.
- `messages/fr.json` and `messages/en.json` aren't structurally compared at build time.
- `next-intl` returns the key path on missing translation (not an error) — silent failures in production.
- Designers test with one language only.

**How to avoid:**

**1. Build-time translation completeness check:**

```ts
// scripts/check-translations.ts (run in CI / prebuild)
import fr from '../messages/fr.json';
import en from '../messages/en.json';

function flatKeys(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null ? flatKeys(v, path) : [path];
  });
}

const frKeys = new Set(flatKeys(fr));
const enKeys = new Set(flatKeys(en));

const missingInEn = [...frKeys].filter((k) => !enKeys.has(k));
const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));

if (missingInEn.length || missingInFr.length) {
  console.error('Translation mismatch:');
  if (missingInEn.length) console.error('Missing in en.json:', missingInEn);
  if (missingInFr.length) console.error('Missing in fr.json:', missingInFr);
  process.exit(1);
}
```

Add to `package.json`:
```json
"scripts": {
  "check:i18n": "tsx scripts/check-translations.ts",
  "prebuild": "pnpm check:i18n"
}
```

**2. Typed translation keys** (avoid typos):

Generate TypeScript types from `messages/fr.json`:
```ts
// types/next-intl.d.ts
import type messages from '../messages/fr.json';
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}
```

Now `useTranslations('Hero')` autocompletes, and `t('titel')` is a TS error.

**3. `getMessageFallback` in `i18n/request.ts`** (catches runtime mistakes):

```ts
getMessageFallback({ namespace, key }) {
  const path = [namespace, key].filter(Boolean).join('.');
  if (process.env.NODE_ENV === 'development') {
    throw new Error(`Missing translation: ${path}`);
  }
  return path; // Visible placeholder in prod (better than blank)
}
```

**4. Design for text expansion — no fixed widths on text containers:**

```tsx
// BAD
<button className="w-32">{t('cta')}</button>

// GOOD
<button className="px-6 py-3 min-w-[8rem]">{t('cta')}</button>
```

Allow text to wrap or use `text-wrap: balance`. Audit checklist:
- All buttons use `px-N` padding instead of fixed `w-N`.
- Card titles use `min-h-` not fixed `h-`.
- Hero headline allows 2-3 line wrap.
- Navigation items use `gap-N` between items, not fixed widths.

**5. MDX content parity:**

For projects, English and French MDX files for the same project should have parallel structures (same sections, same number of paragraphs, same images). Add a manual review checklist when adding a project.

Use a single MDX file with bilingual frontmatter:
```yaml
---
slug: my-project
title:
  fr: Mon Projet
  en: My Project
summary:
  fr: 200-word summary in French.
  en: 200-word summary in English.
---

# {locale === 'fr' ? 'Mon Projet' : 'My Project'}
```

Or two files (`my-project.fr.mdx`, `my-project.en.mdx`) with a build-time check that pairs exist and have similar word counts (±20%).

**6. RTL — not applicable for FR/EN.** Both are LTR. No need for RTL handling now, but if Arabic or Hebrew added later, requires bidirectional CSS (logical properties: `ms-`, `me-`, `ps-`, `pe-` instead of `ml-`, `mr-`, `pl-`, `pr-`).

**Warning signs:**
- "Hero.title" literally appears on the page in production.
- Button text overflows in one language only.
- French page is 30% taller than English page (or vice versa) due to text length differences.
- Build succeeds despite missing keys (no enforcement).

**Phase to address:**
Phase 1 (Foundations) — set up translation completeness check + typed keys before writing any UI. Layout discipline (no fixed widths on text) starts from first component.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping FOUC blocking script "just for now" | Faster initial setup | Visible flash on every load, looks unprofessional, hard to retrofit | NEVER — must ship with v1 |
| Hardcoding hex colors in component classes (`text-[#ec4899]`) | Quick prototype | Palette switcher broken for those components, requires audit | Acceptable in throwaway scratch components, never in shipped code |
| Using `next-themes` for palette management | Battle-tested for class toggling | Doesn't handle multi-variable palettes well, React 19 bugs documented | Acceptable for binary dark/light only (not this project) |
| Skipping `useGSAP` and using raw `useEffect` for GSAP | One less import | Animations re-run in Strict Mode, ScrollTrigger leaks on re-render, cleanup omitted | NEVER — `useGSAP` is the standard pattern |
| Not syncing Lenis with `gsap.ticker` | Setup is shorter | ScrollTriggers desync by 1-2 frames, jittery animations | NEVER if both libs are used together |
| `localePrefix: 'as-needed'` for "cleaner" URL on default locale | One fewer character in URL | Known redirect bugs, harder to debug, doesn't work with static export | Only with a Pages Router setup, never on App Router v1 |
| `mode="sync"` on AnimatePresence for grid | Most natural-feeling animation | Overlapping items during transition, visual artifacts | Acceptable for single-item swaps, never for lists |
| Dynamic `import()` of MDX with string interpolation | Looks elegant | Breaks production build, no tree-shake | NEVER in production code |
| Letting shadcn components use default tokens | Faster initial install | Palette switcher has no effect on shadcn UI | NEVER — alias variables upfront |
| Skipping translation key completeness check | Build doesn't fail on missing keys | English version slowly degrades, users see "Hero.title" literals | Acceptable for prototype, must add before public deploy |
| Custom modal without focus trap (raw `motion.div`) | More creative freedom in animations | Keyboard users can't escape modal, screen reader unsupported | NEVER for primary UI (PaletteSwitcher), acceptable for purely decorative overlays |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Tailwind + CSS variables** | Storing variables as `#ec4899` or `rgb(236, 72, 153)` | Store as space-separated triplets `236 72 153`, use `rgb(var(--x) / <alpha-value>)` in config |
| **next-intl middleware** | Matcher includes `/api`, `/favicon.ico`, etc., causing redirect loops | Use `matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'`]` exactly |
| **Lenis + GSAP ScrollTrigger** | Not adding Lenis to `gsap.ticker`, not calling `ScrollTrigger.update` on Lenis scroll | Always wire `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(time => lenis.raf(time * 1000))` |
| **shadcn/ui + custom palette** | Editing each shadcn component to use custom vars | Alias shadcn's `--primary`, `--accent`, `--ring`, etc. to portfolio vars in `globals.css` |
| **@gsap/react useGSAP + ScrollTrigger** | Forgetting `gsap.registerPlugin(useGSAP, ScrollTrigger)` | Register both in a module-level call before any component uses them |
| **next-intl Server vs Client** | Calling `useTranslations` in a Server Component, or `getTranslations` in Client | Server: `getTranslations()` (async). Client: `useTranslations()` (hook), wrap children in `NextIntlClientProvider` |
| **MDX + dynamic import** | `import(\`./projects/${slug}.mdx\`)` works in dev, fails in prod | Use webpack-compatible literal patterns or build a static map of imports |
| **Vercel + image domains** | Forgetting to add external hosts to `remotePatterns` | Add every external image host upfront; test in production build, not just dev |
| **Framer Motion AnimatePresence + Next.js App Router** | Wrapping `layout.tsx` children for page transitions | Use `template.tsx` (re-mounts on navigation), not `layout.tsx` (persistent) |
| **Konami code listener** | `window.addEventListener('keydown')` without target filtering | Filter `target.tagName === 'INPUT' \|\| 'TEXTAREA' \|\| isContentEditable`, also skip Radix open dialogs |
| **Vercel + `NEXT_PUBLIC_` cache** | Cached build serves dev env values to prod | Verify env vars at runtime via a `/api/health` endpoint exposing only non-secret keys |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animation libs bundled into every page | Initial JS > 250KB, Lighthouse TBT spike | Tree-shake plugins (`gsap/ScrollTrigger`, not `gsap/all`); lazy-load PaletteSwitcher via `dynamic({ ssr: false })`; mark non-interactive sections as Server Components | Any page; immediate at first deploy |
| Re-rendering whole tree on palette change | Frame drops during palette swap, scroll jank | Apply palette via CSS variable mutation (no React re-render) — only update React state for UI (badge, selected preset); use CSS `transition: color 400ms` on `<html>` | Visible within 5+ rapid palette swaps |
| Unbounded ScrollTrigger creation in `useEffect` | Scroll grows progressively laggier | Use `useGSAP` exclusively for auto-cleanup, never raw `useEffect` for GSAP | After ~10 component re-renders that contain ScrollTriggers |
| Hero image not WebP/AVIF | LCP > 2.5s on mobile, Lighthouse < 90 | `next/image` with `priority` and explicit `width`/`height`, source files in WebP/AVIF | Mobile 3G connection |
| Custom cursor running RAF every frame even when not visible | CPU 5-15% baseline, battery drain on laptops | Pause RAF when `document.hidden` (Page Visibility API); use `transform` (composited) not `top`/`left` (paints) | Always on idle desktop |
| `prefers-reduced-motion` not respected | Vestibular harm + jank for users on low-power devices that auto-enable reduced-motion | Global gate (`useReducedMotion` + CSS media query) disabling all animations | Users with OS setting enabled (1-3% of audience) |
| Inline `style` updates from React on scroll | React reconciliation per scroll event | Use CSS variables + `requestAnimationFrame`-throttled updates, not setState | Long scroll sessions (continuous reads) |
| Font subsetting missing | FOIT or layout shift when web fonts load | `next/font` with `subsets: ['latin']` and `display: 'swap'` | Always on first load, before font cache |

For a portfolio site with expected traffic of <10K monthly visits, scale thresholds are mostly irrelevant — focus on per-visit performance (Lighthouse, real-user metrics).

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `NEXT_PUBLIC_` prefix on secret keys | Secret exposed in client bundle, visible in DevTools | Audit all `NEXT_PUBLIC_*` env vars; never include keys, tokens, or credentials. Only safe IDs (Vercel Analytics ID, public DSNs) |
| `dangerouslySetInnerHTML` for MDX content from user input | XSS if MDX is ever rendered from user-provided strings | For this project: MDX is git-committed, no user input. If form/comments added later: sanitize with `dompurify` |
| Custom inline script in `<head>` for FOUC fix | If script is large or includes user data, becomes injection vector | Keep blocking script tiny (<1KB), only reads from `localStorage`, no eval or string concat from external sources |
| Open redirects via locale switching | Crafted URL like `/?locale=//evil.com` could redirect | next-intl validates locale against allowlist; verify by attempting injection |
| Konami code triggers privileged action | Unlocking dev features in production via easter egg | Vaporwave palette is fine (visual only). Never gate auth, admin, or sensitive actions behind easter eggs |
| Exposing source maps in production | Reveals component structure, may leak comments | `next.config.ts`: ensure `productionBrowserSourceMaps: false` (default) unless explicitly needed for error tracking |
| MDX components allow arbitrary HTML | XSS in MDX (`<script>` tag inside content) | `@next/mdx` doesn't process raw HTML by default; verify `rehype-raw` is NOT enabled unless content is trusted |

For a portfolio (no backend, no user accounts, no forms), security surface is small. Main concerns: env var hygiene and the FOUC inline script.

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Custom cursor without fallback indicator | Touch / keyboard users see no feedback on interactive elements | Custom cursor for `pointer: fine` only; keep native cursor + clear hover/focus states for everyone |
| Easter eggs that punish discovery | User accidentally triggers Konami, can't go back to previous palette | Make Vaporwave reversible (close button on the activation toast, or auto-revert after X minutes) |
| Palette switcher buried in mobile UI | Signature feature invisible on the device most visitors use | FAB in bottom-right, always visible; mobile-first design |
| Smooth scroll without "Skip to content" link | Keyboard users wait 800ms for animation to reach footer | Add `<a href="#main" className="sr-only focus:not-sr-only">Aller au contenu</a>` at top |
| Page transitions add 500ms on every navigation | Feels slow for repeat visitors | Keep transitions under 300ms, allow user to interrupt (don't lock interaction) |
| Filter animation slow for power users | "I just want to see Tech projects, why is this so slow?" | <300ms total transition; "All" tab shows everything instantly (no exit anim) |
| Auto-playing video/heavy media in hero | High data usage on mobile, fails on Save-Data | `<video>` only on `pointer: fine` and `prefers-reduced-data: no-preference`; static cover image otherwise |
| Bilingual switcher hidden behind menu | Users not on default locale don't find their language | Persistent FR/EN toggle visible in main navigation, both labels shown |
| Project filter resets on browser back | User filters to BIM, opens project, goes back, sees "All" — frustrating | Persist filter state in URL query param (`?cat=bim`) |
| No loading state on palette generation | User clicks "Generate" — UI freezes for 100-300ms (color calc) — they click again, multiple palettes generated | Disable button + show spinner during generation; debounce |

---

## "Looks Done But Isn't" Checklist

- [ ] **Palette switcher:** Often missing: WCAG validation on ALL contrast pairs (text/bg, text/surface, accent/bg, accent/surface) — verify a yellow accent palette doesn't pass with white text.
- [ ] **FOUC fix:** Often missing: tested with throttled network + cleared cache + multiple browsers — verify NO flash on first load with a saved palette.
- [ ] **Lenis smooth scroll:** Often missing: `data-lenis-prevent` on every Dialog, Sheet, Popover, Tooltip, Select — verify modals scroll independently of page.
- [ ] **GSAP animations:** Often missing: `useGSAP` instead of `useEffect`, with `contextSafe` for click handlers — verify no double-play in Strict Mode dev.
- [ ] **Page transitions:** Often missing: `template.tsx` for enter animations, not `layout.tsx` — verify enter animation runs on every navigation.
- [ ] **next-intl middleware:** Often missing: matcher excludes static files — verify `/favicon.ico` doesn't loop, `/api/x` is not localized.
- [ ] **MDX:** Often missing: frontmatter validation with zod at build time — verify a typo in a project field fails the build.
- [ ] **shadcn theming:** Often missing: alias map for shadcn's `--primary`, `--ring`, `--border` to portfolio's `--color-*` — verify Dialog backdrop respects palette in Vaporwave.
- [ ] **Vercel deployment:** Often missing: production Lighthouse test, env var audit — verify no `NEXT_PUBLIC_` leaks of secrets.
- [ ] **Accessibility:** Often missing: keyboard-only Tab through entire homepage with visible focus, reduced-motion test, screen reader announcement on language switch — verify with NVDA or VoiceOver.
- [ ] **Konami code:** Often missing: target filtering for INPUT/TEXTAREA/contentEditable — verify typing in a form field doesn't trigger Vaporwave.
- [ ] **BIM project metadata:** Often missing: software/scale/buildingType fields distinct from tech projects — verify BIM cards show different metadata than Tech cards.
- [ ] **i18n parity:** Often missing: build-time key completeness check — verify removing a single FR key fails the build.
- [ ] **Custom cursor:** Often missing: `pointer: fine` query AND `prefers-reduced-motion` check — verify mobile users see native cursor, reduced-motion users see no custom cursor.
- [ ] **404 page:** Often missing: per-locale 404 in `app/[locale]/not-found.tsx`, NOT only `app/not-found.tsx` — verify French/English 404s render correctly.
- [ ] **Image optimization:** Often missing: explicit width/height on every `<Image>`, AVIF format in `images.formats` — verify no CLS from images.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| FOUC visible in production | LOW | Add blocking script in `<head>` of `layout.tsx`, add `suppressHydrationWarning` to `<html>`. ~1 hour. |
| Tailwind palette not switching | MEDIUM | Convert all CSS variables to RGB triplet format, update `tailwind.config.ts` to use `rgb(var(--x) / <alpha-value>)` pattern, no component changes needed. ~2-3 hours. |
| WCAG validation incomplete | MEDIUM | Extend `validatePalette()` to check full pair matrix, add auto-adjustment loop. UI changes minimal. ~3-4 hours. |
| Lenis breaking modals | LOW | Add `data-lenis-prevent` audit pass — grep for `<Dialog>`, `<Sheet>`, `<Popover>`, add attribute. ~1 hour. |
| ScrollTrigger leaks | MEDIUM | Replace all GSAP `useEffect` with `useGSAP`, add `gsap.context()` cleanup. Per-component refactor. ~4-6 hours depending on count. |
| AnimatePresence not working on routes | MEDIUM | Move animation wrapper from `layout.tsx` to `template.tsx`. Test all routes. ~2 hours. |
| next-intl redirect loop | LOW-MEDIUM | Fix middleware matcher regex, test all paths. ~1-2 hours. |
| MDX dynamic imports failing in prod | MEDIUM | Replace dynamic interpolation with static map or `webpackChunkName` magic comment. ~2 hours. |
| shadcn components ignoring palette | LOW | Add alias variables in `globals.css`. ~30 minutes. |
| Konami breaking forms | LOW | Add target filtering to the listener. ~15 minutes. |
| Vercel `NEXT_PUBLIC_` leak | LOW | Rotate the leaked secret, remove from env vars, redeploy with `NEXT_PUBLIC_` prefix removed and value passed server-side only. ~30 minutes + secret rotation time. |
| BIM projects using wrong metadata | HIGH | Refactor `Project` type to discriminated union, update all 6 MDX files, update ProjectCard rendering. ~4-6 hours. |
| Translation drift discovered | MEDIUM | Run completeness check, fill missing keys (manual translation work), add to CI. ~2-3 hours + translation time. |
| Accessibility audit fails | HIGH | Add focus traps to modals (replace custom with Radix Dialog), add reduced-motion gate, ensure focus rings visible, fix `<html lang>`. ~6-8 hours. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls. Phases are suggested groupings; adjust to project's actual roadmap structure.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. FOUC | Phase 1 (Foundations) | Throttled load test with saved palette — no flash visible |
| 2. Tailwind hardcoded colors | Phase 1 (Foundations) | `bg-accent/50` produces correct opacity in DevTools |
| 3. WCAG full matrix | Phase 2 (Palette system) | Test with yellow accent — auto-adjustment kicks in |
| 4. Lenis modal/ScrollTrigger | Phase 3 (Animations setup) | Modal scrolls independently; ScrollTrigger positions accurate |
| 5. GSAP useGSAP cleanup | Phase 3 (Animations setup) | Strict Mode dev — animations play once, no leaks after 10 palette swaps |
| 6. AnimatePresence mode | Phase 3 (Animations setup) | Page transitions on every navigation; grid filter smooth |
| 7. next-intl middleware | Phase 1 (Foundations) | All paths tested, no redirect loops, no `useTranslations` errors |
| 8. MDX boundaries | Phase 4 (Content & MDX) | Frontmatter typed via zod; client components render inside MDX |
| 9. shadcn theming | Phase 1-2 (Foundations + Palette) | shadcn Dialog backdrop respects all palettes including Vaporwave |
| 10. Vercel deploy | Phase 6 (Deployment) | Lighthouse mobile ≥ 90 in production; env var audit clean |
| 11. A11y reduced-motion | Phase 5 (SEO/A11y), hooks wired from Phase 3 | OS reduced-motion → all animations disabled; Tab through site complete |
| 12. Konami input filtering | Phase 2 (Palette system) | Typing in inputs doesn't trigger Konami |
| 13. BIM project metadata | Phase 4 (Content & MDX) | BIM cards show software/scale, not stack/repo |
| 14. i18n parity | Phase 1 (Foundations) | Removing a FR key fails the build |

---

## Sources

**Library-specific (HIGH confidence):**
- [Lenis README — data-lenis-prevent, modal handling, ScrollTrigger sync](https://github.com/darkroomengineering/lenis/blob/main/README.md)
- [GSAP useGSAP hook official docs — Strict Mode, contextSafe, cleanup](https://gsap.com/resources/React/)
- [Lenis + ScrollTrigger desync fix — GSAP Forums](https://gsap.com/community/forums/topic/39286-scrolltrigger-lenis-problem/)
- [next-intl routing configuration — localePrefix strategies](https://next-intl.dev/docs/routing/configuration)
- [next-intl middleware setup](https://next-intl.dev/docs/routing/middleware)
- [Static export limitations with next-intl](https://github.com/amannn/next-intl/issues/822)
- [`localePrefix: 'as-needed'` redirect bug](https://github.com/amannn/next-intl/issues/1845)
- [next-intl missing translation fallback strategy](https://github.com/amannn/next-intl/discussions/1061)
- [Tailwind CSS variables with alpha — official docs](https://tailwindcss.com/docs/colors)
- [Tailwind theme variables — RGB triplet pattern](https://tailwindcss.com/docs/theme)
- [shadcn/ui theming with CSS variables](https://ui.shadcn.com/docs/theming)
- [next-themes — App Router, suppressHydrationWarning](https://www.npmjs.com/package/next-themes)
- [next-themes React 19 limitations](https://github.com/vercel/next.js/discussions/75890)

**Pattern / community (MEDIUM confidence, multiple sources verified):**
- [Eliminating Theme Flicker and Hydration Issues in Next.js](https://medium.com/@ajayrajthakur111/eliminating-theme-flicker-and-hydration-issues-in-next-js-3acbae58faa8)
- [Understanding & Fixing FOUC in Next.js App Router 2025 Guide](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk)
- [Framer Motion page transitions in Next.js App Router (template.tsx pattern)](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router)
- [MDX in Next.js App Router — frontmatter, RSC boundaries](https://nextjs.org/docs/app/guides/mdx)
- [MDX components convention (mdx-components.tsx)](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components)
- [WCAG color contrast palette generator pitfalls](https://www.studiolimb.com/guides/wcag-color-contrast-guide.html)
- [Color contrast for non-text elements (WCAG 1.4.11)](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)
- [Konami code in React with Hooks](https://non-traditional.dev/adding-the-konami-code-to-your-react-app-using-hooks-6dc90e9e589c)
- [Global keydown listener input filtering pattern](https://www.codelessgenie.com/blog/how-to-detect-keydown-anywhere-on-page-in-a-react-app/)
- [Text expansion FR↔EN UI design](https://simplelocalize.io/blog/posts/text-expansion-ui-localization/)
- [BIM portfolio presentation — software and metadata](https://www.novatr.com/blog/how-to-make-a-bim-architect-portfolio)
- [Reduced motion & custom cursors — Motion docs](https://motion.dev/docs/cursor)
- [Vercel deployment — NEXT_PUBLIC, image domains, performance](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Next.js hydration error reference](https://nextjs.org/docs/messages/react-hydration-error)

**GSAP/Lenis specific community fixes (MEDIUM confidence):**
- [Optimizing GSAP Animations in Next.js 15 — useGSAP best practices](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232)
- [GSAP + React integration guide](https://gsapify.com/gsap-react/)
- [Lenis modal scroll prevention discussion](https://github.com/darkroomengineering/lenis/discussions/292)
- [Smooth scrolling Next.js with Lenis & GSAP guide](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)

---
*Pitfalls research for: Next.js 15 App Router creative portfolio (tanguy-portfolio)*
*Researched: 2026-05-25*
