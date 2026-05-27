/**
 * Skills.test.tsx — HOME-06 acceptance suite.
 *
 * Task 2 of 04-04 expanded the Wave 0 RED placeholder into the full
 * acceptance harness for the Skills component:
 *  - Title from skills.title i18n
 *  - 3 group sub-headings (Tech / Design / BIM) from skills.groups.{key}.label
 *  - Skill badges rendered per group from skills.groups.{key}.items array
 *  - Each badge carries the correct category-* variant (asserted via the
 *    Badge mock's data-variant passthrough)
 *  - Reduced-motion path calls gsap.set (no timeline created)
 *  - Full-motion path calls gsap.timeline (+ scrollTrigger config)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

// next-intl mock with namespace prefix + t.raw arrays
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

// useGSAP simply invokes the callback so we exercise the matchMedia branch
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => fn(),
}));

// Hoisted gsap spies (re-set per test via beforeEach to track which branch fired)
const gsapSet = vi.fn<(sel: string, vars: unknown) => void>();
const gsapTimelineFrom = vi.fn<(sel: string, vars: unknown, pos?: number) => void>();
const gsapTimeline = vi.fn<(cfg: unknown) => void>();
let matchMediaConditions: { isReduced?: boolean; isFull?: boolean } = {
  isFull: true,
};

vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({
      add: (
        _q: Record<string, string>,
        cb: (ctx: { conditions?: { isReduced?: boolean; isFull?: boolean } }) => void,
      ) => {
        cb({ conditions: matchMediaConditions });
      },
    }),
    timeline: (cfg: unknown) => {
      gsapTimeline(cfg);
      return { from: gsapTimelineFrom };
    },
    set: (sel: string, vars: unknown) => {
      gsapSet(sel, vars);
    },
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

// Badge mock: proper JSX element so React can render it, with data-variant
// passthrough so tests can assert which CVA variant was used.
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

beforeEach(() => {
  gsapSet.mockClear();
  gsapTimeline.mockClear();
  gsapTimelineFrom.mockClear();
  matchMediaConditions = { isFull: true };
});

describe('Skills (HOME-06) — content', () => {
  it('renders the title from skills.title i18n key', async () => {
    const { Skills } = await import('./Skills');
    render(<Skills />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'skills.title',
    );
  });

  it('renders 3 sub-headings (Tech / Design / BIM) from skills.groups.*.label', async () => {
    const { Skills } = await import('./Skills');
    render(<Skills />);
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s).toHaveLength(3);
    expect(h3s[0]?.textContent).toBe('skills.groups.tech.label');
    expect(h3s[1]?.textContent).toBe('skills.groups.design.label');
    expect(h3s[2]?.textContent).toBe('skills.groups.bim.label');
  });

  it('renders skill badges for each group from t.raw items arrays', async () => {
    const { Skills } = await import('./Skills');
    const { container } = render(<Skills />);
    const techBadges = container.querySelectorAll(
      '[data-skill-badge][data-group="tech"]',
    );
    expect(techBadges).toHaveLength(2);
    expect(techBadges[0]?.textContent).toBe('TypeScript');
    expect(techBadges[1]?.textContent).toBe('React');

    const designBadges = container.querySelectorAll(
      '[data-skill-badge][data-group="design"]',
    );
    expect(designBadges).toHaveLength(1);
    expect(designBadges[0]?.textContent).toBe('Figma');

    const bimBadges = container.querySelectorAll(
      '[data-skill-badge][data-group="bim"]',
    );
    expect(bimBadges).toHaveLength(1);
    expect(bimBadges[0]?.textContent).toBe('Revit');
  });
});

describe('Skills (HOME-06) — Badge variants', () => {
  it('assigns category-tech variant to Tech group badges', async () => {
    const { Skills } = await import('./Skills');
    const { container } = render(<Skills />);
    const techHost = container.querySelector(
      '[data-skill-badge][data-group="tech"]',
    );
    expect(techHost).not.toBeNull();
    const badge = within(techHost as HTMLElement).getByText('TypeScript');
    expect(badge.getAttribute('data-variant')).toBe('category-tech');
  });

  it('assigns category-design variant to Design group badges', async () => {
    const { Skills } = await import('./Skills');
    const { container } = render(<Skills />);
    const designHost = container.querySelector(
      '[data-skill-badge][data-group="design"]',
    );
    expect(designHost).not.toBeNull();
    const badge = within(designHost as HTMLElement).getByText('Figma');
    expect(badge.getAttribute('data-variant')).toBe('category-design');
  });

  it('assigns category-bim variant to BIM group badges', async () => {
    const { Skills } = await import('./Skills');
    const { container } = render(<Skills />);
    const bimHost = container.querySelector(
      '[data-skill-badge][data-group="bim"]',
    );
    expect(bimHost).not.toBeNull();
    const badge = within(bimHost as HTMLElement).getByText('Revit');
    expect(badge.getAttribute('data-variant')).toBe('category-bim');
  });
});

describe('Skills (HOME-06) — GSAP animation gating', () => {
  it('creates a ScrollTrigger timeline under full-motion', async () => {
    matchMediaConditions = { isFull: true };
    const { Skills } = await import('./Skills');
    render(<Skills />);
    expect(gsapTimeline).toHaveBeenCalledTimes(1);
    const cfg = gsapTimeline.mock.calls[0]?.[0] as {
      scrollTrigger?: {
        start?: string;
        toggleActions?: string;
      };
    };
    expect(cfg?.scrollTrigger?.start).toBe('top 75%');
    expect(cfg?.scrollTrigger?.toggleActions).toBe('play none none reverse');
    // 3 group .from() calls
    expect(gsapTimelineFrom).toHaveBeenCalledTimes(3);
    // gsap.set NOT called in full-motion branch
    expect(gsapSet).not.toHaveBeenCalled();
  });

  it('falls back to gsap.set when reduced-motion is preferred', async () => {
    matchMediaConditions = { isReduced: true, isFull: false };
    const { Skills } = await import('./Skills');
    render(<Skills />);
    expect(gsapSet).toHaveBeenCalledWith(
      '[data-skill-badge]',
      expect.objectContaining({ opacity: 1, y: 0, scale: 1 }),
    );
    // No timeline + no per-group from()
    expect(gsapTimeline).not.toHaveBeenCalled();
    expect(gsapTimelineFrom).not.toHaveBeenCalled();
  });
});
