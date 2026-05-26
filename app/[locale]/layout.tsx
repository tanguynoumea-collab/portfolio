import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';

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
         * Phase 2 (THEME-05) will inject the palette FOUC blocking script here.
         * Expected shape in Phase 2:
         *   <Script id="palette-fouc" strategy="beforeInteractive">
         *     {`(function(){try{var raw=localStorage.getItem('palette-v1');...})()`}
         *   </Script>
         * OR inline via dangerouslySetInnerHTML — pattern documented in
         * .planning/research/PITFALLS.md Pitfall #1.
         *
         * For Phase 1, this <head> is intentionally empty — it is the integration
         * socket. The suppressHydrationWarning on <html> above is required because
         * Phase 2's script will mutate document.documentElement.style pre-hydration,
         * which would otherwise trigger React hydration mismatch warnings.
         */}
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
