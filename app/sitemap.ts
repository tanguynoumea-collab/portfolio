/**
 * app/sitemap.ts — build-time static sitemap (A11Y-02, D-05).
 *
 * Slug-driven (NOT a hardcoded route list): one entry per logical URL — home +
 * each getProjectSlugs() project (which skips _* templates, D-24). With 6
 * projects that's 7 entries (1 home + 6), and since every entry carries fr+en
 * alternates the sitemap covers 2 × 7 = 14 localized URLs.
 *
 * Structure (Google-preferred, matches the Next docs localized example):
 * canonical-<loc>-with-alternates. Each entry's <loc> is the FR canonical
 * (localePrefix:'as-needed' serves FR at '/' and '/projects/{slug}'), and the
 * fr/en <xhtml:link> alternates cover both locales. A11Y-02 names '/', '/fr',
 * '/en', project pages: '/fr' redirects to '/' under as-needed so the canonical
 * is '/', and '/en' is in the alternates — full coverage.
 *
 * Absolute URLs via SITE_URL (the metadataBase origin). hreflang pathnames are
 * built with next-intl `getPathname` (as-needed-aware, never hand-built); the
 * dynamic `/projects/${slug}` href uses an `as never` cast, the same precedent
 * the project page uses for its typed <Link> hrefs.
 */
import type { MetadataRoute } from 'next';
import { getPathname } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/constants';
import { getProjectSlugs } from '@/lib/projects';

function abs(href: string, locale: 'fr' | 'en') {
  return `${SITE_URL}${getPathname({ href: href as never, locale })}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs(); // skips _* templates (D-24)
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: abs('/', 'fr'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 1,
    alternates: {
      languages: { 'fr-FR': abs('/', 'fr'), 'en-US': abs('/', 'en') },
    },
  };

  const projects: MetadataRoute.Sitemap = slugs.map((slug) => {
    const href = `/projects/${slug}`;
    return {
      url: abs(href, 'fr'),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: { 'fr-FR': abs(href, 'fr'), 'en-US': abs(href, 'en') },
      },
    };
  });

  return [home, ...projects];
}
