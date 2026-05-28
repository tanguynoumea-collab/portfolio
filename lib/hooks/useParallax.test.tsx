/**
 * useParallax.test.tsx — ANIM-02 / D-13 acceptance suite.
 *
 * Plan 05-02 ships `lib/hooks/useParallax.ts`, a reusable cover-image parallax
 * hook wrapping `useGSAP({ scope })` + `gsap.matchMedia()` dual-branch. This
 * suite drives BOTH branches deterministically via the MatchMediaController
 * pattern proven in components/sections/About.test.tsx.
 *
 * Coverage (per 05-02-PLAN.md <behavior>):
 *   - Test 1: registers gsap.matchMedia with both prefers-reduced-motion keys
 *   - Test 2: full-motion (isFull:true) → gsap.to('[data-parallax-image]', ...)
 *             with scrollTrigger { scrub:0.5, start:'top top', end:'bottom top' }
 *   - Test 3: reduced-motion (isFull:false) → gsap.set('[data-parallax-image]',
 *             { y:0 }) and NO gsap.to
 *   - Test 4: the hook NEVER calls gsap.registerPlugin (LenisProvider owns it)
 *   - Test 5: useGSAP callback is invoked + mm.add registers exactly once
 *             (cleanup is delegated to useGSAP({ scope }) semantics)
 *
 * Mocking strategy (mirrors About.test.tsx):
 *   - @gsap/react: call the useGSAP callback synchronously so the matchMedia
 *     callback registers during render
 *   - gsap: control matchMedia().add to capture the registered queries +
 *     callback; spy gsap.to (toSpy) and gsap.set (setSpy); registerPlugin spy
 *   - gsap/ScrollTrigger: stub the side-effect-only import
 *
 * Native chai matchers only (vitest.config setupFiles:[] — no jest-dom),
 * matching the Phase 3/4 precedent.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useRef, type ReactElement } from 'react';

// ---------------------------------------------------------------------------
// @gsap/react mock — invoke useGSAP callback synchronously
// ---------------------------------------------------------------------------
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => fn(),
}));

// ---------------------------------------------------------------------------
// gsap mock — captures matchMedia callback + spies gsap.to / gsap.set
// ---------------------------------------------------------------------------
type MatchMediaCallback = (ctx: {
  conditions?: { isReduced?: boolean; isFull?: boolean };
}) => void;

interface MatchMediaController {
  registeredCallback: MatchMediaCallback | null;
  registeredQueries: Record<string, string> | null;
  addCallCount: number;
  toSpy: ReturnType<typeof vi.fn>;
  setSpy: ReturnType<typeof vi.fn>;
  registerPluginSpy: ReturnType<typeof vi.fn>;
}

const mediaController: MatchMediaController = {
  registeredCallback: null,
  registeredQueries: null,
  addCallCount: 0,
  toSpy: vi.fn(),
  setSpy: vi.fn(),
  registerPluginSpy: vi.fn(),
};

vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({
      add: (queries: Record<string, string>, cb: MatchMediaCallback) => {
        mediaController.registeredQueries = queries;
        mediaController.registeredCallback = cb;
        mediaController.addCallCount += 1;
      },
    }),
    to: (...args: unknown[]) => mediaController.toSpy(...args),
    set: (...args: unknown[]) => mediaController.setSpy(...args),
    registerPlugin: (...args: unknown[]) =>
      mediaController.registerPluginSpy(...args),
  },
}));

// ScrollTrigger side-effect-only import — stub default export.
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

// ---------------------------------------------------------------------------
// Tiny harness — a component that calls useParallax(ref) on a real div ref.
// ---------------------------------------------------------------------------
let useParallax: typeof import('./useParallax').useParallax;

function Harness({
  options,
}: {
  options?: { factor?: number; maxTranslate?: number };
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, options);
  return (
    <div ref={ref}>
      <div data-parallax-image />
    </div>
  );
}

beforeEach(async () => {
  mediaController.registeredCallback = null;
  mediaController.registeredQueries = null;
  mediaController.addCallCount = 0;
  mediaController.toSpy.mockClear();
  mediaController.setSpy.mockClear();
  mediaController.registerPluginSpy.mockClear();
  vi.resetModules();
  const mod = await import('./useParallax');
  useParallax = mod.useParallax;
});

// ---------------------------------------------------------------------------
// Test 1 — matchMedia registration with both queries
// ---------------------------------------------------------------------------
describe('useParallax (ANIM-02) — matchMedia registration', () => {
  it('registers a gsap.matchMedia with both prefers-reduced-motion queries', () => {
    render(<Harness />);
    expect(mediaController.registeredQueries).not.toBeNull();
    expect(mediaController.registeredQueries?.isFull).toBe(
      '(prefers-reduced-motion: no-preference)',
    );
    expect(mediaController.registeredQueries?.isReduced).toBe(
      '(prefers-reduced-motion: reduce)',
    );
  });

  it('registers the matchMedia callback exactly once', () => {
    render(<Harness />);
    expect(mediaController.addCallCount).toBe(1);
    expect(mediaController.registeredCallback).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Test 2 — full-motion branch installs the ScrollTrigger scrub animation
// ---------------------------------------------------------------------------
describe('useParallax (ANIM-02) — full-motion branch', () => {
  it('calls gsap.to on [data-parallax-image] with a scrub:0.5 ScrollTrigger config', () => {
    render(<Harness />);
    mediaController.registeredCallback?.({ conditions: { isFull: true } });

    expect(mediaController.toSpy).toHaveBeenCalledTimes(1);
    const [selector, vars] = mediaController.toSpy.mock.calls[0] as [
      string,
      {
        y?: number;
        ease?: string;
        scrollTrigger?: {
          trigger?: unknown;
          start?: string;
          end?: string;
          scrub?: number;
        };
      },
    ];
    expect(selector).toBe('[data-parallax-image]');
    expect(vars.ease).toBe('none');
    expect(vars.y).toBe(-50); // default maxTranslate
    expect(vars.scrollTrigger).toBeDefined();
    expect(vars.scrollTrigger?.start).toBe('top top');
    expect(vars.scrollTrigger?.end).toBe('bottom top');
    expect(vars.scrollTrigger?.scrub).toBe(0.5);
  });

  it('honors a custom maxTranslate for the y translation', () => {
    render(<Harness options={{ maxTranslate: 80 }} />);
    mediaController.registeredCallback?.({ conditions: { isFull: true } });

    const [, vars] = mediaController.toSpy.mock.calls[0] as [
      string,
      { y?: number },
    ];
    expect(vars.y).toBe(-80);
  });

  it('does NOT call gsap.set under full motion', () => {
    render(<Harness />);
    mediaController.registeredCallback?.({ conditions: { isFull: true } });
    expect(mediaController.setSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Test 3 — reduced-motion branch sets y:0 and installs NO ScrollTrigger
// ---------------------------------------------------------------------------
describe('useParallax (ANIM-02) — reduced-motion branch', () => {
  it('calls gsap.set([data-parallax-image], { y: 0 }) under reduced motion', () => {
    render(<Harness />);
    mediaController.registeredCallback?.({ conditions: { isFull: false } });

    expect(mediaController.setSpy).toHaveBeenCalledTimes(1);
    const [selector, vars] = mediaController.setSpy.mock.calls[0] as [
      string,
      { y?: number },
    ];
    expect(selector).toBe('[data-parallax-image]');
    expect(vars).toEqual({ y: 0 });
  });

  it('does NOT call gsap.to under reduced motion (no ScrollTrigger created)', () => {
    render(<Harness />);
    mediaController.registeredCallback?.({ conditions: { isFull: false } });
    expect(mediaController.toSpy).not.toHaveBeenCalled();
  });

  it('treats missing conditions as reduced (defensive) — sets y:0, no gsap.to', () => {
    render(<Harness />);
    mediaController.registeredCallback?.({});
    expect(mediaController.setSpy).toHaveBeenCalledTimes(1);
    expect(mediaController.toSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Test 4 — the hook never re-registers ScrollTrigger
// ---------------------------------------------------------------------------
describe('useParallax (ANIM-02) — plugin registration discipline', () => {
  it('never calls gsap.registerPlugin (LenisProvider owns registration)', () => {
    render(<Harness />);
    mediaController.registeredCallback?.({ conditions: { isFull: true } });
    mediaController.registeredCallback?.({ conditions: { isFull: false } });
    expect(mediaController.registerPluginSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Test 5 — cleanup is delegated to useGSAP({ scope }); the callback runs once
// ---------------------------------------------------------------------------
describe('useParallax (ANIM-02) — useGSAP scope lifecycle', () => {
  it('runs the useGSAP effect (matchMedia registered) and cleans up on unmount without throwing', () => {
    const { unmount } = render(<Harness />);
    // useGSAP callback ran synchronously → matchMedia registered exactly once.
    expect(mediaController.addCallCount).toBe(1);
    // Unmount must not throw — cleanup is owned by useGSAP({ scope }) (mocked here).
    expect(() => unmount()).not.toThrow();
  });
});
