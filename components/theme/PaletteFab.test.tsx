/**
 * components/theme/PaletteFab.test.tsx — integration tests for THEME-11 + D-08 + D-14.
 *
 * Covers:
 *   - FR localized aria-label "Ouvrir le sélecteur de palette" by default (THEME-11)
 *   - EN localized aria-label "Open palette switcher" by default (THEME-11)
 *   - Clicking FAB toggles open state → Sheet content becomes accessible + aria-label
 *     switches to t('close')
 *   - D-14 auto-open: vaporwaveUnlockNonce incrementing triggers setOpen(true)
 *     (verifies the unlockVaporwave() flow opens the Sheet without explicit click)
 *
 * The Sheet content (PaletteSwitcher) renders into a portal via Radix Dialog;
 * we verify the open state via the FAB's aria-label flip (which toggles
 * synchronously based on local `open` state) AND via the existence of the
 * Sheet title text in the document (Radix renders portal children into
 * document.body when the Sheet is open).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider, usePalette } from '@/components/providers/ThemeProvider';
import { PaletteFab } from './PaletteFab';
import frMessages from '@/messages/fr.json';
import enMessages from '@/messages/en.json';
import type { ReactNode } from 'react';

function FrWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextIntlClientProvider>
  );
}
function EnWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextIntlClientProvider>
  );
}

/**
 * Test harness combining PaletteFab with a hidden trigger that calls
 * unlockVaporwave() from the same ThemeProvider context. Lets us simulate
 * the Konami completion (which increments vaporwaveUnlockNonce) without
 * dispatching 10 keyboard events.
 */
function FabAndUnlock() {
  const { unlockVaporwave } = usePalette();
  return (
    <>
      <PaletteFab />
      <button data-testid="trigger-unlock" onClick={() => unlockVaporwave()}>
        unlock
      </button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('PaletteFab (THEME-11) — localized aria-label', () => {
  it('renders FAB with FR localized aria-label "Ouvrir le sélecteur de palette" by default', () => {
    render(
      <FrWrapper>
        <PaletteFab />
      </FrWrapper>,
    );
    const fab = screen.getByTestId('palette-fab');
    expect(fab.getAttribute('aria-label')).toBe(frMessages.palette.open);
  });

  it('renders FAB with EN localized aria-label "Open palette switcher" by default', () => {
    render(
      <EnWrapper>
        <PaletteFab />
      </EnWrapper>,
    );
    const fab = screen.getByTestId('palette-fab');
    expect(fab.getAttribute('aria-label')).toBe(enMessages.palette.open);
  });
});

describe('PaletteFab — click toggles open + Sheet content becomes accessible', () => {
  it('clicking FAB opens Sheet and flips aria-label to t("close")', async () => {
    const user = userEvent.setup();
    render(
      <FrWrapper>
        <PaletteFab />
      </FrWrapper>,
    );
    const fab = screen.getByTestId('palette-fab');
    // Initial: aria-label is the "open" string
    expect(fab.getAttribute('aria-label')).toBe(frMessages.palette.open);
    await user.click(fab);
    // After click, Sheet is open. Sheet's title (palette.title = "Palette")
    // is rendered into the document (Radix Dialog portal).
    expect(screen.getAllByText(frMessages.palette.title).length).toBeGreaterThan(0);
    // aria-label flips to "close" because local `open` state is true
    expect(fab.getAttribute('aria-label')).toBe(frMessages.palette.close);
  });
});

describe('PaletteFab — D-14 auto-open on Konami unlock (vaporwaveUnlockNonce subscription)', () => {
  it('FAB opens Sheet when vaporwaveUnlockNonce increments (simulating Konami completion)', () => {
    render(
      <FrWrapper>
        <FabAndUnlock />
      </FrWrapper>,
    );
    // Initially closed (nonce starts at 0 — initFromStorage default for fresh mount)
    expect(screen.getByTestId('palette-fab').getAttribute('aria-label')).toBe(
      frMessages.palette.open,
    );
    // Trigger unlockVaporwave() — increments nonce from 0 → 1. PaletteFab's
    // useEffect fires and calls setOpen(true).
    act(() => screen.getByTestId('trigger-unlock').click());
    // FAB aria-label should now reflect open=true (D-14 step 5 verified)
    expect(screen.getByTestId('palette-fab').getAttribute('aria-label')).toBe(
      frMessages.palette.close,
    );
  });
});
