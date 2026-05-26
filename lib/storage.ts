/**
 * lib/storage.ts — palette persistence with silent fallback (D-01, D-02).
 *
 * Two localStorage keys:
 *   - `palette-v1`         → active palette, discriminated by `kind`
 *   - `palette-secrets-v1` → unlock state (extensible object payload)
 *
 * D-02 contract (silent fallback): every failure path — parse fail, shape
 * mismatch, quota exceeded, SSR `typeof localStorage === 'undefined'` — returns
 * `null` / default WITHOUT:
 *   - throwing
 *   - calling console.error / console.warn / console.log
 *   - calling localStorage.removeItem (storage is left intact for a future read)
 *   - surfacing a toast or any UI signal
 *
 * Consumed by:
 *   - PaletteFouCScript (Wave 2) — reads palette-v1 inline pre-hydration
 *   - ThemeProvider (Wave 2) — initFromStorage lazy initializer + persistence
 *     effects + Konami unlock state via palette-secrets-v1
 *   - useReducer SET_PRESET / SET_CUSTOM_FROM_PICKER / SET_HARMONIC reducers
 */

import { type PaletteId } from './palettes';

export type StoredPalette =
  | { kind: 'preset'; id: PaletteId }
  | {
      kind: 'custom';
      tokens: {
        bg: string;
        surface: string;
        text: string;
        textMuted: string;
        accent: string;
        secondary: string;
      };
      source: 'picker' | 'harmonic';
    };

export type StoredSecrets = { vaporwave: boolean };

const PALETTE_KEY = 'palette-v1';
const SECRETS_KEY = 'palette-secrets-v1';
const TOKEN_KEYS = ['bg', 'surface', 'text', 'textMuted', 'accent', 'secondary'] as const;
const VALID_PALETTE_IDS: ReadonlyArray<PaletteId> = [
  'terra',
  'nordic',
  'bauhaus',
  'ocean',
  'vaporwave',
];

function isValidPaletteShape(v: unknown): v is StoredPalette {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (o.kind === 'preset') {
    return typeof o.id === 'string' && VALID_PALETTE_IDS.includes(o.id as PaletteId);
  }
  if (o.kind === 'custom') {
    if (!o.tokens || typeof o.tokens !== 'object') return false;
    if (o.source !== 'picker' && o.source !== 'harmonic') return false;
    const t = o.tokens as Record<string, unknown>;
    return TOKEN_KEYS.every((k) => typeof t[k] === 'string');
  }
  return false;
}

/**
 * Read the active palette from localStorage. Returns null on any failure
 * (absent key, malformed JSON, shape mismatch, storage blocked, SSR).
 * D-02: silent — no throw, no console call.
 */
export function readPaletteV1(): StoredPalette | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PALETTE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidPaletteShape(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist the active palette. Silent no-op on quota exceeded / SSR / any
 * storage error (D-02).
 */
export function writePaletteV1(value: StoredPalette): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(value));
  } catch {
    // D-02: silent — UI will not be notified; next valid pick overwrites.
  }
}

/**
 * Read unlock state. Returns the default `{ vaporwave: false }` on any failure
 * — never returns null because the unlock state object IS the persistent shape.
 */
export function readSecretsV1(): StoredSecrets {
  if (typeof localStorage === 'undefined') return { vaporwave: false };
  try {
    const raw = localStorage.getItem(SECRETS_KEY);
    if (!raw) return { vaporwave: false };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { vaporwave: false };
    return { vaporwave: (parsed as Record<string, unknown>).vaporwave === true };
  } catch {
    return { vaporwave: false };
  }
}

/**
 * Persist unlock state. Silent no-op on quota exceeded / SSR / any
 * storage error (D-02).
 */
export function writeSecretsV1(value: StoredSecrets): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SECRETS_KEY, JSON.stringify(value));
  } catch {
    // D-02: silent — unlock state will be re-derived on next successful write.
  }
}
