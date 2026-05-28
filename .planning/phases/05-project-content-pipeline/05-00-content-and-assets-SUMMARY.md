---
phase: 05-project-content-pipeline
plan: 00
subsystem: content
tags: [mdx, gray-matter, i18n, next-intl, typescript, content-pipeline, gallery]

# Dependency graph
requires:
  - phase: 01-foundations
    provides: discriminated Project union + getProjectBySlug/getProjectSlugs loaders + _* filter (D-24)
  - phase: 04-homepage-sections
    provides: 12 MDX stub bodies + projects.* i18n namespace + check-i18n-parity gate
provides:
  - "CommonFields.gallery?: string[] optional field on the Project type (validator accepts-but-not-requires)"
  - "12 enriched MDX case-study bodies (6 projects x 2 locales) with 4 H2 sections, 250-400 words each"
  - "gallery frontmatter on texture-manager + brand-system; 4 other projects omit it (validates skip path)"
  - "projects.detail.* i18n namespace (22 leaf keys/locale) incl. meta.{tech,design,bim} + meta.scale.* discriminator labels"
  - "scripts/check-mdx-structure.ts — CONTENT-01 gate (4 H2 sections + word-count)"
  - "24 placeholder gallery images at public/projects/{slug}/[1-4].jpg"
  - "_template.{fr,en}.mdx updated to the case-study scaffold with commented gallery example"
affects: [05-01-mdx-components, 05-03-project-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone tsx-runnable content gate (check-mdx-structure.ts) modeled on check-i18n-parity.ts — collect-all-failures + process.exit(1)"
    - "Optional discriminated-union field via conditional spread + (s): s is string predicate (no any)"
    - "Per-locale .{fr,en}.mdx bodies authored as faithful translations so both land in the 250-400 word band"

key-files:
  created:
    - lib/projects.test.ts
    - scripts/check-mdx-structure.ts
    - .planning/phases/05-project-content-pipeline/05-00-content-and-assets-SUMMARY.md
  modified:
    - lib/projects.ts
    - messages/fr.json
    - messages/en.json
    - content/projects/agora.{fr,en}.mdx
    - content/projects/texture-manager.{fr,en}.mdx
    - content/projects/brand-system.{fr,en}.mdx
    - content/projects/editorial-grid.{fr,en}.mdx
    - content/projects/residential-renovation.{fr,en}.mdx
    - content/projects/tower-concept.{fr,en}.mdx
    - content/projects/_template.{fr,en}.mdx

key-decisions:
  - "Authored Task 3's check-mdx-structure.ts BEFORE Task 2's bodies so the structure gate could verify content as it was written (committed in plan order: T1, T3, T2)"
  - "Used the orchestrator-specified SUMMARY filename (05-00-content-and-assets-SUMMARY.md) over the plan's shorthand (05-00-SUMMARY.md) for consistency with the init summaries convention"
  - "Picked texture-manager (Tech) + brand-system (Design) as the two gallery-bearing projects per RESEARCH discretion recommendation"

patterns-established:
  - "Content gate pattern: gray-matter parse + body.includes(marker) + split(/\\s+/) word count, exit 1 on any failure"
  - "Optional frontmatter field validated as string[]-or-undefined and conditionally spread into the common object"

requirements-completed: [CONTENT-01]

# Metrics
duration: 6min
completed: 2026-05-28
---

# Phase 5 Plan 00: Content and Assets Summary

**Optional gallery field on the Project type, 12 enriched bilingual MDX case-study bodies (4 H2 sections, 250-400 words), the projects.detail.* i18n namespace (22 keys/locale), a new check-mdx-structure CONTENT-01 gate, and 24 placeholder gallery images — the Wave 0 foundation that unblocks the Wave 2 project page.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-28T05:01:11Z
- **Completed:** 2026-05-28T05:07:20Z
- **Tasks:** 3
- **Files modified:** 41 (3 created + 14 MDX + 2 messages + 1 type + 1 script test + 24 images; note lib/projects.test.ts and check-mdx-structure.ts counted as created)

## Accomplishments

- Extended the discriminated `Project` type with an optional `gallery?: string[]` field (D-14); validator accepts-but-not-requires it, all 12 pre-existing stubs still validate (4 backward-compat tests green).
- Authored all 12 MDX case-study bodies (6 projects x FR/EN) with the D-01 4-heading structure (Contexte/Défi/Processus/Résultat | Context/Challenge/Process/Outcome), 250-400 words/locale, domain-tailored placeholder prose (Tech = code/perf, Design = visual systems, BIM = modeling/coordination).
- Added the `projects.detail.*` i18n namespace to both locales — exactly 22 leaf keys each, including the `meta.{tech,design,bim}` category labels and `meta.scale.{concept,residential,commercial,urban}` keys consumed by 05-03; FR/EN parity preserved (94 leaf paths).
- Shipped `scripts/check-mdx-structure.ts` — the CONTENT-01 gate asserting 4 H2 sections + word count; exits 0 on all 12 bodies.
- Seeded 24 placeholder gallery images and updated `_template.{fr,en}.mdx` to the new case-study scaffold.

## Task Commits

Each task was committed atomically (executed in plan order T1 → T3 → T2; Task 3's script was authored before Task 2's bodies so the structure gate could verify content as written):

1. **Task 1: Extend Project type with optional gallery + backward-compat test** - `b3c0dfa` (feat)
2. **Task 3: check-mdx-structure gate + projects.detail i18n + 24 placeholder images** - `428e978` (feat)
3. **Task 2: Author 12 MDX case-study bodies + gallery frontmatter + template** - `f670a14` (feat)

_Task 1 was authored test-first (RED→GREEN) but committed as a single atomic unit (type + test together)._

## Files Created/Modified

- `lib/projects.ts` - Added `gallery?: string[]` to CommonFields, gallery validation (throws on non-array), exported `validateFrontmatter`, conditional gallery spread.
- `lib/projects.test.ts` - 4 tests: accepts without gallery, accepts+preserves with gallery, throws on non-array, agora regression guard.
- `scripts/check-mdx-structure.ts` - CONTENT-01 gate: per-locale H2 markers + 250-400 word-count, collect-all-failures + exit code.
- `messages/fr.json` / `messages/en.json` - Added `projects.detail.*` (22 leaf keys/locale) merged into the existing `projects` key.
- `content/projects/{agora,texture-manager,brand-system,editorial-grid,residential-renovation,tower-concept}.{fr,en}.mdx` - Enriched 4-section bodies; texture-manager + brand-system carry gallery frontmatter.
- `content/projects/_template.{fr,en}.mdx` - Case-study scaffold + commented gallery example (excluded from the word-count gate via the `_*` filter).
- 24 images at `public/projects/{slug}/[1-4].jpg` - Placeholder copies of each slug's cover.jpg.

## Decisions Made

- **Task ordering vs commit ordering:** Task 2's verification (`check-mdx-structure.ts`) depends on the script created in Task 3; the plan permits "run Task 3 first or in same wave." Authored the script first, then the bodies, but committed in plan order (T1, T3, T2) so each task commit is self-consistent and its verification passes.
- **SUMMARY filename:** Used `05-00-content-and-assets-SUMMARY.md` (orchestrator success criteria + init `summaries` convention) rather than the plan's shorthand `05-00-SUMMARY.md`.
- **Gallery-bearing projects:** texture-manager (Tech) + brand-system (Design), per RESEARCH discretion recommendation.

## Deviations from Plan

None - plan executed exactly as written. (Task execution order vs commit order is documented under Decisions Made; it is permitted by the plan's own note "depends on Task 3 script existing — run Task 3 first or in same wave" and is not a code deviation.)

## Issues Encountered

- One typo introduced and immediately fixed during authoring (`ombportée` → `ombre portée` in tower-concept.fr.mdx) before any commit. No impact.
- The full test suite prints a benign jsdom warning ("HTMLCanvasElement's getContext()...") from the pre-existing confetti tests — not a failure; 226/226 tests pass.

## Known Stubs

These are intentional per D-03 and the phase's explicit deferrals (real content/assets swapped pre-deploy in Phase 7). They do NOT block CONTENT-01:

- **24 placeholder gallery images** (`public/projects/{slug}/[1-4].jpg`) — all are copies of each slug's `cover.jpg`. Visual repetition is intentional ("swap before deploy" signal). Resolved pre-deploy by the user.
- **Placeholder case-study prose** in all 12 MDX bodies — plausible first-person narratives with swappable specifics (per D-01, NOT lorem ipsum). User replaces with real copy pre-deploy.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Unblocks 05-03 (project page, Wave 2):** the 12 MDX bodies, the `gallery?` type field, the `projects.detail.*` i18n keys (incl. discriminator labels), and the 24 gallery assets are all in place.
- **No impact on Wave 1 (05-01 components, 05-02 parallax hook):** zero file overlap — those plans can execute in parallel.
- All gates green: `check-mdx-structure.ts` exits 0, `check-i18n-parity.ts` exits 0 (94 leaf paths), `npm test` 226/226, `npm run lint` clean.

## Self-Check: PASSED

- All created files verified on disk (lib/projects.test.ts, scripts/check-mdx-structure.ts, SUMMARY.md, sample MDX + gallery image).
- All 3 task commits verified in git history (b3c0dfa, 428e978, f670a14).

---
*Phase: 05-project-content-pipeline*
*Completed: 2026-05-28*
