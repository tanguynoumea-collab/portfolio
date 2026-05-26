# Phase 2: Palette System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 02-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 02-palette-system
**Areas discussed:** Persistence & FOUC shape, PaletteSwitcher form factor, Custom + Harmonic UX (incl. WCAG auto-adjust), Konami unlock UX

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Persistence & FOUC shape | What's stored in localStorage, schema versioning, recovery from corruption, beforeInteractive script | ✓ |
| PaletteSwitcher form factor | Dialog vs Sheet, mobile width, WCAGBadge placement | ✓ |
| Custom + Harmonic UX (incl. WCAG auto-adjust) | HSL vs OKLCh inputs, derivation rules, silent vs warn-then-fix | ✓ |
| Konami unlock UX | Confetti, reveal pattern, persistence | ✓ |

**User's choice:** All four ("tout").

---

## Persistence & FOUC shape

### Q1 — Storage shape

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: id for presets, full OKLCh for custom | id-only storage for presets (~6 lines JSON) keeps presets forward-compat; custom palettes store all 6 tokens | ✓ |
| Always full OKLCh tokens | Even presets store full 6 OKLCh — script applies blindly, but freezes preset values for returning users | |
| Always just an id (presets only) + separate slot for custom | Three keys to keep in sync, racy on partial updates | |

**User's choice:** Hybrid (Recommended).
**Notes:** Discriminated payload `{kind:'preset',id} | {kind:'custom',tokens,source}`.

### Q2 — Recovery on corruption / schema mismatch

| Option | Description | Selected |
|--------|-------------|----------|
| Hard fallback to Terra default, silent | try/catch around JSON.parse; on any error, no-op (`:root` defaults render Terra). Storage left intact. | ✓ |
| Hard fallback to Terra + clear corrupted entry | Same but `removeItem('palette-v1')` on parse fail | |
| Schema-version field with migration hook | `schema:1` field + future migrators (placeholder now) | |

**User's choice:** Hard fallback, silent (Recommended).
**Notes:** No console.error, no toast. Matches PITFALLS.md Pitfall #1.

### Q3 — FOUC script preset lookup mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Inline lookup table built from lib/palettes.ts at build time | Server-render script with PALETTES as JS object literal (~600 bytes minified) | ✓ |
| Always persist full OKLCh tokens (no lookup needed) | Contradicts the Hybrid storage choice | |
| Static JSON file in /public/palettes.json | Async fetch is not viable for pre-hydration FOUC | |

**User's choice:** Inline lookup table at build time (Recommended).
**Notes:** Single source of truth (`lib/palettes.ts`). Byte-matches canonical values.

### Q4 — Konami unlock persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Persist (separate localStorage flag 'palette-secrets-v1') | Unlocked Vaporwave appears on every future visit; survives reloads | ✓ |
| Session-only (re-do every cold load) | Each refresh hides Vaporwave again — feels punishing for return visitors | |
| Persist + co-located in palette-v1 JSON | Same as persistent but tightens coupling | |

**User's choice:** Persist (separate flag) (Recommended).
**Notes:** Object shape `{vaporwave:true}` so future secrets scale.

---

## PaletteSwitcher form factor

### Q5 — Backing primitive

| Option | Description | Selected |
|--------|-------------|----------|
| Install shadcn Sheet now | Purpose-built side drawer with focus trap + Esc + overlay | ✓ |
| Reuse existing Dialog with right-anchored overrides | Re-implements what Sheet ships; less idiomatic | |
| Hand-rolled panel using motion + Radix Dialog primitives | Maximum control, but re-implements focus trap manually | |

**User's choice:** Install shadcn Sheet (Recommended).
**Notes:** `npx shadcn@latest add sheet`. side='right'.

### Q6 — Mobile sizing

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width sheet with backdrop dimmer | 100% width below md; 400-440px above md | ✓ |
| Always 90% width with visible page edge | Live preview visible always but cramped on small phones | |
| Bottom sheet on mobile, right sheet on desktop | Two animation paths + media-query branch | |

**User's choice:** Full-width + backdrop (Recommended).

### Q7 — WCAGBadge placement

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky footer of Sheet, always visible across all 3 tabs | ~40px strip; visible WCAG-awareness IS the signature | ✓ |
| Per-tab — only Custom & Generate (presets are pre-validated) | Inconsistent visual anchor | |
| Floating chip at top-right of Sheet header | Compact but less prominent | |

**User's choice:** Sticky footer across all tabs (Recommended).
**Notes:** "Adjusted for AA" chip lives in same footer area.

### Q8 — Tab default on open

| Option | Description | Selected |
|--------|-------------|----------|
| Always Presets on open | Predictable entry, signature preset showcase first | ✓ |
| Last-used tab (persist in localStorage) | Better for tinkerers, one more key to manage | |
| Tab matches current palette state | Ambiguous when custom came from harmonic | |

**User's choice:** Always Presets (Recommended).

### Q9 — FAB icon motion

| Option | Description | Selected |
|--------|-------------|----------|
| Lucide palette icon + subtle motion hover | Scale + rotate on hover, cross-fade to X when open | ✓ |
| Hand-rolled animated SVG palette (paint blobs morphing) | Stronger brand statement, 80-120 LOC | |
| Static icon, no animation | Zero motion cost, misses personality opportunity | |

**User's choice:** Lucide + subtle motion (Recommended).
**Notes:** prefers-reduced-motion gates animations to opacity feedback only.

---

## Custom + Harmonic UX (incl. WCAG auto-adjust)

### Q10 — Custom picker input format

| Option | Description | Selected |
|--------|-------------|----------|
| Native `<input type="color">` (hex) + culori → OKLCh | OS-native picker, familiar UX, one-way conversion | ✓ |
| Three HSL sliders (H/S/L) per token — 9 sliders | Literal REQ interpretation; lossy roundtrip; overwhelming | |
| OKLCh sliders (L/C/H) per token — 9 sliders | Purist, no conversion loss; "0.155 chroma" is meaningless to most | |

**User's choice:** Native color picker + culori (Recommended).
**Notes:** Reframes REQ THEME-07's "HSL" as "visual color picker".

### Q11 — Token derivation when user sets only 3 of 6

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic from bg | surface = bg + L shift; text = pickTextOnAccent; textMuted = interp(text,bg,50%) clamped to 4.5:1 | ✓ |
| Inherit deltas from current preset | Breaks if customizing across light↔dark presets | |
| Expose all 6 inputs (drop the 3-inputs framing) | Contradicts REQ THEME-07; awkward UX | |

**User's choice:** Deterministic from bg (Recommended).

### Q12 — WCAG enforcement strategy on failing combos

| Option | Description | Selected |
|--------|-------------|----------|
| Silent auto-adjust + "Adjusted for AA" chip | adjustForAA runs invisibly; chip with hover tooltip notes the change | ✓ |
| Warn-then-fix with Adjust/Keep buttons | Respects user agency but lets the badge show Fail on a portfolio | |
| Auto-adjust everything quietly (no chip, no notice) | Hides the engineering — contradicts FEATURES.md positioning | |

**User's choice:** Silent auto-adjust + chip (Recommended).
**Notes:** Failing combos never reach `:root`. Chip in sticky footer (alongside the badge).

### Q13 — Harmonic preview UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline 6-swatch grid + 'Aa' samples inside Generate tab + WCAGBadge live | Contained, predictable, no commit-with-undo dance | ✓ |
| Full-page live preview while Generate tab is active + Apply/Cancel bar | Shows real impact but race conditions if Sheet closes uncommitted | |
| Side-by-side (source half / generated half) | Cramps panel, busy on mobile | |

**User's choice:** Inline 6-swatch grid (Recommended).
**Notes:** "Apply" commits to live `:root` + storage; Generate tab stays active.

---

## Konami unlock UX

### Q14 — Confetti implementation

| Option | Description | Selected |
|--------|-------------|----------|
| canvas-confetti package (lazy-loaded only when Konami fires) | ~4 KB gzip, battle-tested, dynamic-import = zero cold-load cost | ✓ |
| Hand-rolled with motion — 30 emoji/SVG dots falling | No dep, more control, ~80-120 LOC | |
| Pure CSS keyframe shower | Tiny footprint, GPU-accelerated, more mechanical | |

**User's choice:** canvas-confetti, lazy-loaded (Recommended).
**Notes:** Particle colors from Vaporwave.accent + Vaporwave.secondary.

### Q15 — Immediate behavior on Konami completion

| Option | Description | Selected |
|--------|-------------|----------|
| Confetti + auto-switch to Vaporwave + Sheet auto-opens on Presets | Maximum visual payoff, shows the new card location | ✓ |
| Confetti + Sheet auto-opens but stay on current palette + NEW badge on card | Respects agency, anticlimactic payoff | |
| Confetti + toast + FAB glow | Minimal disruption, missing magic moment, needs sonner dep | |

**User's choice:** Confetti + auto-switch + Sheet open (Recommended).

### Q16 — Vaporwave card label after unlock

| Option | Description | Selected |
|--------|-------------|----------|
| Real name 'Vaporwave' shown as 5th preset | Clean before/after; pre-unlock the card isn't rendered | ✓ |
| Stays as '???' even after unlock, clickable | Mystique preserved but confusing daily UX | |
| Real name + 'unlocked' badge icon | Extra icon work, busy card | |

**User's choice:** Real name "Vaporwave" (Recommended).
**Notes:** Requires updating `messages/{fr,en}.json` palette.presets.vaporwave from "???" to "Vaporwave".

### Q17 — useKonamiCode listener location

| Option | Description | Selected |
|--------|-------------|----------|
| Inside ThemeProvider — unlock state IS theme state | Single source of truth, no prop drilling | ✓ |
| Dedicated KonamiListener client component in layout | Separation of concerns but same code split across files | |
| Inside FAB component (only when FAB mounted) | Risk of missing the unlock if FAB not visible | |

**User's choice:** Inside ThemeProvider (Recommended).

---

## Claude's Discretion

Deferred to researcher/planner with enough signal to choose well:

- Exact `surface` L-shift amount (~3% starting point)
- `adjustForAA` internal algorithm (iterative L-shift binary search vs single-pass chroma reduction)
- Exact desktop Sheet width (400-440px range)
- Sheet open/close motion timing
- canvas-confetti parameter tuning (count, spread, gravity)
- `useKonamiCode` inter-keystroke timeout (~1-2s suggested for sequence reset)
- ThemeProvider position relative to `NextIntlClientProvider` (default: inside)
- Optional console.log flourish on Konami unlock
- prefers-reduced-motion fallback for confetti burst (suggest fade-only)

## Deferred Ideas

- `tw-animate-css` Sheet keyframes integration check
- Palette export/import (URL share, JSON download) — v2 (THEME-v2-01)
- Preview-before-application for Custom tab — v2 (THEME-v2-02)
- Audio cue on Konami unlock — explicit anti-pattern
- Additional harmonic modes beyond the 4 in THEME-03 — v2
- Last-used tab persistence — rejected (Q8)
- "Reset to active preset" button in Custom tab — possible cheap add, otherwise v2
- "Randomize source color" shortcut in Generate — v2
- ScrollTrigger.refresh() after palette swap — Phase 3 (LenisProvider integration); ThemeProvider exposes a palette-change hook
- Cookie-based SSR palette restore — v2 if SEO-bot-friendly palette serialization becomes valuable
- "NEW" badge on Vaporwave card after unlock — rejected (confetti + auto-switch is the discovery marker)
