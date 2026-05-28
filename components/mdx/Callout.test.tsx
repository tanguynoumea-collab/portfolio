/**
 * Callout.test.tsx — CONTENT-03 / D-11 acceptance suite (Wave 1, plan 05-01 Task 1).
 *
 * <Callout> is a Server Component (pure presentation, no interaction) with 3
 * variants. This suite asserts the D-11 contract:
 *
 *   - Test 1: variant="info" → Info icon + container has bg-primary/5 + border-l-primary
 *   - Test 2: variant="warning" → AlertTriangle icon + bg-destructive/5 + border-l-destructive
 *   - Test 3: variant="note" (and default — no variant prop) → StickyNote icon +
 *             bg-muted + border-l-border
 *   - Test 4: children render inside the body; optional title prop renders as a
 *             bold line above children
 *   - Test 5: rendered className strings contain NO hex ('#'), NO 'rgb(', NO
 *             'oklch(' literals (palette-aliased only)
 *
 * Mock strategy (native chai matchers — setupFiles:[] means NO jest-dom):
 *   - lucide-react is mocked so each icon renders a <svg data-icon="..."> stub,
 *     making variant→icon mapping queryable by data attribute (mirrors the
 *     Phase 4 Skills/Contact lucide-stub convention).
 *   - cn (clsx + tailwind-merge) is NOT mocked — we want the real merged class
 *     strings so Test 5 can assert zero color literals on the actual output.
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// lucide-react mock — identifiable SVG stubs carrying a data-icon attribute so
// variant→icon mapping is assertable. className is forwarded so the iconColor
// utility (text-primary / text-destructive / text-muted-foreground) is visible.
vi.mock('lucide-react', () => ({
  Info: ({ className }: { className?: string }) => (
    <svg data-icon="Info" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-icon="AlertTriangle" className={className} />
  ),
  StickyNote: ({ className }: { className?: string }) => (
    <svg data-icon="StickyNote" className={className} />
  ),
}));

import { Callout } from './Callout';

describe('Callout (D-11) — info variant', () => {
  it('renders the Info icon and a container with bg-primary/5 + border-l-primary', () => {
    const { container } = render(<Callout variant="info">Body text</Callout>);
    const icon = container.querySelector('[data-icon="Info"]');
    expect(icon).not.toBeNull();
    const root = container.querySelector('[role="note"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toMatch(/bg-primary\/5/);
    expect(root.className).toMatch(/border-l-primary/);
  });

  it('applies text-primary to the info icon', () => {
    const { container } = render(<Callout variant="info">Body</Callout>);
    const icon = container.querySelector('[data-icon="Info"]') as HTMLElement;
    expect(icon.getAttribute('class')).toMatch(/text-primary/);
  });
});

describe('Callout (D-11) — warning variant', () => {
  it('renders the AlertTriangle icon and bg-destructive/5 + border-l-destructive', () => {
    const { container } = render(
      <Callout variant="warning">Heads up</Callout>,
    );
    const icon = container.querySelector('[data-icon="AlertTriangle"]');
    expect(icon).not.toBeNull();
    const root = container.querySelector('[role="note"]') as HTMLElement;
    expect(root.className).toMatch(/bg-destructive\/5/);
    expect(root.className).toMatch(/border-l-destructive/);
  });

  it('applies text-destructive to the warning icon', () => {
    const { container } = render(<Callout variant="warning">Body</Callout>);
    const icon = container.querySelector(
      '[data-icon="AlertTriangle"]',
    ) as HTMLElement;
    expect(icon.getAttribute('class')).toMatch(/text-destructive/);
  });
});

describe('Callout (D-11) — note variant (and default)', () => {
  it('renders the StickyNote icon and bg-muted + border-l-border for variant="note"', () => {
    const { container } = render(<Callout variant="note">A note</Callout>);
    const icon = container.querySelector('[data-icon="StickyNote"]');
    expect(icon).not.toBeNull();
    const root = container.querySelector('[role="note"]') as HTMLElement;
    expect(root.className).toMatch(/bg-muted/);
    expect(root.className).toMatch(/border-l-border/);
  });

  it('defaults to the note variant when no variant prop is supplied', () => {
    const { container } = render(<Callout>Default note</Callout>);
    const icon = container.querySelector('[data-icon="StickyNote"]');
    expect(icon).not.toBeNull();
    const root = container.querySelector('[role="note"]') as HTMLElement;
    expect(root.className).toMatch(/bg-muted/);
  });
});

describe('Callout (D-11) — title + children', () => {
  it('renders children inside the body', () => {
    const { getByText } = render(
      <Callout variant="info">Hello body content</Callout>,
    );
    expect(getByText('Hello body content')).not.toBeNull();
  });

  it('renders the optional title as a bold line above children', () => {
    const { getByText } = render(
      <Callout variant="info" title="Technical note">
        Body here
      </Callout>,
    );
    const title = getByText('Technical note');
    expect(title).not.toBeNull();
    expect(title.className).toMatch(/font-semibold/);
  });

  it('does NOT render a title element when title prop is omitted', () => {
    const { container } = render(<Callout variant="info">Body only</Callout>);
    // The body wrapper holds only the children text node — no leading <p font-semibold>.
    const semibold = container.querySelector('p.font-semibold');
    expect(semibold).toBeNull();
  });
});

describe('Callout (D-11) — zero color literals', () => {
  it('rendered HTML contains NO hex, rgb(, or oklch( literals (palette-aliased only)', () => {
    const { container } = render(
      <>
        <Callout variant="info">a</Callout>
        <Callout variant="warning">b</Callout>
        <Callout variant="note" title="t">
          c
        </Callout>
      </>,
    );
    const html = container.innerHTML;
    expect(html).not.toMatch(/#[0-9a-f]{3,6}/i);
    expect(html).not.toMatch(/rgb\(/);
    expect(html).not.toMatch(/oklch\(/);
  });
});
