'use client';

/**
 * app/[locale]/not-found.tsx — EGG-02 custom 404 + A11Y-03 (Phase 6 D-07).
 *
 * Rendered when an unmatched URL resolves under the [locale] segment OR when a
 * nested segment calls notFound() (the project page does so on a null slug,
 * Phase 5 D-07). Returns an HTTP 404 status and is auto-noindex'd by Next.js, so
 * the whole file being a Client Component carries ZERO SEO cost.
 *
 * 'use client' + useTranslations: next-intl recommends the client useTranslations
 * for localized not-found pages. It works without reading params because this
 * file renders INSIDE [locale]/layout.tsx's NextIntlClientProvider, which passes
 * the FULL message bundle — so errors.404.* is available client-side. The page
 * accepts NO props (not-found.tsx cannot read params).
 *
 * i18n: reuses the EXISTING errors.404 keys (Phase 1 ARCH-07) — title
 * "Page introuvable", message "...perdu dans le pixel art.", back
 * "Retour à l'accueil". No new keys authored (parity preserved).
 *
 * Reduced-motion (A11Y-05): useReducedMotion() from motion/react gates the entry
 * animation. Default = fade + scale (opacity 0→1, scale 0.95→1); reduced =
 * opacity-only (NO scale), so motion-sensitive users get a plain fade. Mirrors
 * the Hero / ProjectCard reduced-motion contract.
 *
 * Back link: shadcn <Button asChild> wraps the locale-aware <Link href="/"> from
 * @/i18n/navigation, which auto-prefixes the active locale (fr→'/', en→'/en').
 *
 * Colors: palette CSS-var aliases only (text-accent, text-foreground,
 * text-muted-foreground) — NO hardcoded color, so palette switching repaints the
 * 404 without a rebuild.
 */

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('errors.404');
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <span className="text-accent text-8xl font-bold tracking-tight">
          404
        </span>
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('message')}</p>
        <Button asChild>
          <Link href="/">{t('back')}</Link>
        </Button>
      </motion.div>
    </div>
  );
}
