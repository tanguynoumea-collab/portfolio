# Phase 7: Deployment - Research

**Researched:** 2026-05-28
**Domain:** Production deployment — public GitHub repo + Vercel auto-deploy + Vercel Analytics/Speed Insights (Next 16 App Router)
**Confidence:** HIGH (Vercel import paths + versions verified against official docs dated 2026-03-20 and the live npm `exports` map; gh/git state verified in-repo)

## Summary

Deployment is well-trodden ground; this phase has only a handful of genuine unknowns and they are all now resolved. The single highest-value lookup — the exact `@vercel/analytics` + `@vercel/speed-insights` imports for Next 16 App Router — is confirmed: both ship a dedicated `./next` entry point, the components are RSC-safe wrappers (no `"use client"` needed in the server layout), and **both packages are now at major v2** (`@vercel/analytics@2.0.1`, `@vercel/speed-insights@2.0.0`) — a major bump since `.planning/research/STACK.md` predicted `^1.x`. Mount `<Analytics />` + `<SpeedInsights />` as the last children of `<body>` in `app/[locale]/layout.tsx`, after `<PaletteFab />`.

Vercel needs **no `vercel.json`** — framework auto-detection builds Next 16 + Turbopack with zero config. The only client-exposed env var is `NEXT_PUBLIC_SITE_URL` (a public origin by design), so the leak-check gate (D-08) is a simple grep over tracked files for secret-looking `NEXT_PUBLIC_*` values. `.gitignore` already excludes `.env`, `.env*.local`, and `.vercel`, so the public push is secrets-safe.

The agent-automatable work (07-00) is: install the two deps + wire the layout, rewrite the README, add `.github/workflows/ci.yml`, rename `master`→`main`, write the pre-deploy checklist, and re-verify the suite. The checkpoint-heavy work (07-01) is the `gh repo create … --push` of 199 commits (with the D-02 account confirmation) followed by the human-only Vercel OAuth/connect/env/deploy, then deployed Lighthouse measurement (D-09).

**Primary recommendation:** Use `@vercel/analytics@^2.0.1` + `@vercel/speed-insights@^2.0.0`; both imported from `/next`, both mounted as plain elements at the end of `<body>`. No `vercel.json`. CI on Node 22 calls the existing npm scripts + two un-aliased `tsx` gates. Push existing history with `gh repo create <owner>/portfolio --public --source=. --remote=origin --push` (gh has the `workflow` scope, so the `.github/workflows/ci.yml` push will not be rejected).

## User Constraints (from CONTEXT.md)

### Locked Decisions (D-01 .. D-11)
- **D-01:** Rename `master` → `main` before pushing (`git branch -m master main`). Agent, autonomous, before remote setup.
- **D-02:** GitHub account/repo target is a **USER-CONFIRMED checkpoint**. `gh` is authed as `tanguynoumea-collab`, but `GITHUB_URL` + console art + footer reference `tanguynoumea/portfolio`. **The agent must NOT guess the owner.** Recommended default (user confirms): create as `tanguynoumea/portfolio`, public, IF the authed account can push to that namespace; otherwise re-auth as `tanguynoumea` OR create `tanguynoumea-collab/portfolio` and update `GITHUB_URL` + `lib/ascii.ts` + README to match. Whatever the final URL, all repo refs MUST end up consistent.
- **D-03:** Keep `.planning/` in the public repo (v1). `/gsd:pr-branch` deferred.
- **D-04:** Real portfolio README replacing the create-next-app scaffold.
- **D-05:** Deploy to the Vercel `*.vercel.app` URL first; custom domain deferred. Update `SITE_URL` / `NEXT_PUBLIC_SITE_URL` to the real origin post-connect.
- **D-06:** Vercel connection is a **HUMAN-ACTION checkpoint** (OAuth + GitHub integration + dashboard env var). Zero-config; no `vercel.json`.
- **D-07:** Lightweight `.github/workflows/ci.yml` — `npm ci`, lint, test, build, + the `check-*` gates. Node 22. Runs on push to `main` + PRs.
- **D-08:** `@vercel/analytics` + `@vercel/speed-insights` mounted in `app/[locale]/layout.tsx` as the LAST children of `<body>`. No sensitive `NEXT_PUBLIC_*` leak (only `NEXT_PUBLIC_SITE_URL`, public by design). Grep gate confirms.
- **D-09:** Measure deployed homepage Lighthouse mobile post-connect; remediate Performance ONLY if < 90, via `next/dynamic` code-splitting of below-fold/animation-heavy sections. Authoritative A11Y-08 ≥90 confirmation lives here.
- **D-10:** Generate a pre-deploy content-swap checklist enumerating every placeholder (bio, photo, email, LinkedIn, GitHub URL, project covers/gallery, project MDX bodies, CV-EN PDF, `SITE_URL`, skill lists). Site deploys functional with placeholders — checklist is for content quality, not a deploy blocker.
- **D-11:** 2 plans — `07-00-deploy-prep-PLAN.md` (autonomous) + `07-01-go-live-PLAN.md` (`autonomous: false`, checkpoint-heavy). 07-01 depends on 07-00.

### Claude's Discretion (researcher/planner resolves)
- Exact `@vercel/analytics` import (`/react` vs `/next`) + SpeedInsights `/next` → **RESOLVED below: both `/next`.**
- README depth + screenshot/GIF → recommend text-first README; hero screenshot is a nice-to-have once deployed.
- CI Node version + cache → **Node 22 + `actions/setup-node` built-in npm cache** (confirmed below).
- CI status + Vercel deploy badges in README → recommend yes, after URLs exist (deferred to post-deploy edit).
- `gh repo create` `--public` immediately vs `--private` then flip → recommend `--public` per D-02; user confirms at the checkpoint.
- Which sections to `next/dynamic` if Perf < 90 → **About / Skills / Contact / ProjectsSection + the project-page parallax cover; NEVER Hero/above-fold** (detail below).
- Analytics route-awareness for localized routes → the default `<Analytics />` auto-tracks route changes (the `/next` wrapper hooks the App Router). No extra config.

### Deferred Ideas (OUT OF SCOPE)
- Custom domain `tanguy.dev` purchase + DNS — user adds in dashboard post-launch.
- Filtering `.planning/` out via `/gsd:pr-branch`.
- CI E2E / test matrix expansion.
- Vercel preview-deploy PR comment bots / deployment environments.
- Web Vitals dashboards / custom event tracking.
- Real content swaps (user supplies their data; checklist surfaces them).
- `next/dynamic` code-splitting **unless** deployed Perf < 90.
- Search Console / Bing sitemap submission, Sentry, uptime checks, `robots.txt` preview disallow (Vercel noindexes previews automatically).
- Milestone v2 planning.

## Project Constraints (from CLAUDE.md)

- **Next.js 16** App Router + React 19.2 + TypeScript 5.6 strict — **no `any`**. `<Analytics />`/`<SpeedInsights />` are typed components with no props needed; zero `any` risk.
- **Server Components by default**, `"use client"` only when interaction is needed. The two Vercel components are client-side wrappers but are designed to be rendered from a Server Component layout WITHOUT a `"use client"` directive on the layout — this is the canonical Vercel App Router pattern and matches `app/[locale]/layout.tsx` (currently a Server Component). **Do not add `"use client"` to the layout.**
- **No secrets in the client bundle.** Only `NEXT_PUBLIC_SITE_URL` is exposed (public origin). D-08 leak-check enforces.
- **TOUTES les couleurs en CSS variables OKLCh** — N/A to this phase (no new UI styling).
- **GSD workflow enforcement** — all edits go through the 07-00 / 07-01 plans.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | Repo `tanguynoumea/portfolio` exists (public/private), with README, `main` carries production code | `gh repo create … --source=. --push` (gh authed, `repo`+`workflow` scopes); `git branch -m master main` (D-01); README rewrite (D-04). Owner is the D-02 checkpoint. |
| DEPLOY-02 | Vercel connected via GitHub integration, auto-deploys on `main` push, production URL reachable | Zero-config Next 16 detect (no `vercel.json`); HUMAN-ACTION OAuth/connect (D-06); `NEXT_PUBLIC_SITE_URL` env model. **Live-URL verification is intrinsically HUMAN-UAT.** |
| DEPLOY-03 | `@vercel/analytics` + `@vercel/speed-insights` active in prod (Web Vitals tracked, no sensitive `NEXT_PUBLIC_*` leak) | Exact `/next` imports + body placement (below); v2 versions; grep leak-gate. Real beaconing is prod-only HUMAN-UAT (no-op in dev/non-Vercel). |

## Standard Stack

### New Dependencies (runtime only — exactly 2)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@vercel/analytics` | `^2.0.1` | Page-view / Web Analytics beacon, App Router route tracking | Official Vercel package; `/next` wrapper integrates with App Router navigation. v2 is current `latest`. |
| `@vercel/speed-insights` | `^2.0.0` | Real-user Core Web Vitals (Speed Insights) | Official Vercel package; `/next` wrapper. v2 is current `latest`. |

**Installation:**
```bash
npm install @vercel/analytics@^2.0.1 @vercel/speed-insights@^2.0.0
```

**Version verification (run during planning to confirm `latest` hasn't moved):**
```bash
npm view @vercel/analytics version       # verified: 2.0.1 on 2026-05-28
npm view @vercel/speed-insights version   # verified: 2.0.0 on 2026-05-28
```

> ⚠️ **Heads-up for the planner:** `.planning/research/STACK.md` (lines 305–306) pins `@vercel/analytics ^1.4.0` + `@vercel/speed-insights ^1.1.0`. That research is stale — both are **v2** now. Use the v2 pins above. v2 has no breaking API change for the basic `<Analytics />` / `<SpeedInsights />` usage (still zero-prop components from `/next`); the major bump is internal (build/runtime), so a `^2` caret is safe. Both packages emit a Vercel dashboard note: "Version 2 package updates are available."

No new **dev** dependencies. `lighthouse@^13.3.0` is already installed (used by the `lighthouse:mobile` script for D-09).

## The #1 Deliverable — Exact Analytics + Speed Insights Wiring (Next 16 App Router)

**Verified against official Vercel docs (quickstarts last updated 2026-03-20) AND the live npm `exports` map for both packages.** For Next.js App Router (`nextjs-app`), the canonical entry point is **`/next`** (NOT `/react` — `/react` is the create-react-app variant; `/next` adds App Router route support).

### Imports (add to `app/[locale]/layout.tsx`)
```tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
```

### JSX placement — LAST children of `<body>`, after `<PaletteFab />`
The existing `<body>` ends like this (current lines ~199–203):
```tsx
              <PaletteFab />
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
```
Mount the two components as the final children of `<body>`, **outside** `NextIntlClientProvider` (they need no i18n context — keep them as plain siblings so they sit at the very end of `<body>` exactly as the Vercel docs show `{children}` followed by `<Analytics />`):
```tsx
              <PaletteFab />
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
```

**Why this placement & why no `"use client"`:**
- Both `/next` components are **RSC-safe wrappers** — they internally carry their own client boundary. The official `app/layout.tsx` example renders them directly in the Server Component root layout with no `"use client"` directive. The existing `app/[locale]/layout.tsx` is a Server Component (`async function LocaleLayout`) and **must stay one** — do NOT add `"use client"`.
- Placing them as the last `<body>` children (rather than inside the provider tree) matches the docs verbatim and keeps them out of the Lenis/Theme contexts they don't need.
- **Both are no-ops outside Vercel production** — they don't beacon in `next dev` or on non-Vercel hosts, so they cannot affect local tests or a self-hosted build. Real beaconing only happens on the deployed Vercel URL (this is why DEPLOY-03's live verification is HUMAN-UAT).

> **One-time Vercel dashboard step (HUMAN-ACTION, part of 07-01):** Analytics and Speed Insights must ALSO be **enabled** in the Vercel project dashboard (Analytics → Enable; Speed Insights → Enable). The code mount is necessary but not sufficient — enabling provisions the `/_vercel/insights/*` and `/_vercel/speed-insights/*` routes. The plan must list this as an explicit checkpoint sub-step.

## Vercel Zero-Config + Env Model (DEPLOY-02)

### No `vercel.json` needed — CONFIRMED
Vercel auto-detects Next.js and applies the framework preset: build command `next build`, output handled natively, Turbopack used per the project's own config. `next.config.ts` already wires `next-intl` + MDX + `images.formats` — none of that requires a Vercel override. **Do not add a `vercel.json`.** (Only add one if a future need arises for a build-command override, custom headers, or rewrites Vercel can't infer — none apply here.)

### `NEXT_PUBLIC_*` exposure model
- Next.js inlines any env var prefixed `NEXT_PUBLIC_` into the **client bundle** at build time. Everything else stays server-only.
- This project's ONLY `NEXT_PUBLIC_*` var is **`NEXT_PUBLIC_SITE_URL`** (read in `lib/constants.ts` → `SITE_URL`, falling back to `https://tanguy.dev`). It is a public origin by design — safe to expose.
- **Set `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard** (Project → Settings → Environment Variables) to the assigned production origin (e.g. `https://tanguy-portfolio.vercel.app`) so `metadataBase` / canonical / hreflang / sitemap / OG all resolve to absolute URLs that actually work. This is a HUMAN-ACTION step (07-01), because the production origin is only known after the first Vercel deploy assigns it.
- **D-08 leak-check gate** (automatable): grep the tracked tree for any `NEXT_PUBLIC_` assignment whose value looks like a secret (long token, `key`, `secret`, `token`, `password`). Expected result: only `NEXT_PUBLIC_SITE_URL`, value is a URL. See Validation Architecture.

### GitHub integration auto-deploy
After the user imports the repo at `vercel.com/new` and authorizes the GitHub app (HUMAN-ACTION), Vercel watches the repo: every push/merge to `main` triggers a production deploy; every push to other branches/PRs triggers a preview deploy (auto-noindexed). No terminal `vercel deploy` needed for the steady state — the git push IS the deploy trigger (satisfies DEPLOY-02 "auto-deploys on push main").

## CI Workflow — exact `.github/workflows/ci.yml` (DEPLOY-02 / D-07)

**No `.github/` directory exists yet** (verified — glob returned no `.github/**/*.yml`). This file is NEW.

**Script reality (verified against `package.json`):** Some gates have npm aliases, two do NOT.

| Gate | npm alias? | CI invocation |
|------|-----------|---------------|
| Vitest suite (336 tests) | `npm test` | `npm test` |
| Palette validation | `npm run test:palettes` | `npm run test:palettes` |
| Palette stress test | `npm run test:stress` | `npm run test:stress` |
| Reduced-motion gate | `npm run check:reduced-motion` | `npm run check:reduced-motion` |
| Image audit gate | `npm run check:images` | `npm run check:images` |
| **i18n parity** (`scripts/check-i18n-parity.ts`) | **none** | `npx tsx scripts/check-i18n-parity.ts` |
| **MDX structure** (`scripts/check-mdx-structure.ts`) | **none** | `npx tsx scripts/check-mdx-structure.ts` |
| Lint | `npm run lint` | `npm run lint` |
| Build | `npm run build` | `npm run build` |

> Planner option: add `"check:i18n": "tsx scripts/check-i18n-parity.ts"` and `"check:mdx": "tsx scripts/check-mdx-structure.ts"` to `package.json` in 07-00 so CI calls `npm run check:i18n` / `npm run check:mdx` for consistency. Either approach works; the `npx tsx …` form below needs no package.json change. (`tsx` is a devDependency, so it's available after `npm ci`.)

```yaml
# .github/workflows/ci.yml
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

**Notes:**
- `actions/setup-node@v4` with `cache: npm` reads `package-lock.json` and restores `~/.npm` automatically — no manual `actions/cache` step needed. (Confirm `package-lock.json` is committed; it must be, for `npm ci` to work — verify in 07-00.)
- Node `22` = current LTS and Vercel's default build runtime. Local dev is Node 24 (verified) but pinning CI to 22 matches the deploy environment. No `.nvmrc` exists; the planner may optionally add one (`22`) but it's not required for CI.
- **Do NOT add `npm run lighthouse` to CI** — Lighthouse needs a running server + headless Chrome and is environment-sensitive (the local Perf-69 result, see D-09); it stays a manual/deployed measurement. Keeping it out respects the OOS "no E2E in CI" boundary.
- `npm run build` runs `next build` (Turbopack). It does NOT run lint (Next 16 removed that), which is why `npm run lint` is a separate step.
- **`workflow` scope confirmed on the gh token** — pushing a repo that contains `.github/workflows/ci.yml` requires the OAuth `workflow` scope, and `gh auth status` shows it (`'gist', 'read:org', 'repo', 'workflow'`). The push will NOT be rejected.

## GitHub Repo Create + Push (DEPLOY-01 / D-01 / D-02)

**Verified in-repo state:** branch = `master`, **no remote configured**, **199 commits** of history.

### Step 1 — rename branch (D-01, autonomous, 07-00)
```bash
git branch -m master main
```

### Step 2 — create + push (07-01, AFTER the D-02 account checkpoint)
The recommended-default command (user confirms owner/visibility first):
```bash
gh repo create tanguynoumea/portfolio --public --source=. --remote=origin --push
```
- `--source=.` uses the current repo (existing 199-commit history) — does NOT re-init.
- `--remote=origin` adds the new repo as `origin` (none exists yet, so no conflict).
- `--push` pushes the current branch (`main` after Step 1) and sets upstream.
- `--public` per D-02 (the console easter egg invites code review). User may choose `--private` then flip later.

**D-02 caveat (USER CHECKPOINT — not the agent's to resolve):** gh is authed as `tanguynoumea-collab` but the app links say `tanguynoumea/portfolio`. Three outcomes the plan must present:
1. `tanguynoumea-collab` has push rights to the `tanguynoumea` org/namespace → the command above works as-is.
2. Re-auth gh as `tanguynoumea` (`gh auth login`) → then run as-is.
3. Create under `tanguynoumea-collab/portfolio` → then update `GITHUB_URL` (`lib/constants.ts:15`), `lib/ascii.ts:31` (`GITHUB_URL` const), and the README badge/links to match — and commit + push the correction.

If `gh repo create` reports the namespace isn't writable, it fails fast (no partial state) — safe to retry after re-auth.

## Deployed Lighthouse Remediation (D-09 — contingent, keep short)

Local `next start` recorded **Performance 69** (mobile, `/en`) in Phase 6; A11y 92 / BP 96 / SEO 92 already pass. Vercel's edge (CDN + Brotli + HTTP/2) commonly lifts a static Next site's Perf 15–30 points, so deployed ≥90 is likely. **Measure first** (`npm run lighthouse:mobile` against the deployed URL, or PageSpeed Insights on the live origin). Only if deployed Perf < 90 do the remediation.

**Lever (documented drag = GSAP + Lenis + Motion main-thread JS):** `next/dynamic` code-split the below-fold, animation-heavy client sections so their JS isn't in the initial bundle.

- **Safe to lazy-load (below the fold):** `About`, `Skills`, `Contact`, `ProjectsSection` (the filterable grid with motion `AnimatePresence`), and the project-page `ProjectCover` parallax island.
- **NEVER lazy-load:** `Hero` (above-fold, owns LCP via SplitText) and any layout chrome (Navigation, Footer, providers).

**Next 16 `next/dynamic` pattern:**
```tsx
import dynamic from 'next/dynamic';

// Default (ssr: true) — keeps SSR HTML for SEO/LCP, defers only the JS hydration chunk.
// Prefer this for content sections (About/Skills/Contact/Projects) so crawlable text stays in the HTML.
const Projects = dynamic(() => import('@/components/sections/ProjectsSection')
  .then((m) => ({ default: m.ProjectsSection })));

// ssr: false — fully client-only, no SSR HTML. Use ONLY for the parallax cover island
// or other purely-decorative client widgets where missing SSR HTML costs nothing.
const ProjectCover = dynamic(() => import('@/components/sections/ProjectCover'), { ssr: false });
```
> Caveat: in Next 16, `ssr: false` is only valid in Client Components. Page-level sections composed from a Server Component (`page.tsx`) should use the **default `dynamic()` (ssr: true)** to defer the hydration chunk while preserving server-rendered HTML — this is the right lever for Perf without sacrificing the SEO work from Phase 6. Reserve `ssr: false` for leaf client islands. This is a **contingent** task — skip entirely if deployed Perf ≥ 90.

## Validation Architecture

> `workflow.nyquist_validation: true` in `.planning/config.json` — section REQUIRED.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 (+ jsdom 29, RTL 16, vitest-axe 1.0.0-pre.5) |
| Config file | `vitest.config.ts` (+ `vitest-setup.ts` for the axe matcher) |
| Quick run command | `npm test` (full Vitest suite, ~336 tests, runs in seconds) |
| Full suite command | `npm test && npm run test:palettes && npm run test:stress && npx tsx scripts/check-i18n-parity.ts && npx tsx scripts/check-mdx-structure.ts && npm run check:reduced-motion && npm run check:images && npm run build` |
| Standalone gates | `scripts/check-*.ts` + `scripts/*-palettes.ts` via `tsx` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEPLOY-01 | `main` branch exists locally (post-rename) | smoke | `git rev-parse --abbrev-ref HEAD` → `main` | ✅ (git) |
| DEPLOY-01 | README is a real portfolio README, not the scaffold | content assertion | `npx tsx scripts/check-readme.ts` (grep README.md does NOT contain `bootstrapped with` / `create-next-app` boilerplate AND DOES contain portfolio markers e.g. `Tanguy`, `Next.js 16`, stack list) | ❌ **Wave 0** (tiny new gate) |
| DEPLOY-01 | Remote repo exists + `main` pushed | smoke (post-push) | `gh repo view <owner>/portfolio --json url,visibility` + `git ls-remote --heads origin main` | ✅ (gh) — runs in 07-01 after push |
| DEPLOY-01 | Repo URL consistency (D-02) | content assertion | grep that `lib/constants.ts` `GITHUB_URL`, `lib/ascii.ts` `GITHUB_URL`, and README all reference the SAME final owner/repo | ❌ **Wave 0** (can fold into check-readme or a small consistency gate) |
| DEPLOY-02 | Production build succeeds (deploy proxy) | build | `npm run build` (exit 0) | ✅ |
| DEPLOY-02 | Production URL reachable + renders `/fr` + `/en` + a project page + auto-deploy on push works | **HUMAN-UAT** | manual: open the assigned `*.vercel.app` URL; push a trivial commit, confirm Vercel rebuilds | ❌ intrinsic — no headless tool verifies a deploy gated on the user's Vercel account |
| DEPLOY-03 | `<Analytics />` + `<SpeedInsights />` mounted in layout from `/next` | static assertion | `npx tsx scripts/check-analytics.ts` (assert `app/[locale]/layout.tsx` imports `@vercel/analytics/next` + `@vercel/speed-insights/next` AND renders `<Analytics />` + `<SpeedInsights />`) — OR a Vitest test rendering/snapshotting the layout module's source | ❌ **Wave 0** (small new gate) — *grep-based is simplest and deterministic* |
| DEPLOY-03 | No secret-looking `NEXT_PUBLIC_*` leak | grep gate | `npx tsx scripts/check-env-leak.ts` (scan tracked `.ts/.tsx/.json/.mjs` for `NEXT_PUBLIC_[A-Z_]+` assignments; FAIL if any value matches secret heuristics or any var other than `NEXT_PUBLIC_SITE_URL` appears with a non-URL value) | ❌ **Wave 0** (D-08 gate) |
| DEPLOY-03 | Both deps installed at expected major | smoke | grep `package.json` for `@vercel/analytics` `^2` + `@vercel/speed-insights` `^2` | ✅ (package.json after install) |
| DEPLOY-03 | Real Web-Vitals beaconing in production | **HUMAN-UAT** | manual: in the deployed site's Network tab, confirm a request to `/_vercel/insights/view` (Analytics) and `/_vercel/speed-insights/vitals` (Speed Insights); confirm data appears in the Vercel dashboard after traffic | ❌ intrinsic — components are no-ops off Vercel prod |
| A11Y-08 (carryover, D-09) | Deployed homepage Lighthouse mobile ≥ 90 (all 4 axes) | **HUMAN-UAT** | manual/semi: `npm run lighthouse:mobile` against the deployed URL, or PageSpeed Insights | ❌ intrinsic — requires the live Vercel URL |

### Honest Automatable vs HUMAN-UAT split
- **Automatable (mostly 07-00, all deterministic & headless):** branch rename, README real-content assertion, repo-URL consistency, analytics-mount assertion, `NEXT_PUBLIC_` leak gate, dep-version smoke, `npm run build` as the deploy proxy, full existing suite green.
- **Post-push automatable (07-01, needs gh only):** `gh repo view` + `git ls-remote` confirm the repo exists and `main` is pushed (gh is authed — no human OAuth needed for *this* check).
- **Intrinsically HUMAN-UAT (cannot be headless-verified):**
  1. **DEPLOY-02 live URL + auto-deploy** — gated on the user's Vercel OAuth/account; no agent tool can reach or provision it.
  2. **DEPLOY-03 real beaconing** — the components are no-ops outside Vercel production; only a real browser on the live origin shows the `/_vercel/insights` + `/_vercel/speed-insights` requests.
  3. **A11Y-08 deployed Lighthouse ≥90 (D-09)** — requires the live Vercel URL; the local Perf-69 figure is not authoritative.

  The plan must mark these as HUMAN-UAT checkpoints in `07-01`, with the exact manual verification steps, rather than asserting them programmatically.

### Sampling Rate
- **Per task commit (07-00):** `npm test` (quick — the full Vitest suite already runs in seconds).
- **Per wave / pre-push:** the full-suite command above (tests + all gates + build) — this is exactly what CI re-runs, so green locally ⇒ green in CI.
- **Phase gate:** full suite green + the 4 new Wave-0 gates green before `/gsd:verify-work`; then the HUMAN-UAT checkpoints in 07-01.

### Wave 0 Gaps
- [ ] `scripts/check-analytics.ts` — asserts the two `/next` imports + `<Analytics />`/`<SpeedInsights />` mount in `app/[locale]/layout.tsx` (DEPLOY-03 automatable half).
- [ ] `scripts/check-env-leak.ts` — D-08 `NEXT_PUBLIC_*` secret-leak grep gate (DEPLOY-03).
- [ ] `scripts/check-readme.ts` — asserts README is real (no scaffold boilerplate) + carries portfolio markers + (optionally) repo-URL consistency across `constants.ts`/`ascii.ts`/README (DEPLOY-01).
- [ ] (Optional) `package.json` script aliases for `check:i18n` / `check:mdx` / the 3 new gates, so CI and local runs stay uniform.
- *Framework install:* none needed — Vitest + tsx already present.

*(These gates are tiny `tsx` scripts modeled on the existing `scripts/check-i18n-parity.ts` / `scripts/check-mdx-structure.ts` pattern — string reads + assertions, exit 1 on failure. They make the agent-automatable 60% of this phase genuinely verifiable.)*

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| git | repo history, branch rename, push | ✓ | (system) | — |
| GitHub CLI `gh` | `gh repo create` + push | ✓ (authed `tanguynoumea-collab`, scopes `repo`+`workflow`) | 2.89.0 | manual `git remote add` + create repo in browser |
| Node.js | local build/test; CI pins 22 | ✓ | v24.14.1 local / CI 22 | — |
| npm + `package-lock.json` | `npm ci` in CI | ✓ (lockfile must be committed — verify) | — | — |
| `tsx` | run `check-*.ts` gates | ✓ (devDep `^4.22.3`) | — | — |
| `lighthouse` | D-09 deployed measurement | ✓ (devDep `^13.3.0`) | — | PageSpeed Insights web tool |
| **Vercel account + OAuth** | DEPLOY-02 connect/deploy | ✗ (user-only) | — | **NONE — HUMAN-ACTION checkpoint** |
| Vercel-assigned production URL | `NEXT_PUBLIC_SITE_URL`, live verification, deployed Lighthouse | ✗ (only exists post-connect) | — | **NONE — known only after the human Vercel step** |

**Missing dependencies with no fallback (blocking the *automated* completion of the phase):**
- Vercel OAuth/connect and the assigned production URL. These are the human-action checkpoints in 07-01; `--auto` will (correctly) pause here. Everything in 07-00 plus the `gh` push in 07-01 is automatable; the Vercel half is not.

**Missing dependencies with fallback:**
- `gh repo create` → if gh auth/namespace fails, fall back to creating the repo in the browser + `git remote add origin <url>` + `git push -u origin main`. (Same end state, more manual.)
- Deployed Lighthouse → PageSpeed Insights (pagespeed.web.dev) as a no-local-Chrome alternative.

## Common Pitfalls

### Pitfall 1: Wrong analytics import entry point
**What goes wrong:** Importing `@vercel/analytics/react` in an App Router project → analytics silently fail to track route changes (no error, just missing data).
**Why:** `/react` is the create-react-app/generic variant; `/next` adds App Router navigation hooks.
**Avoid:** Use `@vercel/analytics/next` and `@vercel/speed-insights/next`. The `scripts/check-analytics.ts` gate enforces it.
**Warning sign:** No `/_vercel/insights/view` request on route change in the deployed Network tab.

### Pitfall 2: Forgetting to ENABLE Analytics/Speed Insights in the Vercel dashboard
**What goes wrong:** Code is mounted, deploy succeeds, but no data — because the dashboard toggles provision the `/_vercel/*` routes.
**Why:** The npm package + the dashboard enable are two separate steps.
**Avoid:** 07-01 lists "Enable Analytics + Enable Speed Insights in the Vercel dashboard" as explicit checkpoint sub-steps (HUMAN-ACTION).

### Pitfall 3: Adding `"use client"` to the layout to host the components
**What goes wrong:** Converting `app/[locale]/layout.tsx` to a Client Component to "make analytics work" breaks `setRequestLocale`, `getMessages`, `generateMetadata`, and the whole RSC tree.
**Why:** The `/next` components are already client-boundaried internally; the layout stays a Server Component.
**Avoid:** Mount them as plain `<body>` children; touch nothing else in the layout. (Pitfall-6 FOUC/metadata guard from Phase 6 still applies — do not regress `<head>`/`PaletteFouCScript`/`suppressHydrationWarning`.)

### Pitfall 4: Pushing without the `workflow` scope
**What goes wrong:** `git push` rejected with "refusing to allow an OAuth App to create or update workflow `.github/workflows/ci.yml` without `workflow` scope."
**Why:** GitHub blocks pushing workflow files unless the token has `workflow`.
**Avoid:** Already mitigated — gh token HAS `workflow` scope (verified). If a future re-auth (D-02 outcome 2) drops it, re-add via `gh auth refresh -s workflow`.

### Pitfall 5: Stale `SITE_URL` after deploy
**What goes wrong:** OG images, canonical, hreflang, and sitemap resolve against `https://tanguy.dev` (the placeholder) instead of the real `*.vercel.app` origin → broken absolute URLs, wrong social cards.
**Why:** `NEXT_PUBLIC_SITE_URL` not set in Vercel, so `lib/constants.ts` falls back.
**Avoid:** Setting `NEXT_PUBLIC_SITE_URL` in the dashboard is a mandatory 07-01 step (D-05). After it's set, redeploy and re-check OG/sitemap.

### Pitfall 6: Treating the local Perf-69 as the deploy verdict
**What goes wrong:** Pre-emptively code-splitting (D-09 lever) before measuring the deployed site → wasted work + possible SEO regression if `ssr:false` is misapplied to content sections.
**Why:** Edge CDN/Brotli/HTTP-2 typically add 15–30 Perf points; the local figure is pessimistic.
**Avoid:** Measure the deployed URL FIRST; remediate only if still < 90, using default `dynamic()` (ssr:true) for content sections.

## State of the Art

| Old (STACK.md, 2026-05-25) | Current (2026-05-28) | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@vercel/analytics ^1.4.0` | `@vercel/analytics ^2.0.1` | v2 released since research | Use `^2`; basic `<Analytics />` API unchanged |
| `@vercel/speed-insights ^1.1.0` | `@vercel/speed-insights ^2.0.0` | v2 released since research | Use `^2`; basic `<SpeedInsights />` API unchanged |
| (ambiguous) `/react` vs `/next` | `/next` is canonical for App Router | — | Resolves the D-08 / Discretion open question |

**Not deprecated, but worth noting:** `@vercel/analytics/react` still exists and works, but `/next` is the correct choice for App Router (route tracking). The CONTEXT.md's "(or `/react`)" aside is superseded — use `/next` for both.

## Open Questions

1. **D-02 repo owner** — `tanguynoumea` vs `tanguynoumea-collab`.
   - What we know: gh is authed as `tanguynoumea-collab`; app links say `tanguynoumea/portfolio`.
   - What's unclear: whether `tanguynoumea-collab` can push to the `tanguynoumea` namespace.
   - Recommendation: USER CHECKPOINT (07-01 Task 1, a `decision` gate). Not the agent's to resolve. Keep all repo refs consistent with the answer.
2. **`package-lock.json` committed?** — `npm ci` (CI) requires it.
   - Recommendation: verify in 07-00 (it should be tracked from Phase 1 scaffold); if missing, `npm install` to regenerate + commit before adding CI.

## Sources

### Primary (HIGH confidence)
- **Vercel Web Analytics quickstart** — https://vercel.com/docs/analytics/quickstart — last updated 2026-03-20. Confirms `import { Analytics } from '@vercel/analytics/next';` for `nextjs-app`, placed after `{children}` in `app/layout.tsx`; v2 available.
- **Vercel Speed Insights quickstart** — https://vercel.com/docs/speed-insights/quickstart — last updated 2026-03-20. Confirms `import { SpeedInsights } from '@vercel/speed-insights/next';` in the root layout; v2 available; dashboard "Enable" step required.
- **npm `exports` map (live)** — `npm view @vercel/analytics exports` / `npm view @vercel/speed-insights exports` — confirms both packages expose `./next` and `./react` subpaths; versions `2.0.1` / `2.0.0` as of 2026-05-28.
- **Next.js 16 / Vercel zero-config + `NEXT_PUBLIC_` model** — `.planning/research/STACK.md` (HIGH-rated Next 16 + Vercel sources) + CLAUDE.md stack section — Vercel native Next detection, no `vercel.json`, `NEXT_PUBLIC_*` inlined into client bundle.

### In-repo (verified this session)
- `package.json` — current deps + scripts; confirmed `check-i18n-parity`/`check-mdx-structure` have NO npm alias; `lighthouse@^13.3.0` present; STACK.md's `^1.x` vercel pins are stale.
- `app/[locale]/layout.tsx` — Server Component; `<body>` ends with `<PaletteFab />` inside `LenisProvider`/`ThemeProvider`/`NextIntlClientProvider`; do not add `"use client"`.
- `lib/constants.ts` — `SITE_URL` env-aware (`NEXT_PUBLIC_SITE_URL` ?? `https://tanguy.dev`); `GITHUB_URL` = `tanguynoumea/portfolio` (D-02 target).
- `lib/ascii.ts` — duplicate `GITHUB_URL` const (line 31) must stay consistent with `constants.ts` per D-02.
- `next.config.ts` — next-intl + MDX + `images.formats` wired; no Vercel override needed.
- `.gitignore` — excludes `.env`, `.env*.local`, `.vercel`, `.lighthouse`, `.next` — public-push safe.
- `README.md` — create-next-app scaffold (D-04 replace target).
- `scripts/*.ts` — 6 existing gates (validate-palettes, check-i18n-parity, check-mdx-structure, stress-test-palettes, check-reduced-motion, check-image-audit).
- `.planning/config.json` — `nyquist_validation: true` (Validation Architecture required); `auto_advance: false`.
- git/gh state — branch `master`, no remote, 199 commits; gh 2.89.0 authed `tanguynoumea-collab`, scopes include `workflow`.

## Metadata

**Confidence breakdown:**
- Analytics/Speed Insights imports + placement: **HIGH** — official Vercel docs (2026-03-20) + live npm exports map agree.
- Dep versions (v2): **HIGH** — `npm view` against the registry this session.
- Vercel zero-config + `NEXT_PUBLIC_` model: **HIGH** — Next/Vercel native behavior, corroborated by STACK.md.
- CI YAML: **HIGH** — standard `setup-node@v4` + verified script inventory; only contingency is `package-lock.json` presence (flagged).
- `gh` push command: **HIGH** — verified gh auth + scopes + no-existing-remote state.
- D-09 remediation: **MEDIUM** — `next/dynamic` mechanics are HIGH; whether it's *needed* is unknown until the deployed measurement (intrinsically so).

**Research date:** 2026-05-28
**Valid until:** ~2026-06-27 (30 days; Vercel analytics packages and `setup-node` are stable, but re-verify the two `npm view` versions at plan time since both just hit v2).
