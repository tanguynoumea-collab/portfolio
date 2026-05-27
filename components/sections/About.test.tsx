/**
 * About.test.tsx — HOME-02 acceptance suite.
 *
 * Wave 0 shipped a RED harness; Wave 1 plan 04-02 turns it GREEN and extends
 * it to cover the full HOME-02 contract per .planning/phases/04-homepage-sections/
 * 04-VALIDATION.md rows 04-02-01..04.
 *
 * Validation coverage:
 *   - 04-02-01: i18n title + paragraphs render
 *   - 04-02-02: next/image attributes (width=400, height=500, placeholder=blur, blurDataURL)
 *   - 04-02-03: useGSAP scope + matchMedia gate + ScrollTrigger config indirectly via gsap mock
 *   - 04-02-04: reduced-motion path calls gsap.set with the data selectors
 *
 * Mocking strategy:
 *   - next-intl: stub `useTranslations('about')` to return deterministic strings for
 *     title + paragraphs.1 + paragraphs.2
 *   - next/image: replace with a string stub serializing the props so we can grep them
 *   - @gsap/react: call the useGSAP callback synchronously so matchMedia callback runs
 *   - gsap: control `matchMedia().add` to capture the registered callback and invoke it
 *     with both isFull=true and isFull=false conditions to exercise both branches
 *   - gsap/ScrollTrigger: stub the side-effect-only import
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

// ---------------------------------------------------------------------------
// next-intl mock — deterministic strings for HOME-02 assertions
// ---------------------------------------------------------------------------
vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    if (ns === 'about') {
      const map: Record<string, string> = {
        title: 'About me',
        'paragraphs.1': 'First paragraph placeholder.',
        'paragraphs.2': 'Second paragraph placeholder.',
      };
      return map[k] ?? `${ns}.${k}`;
    }
    return `${ns}.${k}`;
  },
}));

// ---------------------------------------------------------------------------
// next/image mock — string stub exposing props for attribute assertions
// ---------------------------------------------------------------------------
vi.mock('next/image', () => ({
  default: (props: {
    alt?: string;
    src?: string;
    width?: number;
    height?: number;
    placeholder?: string;
    blurDataURL?: string;
    loading?: string;
    priority?: boolean;
  }) =>
    `IMG[src=${props.src} alt=${props.alt} ${props.width}x${props.height} placeholder=${props.placeholder} blur=${props.blurDataURL ? 'set' : 'unset'} loading=${props.loading} priority=${String(props.priority)}]` as unknown as ReactElement,
}));

// ---------------------------------------------------------------------------
// @gsap/react mock — invoke useGSAP callback synchronously
// ---------------------------------------------------------------------------
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => fn(),
}));

// ---------------------------------------------------------------------------
// gsap mock — captures matchMedia callback + spy gsap.set
// ---------------------------------------------------------------------------
type MatchMediaCallback = (ctx: {
  conditions?: { isReduced?: boolean; isFull?: boolean };
}) => void;

interface MatchMediaController {
  registeredCallback: MatchMediaCallback | null;
  registeredQueries: Record<string, string> | null;
  lastTimelineConfig: unknown;
  setSpy: ReturnType<typeof vi.fn>;
}

const mediaController: MatchMediaController = {
  registeredCallback: null,
  registeredQueries: null,
  lastTimelineConfig: undefined,
  setSpy: vi.fn(),
};

vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({
      add: (queries: Record<string, string>, cb: MatchMediaCallback) => {
        mediaController.registeredQueries = queries;
        mediaController.registeredCallback = cb;
      },
    }),
    timeline: (config?: unknown) => {
      mediaController.lastTimelineConfig = config;
      const chain = {
        from: vi.fn().mockImplementation(() => chain),
      };
      return chain;
    },
    set: (...args: unknown[]) => mediaController.setSpy(...args),
    registerPlugin: vi.fn(),
  },
}));

// ScrollTrigger side-effect-only import — stub default export.
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

// ---------------------------------------------------------------------------
// Test setup — reset controller state and re-import About fresh
// ---------------------------------------------------------------------------
let About: () => ReactElement;
beforeEach(async () => {
  mediaController.registeredCallback = null;
  mediaController.registeredQueries = null;
  mediaController.lastTimelineConfig = undefined;
  mediaController.setSpy.mockClear();
  const mod = await import('./About');
  About = mod.About;
});

// ---------------------------------------------------------------------------
// 04-02-01: i18n title + paragraphs render
// ---------------------------------------------------------------------------
describe('About (HOME-02) — i18n rendering', () => {
  it('renders title from about.title i18n key', () => {
    render(<About />);
    expect(screen.getByText('About me')).toBeTruthy();
  });

  it('renders paragraphs from about.paragraphs.{1,2} i18n keys', () => {
    render(<About />);
    expect(screen.getByText(/First paragraph/)).toBeTruthy();
    expect(screen.getByText(/Second paragraph/)).toBeTruthy();
  });

  it('renders title inside an h2 element (semantic heading hierarchy)', () => {
    const { container } = render(<About />);
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.textContent).toBe('About me');
  });
});

// ---------------------------------------------------------------------------
// 04-02-02: next/image attributes
// ---------------------------------------------------------------------------
describe('About (HOME-02) — next/image attributes', () => {
  it('renders the next/image stub with width=400 height=500', () => {
    const { container } = render(<About />);
    // The mocked next/image returns a stringified prop dump; the React renderer
    // converts that string into a text node attached to its parent.
    expect(container.textContent).toMatch(/400x500/);
  });

  it('passes placeholder=blur and a blurDataURL', () => {
    const { container } = render(<About />);
    expect(container.textContent).toMatch(/placeholder=blur/);
    expect(container.textContent).toMatch(/blur=set/);
  });

  it('uses loading="lazy" and priority=false (below-the-fold)', () => {
    const { container } = render(<About />);
    expect(container.textContent).toMatch(/loading=lazy/);
    expect(container.textContent).toMatch(/priority=false/);
  });

  it('renders the about-photo.jpg src with title as alt', () => {
    const { container } = render(<About />);
    expect(container.textContent).toMatch(/src=\/about-photo\.jpg/);
    expect(container.textContent).toMatch(/alt=About me/);
  });
});

// ---------------------------------------------------------------------------
// 04-02-03: useGSAP scope + matchMedia + ScrollTrigger config
// ---------------------------------------------------------------------------
describe('About (HOME-02) — GSAP scroll reveal configuration', () => {
  it('registers a gsap.matchMedia with both prefers-reduced-motion queries', () => {
    render(<About />);
    expect(mediaController.registeredQueries).not.toBeNull();
    expect(mediaController.registeredQueries?.isFull).toBe(
      '(prefers-reduced-motion: no-preference)',
    );
    expect(mediaController.registeredQueries?.isReduced).toBe(
      '(prefers-reduced-motion: reduce)',
    );
  });

  it('creates a ScrollTrigger-bound timeline under full-motion with start="top 75%" and toggleActions="play none none reverse"', () => {
    render(<About />);
    expect(mediaController.registeredCallback).not.toBeNull();
    // Invoke the captured callback with full-motion conditions.
    mediaController.registeredCallback?.({ conditions: { isFull: true } });
    const cfg = mediaController.lastTimelineConfig as
      | {
          scrollTrigger?: {
            start?: string;
            toggleActions?: string;
            trigger?: unknown;
          };
        }
      | undefined;
    expect(cfg?.scrollTrigger).toBeDefined();
    expect(cfg?.scrollTrigger?.start).toBe('top 75%');
    expect(cfg?.scrollTrigger?.toggleActions).toBe('play none none reverse');
  });
});

// ---------------------------------------------------------------------------
// 04-02-04: reduced-motion gate
// ---------------------------------------------------------------------------
describe('About (HOME-02) — reduced-motion gate', () => {
  it('calls gsap.set on the data selectors when reduced-motion is active (no timeline)', () => {
    render(<About />);
    expect(mediaController.registeredCallback).not.toBeNull();
    // Invoke the captured callback with reduced-motion conditions.
    mediaController.registeredCallback?.({ conditions: { isFull: false } });
    expect(mediaController.setSpy).toHaveBeenCalledTimes(1);
    const args = mediaController.setSpy.mock.calls[0];
    // First arg = selector string covering both data attributes
    expect(args?.[0]).toMatch(/data-about-photo/);
    expect(args?.[0]).toMatch(/data-about-paragraph/);
    // Second arg = final state vars
    expect(args?.[1]).toEqual({ opacity: 1, x: 0, y: 0 });
  });

  it('does NOT create a timeline under reduced-motion (gate prevents ScrollTrigger setup)', () => {
    render(<About />);
    mediaController.lastTimelineConfig = undefined;
    mediaController.registeredCallback?.({ conditions: { isFull: false } });
    expect(mediaController.lastTimelineConfig).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Structural: data-attribute hooks for GSAP selectors
// ---------------------------------------------------------------------------
describe('About (HOME-02) — data-attribute selectors', () => {
  it('renders exactly one [data-about-photo] wrapper', () => {
    const { container } = render(<About />);
    const photos = container.querySelectorAll('[data-about-photo]');
    expect(photos.length).toBe(1);
  });

  it('renders exactly two [data-about-paragraph] elements (one per paragraph)', () => {
    const { container } = render(<About />);
    const paragraphs = container.querySelectorAll('[data-about-paragraph]');
    expect(paragraphs.length).toBe(2);
  });
});
