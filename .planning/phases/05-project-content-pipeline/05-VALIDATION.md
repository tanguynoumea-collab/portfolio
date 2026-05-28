---
phase: 5
slug: project-content-pipeline
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-27
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `05-RESEARCH.md` §"Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 (set up Phase 2 W0) |
| **Config file** | `vitest.config.ts` (existing) |
| **Quick run command** | `npm test {touched-test-file}` (e.g. `npm test components/mdx/Callout`) |
| **Full suite command** | `npm test` (current baseline 222/222 green) |
| **Estimated runtime** | ~30 seconds full suite; ~2-5s per touched file |

---

## Sampling Rate

- **After every task commit:** Run `npm test {touched-test-file}` (~2-5 s)
- **After every plan wave:** Run `npm test` (full suite) + `npm run lint` + `npm run build` (build verifies the dynamic-import MDX route compiles under Turbopack)
- **Before `/gsd:verify-work`:** Full suite green (224+ tests after Phase 5 adds ~15) + `npm run build` exit 0
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> Task IDs are provisional (plans not yet finalized); wave/plan mapping follows RESEARCH.md D-15 topology.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-00-* | 00 | 0 | CONTENT-01 | unit (Node) | `npx tsx scripts/check-mdx-structure.ts` (4 H2 sections per locale + 250-400 word count) | ❌ W0 | ⬜ pending |
| 05-00-* | 00 | 0 | CONTENT-01 | unit (Node) | `npx tsx scripts/check-i18n-parity.ts` (projects.detail.* parity) | ✅ (Phase 4) | ⬜ pending |
| 05-00-* | 00 | 0 | D-14 | unit | `npm test lib/projects` (gallery?: string[] backward-compat) | ❌ W0 | ⬜ pending |
| 05-01-* | 01 | 1 | CONTENT-03 | unit | `npm test components/mdx/Image` (Dialog opens w/ data-lenis-prevent on DialogContent) | ❌ W1 | ⬜ pending |
| 05-01-* | 01 | 1 | CONTENT-03 | unit | `npm test components/mdx/CodeBlock` (extracts data-language → badge; clipboard write; Copy↔Check 1.5s revert) | ❌ W1 | ⬜ pending |
| 05-01-* | 01 | 1 | CONTENT-03 | unit | `npm test components/mdx/Callout` (3 variants → Info/AlertTriangle/StickyNote; palette-aliased classes, no hex/rgb) | ❌ W1 | ⬜ pending |
| 05-01-* | 01 | 1 | CONTENT-03 | unit | `npm test mdx-components` (wires pre/Image/Callout/a; external a → target=_blank rel; internal a → next-intl Link) | ❌ W1 | ⬜ pending |
| 05-02-* | 02 | 1 | ANIM-02 | unit | `npm test lib/hooks/useParallax` (full motion installs ScrollTrigger scrub:0.5; reduced motion skips + gsap.set y:0; cleanup on unmount) | ❌ W1 | ⬜ pending |
| 05-03-* | 03 | 2 | CONTENT-02 | unit | `npm test app/[locale]/projects/[slug]/page` (generateStaticParams returns 12; notFound on invalid slug; gallery render gating; metadata strip discriminator; prev/next wrap) | ❌ W2 | ⬜ pending |
| 05-03-* | 03 | 2 | CONTENT-02 | smoke | `npm run build && ls .next/server/app/{fr,en}/projects/*/*.html \| wc -l` → 12 | manual/CI | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/check-mdx-structure.ts` — NEW script: asserts each `content/projects/*.mdx` body has 4 H2 sections per locale (Contexte/Défi/Processus/Résultat | Context/Challenge/Process/Outcome) + word count in 250-400 range (covers CONTENT-01)
- [ ] `lib/projects.test.ts` extension — NEW test cases for optional `gallery?: string[]` field (covers D-14 backward-compat — existing 12 stubs validate unchanged)
- [ ] `components/mdx/{Image,CodeBlock,Callout}.test.tsx` — Wave 1 ships alongside components (TDD per Phase 4 pattern)
- [ ] `lib/hooks/useParallax.test.tsx` — Wave 1 ships alongside the hook (MatchMediaController dual-branch — proven in `components/sections/About.test.tsx`)
- [ ] `mdx-components.test.tsx` — Wave 1 ships alongside the registry extension
- [ ] `app/[locale]/projects/[slug]/page.test.tsx` — Wave 2 ships alongside the page

*Vitest framework already in place since Phase 2 W0 — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `<Image>` Dialog Esc / backdrop close | CONTENT-03 | Radix focus-trap + keyboard close behavior is browser-only (jsdom can't fully simulate) | During execute-phase, visit `/fr/projects/agora`, click a gallery image → Dialog opens; press Esc and click backdrop → both close |
| Cover parallax visually translates on scroll under full motion | ANIM-02 | Scroll-driven GSAP ScrollTrigger scrub needs a real viewport + Lenis | Visit `/fr/projects/agora` with normal motion preference; scroll down; cover image translates ≤50px slower than page. Then enable `prefers-reduced-motion` → no translate |
| Production build emits 12 static project pages | CONTENT-02 | Build artifact inspection (not a unit test) | `npm run build` then count `.next/server/app/{fr,en}/projects/*/*.html` = 12 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (check-mdx-structure.ts, gallery test)
- [ ] No watch-mode flags (use `vitest run` semantics via `npm test`)
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-27
