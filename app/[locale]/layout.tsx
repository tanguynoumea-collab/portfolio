import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { PaletteFouCScript } from '@/components/theme/PaletteFouCScript';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { PaletteFab } from '@/components/theme/PaletteFab';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { ConsoleArt } from '@/components/layout/ConsoleArt';

/*
 * LAYOUT-01 (Phase 3): Inter via next/font/google.
 *
 * D-08 / D-09 / D-10:
 *   - subsets: ['latin', 'latin-ext'] — latin-ext covers FR diacritics
 *     (é, è, à, ç, î, ï, ô, ù, û, ÿ, œ, æ, «, », …) that the `latin`
 *     subset alone omits. Non-negotiable for a French-primary audience.
 *   - variable: '--font-sans' — Next injects this CSS variable on the
 *     element that carries `inter.variable` in its className. Combined
 *     with the `@theme inline { --font-sans: var(--font-sans, …) }`
 *     entry in app/globals.css, the Tailwind `font-sans` utility
 *     resolves to Inter at runtime with a graceful system-ui fallback.
 *   - display: 'swap' + preload: true — paint immediately with the
 *     fallback stack, swap when Inter loads. No FOIT. <link rel="preload">
 *     emitted for the route. The LenisProvider's `document.fonts.ready`
 *     hook re-runs `ScrollTrigger.refresh()` once when the swap lands,
 *     so Phase 4 scroll-driven animations fire at the correct positions.
 *   - fallback — explicit system stack mirrored in the @theme inline
 *     entry. next/font also computes a `font-size-adjust` fallback CSS
 *     file to minimize CLS during the swap.
 *
 * No `weight` array specified: Inter ships as a variable font on Google
 * Fonts, so all weights are bundled in a single woff2 file. Specifying
 * weights would actually force discrete subsets and inflate the bundle.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

/*
 * D-12 (Phase 3 LAYOUT-01): minimal localized metadata.
 *
 * Phase 6 (A11Y-01) expands this with og:image, og:locale, hreflang
 * alternates, sitemap entries, twitter:card, theme-color, etc. For
 * Phase 3 we ship a substantive title + a localized description sourced
 * from `hero.tagline` so the document already announces itself
 * correctly to crawlers, screen readers, and OS share sheets.
 */
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'Tanguy Delrieu — Tech × Design × BIM',
    description: t('tagline'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  // D-24: render the copyright year server-side so it's stable across
  // hydration and never drifts between SSR and client. Passed to the
  // Footer as a prop (the Footer is otherwise a leaf client component).
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} font-sans antialiased`}
    >
      <head>
        {/*
         * THEME-05 (Phase 2): pre-hydration palette restore.
         * PaletteFouCScript is a Server Component rendering a Next.js
         * <Script strategy="beforeInteractive"> whose inline body reads
         * palette-v1 from localStorage and applies the 6 --color-* vars on
         * document.documentElement BEFORE React hydrates. Eliminates FOUC on
         * cold load with a stored non-Terra palette.
         *
         * suppressHydrationWarning on <html> above remains required: the FOUC
         * script mutates document.documentElement.style pre-hydration, which
         * would otherwise trigger React hydration mismatch warnings.
         */}
        <PaletteFouCScript />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* THEME-04: ThemeProvider sits INSIDE NextIntlClientProvider so
              palette UI (PalettePresets, CustomColorPicker, etc.) can use
              useTranslations() for localized card names and aria-labels.
              See 02-CONTEXT.md code_context + 02-RESEARCH.md Discretion. */}
          <ThemeProvider>
            {/* LAYOUT-02 (Phase 3 D-11): LenisProvider sits INSIDE
                ThemeProvider so its D-05 effect can read paletteId from
                usePalette() and call ScrollTrigger.refresh() ~450ms after
                each palette swap. Navigation + Footer + CustomCursor are
                INSIDE LenisProvider so they participate in smooth scroll
                (anchor links, cursor positioning relative to lenis.scroll). */}
            <LenisProvider>
              {/* EGG-01 (Phase 3 D-35): ConsoleArt is a mount-only side
                  effect. Rendered as a sibling of <main> so it runs exactly
                  once per cold load (templates re-mount on navigation, but
                  layouts don't). Plan 03-05 (Wave 3) fills the body. */}
              <ConsoleArt />
              {/* LAYOUT-03 (Phase 3 D-13..D-17): fixed-top Navigation with
                  logo + section anchor links + LanguageSwitcher. Plan 03-03
                  (Wave 2) fills the body. */}
              <Navigation />
              {/* <main> is the canonical semantic landmark for primary
                  content (a11y best practice). Page-level files (page.tsx,
                  project pages, etc.) render their <section> tree as
                  children of this <main>. */}
              <main>{children}</main>
              {/* LAYOUT-04 (Phase 3 D-22..D-25): compact bilingual footer.
                  D-24 — year computed server-side here (above) and passed
                  as a prop so SSR/CSR stay in lockstep. Plan 03-04 (Wave 2)
                  fills the body. */}
              <Footer year={currentYear} />
              {/* LAYOUT-06 (Phase 3 D-26..D-30): constrained tracer cursor
                  — native cursor stays visible. Renders null on touch /
                  reduced-motion / forced-colors. Plan 03-05 (Wave 3) fills
                  the body. */}
              <CustomCursor />
              {/* THEME-11: PaletteFab stays the LAST child inside
                  LenisProvider so it visually sits above all chrome and
                  consumes usePalette() (for the vaporwaveUnlockNonce
                  subscription that powers D-14 auto-open on Konami unlock).
                  Position unchanged vs Phase 2 — just relocated one level
                  deeper inside the new LenisProvider wrapper. */}
              <PaletteFab />
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
