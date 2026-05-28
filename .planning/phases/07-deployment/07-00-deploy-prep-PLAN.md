---
phase: 07-deployment
plan: 00
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - package-lock.json
  - app/[locale]/layout.tsx
  - scripts/check-analytics.ts
  - scripts/check-env-leak.ts
  - scripts/check-readme.ts
  - README.md
  - .github/workflows/ci.yml
  - .planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md
autonomous: true
requirements: [DEPLOY-01, DEPLOY-03]
user_setup: []

must_haves:
  truths:
    - "Repo is on the `main` branch (renamed from `master`)"
    - "README.md is a real portfolio README, not the create-next-app scaffold"
    - "Vercel Analytics + Speed Insights are mounted in the layout from the /next entry points"
    - "No secret-looking NEXT_PUBLIC_* values are committed (only NEXT_PUBLIC_SITE_URL, a public origin)"
    - "A CI workflow runs lint + tests + gates + build on push/PR"
    - "A pre-deploy content-swap checklist enumerates every placeholder the user must replace"
  artifacts:
    - path: "app/[locale]/layout.tsx"
      provides: "Analytics + SpeedInsights mounted as last children of <body>, layout stays a Server Component"
      contains: "@vercel/analytics/next"
    - path: "scripts/check-analytics.ts"
      provides: "DEPLOY-03 static assertion gate (both /next imports + both components mounted)"
    - path: "scripts/check-env-leak.ts"
      provides: "DEPLOY-03 / D-08 NEXT_PUBLIC_* secret-leak grep gate"
    - path: "scripts/check-readme.ts"
      provides: "DEPLOY-01 README real-content + repo-URL consistency gate"
    - path: "README.md"
      provides: "Real portfolio README (pitch, features, stack, local dev, scripts, deploy note)"
      contains: "Next.js 16"
    - path: ".github/workflows/ci.yml"
      provides: "CI: npm ci + lint + test + palette/i18n/mdx/motion/image gates + build on Node 22"
      contains: "npm ci"
    - path: ".planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md"
      provides: "D-10 enumerated placeholder swap list"
  key_links:
    - from: "app/[locale]/layout.tsx"
      to: "@vercel/analytics/next + @vercel/speed-insights/next"
      via: "import + <Analytics /> + <SpeedInsights /> as last <body> children"
      pattern: "@vercel/(analytics|speed-insights)/next"
    - from: ".github/workflows/ci.yml"
      to: "package.json scripts + scripts/check-*.ts"
      via: "npm run + npx tsx invocations matching the existing gate inventory"
      pattern: "npm (ci|run|test)"
    - from: "package.json"
      to: "@vercel/analytics + @vercel/speed-insights"
      via: "dependencies at ^2"
      pattern: "@vercel/(analytics|speed-insights)\": \"\\^2"
---

<objective>
Do all the agent-autonomous deployment prep so the repo is push-ready and production-instrumented: install + mount Vercel Analytics/Speed Insights, write the three new verification gates, rewrite the README, add CI, rename `master`→`main`, and generate the pre-deploy content-swap checklist. This plan touches NO external accounts — every step is local and verifiable headlessly. The go-live plan (07-01) handles the GitHub push + Vercel checkpoints afterward.

Purpose: Cover the agent-automatable half of DEPLOY-01 (branch + README + repo-URL consistency) and DEPLOY-03 (analytics mount + no-leak), and lay the CI rail that catches failures before Vercel builds (DEPLOY-02 support).
Output: package.json (+ lock) with 2 new deps + 3 npm aliases; `app/[locale]/layout.tsx` with analytics mounted; `scripts/check-analytics.ts`, `scripts/check-env-leak.ts`, `scripts/check-readme.ts`; rewritten `README.md`; `.github/workflows/ci.yml`; `.planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md`; branch renamed to `main`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/07-deployment/07-CONTEXT.md
@.planning/phases/07-deployment/07-RESEARCH.md
@.planning/phases/07-deployment/07-VALIDATION.md

<interfaces>
<!-- Key contracts the executor needs. Extracted from the codebase. Use directly — no exploration needed. -->

Current `app/[locale]/layout.tsx` — the `<body>` ends EXACTLY like this (the insertion point):
```tsx
              <PaletteFab />
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
```
The layout is `export default async function LocaleLayout` — a Server Component. It has NO top-level `'use client'`. KEEP IT THAT WAY.

`lib/constants.ts` (already exists — DO NOT change in this plan; 07-01 finalizes SITE_URL/GITHUB_URL):
```ts
export const EMAIL = 'tanguy@example.com';
export const GITHUB_URL = 'https://github.com/tanguynoumea/portfolio';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev').replace(/\/$/, '');
```

`lib/ascii.ts` line 31 (already exists — DO NOT change in this plan):
```ts
const GITHUB_URL = 'https://github.com/tanguynoumea/portfolio';
```

The existing gate pattern (model for the 3 new gates) — `scripts/check-i18n-parity.ts`:
```ts
import { readFileSync } from 'node:fs';
// ... read files, build assertion ...
if (/* failure */) {
  console.error('... FAILED.');
  process.exit(1);
}
console.log('... OK ...');
```
Gates are plain `tsx` scripts: read with `node:fs`, assert, `console.error` + `process.exit(1)` on failure, `console.log` success, exit 0. No test framework. `tsx` is a devDependency (already installed).

Existing `package.json` scripts block (append the 3 new aliases here):
```json
"test": "vitest run",
"test:palettes": "tsx scripts/validate-palettes.ts",
"test:stress": "tsx scripts/stress-test-palettes.ts",
"check:reduced-motion": "tsx scripts/check-reduced-motion.ts",
"check:images": "tsx scripts/check-image-audit.ts",
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Vercel deps, mount Analytics/SpeedInsights in layout, write the 3 verification gates + npm aliases</name>
  <read_first>
    - app/[locale]/layout.tsx (the file being modified — note the exact <body> tail at lines ~199-203 and that it is a Server Component with NO 'use client')
    - lib/constants.ts (the only NEXT_PUBLIC_* var is NEXT_PUBLIC_SITE_URL — the leak gate's allowlist)
    - scripts/check-i18n-parity.ts (the gate pattern to model the 3 new gates on: node:fs read + assert + process.exit(1))
    - 07-RESEARCH.md §"The #1 Deliverable" (exact imports + placement) and §"Validation Architecture" (the 3 gates' acceptance) and §"Standard Stack" (v2 pins)
    - package.json scripts block (where the 3 new aliases go)
  </read_first>
  <files>package.json, package-lock.json, app/[locale]/layout.tsx, scripts/check-analytics.ts, scripts/check-env-leak.ts, scripts/check-readme.ts</files>
  <action>
    Five sub-steps (the analytics core of DEPLOY-03 plus the three gates that verify this whole plan):

    1. **Install both deps (versions re-verified at plan time: analytics 2.0.1, speed-insights 2.0.0):**
       ```bash
       npm install @vercel/analytics@^2.0.1 @vercel/speed-insights@^2.0.0
       ```
       This updates `package.json` dependencies + `package-lock.json`. Both MUST land at `^2` (NOT `^1` — STACK.md's ^1.x is stale, both packages are now v2). Verify the carets afterward.

    2. **Mount the components in `app/[locale]/layout.tsx`** — VERBATIM from 07-RESEARCH:
       - Add these two imports to the existing import block (alongside the other `@/...` imports near the top):
         ```tsx
         import { Analytics } from '@vercel/analytics/next';
         import { SpeedInsights } from '@vercel/speed-insights/next';
         ```
         Use `/next` for BOTH — NOT `/react` (Pitfall 1: `/react` silently drops App Router route tracking).
       - Insert `<Analytics />` and `<SpeedInsights />` as the LAST children of `<body>`, AFTER `</NextIntlClientProvider>`, so the tail becomes exactly:
         ```tsx
                       <PaletteFab />
                     </LenisProvider>
                   </ThemeProvider>
                 </NextIntlClientProvider>
                 <Analytics />
                 <SpeedInsights />
               </body>
             </html>
         ```
       - **DO NOT add `'use client'` to the layout** (Pitfall 3 — breaks setRequestLocale/getMessages/generateMetadata). The `/next` components carry their own internal client boundary. Touch NOTHING else: the `<head>`/`PaletteFouCScript`/`suppressHydrationWarning` FOUC guard, the provider tree, and `generateMetadata` stay byte-identical.

    3. **Write `scripts/check-analytics.ts`** (DEPLOY-03 static gate, modeled on check-i18n-parity.ts):
       - `readFileSync('app/[locale]/layout.tsx', 'utf8')`.
       - Assert the source contains ALL FOUR markers: `@vercel/analytics/next`, `@vercel/speed-insights/next`, `<Analytics`, `<SpeedInsights`.
       - Assert the source does NOT contain a top-level client directive: FAIL if the file's first non-comment, non-blank line is `'use client'` or `"use client"`. (Simple heuristic: split on newline, find first line that is not blank and not starting with `/*`/`*`/`//`/`import`; if it equals a use-client directive → fail. Pragmatically, just assert the source does not contain `'use client'` as a standalone line at the very top — the layout has none today.)
       - On any miss: `console.error` the specific missing marker + `process.exit(1)`. On success: `console.log('check-analytics OK — both /next imports + both components mounted; layout stays a Server Component.')`.

    4. **Write `scripts/check-env-leak.ts`** (DEPLOY-03 / D-08 leak gate):
       - Enumerate tracked source files to scan. Simplest deterministic approach: `import { execSync } from 'node:child_process'` and run `git ls-files '*.ts' '*.tsx' '*.json' '*.mjs' '*.js'`, split on newline. (This scans only tracked files, matching the "tracked tree" requirement.)
       - For each file, read it and regex-match all `NEXT_PUBLIC_[A-Z0-9_]+` occurrences.
       - PASS rule: the ONLY allowed var name is `NEXT_PUBLIC_SITE_URL`. FAIL if any OTHER `NEXT_PUBLIC_*` identifier appears anywhere, OR if a `NEXT_PUBLIC_*` assignment's value matches a secret heuristic (`/(secret|token|key|password|api[_-]?key)/i` in the same line, or a long opaque string `[A-Za-z0-9_\-]{32,}` assigned to it). Skip lines inside `node_modules` (already excluded by `git ls-files`) and skip the gate script files themselves and PLAN/doc `.md` files (not in the glob anyway).
       - On failure: `console.error` the offending file + line + `process.exit(1)`. On success: `console.log('check-env-leak OK — only NEXT_PUBLIC_SITE_URL exposed (public origin).')`.

    5. **Write `scripts/check-readme.ts`** (DEPLOY-01 README + repo-URL consistency gate):
       - `readFileSync('README.md', 'utf8')`.
       - FAIL if it contains scaffold boilerplate: `bootstrapped with` OR `create-next-app`.
       - FAIL unless it contains the portfolio markers: `Tanguy` AND `Next.js 16` AND at least one of (`Tailwind`, `next-intl`, `GSAP`) (a stack list signal).
       - **Repo-URL consistency:** read `lib/constants.ts` and `lib/ascii.ts`; extract the `GITHUB_URL` literal from each (regex `github\.com\/[\w-]+\/[\w.-]+`). Assert both files reference the SAME `owner/repo`, and assert README.md contains that same `owner/repo` string. (This is what keeps D-02 honest: when 07-01 changes the owner, this gate forces all three to move together.)
       - On any failure: `console.error` the specific reason + `process.exit(1)`. On success: `console.log('check-readme OK — real portfolio README + consistent repo URL across constants/ascii/README.')`.

    6. **Add 3 npm aliases** to `package.json` scripts (after `check:images`), so CI + local stay uniform:
       ```json
       "check:analytics": "tsx scripts/check-analytics.ts",
       "check:env-leak": "tsx scripts/check-env-leak.ts",
       "check:readme": "tsx scripts/check-readme.ts",
       ```

    Note: at this point `check-readme.ts` will FAIL (README is still the scaffold) — that is expected; Task 2 rewrites the README. The other two gates (`check:analytics`, `check:env-leak`) must pass after this task.
  </action>
  <verify>
    <automated>npx tsx scripts/check-analytics.ts</automated>
    <automated>npx tsx scripts/check-env-leak.ts</automated>
    <automated>node -e "const p=require('./package.json');const a=p.dependencies['@vercel/analytics'],s=p.dependencies['@vercel/speed-insights'];if(!/^\^2/.test(a)||!/^\^2/.test(s)){console.error('vercel deps not at ^2:',a,s);process.exit(1)}console.log('vercel deps at ^2 OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/layout.tsx` contains `@vercel/analytics/next` AND `@vercel/speed-insights/next` AND `<Analytics` AND `<SpeedInsights`
    - `app/[locale]/layout.tsx` does NOT contain a top-level `'use client'` directive (grep for a standalone use-client line returns nothing)
    - `package.json` `dependencies` has `@vercel/analytics` matching `^2` AND `@vercel/speed-insights` matching `^2`
    - `package.json` `scripts` has `check:analytics`, `check:env-leak`, `check:readme`
    - `scripts/check-analytics.ts`, `scripts/check-env-leak.ts`, `scripts/check-readme.ts` all exist
    - `npx tsx scripts/check-analytics.ts` exits 0
    - `npx tsx scripts/check-env-leak.ts` exits 0
  </acceptance_criteria>
  <done>Both Vercel deps installed at ^2; Analytics + SpeedInsights mounted from /next as the last <body> children with the layout still a Server Component; all 3 gate scripts written + aliased; check-analytics + check-env-leak pass (check-readme intentionally still red until Task 2).</done>
</task>

<task type="auto">
  <name>Task 2: Rewrite README (D-04), add CI workflow (D-07), rename master→main (D-01), generate pre-deploy checklist (D-10)</name>
  <read_first>
    - README.md (the scaffold default being replaced — confirm it contains "bootstrapped with")
    - 07-RESEARCH.md §"CI Workflow — exact .github/workflows/ci.yml" (use the YAML VERBATIM) and §"GitHub Repo Create + Push" (D-01 rename command)
    - 07-CONTEXT.md D-04 (README sections) and D-10 (the full placeholder enumeration)
    - lib/constants.ts + lib/ascii.ts (the GITHUB_URL = tanguynoumea/portfolio that README must match so check-readme's consistency rule passes)
    - package.json scripts (the exact npm script names the README + CI reference)
  </read_first>
  <files>README.md, .github/workflows/ci.yml, .planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md</files>
  <action>
    Four sub-steps:

    1. **Rewrite `README.md`** as a real portfolio README (D-04) — replace the scaffold entirely. Must NOT contain `bootstrapped with` or `create-next-app`. Include, in order:
       - **Title + one-line pitch:** "Tanguy Delrieu — bilingual (FR/EN) creative portfolio. Hybrid profile: Tech × Design × BIM."
       - **Live URL placeholder:** a line like `Live: https://tanguy.dev (production URL set after Vercel connect)` — 07-01 finalizes this. (A CI/Vercel badge is deferred to 07-01 once URLs exist — do not add badges with placeholder URLs.)
       - **Signature features** (bullets): runtime WCAG-aware palette switcher (4 presets + custom HSL + harmonic generator with live contrast, all OKLCh) + secret Vaporwave palette unlocked via the Konami code; bilingual FR/EN with localized `/fr` `/en` routes; GSAP + Lenis (single shared RAF) + Motion animations; MDX project case studies with parallax.
       - **Tech stack** (a list — this satisfies check-readme's stack signal): **Next.js 16** (App Router, Turbopack), React 19.2, TypeScript 5.6 strict, **Tailwind v4** (CSS-variable OKLCh tokens), **next-intl** v4, **GSAP** + Lenis + Motion, **culori** (WCAG/OKLCh), `@next/mdx`, shadcn/ui (Radix).
       - **Local development:** `npm install` then `npm run dev` (opens on http://localhost:3000, `/` redirects to the browser locale).
       - **Scripts:** document `npm test`, `npm run lint`, `npm run test:palettes`, `npm run test:stress`, `npm run check:reduced-motion`, `npm run check:images`, `npm run check:analytics`, `npm run check:env-leak`, `npm run check:readme`, `npm run lighthouse:mobile`.
       - **Deploy note:** "Deployed on Vercel with zero config (Next.js auto-detected). Every push to `main` triggers a production deploy."
       - **Repo URL consistency:** the README MUST reference `tanguynoumea/portfolio` (the same `owner/repo` currently in `lib/constants.ts` GITHUB_URL + `lib/ascii.ts`), e.g. in a clone instruction `git clone https://github.com/tanguynoumea/portfolio`. This makes `check-readme`'s consistency rule pass. (If 07-01's D-02 checkpoint later changes the owner, 07-01 updates all three together.)
       - Tone: on-brand, creative-but-professional, bilingual-aware. Text-first (a hero screenshot is a nice-to-have deferred to post-deploy).

    2. **Create `.github/workflows/ci.yml`** — VERBATIM from 07-RESEARCH §"CI Workflow" (do not paraphrase the steps):
       ```yaml
       name: CI

       on:
         push:
           branches: [main]
         pull_request:

       jobs:
         ci:
           runs-on: ubuntu-latest
           steps:
             - name: Checkout
               uses: actions/checkout@v4

             - name: Setup Node 22
               uses: actions/setup-node@v4
               with:
                 node-version: 22
                 cache: npm

             - name: Install dependencies
               run: npm ci

             - name: Lint
               run: npm run lint

             - name: Unit tests
               run: npm test

             - name: Palette validation
               run: npm run test:palettes

             - name: Palette stress test
               run: npm run test:stress

             - name: i18n parity gate
               run: npx tsx scripts/check-i18n-parity.ts

             - name: MDX structure gate
               run: npx tsx scripts/check-mdx-structure.ts

             - name: Reduced-motion gate
               run: npm run check:reduced-motion

             - name: Image audit gate
               run: npm run check:images

             - name: Build
               run: npm run build
       ```
       Note: `check-i18n-parity` + `check-mdx-structure` have NO npm alias — call them via `npx tsx` exactly as shown. Lighthouse is deliberately EXCLUDED (env-sensitive, needs a running server — stays a deployed/manual measurement per D-09). The 3 new gates from Task 1 may optionally be appended as steps, but the locked YAML above is the required baseline; do not remove any step from it.

    3. **Rename the branch (D-01):**
       ```bash
       git branch -m master main
       ```
       This is local-only (no remote exists yet; 07-01 adds it). After this, `git rev-parse --abbrev-ref HEAD` → `main`.

    4. **Create `.planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md`** (D-10) — a checkbox list enumerating EVERY placeholder the user must replace for a real launch. Frame it clearly: "The site deploys and works with placeholders — this is a content-quality checklist, NOT a deploy blocker." Enumerate exactly:
       - [ ] Real bio text — `messages/fr.json` + `messages/en.json` → `about.paragraphs.1` / `about.paragraphs.2`
       - [ ] Real "about" photo — `public/about-photo.jpg`
       - [ ] Real email — `lib/constants.ts` `EMAIL` (currently `tanguy@example.com`)
       - [ ] Real LinkedIn URL — `lib/constants.ts` `LINKEDIN_URL`
       - [ ] Real GitHub URL — `lib/constants.ts` `GITHUB_URL` + `lib/ascii.ts` (console art) — finalized in 07-01 once the repo account is confirmed (D-02)
       - [ ] Real project covers + gallery — `public/projects/{slug}/cover.jpg` + `[1-4].jpg` (currently shared placeholders)
       - [ ] Real project MDX bodies — `content/projects/*.{fr,en}.mdx` (currently plausible placeholders)
       - [ ] CV-EN translation — `public/cv-en.pdf` (currently a copy of the FR PDF)
       - [ ] `NEXT_PUBLIC_SITE_URL` — the real production origin, set in the Vercel dashboard (07-01 / D-05); falls back to `https://tanguy.dev`
       - [ ] Real skill lists — `messages/fr.json` + `messages/en.json` → `skills.groups.{tech,design,bim}.items[]`
  </action>
  <verify>
    <automated>npx tsx scripts/check-readme.ts</automated>
    <automated>git rev-parse --abbrev-ref HEAD</automated>
    <automated>node -e "const fs=require('fs');const y=fs.readFileSync('.github/workflows/ci.yml','utf8');for(const s of ['npm ci','npm run lint','npm test','npm run build','actions/setup-node@v4','node-version: 22']){if(!y.includes(s)){console.error('ci.yml missing:',s);process.exit(1)}}console.log('ci.yml OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `README.md` does NOT contain `bootstrapped with` or `create-next-app`
    - `README.md` contains `Next.js 16` AND `Tanguy` AND a stack list (Tailwind/next-intl/GSAP) AND `tanguynoumea/portfolio`
    - `git rev-parse --abbrev-ref HEAD` outputs `main`
    - `.github/workflows/ci.yml` contains `npm ci`, `npm run lint`, `npm test`, `npm run build`, `actions/setup-node@v4`, `node-version: 22`, `npx tsx scripts/check-i18n-parity.ts`, `npx tsx scripts/check-mdx-structure.ts`
    - `.github/workflows/ci.yml` does NOT contain `lighthouse`
    - `.planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md` exists and lists EMAIL, about-photo, GITHUB_URL, cv-en.pdf, NEXT_PUBLIC_SITE_URL, skills.groups
    - `npx tsx scripts/check-readme.ts` exits 0
  </acceptance_criteria>
  <done>README is a real portfolio README that passes check-readme; ci.yml matches the locked research YAML (Node 22, all gates, build, no lighthouse); branch is `main`; PRE-DEPLOY-CHECKLIST.md enumerates all placeholders.</done>
</task>

<task type="auto">
  <name>Task 3: Full-suite verification (the exact CI command) + commit everything</name>
  <read_first>
    - 07-VALIDATION.md §"Test Infrastructure" (the full-suite / pre-push command — this is exactly what CI re-runs, so green locally ⇒ green in CI)
    - 07-RESEARCH.md §"Validation Architecture" §"Sampling Rate" (per-wave / pre-push gate)
    - package.json (confirm all script names resolve)
  </read_first>
  <files>(no source edits — verification + commit only)</files>
  <action>
    1. **Run the full pre-push suite** — the SAME command CI runs (07-VALIDATION §Test Infrastructure), plus the 3 new gates:
       ```bash
       npm test && npm run test:palettes && npm run test:stress && npx tsx scripts/check-i18n-parity.ts && npx tsx scripts/check-mdx-structure.ts && npm run check:reduced-motion && npm run check:images && npm run check:analytics && npm run check:env-leak && npm run check:readme && npm run build
       ```
       Every segment MUST exit 0. The Vitest suite is ~336 tests. `npm run build` is `next build` (Turbopack). If `npm run build` surfaces a TS/lint error from the layout edit, fix it (most likely: import ordering — Prettier/ESLint may want the two `@vercel/*` imports sorted; run `npm run lint` and fix). Analytics/SpeedInsights are no-ops in build/dev so they will not error or beacon locally.
       - Note on Windows: the chrome-launcher EPERM temp-cleanup race only affects `lighthouse:*` (NOT in this suite) — ignore; lighthouse is not run here.

    2. **Commit all of 07-00's work** with the GSD commit tool, staging only the files this plan touched (NOT `git add -A`):
       ```bash
       node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "feat(07-00): vercel analytics mount + CI + README + main rename + deploy gates (DEPLOY-01, DEPLOY-03)" --files package.json package-lock.json "app/[locale]/layout.tsx" scripts/check-analytics.ts scripts/check-env-leak.ts scripts/check-readme.ts README.md .github/workflows/ci.yml .planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md
       ```
       (The commit lands on the `main` branch — the rename happened in Task 2.)
  </action>
  <verify>
    <automated>npm test && npm run check:analytics && npm run check:env-leak && npm run check:readme</automated>
    <automated>npm run build</automated>
    <automated>git rev-parse --abbrev-ref HEAD</automated>
  </verify>
  <acceptance_criteria>
    - `npm test` exits 0 (full Vitest suite green)
    - `npm run test:palettes`, `npm run test:stress`, `npm run check:reduced-motion`, `npm run check:images` all exit 0
    - `npx tsx scripts/check-i18n-parity.ts` and `npx tsx scripts/check-mdx-structure.ts` exit 0
    - `npm run check:analytics`, `npm run check:env-leak`, `npm run check:readme` all exit 0
    - `npm run build` exits 0
    - The 9 plan files are committed on the `main` branch (verify `git log -1 --name-only` lists them; `git status` shows them no longer modified)
  </acceptance_criteria>
  <done>The exact CI command passes locally end-to-end (so CI will be green when 07-01 pushes), and all 07-00 artifacts are committed on `main`. The repo is push-ready; 07-01 takes over for the GitHub push + Vercel checkpoints.</done>
</task>

</tasks>

<verification>
Phase-prep checks (all headless, all in this plan):
- Branch is `main` (`git rev-parse --abbrev-ref HEAD`).
- Analytics + SpeedInsights mounted from `/next` as last `<body>` children; layout still a Server Component (`npm run check:analytics`).
- No secret `NEXT_PUBLIC_*` leak — only `NEXT_PUBLIC_SITE_URL` (`npm run check:env-leak`).
- README is real, repo URL consistent across constants/ascii/README (`npm run check:readme`).
- CI workflow present with the locked steps; build green locally (= green in CI).
- Pre-deploy checklist enumerates every placeholder.
- Full existing suite (336 tests) + all gates + build green.

NOTE: live deploy verification (DEPLOY-02 URL reachability + auto-deploy, DEPLOY-03 real beaconing, A11Y-08 deployed Lighthouse) is intrinsically HUMAN-UAT and lives in 07-01 — NOT asserted here.
</verification>

<success_criteria>
- `@vercel/analytics@^2` + `@vercel/speed-insights@^2` installed; both mounted from `/next` in `app/[locale]/layout.tsx`; layout NOT converted to a client component (DEPLOY-03 automatable half).
- 3 new gates (`check-analytics`, `check-env-leak`, `check-readme`) written, aliased, and green.
- README rewritten to a real portfolio README; CI workflow added (Node 22, all gates, build, no lighthouse); branch renamed to `main` (DEPLOY-01 automatable half).
- PRE-DEPLOY-CHECKLIST.md generated (D-10).
- Full pre-push suite + build pass locally; everything committed on `main`.
</success_criteria>

<output>
After completion, create `.planning/phases/07-deployment/07-00-SUMMARY.md`.
</output>
