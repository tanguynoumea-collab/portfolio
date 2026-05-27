# Phase 4 Deferred Items

Items discovered during Phase 4 execution that are OUT OF SCOPE for this phase
and tracked for later resolution.

## Tooling / Infrastructure

### Roadmap progress-table row counts stale
**Discovered:** Plan 04-03 execution (2026-05-27)
**Symptom:** The "Plan Progress" table in `.planning/ROADMAP.md` shows `0/6` plans for Phase 3 and Phase 4 even though both phases are marked Complete and have 6/6 SUMMARY.md files on disk.
**Root cause:** `gsd-tools roadmap update-plan-progress` correctly flips the per-plan checkboxes in the bulleted list section but does NOT update the corresponding row's numeric cell in the "Plan Progress" summary table further down. The `status` column updates but the count cell does not.
**Impact:** Cosmetic — the bulleted checklist accurately reflects state, but the summary table at the bottom is misleading.
**Scope:** Tool/infrastructure fix, not a plan deliverable. Defer to a `/gsd:fix-tooling` pass.

## Pre-existing test TypeScript warnings (Wave 1 inheritance)

### About.test.tsx line 104 — `Value of type 'Mock<Procedure | Constructable>' is not callable`
**Discovered:** Phase 4 Plan 03 build check
**Source:** Plan 04-02 (Wave 1)
**Symptom:** `npx tsc --noEmit` emits TS2348 at `About.test.tsx:104`.
**Impact:** Build is unaffected — `npm run build` (Next 16's TS check) passes 0; this is a vitest-only TS strictness issue, not a runtime error.
**Scope:** Plan 04-02 deliverable hardening; Phase 6 (accessibility-audit) lint-hardening pass can sweep this with other test-file TS issues.

### Hero.test.tsx line 237 — `Argument of type 'null' is not assignable to parameter of type '{ scrollTo: Mock<Procedure>; }'`
**Discovered:** Phase 4 Plan 03 build check
**Source:** Plan 04-01 (Wave 1)
**Symptom:** `npx tsc --noEmit` emits TS2345 at `Hero.test.tsx:237`. The `useLenisMock.mockReturnValue(null)` call doesn't match the mock's narrowed return type.
**Impact:** Build is unaffected; test runs fine at runtime (the mock returns null successfully, exercising the scrollIntoView fallback branch).
**Scope:** Plan 04-01 deliverable hardening; Phase 6 lint-hardening can adjust the mock's type signature to accept `{ scrollTo: Mock } | null`.
