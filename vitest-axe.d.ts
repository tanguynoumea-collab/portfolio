// vitest-axe.d.ts — TS augmentation so `toHaveNoViolations()` typechecks against
// Vitest's Assertion interface (the matcher is registered at runtime in vitest-setup.ts).
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
