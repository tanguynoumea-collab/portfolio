---
phase: 05-project-content-pipeline
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/hooks/useParallax.ts
  - lib/hooks/useParallax.test.tsx
autonomous: true
requirements: [ANIM-02]

must_haves:
  truths:
    - "useParallax installs a ScrollTrigger scrub:0.5 animation translating [data-parallax-image] up to -maxTranslate under prefers-reduced-motion: no-preference"
    - "Under prefers-reduced-motion: reduce the hook sets the image to y:0 and installs NO ScrollTrigger"
    - "The hook never calls gsap.registerPlugin (LenisProvider owns it at module load)"
    - "Cleanup happens automatically via useGSAP({ scope }) on unmount"
  artifacts:
    - path: "lib/hooks/useParallax.ts"
      provides: "Reusable parallax hook (factor + maxTranslate + matchMedia dual-branch)"
      contains: "gsap.matchMedia"
  key_links:
    - from: "lib/hooks/useParallax.ts"
      to: "gsap.matchMedia dual-branch"
      via: "isFull installs ScrollTrigger scrub:0.5; isReduced does gsap.set y:0"
      pattern: "scrub: 0\\.5"
    - from: "lib/hooks/useParallax.ts"
      to: "useGSAP scope cleanup"
      via: "useGSAP(fn, { scope: ref, dependencies: [maxTranslate] })"
      pattern: "useGSAP"
---

<objective>
Wave 1 (parallel with 05-01) — ship the reusable `useParallax` hook required by ANIM-02.

This plan delivers `lib/hooks/useParallax.ts` (D-13): a hook wrapping `useGSAP({ scope: ref })` + `gsap.matchMedia()` dual-branch. Under full motion it installs a `ScrollTrigger.create`-backed `gsap.to('[data-parallax-image]', { y: -maxTranslate, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.5 } })`. Under reduced motion it does `gsap.set('[data-parallax-image]', { y: 0 })` and installs no ScrollTrigger. Signature: `useParallax(ref, { factor = 0.3, maxTranslate = 50 })`. Ships with a Vitest test using the MatchMediaController dual-branch pattern proven in Phase 4 About.test.tsx.

Purpose: Wave 2's `<ProjectCover>` client island calls this hook on the cover-image wrapper. Encapsulating the parallax + reduced-motion gate here is the single source of truth (potential v2 reuse). The hook inherits Phase 3's LenisProvider `gsap.ticker` bridge automatically — ScrollTrigger reads Lenis's virtualized scroll position with no scroller-proxy needed.
Output: 1 hook file + 1 test.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-project-content-pipeline/05-CONTEXT.md
@.planning/phases/05-project-content-pipeline/05-RESEARCH.md
@.planning/phases/05-project-content-pipeline/05-VALIDATION.md

<interfaces>
<!-- The hook's exact contract + the proven test pattern. Use directly. -->

Hook signature (D-13):
```typescript
import type { RefObject } from 'react';
export type UseParallaxOptions = { factor?: number; maxTranslate?: number };
export function useParallax(ref: RefObject<HTMLElement | null>, options?: UseParallaxOptions): void;
```

Imports the hook uses:
- `useGSAP` from `@gsap/react`
- `gsap` from `gsap`
- `import 'gsap/ScrollTrigger';` — SIDE-EFFECT-ONLY (type merge). Do NOT call gsap.registerPlugin — LenisProvider already registered ScrollTrigger at module load (Phase 3 D-11). Same pattern as Phase 4 About.tsx.

matchMedia dual-branch query keys (MUST match Phase 4 About.tsx so the test pattern transfers):
- `isFull: '(prefers-reduced-motion: no-preference)'`
- `isReduced: '(prefers-reduced-motion: reduce)'`

The data attribute scoped selector is `'[data-parallax-image]'` (Pitfall 5D — do NOT use a bare `'img'` tag selector; it would leak to portaled images). Phase 4 used `[data-about-photo]`/`[data-skill-badge]` for the same reason.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: useParallax hook + MatchMediaController dual-branch test</name>
  <files>lib/hooks/useParallax.ts, lib/hooks/useParallax.test.tsx</files>
  <read_first>
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #2 (verbatim useParallax.ts)
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md Pitfall 5D (data-parallax-image selector, not bare 'img')
    - components/sections/About.test.tsx (the MatchMediaController mock pattern to copy verbatim — captures the matchMedia callback for dual-branch invocation)
    - components/sections/About.tsx (the side-effect-only `import 'gsap/ScrollTrigger'` + useGSAP + matchMedia structure to mirror)
    - lib/hooks/usePrefersReducedMotion.ts (sibling hook — file/export style for the lib/hooks directory)
  </read_first>
  <behavior>
    - Test 1: the hook registers a gsap.matchMedia with both query keys isFull='(prefers-reduced-motion: no-preference)' and isReduced='(prefers-reduced-motion: reduce)'
    - Test 2: invoking the captured callback with { conditions: { isFull: true } } calls gsap.to('[data-parallax-image]', ...) with a scrollTrigger config carrying scrub: 0.5, start: 'top top', end: 'bottom top'
    - Test 3: invoking the captured callback with { conditions: { isFull: false } } calls gsap.set('[data-parallax-image]', { y: 0 }) and does NOT call gsap.to
    - Test 4: the hook never calls gsap.registerPlugin (assert the registerPlugin mock has 0 calls)
    - Test 5 (cleanup): the useGSAP callback is invoked and, on unmount, the matchMedia revert/cleanup runs (assert via the controller mock)
  </behavior>
  <action>
    Create `lib/hooks/useParallax.ts` EXACTLY as RESEARCH.md Code Example #2. Structure:
    - Imports: `useGSAP` from `@gsap/react`, `gsap` from `gsap`, `import 'gsap/ScrollTrigger';` (side-effect only — type merge), `type RefObject` from `react`.
    - Export `UseParallaxOptions = { factor?: number; maxTranslate?: number }`.
    - `export function useParallax(ref, options = {})`. Destructure `const { maxTranslate = 50 } = options;` (factor is accepted for the signature/future tuning but current impl uses maxTranslate directly — keep the param to honor D-13).
    - Body wrapped in `useGSAP(() => { ... }, { scope: ref, dependencies: [maxTranslate] })`.
    - Inside: `const mm = gsap.matchMedia(); mm.add({ isReduced: '(prefers-reduced-motion: reduce)', isFull: '(prefers-reduced-motion: no-preference)' }, (ctx) => { if (!ctx.conditions?.isFull) { gsap.set('[data-parallax-image]', { y: 0 }); return; } gsap.to('[data-parallax-image]', { y: -maxTranslate, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.5 } }); });`
    - Hook returns void. NO `any`. NO `gsap.registerPlugin` call anywhere. CRITICAL (Pitfall 5D): the selector is the string `'[data-parallax-image]'`, never a bare `'img'`.

    Create `lib/hooks/useParallax.test.tsx`. Copy the MatchMediaController mock scaffold from `components/sections/About.test.tsx` VERBATIM (the `vi.mock('@gsap/react', ...)` synchronous-callback mock, the `vi.mock('gsap', ...)` capturing `matchMedia().add` queries + callback, a `gsap.to` spy, a `gsap.set` spy, a `registerPlugin: vi.fn()`, and the `vi.mock('gsap/ScrollTrigger', ...)` stub). Then drive the hook by rendering a tiny test component that calls `useParallax(ref)` (use `renderHook` from @testing-library/react OR a wrapper component holding a ref). Assert per the 5 `<behavior>` cases. Because the About mock captures `matchMedia().add`, extend it to expose a `toSpy` (for the gsap.to calls) alongside the existing `setSpy`. Use native chai matchers (NOT jest-dom) — Phase 4 setupFiles:[] precedent. For Test 5, ensure the useGSAP mock supports returning a cleanup or invoke the matchMedia revert; if the About mock doesn't model cleanup, assert at minimum that `mm.add` registered exactly once and the callback is captured (cleanup verification may be a render+unmount with the @gsap/react mock returning the callback's revert).
  </action>
  <verify>
    <automated>npm test lib/hooks/useParallax</automated>
  </verify>
  <acceptance_criteria>
    - lib/hooks/useParallax.ts contains 'gsap.matchMedia' and 'scrub: 0.5' and '[data-parallax-image]'
    - lib/hooks/useParallax.ts contains "'(prefers-reduced-motion: no-preference)'" and "'(prefers-reduced-motion: reduce)'"
    - lib/hooks/useParallax.ts contains "import 'gsap/ScrollTrigger'"
    - lib/hooks/useParallax.ts does NOT contain 'registerPlugin'
    - lib/hooks/useParallax.ts does NOT contain a bare "gsap.to('img'" or "gsap.set('img'" (selector must be the data attribute)
    - lib/hooks/useParallax.test.tsx asserts both the isFull (ScrollTrigger installed) and isReduced (y:0, no ScrollTrigger) branches
    - `npm test lib/hooks/useParallax` exits 0
  </acceptance_criteria>
  <done>useParallax installs a scrub:0.5 ScrollTrigger on [data-parallax-image] under full motion, sets y:0 with no ScrollTrigger under reduced motion, never re-registers the plugin, cleans up via useGSAP scope; dual-branch test green.</done>
</task>

</tasks>

<verification>
- `npm test lib/hooks/useParallax` exits 0 (full-motion + reduced-motion branches + no registerPlugin)
- `npm run lint` clean (no `any`)
- Full suite (`npm test`) green with the new hook test added on top of the 222 baseline
- File overlap check: this plan touches ONLY lib/hooks/* — zero overlap with 05-01 (components/mdx/* + mdx-components.tsx), confirming Wave 1 parallel safety
</verification>

<success_criteria>
ANIM-02 (hook half) satisfied: a reusable `useParallax` hook exists that produces a subtle (factor 0.3 / max 50px) cover-image parallax via GSAP ScrollTrigger inside `useGSAP()`, fully disabled under prefers-reduced-motion, without re-registering ScrollTrigger. Wave 2's ProjectCover consumes it.
</success_criteria>

<output>
After completion, create `.planning/phases/05-project-content-pipeline/05-02-SUMMARY.md`
</output>
