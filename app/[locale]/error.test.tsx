/**
 * error.test.tsx — A11Y-03 / D-08 acceptance for the client error boundary.
 *
 * Asserts the two load-bearing contracts:
 *   1. errors.500 copy (title + message) renders.
 *   2. Clicking the reset button calls the framework `reset` prop exactly once
 *      (the D-08 recovery mechanism — NOT a Server Action).
 *
 * Mock conventions match page.test.tsx (setupFiles extend axe matchers only —
 * jest-dom is NOT globally extended, so we use native Vitest matchers: .toBe /
 * .toContain / .toHaveBeenCalledTimes, and query via container/getByRole):
 *   - next-intl: flat resolver returning `errors.500.<key>` so the rendered
 *     text is assertable without a real message bundle.
 *   - @/components/ui/button: minimal <button> forwarding onClick (the real
 *     shadcn Button pulls in radix-ui Slot, unneeded here).
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `errors.500.${key}`,
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => React.createElement('button', { onClick }, children),
}));

import ErrorBoundary from './error';

describe('error.tsx (A11Y-03)', () => {
  it('renders errors.500 copy and calls reset() on button click', () => {
    const reset = vi.fn();
    const { getByRole, container } = render(
      <ErrorBoundary error={new Error('boom')} reset={reset} />,
    );
    expect(container.textContent).toContain('errors.500.title');
    expect(container.textContent).toContain('errors.500.message');
    fireEvent.click(getByRole('button'));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
