# Stack Research

**Domain:** Bilingual (FR/EN) creative personal portfolio with runtime-customizable theming, scroll-driven animation, and MDX content
**Researched:** 2026-05-25
**Confidence:** HIGH (versions verified against Context7-equivalent official docs published May 2026)

---

## TL;DR — Critical Updates to the User's Mental Model

Five things diverge from the user's stated stack and must be addressed in PROJECT.md / roadmap:

1. **Next.js 16 is now stable** (released Oct 2025, currently `16.2.6` as of May 2026). The user wrote "Next.js 15". Next 16 is a small but real breaking change set — most importantly `middleware.ts` is now `proxy.ts`, sync access to `cookies()`/`headers()`/`params` is fully removed (must be `await`-ed), and Turbopack is default. **Recommendation: target Next 16, not Next 15.** A clean greenfield project should never start on the previous major.
2. **`framer-motion` was renamed to `motion`** (npm package `motion`, import from `motion/react`). The old package still works but is in legacy support. **Use `motion`, not `framer-motion`.**
3. **`@studio-freight/lenis` was renamed to `lenis`** when Studio Freight became Darkroom Engineering. The React wrapper is now bundled — import from `lenis/react`. **Use `lenis`, not `@studio-freight/lenis` and not `@studio-freight/react-lenis`.**
4. **GSAP is 100% free for commercial use as of April 2025**, including all former Club plugins (SplitText, MorphSVG, DrawSVG, ScrollSmoother, etc.). They are now in the public npm `gsap` package. No bonus repo, no token, no watermark. The user can install `gsap` and immediately import `SplitText` and `ScrollTrigger`.
5. **Tailwind v4 is the current major** (released Jan 2025, currently 4.3.x). It is a completely different mental model: no `tailwind.config.js`, theming via `@theme { ... }` in CSS, design tokens are native CSS custom properties by default. **This is a huge win for the palette-switcher feature** — v4's architecture is literally what the user is trying to build manually with v3. **Use v4.**

Additional notes worth flagging:

- **`contentlayer` is unmaintained** (Stackbit acquired by Netlify, sponsorship cut, single maintainer at 1 day/month). **Do not use it.** Use `@next/mdx` for App-Router-routed MDX pages, optionally with `gray-matter` for frontmatter. For 6-10 projects this is dead simple and avoids a doomed dependency.
- **`culori` does NOT have a built-in harmonic palette generator.** It provides `wcagContrast()` (perfect), conversion to/from OKLCh (perfect), and color interpolation (perfect), but you must compose the harmonic generator yourself (rotate hue in OKLCh space: complementary +180°, triadic +120°/+240°, analogous +30°/-30°, split-complementary +150°/+210°). This is ~30 lines of code in `lib/colors.ts` — easy, but the user should know it is not free.
- **shadcn/ui in 2026 now supports Base UI as an alternative to Radix.** Radix is still the default and remains rock-solid. For a portfolio with 7 simple components (button, card, dialog, slider, switch, popover, tabs), **stay with the Radix default** — it is more mature, more battle-tested, and the user has implied no preference. Initialize with `npx shadcn@latest init`.
- **`tailwindcss-animate` is deprecated**, replaced by `tw-animate-css` in shadcn's default scaffold for Tailwind v4 projects. This will be set up for the user automatically by `shadcn init`.
- **The `toast` component in shadcn is deprecated** in favor of `sonner`. Not needed for this portfolio (no toast use case in PROJECT.md), but worth knowing for future additions.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | `^16.2.0` | App Router framework, RSC, Vercel-native deployment | Latest stable. Turbopack default (2-5x faster builds, 10x Fast Refresh). React 19.2 baked in. Native View Transitions support — useful for page transitions alongside Motion. Backed by Vercel, ships every 6-9 months, zero-config Vercel deploy. |
| **React** | `^19.2.0` | UI runtime | Required by Next 16 App Router (uses React canary that includes 19.2 features). New `useEffectEvent`, `<Activity>`, `<ViewTransition>` primitives. Compiler-friendly (Next 16 has stable React Compiler integration if wanted). |
| **TypeScript** | `^5.6.0` (minimum 5.1, latest stable preferred) | Type safety, no `any` per project constraint | Next 16 minimum is 5.1.0 but the latest minor is recommended for best JSX and `satisfies` ergonomics. PROJECT.md mandates strict mode. |
| **Tailwind CSS** | `^4.3.0` | Utility CSS, CSS-variable-driven theming | **v4 is a transformative match for this project.** All design tokens are CSS custom properties by default — runtime theme switching without rebuilds is the v4 native model, not a hack. `@theme { --color-bg: ...; }` in `globals.css` replaces `tailwind.config.js`. OKLCH-first color system aligns with culori. Up to 10x faster builds. |
| **Node.js** | `>=20.9.0` LTS | Runtime for dev + Vercel build | Hard minimum for Next 16. Recommend Node 22 LTS for slightly better perf, but 20.9+ is fine. |
| **Vercel** | platform | Hosting | Free Hobby tier covers this portfolio comfortably. Native Next.js, edge CDN, image optimization endpoint, Speed Insights, Analytics. Auto-deploy on `git push`. |

### Animation Stack

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **gsap** | `^3.13.0` | Core animation engine, ScrollTrigger, SplitText, etc. | 100% free including former Club plugins as of April 2025. Industry standard for scroll-driven and timeline animation. Hero text reveal (SplitText), parallax (ScrollTrigger), pinned horizontal scroll (ScrollTrigger pin) — all in the PROJECT.md requirements — are GSAP's home turf. |
| **@gsap/react** | `^2.1.2` | `useGSAP()` hook | Drop-in replacement for `useLayoutEffect`/`useEffect` that wraps animations in `gsap.context()` for automatic cleanup on unmount + React 19 Strict Mode double-invoke. `scope` config option scopes selectors to a ref. `contextSafe()` for event-handler-triggered animations. **Required pattern per PROJECT.md.** |
| **lenis** | `^1.3.x` | Smooth scroll, RAF-driven, used by countless creative sites | Industry standard for the "Awwwards" smooth-scroll feel. Includes React wrapper at `lenis/react` (no separate package). Plays well with GSAP ScrollTrigger when configured to use Lenis's scroll value as ScrollTrigger's scroller proxy. |
| **motion** | `^12.x` | Layout animations, gesture handling, AnimatePresence | The former `framer-motion`, rebranded. Best-in-class for declarative React micro-interactions: `<motion.div animate hover>`, `AnimatePresence` for filter transitions, layout animations for the project grid filter. Import from `motion/react`. |

### Internationalization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **next-intl** | `^4.12.x` | i18n routing, ICU messages, typed translations | Active, well-maintained, App Router-native. Handles middleware routing for `/fr` and `/en`, server-component-safe translations, ICU plurals, fully typed message keys with autocomplete (when you define a `global.d.ts` with `IntlMessages`). Works seamlessly with Next 16's `proxy.ts` rename (was `middleware.ts`). |

### Content (MDX)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@next/mdx** | `^16.x` (matches Next major) | Compile `.mdx` files into pages or imports | Official Next.js package. Server Components by default — no client runtime cost. Supports `pageExtensions: ['mdx', ...]` for filesystem routing or dynamic `import()` for content-collection patterns. For 6-10 portfolio projects, this is the simplest possible setup. |
| **@mdx-js/loader** | `^3.x` | MDX→React transform | Peer dep of `@next/mdx`. |
| **@mdx-js/react** | `^3.x` | React provider for MDX components | Peer dep. |
| **@types/mdx** | latest | TS types for `*.mdx` imports | Required so `import Post from './foo.mdx'` typechecks. |
| **gray-matter** | `^4.x` | Frontmatter parser for slug, title, category, year, stack, cover | `@next/mdx` does NOT parse YAML frontmatter natively (it supports JS `export const metadata` but PROJECT.md says "frontmatter"). `gray-matter` is the standard. Alternative: use `export const metadata = {...}` inside the MDX and skip `gray-matter` entirely. |
| **remark-gfm** | `^4.x` | GitHub Flavored Markdown (tables, strikethrough, autolinks) | Quality-of-life for writing project descriptions. |
| **rehype-pretty-code** | `^0.14.x` | Syntax highlighting via Shiki for code blocks in MDX | Per PROJECT.md "CodeBlock highlight" component. Zero-runtime, server-side highlighting, smaller and better than Prism. Uses VS Code themes. |

### Color System

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **culori** | `^4.x` | OKLCh conversion, WCAG contrast, color interpolation | Modern ESM, perceptually uniform color spaces (OKLCh) which is what Tailwind v4 uses, exposes `wcagContrast(a, b)` per WCAG 2.0 spec. Used by Tailwind v4 itself and by Radix Colors. Tree-shakeable: import only what you use. **Note: culori does NOT have a built-in harmonic palette generator** — write your own (~30 LOC, see PITFALLS.md). |

### UI Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **shadcn/ui** | CLI `shadcn@latest` | Copy-paste, locally-owned React component recipes | Still copy-paste in 2026, still no runtime dependency on a UI lib. Now defaults to "new-york" style, OKLCH color tokens, and Tailwind v4. Components needed per PROJECT.md: button, card, dialog, slider, switch, popover, tabs. Initialize with `npx shadcn@latest init` then `add` each one. |
| **Radix UI primitives** | auto-installed by shadcn | Accessible headless primitives under shadcn | Still the default in 2026 (Base UI is an opt-in alternative). Each shadcn component pulls in one `@radix-ui/react-*` package. WAI-ARIA compliant, keyboard nav, focus management — critical because PROJECT.md mandates full keyboard nav on the PaletteSwitcher. |
| **tw-animate-css** | latest | Replaces `tailwindcss-animate` for Tailwind v4 | Auto-installed by `shadcn init` when v4 detected. Provides the `animate-in`, `animate-out`, `fade-in`, etc. utility classes that Radix-driven Dialog/Popover transitions rely on. |
| **class-variance-authority (cva)** | `^0.7.x` | Variant API for shadcn components | Required by shadcn's button/card variants. |
| **clsx** + **tailwind-merge** | latest | The `cn()` utility shadcn uses everywhere | Required for the `cn(...args)` helper in `lib/utils.ts`. |
| **lucide-react** | `^0.4xx.x` | Icon set used by shadcn defaults | Tree-shakeable, ~1000 icons, used by every shadcn component example. For the FAB palette icon, language switcher, social links. |

### Fonts & Assets

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **next/font** | bundled with `next` | Self-hosted font optimization, zero CLS | Built into Next.js. `next/font/google` for Google Fonts (no runtime request to Google, downloaded at build, served from same origin — GDPR-safe and faster) or `next/font/local` for custom OTF/WOFF2. Per PROJECT.md "police custom". |
| **sharp** | auto-handled by Next 16 | Server-side image optimization for `next/image` | **No longer needs manual install** in Next 16 — bundled automatically for `next start` and Vercel deploys. (In Next 14 you had to `npm install sharp`. That's obsolete advice now.) On Vercel, the image optimization endpoint handles everything. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **ESLint** | Lint, with `eslint-config-next` flat config | Next 16 ships ESLint Flat Config by default. Run via `eslint` directly (`next lint` was removed in Next 16). |
| **Prettier** | Format | Pair with `prettier-plugin-tailwindcss` for automatic class sorting — significant DX win on a Tailwind-heavy project. |
| **prettier-plugin-tailwindcss** | `^0.6.x` | Sorts Tailwind classes in canonical order | Reduces diff noise, enforces conventions. |
| **@vercel/analytics** | `^1.x` | Privacy-friendly page-view analytics | Per PROJECT.md "Vercel Analytics configured". One-line install: `<Analytics />` in root layout. |
| **@vercel/speed-insights** | `^1.x` | Core Web Vitals telemetry from real users | Per PROJECT.md "Speed Insights configurés". |
| **TypeScript** | `^5.6.x` | (Listed again as dev dep for completeness) | `strict: true`, `noUncheckedIndexedAccess: true` recommended. |
| **@types/node**, **@types/react**, **@types/react-dom** | latest | Types | Bump alongside React 19. |

---

## Installation (Greenfield, in Order)

### Step 1 — Scaffold Next.js 16

```bash
# Use the official scaffolder. --yes accepts the 2026 defaults
# (TypeScript, Tailwind v4, ESLint flat config, App Router, Turbopack, src/, alias @/*).
npx create-next-app@latest tanguy-portfolio --yes
cd tanguy-portfolio

# Verify versions
node -p "require('./package.json').dependencies.next"   # should be ^16.x
node -p "require('./package.json').dependencies.react"  # should be ^19.x
```

> `create-next-app` in 2026 ships with Tailwind v4 wired through `@tailwindcss/postcss` already, so steps 2-3 are mostly verification.

### Step 2 — Verify Tailwind v4 wiring (should already be done by scaffold)

Confirm the following files exist:

```
postcss.config.mjs           # uses @tailwindcss/postcss plugin
src/app/globals.css          # @import "tailwindcss";
```

If you scaffolded without `--yes` and skipped Tailwind, install manually:

```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest postcss
```

### Step 3 — Initialize shadcn/ui (Tailwind v4 + React 19 mode)

```bash
# Run AFTER Tailwind is verified working (shadcn detects the v4 setup).
npx shadcn@latest init
# Pick: style "new-york", base color "neutral" (will be overridden by palette CSS vars anyway),
# CSS variables: YES (required for the palette feature).
```

Then add the components PROJECT.md requires:

```bash
npx shadcn@latest add button card dialog slider switch popover tabs
```

This installs the matching Radix primitives, `cva`, `clsx`, `tailwind-merge`, `tw-animate-css`, and `lucide-react` automatically.

### Step 4 — Animation stack

```bash
npm install gsap @gsap/react lenis motion
```

> No license key needed for GSAP. All Club plugins (`gsap/SplitText`, `gsap/ScrollTrigger`, `gsap/ScrollSmoother`, `gsap/DrawSVG`, `gsap/MorphSVG`) are importable from the public package.

### Step 5 — i18n

```bash
npm install next-intl
```

Then create `messages/fr.json`, `messages/en.json`, `src/i18n/routing.ts`, `src/i18n/request.ts`, and `src/proxy.ts` (NOT `middleware.ts` — see Next 16 breaking changes). Wrap root layout with `<NextIntlClientProvider>`.

### Step 6 — Color system

```bash
npm install culori
npm install --save-dev @types/culori   # if not bundled (check culori v4 — it ships .d.ts natively)
```

Then write `lib/colors.ts` with `wcagContrast`, `generateHarmonic(mode, sourceOklch)`, `adjustForAA(text, bg)`.

### Step 7 — MDX

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter remark-gfm rehype-pretty-code
```

Update `next.config.mjs` with `createMDX({...})` wrapper, add `pageExtensions: ['ts', 'tsx', 'mdx']`, and create `mdx-components.tsx` at project root.

### Step 8 — Analytics + Insights

```bash
npm install @vercel/analytics @vercel/speed-insights
```

Add `<Analytics />` and `<SpeedInsights />` to root layout.

### Step 9 — Dev tooling

```bash
npm install --save-dev prettier prettier-plugin-tailwindcss
```

Create `.prettierrc` with `{ "plugins": ["prettier-plugin-tailwindcss"] }`.

### Total dependency count

Roughly **25 runtime + 6 dev deps**. Small, focused, no bloat.

---

## Compatibility Matrix

| Package | Constraint | Note |
|---------|-----------|------|
| `next@16` | requires `react@19` and `react-dom@19` | App Router pins React 19. Pages Router can still use 18 but irrelevant here. |
| `next@16` | requires Node `>=20.9.0` | Node 18 is dead. Vercel build uses Node 22 by default. |
| `next@16` | requires TypeScript `>=5.1.0` | Use 5.6+ for best DX. |
| `tailwindcss@4` | requires PostCSS via `@tailwindcss/postcss` | The Tailwind CLI is also available but PostCSS is the path for Next.js. |
| `tailwindcss@4` | no `tailwind.config.js` | If you have one from an older guide, delete it. Theme tokens go in `globals.css` under `@theme`. |
| `shadcn@latest` | requires Tailwind v4 OR v3 (auto-detects) | Run AFTER Tailwind is installed and `globals.css` has `@import "tailwindcss"`. |
| `motion@12` | requires React `>=18`, works with React 19 | No special config. Use `<motion.div>` inside `"use client"` components. |
| `@gsap/react@2` | requires `gsap@3` and React `>=18` | Use in `"use client"` components only. SSR-safe internally. |
| `lenis@1.3` | framework-agnostic | React wrapper at `lenis/react` is part of the same package. Must be `"use client"`. |
| `next-intl@4` | requires Next `>=13` (works with 16) | Use `proxy.ts` filename in Next 16, NOT `middleware.ts`. |
| `@next/mdx@16` | requires Next 16 (major-matched) | When you bump Next, bump `@next/mdx` to match major. |
| `culori@4` | ESM-only | Works fine in Next 16 (full ESM support). |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Next.js 16** | Next.js 15.x | Only if you have a legacy app already on 15 and the upgrade window is tight. For a greenfield project in May 2026, there is no reason to start on the previous major. |
| **Tailwind v4** | Tailwind v3 with `:root { --color-* }` + `tailwind.config.ts` mapping | Only if you need a v3-only plugin that hasn't migrated. None of the project's needs require this. v4 is materially better for the palette feature. |
| **motion** (formerly framer-motion) | `framer-motion` (legacy package) | Only inside an existing codebase mid-migration. Greenfield should use `motion`. |
| **lenis** | `react-lenis@1` standalone, or native CSS `scroll-behavior: smooth` | `react-lenis` standalone is deprecated (folded into `lenis`). Native CSS smooth-scroll is too primitive for the easing and inertia the user wants. Lenis it is. |
| **@next/mdx** | `next-mdx-remote/rsc`, **`contentlayer`**, `velite`, `content-collections`, `fumadocs-mdx` | `@next/mdx` is best when MDX files ARE the routes or imports (this project's case: each project is one MDX file). Use `next-mdx-remote/rsc` if MDX comes from a CMS or remote source (not the case here). Use `velite` or `content-collections` if you want a typed content-layer with zod validation across hundreds of files (overkill for 6-10 projects). **Never use `contentlayer` — unmaintained since 2024.** |
| **culori** | `chroma-js`, `colorjs.io`, `colord`, `tinycolor2` | `chroma-js` is great for data-viz gradients and has a built-in `chroma.contrast()`, but is larger and CommonJS-first. `colorjs.io` is the reference implementation by the CSS Color WG and the right pick for cutting-edge color science (APCA, CAM16), but heavier and slower. `colord` is the smallest (~1.7kb) but lacks OKLCh and is best for simple hex/rgb work. **For OKLCh + WCAG + interpolation in 2026, culori wins on ecosystem alignment (Tailwind v4, Radix Colors both use it).** |
| **shadcn/ui (Radix)** | Headless UI, Ark UI, **Base UI** (now a shadcn option), MUI, Mantine, Chakra | Headless UI is fine but smaller surface than Radix. Ark UI is Zag-based and modern but newer/less battle-tested. Base UI is now a shadcn primitive option, lighter than Radix, but Radix is still the safest default — pick Base only if you're knowingly opt-in. MUI/Mantine/Chakra are runtime libs with their own theming systems and would fight Tailwind. **shadcn + Radix is the consensus pick.** |
| **next-intl** | `next-i18next`, `lingui`, Next.js built-in i18n (Pages Router only) | `next-i18next` is Pages-Router-era. Built-in Next i18n was removed for App Router. Lingui is great for large teams with translators-in-the-loop and PO files, overkill for a 2-locale portfolio. **next-intl is the App Router consensus.** |
| **Vercel** | Cloudflare Pages, Netlify, self-host on a VPS | Vercel is Next.js-native (made by the same company), the free tier is generous, and zero-config for ISR/image optimization. Cloudflare Pages requires adapters and loses some Next features. Netlify works but is a step behind on Next adapters. Self-hosting is wasted complexity for a portfolio. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **`contentlayer`** | Effectively abandoned since Stackbit was acquired by Netlify. Maintainer publicly downscaled to ~1 day/month. Many users had to fork (`contentlayer2`) or migrate away. | `@next/mdx` (this project) or `velite` / `content-collections` (larger content systems) |
| **`@studio-freight/lenis`** and **`@studio-freight/react-lenis`** | Renamed when Studio Freight rebranded to Darkroom Engineering. Old packages still publish but are unmaintained. | `lenis` (vanilla) + `lenis/react` (React wrapper, bundled in same package) |
| **`framer-motion`** | Renamed to `motion` when the project became independent of Framer. Old package is in legacy maintenance, no new features. | `motion` (import from `motion/react`) |
| **`@studio-freight/hamo`** | Same rebrand fallout, retired. | Use Motion's own gesture/observer hooks or browser-native `IntersectionObserver`. |
| **`tailwindcss-animate`** | Deprecated for Tailwind v4. shadcn scaffolds with `tw-animate-css` now. | `tw-animate-css` (auto-installed by `shadcn init` on v4 projects) |
| **`tailwind.config.js` / `tailwind.config.ts`** (in a fresh v4 project) | v4 reads theme from `@theme { ... }` in CSS, not from a JS config. A v3 config file in a v4 project is dead code and will confuse the next person. | `@theme` directive in `globals.css` |
| **Manual `sharp` install** | Next 16 bundles it automatically when needed. | (nothing — let Next handle it) |
| **`next lint` script** | Removed in Next 16. `next build` also no longer runs lint. | Run `eslint` directly via `"lint": "eslint"` in package.json |
| **`middleware.ts`** (Next 16) | Renamed to `proxy.ts`. The old name still technically works in 16.x but is deprecated and runs only on Edge (Node-only for `proxy.ts`). | `proxy.ts` with `export function proxy(request) { ... }` |
| **Synchronous `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams`** | Removed entirely in Next 16. Must be `await`-ed now. | `const cookieStore = await cookies()`, `const { slug } = await params`, etc. |
| **`shadcn/ui`'s `toast` component** | Deprecated in favor of `sonner`. | `sonner` (when needed — not for this v1) |
| **`Prism.js` / `highlight.js` for MDX code blocks** | Heavier, less accurate tokenization, ships JS to client. | `rehype-pretty-code` (Shiki-based, runs at build, zero client cost, VS Code grammars) |
| **`Lottie` for the FAB icon** | Per PROJECT.md "icône palette animée" — but importing Lottie for a single icon is huge. | SVG with Motion `<motion.svg>` animation or a hand-rolled GSAP timeline (~40 LOC). |
| **A CMS (Sanity, Contentful, Strapi)** | PROJECT.md explicitly out-of-scope: "Pas besoin de CMS pour 6-10 projets". | Local MDX files in `content/projects/`. |
| **Dark/Light mode libraries (`next-themes`)** | PROJECT.md explicitly out-of-scope: replaced by the palette switcher. | The custom `ThemeProvider` (per PROJECT.md spec). |

---

## Version Pins (copy into package.json)

This is the prescriptive pin list for the initial install. Use `^` so npm can fetch patch and minor fixes during the project lifetime, but pin majors to avoid surprise upgrades.

```jsonc
{
  "dependencies": {
    "next": "^16.2.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    "tailwindcss": "^4.3.0",
    "@tailwindcss/postcss": "^4.3.0",
    "postcss": "^8.4.0",

    "gsap": "^3.13.0",
    "@gsap/react": "^2.1.2",
    "lenis": "^1.3.0",
    "motion": "^12.0.0",

    "next-intl": "^4.12.0",

    "@next/mdx": "^16.0.0",
    "@mdx-js/loader": "^3.1.0",
    "@mdx-js/react": "^3.1.0",
    "@types/mdx": "^2.0.0",
    "gray-matter": "^4.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-pretty-code": "^0.14.0",

    "culori": "^4.0.0",

    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.460.0",

    "@vercel/analytics": "^1.4.0",
    "@vercel/speed-insights": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.2.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

> Note: Radix primitives (`@radix-ui/react-dialog`, `@radix-ui/react-slider`, etc.) and `tw-animate-css` will be added to `dependencies` automatically when you run `npx shadcn@latest add ...`. Don't add them manually.

---

## Stack Patterns by Variant

**If the user later wants a blog / articles section (out-of-scope in v1 but plausible v2):**
- Keep `@next/mdx` for simple cases; if posts exceed ~30 files or require typed querying across them, migrate to `velite` or `content-collections`.

**If the user later wants user-submitted contact form (out-of-scope in v1):**
- Use Vercel's free `vercel-form` integration or a third party like Resend + a Server Action. Don't add a backend framework.

**If Lighthouse Performance drops below 90 on mobile:**
- The most likely culprit is GSAP + Lenis + Motion all running in parallel. Lazy-load GSAP plugins, gate the custom cursor and Lenis behind a `prefers-reduced-motion: no-preference` check, and split the homepage into route-level chunks via `next/dynamic` for below-the-fold sections.

**If the user wants the palette switcher to be SSR-safe (no flash):**
- Read the persisted palette from a cookie in the root layout (server component), serialize the CSS variables into a `<style>` tag in `<head>`, then hydrate the ThemeProvider with the same value. This avoids the "flash of default palette" pattern that haunts naive localStorage solutions.

---

## Sources

All sources fetched May 2026. Confidence assessments per finding.

- **Next.js 16 release blog** — https://nextjs.org/blog/next-16 — version 16.2.6 confirmed, Turbopack default, `proxy.ts` rename, async APIs, React 19.2, Node 20.9+ minimum. (HIGH)
- **Next.js installation docs** — https://nextjs.org/docs/app/getting-started/installation — last updated 2026-05-19, `create-next-app` ships TypeScript + Tailwind + ESLint + App Router + Turbopack by default. (HIGH)
- **Next.js v15→v16 upgrade guide** — https://nextjs.org/docs/app/guides/upgrading/version-16 — full breaking change list, sync API removal, middleware→proxy. (HIGH)
- **Next.js MDX guide** — https://nextjs.org/docs/app/guides/mdx — `@next/mdx` is the official recommendation, Server Component compatible, `mdx-components.tsx` required at project root. (HIGH)
- **Tailwind CSS v4 release blog** — https://tailwindcss.com/blog/tailwindcss-v4 — CSS-first config, `@theme` directive, native CSS custom properties, OKLCH-first. (HIGH)
- **Tailwind CSS Next.js install guide** — https://tailwindcss.com/docs/installation/framework-guides/nextjs — `@tailwindcss/postcss` plugin, single `@import "tailwindcss"`. (HIGH)
- **shadcn/ui Tailwind v4 docs** — https://ui.shadcn.com/docs/tailwind-v4 — full Tailwind v4 + React 19 support, `forwardRef` removed, `tw-animate-css` replaces `tailwindcss-animate`, HSL→OKLCH. (HIGH)
- **shadcn/ui vs Base UI vs Radix 2026** — https://www.pkgpulse.com/guides/shadcn-ui-vs-base-ui-vs-radix-components-2026 — Base UI now an opt-in shadcn primitive, Radix still default. (MEDIUM, verified against shadcn docs.)
- **Webflow makes GSAP 100% free** — https://webflow.com/updates/gsap-becomes-free and https://gsap.com/pricing/ — all Club plugins (SplitText, MorphSVG, ScrollSmoother) free for commercial use as of April 2025. (HIGH)
- **@gsap/react useGSAP docs** — https://gsap.com/resources/React/ and https://github.com/greensock/react — `useGSAP(fn, { scope, dependencies, revertOnUpdate })` API, `contextSafe()`, SSR-safe via `useIsomorphicLayoutEffect`. (HIGH)
- **Motion upgrade guide** — https://motion.dev/docs/react-upgrade-guide — confirmed `framer-motion` → `motion`, import from `motion/react`, Motion for React 12 has no breaking changes from late `framer-motion`. (HIGH)
- **Lenis GitHub (Darkroom Engineering)** — https://github.com/darkroomengineering/lenis — package is `lenis`, React wrapper at `lenis/react`, current v1.3.23 (April 2026). Studio Freight rebrand to Darkroom Engineering. (HIGH)
- **next-intl App Router setup** — https://next-intl.dev/docs/getting-started/app-router and https://next-intl.dev/docs/routing/middleware — v4.12, `routing.ts` + `request.ts` + `proxy.ts` (in Next 16) structure. (HIGH)
- **Contentlayer abandoned analysis** — https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives — explicit confirmation of unmaintained status, alternatives ranked. (MEDIUM, multiple corroborating sources.)
- **Culori library** — https://culorijs.org/api/ and https://www.npmjs.com/package/culori — `wcagContrast()` per WCAG 2.0, no built-in harmonic palette function (write your own via OKLCh hue rotation). (HIGH for API surface, MEDIUM for "no harmonics" — verified via API browsing.)
- **OKLCh harmonic palette generation patterns** — https://github.com/meodai/pro-color-harmonies and https://facelessuser.github.io/coloraide/harmonies/ — standard formulas: complementary +180°, triadic +120°/+240°, analogous ±30°, split-complementary +150°/+210°, tetradic +90°/+180°/+270°. (HIGH, mathematically definitional.)
- **PkgPulse culori vs chroma-js vs colorjs.io comparison** — https://www.pkgpulse.com/blog/culori-vs-chroma-js-vs-tinycolor2-color-manipulation-javascript-2026 — culori recommended for design systems / Tailwind v4 integration. (MEDIUM, single source but corroborated by Tailwind v4 internals.)

---

*Stack research for: bilingual creative personal portfolio (Next.js + GSAP + Motion + palette switcher + MDX) targeting Vercel*
*Researched: 2026-05-25*
