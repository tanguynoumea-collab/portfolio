# Phase 2: Palette System - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the signature feature — a user can change the entire site palette **live**, see WCAG compliance in real time, and unlock a secret Vaporwave palette via Konami code, with the chosen palette persisting across reloads and **zero FOUC** on cold load.

This phase delivers REQs THEME-01..12 (12 requirements). Concretely:

- The `lib/palettes.ts` constants from Phase 1 get wired to a runtime UI.
- `lib/colors.ts` ships with `wcagContrast`, `adjustForAA`, `validateFullMatrix` (7-pair WCAG matrix), and `generateHarmonic` (4 modes via OKLCh hue rotation).
- A client `ThemeProvider` owns palette + unlock state, mutates `--color-*` on `:root`, persists to two localStorage keys, and exposes `usePalette()`.
- A `beforeInteractive` `<Script>` in `app/[locale]/layout.tsx`'s prepped `<head>` socket reads localStorage and applies CSS vars before hydration.
- A FAB opens a right-anchored shadcn `Sheet` with 3 tabs (Presets / Custom / Generate), a sticky-footer WCAGBadge, full keyboard navigation, and focus trap.
- The Konami code (↑↑↓↓←→←→BA) unlocks Vaporwave: confetti + auto-switch + Sheet auto-opens.

**Out of scope for this phase** (already on the v2 list or explicit deferrals):
- Palette export/import (URL share, JSON download) — THEME-v2-01
- Preview-before-application for Custom tab — THEME-v2-02
- Audio cue on Konami unlock (anti-pattern per FEATURES.md)
- Additional harmonic modes beyond the 4 in THEME-03
- LenisProvider / ScrollTrigger.refresh() integration after palette swap — Phase 3 (ThemeProvider exposes a hook the LenisProvider will consume later)

</domain>

<decisions>
## Implementation Decisions

### Persistence & FOUC

- **D-01:** **Hybrid localStorage shape under two keys.**
  - `palette-v1` — active palette. Discriminated payload:
    - `{ kind: 'preset', id: PaletteId }` when user picks Terra/Nordic/Bauhaus/Ocean/Vaporwave
    - `{ kind: 'custom', tokens: { bg, surface, text, textMuted, accent, secondary }, source: 'picker' | 'harmonic' }` when user authors via picker or generator
  - `palette-secrets-v1` — unlock state. Object payload `{ vaporwave: true }` (object shape so future secrets scale without schema bump).
  - Rationale: presets stay forward-compatible (if future deploy tunes a preset's OKLCh values, returning users see the NEW values because storage holds only the id); custom palettes survive any preset edits.

- **D-02:** **Silent hard fallback to Terra on any storage error.** `try/catch` around `JSON.parse` and shape validation. On parse fail, missing keys, invalid OKLCh shape, or schema mismatch: do nothing — the `:root` defaults already render Terra, ThemeProvider initializes `paletteId='terra'`. Storage is **left intact** (next valid pick overwrites it). No `removeItem`, no console.error, no toast. Matches PITFALLS.md Pitfall #1 pattern.

- **D-03:** **FOUC script reads from a build-time-inlined PALETTES table.** The `<Script strategy="beforeInteractive">` lives in `app/[locale]/layout.tsx`'s `<head>` socket (lines 27-42, already prepped). The script body is generated server-side with the 5 palettes inlined as a JS object literal sourced from `lib/palettes.ts` — single source of truth, byte-matches the canonical values, ~600 bytes minified target. Script logic:
  1. Read `palette-v1`. If missing → no-op (Terra defaults already in `:root`).
  2. If `kind === 'preset'`: look up id in inline PALETTES, write 6 `--color-*` via `document.documentElement.style.setProperty`.
  3. If `kind === 'custom'`: apply stored tokens directly.
  4. Wrap in `try {} catch (e) {}` — any throw silently degrades to defaults.
  5. Read `palette-secrets-v1` separately if needed (no effect on FOUC paint, just preloads unlock state).

### PaletteSwitcher Form Factor

- **D-04:** **Install shadcn `Sheet` now** via `npx shadcn@latest add sheet`. Right-anchored (`side="right"`). Brings the slide animation, focus trap, Esc-to-close, and overlay out of the box — direct match for THEME-10. The existing 7 shadcn primitives stay untouched; `sheet` becomes the 8th.

- **D-05:** **Responsive Sheet width.** Below `md` (mobile / small tablet): **full-width** sheet with backdrop dimmer. At `md` and above: **400-440px width** with backdrop dimmer (exact px to planner discretion). Backdrop is dimmed so the live page-paint preview still peeks through visible edges on desktop.

- **D-06:** **WCAGBadge in sticky footer of the Sheet, visible across all 3 tabs.** Bottom strip (~40px tall) shows live ratio (numeric, 2 decimals) + status (AA / AAA / Fail with colored icon). When `adjustForAA` triggered a fix, a small **"Adjusted for AA"** chip appears next to the badge with hover tooltip explaining what changed (e.g., "Adjusted text from L=0.30 to L=0.22"). This is non-negotiable per FEATURES.md positioning — visible WCAG-awareness IS the signature.

- **D-07:** **Always default to Presets tab on Sheet open.** No last-used-tab persistence. Predictable entry, signature "preset showcase" is what visitors should see first.

- **D-08:** **FAB icon + motion.** Lucide `palette` icon (already available — lucide-react ships with shadcn). Hover: scale `1.0 → 1.08` + rotate `5deg`, 200ms ease. Click: scale-down feedback. While Sheet open: icon rotates 180deg & cross-fades to Lucide `x` (close affordance). Under `prefers-reduced-motion: reduce`: motion disabled, opacity-only feedback. Position: fixed bottom-right with safe-area-inset padding, `z-index` above all section content but below the Sheet overlay.

### Custom + Harmonic UX (incl. WCAG auto-adjust)

- **D-09:** **Custom picker uses 3 native `<input type="color">` inputs** for bg, accent, secondary. The OS-native swatch picker is familiar UX. culori converts the returned hex → OKLCh internally via `parse(hex)` → `formatCss('oklch')`. REQ THEME-07's "3 inputs HSL" is **reframed as "3 visual color pickers"** — closer to the FEATURES.md "design system playground" positioning than literal HSL knobs would be. (HSL → OKLCh roundtripping is lossy; native picker → OKLCh is one-way and clean.)

- **D-10:** **Token derivation rule when user customizes 3 of 6 tokens.** Only `bg`, `accent`, `secondary` come from user input. The remaining 3 are derived deterministically:
  - `surface` = `bg` with ~3% L shift (lighten on light bg, darken on dark bg — auto-detected by `bg` lightness > 0.5).
  - `text` = OKLCh `oklch(0.15 0 0)` or `oklch(0.95 0 0)` (near-black or near-white), whichever passes `wcagContrast(text, bg) >= 4.5`.
  - `textMuted` = OKLCh interpolation halfway between `text` and `bg` (using culori's `mix` or `interpolate` in the OKLCh space), then clamped via `adjustForAA(textMuted, bg)` to guarantee 4.5:1.
  - Predictable, hits the 7-pair AA matrix reliably, no preset-delta ambiguity.

- **D-11:** **WCAG enforcement is silent auto-adjust.** `lib/colors.ts.adjustForAA` runs on every token change. The user's exact accent/secondary are preserved; only `text` and `textMuted` shift in L to hit 4.5:1. When an adjustment was applied, the sticky-footer WCAGBadge shows the **"Adjusted for AA"** chip (D-06). Failing combos never reach the live `:root` — they get fixed before `setProperty` runs. The "Fail" badge state exists in the type model but is only reachable in transient validation states (e.g., a generated palette that hasn't been adjusted yet), never in committed-to-`:root` state.

- **D-12:** **Harmonic preview is inline inside the Generate tab.** Below the source-color input + 4-mode tabs/buttons, render 6 token swatches in a grid, each labeled with its token name and an `Aa` sample text overlaid in the resolved `text` color (instant readability check). The sticky-footer WCAGBadge updates **live** as source/mode changes (no commit needed). An **"Apply"** button below the swatches commits the generated palette to `:root` and writes `palette-v1` as `{ kind: 'custom', tokens, source: 'harmonic' }`. The Generate tab stays active after apply (user can iterate). No full-page commit-with-undo dance — the inline preview IS the preview.

### Konami Unlock UX

- **D-13:** **Confetti via `canvas-confetti` (dynamic-imported).** `npm install canvas-confetti` (~4 KB gzip, MIT, mature). The confetti module is **dynamically imported only when the Konami sequence completes** — `const confetti = (await import('canvas-confetti')).default` — so cold load pays zero cost. Particle colors sourced from the Vaporwave palette's `accent` + `secondary` tokens (extracted via culori `formatCss('rgb')` or hex equivalent for canvas-confetti's color API).

- **D-14:** **On unlock: confetti burst → palette auto-switches to Vaporwave → Sheet auto-opens on Presets tab.** Single dramatic reveal moment. Sequence:
  1. Konami listener fires `onUnlock()`.
  2. `setUnlocked(true)` updates context state + writes `palette-secrets-v1`.
  3. `setPreset('vaporwave')` switches palette (CSS vars repaint via the global 400ms transition).
  4. Confetti burst (dynamic import resolves, particles fire from center-bottom).
  5. Sheet opens via `setOpen(true)` on Presets tab; Vaporwave card is highlighted active.
  6. User can click any other preset to switch back.

- **D-15:** **Post-unlock, the Vaporwave card shows its real name.** The `PalettePresets` component filters out the `'vaporwave'` entry from `PALETTES` when `!isVaporwaveUnlocked`, and renders it normally (5th card) when unlocked. Card label sourced from i18n `palette.presets.vaporwave`. **Update needed in Phase 2:** change `messages/{fr,en}.json` `palette.presets.vaporwave` from `"???"` to `"Vaporwave"` (brand name — universal across locales). `lib/palettes.ts` `.name` field stays `"???"` as a defensive fallback (never displayed in practice, since the component prefers the i18n key, but kept for any path that bypasses i18n).

- **D-16:** **`useKonamiCode` hook is invoked inside `ThemeProvider`.** Unlock state IS theme state — same source of truth. The provider mounts the global `keydown` listener via `useEffect`, filters events when `document.activeElement` is `input`/`textarea`/`[contenteditable]`, matches the sequence `↑↑↓↓←→←→BA` (ArrowUp×2, ArrowDown×2, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, KeyB, KeyA), and calls the unlock flow on success. `usePalette()` exposes `isVaporwaveUnlocked` to consumer components (PalettePresets).

### Claude's Discretion

Decisions deferred to the researcher/planner — enough signal exists to choose well:
- **Exact `surface` L-shift amount** for D-10 (~3% is a starting point; researcher confirms against culori behavior on light vs dark bgs).
- **`adjustForAA` algorithm internals** — iterative L-shift with binary search vs single-pass with chroma reduction. Either is fine if the contract holds: input + minRatio → output that meets minRatio with minimal perceptual change.
- **Exact desktop Sheet width** (400 vs 420 vs 440px) — planner picks based on common laptop widths and content density of the 3 tabs.
- **Exact transition timing on Sheet open/close** — the global 400ms `transition: color, background-color, border-color` from Phase 1 covers palette swap but NOT the Sheet's transform/opacity. Planner picks Sheet motion timing (shadcn's default is fine).
- **canvas-confetti parameters** — particle count, duration, spread, gravity. Default `confetti({})` is good enough; planner can tune.
- **`useKonamiCode` debounce / inter-keystroke timeout** — should the sequence reset if the user pauses 2 seconds mid-sequence? Planner decides (suggest yes, ~1-2s, to avoid accidental re-triggers across separate sessions).
- **Where ThemeProvider sits in the layout tree** — inside or outside `NextIntlClientProvider`? Default: **inside** (palette UI uses i18n strings for card names). Planner confirms.
- **Console output on Konami unlock** — should we `console.log('%c🌈 Vaporwave unlocked!', ...)`? Optional flourish; planner can add cheaply.
- **prefers-reduced-motion fallback for the confetti burst** — fade-only or skip entirely? Suggest fade-only (still rewarding) but planner decides.

### Folded Todos

None — `gsd-tools todo match-phase 2` returned zero matches.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, Key Decisions table, Système de palettes (feature signature) requirements
- `.planning/REQUIREMENTS.md` §"Theme System (signature feature)" — THEME-01 through THEME-12 acceptance criteria
- `.planning/ROADMAP.md` §"Phase 2: Palette System" — phase goal + 5 success criteria
- `.planning/STATE.md` — current position, accumulated decisions, **Vaporwave WCAG pre-validation blocker**

### Prior phase context
- `.planning/phases/01-foundations/01-CONTEXT.md` — Terra default (D-06), PALETTES pre-declared (D-07), shadcn aliasing chain (D-10..D-13), `--destructive` fixed (D-12), FOUC `<head>` socket prepped, `suppressHydrationWarning` on `<html>`

### Research synthesis
- `.planning/research/SUMMARY.md` — executive summary; "Key Corrections vs PROJECT.md" table is mandatory reading
- `.planning/research/PITFALLS.md` — **§"Pitfall 1: FOUC"** (blocking script pattern, exact <head> shape), **§"Pitfall 3: 7-pair WCAG matrix"** (CRITICAL_PAIRS array, `pickTextOnAccent` pattern, validation algorithm), §"Pitfall 5: GSAP re-runs" (relevant for Phase 3 LenisProvider integration but Phase 2 ThemeProvider should expose a palette-changed hook the LenisProvider will consume)
- `.planning/research/FEATURES.md` — palette switcher positioning as "design system playground / WCAG-aware harmonic generator", visible WCAG ratio is the actual signature (not the 4 presets)
- `.planning/research/ARCHITECTURE.md` — theme provider pattern, build order
- `.planning/research/STACK.md` — culori install, motion patterns, canvas-confetti

### Existing code (Phase 1 deliverables)
- `lib/palettes.ts` — 5 typed palettes (Terra default + 4 visible + Vaporwave hidden); single source of truth for FOUC inline table
- `lib/utils.ts` — `cn()` helper
- `app/globals.css` — `:root` with 6 `--color-*` OKLCh tokens + full shadcn aliasing + 400ms global color transition + `@theme` wiring
- `app/[locale]/layout.tsx` — explicit `<head>` block + `suppressHydrationWarning` (FOUC integration socket, lines 27-42)
- `messages/{fr,en}.json` — `palette.*` namespace already has all keys (title, open, close, tabs, presets×5, custom×3, generate×{source,modes,generate}, wcag×{ratio,aa,aaa,fail})

### External docs (researcher fetches via context7)
- **culori** — `parse`, `formatCss`, `wcagContrast`, OKLCh helpers, `interpolate`/`mix` for token derivation (D-10), color conversion hex ↔ OKLCh
- **canvas-confetti** — dynamic import pattern, particle config API, color customization
- **shadcn/ui Sheet** — `side="right"` anatomy, focus trap, mobile responsive patterns
- **motion** (formerly framer-motion) — `motion/react` imports for FAB hover/open animations + `prefers-reduced-motion` patterns
- **Next.js Script** — `strategy="beforeInteractive"` usage in App Router (must be inside `<head>` from a Server Component to actually run pre-hydration)
- **WCAG 2.1 contrast formula** — 4.5:1 normal text, 3:1 UI components (icons, focus rings)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`lib/palettes.ts`** — `PALETTES` ReadonlyArray<Palette>, `PaletteId` type, `DEFAULT_PALETTE_ID = 'terra'`, `getPaletteById` helper. Phase 2 consumes this both server-side (build-time inline into FOUC script per D-03) and client-side (ThemeProvider, PalettePresets, HarmonicGenerator preview).
- **`lib/utils.ts`** — `cn()` for class merging; use throughout new components.
- **`app/globals.css`** — `:root` with 6 `--color-*` tokens (Terra defaults), full shadcn token aliasing chain (`--primary` → `var(--color-accent)`, etc.), global 400ms color transition. **Phase 2 mutates `--color-*` via `document.documentElement.style.setProperty`** — every shadcn component repaints automatically through the alias chain.
- **`app/[locale]/layout.tsx`** — `<html lang={locale} suppressHydrationWarning>` + explicit `<head>` block with FOUC socket comment (lines 27-42). Phase 2 drops `<Script strategy="beforeInteractive">` here.
- **`components/ui/*.tsx`** — button, card, dialog, popover, slider, switch, tabs (shadcn primitives). All already wired to `var(--color-*)` through the alias chain. Phase 2 ADDS `sheet` (D-04).
- **`components/theme/`** and **`components/providers/`** — empty directories ready for `ThemeProvider`, `PaletteSwitcher`, `PalettePresets`, `CustomColorPicker`, `HarmonicGenerator`, `WCAGBadge`, `PaletteFab`, etc.
- **`messages/{fr,en}.json`** — `palette.*` namespace complete (63 leaf keys across 9 namespaces, parity verified). Phase 2 only needs to **update `palette.presets.vaporwave` from `"???"` to `"Vaporwave"`** (D-15) and possibly add `palette.wcag.adjusted` for the "Adjusted for AA" chip (D-06).

### Established Patterns

- **shadcn token alias chain** — `bg-primary` → `--primary` → `var(--color-accent)` → Terra OKLCh in `:root`. Mutating `--color-accent` at runtime instantly repaints every component using `bg-primary` / `ring-ring` / `border-border` / etc. No per-component palette wiring needed in Phase 2.
- **OKLCh-only color authoring** — no hex / rgb / hsl literals anywhere in the codebase. culori is the conversion boundary at user-input ingress (hex from `<input type="color">` → OKLCh).
- **Server Components by default**; `"use client"` only when interaction. **ThemeProvider, PaletteSwitcher, all palette UI components must be `"use client"`**. The FOUC `<Script>` is rendered from the Server Component `LocaleLayout` but its content runs in the browser pre-hydration.
- **1 file = 1 responsibility** (atomic components). Expect ~10 new files in `components/theme/` and 1-2 in `components/providers/`.
- **No animations without `prefers-reduced-motion` gate** — FAB motion (D-08) and confetti burst (D-13) both gate.
- **next-intl** — translations live in `messages/{fr,en}.json`; never hardcode strings in components. Use `useTranslations('palette')` in client components and `getTranslations({ locale })` in server components.

### Integration Points

- **`app/[locale]/layout.tsx` `<head>`** — FOUC `<Script strategy="beforeInteractive">` drops in at the comment placeholder. The Script content must be a Server-Component-renderable string (Next.js requires beforeInteractive scripts to be in the root layout's head). Build-time inlining of PALETTES happens here.
- **`app/[locale]/layout.tsx` `<body>`** — `ThemeProvider` wraps `{children}` **inside** `NextIntlClientProvider` (so palette UI can use `useTranslations`).
- **FAB mount point** — also inside `ThemeProvider`, sibling to `{children}`. Visible on every route.
- **`lib/palettes.ts`** — consumed both server-side (FOUC script inline table) and client-side (ThemeProvider, PalettePresets). No changes to this file in Phase 2 except possibly switching `.name: '???'` to a computed value (but per D-15, leave it — i18n key is the display source).

</code_context>

<specifics>
## Specific Ideas

- **The 7 WCAG pairs are the contract** (from PROJECT.md): `text/bg`, `text/surface`, `textMuted/bg`, `textMuted/surface`, `accent/bg`, `accent/surface`, `secondary/bg`. `validateFullMatrix` returns `{ valid: boolean, failures: string[] }`. Minimum ratios: 4.5:1 for text pairs, 3:1 for accent/secondary as UI components (per WCAG 1.4.11).
- **"Adjusted for AA" chip wording** — EN: "Adjusted for AA" / FR: "Ajusté pour AA". Add as `palette.wcag.adjusted` in both message files.
- **FOUC script size budget: < 1 KB minified inline**. 5 palettes × 6 tokens ≈ 600 bytes + ~200 bytes of parsing logic. If approaching limit, drop Vaporwave from inline (it's hidden until unlock, so cold load never needs its values).
- **canvas-confetti dynamic-import idiom** — `const confetti = (await import('canvas-confetti')).default; confetti({ particleCount: 100, spread: 70, colors: [vaporwaveAccent, vaporwaveSecondary] });`
- **Sheet install command** — `npx shadcn@latest add sheet`. Verify it brings in `tw-animate-css` keyframes (`slide-in-from-right`, etc.) that integrate cleanly with the existing global 400ms transition.
- **Custom picker derivation order matters** — when user changes `bg`, immediately recompute `surface`, `text`, `textMuted`. When user changes `accent` or `secondary`, only re-run `validateFullMatrix` (accent/secondary don't affect the derived 3).
- **Vaporwave WCAG pre-validation** (STATE.md blocker) — run `validateFullMatrix(PALETTES.find(p => p.id === 'vaporwave'))` at lib/colors.ts unit-test time OR in a dev-time assertion. If it fails, apply `adjustForAA` at definition time and update the OKLCh values in `lib/palettes.ts` so the constant ships pre-passing. Researcher confirms which tokens need shifting.
- **The `useKonamiCode` hook listens at `window.addEventListener('keydown', ...)`** with input-focus filtering: `if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;` and `if (document.activeElement?.isContentEditable) return;`.
- **Sequence reset on wrong key** — useKonamiCode tracks `progress: number` (0-9, index into the sequence). Any key not matching `SEQUENCE[progress]` resets to 0 (unless the wrong key happens to match `SEQUENCE[0]`, then go to 1). This is the standard Konami implementation.

</specifics>

<deferred>
## Deferred Ideas

- **`tw-animate-css` integration check for Sheet** — confirm Sheet's built-in `slide-in-from-right` keyframes don't fight the global `transition: color, background-color, border-color` selector. (Planner notes; likely fine because transforms aren't in the global transition list.)
- **Palette export/import (URL share, JSON download)** — REQUIREMENTS.md THEME-v2-01.
- **Preview-before-application for Custom tab** — REQUIREMENTS.md THEME-v2-02. v1 ships Custom as direct-apply (instant feedback); Generate already has inline preview per D-12.
- **Audio cue on Konami unlock** — explicitly avoided (FEATURES.md anti-feature list: "Autoplay sound or unmute prompts").
- **More harmonic modes** (tetradic, square, monochromatic) — REQs explicitly call out 4 modes (complementary, triadic, analogous, split-complementary); additional modes are v2 if user feedback demands.
- **Last-used tab persistence** — rejected per D-07 (always default Presets).
- **"Reset to active preset" button in Custom tab** — not in REQs, not in discussion. Planner can add if trivial; otherwise v2.
- **"Randomize source color" shortcut in Generate** — not in REQs. v2 candidate.
- **ScrollTrigger.refresh() after palette swap** — Phase 3 concern (LenisProvider lives there). ThemeProvider in Phase 2 should expose a way for downstream consumers to subscribe to palette changes (e.g., a `paletteChangeEvent` via context, or a `onPaletteChange` callback prop). Planner picks the hook shape.
- **Cookie-based SSR palette restore** (for first-paint without client JS) — not in REQs, FOUC blocking script per D-03 handles this client-side. v2 if SEO-bot-friendly palette serialization becomes valuable.
- **"NEW" badge on Vaporwave card immediately after unlock** — rejected; the dramatic confetti + auto-switch is the discovery marker (D-14).

</deferred>

---

*Phase: 02-palette-system*
*Context gathered: 2026-05-26*
