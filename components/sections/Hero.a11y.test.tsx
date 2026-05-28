/**
 * Hero.a11y.test.tsx — A11Y-04 axe-core surface (Phase 6 D-10).
 *
 * Renders <Hero /> in jsdom and asserts axe reports zero violations. The mock
 * blocks below are the SAME shapes Hero.test.tsx uses (next-intl, @gsap/react
 * useGSAP, gsap matchMedia, gsap/SplitText, gsap/ScrollTrigger, useLenis,
 * usePrefersReducedMotion) so the component renders identically to its unit
 * test — the only difference is the assertion (axe vs structural).
 *
 * color-contrast is the ONLY rule disabled: jsdom has no layout/paint so axe
 * cannot compute contrast (06-RESEARCH Pitfall 3). Contrast is covered by
 * validateFullMatrix (A11Y-07) + the ThemeProvider auto-adjust + Lighthouse
 * (A11Y-08). Every other rule (button-name, image-alt, aria-*) stays ACTIVE so
 * the suite genuinely verifies accessible names.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    if (ns === 'hero') {
      const map: Record<string, string> = {
        name: 'Tanguy',
        role: 'Tech × Design × BIM',
        tagline: 'Hybrid profile...',
        cta: 'See my work',
        scrollCue: 'Scroll to projects',
      };
      return map[k] ?? `${ns}.${k}`;
    }
    return `${ns}.${k}`;
  },
}));

vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({
      add: (
        _conds: unknown,
        cb: (ctx: { conditions: Record<string, boolean> }) => void,
      ) => {
        // Render under full motion (default) so the timeline path runs.
        cb({ conditions: { isFull: true, isReduced: false } });
      },
    }),
    timeline: () => {
      const tl: { from: () => typeof tl } = {
        from: () => tl,
      };
      return tl;
    },
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/SplitText', () => ({
  SplitText: class {
    chars = [{}, {}, {}, {}, {}, {}];
    constructor(_target: string, opts?: { onSplit?: () => void }) {
      opts?.onSplit?.();
    }
    revert() {
      // no-op
    }
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { refresh: vi.fn() },
}));

vi.mock('@/components/providers/LenisProvider', () => ({
  useLenis: () => ({ scrollTo: vi.fn() }),
}));

vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

describe('Hero (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { Hero } = await import('./Hero');
    const { container } = render(<Hero />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
