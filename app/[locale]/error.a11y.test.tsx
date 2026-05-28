/**
 * error.a11y.test.tsx — A11Y-04 axe-core surface for the client error boundary.
 *
 * Renders <ErrorBoundary error={...} reset={...} /> in jsdom and asserts axe
 * reports zero violations. Mocks mirror error.test.tsx (next-intl flat
 * resolver, Button → real <button>) so the role="alert" heading/message + the
 * reset button render into the DOM. Only `color-contrast` is disabled; the
 * `button-name` rule stays active so the reset button's accessible name is
 * verified.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';

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

describe('error.tsx (A11Y-04) — axe', () => {
  it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
    const { container } = render(
      <ErrorBoundary error={new Error('x')} reset={() => {}} />,
    );
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
