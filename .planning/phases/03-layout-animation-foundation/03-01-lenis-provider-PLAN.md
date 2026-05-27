---
phase: 03-layout-animation-foundation
plan: 01
type: execute
wave: 1
depends_on: ["03-00"]
files_modified:
  - components/providers/LenisProvider.tsx
  - components/providers/LenisProvider.test.tsx
autonomous: true
requirements: [LAYOUT-02]
must_haves:
  truths:
    - "LenisProvider mounts and instantiates a single Lenis instance when prefers-reduced-motion is OFF"
    - "LenisProvider returns children only (no Lenis instance) when prefers-reduced-motion is ON"
    - "LenisProvider bridges Lenis.raf to gsap.ticker via gsap.ticker.add (single RAF loop, NOT double)"
    - "LenisProvider registers ScrollTrigger plugin once at module load via gsap.registerPlugin(ScrollTrigger)"
    - "LenisProvider unmount cleanly removes the ticker callback AND destroys the Lenis instance"
    - "LenisProvider schedules ScrollTrigger.refresh() ~450ms after every paletteId change"
    - "LenisProvider pauses Lenis on input focus and resumes on blur when viewport ≤768px wide"
    - "LenisProvider exposes Lenis instance via useLenis() hook (returns null until effect has run)"
    - "useLenis() returns null when prefers-reduced-motion is reduce OR before the effect has run; consumers must null-check before calling instance methods."
    - "Vitest suite covers all four behaviors (mount, skip, cleanup, palette-refresh) and exits 0"
  artifacts:
    - path: "components/providers/LenisProvider.tsx"
      provides: "Single-RAF Lenis+GSAP bridge with palette swap refresh"
      contains: "autoRaf: false"
    - path: "components/providers/LenisProvider.tsx"
      provides: "ticker bridge"
      contains: "gsap.ticker.add"
    - path: "components/providers/LenisProvider.tsx"
      provides: "ScrollTrigger registration"
      contains: "gsap.registerPlugin"
    - path: "components/providers/LenisProvider.test.tsx"
      provides: "Mount/skip/cleanup/refresh assertions"
      contains: "describe"
  key_links:
    - from: "components/providers/LenisProvider.tsx"
      to: "components/providers/ThemeProvider.tsx"
      via: "usePalette() subscription to paletteId"
      pattern: "usePalette"
    - from: "components/providers/LenisProvider.tsx"
      to: "lib/hooks/usePrefersReducedMotion.ts"
      via: "reduced-motion gate"
      pattern: "usePrefersReducedMotion"
    - from: "components/providers/LenisProvider.tsx"
      to: "gsap"
      via: "ticker.add + ScrollTrigger registration"
      pattern: "gsap.ticker"
---

<objective>
Ship the keystone Phase 3 deliverable: a single LenisProvider client component that owns the single-RAF Lenis+GSAP integration, registers ScrollTrigger ONCE, debounces ScrollTrigger.refresh() after palette swaps, skips entirely under prefers-reduced-motion, pauses Lenis on mobile input focus, and exposes the live instance via a tiny React context. Every Phase 4 ScrollTrigger animation + every nav anchor smooth-scroll inherits its scheduling guarantees from this provider.

This addresses LAYOUT-02 and locks the contract Phase 4 Hero (HOME-01) + Phase 5 parallax (ANIM-02) will consume. Per CONTEXT.md D-02, this uses the **vanilla Lenis class** with **manual gsap.ticker bridge** — NOT the `lenis/react` ReactLenis wrapper (per RESEARCH.md §1 trade-off analysis).

Output: 1 new provider file + 1 Vitest spec file with mount/skip/cleanup/palette-refresh assertions. No edits to layout.tsx in this plan (Plan 02 wires the provider into the tree).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-layout-animation-foundation/03-CONTEXT.md
@.planning/phases/03-layout-animation-foundation/03-RESEARCH.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md
@CLAUDE.md
@components/providers/ThemeProvider.tsx
@lib/hooks/usePrefersReducedMotion.ts
@app/globals.css

<interfaces>
<!-- Types and exports the executor MUST use directly. Source: existing codebase. -->

From components/providers/ThemeProvider.tsx (Phase 2):
```typescript
// Public context API exposed via usePalette() — LenisProvider subscribes to paletteId
export function usePalette(): {
  palette: Omit<Palette, 'id' | 'name'>;
  paletteId: 'terra' | 'nordic' | 'bauhaus' | 'ocean' | 'vaporwave' | 'custom';
  isCustom: boolean;
  customSource: 'picker' | 'harmonic' | null;
  isVaporwaveUnlocked: boolean;
  wasAdjustedForAA: boolean;
  vaporwaveUnlockNonce: number;
  setPreset: (id: PaletteId) => void;
  setCustomColor: (...) => void;
  setHarmonic: (mode: HarmonicMode, src: string) => void;
  unlockVaporwave: () => void;
};
```

From lib/hooks/usePrefersReducedMotion.ts (Phase 2):
```typescript
// Boolean, SSR-safe (returns false server-side), live-updates on matchMedia change
export function usePrefersReducedMotion(): boolean;
```

From lenis@^1.3 (npm):
```typescript
// Vanilla class — instantiation triggers window.scroll listener registration
export default class Lenis {
  constructor(options?: {
    lerp?: number;          // 0..1 — smoothness (default 0.1)
    autoRaf?: boolean;      // FALSE per D-02 — gsap.ticker drives RAF instead
    anchors?: boolean;      // TRUE per D-03 — smooth-scroll <a href="#section">
    prevent?: (node: Node) => boolean; // per D-04 — return true to opt OUT of Lenis virtualization
  });
  raf(time: number): void;  // call from external RAF; time is milliseconds
  on(event: 'scroll', cb: (...) => void): void;
  stop(): void;             // pause Lenis (D-07)
  start(): void;            // resume Lenis (D-07)
  scrollTo(target: number | string, opts?: { immediate?: boolean }): void;
  destroy(): void;
  scroll: number;           // current scroll position in px
  actualScroll: number;     // raw position (un-eased)
}
```

From gsap@^3.13 + gsap/ScrollTrigger (npm):
```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);             // call ONCE at module load
gsap.ticker.add((time: number) => void);        // time in SECONDS (multiply by 1000 for Lenis.raf)
gsap.ticker.remove(callback);
gsap.ticker.lagSmoothing(0);                    // disable lag smoothing for predictable scroll

ScrollTrigger.update;                           // callback signature: (self?: ScrollTrigger) => void
ScrollTrigger.refresh(safe?: boolean): void;    // recompute positions
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement components/providers/LenisProvider.tsx (vanilla Lenis + gsap.ticker single-RAF bridge + reduced-motion skip + palette-refresh + mobile input pause + thin context)</name>
  <files>components/providers/LenisProvider.tsx</files>
  <read_first>
    - components/providers/ThemeProvider.tsx (the EXACT shape of usePalette() — confirm `paletteId` field name)
    - lib/hooks/usePrefersReducedMotion.ts (returns boolean, uses useSyncExternalStore)
    - app/globals.css lines 164-193 (400ms global color transition — drives the 450ms debounce)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"LenisProvider" (D-02 through D-07)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §1 "Lenis 1.3.x + GSAP 3.13.x Integration" (full reference impl)
    - .planning/research/PITFALLS.md §"Pitfall 4" (Lenis modal + anchor + ScrollTrigger sync) and §"Pitfall 5" (GSAP re-runs / refresh missed after palette swap)
  </read_first>
  <behavior>
    Test 1 (mount when motion allowed): When usePrefersReducedMotion returns false on mount, LenisProvider instantiates a new Lenis with `{ lerp: 0.1, autoRaf: false, anchors: true, prevent: <fn> }` and calls `gsap.ticker.add` exactly once.

    Test 2 (skip under reduced-motion): When usePrefersReducedMotion returns true on mount, the Lenis constructor is NOT called and gsap.ticker.add is NOT called.

    Test 3 (cleanup on unmount): When the component unmounts (motion allowed), `gsap.ticker.remove` is called with the same callback that was added AND `lenis.destroy()` is called.

    Test 4 (palette-swap debounced refresh): When the `paletteId` prop returned by usePalette changes (mock the hook), `ScrollTrigger.refresh` is called ~450ms later via setTimeout-inside-rAF. Use Vitest fake timers (`vi.useFakeTimers()`) + `vi.advanceTimersByTime(500)` to assert.
  </behavior>
  <action>
    Create `components/providers/LenisProvider.tsx` as a Client Component implementing the canonical single-RAF pattern. Required structure (do NOT deviate — every literal is locked by CONTEXT.md):

    ```typescript
    'use client';

    import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
    import Lenis from 'lenis';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { usePalette } from '@/components/providers/ThemeProvider';
    import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

    // MODULE-LEVEL registration. Idempotent — gsap.registerPlugin is a no-op
    // on repeat calls with the same plugin. Runs once per app cold start.
    gsap.registerPlugin(ScrollTrigger);

    // Thin context so LanguageSwitcher (D-21) can call lenis.scrollTo for
    // scroll-position preservation. null when reduced-motion or pre-effect.
    const LenisContext = createContext<Lenis | null>(null);
    export function useLenis(): Lenis | null {
      return useContext(LenisContext);
    }

    export function LenisProvider({ children }: { children: ReactNode }) {
      const lenisRef = useRef<Lenis | null>(null);
      const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
      const { paletteId } = usePalette();
      const reducedMotion = usePrefersReducedMotion();

      // Lifecycle: instantiate once when motion is allowed; destroy on unmount.
      useEffect(() => {
        if (reducedMotion) return; // D-06: skip Lenis entirely.

        const lenis = new Lenis({
          lerp: 0.1,
          autoRaf: false,                                                    // D-02
          anchors: true,                                                     // D-03
          prevent: (node: Node) => node instanceof Element && node.hasAttribute('data-lenis-prevent'), // D-04
        });
        lenisRef.current = lenis;
        setLenisInstance(lenis);

        const update = (time: number) => lenis.raf(time * 1000);             // gsap time is seconds; Lenis wants ms
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);                                          // D-02 / RESEARCH §1

        lenis.on('scroll', ScrollTrigger.update);                             // sync ScrollTrigger positions
        ScrollTrigger.refresh();                                              // initial sync

        return () => {
          gsap.ticker.remove(update);
          lenis.destroy();
          lenisRef.current = null;
          setLenisInstance(null);
        };
      }, [reducedMotion]);

      // D-05: ScrollTrigger.refresh ~450ms after every palette swap (400ms transition + 50ms buffer).
      useEffect(() => {
        if (reducedMotion) return;
        const rafId = window.requestAnimationFrame(() => {
          const timerId = window.setTimeout(() => ScrollTrigger.refresh(), 450);
          // store timerId on a closure-captured local so cleanup can cancel
          (window as unknown as { __lenisRefreshTimer?: number }).__lenisRefreshTimer = timerId;
        });
        return () => {
          window.cancelAnimationFrame(rafId);
          const tid = (window as unknown as { __lenisRefreshTimer?: number }).__lenisRefreshTimer;
          if (typeof tid === 'number') window.clearTimeout(tid);
        };
      }, [paletteId, reducedMotion]);

      // D-07: mobile input-focus pause.
      useEffect(() => {
        if (reducedMotion) return;
        const lenis = lenisRef.current;
        if (!lenis) return;
        const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
        const isInput = (el: EventTarget | null): el is HTMLElement => {
          if (!(el instanceof HTMLElement)) return false;
          return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
        };
        const onFocus = (e: FocusEvent) => {
          if (isMobile() && isInput(e.target)) lenis.stop();
        };
        const onBlur = (e: FocusEvent) => {
          if (isInput(e.target)) lenis.start();
        };
        document.addEventListener('focusin', onFocus);
        document.addEventListener('focusout', onBlur);
        return () => {
          document.removeEventListener('focusin', onFocus);
          document.removeEventListener('focusout', onBlur);
        };
      }, [reducedMotion, lenisInstance]);

      // Font-loaded re-refresh — Inter swap-in may change body height once.
      useEffect(() => {
        if (reducedMotion || typeof document === 'undefined') return;
        let cancelled = false;
        document.fonts?.ready?.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
        return () => {
          cancelled = true;
        };
      }, [reducedMotion]);

      return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
    }
    ```

    Constraints:
    - First line MUST be `'use client';` (Lenis instantiation touches window).
    - DO NOT use `lenis/react`'s `ReactLenis` wrapper — vanilla class only per D-02 (RESEARCH §1 trade-off table).
    - DO NOT use `setState` inside the pointer/scroll callbacks (those are MotionValue territory in CustomCursor — irrelevant here).
    - `useGSAP()` from `@gsap/react` is NOT used here (LenisProvider doesn't run a GSAP animation — it sets up the ticker). Phase 4 components MUST use `useGSAP({ scope: ref })`. Document this contract via a header comment at the top of the file.
    - The `paletteId` field comes from `usePalette()` — DO NOT subscribe to the whole palette object (every color change would fire refresh; only id changes should).
    - DO NOT add any color literals (hex/rgb/hsl/oklch) — file has zero colors.
    - DO NOT use `any` — use proper types throughout (TypeScript strict per CLAUDE.md).
    - Wrap children in the `<LenisContext.Provider value={lenisInstance}>` so descendants can `useLenis()`.

    Add a JSDoc header comment at the top of the file (after `'use client'`) explaining:
    - LAYOUT-02 single-RAF pattern + D-02/D-03/D-04/D-05/D-06/D-07 trace
    - Why vanilla Lenis (not ReactLenis) per RESEARCH §1
    - Contract: Phase 4 GSAP animations MUST use `useGSAP({ scope: ref })` from @gsap/react
    - Note: LenisProvider does NOT register ScrollTrigger animations itself — it only sets up the bridge
  </action>
  <verify>
    <automated>npm test -- LenisProvider</automated>
  </verify>
  <acceptance_criteria>
    - File `components/providers/LenisProvider.tsx` exists.
    - File starts with `'use client';` (single-quoted, semicolon) on line 1.
    - File contains the literal string `gsap.registerPlugin(ScrollTrigger)` at MODULE level (not inside a function).
    - File contains the literal string `autoRaf: false` inside the Lenis constructor options.
    - File contains the literal string `anchors: true` inside the Lenis constructor options.
    - File contains the literal string `data-lenis-prevent` (the prevent callback predicate).
    - File contains the literal string `gsap.ticker.add` (the bridge registration).
    - File contains the literal string `gsap.ticker.remove` (the cleanup).
    - File contains the literal string `gsap.ticker.lagSmoothing(0)`.
    - File contains the literal string `lenis.destroy()` (cleanup).
    - File contains the literal string `usePalette` (subscribes to ThemeProvider).
    - File contains the literal string `usePrefersReducedMotion` (reduced-motion gate import).
    - File contains the literal string `ScrollTrigger.refresh` (D-05 palette-refresh).
    - File contains the literal string "document.fonts" (font-load ScrollTrigger.refresh per 03-RESEARCH.md §2).
    - File contains the literal substring `450` (the debounce ms).
    - File contains the literal string `(max-width: 768px)` (D-07 mobile input pause threshold).
    - File contains the literal string `focusin` AND `focusout` (D-07 listeners).
    - File EXPORTS both `LenisProvider` (named) AND `useLenis` (named) — `grep -E "export (function|const) (LenisProvider|useLenis)" components/providers/LenisProvider.tsx` returns 2 matches.
    - File contains NO occurrence of the literal string `any` as a type annotation (TS strict).
    - File contains NO occurrence of the literal string `@studio-freight/lenis` (legacy package).
    - File contains NO occurrence of `cursor: none` (irrelevant here but enforced as a project-wide invariant).
    - File contains NO hex literal `#`-followed-by-3-or-6-hex-chars in a CSS context, no `rgb(`, no `hsl(`, no `oklch(` literal.
  </acceptance_criteria>
  <done>LenisProvider.tsx exists with the single-RAF bridge, reduced-motion skip, palette-refresh, and mobile input pause all implemented per D-02..D-07.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Write components/providers/LenisProvider.test.tsx covering mount, skip, cleanup, and palette-refresh paths</name>
  <files>components/providers/LenisProvider.test.tsx</files>
  <read_first>
    - components/providers/LenisProvider.tsx (the file from Task 1 — confirm export names)
    - components/providers/ThemeProvider.tsx (usePalette shape)
    - Any existing Phase 2 test file (e.g. `lib/storage.test.ts` or `components/theme/PalettePresets.test.tsx`) to match style/import conventions
    - vitest.config.ts (jsdom env, @/* alias, setup file)
  </read_first>
  <behavior>
    Test file structure (Vitest + RTL):

    1. **describe('LenisProvider — mount under motion-allowed')** — when usePrefersReducedMotion is mocked false, render `<LenisProvider><div data-testid="child" /></LenisProvider>`, assert:
       - Lenis constructor called once (spy on the mocked class)
       - Lenis constructor received `autoRaf: false`, `anchors: true`, and a `prevent` function
       - gsap.ticker.add called once
       - gsap.ticker.lagSmoothing called with 0
       - child rendered

    2. **describe('LenisProvider — skip under reduced-motion')** — mock usePrefersReducedMotion=true, render, assert:
       - Lenis constructor NOT called
       - gsap.ticker.add NOT called
       - child still rendered

    3. **describe('LenisProvider — cleanup on unmount')** — mount with motion allowed, then `unmount()`, assert:
       - gsap.ticker.remove called with the same function that was added (capture from .add call)
       - lenis.destroy() called

    4. **describe('LenisProvider — palette-swap debounced refresh')** — use `vi.useFakeTimers()`, mock usePalette to return `paletteId: 'terra'` initially, render, then re-render with `paletteId: 'nordic'`, then `vi.advanceTimersByTime(500)`, assert:
       - ScrollTrigger.refresh was called at least twice total (once on mount, once ~450ms after the swap)
       - NO refresh call happened in the first 400ms after the swap
  </behavior>
  <action>
    Create `components/providers/LenisProvider.test.tsx` as a Vitest spec using `@testing-library/react`.

    Required structure:

    ```typescript
    import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
    import { render, cleanup } from '@testing-library/react';
    import type { ReactNode } from 'react';

    // ---- mocks ----
    const ticker = { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() };
    const ScrollTrigger = { refresh: vi.fn(), update: vi.fn() };
    vi.mock('gsap', () => ({
      gsap: {
        registerPlugin: vi.fn(),
        ticker,
      },
    }));
    vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger }));

    const LenisCtor = vi.fn();
    const destroyFn = vi.fn();
    const onFn = vi.fn();
    const stopFn = vi.fn();
    const startFn = vi.fn();
    LenisCtor.mockImplementation(function (this: object, opts: unknown) {
      Object.assign(this as object, {
        destroy: destroyFn,
        on: onFn,
        stop: stopFn,
        start: startFn,
        raf: vi.fn(),
        _opts: opts,
      });
    });
    vi.mock('lenis', () => ({ default: LenisCtor }));

    // controllable mocks for the hooks
    const reducedMotionMock = vi.fn(() => false);
    vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
      usePrefersReducedMotion: () => reducedMotionMock(),
    }));

    const paletteIdMock = vi.fn(() => 'terra' as string);
    vi.mock('@/components/providers/ThemeProvider', () => ({
      usePalette: () => ({ paletteId: paletteIdMock() }),
    }));

    // IMPORT AFTER MOCKS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    let LenisProvider: (props: { children: ReactNode }) => ReactNode;

    beforeEach(async () => {
      vi.clearAllMocks();
      reducedMotionMock.mockReturnValue(false);
      paletteIdMock.mockReturnValue('terra');
      const mod = await import('./LenisProvider');
      LenisProvider = mod.LenisProvider;
    });

    afterEach(() => {
      cleanup();
      vi.useRealTimers();
    });

    describe('LenisProvider — mount under motion-allowed', () => {
      it('instantiates Lenis with autoRaf:false + anchors:true and adds to gsap.ticker', () => {
        render(<LenisProvider><div data-testid="child" /></LenisProvider>);
        expect(LenisCtor).toHaveBeenCalledTimes(1);
        const opts = LenisCtor.mock.calls[0][0];
        expect(opts).toMatchObject({ autoRaf: false, anchors: true, lerp: 0.1 });
        expect(typeof opts.prevent).toBe('function');
        expect(ticker.add).toHaveBeenCalledTimes(1);
        expect(ticker.lagSmoothing).toHaveBeenCalledWith(0);
      });
    });

    describe('LenisProvider — skip under reduced-motion', () => {
      it('does not instantiate Lenis or add to ticker when reduced-motion is reduce', () => {
        reducedMotionMock.mockReturnValue(true);
        render(<LenisProvider><div /></LenisProvider>);
        expect(LenisCtor).not.toHaveBeenCalled();
        expect(ticker.add).not.toHaveBeenCalled();
      });
    });

    describe('LenisProvider — cleanup on unmount', () => {
      it('removes the ticker callback and destroys Lenis', () => {
        const { unmount } = render(<LenisProvider><div /></LenisProvider>);
        const addedFn = ticker.add.mock.calls[0][0];
        unmount();
        expect(ticker.remove).toHaveBeenCalledWith(addedFn);
        expect(destroyFn).toHaveBeenCalled();
      });
    });

    describe('LenisProvider — palette-swap debounced refresh', () => {
      it('calls ScrollTrigger.refresh ~450ms after paletteId changes', () => {
        vi.useFakeTimers();
        const { rerender } = render(<LenisProvider><div /></LenisProvider>);
        ScrollTrigger.refresh.mockClear();
        paletteIdMock.mockReturnValue('nordic');
        rerender(<LenisProvider><div /></LenisProvider>);
        // requestAnimationFrame fires on next tick — flush rAF
        vi.advanceTimersByTime(50);  // allow rAF callback to schedule the timer
        expect(ScrollTrigger.refresh).not.toHaveBeenCalled();
        vi.advanceTimersByTime(450); // total ~500ms — past the 450 debounce
        expect(ScrollTrigger.refresh).toHaveBeenCalled();
      });
    });
    ```

    Notes for the executor:
    - jsdom does not fire `requestAnimationFrame` synchronously under fake timers. If the assertion needs help, replace `requestAnimationFrame` with a setTimeout(fn, 0) shim in the test setup, OR use `vi.useFakeTimers({ toFake: ['setTimeout', 'requestAnimationFrame'] })` and `vi.runAllTimers()` after the rerender.
    - If `LenisCtor.mock.calls[0][0]` is undefined under React 19 Strict Mode double-invoke, gate the assertion on `LenisCtor.mock.calls.length >= 1` and read the last call.
    - Mock the `'@/i18n/...'` modules only if Vitest complains about resolving them through the ThemeProvider chain.
  </action>
  <verify>
    <automated>npm test -- LenisProvider</automated>
  </verify>
  <acceptance_criteria>
    - File `components/providers/LenisProvider.test.tsx` exists.
    - File contains 4 `describe(` blocks (one per scenario: mount, skip, cleanup, palette-swap).
    - File contains `vi.mock('gsap'` and `vi.mock('lenis'` (module mocks set up before the provider import).
    - File contains the literal string `autoRaf: false` (asserting on the constructor opts).
    - File contains the literal string `anchors: true` (asserting on the constructor opts).
    - File contains the literal string `ticker.remove` (asserting on cleanup).
    - File contains the literal string `destroyFn` OR `destroy` (asserting cleanup calls Lenis.destroy).
    - File contains the literal string `vi.useFakeTimers` (palette-refresh debounce assertion).
    - File contains `paletteIdMock.mockReturnValue('nordic')` OR equivalent — proves the swap is being simulated.
    - `npm test -- LenisProvider` exits 0 with at least 4 passing tests.
    - `npm test` (full suite) exits 0 with >= 94 + 4 = 98 passing tests.
  </acceptance_criteria>
  <done>4-test Vitest spec passes green and asserts the mount, skip, cleanup, and palette-refresh contracts of LenisProvider.</done>
</task>

</tasks>

<verification>
- `components/providers/LenisProvider.tsx` exists with `'use client'` line 1.
- `components/providers/LenisProvider.test.tsx` exists and passes 4 tests.
- `npm test` reports >= 98 passing tests (94 Phase 2 baseline + 4 new).
- `npm run lint` exits 0.
- `npm run build` exits 0 (proves the Lenis + GSAP + ScrollTrigger imports resolve and tree-shake correctly).
- File contains the literal strings: `autoRaf: false`, `anchors: true`, `gsap.ticker.add`, `gsap.ticker.remove`, `gsap.ticker.lagSmoothing(0)`, `gsap.registerPlugin(ScrollTrigger)`, `lenis.destroy()`, `data-lenis-prevent`, `ScrollTrigger.refresh`, `450`, `(max-width: 768px)`, `focusin`, `focusout`.
- File does NOT contain `any` as a type annotation, `@studio-freight/lenis`, or any color literal.
</verification>

<success_criteria>
LenisProvider component exists with the documented single-RAF bridge, reduced-motion skip, palette-refresh debounce (450ms after paletteId change), and mobile input pause. A `useLenis()` hook is exported. The Vitest spec proves the four critical behaviors. Plan 02 can now import this provider and wire it into the layout per D-11.
</success_criteria>

<output>
After completion, create `.planning/phases/03-layout-animation-foundation/03-01-SUMMARY.md` documenting:
- The exact code patterns used (single-RAF via gsap.ticker.add, vanilla Lenis not ReactLenis, debounce 450ms = 400ms transition + 50ms buffer).
- The 4 Vitest test names and what each asserts.
- Confirmation that the `useLenis()` context hook is exported for LanguageSwitcher D-21 consumption.
- Contract note for Phase 4: GSAP animations must use `useGSAP({ scope: ref })` from @gsap/react.
</output>
