# Phase 7: Deployment - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning
**Mode:** `--auto` (Claude picked recommended defaults; selections logged inline in `<decisions>`)

<domain>
## Phase Boundary

Ship the portfolio to production: a public GitHub repo with a real README and `main` carrying production code, Vercel auto-deploy on `main` push with a reachable production URL, and Vercel Analytics + Speed Insights tracking Web Vitals live. This is the FINAL phase of milestone v1.0 — after it, the portfolio is live.

Delivers REQ **DEPLOY-01, DEPLOY-02, DEPLOY-03** (3 requirements). Concretely:

- **Analytics integration (agent, autonomous):** install `@vercel/analytics` + `@vercel/speed-insights`, mount `<Analytics />` + `<SpeedInsights />` at the end of `<body>` in `app/[locale]/layout.tsx`.
- **README rewrite (agent, autonomous):** replace the create-next-app scaffold README with a real portfolio README (description, stack, local-dev, signature features, deploy notes).
- **CI workflow (agent, autonomous):** a lightweight `.github/workflows/ci.yml` running `npm ci && lint && test && build` + the `check-*.ts` gates on push/PR (catches failures before Vercel builds).
- **Branch + constants prep (agent, autonomous):** rename `master` → `main`; finalize `SITE_URL` (lib/constants.ts) + `GITHUB_URL` once the real URLs are known; commit.
- **Pre-deploy content-swap checklist (agent, autonomous):** a checklist doc enumerating every placeholder the user must replace before/around go-live.
- **GitHub repo create + push (agent-assisted, USER-CONFIRMED checkpoint):** `gh repo create` + push — but the target account/visibility is the user's call (see D-02 account discrepancy).
- **Vercel connect + env vars + deploy verify (HUMAN-ACTION checkpoints — cannot be automated):** Vercel OAuth/dashboard, env var config, production URL reachability check.
- **Deployed Lighthouse ≥90 (carryover from Phase 6 A11Y-08):** measure the deployed homepage; if Performance < 90, remediate (code-split the animation stack via `next/dynamic`).

**This phase is NOT fully autonomous.** The agent can do all the code/docs/CI/checklist work and can `gh repo create` + push (gh is authenticated). But **Vercel connection, env var configuration, custom-domain DNS, and the personal content swaps require the user** — they are human-action checkpoints that `--auto` cannot auto-approve (per execute-phase: "Auth gates cannot be automated").

**Out of scope for this phase** (explicit deferrals or other-milestone):

- **Custom domain (`tanguy.dev`) purchase + DNS** — v1 ships on the Vercel-provided `*.vercel.app` URL (immediate, free); custom domain is an optional post-launch follow-up the user does in the Vercel dashboard.
- **Filtering `.planning/` out of the public repo** — v1 keeps `.planning/` public (transparent, reversible); `/gsd:pr-branch` is the documented tool if the user later wants a clean repo. (Deferred decision, D-03.)
- **Exhaustive CI test matrix / E2E in CI** — OOS per PROJECT.md; CI runs the existing unit suite + gates only.
- **Preview-deploy comment bots, Vercel cron, edge middleware tuning** — not in DEPLOY-01..03; v2.
- **`@vercel/og` / analytics dashboards customization** — analytics ship with defaults.
- **The actual writing of real bio/photo/email/project content** — these are the USER's personal data; Phase 7 surfaces the checklist but the user supplies the content. (The site deploys functional with placeholders; swapping is the user's pre-/post-launch task.)
- **Milestone completion ceremony** — `/gsd:complete-milestone` runs after Phase 7 verifies (separate command).

</domain>

<decisions>
## Implementation Decisions

### Git & GitHub (DEPLOY-01)

- **D-01:** **Rename `master` → `main` before pushing.** Current branch is `master`; GitHub + Vercel default to `main`, and DEPLOY-01 says "`main` contains production code". `git branch -m master main` (agent, autonomous, before remote setup).
  - Auto-selected: **[auto] D-01 → recommended (rename master→main)**

- **D-02:** **GitHub account/repo target — USER-CONFIRMED checkpoint.** `gh` is authenticated as **`tanguynoumea-collab`**, but `GITHUB_URL` (lib/constants.ts) + the console-art easter egg + footer all reference **`tanguynoumea/portfolio`**. This discrepancy is the user's to resolve — the agent must NOT guess which account owns the public repo.
  - **Recommended default (user confirms at the checkpoint):** create the repo as **`tanguynoumea/portfolio`** (the handle already baked into the app's links) IF the authed `tanguynoumea-collab` account has push access to the `tanguynoumea` namespace; otherwise either (a) re-auth gh as `tanguynoumea`, or (b) create under `tanguynoumea-collab/portfolio` and update `GITHUB_URL` + console art + any repo references to match.
  - Whatever the final repo URL, `GITHUB_URL` in `lib/constants.ts` (and the `lib/ascii.ts` console art + the README) MUST end up consistent with it. **Public** visibility (the console easter egg invites code review per FEATURES.md research).
  - Auto-selected: **[auto] D-02 → recommended (target tanguynoumea/portfolio, public; user confirms account at checkpoint; keep all repo refs consistent)**

- **D-03:** **Keep `.planning/` in the public repo (v1).** 111 `.planning/` files are already tracked across 197 commits. Removing them rewrites history; keeping them is transparent and, for a developer portfolio, demonstrates disciplined planning (on-brand with the "prove technical mastery + attention au détail" core value, and the repo is explicitly advertised for code review). If the user later wants a clean public face, `/gsd:pr-branch` filters `.planning/` commits into a clean branch — noted as a deferred option.
  - Auto-selected: **[auto] D-03 → recommended (keep .planning/ public; /gsd:pr-branch deferred)**

- **D-04:** **Real portfolio README** replacing the create-next-app scaffold default. Sections: one-line pitch (hybrid Tech × Design × BIM portfolio), live URL badge, signature features (bilingual FR/EN, runtime WCAG-aware palette switcher + Konami Vaporwave, GSAP/Lenis/Motion animations, MDX case studies), tech stack (Next 16 / React 19 / Tailwind v4 / next-intl / GSAP / culori), local dev (`npm install && npm run dev`), scripts (test, lint, the check-*.ts gates, lighthouse), and a brief deploy note (Vercel auto-deploy on main). On-brand, bilingual-aware, not a stub.
  - Auto-selected: **[auto] D-04 → recommended (real portfolio README, not scaffold)**

### Vercel Deployment (DEPLOY-02)

- **D-05:** **Deploy to the Vercel-provided `*.vercel.app` URL first.** No domain purchase needed for v1 launch; the production URL is immediately reachable. Custom domain (`tanguy.dev`) is an optional post-launch step the user does in the Vercel dashboard (deferred). After connect, update `SITE_URL` (lib/constants.ts / `NEXT_PUBLIC_SITE_URL`) to the real production origin so metadata/OG/sitemap use absolute URLs that resolve.
  - Auto-selected: **[auto] D-05 → recommended (vercel.app first, custom domain deferred, SITE_URL → real origin post-connect)**

- **D-06:** **Vercel connection is a HUMAN-ACTION checkpoint.** The agent cannot perform Vercel OAuth, the GitHub-integration authorization, or dashboard env-var entry. The plan presents the user with the exact steps: (1) import the GitHub repo at vercel.com/new, (2) accept the auto-detected Next.js framework preset (zero config — Next 16 + Turbopack builds out of the box), (3) set `NEXT_PUBLIC_SITE_URL` env var to the assigned production URL, (4) deploy, (5) confirm the production URL renders `/fr` + `/en` + a project page. No `vercel.json` is needed unless a build override is required (recommend none — zero-config).
  - Auto-selected: **[auto] D-06 → recommended (human-action Vercel checkpoint with exact steps; zero-config, no vercel.json)**

- **D-07:** **Lightweight CI before Vercel (`.github/workflows/ci.yml`).** Runs on push to `main` + PRs: `npm ci`, `npm run lint`, `npm test` (336 tests), `npm run build`, and the `check-i18n-parity` / `check-mdx-structure` / `check-reduced-motion` / `check-images` gates. Node 22. Catches failures in GitHub before Vercel spends a build, and signals repo health to visitors (CI badge in README). Stays within the existing test scope (no new E2E — respects OOS).
  - Auto-selected: **[auto] D-07 → recommended (minimal CI: ci + lint + test + build + gates)**

### Analytics & Web Vitals (DEPLOY-03)

- **D-08:** **`@vercel/analytics` + `@vercel/speed-insights`** installed and mounted in `app/[locale]/layout.tsx`, as the LAST children of `<body>` (after the provider tree + PaletteFab). `import { Analytics } from '@vercel/analytics/react'` (or `/next`) + `import { SpeedInsights } from '@vercel/speed-insights/next'`. Both are no-ops in dev and only beacon in production on Vercel.
  - **No sensitive env leaks:** the only `NEXT_PUBLIC_*` var is `NEXT_PUBLIC_SITE_URL` (a public origin by design). No API keys, no secrets in the client bundle. The plan includes a grep gate confirming no secret-looking `NEXT_PUBLIC_*` values.
  - Auto-selected: **[auto] D-08 → recommended (Analytics + SpeedInsights in layout body; verify no NEXT_PUBLIC_ secret leak)**

### Deployed Lighthouse (A11Y-08 carryover)

- **D-09:** **Measure the deployed homepage Lighthouse mobile post-connect; remediate Performance only if < 90.** Phase 6 recorded local `next start` Performance 69 (A11y 92 / BP 96 / SEO 92 already pass). The deployed Vercel edge environment (CDN + Brotli + HTTP/2) typically lifts a static Next site's Performance well above local. **If deployed Performance is still < 90**, the remediation lever is `next/dynamic` code-splitting of the below-the-fold + animation-heavy sections (GSAP/Lenis/Motion main-thread cost is the documented drag) — a contingent task, only if the measurement requires it. A11Y-08's authoritative ≥90 confirmation lives here.
  - Auto-selected: **[auto] D-09 → recommended (measure deployed; conditional next/dynamic remediation if Perf < 90)**

### Pre-Deploy Content-Swap Checklist

- **D-10:** **Generate a checklist doc** (`.planning/phases/07-deployment/PRE-DEPLOY-CHECKLIST.md` or in the SUMMARY) enumerating every placeholder accumulated across phases that the user should replace for a real launch:
  - Real bio text — `messages/{fr,en}.json` `about.paragraphs.{1,2}`
  - Real "about" photo — `public/about-photo.jpg`
  - Real email + LinkedIn — `lib/constants.ts` `EMAIL` / `LINKEDIN_URL`
  - Real GitHub URL — `lib/constants.ts` `GITHUB_URL` (+ `lib/ascii.ts` console art) once the repo account is fixed (D-02)
  - Real project covers + gallery images — `public/projects/{slug}/cover.jpg` + `[1-4].jpg` (all shared placeholders)
  - Real project MDX bodies — `content/projects/*.mdx` (currently plausible placeholders)
  - CV-EN translation — `public/cv-en.pdf` (currently a copy of the FR PDF)
  - `SITE_URL` / `NEXT_PUBLIC_SITE_URL` — the real production origin (D-05)
  - Real skill lists — `messages/{fr,en}.json` `skills.groups.*.items[]`
  - The site **deploys and works with placeholders** — this checklist is for content quality, not a deploy blocker.
  - Auto-selected: **[auto] D-10 → recommended (generate pre-deploy content-swap checklist)**

### Plan Structure & Wave Topology

- **D-11:** **2 plans:**
  - **`07-00-deploy-prep-PLAN.md`** (Wave 0/1 — fully autonomous, agent-doable): install + wire `@vercel/analytics` + `@vercel/speed-insights`; rewrite README; add `.github/workflows/ci.yml`; rename `master`→`main`; generate the pre-deploy content-swap checklist; verify `npm test` (336) + `npm run lint` + `npm run build` still green + no `NEXT_PUBLIC_*` secret leak. All committed.
  - **`07-01-go-live-PLAN.md`** (Wave 2 — `autonomous: false`, checkpoint-heavy): GitHub repo create + push (gh, with the D-02 account-confirmation checkpoint), then HUMAN-ACTION checkpoints for Vercel connect + env var + deploy, then verify the production URL + run deployed Lighthouse (D-09) + conditional perf remediation. This plan mostly orchestrates checkpoints and verification.
  - **Why 2:** clean split between what the agent fully controls (07-00 code/docs/CI) and what needs the user's accounts (07-01 GitHub push + Vercel). 07-01 depends on 07-00.
  - Auto-selected: **[auto] D-11 → recommended (2 plans: autonomous prep + checkpoint-driven go-live)**

### Claude's Discretion

Deferred to researcher/planner:
- Exact `@vercel/analytics` import path (`/react` vs `/next`) + whether SpeedInsights needs the `/next` variant — researcher confirms against current package versions + Next 16.
- README depth + whether to include a screenshot/GIF (recommend a text-first README; a hero screenshot is a nice-to-have once deployed).
- CI Node version + cache strategy (recommend Node 22 + `actions/setup-node` npm cache).
- Whether to add a CI status badge + Vercel deploy badge to the README (recommend yes, after URLs exist).
- Whether `gh repo create` should be `--public` immediately or `--private` then flip (recommend `--public` per D-02, but the user confirms at the checkpoint).
- Exact deployed-Lighthouse remediation if Perf < 90 (which sections to `next/dynamic` — Hero stays eager/above-fold; About/Projects/Skills/Contact + the parallax cover are candidates).
- Whether to also wire analytics route-awareness for the localized routes (recommend the default `<Analytics />` — it auto-tracks route changes).

### Folded Todos

None — `gsd-tools todo match-phase 7` returned `todo_count: 0`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — Vision, constraints (Vercel hosting + auto-deploy + analytics, GitHub `tanguynoumea/portfolio`, domain to configure), Key Decisions (Vercel native, free tier), §"Déploiement"
- `.planning/REQUIREMENTS.md` §"Deployment" (DEPLOY-01..03) — acceptance criteria
- `.planning/ROADMAP.md` §"Phase 7: Deployment" — goal + 3 success criteria + depends on Phase 6
- `.planning/STATE.md` — Phase 6 complete; 336/336 tests; **Performance 69 local flagged as the #1 Phase-7 watch item**

### Prior phase context
- `.planning/phases/06-seo-accessibility-polish/06-CONTEXT.md` + `06-HUMAN-UAT.md` — A11Y-08 deferred deployed-Lighthouse ≥90 (D-09 here), `SITE_URL` (Phase 6 D-01 — finalize post-connect), metadata/sitemap/robots already shipped (need the real origin to be fully correct)
- `.planning/phases/04-homepage-sections/04-CONTEXT.md` — `lib/constants.ts` (EMAIL/GITHUB_URL/LINKEDIN_URL — pre-deploy swaps, D-10), CV PDF placeholders, about photo placeholder
- `.planning/phases/05-project-content-pipeline/05-CONTEXT.md` — project MDX bodies + covers/gallery are placeholders (D-10 checklist)
- `.planning/phases/01-foundations/01-CONTEXT.md` — git initialized + `.gitignore` (DEPLOY-01 baseline; ARCH-09)

### Research synthesis
- `.planning/research/STACK.md` — `@vercel/analytics` + `@vercel/speed-insights` are the chosen Web-Vitals tools (Phase 7, not earlier); Vercel zero-config Next deploy; sharp auto-bundled (no manual install)
- `.planning/research/FEATURES.md` — "GitHub link invites code review" (drives D-03 public + D-02 repo consistency), CV-PDF-as-CV-complement (CV-EN swap in D-10)

### External docs (downstream researcher fetches via context7)
- **`@vercel/analytics`** — `<Analytics />` import path (`/react` vs `/next`), App Router placement, prod-only beaconing
- **`@vercel/speed-insights`** — `<SpeedInsights />` `/next` import, Web Vitals collection
- **Vercel + Next 16 deploy** — zero-config framework detection, env vars (`NEXT_PUBLIC_*` exposure model), GitHub integration auto-deploy on push
- **GitHub CLI `gh repo create`** — `--public`/`--source`/`--push`/`--remote` flags, pushing existing history to a new repo
- **GitHub Actions** — `actions/checkout`, `actions/setup-node` (Node 22 + npm cache), running npm scripts
- **Lighthouse / PageSpeed** — measuring a deployed URL (mobile), Vercel edge vs local `next start` perf delta

### Existing code (downstream MUST read)
- `app/[locale]/layout.tsx` — provider tree (Analytics + SpeedInsights mount at end of `<body>`; do NOT regress the FOUC script, providers, or metadata)
- `lib/constants.ts` — `SITE_URL` (D-05 finalize) + `GITHUB_URL` (D-02 consistency) + `EMAIL`/`LINKEDIN_URL` (D-10)
- `lib/ascii.ts` — console-art GitHub URL (keep consistent with the final repo, D-02)
- `README.md` — create-next-app scaffold default (D-04 replace)
- `package.json` — scripts (lint/test/build/check-*/lighthouse) the CI workflow runs; add `@vercel/analytics` + `@vercel/speed-insights` runtime deps
- `.gitignore` — already excludes `.next`, `node_modules`, `.env*.local`, `.vercel`, `.lighthouse` (verify `.env*` covers secrets before pushing public)
- `next.config.ts` — confirm no build override needed (Vercel zero-config); MDX + next-intl + images.formats already wired
- `scripts/check-*.ts` — the gates the CI workflow runs (i18n-parity, mdx-structure, reduced-motion, image-audit, stress-test-palettes)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`gh` CLI is authenticated** (as `tanguynoumea-collab`) — the agent CAN `gh repo create` + push (197 commits). The account-vs-`tanguynoumea/portfolio` discrepancy (D-02) is the one thing needing user confirmation.
- **`SITE_URL` env-aware constant** (Phase 6) — already wired into metadataBase/sitemap/OG; just needs the real production origin (D-05).
- **`lib/constants.ts`** centralizes the swappable user data (D-10 checklist targets).
- **`scripts/check-*.ts` gates** — reused verbatim as CI steps (D-07).
- **`.gitignore`** already excludes secrets/build artifacts (DEPLOY-01-safe for public push).
- **Vercel zero-config** — Next 16 + Turbopack builds on Vercel with no `vercel.json`.

### Established Patterns
- **`NEXT_PUBLIC_*` is the only client-exposed env surface** — only `NEXT_PUBLIC_SITE_URL` (public by design). No secrets. D-08 includes a leak-check gate.
- **Server Components default** — Analytics/SpeedInsights are client components mounted in the (server) layout; they're the canonical Vercel pattern.
- **Commit hygiene** — the repo has 197 atomic GSD commits; the push preserves full history (a feature for a code-review-invited repo).
- **`main` branch convention** — rename from `master` (D-01).

### Integration Points
- **`app/[locale]/layout.tsx`** — add `<Analytics />` + `<SpeedInsights />` at the end of `<body>`.
- **`README.md`** — full rewrite (D-04).
- **`.github/workflows/ci.yml`** — NEW (D-07).
- **`lib/constants.ts`** + **`lib/ascii.ts`** — `SITE_URL` + `GITHUB_URL` finalization (D-02, D-05).
- **git** — `master`→`main` rename; `git remote add origin` + push (07-01).
- **Vercel dashboard** — connect + env var + deploy (human-action, 07-01).
- **`PRE-DEPLOY-CHECKLIST.md`** — NEW doc (D-10).

</code_context>

<specifics>
## Specific Ideas

- **Plan sequence (D-11):**
  1. `07-00-deploy-prep-PLAN.md` (autonomous, ~30 min) — install `@vercel/analytics` + `@vercel/speed-insights` + mount in layout; rewrite README (D-04); add `.github/workflows/ci.yml` (D-07); rename `master`→`main`; generate `PRE-DEPLOY-CHECKLIST.md` (D-10); NEXT_PUBLIC leak-check; verify test/lint/build green. Committed.
  2. `07-01-go-live-PLAN.md` (`autonomous: false`, checkpoint-heavy) — (a) **checkpoint: confirm GitHub account/visibility** (D-02), then `gh repo create tanguynoumea/portfolio --public --source=. --remote=origin --push` (or the confirmed variant); (b) **human-action checkpoint: Vercel connect** (import repo, framework preset, set `NEXT_PUBLIC_SITE_URL`, deploy); (c) **verify** production URL renders `/fr` + `/en` + a project page; (d) **deployed Lighthouse mobile** (D-09) — record scores, if Perf < 90 do `next/dynamic` remediation + redeploy; (e) finalize `SITE_URL`/`GITHUB_URL` to real values + commit + push.

- **`--auto` reality check (IMPORTANT):** the auto chain can run discuss + plan + the autonomous 07-00. But **07-01 contains human-action checkpoints (Vercel OAuth, account confirmation) that `--auto` cannot auto-approve** — execution WILL pause for the user there. This is correct and expected; deployment to a personal Vercel/GitHub account is not something an agent should do unattended.

- **GitHub account discrepancy (D-02) is the first checkpoint:** gh authed as `tanguynoumea-collab`, app links say `tanguynoumea/portfolio`. The planner must make 07-01 Task 1 a `decision` checkpoint: "Which account/namespace owns the repo, and is it public?" — then keep `GITHUB_URL` + console art + README consistent with the answer.

- **Analytics placement:**
  ```tsx
  // app/[locale]/layout.tsx — end of <body>, after PaletteFab
  import { Analytics } from '@vercel/analytics/next';
  import { SpeedInsights } from '@vercel/speed-insights/next';
  // ...
  <Analytics />
  <SpeedInsights />
  ```
  (Researcher confirms `/next` vs `/react` import for Next 16.)

- **Deployed perf expectation:** local `next start` Perf 69 is pessimistic (no Brotli/CDN/HTTP-2, dev-machine contention under 4× throttle). Vercel edge commonly adds 15-30 Performance points for a static Next site. Likely ≥90 deployed — but the GSAP+Lenis+Motion main-thread JS is a real risk, so D-09 keeps `next/dynamic` code-splitting as the ready remediation.

- **CI workflow shape:**
  ```yaml
  # .github/workflows/ci.yml
  on: { push: { branches: [main] }, pull_request: {} }
  jobs: { ci: { runs-on: ubuntu-latest, steps: [checkout, setup-node@22 (npm cache), npm ci, npm run lint, npm test, tsx check-* gates, npm run build] } }
  ```

- **Public-repo safety pre-push:** confirm `.gitignore` excludes `.env*.local`; grep the tracked tree for accidental secrets before the first push (there are none expected — no API keys in this project).

- **Milestone close:** after Phase 7 verifies, milestone v1.0 is complete → `/gsd:complete-milestone` is the follow-on (out of this phase's scope).

</specifics>

<deferred>
## Deferred Ideas

- **Custom domain `tanguy.dev`** (purchase + Vercel DNS) — v1 ships on `*.vercel.app`; user adds the domain in the dashboard post-launch.
- **Filtering `.planning/` out of the public repo via `/gsd:pr-branch`** — v1 keeps it public (D-03); available if the user wants a clean face later.
- **CI status + Vercel deploy badges in README** — add once URLs exist (Claude's discretion in 07-00 or a follow-up).
- **Vercel preview-deploy PR comments / GitHub deployment environments** — default Vercel behavior is enough for v1.
- **Web Vitals dashboards / custom event tracking** — analytics ship with defaults; custom events are v2.
- **Real content swaps (bio/photo/email/covers/gallery/MDX/CV-EN/skills)** — surfaced in the D-10 checklist; the user supplies their real data (site deploys functional with placeholders).
- **`next/dynamic` code-splitting of the animation stack** — only if deployed Perf < 90 (D-09 contingent); otherwise a v2 perf-polish candidate.
- **Sitemap submission to Google Search Console / Bing** — post-launch SEO step, v1.x.
- **Error monitoring (Sentry) / uptime checks** — not in DEPLOY-01..03; v2.
- **`robots.txt` disallow of preview deployments** — Vercel handles preview noindex automatically; no action.
- **Milestone v2 planning** (blog, 3D BIM viewer, palette export, contact form backend) — separate milestone after v1 ships.

### Reviewed Todos (not folded)
None — `gsd-tools todo match-phase 7` returned `todo_count: 0`.

</deferred>

---

*Phase: 07-deployment*
*Context gathered: 2026-05-28 (auto mode — Claude picked recommended defaults; user review encouraged before plan-phase). NOTE: this phase requires user action at the Vercel/GitHub checkpoints — it is not fully autonomous.*
