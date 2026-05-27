---
phase: 04-homepage-sections
plan: 04
subsystem: ui
tags: [skills, gsap, scrolltrigger, motion, next-intl, shadcn, badge, react-19]

# Dependency graph
requires:
  - phase: 04-homepage-sections
    provides: |
      Wave 0 (04-00-assets-and-stubs) shipped:
       - shadcn Badge with category-{tech,design,bim} CVA variants
       - 3 fixed --color-category-* OKLCh tokens in app/globals.css (palette-independent per D-13)
       - i18n skills.groups restructure from string to {label, items[]} in fr.json + en.json (72-leaf parity)
       - components/sections/Skills.test.tsx RED harness (dynamic import → unresolved)
       - app/[locale]/page.tsx wiring <Skills /> inside <section id="skills">
  - phase: 03-layout-animation-foundation
    provides: |
      LenisProvider already registered ScrollTrigger globally + gsap.ticker
      bridge; useGSAP({ scope }) cleanup contract; usePrefersReducedMotion
      via useSyncExternalStore. No extra wiring needed here.
provides:
  - "components/sections/Skills.tsx: 'use client' component, named export Skills"
  - "3 GROUPS iteration (tech/design/bim) via const ReadonlyArray + GROUPS.map"
  - "variantFor() narrowing helper mapping GroupKey → CVA variant union"
  - "useGSAP({ scope: skillsRef }) + gsap.matchMedia full/reduced gates"
  - "ScrollTrigger timeline (start: 'top 75%', toggleActions: 'play none none reverse') with per-group .from() at idx*0.15 + intra-stagger 0.05s"
  - "Reduced-motion path: gsap.set('[data-skill-badge]') snaps to final state"
  - "next-intl t.raw('groups.{key}.items') array escape hatch with TS narrowing (RESEARCH Pitfall 4-J)"
  - "8 GREEN Vitest assertions across content / Badge variants / animation gating"
affects:
  - Phase 6 (a11y audit — Skills h2/h3 hierarchy, badge contrast against fixed tokens)
  - Phase 6 (perf audit — ScrollTrigger registration count when all 5 sections animate)
  - Phase 7 (final review — user-editable skill list lives in messages JSON, not hardcoded)

# Tech tracking
tech-stack:
  added: []  # No new dependencies. Reused gsap@3.15.0, @gsap/react@2.1.2, next-intl@4.12, shadcn Badge, all from prior phases.
  patterns:
    - "GroupKey-typed iteration: const GROUPS: ReadonlyArray<GroupKey> with narrowed CVA mapper variantFor() — avoids any/string-cast at variant prop site"
    - "t.raw with Array.isArray guard + (raw as unknown as string[]) — TS strict + runtime safety; the documented next-intl escape hatch"
    - "matchMedia conditions destructured via ctx.conditions?.isFull — branches inside single mm.add() callback (same pattern as About planned to use)"
    - "Per-group sub-timeline via tl.from(selector, vars, position) with position=idx*0.15 — cleaner than nested tl.add() of separate sub-timelines for 3 groups"
    - "data-skill-badge + data-group hosted on outer <span>, Badge as styled child — GSAP targets the wrapper span (stable selector) while CVA variant lives on the Badge"

key-files:
  created:
    - "components/sections/Skills.tsx (Skills component, 122 LOC, 'use client')"
  modified:
    - "components/sections/Skills.test.tsx (Wave 0 placeholder → 8 GREEN assertions across 3 describe blocks)"

key-decisions:
  - "Wrapper <span data-skill-badge data-group> hosts data attrs; Badge is unchanged child — keeps Wave 0 shadcn Badge API untouched"
  - "matchMedia conditions checked via ctx.conditions?.isFull (boolean narrowed) rather than isReduced — guards against SSR ctx with no conditions"
  - "Per-group .from() with explicit position=idx*0.15 + intra-stagger 0.05 (single timeline, 3 .from() calls) instead of 3 separate timelines — simpler ScrollTrigger lifecycle, same visual result"
  - "Test mocks use Vitest 4 native chai matchers (.textContent / .getAttribute / .toBe) — NOT jest-dom, matching Phase 3 deviation precedent (vitest.config.ts has setupFiles: [])"
  - "Typed vi.fn<sig>() generics on gsapSet / gsapTimeline / gsapTimelineFrom — required by tsc --noEmit because the default vi.fn() infers Procedure|Constructable and rejects positional args"

patterns-established:
  - "Pattern S1 (Skills): GroupKey type union → ReadonlyArray<GroupKey> const → GROUPS.map iteration → variantFor(group) narrowing — reusable for any 'N domains × badges' surface (e.g., Phase 5 might add this for project-detail tag chips)"
  - "Pattern S2 (Skills): Outer <span data-skill-badge data-group> wraps each Badge — GSAP selector decoupled from Badge implementation; if Badge internals change, animation contract stays"
  - "Pattern S3 (TDD GSAP mock): matchMediaConditions module-level state + beforeEach reset — lets a single mock simulate both reduced/full branches across separate it() blocks"

requirements-completed: [HOME-06]

# Metrics
duration: 4m
completed: 2026-05-27
---

# Phase 4 Plan 04: Skills Summary

**Skills section: 3 domain-coded badge groups (Tech/Design/BIM) with GSAP ScrollTrigger stagger cascade and reduced-motion gate, sourcing skill arrays from next-intl t.raw().**

## Performance

- **Duration:** 3m 33s
- **Started:** 2026-05-27T18:49:14Z
- **Completed:** 2026-05-27T18:52:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `components/sections/Skills.tsx` shipped as `'use client'` named export `Skills` — composes 3 GROUPS iteration with shadcn `<Badge>` variants `category-{tech,design,bim}` from Wave 0
- ScrollTrigger timeline configured per D-18: `start: 'top 75%'`, `toggleActions: 'play none none reverse'`, per-group `.from({opacity:0, y:16, scale:0.9, duration:0.4, stagger:0.05})` at cascade position `idx * 0.15`
- Reduced-motion branch via `gsap.matchMedia()` calls `gsap.set('[data-skill-badge]', {opacity:1, y:0, scale:1})` — no animation, snap-to-final
- next-intl array escape: `t.raw('groups.{key}.items')` reads with `Array.isArray` guard, returns typed `string[]`
- Skills.test.tsx expanded from 1 placeholder to **8 GREEN assertions** across 3 describe blocks: content (title + 3 sub-headings + per-group items), Badge variants (3 category-* mappings asserted via mock data-variant passthrough), GSAP gating (full-motion creates timeline + 3 .from() calls; reduced-motion calls gsap.set and skips timeline)

## Task Commits

Each task was committed atomically with `--no-verify` (parallel-wave protocol):

1. **Task 1: Implement Skills component (TDD GREEN)** - `fb77fa0` (feat)
2. **Task 2: Expand Skills.test.tsx with full HOME-06 acceptance** - `69dd0d5` (test)

**Plan metadata:** [appended after SUMMARY commit]

_Note: Task 1 is TDD-paired with the Wave 0 RED harness — the placeholder `expect(true).toBe(true)` was the RED (import fails). Task 1 made the import resolve (initial GREEN), then Task 2 swapped in real assertions._

## Files Created/Modified

- `components/sections/Skills.tsx` — Skills section component, 122 LOC, 'use client', 3 group iteration with ScrollTrigger stagger + reduced-motion gate
- `components/sections/Skills.test.tsx` — Test suite, 169 insertions / 18 deletions vs Wave 0 harness; 8 GREEN Vitest cases

## Decisions Made

- **Wrapper-span data attribute hosting (rather than spreading data-* onto Badge):** keeps the Wave 0 Badge API untouched and decouples the GSAP animation contract from shadcn Badge internals. If a future shadcn upgrade changes the Badge data-slot, our `[data-skill-badge]` selector stays stable.
- **Per-group .from() in single timeline (vs nested sub-timelines):** D-18 specifies "0.05s intra-group + 0.15s group cascade". Implementing as three `.from()` calls on the same timeline with explicit `position=idx*0.15` is equivalent visually but simpler to reason about — single ScrollTrigger lifecycle.
- **`ctx.conditions?.isFull` branch (not `isReduced`):** GSAP's matchMedia callback receives a `ctx` with `conditions` keyed by the query names. Checking the positive `isFull` boolean (with optional chaining) guards both reduced-motion and the SSR/no-conditions case in one expression.
- **Native chai matchers (`.textContent`/`.getAttribute`/`.toBe`) over jest-dom:** project STATE.md records Phase 3 already chose this path. `vitest.config.ts` has `setupFiles: []` — adding `@testing-library/jest-dom` setup is out of scope for a single-plan executor in parallel mode.
- **Typed `vi.fn<sig>()` generics on the gsap spies:** without the generic, Vitest 4 infers `Mock<Procedure | Constructable>` whose call signature has zero parameters, so `gsapTimeline(cfg)` triggers `TS2554: Expected 0 arguments, but got 1`. Explicit generic shape resolves it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test bug] Wave 0 Badge mock returned raw object instead of JSX element**

- **Found during:** Task 2 (test expansion exercising real render)
- **Issue:** The Wave 0 RED harness mock at `components/sections/Skills.test.tsx:36-41` returned `{ type: 'span', props: {...} }` cast as `React.ReactElement`. React 19's reconciler rejects this with `"Objects are not valid as a React child (found: object with keys {type, props})"` because `React.createElement` is what creates the canonical element shape — a literal object cast bypasses that.
- **Fix:** Rewrote the mock to return real JSX: `<span data-slot="badge" data-variant={variant}>{children}</span>`. Preserves the original intent (data-variant passthrough for assertion) using a valid React element.
- **Files modified:** `components/sections/Skills.test.tsx`
- **Verification:** All 8 tests GREEN; `npx vitest run components/sections/Skills.test.tsx` exits 0.
- **Committed in:** `69dd0d5` (Task 2 commit)

**2. [Rule 1 - Test bug] jest-dom matchers (`toHaveAttribute` / `toHaveTextContent`) not registered**

- **Found during:** Task 2 (first test run after fixing the Badge mock)
- **Issue:** First attempt used `.toHaveAttribute()` and `.toHaveTextContent()` from `@testing-library/jest-dom`, but `vitest.config.ts` has `setupFiles: []` — jest-dom is installed (`package.json` shows `@testing-library/jest-dom@^6.9.1`) but its `expect.extend()` setup never runs. Vitest 4's chai backend throws `"Invalid Chai property: toHaveAttribute"`.
- **Fix:** Replaced jest-dom matchers with native chai assertions: `.textContent === 'x'` and `.getAttribute('data-variant') === 'category-tech'`. Matches Phase 3's documented precedent ("jest-dom matcher swap" decision logged in STATE.md `[Phase 03-layout-animation-foundation]`).
- **Files modified:** `components/sections/Skills.test.tsx`
- **Verification:** 8 GREEN; no Invalid Chai property errors.
- **Committed in:** `69dd0d5` (Task 2 commit)

**3. [Rule 1 - TypeScript] `vi.fn()` default generic rejects positional args under tsc --noEmit**

- **Found during:** Task 2 (`tsc --noEmit` after vitest GREEN)
- **Issue:** `const gsapTimeline = vi.fn(() => ({ from: gsapTimelineFrom }));` was inferred as `Mock<Procedure | Constructable>` whose call signature accepts zero args. Inside the gsap mock factory I needed to call `gsapTimeline(cfg)` to record the scrollTrigger config — TS error `TS2554: Expected 0 arguments, but got 1`. Plus the destructuring `gsapTimeline.mock.calls[0]?.[0]` failed because the tuple `[]` has no index 0 with the inferred signature.
- **Fix:** Added explicit `vi.fn<(cfg: unknown) => void>()` generics to all three spies. Now `.mock.calls[0]` is `[unknown]` and `gsapTimeline(cfg)` typechecks.
- **Files modified:** `components/sections/Skills.test.tsx`
- **Verification:** `npx tsc --noEmit | grep Skills.test.tsx` returns nothing. (Pre-existing `About.test.tsx`, `CategoryFilter.test.tsx`, `ProjectCard.test.tsx`, `ProjectGrid.test.tsx`, `ProjectsSection.test.tsx`, and `app/[locale]/page.tsx` errors are OUT OF SCOPE — owned by parallel waves 04-01/02/05.)
- **Committed in:** `69dd0d5` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3× Rule 1 test/TS bugs originating from the Wave 0 placeholder harness shape)
**Impact on plan:** All three deviations were dormant defects in the Wave 0 harness that only surfaced when actual assertions were added in Task 2. Fixed inline; no scope expansion, no architectural change. The plan's substantive deliverables (Skills.tsx contract, ScrollTrigger config, matchMedia gating, badge variant mapping) shipped unchanged.

## Issues Encountered

None beyond the 3 documented deviations. Pre-existing tsc errors in 6 sibling files (About / CategoryFilter / ProjectCard / ProjectGrid / ProjectsSection / page.tsx) are explicit parallel-wave scope and remain owned by 04-01/04-02/04-03/04-05 — confirmed they're failing the same way pre-Plan and not caused by Plan 04 changes.

## User Setup Required

None — no external service configuration. Skill arrays are user-editable in `messages/fr.json` + `messages/en.json` under `skills.groups.{tech,design,bim}.items` (D-19 specifies these are placeholder defaults the user swaps pre-deploy).

## Next Phase Readiness

- HOME-06 complete: `<Skills />` mounts inside `<section id="skills">` (page.tsx wiring from Wave 0); animation, content, variants, reduced-motion gating all verified.
- Ready for Phase 4 sibling waves to finish (04-01 Hero / 04-02 About / 04-03 Projects / 04-05 Contact); once all 5 sections ship, page.tsx import errors resolve and Phase 4 build goes GREEN end-to-end.
- Phase 6 a11y audit will need to verify Skills h2/h3 reading order and badge color contrast against the 3 fixed category tokens (already validated in lib/palettes.ts via Wave 0 token addition).

---

## Self-Check: PASSED

- FOUND: components/sections/Skills.tsx
- FOUND: components/sections/Skills.test.tsx
- FOUND: fb77fa0 (Task 1 commit)
- FOUND: 69dd0d5 (Task 2 commit)
- All success-criteria grep gates passed:
  - `head -1 Skills.tsx` = `'use client';`
  - useGSAP|ScrollTrigger|matchMedia: 6 hits (≥ 3 required)
  - Badge: 3 hits (≥ 1 required)
  - category-tech|category-design|category-bim: 4 hits (≥ 3 required)
  - oklch/hex/rgb/hsl color literals: 0 matches
- `npm run lint` exit 0
- `npx vitest run components/sections/Skills.test.tsx` 8/8 GREEN
- `npx tsc --noEmit | grep Skills.tsx` returns nothing (TS clean for plan scope)

---

*Phase: 04-homepage-sections*
*Completed: 2026-05-27*
