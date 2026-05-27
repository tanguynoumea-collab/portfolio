/**
 * Hero.test.tsx — RED harness for HOME-01.
 *
 * Wave 1 (04-01-hero-PLAN) creates Hero.tsx and makes these pass.
 * Wave 0 ships this as a RED test — the dynamic import on the inner
 * lines fails (Module not found) until Wave 1 ships the component.
 *
 * Mock pattern follows components/layout/Footer.test.tsx (next-intl
 * + animation libs stubbed; structural assertions only).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next-intl translations for the hero namespace.
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

// Mock @gsap/react useGSAP — verifies the scope was passed.
const useGSAPSpy = vi.fn();
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void, opts?: { scope?: unknown }) => {
    useGSAPSpy(opts);
    // Run the callback to exercise the matchMedia path
    fn();
  },
}));

// Mock gsap.matchMedia.
vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({ add: () => undefined }),
    timeline: () => ({
      from: () => ({
        from: () => ({
          from: () => ({
            from: () => ({ from: () => undefined }),
          }),
        }),
      }),
    }),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/SplitText', () => ({
  SplitText: class {
    revert() {}
  },
}));

// Mock useLenis returning a fake instance.
vi.mock('@/components/providers/LenisProvider', () => ({
  useLenis: () => ({ scrollTo: vi.fn() }),
}));

beforeEach(() => {
  useGSAPSpy.mockReset();
});

describe('Hero (HOME-01) — RED until Wave 1 ships', () => {
  it('renders name + role + tagline + CTA + scroll cue from i18n', async () => {
    const { Hero } = await import('./Hero');
    render(<Hero />);
    expect(screen.getByText(/Tanguy/)).toBeTruthy();
    expect(screen.getByText(/Tech × Design × BIM/)).toBeTruthy();
    expect(screen.getByText(/See my work/)).toBeTruthy();
  });

  it('useGSAP is called with a scope ref (Pattern 1 from RESEARCH.md)', async () => {
    const { Hero } = await import('./Hero');
    render(<Hero />);
    expect(useGSAPSpy).toHaveBeenCalled();
    const callArgs = useGSAPSpy.mock.calls[0]?.[0];
    expect(callArgs).toHaveProperty('scope');
  });
});
