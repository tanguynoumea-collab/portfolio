/**
 * Contact.a11y.test.tsx — A11Y-04 axe-core surface (Phase 6 D-10).
 *
 * Renders <Contact /> in jsdom and asserts axe reports zero violations. Mocks
 * mirror Contact.test.tsx (next-intl flat resolver, motion/react real elements
 * + useReducedMotion, @/lib/constants) so the email copy button (aria-label),
 * the social anchors (localized aria-labels), and the CV download buttons
 * render exactly as in the unit test. The real shadcn Button (asChild) is used
 * so the rendered <a> chrome is faithful.
 *
 * This surface is rich in icon-only / labelled controls, so the active
 * `button-name` + `link-name` axe rules genuinely verify accessible names.
 * Only `color-contrast` is disabled (jsdom can't compute contrast).
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';
import type { ReactNode } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    const map: Record<string, string> = {
      title: 'Get in touch',
      intro: 'Available to discuss your projects.',
      email: 'Copy email address',
      emailCopied: 'Address copied!',
      'cv.fr': 'Télécharger le CV (FR)',
      'cv.en': 'Download CV (EN)',
      'social.github': 'GitHub',
      'social.linkedin': 'LinkedIn',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    };
    return map[k] ?? `${ns}.${k}`;
  },
}));

vi.mock('motion/react', () => ({
  motion: {
    span: ({ children, ...rest }: { children?: ReactNode } & Record<string, unknown>) =>
      React.createElement('span', rest as Record<string, unknown>, children as ReactNode),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) =>
    children as React.ReactElement,
  useReducedMotion: () => false,
}));

vi.mock('@/lib/constants', () => ({
  EMAIL: 'tanguy@example.com',
  GITHUB_URL: 'https://github.com/tanguynoumea/portfolio',
  LINKEDIN_URL: 'https://www.linkedin.com/in/tanguy-delrieu',
}));

describe('Contact (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { Contact } = await import('./Contact');
    const { container } = render(<Contact />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
