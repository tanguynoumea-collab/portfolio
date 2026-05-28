# Phase 6: SEO, Accessibility & Polish - Discussion Log (Auto Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 06-seo-accessibility-polish
**Mode:** `--auto` (Claude picked recommended defaults — no user interaction)
**Areas analyzed:** Metadata/OG, Sitemap/Robots, Route States & 404, A11y Audit Method, Reduced-Motion & Image Audits, Palette Stress Test, Lighthouse, Plan Structure

---

## Metadata & OG Image (A11Y-01)

### D-04 — OG image strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Single static `public/og.png` | One 1200×630 image for all pages | (fallback) |
| Dynamic `next/og` ImageResponse | Branded per-page cards (name/role/project) generated at build/request, built into Next 16 | ✓ |
| Hybrid (static default + dynamic projects) | More code paths | |

**Claude's choice (auto):** Dynamic `next/og` branded cards (Terra brand colors via oklchToHex), static `public/og.png` documented as the fallback if `next/og` proves costly under Turbopack.
**Reason:** Design portfolio — branded auto-generated share cards demonstrate "attention au détail" (core value); `next/og` is built-in (zero new deps). A11Y-01 satisfied either way.

### D-01/D-02/D-03 — metadataBase, OG/twitter blocks, hreflang

| Decision | Choice | Selected |
|----------|--------|----------|
| metadataBase | env-aware `NEXT_PUBLIC_SITE_URL` constant, placeholder domain | ✓ |
| OG/twitter | full openGraph + summary_large_image, localized, per-route | ✓ |
| hreflang | `alternates.languages` via next-intl pathname helper, as-needed-aware (fr→`/`, en→`/en`, x-default→`/`) | ✓ |

**Reason:** as-needed routing (FR canonical at `/`, EN at `/en`) requires careful alternate URLs — flagged for researcher to confirm the next-intl v4 `getPathname` helper.

---

## Sitemap & Robots (A11Y-02)

### D-05 / D-06

| Option | Description | Selected |
|--------|-------------|----------|
| Static `sitemap.ts` reading getProjectSlugs + `robots.ts` | Build-time, covers `/`, `/en`, 12 project routes, alternates; robots allow-all disallow /api/ | ✓ |
| Dynamic/ISR sitemap | Unnecessary for static content | |
| Manual XML | Brittle | |

**Claude's choice (auto):** Static `sitemap.ts` (getProjectSlugs-driven, with per-URL alternates) + `robots.ts` (allow /, disallow /api/, link sitemap).

---

## Route States & Custom 404 (A11Y-03, EGG-02)

### D-07 — 404 personality

| Option | Description | Selected |
|--------|-------------|----------|
| Palette/pixel-art themed playful | Ties to signature feature; reuses existing `errors.404` i18n ("perdu dans le pixel art") | ✓ |
| Generic friendly 404 | Bland, off-brand | |
| Terminal/ASCII themed | Overlaps ConsoleArt (EGG-01) | |

**Claude's choice (auto):** Palette-themed playful 404 reusing the pre-drafted `errors.404` keys, motion entry (reduced-motion gated), styled Link back to `/{locale}`.

### D-08 — error.tsx Reset mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Built-in `reset()` prop (client error boundary) | Canonical Next App Router pattern | ✓ |
| Server Action retry | NOT applicable — error boundaries are client-only | |

**Claude's choice (auto):** Built-in `reset()` prop. **Clarifies a REQUIREMENTS.md ambiguity** ("Reset via Server Actions" is not how App Router error boundaries work — they're `'use client'` with a `reset()` function).

### D-09 — loading.tsx

| Option | Description | Selected |
|--------|-------------|----------|
| Lightweight motion-safe spinner at locale + project route | Cheap, fast-site-appropriate, reduced-motion safe | ✓ |
| Section-shaped skeletons | Over-engineering for a fast static site | |
| No loading.tsx | Fails A11Y-03 | |

**Claude's choice (auto):** Lightweight spinner (`motion-safe:animate-pulse`) at `app/[locale]/` + project route.

---

## A11y Audit Method (A11Y-04)

### D-10 / D-11

| Option | Description | Selected |
|--------|-------------|----------|
| `vitest-axe` (jsdom, automated, in-suite) | Fits existing Vitest infra, no E2E (respects OOS), zero-violation gate | ✓ |
| Playwright + axe (E2E) | E2E explicitly OOS per PROJECT.md | |
| Manual DevTools axe only | Not automated/repeatable | |

**Claude's choice (auto):** `vitest-axe` automated on all surfaces (color-contrast rule disabled — covered by validateFullMatrix) + a manual keyboard/focus-order pass tracked as HUMAN-UAT. Plus focus-visible ring audit + accessible-name checks.

---

## Reduced-Motion & Image Audits (A11Y-05, A11Y-06)

### D-12 / D-13

| Decision | Choice | Selected |
|----------|--------|----------|
| A11Y-05 reduced-motion | Audit + `scripts/check-reduced-motion.ts` regression gate (already implemented in 15+ files) | ✓ |
| A11Y-06 images | Audit + grep gate (width/height-or-fill, lazy except above-fold) + confirm next.config formats | ✓ |

**Claude's choice (auto):** Both are audit + regression-gate plans (minimal new code — the behaviors already exist), not fresh implementation. Confirmed via scout: reduced-motion gates present everywhere; 6 next/image usages all sized.

---

## Palette Stress Test (A11Y-07)

### D-14

| Option | Description | Selected |
|--------|-------------|----------|
| Seeded Vitest test (10 random harmonic palettes) | Deterministic, reuses generateHarmonic + validateFullMatrix, in-suite | ✓ |
| Dev-only visual page | Manual, not a gate | |
| Manual only | Not repeatable | |

**Claude's choice (auto):** Seeded Vitest test asserting validateFullMatrix valid + OKLCh token validity across 10 random palettes + 4 presets. Visual "no layout break" = manual HUMAN-UAT spot-check.

---

## Lighthouse (A11Y-08)

### D-15

| Option | Description | Selected |
|--------|-------------|----------|
| Local `lighthouse` CLI vs production build (pre-deploy gate) | Catches regressions before deploy; final ≥90 on Vercel Phase 7 | ✓ |
| Defer entirely to Vercel (Phase 7) | No pre-deploy safety net | |
| Vercel Speed Insights (real-user) | Phase 7, doesn't gate Phase 6 | |

**Claude's choice (auto):** Local Lighthouse mobile vs `next build && next start`, record 4 scores, fix < 90; authoritative ≥90 on deployed URL deferred to Phase 7. Tracked as HUMAN-UAT (needs running server).

---

## Plan Structure

### D-16

| Option | Description | Selected |
|--------|-------------|----------|
| 5 plans / 3 waves (W0 deps → W1 metadata∥route-states∥stress → W2 audit∥lighthouse) | Clean dep gate, parallel-safe W1 (disjoint trees) | ✓ |
| Fewer/larger plans | Coarser test granularity | |
| Per-requirement (9 plans) | Over-granularized; A11Y-04/05/06 share audit infra | |

**Claude's choice (auto):** 5 plans across 3 waves (W0 install vitest-axe + lighthouse; W1 metadata-seo ∥ route-states ∥ palette-stress; W2 a11y-audit ∥ lighthouse).

---

## Claude's Discretion

Deferred to researcher/planner: OG card visual layout + font bundling for Satori; lighthouse vs @lhci/cli; reduced-motion gate as tsx-script vs Vitest; 404 visual richness; JSON-LD (skip v1); loading.tsx fidelity; extra i18n copy keys.

## Deferred Ideas

12 deferred ideas captured in CONTEXT.md `<deferred>` — Phase 7 ownership (live Lighthouse, analytics, real domain), v2 candidates (JSON-LD, visual-regression, PWA manifest, richer 404), and OOS confirmations (Playwright E2E, cookie banner). See CONTEXT.md for the full list.
