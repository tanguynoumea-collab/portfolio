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
 *
 * Vitest 4.x notes:
 *   - `vi.stubEnv('NODE_ENV', 'development')` is the canonical way to change
 *     env vars per test; direct Object.defineProperty(process.env, ...) is
 *     blocked because Node 24's process.env property is non-configurable.
 *     vi.unstubAllEnvs() restores the original snapshot per afterEach.
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
  vi.unstubAllEnvs();
});

describe('ConsoleArt (EGG-01) — one-shot guarded print', () => {
  it('does NOT call console.log under NODE_ENV=test (D-36)', () => {
    expect(process.env.NODE_ENV).toBe('test');
    render(<ConsoleArt />);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('calls console.log exactly once when NODE_ENV is not test', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const mod = await import('./ConsoleArt');
    mod.__resetConsoleArt();
    render(<mod.ConsoleArt />);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('module-level flag prevents a second print on remount', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const mod = await import('./ConsoleArt');
    mod.__resetConsoleArt();
    const { unmount } = render(<mod.ConsoleArt />);
    unmount();
    render(<mod.ConsoleArt />);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('dispatches by locale — FR variant contains French intro', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const mod = await import('./ConsoleArt');
    mod.__resetConsoleArt();
    localeMock.mockReturnValue('fr');
    render(<mod.ConsoleArt />);
    const firstArg = logSpy.mock.calls[0]?.[0] as string;
    expect(firstArg).toMatch(/Spécialiste BIM/);
  });

  it('dispatches by locale — EN variant contains English intro', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const mod = await import('./ConsoleArt');
    mod.__resetConsoleArt();
    localeMock.mockReturnValue('en');
    render(<mod.ConsoleArt />);
    const firstArg = logSpy.mock.calls[0]?.[0] as string;
    expect(firstArg).toMatch(/BIM Specialist/i);
  });
});
