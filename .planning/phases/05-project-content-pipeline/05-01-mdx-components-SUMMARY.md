---
phase: 05-project-content-pipeline
plan: 01
subsystem: ui
tags: [mdx, next-mdx, rehype-pretty-code, shadcn-dialog, motion, lucide, clipboard, lenis, i18n, vitest]

# Dependency graph
requires:
  - phase: 01-foundations
    provides: mdx-components.tsx scaffold, shadcn Dialog primitive, cn() util, OKLCh palette alias chain (--primary/--destructive/--muted/--border)
  - phase: 02-palette-system
    provides: usePrefersReducedMotion (useSyncExternalStore), D-02 silent-clipboard-fallback precedent
  - phase: 03-layout-animation-foundation
    provides: LenisProvider data-lenis-prevent contract (D-04), i18n/navigation Link barrel
  - phase: 04-homepage-sections
    provides: Contact D-20 clipboard pattern (writeText + AnimatePresence Copy↔Check + 1.5s revert), About.test prop-dump + MatchMediaController test conventions
  - phase: 05-project-content-pipeline
    provides: 05-00 projects.detail.* i18n keys (imageZoom/copy/copied), CommonFields.gallery?, 12 MDX bodies
provides:
  - components/mdx/Image.tsx (client Dialog click-to-zoom MDX image, data-lenis-prevent on DialogContent, reduced-motion-gated hover)
  - components/mdx/CodeBlock.tsx (<pre> override consuming rehype-pretty-code data-language, copy button via textContent extraction)
  - components/mdx/Callout.tsx (server component, info/warning/note variants, lucide icons, palette-aliased backgrounds)
  - mdx-components.tsx registry wiring Image/Callout/pre + external/internal a override + h1-h3/p/ul/ol/blockquote prose overrides
affects: [05-03-project-page, project-detail-rendering, mdx-authoring]

# Tech tracking
tech-stack:
  added: []  # Phase 5 adds ZERO new dependencies — all libs already installed
  patterns:
    - "MDX <pre> override consuming rehype-pretty-code data-language attribute (no transformer, textContent for raw copy — Pitfall 5F)"
    - "data-lenis-prevent on shadcn DialogContent ONLY (Pitfall 5C) — never Overlay/Trigger"
    - "Server vs client MDX component split: Callout=server (presentation), Image/CodeBlock=client (Dialog state / clipboard)"
    - "Root-level vitest include glob for App-Router-convention root files"

key-files:
  created:
    - components/mdx/Callout.tsx
    - components/mdx/Callout.test.tsx
    - components/mdx/Image.tsx
    - components/mdx/Image.test.tsx
    - components/mdx/CodeBlock.tsx
    - components/mdx/CodeBlock.test.tsx
    - mdx-components.test.tsx
  modified:
    - mdx-components.tsx
    - vitest.config.ts

key-decisions:
  - "data-lenis-prevent placed on DialogContent only (Pitfall 5C) so zoom-modal scroll never moves the page behind it"
  - "CodeBlock copies preRef.current.textContent (Pitfall 5F) — raw source 1:1, no rehype transformer, no next.config.ts change"
  - "warning Callout uses the fixed --destructive token (Phase 1 D-12), NOT a --color-* alias — palette-independent warning signal"
  - "Reused Phase 4 Contact D-20 clipboard pattern verbatim in CodeBlock (writeText + Copy↔Check AnimatePresence + 1500ms revert + silent catch)"

patterns-established:
  - "MDX pre override: rehype-pretty-code emits data-language on <pre>; consume via typed prop with 'text' fallback, copy via DOM textContent"
  - "MDX a override single audit point: http(s) → target=_blank rel=noopener noreferrer; else next-intl locale-aware Link"
  - "Prose overrides in mdx-components.tsx (Pitfall 5G) since max-w-prose constrains width not heading sizes"

requirements-completed: [CONTENT-03]

# Metrics
duration: 5m 22s
completed: 2026-05-28
---

# Phase 5 Plan 1: MDX Components Summary

**Three custom MDX components (shadcn-Dialog image zoom with data-lenis-prevent, rehype-pretty-code `<pre>` override with clipboard copy + language badge, server-side info/warning/note Callout) plus the `mdx-components.tsx` registry wiring them with an external/internal `a` override and prose overrides.**

## Performance

- **Duration:** 5m 22s
- **Started:** 2026-05-28T05:10:51Z
- **Completed:** 2026-05-28T05:16:13Z
- **Tasks:** 3
- **Files modified:** 9 (7 created, 2 modified)

## Accomplishments
- `components/mdx/Callout.tsx` — server component with 3 variants (info/warning/note), lucide icons (Info/AlertTriangle/StickyNote), palette-aliased tinted backgrounds, optional title; zero color literals.
- `components/mdx/Image.tsx` — client component, shadcn Dialog click-to-zoom with `data-lenis-prevent` on `DialogContent` (Pitfall 5C) + `usePrefersReducedMotion`-gated hover scale; props mirror `next/image`.
- `components/mdx/CodeBlock.tsx` — `<pre>` override consuming rehype-pretty-code `data-language` into a badge + copy button that extracts raw source via `textContent` (Pitfall 5F) with a Copy↔Check 1.5s revert (Phase 4 Contact D-20 pattern).
- `mdx-components.tsx` — registry wiring `Image`, `Callout`, `pre: CodeBlock`, an external-vs-internal `a` override, and h1-h3/p/ul/ol/blockquote prose overrides; preserves the passthrough spread.
- 31 new Vitest tests (10 Callout + 6 Image + 5 CodeBlock + 10 registry), full suite 257/257, lint clean.

## Task Commits

Each task was committed atomically:

1. **Task 1: Callout.tsx (3 variants, server component) + test** - `3ecc470` (feat)
2. **Task 2: Image.tsx (Dialog zoom) + CodeBlock.tsx (pre override) + tests** - `fd953f4` (feat)
3. **Task 3: Extend mdx-components.tsx (wire Image/Callout/pre/a + prose) + test** - `65305d9` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

_Note: TDD Tasks 1 & 2 verified RED (missing module) → GREEN; no separate test/feat commits — test + implementation shipped together per existing repo convention (component + co-located test in one commit, matching Phase 4)._

## Files Created/Modified
- `components/mdx/Callout.tsx` - Server component, info/warning/note variants with lucide icons + palette-aliased bg (RESEARCH Code Example #6).
- `components/mdx/Callout.test.tsx` - 10 tests: variant→icon mapping, palette classes, title/children, zero color literals.
- `components/mdx/Image.tsx` - Client Dialog zoom MDX image, data-lenis-prevent on DialogContent, reduced-motion hover gate (RESEARCH Code Example #4).
- `components/mdx/Image.test.tsx` - 6 tests: next/image props, trigger→DialogContent data-lenis-prevent, reduced-motion whileHover gate.
- `components/mdx/CodeBlock.tsx` - `<pre>` override, data-language badge, textContent clipboard copy, Copy↔Check revert (RESEARCH Code Example #5).
- `components/mdx/CodeBlock.test.tsx` - 5 tests: language badge (+text fallback), writeText with textContent, 1500ms Copy↔Check revert (fake timers).
- `mdx-components.tsx` - Registry wiring all 3 components + a override + prose overrides (RESEARCH Code Example #7).
- `mdx-components.test.tsx` - 10 tests: component wiring, both a-override branches (external target/rel; internal Link), prose sizing.
- `vitest.config.ts` - Added root-level test glob (`*.{test,spec}.{ts,tsx}`) so the root-convention registry test is discovered.

## Decisions Made
- Followed RESEARCH.md Code Examples #4-#7 verbatim (Image / CodeBlock / Callout / registry) — all four were pre-verified against installed library versions.
- SUMMARY filename uses the full-slug form `05-01-mdx-components-SUMMARY.md` to match the directory convention (05-00-content-and-assets-SUMMARY.md) and the explicit success criterion, rather than the plan's terser `<output>` `05-01-SUMMARY.md`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added root-level test glob to vitest include**
- **Found during:** Task 3 (mdx-components.test.tsx)
- **Issue:** `vitest.config.ts` `include` covered only `lib/`, `components/`, `scripts/`, `app/`. The MDX registry lives at the project root per the @next/mdx App Router convention, so its co-located test (`mdx-components.test.tsx`) sits at the root too — and `npm test mdx-components` would have discovered ZERO tests, silently passing the acceptance gate.
- **Fix:** Appended `'*.{test,spec}.{ts,tsx}'` to the include array.
- **Files modified:** vitest.config.ts
- **Verification:** `npm test mdx-components` now discovers and runs 10 tests; full suite reports 32 files / 257 tests (was 28 / 226).
- **Committed in:** `65305d9` (Task 3 commit)

**2. [Rule 1 - Bug] Cleaned unused destructured props in Image.test mocks**
- **Found during:** Task 2 (Image.test.tsx)
- **Issue:** The motion.button and DialogContent mocks destructured `transition` / `showCloseButton` with `_`-prefixed throwaway names, but the project's `@typescript-eslint/no-unused-vars` is not configured with `argsIgnorePattern: '^_'` → 2 lint warnings that would surface in `npm run lint`.
- **Fix:** Restructured the mocks to strip non-DOM props inside the body (`void`-ed) instead of prefixing, so no unused bindings remain.
- **Files modified:** components/mdx/Image.test.tsx
- **Verification:** `npx eslint components/mdx/Image.test.tsx` → 0 problems; `npm run lint` exit 0.
- **Committed in:** `fd953f4` (Task 2 commit)

**3. [Rule 1 - Bug] Rephrased a doc comment to avoid the literal `MDXProvider` token**
- **Found during:** Task 3 (mdx-components.tsx)
- **Issue:** The Pitfall-8 doc comment said "Do NOT introduce MDXProvider context" — but acceptance criterion "does NOT contain 'MDXProvider'" is a literal grep; the comment would trip a strict verifier even though no provider is used in code.
- **Fix:** Reworded to "Do NOT introduce the @mdx-js/react provider context" — same guidance, no false-positive token.
- **Files modified:** mdx-components.tsx
- **Verification:** Grep for `MDXProvider` in mdx-components.tsx → 0 matches; tests still 10/10.
- **Committed in:** `65305d9` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bug). **Impact on plan:** All necessary for correctness (test discovery), a clean lint gate, and a clean verification grep. No scope creep — every change serves a stated plan gate.

## Issues Encountered
- None of substance. RED→GREEN flowed as expected for the two TDD tasks (both failed first on the missing module, then passed once the implementation landed). The harmless `LF will be replaced by CRLF` git warnings are Windows line-ending normalization, not errors.

## Known Stubs
None. All three components consume real data sources: the `projects.detail.*` i18n keys (imageZoom/copy/copied) shipped in 05-00, rehype-pretty-code is wired in `next.config.ts`, and the shadcn Dialog + Lenis + motion infrastructure all pre-exist. No hardcoded empty values, placeholders, or unwired props.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CONTENT-03 satisfied: the 3 custom MDX components are usable from any MDX file via the auto-discovered `mdx-components.tsx` registry (no explicit `components={...}` prop needed).
- **Ready for 05-03 (project page):** the project page can render MDX bodies (Callout + fenced code via `pre: CodeBlock`) and reuse `MDXImage` for gallery cells. `data-lenis-prevent` is correctly placed for the zoom modal; warning Callout uses the fixed `--destructive` token; zero hardcoded colors.
- Wave 1 sibling 05-02 (useParallax) shares zero files with this plan — no merge risk.

## Self-Check: PASSED

---
*Phase: 05-project-content-pipeline*
*Completed: 2026-05-28*
