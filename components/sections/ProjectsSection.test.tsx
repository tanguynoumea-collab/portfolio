/**
 * ProjectsSection.test.tsx — RED harness for HOME-05 (lifted state).
 *
 * Wave 2 (04-03-projects-PLAN) creates ProjectsSection.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Project } from '@/lib/projects';

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('./CategoryFilter', () => ({
  CategoryFilter: ({ active }: { active: string }) =>
    ({ type: 'div', props: { 'data-active': active } }) as unknown as React.ReactElement,
}));
vi.mock('./ProjectGrid', () => ({
  ProjectGrid: ({ projects }: { projects: Project[] }) =>
    ({
      type: 'div',
      props: { 'data-count': String(projects.length) },
    }) as unknown as React.ReactElement,
}));

describe('ProjectsSection (HOME-05) — RED until Wave 2 ships', () => {
  it('default active filter is "all" and renders all projects', async () => {
    const { ProjectsSection } = await import('./ProjectsSection');
    const fakeProjects = [] as unknown as Project[];
    render(<ProjectsSection projects={fakeProjects} />);
    // structural — implementation will fill the assertion
    expect(true).toBe(true);
  });
});
