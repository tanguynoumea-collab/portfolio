'use client';

import { useEffect, useRef } from 'react';

/**
 * Konami sequence using `KeyboardEvent.code` (NOT `key`) — layout independent
 * (AZERTY French keyboards still produce KeyA when pressing A; arrow keys are
 * named by physical position, not produced character).
 *
 * Source: D-16 + PITFALLS.md Pitfall #12.
 */
const SEQUENCE: ReadonlyArray<string> = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export type UseKonamiCodeOptions = {
  /** Inter-keystroke timeout in ms before progress resets. Default 1500. */
  resetMs?: number;
};

/**
 * Global keydown listener that fires `onUnlock()` when the user enters the
 * Konami sequence (↑↑↓↓←→←→BA). Used by ThemeProvider in Wave 2 to unlock
 * the Vaporwave palette (THEME-12 + D-14).
 *
 * Input filters (D-16 + PITFALLS.md Pitfall #12 / Pitfall D):
 *   - active element is INPUT / TEXTAREA / SELECT → skip
 *   - active element is contentEditable          → skip
 *   - active element is inside `[role="dialog"][data-state="open"]` → skip
 *     (prevents accidental unlock while user navigates a Radix Sheet/Dialog
 *     with arrow keys, e.g. shadcn Slider inside the PaletteSwitcher)
 *
 * Never calls `e.preventDefault()` — must not break Tab navigation,
 * Enter form submission, or arrow-key slider adjustments.
 */
export function useKonamiCode(onUnlock: () => void, options?: UseKonamiCodeOptions): void {
  const progress = useRef(0);
  const lastKeyAt = useRef(0);
  const resetMs = options?.resetMs ?? 1500;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Input / dialog filter (D-16 + PITFALLS.md Pitfall #12, Pitfall D)
      const t = document.activeElement as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        // Defensive: real browsers expose `isContentEditable` (boolean), but
        // jsdom omits it. Fall back to the underlying attribute so test
        // environments AND production both honor the filter.
        if (t.isContentEditable || t.contentEditable === 'true') return;
        if (t.closest('[role="dialog"][data-state="open"]')) return;
      }

      // Inter-keystroke timeout reset — abandoned-mid-sequence users don't
      // accidentally unlock minutes later when they happen to press 'A'.
      const now = Date.now();
      if (now - lastKeyAt.current > resetMs) progress.current = 0;
      lastKeyAt.current = now;

      const expected = SEQUENCE[progress.current];
      if (e.code === expected) {
        progress.current += 1;
        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          onUnlock();
        }
      } else {
        // Wrong key — reset, but if THIS key starts the sequence, jump to 1.
        // Standard Konami implementation; without this branch the user has to
        // type the first key TWICE after any mistake (once to reset, once to
        // begin), which is unintuitive.
        progress.current = e.code === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUnlock, resetMs]);
}
