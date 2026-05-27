'use client';

/**
 * components/layout/Navigation.tsx — LAYOUT-03 fixed-top navigation.
 *
 * Wave 2 of Phase 3. Replaces the Plan 02 stub body; the export name and
 * import site in `app/[locale]/layout.tsx` are unchanged.
 *
 * Decisions wired:
 *   - D-13: transparent at scrollY=0 -> bg-background/80 + backdrop-blur-md +
 *     border-b after scrolling >50px. Listens on the native `scroll` event
 *     (Lenis dispatches the same event for compatibility — verified vs the
 *     LenisProvider bridge). Under reduced-motion, Lenis is skipped entirely
 *     and the listener attaches to the native scroll directly.
 *   - D-14: logo left, section links centered (md+), LanguageSwitcher always
 *     on the right. The palette FAB is NOT here — it stays a sibling
 *     floating button so it can float above all chrome (THEME-11 contract).
 *   - D-15: section links are plain <a href="#id"> — Lenis `anchors: true`
 *     (Plan 01 D-03) handles the smooth-scroll. No JS click handler, no
 *     preventDefault. Active link gets aria-current="true" via useActiveSection.
 *   - D-16: below md, section links collapse into a Sheet side="left" (we
 *     pick left so it does not collide with the palette switcher's
 *     right-anchored Sheet from Phase 2). SheetContent root carries
 *     data-lenis-prevent per D-04
 *     so Lenis virtualization skips the menu's internal scroll.
 *   - D-17: wordmark "Tanguy" in text-primary (= var(--color-accent) through
 *     the shadcn alias chain). Clicks navigate to /{locale} via next/link
 *     (locale-aware) — Lenis anchors handle the same-page case.
 *
 * Colors are all routed through Tailwind utilities backed by --color-* tokens
 * (bg-background, text-foreground, text-muted-foreground, border-border,
 * text-primary). No hex/rgb/hsl/oklch literals. No cursor: none.
 */

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import {
  useActiveSection,
  NAV_SECTION_IDS,
} from '@/lib/hooks/useActiveSection';
import { cn } from '@/lib/utils';

export function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const activeId = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // D-13: scrollY > 50 toggles solid/blur state. Read scrollY synchronously
  // on mount in case the page loaded scrolled (browser scroll restoration).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Render the 5 section anchor links. Returns an array of <a> elements so
   * the same set can be used in both the desktop nav (centered) and the
   * mobile Sheet (stacked vertically) without duplicating href strings.
   *
   * onClick (optional) fires after the native anchor follows — used by the
   * mobile path to close the Sheet after the user picks a section. Lenis
   * anchors:true (Plan 01 D-03) handles the smooth-scroll itself; we do
   * NOT preventDefault.
   */
  const renderLinks = (onClick?: () => void) =>
    NAV_SECTION_IDS.map((id) => (
      <a
        key={id}
        href={`#${id}`}
        onClick={onClick}
        aria-current={activeId === id ? 'true' : undefined}
        className={cn(
          'text-sm font-medium transition-colors',
          activeId === id
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {t(id)}
      </a>
    ));

  return (
    <header
      role="navigation"
      aria-label={t('home')}
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-background/80 border-b border-border backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* D-17: wordmark logo. text-primary resolves via shadcn alias chain
            to var(--color-accent), so it auto-recolors on palette swap. */}
        <Link
          href={`/${locale}`}
          className="text-primary text-lg font-semibold tracking-tight"
        >
          Tanguy
        </Link>

        {/* D-14: desktop section links centered (md+). Below md the inner
            <nav> is hidden and the hamburger Sheet takes over. */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label={t('home')}
        >
          {renderLinks()}
        </nav>

        {/* Right cluster: LanguageSwitcher always visible; hamburger only on
            mobile (<md). The Sheet itself stays mounted on all viewports —
            Radix gates portal mount on `open` so there is no DOM cost when
            closed. */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="text-muted-foreground hover:text-foreground rounded-md p-2 md:hidden"
              aria-label={t('home')}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            {/* D-04 + D-16: data-lenis-prevent on the SheetContent root so
                Lenis virtualization skips the menu's internal scroll. side=
                "left" so it does not collide with the palette switcher's
                right-anchored Sheet (Phase 2 D-04). */}
            <SheetContent side="left" data-lenis-prevent>
              <SheetHeader>
                <SheetTitle>Tanguy</SheetTitle>
              </SheetHeader>
              <nav
                className="mt-6 flex flex-col gap-4 px-4"
                aria-label={t('home')}
              >
                {renderLinks(() => setOpen(false))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
