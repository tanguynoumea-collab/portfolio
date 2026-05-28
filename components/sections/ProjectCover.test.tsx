/**
 * ProjectCover.test.tsx — ANIM-02 / D-04 + D-05 acceptance suite (Wave 2, plan 05-03 Task 1).
 *
 * <ProjectCover> is a small 'use client' island that wraps the cover next/image
 * in a parallax-scoped ref. This suite asserts the D-04/D-05 contract:
 *
 *   - Test 1: renders a next/image with the given src/alt, fill, priority, and a
 *             [data-parallax-image] marker attribute (Pitfall 5D selector hook).
 *   - Test 2: the wrapper div has the responsive height classes
 *             (h-[50vh] md:h-[60vh]) and overflow-hidden (D-04 + D-05 clip).
 *   - Test 3: calls useParallax with the wrapper ref (assert the mocked
 *             useParallax was invoked) — wires the parallax effect on the ref.
 *
 * Mock strategy (native chai matchers — setupFiles:[] means NO jest-dom):
 *   - next/image: prop-dump string stub serializing src/alt/fill/priority/
 *     data-parallax-image so attributes are assertable on container.textContent
 *     (mirrors the Phase 4 About.test.tsx convention).
 *   - @/lib/hooks/useParallax: vi.fn() so we can assert it was invoked with the ref.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

// ---------------------------------------------------------------------------
// next/image mock — prop-dump string stub exposing props for attribute asserts.
// Serializes the boolean `fill`/`priority` flags and the data-parallax-image
// marker so the test can grep them off the rendered text node.
// ---------------------------------------------------------------------------
vi.mock('next/image', () => ({
  default: (props: {
    src?: string;
    alt?: string;
    fill?: boolean;
    priority?: boolean;
    'data-parallax-image'?: unknown;
  }) =>
    `IMG[src=${props.src} alt=${props.alt} fill=${String(props.fill)} priority=${String(props.priority)} parallax=${props['data-parallax-image'] !== undefined ? 'set' : 'unset'}]` as unknown as ReactElement,
}));

// ---------------------------------------------------------------------------
// useParallax mock — vi.fn() to assert it is called with the wrapper ref.
// ---------------------------------------------------------------------------
const useParallaxSpy = vi.fn();
vi.mock('@/lib/hooks/useParallax', () => ({
  useParallax: (...args: unknown[]) => useParallaxSpy(...args),
}));

// ---------------------------------------------------------------------------
// Test setup — reset spy + re-import ProjectCover fresh.
// ---------------------------------------------------------------------------
let ProjectCover: (props: { src: string; alt: string }) => ReactElement;
beforeEach(async () => {
  useParallaxSpy.mockClear();
  const mod = await import('./ProjectCover');
  ProjectCover = mod.ProjectCover;
});

describe('ProjectCover (D-04/D-05) — cover image rendering', () => {
  it('renders a next/image with the given src/alt, fill, and priority', () => {
    const { container } = render(
      <ProjectCover src="/projects/agora/cover.jpg" alt="Agora" />,
    );
    expect(container.textContent).toMatch(/src=\/projects\/agora\/cover\.jpg/);
    expect(container.textContent).toMatch(/alt=Agora/);
    expect(container.textContent).toMatch(/fill=true/);
    expect(container.textContent).toMatch(/priority=true/);
  });

  it('marks the cover image with [data-parallax-image] (Pitfall 5D selector hook)', () => {
    const { container } = render(
      <ProjectCover src="/projects/agora/cover.jpg" alt="Agora" />,
    );
    expect(container.textContent).toMatch(/parallax=set/);
  });
});

describe('ProjectCover (D-04/D-05) — responsive overflow-hidden wrapper', () => {
  it('wraps the image in a div with h-[50vh] md:h-[60vh] and overflow-hidden', () => {
    const { container } = render(
      <ProjectCover src="/c.jpg" alt="Cover" />,
    );
    const wrapper = container.querySelector('div');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toMatch(/h-\[50vh\]/);
    expect(wrapper?.className).toMatch(/md:h-\[60vh\]/);
    expect(wrapper?.className).toMatch(/overflow-hidden/);
  });
});

describe('ProjectCover (D-05) — useParallax wiring', () => {
  it('calls useParallax with the wrapper ref', () => {
    render(<ProjectCover src="/c.jpg" alt="Cover" />);
    expect(useParallaxSpy).toHaveBeenCalledTimes(1);
    // First arg is the ref object (a { current } container).
    const firstArg = useParallaxSpy.mock.calls[0]?.[0];
    expect(firstArg).toBeTruthy();
    expect(typeof firstArg).toBe('object');
    expect('current' in (firstArg as object)).toBe(true);
  });
});
