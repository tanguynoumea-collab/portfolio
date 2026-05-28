// vitest-setup.ts — registers the vitest-axe toHaveNoViolations matcher.
//
// This is ADDITIVE: it extends Vitest's `expect` with the axe-core matcher only.
// It does NOT globally extend jest-dom, so the existing native-chai-matcher tests
// (setupFiles was previously []) keep working unchanged. Wave 2 a11y tests
// (`*.a11y.test.tsx`) resolve `toHaveNoViolations()` through this registration.
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
