/**
 * loading.test.tsx — A11Y-03 acceptance for the Suspense fallback.
 *
 * Asserts the role="status" busy region renders and that the pulse is gated by
 * the `motion-safe:` Tailwind variant (so reduced-motion users get a static
 * dot). The component is a plain Server Component with no client deps, so it
 * renders directly with no mocks. Native Vitest matchers (jest-dom NOT globally
 * extended): getByRole returns truthy; innerHTML contains the gated class.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loading from './loading';

describe('loading.tsx (A11Y-03)', () => {
  it('renders a role=status spinner with motion-safe:animate-pulse', () => {
    const { container, getByRole } = render(<Loading />);
    expect(getByRole('status')).toBeTruthy();
    expect(container.innerHTML).toContain('motion-safe:animate-pulse');
  });
});
