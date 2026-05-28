/**
 * PaletteFab.a11y.test.tsx — A11Y-04 axe-core surface (Phase 6 D-10 / D-11).
 *
 * PaletteFab is the icon-only Floating Action Button. Its localized aria-label
 * (t('open') / t('close')) is the A11Y-04 / D-11 accessible-name proof for
 * icon-only controls — this test renders the FAB and asserts axe passes with
 * the `button-name` rule ACTIVE (only `color-contrast` is disabled). If the
 * aria-label ever regresses, axe's button-name rule fails this test.
 *
 * Mocks isolate the FAB:
 *   - PaletteSwitcher → null (its open-state Radix Sheet portal is hard in
 *     jsdom; the Sheet focus-trap/Esc is covered by Phase 2 tests + HUMAN-UAT).
 *     The FAB's own accessible name is what this asserts.
 *   - usePalette → minimal context exposing vaporwaveUnlockNonce.
 *   - next-intl → resolves t('open') to a real label string.
 *   - motion/react → real <button>/<span> so the FAB renders into the DOM.
 *   - usePrefersReducedMotion → false (full motion default).
 *   - lucide-react → Palette/X render aria-hidden <svg> stubs.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';
import type { ReactNode } from 'react';

// PaletteSwitcher (Radix Sheet) → render nothing; the FAB is the axe target.
vi.mock('./PaletteSwitcher', () => ({
  PaletteSwitcher: () => null,
}));

vi.mock('@/components/providers/ThemeProvider', () => ({
  usePalette: () => ({ vaporwaveUnlockNonce: 0 }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      open: 'Open palette switcher',
      close: 'Close palette switcher',
    };
    return map[k] ?? k;
  },
}));

vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({
          children,
          whileHover: _wh,
          whileTap: _wt,
          animate: _a,
          transition: _tr,
          ...rest
        }: { children?: ReactNode } & Record<string, unknown>) => {
          void _wh;
          void _wt;
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

vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

vi.mock('lucide-react', () => ({
  Palette: (props: Record<string, unknown>) =>
    React.createElement('svg', { ...props, 'aria-hidden': true, 'data-icon': 'palette' }),
  X: (props: Record<string, unknown>) =>
    React.createElement('svg', { ...props, 'aria-hidden': true, 'data-icon': 'x' }),
}));

describe('PaletteFab (A11Y-04) — icon-only button has an accessible name', () => {
  it('has no a11y violations (button-name rule active)', async () => {
    const { PaletteFab } = await import('./PaletteFab');
    const { container } = render(<PaletteFab />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
