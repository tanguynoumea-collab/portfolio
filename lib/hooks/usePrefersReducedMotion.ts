'use client';

import { useSyncExternalStore } from 'react';

/**
 * SSR-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`.
 *
 * Returns `false` on initial (SSR / pre-effect) render — animations are
 * allowed by default so unrequested motion does not accidentally render on
 * server-rendered HTML when the client also prefers reduced motion. After
 * hydration, the hook mirrors the live `MediaQueryList.matches` value and
 * re-renders on every `change` event.
 *
 * Implementation uses `useSyncExternalStore` — React's blessed primitive for
 * subscribing to external stores. It provides:
 *   - SSR-safe `getServerSnapshot` (always returns `false`)
 *   - Tear-free reads via `getSnapshot` (no setState-in-effect lint warning)
 *   - Automatic subscribe/unsubscribe cleanup
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
const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
