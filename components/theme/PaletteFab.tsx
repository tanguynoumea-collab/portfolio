'use client';

/**
 * components/theme/PaletteFab.tsx — Client Component (THEME-11 + D-08 + D-14).
 *
 * Fixed bottom-right Floating Action Button. Lucide `palette` icon. Owns the
 * open state of <PaletteSwitcher/> via local useState, so clicking the FAB
 * toggles the Sheet AND the Konami unlock flow can imperatively open it
 * (D-14 step 5) via the vaporwaveUnlockNonce subscription pattern.
 *
 * Motion (D-08, via motion/react):
 *   - whileHover: scale 1.0 → 1.08 + rotate 5° (200ms ease-out)
 *   - whileTap:   scale 0.95 (tactile feedback)
 *   - Open state: icon rotates 180° AND cross-fades to Lucide `X` (close affordance)
 *   - prefers-reduced-motion: ALL motion props disabled (whileHover/whileTap → {},
 *     animate → {}). Fallback feedback is Tailwind hover:opacity-80 transition-opacity
 *     so the FAB still acknowledges hover but without motion.
 *
 * Auto-open on Konami unlock (D-14 step 5):
 *   - Subscribes to vaporwaveUnlockNonce from usePalette().
 *   - Detects nonce CHANGES via the React 19 "store previous value in state +
 *     compare during render" idiom. When nonce > 0 AND changed since last render,
 *     setOpen(true) opens the Sheet.
 *   - The Sheet's <Tabs defaultValue="presets"> ensures the Presets tab is
 *     visible on auto-open (D-14 sequence: confetti → palette swaps → Sheet opens
 *     on Presets tab with Vaporwave card highlighted as the 5th preset).
 *   - Cold-load semantics: nonce ALWAYS starts at 0 on mount (even for returning
 *     users with secrets.vaporwave=true), so the detection skips this case and
 *     does NOT auto-open the Sheet on every page refresh. Only fresh in-session
 *     unlocks open it.
 *   - Pattern choice: React 19's `react-hooks/set-state-in-effect` lint rule
 *     forbids calling setState in useEffect bodies. The store-prev-in-state
 *     pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
 *     is the React-blessed alternative — React batches the conditional setState
 *     during the same render, no cascade.
 *
 * Accessibility:
 *   - Localized aria-label via useTranslations('palette') → t('open') / t('close')
 *     so the FAB announces correctly in both FR ("Ouvrir le sélecteur de palette" /
 *     "Fermer") and EN ("Open palette switcher" / "Close") — THEME-11.
 *   - focus-visible ring matches the project's standard offset-2 ring.
 *   - safe-area-inset padding for iOS notch / Android nav bar overlap.
 *
 * Positioning:
 *   - fixed bottom-6 right-6 z-40 — above page content, below the Sheet overlay
 *     (Radix Dialog overlay sits at z-50 inside shadcn defaults).
 *
 * Why FAB owns the Sheet state (not ThemeProvider):
 *   - Lifted state pattern (see 02-05-SUMMARY.md decision 5): PaletteSwitcher is a
 *     controlled Sheet (open + onOpenChange). PaletteFab owns the state via useState.
 *   - The Konami unlock flow lives in ThemeProvider, but the Sheet UI is owned by
 *     this component. Reconciliation via vaporwaveUnlockNonce — ThemeProvider
 *     increments the counter, FAB picks up the change in render.
 *   - Cleaner than an event bus, a 4th context, or a callback prop on ThemeProvider.
 */
import { motion } from 'motion/react';
import { Palette as PaletteIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PaletteSwitcher } from './PaletteSwitcher';
import { usePalette } from '@/components/providers/ThemeProvider';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

export function PaletteFab() {
  const t = useTranslations('palette');
  const reduced = usePrefersReducedMotion();
  const { vaporwaveUnlockNonce } = usePalette();
  const [open, setOpen] = useState(false);

  // D-14 step 5: auto-open the Sheet on Konami unlock. The nonce increments
  // on every UNLOCK_VAPORWAVE dispatch (ThemeProvider reducer). When the
  // nonce changes (transitions to a new value), this component opens the
  // Sheet. Subsequent in-session unlocks (rare — user re-running Konami
  // after closing the Sheet) also re-open it.
  //
  // Cold-load behavior: nonce always starts at 0 on mount, so the comparison
  // skips returning users who already had Vaporwave unlocked in a previous
  // session.
  //
  // Implementation note: React 19 idiom for "respond to a changing external
  // value" — derive in render via a previous-value useState + comparison,
  // calling the setter conditionally before returning. This is the pattern
  // documented in https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // and avoids the react-hooks/set-state-in-effect lint rule (no useEffect
  // needed; React batches the conditional setState during the same render).
  const [prevNonce, setPrevNonce] = useState(vaporwaveUnlockNonce);
  if (vaporwaveUnlockNonce !== prevNonce) {
    setPrevNonce(vaporwaveUnlockNonce);
    if (vaporwaveUnlockNonce > 0) {
      setOpen(true);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('close') : t('open')}
        data-testid="palette-fab"
        className={[
          'fixed right-6 bottom-6 z-40',
          'flex h-12 w-12 items-center justify-center rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'pr-[max(0px,env(safe-area-inset-right))]',
          'pb-[max(0px,env(safe-area-inset-bottom))]',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          // Reduced-motion fallback: opacity-only feedback via Tailwind hover.
          // Motion props are also gated (set to {}) below so the FAB renders
          // statically while still providing a hover acknowledgment.
          reduced ? 'transition-opacity hover:opacity-80' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        whileHover={reduced ? {} : { scale: 1.08, rotate: 5 }}
        whileTap={reduced ? {} : { scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Inner motion.span owns the icon rotation + cross-fade. Outer button
            owns the hover scale. Separating responsibilities keeps the
            transitions clean and prevents the icon rotation from compounding
            with the button scale. */}
        <motion.span
          className="block"
          animate={reduced ? {} : { rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {open ? <X size={20} aria-hidden /> : <PaletteIcon size={20} aria-hidden />}
        </motion.span>
      </motion.button>

      <PaletteSwitcher open={open} onOpenChange={setOpen} />
    </>
  );
}
