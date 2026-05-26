/**
 * lib/palettes.ts — 5 typed palette constants (D-07).
 *
 * Terra is the cold-load default (D-06) — its OKLCh values MUST match the
 * :root declarations in app/globals.css authored by plan 02.
 *
 * Vaporwave is the SECRET palette — unlocked by Phase 2's Konami code listener.
 * It is included in PALETTES so Phase 2 can reference it via PALETTES.find(p => p.id === 'vaporwave'),
 * but it is NOT shown in the preset switcher UI (THEME-06: 4 visible presets).
 *
 * NOTE: Phase 2 will validate the full 7-pair WCAG matrix for each palette via
 * `validateFullMatrix` in lib/colors.ts. For palettes that fail (Vaporwave is the
 * likely candidate per STATE.md), Phase 2 applies `adjustForAA` at definition time.
 * Phase 1 only declares the typed constants.
 */

export type PaletteId = 'terra' | 'nordic' | 'bauhaus' | 'ocean' | 'vaporwave';

export type Palette = {
  id: PaletteId;
  name: string;
  bg: string; // OKLCh CSS string, e.g. 'oklch(0.97 0.012 80)'
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  secondary: string;
};

export const DEFAULT_PALETTE_ID: PaletteId = 'terra'; // D-06: cold-load default

export const PALETTES: ReadonlyArray<Palette> = [
  {
    id: 'terra',
    name: 'Terra & Sage',
    // Values MUST byte-match :root in app/globals.css (Plan 02 canonical Terra)
    bg: 'oklch(0.97 0.012 80)',
    surface: 'oklch(0.94 0.018 75)',
    text: 'oklch(0.22 0.018 50)',
    textMuted: 'oklch(0.5 0.02 55)',
    accent: 'oklch(0.62 0.155 35)',
    secondary: 'oklch(0.55 0.075 145)',
  },
  {
    id: 'nordic',
    name: 'Atelier Nordique',
    bg: 'oklch(0.98 0.004 240)',
    surface: 'oklch(0.95 0.006 240)',
    text: 'oklch(0.18 0.012 250)',
    textMuted: 'oklch(0.48 0.015 245)',
    accent: 'oklch(0.55 0.13 245)',
    secondary: 'oklch(0.6 0.06 200)',
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus Bright',
    bg: 'oklch(0.97 0.005 90)',
    surface: 'oklch(1 0 0)',
    text: 'oklch(0.15 0 0)',
    textMuted: 'oklch(0.45 0.005 90)',
    accent: 'oklch(0.65 0.23 30)',
    secondary: 'oklch(0.7 0.18 250)',
  },
  {
    id: 'ocean',
    name: 'Ocean Studio',
    bg: 'oklch(0.96 0.012 220)',
    surface: 'oklch(0.93 0.018 215)',
    text: 'oklch(0.18 0.025 230)',
    textMuted: 'oklch(0.47 0.03 225)',
    accent: 'oklch(0.55 0.13 215)',
    secondary: 'oklch(0.62 0.095 180)',
  },
  {
    id: 'vaporwave',
    name: '???', // Hidden in UI until Konami unlock (THEME-12)
    bg: 'oklch(0.2 0.04 290)',
    surface: 'oklch(0.26 0.055 285)',
    text: 'oklch(0.95 0.025 320)',
    textMuted: 'oklch(0.78 0.06 315)',
    accent: 'oklch(0.78 0.175 340)',
    secondary: 'oklch(0.8 0.15 200)',
  },
];

/**
 * Lookup helper — returns the palette or the default if id is unknown.
 */
export function getPaletteById(id: string | null | undefined): Palette {
  const found = PALETTES.find((p) => p.id === id);
  if (found) return found;
  const fallback = PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID);
  // PALETTES contains DEFAULT_PALETTE_ID by construction; the assertion is for TS narrowing.
  if (!fallback) {
    throw new Error('[lib/palettes] DEFAULT_PALETTE_ID is not present in PALETTES.');
  }
  return fallback;
}
