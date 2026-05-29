/**
 * ProjectCard.test.tsx — HOME-04 acceptance suite.
 *
 * Covers the HOME-04 contract against the flat Project model (2 categories):
 *   1. Renders title + year + summary from project prop
 *   2. Category badge variant matches project.category (category-bim / category-tech)
 *      and its label comes from i18n (filters.bim / filters.tech)
 *   3. Footer renders up to 3 metadata tags: Revit version first (BIM tools),
 *      then the tech stack
 *   4. Link from @/i18n/navigation has href=/projects/{slug}
 *   5. Link aria-label includes project title + viewProject label
 *   6. whileHover is undefined under useReducedMotion()===true
 *   7. whileHover is { scale: 1.02 } under useReducedMotion()===false
 *
 * Mock strategy:
 *   - next-intl mocked with viewProject + filters.* keys
 *   - next/image stubbed as a plain <img> tag so getByAltText works
 *   - @/i18n/navigation Link rendered as a real <a> so href assertions work
 *   - motion/react: motion.div + motion.span return real React elements
 *     with whileHover serialized to data-while-hover (string JSON) so tests
 *     can assert the gate (Pitfall 4-B)
 *   - useReducedMotion is a per-test settable mock (defaults to false)
 *   - @/components/ui/badge.Badge passes data-variant + data-slot through
 *   - lucide-react ArrowUpRight stubbed as a no-op <svg>
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/projects';

// next-intl mock — viewProject (aria-label) + filters.* (category badge label)
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      viewProject: 'View project',
      'filters.bim': 'BIM·Revit',
      'filters.tech': 'Outils',
    };
    return map[k] ?? k;
  },
}));

// next/image stub — render an <img> with alt + src passthrough
vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    ...rest
  }: { alt?: string; src?: string } & Record<string, unknown>) =>
    React.createElement('img', { alt, src, ...rest }),
}));

// @/i18n/navigation Link → real <a> so href + aria-label assertions work
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & Record<string, unknown>) =>
    React.createElement(
      'a',
      { href, ...rest } as Record<string, unknown>,
      children as ReactNode,
    ),
}));

// useReducedMotion — per-test settable so Pitfall 4-B branches both exercise
const useReducedMotionMock = vi.fn<() => boolean>(() => false);

// motion/react — render real React elements. whileHover serialized to a
// data attribute so tests can assert the reduced-motion gate without
// running the actual motion engine.
vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      whileHover,
      ...rest
    }: {
      children?: ReactNode;
      whileHover?: unknown;
    } & Record<string, unknown>) =>
      React.createElement(
        'div',
        {
          ...rest,
          'data-while-hover':
            whileHover === undefined ? 'undefined' : JSON.stringify(whileHover),
        } as Record<string, unknown>,
        children as ReactNode,
      ),
    span: ({
      children,
      whileHover,
      ...rest
    }: {
      children?: ReactNode;
      whileHover?: unknown;
    } & Record<string, unknown>) =>
      React.createElement(
        'span',
        {
          ...rest,
          'data-while-hover':
            whileHover === undefined ? 'undefined' : JSON.stringify(whileHover),
        } as Record<string, unknown>,
        children as ReactNode,
      ),
  },
  useReducedMotion: () => useReducedMotionMock(),
}));

// Badge mock with data-variant passthrough so category variant is verifiable
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
    ...rest
  }: {
    children?: ReactNode;
    variant?: string;
  } & Record<string, unknown>) =>
    React.createElement(
      'span',
      {
        'data-slot': 'badge',
        'data-variant': variant,
        ...rest,
      } as Record<string, unknown>,
      children as ReactNode,
    ),
}));

// lucide-react icon stubs
vi.mock('lucide-react', () => ({
  ArrowUpRight: (props: Record<string, unknown>) =>
    React.createElement('svg', { ...props, 'data-icon': 'ArrowUpRight' }),
}));

// ----- Fixtures -----

const techProject: Project = {
  slug: 'diskscout',
  title: 'DiskScout',
  year: 2026,
  category: 'tech',
  cover: '/projects/diskscout/cover.jpg',
  summary: 'Windows disk analyzer and cleaner with an AI-assisted safety audit.',
  featured: true,
  stack: ['C#', '.NET 8', 'WPF', 'P/Invoke', 'xxHash3'],
  repo: 'https://github.com/x/diskscout',
};

const bimProject: Project = {
  slug: 'olympe-hermes',
  title: 'Olympe Hermès',
  year: 2026,
  category: 'bim',
  cover: '/projects/olympe-hermes/cover.jpg',
  summary: 'Revit extension for room-to-object parameter transfer.',
  featured: true,
  revit: 'Revit 2024 · 2025',
  stack: ['C# 12', '.NET 8', 'WPF', 'geometry3Sharp'],
  proprietary: true,
};

beforeEach(() => {
  useReducedMotionMock.mockReset();
  useReducedMotionMock.mockReturnValue(false);
});

describe('ProjectCard (HOME-04) — content rendering', () => {
  it('renders title, year, and summary for a tech project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    render(<ProjectCard project={techProject} />);
    expect(screen.getByText(/DiskScout/)).toBeTruthy();
    expect(screen.getByText(/2026/)).toBeTruthy();
    expect(screen.getByText(/Windows disk analyzer/)).toBeTruthy();
  });

  it('renders cover image with project.cover as src + project.title as alt', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('DiskScout');
    expect(img?.getAttribute('src')).toBe('/projects/diskscout/cover.jpg');
  });
});

describe('ProjectCard (HOME-04) — category badge variant + label', () => {
  it('uses category-tech variant + "Outils" label for a tech project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const categoryBadge = container.querySelector(
      'span[data-variant="category-tech"]',
    );
    expect(categoryBadge).not.toBeNull();
    expect(categoryBadge?.textContent).toBe('Outils');
  });

  it('uses category-bim variant + "BIM·Revit" label for a bim project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={bimProject} />);
    const categoryBadge = container.querySelector(
      'span[data-variant="category-bim"]',
    );
    expect(categoryBadge).not.toBeNull();
    expect(categoryBadge?.textContent).toBe('BIM·Revit');
  });
});

describe('ProjectCard (HOME-04) — metadata footer (revit + stack, capped at 3)', () => {
  it('tech project footer shows stack[0..2] as outline badges', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const outlineBadges = container.querySelectorAll(
      'span[data-variant="outline"]',
    );
    // No revit → first 3 stack items.
    expect(outlineBadges).toHaveLength(3);
    expect(outlineBadges[0]?.textContent).toBe('C#');
    expect(outlineBadges[1]?.textContent).toBe('.NET 8');
    expect(outlineBadges[2]?.textContent).toBe('WPF');
  });

  it('bim project footer shows Revit version first, then stack (capped at 3)', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={bimProject} />);
    const outlineBadges = container.querySelectorAll(
      'span[data-variant="outline"]',
    );
    // revit + first 2 stack items = 3 badges.
    expect(outlineBadges).toHaveLength(3);
    expect(outlineBadges[0]?.textContent).toBe('Revit 2024 · 2025');
    expect(outlineBadges[1]?.textContent).toBe('C# 12');
    expect(outlineBadges[2]?.textContent).toBe('.NET 8');
  });
});

describe('ProjectCard (HOME-04) — locale-aware Link', () => {
  it('Link href is /projects/{slug}', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/projects/diskscout');
  });

  it('Link has aria-label containing project title + viewProject text', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const link = container.querySelector('a');
    const ariaLabel = link?.getAttribute('aria-label') ?? '';
    expect(ariaLabel).toMatch(/DiskScout/);
    expect(ariaLabel).toMatch(/View project/);
  });
});

describe('ProjectCard (HOME-04) — useReducedMotion gate (Pitfall 4-B)', () => {
  it('whileHover is undefined when useReducedMotion() returns true', async () => {
    useReducedMotionMock.mockReturnValue(true);
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const motionDivs = container.querySelectorAll('div[data-while-hover]');
    expect(motionDivs.length).toBeGreaterThan(0);
    const cardWrapper = motionDivs[0];
    expect(cardWrapper?.getAttribute('data-while-hover')).toBe('undefined');
  });

  it('whileHover is { scale: 1.02 } when useReducedMotion() returns false', async () => {
    useReducedMotionMock.mockReturnValue(false);
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const motionDivs = container.querySelectorAll('div[data-while-hover]');
    expect(motionDivs.length).toBeGreaterThan(0);
    const cardWrapper = motionDivs[0];
    const serialized = cardWrapper?.getAttribute('data-while-hover');
    expect(serialized).not.toBe('undefined');
    const parsed = JSON.parse(serialized ?? '{}') as { scale?: number };
    expect(parsed.scale).toBe(1.02);
  });

  it('arrow whileHover is undefined when useReducedMotion() returns true', async () => {
    useReducedMotionMock.mockReturnValue(true);
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const motionSpans = container.querySelectorAll('span[data-while-hover]');
    expect(motionSpans.length).toBeGreaterThan(0);
    const arrowWrapper = motionSpans[0];
    expect(arrowWrapper?.getAttribute('data-while-hover')).toBe('undefined');
  });
});
