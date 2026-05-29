/**
 * CategoryFilter.test.tsx — HOME-03 acceptance suite.
 *
 * Covers the 2-category contract (the portfolio now features software projects
 * split into BIM·Revit tooling and general tools):
 *   1. Renders 3 buttons (All / BIM·Revit / Outils) from i18n
 *   2. Default active='all' → All button has aria-pressed="true"
 *   3. Inactive buttons have aria-pressed="false"
 *   4. Click on inactive button calls onChange(value)  ('bim' | 'tech')
 *   5. Click on already-active button still fires onChange (passive idempotency)
 *   6. motion.span with layoutId='filter-indicator' renders only on active button
 *
 * Mock pattern follows components/sections/Contact.test.tsx — motion/react
 * mocked to return real React elements (NOT plain objects) so JSX
 * reconciliation works and getByLabelText / querySelectorAll succeed.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';

// next-intl mock — projects.filters.* keys (all / bim / tech)
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      all: 'Tous',
      bim: 'BIM·Revit',
      tech: 'Outils',
    };
    return map[k] ?? k;
  },
}));

// motion/react mock — render real React elements so children flow into the DOM.
// motion.span gets a data-layout-id passthrough so tests can assert which
// button hosts the indicator.
vi.mock('motion/react', () => ({
  motion: {
    span: ({
      children,
      layoutId,
      ...rest
    }: {
      children?: ReactNode;
      layoutId?: string;
    } & Record<string, unknown>) =>
      React.createElement(
        'span',
        { ...rest, 'data-layout-id': layoutId } as Record<string, unknown>,
        children as ReactNode,
      ),
  },
  // A11Y-05: the component gates the layout morph on useReducedMotion.
  // Default false = full motion, preserving the layoutId / spring assertions.
  useReducedMotion: () => false,
}));

describe('CategoryFilter (HOME-03) — 3 buttons rendered from i18n', () => {
  it('renders 3 buttons (All / BIM·Revit / Outils)', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    expect(screen.getByText('Tous')).toBeTruthy();
    expect(screen.getByText('BIM·Revit')).toBeTruthy();
    expect(screen.getByText('Outils')).toBeTruthy();
  });

  it('renders all 3 buttons as <button type="button">', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const { container } = render(
      <CategoryFilter active="all" onChange={() => undefined} />,
    );
    const buttons = container.querySelectorAll('button[type="button"]');
    expect(buttons).toHaveLength(3);
  });
});

describe('CategoryFilter (HOME-03) — aria-pressed reflects active state', () => {
  it('default active=all → All button has aria-pressed="true"', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    const allBtn = screen.getByText('Tous').closest('button');
    expect(allBtn).not.toBeNull();
    expect(allBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('inactive buttons have aria-pressed="false"', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    const bimBtn = screen.getByText('BIM·Revit').closest('button');
    const techBtn = screen.getByText('Outils').closest('button');
    expect(bimBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(techBtn?.getAttribute('aria-pressed')).toBe('false');
  });

  it('when active=bim → BIM·Revit button has aria-pressed="true", others false', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="bim" onChange={() => undefined} />);
    const allBtn = screen.getByText('Tous').closest('button');
    const bimBtn = screen.getByText('BIM·Revit').closest('button');
    expect(allBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(bimBtn?.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('CategoryFilter (HOME-03) — onChange callback', () => {
  it('clicking inactive BIM·Revit button calls onChange("bim")', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('BIM·Revit'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('bim');
  });

  it('clicking inactive Outils button calls onChange("tech")', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('Outils'));
    expect(onChange).toHaveBeenCalledWith('tech');
  });

  it('clicking All when already active still fires onChange("all") (passive idempotency)', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tous'));
    expect(onChange).toHaveBeenCalledWith('all');
  });
});

describe('CategoryFilter (HOME-03) — motion layoutId indicator', () => {
  it('renders motion.span with layoutId="filter-indicator" on active button', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const { container } = render(
      <CategoryFilter active="all" onChange={() => undefined} />,
    );
    const indicators = container.querySelectorAll(
      'span[data-layout-id="filter-indicator"]',
    );
    // Exactly one indicator (on the active button)
    expect(indicators).toHaveLength(1);
  });

  it('moves indicator to BIM·Revit button when active="bim"', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="bim" onChange={() => undefined} />);
    const bimBtn = screen.getByText('BIM·Revit').closest('button');
    const indicator = bimBtn?.querySelector(
      'span[data-layout-id="filter-indicator"]',
    );
    expect(indicator).not.toBeNull();
    // No indicator on the All button anymore
    const allBtn = screen.getByText('Tous').closest('button');
    const allIndicator = allBtn?.querySelector(
      'span[data-layout-id="filter-indicator"]',
    );
    expect(allIndicator).toBeNull();
  });
});
