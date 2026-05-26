/**
 * lib/storage.test.ts — D-01 round-trip + D-02 silent fallback contract.
 *
 * 12 jsdom-runnable tests. Test 7 (SSR `typeof localStorage === 'undefined'`)
 * cannot be exercised in jsdom because localStorage is always present; the
 * implementation MUST still contain the `typeof localStorage === 'undefined'`
 * guard so the FOUC script + ThemeProvider SSR init paths in Wave 2 stay safe.
 * That guard is verified via grep in the acceptance criteria of Task 1.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readPaletteV1,
  writePaletteV1,
  readSecretsV1,
  writeSecretsV1,
  type StoredPalette,
} from './storage';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('palette-v1 round-trip', () => {
  it('round-trips a preset (Test 1)', () => {
    const v: StoredPalette = { kind: 'preset', id: 'nordic' };
    writePaletteV1(v);
    expect(readPaletteV1()).toEqual(v);
  });

  it('round-trips a custom palette (Test 2)', () => {
    const v: StoredPalette = {
      kind: 'custom',
      tokens: {
        bg: 'oklch(0.97 0 0)',
        surface: 'oklch(0.94 0 0)',
        text: 'oklch(0.15 0 0)',
        textMuted: 'oklch(0.5 0 0)',
        accent: 'oklch(0.62 0.155 35)',
        secondary: 'oklch(0.55 0.075 145)',
      },
      source: 'picker',
    };
    writePaletteV1(v);
    expect(readPaletteV1()).toEqual(v);
  });
});

describe('palette-v1 silent fallback (D-02)', () => {
  it('returns null when key absent (Test 3)', () => {
    expect(readPaletteV1()).toBeNull();
  });

  it('returns null when JSON malformed, no throw (Test 4)', () => {
    localStorage.setItem('palette-v1', '{not-json');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => readPaletteV1()).not.toThrow();
    expect(readPaletteV1()).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('returns null when shape mismatched (Test 5)', () => {
    localStorage.setItem('palette-v1', JSON.stringify({ kind: 'unknown' }));
    expect(readPaletteV1()).toBeNull();

    localStorage.setItem('palette-v1', JSON.stringify({ kind: 'preset' /* no id */ }));
    expect(readPaletteV1()).toBeNull();

    localStorage.setItem(
      'palette-v1',
      JSON.stringify({ kind: 'custom', tokens: {} /* missing fields */, source: 'picker' }),
    );
    expect(readPaletteV1()).toBeNull();
  });

  it('returns null when localStorage.getItem throws (Test 6)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readPaletteV1()).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('writePaletteV1 silently no-ops on quota error (Test 8)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writePaletteV1({ kind: 'preset', id: 'terra' })).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

describe('palette-secrets-v1', () => {
  it('returns {vaporwave: false} when absent (Test 9)', () => {
    expect(readSecretsV1()).toEqual({ vaporwave: false });
  });

  it('returns {vaporwave: true} when stored (Test 10)', () => {
    localStorage.setItem('palette-secrets-v1', JSON.stringify({ vaporwave: true }));
    expect(readSecretsV1()).toEqual({ vaporwave: true });
  });

  it('returns {vaporwave: false} on malformed JSON (Test 11)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('palette-secrets-v1', '{bad');
    expect(readSecretsV1()).toEqual({ vaporwave: false });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('round-trips writeSecretsV1 (Test 12)', () => {
    writeSecretsV1({ vaporwave: true });
    expect(readSecretsV1()).toEqual({ vaporwave: true });
  });
});

describe('D-02 verification — no console output on any failure path (Test 13)', () => {
  it('does not emit console.error/warn/log on ANY failure', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Failure path: malformed JSON on palette-v1
    localStorage.setItem('palette-v1', '!!!');
    readPaletteV1();

    // Failure path: malformed JSON on palette-secrets-v1
    localStorage.setItem('palette-secrets-v1', '!!!');
    readSecretsV1();

    // Failure path: setItem throws on both writes
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    writePaletteV1({ kind: 'preset', id: 'terra' });
    writeSecretsV1({ vaporwave: false });

    expect(errSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
