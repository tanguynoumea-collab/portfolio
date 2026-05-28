'use client';

/**
 * lib/hooks/useParallax.ts — Client-only hook (consumers must be in 'use client' files).
 *
 * ScrollTrigger plugin registration is already done at LenisProvider module
 * load (Phase 3 D-11). This hook just imports ScrollTrigger for type merging
 * (side-effect-only import) — exactly like Phase 4 components/sections/About.tsx.
 */

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import 'gsap/ScrollTrigger'; // Type merge only — registration already done.
import type { RefObject } from 'react';

export type UseParallaxOptions = {
  factor?: number; // Default 0.3 — fraction of scroll distance to translate.
  maxTranslate?: number; // Default 50 (px) — clamp so we never reveal the wrapper bg.
};

/**
 * useParallax — wraps a ref-scoped element so its [data-parallax-image] child
 * translates upward as the wrapper scrolls past the viewport top.
 *
 * D-05 contract:
 *   - factor: 0.3 (default), maxTranslate: 50 (default)
 *   - ScrollTrigger on the wrapper ref:
 *       start: 'top top', end: 'bottom top', scrub: 0.5
 *       animation: gsap.to('[data-parallax-image]', { y: -maxTranslate, ease: 'none' })
 *   - gsap.matchMedia dual-branch:
 *       (prefers-reduced-motion: no-preference) — installs scrub animation
 *       (prefers-reduced-motion: reduce)        — gsap.set y:0, no ScrollTrigger
 *   - useGSAP({ scope }) provides automatic cleanup on unmount + Strict Mode safety.
 *
 * Pitfall 5D: the selector is the string '[data-parallax-image]', never a bare
 * 'img' tag selector — a tag selector would leak to portaled images elsewhere.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  options: UseParallaxOptions = {},
): void {
  const { maxTranslate = 50 } = options;
  // `factor` is reserved for future tuning; current implementation uses
  // maxTranslate directly (kept in the signature to honor D-13).

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          if (!ctx.conditions?.isFull) {
            // Reduced-motion: snap image to neutral position, no ScrollTrigger.
            gsap.set('[data-parallax-image]', { y: 0 });
            return;
          }
          gsap.to('[data-parallax-image]', {
            y: -maxTranslate,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        },
      );
    },
    { scope: ref, dependencies: [maxTranslate] },
  );
}
