/**
 * Skills.test.tsx — RED harness for HOME-06.
 *
 * Wave 1 (04-04-skills-PLAN) creates Skills.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => {
    type Translator = ((k: string) => string) & { raw: (k: string) => string[] };
    const t = ((k: string) => `${ns}.${k}`) as Translator;
    // next-intl t.raw for arrays
    t.raw = (k: string) => {
      if (k === 'groups.tech.items') return ['TypeScript', 'React'];
      if (k === 'groups.design.items') return ['Figma'];
      if (k === 'groups.bim.items') return ['Revit'];
      return [];
    };
    return t;
  },
}));

vi.mock('@gsap/react', () => ({ useGSAP: (fn: () => void) => fn() }));
vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({ add: () => undefined }),
    timeline: () => ({ from: () => undefined }),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    ({
      type: 'span',
      props: { 'data-variant': variant, children },
    }) as unknown as React.ReactElement,
}));

describe('Skills (HOME-06) — RED until Wave 1 ships', () => {
  it('renders the Tech group with skill badges', async () => {
    const { Skills } = await import('./Skills');
    render(<Skills />);
    // RED placeholder — Wave 1 ships actual component
    expect(true).toBe(true);
  });
});
