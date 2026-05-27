/**
 * ProjectGrid.test.tsx — HOME-05 acceptance suite.
 *
 * Wave 0 shipped a RED harness with empty-state placeholder.
 * Wave 2 (04-03-projects-PLAN.md Task 3) expands the suite to cover:
 *   1. Renders 1 card per project when projects.length > 0 (3 fake projects)
 *   2. Empty state renders when projects=[]
 *   3. Empty state contains projects.empty text + SearchX icon (via svg sentinel)
 *   4. AnimatePresence carries mode="popLayout" (asserted via mock spy)
 *   5. Outer motion.div carries the `layout` prop (Pitfall 4-C — asserted
 *      via data-layout passthrough on the mock)
 *
 * Mock strategy:
 *   - next-intl returns the 'empty' string verbatim for getByText match
 *   - motion/react: motion.div passes `layout` through as data-layout
 *     attribute so we can assert Pitfall 4-C mitigation
 *   - AnimatePresence: passes `mode` through as data-presence-mode so we
 *     can assert popLayout
 *   - ProjectCard stubbed as a real div with data-slug to count cards
 *   - lucide-react SearchX stubbed as a real svg with data-icon
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/projects';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    k === 'empty' ? 'No project matches this filter.' : k,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      layout,
      ...rest
    }: {
      children?: ReactNode;
      layout?: boolean;
    } & Record<string, unknown>) =>
      React.createElement(
        'div',
        {
          ...rest,
          'data-layout': layout ? 'true' : undefined,
        } as Record<string, unknown>,
        children as ReactNode,
      ),
  },
  AnimatePresence: ({
    children,
    mode,
  }: {
    children: ReactNode;
    mode?: string;
  }) =>
    React.createElement(
      'div',
      { 'data-presence-mode': mode } as Record<string, unknown>,
      children as ReactNode,
    ),
}));

vi.mock('./ProjectCard', () => ({
  ProjectCard: ({ project }: { project: { slug: string; title: string } }) =>
    React.createElement(
      'div',
      { 'data-slug': project.slug } as Record<string, unknown>,
      project.title,
    ),
}));

vi.mock('lucide-react', () => ({
  SearchX: (props: Record<string, unknown>) =>
    React.createElement('svg', { ...props, 'data-icon': 'SearchX' }),
}));

// ----- Fixtures -----

const fakeProjects: Project[] = [
  {
    slug: 'texture-manager',
    title: 'Texture Manager',
    year: 2024,
    category: 'tech',
    cover: '/projects/texture-manager/cover.jpg',
    summary: 'Tech project.',
    featured: true,
    stack: ['TypeScript'],
  },
  {
    slug: 'brand-system',
    title: 'Brand System',
    year: 2023,
    category: 'design',
    cover: '/projects/brand-system/cover.jpg',
    summary: 'Design project.',
    featured: false,
    tools: ['Figma'],
  },
  {
    slug: 'tower-concept',
    title: 'Tower Concept',
    year: 2022,
    category: 'bim',
    cover: '/projects/tower-concept/cover.jpg',
    summary: 'BIM project.',
    featured: false,
    software: ['Revit'],
    projectScale: 'urban',
  },
];

describe('ProjectGrid (HOME-05) — renders cards from projects array', () => {
  it('renders 1 card per project when projects.length > 0', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={fakeProjects} />);
    const cards = container.querySelectorAll('[data-slug]');
    expect(cards).toHaveLength(3);
  });

  it('renders cards in order matching the projects prop', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={fakeProjects} />);
    const cards = container.querySelectorAll('[data-slug]');
    expect(cards[0]?.getAttribute('data-slug')).toBe('texture-manager');
    expect(cards[1]?.getAttribute('data-slug')).toBe('brand-system');
    expect(cards[2]?.getAttribute('data-slug')).toBe('tower-concept');
  });

  it('filtered subset of 1 project renders 1 card', async () => {
    const techOnly = fakeProjects.filter((p) => p.category === 'tech');
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={techOnly} />);
    const cards = container.querySelectorAll('[data-slug]');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.getAttribute('data-slug')).toBe('texture-manager');
  });
});

describe('ProjectGrid (HOME-05) — empty state', () => {
  it('renders empty state when projects=[]', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    render(<ProjectGrid projects={[]} />);
    expect(screen.getByText(/No project matches this filter/)).toBeTruthy();
  });

  it('empty state contains SearchX icon (lucide svg sentinel)', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={[]} />);
    const icon = container.querySelector('svg[data-icon="SearchX"]');
    expect(icon).not.toBeNull();
  });

  it('empty state does NOT render the grid wrapper or any cards', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={[]} />);
    const cards = container.querySelectorAll('[data-slug]');
    expect(cards).toHaveLength(0);
    // AnimatePresence shouldn't even render in the empty branch
    const presence = container.querySelector('[data-presence-mode]');
    expect(presence).toBeNull();
  });
});

describe('ProjectGrid (HOME-05) — motion AnimatePresence popLayout (Pitfall 4-C)', () => {
  it('AnimatePresence is rendered with mode="popLayout"', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={fakeProjects} />);
    const presence = container.querySelector('[data-presence-mode]');
    expect(presence).not.toBeNull();
    expect(presence?.getAttribute('data-presence-mode')).toBe('popLayout');
  });

  it('outer motion.div has the layout prop (Pitfall 4-C)', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    const { container } = render(<ProjectGrid projects={fakeProjects} />);
    // At least one motion.div should carry data-layout="true" (the outer
    // grid wrapper AND each card wrapper both pass layout in our impl).
    const layoutDivs = container.querySelectorAll('div[data-layout="true"]');
    expect(layoutDivs.length).toBeGreaterThanOrEqual(1);
  });
});
