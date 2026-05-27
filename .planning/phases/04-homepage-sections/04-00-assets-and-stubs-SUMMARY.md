---
phase: 04-homepage-sections
plan: 00-assets-and-stubs
subsystem: foundation
tags: [assets, mdx, i18n, shadcn, badge, tailwind-v4, oklch, tdd, server-component]

# Dependency graph
requires:
  - phase: 01-foundations
    provides: discriminated Project union + getProjects loader (D-18..D-24); fixed-token precedent (D-12 --destructive)
  - phase: 02-color-system
    provides: 6-token OKLCh palette runtime ThemeProvider model — Phase 4 category tokens follow the FIXED-token sibling pattern (palette-independent)
  - phase: 03-layout-animation-foundation
    provides: section-ID navigation IDs (home/about/projects/skills/contact); Footer + Navigation + Lenis providers; page.tsx placeholder shells
provides:
  - 9 binary assets (2 CV PDFs, 1 about-photo, 6 project covers) ready for next/image
  - 12 MDX project stubs (2 Tech / 2 Design / 2 BIM × FR/EN) validated by getProjects() against discriminated Project union
  - lib/constants.ts central user-data module (EMAIL / GITHUB_URL / LINKEDIN_URL)
  - 3 fixed --color-category-{tech,design,bim} OKLCh tokens in :root AND @theme inline (palette-independent)
  - shadcn Badge primitive with 3 NEW category-{tech,design,bim} CVA variants
  - i18n schema extended with about.paragraphs.{1,2}, skills.groups.{tech,design,bim}.{label,items}, hero.scrollCue (FR/EN parity at 72 leaf paths)
  - scripts/check-i18n-parity.ts parity-gate script
  - app/[locale]/page.tsx async Server Component composing 5 section components with server-loaded projects prop
  - 8 RED TDD test harnesses (Hero/About/CategoryFilter/ProjectCard/ProjectGrid/ProjectsSection/Skills/Contact) for Wave 1+2 to turn GREEN
affects:
  - 04-01 (Hero) - imports lib/constants for EMAIL, uses hero.scrollCue i18n key, uses Hero.test.tsx as GREEN target
  - 04-02 (About) - uses about.paragraphs i18n keys, uses About.test.tsx
  - 04-03 (Projects) - imports Project union from lib/projects, uses Badge variants category-{tech,design,bim}, uses projects/* covers + 12 MDX stubs, uses CategoryFilter/ProjectCard/ProjectGrid/ProjectsSection.test.tsx
  - 04-04 (Skills) - uses skills.groups.{tech,design,bim}.items i18n + Badge variants, uses Skills.test.tsx
  - 04-05 (Contact) - imports lib/constants for EMAIL/GITHUB_URL/LINKEDIN_URL, uses contact.* i18n, uses Contact.test.tsx, downloads /cv-fr.pdf + /cv-en.pdf

# Tech tracking
tech-stack:
  added:
    - shadcn Badge primitive (v4.8.2 — auto-detects Tailwind v4, no duplicate tw-animate-css import)
    - sharp (already bundled with Next 16) used to generate 800x800 placeholder JPEG
  patterns:
    - "Fixed token sibling pattern: --color-category-* live alongside --destructive in :root (palette-independent), then mirrored in @theme inline so Tailwind generates bg-category-* / text-category-* utilities"
    - "MDX stub frontmatter shape: every stub satisfies validateFrontmatter() in lib/projects.ts (Tech: stack[]; Design: tools[]; BIM: software[] + projectScale + location?) — fail-loud at build time if shape mismatch"
    - "Server-component composition root: page.tsx server-loads getProjects(locale) and prop-drills to <ProjectsSection> — lib/projects.ts uses node:fs and cannot be imported from Client Components"
    - "RED TDD harness via dynamic await import('./ComponentName'): Wave 0 ships test files that fail Module-not-found, Wave 1+2 implementations turn them GREEN (no parse error, just import failure)"
    - "i18n parity gate: scripts/check-i18n-parity.ts flattens FR + EN to leaf paths, exits 1 if sets differ (arrays count as single leaf — translators may pick different list lengths)"

key-files:
  created:
    - public/cv-fr.pdf (moved from repo root)
    - public/cv-en.pdf (copy of cv-fr until user translates)
    - public/about-photo.jpg (800x800 placeholder)
    - public/projects/{texture-manager,agora,brand-system,editorial-grid,tower-concept,residential-renovation}/cover.jpg (6 placeholders)
    - content/projects/{texture-manager,agora,brand-system,editorial-grid,tower-concept,residential-renovation}.{fr,en}.mdx (12 stubs)
    - lib/constants.ts (EMAIL, GITHUB_URL, LINKEDIN_URL)
    - components/ui/badge.tsx (shadcn install + 3 category variants)
    - scripts/check-i18n-parity.ts
    - components/sections/{Hero,About,CategoryFilter,ProjectCard,ProjectGrid,ProjectsSection,Skills,Contact}.test.tsx (8 RED harnesses)
  modified:
    - app/globals.css (3 fixed category tokens in :root and @theme inline)
    - app/[locale]/page.tsx (sync placeholder -> async Server Component composing 5 sections)
    - messages/fr.json (added about.paragraphs, hero.scrollCue; restructured skills.groups)
    - messages/en.json (mirror of FR additions)

key-decisions:
  - "Fixed category tokens follow Phase 1 D-12 --destructive precedent — declared in :root once (palette-independent) AND mirrored in @theme inline so Tailwind utilities like bg-category-tech are generated. Confirmed they are NOT added to lib/palettes.ts and NEVER mutated by ThemeProvider."
  - "BREAKING i18n change (internal-only): skills.groups.{tech,design,bim} restructured from string to {label, items[]}. Phase 3 placeholder page only consumed nav.skills, not skills.groups, so no live consumer broke. Wave 1's Skills implementation now reads .label + .items."
  - "Used sharp directly via node -e to generate the 800x800 warm-beige placeholder JPEG — sharp is bundled with Next 16 so no install needed. Same placeholder image is copied into all 7 image slots (about + 6 covers). Phase 5 (CONTENT) replaces project covers individually; user replaces about-photo pre-deploy."
  - "Wave 0 build is intentionally RED — page.tsx imports 5 sections components that don't exist until Wave 1+2 ships them. This is the dependency-gate design: Wave 0 isolates all file-conflict-prone foundation work, Wave 1 (Hero/About/Skills/Contact) and Wave 2 (Projects family) execute in parallel without stepping on each other's CSS/i18n/MDX/Badge edits."
  - "TDD harness pattern: each test uses await import('./Component') so failure is Module-not-found (Vitest 'Failed to resolve import' error) — files parse cleanly, tests fail at runtime. Wave 1+2 each implement their component and the test turns GREEN automatically."

patterns-established:
  - "Pattern: lib/constants.ts as the single source of truth for user-specific contact data. Hero/Contact import from here. Footer (Phase 3) currently inlines the same URLs — deferred refactor to migrate Footer to import from lib/constants is NOT in scope for Phase 4."
  - "Pattern: i18n parity gate script. scripts/check-i18n-parity.ts runs in CI / pre-commit. Future phases adding new keys MUST add to both FR + EN or the script exits 1."
  - "Pattern: discriminated MDX frontmatter for Project union. New project stubs MUST include the per-category required fields (Tech: stack[]; Design: tools[]; BIM: software[]+projectScale). _template.{fr,en}.mdx remains the canonical reference."
  - "Pattern: 3 fixed category color tokens in :root + @theme inline. Future tokens that must NOT mutate with palette switcher follow this pattern (declared next to --destructive, mirrored in @theme inline)."

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07]

# Metrics
duration: 8min
completed: 2026-05-27
---

# Phase 4 Plan 00: Assets and Stubs Summary

**Foundation gate for Phase 4 homepage sections: 9 binary assets, 12 MDX project stubs, 3 fixed category OKLCh tokens, shadcn Badge with category variants, restructured i18n with parity gate, async Server Component composition root, and 8 RED TDD harnesses ready for Wave 1+2 to turn GREEN.**

## Performance

- **Duration:** 8 min (458s)
- **Started:** 2026-05-27T18:35:53Z
- **Completed:** 2026-05-27T18:43:31Z
- **Tasks:** 7
- **Files modified/created:** 33 (9 binary assets + 12 MDX stubs + 8 test files + 4 source files)

## Accomplishments

- All 9 binary assets generated and placed at canonical paths (CV PDFs migrated from repo root, 800x800 about-photo + 6 project covers via sharp)
- 12 MDX project stubs satisfying the strict validateFrontmatter() loader (2 Tech / 2 Design / 2 BIM × FR/EN), confirmed via `getProjects(locale)` returning 6 projects per locale
- 3 fixed category color tokens added in `:root` AND `@theme inline` blocks of `app/globals.css` (palette-independent, follows Phase 1 D-12 precedent)
- shadcn Badge primitive installed via `npx shadcn@latest add badge` (auto-detected Tailwind v4, no duplicate `tw-animate-css` import) + 3 new CVA variants `category-tech` / `category-design` / `category-bim`
- i18n schema extended with `about.paragraphs.{1,2}`, `skills.groups.{tech,design,bim}.{label,items}`, `hero.scrollCue`; `skills.groups` restructured from string to `{label, items[]}` (internal-only breaking — no live consumer broke)
- `scripts/check-i18n-parity.ts` parity gate created; FR/EN parity at 72 leaf paths confirmed
- `app/[locale]/page.tsx` converted from sync placeholder to async Server Component server-loading `getProjects(locale)` and composing 5 section components with section-ID preservation (home/about/projects/skills/contact)
- 8 RED TDD test harnesses created; all 8 fail "Module not found" via dynamic `await import('./ComponentName')` — ready for Wave 1+2 implementations to turn GREEN

## Task Commits

Each task was committed atomically:

1. **Task 1: Asset prep (CV + about-photo + 6 project covers)** - `0053001` (chore)
2. **Task 2: lib/constants.ts + 3 fixed category color tokens** - `1dbf782` (feat)
3. **Task 3: Install shadcn Badge + 3 category CVA variants** - `f493424` (feat)
4. **Task 4: 12 stub MDX files (6 projects × 2 locales)** - `8d0ec8c` (feat)
5. **Task 5: i18n extensions + parity gate script** - `ab4128f` (feat)
6. **Task 6: page.tsx wired as async Server Component** - `a9a2e46` (feat)
7. **Task 7: 8 TDD test harnesses (RED)** - `6a237ca` (test)

**Plan metadata commit (final):** will be made alongside SUMMARY.md + STATE.md + ROADMAP.md updates after this file.

## Files Created/Modified

### Binary assets (9)
- `public/cv-fr.pdf` - FR CV (moved from repo root `CV_Tanguy_Delrieu_2023.pdf`)
- `public/cv-en.pdf` - EN CV placeholder (copy of cv-fr until user supplies translation)
- `public/about-photo.jpg` - 800x800 warm-beige placeholder generated via sharp
- `public/projects/texture-manager/cover.jpg`, `public/projects/agora/cover.jpg`, `public/projects/brand-system/cover.jpg`, `public/projects/editorial-grid/cover.jpg`, `public/projects/tower-concept/cover.jpg`, `public/projects/residential-renovation/cover.jpg` - placeholder covers (same image, Phase 5 replaces each)

### MDX stubs (12)
- `content/projects/texture-manager.{fr,en}.mdx` - Tech (TypeScript, Three.js, React, Vite; featured=true)
- `content/projects/agora.{fr,en}.mdx` - Tech (Next.js, TypeScript, Prisma, PostgreSQL; featured=true)
- `content/projects/brand-system.{fr,en}.mdx` - Design (Figma, Illustrator, InDesign; client=Independent studio)
- `content/projects/editorial-grid.{fr,en}.mdx` - Design (InDesign, Figma, Typography)
- `content/projects/tower-concept.{fr,en}.mdx` - BIM (Revit, Rhino, Twinmotion; projectScale=concept; featured=true)
- `content/projects/residential-renovation.{fr,en}.mdx` - BIM (ArchiCAD, AutoCAD, Lumion; projectScale=residential)

### Source code (4)
- `lib/constants.ts` - EMAIL, GITHUB_URL, LINKEDIN_URL exports (D-06)
- `components/ui/badge.tsx` - shadcn Badge primitive + 3 category CVA variants
- `scripts/check-i18n-parity.ts` - FR/EN parity gate (extends Phase 1 D-15 pattern)
- `app/[locale]/page.tsx` - async Server Component composing 5 section components (modified)

### Style + i18n (3)
- `app/globals.css` - 3 fixed --color-category-{tech,design,bim} tokens added in `:root` AND `@theme inline` (modified)
- `messages/fr.json` - hero.scrollCue + about.paragraphs.{1,2} + skills.groups restructure (modified)
- `messages/en.json` - mirror of FR additions (modified)

### Test harnesses (8 RED)
- `components/sections/Hero.test.tsx` - HOME-01
- `components/sections/About.test.tsx` - HOME-02
- `components/sections/CategoryFilter.test.tsx` - HOME-03
- `components/sections/ProjectCard.test.tsx` - HOME-04
- `components/sections/ProjectGrid.test.tsx` - HOME-05
- `components/sections/ProjectsSection.test.tsx` - HOME-05 (lifted-state shell)
- `components/sections/Skills.test.tsx` - HOME-06
- `components/sections/Contact.test.tsx` - HOME-07

## Decisions Made

- **Fixed category tokens follow Phase 1 D-12 `--destructive` precedent.** Declared once in `:root` (palette-independent) and mirrored in `@theme inline` so Tailwind utility classes `bg-category-tech` / `text-category-tech` etc. resolve correctly. They are NOT added to `lib/palettes.ts` and are NEVER mutated by ThemeProvider — confirmed by inspecting the existing palette swap code path in Phase 2. OKLCh values chosen for category meaning (cool blue for tech, magenta/pink for design, warm amber for BIM) with mid-luminance (~0.55-0.65) so badges remain readable on both light + dark palette backgrounds via `text-white` foreground.
- **BREAKING i18n change (internal-only):** `skills.groups.{tech,design,bim}` restructured from string to `{label, items[]}`. Phase 3's placeholder page only consumed `nav.skills`, not `skills.groups`, so no live consumer broke. Wave 1's Skills component will read `t('groups.tech.label')` + `t.raw('groups.tech.items')`.
- **MDX stub completeness:** Every stub passes `validateFrontmatter()`'s strict shape check — title, year, cover, summary, featured are present on all 12; Tech files have `stack[]`, Design files have `tools[]`, BIM files have `software[]` + `projectScale: 'concept' | 'residential'` + `location: France`. Validated by running `getProjects('fr')` and `getProjects('en')` — both return 6 projects each with category breakdown `{tech: 2, design: 2, bim: 2}`.
- **Used sharp directly to generate placeholder JPEG.** Tried sharp first (already bundled with Next 16 — no install needed) and it succeeded with `sharp({create:{width:800,height:800,channels:3,background:{r:200,g:180,b:160}}}).jpeg().toFile()`. Same warm-beige placeholder image was copied into all 7 image slots (about + 6 covers). Phase 5 replaces project covers individually; user swaps about-photo pre-deploy.
- **Wave 0 build is intentionally RED.** `app/[locale]/page.tsx` now imports 5 components from `components/sections/` that don't exist until Wave 1 (Hero/About/Skills/Contact) and Wave 2 (CategoryFilter/ProjectCard/ProjectGrid/ProjectsSection) ship them. This is the dependency-gate design — Wave 0 isolates all file-conflict-prone foundation work (CSS tokens, i18n keys, MDX stubs, Badge variants), then Wave 1+2 each execute their plans in parallel without stepping on each other. The phase-level (not plan-level) build gate runs after all 6 Phase 4 plans complete.
- **TDD harness pattern via dynamic import.** Each of the 8 test files imports its target component via `const { ComponentName } = await import('./ComponentName')` inside the test body. Vitest reports this as a runtime "Failed to resolve import" error (RED), NOT a parse error — confirmed by running `npm test` on the 8 files and observing "Test Files 8 failed (8)" with each error matching `Failed to resolve import './Hero'` etc. Wave 1+2 components turn each test GREEN by simply existing with the expected named export.

## Deviations from Plan

None - plan executed exactly as written.

Notes on minor adjustments (NOT deviations, just plan-specified flexibility):
- **Task 1 CV move method:** Used POSIX `mv` via the Bash tool rather than PowerShell `Move-Item` (cross-platform equivalent, plan permitted either; `mv` is the canonical Bash-tool form on Windows via Git-Bash translation). Same outcome.
- **Task 1 placeholder JPEG:** Used the sharp path (plan's primary recommendation) — sharp was available immediately, no need for the minimal-JPEG-bytes fallback. Same outcome.
- **Task 3 badge CVA structure:** The shadcn `npx shadcn@latest add badge` output had a richer base utility string than the plan's example (`group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border ...`) and used `[a]:hover:bg-*/80` for anchor-children hover rather than plain `hover:bg-*/90`. Per plan's "preserve that structure and only ADD the 3 new variant lines" instruction, the 3 category variants were added with the same `[a]:hover:bg-category-*/90` pattern (mirroring the existing variants' structure) — keeping the badge component cohesive.
- **Task 6 `'use client'` in doc comment:** The original page.tsx doc-block contained the literal string `'use client'` inside the explanation ("Server Component (no 'use client')"). To avoid false-positive matches by any future automated grep, this was rephrased to "Server Component (no client directive)". File still parses as Server Component (no actual directive present). Same outcome.

## Issues Encountered

None — all 7 tasks completed first-try.

Minor friction (not blocking):
- The verification script in the plan for Task 6 used `c.includes('use client')` which falsely matched the doc-comment mention of `'use client'`. Fixed by rephrasing the doc comment (see Deviations above).

## Known Stubs

This entire plan is **stub work by design** — Wave 0 deliberately ships placeholder content that Wave 1+2 wires up:

1. **app/[locale]/page.tsx** imports 5 components from `components/sections/` that do not exist. **Build is RED until Wave 1 ships Hero/About/Skills/Contact and Wave 2 ships ProjectsSection/CategoryFilter/ProjectCard/ProjectGrid.** This is the intentional dependency gate for Phase 4 — see 04-CONTEXT.md `<wave_context>` for the parallel-execution rationale.
2. **8 test files in components/sections/** all fail "Module not found" at runtime — Wave 1+2 components turn them GREEN.
3. **public/about-photo.jpg** is a 800x800 warm-beige placeholder. **User replaces pre-deploy** (deferred to Phase 7 polish).
4. **public/cv-en.pdf** is an identical copy of cv-fr.pdf. **User supplies translated EN CV when available** (deferred — Wave 1 Contact section UI is locale-agnostic on the download anchor; only the file content differs).
5. **6 public/projects/*/cover.jpg** are the same placeholder image. **Phase 5 (CONTENT) replaces each individually.**
6. **EMAIL/LINKEDIN_URL in lib/constants.ts** are placeholders (`tanguy@example.com`, `https://www.linkedin.com/in/tanguy-delrieu`). **User swaps pre-deploy.** GITHUB_URL matches Phase 3 Footer's inlined value.
7. **12 MDX project stubs** have minimal body content ("This page will be enriched in Phase 5..."). **Phase 5 (CONTENT) writes real case studies in each.**

All stubs are tracked here and in 04-CONTEXT.md deferred ideas. No stub blocks Phase 4 acceptance — Wave 1+2 work entirely from the stub foundation.

## User Setup Required

None - no external service configuration required for Wave 0.

User will need to swap pre-deploy (later phases):
- EMAIL in `lib/constants.ts` (currently `tanguy@example.com`)
- LINKEDIN_URL in `lib/constants.ts` (currently placeholder)
- `public/about-photo.jpg` (currently 800x800 warm-beige solid)
- `public/cv-en.pdf` (currently identical to cv-fr.pdf — needs EN translation)

## Next Phase Readiness

**Wave 1 (parallel: 04-01 Hero / 04-02 About / 04-04 Skills / 04-05 Contact) UNBLOCKED:**
- All i18n keys present in FR + EN (about.paragraphs.{1,2}, hero.scrollCue, skills.groups.{tech,design,bim}.{label,items}, contact.* preserved from Phase 3)
- lib/constants.ts provides EMAIL / GITHUB_URL / LINKEDIN_URL imports
- 4 test harnesses (Hero/About/Skills/Contact) ready as GREEN targets
- public/cv-{fr,en}.pdf + public/about-photo.jpg ready for next/image consumption

**Wave 2 (04-03 Projects) UNBLOCKED:**
- 12 MDX stubs with discriminated frontmatter pass getProjects() validation
- 3 fixed --color-category-* tokens in globals.css + Badge category variants ready
- Project union type stable (Phase 1 D-18..D-22 preserved)
- 4 test harnesses (CategoryFilter/ProjectCard/ProjectGrid/ProjectsSection) ready as GREEN targets
- page.tsx already passes server-loaded projects[] prop to <ProjectsSection projects={projects} />

**Phase-level acceptance after all 6 plans complete:**
- `npm run build` GREEN (Wave 1+2 fill the missing component imports)
- `npm run lint` GREEN (already GREEN at Wave 0 — tests parse clean)
- `npm test` GREEN (each of the 8 RED tests turns GREEN when its component ships)
- `npx tsx scripts/check-i18n-parity.ts` GREEN (already GREEN at 72 paths)

## Self-Check: PASSED

All 7 task commit hashes found in `git log` (0053001, 1dbf782, f493424, 8d0ec8c, ab4128f, a9a2e46, 6a237ca). All 38 listed files (9 binary assets + 12 MDX stubs + 4 source files + 3 style/i18n files + 8 test harnesses + 1 SUMMARY + 1 doc edit on page.tsx counted in source-code) exist on disk.

Verification gates executed:
- Asset gate (9 files): OK
- MDX gate (`getProjects('fr')` and `getProjects('en')` each return 6 projects, category split `{tech:2, design:2, bim:2}`): OK
- i18n parity gate (`npx tsx scripts/check-i18n-parity.ts`): OK — 72 leaf paths
- Token gate (`grep -c "color-category" app/globals.css`): OK — 6 lines (3 tokens × 2 blocks)
- Badge variant gate (`grep` for category-tech/design/bim): OK — 6 matches in badge.tsx
- Constants gate (`grep -cE "EMAIL|GITHUB_URL|LINKEDIN_URL" lib/constants.ts`): OK — 6 matches
- Page composition gate (`grep -cE "Hero|About|ProjectsSection|Skills|Contact" app/[locale]/page.tsx`): OK — 17 matches
- Test harness gate (`ls components/sections/*.test.tsx | wc -l`): OK — 8 files
- No literal colors gate (no `oklch(|#XXX|rgb(|hsl(` in badge.tsx): OK
- `head -1 app/[locale]/page.tsx`: `/*` (no `'use client'` directive): OK
- 8 RED tests via `npm test components/sections/`: confirmed RED — "Test Files 8 failed (8)" with "Failed to resolve import" errors (intentional dependency-gate state)

---
*Phase: 04-homepage-sections*
*Plan: 00-assets-and-stubs*
*Completed: 2026-05-27*
