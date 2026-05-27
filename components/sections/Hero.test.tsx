/**
 * Hero.test.tsx — Vitest spec for HOME-01.
 *
 * Wave 0 shipped the initial RED harness covering i18n rendering + useGSAP
 * scope. Wave 1 / plan 04-01 Task 2 extended it with the full HOME-01
 * acceptance contract:
 *   1. i18n rendering (name/role/tagline/CTA/scroll-cue) — Wave 0
 *   2. useGSAP called with scope ref (Pattern 1) — Wave 0
 *   3. CTA scroll behavior — Lenis path + scrollIntoView fallback
 *   4. Reduced-motion gate — gsap.set called instead of timeline tween
 *   5. Five data-hero-* sentinels present on rendered DOM
 *
 * Mock pattern follows components/layout/Footer.test.tsx (next-intl +
 * animation libs stubbed; structural assertions only).
 *
 * The matchMedia stub is shaped so its `add(conds, fn)` invokes `fn` with
 * a fake context whose `conditions.isFull` / `conditions.isReduced` flags
 * are toggled by the per-test setter `setMatchMediaMode`. This lets us
 * exercise both the full-motion (timeline) branch AND the reduced-motion
 * (gsap.set) branch without spinning up a real jsdom matchMedia.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// next-intl translations for the hero namespace.
// ---------------------------------------------------------------------------
vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    if (ns === 'hero') {
      const map: Record<string, string> = {
        name: 'Tanguy',
        role: 'Tech × Design × BIM',
        tagline: 'Hybrid profile...',
        cta: 'See my work',
        scrollCue: 'Scroll to projects',
      };
      return map[k] ?? `${ns}.${k}`;
    }
    return `${ns}.${k}`;
  },
}));

// ---------------------------------------------------------------------------
// @gsap/react useGSAP — captures the opts object so tests can assert that
// the scope ref + dependencies array were both passed. The callback runs
// synchronously so the matchMedia / SplitText path is exercised.
// ---------------------------------------------------------------------------
const useGSAPSpy = vi.fn();
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void, opts?: { scope?: unknown }) => {
    useGSAPSpy(opts);
    fn();
  },
}));

// ---------------------------------------------------------------------------
// gsap stub. matchMedia.add invokes its callback with a fake context whose
// conditions reflect `matchMediaMode`. Default = 'full'. Tests flip to
// 'reduced' via setMatchMediaMode() to exercise the gsap.set branch.
// timeline() is a chainable .from() spy so we can assert the timeline path
// was hit under full motion.
// ---------------------------------------------------------------------------
let matchMediaMode: 'full' | 'reduced' = 'full';
const setMatchMediaMode = (m: 'full' | 'reduced') => {
  matchMediaMode = m;
};

const timelineFromSpy = vi.fn();
const gsapSetSpy = vi.fn();
const registerPluginSpy = vi.fn();

// Chainable timeline mock — each .from() returns the same proxy so the
// fluent chain in Hero.tsx (.from().from().from().from().from()) resolves
// without TypeError.
const makeTimeline = () => {
  const tl: { from: ReturnType<typeof vi.fn> } = {
    from: vi.fn().mockImplementation((...args: unknown[]) => {
      timelineFromSpy(...args);
      return tl;
    }),
  };
  return tl;
};

vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({
      add: (_conds: unknown, cb: (ctx: { conditions: Record<string, boolean> }) => void) => {
        cb({
          conditions: {
            isFull: matchMediaMode === 'full',
            isReduced: matchMediaMode === 'reduced',
          },
        });
      },
    }),
    timeline: () => makeTimeline(),
    set: gsapSetSpy,
    registerPlugin: registerPluginSpy,
  },
}));

// SplitText returns a fake instance whose .chars is a 6-element array
// (matches "Tanguy" character count loosely — the count itself is not
// asserted; only that .chars is iterable and timeline.from accepts it).
vi.mock('gsap/SplitText', () => ({
  SplitText: class {
    chars = [{}, {}, {}, {}, {}, {}];
    constructor(_target: string, opts?: { onSplit?: () => void }) {
      // Invoke onSplit synchronously so Pitfall 4-D ScrollTrigger.refresh
      // call is exercised. Pitfall 4-D mitigation lives inside Hero.tsx
      // and is structurally satisfied by passing onSplit to SplitText.
      opts?.onSplit?.();
    }
    revert() {
      // no-op
    }
  },
}));

// ScrollTrigger.refresh is called from SplitText.onSplit (Pitfall 4-D).
// Stub so the call doesn't blow up jsdom.
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    refresh: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// useLenis is mockable per test via mockReturnValueOnce. Default returns a
// scrollTo spy so the CTA-Lenis-path test can assert it was called.
// ---------------------------------------------------------------------------
const lenisScrollToSpy = vi.fn();
const useLenisMock = vi.fn(() => ({ scrollTo: lenisScrollToSpy }));
vi.mock('@/components/providers/LenisProvider', () => ({
  useLenis: () => useLenisMock(),
}));

// usePrefersReducedMotion — controls the motion.div bounce animate prop.
// Default false (full motion). Tests can flip via mockReturnValueOnce.
const usePrefersReducedMotionMock = vi.fn(() => false);
vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => usePrefersReducedMotionMock(),
}));

beforeEach(() => {
  useGSAPSpy.mockReset();
  timelineFromSpy.mockReset();
  gsapSetSpy.mockReset();
  // registerPluginSpy intentionally NOT reset — module-load side effect
  // happens once when ./Hero is first imported, and assertions rely on
  // that one-time invocation history surviving across tests.
  lenisScrollToSpy.mockReset();
  useLenisMock.mockReset();
  useLenisMock.mockReturnValue({ scrollTo: lenisScrollToSpy });
  usePrefersReducedMotionMock.mockReset();
  usePrefersReducedMotionMock.mockReturnValue(false);
  matchMediaMode = 'full';
});

// ---------------------------------------------------------------------------
// Group 1 — i18n rendering. Wave 0 baseline.
// ---------------------------------------------------------------------------
describe('Hero (HOME-01) — i18n rendering', () => {
  it('renders name + role + tagline + CTA + scroll cue from i18n', async () => {
    const { Hero } = await import('./Hero');
    render(<Hero />);
    expect(screen.getByText(/Tanguy/)).toBeTruthy();
    expect(screen.getByText(/Tech × Design × BIM/)).toBeTruthy();
    expect(screen.getByText(/See my work/)).toBeTruthy();
  });

  it('renders the localized scroll-cue aria-label', async () => {
    const { Hero } = await import('./Hero');
    render(<Hero />);
    const cue = screen.getByLabelText('Scroll to projects');
    expect(cue).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group 2 — useGSAP scope + dependencies (Pattern 1 + Pitfall 4-A).
// ---------------------------------------------------------------------------
describe('Hero (HOME-01) — useGSAP wiring', () => {
  it('useGSAP is called with a scope ref (Pattern 1 from RESEARCH.md)', async () => {
    const { Hero } = await import('./Hero');
    render(<Hero />);
    expect(useGSAPSpy).toHaveBeenCalled();
    const callArgs = useGSAPSpy.mock.calls[0]?.[0];
    expect(callArgs).toHaveProperty('scope');
  });

  it('useGSAP receives a dependencies array including i18n strings (Pitfall 4-A)', async () => {
    const { Hero } = await import('./Hero');
    render(<Hero />);
    const callArgs = useGSAPSpy.mock.calls[0]?.[0] as
      | { dependencies?: unknown[] }
      | undefined;
    expect(callArgs?.dependencies).toBeTruthy();
    expect(Array.isArray(callArgs?.dependencies)).toBe(true);
    // Should include the name + role translations so locale-switches force
    // useGSAP context teardown + SplitText re-creation.
    expect(callArgs?.dependencies).toEqual(
      expect.arrayContaining(['Tanguy', 'Tech × Design × BIM']),
    );
  });
});

// ---------------------------------------------------------------------------
// Group 3 — CTA scroll behavior (Lenis path + scrollIntoView fallback).
// ---------------------------------------------------------------------------
describe('Hero (HOME-01) — CTA scroll behavior', () => {
  it('calls lenis.scrollTo when useLenis returns a non-null instance', async () => {
    // Default mock returns { scrollTo: lenisScrollToSpy } — perfect.
    const { Hero } = await import('./Hero');
    const { container } = render(<Hero />);
    // Place a #projects target in the document so onCta finds it.
    const target = document.createElement('section');
    target.id = 'projects';
    document.body.appendChild(target);
    const cta = container.querySelector(
      '[data-hero-cta] button',
    ) as HTMLButtonElement | null;
    expect(cta).not.toBeNull();
    cta?.click();
    expect(lenisScrollToSpy).toHaveBeenCalled();
    // First arg should be the target element; second arg should include
    // the negative offset (nav height compensation).
    const callArgs = lenisScrollToSpy.mock.calls[0];
    expect(callArgs?.[0]).toBe(target);
    expect(callArgs?.[1]).toMatchObject({ offset: -64 });
    document.body.removeChild(target);
  });

  it('falls back to scrollIntoView when useLenis returns null', async () => {
    useLenisMock.mockReturnValue(null);
    const scrollIntoViewSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;
    const { Hero } = await import('./Hero');
    const { container } = render(<Hero />);
    const target = document.createElement('section');
    target.id = 'projects';
    document.body.appendChild(target);
    const cta = container.querySelector(
      '[data-hero-cta] button',
    ) as HTMLButtonElement | null;
    cta?.click();
    expect(scrollIntoViewSpy).toHaveBeenCalled();
    expect(lenisScrollToSpy).not.toHaveBeenCalled();
    document.body.removeChild(target);
  });

  it('does nothing when #projects target is absent (defensive)', async () => {
    const { Hero } = await import('./Hero');
    const { container } = render(<Hero />);
    // No #projects in the document this time.
    const cta = container.querySelector(
      '[data-hero-cta] button',
    ) as HTMLButtonElement | null;
    cta?.click();
    expect(lenisScrollToSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Group 4 — Reduced-motion gate (gsap.matchMedia branches).
// ---------------------------------------------------------------------------
describe('Hero (HOME-01) — reduced-motion gate', () => {
  it('under full motion, the timeline.from() chain is used (not gsap.set)', async () => {
    setMatchMediaMode('full');
    const { Hero } = await import('./Hero');
    render(<Hero />);
    // 5 elements animate via .from() in the full-motion timeline:
    // name chars, role chars, tagline, CTA, cue.
    expect(timelineFromSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    expect(gsapSetSpy).not.toHaveBeenCalled();
  });

  it('under reduced motion, gsap.set is used instead of timeline tweens', async () => {
    setMatchMediaMode('reduced');
    const { Hero } = await import('./Hero');
    render(<Hero />);
    expect(gsapSetSpy).toHaveBeenCalled();
    expect(timelineFromSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Group 5 — DOM sentinels (5 data-hero-* attributes for matchMedia targets).
// ---------------------------------------------------------------------------
describe('Hero (HOME-01) — data-hero-* sentinels', () => {
  it('renders all five data-hero-* attribute hooks', async () => {
    const { Hero } = await import('./Hero');
    const { container } = render(<Hero />);
    expect(container.querySelector('[data-hero-name]')).not.toBeNull();
    expect(container.querySelector('[data-hero-role]')).not.toBeNull();
    expect(container.querySelector('[data-hero-tagline]')).not.toBeNull();
    expect(container.querySelector('[data-hero-cta]')).not.toBeNull();
    expect(container.querySelector('[data-hero-cue]')).not.toBeNull();
  });

  it('registers the SplitText plugin at module load', async () => {
    await import('./Hero');
    expect(registerPluginSpy).toHaveBeenCalled();
  });
});
