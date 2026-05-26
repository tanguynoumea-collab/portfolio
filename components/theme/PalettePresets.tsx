'use client';

/**
 * components/theme/PalettePresets.tsx — Client Component (THEME-06 + D-15).
 *
 * Preset palette gallery — the cornerstone of the PaletteSwitcher's "Presets"
 * tab. Renders cards in a grid; clicking a card dispatches setPreset(id) which
 * mutates the 6 --color-* CSS variables on document.documentElement.
 *
 * D-15 visibility logic:
 *   - 4 cards (terra, nordic, bauhaus, ocean) when !isVaporwaveUnlocked.
 *   - 5 cards (above + vaporwave) when isVaporwaveUnlocked.
 *
 * D-15 label sourcing:
 *   - Card label comes from i18n: t('palette.presets.<id>'), NOT palette.name.
 *   - The lib/palettes.ts .name field stays "???" for vaporwave as defensive
 *     fallback never displayed in practice (i18n preferred everywhere).
 *
 * Active card indicator: aria-checked + ring-2 ring-primary visual when
 * paletteId === card.id. Active state survives setPreset because the reducer
 * writes paletteId synchronously.
 *
 * Micro-animation: motion.button with whileHover scale 1.02 + whileTap scale
 * 0.98 — short 150ms ease-out. NOT gated on prefers-reduced-motion here
 * because the FAB (Plan 06) hosts the global PaletteFab whose motion gate
 * applies to the entire FAB rotation/cross-fade; per-card hover is so minor
 * (2% scale) that disabling it would feel arbitrary. If user feedback requires
 * gating, wrap in useReducedMotion from motion/react in a follow-up.
 *
 * Accessibility:
 *   - role="radiogroup" on container with aria-label='palette.title'.
 *   - role="radio" + aria-checked on each card so screen readers announce
 *     "Terra & Sage, checked, 1 of 4" on focus.
 *   - focus-visible ring matching the active-state ring (focus is keyboard-only).
 */
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { usePalette } from '@/components/providers/ThemeProvider';
import { PALETTES, type PaletteId } from '@/lib/palettes';
import { cn } from '@/lib/utils';

export function PalettePresets() {
  const t = useTranslations('palette');
  const { paletteId, isVaporwaveUnlocked, setPreset } = usePalette();

  const visiblePalettes = useMemo(
    () =>
      isVaporwaveUnlocked
        ? PALETTES
        : PALETTES.filter((p) => p.id !== 'vaporwave'),
    [isVaporwaveUnlocked],
  );

  return (
    <div
      role="radiogroup"
      aria-label={t('title')}
      className="grid grid-cols-2 gap-3 sm:grid-cols-2"
    >
      {visiblePalettes.map((p) => {
        const isActive = paletteId === p.id;
        const label = t(`presets.${p.id as PaletteId}`);
        return (
          <motion.button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => setPreset(p.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'group flex flex-col gap-2 rounded-lg border p-3 text-left transition-shadow',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              isActive
                ? 'border-primary ring-primary shadow-sm ring-2 ring-offset-2'
                : 'border-border hover:border-primary/50',
            )}
          >
            <div className="border-border flex h-12 overflow-hidden rounded-md border">
              <span
                className="flex-1"
                style={{ backgroundColor: p.bg }}
                aria-hidden="true"
              />
              <span
                className="flex-1"
                style={{ backgroundColor: p.surface }}
                aria-hidden="true"
              />
              <span
                className="flex-1"
                style={{ backgroundColor: p.accent }}
                aria-hidden="true"
              />
              <span
                className="flex-1"
                style={{ backgroundColor: p.secondary }}
                aria-hidden="true"
              />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
