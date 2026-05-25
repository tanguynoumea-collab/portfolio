---
phase: 01-foundations
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - next.config.ts
  - eslint.config.mjs
  - .prettierrc
  - .gitignore
  - app/layout.tsx
  - app/page.tsx
  - app/globals.css
  - postcss.config.mjs
  - components/.gitkeep
  - components/sections/.gitkeep
  - components/theme/.gitkeep
  - components/providers/.gitkeep
  - lib/.gitkeep
  - content/projects/.gitkeep
  - messages/.gitkeep
  - public/.gitkeep
autonomous: true
requirements:
  - ARCH-01
  - ARCH-02
  - ARCH-09
gap_closure: false
must_haves:
  truths:
    - "`npm run dev` boots a Next 16 app on http://localhost:3000 without errors"
    - "`npm run lint` exits 0 with zero warnings"
    - "`npx tsc --noEmit` exits 0 (TypeScript strict mode clean)"
    - "package.json has name = 'tanguy-portfolio'"
    - "All required directories exist: components/, components/sections/, components/theme/, components/providers/, lib/, content/projects/, messages/, public/"
    - ".gitignore excludes .next, node_modules, .env*.local, .DS_Store, .vercel"
  artifacts:
    - path: "package.json"
      provides: "Project manifest with name 'tanguy-portfolio' + Next 16/React 19/Tailwind v4 dependencies"
      contains: '"name": "tanguy-portfolio"'
    - path: "tsconfig.json"
      provides: "TypeScript strict configuration"
      contains: '"strict": true'
    - path: "next.config.ts"
      provides: "Next.js 16 configuration root"
    - path: "eslint.config.mjs"
      provides: "Flat ESLint config (Next 16 default)"
    - path: "app/layout.tsx"
      provides: "Root layout (Server Component) — scaffolded placeholder"
    - path: "app/page.tsx"
      provides: "Root page — will be replaced by /[locale] redirect later"
    - path: "app/globals.css"
      provides: "Global stylesheet with @import 'tailwindcss' (Tailwind v4 wiring will be added in plan 02)"
    - path: ".gitignore"
      provides: "Git exclusion rules"
  key_links:
    - from: "package.json scripts"
      to: "next dev / eslint"
      via: '"dev": "next dev", "lint": "eslint"'
      pattern: '"lint":\s*"eslint"'
    - from: "tsconfig.json"
      to: "TS strict mode"
      via: "compilerOptions.strict: true"
      pattern: '"strict":\s*true'
---

<objective>
Scaffold a Next.js 16 application at the repo root using `create-next-app@latest . --yes` (accepting 2026 defaults: TypeScript, Tailwind v4, ESLint flat, App Router, Turbopack, alias `@/*`, no `src/` dir). Rename the package to `tanguy-portfolio`, configure Prettier + prettier-plugin-tailwindcss, ensure ESLint is wired as `npm run lint` script (replacing the removed `next lint`), enable TypeScript `noUncheckedIndexedAccess`, create the project's directory skeleton (`components/`, `components/sections/`, `components/theme/`, `components/providers/`, `lib/`, `content/projects/`, `messages/`, `public/`), and merge `.gitignore` with existing repo entries. This plan delivers a clean runnable foundation that all subsequent plans build upon.

Purpose: Without a working Next 16 + Tailwind v4 + ESLint flat scaffold, nothing else in Phase 1 can proceed. ARCH-01, ARCH-02 (folders + lint), and ARCH-09 (git ignore) all land here.

Output: A repo where `npm run dev` boots, `npm run lint` passes, `npx tsc --noEmit` passes, and the full folder structure exists ready for plans 02-05 to populate.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundations/01-CONTEXT.md
@.planning/research/STACK.md
@.planning/research/SUMMARY.md
@CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Next 16 into repo root + rename package + verify boot</name>
  <files>package.json, tsconfig.json, next.config.ts, eslint.config.mjs, app/layout.tsx, app/page.tsx, app/globals.css, postcss.config.mjs, .gitignore</files>
  <read_first>
    - .planning/phases/01-foundations/01-CONTEXT.md (D-01..D-05 lock decisions: repo root, no src/, alias @/*, name 'tanguy-portfolio', `npx create-next-app@latest . --yes`)
    - .planning/research/STACK.md §"Step 1 — Scaffold Next.js 16" (exact scaffolder command and expected files)
    - CLAUDE.md (project conventions — TypeScript strict, no `any`, no src/)
    - CV_Tanguy_Delrieu_2023.pdf (DO NOT move yet — Phase 4 will move to public/cv-fr.pdf)
  </read_first>
  <action>
    Run `npx create-next-app@latest . --yes` in the repo root. The `.` argument installs into current dir. The `--yes` flag accepts 2026 defaults:
    - TypeScript: yes
    - ESLint: yes (flat config)
    - Tailwind CSS v4: yes
    - App Router: yes
    - Turbopack: yes (default in Next 16)
    - Import alias: `@/*`
    - `src/` directory: NO (D-02 forbids it — verify by inspecting the prompt; if --yes defaults to src/, re-run with `--no-src-dir`)

    The CV PDF (`CV_Tanguy_Delrieu_2023.pdf`) at repo root is NOT in the scaffolder's exclusion list. If create-next-app refuses to scaffold into a non-empty directory, move the PDF temporarily to `..\portfolio-tmp-pdf-stash\` and restore after scaffold completes. The `.planning/` directory must remain untouched (research and discussion artifacts).

    Post-scaffold mandatory edits (verify each manually):

    1. **package.json — rename + scripts**:
       - Set `"name": "tanguy-portfolio"` (kebab-case, per D-04)
       - Replace `"lint": "next lint"` with `"lint": "eslint"` (Next 16 removed `next lint` — see Stack research "What NOT to Use")
       - Keep `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`
       - Confirm `"next": "^16.x"`, `"react": "^19.x"`, `"react-dom": "^19.x"`, `"tailwindcss": "^4.x"` after install

    2. **tsconfig.json — add strict flags** (D-Discretion: planner picks; add `noUncheckedIndexedAccess`):
       Inside `compilerOptions`:
       ```json
       "strict": true,
       "noUncheckedIndexedAccess": true
       ```
       Verify `"baseUrl"` and `"paths"` include `"@/*": ["./*"]` (NOT `["./src/*"]`).

    3. **next.config.ts** — leave default for now (MDX wrapper added in plan 05). Confirm filename is `.ts` (Next 16 prefers TS configs); if scaffolder created `.mjs`, that is acceptable — adapt accordingly.

    4. **eslint.config.mjs** — verify flat config exists with `eslint-config-next` extended. Should require no edits if scaffolder produced it.

    5. **.gitignore** — merge with any pre-existing entries (none in this repo, but check). Ensure these entries exist (D-Discretion + ARCH-09):
       ```
       # dependencies
       /node_modules
       /.pnp
       .pnp.*
       .yarn/*
       !.yarn/patches
       !.yarn/plugins
       !.yarn/releases
       !.yarn/versions

       # next.js
       /.next/
       /out/

       # production
       /build

       # misc
       .DS_Store
       *.pem

       # debug
       npm-debug.log*
       yarn-debug.log*
       yarn-error.log*
       .pnpm-debug.log*

       # env files (require manual export from secret manager)
       .env*.local
       .env

       # vercel
       .vercel

       # typescript
       *.tsbuildinfo
       next-env.d.ts
       ```

    6. **Verify boot**: run `npm run dev` in background, curl `http://localhost:3000` once it boots (allow ~20s for first Turbopack compile), confirm HTTP 200, then send SIGTERM/Ctrl+C.

    7. **Verify lint**: `npm run lint` must exit 0 with zero warnings.

    8. **Verify TS**: `npx tsc --noEmit` must exit 0.

    Do NOT install Prettier/animation/i18n/MDX deps yet — those land in later plans. This plan ONLY delivers the scaffolded skeleton.
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; npx tsc --noEmit &amp;&amp; node -e "const p=require('./package.json'); if(p.name!=='tanguy-portfolio') process.exit(1); if(!p.scripts.lint||p.scripts.lint!=='eslint') process.exit(2); if(!p.dependencies.next||!p.dependencies.next.startsWith('^16')) process.exit(3);"</automated>
  </verify>
  <acceptance_criteria>
    - File `package.json` exists and contains `"name": "tanguy-portfolio"`
    - File `package.json` contains `"lint": "eslint"` (NOT `"next lint"`)
    - File `package.json` contains `"next": "^16` in dependencies (any 16.x patch acceptable)
    - File `package.json` contains `"react": "^19` and `"react-dom": "^19` in dependencies
    - File `package.json` contains `"tailwindcss": "^4` in dependencies (devDependencies acceptable)
    - File `tsconfig.json` contains `"strict": true`
    - File `tsconfig.json` contains `"noUncheckedIndexedAccess": true`
    - File `tsconfig.json` paths map `"@/*"` to `"./*"` (NOT `"./src/*"`)
    - File `app/layout.tsx` exists at repo root (NOT under `src/app/`)
    - File `app/page.tsx` exists at repo root
    - File `app/globals.css` exists at repo root and contains `@import "tailwindcss"`
    - Directory `src/` does NOT exist at repo root
    - File `eslint.config.mjs` (or `.js`) exists with flat config (contains `next/core-web-vitals` or `eslint-config-next` reference)
    - File `.gitignore` exists and contains all of: `node_modules`, `.next`, `.env*.local`, `.vercel`, `.DS_Store`
    - Command `npm run lint` exits 0 with zero warnings emitted to stdout/stderr
    - Command `npx tsc --noEmit` exits 0
    - Command `npm run dev` (run in background) responds HTTP 200 on http://localhost:3000 within 30 seconds, then is terminated cleanly
    - File `CV_Tanguy_Delrieu_2023.pdf` still exists at repo root (untouched — Phase 4 will move it)
    - Directory `.planning/` still exists and untouched
  </acceptance_criteria>
  <done>The repo contains a runnable Next 16 + Tailwind v4 + ESLint flat scaffold at root. `npm run dev` boots, `npm run lint` passes, TypeScript compiles strict. Package renamed to `tanguy-portfolio`. .gitignore protects secrets and build artifacts.</done>
</task>

<task type="auto">
  <name>Task 2: Add Prettier + prettier-plugin-tailwindcss + project directory skeleton</name>
  <files>.prettierrc, .prettierignore, package.json, components/.gitkeep, components/sections/.gitkeep, components/theme/.gitkeep, components/providers/.gitkeep, lib/.gitkeep, content/projects/.gitkeep, messages/.gitkeep, public/.gitkeep</files>
  <read_first>
    - .planning/phases/01-foundations/01-CONTEXT.md (D-08 — color tokens only this phase; structure follows PROJECT.md)
    - .planning/research/STACK.md §"Step 9 — Dev tooling" (Prettier + prettier-plugin-tailwindcss config)
    - CLAUDE.md (component structure: sections in components/sections/, theme in components/theme/, providers in components/providers/)
    - package.json (from Task 1 — must add Prettier devDeps without disturbing existing entries)
  </read_first>
  <action>
    1. **Install Prettier + Tailwind plugin**:
       ```
       npm install --save-dev prettier prettier-plugin-tailwindcss
       ```

    2. **Create `.prettierrc`** at repo root with these EXACT contents:
       ```json
       {
         "semi": true,
         "singleQuote": true,
         "trailingComma": "all",
         "printWidth": 100,
         "tabWidth": 2,
         "plugins": ["prettier-plugin-tailwindcss"]
       }
       ```

    3. **Create `.prettierignore`** at repo root with these EXACT contents:
       ```
       .next
       node_modules
       .vercel
       public
       *.lock
       .planning
       content/projects
       messages
       ```
       (We exclude `.planning/`, `content/projects/`, and `messages/` because they have their own formatting conventions — MDX and JSON should not be re-flowed by Prettier mid-edit.)

    4. **Add `format` script to package.json**:
       In the `"scripts"` object, add: `"format": "prettier --write ."` and `"format:check": "prettier --check ."`.

    5. **Create the project directory skeleton** by creating these empty placeholder files (`.gitkeep` is the convention to commit empty dirs):
       - `components/.gitkeep`
       - `components/sections/.gitkeep`
       - `components/theme/.gitkeep`
       - `components/providers/.gitkeep`
       - `lib/.gitkeep`
       - `content/projects/.gitkeep`
       - `messages/.gitkeep`
       - `public/.gitkeep` (only if `public/` is empty after scaffold; if scaffolder put e.g. `next.svg`, skip the .gitkeep)

       Each `.gitkeep` file must be a zero-byte file (no content). These directories will be populated by later plans:
       - `components/`, `components/sections/`, `components/theme/`, `components/providers/` — Phases 2-4 add components
       - `lib/` — plan 05 adds `lib/projects.ts` + `lib/palettes.ts`
       - `content/projects/` — plan 05 adds `_template.{fr,en}.mdx`; Phase 5 adds real projects
       - `messages/` — plan 04 adds `fr.json` + `en.json`
       - `public/` — Phase 4 will place the CV PDF here

    6. **Verify format check passes**: run `npm run format:check`. It must report all files formatted (or run `npm run format` first to fix any tab/space drift introduced by the scaffolder).

    7. **Re-verify lint and TS**: run `npm run lint` and `npx tsc --noEmit` — both must still exit 0.

    Do NOT add any other files (no components, no lib code, no MDX, no messages JSON, no providers). The skeleton stays empty for downstream plans.
  </action>
  <verify>
    <automated>npm run format:check &amp;&amp; npm run lint &amp;&amp; npx tsc --noEmit &amp;&amp; node -e "const fs=require('fs'); const dirs=['components','components/sections','components/theme','components/providers','lib','content/projects','messages']; for(const d of dirs){ if(!fs.existsSync(d)) {console.error('Missing dir:',d); process.exit(1);} } const p=require('./package.json'); if(!p.devDependencies['prettier-plugin-tailwindcss']) process.exit(2); if(!p.scripts.format) process.exit(3);"</automated>
  </verify>
  <acceptance_criteria>
    - File `.prettierrc` exists at repo root and contains the string `"prettier-plugin-tailwindcss"` (case-sensitive)
    - File `.prettierignore` exists at repo root and contains entries for `.next`, `node_modules`, `.planning`
    - File `package.json` `devDependencies` contains `"prettier"` and `"prettier-plugin-tailwindcss"`
    - File `package.json` `scripts` contains `"format": "prettier --write ."` AND `"format:check": "prettier --check ."`
    - Directory `components/` exists with a `.gitkeep` (or other) tracked file
    - Directory `components/sections/` exists with a tracked file
    - Directory `components/theme/` exists with a tracked file
    - Directory `components/providers/` exists with a tracked file
    - Directory `lib/` exists with a tracked file
    - Directory `content/projects/` exists with a tracked file
    - Directory `messages/` exists with a tracked file
    - Directory `public/` exists (may have scaffolder assets like `next.svg`; .gitkeep optional)
    - Command `npm run format:check` exits 0
    - Command `npm run lint` exits 0 with zero warnings
    - Command `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Prettier + prettier-plugin-tailwindcss installed and configured. Project directory skeleton matches PROJECT.md / ARCH-02 spec. All quality gates (lint, types, format) pass.</done>
</task>

</tasks>

<verification>
1. `npm run dev` boots Next 16 on port 3000 within 30 seconds (HTTP 200 confirmed via curl)
2. `npm run lint` exits 0 with zero warnings (using `eslint` directly, NOT removed `next lint`)
3. `npm run format:check` exits 0
4. `npx tsc --noEmit` exits 0 (TypeScript strict + noUncheckedIndexedAccess)
5. `package.json` name === `tanguy-portfolio`, dependencies include `next@^16`, `react@^19`, `tailwindcss@^4`
6. Directory tree contains: `app/`, `components/`, `components/sections/`, `components/theme/`, `components/providers/`, `lib/`, `content/projects/`, `messages/`, `public/`
7. `src/` directory does NOT exist (D-02)
8. Import alias `@/*` maps to `./*` (NOT `./src/*`) in `tsconfig.json`
9. `.gitignore` covers `.next`, `node_modules`, `.env*.local`, `.vercel`, `.DS_Store`
10. `CV_Tanguy_Delrieu_2023.pdf` and `.planning/` directory remain untouched
</verification>

<success_criteria>
A new Claude session (or any developer) clones this repo, runs `npm install && npm run dev`, and sees a working Next 16 placeholder page at `http://localhost:3000` with zero console errors. `npm run lint`, `npm run format:check`, and `npx tsc --noEmit` all pass. The directory skeleton is ready for plans 02-05 to populate with CSS variables, shadcn aliasing, i18n routing, and MDX loader respectively. The decisions D-01..D-05 are fully realized in the scaffold (app at repo root, no `src/`, alias `@/*`, name `tanguy-portfolio`).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations/01-01-SUMMARY.md` documenting:
- Exact Next/React/Tailwind/TypeScript versions installed (from package.json)
- Whether `npm create-next-app --yes` produced the expected defaults (or which flags had to be overridden)
- Any deviations from the planned `.gitignore` (e.g., extra entries added by scaffolder)
- Confirmation that `CV_Tanguy_Delrieu_2023.pdf` is untouched
- The exact stdout/exit codes from final `npm run lint`, `npm run format:check`, `npx tsc --noEmit` runs
</output>
