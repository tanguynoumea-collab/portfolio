/**
 * components/providers/ThemeProvider.test.tsx — integration tests for THEME-04.
 *
 * Covers: setPreset, setCustomColor (D-10 derivation + D-11 wasAdjustedForAA),
 * setHarmonic (THEME-03 via reducer), Konami unlock (THEME-12 / D-14 sequence),
 * rehydration from localStorage (D-01 shape variants), and provider-not-mounted
 * error.
 *
 * jsdom environment per vitest.config.ts; describe/it/expect ambient via
 * globals:true in vitest config.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, usePalette } from './ThemeProvider';
import { PALETTES } from '@/lib/palettes';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

// -------------------- setPreset --------------------

describe('ThemeProvider — setPreset (THEME-04)', () => {
  it('setPreset writes 6 --color-* vars onto document.documentElement', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() => result.current.setPreset('nordic'));
    const nordic = PALETTES.find((p) => p.id === 'nordic')!;
    expect(
      document.documentElement.style.getPropertyValue('--color-bg'),
    ).toBe(nordic.bg);
    expect(
      document.documentElement.style.getPropertyValue('--color-accent'),
    ).toBe(nordic.accent);
    expect(
      document.documentElement.style.getPropertyValue('--color-surface'),
    ).toBe(nordic.surface);
    expect(
      document.documentElement.style.getPropertyValue('--color-text'),
    ).toBe(nordic.text);
    expect(
      document.documentElement.style.getPropertyValue('--color-text-muted'),
    ).toBe(nordic.textMuted);
    expect(
      document.documentElement.style.getPropertyValue('--color-secondary'),
    ).toBe(nordic.secondary);
  });

  it('setPreset persists to palette-v1', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() => result.current.setPreset('ocean'));
    expect(JSON.parse(localStorage.getItem('palette-v1')!)).toEqual({
      kind: 'preset',
      id: 'ocean',
    });
  });

  it('setPreset updates paletteId and clears isCustom', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() => result.current.setPreset('bauhaus'));
    expect(result.current.paletteId).toBe('bauhaus');
    expect(result.current.isCustom).toBe(false);
    expect(result.current.customSource).toBeNull();
    expect(result.current.wasAdjustedForAA).toBe(false);
  });
});

// -------------------- setCustomColor (D-10 + D-11) --------------------

describe('ThemeProvider — setCustomColor (THEME-04 + D-10 + D-11)', () => {
  it('derives missing tokens and writes them all', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() =>
      result.current.setCustomColor({
        bg: 'oklch(0.97 0.012 80)',
        accent: 'oklch(0.62 0.155 35)',
        secondary: 'oklch(0.55 0.075 145)',
      }),
    );
    expect(result.current.isCustom).toBe(true);
    expect(result.current.paletteId).toBe('custom');
    expect(result.current.customSource).toBe('picker');
    // All 6 CSS vars get written — derived surface/text/textMuted included
    expect(
      document.documentElement.style.getPropertyValue('--color-text'),
    ).not.toBe('');
    expect(
      document.documentElement.style.getPropertyValue('--color-text-muted'),
    ).not.toBe('');
    expect(
      document.documentElement.style.getPropertyValue('--color-surface'),
    ).not.toBe('');
    expect(
      document.documentElement.style.getPropertyValue('--color-bg'),
    ).not.toBe('');
    expect(
      document.documentElement.style.getPropertyValue('--color-accent'),
    ).not.toBe('');
    expect(
      document.documentElement.style.getPropertyValue('--color-secondary'),
    ).not.toBe('');
  });

  it('persists custom palette with full tokens object and source=picker', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() =>
      result.current.setCustomColor({
        bg: 'oklch(0.97 0.012 80)',
        accent: 'oklch(0.62 0.155 35)',
        secondary: 'oklch(0.55 0.075 145)',
      }),
    );
    const stored = JSON.parse(localStorage.getItem('palette-v1')!);
    expect(stored.kind).toBe('custom');
    expect(stored.source).toBe('picker');
    expect(Object.keys(stored.tokens).sort()).toEqual(
      ['accent', 'bg', 'secondary', 'surface', 'text', 'textMuted'],
    );
  });

  it('preserves user-controlled accent + secondary (D-11 invariant)', () => {
    const userAccent = 'oklch(0.62 0.155 35)';
    const userSecondary = 'oklch(0.55 0.075 145)';
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() =>
      result.current.setCustomColor({
        bg: 'oklch(0.97 0.012 80)',
        accent: userAccent,
        secondary: userSecondary,
      }),
    );
    // D-11: accent + secondary are NEVER modified by applyMatrixAdjust
    expect(result.current.palette.accent).toBe(userAccent);
    expect(result.current.palette.secondary).toBe(userSecondary);
  });
});

// -------------------- setHarmonic (THEME-03) --------------------

describe('ThemeProvider — setHarmonic (THEME-04 + THEME-03)', () => {
  it('applies harmonic palette and marks customSource=harmonic', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() => result.current.setHarmonic('complementary', '#3366cc'));
    expect(result.current.isCustom).toBe(true);
    expect(result.current.customSource).toBe('harmonic');
    const stored = JSON.parse(localStorage.getItem('palette-v1')!);
    expect(stored.kind).toBe('custom');
    expect(stored.source).toBe('harmonic');
  });

  it('produces a 6-token palette with all CSS vars written', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    act(() => result.current.setHarmonic('triadic', '#cc3366'));
    // All 6 CSS vars must be set after harmonic generation
    for (const token of [
      '--color-bg',
      '--color-surface',
      '--color-text',
      '--color-text-muted',
      '--color-accent',
      '--color-secondary',
    ]) {
      expect(document.documentElement.style.getPropertyValue(token)).not.toBe(
        '',
      );
    }
  });
});

// -------------------- Konami unlock (THEME-12, D-14) --------------------

describe('ThemeProvider — Konami unlock (THEME-12 integration, D-14)', () => {
  it('unlocks vaporwave + switches to vaporwave preset on Konami', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    const SEQUENCE = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
    ];
    act(() => {
      for (const code of SEQUENCE) {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { code, bubbles: true }),
        );
      }
    });
    // D-14 sequence: UNLOCK_VAPORWAVE then SET_PRESET('vaporwave')
    expect(result.current.isVaporwaveUnlocked).toBe(true);
    expect(result.current.paletteId).toBe('vaporwave');
    const secrets = JSON.parse(localStorage.getItem('palette-secrets-v1')!);
    expect(secrets).toEqual({ vaporwave: true });
  });

  it('persists vaporwave preset to palette-v1 after Konami unlock', () => {
    renderHook(() => usePalette(), { wrapper });
    const SEQUENCE = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
    ];
    act(() => {
      for (const code of SEQUENCE) {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { code, bubbles: true }),
        );
      }
    });
    expect(JSON.parse(localStorage.getItem('palette-v1')!)).toEqual({
      kind: 'preset',
      id: 'vaporwave',
    });
  });

  it('increments vaporwaveUnlockNonce on each unlock (D-14 trigger)', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    // Initial state: nonce starts at 0 on every cold mount (including for
    // returning users whose secrets.vaporwave is already true). This is the
    // signal PaletteFab uses to differentiate "fresh unlock now" vs "was
    // unlocked previously" so it does NOT auto-open the Sheet on cold load.
    expect(result.current.vaporwaveUnlockNonce).toBe(0);
    act(() => result.current.unlockVaporwave());
    expect(result.current.vaporwaveUnlockNonce).toBe(1);
    // Subsequent unlocks (e.g., a user re-running the Konami code) keep
    // incrementing — PaletteFab's useEffect re-fires and re-opens the Sheet.
    act(() => result.current.unlockVaporwave());
    expect(result.current.vaporwaveUnlockNonce).toBe(2);
  });
});

// -------------------- initFromStorage rehydration --------------------

describe('ThemeProvider — initFromStorage rehydration (D-01)', () => {
  it('restores preset from storage on mount', () => {
    localStorage.setItem(
      'palette-v1',
      JSON.stringify({ kind: 'preset', id: 'ocean' }),
    );
    const { result } = renderHook(() => usePalette(), { wrapper });
    expect(result.current.paletteId).toBe('ocean');
    const ocean = PALETTES.find((p) => p.id === 'ocean')!;
    expect(result.current.palette.bg).toBe(ocean.bg);
  });

  it('restores custom palette from storage on mount', () => {
    const tokens = {
      bg: 'oklch(0.97 0 0)',
      surface: 'oklch(0.94 0 0)',
      text: 'oklch(0.15 0 0)',
      textMuted: 'oklch(0.5 0 0)',
      accent: 'oklch(0.62 0.155 35)',
      secondary: 'oklch(0.55 0.075 145)',
    };
    localStorage.setItem(
      'palette-v1',
      JSON.stringify({ kind: 'custom', tokens, source: 'harmonic' }),
    );
    const { result } = renderHook(() => usePalette(), { wrapper });
    expect(result.current.isCustom).toBe(true);
    expect(result.current.paletteId).toBe('custom');
    expect(result.current.customSource).toBe('harmonic');
    expect(result.current.palette).toEqual(tokens);
  });

  it('restores vaporwave unlock from secrets', () => {
    localStorage.setItem(
      'palette-secrets-v1',
      JSON.stringify({ vaporwave: true }),
    );
    const { result } = renderHook(() => usePalette(), { wrapper });
    expect(result.current.isVaporwaveUnlocked).toBe(true);
  });

  it('falls back to Terra defaults when storage is empty (D-02)', () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    expect(result.current.paletteId).toBe('terra');
    expect(result.current.isCustom).toBe(false);
    expect(result.current.isVaporwaveUnlocked).toBe(false);
  });
});

// -------------------- usePalette outside provider --------------------

describe('usePalette outside provider', () => {
  it('throws a helpful error', () => {
    // Suppress React's error log for the expected throw
    const origError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => usePalette())).toThrow(/usePalette/);
    } finally {
      console.error = origError;
    }
  });
});
