---
phase: 02
slug: palette-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-26
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | **Vitest 2.x** + React Testing Library + jsdom (no test infra exists yet — Wave 0 installs) |
| **Config file** | `vitest.config.ts` (created in Wave 0) |
| **Quick run command** | `vitest run lib/colors.test.ts lib/storage.test.ts` |
| **Full suite command** | `vitest run` |
| **Estimated runtime** | <2 seconds quick / <10 seconds full |

**Rationale:** Vitest is ESM-native (matches culori ESM-only, Next 16 ESM, Tailwind v4 ESM), uses Vite/SWC transform pipeline so it's fast, has excellent TS DX, and supports React 19.2 + RTL out of the box. Jest is slower with ESM and would require config gymnastics.

**Install command (Wave 0):**
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom tsx
```

**package.json scripts (Wave 0):**
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:palettes": "tsx scripts/validate-palettes.ts"
}
```

---

## Sampling Rate

- **After every task commit:** Run `vitest run lib/colors.test.ts lib/storage.test.ts` (quick subset, <2s)
- **After every plan wave:** Run `vitest run` (full suite, <10s expected)
- **Before `/gsd:verify-work`:** Full suite must be green + manual FOUC test on Slow 3G + keyboard nav checklist
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-WV0-01 | Wave 0 | 0 | (infra) | n/a | `npm test -- --version` | ❌ W0 | ⬜ pending |
| 02-WV0-02 | Wave 0 | 0 | THEME-01 | unit | `npx tsx scripts/validate-palettes.ts` | ❌ W0 | ⬜ pending |
| 02-PALETTES-01 | palettes-validate | 0 | THEME-01 | unit | `npx tsx scripts/validate-palettes.ts` | ❌ W0 | ⬜ pending |
| 02-COLORS-01 | lib-colors | 1 | THEME-02 | unit | `vitest run lib/colors.test.ts -t "wcagContrast"` | ❌ W0 | ⬜ pending |
| 02-COLORS-02 | lib-colors | 1 | THEME-02 | unit | `vitest run lib/colors.test.ts -t "adjustForAA"` | ❌ W0 | ⬜ pending |
| 02-COLORS-03 | lib-colors | 1 | THEME-02 | unit | `vitest run lib/colors.test.ts -t "validateFullMatrix"` | ❌ W0 | ⬜ pending |
| 02-COLORS-04 | lib-colors | 1 | THEME-03 | unit | `vitest run lib/colors.test.ts -t "generateHarmonic"` | ❌ W0 | ⬜ pending |
| 02-COLORS-05 | lib-colors | 1 | THEME-02 (derive) | unit | `vitest run lib/colors.test.ts -t "deriveDefaultTokens"` | ❌ W0 | ⬜ pending |
| 02-STORAGE-01 | lib-storage | 1 | THEME-04 (persistence) | unit | `vitest run lib/storage.test.ts` | ❌ W0 | ⬜ pending |
| 02-STORAGE-02 | lib-storage | 1 | D-02 (silent fallback) | unit | `vitest run lib/storage.test.ts -t "fallback"` | ❌ W0 | ⬜ pending |
| 02-HOOKS-01 | lib-hooks | 1 | THEME-12 | unit | `vitest run lib/hooks/useKonamiCode.test.ts` | ❌ W0 | ⬜ pending |
| 02-HOOKS-02 | lib-hooks | 1 | (motion gate) | unit | `vitest run lib/hooks/usePrefersReducedMotion.test.ts` | ❌ W0 | ⬜ pending |
| 02-PROVIDER-01 | theme-provider | 2 | THEME-04 | integration | `vitest run components/providers/ThemeProvider.test.tsx -t "setPreset"` | ❌ W0 | ⬜ pending |
| 02-PROVIDER-02 | theme-provider | 2 | THEME-04 | integration | `vitest run components/providers/ThemeProvider.test.tsx -t "setCustomColor"` | ❌ W0 | ⬜ pending |
| 02-PROVIDER-03 | theme-provider | 2 | THEME-04 | integration | `vitest run components/providers/ThemeProvider.test.tsx -t "setHarmonic"` | ❌ W0 | ⬜ pending |
| 02-PROVIDER-04 | theme-provider | 2 | THEME-12 | integration | `vitest run components/providers/ThemeProvider.test.tsx -t "konami unlock"` | ❌ W0 | ⬜ pending |
| 02-FOUC-01 | fouc-script | 2 | THEME-05 | manual | DevTools Network Slow 3G + clear cache + reload with non-Terra palette | n/a | ⬜ pending |
| 02-FOUC-02 | fouc-script | 2 | THEME-05 | manual | `next build && grep palette-fouc .next/static/chunks/*.js && wc -c` (verify <1 KB) | n/a | ⬜ pending |
| 02-SHEET-01 | palette-switcher | 3 | THEME-10 | manual | Keyboard-only walkthrough: Tab cycles tabs, Esc closes, focus trap holds | n/a | ⬜ pending |
| 02-PRESETS-01 | palette-presets | 3 | THEME-06 | integration | `vitest run components/theme/PalettePresets.test.tsx` | ❌ W0 | ⬜ pending |
| 02-CUSTOM-01 | custom-picker | 3 | THEME-07 | integration | `vitest run components/theme/CustomColorPicker.test.tsx` | ❌ W0 | ⬜ pending |
| 02-HARMONIC-01 | harmonic-generator | 3 | THEME-08 | integration | `vitest run components/theme/HarmonicGenerator.test.tsx` | ❌ W0 | ⬜ pending |
| 02-BADGE-01 | wcag-badge | 3 | THEME-09 | integration | `vitest run components/theme/WCAGBadge.test.tsx` | ❌ W0 | ⬜ pending |
| 02-FAB-01 | palette-fab | 4 | THEME-11 | integration | `vitest run components/theme/PaletteFab.test.tsx` | ❌ W0 | ⬜ pending |
| 02-KONAMI-01 | konami-integration | 4 | THEME-12 | integration | `vitest run components/providers/ThemeProvider.test.tsx -t "konami end-to-end"` | ❌ W0 | ⬜ pending |
| 02-CONFETTI-01 | konami-integration | 4 | THEME-12 (confetti) | manual | Cold load + Konami sequence → confetti visible + auto-switch to Vaporwave | n/a | ⬜ pending |
| 02-FULL-01 | phase verify | 4 | THEME-01..12 | integration | `vitest run` (full suite green) | ❌ W0 | ⬜ pending |
| 02-BUILD-01 | phase verify | 4 | (cleanliness) | build | `npm run build` exits 0 | n/a | ⬜ pending |
| 02-LINT-01 | phase verify | 4 | (cleanliness) | lint | `npm run lint` exits 0 with zero warnings | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **`npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom tsx`** — test framework install
- [ ] **`vitest.config.ts`** — jsdom environment, `@/*` path alias, React 19.2 + RTL setup
- [ ] **`scripts/validate-palettes.ts`** — Node-only script runs `validateFullMatrix` on all 5 palettes, prints ratios, exits non-zero on failure (covers THEME-01)
- [ ] **`lib/colors.test.ts`** — stubs for `wcagContrast`, `adjustForAA`, `validateFullMatrix`, `generateHarmonic`, `pickTextOnAccent`, `deriveDefaultTokens` (THEME-02, THEME-03)
- [ ] **`lib/storage.test.ts`** — stubs for `readPaletteV1`/`writePaletteV1` round-trip + silent-fallback on corruption (D-01, D-02)
- [ ] **`lib/hooks/useKonamiCode.test.ts`** — stubs for sequence match, input filtering, reset on wrong key (THEME-12)
- [ ] **`lib/hooks/usePrefersReducedMotion.test.ts`** — stubs for SSR-safe initial value, matchMedia change events
- [ ] **`components/providers/ThemeProvider.test.tsx`** — stubs for state transitions, persistence, konami integration (THEME-04)
- [ ] **`components/theme/PalettePresets.test.tsx`** — 4 cards visible pre-unlock, 5 cards post-unlock, active indicator (THEME-06)
- [ ] **`components/theme/CustomColorPicker.test.tsx`** — derivation rules per D-10 (THEME-07)
- [ ] **`components/theme/HarmonicGenerator.test.tsx`** — 4 modes × preview × apply (THEME-08)
- [ ] **`components/theme/WCAGBadge.test.tsx`** — ratio formatting, AA/AAA/Fail thresholds, adjusted chip (THEME-09)
- [ ] **`components/theme/PaletteFab.test.tsx`** — aria-label localized FR/EN, opens Sheet (THEME-11)
- [ ] **`scripts/validate-palettes.ts`** added to `package.json` as `"test:palettes"`
- [ ] **`package.json` scripts** added: `test`, `test:watch`, `test:palettes`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| **FOUC: stored palette applied before paint** | THEME-05 | Inline `<Script beforeInteractive>` timing cannot be reliably automated in jsdom (no real paint pipeline) | 1. Open dev build with Nordic palette saved in localStorage. 2. DevTools → Network → throttle to **Slow 3G**. 3. Clear cache + hard reload. 4. Observe: page MUST render Nordic colors on first paint — no flash of Terra defaults. 5. Repeat for each preset + a custom palette. |
| **FOUC script size <1 KB minified** | THEME-05 | Build artifact inspection | 1. `npm run build`. 2. `grep palette-fouc .next/static/chunks/*.js`. 3. `wc -c` on the inline script content. 4. Confirm <1024 bytes (excluding wrapper overhead). |
| **Sheet keyboard nav: Tab/Esc/focus trap** | THEME-10 | Radix handles internals; verify behavior visually because trap-exit edge cases (e.g., Tab past close button) need human eye | 1. Open palette switcher with mouse, then put hands on keyboard. 2. Tab through tabs (Presets/Custom/Generate) — must cycle inside the Sheet, not leak to page content. 3. Esc closes the Sheet. 4. Shift+Tab cycles backward. 5. After close, focus returns to the FAB. |
| **Konami code triggers confetti + auto-switch** | THEME-12 | canvas-confetti DOM-paints to a real canvas; jsdom doesn't render | 1. Cold load homepage with Terra palette. 2. Enter sequence `↑↑↓↓←→←→BA` on the body (not in any input). 3. Confetti burst visible center-bottom for ~3 seconds. 4. Palette repaints to Vaporwave (purple/pink tones). 5. Sheet auto-opens on Presets tab. 6. Vaporwave card visible as 5th preset, highlighted active. |
| **Konami filter: typing in input does NOT trigger** | THEME-12 | Same canvas issue + verify event filter | 1. Place focus in any `<input>` or `<textarea>` (e.g., the Custom picker if open). 2. Type `↑↑↓↓←→←→BA`. 3. NO confetti, NO palette change. 4. Click outside input, type sequence again. 5. Confetti fires (state should be reset/preserved per implementation). |
| **Palette swap repaints all shadcn primitives** | THEME-04 | shadcn alias chain (`bg-primary` → `--primary` → `var(--color-accent)`) — verify no flicker | 1. Open dev tools, inspect a `<button class="bg-primary">`. 2. Note computed `background-color` (Terra accent). 3. Open switcher, select Nordic. 4. Re-inspect — `background-color` reflects Nordic accent. 5. No rebuild, no class change. 6. Repeat for `border-border`, `text-foreground`, etc. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (confirmed: manual tests bracket each automated wave)
- [ ] Wave 0 covers all MISSING references (Vitest install + 8 test files + scripts/validate-palettes.ts + package.json scripts)
- [ ] No watch-mode flags (`vitest run`, not `vitest`, for CI-style sampling)
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 ships

**Approval:** pending
