import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr',
  localePrefix: 'always', // Fix (Phase 7): 'as-needed' served FR at bare '/' via a rewrite that
  // dropped the <html lang>/<title>/<main> wrapper on Vercel (broken root). 'always' makes '/'
  // cleanly 307-redirect to '/fr' and serves the full localized layout at /fr (like /en). Matches
  // the original D-16 intent ("/ redirects to /{locale}, no content served at /").
});
