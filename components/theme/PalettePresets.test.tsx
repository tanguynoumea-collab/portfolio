/**
 * components/theme/PalettePresets.test.tsx — integration tests for THEME-06 + D-15.
 *
 * Covers: D-15 visibility filter (4 cards default, 5 cards after unlock), i18n
 * label sourcing (uses t('palette.presets.<id>') not palette.name), active
 * indicator (aria-checked on default Terra), click dispatches setPreset and
 * mutates --color-* on document.documentElement.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
import { PalettePresets } from './PalettePresets';
import frMessages from '@/messages/fr.json';
import { PALETTES } from '@/lib/palettes';
import type { ReactNode } from 'react';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextIntlClientProvider>
  );
}

function PresetsAndControls() {
  const { unlockVaporwave } = usePalette();
  return (
    <>
      <PalettePresets />
      <button data-testid="unlock" onClick={() => unlockVaporwave()}>
        unlock
      </button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('PalettePresets — visibility (D-15)', () => {
  it('renders exactly 4 cards when Vaporwave NOT unlocked', () => {
    render(
      <Wrapper>
        <PalettePresets />
      </Wrapper>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    // Vaporwave label is "Vaporwave" but the card should NOT be in the DOM
    const vaporwaveCard = radios.find(
      (r) => r.getAttribute('aria-label') === 'Vaporwave',
    );
    expect(vaporwaveCard).toBeUndefined();
  });

  it('renders 5 cards after Vaporwave is unlocked', () => {
    render(
      <Wrapper>
        <PresetsAndControls />
      </Wrapper>,
    );
    act(() => screen.getByTestId('unlock').click());
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(
      radios.some((r) => r.getAttribute('aria-label') === 'Vaporwave'),
    ).toBe(true);
  });
});

describe('PalettePresets — labels (D-15)', () => {
  it('uses t(palette.presets.<id>) labels, not palette.name', () => {
    render(
      <Wrapper>
        <PalettePresets />
      </Wrapper>,
    );
    // i18n labels from fr.json must be the source — checking the 4 visible.
    expect(
      screen.getByLabelText(frMessages.palette.presets.terra),
    ).toBeDefined();
    expect(
      screen.getByLabelText(frMessages.palette.presets.nordic),
    ).toBeDefined();
    expect(
      screen.getByLabelText(frMessages.palette.presets.bauhaus),
    ).toBeDefined();
    expect(
      screen.getByLabelText(frMessages.palette.presets.ocean),
    ).toBeDefined();
  });
});

describe('PalettePresets — active indicator + click dispatches setPreset', () => {
  it('marks terra card as aria-checked=true on default mount', () => {
    render(
      <Wrapper>
        <PalettePresets />
      </Wrapper>,
    );
    const terraCard = screen.getByLabelText(frMessages.palette.presets.terra);
    expect(terraCard.getAttribute('aria-checked')).toBe('true');
  });

  it('clicking a different card sets paletteId via setPreset', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <PalettePresets />
      </Wrapper>,
    );
    const nordicCard = screen.getByLabelText(frMessages.palette.presets.nordic);
    await user.click(nordicCard);
    // After click, nordic should be active and terra should not
    expect(nordicCard.getAttribute('aria-checked')).toBe('true');
    const terraCard = screen.getByLabelText(frMessages.palette.presets.terra);
    expect(terraCard.getAttribute('aria-checked')).toBe('false');
  });

  it('clicking a card mutates --color-accent on document.documentElement', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <PalettePresets />
      </Wrapper>,
    );
    const ocean = PALETTES.find((p) => p.id === 'ocean')!;
    await user.click(screen.getByLabelText(frMessages.palette.presets.ocean));
    expect(
      document.documentElement.style.getPropertyValue('--color-accent'),
    ).toBe(ocean.accent);
  });
});
