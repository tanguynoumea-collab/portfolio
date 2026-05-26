/**
 * components/theme/CustomColorPicker.test.tsx — integration tests for THEME-07.
 *
 * Covers:
 *   - Test #1 (THEME-07, D-09): Exactly 3 native color inputs labeled
 *     bg / accent / secondary via i18n.
 *   - Test #2 (THEME-07, D-10): Changing the accent input dispatches
 *     setCustomColor; the reducer routes through deriveDefaultTokens +
 *     applyMatrixAdjust so paletteId flips to 'custom' and customSource='picker'.
 *   - Test #3 (Pitfall C): --color-accent CSS variable on document.documentElement
 *     ends up as OKLCh, never hex.
 *
 * jsdom environment per vitest.config.ts; describe/it/expect explicitly imported
 * (project convention — vitest globals true at runtime but tsc doesn't pick
 * them up without @types/vitest augmentation).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
import { CustomColorPicker } from './CustomColorPicker';
import frMessages from '@/messages/fr.json';
import type { ReactNode } from 'react';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextIntlClientProvider>
  );
}

function PickerAndState() {
  const { palette, isCustom, customSource } = usePalette();
  return (
    <>
      <CustomColorPicker />
      <div data-testid="state">
        {JSON.stringify({ isCustom, customSource, accent: palette.accent })}
      </div>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('CustomColorPicker — 3 native color inputs (THEME-07, D-09)', () => {
  it('renders exactly 3 native <input type="color"> labeled bg/accent/secondary', () => {
    render(
      <Wrapper>
        <CustomColorPicker />
      </Wrapper>,
    );
    const labels = [
      frMessages.palette.custom.bg,
      frMessages.palette.custom.accent,
      frMessages.palette.custom.secondary,
    ];
    for (const label of labels) {
      const input = screen.getByLabelText(label) as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.type).toBe('color');
    }
  });
});

describe('CustomColorPicker — setCustomColor dispatch (THEME-07, D-10)', () => {
  it('changing the accent input triggers setCustomColor and flips isCustom (D-10 derivation runs in reducer)', () => {
    render(
      <Wrapper>
        <PickerAndState />
      </Wrapper>,
    );
    const accent = screen.getByLabelText(
      frMessages.palette.custom.accent,
    ) as HTMLInputElement;
    fireEvent.change(accent, { target: { value: '#3366cc' } });
    const state = JSON.parse(
      screen.getByTestId('state').textContent ?? '{}',
    );
    expect(state.isCustom).toBe(true);
    expect(state.customSource).toBe('picker');
    // Stored accent is OKLCh, NOT hex (Pitfall C — hex was converted away
    // at the onChange boundary before reaching the reducer).
    expect(state.accent).toMatch(/^oklch\(/);
  });
});

describe('CustomColorPicker — Pitfall C (OKLCh-only invariant)', () => {
  it('--color-accent CSS variable is OKLCh, never hex', () => {
    render(
      <Wrapper>
        <CustomColorPicker />
      </Wrapper>,
    );
    const accent = screen.getByLabelText(
      frMessages.palette.custom.accent,
    ) as HTMLInputElement;
    fireEvent.change(accent, { target: { value: '#ff00aa' } });
    const css =
      document.documentElement.style.getPropertyValue('--color-accent');
    expect(css.startsWith('oklch(')).toBe(true);
    expect(css.startsWith('#')).toBe(false);
  });
});
