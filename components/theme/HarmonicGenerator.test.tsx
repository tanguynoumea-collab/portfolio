/**
 * components/theme/HarmonicGenerator.test.tsx — integration tests for THEME-08 + D-12.
 *
 * Covers:
 *   - Test #1 (THEME-08, D-12): Renders source color input + 4 mode tabs + 6-swatch
 *     preview grid + Apply button.
 *   - Test #2 (D-12, Open Q3 answer (a)): Preview is non-destructive — changing
 *     source or mode does NOT mutate ThemeProvider state. isCustom stays false
 *     until Apply is clicked.
 *   - Test #3 (THEME-08, D-12): Clicking Apply commits the harmonic palette
 *     (isCustom=true + customSource='harmonic').
 *   - Test #4 (THEME-08): Switching between mode tabs updates the preview
 *     swatches (different mode → different secondary hue → different swatch bg).
 *
 * jsdom environment per vitest.config.ts; describe/it/expect explicitly imported
 * (project convention — vitest globals true at runtime but tsc doesn't pick them
 * up without @types/vitest augmentation).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
import { HarmonicGenerator } from './HarmonicGenerator';
import frMessages from '@/messages/fr.json';
import type { ReactNode } from 'react';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextIntlClientProvider>
  );
}

function GenAndState() {
  const { isCustom, customSource } = usePalette();
  return (
    <>
      <HarmonicGenerator />
      <div data-testid="state">{JSON.stringify({ isCustom, customSource })}</div>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('HarmonicGenerator — initial render (THEME-08, D-12)', () => {
  it('renders source color input + 4 mode tabs + 6-swatch preview + Apply button', () => {
    render(
      <Wrapper>
        <HarmonicGenerator />
      </Wrapper>,
    );
    // Source picker
    const source = screen.getByLabelText(
      frMessages.palette.generate.source,
    ) as HTMLInputElement;
    expect(source).toBeDefined();
    expect(source.type).toBe('color');

    // 4 mode tabs (one TabsTrigger per HarmonicMode)
    const modes = [
      'complementary',
      'triadic',
      'analogous',
      'split-complementary',
    ] as const;
    for (const m of modes) {
      const label = frMessages.palette.generate.modes[m];
      expect(screen.getByRole('tab', { name: label })).toBeDefined();
    }

    // Preview grid
    expect(screen.getByTestId('harmonic-preview')).toBeDefined();

    // Apply button
    expect(screen.getByTestId('apply-harmonic')).toBeDefined();
  });
});

describe('HarmonicGenerator — non-destructive preview (D-12, Open Q3 answer (a))', () => {
  it('changing source/mode does NOT mutate ThemeProvider until Apply is clicked', () => {
    render(
      <Wrapper>
        <GenAndState />
      </Wrapper>,
    );
    const source = screen.getByLabelText(
      frMessages.palette.generate.source,
    ) as HTMLInputElement;
    fireEvent.change(source, { target: { value: '#ff00aa' } });
    // Before Apply click, ThemeProvider state must remain non-custom
    // (Terra default — only the preview swatches changed via local useMemo).
    const state = JSON.parse(
      screen.getByTestId('state').textContent ?? '{}',
    );
    expect(state.isCustom).toBe(false);
    expect(state.customSource).toBeNull();
  });
});

describe('HarmonicGenerator — Apply commits (THEME-08, D-12)', () => {
  it('clicking Apply commits the harmonic palette (isCustom=true + customSource=harmonic)', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <GenAndState />
      </Wrapper>,
    );
    await user.click(screen.getByTestId('apply-harmonic'));
    const state = JSON.parse(
      screen.getByTestId('state').textContent ?? '{}',
    );
    expect(state.isCustom).toBe(true);
    expect(state.customSource).toBe('harmonic');
  });
});

describe('HarmonicGenerator — mode switching updates preview (THEME-08)', () => {
  it('switching from complementary to triadic changes the preview secondary swatch', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <HarmonicGenerator />
      </Wrapper>,
    );
    // Capture the initial secondary swatch backgroundColor under complementary mode
    const secondaryBefore = (
      document.querySelector(
        '[data-testid="harmonic-preview"] [data-token="secondary"]',
      ) as HTMLElement | null
    )?.style.backgroundColor;
    expect(secondaryBefore).toBeDefined();
    expect(typeof secondaryBefore).toBe('string');

    // Switch to triadic mode (secondary offset +120° vs complementary +180°)
    await user.click(
      screen.getByRole('tab', { name: frMessages.palette.generate.modes.triadic }),
    );

    const secondaryAfter = (
      document.querySelector(
        '[data-testid="harmonic-preview"] [data-token="secondary"]',
      ) as HTMLElement | null
    )?.style.backgroundColor;
    expect(secondaryAfter).toBeDefined();
    // Different mode → different hue rotation → different secondary backgroundColor
    expect(secondaryAfter).not.toBe(secondaryBefore);
  });
});
