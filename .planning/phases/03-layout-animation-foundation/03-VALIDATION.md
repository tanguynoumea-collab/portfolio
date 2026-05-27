---
phase: 3
slug: layout-animation-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth: 03-RESEARCH.md `## Validation Architecture` section.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 + jsdom 29.1.1 + @testing-library/react 16.3.2 + @testing-library/user-event 14.6.1 |
| **Config file** | `vitest.config.ts` (already shipped Phase 2 W0) |
| **Quick run command** | `npm test` (= `vitest run`; exit 0 = green) |
| **Full suite command** | `npm test` (single Vitest project — quick and full are identical) |
| **Estimated runtime** | ~8s for the full suite once Phase 3 tests are added (Phase 2 baseline = 94 tests in ~5s) |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (full suite — under 10s, no split needed)
- **After every plan wave:** Run `npm test && npm run lint && npm run build` (smoke gate; ensures TS strict + ESLint + Next build all pass)
- **Before `/gsd:verify-work`:** Full suite green + every manual UAT item below checked off
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-00-01 | 00 | 0 | LAYOUT-02 dep gate | shell (build smoke) | `npm install && npm run build` | n/a (package.json edit) | ⬜ pending |
| 03-01-01 | 01 | 1 | LAYOUT-02 (mount under non-reduced-motion) | unit | `npm test -- LenisProvider` | ❌ Wave 1 | ⬜ pending |
| 03-01-02 | 01 | 1 | LAYOUT-02 (skip under reduced-motion) | unit | `npm test -- LenisProvider` | ❌ Wave 1 | ⬜ pending |
| 03-01-03 | 01 | 1 | LAYOUT-02 (cleanup ticker + destroy) | unit | `npm test -- LenisProvider` | ❌ Wave 1 | ⬜ pending |
| 03-01-04 | 01 | 1 | LAYOUT-02 (ScrollTrigger.refresh @450ms after paletteId) | unit + fake timers | `npm test -- LenisProvider` | ❌ Wave 1 | ⬜ pending |
| 03-01-05 | 01 | 1 | LAYOUT-02 (anchors smooth-scroll, Sheet native scroll) | manual UAT | (browser observation) | n/a | ⬜ pending |
| 03-02-01 | 02 | 1 | LAYOUT-01 (Inter wired via next/font + Tailwind @theme) | manual UAT + smoke | `npm run build` + DevTools getComputedStyle | n/a | ⬜ pending |
| 03-02-02 | 02 | 1 | LAYOUT-01 (provider tree assembled per D-11) | manual UAT | (render any /fr/* route, verify no provider errors) | n/a | ⬜ pending |
| 03-02-03 | 02 | 1 | LAYOUT-01 (base metadata) | unit (route metadata snapshot) | `npm test -- layout.metadata` (optional) | n/a (Phase 6 owns the full audit) | ⬜ pending |
| 03-03-01 | 03 | 2 | LAYOUT-03 (Nav renders fixed-top + section links) | unit (RTL) | `npm test -- Navigation` | ❌ Wave 2 | ⬜ pending |
| 03-03-02 | 03 | 2 | LAYOUT-03 (Active section highlight via IO) | unit (IO mock) | `npm test -- useActiveSection` | ❌ Wave 2 | ⬜ pending |
| 03-03-03 | 03 | 2 | LAYOUT-03 (transparent → blur after 50px) | manual UAT | (browser scroll) | n/a | ⬜ pending |
| 03-03-04 | 03 | 2 | LAYOUT-03 (mobile hamburger via Sheet side="left") | unit (RTL) | `npm test -- Navigation` | ❌ Wave 2 | ⬜ pending |
| 03-03-05 | 03 | 2 | LAYOUT-05 (FR/EN segmented + aria-pressed) | unit (RTL) | `npm test -- LanguageSwitcher` | ❌ Wave 2 | ⬜ pending |
| 03-03-06 | 03 | 2 | LAYOUT-05 (router.replace called on inactive click) | unit (mock useRouter) | `npm test -- LanguageSwitcher` | ❌ Wave 2 | ⬜ pending |
| 03-03-07 | 03 | 2 | LAYOUT-05 (html.lang imperative update) | unit (jsdom check) | `npm test -- LanguageSwitcher` | ❌ Wave 2 | ⬜ pending |
| 03-03-08 | 03 | 2 | LAYOUT-05 (scroll position preserved) | manual UAT | (browser switch deep on page) | n/a | ⬜ pending |
| 03-04-01 | 04 | 2 | LAYOUT-04 (Footer renders year + tagline + 3 socials) | unit (RTL) | `npm test -- Footer` | ❌ Wave 2 | ⬜ pending |
| 03-04-02 | 04 | 2 | LAYOUT-04 (social links rel/noopener/target) | unit | `npm test -- Footer` | ❌ Wave 2 | ⬜ pending |
| 03-04-03 | 04 | 2 | LAYOUT-04 (footer.tagline EN parity) | unit (i18n snapshot) | `npm test -- footer.parity` OR existing Phase 1 parity script | ❌ Wave 2 (or reuse existing) | ⬜ pending |
| 03-05-01 | 05 | 3 | LAYOUT-06 (CustomCursor null when gates fail) | unit (matchMedia mock) | `npm test -- CustomCursor` | ❌ Wave 3 | ⬜ pending |
| 03-05-02 | 05 | 3 | LAYOUT-06 (NO `cursor: none` anywhere) | grep gate | `! grep -r "cursor: none" components/ app/ --include="*.tsx" --include="*.css"` | n/a — grep | ⬜ pending |
| 03-05-03 | 05 | 3 | LAYOUT-06 (follow + hover grow) | manual UAT | (desktop browser pointer:fine) | n/a | ⬜ pending |
| 03-05-04 | 05 | 3 | ANIM-01 (template renders motion.div keyed by pathname) | unit | `npm test -- template` | ❌ Wave 3 | ⬜ pending |
| 03-05-05 | 05 | 3 | ANIM-01 (reduced-motion → opacity-only ≤100ms) | unit (mock useReducedMotion) | `npm test -- template` | ❌ Wave 3 | ⬜ pending |
| 03-05-06 | 05 | 3 | ANIM-01 (page transitions ≤ 350ms total) | manual UAT | (DevTools Performance recording during /fr/projects → /fr nav) | n/a | ⬜ pending |
| 03-05-07 | 05 | 3 | EGG-01 (ConsoleArt prints once on mount) | unit (spy on console.log) | `npm test -- ConsoleArt` | ❌ Wave 3 | ⬜ pending |
| 03-05-08 | 05 | 3 | EGG-01 (FR vs EN locale variants) | unit | `npm test -- ConsoleArt` | ❌ Wave 3 | ⬜ pending |
| 03-05-09 | 05 | 3 | EGG-01 (test-env skip) | unit (implicit — tests don't print) | n/a | n/a | ⬜ pending |
| 03-05-10 | 05 | 3 | EGG-01 (GitHub link + Konami hint visible in prod build) | manual UAT | (`npm run build && npm start` → open console) | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 of Phase 3 = the dependency-install plan. Test infrastructure was set up by Phase 2 W0 — no new framework install needed.

Test files to create (each plan's executor writes these alongside the implementation file):

- [ ] `components/providers/LenisProvider.test.tsx` — LAYOUT-02 unit assertions (mock `gsap` + `lenis` modules)
- [ ] `components/layout/Navigation.test.tsx` — LAYOUT-03 RTL render + role queries + mobile hamburger
- [ ] `components/layout/LanguageSwitcher.test.tsx` — LAYOUT-05 unit assertions (mock `@/i18n/navigation`)
- [ ] `components/layout/Footer.test.tsx` — LAYOUT-04 RTL + link attributes + year rendering
- [ ] `components/layout/CustomCursor.test.tsx` — LAYOUT-06 unit assertions (mock `window.matchMedia`)
- [ ] `app/template.test.tsx` (or `app/_template.test.tsx` if needed for Next file-routing) — ANIM-01 unit assertions (mock `motion`'s `useReducedMotion`)
- [ ] `components/layout/ConsoleArt.test.tsx` — EGG-01 unit assertions (spy on console.log + locale variants)
- [ ] `lib/hooks/useActiveSection.test.ts` — IntersectionObserver mock pattern for nav active-link

*Existing infrastructure: Vitest 4.1.7 + jsdom + RTL + @/* alias — all from Phase 2 W0. No new install.*

---

## Manual-Only Verifications

These require a real browser (jsdom can't validate visual rendering, real pointer events, RAF timing, native console, or true scroll feel).

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inter renders with French diacritics (é, è, ç, à, ï) | LAYOUT-01 | jsdom doesn't load real fonts | Open `/fr`, inspect headings/body in DevTools; copy `é` from rendered text, paste into URL bar → no fallback glyph |
| Smooth scroll on `<a href="#about">` clicks | LAYOUT-02 | Lenis behavior is RAF/visual | Open `/fr`, click any nav anchor link, observe eased scroll (not instant jump) |
| Sheet content scrolls natively when content overflows | LAYOUT-02 | jsdom has no real wheel events | Open PaletteSwitcher Sheet on a small viewport, mouse-wheel inside it — page should NOT scroll, Sheet content should |
| Mobile keyboard does NOT push input behind viewport | LAYOUT-02 D-07 | Real mobile keyboard required | Open `/fr` on iOS Safari / Android Chrome with width <768px, tap a future Contact form input, verify input stays visible |
| ScrollTrigger position re-syncs after palette swap | LAYOUT-02 D-05 | Visual scroll-driven animations needed; Phase 4 ScrollTrigger consumers not yet present | (DEFERRED to Phase 4 — Phase 3 just installs the contract; manual sanity check: console.log inside the debounce, swap palette, see log fire ~450ms later) |
| Nav transparent → solid `backdrop-blur-md` after >50px scroll | LAYOUT-03 D-13 | Visual rendering | Open `/fr`, observe nav at scroll=0 (transparent), scroll down >50px, observe nav solid with blur and border-bottom |
| Active section link highlights correctly while scrolling | LAYOUT-03 D-15 | Scroll-driven, needs real sections | Phase 4 fills the sections; Phase 3 ships placeholder `<section id="…">` shells — verify IO callback fires when each placeholder enters viewport |
| Language switch preserves scroll position | LAYOUT-05 D-21 | Real router.replace + scroll | Open `/fr`, scroll deep, click "EN", verify scroll stays at saved Y after route swap |
| `document.documentElement.lang` updates after locale swap | LAYOUT-05 D-19 | next-intl might not re-render `<html>` | In DevTools: switch locale, then inspect `<html lang=>` attribute |
| Native cursor visible everywhere (no `cursor: none`) | LAYOUT-06 D-26 (CRITICAL OOS gate) | Real cursor behavior | Open `/fr` on desktop pointer:fine, verify default OS cursor stays visible; CustomCursor is a SEPARATE decorative dot |
| CustomCursor follows pointer with spring + grows on link hover | LAYOUT-06 D-26..D-30 | Real pointermove + motion spring | Open `/fr` on desktop, move pointer; hover over the nav links and PaletteFab — cursor scales up |
| CustomCursor disabled on touch / reduced-motion / forced-colors | LAYOUT-06 D-27 | OS / DevTools emulation | Toggle DevTools "prefers-reduced-motion: reduce" → CustomCursor vanishes. Emulate touch device → CustomCursor vanishes |
| Page transition fade + Y-translate ≤ 350ms | ANIM-01 D-32 | Real route navigation timing | DevTools Performance recording: navigate between routes, measure transition duration |
| Reduced-motion page transition = instant fade ≤100ms (no translate) | ANIM-01 D-32 | Real motion behavior under matchMedia | Toggle reduced-motion in DevTools, navigate routes, observe no Y-translate |
| Console ASCII art renders with accent color + GitHub link clickable + Konami hint | EGG-01 D-34..D-35 | Real `console.log('%c…')` styling | Open `/fr` in a freshly-loaded tab → DevTools Console shows colored ASCII signature + clickable `https://github.com/tanguynoumea/portfolio` link + `↑ ↑ ↓ ↓ ← → ← → B A` line |
| Console art is ONE-SHOT (doesn't reprint on every route nav) | EGG-01 D-35 | Real React re-mount under Strict Mode | Open `/fr`, observe console print once. Click nav links to other routes — no reprint. Hard refresh → print once again |
| FR console art on `/fr`, EN console art on `/en` | EGG-01 D-34 | Real locale detection in client | Hard-load `/fr` → FR ASCII. Hard-load `/en` → EN ASCII |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Manual UAT entry (per the per-task map above)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (mitigated by per-task unit tests in plans 01, 03, 04, 05)
- [ ] Wave 0 covers all MISSING test files (the 8 component test files listed above)
- [ ] No watch-mode flags (Vitest `run` mode only)
- [ ] Feedback latency < 10s (npm test full run)
- [ ] `nyquist_compliant: true` set in frontmatter (flip on phase-completion)

**Approval:** pending (will be approved after `/gsd:execute-phase 3` finishes and `/gsd:verify-work 3` passes)
