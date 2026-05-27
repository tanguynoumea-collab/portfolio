/**
 * components/layout/CustomCursor.test.tsx — LAYOUT-06 contract tests.
 *
 * 5 tests covering the 4-gate activation per D-27 + the non-negotiable
 * "no cursor takeover" rule from REQUIREMENTS.md OOS list + FEATURES.md
 * (the (none) CSS pointer value is excluded by the L130 anti-feature gate).
 *
 * Each test uses `vi.resetModules` so the component re-imports fresh per case,
 * since the gate decision lives in a `useState` initialized inside `useEffect`.
 * matchMedia is rebuilt per test via a tiny mock factory that maps query strings
 * to boolean match results — this is the cheapest way to control all 4 gates
 * without touching jsdom internals.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

type MQL = {
  matches: boolean;
  addEventListener: () => void;
  removeEventListener: () => void;
};

function mockMatchMedia(map: Record<string, boolean>) {
  const cache = new Map<string, MQL>();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => {
      const existing = cache.get(query);
      if (existing) return existing;
      const mql: MQL = {
        matches: !!map[query],
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      cache.set(query, mql);
      return mql;
    }),
  });
}

let CustomCursor: () => ReactElement | null;
beforeEach(async () => {
  vi.resetModules();
  const mod = await import('./CustomCursor');
  CustomCursor = mod.CustomCursor;
});

describe('CustomCursor — activation gates (D-27)', () => {
  it('renders nothing when pointer is not fine', () => {
    mockMatchMedia({
      '(pointer: fine)': false,
      '(prefers-reduced-motion: reduce)': false,
      '(any-pointer: coarse)': false,
      '(forced-colors: active)': false,
    });
    const { queryByTestId } = render(<CustomCursor />);
    expect(queryByTestId('custom-cursor')).toBeNull();
  });

  it('renders nothing when prefers-reduced-motion is reduce', () => {
    mockMatchMedia({
      '(pointer: fine)': true,
      '(prefers-reduced-motion: reduce)': true,
      '(any-pointer: coarse)': false,
      '(forced-colors: active)': false,
    });
    const { queryByTestId } = render(<CustomCursor />);
    expect(queryByTestId('custom-cursor')).toBeNull();
  });

  it('renders nothing under any-pointer:coarse (hybrid devices in touch mode)', () => {
    mockMatchMedia({
      '(pointer: fine)': true,
      '(prefers-reduced-motion: reduce)': false,
      '(any-pointer: coarse)': true,
      '(forced-colors: active)': false,
    });
    const { queryByTestId } = render(<CustomCursor />);
    expect(queryByTestId('custom-cursor')).toBeNull();
  });

  it('renders nothing under forced-colors:active (Windows High Contrast)', () => {
    mockMatchMedia({
      '(pointer: fine)': true,
      '(prefers-reduced-motion: reduce)': false,
      '(any-pointer: coarse)': false,
      '(forced-colors: active)': true,
    });
    const { queryByTestId } = render(<CustomCursor />);
    expect(queryByTestId('custom-cursor')).toBeNull();
  });

  it('renders the tracer when all 4 gates pass (constrained — native pointer stays)', () => {
    mockMatchMedia({
      '(pointer: fine)': true,
      '(prefers-reduced-motion: reduce)': false,
      '(any-pointer: coarse)': false,
      '(forced-colors: active)': false,
    });
    const { queryByTestId } = render(<CustomCursor />);
    const tracer = queryByTestId('custom-cursor');
    expect(tracer).not.toBeNull();
    expect(tracer?.getAttribute('aria-hidden')).toBe('true');
    const style = tracer?.getAttribute('style') ?? '';
    expect(style).toContain('position: fixed');
    expect(style).toContain('pointer-events: none');
    // CRITICAL LAYOUT-06 D-26 gate — the (none) value of the CSS pointer
    // property must NEVER appear in the rendered tracer style. Cursor
    // takeover is OOS per REQUIREMENTS.md L130 (anti-feature consensus).
    // Regex split to avoid the literal forbidden sequence in this file.
    const FORBIDDEN_TAKEOVER = new RegExp('cursor' + ':\\s*' + 'none');
    expect(style).not.toMatch(FORBIDDEN_TAKEOVER);
  });
});
