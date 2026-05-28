/**
 * ProjectsSection.a11y.test.tsx — A11Y-04 axe-core surface (Phase 6 D-10).
 *
 * Unlike ProjectsSection.test.tsx (which stubs CategoryFilter + ProjectGrid to
 * test the lifted-state wiring), this a11y test renders the REAL child tree
 * (CategoryFilter → ProjectGrid → ProjectCard → shadcn Card/Badge + a
 * locale-aware <Link> + a next/image cover) so axe checks the real accessible
 * markup: segmented-control buttons with aria-pressed, the project link's
 * aria-label, image-alt on the cover. Only leaf libs are mocked:
 *   - next-intl  → flat string resolver
 *   - motion/react → real <div>/<span> elements + useReducedMotion (false)
 *   - next/image → real <img> with alt/src (so image-alt is exercised)
 *   - @/i18n/navigation Link → real <a href>
 *
 * Only `color-contrast` is disabled (jsdom can't compute contrast); all other
 * rules stay active.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/projects';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      title: 'Projects',
      empty: 'No project matches this filter.',
      viewProject: 'View project',
      all: 'All',
      tech: 'Tech',
      design: 'Design',
      bim: 'BIM',
    };
    return map[k] ?? k;
  },
}));

// motion/react → real elements so the child tree renders into the DOM; the
// components gate animation on useReducedMotion (false = full motion default).
vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({
          children,
          ...rest
        }: { children?: ReactNode } & Record<string, unknown>) => {
          // Drop motion-only props that are invalid on real DOM nodes.
          const {
            layout: _layout,
            layoutId: _layoutId,
            whileHover: _wh,
            whileTap: _wt,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _tr,
            ...domProps
          } = rest;
          void _layout;
          void _layoutId;
          void _wh;
          void _wt;
          void _i;
          void _a;
          void _e;
          void _tr;
          return React.createElement(
            tag,
            domProps as Record<string, unknown>,
            children as ReactNode,
          );
        },
    },
  ),
  AnimatePresence: ({ children }: { children: ReactNode }) =>
    children as React.ReactElement,
  useReducedMotion: () => false,
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  }) => React.createElement('img', { src, alt, width, height }),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children: ReactNode } & Record<string, unknown>) =>
    React.createElement('a', { href, ...rest }, children as ReactNode),
}));

const fixture: Project[] = [
  {
    slug: 'tech-1',
    title: 'Tech One',
    year: 2024,
    category: 'tech',
    cover: '/c.jpg',
    summary: 'A tech project summary.',
    featured: true,
    stack: ['TypeScript', 'React'],
  },
  {
    slug: 'design-1',
    title: 'Design One',
    year: 2023,
    category: 'design',
    cover: '/c.jpg',
    summary: 'A design project summary.',
    featured: false,
    tools: ['Figma'],
  },
];

describe('ProjectsSection (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fixture} />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
