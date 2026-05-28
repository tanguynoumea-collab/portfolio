import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/constants';
import { PaletteFouCScript } from '@/components/theme/PaletteFouCScript';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { PaletteFab } from '@/components/theme/PaletteFab';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { ConsoleArt } from '@/components/layout/ConsoleArt';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
 * A11Y-01 (Phase 6 D-01/02/03): full per-route SEO metadata.
 *
 * Expanded from Phase 3's title+description: adds metadataBase (D-01, so the
 * file-based opengraph-image.tsx og:image resolves to an absolute URL),
 * openGraph (type:website) + twitter card (D-02, localized via hero.tagline),
 * and hreflang alternates.languages + canonical (D-03).
 *
 * hreflang is built via next-intl's `getPathname` — NOT hand-built strings —
 * so it survives any routing change and respects localePrefix:'as-needed'
 * (fr canonical at '/', en at '/en'). Pitfall 2: the default locale (fr) must
 * NOT get a '/fr' prefix; getPathname({href:'/', locale:'fr'}) returns '/'.
 *
 * NOTE: this is a SEPARATE export from the default LocaleLayout component — it
 * does NOT touch <head>/PaletteFouCScript/suppressHydrationWarning (Pitfall 6,
 * FOUC regression guard). The OG image is NOT listed in openGraph.images: the
 * file-based opengraph-image.tsx route auto-injects og:image.
 */
function hreflangMap(href: string) {
  return {
    'fr-FR': `${SITE_URL}${getPathname({ href, locale: 'fr' })}`,
    'en-US': `${SITE_URL}${getPathname({ href, locale: 'en' })}`,
    'x-default': `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  const canonical = `${SITE_URL}${getPathname({ href: '/', locale })}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: 'Tanguy Delrieu — Ingénieur BIM',
    description: t('tagline'),
    alternates: {
      canonical,
      languages: hreflangMap('/'),
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: 'Tanguy Delrieu — Ingénieur BIM',
      description: t('tagline'),
      siteName: 'Tanguy Delrieu',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tanguy Delrieu — Ingénieur BIM',
      description: t('tagline'),
    },
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
        {/*
         * DEPLOY-03 (Phase 7 D-08): Vercel Web Analytics + Speed Insights.
         * Both imported from the `/next` entry point (NOT `/react`) so the
         * App Router route-change tracking hooks fire on /fr↔/en + project
         * navigation. They are RSC-safe wrappers that carry their OWN internal
         * client boundary — this layout MUST stay a Server Component, so do
         * NOT add a top-level 'use client'. Mounted as the LAST children of
         * <body> (outside the provider tree — they need no i18n/Theme/Lenis
         * context) per the canonical Vercel placement. Both are no-ops in dev
         * and on non-Vercel hosts; they only beacon on the deployed Vercel
         * production origin (which is why real-beacon verification is HUMAN-UAT
         * in 07-01, alongside the dashboard Enable toggles).
         */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
