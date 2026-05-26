'use client';

/**
 * components/providers/ThemeProvider.tsx — Client Component (THEME-04).
 *
 * Single source of truth for palette + unlock state. Uses useReducer for
 * multi-action transitions (SET_PRESET / SET_CUSTOM_FROM_PICKER / SET_HARMONIC
 * / UNLOCK_VAPORWAVE). Persists to two localStorage keys via lib/storage.ts,
 * mutates the 6 --color-* CSS variables on document.documentElement via
 * useEffect, and integrates Konami unlock (D-16) via useKonamiCode.
 *
 * Public API surface (consumed by Wave 3+ UI components via usePalette()):
 *   { palette, paletteId, isCustom, customSource, isVaporwaveUnlocked,
 *     wasAdjustedForAA, setPreset, setCustomColor, setHarmonic, unlockVaporwave }
 *
 * Architecture notes:
 *   - "use client" required: useReducer + useEffect + window/document APIs
 *   - Lazy initFromStorage (3rd arg to useReducer) — runs once per real mount,
 *     reads localStorage synchronously (Pitfall B re-mount flicker mitigation)
 *   - context value memoized via useMemo (Pitfall H identity churn)
 *   - All actions wrapped in useCallback so consumers can use them in deps arrays
 *   - D-11 INVARIANT delegated to applyMatrixAdjust (lib/colors.ts): only
 *     text/textMuted shift; accent/secondary preserved
 *   - D-14 Konami unlock sequence: UNLOCK_VAPORWAVE → SET_PRESET('vaporwave')
 *     in handleUnlock so Wave 4 (confetti + Sheet auto-open) reads the
 *     post-unlock state with the new active palette already selected
 *   - paletteId='custom' discriminates 4 user-authored palettes from 5 presets
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  DEFAULT_PALETTE_ID,
  getPaletteById,
  type Palette,
  type PaletteId,
} from '@/lib/palettes';
import {
  applyMatrixAdjust,
  deriveDefaultTokens,
  generateHarmonic,
  type HarmonicMode,
} from '@/lib/colors';
import {
  readPaletteV1,
  readSecretsV1,
  writePaletteV1,
  writeSecretsV1,
  type StoredPalette,
} from '@/lib/storage';
import { useKonamiCode } from '@/lib/hooks/useKonamiCode';

// -------------------- Internal types --------------------

type ActivePaletteId = PaletteId | 'custom';

type ThemeState = {
  palette: Omit<Palette, 'id' | 'name'>;
  paletteId: ActivePaletteId;
  isCustom: boolean;
  customSource: 'picker' | 'harmonic' | null;
  isVaporwaveUnlocked: boolean;
  wasAdjustedForAA: boolean;
};

type ThemeAction =
  | { type: 'SET_PRESET'; id: PaletteId }
  | {
      type: 'SET_CUSTOM_FROM_PICKER';
      userInput: { bg: string; accent: string; secondary: string };
    }
  | { type: 'SET_HARMONIC'; mode: HarmonicMode; sourceColor: string }
  | { type: 'UNLOCK_VAPORWAVE' };

function toTokens(p: Palette): Omit<Palette, 'id' | 'name'> {
  return {
    bg: p.bg,
    surface: p.surface,
    text: p.text,
    textMuted: p.textMuted,
    accent: p.accent,
    secondary: p.secondary,
  };
}

// -------------------- Reducer --------------------

function reducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_PRESET': {
      const preset = getPaletteById(action.id);
      // Presets are pre-validated at definition time (scripts/validate-palettes.ts
      // covers all 5 PALETTES via the 7-pair matrix), so no applyMatrixAdjust
      // needed for the preset path.
      return {
        ...state,
        palette: toTokens(preset),
        paletteId: action.id,
        isCustom: false,
        customSource: null,
        wasAdjustedForAA: false,
      };
    }
    case 'SET_CUSTOM_FROM_PICKER': {
      // D-10: derive surface/text/textMuted from user-controlled bg/accent/secondary.
      // D-11: applyMatrixAdjust silently fixes text/textMuted if they fail AA;
      // accent/secondary preserved.
      const derived = deriveDefaultTokens(action.userInput);
      const { palette: adjusted, wasAdjusted } = applyMatrixAdjust({
        ...derived,
        id: 'terra',
        name: 'custom',
      });
      return {
        ...state,
        palette: toTokens({ ...adjusted, id: 'terra', name: 'custom' }),
        paletteId: 'custom',
        isCustom: true,
        customSource: 'picker',
        wasAdjustedForAA: wasAdjusted,
      };
    }
    case 'SET_HARMONIC': {
      // THEME-03: generateHarmonic returns full 6-token DerivedTokens via
      // hue rotation (D-12 source color + mode → secondary). applyMatrixAdjust
      // catches any borderline failures from the OKLCh derivation.
      const generated = generateHarmonic(action.mode, action.sourceColor);
      const { palette: adjusted, wasAdjusted } = applyMatrixAdjust({
        ...generated,
        id: 'terra',
        name: 'gen',
      });
      return {
        ...state,
        palette: toTokens({ ...adjusted, id: 'terra', name: 'gen' }),
        paletteId: 'custom',
        isCustom: true,
        customSource: 'harmonic',
        wasAdjustedForAA: wasAdjusted,
      };
    }
    case 'UNLOCK_VAPORWAVE': {
      return { ...state, isVaporwaveUnlocked: true };
    }
    default:
      return state;
  }
}

// -------------------- Lazy initFromStorage --------------------

function initFromStorage(): ThemeState {
  const defaultPalette = getPaletteById(DEFAULT_PALETTE_ID);
  const stored = readPaletteV1();
  const secrets = readSecretsV1();
  const baseTokens = toTokens(defaultPalette);

  let palette: Omit<Palette, 'id' | 'name'> = baseTokens;
  let paletteId: ActivePaletteId = DEFAULT_PALETTE_ID;
  let isCustom = false;
  let customSource: 'picker' | 'harmonic' | null = null;

  if (stored?.kind === 'preset') {
    palette = toTokens(getPaletteById(stored.id));
    paletteId = stored.id;
  } else if (stored?.kind === 'custom') {
    palette = stored.tokens;
    paletteId = 'custom';
    isCustom = true;
    customSource = stored.source;
  }
  // stored === null → Terra defaults (D-02 silent fallback already handled
  // inside lib/storage.ts; null here means "no stored value or shape mismatch").

  return {
    palette,
    paletteId,
    isCustom,
    customSource,
    isVaporwaveUnlocked: secrets.vaporwave,
    // wasAdjustedForAA is transient — only set by SET_CUSTOM_FROM_PICKER /
    // SET_HARMONIC actions. On rehydration from storage we start clean
    // (the persisted tokens are already the adjusted output).
    wasAdjustedForAA: false,
  };
}

// -------------------- Context --------------------

export type PaletteContextValue = {
  palette: Omit<Palette, 'id' | 'name'>;
  paletteId: ActivePaletteId;
  isCustom: boolean;
  customSource: 'picker' | 'harmonic' | null;
  isVaporwaveUnlocked: boolean;
  wasAdjustedForAA: boolean;
  setPreset: (id: PaletteId) => void;
  setCustomColor: (input: {
    bg: string;
    accent: string;
    secondary: string;
  }) => void;
  setHarmonic: (mode: HarmonicMode, sourceHex: string) => void;
  unlockVaporwave: () => void;
};

const ThemeContext = createContext<PaletteContextValue | null>(null);

export function usePalette(): PaletteContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      '[ThemeProvider] usePalette() must be called inside <ThemeProvider>.',
    );
  }
  return ctx;
}

// -------------------- Provider --------------------

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initFromStorage);

  // CSS variable writer — applies on every palette change.
  // Mutates document.documentElement.style for the 6 --color-* tokens only.
  // The shadcn alias chain in app/globals.css (--primary → var(--color-accent),
  // etc.) propagates the change to every shadcn primitive without rebuild.
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--color-bg', state.palette.bg);
    r.setProperty('--color-surface', state.palette.surface);
    r.setProperty('--color-text', state.palette.text);
    r.setProperty('--color-text-muted', state.palette.textMuted);
    r.setProperty('--color-accent', state.palette.accent);
    r.setProperty('--color-secondary', state.palette.secondary);
  }, [state.palette]);

  // Persist palette to localStorage on every change.
  // Discriminated by paletteId: 'custom' writes full tokens + source; presets
  // write only the id (forward-compatible if a future deploy tunes preset OKLCh).
  useEffect(() => {
    let value: StoredPalette;
    if (state.paletteId === 'custom') {
      value = {
        kind: 'custom',
        tokens: state.palette,
        source: state.customSource ?? 'picker',
      };
    } else {
      value = { kind: 'preset', id: state.paletteId };
    }
    writePaletteV1(value);
  }, [state.palette, state.paletteId, state.customSource]);

  // Persist unlock state independently — keyed under palette-secrets-v1.
  useEffect(() => {
    writeSecretsV1({ vaporwave: state.isVaporwaveUnlocked });
  }, [state.isVaporwaveUnlocked]);

  // D-14 Konami unlock sequence: UNLOCK_VAPORWAVE first (so Wave 4 confetti
  // can read the *new* unlocked state), then SET_PRESET('vaporwave') so the
  // next render shows Vaporwave with the card highlighted active. Wave 4
  // PaletteFab also opens the Sheet after this sequence.
  const handleUnlock = useCallback(() => {
    dispatch({ type: 'UNLOCK_VAPORWAVE' });
    dispatch({ type: 'SET_PRESET', id: 'vaporwave' });
  }, []);
  useKonamiCode(handleUnlock);

  // Stable action creators (useCallback so consumers can rely on identity
  // across renders and use them in dependency arrays without churn).
  const setPreset = useCallback(
    (id: PaletteId) => dispatch({ type: 'SET_PRESET', id }),
    [],
  );
  const setCustomColor = useCallback(
    (input: { bg: string; accent: string; secondary: string }) =>
      dispatch({ type: 'SET_CUSTOM_FROM_PICKER', userInput: input }),
    [],
  );
  const setHarmonic = useCallback(
    (mode: HarmonicMode, sourceHex: string) =>
      dispatch({ type: 'SET_HARMONIC', mode, sourceColor: sourceHex }),
    [],
  );
  const unlockVaporwave = useCallback(
    () => dispatch({ type: 'UNLOCK_VAPORWAVE' }),
    [],
  );

  // Memoize context value to prevent identity churn (Pitfall H).
  // All shape changes flow through `state`; action creators are useCallback-stable.
  const value = useMemo<PaletteContextValue>(
    () => ({
      palette: state.palette,
      paletteId: state.paletteId,
      isCustom: state.isCustom,
      customSource: state.customSource,
      isVaporwaveUnlocked: state.isVaporwaveUnlocked,
      wasAdjustedForAA: state.wasAdjustedForAA,
      setPreset,
      setCustomColor,
      setHarmonic,
      unlockVaporwave,
    }),
    [state, setPreset, setCustomColor, setHarmonic, unlockVaporwave],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
