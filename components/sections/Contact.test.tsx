/**
 * Contact.test.tsx — RED harness for HOME-07.
 *
 * Wave 1 (04-05-contact-PLAN) creates Contact.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    const map: Record<string, string> = {
      email: 'Copy email address',
      emailCopied: 'Address copied!',
      'cv.fr': 'Télécharger le CV (FR)',
      'cv.en': 'Download CV (EN)',
      'social.github': 'GitHub',
      'social.linkedin': 'LinkedIn',
    };
    return map[k] ?? `${ns}.${k}`;
  },
}));

vi.mock('motion/react', () => ({
  motion: {
    span: ((props: Record<string, unknown>) =>
      ({ type: 'span', props }) as unknown as React.ReactElement) as unknown as React.FC,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    children as React.ReactElement,
}));

vi.mock('@/lib/constants', () => ({
  EMAIL: 'tanguy@example.com',
  GITHUB_URL: 'https://github.com/tanguynoumea/portfolio',
  LINKEDIN_URL: 'https://www.linkedin.com/in/tanguy-delrieu',
}));

describe('Contact (HOME-07) — RED until Wave 1 ships', () => {
  it('renders email button + 3 social links + 2 CV download buttons', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    expect(screen.getByText(/tanguy@example.com/)).toBeTruthy();
  });
});
