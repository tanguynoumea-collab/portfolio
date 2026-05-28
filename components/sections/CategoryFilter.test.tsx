/**
 * CategoryFilter.test.tsx — HOME-03 acceptance suite.
 *
 * Wave 0 shipped a RED harness covering basic rendering. Wave 2
 * (04-03-projects-PLAN.md Task 3) expands the suite to cover the full
 * HOME-03 contract:
 *   1. Renders 4 buttons (All / Tech / Design / BIM) from i18n
 *   2. Default active='all' → All button has aria-pressed="true"
 *   3. Inactive buttons have aria-pressed="false"
 *   4. Click on inactive button calls onChange(target)
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

// next-intl mock — projects.filters.* keys
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      all: 'All',
      tech: 'Tech',
      design: 'Design',
      bim: 'BIM',
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
  // A11Y-05: the component now gates the layout morph on useReducedMotion.
  // Default false = full motion, preserving the layoutId / spring assertions.
  useReducedMotion: () => false,
}));

describe('CategoryFilter (HOME-03) — 4 buttons rendered from i18n', () => {
  it('renders 4 buttons (All / Tech / Design / BIM)', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    expect(screen.getByText(/All/)).toBeTruthy();
    expect(screen.getByText(/Tech/)).toBeTruthy();
    expect(screen.getByText(/Design/)).toBeTruthy();
    expect(screen.getByText(/BIM/)).toBeTruthy();
  });

  it('renders all 4 buttons as <button type="button">', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const { container } = render(
      <CategoryFilter active="all" onChange={() => undefined} />,
    );
    const buttons = container.querySelectorAll('button[type="button"]');
    expect(buttons).toHaveLength(4);
  });
});

describe('CategoryFilter (HOME-03) — aria-pressed reflects active state', () => {
  it('default active=all → All button has aria-pressed="true"', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    const allBtn = screen.getByText('All').closest('button');
    expect(allBtn).not.toBeNull();
    expect(allBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('inactive buttons have aria-pressed="false"', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    const techBtn = screen.getByText('Tech').closest('button');
    const designBtn = screen.getByText('Design').closest('button');
    const bimBtn = screen.getByText('BIM').closest('button');
    expect(techBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(designBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(bimBtn?.getAttribute('aria-pressed')).toBe('false');
  });

  it('when active=tech → Tech button has aria-pressed="true", others false', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="tech" onChange={() => undefined} />);
    const allBtn = screen.getByText('All').closest('button');
    const techBtn = screen.getByText('Tech').closest('button');
    expect(allBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(techBtn?.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('CategoryFilter (HOME-03) — onChange callback', () => {
  it('clicking inactive Tech button calls onChange("tech")', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tech'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('tech');
  });

  it('clicking inactive Design button calls onChange("design")', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('Design'));
    expect(onChange).toHaveBeenCalledWith('design');
  });

  it('clicking inactive BIM button calls onChange("bim")', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('BIM'));
    expect(onChange).toHaveBeenCalledWith('bim');
  });

  it('clicking All when already active still fires onChange("all") (passive idempotency)', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('All'));
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

  it('moves indicator to Tech button when active="tech"', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="tech" onChange={() => undefined} />);
    const techBtn = screen.getByText('Tech').closest('button');
    const indicator = techBtn?.querySelector(
      'span[data-layout-id="filter-indicator"]',
    );
    expect(indicator).not.toBeNull();
    // No indicator on the All button anymore
    const allBtn = screen.getByText('All').closest('button');
    const allIndicator = allBtn?.querySelector(
      'span[data-layout-id="filter-indicator"]',
    );
    expect(allIndicator).toBeNull();
  });
});
