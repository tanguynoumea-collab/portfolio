'use client';

/**
 * components/providers/LenisProvider.tsx — Client Component (LAYOUT-02).
 *
 * Single-RAF Lenis + GSAP bridge. Owns the canonical smooth-scroll setup
 * for the entire app, including:
 *   - Lenis instantiation with `autoRaf: false` (D-02) so GSAP drives the
 *     RAF loop via `gsap.ticker.add` — exactly one RAF cycle per frame
 *     across both libraries. See `.planning/research/PITFALLS.md`
 *     §"Pitfall 4" + ARCHITECTURE.md §"Pattern 5".
 *   - `anchors: true` (D-03) so `<a href="#about">` smooth-scrolls.
 *   - `prevent: (node) => node.hasAttribute('data-lenis-prevent')` (D-04)
 *     so Radix overlays (Sheet/Dialog/Popover) keep native scroll. Phase 2
 *     Pitfall E mitigation already scopes these surfaces out of the 400ms
 *     global color transition; this adds the Lenis virtualization opt-out.
 *   - `ScrollTrigger.refresh()` ~450ms (400ms global color transition +
 *     50ms buffer) after every `paletteId` change (D-05). Wrapped in rAF
 *     to avoid the documented "ScrollTrigger.refresh called during scroll"
 *     warning.
 *   - Lenis entirely skipped under `prefers-reduced-motion: reduce` (D-06).
 *     Falls back to native scroll; ScrollTrigger still works against the
 *     native scroll position with no extra wiring.
 *   - Mobile input-focus pause (D-07): when the viewport is ≤768px wide
 *     and an `INPUT`/`TEXTAREA` gains focus, `lenis.stop()` runs so the
 *     mobile keyboard does not fight Lenis virtualization; `lenis.start()`
 *     restores on blur.
 *   - One-shot `document.fonts.ready.then(ScrollTrigger.refresh)` so the
 *     Inter font swap (next/font swap strategy) reflows ScrollTrigger
 *     positions exactly once when metrics finalize.
 *
 * Vanilla `new Lenis()` is used directly (NOT the `lenis/react` ReactLenis
 * wrapper) — see `.planning/phases/03-layout-animation-foundation/03-RESEARCH.md`
 * §1 for the trade-off table. Vanilla gives unambiguous control over the
 * reduced-motion early-return, predictable Strict Mode cleanup, and zero
 * subscription churn for descendants.
 *
 * Contract for Phase 4+ GSAP animations:
 *   - LenisProvider sets up `gsap.registerPlugin(ScrollTrigger)` ONCE at
 *     module load. Phase 4 components must NOT call `registerPlugin` again
 *     (it is idempotent but redundant).
 *   - LenisProvider does NOT register any ScrollTrigger animations itself
 *     — it only sets up the ticker bridge. Phase 4 Hero (HOME-01) + Phase 5
 *     parallax (ANIM-02) MUST use `useGSAP({ scope: ref })` from
 *     `@gsap/react` so animations get auto-cleanup, Strict Mode safety,
 *     and per-component context.
 *
 * `useLenis()` exposes the live Lenis instance via a thin React context
 * for LanguageSwitcher (D-21 scroll preservation) and future imperative
 * consumers. Returns `null` when reduced-motion is on or before the effect
 * has populated the instance — consumers MUST null-check.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePalette } from '@/components/providers/ThemeProvider';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// MODULE-LEVEL registration. `gsap.registerPlugin` is idempotent — calling
// it again with the same plugin is a no-op. Doing it here guarantees that
// Phase 4 ScrollTrigger consumers see the plugin already registered without
// needing to repeat the call themselves.
gsap.registerPlugin(ScrollTrigger);

/**
 * Thin context exposing a getter for the live Lenis instance.
 *
 * The context value is a stable `LenisAccessor` object (ref-holder pattern).
 * `getLenis()` returns the currently-mounted Lenis instance or `null` when
 * reduced-motion is active or before the lifecycle effect has run.
 *
 * Why a getter and not the instance directly: the instance lives in a
 * `useRef` so the lifecycle `useEffect` can populate it without calling
 * `setState` synchronously (which triggers React 19's
 * `react-hooks/set-state-in-effect` lint rule — see ThemeProvider /
 * PaletteFab analogous derive-in-render patterns).
 *
 * Consumers (LanguageSwitcher D-21, future imperative scrollTo callers)
 * read via:
 *
 *   const lenis = useLenis();        // returns Lenis | null
 *   lenis?.scrollTo(0, { immediate: true });
 *
 * Always null-check.
 */
type LenisAccessor = { getLenis: () => Lenis | null };

const LenisContext = createContext<LenisAccessor>({ getLenis: () => null });

export function useLenis(): Lenis | null {
  return useContext(LenisContext).getLenis();
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { paletteId } = usePalette();
  const reducedMotion = usePrefersReducedMotion();

  // Stable accessor — closure over lenisRef so descendants always read the
  // current instance. useMemo with [] ensures the same object identity for
  // the lifetime of this provider, so context consumers never re-render
  // from accessor identity churn.
  const accessor = useMemo<LenisAccessor>(
    () => ({ getLenis: () => lenisRef.current }),
    [],
  );

  // ----- Lifecycle: instantiate once when motion is allowed, destroy on
  // unmount. Re-runs only if reducedMotion flips (rare — OS-level toggle).
  useEffect(() => {
    if (reducedMotion) return; // D-06: skip Lenis entirely under reduced motion.

    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: false, // D-02 — gsap.ticker drives RAF.
      anchors: true, // D-03 — smooth-scroll <a href="#section">.
      prevent: (node: Node) =>
        node instanceof Element && node.hasAttribute('data-lenis-prevent'), // D-04
    });
    lenisRef.current = lenis;

    // GSAP ticker delivers `time` in seconds; Lenis.raf wants milliseconds.
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); // Predictable scroll — disable lag smoothing.

    // Sync ScrollTrigger to Lenis scroll position so triggers fire at the
    // right element offsets. ScrollTrigger.update accepts an optional self
    // arg; passing it as `lenis.on('scroll', ...)` listener is the
    // documented bridge per GSAP + Lenis README.
    lenis.on('scroll', ScrollTrigger.update);

    // Initial sync — any ScrollTriggers registered after mount see correct
    // positions from frame 1.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // ----- D-05: ScrollTrigger.refresh ~450ms after every paletteId change.
  // 400ms global color transition + 50ms buffer. requestAnimationFrame
  // wrapper defers the call past the next paint to avoid the documented
  // "called during scroll" warning; setTimeout inside lets the CSS
  // transition finish before recomputing positions.
  useEffect(() => {
    if (reducedMotion) return;
    let timerId: number | null = null;
    const rafId = window.requestAnimationFrame(() => {
      timerId = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 450);
    });
    return () => {
      window.cancelAnimationFrame(rafId);
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [paletteId, reducedMotion]);

  // ----- D-07: mobile input-focus pause. Mitigates Pitfall 4's "keyboard
  // hides input" failure mode. Desktop is unaffected — the matchMedia
  // check gates the stop() call to ≤768px viewports.
  // Reads lenisRef inside event handlers (deferred), so this effect can
  // safely depend only on `reducedMotion` — by the time focusin fires,
  // the lifecycle effect above has populated lenisRef.current (or skipped
  // it entirely under reduced motion, in which case this effect is also
  // skipped via the early return).
  useEffect(() => {
    if (reducedMotion) return;
    const isMobile = (): boolean =>
      window.matchMedia('(max-width: 768px)').matches;
    const isInput = (el: EventTarget | null): el is HTMLElement => {
      if (!(el instanceof HTMLElement)) return false;
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    };
    const onFocus = (e: FocusEvent) => {
      const lenis = lenisRef.current;
      if (lenis && isMobile() && isInput(e.target)) lenis.stop();
    };
    const onBlur = (e: FocusEvent) => {
      const lenis = lenisRef.current;
      if (lenis && isInput(e.target)) lenis.start();
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, [reducedMotion]);

  // ----- Font-loaded re-refresh. The Inter swap (next/font swap strategy)
  // changes body height once when metrics finalize; refresh ScrollTrigger
  // so Phase 4 hero/about reveals fire at correct positions.
  useEffect(() => {
    if (reducedMotion || typeof document === 'undefined') return;
    let cancelled = false;
    const fonts = document.fonts;
    if (!fonts || !fonts.ready) return;
    fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return (
    <LenisContext.Provider value={accessor}>{children}</LenisContext.Provider>
  );
}
