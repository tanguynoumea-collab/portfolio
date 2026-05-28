/**
 * sitemap.test.ts — A11Y-02 sitemap coverage.
 *
 * Asserts the slug-driven sitemap: 1 home + N project entries (N = mocked slug
 * count), home canonical = FR at '/', and each entry carries fr/en alternates
 * (so the localized-URL count = 2 × (1 + N)). The project canonical is the FR
 * path and the en alternate is the /en-prefixed path.
 *
 * SLUGS uses the REAL project slugs (the 6 .fr.mdx files, _template excluded);
 * assertions derive counts from SLUGS.length so adding a project keeps the test
 * correct without edits. @/i18n/navigation is mocked with a faithful as-needed
 * getPathname (fr → no prefix, en → /en) — next-intl's react-client build's
 * bare 'next/navigation' import is unresolvable under jsdom (same reason
 * page.test.tsx / the metadata tests mock this module).
 */
import { describe, it, expect, vi } from 'vitest';

const SLUGS = [
  'agora',
  'brand-system',
  'editorial-grid',
  'residential-renovation',
  'texture-manager',
  'tower-concept',
];

vi.mock('@/i18n/navigation', () => ({
  // localePrefix:'always' — every locale (incl. default fr) gets a prefix.
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    `/${locale}${href === '/' ? '' : href}`,
}));

vi.mock('@/lib/projects', () => ({
  getProjectSlugs: vi.fn(async () => SLUGS),
}));

import sitemap from './sitemap';
import { SITE_URL } from '@/lib/constants';

describe('sitemap (A11Y-02)', () => {
  it('returns 1 home + N project entries, each with fr/en alternates', async () => {
    const entries = await sitemap();

    // 1 home + one entry per slug.
    expect(entries).toHaveLength(1 + SLUGS.length);

    // Home canonical = FR at '/fr' (always-prefixed), en alternate = '/en'.
    expect(entries[0]!.url).toBe(`${SITE_URL}/fr`);
    expect(entries[0]!.alternates?.languages?.['fr-FR']).toBe(`${SITE_URL}/fr`);
    expect(entries[0]!.alternates?.languages?.['en-US']).toBe(`${SITE_URL}/en`);

    // Every entry carries both fr+en alternates → 2 × (1 + N) localized URLs.
    const altUrls = entries.flatMap((e) =>
      Object.values(e.alternates?.languages ?? {}),
    );
    expect(altUrls).toHaveLength(2 * (1 + SLUGS.length));

    // Project entry canonical = FR /fr/projects/{slug}; en alternate is /en-prefixed.
    const proj = entries.find((e) =>
      e.url.includes('/projects/texture-manager'),
    );
    expect(proj?.url).toBe(`${SITE_URL}/fr/projects/texture-manager`);
    expect(proj?.alternates?.languages?.['en-US']).toBe(
      `${SITE_URL}/en/projects/texture-manager`,
    );
  });
});
