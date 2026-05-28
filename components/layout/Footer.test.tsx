/**
 * components/layout/Footer.test.tsx — unit tests for LAYOUT-04 (Phase 3 D-22..D-25).
 *
 * Covers the contract from .planning/phases/03-layout-animation-foundation/03-04-footer-PLAN.md:
 *   1. Footer renders a <footer> semantic landmark with the dynamic year inside
 *      the i18n copyright template (`© {year} Tanguy Delrieu. Tous droits réservés.`).
 *   2. Footer renders the localized tagline from messages.footer.tagline.
 *   3. Footer renders 3 social anchors — GitHub portfolio repo, LinkedIn, mailto:.
 *   4. GitHub + LinkedIn anchors carry target="_blank" and rel="noopener noreferrer"
 *      (security best-practice for external links; D-23). The Mail link uses mailto:
 *      protocol — no target/rel needed (mail clients ignore them and target=_blank
 *      causes a blank-window flash in some browsers).
 *
 * next-intl is mocked at module level so we don't need to wrap in
 * NextIntlClientProvider for these structural assertions. We use plain DOM
 * assertions (no jest-dom matchers) to match the project's existing test style
 * (PaletteFab.test.tsx etc. use the same pattern).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string, vars?: Record<string, unknown>) => {
    if (ns === 'footer' && k === 'copyright')
      return `© ${vars?.year} Tanguy Delrieu. Tous droits réservés.`;
    if (ns === 'footer' && k === 'tagline')
      return 'Construit avec Next.js et beaucoup de café.';
    if (ns === 'contact.social' && k === 'github') return 'GitHub';
    if (ns === 'contact.social' && k === 'linkedin') return 'LinkedIn';
    return `${ns}.${k}`;
  },
}));

let Footer: (p: { year: number }) => ReactElement;
beforeEach(async () => {
  const mod = await import('./Footer');
  Footer = mod.Footer;
});

describe('Footer (LAYOUT-04) — semantic landmark + dynamic year', () => {
  it('renders a <footer> landmark with the dynamic year inside the copyright template', () => {
    const { container } = render(<Footer year={2026} />);
    const footerEl = container.querySelector('footer');
    expect(footerEl).not.toBeNull();
    // The ICU template `© {year} Tanguy Delrieu. Tous droits réservés.` resolves
    // to `© 2026 Tanguy Delrieu. Tous droits réservés.` in the mocked t() above.
    expect(screen.getByText(/© 2026/)).toBeTruthy();
  });
});

describe('Footer — i18n tagline rendering', () => {
  it('renders the tagline text from messages.footer.tagline', () => {
    render(<Footer year={2026} />);
    expect(screen.getByText(/Construit avec Next\.js/)).toBeTruthy();
  });
});

describe('Footer — 3 social anchors (D-23)', () => {
  it('renders GitHub anchor pointing to the portfolio repo', () => {
    render(<Footer year={2026} />);
    const github = screen.getByLabelText('GitHub') as HTMLAnchorElement;
    expect(github).not.toBeNull();
    expect(github.tagName).toBe('A');
    expect(github.href).toBe('https://github.com/tanguynoumea-collab/portfolio');
  });

  it('renders LinkedIn anchor pointing to a linkedin.com URL', () => {
    render(<Footer year={2026} />);
    const linkedin = screen.getByLabelText('LinkedIn') as HTMLAnchorElement;
    expect(linkedin).not.toBeNull();
    expect(linkedin.tagName).toBe('A');
    expect(linkedin.href).toMatch(/linkedin\.com/);
  });

  it('renders Email anchor with mailto: protocol', () => {
    render(<Footer year={2026} />);
    const mail = screen.getByLabelText('Email') as HTMLAnchorElement;
    expect(mail).not.toBeNull();
    expect(mail.tagName).toBe('A');
    expect(mail.href.startsWith('mailto:')).toBe(true);
  });
});

describe('Footer — external link security attributes (target/rel)', () => {
  it('GitHub anchor has target="_blank" and rel includes noopener + noreferrer', () => {
    render(<Footer year={2026} />);
    const github = screen.getByLabelText('GitHub') as HTMLAnchorElement;
    expect(github.getAttribute('target')).toBe('_blank');
    const rel = github.getAttribute('rel') ?? '';
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });

  it('LinkedIn anchor has target="_blank" and rel includes noopener + noreferrer', () => {
    render(<Footer year={2026} />);
    const linkedin = screen.getByLabelText('LinkedIn') as HTMLAnchorElement;
    expect(linkedin.getAttribute('target')).toBe('_blank');
    const rel = linkedin.getAttribute('rel') ?? '';
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });
});

describe('Footer — lucide-react icons present', () => {
  it('renders at least 3 svg icons (one per social link)', () => {
    const { container } = render(<Footer year={2026} />);
    const svgs = container.querySelectorAll('svg');
    // 3 lucide icons (Github, Linkedin, Mail). lucide-react renders each as an
    // <svg>. We assert >= 3 to tolerate future icon additions.
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });
});
