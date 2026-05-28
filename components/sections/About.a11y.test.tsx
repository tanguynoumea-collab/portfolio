/**
 * About.a11y.test.tsx — A11Y-04 axe-core surface (Phase 6 D-10).
 *
 * Renders <About /> in jsdom and asserts axe reports zero violations. Mocks
 * mirror About.test.tsx (next-intl, @gsap/react, gsap matchMedia,
 * gsap/ScrollTrigger) EXCEPT next/image: here it renders a REAL <img> with the
 * alt/src props (not a string dump) so axe's `image-alt` rule is genuinely
 * exercised against the rendered DOM — the section's portrait must carry an
 * accessible alt.
 *
 * Only `color-contrast` is disabled (jsdom can't compute contrast); all other
 * rules stay active.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    if (ns === 'about') {
      const map: Record<string, string> = {
        title: 'About me',
        'paragraphs.1': 'First paragraph placeholder.',
        'paragraphs.2': 'Second paragraph placeholder.',
      };
      return map[k] ?? `${ns}.${k}`;
    }
    return `${ns}.${k}`;
  },
}));

// next/image → real <img> so axe verifies image-alt on the rendered element.
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  }) =>
    React.createElement('img', {
      src,
      alt,
      width,
      height,
    }),
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
    timeline: () => {
      const chain = { from: () => chain };
      return chain;
    },
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

describe('About (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { About } = await import('./About');
    const { container } = render(<About />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
