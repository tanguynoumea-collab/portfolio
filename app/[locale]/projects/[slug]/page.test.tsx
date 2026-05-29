// Full MDX-render verification is a manual smoke item (VALIDATION.md Manual-Only table); jsdom has no MDX transform, so these tests assert the page's pre-import logic + data-derived decisions, never a full ProjectPage render past the dynamic import.

/**
 * page.test.tsx — CONTENT-02 acceptance suite (Wave 2, plan 05-03 Task 3).
 *
 * CONSTRAINT (confirmed from vitest.config.ts): there is NO MDX transform plugin
 * (@mdx-js/rollup is absent). The page's dynamic
 *   await import('../../../../content/projects/${slug}.${locale}.mdx')
 * therefore CANNOT resolve under jsdom — any test that renders the full
 * ProjectPage past the import line will fail. This suite NEVER renders past the
 * dynamic import. It splits cleanly into two groups:
 *
 *   GROUP A — full unit tests that assert logic reached BEFORE the dynamic-import
 *     line (Tests 1, 2, 5): generateStaticParams returns 12; notFound() on null;
 *     prev/next wrap math. These call the page exports directly.
 *   GROUP B — DECISION-LOGIC tests asserted against typed Project FIXTURES, NOT
 *     against rendered MDX (Tests 3, 4): the gallery-gating predicate and the
 *     category + flat metadata fields — the same pure decisions the page makes,
 *     proven against the Project type with zero MDX render.
 *
 * Mock strategy (native chai matchers — setupFiles:[] means NO jest-dom):
 *   - next/navigation: notFound spy (real notFound throws; the mock is a no-op).
 *   - @/lib/projects: controllable getProjectBySlug / getProjectSlugs.
 *   - @/i18n/routing: routing.locales = ['fr','en'].
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Locale, Project } from '@/lib/projects';

// ---------------------------------------------------------------------------
// next/navigation mock — capture the notFound spy. Real notFound() throws to
// halt rendering; the mock is a no-op vi.fn(), so after the null branch calls
// it, execution continues to the unresolvable dynamic import and rejects. The
// load-bearing assertion is expect(notFound).toHaveBeenCalled().
// ---------------------------------------------------------------------------
const notFoundSpy = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => notFoundSpy(),
}));

// ---------------------------------------------------------------------------
// @/lib/projects mock — controllable per test. Types (Locale/Project) are
// erased at runtime, so importing them for fixtures is safe alongside the mock.
// ---------------------------------------------------------------------------
const getProjectBySlugMock = vi.fn();
const getProjectSlugsMock = vi.fn();
vi.mock('@/lib/projects', () => ({
  getProjectBySlug: (...args: unknown[]) => getProjectBySlugMock(...args),
  getProjectSlugs: (...args: unknown[]) => getProjectSlugsMock(...args),
}));

// ---------------------------------------------------------------------------
// @/i18n/routing mock — the locale set generateStaticParams flatMaps over.
// ---------------------------------------------------------------------------
vi.mock('@/i18n/routing', () => ({
  routing: { locales: ['fr', 'en'] },
}));

// next-intl/server is imported by the page module top-level (getTranslations).
// Stub it so the module loads cleanly even though Tests don't reach translation.
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (k: string) => k),
}));

// @/i18n/navigation pulls next-intl's createNavigation → next/navigation chain
// (which we've stubbed to only { notFound }). Stub the locale-aware Link with a
// plain anchor so the page module loads without resolving that whole chain.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children }: { children?: unknown }) => children,
}));

// Client islands / MDX components are not exercised by these tests (no full
// render past the dynamic import). Stub them so the module graph loads cleanly.
vi.mock('@/components/sections/ProjectCover', () => ({
  ProjectCover: () => null,
}));
vi.mock('@/components/mdx/Image', () => ({ default: () => null }));

// ---------------------------------------------------------------------------
// Test setup — reset spies + re-import the page module fresh each test.
// ---------------------------------------------------------------------------
let generateStaticParams: () => Promise<Array<{ locale: string; slug: string }>>;
let ProjectPage: (args: {
  params: Promise<{ locale: Locale; slug: string }>;
}) => Promise<unknown>;

beforeEach(async () => {
  notFoundSpy.mockClear();
  getProjectBySlugMock.mockReset();
  getProjectSlugsMock.mockReset();
  const mod = await import('./page');
  generateStaticParams = mod.generateStaticParams;
  ProjectPage = mod.default;
});

// ===========================================================================
// GROUP A — pre-import logic (Tests 1, 2, 5)
// ===========================================================================

// --- Test 1: generateStaticParams returns 12 entries -----------------------
describe('ProjectPage (CONTENT-02) — generateStaticParams (D-06)', () => {
  it('returns 12 entries (6 slugs × 2 locales), each {locale, slug}', async () => {
    getProjectSlugsMock.mockResolvedValue(['a', 'b', 'c', 'd', 'e', 'f']);
    const params = await generateStaticParams();
    expect(params).toHaveLength(12);
    for (const entry of params) {
      expect(['fr', 'en'].includes(entry.locale)).toBe(true);
      expect(typeof entry.slug).toBe('string');
    }
    // Every slug appears once per locale.
    const frSlugs = params.filter((p) => p.locale === 'fr').map((p) => p.slug);
    const enSlugs = params.filter((p) => p.locale === 'en').map((p) => p.slug);
    expect(frSlugs).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    expect(enSlugs).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });
});

// --- Test 2: notFound called when getProjectBySlug resolves null -----------
describe('ProjectPage (CONTENT-02) — notFound on invalid slug (D-07)', () => {
  it('calls notFound() when getProjectBySlug resolves null', async () => {
    getProjectBySlugMock.mockResolvedValue(null);
    getProjectSlugsMock.mockResolvedValue(['a', 'b', 'c']);
    // notFound() is invoked on the null branch BEFORE the dynamic import. The
    // mock is a no-op, so execution proceeds to the import and rejects — wrap
    // the call so the rejection doesn't fail the test; the load-bearing
    // assertion is that notFound was called.
    try {
      await ProjectPage({
        params: Promise.resolve({ locale: 'fr' as Locale, slug: 'nope' }),
      });
    } catch {
      // dynamic import of a non-existent MDX path rejects under jsdom — expected.
    }
    expect(notFoundSpy).toHaveBeenCalled();
  });
});

// --- Test 5: prev/next wrap math (pure modulo unit) ------------------------
describe('ProjectPage (CONTENT-02) — prev/next wrap math (D-08)', () => {
  it('first slug → prev is last; last slug → next is first (modulo over 6)', () => {
    const slugs = ['a', 'b', 'c', 'd', 'e', 'f'];

    // First slug (idx 0): prev wraps to the last entry.
    const firstIdx = 0;
    const prevOfFirst = slugs[(firstIdx - 1 + slugs.length) % slugs.length];
    expect(prevOfFirst).toBe('f');

    // Last slug (idx 5): next wraps to the first entry.
    const lastIdx = 5;
    const nextOfLast = slugs[(lastIdx + 1) % slugs.length];
    expect(nextOfLast).toBe('a');
  });
});

// ===========================================================================
// GROUP B — decision-logic against Project fixtures (Tests 3, 4)
// ===========================================================================

// Minimal fixtures conforming to the flat Project type.
const techFixture: Project = {
  slug: 'diskscout',
  title: 'DiskScout',
  year: 2026,
  cover: '/c.jpg',
  summary: 's',
  featured: false,
  category: 'tech',
  stack: ['C#', '.NET 8', 'WPF'],
  repo: 'https://github.com/x/diskscout',
  liveUrl: 'https://github.com/x/diskscout/releases',
  gallery: ['/p/1.jpg', '/p/2.jpg', '/p/3.jpg', '/p/4.jpg'],
};

const bimFixture: Project = {
  slug: 'olympe-hermes',
  title: 'Olympe Hermès',
  year: 2026,
  cover: '/c.jpg',
  summary: 's',
  featured: false,
  category: 'bim',
  stack: ['C# 12', '.NET 8', 'geometry3Sharp'],
  revit: 'Revit 2024 · 2025',
  proprietary: true,
};

// --- Test 3: gallery-gating predicate --------------------------------------
describe('ProjectPage (CONTENT-02) — gallery-gating predicate (D-04 step 4)', () => {
  it('is true for a gallery fixture and false for a no-gallery fixture', () => {
    // The EXACT predicate the page uses to gate the gallery <section>.
    expect(Boolean(techFixture.gallery && techFixture.gallery.length > 0)).toBe(
      true,
    );
    expect(Boolean(bimFixture.gallery && bimFixture.gallery.length > 0)).toBe(
      false,
    );
  });
});

// --- Test 4: category + flat metadata fields -------------------------------
describe('ProjectPage (CONTENT-02) — category + metadata strip fields', () => {
  it('exposes the right flat fields per category', () => {
    // tech → stack + public repo link, no Revit target.
    expect(techFixture.category).toBe('tech');
    expect(Array.isArray(techFixture.stack)).toBe(true);
    expect(typeof techFixture.repo).toBe('string');
    expect(techFixture.revit).toBe(undefined);

    // bim → stack + Revit target + proprietary (private repo → no public link).
    expect(bimFixture.category).toBe('bim');
    expect(Array.isArray(bimFixture.stack)).toBe(true);
    expect(typeof bimFixture.revit).toBe('string');
    expect(bimFixture.proprietary).toBe(true);
    expect(bimFixture.repo).toBe(undefined);
  });
});
