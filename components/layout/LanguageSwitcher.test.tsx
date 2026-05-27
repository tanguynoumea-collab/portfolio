/**
 * components/layout/LanguageSwitcher.test.tsx — LAYOUT-05 contract tests.
 *
 * 4 tests covering:
 *   1. Both FR + EN buttons render with correct aria-pressed (active locale's
 *      button is pressed=true, the other pressed=false)
 *   2. Clicking the inactive locale calls router.replace with the LOCALE-AWARE
 *      object shape ({ pathname, params }, { locale: target }) — the
 *      disambiguation that proves the import came from @/i18n/navigation
 *   3. document.documentElement.lang is imperatively set to the current locale
 *   4. Lenis scrollTo is called with the saved scroll position + immediate:true
 *      after the route change (D-21 scroll preservation)
 *
 * The motion layoutId on the active indicator is structurally enforced by
 * grep against the source file (acceptance gate), not via runtime assertion
 * — jsdom does not render motion layout animations meaningfully.
 *
 * All upstream hooks mocked:
 *   - @/i18n/navigation (useRouter, usePathname) — proves the locale-aware
 *     navigation module is wired correctly
 *   - next/navigation (useParams)
 *   - next-intl (useLocale, useTranslations)
 *   - @/components/providers/LenisProvider (useLenis)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactNode } from 'react';

const replaceMock = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/projects/foo',
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'foo' }),
}));

const localeMock = vi.fn(() => 'fr');
vi.mock('next-intl', () => ({
  useLocale: () => localeMock(),
  useTranslations: () =>
    (k: string, vars?: Record<string, string>) => {
      if (k === 'label')
        return localeMock() === 'fr' ? 'Changer la langue' : 'Switch language';
      if (k === 'switchTo')
        return localeMock() === 'fr'
          ? `Passer en ${vars?.target ?? ''}`
          : `Switch to ${vars?.target ?? ''}`;
      return k;
    },
}));

const lenisScrollTo = vi.fn();
vi.mock('@/components/providers/LenisProvider', () => ({
  useLenis: () => ({ actualScroll: 250, scrollTo: lenisScrollTo }),
}));

type LanguageSwitcherModule = { LanguageSwitcher: () => ReactNode };
let LanguageSwitcherComponent: LanguageSwitcherModule['LanguageSwitcher'];

beforeEach(async () => {
  replaceMock.mockClear();
  lenisScrollTo.mockClear();
  localeMock.mockReturnValue('fr');
  vi.resetModules();
  const mod = (await import('./LanguageSwitcher')) as LanguageSwitcherModule;
  LanguageSwitcherComponent = mod.LanguageSwitcher;
});

describe('LanguageSwitcher (LAYOUT-05)', () => {
  it('renders FR and EN buttons with correct aria-pressed', () => {
    render(<LanguageSwitcherComponent />);
    const fr = screen.getByRole('button', { name: 'Passer en FR' });
    const en = screen.getByRole('button', { name: 'Passer en EN' });
    expect(fr.getAttribute('aria-pressed')).toBe('true');
    expect(en.getAttribute('aria-pressed')).toBe('false');
  });

  it('calls router.replace with the locale-aware object shape when clicking the inactive locale', () => {
    render(<LanguageSwitcherComponent />);
    const en = screen.getByRole('button', { name: 'Passer en EN' });
    fireEvent.click(en);
    expect(replaceMock).toHaveBeenCalled();
    const call = replaceMock.mock.calls[0];
    expect(call).toBeDefined();
    const [pathArg, opts] = call as [
      { pathname: string; params: Record<string, string> },
      { locale: string },
    ];
    expect(pathArg).toMatchObject({
      pathname: '/projects/foo',
      params: { slug: 'foo' },
    });
    expect(opts).toEqual({ locale: 'en' });
  });

  it('imperatively sets document.documentElement.lang on locale change', () => {
    const { rerender } = render(<LanguageSwitcherComponent />);
    expect(document.documentElement.lang).toBe('fr');
    localeMock.mockReturnValue('en');
    rerender(<LanguageSwitcherComponent />);
    expect(document.documentElement.lang).toBe('en');
  });

  it('calls lenis.scrollTo with saved scroll position after route change', async () => {
    render(<LanguageSwitcherComponent />);
    const en = screen.getByRole('button', { name: 'Passer en EN' });
    act(() => {
      fireEvent.click(en);
    });
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
    expect(lenisScrollTo).toHaveBeenCalledWith(250, { immediate: true });
  });
});
