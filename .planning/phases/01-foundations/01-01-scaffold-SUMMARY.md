---
phase: 01-foundations
plan: 01
subsystem: infra
tags: [next16, react19, tailwind4, typescript, eslint, prettier, scaffolding, turbopack]

# Dependency graph
requires: []
provides:
  - Runnable Next.js 16 app skeleton at repo root (no src/, alias @/* → ./*)
  - Tailwind v4 wired via @tailwindcss/postcss + @import "tailwindcss" in app/globals.css
  - ESLint flat config (eslint-config-next/core-web-vitals + /typescript)
  - TypeScript strict + noUncheckedIndexedAccess
  - Prettier + prettier-plugin-tailwindcss with format / format:check scripts
  - Empty directory skeleton (components/{,sections,theme,providers}/, lib/, content/projects/, messages/)
  - .gitignore guarding node_modules, .next, .env*.local, .vercel, .DS_Store, *.tsbuildinfo
  - package.json renamed to tanguy-portfolio
affects: [01-02-css-variables, 01-03-shadcn-aliasing, 01-04-i18n, 01-05-mdx-loader, all future phases]

# Tech tracking
tech-stack:
  added:
    - "next@^16.2.6 (App Router, Turbopack default)"
    - "react@^19.2.4 + react-dom@^19.2.4"
    - "typescript@^5"
    - "tailwindcss@^4 + @tailwindcss/postcss@^4"
    - "eslint@^9 + eslint-config-next@^16.2.6 (flat config)"
    - "prettier@^3.8.3 + prettier-plugin-tailwindcss@^0.8.0"
  patterns:
    - "App Router at repo root (no src/) per D-02"
    - "Import alias @/* → ./* (D-03, shadcn-compatible)"
    - "ESLint flat config (defineConfig + globalIgnores) per Next 16 default"
    - ".gitkeep convention for committing empty skeleton directories"
    - ".prettierignore excludes CLAUDE.md to preserve human-curated AI-instruction prose"

key-files:
  created:
    - "package.json — manifest (name=tanguy-portfolio, scripts: dev/build/start/lint/format/format:check)"
    - "tsconfig.json — strict + noUncheckedIndexedAccess, paths {@/*: [./*]}"
    - "next.config.ts — empty NextConfig (MDX wrapper lands in plan 05)"
    - "eslint.config.mjs — flat config extending eslint-config-next core-web-vitals + typescript"
    - "postcss.config.mjs — @tailwindcss/postcss plugin"
    - ".gitignore — Next.js/Node/Vercel exclusions, split .env*.local + .env"
    - ".prettierrc — semi/singleQuote/trailingComma all/printWidth 100/tailwindcss plugin"
    - ".prettierignore — .next/node_modules/.vercel/public/.planning/content/projects/messages/CLAUDE.md"
    - "app/layout.tsx — root Server Component (placeholder, rewritten in plan 04)"
    - "app/page.tsx — root page (placeholder, replaced by /[locale] redirect later)"
    - "app/globals.css — single @import 'tailwindcss' (CSS vars + @theme land in plan 02)"
    - "app/favicon.ico — scaffold default (will swap in Phase 4 polish)"
    - "next-env.d.ts — Next.js generated TS reference (do not edit)"
    - "README.md — scaffold default starter (will rewrite later)"
    - "public/{file,globe,next,vercel,window}.svg — scaffold default assets"
    - "components/.gitkeep, components/sections/.gitkeep, components/theme/.gitkeep, components/providers/.gitkeep, lib/.gitkeep, content/projects/.gitkeep, messages/.gitkeep — skeleton markers"
  modified: []

key-decisions:
  - "Workaround for create-next-app naming rejection (dir 'PROJET PORTFOLIO' contains caps + space): scaffolded into adjacent temp dir 'tanguy-portfolio-scaffold', copied generated files into the existing repo root, then renamed package.name to 'tanguy-portfolio' per D-04. .git and .planning history preserved intact."
  - "Pinned dependency ranges with caret prefix (^16.2.6, ^19.2.4) rather than scaffold default exact 16.2.6 — matches plan acceptance regex '\"next\": \"^16' and enables compatible patch upgrades without manual bumps."
  - "Added CLAUDE.md to .prettierignore: file is human-curated prose for AI agents (28KB of careful structure with tables, code blocks, prose). Prettier markdown formatter would reflow paragraphs and reorder Markdown elements unhelpfully. Decision documented in commit message."
  - "Did NOT install Phase 1's downstream deps (motion/lenis/gsap/@gsap/react/culori/next-intl/@next/mdx/gray-matter/shadcn) — those land in plans 02-05 per the phase plan split. Plan 01 strictly delivers the scaffolded skeleton."
  - "Skipped public/.gitkeep because public/ already contains scaffold SVGs (file.svg, globe.svg, next.svg, vercel.svg, window.svg) — .gitkeep would be redundant clutter."

patterns-established:
  - "Atomic per-task commits with conventional commit prefix (feat/chore) scoped to {phase}-{plan} (e.g., feat(01-01): ...)"
  - "Skeleton directory placeholders use .gitkeep convention (empty file) — keeps directory tree intact in git without injecting content"
  - "Quality gates wired from day 1: lint (eslint), types (npx tsc --noEmit), format (prettier --check) — every later commit must keep all three green"

requirements-completed: [ARCH-01, ARCH-02, ARCH-09]

# Metrics
duration: 9m 9s
completed: 2026-05-25
---

# Phase 01 Plan 01: Scaffold Next 16 + Tailwind v4 + ESLint flat Summary

**Greenfield Next.js 16 (Turbopack default) + React 19.2 + Tailwind v4 + ESLint flat + TypeScript strict scaffold at repo root with Prettier and complete empty directory skeleton, ready for plans 02-05 to populate.**

## Performance

- **Duration:** 9m 9s
- **Started:** 2026-05-25T20:20:34Z
- **Completed:** 2026-05-25T20:29:43Z
- **Tasks:** 2 (both type=auto)
- **Files modified:** 27 created (scaffold + Prettier + skeleton) + 6 reformatted by Prettier

## Accomplishments

- Next.js 16.2.6 app installed at repo root with Turbopack default, React 19.2.4, Tailwind v4, ESLint v9 flat config, TypeScript v5 strict + noUncheckedIndexedAccess
- Package renamed to `tanguy-portfolio` (D-04), all dependency ranges normalized to caret (`^16.2.6`, `^19.2.4`, `^16.2.6` for eslint-config-next)
- Prettier 3.8.3 + prettier-plugin-tailwindcss 0.8.0 wired with `.prettierrc` (singleQuote, trailingComma all, printWidth 100) and `.prettierignore` (excludes build artifacts, planning docs, MDX content, JSON translations, CLAUDE.md)
- Empty project directory skeleton matches `PROJECT.md` / `CLAUDE.md` spec exactly: `components/{,sections,theme,providers}/`, `lib/`, `content/projects/`, `messages/` (each tracked via `.gitkeep`)
- `.gitignore` rewritten to plan spec — split env entries into `.env*.local` + `.env` (allows committing `.env.example`), dropped `/coverage` block (no tests in v1 per PROJECT.md out-of-scope)
- All quality gates pass: `npm run lint`, `npm run format:check`, `npx tsc --noEmit` all exit 0. `npm run dev` boots HTTP 200 on `:3000` in ~360ms (Turbopack)

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next 16 into repo root + rename package + verify boot** — `9da5926` (feat)
2. **Task 2: Add Prettier + prettier-plugin-tailwindcss + project directory skeleton** — `f18c277` (chore)

**Plan metadata commit:** _(added after this SUMMARY is written)_

## Files Created/Modified

### Created (27)
- `package.json` — manifest with `tanguy-portfolio` name, dev/build/start/lint/format/format:check scripts, `^16.x`/`^19.x`/`^4`/`^9`/`^5`/`^3.x`/`^0.8.x` dep ranges
- `package-lock.json` — npm v11 lockfile (generated by create-next-app + `npm install --save-dev prettier prettier-plugin-tailwindcss`)
- `tsconfig.json` — strict TypeScript with `noUncheckedIndexedAccess: true` and `paths: { "@/*": ["./*"] }`
- `next.config.ts` — empty `NextConfig` (MDX wrapper added later in plan 05)
- `eslint.config.mjs` — flat config: `defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**", ...])])`
- `postcss.config.mjs` — single `@tailwindcss/postcss` plugin
- `.gitignore` — `/node_modules`, `/.next/`, `/out/`, `/build`, `.DS_Store`, `*.pem`, `npm-debug.log*`, `.env*.local`, `.env`, `.vercel`, `*.tsbuildinfo`, `next-env.d.ts`
- `.prettierrc` — JSON: `{ semi: true, singleQuote: true, trailingComma: "all", printWidth: 100, tabWidth: 2, plugins: ["prettier-plugin-tailwindcss"] }`
- `.prettierignore` — `.next`, `node_modules`, `.vercel`, `public`, `*.lock`, `.planning`, `content/projects`, `messages`, `CLAUDE.md`
- `app/layout.tsx` — root Server Component using Geist/Geist_Mono fonts (will be rewritten with ThemeProvider/LenisProvider/IntlProvider in plans 04/Phase 3)
- `app/page.tsx` — scaffold landing page (placeholder; will become /[locale] redirect later)
- `app/globals.css` — currently scaffold defaults (`--background`/`--foreground` + Geist `@theme`) — plan 02 replaces all of this with the 6 OKLCh palette tokens
- `app/favicon.ico` — scaffold default icon (will swap in Phase 4 polish)
- `next-env.d.ts` — Next.js generated TS references (ignored by git, but tracked here from create-next-app)
- `README.md` — scaffold default starter (will rewrite for the portfolio later)
- `public/{file,globe,next,vercel,window}.svg` — scaffold default vector assets
- `components/.gitkeep`, `components/sections/.gitkeep`, `components/theme/.gitkeep`, `components/providers/.gitkeep`, `lib/.gitkeep`, `content/projects/.gitkeep`, `messages/.gitkeep` — empty-directory markers
- `node_modules/` — installed deps (git-ignored, but populated locally; 359 packages from scaffold + 1 nested for `prettier-plugin-tailwindcss` lifting total to 143 fund-eligible)

### Modified (6, by Prettier auto-format in Task 2)
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs` — reformatted to match `.prettierrc` (whitespace/quote normalization only; no semantic changes)

### Preserved (untouched, as required)
- `CV_Tanguy_Delrieu_2023.pdf` — still at repo root, will move to `public/cv-fr.pdf` in Phase 4 per CONTEXT.md D-23
- `.planning/` — full planning history preserved including STATE.md, ROADMAP.md, REQUIREMENTS.md, PROJECT.md, research artifacts, phase 01 plans
- `CLAUDE.md` — project AI-instruction file at repo root, unchanged (added to `.prettierignore` to keep it that way)

## Decisions Made

1. **Scaffold via adjacent temp dir, then copy in.** `npx create-next-app@latest .` rejects the working directory because `PROJET PORTFOLIO` contains capital letters and a space (npm naming restriction on the default package name derived from dir name). Workaround: scaffold into `../tanguy-portfolio-scaffold/`, copy all generated files into the repo (skipping its `.git/`, `AGENTS.md`, and tiny `CLAUDE.md` placeholder), then `rm -rf` the temp dir. The existing repo's `.git/`, `.planning/`, and `CLAUDE.md` were preserved 100% intact. Net effect identical to a direct `--yes` install.
2. **Caret-prefixed deps to satisfy plan regex.** Scaffold emitted exact pins (`"next": "16.2.6"`). Plan acceptance grep checks for `"next": "^16` substring. Switched to caret ranges for `next`, `react`, `react-dom`, `eslint-config-next`. Functionally identical for the current versions; enables compatible patch upgrades down the line.
3. **CLAUDE.md added to .prettierignore.** The file is 28KB of carefully-structured human-curated prose for AI agents — tables, code blocks, paragraphs all hand-tuned. Prettier's markdown formatter would prose-wrap paragraphs and re-flow structure unhelpfully without semantic benefit. Documented in the Task 2 commit message.
4. **No `public/.gitkeep`.** The `public/` directory already contains scaffold SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`), so it's tracked without a marker. The plan explicitly says: ".gitkeep only if `public/` is empty after scaffold; if scaffolder put e.g. `next.svg`, skip the .gitkeep" — followed.
5. **No deps installed for plans 02-05.** This plan strictly delivers the runnable scaffold. `motion`, `lenis`, `gsap`, `@gsap/react`, `culori`, `next-intl`, `@next/mdx`, `gray-matter`, `next-mdx-remote`, `shadcn` components all land in their respective plans as designed in the phase split.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app rejected the working directory name**
- **Found during:** Task 1, initial `npx create-next-app@latest . --yes` invocation
- **Issue:** Directory name "PROJET PORTFOLIO" contains capital letters and a space, which violates npm package-name restrictions (`name can only contain URL-friendly characters; name can no longer contain capital letters`). create-next-app uses the directory name as the default package name and rejected the install outright. There is no `--name` flag to override.
- **Fix:** Scaffolded into adjacent temp directory `../tanguy-portfolio-scaffold/` with explicit `--typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm` flags, then copied all generated files (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `next-env.d.ts`, `.gitignore`, `README.md`, `package-lock.json`, `app/*`, `public/*.svg`, `node_modules/`) into the existing repo root. Excluded the scaffold's `.git/` (we keep planning history), its placeholder `CLAUDE.md` (we have our own 28KB version), and `AGENTS.md` (Next 16 scaffold extra, not in plan scope). Removed the temp dir afterward.
- **Files modified:** All scaffold files now live at repo root; no existing files (`.planning/`, `CV_Tanguy_Delrieu_2023.pdf`, `CLAUDE.md`) were touched.
- **Verification:** All Task 1 acceptance criteria pass (file existence, package.json fields, no src/, dev boots HTTP 200, lint exit 0, tsc exit 0).
- **Committed in:** `9da5926` (Task 1 commit)

**2. [Rule 3 - Blocking] Prettier format:check failed on 7 files including CLAUDE.md**
- **Found during:** Task 2, first `npm run format:check`
- **Issue:** Scaffold-generated files (app/*, eslint.config.mjs, next.config.ts, postcss.config.mjs) had whitespace/quote drift vs. `.prettierrc`. Worse: Prettier would also reflow `CLAUDE.md`, which is 28KB of carefully-structured human-curated prose for AI agents and should NOT be auto-formatted.
- **Fix:** Added `CLAUDE.md` to `.prettierignore` (preserves AI-instruction structure), then ran `npm run format` to fix the 6 scaffold files. All 7 originally-flagged files now pass `format:check`.
- **Files modified:** `.prettierignore` (added `CLAUDE.md` entry with comment), `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs` (Prettier auto-format, whitespace only).
- **Verification:** `npm run format:check` now exits 0 reporting "All matched files use Prettier code style!". `npm run lint` and `npx tsc --noEmit` also still exit 0.
- **Committed in:** `f18c277` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking)
**Impact on plan:** Both deviations were unavoidable environmental adaptations (Windows path naming + scaffold formatter drift). No scope creep, no architectural changes, no extra features. All planned outcomes delivered exactly as specified.

## Authentication Gates

None encountered.

## Issues Encountered

- **PDF file lock on Windows.** Initial attempt to move `CV_Tanguy_Delrieu_2023.pdf` out of the repo root with `mv` failed with "Device or resource busy" (likely Windows file preview / antivirus / Indexing Service holding a handle). `cp` worked fine. Resolution: didn't need to move the PDF at all — the temp-dir scaffold workaround sidestepped the non-empty-directory issue entirely.
- **Line-ending warnings (CRLF/LF).** Every `git add` on Windows emits `warning: in the working copy of '...', LF will be replaced by CRLF the next time Git touches it`. These are informational (git's `core.autocrlf` is default on Windows) and do not affect commit integrity. Files on disk stay LF; git index normalizes.

## User Setup Required

None — no external service configuration required for plan 01-01. (Vercel deploy + GitHub repo creation are Phase 7 concerns.)

## Verification Output

Final command exit codes (all run after Task 2 commit):

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

$ npm run dev  (background, then curl + kill)
> tanguy-portfolio@0.1.0 dev
> next dev
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.1.26:3000
✓ Ready in 360ms
GET / 200 in 1355ms (next.js: 1245ms, application-code: 109ms)
GET / 200 in 24ms (next.js: 3ms, application-code: 21ms)
```

Installed versions (from `package.json` after Prettier install):
- `next@^16.2.6`
- `react@^19.2.4` + `react-dom@^19.2.4`
- `typescript@^5` (resolved to 5.x)
- `tailwindcss@^4` + `@tailwindcss/postcss@^4`
- `eslint@^9` + `eslint-config-next@^16.2.6`
- `prettier@^3.8.3` + `prettier-plugin-tailwindcss@^0.8.0`

No flags from `--yes` had to be overridden conceptually — the `--no-src-dir` was already the 2026 default (verified by the scaffold producing `app/` at root). Explicit flags used in the temp-dir scaffold (`--typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm`) all matched 2026 defaults; passed for determinism.

Deviations from the planned `.gitignore`:
- Scaffold emitted `/coverage` under "# testing" — removed because v1 has no tests (per PROJECT.md "Out of Scope: Tests automatisés exhaustifs").
- Scaffold emitted `.env*` (catch-all) — replaced with `.env*.local` + `.env` per the plan's exact list, so `.env.example` (if added later) is committable.

## Next Phase Readiness

**Plan 01-02 (CSS variables foundation) ready to start.** The `app/globals.css` currently has scaffold defaults (`--background`/`--foreground` + Geist `@theme inline` block). Plan 02 will replace this entire file with:
- 6 OKLCh CSS variables in `:root` (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`) hardcoded to Terra & Sage defaults (per D-06)
- `@theme { ... }` exposing them to Tailwind v4
- Global 400ms transition on `color/background-color/border-color`

**Plan 01-03 (shadcn aliasing)** has the directory skeleton it needs — `components/` exists. Plan 03 runs `npx shadcn@latest init` then writes the exhaustive aliasing pass in `app/globals.css`.

**Plan 01-04 (i18n)** has the `messages/` directory ready for `fr.json` + `en.json`. `proxy.ts` will land at repo root (D-14, D-17 — locale prefix as-needed, `accept-language` fallback to FR).

**Plan 01-05 (MDX loader)** has `content/projects/` and `lib/` ready. The discriminated `Project` type lands in `lib/projects.ts` per D-18..D-22.

**No blockers, no concerns carried forward.** Quality gate baseline established: every subsequent commit must keep `lint`, `format:check`, `tsc --noEmit` green.

## Self-Check: PASSED

All 27 created files verified on disk. Both task commits (`9da5926`, `f18c277`) verified in git log. SUMMARY.md present. Preserved files (`CV_Tanguy_Delrieu_2023.pdf`, `CLAUDE.md`, `.planning/`) intact and untouched.

---
*Phase: 01-foundations*
*Completed: 2026-05-25*
