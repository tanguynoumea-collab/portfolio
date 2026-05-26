---
phase: 02-palette-system
plan: 04
subsystem: theme
tags: [shadcn, sheet, radix-dialog, wcag, palette-presets, motion, i18n, oklch, d-04, d-06, d-11, d-15, theme-06, theme-09, pitfall-e]
dependency_graph:
  requires:
    - phase: 02-palette-system/00
      provides: "vitest infrastructure, jsdom env, React Testing Library, @testing-library/user-event, @/* alias, motion already installed"
    - phase: 02-palette-system/01
      provides: "lib/colors.ts (CRITICAL_PAIRS array, wcagContrast for worst-pair logic)"
    - phase: 02-palette-system/03
      provides: "components/providers/ThemeProvider.tsx (usePalette() context exposes palette, paletteId, isVaporwaveUnlocked, wasAdjustedForAA, setPreset, unlockVaporwave) + i18n keys palette.presets.<id> + palette.wcag.adjusted"
    - phase: 01-foundations
      provides: "lib/palettes.ts (PALETTES + PaletteId), app/globals.css with global 400ms color transition + shadcn alias chain, components/ui/button.tsx as Sheet dependency (skipped during install)"
  provides:
    - "components/ui/sheet.tsx: shadcn Sheet primitive (radix-ui Dialog under) — Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription (CLI-generated, no manual edits)"
    - "components/theme/WCAGBadge.tsx: live worst-pair WCAG ratio + AA/AAA/Fail status icon + Adjusted-for-AA chip (THEME-09 + D-06 + D-11)"
    - "components/theme/PalettePresets.tsx: 4/5 preset cards with motion select animation + D-15 filter (THEME-06)"
    - "app/globals.css: Pitfall E mitigation — scope-exclude rule for 5 Radix overlay data-slot selectors (sheet, dialog, popover) from the global 400ms color transition"
  affects:
    - "02-palette-system/05 (custom-harmonic-switcher — CustomColorPicker + HarmonicGenerator mount inside the Sheet that lands in the PaletteSwitcher shell; same WCAGBadge consumes their setCustomColor/setHarmonic outcomes)"
    - "02-palette-system/06 (fab-konami-integration — PaletteFab opens the Sheet on click and on Konami unlock; assembles WCAGBadge + PalettePresets + CustomColorPicker + HarmonicGenerator into the 3-tab Sheet UI)"
tech_stack:
  added: []  # Sheet primitive comes from existing radix-ui + tw-animate-css already installed in Phase 1
  patterns:
    - "shadcn add via CLI with input-skip discipline: existing components (button.tsx) declined for overwrite via stdin 'N' answers — only new files (sheet.tsx) emitted"
    - "Pitfall E mitigation by scoping (not removal): attribute selectors [data-slot='sheet-overlay'], ... appended AFTER the universal `* { transition: ... }` rule to override for matching elements only — wins specificity for those 5 selectors, all others retain the global 400ms color transition"
    - "Worst-pair WCAG heuristic via ratio/min normalization: handles 4.5 (text) vs 3.0 (UI) thresholds consistently — picks the pair with the smallest ratio/min score across the 7 CRITICAL_PAIRS"
    - "AAA classification only awarded when worst pair is text-class (min=4.5) AND ratio>=7 — WCAG 2.1 only grades AAA enhanced contrast for text, not UI component pairs"
    - "motion.button micro-animation pattern (whileHover scale 1.02 + whileTap scale 0.98) with 150ms ease-out for preset card feedback — atomic, no global timeline coordination needed"
    - "D-15 visibility filter via useMemo: PALETTES.filter((p) => p.id !== 'vaporwave') gated on !isVaporwaveUnlocked — re-renders only when unlock state flips, not on every palette change"
    - "i18n-first label sourcing: t('palette.presets.<id>') over palette.name — keeps lib/palettes.ts decoupled from display strings, allows future per-locale brand-name variations without touching lib"
    - "Accessibility wiring: role='radiogroup' with t('title') aria-label, role='radio' + aria-checked on each card, focus-visible ring matches active-state ring for keyboard parity"
key_files:
  created:
    - "components/ui/sheet.tsx (147 LOC — shadcn CLI-generated, no manual edits)"
    - "components/theme/WCAGBadge.tsx (99 LOC — live worst-pair WCAG display + Adjusted chip)"
    - "components/theme/WCAGBadge.test.tsx (134 LOC — 5 tests across 4 describe blocks)"
    - "components/theme/PalettePresets.tsx (111 LOC — 4/5 preset card grid with motion + D-15 filter)"
    - "components/theme/PalettePresets.test.tsx (137 LOC — 6 tests across 3 describe blocks)"
    - ".planning/phases/02-palette-system/02-04-sheet-presets-badge-SUMMARY.md (this file)"
  modified:
    - "app/globals.css (+24 lines — Pitfall E scope-exclude rule appended; original 400ms global transition preserved verbatim)"
key_decisions:
  - "Worst-pair WCAG heuristic uses ratio/min normalization (not raw ratio - min margin) so 2.8/3.0 UI pair (score 0.93) ranks worse than 4.3/4.5 text pair (score 0.96). Picks the pair closest-to-or-furthest-below its required minimum, regardless of which threshold class it belongs to. Locked in WCAGBadge.tsx useMemo. Alternative considered: raw margin — rejected because it would flag 4.3 text (margin -0.2) as equal-worst to 2.8 UI (margin -0.2) even though the UI pair is proportionally further from passing."
  - "AAA classification gated on (worstRatio >= 7) AND (worstMin === 4.5). WCAG 2.1 only grades AAA enhanced contrast for text pairs (4.5:1 base); UI components cap at AA enhanced (no AAA tier). If the worst pair is an accent-on-bg pair (min=3.0), AAA cannot be reached even at ratio 9 — the display is AA. This matches the WCAG spec letter; alternative of awarding AAA across all 7 pairs at ratio>=7 would be misleading on palettes where the worst pair is a UI pair."
  - "Pitfall E mitigation by ADDING a scope-exclude rule, NOT removing the global 400ms transition. The original `* { transition: color 400ms ease, background-color 400ms ease, border-color 400ms ease; }` rule is preserved verbatim and continues to drive palette swap animations across every non-overlay element. The 5 overlay selectors win specificity for matching elements only — Sheet/Dialog/Popover content + overlay get opacity 200ms + transform 250ms instead. Net effect: palette swap still smooth everywhere; overlay open/close no longer rubbery."
  - "PalettePresets uses motion.button (not <button> with conditional className) for the hover/tap micro-animation. Single-element motion is leaner than the alternative (useState toggle + transition-transform CSS) and gives whileHover/whileTap semantics out of the box. NOT gated on prefers-reduced-motion at this layer because the FAB (Plan 06) hosts the global PaletteFab motion gate; per-card 2% scale is small enough that disabling it would feel arbitrary. If user feedback requires gating, wrap in useReducedMotion from motion/react in a follow-up."
  - "Card label sourced from t('palette.presets.<id>'), NOT palette.name. Honors D-15: the .name field in lib/palettes.ts is a defensive fallback never displayed in practice (i18n is the only display source). Allows future per-locale brand-name variations (e.g., 'Terra & Sage' EN vs 'Terra et Sauge' FR) without touching lib/palettes.ts; vaporwave's '???' name stays in lib as fallback but Wave 3+ never reads it (i18n key resolves to 'Vaporwave' in both locales post-Plan 03)."
  - "shadcn add CLI accepted via 'N' overwrite responses for the button.tsx prompt (only file collision). sheet.tsx is the sole new emission. Verified post-install: button.tsx not modified (shadcn 'Skipped 1 file' message confirms). Aligns with the existing 7 shadcn primitives' style (radix-ui umbrella import, cn() helper, data-slot attributes)."
metrics:
  duration: "4m 54s"
  started: "2026-05-26T11:54:50Z"
  completed: "2026-05-26T11:59:44Z"
  tasks: 3
  files_created: 5
  files_modified: 1
  commits: 3
  tests: "11 new (5 WCAGBadge + 6 PalettePresets); 82 total Phase 2 suite (was 71)"
  loc: 628
requirements_completed: [THEME-06, THEME-09]
---

# Phase 2 Plan 04: Sheet + Presets + Badge Summary

**Wave 3a UI primitives shipped: shadcn Sheet installed via CLI (the 8th primitive joining button/card/dialog/popover/slider/switch/tabs), WCAGBadge live-displays the worst-pair WCAG ratio with AA/AAA/Fail status icon plus the Adjusted-for-AA chip when wasAdjustedForAA fires, PalettePresets renders the D-15-filtered 4/5 preset grid with motion select animation. Pitfall E mitigated by scoping the global 400ms color transition AWAY from 5 Radix overlay data-slot selectors (sheet/dialog/popover content + overlays) — original rule preserved, palette swaps still animate smoothly everywhere else. 11 new integration tests green; 82/82 total Phase 2 suite; build + lint exit 0. Plan 05 (CustomColorPicker + HarmonicGenerator) and Plan 06 (PaletteFab + PaletteSwitcher Sheet shell + Konami integration) now have all UI primitives + sticky-footer badge needed to compose the final PaletteSwitcher.**

## Performance

- **Duration:** 4m 54s
- **Started:** 2026-05-26T11:54:50Z
- **Completed:** 2026-05-26T11:59:44Z
- **Tasks:** 3 (Sheet install + Pitfall E → WCAGBadge + tests → PalettePresets + tests)
- **Files created:** 5 (sheet.tsx CLI, WCAGBadge.tsx + test, PalettePresets.tsx + test, this summary)
- **Files modified:** 1 (app/globals.css — 24 lines appended)
- **Commits:** 3 atomic + 1 metadata pending
- **Tests:** 11 new (5 WCAGBadge + 6 PalettePresets), 82 total Phase 2 suite (was 71 before this plan)
- **LOC:** 628 (357 implementation + 271 tests; counts include the 147-LOC CLI-generated sheet.tsx)

## Accomplishments

- **shadcn Sheet primitive installed (D-04).** `components/ui/sheet.tsx` via `npx shadcn@latest add sheet` — 147 LOC, exports `Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription` plus internal `SheetOverlay` + `SheetPortal` used inside `SheetContent`. Right-anchored default (`side="right"`), backdrop dimmer (`bg-black/10` + `supports-backdrop-filter:backdrop-blur-xs`), tw-animate-css `data-open:slide-in-from-right-10` slide animation. Wraps `radix-ui` umbrella `Dialog` primitive — same accessibility surface as the existing dialog.tsx (focus trap, Esc-to-close, aria-modal).
- **Pitfall E mitigation shipped.** `app/globals.css` appended a scope-exclude rule for `[data-slot='sheet-overlay'], [data-slot='sheet-content'], [data-slot='dialog-overlay'], [data-slot='dialog-content'], [data-slot='popover-content']` declaring `transition: opacity 200ms ease, transform 250ms ease;` — wins specificity over the universal `* { transition: ... 400ms ease; }` for those 5 selectors only. Original 400ms global rule preserved verbatim; every non-overlay element continues to animate palette swaps smoothly. Sheet open/close now uses its own tw-animate-css transitions (~150-250ms feel) without the global rule fighting it.
- **THEME-09 (WCAGBadge) delivered.** `components/theme/WCAGBadge.tsx` is a Client Component that reads `usePalette()`, iterates all 7 `CRITICAL_PAIRS`, computes the worst-pair ratio via `ratio/min` normalization (handles 4.5-text vs 3.0-UI thresholds consistently), classifies as AAA (worst pair text-class AND ratio>=7) / AA (>=min) / Fail (<min), renders Lucide CheckCheck/Check/X icon with `.toFixed(2)` ratio and i18n status label. Conditionally renders the `t('palette.wcag.adjusted')` chip when `wasAdjustedForAA` is true (D-06 + D-11). `role="status"` + `aria-live="polite"` so screen readers announce ratio changes on palette swap.
- **THEME-06 (PalettePresets) delivered.** `components/theme/PalettePresets.tsx` is a Client Component grid of `motion.button` cards — each with 4 mini swatches (bg/surface/accent/secondary inline-styled via OKLCh) and an i18n label. D-15 visibility filter via `useMemo`: 4 cards when `!isVaporwaveUnlocked`, 5 cards when unlocked. Active card visualized via `aria-checked` + `ring-2 ring-primary ring-offset-2`. `whileHover` scale 1.02 + `whileTap` scale 0.98 micro-animation (150ms ease-out). Label sourced from `t('palette.presets.<id>')` (NOT `palette.name`) — i18n is the only display source per D-15. Click dispatches `setPreset(p.id)` which the ThemeProvider reducer routes to the CSS-var writer effect.
- **D-15 + D-06 + D-11 wiring verified end-to-end via tests.** PalettePresets test #1 asserts 4 cards when Vaporwave NOT unlocked; test #2 asserts 5 cards after `unlockVaporwave()` dispatch. WCAGBadge test #3 asserts no chip when `wasAdjustedForAA=false`; test #4 asserts chip appears after an adversarial mid-grey custom palette triggers `applyMatrixAdjust`. PalettePresets test #6 asserts clicking a card mutates `--color-accent` on `document.documentElement` (the full reducer → effect → DOM mutation chain).

## Verified shadcn Sheet exports (from CLI output)

```ts
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
```

Internal (used inside `SheetContent` but not exported): `SheetOverlay`, `SheetPortal`. Plan 06 PaletteSwitcher shell can rely on `SheetContent` rendering its own overlay + portal automatically — no manual mount needed.

## Pitfall E mitigation — 5 CSS selectors

```css
[data-slot='sheet-overlay'],
[data-slot='sheet-content'],
[data-slot='dialog-overlay'],
[data-slot='dialog-content'],
[data-slot='popover-content'] {
  transition:
    opacity 200ms ease,
    transform 250ms ease;
}
```

Covers all 3 Radix overlay-class primitives (Sheet, Dialog, Popover) used in the project. NOT covered: Tabs, Switch, Slider — those are inline interactive widgets, not overlay surfaces, and DO benefit from the global 400ms color transition (button hover state crossfades, etc.).

## Worst-pair heuristic decision

WCAGBadge picks the worst pair via `ratio / min` normalized score (smaller = worse):

| Pair                  | Ratio | Min | Margin (ratio-min) | Score (ratio/min) |
|-----------------------|-------|-----|--------------------|-------------------|
| text/bg (text)        | 4.3   | 4.5 | -0.2               | 0.96              |
| accent/bg (UI)        | 2.8   | 3.0 | -0.2               | 0.93              |

Raw margin would rank these tied at -0.2; ratio/min normalization correctly identifies the UI pair as proportionally further from passing. The badge displays `worstRatio.toFixed(2)` (2.8 in the example) and Fail status. The user sees the actual failing number, not the margin.

**AAA gating:** awarded only when `worstRatio >= 7 AND worstMin === 4.5`. WCAG 2.1 only grades AAA enhanced contrast for text pairs (4.5:1 → 7:1); UI components (3.0:1 base) have no AAA tier. If the worst pair is an accent-on-bg pair (min=3.0), AAA cannot be reached even at ratio 9 — the display shows AA. Avoids misleading users into thinking their accent is "AAA-grade" when WCAG 2.1 makes no such claim.

## Task Commits

1. **Task 1 — Sheet install + Pitfall E mitigation** (`c8b8c8b`, feat) — `npx shadcn@latest add sheet` with stdin 'N' replies to decline button.tsx overwrite (sheet.tsx is the only new emission). Appended 24-line scope-exclude CSS block to app/globals.css after the global 400ms transition. Verified: file exists, contains SheetContent + SheetOverlay function definitions, globals.css contains the literal `data-slot='sheet-overlay'` AND the original `color 400ms ease` rule. Build + lint green.
2. **Task 2 — WCAGBadge component + 5 tests** (`3af6a6d`, feat) — 99-LOC Client Component reading `usePalette()`, computing worst-pair ratio across 7 CRITICAL_PAIRS via ratio/min normalization, rendering ratio.toFixed(2) + AA/AAA/Fail status icon. Conditional Adjusted-for-AA chip on wasAdjustedForAA. 5 tests across 4 describe blocks (numeric formatting, status labels, chip visibility, live ratio update). Fixed one ESLint unused-variable warning (`worstMin` destructured but only used inside the useMemo — removed from return).
3. **Task 3 — PalettePresets component + 6 tests** (`ecfc27b`, feat) — 111-LOC Client Component grid of motion.button preset cards with 4 mini swatches each and i18n labels. D-15 filter via useMemo. Active indicator via aria-checked + ring-2. 6 tests across 3 describe blocks (visibility, label sourcing, active indicator + click dispatch + CSS-var mutation).

**Plan metadata commit:** pending (this SUMMARY + STATE + ROADMAP + REQUIREMENTS update).

## Files Created/Modified

- `components/ui/sheet.tsx` — 147 LOC, CLI-generated by `npx shadcn@latest add sheet`. NO manual edits per plan requirement. Standard shadcn shape: `'use client'` line 1, radix-ui umbrella `Dialog as SheetPrimitive` import, `cn()` from `@/lib/utils`, `data-slot` attributes throughout, named-function exports.
- `components/theme/WCAGBadge.tsx` — 99 LOC, Client Component ('use client' line 1). Imports `Check, CheckCheck, X` from `lucide-react`, `useTranslations` from `next-intl` (namespace 'palette.wcag'), `useMemo` from `react`, `usePalette` from `@/components/providers/ThemeProvider`, `CRITICAL_PAIRS, wcagContrast` from `@/lib/colors`, `cn` from `@/lib/utils`. Zero `any` annotations.
- `components/theme/WCAGBadge.test.tsx` — 134 LOC, 5 tests across 4 describe blocks. Uses `NextIntlClientProvider` wrapping `ThemeProvider` for full context propagation. Adversarial mid-grey palette (`bg: 'oklch(0.5 0 0)'`) drives the Adjusted-for-AA chip test — verified to trigger `applyMatrixAdjust` in the reducer path.
- `components/theme/PalettePresets.tsx` — 111 LOC, Client Component ('use client' line 1). Imports `motion` from `motion/react` (NOT framer-motion), `useTranslations` from `next-intl` (namespace 'palette'), `useMemo`, `usePalette`, `PALETTES, type PaletteId` from `@/lib/palettes`, `cn`. Zero `any` annotations.
- `components/theme/PalettePresets.test.tsx` — 137 LOC, 6 tests across 3 describe blocks. Uses `userEvent.setup()` for the click-dispatch + CSS-var-mutation test (more realistic than `fireEvent` for motion.button which has its own event handling). Verifies all 4 i18n label keys resolve via `screen.getByLabelText(frMessages.palette.presets.<id>)`.
- `app/globals.css` — modified. Appended 24 lines after the existing global 400ms transition: comment block explaining the Pitfall E mitigation rationale + 5-selector attribute-selector rule with `transition: opacity 200ms ease, transform 250ms ease;`. Original `* { transition: color 400ms ease, background-color 400ms ease, border-color 400ms ease; }` rule preserved verbatim.

## Decisions Made

1. **Worst-pair heuristic via ratio/min normalization** — WCAGBadge.tsx useMemo picks the pair with the smallest `ratio / min` score across the 7 CRITICAL_PAIRS. Normalizes the 4.5 (text) vs 3.0 (UI) thresholds consistently. Alternative (raw `ratio - min` margin) would tie a 4.3/4.5 text pair with a 2.8/3.0 UI pair (both -0.2 margin) — misleading because the UI pair is proportionally further from passing. The normalized score (0.96 vs 0.93) correctly ranks them.

2. **AAA gating: worstRatio >= 7 AND worstMin === 4.5** — Only text pairs (min=4.5) can score AAA per WCAG 2.1 (4.5 → 7 enhanced threshold). UI pairs (min=3.0) have no AAA tier in the spec. If the worst pair is accent-on-bg (min=3.0), AAA cannot be reached regardless of ratio. Display shows AA in that case. Alternative (award AAA across all 7 pairs at ratio>=7) was rejected as spec-misleading.

3. **Pitfall E by scoping, NOT removal** — Appended a 5-selector scope-exclude rule AFTER the existing global `* { transition: color/bg/border 400ms ease }` rule. Attribute selectors win specificity over the universal `*` for matching elements only. Original rule preserved verbatim — palette swap continues to animate smoothly on every non-overlay element. Sheet/Dialog/Popover content + overlays get opacity 200ms + transform 250ms instead, matching shadcn's intended ~150-250ms feel. Alternative (replace the global rule with a more specific selector) was rejected because it would require auditing every existing component for palette-swap behavior and is structurally fragile (future shadcn primitive additions would need re-audit).

4. **motion.button for PalettePresets cards** — Used `<motion.button>` with `whileHover` + `whileTap` over `<button>` + `useState` toggle + transition-transform CSS. Leaner single-element motion, declarative semantics, gives all gesture handling out of the box. NOT gated on `prefers-reduced-motion` at this component layer — the global FAB motion gate (Plan 06 PaletteFab) is the centralization point; per-card 2% scale is small enough that not-gating doesn't feel intrusive. If user feedback requires gating, wrap in `useReducedMotion` from `motion/react`.

5. **D-15 label sourcing: t() over palette.name** — `t(\`presets.${p.id}\`)` is the only display source. `palette.name` in `lib/palettes.ts` remains as defensive fallback never read by Wave 3+ components. Honors D-15 + decouples lib/palettes.ts from display strings + allows future per-locale brand-name variation without touching lib. Vaporwave's `.name: '???'` stays as a sentinel; i18n key `palette.presets.vaporwave: 'Vaporwave'` (set in Plan 03) is the only string shown post-unlock.

6. **shadcn CLI install discipline: stdin 'N' decline for existing files** — `npx shadcn@latest add sheet` interactively prompted to overwrite `button.tsx` (Sheet's local dependency for the close button). Replied 'N' to keep the existing button.tsx untouched. Only `sheet.tsx` was emitted. CLI confirmed: "Skipped 1 file" message + post-install `git status` showed only sheet.tsx as new and globals.css as modified — button.tsx unchanged.

7. **WCAGBadge ESLint unused-variable fix** — Initial useMemo returned `{ worstRatio, worstMin, status }` but `worstMin` was only used inside the useMemo for the AAA classification gate. Lint flagged it (no-unused-vars warning). Resolved by removing `worstMin` from the returned object — it remains a local `let` inside the useMemo for the AAA check, just not exported. Tests still pass identically; behavior unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Lint warning] WCAGBadge unused variable `worstMin`**

- **Found during:** Task 2 verification (`npm run lint` after initial WCAGBadge implementation)
- **Issue:** Plan-authored useMemo returned `{ worstRatio, worstMin, status }` but `worstMin` was only consumed inside the useMemo for the AAA classification check — never used externally. ESLint emitted `@typescript-eslint/no-unused-vars` warning. Plan success_criteria requires zero warnings.
- **Fix:** Removed `worstMin` from the useMemo return statement. The variable still exists as a `let worstMin = 4.5` local inside the useMemo for the AAA gate (`worstRatio >= 7 && worstMin === 4.5`). External consumers only need `worstRatio` and `status`. One-line change.
- **Files modified:** `components/theme/WCAGBadge.tsx`
- **Verification:** `npm run lint` exits 0 with no output, all 5 WCAGBadge tests still pass.
- **Committed in:** `3af6a6d` (Task 2 commit — the fix was applied before commit, single commit)

### No architectural deviations (Rule 4)

No new tables, no schema changes, no library swaps. The CLI overwrite-skip behavior was the expected install path (existing button.tsx must not be modified per shadcn convention). The Pitfall E mitigation is the prescribed RESEARCH.md approach (lines 793-805). The WCAGBadge worst-pair heuristic uses the plan's suggested ratio/min normalization without modification.

---

**Total deviations:** 1 auto-fixed (Rule 1 — lint warning).
**Impact on plan:** None. The fix was internal to WCAGBadge.tsx and did not change the public surface or test expectations. All other tasks executed exactly as written.

## Authentication gates

None — pure local component + CSS + i18n work. No external services, no auth flows.

## Known Stubs

None — every export has a working implementation under integration test coverage. WCAGBadge reads the live palette and renders the live ratio; PalettePresets renders cards from the live PALETTES array filtered by the live unlock state; Sheet primitive is shadcn-canonical and fully wired to the existing shadcn alias chain. No fields wired to empty arrays or placeholder values.

## How downstream plans consume this

| Plan | Wave | Consumes from this plan |
|------|------|-------------------------|
| 02-05-custom-harmonic-switcher | 3 | CustomColorPicker + HarmonicGenerator mount inside the Sheet shell that Plan 06 assembles. Both components dispatch via `usePalette()` (setCustomColor / setHarmonic) and the resulting `wasAdjustedForAA` flag drives the WCAGBadge "Adjusted for AA" chip — wired end-to-end through THIS plan's reducer + chip already shipped. The Pitfall E scope-exclude rule ensures the CustomColorPicker popover (if any) and HarmonicGenerator preview do not fight the global 400ms transition. |
| 02-06-fab-konami-integration | 4 | PaletteFab opens the Sheet via `<Sheet>`/`<SheetTrigger>` from THIS plan's `components/ui/sheet.tsx`. PaletteSwitcher shell assembles `<SheetContent>` with `<Tabs>` + `<PalettePresets>` + `<CustomColorPicker>` + `<HarmonicGenerator>` + sticky-footer `<WCAGBadge>`. The D-14 Konami unlock sequence flips `isVaporwaveUnlocked` true → PalettePresets re-renders with 5 cards (verified by THIS plan's test #2). |

All Wave 3+ consumers import the Sheet primitives via `@/components/ui/sheet` and the theme components via `@/components/theme/{WCAGBadge,PalettePresets}`. No internal state to plumb through props — both theme components self-subscribe to `usePalette()`.

## API surface for Wave 3+

```tsx
// components/ui/sheet.tsx exports (147 LOC, CLI-generated)
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
// Usage:
//   <Sheet open={open} onOpenChange={setOpen}>
//     <SheetTrigger asChild><PaletteFab /></SheetTrigger>
//     <SheetContent side="right" className="flex flex-col gap-0 p-0 md:max-w-[420px]">
//       <SheetHeader><SheetTitle>{t('title')}</SheetTitle></SheetHeader>
//       <Tabs>...PalettePresets / CustomColorPicker / HarmonicGenerator...</Tabs>
//       <div className="border-t p-4"><WCAGBadge /></div>  {/* sticky footer */}
//     </SheetContent>
//   </Sheet>

// components/theme/WCAGBadge.tsx
export function WCAGBadge(): JSX.Element;
// Zero props. Self-subscribes to usePalette(). Designed for sticky-footer mount.

// components/theme/PalettePresets.tsx
export function PalettePresets(): JSX.Element;
// Zero props. Self-subscribes to usePalette(). Renders 4 or 5 cards per D-15.
```

## Performance characteristics

- WCAGBadge render: 7 wcagContrast calls per palette change (~0.7ms total via culori). useMemo memoizes on `palette` identity so a SET_PRESET dispatch causes one recompute, not seven.
- PalettePresets render: 4 (or 5) motion.button mounts on first paint. Subsequent palette changes only re-render the cards whose `isActive` flag flipped (motion preserves the rest via key={p.id}). The useMemo on visiblePalettes only re-runs when `isVaporwaveUnlocked` flips.
- Sheet open/close: now governed by tw-animate-css `data-open:slide-in-from-right-10` + `data-open:fade-in-0` keyframes (~150-250ms), no longer fighting the global 400ms color transition.
- Pitfall E rule: zero runtime cost — pure CSS specificity override, evaluated once per element-class match by the browser.

## Confirmation: live update on palette change works

Verified by test WCAGBadge #4 ("numeric ratio re-computes when palette changes"):
- Initial render → Terra default → captures the worst-pair ratio.
- `act(() => screen.getByTestId('set-bad-custom').click())` dispatches setCustomColor with adversarial mid-grey bg.
- Re-render → reducer routes through applyMatrixAdjust → new tokens flow into state.palette → WCAGBadge useMemo re-runs with the new palette identity → renders the new ratio.
- Test asserts the two captured ratios differ. PASS.

Verified by test PalettePresets #6 ("clicking a card mutates --color-accent on document.documentElement"):
- Initial render → Terra default → `--color-accent` is Terra's accent (or unset if FOUC script hasn't run in test env).
- `user.click(screen.getByLabelText('Ocean Studio'))` dispatches setPreset('ocean').
- Reducer → CSS-var writer effect → `document.documentElement.style.setProperty('--color-accent', ocean.accent)`.
- Test asserts `document.documentElement.style.getPropertyValue('--color-accent') === ocean.accent`. PASS.

The full chain (UI click → context dispatch → reducer → effect → DOM mutation → CSS var read) is exercised end-to-end.

## Self-Check: PASSED

**Files exist (6/6):**
- FOUND: components/ui/sheet.tsx (147 LOC, CLI-generated)
- FOUND: components/theme/WCAGBadge.tsx (99 LOC)
- FOUND: components/theme/WCAGBadge.test.tsx (134 LOC, 5 tests)
- FOUND: components/theme/PalettePresets.tsx (111 LOC)
- FOUND: components/theme/PalettePresets.test.tsx (137 LOC, 6 tests)
- FOUND: .planning/phases/02-palette-system/02-04-sheet-presets-badge-SUMMARY.md (this file)

**Files modified (1/1):**
- FOUND modified: app/globals.css (24 lines appended for Pitfall E mitigation; original global 400ms transition preserved)

**Commits exist (3/3):**
- FOUND: c8b8c8b (feat(02-04): install shadcn Sheet (D-04) + scope global 400ms transition (Pitfall E))
- FOUND: 3af6a6d (feat(02-04): add WCAGBadge component + 5 tests (THEME-09 + D-06 + D-11))
- FOUND: ecfc27b (feat(02-04): add PalettePresets component + 6 tests (THEME-06 + D-15))

**Verifications green (5/5):**
- `npx vitest run components/theme/WCAGBadge.test.tsx components/theme/PalettePresets.test.tsx` → 11/11 tests passing (exit 0)
- `npx vitest run` → 82/82 tests passing (exit 0, full Phase 2 suite)
- `npm run lint` → no output, exit 0
- `npm run build` → exit 0 (Sheet primitive + Pitfall E + 2 new client components compile cleanly under Next 16 Turbopack)
- `npx tsc --noEmit -p tsconfig.json` → no output, exit 0 (zero `any` annotations, strict mode honored)

All Wave 3a success criteria satisfied. THEME-06 + THEME-09 delivered. Plan 05 + Plan 06 now have all UI primitives + sticky-footer badge needed to compose the final PaletteSwitcher.

---

*Phase: 02-palette-system*
*Plan: 04 (sheet-presets-badge, Wave 3a)*
*Completed: 2026-05-26*
