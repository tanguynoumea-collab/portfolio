/**
 * ProjectsSection.test.tsx — HOME-05 acceptance suite (lifted state).
 *
 * Covers the lifted-state contract against the 2-category model:
 *   1. Default active='all' → ProjectGrid receives ALL projects
 *   2. Renders CategoryFilter with active prop
 *   3. Renders ProjectGrid with filtered projects prop
 *   4. Clicking CategoryFilter onChange (simulated via the stub's exposed
 *      buttons) updates active state → ProjectGrid re-renders filtered
 *   5. useMemo filter selector handles all branches (bim / tech / all)
 *   6. Empty filter results (e.g., projects=[]) pass empty array to grid
 *   7. h2 title from projects.title i18n
 *
 * Mock strategy:
 *   - next-intl returns plain strings
 *   - CategoryFilter stubbed as a div with data-active + hidden buttons that
 *     expose onChange so tests can simulate filter changes
 *   - ProjectGrid stubbed as a div with data-count + data-slugs (CSV) so tests
 *     can assert WHICH projects were passed through the filter
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Project } from '@/lib/projects';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      title: 'Projects',
    };
    return map[k] ?? k;
  },
}));

// CategoryFilter stub — exposes buttons that fire onChange so tests can
// simulate user interaction without coupling to the real CategoryFilter UI.
vi.mock('./CategoryFilter', () => ({
  CategoryFilter: ({
    active,
    onChange,
  }: {
    active: string;
    onChange: (v: 'all' | 'bim' | 'tech') => void;
  }) =>
    React.createElement(
      'div',
      { 'data-active': active } as Record<string, unknown>,
      React.createElement(
        'button',
        {
          'data-test': 'set-bim',
          onClick: () => onChange('bim'),
        } as Record<string, unknown>,
        'set bim',
      ),
      React.createElement(
        'button',
        {
          'data-test': 'set-tech',
          onClick: () => onChange('tech'),
        } as Record<string, unknown>,
        'set tech',
      ),
      React.createElement(
        'button',
        {
          'data-test': 'set-all',
          onClick: () => onChange('all'),
        } as Record<string, unknown>,
        'set all',
      ),
    ),
}));

// ProjectGrid stub — exposes count + slugs through data attributes
vi.mock('./ProjectGrid', () => ({
  ProjectGrid: ({ projects }: { projects: Project[] }) =>
    React.createElement(
      'div',
      {
        'data-count': String(projects.length),
        'data-slugs': projects.map((p) => p.slug).join(','),
      } as Record<string, unknown>,
      String(projects.length),
    ),
}));

// ----- Fixtures (prop order preserved by the filter) -----

const fakeProjects: Project[] = [
  {
    slug: 'tech-1',
    title: 'Tech 1',
    year: 2026,
    category: 'tech',
    cover: '/c.jpg',
    summary: '.',
    featured: true,
    stack: ['C#'],
  },
  {
    slug: 'tech-2',
    title: 'Tech 2',
    year: 2026,
    category: 'tech',
    cover: '/c.jpg',
    summary: '.',
    featured: false,
    stack: ['C#'],
  },
  {
    slug: 'bim-1',
    title: 'BIM 1',
    year: 2026,
    category: 'bim',
    cover: '/c.jpg',
    summary: '.',
    featured: false,
    stack: ['C#'],
    revit: 'Revit 2025',
  },
  {
    slug: 'bim-2',
    title: 'BIM 2',
    year: 2026,
    category: 'bim',
    cover: '/c.jpg',
    summary: '.',
    featured: false,
    stack: ['Python'],
    revit: 'Revit 2024',
  },
  {
    slug: 'bim-3',
    title: 'BIM 3',
    year: 2026,
    category: 'bim',
    cover: '/c.jpg',
    summary: '.',
    featured: false,
    stack: ['C#'],
  },
  {
    slug: 'bim-4',
    title: 'BIM 4',
    year: 2026,
    category: 'bim',
    cover: '/c.jpg',
    summary: '.',
    featured: false,
    stack: ['C#'],
  },
];

describe('ProjectsSection (HOME-05) — initial render', () => {
  it('renders title (h2) from projects.title i18n', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    render(<ProjectsSection projects={fakeProjects} />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toBe('Projects');
  });

  it('default active filter is "all"', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fakeProjects} />);
    const filter = container.querySelector('[data-active]');
    expect(filter?.getAttribute('data-active')).toBe('all');
  });

  it('default state passes ALL projects to ProjectGrid', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fakeProjects} />);
    const grid = container.querySelector('[data-count]');
    expect(grid?.getAttribute('data-count')).toBe('6');
  });
});

describe('ProjectsSection (HOME-05) — useMemo filter selector', () => {
  it('clicking set-bim filters ProjectGrid to bim projects only', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fakeProjects} />);
    fireEvent.click(
      container.querySelector('[data-test="set-bim"]') as HTMLButtonElement,
    );
    const grid = container.querySelector('[data-count]');
    expect(grid?.getAttribute('data-count')).toBe('4');
    expect(grid?.getAttribute('data-slugs')).toBe('bim-1,bim-2,bim-3,bim-4');
  });

  it('clicking set-tech filters ProjectGrid to tech projects only', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fakeProjects} />);
    fireEvent.click(
      container.querySelector('[data-test="set-tech"]') as HTMLButtonElement,
    );
    const grid = container.querySelector('[data-count]');
    expect(grid?.getAttribute('data-count')).toBe('2');
    expect(grid?.getAttribute('data-slugs')).toBe('tech-1,tech-2');
  });

  it('clicking set-all restores all projects', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fakeProjects} />);
    fireEvent.click(
      container.querySelector('[data-test="set-tech"]') as HTMLButtonElement,
    );
    fireEvent.click(
      container.querySelector('[data-test="set-all"]') as HTMLButtonElement,
    );
    const grid = container.querySelector('[data-count]');
    expect(grid?.getAttribute('data-count')).toBe('6');
  });

  it('filter state propagates to CategoryFilter active prop', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={fakeProjects} />);
    fireEvent.click(
      container.querySelector('[data-test="set-bim"]') as HTMLButtonElement,
    );
    const filter = container.querySelector('[data-active]');
    expect(filter?.getAttribute('data-active')).toBe('bim');
  });
});

describe('ProjectsSection (HOME-05) — empty edge cases', () => {
  it('empty projects array passes [] to ProjectGrid (empty state delegated)', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(<ProjectsSection projects={[]} />);
    const grid = container.querySelector('[data-count]');
    expect(grid?.getAttribute('data-count')).toBe('0');
  });

  it('filtering for category with zero matches passes [] to ProjectGrid', async () => {
    const techOnlyProjects = fakeProjects.filter((p) => p.category === 'tech');
    const { ProjectsSection } = await import('./ProjectsSection');
    const { container } = render(
      <ProjectsSection projects={techOnlyProjects} />,
    );
    // Filter to bim — no matches in a tech-only set.
    fireEvent.click(
      container.querySelector('[data-test="set-bim"]') as HTMLButtonElement,
    );
    const grid = container.querySelector('[data-count]');
    expect(grid?.getAttribute('data-count')).toBe('0');
  });
});
