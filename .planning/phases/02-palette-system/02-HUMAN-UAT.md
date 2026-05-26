---
status: partial
phase: 02-palette-system
source: [02-VERIFICATION.md]
started: 2026-05-26T15:30:00Z
updated: 2026-05-26T15:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. FOUC absence on Slow 3G cold load
expected: Set localStorage `palette-v1` to `{kind:'preset',id:'ocean'}` via DevTools, throttle Network to Slow 3G, hard refresh /fr (or /en). First paint must render Ocean colors — no flash of Terra defaults visible. Repeat for nordic, bauhaus, and a custom palette saved via the Custom tab.
result: [pending]

### 2. Sheet keyboard navigation (focus trap + Esc + Tab cycle)
expected: Open Sheet via FAB click. Tab through tab triggers (Presets/Custom/Generate). Tab through preset cards. From the last focusable element, Tab loops back to the close button (no leak to page). Shift+Tab cycles backward. Esc closes the Sheet AND returns focus to the FAB.
result: [pending]

### 3. Konami full flow (real keystrokes + confetti + auto-open)
expected: Load /fr or /en with NO input focused (click body first). Type ↑↑↓↓←→←→BA. Result: (1) palette repaints to Vaporwave cyan/pink, (2) canvas-confetti burst from center-bottom for ~3s, (3) Sheet auto-slides in from right, (4) Vaporwave card visible as 5th preset and highlighted active. After closing and reopening the tab, Vaporwave persists and Vaporwave card stays visible (5 cards), but Sheet does NOT auto-open on cold reload.
result: [pending]

### 4. prefers-reduced-motion fade-only Konami fallback
expected: Enable `prefers-reduced-motion: reduce` (OS settings or DevTools Render → Emulate CSS media). Re-run Konami sequence. Result: palette still swaps to Vaporwave, Sheet still auto-opens — but NO confetti particles render. FAB hover acknowledges via opacity-only fade (no scale + no rotation).
result: [pending]

### 5. Konami filter — typing ↑↑↓↓←→←→BA inside an input does NOT trigger
expected: Open Custom tab. Click into the bg color input (or any <input>). Type the Konami sequence on the keyboard. NO confetti, NO palette change, NO Sheet auto-open. Click outside the input on the body. Type sequence again — full unlock fires.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
