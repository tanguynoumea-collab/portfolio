/**
 * not-found.test.tsx — EGG-02 / A11Y-03 acceptance for the custom 404.
 *
 * Asserts:
 *   1. errors.404 title + message render.
 *   2. The back link is a locale-aware <Link href="/"> (mocked as <a href="/">).
 *   3. The motion entry GATES on useReducedMotion: when reduced is true the
 *      `initial` prop is opacity-only ({ opacity: 0 }, NO scale) — the A11Y-05
 *      reduced-motion contract.
 *
 * Mock conventions match Contact.test.tsx / page.test.tsx (native Vitest
 * matchers; jest-dom NOT globally extended):
 *   - next-intl: flat resolver returning `errors.404.<key>`.
 *   - motion/react: useReducedMotion reads a mutable ref (flip it per test);
 *     `motion` is a Proxy whose every tag renders the underlying element and
 *     serializes `initial`/`animate` as JSON data-attributes so the gate is
 *     inspectable without running the motion engine in jsdom.
 *   - @/i18n/navigation: Link → plain <a href>.
 *   - @/components/ui/button: passthrough wrapper.
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

const reduceRef = { current: false as boolean };
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `errors.404.${key}`,
}));
vi.mock('motion/react', () => ({
  useReducedMotion: () => reduceRef.current,
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({
          children,
          initial,
          animate,
          ...rest
        }: Record<string, unknown> & { children?: React.ReactNode }) =>
          React.createElement(
            tag,
            {
              ...rest,
              'data-initial': JSON.stringify(initial),
              'data-animate': JSON.stringify(animate),
            },
            children as React.ReactNode,
          ),
    },
  ),
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));

import NotFound from './not-found';

describe('not-found.tsx (EGG-02 / A11Y-03)', () => {
  it('renders errors.404 title/message and a back link to /', () => {
    reduceRef.current = false;
    const { container } = render(<NotFound />);
    expect(container.textContent).toContain('errors.404.title');
    expect(container.textContent).toContain('errors.404.message');
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('/');
  });

  it('motion entry is opacity-only under reduced motion', () => {
    reduceRef.current = true;
    const { container } = render(<NotFound />);
    const mdiv = container.querySelector('[data-initial]');
    const initial = JSON.parse(mdiv!.getAttribute('data-initial')!);
    expect(initial).toEqual({ opacity: 0 }); // NO scale when reduced
  });
});
