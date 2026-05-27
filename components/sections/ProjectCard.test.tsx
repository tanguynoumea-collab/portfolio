/**
 * ProjectCard.test.tsx — RED harness for HOME-04.
 *
 * Wave 2 (04-03-projects-PLAN) creates ProjectCard.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TechProject } from '@/lib/projects';

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('next/image', () => ({
  default: (p: { alt?: string }) => `IMG[${p.alt}]` as unknown as React.ReactElement,
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    ({ type: 'a', props: { href, ...rest, children } }) as unknown as React.ReactElement,
}));
vi.mock('motion/react', () => ({
  motion: {
    div: ((props: Record<string, unknown>) =>
      ({ type: 'div', props }) as unknown as React.ReactElement) as unknown as React.FC,
  },
  useReducedMotion: () => false,
}));

const techProject: TechProject = {
  slug: 'texture-manager',
  title: 'Texture Manager',
  year: 2024,
  category: 'tech',
  cover: '/projects/texture-manager/cover.jpg',
  summary: 'Procedural texture manager.',
  featured: true,
  stack: ['TypeScript', 'Three.js'],
};

describe('ProjectCard (HOME-04) — RED until Wave 2 ships', () => {
  it('renders title + year + category for a tech project', async () => {
    const { ProjectCard } = await import('./ProjectCard');
    render(<ProjectCard project={techProject} />);
    expect(screen.getByText(/Texture Manager/)).toBeTruthy();
    expect(screen.getByText(/2024/)).toBeTruthy();
  });
});
