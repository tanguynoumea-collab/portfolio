/**
 * ProjectCard.test.tsx — HOME-04 acceptance suite.
 *
 * Wave 0 shipped a RED harness with a single i18n render assertion.
 * Wave 2 (04-03-projects-PLAN.md Task 3) expands the suite to cover the
 * full HOME-04 contract:
 *   1. Renders title + year + summary from project prop
 *   2. Category badge variant matches project.category (data-variant)
 *   3. Footer renders discriminated metadata per category:
 *      tech → stack[0..2] / design → tools[0..2] / bim → software[0..1] + projectScale
 *   4. Link from @/i18n/navigation has href=/projects/{slug}
 *   5. Link aria-label includes project title + viewProject label
 *   6. whileHover is undefined under useReducedMotion()===true
 *   7. whileHover is { scale: 1.02 } under useReducedMotion()===false
 *
 * Mock strategy:
 *   - next-intl mocked with the projects.viewProject key
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
import type {
  BIMProject,
  DesignProject,
  TechProject,
} from '@/lib/projects';

// next-intl mock — projects.viewProject key for the aria-label
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      viewProject: 'View project',
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

const techProject: TechProject = {
  slug: 'texture-manager',
  title: 'Texture Manager',
  year: 2024,
  category: 'tech',
  cover: '/projects/texture-manager/cover.jpg',
  summary: 'Procedural texture manager for real-time 3D environments.',
  featured: true,
  stack: ['TypeScript', 'Three.js', 'React', 'Vite'],
};

const designProject: DesignProject = {
  slug: 'brand-system',
  title: 'Brand System',
  year: 2023,
  category: 'design',
  cover: '/projects/brand-system/cover.jpg',
  summary: 'Complete visual identity for a creative studio.',
  featured: false,
  tools: ['Figma', 'Illustrator', 'InDesign', 'Photoshop'],
};

const bimProject: BIMProject = {
  slug: 'tower-concept',
  title: 'Tower Concept',
  year: 2022,
  category: 'bim',
  cover: '/projects/tower-concept/cover.jpg',
  summary: 'Conceptual study for a mixed-use high-rise.',
  featured: false,
  software: ['Revit', 'Rhino', 'Twinmotion'],
  projectScale: 'urban',
};

beforeEach(() => {
  useReducedMotionMock.mockReset();
  useReducedMotionMock.mockReturnValue(false);
});

describe('ProjectCard (HOME-04) — content rendering', () => {
  it('renders title, year, and summary for a tech project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    render(<ProjectCard project={techProject} />);
    expect(screen.getByText(/Texture Manager/)).toBeTruthy();
    expect(screen.getByText(/2024/)).toBeTruthy();
    expect(screen.getByText(/Procedural texture manager/)).toBeTruthy();
  });

  it('renders cover image with project.cover as src + project.title as alt', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('Texture Manager');
    expect(img?.getAttribute('src')).toBe(
      '/projects/texture-manager/cover.jpg',
    );
  });
});

describe('ProjectCard (HOME-04) — category badge variant', () => {
  it('uses category-tech variant for a tech project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    // Find the category badge (the one with category-* variant)
    const categoryBadge = container.querySelector(
      'span[data-variant="category-tech"]',
    );
    expect(categoryBadge).not.toBeNull();
    expect(categoryBadge?.textContent).toBe('TECH');
  });

  it('uses category-design variant for a design project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={designProject} />);
    const categoryBadge = container.querySelector(
      'span[data-variant="category-design"]',
    );
    expect(categoryBadge).not.toBeNull();
    expect(categoryBadge?.textContent).toBe('DESIGN');
  });

  it('uses category-bim variant for a bim project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={bimProject} />);
    const categoryBadge = container.querySelector(
      'span[data-variant="category-bim"]',
    );
    expect(categoryBadge).not.toBeNull();
    expect(categoryBadge?.textContent).toBe('BIM');
  });
});

describe('ProjectCard (HOME-04) — discriminated metadata footer', () => {
  it('tech project footer shows stack[0..2] as outline badges', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const outlineBadges = container.querySelectorAll(
      'span[data-variant="outline"]',
    );
    // techProject.stack has 4 items; we render only first 3
    expect(outlineBadges).toHaveLength(3);
    expect(outlineBadges[0]?.textContent).toBe('TypeScript');
    expect(outlineBadges[1]?.textContent).toBe('Three.js');
    expect(outlineBadges[2]?.textContent).toBe('React');
  });

  it('design project footer shows tools[0..2] as outline badges', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={designProject} />);
    const outlineBadges = container.querySelectorAll(
      'span[data-variant="outline"]',
    );
    expect(outlineBadges).toHaveLength(3);
    expect(outlineBadges[0]?.textContent).toBe('Figma');
    expect(outlineBadges[1]?.textContent).toBe('Illustrator');
    expect(outlineBadges[2]?.textContent).toBe('InDesign');
  });

  it('bim project footer shows software[0..1] + projectScale as outline badges', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={bimProject} />);
    const outlineBadges = container.querySelectorAll(
      'span[data-variant="outline"]',
    );
    // 2 from software + 1 projectScale = 3 badges
    expect(outlineBadges).toHaveLength(3);
    expect(outlineBadges[0]?.textContent).toBe('Revit');
    expect(outlineBadges[1]?.textContent).toBe('Rhino');
    expect(outlineBadges[2]?.textContent).toBe('urban');
  });
});

describe('ProjectCard (HOME-04) — locale-aware Link', () => {
  it('Link href is /projects/{slug}', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/projects/texture-manager');
  });

  it('Link has aria-label containing project title + viewProject text', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    const link = container.querySelector('a');
    const ariaLabel = link?.getAttribute('aria-label') ?? '';
    expect(ariaLabel).toMatch(/Texture Manager/);
    expect(ariaLabel).toMatch(/View project/);
  });
});

describe('ProjectCard (HOME-04) — useReducedMotion gate (Pitfall 4-B)', () => {
  it('whileHover is undefined when useReducedMotion() returns true', async () => {
    useReducedMotionMock.mockReturnValue(true);
    const { ProjectCard } = await import('./ProjectCard');
    const { container } = render(<ProjectCard project={techProject} />);
    // The outer motion.div carries data-while-hover.
    // Find divs and locate the wrapper with aspect-* or h-full classes
    // (the outermost motion.div in ProjectCard has className="h-full").
    const motionDivs = container.querySelectorAll('div[data-while-hover]');
    expect(motionDivs.length).toBeGreaterThan(0);
    // First (outermost) div is the card wrapper
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
    // The motion.span wrapping the ArrowUpRight icon
    const motionSpans = container.querySelectorAll('span[data-while-hover]');
    expect(motionSpans.length).toBeGreaterThan(0);
    const arrowWrapper = motionSpans[0];
    expect(arrowWrapper?.getAttribute('data-while-hover')).toBe('undefined');
  });
});
