/**
 * lib/hooks/useActiveSection.test.ts — IntersectionObserver active-section hook.
 *
 * 4 tests covering:
 *   - Returns null when no <section id="…"> elements exist in the DOM
 *   - Returns the section id with the largest intersectionRatio among visible entries
 *   - Updates when the largest ratio moves from one section to another
 *   - Disconnects the IntersectionObserver on unmount (no leaks)
 *
 * jsdom does not implement IntersectionObserver — we mock the constructor per
 * test, capture the callback in a module-scope ref, and invoke it manually to
 * simulate IO entries.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

type IOCallback = (
  entries: Array<{
    isIntersecting: boolean;
    intersectionRatio: number;
    target: { id: string };
  }>,
) => void;

let ioCallback: IOCallback | null = null;
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  ioCallback = null;
  observe.mockClear();
  disconnect.mockClear();
  vi.resetModules();
  (
    globalThis as unknown as { IntersectionObserver: unknown }
  ).IntersectionObserver = class {
    constructor(cb: IOCallback) {
      ioCallback = cb;
    }
    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
  };
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useActiveSection', () => {
  it('returns null when no sections exist', async () => {
    const { useActiveSection } = await import('./useActiveSection');
    const { result } = renderHook(() => useActiveSection());
    expect(result.current).toBe(null);
  });

  it('returns the section id with the largest intersectionRatio', async () => {
    ['home', 'about', 'projects', 'skills', 'contact'].forEach((id) => {
      const s = document.createElement('section');
      s.id = id;
      document.body.appendChild(s);
    });
    const { useActiveSection } = await import('./useActiveSection');
    const { result } = renderHook(() => useActiveSection());
    act(() => {
      ioCallback?.([
        { isIntersecting: true, intersectionRatio: 0.3, target: { id: 'home' } },
        { isIntersecting: true, intersectionRatio: 0.8, target: { id: 'about' } },
      ]);
    });
    expect(result.current).toBe('about');
  });

  it('updates when the largest ratio moves to another section', async () => {
    ['home', 'about', 'projects', 'skills', 'contact'].forEach((id) => {
      const s = document.createElement('section');
      s.id = id;
      document.body.appendChild(s);
    });
    const { useActiveSection } = await import('./useActiveSection');
    const { result } = renderHook(() => useActiveSection());
    act(() => {
      ioCallback?.([
        { isIntersecting: true, intersectionRatio: 0.8, target: { id: 'about' } },
      ]);
    });
    expect(result.current).toBe('about');
    act(() => {
      ioCallback?.([
        {
          isIntersecting: true,
          intersectionRatio: 0.9,
          target: { id: 'projects' },
        },
      ]);
    });
    expect(result.current).toBe('projects');
  });

  it('disconnects the observer on unmount', async () => {
    const s = document.createElement('section');
    s.id = 'home';
    document.body.appendChild(s);
    const { useActiveSection } = await import('./useActiveSection');
    const { unmount } = renderHook(() => useActiveSection());
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
