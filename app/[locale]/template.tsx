'use client';

/**
 * app/[locale]/template.tsx — ANIM-01 route-transition wrapper.
 *
 * CRITICAL placement (Phase 7 fix): this template lives at the [locale] level,
 * INSIDE app/[locale]/layout.tsx (which owns <html>, the providers, nav, main,
 * footer). It must NOT live at app/template.tsx (root).
 *
 * Why: a template re-mounts on every navigation AND remounts everything BELOW
 * it. A ROOT template (the previous, broken setup) therefore tore down and
 * rebuilt the ENTIRE app — <html>, ThemeProvider, LenisProvider, Navigation,
 * Footer — on every single navigation. That catastrophic remount blanked the
 * page (the whole React tree collapsed to empty divs). At the [locale] level
 * the template wraps only the PAGE content inside the persistent <main>, so
 * navigation re-mounts just the page (the transition) while the providers /
 * chrome / <html> stay mounted.
 *
 * Trade-off vs the old D-33 rationale: a locale switch (/fr ↔ /en) now also
 * plays the fade. That's harmless and far better than the blank-page bug the
 * root placement caused.
 *
 * SSR/LCP-safe: the very first paint renders with NO entrance animation
 * (`initial={false}`) so content is visible immediately (no FOUC, no LCP
 * delay). The fade+slide only plays on subsequent client navigations. The
 * module-level `seenFirstPaint` flag is mutated only in an effect (client-only),
 * so SSR always renders the visible state.
 *
 * D-32 preserved: 300ms fade + 8px Y under normal motion; 100ms opacity-only
 * under reduced motion (≤350ms ANIM-01 ceiling). usePathname keys the remount.
 */
import { motion, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// Module scope: persists across the per-navigation template remount. Mutated
// only in an effect (never during render / never on the server), so SSR and
// the first client paint both read `false` → no entrance animation on load.
let seenFirstPaint = false;

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const [animateOnEnter] = useState(() => seenFirstPaint);
  useEffect(() => {
    seenFirstPaint = true;
  }, []);

  // 0.3 = 300ms normal motion; 0.1 = 100ms reduced motion (≤350ms ANIM-01 ceiling).
  const transition = reduce
    ? { duration: 0.1, ease: 'linear' as const }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  // initial={false} → render directly at the `animate` state (no entrance) on
  // first load. On navigations, start hidden then fade in.
  const initial = !animateOnEnter
    ? false
    : reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 8 };

  return (
    <motion.div
      key={pathname}
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
