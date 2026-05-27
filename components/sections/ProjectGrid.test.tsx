/**
 * ProjectGrid.test.tsx — RED harness for HOME-05.
 *
 * Wave 2 (04-03-projects-PLAN) creates ProjectGrid.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Project } from '@/lib/projects';

void ({} as Project);

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    k === 'empty' ? 'No project matches this filter.' : k,
}));
vi.mock('motion/react', () => ({
  motion: {
    div: ((props: Record<string, unknown>) =>
      ({ type: 'div', props }) as unknown as React.ReactElement) as unknown as React.FC,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    children as React.ReactElement,
}));
vi.mock('./ProjectCard', () => ({
  ProjectCard: ({ project }: { project: { slug: string; title: string } }) =>
    ({
      type: 'div',
      props: { 'data-slug': project.slug, children: project.title },
    }) as unknown as React.ReactElement,
}));

describe('ProjectGrid (HOME-05) — RED until Wave 2 ships', () => {
  it('renders empty state when projects=[]', async () => {
    const { ProjectGrid } = await import('./ProjectGrid');
    render(<ProjectGrid projects={[]} />);
    expect(screen.getByText(/No project matches/)).toBeTruthy();
  });
});
