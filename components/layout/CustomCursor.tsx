'use client';

/**
 * components/layout/CustomCursor.tsx — LAYOUT-06 (Phase 3 D-26..D-30).
 *
 * Constrained decorative tracer. The native OS cursor STAYS visible at all
 * times — this is a small accent-colored halo that orbits the pointer.
 *
 * NON-NEGOTIABLE constraint (REQUIREMENTS.md Out-of-Scope list line 130 +
 * FEATURES.md anti-feature consensus): the `(none)` value MUST NOT be applied
 * to the CSS pointer property anywhere in the codebase. Hiding the OS pointer:
 *   - overrides OS-level accessibility (magnification, high-contrast pointer);
 *   - confuses users who do not recognize the tracer as the pointer;
 *   - degrades on low-end devices and looks broken.
 * The native pointer is always visible — the tracer is a decorative halo only.
 *
 * D-27: 4-gate activation. The component renders `null` (zero JS, zero DOM)
 * unless ALL of the following media queries pass:
 *   - (pointer: fine)            — exclude touch-primary devices
 *   - !(prefers-reduced-motion: reduce) — WCAG 2.3.3 + vestibular safety
 *   - !(any-pointer: coarse)     — exclude hybrid 2-in-1 laptops in touch mode
 *   - !(forced-colors: active)   — Windows High Contrast users keep OS pointer
 *
 * D-28: backgroundColor sourced via the `var(--color-accent)` CSS variable
 * directly in inline style. No JS subscription to palette changes — the
 * Phase 2 ThemeProvider mutation of --color-accent on documentElement
 * automatically repaints the tracer with zero React work.
 *
 * D-29: hover scale via event delegation on `document` for `pointerover` and
 * `pointerout`. Targets matching `a, button, [role=button], [data-cursor=hover],
 * img[data-zoomable]` scale the tracer up; leaving them scales back down.
 * relatedTarget check prevents flicker when hovering between two adjacent
 * interactive elements.
 *
 * D-30: pointer position lives in `useMotionValue` (NOT React state). Setting
 * a MotionValue on every `pointermove` does NOT trigger a re-render — motion's
 * scheduler updates the DOM transform directly. Zero React work per frame,
 * even at ~120Hz on a high-refresh display. `useSpring` interpolates from the
 * raw position values for a tight follow.
 */
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const HOVER_SELECTORS =
  'a, button, [role="button"], [data-cursor=hover], img[data-zoomable]';

function shouldRenderCursor(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false;
  // D-27: 4-gate activation. ALL must pass.
  if (!window.matchMedia('(pointer: fine)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(any-pointer: coarse)').matches) return false;
  if (window.matchMedia('(forced-colors: active)').matches) return false;
  return true;
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldRenderCursor());
    const queries = [
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(any-pointer: coarse)'),
      window.matchMedia('(forced-colors: active)'),
    ];
    const onChange = () => setEnabled(shouldRenderCursor());
    queries.forEach((q) => q.addEventListener('change', onChange));
    return () => queries.forEach((q) => q.removeEventListener('change', onChange));
  }, []);

  // D-30: motion values — NOT React state.
  // Updating these on every pointermove does NOT re-render React; the DOM
  // transform is mutated directly by motion's scheduler.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const xSpring = useSpring(x, { mass: 0.3, stiffness: 800, damping: 30 });
  const ySpring = useSpring(y, { mass: 0.3, stiffness: 800, damping: 30 });
  const scaleSpring = useSpring(scale, { mass: 0.3, stiffness: 600 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    // D-29: event delegation on document — one pair of listeners covers
    // every current and future interactive element matching HOVER_SELECTORS.
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target && 'closest' in target && target.closest?.(HOVER_SELECTORS)) {
        scale.set(4);
      }
    };
    const onOut = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target && 'closest' in target && target.closest?.(HOVER_SELECTORS)) {
        // Stay scaled-up if moving to another hover target (prevents flicker
        // between adjacent buttons/links).
        const next = e.relatedTarget as Element | null;
        if (next && 'closest' in next && next.closest?.(HOVER_SELECTORS)) return;
        scale.set(1);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    };
  }, [enabled, x, y, scale]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      data-testid="custom-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        borderRadius: 9999,
        opacity: 0.7,
        // D-28: direct CSS variable — recolors automatically on palette swap.
        backgroundColor: 'var(--color-accent)',
        pointerEvents: 'none',
        translateX: '-50%',
        translateY: '-50%',
        x: xSpring,
        y: ySpring,
        scale: scaleSpring,
        zIndex: 9999,
        // Guarantees visibility against any palette/background combo.
        mixBlendMode: 'difference',
      }}
    />
  );
}
