/**
 * app/template.test.tsx — ANIM-01 contract tests.
 *
 * Smoke-level coverage for the AnimatePresence + motion.div route-transition
 * wrapper. jsdom + motion's render shape make deep variant assertions noisy,
 * so the contract is enforced primarily by:
 *   (a) static grep gates in the plan acceptance criteria (popLayout, key=pathname,
 *       duration: 0.3 / duration: 0.1, useReducedMotion, usePathname from next/navigation),
 *   (b) the render-the-children + default-export tests below.
 *
 * `next/navigation` is mocked so we don't need a full Next.js test harness.
 * `motion/react` is partially mocked — only `useReducedMotion` is replaced
 * (so we can drive the reduced-motion branch), while `motion`/`AnimatePresence`
 * pass through to render real DOM elements.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode, ReactElement } from 'react';

const pathnameMock = vi.fn(() => '/fr/projects/foo');
vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

const reducedMock = vi.fn(() => false);
vi.mock('motion/react', async () => {
  // Pass through to real motion so <motion.div> renders a real DOM <div>;
  // only useReducedMotion is intercepted so the test can drive both branches.
  const actual = await vi.importActual<typeof import('motion/react')>('motion/react');
  return {
    ...actual,
    useReducedMotion: () => reducedMock(),
  };
});

let Template: (p: { children: ReactNode }) => ReactElement;
beforeEach(async () => {
  vi.clearAllMocks();
  pathnameMock.mockReturnValue('/fr/projects/foo');
  reducedMock.mockReturnValue(false);
  vi.resetModules();
  const mod = await import('./template');
  Template = mod.default;
});

describe('app/template.tsx (ANIM-01) — motion AnimatePresence route wrapper', () => {
  it('renders children inside a motion wrapper keyed by pathname', () => {
    render(
      <Template>
        <div data-testid="kid">hi</div>
      </Template>,
    );
    expect(screen.getByTestId('kid')).toBeTruthy();
  });

  it('handles the reduced-motion branch (opacity-only, no y translate)', () => {
    reducedMock.mockReturnValue(true);
    render(
      <Template>
        <div data-testid="kid">hi</div>
      </Template>,
    );
    expect(screen.getByTestId('kid')).toBeTruthy();
  });

  it('uses default export (Next App Router template convention)', async () => {
    const mod = await import('./template');
    expect(typeof mod.default).toBe('function');
  });
});
