'use client';

/**
 * components/layout/LanguageSwitcher.tsx — LAYOUT-05 segmented FR|EN switcher.
 *
 * Decisions wired:
 *   - D-18: segmented control with two buttons. The active locale's button
 *     hosts a <motion.span layoutId="lang-indicator"> that morphs across as
 *     the user swaps — shared-element transition via motion's layout engine.
 *     No flag icons (LAYOUT-05 explicitly excludes them).
 *   - D-19: locale switch via useRouter().replace from @/i18n/navigation
 *     (the LOCALE-AWARE navigation module — NOT next/navigation). The route
 *     change is wrapped in startTransition so the UI stays interactive while
 *     next-intl swaps the messages bundle. A separate useEffect imperatively
 *     mirrors useLocale() onto document.documentElement.lang because
 *     next-intl's router does NOT re-render the <html> element — only
 *     descendants below the Server boundary.
 *   - D-20: aria-pressed on each button reflects the active locale.
 *     aria-label sources from the localized nav.lang.switchTo template, so
 *     "Passer en FR" / "Switch to FR" / etc. are properly translated.
 *   - D-21: scroll position preserved across the locale swap. We capture
 *     either lenis.actualScroll (when Lenis is mounted) or window.scrollY
 *     (reduced-motion fallback) BEFORE the navigation, then on the next
 *     animation frame call lenis.scrollTo(savedY, {immediate: true}) or
 *     window.scrollTo(0, savedY). Without this, users get teleported to top
 *     mid-scroll.
 *
 * Colors are all Tailwind utilities backed by --color-* tokens
 * (border-border, bg-background, bg-primary, text-primary-foreground,
 * text-muted-foreground). The motion indicator is `bg-primary` — auto-recolors
 * via the shadcn alias chain when ThemeProvider mutates --color-accent.
 *
 * No color literals. The native cursor stays visible (per CustomCursor
 * takeover anti-feature exclusion in REQUIREMENTS.md L130).
 */

import { useEffect, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { useLenis } from '@/components/providers/LenisProvider';
import { cn } from '@/lib/utils';

const LOCALES = ['fr', 'en'] as const;
type Locale = (typeof LOCALES)[number];

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('nav.lang');
  const [isPending, startTransition] = useTransition();
  const lenis = useLenis();

  // D-19: keep <html lang> imperatively in sync with useLocale() so screen
  // readers and CSS :lang() selectors react instantly to the swap. next-intl
  // updates the URL but not the <html> element on its own.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  /**
   * Switch to the target locale.
   *
   * Steps (D-19 + D-21):
   *   1. Capture the current scroll position (Lenis if available; native
   *      window.scrollY fallback under reduced-motion or before Lenis mounts).
   *   2. router.replace inside startTransition so next-intl's message-bundle
   *      swap doesn't freeze the UI.
   *   3. On the next animation frame (after the route data has started
   *      streaming), restore the scroll position. immediate:true on the
   *      Lenis path skips the smooth-scroll animation — we are RESTORING a
   *      position, not navigating to it.
   *
   * The router.replace argument shape is the locale-aware object form:
   *     replace({ pathname, params }, { locale: target })
   * — params is required when the current route has dynamic segments. The
   * `Parameters<typeof router.replace>[0]` cast keeps TS strict happy with
   * next-intl 4.12's overloaded signature while preserving the runtime shape.
   */
  const switchTo = (target: Locale) => {
    if (target === locale) return;
    const scrollY = lenis
      ? lenis.actualScroll
      : typeof window !== 'undefined'
        ? window.scrollY
        : 0;
    startTransition(() => {
      router.replace(
        { pathname, params } as Parameters<typeof router.replace>[0],
        { locale: target },
      );
    });
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        if (lenis) lenis.scrollTo(scrollY, { immediate: true });
        else window.scrollTo(0, scrollY);
      });
    }
  };

  return (
    <div
      role="group"
      aria-label={t('label')}
      className="border-border bg-background relative inline-flex items-center gap-1 rounded-full border p-1 text-sm"
    >
      {LOCALES.map((target) => {
        const isActive = target === locale;
        return (
          <button
            key={target}
            type="button"
            onClick={() => switchTo(target)}
            aria-pressed={isActive}
            aria-label={t('switchTo', { target: target.toUpperCase() })}
            disabled={isPending}
            data-active={isActive ? 'true' : 'false'}
            className="relative z-10 px-3 py-1 font-medium transition-colors disabled:cursor-wait"
          >
            {isActive && (
              <motion.span
                layoutId="lang-indicator"
                aria-hidden="true"
                className="bg-primary absolute inset-0 -z-10 rounded-full"
                transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
              />
            )}
            <span
              className={cn(
                isActive ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {target.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
