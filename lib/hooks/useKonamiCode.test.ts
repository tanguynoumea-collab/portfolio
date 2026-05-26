/**
 * lib/hooks/useKonamiCode.test.ts — D-16 sequence detection + input filter.
 *
 * Sequence (e.code): ArrowUp×2, ArrowDown×2, ArrowLeft, ArrowRight,
 *                    ArrowLeft, ArrowRight, KeyB, KeyA  (10 keys total).
 *
 * 11 tests covering match / wrong-key / progress reset / inter-keystroke timeout
 * + the four "guard" cases (INPUT, TEXTAREA, contentEditable, open Radix dialog)
 * + listener cleanup on unmount.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKonamiCode } from './useKonamiCode';

const SEQUENCE = [
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

  it('progress resets after success — second sequence also fires (Test 16)', () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));
    pressAll(SEQUENCE);
    pressAll(SEQUENCE);
    expect(onUnlock).toHaveBeenCalledTimes(2);
  });

  it('wrong key resets progress; re-typing sequence works (Test 17)', () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));
    pressAll([SEQUENCE[0]!, SEQUENCE[1]!, 'Space']);
    pressAll(SEQUENCE);
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('wrong key matching SEQUENCE[0] starts new sequence (Test 18)', () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));
    // ArrowUp, ArrowUp, Space → mismatch on Space resets, but if next key
    // matched SEQUENCE[0] (ArrowUp) progress would jump to 1.
    // Here we exercise the Space-then-SEQUENCE-from-index-1 path: after Space
    // resets to 0, the very next ArrowUp (SEQUENCE[0]) advances to 1 (NOT 0),
    // and the remaining 9 keys complete the sequence.
    pressAll(['ArrowUp', 'ArrowUp', 'Space']);
    pressAll(SEQUENCE.slice(1));
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
