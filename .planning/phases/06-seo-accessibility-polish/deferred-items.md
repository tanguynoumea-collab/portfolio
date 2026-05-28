# Deferred Items — Phase 06

Out-of-scope discoveries logged during execution. NOT fixed in their discovering plan.

## From 06-00 (install-audit-deps)

### Pre-existing `tsc --noEmit` errors in test files (NOT introduced by Wave 0)

`npx tsc --noEmit` reports 5 pre-existing errors in test files. Verified present on the
clean baseline (git stash of all 06-00 edits) — Wave 0 added ZERO new tsc errors.

- `components/sections/About.test.tsx:104` — TS2348 `vi.fn()` Mock not callable
- `components/sections/Hero.test.tsx:237` — TS2345 `null` not assignable to mock arg
- `lib/hooks/useParallax.test.tsx:74,75,77` — TS2348 `vi.fn()` Mock not callable

Root cause: `vi.fn()` generic-inference under TS strict (a known pattern — see STATE.md
Phase 04 "vi.fn() generic inference" deviation). These do NOT affect `npm test` (vitest
transpiles per-file without a full project typecheck), `npm run lint`, or `npm run build`,
all of which pass. The project has never gated on `tsc --noEmit` across test files.

Recommend a dedicated cleanup pass (or fold into 06-04 a11y-audit which already touches
test infra) to add explicit generics to the offending `vi.fn<...>()` calls. Out of scope
for the Wave 0 dependency gate.
