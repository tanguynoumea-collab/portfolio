/**
 * lib/og.test.ts — Terra brand color derivation (A11Y-01, D-04).
 *
 * Asserts the OG card's colors are genuinely DERIVED from the Terra palette via
 * oklchToHex (every value is a valid 6-digit hex, and accent is NOT the
 * '#ffffff' parse-fail fallback) and that the card size is the canonical
 * 1200×630. The JSX (OgCard) is exercised at build time by next/og's Satori
 * renderer — jsdom can't run Satori, so we verify the color/size contract here.
 */
import { describe, it, expect } from 'vitest';
import { OG_COLORS, OG_SIZE } from './og';

describe('lib/og — Terra brand colors', () => {
  it('OG_SIZE is 1200x630', () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
  });

  it('every OG color is a valid hex (derived from Terra, not the #ffffff fallback)', () => {
    for (const [k, v] of Object.entries(OG_COLORS)) {
      expect(v, `${k}=${v}`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    // accent must NOT be the parse-fail fallback
    expect(OG_COLORS.accent).not.toBe('#ffffff');
  });
});
