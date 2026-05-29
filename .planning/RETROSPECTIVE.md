# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Launch

**Shipped:** 2026-05-28 (archived 2026-05-29)
**Phases:** 7 | **Plans:** 36 | **Tasks:** 90

### What Was Built
- A bilingual (FR/EN) creative portfolio live on Vercel — Next.js 16 + React 19 + Tailwind v4.
- The signature **runtime palette switcher**: 4 presets + custom OKLCh picker + harmonic generator with live WCAG enforcement + a Konami-unlocked Vaporwave palette.
- A GSAP + Lenis single-RAF animation layer, motion page transitions, full i18n routing, MDX project pipeline, SEO/sitemap/OG, and accessibility gates (vitest-axe, reduced-motion).
- **Post-launch (outside the phase cycle):** identity refocused from a fictional Tech×Design×BIM hybrid to the real BIM profile; 6 fictional projects replaced with 5 real GitHub projects (Olympe Datamind/Hermès/MaterialManager, HRS.tab, DiskScout) with covers + galleries; "Spécialiste BIM" rename; lightbox zoom fix.

### What Worked
- **Defense-by-structure:** OKLCh-only color tokens + `@theme` indirection meant the palette switcher worked at runtime with zero rebuild; the no-`any` discriminated types caught shape errors at build time.
- **Executable gates** (i18n-parity, mdx-structure, reduced-motion, image-audit, env-leak, readme) caught real regressions repeatedly and made "done" verifiable.
- **TDD harnesses** (RED-first) and wave-based parallel execution kept phases shippable.
- **Verify-on-live discipline:** polling the deployed site (served bytes, not assumptions) caught issues that local Lighthouse and quick checks missed.

### What Was Inefficient
- The **fictional content** (identity + 6 projects) had to be **entirely redone post-launch** — significant rework that real source material from the start would have avoided.
- **Session/usage limits** during the auto-chain forced several resume-from-checkpoint recoveries.
- **Preview-browser flakiness** (scroll resets, dialog re-trigger) slowed UI verification.
- The redaction pass on client screenshots needed a **second attempt** (first box mis-sized, left "PICTET" readable) — caught only by full-resolution review.

### Patterns Established
- **Verify against the real/live environment before claiming done** (polling served content, measuring rendered DOM).
- **OKLCh-only color authoring** — no hex/rgb/hsl anywhere.
- **Gates as standalone `tsx` scripts** that exit 0/1, runnable in CI and locally.
- Private/employer assets get a **"Proprietary" indicator instead of a dead link**; client data is reviewed at full resolution before publishing.

### Key Lessons
1. **Source content from reality first.** A fictional identity/projects scaffold is expensive — it required a complete post-launch rewrite once the real CV + GitHub were available.
2. **`localePrefix: 'always'`** avoids a broken default-locale root (missing `<html lang>`/`<title>`); the route-transition template belongs at `[locale]`, never at root (a root template remounts the whole app on every navigation).
3. **Confidentiality is a hard gate:** third-party (client/employer) data must be flagged and explicitly authorized before going public — and it's near-irreversible once indexed.

### Cost Observations
- Model profile: `quality` (GSD config). Mode: `yolo` for the build phases.
- Tests at milestone close: 332 passing (52 files).
- Zero-runtime-dependency philosophy held (shadcn copy-in, no UI-lib lock-in; canvas-confetti dynamic-imported only on Konami).

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 7 | 36 | Initial build via GSD discuss→plan→execute→verify; heavy post-launch content rework |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|--------------------|
| v1.0 | 332 | — | shadcn (copy-in), no runtime UI lib |

### Top Lessons (Verified Across Milestones)

1. Verify on the live/real environment before declaring done.
2. Build from real content; fictional placeholders accrue rework debt.
