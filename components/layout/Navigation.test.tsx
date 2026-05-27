/**
 * components/layout/Navigation.test.tsx — LAYOUT-03 contract tests.
 *
 * 5 tests covering:
 *   1. Renders wordmark + 5 section anchor links + LanguageSwitcher slot
 *   2. Does NOT include PaletteFab (D-14 — PaletteFab is a separate FAB)
 *   3. Mobile hamburger opens a Sheet whose content carries data-lenis-prevent
 *   4. Active section link gets aria-current="true"
 *   5. At scrollY=0 nav is transparent; after scrollY>50 it gains backdrop-blur-md
 *
 * Dependencies mocked so the test stays focused on Navigation's contract:
 *   - next-intl useTranslations / useLocale → returns deterministic 'nav.<key>'
 *     strings (so we can assert anchor link names by predictable text content)
 *   - useActiveSection → returns 'about' (drives the aria-current assertion)
 *   - LanguageSwitcher → renders a div with testid (no real i18n nav here)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => `${ns}.${k}`,
  useLocale: () => 'fr',
}));

vi.mock('@/lib/hooks/useActiveSection', () => ({
  useActiveSection: () => 'about',
  NAV_SECTION_IDS: ['home', 'about', 'projects', 'skills', 'contact'],
}));

vi.mock('@/components/layout/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

// next/link needs no mock — it accepts arbitrary children and renders an <a>.
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

type NavigationModule = { Navigation: () => ReactNode };
let NavigationComponent: NavigationModule['Navigation'];

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  const mod = (await import('./Navigation')) as NavigationModule;
  NavigationComponent = mod.Navigation;
});

describe('Navigation (LAYOUT-03)', () => {
  it('renders the wordmark + 5 section anchor links + LanguageSwitcher', () => {
    render(<NavigationComponent />);
    // Wordmark appears (logo + likely SheetTitle, both render "Tanguy")
    expect(screen.getAllByText('Tanguy').length).toBeGreaterThan(0);
    // 5 section anchor hrefs are present on at least one anchor each
    ['home', 'about', 'projects', 'skills', 'contact'].forEach((id) => {
      const links = screen
        .getAllByRole('link')
        .filter((a) => a.getAttribute('href') === `#${id}`);
      expect(links.length).toBeGreaterThan(0);
    });
    // getByTestId throws if the element is not in the document.
    expect(screen.getByTestId('lang-switcher')).toBeTruthy();
  });

  it('does NOT include a PaletteFab button', () => {
    const { container } = render(<NavigationComponent />);
    expect(container.innerHTML).not.toMatch(/PaletteFab/);
    // Loose match catches any leftover palette UI literal in the DOM.
    // (Sheet rendered into a portal lives in document.body — also covered below.)
    expect(document.body.innerHTML).not.toMatch(/palette-fab/i);
  });

  it('mobile hamburger opens a Sheet with data-lenis-prevent', () => {
    render(<NavigationComponent />);
    // Hamburger trigger: the only button with no other identifying text
    // (LanguageSwitcher is mocked as a div, so no extra buttons). Pick by
    // its aria-label which equals t('home') in our mocks => 'nav.home'.
    const triggers = screen.getAllByLabelText('nav.home');
    // The hamburger SheetTrigger is the one whose tagName is BUTTON.
    const hamburger = triggers.find((el) => el.tagName === 'BUTTON');
    if (!hamburger) throw new Error('hamburger button not found');
    fireEvent.click(hamburger);
    // SheetContent is rendered to a portal in document.body — query there.
    const sheet = document.querySelector('[data-lenis-prevent]');
    expect(sheet).not.toBeNull();
  });

  it('marks the active section link with aria-current', () => {
    render(<NavigationComponent />);
    const aboutLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '#about');
    expect(aboutLinks.length).toBeGreaterThan(0);
    // At least one of the rendered anchors for #about should have aria-current
    expect(aboutLinks.some((a) => a.getAttribute('aria-current') === 'true')).toBe(
      true,
    );
  });

  it('switches to backdrop-blur after scrollY>50', () => {
    const { container } = render(<NavigationComponent />);
    const header = container.querySelector('header');
    if (!header) throw new Error('header not found');
    // Initial: transparent at scrollY=0 (no backdrop-blur class).
    expect(header.className).toContain('bg-transparent');
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);
    expect(header.className).toContain('backdrop-blur-md');
  });
});
