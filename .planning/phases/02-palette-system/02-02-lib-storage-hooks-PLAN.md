---
phase: 02-palette-system
plan: 02
type: tdd
wave: 1
depends_on:
  - 02-palette-system/00
files_modified:
  - lib/storage.ts
  - lib/storage.test.ts
  - lib/hooks/useKonamiCode.ts
  - lib/hooks/useKonamiCode.test.ts
  - lib/hooks/usePrefersReducedMotion.ts
  - lib/hooks/usePrefersReducedMotion.test.ts
autonomous: true
requirements:
  - THEME-12
must_haves:
  truths:
    - "lib/storage.ts exports readPaletteV1/writePaletteV1/readSecretsV1/writeSecretsV1 using the D-01 discriminated shape"
    - "Silent fallback per D-02: parse fail / shape mismatch / SSR / quota → returns null or default WITHOUT throwing or calling console.error"
    - "useKonamiCode hook fires onUnlock when sequence ArrowUp×2 ArrowDown×2 ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA is typed"
    - "useKonamiCode filters when document.activeElement is INPUT/TEXTAREA/SELECT or isContentEditable (D-16)"
    - "usePrefersReducedMotion returns false on SSR mount, then mirrors matchMedia('(prefers-reduced-motion: reduce)') after first effect"
  artifacts:
    - path: "lib/storage.ts"
      provides: "Persistence layer for palette-v1 + palette-secrets-v1 with D-02 silent fallback"
      exports: ["StoredPalette", "StoredSecrets", "readPaletteV1", "writePaletteV1", "readSecretsV1", "writeSecretsV1"]
    - path: "lib/hooks/useKonamiCode.ts"
      provides: "Global keydown listener with sequence tracking + input filter"
      exports: ["useKonamiCode"]
    - path: "lib/hooks/usePrefersReducedMotion.ts"
      provides: "SSR-safe matchMedia wrapper for animation gating"
      exports: ["usePrefersReducedMotion"]
  key_links:
    - from: "lib/storage.ts"
      to: "localStorage"
      via: "getItem / setItem with try/catch silent fallback"
      pattern: "try \\{[\\s\\S]*?localStorage"
    - from: "lib/hooks/useKonamiCode.ts"
      to: "window keydown event"
      via: "useEffect addEventListener / removeEventListener"
      pattern: "window\\.addEventListener\\(['\"]keydown"
---

<objective>
Ship the three pure leaf modules ThemeProvider needs in Wave 2: `lib/storage.ts` (D-01 + D-02), `lib/hooks/useKonamiCode.ts` (D-16 + THEME-12), and `lib/hooks/usePrefersReducedMotion.ts` (motion gate for FAB + confetti). All TDD. All decoupled from React state — they expose simple primitives.

Purpose: Lock the persistence + Konami + reduced-motion contracts so Wave 2's ThemeProvider can simply compose them. Storage silent-fallback per D-02 is critical (no console.error, no toast, no removeItem). Konami input-filter per D-16 + PITFALLS.md Pitfall #12 prevents accidental unlocks while typing.
Output: 3 source files + 3 test files. Runs alongside Plan 01 in parallel (no shared files — both depend only on Wave 0).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-palette-system/02-CONTEXT.md
@.planning/phases/02-palette-system/02-RESEARCH.md
@.planning/research/PITFALLS.md
@lib/palettes.ts

<interfaces>
<!-- From lib/palettes.ts (consumed by storage.ts for type narrowing): -->
```ts
export type PaletteId = 'terra' | 'nordic' | 'bauhaus' | 'ocean' | 'vaporwave';
```

<!-- D-01 storage shapes: -->
```ts
// localStorage['palette-v1']:
type StoredPalette =
  | { kind: 'preset'; id: PaletteId }
  | { kind: 'custom';
      tokens: { bg: string; surface: string; text: string;
                textMuted: string; accent: string; secondary: string };
      source: 'picker' | 'harmonic' };

// localStorage['palette-secrets-v1']:
type StoredSecrets = { vaporwave: boolean };
```

<!-- D-16 Konami sequence using e.code (keyboard-layout-independent): -->
```ts
const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];
```
</interfaces>
</context>

<behavior>
**lib/storage.test.ts:**
- Test 1: writePaletteV1({kind:'preset',id:'nordic'}) then readPaletteV1() returns the same object (round-trip)
- Test 2: writePaletteV1({kind:'custom',tokens:{...},source:'picker'}) round-trips with all 6 tokens preserved
- Test 3: readPaletteV1() returns null when localStorage key absent
- Test 4: readPaletteV1() returns null when stored JSON is malformed (D-02 silent — no throw, no console.error)
- Test 5: readPaletteV1() returns null when shape doesn't match {kind:'preset',id:string} or {kind:'custom',tokens:object,source:string} (D-02 silent — no throw)
- Test 6: readPaletteV1() returns null when localStorage throws (simulate via Object.defineProperty) — no throw, no console.error
- Test 7: readPaletteV1() returns null in SSR-style env (typeof localStorage === 'undefined')
- Test 8: writePaletteV1 silently no-ops when localStorage throws on setItem (quota exceeded simulation)
- Test 9: readSecretsV1() returns {vaporwave: false} when absent (default object — not null)
- Test 10: readSecretsV1() returns {vaporwave: true} when stored '{"vaporwave":true}'
- Test 11: readSecretsV1() returns {vaporwave: false} when stored value is malformed (D-02 silent fallback)
- Test 12: writeSecretsV1({vaporwave:true}) round-trips via readSecretsV1
- Test 13: D-02 verification — no spy on console.error/console.warn/console.log fires during ANY failure path (read/write/parse/quota)

**lib/hooks/useKonamiCode.test.ts:**
- Test 14: Pressing the full SEQUENCE (10 key events with correct e.code) calls onUnlock once
- Test 15: Pressing 9 correct keys + 1 wrong key does NOT call onUnlock
- Test 16: After full sequence triggers onUnlock, the next full sequence also triggers onUnlock (progress resets)
- Test 17: Wrong key resets progress; immediately re-typing SEQUENCE works
- Test 18: When wrong key happens to match SEQUENCE[0] (ArrowUp), progress jumps to 1 (not 0) — standard Konami implementation
- Test 19: Pressing SEQUENCE while document.activeElement is an INPUT does NOT call onUnlock
- Test 20: Pressing SEQUENCE while document.activeElement is a TEXTAREA does NOT call onUnlock
- Test 21: Pressing SEQUENCE while document.activeElement has isContentEditable=true does NOT call onUnlock
- Test 22: Pressing SEQUENCE while document.activeElement is inside an open Radix dialog (`[role="dialog"][data-state="open"]`) does NOT call onUnlock (defensive — PITFALLS.md Pitfall D)
- Test 23: Unmounting the host component removes the keydown listener (verify with addEventListener spy)
- Test 24: Inter-keystroke timeout: if more than 1500ms elapses between keys, progress resets

**lib/hooks/usePrefersReducedMotion.test.ts:**
- Test 25: Returns false on initial render (SSR-safe default, before effect runs)
- Test 26: After mount, returns matchMedia('(prefers-reduced-motion: reduce)').matches
- Test 27: When matchMedia 'change' event fires with matches=true, hook re-renders with true
- Test 28: Listener is removed on unmount
</behavior>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write tests + implementation for lib/storage.ts (RED → GREEN)</name>
  <files>lib/storage.ts, lib/storage.test.ts</files>
  <read_first>
    - lib/palettes.ts (PaletteId type)
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-01 storage shape, D-02 silent fallback)
    - .planning/phases/02-palette-system/02-RESEARCH.md (lib/storage.ts skeleton lines 855-928)
    - vitest.config.ts (confirm jsdom env — localStorage is provided automatically)
  </read_first>
  <action>
    **RED phase first.** Create `lib/storage.test.ts` with Tests 1-13 from <behavior> above:

    ```ts
    import { describe, it, expect, beforeEach, vi } from 'vitest';
    import {
      readPaletteV1,
      writePaletteV1,
      readSecretsV1,
      writeSecretsV1,
      type StoredPalette,
    } from './storage';

    beforeEach(() => {
      localStorage.clear();
      vi.restoreAllMocks();
    });

    describe('palette-v1 round-trip', () => {
      it('round-trips a preset (Test 1)', () => {
        const v: StoredPalette = { kind: 'preset', id: 'nordic' };
        writePaletteV1(v);
        expect(readPaletteV1()).toEqual(v);
      });
      it('round-trips a custom palette (Test 2)', () => {
        const v: StoredPalette = {
          kind: 'custom',
          tokens: {
            bg: 'oklch(0.97 0 0)', surface: 'oklch(0.94 0 0)',
            text: 'oklch(0.15 0 0)', textMuted: 'oklch(0.5 0 0)',
            accent: 'oklch(0.62 0.155 35)', secondary: 'oklch(0.55 0.075 145)',
          },
          source: 'picker',
        };
        writePaletteV1(v);
        expect(readPaletteV1()).toEqual(v);
      });
    });

    describe('palette-v1 silent fallback (D-02)', () => {
      it('returns null when key absent (Test 3)', () => {
        expect(readPaletteV1()).toBeNull();
      });
      it('returns null when JSON malformed, no throw (Test 4)', () => {
        localStorage.setItem('palette-v1', '{not-json');
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => readPaletteV1()).not.toThrow();
        expect(readPaletteV1()).toBeNull();
        expect(errorSpy).not.toHaveBeenCalled();
      });
      it('returns null when shape mismatched (Test 5)', () => {
        localStorage.setItem('palette-v1', JSON.stringify({ kind: 'unknown' }));
        expect(readPaletteV1()).toBeNull();
        localStorage.setItem('palette-v1', JSON.stringify({ kind: 'preset' /* no id */ }));
        expect(readPaletteV1()).toBeNull();
        localStorage.setItem('palette-v1', JSON.stringify({ kind: 'custom', tokens: {} /* missing fields */, source: 'picker' }));
        expect(readPaletteV1()).toBeNull();
      });
      it('returns null when localStorage.getItem throws (Test 6)', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
        expect(readPaletteV1()).toBeNull();
        expect(errorSpy).not.toHaveBeenCalled();
      });
      it('writePaletteV1 silently no-ops on quota error (Test 8)', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
        expect(() => writePaletteV1({ kind: 'preset', id: 'terra' })).not.toThrow();
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    describe('palette-secrets-v1', () => {
      it('returns {vaporwave: false} when absent (Test 9)', () => {
        expect(readSecretsV1()).toEqual({ vaporwave: false });
      });
      it('returns {vaporwave: true} when stored (Test 10)', () => {
        localStorage.setItem('palette-secrets-v1', JSON.stringify({ vaporwave: true }));
        expect(readSecretsV1()).toEqual({ vaporwave: true });
      });
      it('returns {vaporwave: false} on malformed JSON (Test 11)', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem('palette-secrets-v1', '{bad');
        expect(readSecretsV1()).toEqual({ vaporwave: false });
        expect(errorSpy).not.toHaveBeenCalled();
      });
      it('round-trips writeSecretsV1 (Test 12)', () => {
        writeSecretsV1({ vaporwave: true });
        expect(readSecretsV1()).toEqual({ vaporwave: true });
      });
    });

    describe('D-02 verification — no console output on any failure path (Test 13)', () => {
      it('does not emit console.error/warn/log on ANY failure', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // Failure path: malformed JSON
        localStorage.setItem('palette-v1', '!!!');
        readPaletteV1();
        // Failure path: setItem throws
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error(); });
        writePaletteV1({ kind: 'preset', id: 'terra' });
        writeSecretsV1({ vaporwave: false });

        expect(errSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
      });
    });
    ```

    Note Test 7 (SSR `typeof localStorage === 'undefined'`) cannot be directly tested in jsdom (localStorage always defined). The implementation MUST contain the `typeof localStorage === 'undefined'` guard per RESEARCH.md skeleton; Wave 2 ThemeProvider's SSR initFromStorage relies on it. Skip as a Vitest test but verify by grep in acceptance criteria.

    Run `npx vitest run lib/storage.test.ts` → must fail (no implementation yet). Commit: `test(02-02): add failing tests for lib/storage.ts (D-01, D-02)`.

    **GREEN phase.** Create `lib/storage.ts` per RESEARCH.md lines 855-928, with strict TypeScript:

    ```ts
    /**
     * lib/storage.ts — palette persistence with silent fallback (D-01, D-02).
     *
     * Two keys:
     *   - palette-v1  → active palette (discriminated)
     *   - palette-secrets-v1 → unlock state (extensible object)
     *
     * D-02: any error (parse fail, shape mismatch, quota, SSR) returns null/default
     * WITHOUT throwing, WITHOUT console.error, WITHOUT removeItem, WITHOUT toast.
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
      'terra', 'nordic', 'bauhaus', 'ocean', 'vaporwave',
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

    export function writePaletteV1(value: StoredPalette): void {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(PALETTE_KEY, JSON.stringify(value));
      } catch {
        // D-02: silent
      }
    }

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

    export function writeSecretsV1(value: StoredSecrets): void {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(SECRETS_KEY, JSON.stringify(value));
      } catch {
        // D-02: silent
      }
    }
    ```

    Run `npx vitest run lib/storage.test.ts` → must pass 12/12 (Test 7 skipped at jsdom level; grep verifies the guard in acceptance). Commit: `feat(02-02): implement lib/storage.ts (D-01, D-02)`.
  </action>
  <verify>
    <automated>npx vitest run lib/storage.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `lib/storage.test.ts` exists with all 12 jsdom-runnable tests (Test 7 SSR guard verified via grep below)
    - `lib/storage.ts` exists
    - `lib/storage.ts` exports: `StoredPalette` (type), `StoredSecrets` (type), `readPaletteV1`, `writePaletteV1`, `readSecretsV1`, `writeSecretsV1`
    - `lib/storage.ts` contains the literal string `typeof localStorage === 'undefined'` (SSR guard for Test 7)
    - `lib/storage.ts` contains exactly 4 `try {` blocks (read palette, write palette, read secrets, write secrets) — every one with empty `catch` (no console call)
    - `lib/storage.ts` contains zero `console.` calls
    - `lib/storage.ts` contains zero `removeItem` calls (D-02 — storage left intact on failure)
    - `lib/storage.ts` contains no `: any` annotation
    - `npx vitest run lib/storage.test.ts` exits 0 with all tests passing
  </acceptance_criteria>
  <done>lib/storage.ts ships. All storage operations are D-02-compliant (silent fallback). ThemeProvider (Wave 2) and PaletteFouCScript (Wave 2) can both import these without re-implementing.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Write tests + implementation for lib/hooks/useKonamiCode.ts (RED → GREEN)</name>
  <files>lib/hooks/useKonamiCode.ts, lib/hooks/useKonamiCode.test.ts</files>
  <read_first>
    - .planning/phases/02-palette-system/02-CONTEXT.md (D-16 sequence + input filter spec)
    - .planning/phases/02-palette-system/02-RESEARCH.md (Pattern 7 lines 543-590, Pitfall D lines 775-790)
    - .planning/research/PITFALLS.md (Pitfall 12 lines 1049-1128 — full hook with `target.closest('[role="dialog"]')` filter)
    - vitest.config.ts (jsdom env)
  </read_first>
  <action>
    **RED phase.** Create `lib/hooks/useKonamiCode.test.ts` with Tests 14-24:

    ```ts
    import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
    import { renderHook } from '@testing-library/react';
    import { useKonamiCode } from './useKonamiCode';

    const SEQUENCE = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA',
    ];

    function press(code: string) {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
    }

    function pressAll(codes: string[]) {
      for (const code of codes) press(code);
    }

    beforeEach(() => {
      document.body.innerHTML = '';
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    describe('useKonamiCode', () => {
      it('fires onUnlock after full sequence (Test 14)', () => {
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE);
        expect(onUnlock).toHaveBeenCalledTimes(1);
      });
      it('9 correct + 1 wrong does NOT fire (Test 15)', () => {
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE.slice(0, 9));
        press('Space');
        expect(onUnlock).not.toHaveBeenCalled();
      });
      it('progress resets after success (Test 16)', () => {
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE);
        pressAll(SEQUENCE);
        expect(onUnlock).toHaveBeenCalledTimes(2);
      });
      it('wrong key resets, re-typing works (Test 17)', () => {
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll([SEQUENCE[0]!, SEQUENCE[1]!, 'Space']);
        pressAll(SEQUENCE);
        expect(onUnlock).toHaveBeenCalledTimes(1);
      });
      it('wrong key matching SEQUENCE[0] starts new sequence (Test 18)', () => {
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        // ArrowUp, ArrowUp, Space → reset. Then user mashes ArrowUp again, expecting that to count as new progress=1.
        pressAll(['ArrowUp', 'ArrowUp', 'Space']);
        pressAll(SEQUENCE.slice(1)); // ArrowUp counted as SEQUENCE[0], now press SEQUENCE[1..9]
        expect(onUnlock).toHaveBeenCalledTimes(1);
      });
      it('does not fire when active element is INPUT (Test 19)', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE);
        expect(onUnlock).not.toHaveBeenCalled();
      });
      it('does not fire when active element is TEXTAREA (Test 20)', () => {
        const ta = document.createElement('textarea');
        document.body.appendChild(ta);
        ta.focus();
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE);
        expect(onUnlock).not.toHaveBeenCalled();
      });
      it('does not fire when active element is contentEditable (Test 21)', () => {
        const div = document.createElement('div');
        div.contentEditable = 'true';
        div.tabIndex = 0;
        document.body.appendChild(div);
        div.focus();
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE);
        expect(onUnlock).not.toHaveBeenCalled();
      });
      it('does not fire inside open Radix dialog (Test 22)', () => {
        const dialog = document.createElement('div');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('data-state', 'open');
        const btn = document.createElement('button');
        dialog.appendChild(btn);
        document.body.appendChild(dialog);
        btn.focus();
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock));
        pressAll(SEQUENCE);
        expect(onUnlock).not.toHaveBeenCalled();
      });
      it('removes listener on unmount (Test 23)', () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const onUnlock = vi.fn();
        const { unmount } = renderHook(() => useKonamiCode(onUnlock));
        unmount();
        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      });
      it('inter-keystroke timeout resets progress (Test 24)', () => {
        const onUnlock = vi.fn();
        renderHook(() => useKonamiCode(onUnlock, { resetMs: 1500 }));
        pressAll(SEQUENCE.slice(0, 5));
        vi.advanceTimersByTime(2000);
        pressAll(SEQUENCE.slice(5));
        expect(onUnlock).not.toHaveBeenCalled();
      });
    });
    ```

    Run `npx vitest run lib/hooks/useKonamiCode.test.ts` → must fail (no implementation). Commit RED.

    **GREEN phase.** Create `lib/hooks/useKonamiCode.ts` per RESEARCH.md Pattern 7 + PITFALLS.md #12, **using `e.code` (not `e.key`) for layout independence** per D-16:

    ```ts
    'use client';

    import { useEffect, useRef } from 'react';

    const SEQUENCE: ReadonlyArray<string> = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA',
    ];

    export type UseKonamiCodeOptions = {
      /** Inter-keystroke timeout in ms before progress resets. Default 1500. */
      resetMs?: number;
    };

    /**
     * Global keydown listener detecting the Konami sequence (D-16).
     * Filters INPUT/TEXTAREA/SELECT/contentEditable focus and open Radix dialogs.
     */
    export function useKonamiCode(onUnlock: () => void, options?: UseKonamiCodeOptions): void {
      const progress = useRef(0);
      const lastKeyAt = useRef(0);
      const resetMs = options?.resetMs ?? 1500;

      useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
          // Input filter (D-16 + PITFALLS.md #12)
          const t = document.activeElement as HTMLElement | null;
          if (t) {
            const tag = t.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (t.isContentEditable) return;
            // Pitfall D — skip while inside an open Radix dialog (Sheet/Dialog/Popover root)
            if (t.closest('[role="dialog"][data-state="open"]')) return;
          }

          // Inter-keystroke timeout reset
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
            // Wrong key — reset, but if THIS key starts the sequence, jump to 1
            progress.current = e.code === SEQUENCE[0] ? 1 : 0;
          }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [onUnlock, resetMs]);
    }
    ```

    Run `npx vitest run lib/hooks/useKonamiCode.test.ts` → 11/11 GREEN. Commit `feat(02-02): implement useKonamiCode hook (THEME-12)`.
  </action>
  <verify>
    <automated>npx vitest run lib/hooks/useKonamiCode.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `lib/hooks/useKonamiCode.ts` exists with `'use client'` directive on line 1
    - File exports `useKonamiCode` and `UseKonamiCodeOptions` type
    - File contains the literal `SEQUENCE` array with exactly these 10 strings in order: `ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA`
    - File contains the literal `e.code === expected` (using `e.code`, NOT `e.key`)
    - File contains the input-filter checks for `tag === 'INPUT'`, `tag === 'TEXTAREA'`, `tag === 'SELECT'`, `t.isContentEditable`, and `t.closest('[role="dialog"][data-state="open"]')`
    - File contains NO `e.preventDefault()` call (PITFALLS.md #12 — never preventDefault)
    - `lib/hooks/useKonamiCode.test.ts` contains all 11 listed tests (Tests 14-24)
    - `npx vitest run lib/hooks/useKonamiCode.test.ts` exits 0
  </acceptance_criteria>
  <done>useKonamiCode hook ships. ThemeProvider can compose it directly in Wave 2; Konami unlocks dispatch through React state.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Write tests + implementation for lib/hooks/usePrefersReducedMotion.ts (RED → GREEN)</name>
  <files>lib/hooks/usePrefersReducedMotion.ts, lib/hooks/usePrefersReducedMotion.test.ts</files>
  <read_first>
    - .planning/phases/02-palette-system/02-RESEARCH.md (Pattern 8 lines 595-621, Pitfall F lines 808-818)
    - .planning/phases/02-palette-system/02-CONTEXT.md (motion gating responsibilities)
  </read_first>
  <action>
    **RED phase.** Create `lib/hooks/usePrefersReducedMotion.test.ts`:

    ```ts
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { renderHook, act } from '@testing-library/react';
    import { usePrefersReducedMotion } from './usePrefersReducedMotion';

    type Listener = (e: { matches: boolean }) => void;

    function mockMatchMedia(initialMatches: boolean) {
      const listeners = new Set<Listener>();
      const mq = {
        matches: initialMatches,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn((_: 'change', cb: Listener) => { listeners.add(cb); }),
        removeEventListener: vi.fn((_: 'change', cb: Listener) => { listeners.delete(cb); }),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      window.matchMedia = vi.fn().mockReturnValue(mq);
      const emit = (matches: boolean) => {
        mq.matches = matches;
        listeners.forEach((cb) => cb({ matches }));
      };
      return { mq, emit };
    }

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    describe('usePrefersReducedMotion', () => {
      it('returns false on initial render (SSR-safe default) (Test 25)', () => {
        // We can't truly SSR in jsdom, but the FIRST render before effect is the SSR-equivalent value
        mockMatchMedia(false);
        const { result } = renderHook(() => usePrefersReducedMotion());
        // After mount effect runs synchronously in RTL, matchMedia(false) propagates → still false
        expect(result.current).toBe(false);
      });
      it('returns matchMedia matches after mount (Test 26)', () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(true);
      });
      it('responds to matchMedia change events (Test 27)', () => {
        const { emit } = mockMatchMedia(false);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(false);
        act(() => emit(true));
        expect(result.current).toBe(true);
        act(() => emit(false));
        expect(result.current).toBe(false);
      });
      it('removes listener on unmount (Test 28)', () => {
        const { mq } = mockMatchMedia(false);
        const { unmount } = renderHook(() => usePrefersReducedMotion());
        unmount();
        expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      });
    });
    ```

    Run `npx vitest run lib/hooks/usePrefersReducedMotion.test.ts` → fails.

    **GREEN phase.** Create `lib/hooks/usePrefersReducedMotion.ts` per RESEARCH.md Pattern 8:

    ```ts
    'use client';

    import { useEffect, useState } from 'react';

    /**
     * SSR-safe matchMedia wrapper for (prefers-reduced-motion: reduce).
     * Returns false on initial render (allow animations by default unless user opts out),
     * then mirrors matchMedia after first effect.
     *
     * Used by:
     *   - PaletteFab (D-08 — disables hover/rotate motion)
     *   - ThemeProvider onUnlock (D-13 — fade-only confetti fallback)
     */
    export function usePrefersReducedMotion(): boolean {
      const [reduced, setReduced] = useState(false);

      useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
      }, []);

      return reduced;
    }
    ```

    Run `npx vitest run lib/hooks/usePrefersReducedMotion.test.ts` → 4/4 GREEN. Commit `feat(02-02): implement usePrefersReducedMotion hook`.
  </action>
  <verify>
    <automated>npx vitest run lib/hooks/usePrefersReducedMotion.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `lib/hooks/usePrefersReducedMotion.ts` exists with `'use client'` directive on line 1
    - File exports `usePrefersReducedMotion` returning `boolean`
    - File contains the literal string `'(prefers-reduced-motion: reduce)'`
    - File contains `mq.addEventListener('change', onChange)` and `mq.removeEventListener('change', onChange)`
    - File contains the SSR guard `typeof window === 'undefined' || typeof window.matchMedia !== 'function'`
    - `lib/hooks/usePrefersReducedMotion.test.ts` contains all 4 tests (Tests 25-28)
    - `npx vitest run lib/hooks/usePrefersReducedMotion.test.ts` exits 0
  </acceptance_criteria>
  <done>usePrefersReducedMotion ships. FAB (Wave 4) and confetti integration (Wave 4) gate animations through this single hook.</done>
</task>

</tasks>

<verification>
- `npx vitest run lib/storage.test.ts lib/hooks/useKonamiCode.test.ts lib/hooks/usePrefersReducedMotion.test.ts` exits 0
- `npm run lint` exits 0
- All 3 source files contain `'use client'` (hooks) or remain pure (storage.ts has no directive — it's framework-agnostic, importable from server or client)
- Wait — clarification: `lib/storage.ts` has NO directive (used by both FOUC script generation server-side and ThemeProvider client-side). Only hooks get `'use client'`.
</verification>

<success_criteria>
- THEME-12 (useKonamiCode with input filter) satisfied
- D-01 + D-02 storage shape and silent fallback enforced via 13 tests
- Wave 2 ThemeProvider can import all 3 modules without further design work
- Total LOC ~165 (storage 80 + useKonamiCode 60 + usePrefersReducedMotion 25)
</success_criteria>

<output>
After completion, create `.planning/phases/02-palette-system/02-02-SUMMARY.md` documenting:
- LOC for each of the 3 source files
- Test counts per file (12 + 11 + 4 = 27 tests)
- Confirmation that D-02 silent-fallback test (Test 13) passed with zero console output
- Note any deviation from RESEARCH.md skeletons (e.g., addEventListener cleanup pattern, useRef vs useState for progress tracking)
</output>
</content>
</invoke>