'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`.
 *
 * Returns `false` on initial (SSR / pre-effect) render — animations are
 * allowed by default so unrequested motion does not accidentally render on
 * server-rendered HTML when the client also prefers reduced motion. After the
 * first effect, the hook mirrors the live `MediaQueryList.matches` value and
 * re-renders on every `change` event.
 *
 * Used by:
 *   - PaletteFab (Wave 4, D-08) — opacity-only feedback when motion reduced,
 *     skips hover scale 1.0→1.08 + rotate 5°
 *   - Konami confetti integration (Wave 4, D-13) — fade-only confetti
 *     fallback when motion reduced
 *
 * Why a custom hook instead of motion's `useReducedMotion`:
 *   - motion's hook works only inside Motion components, fine for the FAB but
 *     awkward for canvas-confetti gating (a non-Motion code path)
 *   - centralized SSR-safety + listener cleanup + boolean semantics
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
