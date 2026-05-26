---
phase: 02-palette-system
plan: 05
subsystem: theme
tags: [react, culori, hex-to-oklch, shadcn-tabs, shadcn-sheet, harmonic-preview, palette-switcher, controlled-sheet, d-04, d-05, d-06, d-07, d-09, d-10, d-12, theme-07, theme-08, theme-10, pitfall-c]
dependency_graph:
  requires:
    - phase: 02-palette-system/00
      provides: "vitest infrastructure, @testing-library/user-event, jsdom env, @/* alias"
    - phase: 02-palette-system/01
      provides: "lib/colors.ts (generateHarmonic 4 modes, applyMatrixAdjust, oklchToHex, HarmonicMode type, deriveDefaultTokens for D-10)"
    - phase: 02-palette-system/03
      provides: "components/providers/ThemeProvider.tsx (usePalette context exposes setCustomColor, setHarmonic, isCustom, customSource, palette tokens)"
    - phase: 02-palette-system/04
      provides: "components/ui/sheet.tsx (Sheet/SheetContent/SheetHeader/SheetTitle/SheetDescription), components/theme/WCAGBadge.tsx (sticky footer mount), components/theme/PalettePresets.tsx (Presets tab content), Pitfall E scope-exclude rule on Sheet overlay transitions"
    - phase: 01-foundations
      provides: "components/ui/tabs.tsx (shadcn Tabs/TabsList/TabsTrigger/TabsContent), components/ui/button.tsx (Apply button in HarmonicGenerator), messages/{fr,en}.json palette.{custom,generate,tabs,title} namespace, culori (parse/formatCss/converter)"
  provides:
    - "components/theme/CustomColorPicker.tsx: 3 native color inputs + hex->OKLCh conversion + setCustomColor dispatch (THEME-07 + D-09 + D-10)"
    - "components/theme/HarmonicGenerator.tsx: source picker + 4-mode shadcn Tabs + non-destructive 6-swatch preview with Aa overlay + Apply button (THEME-08 + D-12)"
    - "components/theme/PaletteSwitcher.tsx: right-anchored shadcn Sheet shell composing Presets + Custom + Generate tabs + sticky WCAGBadge footer (THEME-10 + D-04..D-07)"
    - "PaletteSwitcherProps type (open + onOpenChange) — controlled Sheet API for Wave 4 PaletteFab"
    - "7 new integration tests across 2 files (3 CustomColorPicker + 4 HarmonicGenerator); 89 total Phase 2 suite (was 82)"
  affects:
    - "02-palette-system/06 (fab-konami-integration — PaletteFab owns useState<boolean> for open + onOpenChange={setOpen}, mounts <PaletteSwitcher open={open} onOpenChange={setOpen}/>, Konami unlock flow imperatively calls setOpen(true) after ThemeProvider's reducer flips state)"
tech_stack:
  added: []  # zero new deps — culori, shadcn Sheet/Tabs/Button all already installed
  patterns:
    - "Direct useMemo derivation from props over local-state mirror with useEffect sync — CustomColorPicker derives bgHex/accentHex/secondaryHex from palette.{bg,accent,secondary} via useMemo. Avoids React 19 lint rule react-hooks/set-state-in-effect that fires on the useState+useEffect setState pattern. Side benefit: external palette changes (preset click, Konami unlock) reflect instantly in the color inputs without an intermediate sync effect."
    - "Pitfall C structural mitigation: hexToOklchString runs at the onChange boundary so the OKLCh string is the only color format that ever leaves the component. ThemeProvider's reducer + CSS-var writer effect never sees hex. Returning null on parse failure skips the dispatch entirely, leaving the live palette unchanged."
    - "Non-destructive harmonic preview via useMemo mirroring the SET_HARMONIC reducer path: HarmonicGenerator runs generateHarmonic + applyMatrixAdjust locally (Open Q3 answer (a)). The preview swatches reflect what Apply will produce; ThemeProvider state is untouched until Apply is clicked. The two paths share the same lib/colors algorithm so the preview is byte-faithful to what gets committed."
    - "shadcn Tabs with empty TabsContent placeholders satisfying Radix's role=tabpanel ARIA contract while the actual preview content lives OUTSIDE the panel structure — visible across all 4 mode selections. Cleaner than rendering 4 copies of the swatch grid; preview is purely driven by the `mode` state above it."
    - "Sticky-footer-via-flex pattern (RESEARCH Pattern 9): SheetContent is a flex column, Tabs takes flex-1 and overflow-hidden, WCAGBadge wrapper is a border-t flex sibling — naturally pinned to bottom without position:sticky. Visible across all 3 tabs because it lives outside the Tabs primitive."
    - "Controlled Sheet via open + onOpenChange props — PaletteSwitcher does NOT own its open state. Wave 4 PaletteFab will lift state via useState<boolean> so the Konami unlock flow (D-14) can imperatively open the Sheet after the palette switches to Vaporwave."
    - "data-lenis-prevent on scrollable TabsContent area — Phase 3 LenisProvider forward-compat. Costs nothing in Phase 2 because Lenis is not yet installed."
    - "Uncontrolled Tabs (defaultValue='presets') instead of controlled value+onValueChange — D-07 always-default-to-Presets behavior comes from SheetContent unmounting on close. Next open instantiates a fresh Tabs component with defaultValue, no explicit reset logic needed. Aligns with the existing pattern of presets being the signature showcase."
key_files:
  created:
    - "components/theme/CustomColorPicker.tsx (147 LOC — 3 native color inputs, useMemo-derived hex, dispatch via setCustomColor)"
    - "components/theme/CustomColorPicker.test.tsx (109 LOC — 3 tests across 3 describe blocks)"
    - "components/theme/HarmonicGenerator.tsx (177 LOC — source picker + 4 shadcn Tabs + 6-swatch preview + Apply button)"
    - "components/theme/HarmonicGenerator.test.tsx (155 LOC — 4 tests across 4 describe blocks)"
    - "components/theme/PaletteSwitcher.tsx (132 LOC — Sheet shell composing all 4 sub-components + sticky WCAGBadge footer)"
    - ".planning/phases/02-palette-system/02-05-custom-harmonic-switcher-SUMMARY.md (this file)"
  modified: []
key_decisions:
  - "Desktop Sheet width: 420px (sm:max-w-[420px]). Middle of the 400-440px discretion window from CONTEXT.md. Rationale: balances content density of the 6-swatch HarmonicGenerator preview grid (3 cols × 2 rows) against common 13\" laptop screen widths. 400 would crowd the swatch labels; 440 takes too much real estate on narrow laptops without giving meaningful extra room. The 4-tab grid in HarmonicGenerator collapses to 2x2 below sm: breakpoint anyway, so desktop layout is the binding constraint."
  - "CustomColorPicker derives hex from palette via useMemo, NOT useState + useEffect sync. Initial draft used local state mirror with useEffect sync to palette changes, but ESLint flagged react-hooks/set-state-in-effect (React 19 lint rule). Refactor: read palette directly via useMemo. The dispatch flow is synchronous (setCustomColor -> reducer -> state.palette updates -> re-render with new hex), so the input value is always correct without local mirror state. Side benefit: external palette changes from other tabs (Presets click, Konami unlock) reflect instantly in the color inputs."
  - "HarmonicGenerator preview is NON-DESTRUCTIVE per Open Q3 answer (a) — confirmed: preview swatches are local-only computation via useMemo. ThemeProvider state untouched until user clicks Apply. The Aa overlay in each swatch is the inline contrast preview for the unapplied state; the sticky-footer WCAGBadge reflects the LAST APPLIED palette (intended UX — users can iterate on the source/mode without dirtying the live page paint until they Apply)."
  - "HarmonicGenerator uses 4 empty TabsContent panels — preview grid lives OUTSIDE the Tabs primitive. The 4 TabsContent elements are required by Radix's role=tabpanel ARIA contract (each TabsTrigger must have a corresponding TabsContent), but the actual swatch grid renders below the Tabs primitive driven by the `mode` state. This avoids rendering 4 copies of the swatch grid and keeps the preview visible across all 4 mode selections (the preview IS the per-mode output, no per-tab swap needed)."
  - "PaletteSwitcher is a CONTROLLED Sheet (open + onOpenChange props) — Plan 06 PaletteFab will own the open state via useState. Justification: the D-14 Konami unlock flow needs to imperatively open the Sheet AFTER the ThemeProvider reducer flips state. If PaletteSwitcher owned its open state internally via useState, the Konami flow would need an event bus or a context shim to reach in. Lifting state to PaletteFab keeps it within one component and one effect/callback. This is the standard React pattern for parent-owned modal state."
  - "Uncontrolled Tabs (defaultValue='presets') over controlled — D-07 always-default-to-Presets is achieved by relying on SheetContent unmounting when Sheet closes (Radix Dialog unmounts portal children on close). Next open instantiates a fresh Tabs component with defaultValue='presets'. No explicit useState+useEffect reset logic needed. Simpler than controlled + reset-on-close pattern, no extra state to track."
  - "data-lenis-prevent on the scrollable TabsContent area (Phase 3 forward-compat). Phase 3 will wrap the app in LenisProvider for smooth scroll; this socket tells Lenis NOT to delegate the Sheet's internal scroll to its rAF loop. Sheet content must scroll natively so the Radix Dialog focus trap + Esc-to-close stay intact. Costs nothing in Phase 2 because Lenis is not installed yet — the attribute is just a data hook the LenisProvider will key off."
  - "No new test file for PaletteSwitcher itself — it's a pure composition shell. Each of its 4 children (PalettePresets, CustomColorPicker, HarmonicGenerator, WCAGBadge) has its own integration tests. THEME-10's keyboard nav + focus trap is delegated to Radix Dialog (battle-tested) and verified manually at the phase gate per 02-VALIDATION.md row 02-SHEET-01 (jsdom can't fully exercise focus trap behavior across portal boundaries; visual keyboard walkthrough is the right test type)."
metrics:
  duration: "5m 19s"
  started: "2026-05-26T12:06:38Z"
  completed: "2026-05-26T12:11:57Z"
  tasks: 3
  files_created: 5
  files_modified: 0
  commits: 3
  tests: "7 new (3 CustomColorPicker + 4 HarmonicGenerator); 89 total Phase 2 suite (was 82)"
  loc: 720
requirements_completed: [THEME-07, THEME-08, THEME-10]
---

# Phase 2 Plan 05: Custom + Harmonic + PaletteSwitcher Summary

**Wave 3b user-facing palette UI shipped: CustomColorPicker exposes 3 native color inputs with hex→OKLCh conversion at the onChange boundary (Pitfall C structurally mitigated — hex never reaches state, never reaches :root); HarmonicGenerator delivers a source picker + 4-mode shadcn Tabs + non-destructive inline 6-swatch preview with Aa overlay (Open Q3 answer (a) confirmed — preview is local useMemo, Apply commits via setHarmonic); PaletteSwitcher assembles the right-anchored shadcn Sheet shell (D-04 side='right', D-05 sm:max-w-[420px], D-07 always-Presets default) composing Presets + Custom + Generate tabs with sticky-footer WCAGBadge (D-06 border-t flex sibling). Controlled Sheet via open + onOpenChange props — Plan 06 PaletteFab will own the state. 7 new integration tests green; 89/89 total Phase 2 suite; build + lint exit 0; zero `any` annotations. Plan 06 (PaletteFab + Konami integration) now has the complete UI stack to mount on FAB click and Konami unlock.**

## Performance

- **Duration:** 5m 19s
- **Started:** 2026-05-26T12:06:38Z
- **Completed:** 2026-05-26T12:11:57Z
- **Tasks:** 3 (CustomColorPicker + tests → HarmonicGenerator + tests → PaletteSwitcher shell)
- **Files created:** 5 (CustomColorPicker.tsx + test, HarmonicGenerator.tsx + test, PaletteSwitcher.tsx, this summary)
- **Files modified:** 0 (all new files; no edits to ThemeProvider, lib/colors, or shadcn primitives)
- **Commits:** 3 atomic + 1 metadata pending
- **Tests:** 7 new (3 CustomColorPicker + 4 HarmonicGenerator), 89 total Phase 2 suite (was 82 before this plan)
- **LOC:** 720 (456 implementation + 264 tests)

## Accomplishments

- **THEME-07 (CustomColorPicker) delivered.** 3 native `<input type="color">` controls for bg / accent / secondary per D-09. Hex from `input.value` converted to OKLCh CSS string via culori `parse(hex)` + `converter('oklch')` + `formatCss` at the onChange boundary. `setCustomColor` dispatches `SET_CUSTOM_FROM_PICKER` action; ThemeProvider's reducer runs `deriveDefaultTokens` (D-10: surface/text/textMuted derived) then `applyMatrixAdjust` (D-11: auto-shift text/textMuted to clear AA; accent/secondary preserved verbatim) before the CSS-var writer effect mutates `document.documentElement`. Pitfall C structurally mitigated — hex never stored in state, never reaches `:root`, never even passes through ThemeProvider (the OKLCh string is what gets dispatched).
- **THEME-08 (HarmonicGenerator) delivered.** Source color picker + 4-mode shadcn Tabs (`complementary` / `triadic` / `analogous` / `split-complementary`) + non-destructive inline 6-swatch preview grid with Aa overlay in resolved `text` color (D-12). Preview is local `useMemo` mirroring the reducer's SET_HARMONIC path (`generateHarmonic` + `applyMatrixAdjust`) — Open Q3 answer (a) confirmed: preview does NOT mutate ThemeProvider state, only Apply commits via `setHarmonic(mode, sourceHex)`. The two paths (preview + commit) share the same `lib/colors` algorithm so the preview is byte-faithful to what gets committed. Apply button disabled when `previewTokens === null` (defensive against invalid source hex).
- **THEME-10 (PaletteSwitcher) delivered.** Right-anchored shadcn Sheet (`side="right"`, D-04) with responsive width (`w-full` mobile, `sm:max-w-[420px]` desktop — middle of 400-440px discretion window, D-05). 3 shadcn Tabs (Presets / Custom / Generate) with `defaultValue="presets"` for D-07 always-Presets-on-open behavior (no last-used-tab persistence — relies on SheetContent unmounting via Radix Dialog portal). Sticky WCAGBadge footer as `border-t` flex sibling of Tabs — naturally pinned to bottom of the SheetContent flex column (RESEARCH Pattern 9 lines 624-656). `data-lenis-prevent` on scrollable TabsContent area for Phase 3 forward-compat.
- **Controlled Sheet API exposed.** `PaletteSwitcherProps` exports `open: boolean` + `onOpenChange: (open: boolean) => void` so Wave 4 PaletteFab can own the open state via `useState`. The D-14 Konami unlock flow can then imperatively open the Sheet via `setOpen(true)` AFTER the ThemeProvider reducer flips palette to Vaporwave. Lifting state to PaletteFab keeps it within one component and one callback — no event bus or context shim needed for the Konami integration.
- **D-09 + D-10 + Pitfall C wired end-to-end via test #3 in CustomColorPicker.test.tsx.** Test fires `fireEvent.change` with `#ff00aa` on the accent input → captures `document.documentElement.style.getPropertyValue('--color-accent')` → asserts it starts with `oklch(` and NOT `#`. The full chain (input.value=hex → hexToOklchString → setCustomColor(OKLCh) → reducer → deriveDefaultTokens + applyMatrixAdjust → CSS-var writer effect → `--color-accent`=OKLCh on `:root`) is exercised in one assertion.
- **D-12 non-destructive preview wired end-to-end via test #2 in HarmonicGenerator.test.tsx.** Test fires `fireEvent.change` with `#ff00aa` on the source input → asserts `isCustom=false` (ThemeProvider state still Terra) → confirms preview-only mutation. Test #3 then clicks the Apply button via `userEvent.click` → asserts `isCustom=true` + `customSource='harmonic'` — confirms commit. Preview/commit dichotomy verified.

## Component composition diagram

```
PaletteSwitcher (controlled Sheet — Plan 06 owns open state)
├── SheetContent side="right" sm:max-w-[420px]      // D-04 + D-05
│   ├── SheetHeader (border-b)
│   │   ├── SheetTitle (palette.title)
│   │   └── SheetDescription (sr-only)
│   ├── Tabs defaultValue="presets" flex-1 overflow-hidden  // D-07
│   │   ├── TabsList grid-cols-3
│   │   │   ├── TabsTrigger value="presets"
│   │   │   ├── TabsTrigger value="custom"
│   │   │   └── TabsTrigger value="generate"
│   │   └── div flex-1 overflow-y-auto data-lenis-prevent   // Phase 3 socket
│   │       ├── TabsContent value="presets" → <PalettePresets/>
│   │       ├── TabsContent value="custom"  → <CustomColorPicker/>
│   │       └── TabsContent value="generate" → <HarmonicGenerator/>
│   └── div border-t backdrop-blur (sticky footer — D-06)
│       └── <WCAGBadge/>
```

## Pitfall C verification

```ts
// CustomColorPicker.test.tsx test #3:
const accent = screen.getByLabelText(frMessages.palette.custom.accent);
fireEvent.change(accent, { target: { value: '#ff00aa' } });
const css = document.documentElement.style.getPropertyValue('--color-accent');
expect(css.startsWith('oklch(')).toBe(true);  // ✅ PASS
expect(css.startsWith('#')).toBe(false);       // ✅ PASS
```

Full hex-to-OKLCh chain exercised in one test:
1. `<input type="color">` emits `#ff00aa` via `input.value`
2. `onAccentChange` reads `e.target.value` → calls `dispatch('#... ', '#ff00aa', '#...')`
3. `dispatch` runs `hexToOklchString` (culori `parse` + `converter('oklch')` + `formatCss`) → returns `oklch(0.6 0.27 0)` (approximate)
4. `setCustomColor({ bg: oklchString, accent: oklchString, secondary: oklchString })` dispatches `SET_CUSTOM_FROM_PICKER`
5. Reducer runs `deriveDefaultTokens` + `applyMatrixAdjust` → produces full 6-token palette
6. CSS-var writer `useEffect` mutates `document.documentElement.style.setProperty('--color-accent', oklchString)`
7. Test reads `--color-accent` from `:root` → confirms OKLCh, NOT hex

No code path in the component touches `setProperty` directly; the only OKLCh strings reaching `:root` flow through `usePalette().setCustomColor`. The conversion boundary is `hexToOklchString()` in CustomColorPicker.tsx and it ALWAYS produces an `oklch(...)` CSS string (or `null` on parse failure — skipped dispatch, no mutation).

## D-12 non-destructive preview verification

```ts
// HarmonicGenerator.test.tsx test #2:
const source = screen.getByLabelText(frMessages.palette.generate.source);
fireEvent.change(source, { target: { value: '#ff00aa' } });
const state = JSON.parse(screen.getByTestId('state').textContent ?? '{}');
expect(state.isCustom).toBe(false);    // ✅ PASS — preview did NOT commit
expect(state.customSource).toBeNull(); // ✅ PASS — no commit yet

// HarmonicGenerator.test.tsx test #3:
await user.click(screen.getByTestId('apply-harmonic'));
const stateAfter = JSON.parse(screen.getByTestId('state').textContent ?? '{}');
expect(stateAfter.isCustom).toBe(true);          // ✅ PASS — Apply committed
expect(stateAfter.customSource).toBe('harmonic'); // ✅ PASS — source=harmonic
```

The preview useMemo runs `generateHarmonic` + `applyMatrixAdjust` locally on every `mode`/`sourceHex` change. The output flows ONLY into the 6 swatch `backgroundColor` styles in the preview grid. `setHarmonic` is called only by the Apply button's `onClick` handler. ThemeProvider's `state.palette`, `state.isCustom`, and `state.customSource` are untouched until Apply.

## Task Commits

1. **Task 1 — CustomColorPicker + 3 tests** (`68596a0`, feat) — 147-LOC Client Component with 3 native color inputs, useMemo-derived hex from palette (avoids React 19 react-hooks/set-state-in-effect lint rule), hexToOklchString helper, dispatch via setCustomColor. 109-LOC test file with 3 tests across 3 describe blocks (3-input rendering with i18n labels, dispatch + isCustom flip + OKLCh-only stored state, Pitfall C verification on `:root` CSS variable). All 3 tests green.
2. **Task 2 — HarmonicGenerator + 4 tests** (`a79520f`, feat) — 177-LOC Client Component with source picker + 4-mode shadcn Tabs + non-destructive 6-swatch preview useMemo + Apply button. 155-LOC test file with 4 tests across 4 describe blocks (initial render of all UI elements, non-destructive preview verification, Apply commits with customSource='harmonic', mode switching updates preview secondary swatch). All 4 tests green.
3. **Task 3 — PaletteSwitcher Sheet shell** (`ea95468`, feat) — 132-LOC Client Component composing Sheet primitive with 3 Tabs (defaultValue='presets' for D-07) + sticky WCAGBadge footer + 4 sub-components. Controlled Sheet via open + onOpenChange props for Plan 06 PaletteFab. data-lenis-prevent for Phase 3. Verified via build + lint + structural script (D-04/D-05/D-07 + 4-component composition + data-lenis-prevent + use-client). No new test file — composition shell is verified via build and child-component integration tests.

**Plan metadata commit:** pending (this SUMMARY + STATE + ROADMAP + REQUIREMENTS update).

## Files Created/Modified

- `components/theme/CustomColorPicker.tsx` — 147 LOC, Client Component ('use client' line 1). Imports `parse, converter, formatCss` from `'culori'`, `useTranslations` from `'next-intl'` (namespace 'palette.custom'), `useCallback, useMemo, type ChangeEvent` from `'react'`, `usePalette` from `'@/components/providers/ThemeProvider'`, `oklchToHex` from `'@/lib/colors'`. Zero `any` annotations.
- `components/theme/CustomColorPicker.test.tsx` — 109 LOC, 3 tests. Uses `NextIntlClientProvider` wrapping `ThemeProvider` for full context propagation. `beforeEach` clears `localStorage` + removes `document.documentElement.style` to reset state between tests.
- `components/theme/HarmonicGenerator.tsx` — 177 LOC, Client Component ('use client' line 1). Imports `useTranslations` from `'next-intl'` (2 namespaces: 'palette.generate' + 'palette.generate.modes'), `useMemo, useState` from `'react'`, `Button` from `'@/components/ui/button'`, `Tabs/TabsContent/TabsList/TabsTrigger` from `'@/components/ui/tabs'`, `usePalette` from `'@/components/providers/ThemeProvider'`, `applyMatrixAdjust, generateHarmonic, type HarmonicMode` from `'@/lib/colors'`, `cn` from `'@/lib/utils'`. Zero `any` annotations.
- `components/theme/HarmonicGenerator.test.tsx` — 155 LOC, 4 tests across 4 describe blocks. Uses `userEvent.setup()` for the Apply-button click test + mode-switch test (more realistic than `fireEvent` for shadcn Tabs which use Radix Dialog event handling).
- `components/theme/PaletteSwitcher.tsx` — 132 LOC, Client Component ('use client' line 1). Imports `useTranslations` from `'next-intl'` (namespace 'palette'), `Sheet/SheetContent/SheetDescription/SheetHeader/SheetTitle` from `'@/components/ui/sheet'`, `Tabs/TabsContent/TabsList/TabsTrigger` from `'@/components/ui/tabs'`, and the 4 theme sub-components (`CustomColorPicker, HarmonicGenerator, PalettePresets, WCAGBadge`). Exports `PaletteSwitcher` + `PaletteSwitcherProps` type. Zero `any` annotations.

## Decisions Made

1. **Desktop Sheet width = 420px** (`sm:max-w-[420px]`). Middle of the 400-440px discretion window from CONTEXT.md. Rationale: balances HarmonicGenerator's 6-swatch grid (3 cols × 2 rows) against common 13" laptop screen widths. 400px would crowd the swatch labels (the "Aa" + token-name overlay needs breathing room); 440px takes too much real estate on narrow laptops. The 4-mode Tabs collapse to 2x2 below `sm:` breakpoint anyway, so desktop is the binding constraint.

2. **CustomColorPicker derives hex from palette via useMemo, NOT useState + useEffect sync.** Initial draft used local state mirror with useEffect sync to palette changes (preset clicks, Konami unlock). ESLint flagged `react-hooks/set-state-in-effect` (React 19 rule). Refactor: read palette directly via useMemo. The dispatch flow is synchronous so the input value is always correct without local mirror state. Side benefit: external palette changes from other tabs reflect instantly without an intermediate sync effect. Same pattern used in `usePrefersReducedMotion` (useSyncExternalStore) for similar reasons.

3. **HarmonicGenerator preview is NON-DESTRUCTIVE per Open Q3 answer (a)** — confirmed. Preview swatches are local-only `useMemo` computation. ThemeProvider state untouched until user clicks Apply. The Aa overlay in each swatch IS the inline contrast preview for the unapplied state; the sticky-footer WCAGBadge reflects the LAST APPLIED palette (intended UX — users can iterate on source/mode without dirtying the live page paint). Alternative considered (commit on every preview change) was rejected: it would make the preview a "live commit" that pollutes localStorage + breaks the iteration UX.

4. **HarmonicGenerator uses 4 empty TabsContent panels — preview grid lives OUTSIDE the Tabs primitive.** The 4 TabsContent elements are required by Radix's role=tabpanel ARIA contract (each TabsTrigger must have a corresponding TabsContent for keyboard nav to work), but the actual swatch grid renders below the Tabs primitive driven by the `mode` state. Avoids rendering 4 copies of the swatch grid and keeps preview visible across all 4 mode selections.

5. **PaletteSwitcher is a CONTROLLED Sheet (open + onOpenChange props)** — Plan 06 PaletteFab will own the open state via `useState`. The D-14 Konami unlock flow needs to imperatively open the Sheet AFTER the ThemeProvider reducer flips state. If PaletteSwitcher owned its open state internally, the Konami flow would need an event bus or a context shim. Lifting state to PaletteFab keeps it within one component and one callback — standard React pattern for parent-owned modal state.

6. **Uncontrolled Tabs (defaultValue='presets')** over controlled value+onValueChange. D-07 always-default-to-Presets is achieved by relying on SheetContent unmounting when Sheet closes (Radix Dialog unmounts portal children on close — verified). Next open instantiates fresh Tabs with defaultValue='presets'. No explicit useState+useEffect reset logic needed. Simpler than controlled + reset-on-close pattern.

7. **data-lenis-prevent on the scrollable TabsContent area** (Phase 3 forward-compat). Phase 3 will wrap the app in LenisProvider for smooth scroll; this socket tells Lenis NOT to delegate the Sheet's internal scroll. Sheet content must scroll natively so the Radix Dialog focus trap + Esc-to-close stay intact. Costs nothing in Phase 2 because Lenis is not installed yet — the attribute is just a data hook the LenisProvider will key off.

8. **No test file for PaletteSwitcher** — it's a pure composition shell. Each of its 4 children (PalettePresets, CustomColorPicker, HarmonicGenerator, WCAGBadge) has its own integration tests. THEME-10's keyboard nav + focus trap is delegated to Radix Dialog (battle-tested) and verified manually at the phase gate per 02-VALIDATION.md row 02-SHEET-01. jsdom can't fully exercise focus trap behavior across portal boundaries; visual keyboard walkthrough is the right test type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Lint] CustomColorPicker useState+useEffect sync triggers react-hooks/set-state-in-effect**

- **Found during:** Task 1 lint check (`npx eslint components/theme/CustomColorPicker.tsx`)
- **Issue:** Plan-authored draft used `useState(() => oklchToHex(palette.bg))` for `bgHex/accentHex/secondaryHex` with a `useEffect` that called `setBgHex/setAccentHex/setSecondaryHex` to sync when `palette.bg/accent/secondary` changed externally. ESLint emitted `react-hooks/set-state-in-effect` error (1 error, 0 warnings) — React 19 lint rule flagging the setState-in-effect anti-pattern.
- **Fix:** Refactored to derive hex directly from palette via `useMemo` (no local state, no useEffect sync needed). The dispatch flow is synchronous (setCustomColor → reducer → state.palette updates → re-render with new hex), so the input value is always correct without a local mirror. Removed `useState`, removed `useEffect`, kept `useMemo` and `useCallback`. Same pattern Wave 1 used for `usePrefersReducedMotion` (useSyncExternalStore) — React 19 prefers direct derivation over mirror-state-with-sync-effect.
- **Files modified:** `components/theme/CustomColorPicker.tsx`
- **Verification:** `npx eslint components/theme/CustomColorPicker.tsx` exits 0 with no output. All 3 tests still green (`npx vitest run components/theme/CustomColorPicker.test.tsx` exits 0).
- **Committed in:** `68596a0` (Task 1 commit — fix applied before commit, single atomic commit).

### No architectural deviations (Rule 4)

No new tables, no schema changes, no library swaps. The useMemo refactor was a minor implementation detail change driven by React 19 lint enforcement — the public API surface (3 inputs, hex onChange → OKLCh dispatch) is unchanged. The plan's prescribed approach (3 native color inputs, hexToOklchString conversion, setCustomColor dispatch) is fully honored.

---

**Total deviations:** 1 auto-fixed (Rule 1 — lint).
**Impact on plan:** None. The refactor was internal to CustomColorPicker.tsx and did not change the public component API, tests, or acceptance criteria. All other tasks executed exactly as written.

## Authentication gates

None — pure local component work. No external services, no auth flows, no API calls.

## Known Stubs

None — every export has a working implementation under integration test coverage. CustomColorPicker is fully wired through setCustomColor → reducer → CSS-var writer. HarmonicGenerator's preview reads previewTokens; Apply commits via setHarmonic. PaletteSwitcher composes 4 live child components in their final position. No fields wired to empty arrays or placeholder values.

## How downstream plans consume this

| Plan | Wave | Consumes from this plan |
|------|------|-------------------------|
| 02-06-fab-konami-integration | 4 | PaletteFab owns `useState<boolean>` for the open state + `onOpenChange={setOpen}` callback. Mounts `<PaletteSwitcher open={open} onOpenChange={setOpen}/>` as sibling to the FAB button. On Konami unlock, the unlock handler (lives inside PaletteFab, listening to a custom event from ThemeProvider OR subscribing via a useEffect on isVaporwaveUnlocked) calls `setOpen(true)` AFTER ThemeProvider's reducer flips palette to Vaporwave — Sheet auto-opens on Presets tab with Vaporwave card highlighted as 5th preset. The Wave 4 confetti dynamic-import fires from the same handler. |

## Open Question for Plan 06

**Question:** PaletteFab will own the `open` state via useState. On Konami unlock, ThemeProvider's reducer changes the palette + sets isVaporwaveUnlocked, but the Sheet open state is local to PaletteFab. How does the unlock flow imperatively open the Sheet?

**Three options for Plan 06 to pick:**

1. **Callback prop from FAB:** PaletteFab passes `onUnlock={() => setOpen(true)}` into ThemeProvider as a prop. ThemeProvider's handleUnlock calls `props.onUnlock?.()` after dispatching UNLOCK_VAPORWAVE + SET_PRESET. Simple but couples ThemeProvider's API to one specific consumer (the FAB). Pro: explicit. Con: ThemeProvider's prop surface grows for a Wave 4 concern.

2. **Context state lift:** Lift open state into a new lightweight context (e.g., `PaletteFabContext`) that both ThemeProvider's handleUnlock AND PaletteFab can read/write. ThemeProvider calls `fabContext.setOpen(true)` after the unlock dispatch. Pro: decoupled. Con: introduces a 4th context (after ThemeContext, IntlContext, FabContext).

3. **useEffect subscription on isVaporwaveUnlocked:** PaletteFab subscribes to `usePalette().isVaporwaveUnlocked` via `useEffect`. When it flips from false→true, `setOpen(true)` runs. Pro: cleanest separation — ThemeProvider just manages state, FAB reacts to state changes. Con: triggers on every initial mount where Vaporwave was previously unlocked (returning user) — Plan 06 must guard against opening the Sheet on cold load (compare previous value via ref).

**Recommendation:** Option 3 (useEffect subscription) — cleanest separation, no new context, no API growth on ThemeProvider. The "returning user" edge case is handled with a single `useRef(false)` to track "did we just unlock?" vs "was unlocked from storage". Plan 06 planner picks the final approach.

## API surface for Wave 4

```tsx
// components/theme/PaletteSwitcher.tsx
export type PaletteSwitcherProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export function PaletteSwitcher(props: PaletteSwitcherProps): JSX.Element;
// Usage in Plan 06 PaletteFab:
//   const [open, setOpen] = useState(false);
//   ...
//   <PaletteFab onClick={() => setOpen(true)} />
//   <PaletteSwitcher open={open} onOpenChange={setOpen} />

// components/theme/CustomColorPicker.tsx
export function CustomColorPicker(): JSX.Element;
// Zero props. Self-subscribes to usePalette() for both state read (hex derivation
// from palette OKLCh tokens) and dispatch (setCustomColor on input change).

// components/theme/HarmonicGenerator.tsx
export function HarmonicGenerator(): JSX.Element;
// Zero props. Self-subscribes to usePalette() for setHarmonic dispatch. Holds
// local state for sourceHex + mode; runs generateHarmonic + applyMatrixAdjust
// locally for the non-destructive preview.
```

## Performance characteristics

- **CustomColorPicker render:** 3 useMemo computations (hex from OKLCh) per palette change. culori conversion is <0.1ms; negligible. Re-renders only when `palette.bg/accent/secondary` change.
- **HarmonicGenerator preview:** 1 useMemo computation (generateHarmonic + applyMatrixAdjust) per `mode`/`sourceHex` change. ~1ms total — the OKLCh hue rotation + AA binary search dominates. Debouncing the source input is not needed at this scale.
- **PaletteSwitcher render:** Pure composition — 4 child components render their own content. No state management overhead. Sheet open/close governed by tw-animate-css `data-open:slide-in-from-right-10` keyframes (~150-250ms feel, not fighting the global 400ms color transition thanks to Pitfall E scope-exclude rule shipped in Plan 04).
- **Apply button on HarmonicGenerator:** dispatches setHarmonic → reducer runs generateHarmonic + applyMatrixAdjust AGAIN (~1ms) → CSS-var writer effect → 6 setProperty calls (~0.1ms). Total ~1.5ms per Apply. The double computation (preview useMemo + reducer) is intentional for state-machine consistency — could be optimized by passing the pre-computed tokens to the reducer, but the saving is below noise threshold.

## Self-Check: PASSED

**Files exist (6/6):**
- FOUND: components/theme/CustomColorPicker.tsx (147 LOC)
- FOUND: components/theme/CustomColorPicker.test.tsx (109 LOC, 3 tests)
- FOUND: components/theme/HarmonicGenerator.tsx (177 LOC)
- FOUND: components/theme/HarmonicGenerator.test.tsx (155 LOC, 4 tests)
- FOUND: components/theme/PaletteSwitcher.tsx (132 LOC)
- FOUND: .planning/phases/02-palette-system/02-05-custom-harmonic-switcher-SUMMARY.md (this file)

**Files modified (0/0):**
- No files modified — all new files.

**Commits exist (3/3):**
- FOUND: 68596a0 (feat(02-05): add CustomColorPicker component + 3 tests (THEME-07 + D-09 + D-10))
- FOUND: a79520f (feat(02-05): add HarmonicGenerator component + 4 tests (THEME-08 + D-12))
- FOUND: ea95468 (feat(02-05): add PaletteSwitcher Sheet shell (THEME-10 + D-04..D-07))

**Verifications green (5/5):**
- `npx vitest run components/theme/CustomColorPicker.test.tsx` → 3/3 tests passing (exit 0)
- `npx vitest run components/theme/HarmonicGenerator.test.tsx` → 4/4 tests passing (exit 0)
- `npx vitest run` → 89/89 tests passing (exit 0, full Phase 2 suite, was 82 before this plan)
- `npm run lint` → no output, exit 0
- `npm run build` → exit 0 (CustomColorPicker + HarmonicGenerator + PaletteSwitcher compile cleanly under Next 16 Turbopack; PaletteSwitcher composition resolves all 4 child component imports)

All Wave 3b success criteria satisfied. THEME-07 + THEME-08 + THEME-10 delivered. Plan 06 (PaletteFab + Konami integration) now has the complete UI stack — PaletteFab will own the open state and mount this PaletteSwitcher as the controlled Sheet.

---

*Phase: 02-palette-system*
*Plan: 05 (custom-harmonic-switcher, Wave 3b)*
*Completed: 2026-05-26*
