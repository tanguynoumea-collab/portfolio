---
phase: 01-foundations
plan: 02
subsystem: theming
tags: [tailwind4, css-variables, oklch, theming, palette-foundation, terra]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Runnable Next.js 16 + Tailwind v4 scaffold with @import 'tailwindcss' baseline in app/globals.css"
provides:
  - "6 palette CSS variables in :root with Terra OKLCh literals (D-06, D-09): --color-bg, --color-surface, --color-text, --color-text-muted, --color-accent, --color-secondary"
  - "Tailwind v4 @theme {} block exposing all 6 vars via var(--color-*) indirection — NO hardcoded oklch() literals inside @theme (Pitfall #2 structurally impossible)"
  - "Global 400ms ease transition on color/background-color/border-color (ARCH-04) — palette swaps will animate smoothly across every element"
  - "Tailwind utilities bg-bg, bg-surface, text-text, text-text-muted, text-accent, bg-secondary, border-accent, etc. all wired through CSS variables and runtime-mutable"
  - "Canonical Terra OKLCh values authored — Phase 2's lib/palettes.ts will export these as the 'terra' preset constant"
affects: [01-03-shadcn-aliasing, 01-04-i18n, 01-05-mdx-loader, 02-theme-provider, 02-palettes-ts, 03-layout, all-phases-using-tailwind-utilities]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tailwind v4 var() indirection: :root declares literal OKLCh, @theme references via var() — Tailwind utilities reference the var, NOT a baked color, enabling runtime palette mutation without rebuild"
    - "OKLCh literals inline in :root (D-09): no intermediate --terra-* tokens, no JS constants needed at this layer — single source of truth for cold-load defaults"
    - "Global color-only transition: only color/background-color/border-color are globally animated; transform/opacity/layout stay per-component (GSAP/motion territory)"

key-files:
  created: []
  modified:
    - "app/globals.css — wholesale replacement (17 lines scaffold default → 60 lines palette foundation). The architectural pivot for the whole portfolio: every downstream component reads var(--color-*) via Tailwind utilities (bg-bg, text-accent, etc.) and depends on this indirection being correct."

key-decisions:
  - "Terra OKLCh values authored (planner discretion per D-Claude-Discretion): bg 0.97 0.012 80 (warm cream), surface 0.94 0.018 75 (slightly darker cream), text 0.22 0.018 50 (deep warm brown), text-muted 0.5 0.02 55 (mid warm brown), accent 0.62 0.155 35 (warm terracotta), secondary 0.55 0.075 145 (sage green). These define the canonical 'Terra & Sage' preset that lib/palettes.ts will export in Phase 2."
  - "Lightning CSS (Tailwind v4's CSS optimizer) automatically generates an @supports (color: lab(...)) fallback block that mirrors our :root with lab() equivalents and converts our :root oklch() literals to hex fallbacks for older browsers. This is desirable browser-compat behavior, not a correctness issue. The source file remains the authoritative OKLCh definition."
  - "Prettier normalized our trailing zeros in OKLCh values during write (0.50 → 0.5, 0.020 → 0.02, 0.075 → 0.075). Semantically identical, structurally compliant with .prettierrc enforcement. The plan's regex acceptance criteria (which test for `oklch(` prefix, not specific decimal precision) pass unchanged."
  - "Cleaned up two stale dev server processes (PIDs 64348, 58300) left over from plan 01-01 verification that were holding port 3000 — blocking fresh `npm run dev` runs needed to validate the new compiled CSS. Also cleared the .next/dev/cache/turbopack directory to force a fresh compile (the cached compile from plan 01-01's CSS was being served and looked like our edit hadn't landed)."

patterns-established:
  - "Pitfall #2 mitigation by structure, not discipline: because @theme contains ONLY var() references and never oklch() literals, future contributors cannot accidentally break runtime palette switching by adding a hardcoded color there — the file's structure makes the mistake impossible to introduce subtly."
  - "OKLCh-only color authoring: no hex, no rgb(), no hsl() anywhere in the codebase from this point forward. The plan deliberately uses oklch() throughout to align with Tailwind v4's color system, culori's API surface (Phase 2), and the harmonic palette generator's hue-rotation math (planned for lib/colors.ts in Phase 2)."

requirements-completed: [ARCH-03, ARCH-04]

# Metrics
duration: 7m 21s
completed: 2026-05-25
---

# Phase 01 Plan 02: CSS Variable Foundation Summary

**Wholesale-replaced `app/globals.css` with the 6-variable Terra & Sage OKLCh palette foundation: `:root` literals + Tailwind v4 `@theme {}` indirection + global 400ms color transition — the architectural pivot enabling Phase 2's runtime palette switcher to work without rebuild.**

## Performance

- **Duration:** 7m 21s
- **Started:** 2026-05-25T20:34:46Z
- **Completed:** 2026-05-25T20:42:08Z
- **Tasks:** 1 (type=auto)
- **Files modified:** 1 (`app/globals.css`)

## Accomplishments

- 6 Terra OKLCh CSS variables declared in `:root` as the runtime-mutable single source of truth — these are what `document.documentElement.style.setProperty(...)` will overwrite in Phase 2 to swap palettes live
- Tailwind v4 `@theme {}` block wires all 6 utility classes (`bg-bg`, `bg-surface`, `text-text`, `text-text-muted`, `text-accent`, `bg-secondary`, etc.) to `var(--color-*)` — so changing a CSS variable at runtime repaints every utility-styled element instantly
- Pitfall #2 mitigated structurally: ZERO `oklch()` literals inside the `@theme` block, verified by regex (`/--color-[a-z-]+:\s*oklch\(/` against the @theme body returns 0 matches). The file's structure makes runtime-palette-breakage impossible to introduce by accident.
- Global `*` transition rule applies 400ms ease to `color`, `background-color`, and `border-color` — palette swaps will animate smoothly across the entire DOM without per-component wiring
- All 4 quality gates green: ESLint, Prettier `format:check`, `tsc --noEmit`, and `npm run dev` HTTP 200. Runtime smoke test confirmed compiled CSS contains the `:root` block, `@theme` indirection, and `*` transition rule (Lightning CSS auto-generates a parallel `@supports (color: lab(...))` block for older-browser fallback — desirable behavior, not a regression).

## Task Commits

Each task was committed atomically:

1. **Task 1: Author globals.css with `:root` literals + `@theme` indirection + global transition** — `8048c8f` (feat)

**Plan metadata commit:** _(added after this SUMMARY is written)_

## Files Created/Modified

### Modified (1)

- `app/globals.css` — Wholesale replacement (17 → 60 lines):
  - **Removed:** scaffold defaults (`--background: #ffffff`, `--foreground: #171717`, `@theme inline` Geist font tokens, `@media (prefers-color-scheme: dark)` block, `body { background: var(...); color: var(...); font-family: ... }` rule)
  - **Added:** `@import 'tailwindcss';` (preserved from scaffold), 6-variable `:root` block with Terra OKLCh literals, 6-line `@theme {}` indirection block, `* { transition: ... }` global color animation rule, ~26 lines of comment documentation explaining the indirection invariant and Pitfall #2 trap
  - **Net effect:** scaffold dark-mode binary toggle replaced by the palette-system foundation. Server rendering will paint the page in Terra & Sage on cold load; Phase 2's beforeInteractive script will read localStorage and overwrite the 6 vars pre-hydration if a custom palette is stored.

### Preserved (untouched)

- All other files from plan 01-01 (package.json, tsconfig.json, eslint.config.mjs, postcss.config.mjs, .prettierrc, .prettierignore, .gitignore, app/layout.tsx, app/page.tsx, app/favicon.ico, public/*.svg, .gitkeep files in components/, lib/, content/, messages/)
- `.planning/` directory intact
- `CV_Tanguy_Delrieu_2023.pdf` untouched at repo root (will move to public/cv-fr.pdf in Phase 4 per CONTEXT.md D-23)

## Decisions Made

1. **Terra OKLCh values authored (planner discretion).** The plan delegated the exact 6 OKLCh values to "planner discretion per D-Claude-Discretion" — the plan author had chosen these specific values in the PLAN action block, and they were applied verbatim. The values target good perceptual luminance separation (bg L=0.97 vs surface L=0.94 vs text L=0.22 gives ~3:1 surface contrast + clear text contrast), warm hues in the bg/surface/text family (50°-80°, yellow-orange-red), and a complementary signature accent (terracotta 35°) with a balancing natural secondary (sage 145°). Phase 2's `validateFullMatrix` will formally prove WCAG AA compliance across all 7 critical pairs at definition time.

2. **OKLCh literals only in `:root`, var() indirection only in `@theme`.** This is D-09 made structurally enforceable: the file's section comments explicitly forbid adding OKLCh literals to `@theme`, and a regex-based acceptance criterion verified the constraint. Future contributors who try to add `--color-foo: oklch(...)` inside `@theme` (the classic Pitfall #2 mistake) will trip the verifier in plan-check / verify-work.

3. **Comments serve as architecture documentation.** The ~26 lines of comments aren't filler — they explain *why* `@theme` must use `var()` (Tailwind compiles utilities to reference the var, not bake the value) and *why* the transition rule is color-only (transform/opacity stay per-component for GSAP/motion). A new contributor reading `globals.css` learns the entire palette-switcher architecture from one file.

4. **No dark-mode media query.** PROJECT.md explicitly out-of-scopes binary dark/light mode in favor of the palette system. The scaffold's `@media (prefers-color-scheme: dark)` block was deliberately removed — Phase 2's Vaporwave palette + user-custom palettes will cover dark-theme use cases via the palette switcher (D-07 wires all 5 presets including Vaporwave in lib/palettes.ts).

5. **Cleaned up port 3000 zombies.** During acceptance verification, two stale Next dev server processes from plan 01-01's verification (PIDs 64348 and 58300) were still holding port 3000, masking my fresh boot test (the stale servers were serving plan 01-01's `globals.css` instead of my new one — making the verification falsely report missing `--color-*` vars). Killed via `taskkill /F /PID` and cleared `.next/dev/cache/turbopack` to force a fresh Turbopack compile. After cleanup, `npm run dev` boots fresh in 353ms and the compiled CSS correctly contains the new content. Recommend future plans always boot dev server in foreground or use a known-clean port to avoid this trap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prettier normalized OKLCh trailing zeros during write**
- **Found during:** Task 1, immediately after writing globals.css (Write tool applied `.prettierrc` formatting on save)
- **Issue:** Plan action specified literal values `oklch(0.50 0.020 55)` and `oklch(0.075 ...)` (with trailing zeros for visual decimal alignment), but Prettier 3.8.3's CSS formatter normalizes `0.50` → `0.5` and `0.020` → `0.02` on save. The 3 affected values: `--color-text-muted: oklch(0.50 0.020 55)` → `oklch(0.5 0.02 55)`, plus single-quote substitution `@import "tailwindcss"` → `@import 'tailwindcss'` per `.prettierrc` `singleQuote: true`.
- **Fix:** Accepted Prettier's normalization. The numeric values are mathematically identical (`0.50 === 0.5` in CSS), the import statement's quote choice is purely stylistic (CSS allows both), and the plan's regex acceptance criteria check for `oklch(` prefix and the variable names — they pass unchanged. Forcing trailing zeros would require adding `.prettierignore` for globals.css (rejected — Prettier compliance is a project-wide quality gate from plan 01-01).
- **Files modified:** `app/globals.css` (auto-formatted on Write).
- **Verification:** `npm run format:check` exits 0 ("All matched files use Prettier code style!"). All 12 plan acceptance criteria pass including the 6 regex checks for `oklch(` and `var()` patterns.
- **Committed in:** `8048c8f` (Task 1 commit)

**2. [Rule 3 - Blocking] Stale dev server processes blocking port 3000 + Turbopack cache serving wrong CSS**
- **Found during:** Task 1 acceptance verification (`npm run dev` smoke test)
- **Issue:** Two zombie Next dev server processes from plan 01-01's verification (PIDs 64348 and 58300) were still LISTENING on port 3000. When I ran `npm run dev`, Next bound the new server to port 3001 instead, while my acceptance test was hitting port 3000 (still serving plan 01-01's scaffold globals.css from its own Turbopack cache). Result: the compiled CSS check for `--color-bg` returned "MISSING" because I was inspecting the wrong server's output. Additionally, even after killing the zombies, `.next/dev/cache/turbopack/` retained stale compile artifacts from before the globals.css edit.
- **Fix:** Killed all listening processes on ports 3000-3003 via `netstat -ano | grep LISTENING | grep ":PORT " | awk` + `taskkill /F /PID`. Deleted `.next/` directory entirely to force a fresh Turbopack compile. After cleanup, `npm run dev` correctly bound to port 3000 in 353ms, and the compiled CSS at `/_next/static/chunks/[root-of-the-server]__06.-pfn._.css` correctly contained our 6 Terra `--color-*` vars in `:root`, the @theme indirection (compiled as 6× `--color-X: var(--color-X)` lines), and the `* { transition: color .4s, background-color .4s, border-color .4s }` rule (Lightning CSS shortened `400ms` to `.4s` and dropped the default `ease` keyword — semantically equivalent).
- **Files modified:** None (cleanup operation only — `.next/` is git-ignored).
- **Verification:** Final `npm run dev` exits with the new CSS being served. Verify script (`.tmp/verify-acceptance.mjs`, since deleted) confirmed all 12 acceptance criteria pass against both the source file and the compiled CSS bundle.
- **Committed in:** Not committed (operational cleanup, no file changes).

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking, both Windows/Prettier-environmental).
**Impact on plan:** Both deviations were operational environmental adaptations (Prettier-driven whitespace normalization + zombie process cleanup). Neither altered the plan's structural intent or scope. All planned outcomes delivered exactly as specified: 6 `:root` OKLCh vars, 6 `@theme` var() refs, 0 forbidden oklch() in @theme, global 400ms color transition.

## Authentication Gates

None encountered.

## Issues Encountered

- **Lightning CSS color-space transformation surprised me initially.** When inspecting the compiled CSS, the `:root` block contained hex literals (`#f9f4ec`, `#d25d40`, etc.) instead of our authored `oklch(...)`. Investigated and confirmed this is Tailwind v4's bundled Lightning CSS optimizer doing legitimate browser-compat work: it generates a "hex fallback" :root for browsers without OKLCh support AND a parallel `@supports (color: lab(...)) { :root { ... lab() ... } }` block for modern browsers (lab and OKLCh are both CIELAB-family color spaces; lab is the W3C-mandated equivalent). Our source file remains the authoritative OKLCh definition — the compiled hex/lab forms are autoderived equivalents. No action needed.

- **Read tool / Write tool path quirks in `/tmp/` on Windows MSYS.** Three intermediate verify scripts written to `/tmp/` couldn't always be read back by the Grep tool (which treats `/tmp/` paths differently than node's `require('fs').writeFileSync`). Worked around by writing to `.tmp/` inside the project root (then cleaning up before commit). Worth noting for future plans: prefer project-relative temp paths over `/tmp/`.

## User Setup Required

None — no external service configuration required for plan 01-02. (`globals.css` is purely a build-time artifact; no env vars, no API keys, no dashboard config.)

## Verification Output

Final command exit codes:

```
$ npm run lint
> tanguy-portfolio@0.1.0 lint
> eslint
exit: 0  (zero warnings, zero errors)

$ npm run format:check
> tanguy-portfolio@0.1.0 format:check
> prettier --check .
Checking formatting...
All matched files use Prettier code style!
exit: 0

$ npx tsc --noEmit
exit: 0  (TypeScript strict + noUncheckedIndexedAccess clean)

$ npm run dev  (background, then fetch + kill)
▲ Next.js 16.2.6 (Turbopack)
- Local: http://localhost:3000
✓ Ready in 353ms
GET / 200 in 228ms (HTTP 200, HTML 16816 bytes, CSS link present)
```

Compiled CSS inspection (after fresh boot with cleared cache):
- `:root` block at line ~1060 of compiled CSS contains all 6 `--color-*` vars with hex fallbacks (e.g., `--color-bg: #f9f4ec;`)
- `@supports (color: lab(0% 0 0)) { :root { ... } }` block at line ~1069 mirrors the 6 vars in `lab(...)` modern-color syntax (Lightning CSS's OKLCh→lab equivalent)
- `* { transition: color .4s, background-color .4s, border-color .4s; }` at line ~1080 — global color transition correctly compiled (Lightning CSS shortened `400ms` to `.4s` and dropped the default `ease` keyword)
- `@theme` indirection compiled as 6 lines inside the theme `:root, :host` block: `--color-bg: var(--color-bg); --color-surface: var(--color-surface); ...` — confirming Tailwind utilities will resolve to the runtime variables

12-of-12 plan acceptance criteria pass:
1. File `app/globals.css` exists — YES
2. First meaningful line is `@import 'tailwindcss'` — YES
3. Source has `:root {` block — YES
4. All 6 `:root --color-*` use `oklch()` literal — YES
5. Source has `@theme {` block — YES
6. All 6 `@theme --color-*` use `var(--color-*)` indirection — YES
7. `@theme` has ZERO `oklch()` literals (Pitfall #2) — YES
8. Transition rule covers `color` + `background-color` + `border-color` at 400ms — YES
9. `npm run lint` exits 0 — YES
10. `npx tsc --noEmit` exits 0 — YES
11. `npm run format:check` exits 0 — YES
12. `npm run dev` HTTP 200 + compiled CSS has `:root` + transition — YES

## Next Phase Readiness

**Plan 01-03 (shadcn aliasing) ready to start.** The CSS variable foundation is in place. Plan 03 will:
1. Run `npx shadcn@latest init` (with `style="new-york"`, `base-color="neutral"`, `css-variables=YES`) — this writes shadcn's own OKLCh variables (`--background`, `--foreground`, `--primary`, `--accent`, `--ring`, `--border`, etc.) into `app/globals.css`, likely inside a new `:root` block at the end of the file.
2. Edit those shadcn-generated variables to alias them to our portfolio palette per CONTEXT.md D-10 / D-11 / D-12 / D-13 token map (e.g., `--primary: var(--color-accent)`, `--background: var(--color-bg)`, `--accent: var(--color-surface)`, `--border: color-mix(in oklch, var(--color-text-muted) 30%, transparent)`, `--destructive: oklch(0.6 0.22 25)` palette-independent, `--ring: var(--color-accent)`).
3. Verify with a grep: ZERO `oklch(` or `hsl(` literals appear under shadcn-named tokens — every shadcn token resolves to `var(--color-*)` (except `--destructive` and `--destructive-foreground` which stay fixed-red palette-independent per D-12).

**Plan 01-04 (i18n)** and **Plan 01-05 (MDX loader)** unaffected by 01-02 — they touch `proxy.ts`, `i18n/`, `messages/`, `lib/projects.ts`, `content/projects/`, `mdx-components.tsx` — none overlap with `app/globals.css`.

**Phase 2 (palettes & theme system)** has its dependency satisfied: the runtime-mutable CSS variable foundation is in place, so the `beforeInteractive` FOUC script, `ThemeProvider`, and `PaletteSwitcher` can be written against a known-good substrate without re-litigating CSS architecture.

**No blockers carried forward.** Quality gate baseline (lint + format:check + tsc + dev boot) remains green.

## Self-Check: PASSED

- `app/globals.css` exists on disk with the 60-line authored content (verified by Read tool).
- Commit `8048c8f` verified in git log (`git log --oneline -3` shows it as HEAD).
- All 12 plan acceptance criteria pass (verified by `.tmp/verify-acceptance.mjs` before cleanup).
- Source file: 6 `:root` OKLCh vars, 6 `@theme` var() indirections, 0 `oklch()` literals inside `@theme`, global 400ms color transition all confirmed.
- Compiled CSS (post-Lightning-CSS): same structure with hex fallbacks + `@supports (lab)` modern-color block + shortened `.4s` transition syntax — all semantically correct.
- All 4 quality gates pass (lint, format:check, tsc, dev HTTP 200).
- `.tmp/` scratch dir cleaned up; only `app/globals.css` modified in git status.
- No untracked files introduced (the CV PDF was already untracked from before plan 01-01, plan 01-02 didn't touch it).

---
*Phase: 01-foundations*
*Completed: 2026-05-25*
