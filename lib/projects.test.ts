/**
 * lib/projects.test.ts — Phase 5 D-14 backward-compat coverage for the optional
 * gallery?: string[] field on CommonFields.
 *
 * Uses native chai matchers (Vitest setupFiles: []) — NOT jest-dom — matching the
 * Phase 4 precedent (components/sections/*.test.tsx).
 */
import { describe, it, expect } from 'vitest';
import { validateFrontmatter, getProjectBySlug } from './projects';

// Minimal valid Tech frontmatter shape (mirrors the existing stub frontmatter).
const baseTech = {
  title: 'X',
  year: 2024,
  cover: '/projects/x/cover.jpg',
  summary: 'A test project.',
  featured: false,
  category: 'tech',
  stack: ['Next.js'],
} as const;

describe('validateFrontmatter — gallery (D-14)', () => {
  it('accepts a Tech project WITHOUT gallery (existing stub shape) — gallery is undefined', () => {
    const project = validateFrontmatter('x', { ...baseTech });
    expect(project.category).toBe('tech');
    expect(project.gallery).toBe(undefined);
  });

  it('accepts a Tech project WITH gallery and preserves the array', () => {
    const project = validateFrontmatter('x', {
      ...baseTech,
      gallery: ['/projects/x/1.jpg'],
    });
    expect(Array.isArray(project.gallery)).toBe(true);
    expect(project.gallery).toEqual(['/projects/x/1.jpg']);
  });

  it('throws with a message mentioning gallery when gallery is a non-array', () => {
    expect(() => validateFrontmatter('x', { ...baseTech, gallery: 'foo' })).toThrow(/gallery/);
  });
});

describe('getProjectBySlug — regression guard', () => {
  it("resolves agora (fr) — the real stub still validates after the gallery change", async () => {
    const project = await getProjectBySlug('agora', 'fr');
    expect(project).not.toBe(null);
    expect(project?.slug).toBe('agora');
  });
});
