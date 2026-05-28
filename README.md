# Tanguy Delrieu — Portfolio

**Bilingual (FR/EN) creative portfolio. Hybrid profile: Tech × Design × BIM.**

A personal portfolio that doubles as a living demo of what I build — a complement to the PDF CV, showcasing a hybrid profile across **development**, **creative design**, and **architecture / BIM**. The site is its own proof of work: technically rigorous, design-led, and obsessive about the details.

> **Live:** https://detportfolio.vercel.app

## Signature features

- **Runtime WCAG-aware palette switcher** — 4 presets + a custom HSL color picker + a harmonic palette generator with live contrast readouts, all computed in **OKLCh** so the theme adjusts perceptually and never drops below WCAG AA (4.5:1). The whole UI re-themes live, with no rebuild and no reload.
- **Secret Vaporwave palette** — unlocked via the Konami code (↑ ↑ ↓ ↓ ← → ← → B A), with a confetti flourish.
- **Bilingual FR/EN** — fully localized `/fr` and `/en` routes (next-intl, `as-needed` prefixing), with hreflang, localized metadata, and a typed message catalog.
- **Animation stack** — GSAP (ScrollTrigger / SplitText) + Lenis smooth scroll driven by a single shared RAF + Motion micro-interactions, all gated behind `prefers-reduced-motion`.
- **MDX case studies** — each project is an MDX file with a parallax cover, syntax-highlighted code blocks, and a discriminated metadata strip per category (Tech / Design / BIM).

## Tech stack

- **Next.js 16** — App Router, React Server Components, Turbopack
- **React 19.2** + **TypeScript 5.6** (strict, no `any`)
- **Tailwind CSS v4** — CSS-variable OKLCh design tokens via `@theme` (no `tailwind.config.ts`)
- **next-intl** v4 — localized routing + typed messages
- **GSAP** + **Lenis** + **Motion** — scroll, reveal, and micro-interaction animation
- **culori** — OKLCh conversion, WCAG contrast, harmonic color math
- **@next/mdx** — project case studies as MDX
- **shadcn/ui** (Radix primitives) + **lucide-react**
- **Vercel** — hosting, Web Analytics, Speed Insights

## Local development

```bash
git clone https://github.com/tanguynoumea-collab/portfolio
cd portfolio
npm install
npm run dev
```

The dev server runs on http://localhost:3000. The root `/` redirects to the visitor's browser locale (`/fr` or `/en`).

## Scripts

| Script                          | What it does                                                       |
| ------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                   | Start the dev server (Turbopack)                                   |
| `npm run build`                 | Production build                                                   |
| `npm run lint`                  | ESLint (flat config)                                               |
| `npm test`                      | Vitest unit + a11y suite                                           |
| `npm run test:palettes`         | Validate all presets against the 7-pair WCAG matrix                |
| `npm run test:stress`           | Seeded stress test of the harmonic palette generator              |
| `npm run check:reduced-motion`  | Assert every animation is `prefers-reduced-motion` gated           |
| `npm run check:images`          | Assert every image goes through `next/image` with reserved layout  |
| `npm run check:analytics`       | Assert Analytics + Speed Insights are mounted correctly            |
| `npm run check:env-leak`        | Assert no secret-looking `NEXT_PUBLIC_*` value is committed         |
| `npm run check:readme`          | Assert this README is real + the repo URL is consistent            |
| `npm run lighthouse:mobile`     | Run a mobile Lighthouse audit against a running build              |

i18n parity and MDX structure are enforced by `npx tsx scripts/check-i18n-parity.ts` and `npx tsx scripts/check-mdx-structure.ts`. CI re-runs the full suite on every push and pull request (`.github/workflows/ci.yml`).

## Deployment

Deployed on **Vercel** with zero config (Next.js is auto-detected — no `vercel.json`). Every push to `main` triggers a production deploy. The production origin (`https://detportfolio.vercel.app`) is the default in `lib/constants.ts`, so canonical URLs, hreflang, sitemap, and OpenGraph images resolve to absolute URLs without any dashboard setup. To switch to a custom domain later, set `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard (it overrides the default).

---

Built by **Tanguy Delrieu** — Tech × Design × BIM.
