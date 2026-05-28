'use client';

/**
 * components/sections/Hero.tsx — HOME-01 Phase 4.
 *
 * Bilingual identity reveal via GSAP SplitText char-stagger inside a
 * useGSAP({ scope }) hook. CTA scrolls to #projects via Lenis (when
 * available) with a scrollIntoView fallback under reduced motion.
 * ChevronDown scroll cue performs a gentle motion y-bounce loop.
 *
 * Pattern: 04-RESEARCH.md §"Pattern 1" — gsap.matchMedia gates full vs
 * reduced motion; SplitText is auto-reverted by useGSAP on unmount;
 * dependencies on [t('name'), t('role')] guarantee re-split on locale
 * switch (Pitfall 4-A). ScrollTrigger.refresh() in SplitText.onSplit
 * mitigates Pitfall 4-D (downstream About/Skills reveal positions stale
 * after SplitText injects char <div>s into DOM).
 *
 * Colors: all via Tailwind utilities backed by --color-* tokens
 * (text-foreground, text-primary, text-muted-foreground). NO literal
 * oklch/rgb/hsl/hex anywhere — palette switching must propagate.
 *
 * SSR semantics: text renders at final position before hydration so the
 * initial paint is layout-stable (no CLS, no FOUC). The useGSAP timeline
 * only animates the entrance on mount; under reduced motion it snaps to
 * the same final state instantly via gsap.set().
 */

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useLenis } from '@/components/providers/LenisProvider';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// Module-level plugin registration. LenisProvider already registers
// ScrollTrigger at module load; SplitText is registered HERE (Phase 4
// first use). gsap.registerPlugin is idempotent — no harm if called twice.
gsap.registerPlugin(SplitText);

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('hero');
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();

  // Pitfall 4-A: pass i18n strings as dependencies so the SplitText
  // re-runs when the user switches locale. Without this, the new
  // translation renders unsplit because SplitText doesn't observe
  // textContent changes — useGSAP tears down its context and re-runs
  // the callback when these strings change.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const nameSplit = new SplitText('[data-hero-name]', {
            // 'words' keeps each name word intact so a long name (e.g.
            // "Tanguy Delrieu") wraps at the space, never mid-word — a
            // chars-only split lets the line break between letters and
            // strands one on a second line, breaking the centering.
            type: 'words,chars',
            aria: 'auto',
            // Pitfall 4-D: SplitText injects per-char <div>s and shifts
            // Hero's height by a few px after creation. Refresh
            // ScrollTrigger so downstream About/Skills reveals snapshot
            // the correct positions.
            onSplit: () => ScrollTrigger.refresh(),
          });
          const roleSplit = new SplitText('[data-hero-role]', {
            type: 'chars',
            aria: 'auto',
          });

          if (ctx.conditions?.isFull) {
            const tl = gsap.timeline();
            tl.from(nameSplit.chars, {
              opacity: 0,
              y: 24,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power3.out',
            })
              .from(
                roleSplit.chars,
                {
                  opacity: 0,
                  y: 24,
                  duration: 0.5,
                  stagger: 0.025,
                  ease: 'power3.out',
                },
                '-=0.3',
              )
              .from('[data-hero-tagline]', { opacity: 0, duration: 0.5 }, 0.8)
              .from(
                '[data-hero-cta]',
                { opacity: 0, y: 12, duration: 0.5 },
                1.0,
              )
              .from('[data-hero-cue]', { opacity: 0, duration: 0.5 }, 1.0);
          } else {
            // Reduced motion: snap to final state instantly — no tween.
            gsap.set(
              [
                nameSplit.chars,
                roleSplit.chars,
                '[data-hero-tagline]',
                '[data-hero-cta]',
                '[data-hero-cue]',
              ],
              { opacity: 1, y: 0 },
            );
          }

          // Belt-and-suspenders cleanup. useGSAP auto-reverts SplitText
          // on unmount, but matchMedia may tear down independently when
          // conditions flip (e.g., user toggles OS reduced-motion at
          // runtime). Explicit revert ensures clean DOM either way.
          return () => {
            nameSplit.revert();
            roleSplit.revert();
          };
        },
      );
    },
    { scope: heroRef, dependencies: [t('name'), t('role')] },
  );

  const onCta = () => {
    const target = document.getElementById('projects');
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -64, duration: 1.0 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={heroRef} className="w-full">
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <h1
          data-hero-name
          className="text-foreground text-7xl font-bold tracking-tight md:text-8xl lg:text-9xl"
        >
          {t('name')}
        </h1>
        <p data-hero-role className="text-primary text-2xl md:text-3xl">
          {t('role')}
        </p>
        <p
          data-hero-tagline
          className="text-muted-foreground mx-auto max-w-2xl text-lg"
        >
          {t('tagline')}
        </p>
        <div data-hero-cta className="flex justify-center pt-4">
          <Button onClick={onCta} size="lg">
            {t('cta')}
          </Button>
        </div>
        <div data-hero-cue className="pt-8">
          <motion.div
            aria-label={t('scrollCue')}
            role="img"
            className="text-muted-foreground inline-block"
            animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          >
            <ChevronDown className="h-6 w-6" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
