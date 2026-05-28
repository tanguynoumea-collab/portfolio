---
phase: 6
slug: seo-accessibility-polish
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-28
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `06-RESEARCH.md` §"Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 + jsdom 29 + @testing-library/react 16 (existing) |
| **Config file** | `vitest.config.ts` (Wave 0 EDIT: add `setupFiles: ['./vitest-setup.ts']` for vitest-axe matchers) |
| **Quick run command** | `npx vitest run <path>` (single file) |
| **Full suite command** | `npm test` (`vitest run`) — currently 276/276 green |
| **Standalone gates** | `tsx scripts/check-i18n-parity.ts`, `tsx scripts/check-mdx-structure.ts` (precedents); NEW: `check-reduced-motion.ts`, `check-image-audit.ts`, `stress-test-palettes.ts` |
| **New dev deps (Wave 0)** | `vitest-axe@1.0.0-pre.5` (NOT latest — stale), `lighthouse@^13.3.0` |
| **Estimated runtime** | ~30s full suite; Lighthouse run ~30-60s against local prod server |

---

## Sampling Rate

- **After every task commit:** `npx vitest run <touched test>` + relevant gate (`tsx scripts/check-*.ts`) (~2-10s)
- **After every plan wave:** `npm test` (full suite) + all `tsx scripts/check-*.ts` gates + `npm run lint`
- **Before `/gsd:verify-work`:** Full suite green + all gates exit 0 + `npm run build` succeeds + Lighthouse scores recorded (HUMAN-UAT)
- **Max feedback latency:** 30 seconds (Lighthouse is the one slow, env-sensitive check — recorded, not blocking)

---

## Per-Task Verification Map

> Task IDs provisional; wave mapping per RESEARCH (W0 infra → W1 metadata/route-states/stress → W2 audit/lighthouse).

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-00-* | 00 | 0 | A11Y-04/08 infra | install | `npm install -D vitest-axe@1.0.0-pre.5 lighthouse` + setupFiles edit + Inter font + images.formats + SITE_URL + .gitignore | ❌ W0 | ⬜ |
| 06-01-* | 01 | 1 | A11Y-01 | unit | `npx vitest run app/[locale]/layout.metadata.test.ts` (openGraph + alternates.languages + metadataBase) | ❌ W1 | ⬜ |
| 06-01-* | 01 | 1 | A11Y-01 | unit | `npx vitest run app/[locale]/projects/[slug]/metadata.test.ts` (type:article + per-project OG + hreflang) | ❌ W1 | ⬜ |
| 06-01-* | 01 | 1 | A11Y-01 | unit | hreflang map fr→`/`, en→`/en`, x-default→`/` via getPathname | ❌ W1 | ⬜ |
| 06-01-* | 01 | 1 | A11Y-01 | build/HUMAN | `npm run build` → opengraph-image routes emitted (home + 12); visit `/en/opengraph-image` | ❌ W1 | ⬜ |
| 06-01-* | 01 | 1 | A11Y-02 | unit | `npx vitest run app/sitemap.test.ts` (13 entries: 1 home + 12 projects, fr/en alternates) | ❌ W1 | ⬜ |
| 06-01-* | 01 | 1 | A11Y-02 | unit | `npx vitest run app/robots.test.ts` (disallow /api/, allow /, sitemap ref) | ❌ W1 | ⬜ |
| 06-02-* | 02 | 1 | A11Y-03 | unit | `npx vitest run app/[locale]/error.test.tsx` (errors.500 + reset() spy called on click) | ❌ W1 | ⬜ |
| 06-02-* | 02 | 1 | A11Y-03/EGG-02 | unit | `npx vitest run app/[locale]/not-found.test.tsx` (errors.404 title/message + back `<Link href="/">`) | ❌ W1 | ⬜ |
| 06-02-* | 02 | 1 | A11Y-03 | unit | `npx vitest run app/[locale]/loading.test.tsx` (role=status + motion-safe:animate-pulse) | ❌ W1 | ⬜ |
| 06-02-* | 02 | 1 | EGG-02 | unit | 404 motion entry gates on useReducedMotion (opacity-only when reduced) | ❌ W1 | ⬜ |
| 06-03-* | 03 | 1 | A11Y-07 | unit | `npx vitest run lib/colors.stress.test.ts` (10 seeded random × 4 modes → validateFullMatrix valid + OKLCh parse, no NaN) | ❌ W1 | ⬜ |
| 06-03-* | 03 | 1 | A11Y-07 | unit | 4 presets still pass 7-pair matrix (regression) | ❌ W1 | ⬜ |
| 06-04-* | 04 | 2 | A11Y-04 | unit (axe) | `npx vitest run "**/*.a11y.test.tsx"` — each surface `toHaveNoViolations` (color-contrast disabled) | ❌ W2 | ⬜ |
| 06-04-* | 04 | 2 | A11Y-04 | unit (axe) | icon-only buttons accessible names (axe button-name rule) | ❌ W2 | ⬜ |
| 06-04-* | 04 | 2 | A11Y-05 | static gate | `tsx scripts/check-reduced-motion.ts` (exit 0 — every animating file guarded) | ❌ W2 | ⬜ |
| 06-04-* | 04 | 2 | A11Y-06 | static gate | `tsx scripts/check-image-audit.ts` (exit 0 — every `<Image>` fill-or-width/height, no bare `<img>`) | ❌ W2 | ⬜ |
| 06-05-* | 05 | 2 | A11Y-08 | MANUAL/scripted | `npm run build && npm run start` + `npm run lighthouse:mobile` → record 4 scores ≥90 | ❌ W2 | ⬜ |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest-axe@1.0.0-pre.5 lighthouse` (A11Y-04, A11Y-08) — pin vitest-axe exactly (latest is stale, lacks ./matchers subpath)
- [ ] `vitest-setup.ts` + `vitest-axe.d.ts` + `vitest.config.ts` `setupFiles` edit (A11Y-04 — so Wave 2 a11y tests have the `toHaveNoViolations` matcher)
- [ ] `assets/Inter-SemiBold.ttf` (or `.otf`/`.woff`) bundled font for Satori OG (A11Y-01)
- [ ] `next.config.ts` `images.formats: ['image/avif','image/webp']` (A11Y-06)
- [ ] `lib/constants.ts` `SITE_URL` (A11Y-01 metadataBase)
- [ ] `.lighthouse/` (or report output dir) added to `.gitignore` (A11Y-08)

*Test files for metadata/sitemap/robots/error/not-found/loading/stress/a11y are authored in their Wave 1/2 plans — but the vitest-axe matcher infra + font + config MUST land in Wave 0 so Wave 2's audit plan can run.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full keyboard Tab cycle, focus order, Esc-close, live-region announce | A11Y-04 | jsdom cannot verify focus order or ARIA live-regions | Tab through homepage + open PaletteSwitcher → focus trap + Esc closes; screen-reader announces palette/WCAG changes |
| Random palette doesn't overflow/clip UI | A11Y-07 | jsdom can't measure layout | Apply 3-4 random harmonic palettes in-browser; confirm no overflow/clipping/unreadable text |
| Lighthouse mobile ≥90 (Perf/A11y/BP/SEO) | A11Y-08 | Env-sensitive; needs running server; authoritative pass on Vercel (Phase 7) | `npm run build && npm run start`; `npm run lighthouse:mobile`; record 4 scores |
| OG image visual render | A11Y-01 | Satori render only verifiable visually | Visit `/en/opengraph-image` + a project's; confirm branded card renders with Terra accent + correct text |
| 404 motion entry + visual | EGG-02 | Motion + layout are browser-only | Visit a bad URL → playful 404 animates in, back-link returns home |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (vitest-axe infra, font, config, SITE_URL)
- [ ] No watch-mode flags (use `vitest run` via `npm test`)
- [ ] Feedback latency < 30s (Lighthouse excepted — recorded, not blocking)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-28
