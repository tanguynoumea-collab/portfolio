/**
 * CategoryFilter.test.tsx — RED harness for HOME-03.
 *
 * Wave 2 (04-03-projects-PLAN) creates CategoryFilter.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

vi.mock('motion/react', () => ({
  motion: {
    span: ((props: Record<string, unknown>) =>
      `<span ${JSON.stringify(props.layoutId)}/>`) as unknown as React.FC,
  },
}));

describe('CategoryFilter (HOME-03) — RED until Wave 2 ships', () => {
  it('renders 4 buttons (All / Tech / Design / BIM)', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    render(<CategoryFilter active="all" onChange={() => undefined} />);
    expect(screen.getByText(/All/)).toBeTruthy();
    expect(screen.getByText(/Tech/)).toBeTruthy();
    expect(screen.getByText(/Design/)).toBeTruthy();
    expect(screen.getByText(/BIM/)).toBeTruthy();
  });

  it('clicking inactive button calls onChange with target value', async () => {
    const { CategoryFilter } = await import('./CategoryFilter');
    const onChange = vi.fn();
    render(<CategoryFilter active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tech'));
    expect(onChange).toHaveBeenCalledWith('tech');
  });
});
