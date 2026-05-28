/**
 * layout.metadata.test.ts — root generateMetadata shape (A11Y-01, D-01/02/03).
 *
 * Calls the layout's `generateMetadata` export directly and asserts the full
 * SEO shape: metadataBase, openGraph(type:website), twitter(summary_large_image),
 * and hreflang alternates resolved via the REAL getPathname (as-needed: fr→'/',
 * en→'/en', x-default→'/').
 *
 * The layout module top-level pulls in next/font/google + the entire provider
 * tree (ThemeProvider/LenisProvider/Navigation/…) — none of which is needed to
 * call generateMetadata, and next/font is a build-time transform that throws
 * under jsdom. So we mock those module-level imports to no-ops.
 *
 * @/i18n/navigation is mocked with a FAITHFUL getPathname that reproduces the
 * documented localePrefix:'as-needed' contract (defaultLocale 'fr' → no prefix,
 * 'en' → '/en' prefix). The real next-intl createNavigation react-client build
 * statically imports the bare 'next/navigation' specifier, which Vitest's
 * resolver cannot map under jsdom (it externalizes node_modules so resolve.alias
 * does not reach next-intl's internal import). The repo's sibling page.test.tsx
 * mocks this same module for the same reason. The hreflang assertions still
 * verify the load-bearing logic: that generateMetadata composes
 * `${SITE_URL}${getPathname(...)}` into the correct fr-FR/en-US/x-default shape.
 */
import { describe, it, expect, vi } from 'vitest';

// Faithful as-needed getPathname: fr (defaultLocale) gets no prefix, en gets /en.
vi.mock('@/i18n/navigation', () => ({
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    `/${locale}${href === '/' ? '' : href}`,
}));

// next-intl/server: flat resolver so t('tagline') → a string.
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => `t:${key}`),
  setRequestLocale: vi.fn(),
  getMessages: vi.fn(async () => ({})),
}));

// next/font/google is a build-time transform — stub it (returns a className
// carrier) so importing the layout module doesn't throw under jsdom.
vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-sans', className: 'font-inter' }),
}));

// next-intl client provider + hasLocale — only used by the default component,
// not by generateMetadata. Stub to keep the module graph loadable.
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children?: unknown }) => children,
  hasLocale: () => true,
}));

// Provider / layout components — irrelevant to generateMetadata. No-op stubs.
vi.mock('@/components/theme/PaletteFouCScript', () => ({
  PaletteFouCScript: () => null,
}));
vi.mock('@/components/providers/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children?: unknown }) => children,
}));
vi.mock('@/components/providers/LenisProvider', () => ({
  LenisProvider: ({ children }: { children?: unknown }) => children,
}));
vi.mock('@/components/theme/PaletteFab', () => ({ PaletteFab: () => null }));
vi.mock('@/components/layout/Navigation', () => ({ Navigation: () => null }));
vi.mock('@/components/layout/Footer', () => ({ Footer: () => null }));
vi.mock('@/components/layout/CustomCursor', () => ({ CustomCursor: () => null }));
vi.mock('@/components/layout/ConsoleArt', () => ({ ConsoleArt: () => null }));

import { generateMetadata } from './layout';
import { SITE_URL } from '@/lib/constants';

describe('root generateMetadata (A11Y-01)', () => {
  it('returns metadataBase + openGraph(website) + twitter + hreflang(fr/en/x-default)', async () => {
    const md = await generateMetadata({
      params: Promise.resolve({ locale: 'fr' }),
    } as never);

    expect(String(md.metadataBase)).toContain(
      SITE_URL.replace(/^https?:\/\//, ''),
    );
    expect((md.openGraph as { type?: string })?.type).toBe('website');
    expect(md.twitter && (md.twitter as { card?: string }).card).toBe(
      'summary_large_image',
    );

    const langs = md.alternates?.languages as Record<string, string>;
    expect(langs['fr-FR']).toBe(`${SITE_URL}/fr`);
    expect(langs['en-US']).toBe(`${SITE_URL}/en`);
    expect(langs['x-default']).toBe(`${SITE_URL}/fr`);
    expect(md.alternates?.canonical).toBe(`${SITE_URL}/fr`);
  });
});
