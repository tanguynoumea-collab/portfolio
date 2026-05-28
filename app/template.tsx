'use client';

/**
 * app/template.tsx — ANIM-01 route-transition wrapper.
 *
 * Templates re-mount on every navigation (Next App Router contract), so a
 * `key={pathname}` <motion.div> plays an ENTER animation on each forward AND
 * back navigation.
 *
 * Phase 7 FIX — blank page on back navigation:
 * The original `<AnimatePresence mode="popLayout">` blanked the page when the
 * user navigated back. `popLayout` absolutely-positions its children for the
 * sibling-overlap effect; combined with the per-navigation template remount,
 * the incoming page ended up `position:absolute` with zero height → blank.
 * `popLayout` is for sibling lists (the Projects grid), NOT full-page route
 * transitions, and exit animations are impossible in a remounting template
 * anyway. The App-Router-correct pattern is an enter-only transition.
 *
 * SSR/LCP-safe: the very first paint (initial page load) renders with NO
 * entrance animation (`initial={false}`) so content is visible immediately —
 * no flash of invisible content, no LCP delay. The fade+slide only plays on
 * subsequent client navigations. The module-level `seenFirstPaint` flag
 * survives the template remount; it's only mutated in an effect (client-only),
 * so SSR always renders the visible state.
 *
 * D-32 preserved: 300ms fade + 8px Y-translate under normal motion; 100ms
 * opacity-only under reduced motion (≤350ms ANIM-01 ceiling). usePathname from
 * `next/navigation` (full locale-prefixed path) keys the remount.
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

  // false on the very first load (render visible immediately), true after the
  // first commit (animate subsequent navigations). Read once at mount.
  const [animateOnEnter] = useState(() => seenFirstPaint);
  useEffect(() => {
    seenFirstPaint = true;
  }, []);

  // 0.3 = 300ms normal motion; 0.1 = 100ms reduced motion (≤350ms ANIM-01 ceiling).
  const transition = reduce
    ? { duration: 0.1, ease: 'linear' as const }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  // initial={false} → motion renders directly at the `animate` state (no
  // entrance) — used on first load. On navigations, start hidden then fade in.
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
