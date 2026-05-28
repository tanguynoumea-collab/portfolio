/**
 * app/robots.ts — build-time robots.txt (A11Y-02, D-06).
 *
 * Allow everything except /api/ (defensive/future-proofing — there is no /api/*
 * in v1), and reference the sitemap so crawlers discover all routes. Absolute
 * sitemap URL via SITE_URL (the metadataBase origin).
 */
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
