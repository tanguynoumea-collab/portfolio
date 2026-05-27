---
phase: 02-palette-system
verified: 2026-05-26T15:27:36Z
status: human_needed
score: 5/5 truths verified (automated); 5 manual browser checks pending
gaps:
  - truth: "REQUIREMENTS.md status table consistency"
    status: partial
    reason: "Implementation is complete (CustomColorPicker.tsx, HarmonicGenerator.tsx, PaletteSwitcher.tsx all exist, tests pass, build succeeds), but REQUIREMENTS.md still lists THEME-07, THEME-08, THEME-10 as `Pending` in both the v1 checklist (lines 30, 31, 33) and the Traceability table (lines 155, 156, 158). The phase 02 plan frontmatter declares these REQs satisfied, the SUMMARY confirms delivery, and the codebase reflects them — only the REQUIREMENTS.md document was not updated. Documentation-only gap; does NOT block goal achievement."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "Lines 30, 31, 33: `- [ ] **THEME-07**`, `- [ ] **THEME-08**`, `- [ ] **THEME-10**` should be `[x]`"
      - path: ".planning/REQUIREMENTS.md"
        issue: "Lines 155, 156, 158: traceability table rows for THEME-07/08/10 say `Pending` should say `Complete`"
    missing:
      - "Flip 6 status markers (3 checkboxes + 3 table rows) for THEME-07, THEME-08, THEME-10 in .planning/REQUIREMENTS.md"
human_verification:
  - test: "FOUC absence on Slow 3G cold load"
    expected: "Set localStorage `palette-v1` to `{kind:'preset',id:'ocean'}` via DevTools, throttle Network to Slow 3G, hard refresh /fr (or /en). First paint must render Ocean colors — no flash of Terra defaults visible. Repeat for nordic, bauhaus, and a custom palette saved via the Custom tab."
    why_human: "Inline `<Script beforeInteractive>` paint-timing cannot be reliably exercised in jsdom; real browser paint pipeline + network throttling required to confirm zero FOUC."
  - test: "Sheet keyboard navigation (focus trap + Esc + Tab cycle)"
    expected: "Open Sheet via FAB click. Tab through tab triggers (Presets/Custom/Generate). Tab through preset cards. From the last focusable element, Tab loops back to the close button (no leak to page). Shift+Tab cycles backward. Esc closes the Sheet AND returns focus to the FAB."
    why_human: "Radix Dialog focus-trap behavior across portal boundaries is not fully exercisable in jsdom; visual keyboard walkthrough is the right test per 02-VALIDATION.md row 02-SHEET-01."
  - test: "Konami full flow (real keystrokes + confetti + auto-open)"
    expected: "Load /fr or /en with NO input focused (click body first). Type ↑↑↓↓←→←→BA. Result: (1) palette repaints to Vaporwave cyan/pink, (2) canvas-confetti burst from center-bottom for ~3s, (3) Sheet auto-slides in from right, (4) Vaporwave card visible as 5th preset and highlighted active. After closing and reopening the tab, Vaporwave persists and Vaporwave card stays visible (5 cards), but Sheet does NOT auto-open on cold reload."
    why_human: "canvas-confetti paints to a real <canvas> element; jsdom does not implement getContext. Real browser environment + real keyboard events required."
  - test: "prefers-reduced-motion fade-only Konami fallback"
    expected: "Enable `prefers-reduced-motion: reduce` (OS settings or DevTools Render → Emulate CSS media). Re-run Konami sequence. Result: palette still swaps to Vaporwave, Sheet still auto-opens — but NO confetti particles render. FAB hover acknowledges via opacity-only fade (no scale + no rotation)."
    why_human: "OS-level media query emulation + visual confirmation that the kinetic burst is suppressed without breaking the unlock UX."
  - test: "Konami filter — typing ↑↑↓↓←→←→BA inside an input does NOT trigger"
    expected: "Open Custom tab. Click into the bg color input (or any <input>). Type the Konami sequence on the keyboard. NO confetti, NO palette change, NO Sheet auto-open. Click outside the input on the body. Type sequence again — full unlock fires."
    why_human: "Verifies the D-16 input/textarea/contentEditable filter in a realistic context where users might unwittingly trigger arrow-key navigation inside form controls."
---

# Phase 02 (Palette System) Verification Report

**Phase Goal (ROADMAP.md):** Ship the signature feature — a user can change the entire site palette live, see WCAG compliance in real time, and unlock a secret Vaporwave palette via Konami code, all without a flash on reload.

**Verified:** 2026-05-26T15:27:36Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Domain Summary

Phase 2 wires the signature palette switcher feature end-to-end across 7 plans (4 waves):

- **Wave 0 (test-infra)** ships Vitest 4.1.7 + RTL + jsdom + tsx + culori + canvas-confetti + motion + `scripts/validate-palettes.ts` (the 7-pair WCAG gate). Bauhaus.secondary L was adjusted 0.7→0.6 to clear AA at definition time.
- **Wave 1a (lib-colors)** ships `lib/colors.ts` with 8 pure functions (wcagContrast, adjustForAA, validateFullMatrix, generateHarmonic, pickTextOnAccent, deriveDefaultTokens, applyMatrixAdjust, oklchToHex) + CRITICAL_PAIRS readonly array + 3 type exports. 29 tests green via TDD.
- **Wave 1b (lib-storage-hooks)** ships `lib/storage.ts` (D-01 discriminated shape + D-02 silent fallback), `lib/hooks/useKonamiCode.ts` (D-16 e.code sequence + input/dialog filter), `lib/hooks/usePrefersReducedMotion.ts` (useSyncExternalStore SSR-safe). 27 tests green.
- **Wave 2 (theme-provider-fouc)** ships `components/providers/ThemeProvider.tsx` (useReducer + Context + CSS-var writer + persistence + Konami integration + fireConfetti dynamic import) + Server Component `PaletteFouCScript` (1000 bytes inline `<Script beforeInteractive>`, Vaporwave excluded per Pitfall A). Wires into `app/[locale]/layout.tsx` inside NextIntlClientProvider. i18n updated: palette.presets.vaporwave → 'Vaporwave', palette.wcag.adjusted added. 15 tests green.
- **Wave 3a (sheet-presets-badge)** installs shadcn Sheet (8th primitive), adds Pitfall E scope-exclude in globals.css for 5 Radix overlay selectors, ships `WCAGBadge` (live worst-pair ratio + AA/AAA/Fail + Adjusted-for-AA chip) and `PalettePresets` (D-15 filter + motion select). 11 tests green.
- **Wave 3b (custom-harmonic-switcher)** ships `CustomColorPicker` (3 native color inputs + hex→OKLCh conversion at boundary, Pitfall C structural), `HarmonicGenerator` (4-mode tabs + non-destructive 6-swatch inline preview + Apply commits), `PaletteSwitcher` (right-anchored Sheet + 3 tabs + sticky WCAGBadge footer, controlled open/onOpenChange API). 7 tests green.
- **Wave 4 (fab-konami-integration)** ships `PaletteFab` (fixed bottom-right, motion hover + open-state icon rotation + reduced-motion gate, owns Sheet open state, D-14 auto-open via vaporwaveUnlockNonce subscription using React 19 derive-during-render idiom). Extends ThemeProvider with the nonce counter + fireConfetti dynamic import + reduced-motion gate. Mounts in layout. 5 tests green.

**Test count progression:** 0 (W0) → 29 (W1a) → 56 (W1b) → 71 (W2) → 82 (W3a) → 89 (W3b) → **94 (W4)** across 10 test files. All green.

---

## Goal Achievement

### Observable Truths (5 ROADMAP success criteria + zero-FOUC)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can switch between the four visible presets (terra, nordic, bauhaus, ocean) from a FAB-triggered side panel and the entire site updates instantly | ✓ VERIFIED | `PaletteFab.tsx` mounts in layout (line 59), owns useState<boolean> for open, renders `<PaletteSwitcher open onOpenChange/>`. `PalettePresets.tsx` filters PALETTES via D-15 (4 cards pre-unlock). Click dispatches setPreset → reducer → CSS-var writer effect → 6 setProperty calls on documentElement. Global 400ms color transition animates the swap (verified in globals.css line 164). PalettePresets test #6 asserts the full chain end-to-end. |
| 2 | User can author a custom palette via 3 inputs OR generate one harmonically from a source color and one of four modes (complementary, triadic, analogous, split-complementary), with all 7 WCAG pairs auto-adjusted to AA | ✓ VERIFIED | `CustomColorPicker.tsx` (3 native `<input type="color">` for bg/accent/secondary, hex→OKLCh via culori parse + formatCss at onChange boundary, Pitfall C structurally enforced — test #3 asserts `--color-accent` is `oklch(...)` not hex). `HarmonicGenerator.tsx` (source picker + 4-mode Tabs in MODES const lines 52-57 = complementary, triadic, analogous, split-complementary, non-destructive 6-swatch preview useMemo, Apply commits via setHarmonic). ThemeProvider reducer routes both through `applyMatrixAdjust` from lib/colors.ts which structurally guarantees D-11 INVARIANT (accent + secondary never modified; only text + textMuted shift to hit 4.5:1). HUE_OFFSETS in lib/colors.ts line 243: complementary +180°, triadic +120°, analogous +30°, split-complementary +150°. |
| 3 | The WCAGBadge always displays the live ratio (numeric, 2 decimals) and status (AA / AAA / Fail with colored icon) for the active palette | ✓ VERIFIED | `WCAGBadge.tsx` reads usePalette(), iterates 7 CRITICAL_PAIRS via wcagContrast, picks worst pair via ratio/min normalization. Renders `worstRatio.toFixed(2)` (line 85) + status icon (CheckCheck for AAA, Check for AA, X for Fail, line 69) + i18n status label. `role="status"` + `aria-live="polite"` for screen reader live announcements. WCAGBadge test #4 asserts ratio re-computes on palette change. Mounted as sticky footer in PaletteSwitcher (line 125) — visible across all 3 tabs. |
| 4 | The chosen palette persists across reloads with zero FOUC on cold load | ✓ VERIFIED (automated) / ? human (Slow 3G visual) | `lib/storage.ts` writePaletteV1/writeSecretsV1 persist on every reducer change (ThemeProvider useEffect lines 314-326). `PaletteFouCScript.tsx` is a Server Component (no 'use client' — confirmed via grep) emitting `<Script id="palette-fouc" strategy="beforeInteractive">` (line 58). Inline script body is **exactly 1000 bytes** (measured via Node — within <1024 budget). Body reads `palette-v1`, dispatches kind:'preset'|kind:'custom', applies 6 --color-* via setProperty in a for loop before React hydrates. ThemeProvider's lazy initFromStorage rehydrates from same key for the React state. **Slow 3G visual confirmation routed to human verification.** |
| 5 | Entering the Konami sequence (when no input is focused) unlocks the Vaporwave palette with a confetti animation | ✓ VERIFIED (automated) / ? human (real keystrokes + visual confetti) | `lib/hooks/useKonamiCode.ts` listens window keydown for ↑↑↓↓←→←→BA via `e.code` (layout-independent, AZERTY-safe), filters INPUT/TEXTAREA/SELECT/contentEditable/`[role=dialog][data-state=open]`. ThemeProvider mounts hook via `useKonamiCode(handleUnlock)` (line 351). handleUnlock dispatches UNLOCK_VAPORWAVE (increments vaporwaveUnlockNonce + sets isVaporwaveUnlocked) → SET_PRESET('vaporwave') → `fireConfetti()` gated on `usePrefersReducedMotion()`. fireConfetti uses **dynamic import** `await import('canvas-confetti')` at line 233 (zero top-level import verified via grep). Confetti colors sourced from `oklchToHex(Vaporwave.accent + secondary)` for canvas-confetti's hex API. PaletteFab subscribes to nonce via React 19 derive-during-render idiom (lines 86-92) → setOpen(true) on increment. Test 4 in PaletteFab.test.tsx verifies the full D-14 auto-open trigger. **Real keystroke + confetti paint routed to human verification.** |

**Score:** 5/5 truths verified (automated layer). 5 items pending real-browser human UAT.

---

### Required Artifacts (12 + ThemeProvider context fields)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `vitest.config.ts` | jsdom env + @/* alias + include globs | ✓ VERIFIED | 22 lines — `environment: 'jsdom'`, `globals: true`, `@/*` alias, include `lib/**`, `components/**`, `scripts/**`, `css: false` |
| `scripts/validate-palettes.ts` | THEME-01 7-pair gate | ✓ VERIFIED | 60 LOC, inlines CRITICAL_PAIRS (7 pairs in canonical order), iterates PALETTES, prints pass/fail + ratios, exits non-zero on failure. `npm run test:palettes` exit 0; all 5 palettes pass. |
| `lib/colors.ts` | wcagContrast, adjustForAA, validateFullMatrix, generateHarmonic, deriveDefaultTokens, applyMatrixAdjust, pickTextOnAccent, oklchToHex, CRITICAL_PAIRS | ✓ VERIFIED | 375 LOC. All 10 exports present. 29 tests green. Binary-search adjustForAA with 20-iter cap + fallback. D-11 INVARIANT (accent/secondary never mutated) enforced in applyMatrixAdjust loop structure. |
| `lib/storage.ts` | readPaletteV1/writePaletteV1/readSecretsV1/writeSecretsV1 + D-01 + D-02 | ✓ VERIFIED | 127 LOC. Discriminated StoredPalette union (kind:'preset'/'custom'). isValidPaletteShape narrowing. 4 SSR guards + 4 empty-catch try/catch blocks. Test 13 asserts zero console output across all failure paths. |
| `lib/hooks/useKonamiCode.ts` | D-16 sequence + input/dialog filter + e.code | ✓ VERIFIED | 89 LOC. SEQUENCE const uses e.code (KeyB, KeyA, ArrowUp etc — AZERTY-safe). Filters INPUT/TEXTAREA/SELECT/contentEditable/open Radix dialog. resetMs 1500 default. useRef for progress (no re-renders per keystroke). |
| `lib/hooks/usePrefersReducedMotion.ts` | useSyncExternalStore wrapper | ✓ VERIFIED | 55 LOC. subscribe/getSnapshot/getServerSnapshot. SSR returns `false`. No setState-in-effect (lint clean). |
| `components/providers/ThemeProvider.tsx` | THEME-04 reducer + Context + CSS-var writer + persistence + Konami + vaporwaveUnlockNonce + fireConfetti | ✓ VERIFIED | 397 LOC. 4-action reducer (SET_PRESET / SET_CUSTOM_FROM_PICKER / SET_HARMONIC / UNLOCK_VAPORWAVE). Lazy initFromStorage. CSS-var writer effect mutates ONLY 6 --color-* (verified via grep). 2 persistence effects keyed on independent slices. handleUnlock D-14 sequence (UNLOCK_VAPORWAVE → SET_PRESET → fireConfetti gated on reducedMotion). Context value useMemo (Pitfall H) with stable useCallback action creators. |
| `components/theme/PaletteFouCScript.tsx` | THEME-05 Server Component <Script beforeInteractive> | ✓ VERIFIED | 63 LOC. **No 'use client'** directive (confirmed via grep). Imports `Script` from 'next/script' + `PALETTES`. Filters Vaporwave out (Pitfall A). Body inlined as template string with array-form palette table + split() CSS-var keys + single-ternary parsing logic. **Measured 1000 bytes** (within <1024 budget). eslint-disable-next-line for App-Router-aware Pages-Router-targeting rule. |
| `components/ui/sheet.tsx` | shadcn Sheet primitive (8th) | ✓ VERIFIED | 147 LOC, CLI-generated. radix-ui Dialog umbrella. Exports Sheet/Trigger/Close/Content/Header/Footer/Title/Description. data-slot attributes on every element. |
| `components/theme/WCAGBadge.tsx` | THEME-09 live worst-pair + AA/AAA/Fail + Adjusted-for-AA chip | ✓ VERIFIED | 99 LOC. ratio/min normalization heuristic; AAA gating on worstMin===4.5. role="status" aria-live="polite". 5 tests green incl. live ratio update + adversarial mid-grey palette triggering Adjusted chip. |
| `components/theme/PalettePresets.tsx` | THEME-06 4/5 cards + motion + D-15 + i18n labels | ✓ VERIFIED | 111 LOC. role="radiogroup", role="radio" cards. motion.button whileHover scale 1.02 + whileTap 0.98. useMemo D-15 filter on isVaporwaveUnlocked. Labels via t('presets.${id}') NOT palette.name (D-15). 4 mini swatches per card (bg, surface, accent, secondary). 6 tests green. |
| `components/theme/CustomColorPicker.tsx` | THEME-07 3 native color inputs + hex→OKLCh + setCustomColor | ✓ VERIFIED | 147 LOC. 3 `<input type="color">` for bg/accent/secondary. hexToOklchString uses culori parse + converter('oklch') + formatCss. useMemo-derived hex from palette (avoids React 19 set-state-in-effect lint). Dispatches setCustomColor — reducer runs deriveDefaultTokens + applyMatrixAdjust. Pitfall C structural: --color-accent verified as `oklch(...)` not hex in test #3. 3 tests green. |
| `components/theme/HarmonicGenerator.tsx` | THEME-08 source + 4 modes + non-destructive preview + Apply | ✓ VERIFIED | 177 LOC. Source `<input type="color">`. MODES const = ['complementary', 'triadic', 'analogous', 'split-complementary']. Local useState for sourceHex + mode. previewTokens useMemo runs generateHarmonic + applyMatrixAdjust LOCALLY (D-12 non-destructive — verified by test #2 asserting isCustom=false during preview). Apply button dispatches setHarmonic — test #3 verifies isCustom=true + customSource='harmonic'. 6-swatch grid with Aa overlay in text color. 4 tests green. |
| `components/theme/PaletteSwitcher.tsx` | THEME-10 right-anchored Sheet + 3 tabs + sticky WCAGBadge | ✓ VERIFIED | 132 LOC. side="right" SheetContent with `w-full sm:max-w-[420px]` (D-05). Tabs defaultValue="presets" (D-07 always-default-Presets via SheetContent unmount on close). data-lenis-prevent on scroll area (Phase 3 forward-compat). Sticky-footer WCAGBadge as border-t flex sibling of Tabs (D-06). Controlled open/onOpenChange API. |
| `components/theme/PaletteFab.tsx` | THEME-11 FAB + motion + reduced-motion gate + D-14 auto-open | ✓ VERIFIED | 136 LOC. `fixed right-6 bottom-6 z-40` positioning. safe-area-inset padding. Localized aria-label via useTranslations('palette') → t('open')/t('close'). motion.button outer (whileHover scale 1.08 + rotate 5°) + motion.span inner (animate rotate 0→180). All motion props set to {} when reduced; Tailwind `transition-opacity hover:opacity-80` fallback. React 19 derive-during-render pattern for vaporwaveUnlockNonce → setOpen(true) on increment. 4 tests green. |
| `app/[locale]/layout.tsx` | PaletteFouCScript in <head>, ThemeProvider wrapping {children} inside NextIntlClientProvider, PaletteFab sibling | ✓ VERIFIED | Lines 30-43: `<head>` contains `<PaletteFouCScript />`. Lines 45-62: `<body>` contains NextIntlClientProvider wrapping ThemeProvider wrapping `{children}` + `<PaletteFab />` as sibling. suppressHydrationWarning on `<html>` (required because FOUC script mutates documentElement.style pre-hydration). |
| `app/globals.css` Pitfall E mitigation | scope-exclude rule for 5 Radix overlay data-slot selectors | ✓ VERIFIED | Lines 185-193: `[data-slot='sheet-overlay'], [data-slot='sheet-content'], [data-slot='dialog-overlay'], [data-slot='dialog-content'], [data-slot='popover-content']` with `transition: opacity 200ms ease, transform 250ms ease;`. Appended AFTER the global `* { transition: color/bg/border 400ms ease; }` rule — wins specificity for matching elements only, original rule preserved verbatim. |
| `messages/{fr,en}.json` D-15 + D-06 i18n keys | palette.presets.vaporwave = "Vaporwave", palette.wcag.adjusted = "Ajusté pour AA" / "Adjusted for AA" | ✓ VERIFIED | fr.json line 71 + en.json line 71: `"vaporwave": "Vaporwave"` (no longer `"???"`). fr.json line 93: `"adjusted": "Ajusté pour AA"`. en.json line 93: `"adjusted": "Adjusted for AA"`. Parity verified. |

**Score:** 17/17 artifacts present + substantive + wired + data-flowing (Level 4 traces converge on live state via usePalette()).

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `PaletteFouCScript.tsx` | `<Script strategy="beforeInteractive">` | next/script | ✓ WIRED | Line 58: `<Script id="palette-fouc" strategy="beforeInteractive">`. eslint-disable comment documents the App-Router-vs-Pages-Router lint false-positive. |
| `PaletteFouCScript.tsx` | `lib/palettes.ts PALETTES` | Build-time JSON.stringify inline | ✓ WIRED | Line 37 imports PALETTES; line 43-48 filters Vaporwave; line 53 inlines via `${JSON.stringify(INLINE_PALETTES)}`. |
| `ThemeProvider.tsx` CSS-var writer | `document.documentElement.style` | setProperty('--color-*', ...) | ✓ WIRED | Lines 301-309: 6 setProperty calls — ONLY for `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`. **Zero mutations of shadcn aliases** (--background, --primary, --foreground, etc.) verified via grep. |
| `ThemeProvider.tsx` persistence | `lib/storage.ts` | writePaletteV1 / writeSecretsV1 in useEffect | ✓ WIRED | Lines 314-326 (palette) + lines 329-331 (secrets). Both keyed on independent state slices. |
| `ThemeProvider.tsx` Konami | `useKonamiCode(handleUnlock)` | global keydown listener | ✓ WIRED | Line 351: `useKonamiCode(handleUnlock)`. handleUnlock useCallback at lines 339-350 dispatches UNLOCK_VAPORWAVE → SET_PRESET → fireConfetti (gated on reducedMotion). |
| `ThemeProvider.tsx` fireConfetti | `canvas-confetti` dynamic import | `await import('canvas-confetti')` | ✓ WIRED | Line 233: `const { default: confetti } = await import('canvas-confetti');`. **Zero top-level `import.*canvas-confetti`** matches across components/ + lib/ + app/ verified via grep. |
| `PaletteFab.tsx` Sheet state | `<PaletteSwitcher open onOpenChange/>` | controlled props from useState | ✓ WIRED | Line 132: `<PaletteSwitcher open={open} onOpenChange={setOpen} />`. |
| `PaletteFab.tsx` nonce subscription | `usePalette().vaporwaveUnlockNonce` | React 19 derive-during-render | ✓ WIRED | Lines 86-92: useState prevNonce + render-time comparison + conditional setOpen(true). No useEffect (avoids react-hooks/set-state-in-effect). |
| `app/[locale]/layout.tsx` head | `<PaletteFouCScript/>` | JSX in `<head>` block | ✓ WIRED | Line 43: `<PaletteFouCScript />` inside `<head>`. |
| `app/[locale]/layout.tsx` body | `<ThemeProvider>` + `<PaletteFab/>` inside NextIntlClientProvider | JSX composition | ✓ WIRED | Lines 46-61: NextIntlClientProvider → ThemeProvider → `{children}` + `<PaletteFab />`. |
| `PalettePresets.tsx` | `usePalette` + lib/palettes | filter PALETTES on isVaporwaveUnlocked, dispatch setPreset | ✓ WIRED | Lines 47-53 useMemo D-15 filter; line 71 onClick={() => setPreset(p.id)}. |
| `CustomColorPicker.tsx` | culori parse + formatCss | hex→OKLCh at onChange boundary | ✓ WIRED | Lines 52-57 hexToOklchString. Lines 102-110 onChange handlers route through dispatch which calls hexToOklchString before setCustomColor. |
| `HarmonicGenerator.tsx` | lib/colors generateHarmonic + applyMatrixAdjust | Local useMemo preview + Apply commit | ✓ WIRED | Lines 79-91 previewTokens useMemo runs generateHarmonic + applyMatrixAdjust locally (non-destructive). Lines 93-99 onApply calls setHarmonic only when previewTokens valid. |
| `WCAGBadge.tsx` | CRITICAL_PAIRS + wcagContrast | iterate 7 pairs, compute worst | ✓ WIRED | Lines 41-67 useMemo iterates CRITICAL_PAIRS, computes ratio/min score, picks worst. |
| `app/globals.css` Pitfall E | 5 Radix overlay data-slot selectors | scope-exclude after global rule | ✓ WIRED | Lines 185-193 — exact 5 selectors verified via grep. |

**Score:** 15/15 key links verified.

---

### Data-Flow Trace (Level 4)

Tracing each wired-but-might-be-hollow artifact:

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `WCAGBadge` | `palette` | `usePalette().palette` ← ThemeProvider state.palette ← reducer cases write real OKLCh tokens from PALETTES or applyMatrixAdjust output | Yes — 7 wcagContrast calls produce numbers; worst is rendered with toFixed(2) | ✓ FLOWING |
| `PalettePresets` | `visiblePalettes` | useMemo over PALETTES (real 5-palette constant from lib/palettes.ts) filtered by `isVaporwaveUnlocked` from usePalette() | Yes — 4 or 5 real Palette objects with 6 OKLCh tokens each | ✓ FLOWING |
| `CustomColorPicker` | `bgHex/accentHex/secondaryHex` | useMemo over palette.bg/accent/secondary via oklchToHex | Yes — hex string from real OKLCh palette state | ✓ FLOWING |
| `HarmonicGenerator` | `previewTokens` | useMemo runs `generateHarmonic(mode, sourceHex)` + `applyMatrixAdjust` on user-controlled state | Yes — real 6-token DerivedTokens output, byte-faithful to what Apply commits | ✓ FLOWING |
| `PaletteFab` aria-label | `t('open')` or `t('close')` | useTranslations('palette') from NextIntlClientProvider, real fr/en.json files | Yes — localized strings | ✓ FLOWING |
| `PaletteFab` open state | `open` useState | Local React state + nonce subscription | Yes — toggles on click AND on nonce increment | ✓ FLOWING |
| `ThemeProvider` CSS-var writer | `state.palette` | reducer output (4 actions all produce real palette tokens) | Yes — 6 setProperty calls fire with real OKLCh strings | ✓ FLOWING |
| `PaletteFouCScript` cold-load palette | `localStorage.getItem('palette-v1')` | written by ThemeProvider on every state change via writePaletteV1 | Yes — round-tripped from JSON; falls back to :root Terra defaults if absent/invalid (D-02 silent) | ✓ FLOWING |

All artifacts flow real data through real reducers, real i18n, real state. No hardcoded empty props at call sites.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 5 palettes pass 7-pair WCAG matrix | `npm run test:palettes` | "All 5 palettes pass the 7-pair WCAG matrix." (exit 0). Worst margins: terra accent/surface +0.26, ocean secondary/bg +0.10 | ✓ PASS |
| Full test suite passes | `npm test` | "Test Files 10 passed (10); Tests 94 passed (94)" duration 2.96s | ✓ PASS |
| Lint passes with zero warnings | `npm run lint` | (no output, exit 0) | ✓ PASS |
| Production build succeeds | `npm run build` | "Compiled successfully in 1979ms; Finished TypeScript in 2.6s; Generating static pages (6/6)" exit 0 | ✓ PASS |
| Zero top-level canvas-confetti imports | grep `^import.*canvas-confetti` across components/, lib/, app/ | 0 matches; only `await import('canvas-confetti')` at ThemeProvider.tsx:233 | ✓ PASS |
| ThemeProvider only mutates --color-* | grep `setProperty.*--(background|primary|foreground\|card\|popover\|muted\|destructive\|border\|input\|ring)\b` | 0 matches (only `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`) | ✓ PASS |
| PaletteFouCScript is Server Component | grep `^'use client'\|^"use client"` in PaletteFouCScript.tsx | 0 matches (no 'use client' directive) | ✓ PASS |
| FOUC script body size | Node measurement of rendered SCRIPT_BODY template | **1000 bytes** (within <1024 budget per D-03 + RESEARCH Pitfall A) | ✓ PASS |
| Pitfall E mitigation present | grep `data-slot='sheet-overlay'\|data-slot='sheet-content'\|data-slot='dialog-overlay'\|data-slot='dialog-content'\|data-slot='popover-content'` in globals.css | 5 matches at lines 185-189 | ✓ PASS |
| Zero `: any` annotations | grep `: any\b` in components/ + lib/ | 0 matches (one false positive in JSDoc comment "any throw") | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description (REQUIREMENTS.md) | Implementation Status | Evidence | REQ.md Marker |
|-------------|-------------|-------------------------------|----------------------|----------|---------------|
| THEME-01 | 02-00 + 02-01 | 5 typed palettes pre-validated WCAG AA | ✓ SATISFIED | lib/palettes.ts has 5 typed Palette consts; scripts/validate-palettes.ts gates all 5 via 7-pair matrix | `[x]` ✓ |
| THEME-02 | 02-01 | wcagContrast, adjustForAA, validateFullMatrix | ✓ SATISFIED | lib/colors.ts exports all 3 functions; 29 tests green | `[x]` ✓ |
| THEME-03 | 02-01 | generateHarmonic 4 modes | ✓ SATISFIED | lib/colors.ts generateHarmonic + HUE_OFFSETS for complementary/triadic/analogous/split-complementary | `[x]` ✓ |
| THEME-04 | 02-03 | ThemeProvider Context, applies CSS vars on :root, persists | ✓ SATISFIED | components/providers/ThemeProvider.tsx 397 LOC, 16 tests green, full usePalette() API exposed | `[x]` ✓ |
| THEME-05 | 02-03 | <Script beforeInteractive> reads localStorage + applies CSS vars pre-hydration | ✓ SATISFIED | components/theme/PaletteFouCScript.tsx Server Component, 1000-byte inline body, dropped in `<head>` via layout.tsx | `[x]` ✓ |
| THEME-06 | 02-04 | PalettePresets 4 cards + motion + active indicator | ✓ SATISFIED | components/theme/PalettePresets.tsx 111 LOC, motion.button hover/tap, 6 tests green | `[x]` ✓ |
| THEME-07 | 02-05 | CustomColorPicker 3 inputs + setCustomColor + auto-derivation | ✓ SATISFIED | components/theme/CustomColorPicker.tsx 147 LOC; D-10 derivation runs in ThemeProvider reducer via deriveDefaultTokens; 3 tests green; --color-accent flows as OKLCh (Pitfall C verified) | **`[ ]` ⚠️ STALE — needs `[x]`** |
| THEME-08 | 02-05 | HarmonicGenerator source + 4 modes + preview | ✓ SATISFIED | components/theme/HarmonicGenerator.tsx 177 LOC; non-destructive preview via local useMemo; Apply commits via setHarmonic; 4 tests green | **`[ ]` ⚠️ STALE — needs `[x]`** |
| THEME-09 | 02-04 | WCAGBadge live ratio + AA/AAA/Fail + colored icon + live update | ✓ SATISFIED | components/theme/WCAGBadge.tsx 99 LOC; worst-pair heuristic; 5 tests green incl. live update | `[x]` ✓ |
| THEME-10 | 02-05 | PaletteSwitcher right-anchored Sheet + 3 tabs + keyboard nav | ✓ SATISFIED | components/theme/PaletteSwitcher.tsx 132 LOC; right-anchored shadcn Sheet (Radix Dialog under) with focus trap + Esc-to-close; 3 Tabs (defaultValue="presets" D-07); sticky-footer WCAGBadge. **Keyboard nav routed to human verification per 02-VALIDATION.md row 02-SHEET-01.** | **`[ ]` ⚠️ STALE — needs `[x]`** |
| THEME-11 | 02-06 | FAB bottom-right + motion + opens PaletteSwitcher + aria-label FR/EN | ✓ SATISFIED | components/theme/PaletteFab.tsx 136 LOC; fixed bottom-right z-40; motion hover/rotate gated on prefers-reduced-motion; localized aria-label; 4 tests green | `[x]` ✓ |
| THEME-12 | 02-02 + 02-03 + 02-06 | useKonamiCode + ThemeProvider unlock + confetti | ✓ SATISFIED | lib/hooks/useKonamiCode.ts + ThemeProvider handleUnlock + fireConfetti dynamic import; 11 hook tests + 3 ThemeProvider Konami tests + 1 PaletteFab D-14 auto-open test all green; **real confetti paint + real keystroke flow routed to human verification.** | `[x]` ✓ |

**Coverage:** 12/12 REQ-IDs implemented and verified. **3 stale markers in REQUIREMENTS.md** (THEME-07, THEME-08, THEME-10) — implementation IS complete; documentation just wasn't updated. No orphaned requirements.

---

### Decisions Honored (D-01..D-16)

| ID | Decision | Honored | Evidence |
|----|----------|---------|----------|
| D-01 | Hybrid localStorage shape under two keys (palette-v1 + palette-secrets-v1) | ✓ | lib/storage.ts PALETTE_KEY / SECRETS_KEY constants; StoredPalette discriminated union with kind:'preset'/'custom' |
| D-02 | Silent hard fallback to Terra on any storage error | ✓ | 4 empty-catch try/catch blocks in lib/storage.ts; Test 13 asserts zero console.error/warn/log across all failure paths |
| D-03 | FOUC script reads from build-time-inlined PALETTES table | ✓ | PaletteFouCScript.tsx INLINE_PALETTES + JSON.stringify in template; 1000-byte rendered size; Server Component (no 'use client') |
| D-04 | Install shadcn Sheet via CLI, right-anchored | ✓ | components/ui/sheet.tsx CLI-generated 147 LOC; PaletteSwitcher uses side="right" |
| D-05 | Responsive Sheet width (full mobile, 400-440px desktop) | ✓ | PaletteSwitcher line 77: `className="flex w-full flex-col p-0 sm:max-w-[420px]"` — 420 chosen in discretion window |
| D-06 | WCAGBadge in sticky footer across all 3 tabs; Adjusted-for-AA chip when applied | ✓ | PaletteSwitcher lines 125-127 (border-t flex sibling of Tabs); WCAGBadge.tsx lines 89-96 conditional chip on wasAdjustedForAA |
| D-07 | Always default to Presets tab on Sheet open | ✓ | PaletteSwitcher line 96: `<Tabs defaultValue="presets">` (uncontrolled — SheetContent unmounts on close, resets on next open) |
| D-08 | FAB icon + motion (Lucide palette + scale 1.08 + rotate 5° + reduced-motion gate) | ✓ | PaletteFab.tsx lines 115-117 whileHover/whileTap; line 125 motion.span animate rotate; all gated on `reduced` boolean |
| D-09 | Custom picker uses 3 native `<input type="color">` | ✓ | CustomColorPicker.tsx lines 116, 127, 137 — three `<input type="color">` for bg/accent/secondary |
| D-10 | Token derivation rule (3 user tokens → 6) | ✓ | lib/colors.ts deriveDefaultTokens lines 196-235 implements surface (±3% L), text (near-black/white AA-clamped), textMuted (midpoint L AA-clamped) |
| D-11 | WCAG enforcement is silent auto-adjust (only text/textMuted shift) | ✓ | lib/colors.ts applyMatrixAdjust lines 314-362 INVARIANT — loop body only mutates `result.text` and `result.textMuted`; accent/secondary structurally preserved. Test 27 asserts this directly. |
| D-12 | Harmonic preview inline + non-destructive + Apply commits | ✓ | HarmonicGenerator.tsx lines 79-91 local useMemo (no state mutation); Apply button lines 93-99 dispatches setHarmonic. Test #2 asserts preview leaves ThemeProvider state untouched. |
| D-13 | Confetti via canvas-confetti dynamic-imported | ✓ | ThemeProvider.tsx line 233: `await import('canvas-confetti')` inside fireConfetti(). Zero top-level imports verified via grep. |
| D-14 | Unlock sequence: confetti → palette → Sheet auto-opens on Presets | ✓ | ThemeProvider handleUnlock lines 339-350 dispatches UNLOCK_VAPORWAVE → SET_PRESET → fireConfetti. PaletteFab nonce subscription lines 86-92 triggers setOpen(true). PaletteSwitcher defaults to Presets tab. |
| D-15 | Post-unlock Vaporwave card visible (5th); i18n key = "Vaporwave" (palette.name stays "???") | ✓ | PalettePresets useMemo lines 47-53 filters Vaporwave when !isVaporwaveUnlocked; i18n key updated to "Vaporwave" in both messages files; lib/palettes.ts line 85 keeps `name: '???'` as defensive fallback |
| D-16 | useKonamiCode invoked inside ThemeProvider; unlock = theme state | ✓ | ThemeProvider line 351: `useKonamiCode(handleUnlock)`. isVaporwaveUnlocked + vaporwaveUnlockNonce live in ThemeState. e.code sequence (layout-independent). Input/dialog filter. |

**All 16 decisions honored.**

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none flagged) | — | — | — | All known stub patterns (TODO/FIXME/empty arrays flowing to UI/console.log handlers/placeholder strings) absent in phase 02 source files |

Grep sweep confirms zero TODO/FIXME/HACK markers in phase 02 source files. No empty-array props at component call sites. All `useState(0)` and similar are state defaults that get populated by reducer/effect logic, not stubs.

---

### Human Verification Required

Five items pending real-browser UAT (see `human_verification` frontmatter for full detail):

1. **FOUC absence on Slow 3G cold load** — visual check that no Terra flash precedes the stored palette paint
2. **Sheet keyboard navigation** — focus trap + Esc-to-close + Tab cycling (Radix internals)
3. **Konami full flow** — real ↑↑↓↓←→←→BA keystrokes, confetti paint, palette swap, Sheet auto-open
4. **prefers-reduced-motion fade-only fallback** — confetti suppressed, unlock still rewards
5. **Konami input filter** — typing sequence inside an input does NOT trigger

These match 02-VALIDATION.md rows 02-FOUC-01, 02-SHEET-01, 02-KONAMI-01/CONFETTI-01 and are explicitly flagged as manual-only at the validation contract level (jsdom limitations). All other validation rows are GREEN.

---

### Gaps Summary

**Implementation:** 0 gaps. All 12 REQ-IDs implemented, all 17 artifacts present + substantive + wired + data-flowing, all 15 key links verified, all 16 decisions honored, all 5 ROADMAP success criteria satisfied at the automated layer.

**Documentation:** 1 gap (status stale in REQUIREMENTS.md). THEME-07, THEME-08, THEME-10 are marked `[ ]` in the v1 checklist (lines 30, 31, 33) and `Pending` in the Traceability table (lines 155, 156, 158). The corresponding plan frontmatter (02-05-custom-harmonic-switcher-PLAN.md) declares these REQs as `requirements_completed`, the SUMMARY confirms delivery, and the codebase reflects the implementation (CustomColorPicker.tsx, HarmonicGenerator.tsx, PaletteSwitcher.tsx with full tests). The discrepancy is purely documentation — REQUIREMENTS.md was not updated when those plans completed.

**Recommended action:** Update REQUIREMENTS.md to flip 6 status markers (3 checkboxes + 3 traceability rows) to reflect actual implementation state. This is a single-file documentation patch with no code changes.

**Human verification:** 5 items pending real-browser UAT (FOUC visual, keyboard nav, Konami real keystrokes, reduced-motion, input filter). All flagged as manual-only by the phase's own VALIDATION.md.

---

## Verdict

**Status:** `human_needed` — All automated verification passed; phase goal achieved end-to-end across the codebase. Five real-browser checks pending human UAT (per 02-VALIDATION.md manual contract). One documentation patch recommended (flip 3 REQ-IDs in REQUIREMENTS.md from `[ ]` Pending to `[x]` Complete).

**Score:** 5/5 ROADMAP success criteria verified (automated layer) + 17/17 artifacts present + 15/15 key links wired + 16/16 decisions honored + 94/94 tests green + lint/build/test:palettes all exit 0.

**Phase 2 (Palette System) is implementation-complete. Routing to human UAT for browser-only verification + REQUIREMENTS.md status-marker patch.**

---

_Verified: 2026-05-26T15:27:36Z_
_Verifier: Claude (gsd-verifier)_
