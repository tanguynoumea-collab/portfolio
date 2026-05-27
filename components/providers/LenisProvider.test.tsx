/**
 * components/providers/LenisProvider.test.tsx — Vitest spec for LAYOUT-02.
 *
 * Covers the four critical behaviors of the single-RAF Lenis + GSAP bridge:
 *   1. Mount (motion allowed) — Lenis instantiated with D-02 config; GSAP
 *      ticker bridge registered.
 *   2. Skip (reduced-motion) — Lenis never instantiated; ticker untouched.
 *   3. Cleanup (unmount) — ticker callback removed; Lenis.destroy() called.
 *   4. Palette-swap debounced refresh (D-05) — ScrollTrigger.refresh fires
 *      ~450ms after paletteId changes, not before.
 *
 * jsdom environment per vitest.config.ts; describe/it/expect ambient via
 * globals:true in vitest config. The whole gsap + lenis universe is mocked
 * via vi.mock() at top-of-module so we never touch real RAF / window.scroll.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';

// -------------------- gsap mock --------------------
// Hoisted ticker spy object so we can assert on .add / .remove / lagSmoothing.
const ticker = {
  add: vi.fn(),
  remove: vi.fn(),
  lagSmoothing: vi.fn(),
};
const ScrollTrigger = {
  refresh: vi.fn(),
  update: vi.fn(),
};
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    ticker,
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger }));

// -------------------- lenis mock --------------------
// Constructor spy captures the options arg so we can assert autoRaf:false,
// anchors:true, and the prevent function.
const destroyFn = vi.fn();
const onFn = vi.fn();
const stopFn = vi.fn();
const startFn = vi.fn();
const rafFn = vi.fn();
const LenisCtor = vi.fn(function (this: object, opts: unknown) {
  Object.assign(this, {
    destroy: destroyFn,
    on: onFn,
    stop: stopFn,
    start: startFn,
    raf: rafFn,
    _opts: opts,
  });
});
vi.mock('lenis', () => ({ default: LenisCtor }));

// -------------------- hook mocks --------------------
// Controllable mocks so each describe can flip reduced-motion or paletteId
// without re-mounting the entire test module.
const reducedMotionMock = vi.fn<() => boolean>(() => false);
vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => reducedMotionMock(),
}));

const paletteIdMock = vi.fn<() => string>(() => 'terra');
vi.mock('@/components/providers/ThemeProvider', () => ({
  usePalette: () => ({ paletteId: paletteIdMock() }),
}));

// -------------------- shared state --------------------
let LenisProvider: (props: { children: ReactNode }) => ReactNode;

beforeEach(async () => {
  vi.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
  paletteIdMock.mockReturnValue('terra');
  // Re-import AFTER mocks are reset so the module sees fresh spies on every
  // test (the module-level gsap.registerPlugin call is captured on each
  // import — vi.resetModules() inside vi.clearAllMocks does not auto-clear
  // module registry, but the test only asserts on instance-side calls).
  const mod = await import('./LenisProvider');
  LenisProvider = mod.LenisProvider;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// -------------------- Test 1: mount under motion-allowed --------------------

describe('LenisProvider — mount under motion-allowed', () => {
  it('instantiates Lenis with autoRaf:false + anchors:true + lerp:0.1 and adds to gsap.ticker', () => {
    render(
      <LenisProvider>
        <div data-testid="child" />
      </LenisProvider>,
    );
    expect(LenisCtor).toHaveBeenCalledTimes(1);
    const opts = LenisCtor.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(opts).toMatchObject({
      autoRaf: false,
      anchors: true,
      lerp: 0.1,
    });
    expect(typeof opts.prevent).toBe('function');
    // gsap.ticker bridge registered exactly once.
    expect(ticker.add).toHaveBeenCalledTimes(1);
    // lagSmoothing disabled per D-02 / RESEARCH §1.
    expect(ticker.lagSmoothing).toHaveBeenCalledWith(0);
  });
});

// -------------------- Test 2: skip under reduced-motion --------------------

describe('LenisProvider — skip under reduced-motion', () => {
  it('does not instantiate Lenis or add to ticker when reduced-motion is reduce', () => {
    reducedMotionMock.mockReturnValue(true);
    render(
      <LenisProvider>
        <div data-testid="child" />
      </LenisProvider>,
    );
    expect(LenisCtor).not.toHaveBeenCalled();
    expect(ticker.add).not.toHaveBeenCalled();
  });
});

// -------------------- Test 3: cleanup on unmount --------------------

describe('LenisProvider — cleanup on unmount', () => {
  it('removes the ticker callback and destroys Lenis', () => {
    const { unmount } = render(
      <LenisProvider>
        <div />
      </LenisProvider>,
    );
    // Capture the exact function reference that was passed to ticker.add
    // so we can assert ticker.remove is called with the SAME reference.
    const addedFn = ticker.add.mock.calls[0]?.[0];
    expect(typeof addedFn).toBe('function');
    unmount();
    expect(ticker.remove).toHaveBeenCalledWith(addedFn);
    expect(destroyFn).toHaveBeenCalled();
  });
});

// -------------------- Test 4: palette-swap debounced refresh --------------------

describe('LenisProvider — palette-swap debounced refresh', () => {
  it('calls ScrollTrigger.refresh ~450ms after paletteId changes', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <LenisProvider>
        <div />
      </LenisProvider>,
    );
    // Clear the initial-mount refresh + font-ready refresh so we only see
    // the debounced palette-swap refresh in the assertion below.
    ScrollTrigger.refresh.mockClear();

    paletteIdMock.mockReturnValue('nordic');
    rerender(
      <LenisProvider>
        <div />
      </LenisProvider>,
    );

    // Allow rAF to schedule the setTimeout but stay under the 450ms debounce.
    vi.advanceTimersByTime(50);
    expect(ScrollTrigger.refresh).not.toHaveBeenCalled();

    // Past the 450ms debounce — refresh should have fired.
    vi.advanceTimersByTime(450);
    expect(ScrollTrigger.refresh).toHaveBeenCalled();
  });
});
