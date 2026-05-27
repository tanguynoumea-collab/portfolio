'use client';

/**
 * components/sections/CategoryFilter.tsx — HOME-03 Phase 4.
 *
 * Segmented control with 4 pill buttons (All / Tech / Design / BIM) and a
 * shared-element motion indicator (layoutId="filter-indicator"). The
 * pattern mirrors Phase 3 LanguageSwitcher D-18 — only the layoutId string
 * differs.
 *
 * State is LIFTED — parent <ProjectsSection> owns the active value and
 * passes (active, onChange) as props. This component is purely
 * presentational + callback-firing.
 *
 * aria-pressed (NOT role="radio") — same a11y pattern as Phase 3
 * LanguageSwitcher D-20.
 *
 * Colors are all Tailwind utilities backed by --color-* tokens
 * (border-border, bg-background, bg-primary, text-primary-foreground,
 * text-muted-foreground). The motion indicator is `bg-primary` — auto-recolors
 * via the shadcn alias chain when ThemeProvider mutates --color-accent.
 *
 * No color literals.
 */

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type Category = 'tech' | 'design' | 'bim';
export type FilterValue = Category | 'all';

const OPTIONS: ReadonlyArray<FilterValue> = ['all', 'tech', 'design', 'bim'] as const;

type Props = {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
};

export function CategoryFilter({ active, onChange }: Props) {
  const t = useTranslations('projects.filters');
  return (
    <div
      role="group"
      aria-label={t('all')}
      className="border-border bg-background relative inline-flex items-center gap-1 rounded-full border p-1 text-sm"
    >
      {OPTIONS.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            data-active={isActive ? 'true' : 'false'}
            className="relative z-10 px-4 py-1.5 font-medium transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId="filter-indicator"
                aria-hidden="true"
                className="bg-primary absolute inset-0 -z-10 rounded-full"
                transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
              />
            )}
            <span
              className={cn(
                isActive ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {t(option)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
