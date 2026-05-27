/**
 * Contact.test.tsx — HOME-07 acceptance suite.
 *
 * Wave 0 shipped a minimal RED harness that exercised a single render
 * assertion. Wave 1 (this plan, 04-05-contact-PLAN.md Task 2) expands the
 * suite to cover the full HOME-07 contract:
 *
 *   1. Renders the EMAIL constant inside a <button> with the localized
 *      contact.email aria-label.
 *   2. Clicking the email button calls navigator.clipboard.writeText(EMAIL).
 *   3. After a successful copy, the sr-only aria-live="polite" span contains
 *      the contact.emailCopied label (HOME-07 feedback contract).
 *   4. When the Clipboard API rejects (permission denied, insecure context,
 *      etc.) the rejection is SILENT — no console.error / warn / log
 *      (Phase 2 D-02 silent-fallback precedent).
 *   5. 3 social anchors are present with localized aria-labels and correct
 *      hrefs (GITHUB_URL / LINKEDIN_URL / mailto:EMAIL).
 *   6. GitHub + LinkedIn carry target="_blank" rel="noopener noreferrer"
 *      (XSS / referrer-leak hardening); mailto: anchor does NOT.
 *   7. 2 CV download buttons render with correct href + download attributes
 *      (CV_Tanguy_Delrieu_FR.pdf + CV_Tanguy_Delrieu_EN.pdf).
 *
 * Mock strategy:
 *   - next-intl is mocked at module level with a fr/en-agnostic resolver
 *     that returns plain strings matching the messages bundle.
 *   - motion/react is mocked to render real React elements (NOT plain
 *     objects — that breaks JSX reconciliation). motion.span renders an
 *     actual <span> via React.createElement so the AnimatePresence-wrapped
 *     children flow into the DOM tree and getByText / queryByText work.
 *   - @/lib/constants is mocked with stable values so href / aria-label
 *     assertions don't depend on the placeholder swap in lib/constants.ts.
 *   - navigator.clipboard is patched per test (writeText spy that
 *     resolves OR rejects per case).
 *
 * Pattern reference: components/layout/Footer.test.tsx for the
 * getByLabelText + anchor.href + target/rel assertion shape.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// next-intl mock — flat key resolver matching the messages bundle exactly
// (contact.title / contact.intro / contact.email / contact.emailCopied /
// contact.cv.{fr,en} / contact.social.{github,linkedin}).
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

// motion/react mock — render real React elements so AnimatePresence children
// flow into the DOM. The Wave 0 RED harness mocked motion.span as a plain
// object ({type, props}) which broke React's reconciler ("Objects are not
// valid as a React child"). The correct mock returns a React element via
// React.createElement so the inner Copy/Check icons + sr-only span actually
// appear in the rendered tree and getByText works.
vi.mock('motion/react', () => ({
  motion: {
    span: ({ children, ...rest }: { children?: ReactNode } & Record<string, unknown>) =>
      React.createElement('span', rest as Record<string, unknown>, children as ReactNode),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) =>
    children as React.ReactElement,
}));

vi.mock('@/lib/constants', () => ({
  EMAIL: 'tanguy@example.com',
  GITHUB_URL: 'https://github.com/tanguynoumea/portfolio',
  LINKEDIN_URL: 'https://www.linkedin.com/in/tanguy-delrieu',
}));

// Shared writeText spy — replaced per test (some resolve, some reject) so
// we can test both the happy path and the silent-rejection path. The mock
// is installed in beforeEach so each test gets a fresh spy.
let writeTextSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeTextSpy = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Contact (HOME-07) — email row', () => {
  it('renders the EMAIL constant inside a button with localized aria-label', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    // Email is rendered as text content
    expect(screen.getByText(/tanguy@example.com/)).toBeTruthy();
    // The button itself is reachable via the localized aria-label
    const btn = screen.getByLabelText('Copy email address') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('clicking the email button calls navigator.clipboard.writeText(EMAIL)', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const btn = screen.getByLabelText('Copy email address');
    fireEvent.click(btn);
    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(writeTextSpy).toHaveBeenCalledWith('tanguy@example.com');
  });

  it('after successful copy, sr-only aria-live region contains the emailCopied label', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const btn = screen.getByLabelText('Copy email address');
    await act(async () => {
      fireEvent.click(btn);
    });
    // The setCopied state flip + AnimatePresence re-render happens after the
    // resolved promise tick. waitFor polls the DOM until the label appears.
    await waitFor(() => {
      expect(screen.getByText('Address copied!')).toBeTruthy();
    });
  });

  it('clipboard rejection is silent — no console.error / warn / log', async () => {
    // Re-bind writeText to reject so the catch branch executes
    writeTextSpy = vi.fn().mockRejectedValue(new Error('permission denied'));
    Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const { Contact } = await import('./Contact');
    render(<Contact />);
    const btn = screen.getByLabelText('Copy email address');
    await act(async () => {
      fireEvent.click(btn);
    });
    // Yield to the microtask queue so the rejected promise propagates.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    errSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });
});

describe('Contact (HOME-07) — 3 social links', () => {
  it('renders GitHub anchor with GITHUB_URL href + target/rel', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const a = screen.getByLabelText('GitHub') as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.tagName).toBe('A');
    expect(a.href).toBe('https://github.com/tanguynoumea/portfolio');
    expect(a.getAttribute('target')).toBe('_blank');
    const rel = a.getAttribute('rel') ?? '';
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });

  it('renders LinkedIn anchor with LINKEDIN_URL href + target/rel', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const a = screen.getByLabelText('LinkedIn') as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.tagName).toBe('A');
    expect(a.href).toBe('https://www.linkedin.com/in/tanguy-delrieu');
    expect(a.getAttribute('target')).toBe('_blank');
    const rel = a.getAttribute('rel') ?? '';
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });

  it('renders Email mailto: anchor WITHOUT target/rel', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const a = screen.getByLabelText('Email') as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.tagName).toBe('A');
    expect(a.href.startsWith('mailto:')).toBe(true);
    expect(a.href).toBe('mailto:tanguy@example.com');
    // mailto: anchors must NOT carry target/rel — the OS mail client handles
    // them and target="_blank" causes a blank-window flash in some browsers.
    expect(a.getAttribute('target')).toBeNull();
    expect(a.getAttribute('rel')).toBeNull();
  });
});

describe('Contact (HOME-07) — 2 CV download buttons', () => {
  it('renders FR CV button with href=/cv-fr.pdf + download=CV_Tanguy_Delrieu_FR.pdf', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    // Button asChild renders <a> as the slot — the localized FR label appears
    // as text on that anchor.
    const a = screen.getByText('Télécharger le CV (FR)').closest('a') as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.getAttribute('href')).toBe('/cv-fr.pdf');
    expect(a.getAttribute('download')).toBe('CV_Tanguy_Delrieu_FR.pdf');
  });

  it('renders EN CV button with href=/cv-en.pdf + download=CV_Tanguy_Delrieu_EN.pdf', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const a = screen.getByText('Download CV (EN)').closest('a') as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.getAttribute('href')).toBe('/cv-en.pdf');
    expect(a.getAttribute('download')).toBe('CV_Tanguy_Delrieu_EN.pdf');
  });
});

describe('Contact (HOME-07) — section title + intro', () => {
  it('renders the contact.title as a heading', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toMatch(/Get in touch/);
  });

  it('renders the contact.intro paragraph', async () => {
    const { Contact } = await import('./Contact');
    render(<Contact />);
    expect(screen.getByText(/Available to discuss your projects/)).toBeTruthy();
  });
});
