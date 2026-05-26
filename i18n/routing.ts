import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // D-17: with 2 locales, both end up always prefixed in URLs (/fr, /en)
});
