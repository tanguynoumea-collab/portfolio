/**
 * not-found.a11y.test.tsx — A11Y-04 axe-core surface for the EGG-02 custom 404.
 *
 * Renders <NotFound /> in jsdom and asserts axe reports zero violations. Mocks
 * mirror not-found.test.tsx (next-intl flat resolver, motion/react real
 * elements + useReducedMotion, @/i18n/navigation Link → real <a>, Button
 * passthrough) so the 404 heading + back link render into the DOM and axe can
 * verify the link has an accessible name. Only `color-contrast` is disabled.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';
import type { ReactNode } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `errors.404.${key}`,
}));

vi.mock('motion/react', () => ({
  useReducedMotion: () => false,
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({
          children,
          initial: _i,
          animate: _a,
          transition: _tr,
          ...rest
        }: { children?: ReactNode } & Record<string, unknown>) => {
          void _i;
          void _a;
          void _tr;
          return React.createElement(
            tag,
            rest as Record<string, unknown>,
            children as ReactNode,
          );
        },
    },
  ),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) =>
    React.createElement('a', { href }, children as ReactNode),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: ReactNode }) =>
    React.createElement(React.Fragment, null, children as ReactNode),
}));

import NotFound from './not-found';

describe('not-found.tsx (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { container } = render(<NotFound />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
