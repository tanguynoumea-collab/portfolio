/**
 * Image.test.tsx — CONTENT-03 / D-09 acceptance suite (Wave 1, plan 05-01 Task 2).
 *
 * <MDXImage> is a Client Component (owns Dialog open state). This suite asserts
 * the D-09 contract:
 *
 *   - Test 1: renders a next/image with the given src/alt/width/height
 *   - Test 2: clicking the trigger opens a DialogContent carrying the
 *             data-lenis-prevent attribute (Pitfall 5C — attribute on
 *             DialogContent ONLY)
 *   - Test 3: when reduced-motion is true, the motion hover scale prop is
 *             undefined (no hover animation)
 *
 * Mock strategy (native chai matchers — setupFiles:[] means NO jest-dom):
 *   - next-intl useTranslations → (k) => k so aria-labels are deterministic.
 *   - next/image → string prop-dump stub (Phase 4 About.test.tsx style) so
 *     src/alt/width/height are assertable from container.textContent.
 *   - @/lib/hooks/usePrefersReducedMotion → controllable boolean.
 *   - motion/react → motion.button renders a real <button> and serializes the
 *     whileHover prop to a data-while-hover attribute so the reduced-motion
 *     gate is observable.
 *   - @/components/ui/dialog → Dialog renders children; DialogTrigger renders a
 *     clickable <button>; DialogContent renders its props (incl. data-lenis-prevent)
 *     and children into the DOM so the attribute is queryable.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}));

vi.mock('next/image', () => ({
  default: (props: {
    alt?: string;
    src?: string;
    width?: number;
    height?: number;
    loading?: string;
    className?: string;
  }) =>
    `IMG[src=${props.src} alt=${props.alt} ${props.width}x${props.height} loading=${props.loading}]` as unknown as React.ReactElement,
}));

// Controllable reduced-motion boolean.
const reducedMotionState = { value: false };
vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => reducedMotionState.value,
}));

// motion/react — motion.button renders a real <button>, serializing whileHover
// to a data attribute so the reduced-motion gate (undefined vs object) is testable.
vi.mock('motion/react', () => ({
  motion: {
    button: ({
      children,
      whileHover,
      ...rest
    }: {
      children?: ReactNode;
      whileHover?: unknown;
      transition?: unknown;
    } & Record<string, unknown>) => {
      // Drop the `transition` prop (not a valid DOM attribute) before spreading.
      const { transition, ...domRest } = rest as Record<string, unknown>;
      void transition;
      return React.createElement(
        'button',
        {
          ...domRest,
          'data-while-hover': whileHover === undefined ? 'undefined' : 'set',
        },
        children as ReactNode,
      );
    },
  },
}));

// shadcn Dialog mock — render structure into the DOM so trigger click + the
// data-lenis-prevent attribute on DialogContent are both observable. We model
// open state so clicking the trigger reveals the content (like Radix).
vi.mock('@/components/ui/dialog', () => {
  const Dialog = ({ children }: { children?: ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    return React.createElement(
      'div',
      { 'data-dialog-root': true, 'data-open': String(open) },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{
                __open?: boolean;
                __setOpen?: (v: boolean) => void;
              }>,
              { __open: open, __setOpen: setOpen },
            )
          : child,
      ),
    );
  };
  const DialogTrigger = ({
    children,
    __setOpen,
  }: {
    children?: ReactNode;
    asChild?: boolean;
    __setOpen?: (v: boolean) => void;
  }) =>
    React.createElement(
      'div',
      { 'data-dialog-trigger': true, onClick: () => __setOpen?.(true) },
      children as ReactNode,
    );
  const DialogContent = ({
    children,
    __open,
    ...rest
  }: {
    children?: ReactNode;
    __open?: boolean;
    __setOpen?: (v: boolean) => void;
    showCloseButton?: boolean;
  } & Record<string, unknown>) => {
    if (!__open) return null;
    // Strip internal control + non-DOM props before spreading so data-lenis-prevent
    // (and other real attributes) land on the DOM while __setOpen/showCloseButton do not.
    const { __setOpen, showCloseButton, ...domProps } = rest as Record<
      string,
      unknown
    >;
    void __setOpen;
    void showCloseButton;
    return React.createElement(
      'div',
      { 'data-dialog-content': true, ...domProps },
      children as ReactNode,
    );
  };
  const DialogTitle = ({
    children,
    ...rest
  }: { children?: ReactNode } & Record<string, unknown>) =>
    React.createElement('h2', rest, children as ReactNode);
  return { Dialog, DialogTrigger, DialogContent, DialogTitle };
});

import MDXImage from './Image';

beforeEach(() => {
  reducedMotionState.value = false;
});

describe('MDXImage (D-09) — base render', () => {
  it('renders a next/image with the given src/alt/width/height', () => {
    const { container } = render(
      <MDXImage src="/projects/x/1.jpg" alt="A render" width={1200} height={800} />,
    );
    expect(container.textContent).toMatch(/src=\/projects\/x\/1\.jpg/);
    expect(container.textContent).toMatch(/alt=A render/);
    expect(container.textContent).toMatch(/1200x800/);
  });

  it('uses loading="lazy" on the inline (non-zoomed) image', () => {
    const { container } = render(
      <MDXImage src="/a.jpg" alt="a" width={10} height={10} />,
    );
    expect(container.textContent).toMatch(/loading=lazy/);
  });
});

describe('MDXImage (D-09) — Dialog zoom + data-lenis-prevent (Pitfall 5C)', () => {
  it('clicking the trigger opens a DialogContent carrying data-lenis-prevent', () => {
    const { container } = render(
      <MDXImage src="/a.jpg" alt="zoomable" width={10} height={10} />,
    );
    // Closed initially — no content rendered.
    expect(container.querySelector('[data-dialog-content]')).toBeNull();
    // Click the trigger.
    const trigger = container.querySelector('[data-dialog-trigger]') as HTMLElement;
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger);
    // Content now present and carries data-lenis-prevent.
    const content = container.querySelector('[data-dialog-content]') as HTMLElement;
    expect(content).not.toBeNull();
    expect(content.hasAttribute('data-lenis-prevent')).toBe(true);
  });

  it('exposes the trigger with the localized imageZoom aria-label', () => {
    render(<MDXImage src="/a.jpg" alt="z" width={10} height={10} />);
    expect(screen.getByLabelText('imageZoom')).not.toBeNull();
  });
});

describe('MDXImage (D-09) — reduced-motion gate', () => {
  it('whileHover is set (object) when reduced-motion is false', () => {
    reducedMotionState.value = false;
    render(<MDXImage src="/a.jpg" alt="z" width={10} height={10} />);
    const btn = screen.getByLabelText('imageZoom');
    expect(btn.getAttribute('data-while-hover')).toBe('set');
  });

  it('whileHover is undefined (no hover animation) when reduced-motion is true', () => {
    reducedMotionState.value = true;
    render(<MDXImage src="/a.jpg" alt="z" width={10} height={10} />);
    const btn = screen.getByLabelText('imageZoom');
    expect(btn.getAttribute('data-while-hover')).toBe('undefined');
  });
});
