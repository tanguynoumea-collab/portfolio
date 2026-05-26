/**
 * components/theme/WCAGBadge.test.tsx — integration tests for THEME-09.
 *
 * Covers: worst-pair ratio numeric formatting (2 decimals), AA / AAA / Fail
 * status label resolution against i18n, Adjusted-for-AA chip visibility gated
 * on usePalette().wasAdjustedForAA (D-06 + D-11), live update on palette change.
 *
 * jsdom environment per vitest.config.ts; describe/it/expect explicitly
 * imported (project convention — vitest globals true at runtime but tsc
 * doesn't pick them up).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
import { WCAGBadge } from './WCAGBadge';
import frMessages from '@/messages/fr.json';
import type { ReactNode } from 'react';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextIntlClientProvider>
  );
}

function BadgeAndControls() {
  const { setCustomColor, setPreset } = usePalette();
  return (
    <>
      <WCAGBadge />
      <button data-testid="set-terra" onClick={() => setPreset('terra')}>
        terra
      </button>
      <button
        data-testid="set-bad-custom"
        onClick={() =>
          setCustomColor({
            // Mid-grey bg forces deriveDefaultTokens to push text to oklch(0.95 0 0)
            // since bg.l = 0.5 fails the > 0.5 check (isLight=false), and then
            // textMuted midpoint between text and bg will fail 4.5:1 vs bg —
            // applyMatrixAdjust shifts it (wasAdjusted = true).
            bg: 'oklch(0.5 0 0)',
            accent: 'oklch(0.55 0.2 30)',
            secondary: 'oklch(0.5 0.1 200)',
          })
        }
      >
        bad
      </button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('WCAGBadge — numeric ratio (D-06)', () => {
  it('renders worst-pair ratio with 2 decimals for Terra (active default)', () => {
    render(
      <Wrapper>
        <WCAGBadge />
      </Wrapper>,
    );
    // Terra passes 7/7 → numeric ratio is displayed with 2 decimals.
    const numeric = screen.getByText(/^\d+\.\d{2}$/);
    expect(numeric).toBeDefined();
  });
});

describe('WCAGBadge — status labels (THEME-09)', () => {
  it('shows the AA or AAA label for an all-passing palette (Terra default)', () => {
    render(
      <Wrapper>
        <WCAGBadge />
      </Wrapper>,
    );
    const aa = frMessages.palette.wcag.aa;
    const aaa = frMessages.palette.wcag.aaa;
    const text = screen.getByRole('status').textContent ?? '';
    // Terra default — must show AA or AAA, never Fail
    expect(text.includes(aa) || text.includes(aaa)).toBe(true);
    expect(text.includes(frMessages.palette.wcag.fail)).toBe(false);
  });
});

describe('WCAGBadge — Adjusted-for-AA chip (D-06 + D-11)', () => {
  it('does NOT show the Adjusted-for-AA chip when wasAdjustedForAA=false (default after setPreset)', () => {
    render(
      <Wrapper>
        <BadgeAndControls />
      </Wrapper>,
    );
    act(() => screen.getByTestId('set-terra').click());
    expect(screen.queryByText(frMessages.palette.wcag.adjusted)).toBeNull();
  });

  it('shows the Adjusted-for-AA chip after a custom palette triggers adjustForAA', () => {
    render(
      <Wrapper>
        <BadgeAndControls />
      </Wrapper>,
    );
    // Adversarial mid-grey bg — derived textMuted will fail 4.5:1 vs bg=0.5,
    // applyMatrixAdjust shifts it, wasAdjustedForAA flips to true.
    act(() => screen.getByTestId('set-bad-custom').click());
    expect(screen.queryByText(frMessages.palette.wcag.adjusted)).not.toBeNull();
  });
});

describe('WCAGBadge — live update on palette change', () => {
  it('numeric ratio re-computes when palette changes', () => {
    render(
      <Wrapper>
        <BadgeAndControls />
      </Wrapper>,
    );
    // Capture initial ratio under Terra (default)
    const initialText = screen.getByRole('status').textContent ?? '';
    const initialMatch = initialText.match(/^[^\d]*(\d+\.\d{2})/);
    expect(initialMatch).not.toBeNull();

    // Switch to the adversarial mid-grey custom palette — ratio MUST change
    act(() => screen.getByTestId('set-bad-custom').click());
    const newText = screen.getByRole('status').textContent ?? '';
    const newMatch = newText.match(/^[^\d]*(\d+\.\d{2})/);
    expect(newMatch).not.toBeNull();
    // The two ratios should differ (Terra worst pair vs mid-grey worst pair)
    expect(initialMatch![1]).not.toBe(newMatch![1]);
  });
});
