/**
 * lib/hooks/usePrefersReducedMotion.test.ts — SSR-safe matchMedia wrapper.
 *
 * 4 tests covering:
 *   - SSR-equivalent initial value (false) before mount effect runs
 *   - Post-mount: hook mirrors matchMedia('(prefers-reduced-motion: reduce)')
 *   - 'change' event from MediaQueryList re-renders the hook with new value
 *   - Listener removed on unmount
 *
 * jsdom does not implement matchMedia — we mock window.matchMedia per test.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mq = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn((_: 'change', cb: Listener) => {
      listeners.add(cb);
    }),
    removeEventListener: vi.fn((_: 'change', cb: Listener) => {
      listeners.delete(cb);
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mq);
  const emit = (matches: boolean) => {
    mq.matches = matches;
    listeners.forEach((cb) => cb({ matches }));
  };
  return { mq, emit };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('usePrefersReducedMotion', () => {
  it('returns false on initial render (SSR-safe default) (Test 25)', () => {
    // jsdom can't truly SSR, but the FIRST render before useEffect runs is the
    // SSR-equivalent value. With matchMedia returning false, the hook stays
    // false through the post-effect re-render too.
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns matchMedia matches after mount (Test 26)', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('responds to matchMedia change events (Test 27)', () => {
    const { emit } = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => emit(true));
    expect(result.current).toBe(true);
    act(() => emit(false));
    expect(result.current).toBe(false);
  });

  it('removes listener on unmount (Test 28)', () => {
    const { mq } = mockMatchMedia(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    unmount();
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
