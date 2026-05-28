/**
 * mdx-components.test.tsx — CONTENT-03 / D-12 acceptance suite (Wave 1, plan 05-01 Task 3).
 *
 * Verifies the MDX component registry returned by useMDXComponents wires the 3
 * custom components + the external/internal <a> override + prose overrides:
 *
 *   - (1) Image, Callout, and pre keys map to the (mocked) components.
 *   - (2) the `a` function with { href: 'https://x.com' } returns an element
 *         with target="_blank" and rel="noopener noreferrer".
 *   - (3) the `a` function with { href: '/projects/foo' } returns the (mocked)
 *         next-intl Link, NOT a plain anchor.
 *   - Prose overrides (h2) render with the expected size class.
 *
 * Mock strategy (native chai matchers — setupFiles:[] means NO jest-dom):
 *   - The 3 components + next-intl Link are mocked as identifiable stubs so the
 *     registry wiring is assertable by tag / data attribute without rendering
 *     the real (client) components.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('@/components/mdx/Image', () => ({
  default: () => React.createElement('div', { 'data-stub': 'MDXImage' }),
}));

vi.mock('@/components/mdx/CodeBlock', () => ({
  default: () => React.createElement('pre', { 'data-stub': 'CodeBlock' }),
}));

vi.mock('@/components/mdx/Callout', () => ({
  Callout: () => React.createElement('div', { 'data-stub': 'Callout' }),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children?: ReactNode } & Record<string, unknown>) =>
    React.createElement(
      'a',
      { 'data-stub': 'IntlLink', 'data-href': href, ...rest },
      children as ReactNode,
    ),
}));

import { useMDXComponents } from './mdx-components';

describe('useMDXComponents (D-12) — component wiring', () => {
  it('preserves the passthrough spread of incoming components', () => {
    const incoming = { strong: () => null };
    const result = useMDXComponents(incoming);
    expect(result.strong).toBe(incoming.strong);
  });

  it('maps Image, Callout, and pre to the custom components', () => {
    const result = useMDXComponents({});
    expect(result.Image).toBeTruthy();
    expect(result.Callout).toBeTruthy();
    expect(result.pre).toBeTruthy();
  });

  it('the pre override renders the CodeBlock stub', () => {
    const result = useMDXComponents({});
    const Pre = result.pre as React.ComponentType;
    const { container } = render(<Pre />);
    expect(container.querySelector('[data-stub="CodeBlock"]')).not.toBeNull();
  });

  it('the Callout override renders the Callout stub', () => {
    const result = useMDXComponents({});
    const C = result.Callout as React.ComponentType;
    const { container } = render(<C />);
    expect(container.querySelector('[data-stub="Callout"]')).not.toBeNull();
  });
});

describe('useMDXComponents (D-12) — external/internal a override', () => {
  it('external https link → plain anchor with target=_blank + rel=noopener noreferrer', () => {
    const result = useMDXComponents({});
    const A = result.a as React.ComponentType<{
      href?: string;
      children?: ReactNode;
    }>;
    const { container } = render(<A href="https://x.com">ext</A>);
    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    // External anchor is NOT the intl Link stub.
    expect(anchor.getAttribute('data-stub')).toBeNull();
    expect(anchor.getAttribute('target')).toBe('_blank');
    const rel = anchor.getAttribute('rel') ?? '';
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });

  it('external http link → also gets target=_blank + rel', () => {
    const result = useMDXComponents({});
    const A = result.a as React.ComponentType<{
      href?: string;
      children?: ReactNode;
    }>;
    const { container } = render(<A href="http://insecure.example">ext</A>);
    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toMatch(/noopener noreferrer/);
  });

  it('internal link → next-intl Link stub, NOT a plain anchor', () => {
    const result = useMDXComponents({});
    const A = result.a as React.ComponentType<{
      href?: string;
      children?: ReactNode;
    }>;
    const { container } = render(<A href="/projects/foo">internal</A>);
    const link = container.querySelector('[data-stub="IntlLink"]') as HTMLElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute('data-href')).toBe('/projects/foo');
    // Internal link must NOT carry target=_blank (it is not external).
    expect(link.getAttribute('target')).toBeNull();
  });

  it('missing href → plain anchor (no Link, no target)', () => {
    const result = useMDXComponents({});
    const A = result.a as React.ComponentType<{
      href?: string;
      children?: ReactNode;
    }>;
    const { container } = render(<A>no href</A>);
    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('data-stub')).toBeNull();
    expect(anchor.getAttribute('target')).toBeNull();
  });
});

describe('useMDXComponents (D-12) — prose overrides (Pitfall 5G)', () => {
  it('h2 override renders with text-2xl sizing', () => {
    const result = useMDXComponents({});
    const H2 = result.h2 as React.ComponentType<{ children?: ReactNode }>;
    const { container } = render(<H2>Heading</H2>);
    const h2 = container.querySelector('h2') as HTMLElement;
    expect(h2).not.toBeNull();
    expect(h2.className).toMatch(/text-2xl/);
    expect(h2.textContent).toBe('Heading');
  });

  it('blockquote override renders with a border-l-4 + italic', () => {
    const result = useMDXComponents({});
    const BQ = result.blockquote as React.ComponentType<{
      children?: ReactNode;
    }>;
    const { container } = render(<BQ>quote</BQ>);
    const bq = container.querySelector('blockquote') as HTMLElement;
    expect(bq.className).toMatch(/border-l-4/);
    expect(bq.className).toMatch(/italic/);
  });
});
