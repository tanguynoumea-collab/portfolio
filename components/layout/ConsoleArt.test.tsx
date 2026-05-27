/**
 * components/layout/ConsoleArt.test.tsx — EGG-01 / D-35..D-36 contract tests.
 *
 * 5 tests covering:
 *   1. NODE_ENV=test guard (D-36) — vitest runs with NODE_ENV='test' by
 *      default, so the production-only console.log is suppressed.
 *   2. NODE_ENV=development (non-test) — console.log fires exactly once.
 *   3. Module-level `printed` flag prevents a second print on remount
 *      (React Strict Mode + route-change resilience).
 *   4. FR locale dispatch — first console.log arg contains the French intro.
 *   5. EN locale dispatch — first console.log arg contains the English intro.
 *
 * The component exports a `__resetConsoleArt` helper so the test can clear
 * the module-level guard between cases. The component is re-imported via
 * `vi.resetModules` + dynamic import inside each NODE_ENV=development case
 * so the runtime branch is evaluated against the freshly-mocked env value.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

const localeMock = vi.fn(() => 'fr' as 'fr' | 'en');
vi.mock('next-intl', () => ({
  useLocale: () => localeMock(),
}));

let ConsoleArt: () => ReactElement | null;
let __resetConsoleArt: () => void;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('./ConsoleArt');
  ConsoleArt = mod.ConsoleArt;
  __resetConsoleArt = mod.__resetConsoleArt;
  __resetConsoleArt();
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
});

describe('ConsoleArt (EGG-01) — one-shot guarded print', () => {
  it('does NOT call console.log under NODE_ENV=test (D-36)', () => {
    expect(process.env.NODE_ENV).toBe('test');
    render(<ConsoleArt />);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('calls console.log exactly once when NODE_ENV is not test', async () => {
    const prev = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    try {
      vi.resetModules();
      const mod = await import('./ConsoleArt');
      mod.__resetConsoleArt();
      render(<mod.ConsoleArt />);
      expect(logSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
    }
  });

  it('module-level flag prevents a second print on remount', async () => {
    const prev = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    try {
      vi.resetModules();
      const mod = await import('./ConsoleArt');
      mod.__resetConsoleArt();
      const { unmount } = render(<mod.ConsoleArt />);
      unmount();
      render(<mod.ConsoleArt />);
      expect(logSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
    }
  });

  it('dispatches by locale — FR variant contains French intro', async () => {
    const prev = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    try {
      vi.resetModules();
      const mod = await import('./ConsoleArt');
      mod.__resetConsoleArt();
      localeMock.mockReturnValue('fr');
      render(<mod.ConsoleArt />);
      const firstArg = logSpy.mock.calls[0]?.[0] as string;
      expect(firstArg).toMatch(/Profil hybride/);
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
    }
  });

  it('dispatches by locale — EN variant contains English intro', async () => {
    const prev = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    try {
      vi.resetModules();
      const mod = await import('./ConsoleArt');
      mod.__resetConsoleArt();
      localeMock.mockReturnValue('en');
      render(<mod.ConsoleArt />);
      const firstArg = logSpy.mock.calls[0]?.[0] as string;
      expect(firstArg).toMatch(/Hybrid profile/i);
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
    }
  });
});
