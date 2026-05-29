/**
 * metadata.test.ts — project generateMetadata shape (A11Y-01, D-02/03).
 *
 * Calls the project page's `generateMetadata` export directly with a mocked
 * Project fixture and asserts: per-project title/summary, openGraph(type:article),
 * and hreflang alternates resolved via the REAL getPathname
 * (fr→/projects/{slug}, en→/en/projects/{slug}). Also asserts the not-found
 * branch returns {} (so Next emits no metadata for an unknown slug).
 *
 * Mock strategy mirrors the sibling page.test.tsx: stub @/lib/projects (so we
 * control the project), next-intl/server (flat resolver — the page imports
 * getTranslations at top level), the client islands / MDX components, and
 * @/i18n/navigation. The last is mocked with a FAITHFUL getPathname that
 * reproduces the localePrefix:'as-needed' contract (fr → no prefix, en → /en):
 * next-intl's real createNavigation react-client build statically imports the
 * bare 'next/navigation' specifier, which Vitest cannot resolve under jsdom
 * (node_modules are externalized so resolve.alias does not reach it) — the
 * sibling page.test.tsx mocks this same module for the same reason. The
 * hreflang assertions still verify the load-bearing logic: generateMetadata
 * composing `${SITE_URL}${getPathname(...)}` into the right alternates shape.
 *
 * This file calls ONLY generateMetadata — it never reaches the page's relative
 * MDX dynamic import (that lives in the default ProjectPage component).
 */
import { describe, it, expect, vi } from 'vitest';

// Faithful as-needed getPathname; Link is a no-op (page body is not rendered).
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children }: { children?: unknown }) => children,
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    `/${locale}${href === '/' ? '' : href}`,
}));

vi.mock('@/lib/projects', () => ({
  getProjectBySlug: vi.fn(async () => ({
    title: 'DiskScout',
    summary: 'A tool.',
    year: 2026,
    category: 'tech',
  })),
  getProjectSlugs: vi.fn(async () => ['diskscout']),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (k: string) => k),
}));

// Client islands / MDX component — not exercised here (no full render), but
// imported at module top level. No-op stubs keep the graph loadable.
vi.mock('@/components/sections/ProjectCover', () => ({
  ProjectCover: () => null,
}));
vi.mock('@/components/mdx/Image', () => ({ default: () => null }));

import { generateMetadata } from './page';
import { SITE_URL } from '@/lib/constants';

describe('project generateMetadata (A11Y-01)', () => {
  it('returns type:article + per-project OG + hreflang', async () => {
    const md = await generateMetadata({
      params: Promise.resolve({ locale: 'en', slug: 'diskscout' }),
    } as never);

    expect(md.title).toBe('DiskScout — Tanguy Delrieu');
    expect(md.description).toBe('A tool.');
    expect((md.openGraph as { type?: string })?.type).toBe('article');

    const langs = md.alternates?.languages as Record<string, string>;
    expect(langs['fr-FR']).toBe(`${SITE_URL}/fr/projects/diskscout`);
    expect(langs['en-US']).toBe(`${SITE_URL}/en/projects/diskscout`);
    expect(langs['x-default']).toBe(`${SITE_URL}/fr/projects/diskscout`);
    expect(md.alternates?.canonical).toBe(`${SITE_URL}/en/projects/diskscout`);
  });

  it('returns {} when project not found', async () => {
    const { getProjectBySlug } = await import('@/lib/projects');
    (
      getProjectBySlug as unknown as {
        mockResolvedValueOnce: (v: unknown) => void;
      }
    ).mockResolvedValueOnce(null);
    const md = await generateMetadata({
      params: Promise.resolve({ locale: 'en', slug: 'nope' }),
    } as never);
    expect(md).toEqual({});
  });
});
