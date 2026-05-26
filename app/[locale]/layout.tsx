import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { PaletteFouCScript } from '@/components/theme/PaletteFouCScript';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PaletteFab } from '@/components/theme/PaletteFab';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

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

  return (
    <html lang={locale} suppressHydrationWarning>
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
            {children}
            {/* THEME-11: PaletteFab mounts as a SIBLING of {children} inside
                ThemeProvider so it can consume usePalette() (for the
                vaporwaveUnlockNonce subscription that powers D-14 auto-open
                on Konami unlock) and inside NextIntlClientProvider so its
                aria-label can be localized via useTranslations('palette').
                Visible on every /fr/* and /en/* route. */}
            <PaletteFab />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
