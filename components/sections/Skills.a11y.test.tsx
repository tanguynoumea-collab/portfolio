/**
 * Skills.a11y.test.tsx — A11Y-04 axe-core surface (Phase 6 D-10).
 *
 * Renders <Skills /> in jsdom and asserts axe reports zero violations. Mocks
 * mirror Skills.test.tsx (next-intl with t.raw returning arrays, @gsap/react,
 * gsap matchMedia, gsap/ScrollTrigger, shadcn Badge → real <span>) so the
 * heading hierarchy + skill badges render exactly as in the unit test.
 *
 * Only `color-contrast` is disabled (jsdom can't compute contrast); all other
 * rules stay active.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => {
    type Translator = ((k: string) => string) & { raw: (k: string) => string[] };
    const t = ((k: string) => `${ns}.${k}`) as Translator;
    t.raw = (k: string) => {
      if (k === 'groups.tech.items') return ['TypeScript', 'React'];
      if (k === 'groups.design.items') return ['Figma'];
      if (k === 'groups.bim.items') return ['Revit'];
      return [];
    };
    return t;
  },
}));

vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({
      add: (
        _q: Record<string, string>,
        cb: (ctx: { conditions?: { isFull?: boolean } }) => void,
      ) => {
        cb({ conditions: { isFull: true } });
      },
    }),
    timeline: () => ({ from: vi.fn() }),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span data-slot="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

describe('Skills (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { Skills } = await import('./Skills');
    const { container } = render(<Skills />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
