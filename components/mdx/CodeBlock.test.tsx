/**
 * CodeBlock.test.tsx — CONTENT-03 / D-10 acceptance suite (Wave 1, plan 05-01 Task 2).
 *
 * <CodeBlock> is the <pre> override (registered as pre: in mdx-components.tsx),
 * NOT a tag authors write. It consumes rehype-pretty-code's data-language into a
 * badge and copies the raw source to the clipboard. This suite asserts the D-10
 * contract:
 *
 *   - Test 1: with data-language="ts" → badge text "ts"; with no data-language →
 *             badge reads "text"
 *   - Test 2: clicking copy calls navigator.clipboard.writeText with the pre's
 *             textContent (Pitfall 5F — raw source extraction)
 *   - Test 3: after a successful copy the Check icon shows; after advancing fake
 *             timers 1500ms it reverts to the Copy icon (Phase 4 Contact D-20)
 *
 * Mock strategy (native chai matchers — setupFiles:[] means NO jest-dom):
 *   - next-intl useTranslations → (k) => k so aria-labels are deterministic.
 *   - motion/react → motion.span renders a real <span>; AnimatePresence is a
 *     passthrough (Phase 4 Contact.test.tsx convention) so the active icon flows
 *     into the DOM.
 *   - lucide-react → Copy/Check render <svg data-icon="..."> stubs so the
 *     Copy↔Check swap is queryable.
 *   - navigator.clipboard.writeText → vi.fn resolving.
 *   - vi.useFakeTimers() for the 1500ms revert.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}));

vi.mock('motion/react', () => ({
  motion: {
    span: ({
      children,
      ...rest
    }: { children?: ReactNode } & Record<string, unknown>) =>
      React.createElement('span', rest, children as ReactNode),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) =>
    children as React.ReactElement,
}));

vi.mock('lucide-react', () => ({
  Copy: ({ className }: { className?: string }) => (
    <svg data-icon="Copy" className={className} />
  ),
  Check: ({ className }: { className?: string }) => (
    <svg data-icon="Check" className={className} />
  ),
}));

import CodeBlock from './CodeBlock';

let writeTextSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeTextSpy = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('CodeBlock (D-10) — language badge', () => {
  it('renders a badge with the data-language value ("ts")', () => {
    const { container } = render(
      <CodeBlock data-language="ts">
        <code>const x = 1;</code>
      </CodeBlock>,
    );
    // The badge is the leading span carrying the language label.
    expect(container.textContent).toMatch(/ts/);
  });

  it('falls back to "text" when no data-language is provided', () => {
    const { container } = render(
      <CodeBlock>
        <code>plain</code>
      </CodeBlock>,
    );
    expect(container.textContent).toMatch(/text/);
  });
});

describe('CodeBlock (D-10) — copy raw source (Pitfall 5F)', () => {
  it('clicking copy calls navigator.clipboard.writeText with the pre textContent', () => {
    render(
      <CodeBlock data-language="ts">
        <code>const answer = 42;</code>
      </CodeBlock>,
    );
    const btn = screen.getByLabelText('copy');
    fireEvent.click(btn);
    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    // The pre's textContent concatenates badge label + code text. The raw code
    // is contained within the copied string (Pitfall 5F: textContent is 1:1).
    const copied = writeTextSpy.mock.calls[0]?.[0] as string;
    expect(copied).toMatch(/const answer = 42;/);
  });
});

describe('CodeBlock (D-10) — Copy↔Check swap with 1.5s revert', () => {
  it('shows Check after a successful copy, then reverts to Copy after 1500ms', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <CodeBlock data-language="ts">
        <code>x</code>
      </CodeBlock>,
    );
    // Initially the Copy icon is shown.
    expect(container.querySelector('[data-icon="Copy"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="Check"]')).toBeNull();

    const btn = screen.getByLabelText('copy');
    await act(async () => {
      fireEvent.click(btn);
      // Flush the resolved writeText promise so setCopied(true) runs.
      await Promise.resolve();
    });

    // Check icon now visible.
    expect(container.querySelector('[data-icon="Check"]')).not.toBeNull();

    // Advance past the 1500ms revert window.
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Reverted to Copy.
    expect(container.querySelector('[data-icon="Copy"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="Check"]')).toBeNull();
  });
});

describe('CodeBlock (D-10) — structure', () => {
  it('renders a <pre> with data-slot="code-block" and forwards children', () => {
    const { container } = render(
      <CodeBlock data-language="js">
        <code>hello</code>
      </CodeBlock>,
    );
    const pre = container.querySelector('pre[data-slot="code-block"]');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toMatch(/hello/);
  });
});
