---
phase: 07-deployment
plan: 01
type: execute
wave: 2
depends_on: ["07-00"]
files_modified:
  - lib/constants.ts
  - lib/ascii.ts
  - README.md
autonomous: false
requirements: [DEPLOY-01, DEPLOY-02, DEPLOY-03]
user_setup:
  - service: github
    why: "Create the public repo + push 199 commits of history (DEPLOY-01)"
    dashboard_config:
      - task: "Confirm which account/namespace owns the public repo (gh is authed as tanguynoumea-collab; app links say tanguynoumea/portfolio)"
        location: "GitHub — D-02 decision checkpoint, resolved before gh repo create"
  - service: vercel
    why: "Connect the GitHub repo, set NEXT_PUBLIC_SITE_URL, deploy, enable Analytics + Speed Insights (DEPLOY-02, DEPLOY-03)"
    env_vars:
      - name: NEXT_PUBLIC_SITE_URL
        source: "Vercel Project → Settings → Environment Variables — set to the assigned production origin (e.g. https://tanguy-portfolio.vercel.app)"
    dashboard_config:
      - task: "Import the repo at vercel.com/new, accept the auto-detected Next.js preset (zero config), deploy"
        location: "vercel.com/new"
      - task: "Enable Analytics + Enable Speed Insights (provisions /_vercel/* routes — the code mount is necessary but not sufficient)"
        location: "Vercel Project → Analytics → Enable; Speed Insights → Enable"

must_haves:
  truths:
    - "The public GitHub repo exists at the user-confirmed owner/namespace with main pushed (199-commit history)"
    - "GITHUB_URL in constants.ts + ascii.ts + the README all reference the final repo owner consistently"
    - "Vercel auto-deploys every main push and the production URL is publicly reachable (renders /fr + /en + a project page)"
    - "Vercel Analytics + Speed Insights beacon Web Vitals in production with no sensitive NEXT_PUBLIC_* leak"
    - "Deployed homepage Lighthouse mobile scores >=90 on all 4 axes (Perf remediated via next/dynamic only if <90)"
    - "NEXT_PUBLIC_SITE_URL is finalized to the real production origin so metadata/OG/sitemap resolve"
  artifacts:
    - path: "lib/constants.ts"
      provides: "GITHUB_URL finalized to the confirmed repo owner; SITE_URL backed by the real NEXT_PUBLIC_SITE_URL in Vercel"
    - path: "lib/ascii.ts"
      provides: "Console-art GITHUB_URL consistent with the confirmed repo owner"
    - path: "README.md"
      provides: "Repo clone URL + (optionally) live-URL/CI badges consistent with the confirmed repo + production origin"
  key_links:
    - from: "git (local main)"
      to: "origin (new GitHub repo)"
      via: "gh repo create --source=. --remote=origin --push"
      pattern: "git ls-remote --heads origin main"
    - from: "GitHub main"
      to: "Vercel production deploy"
      via: "Vercel GitHub integration (push = deploy)"
      pattern: "HUMAN-UAT — live *.vercel.app URL"
    - from: "lib/constants.ts + lib/ascii.ts + README.md"
      to: "the confirmed owner/repo"
      via: "consistent GITHUB_URL"
      pattern: "github\\.com/[\\w-]+/[\\w.-]+"
---

<objective>
Take the push-ready repo from 07-00 live: confirm the GitHub account (D-02), push to a new public repo, then hand off to the user for the Vercel connect + env-var + deploy + analytics-enable steps (these cannot be automated — Vercel OAuth is human-only), verify the production URL + beaconing + deployed Lighthouse, and finalize `SITE_URL` / `GITHUB_URL` to the real values.

Purpose: Close DEPLOY-01 (repo exists, main pushed), DEPLOY-02 (Vercel auto-deploy, URL reachable), DEPLOY-03 (analytics live, no leak), and the A11Y-08 carryover (deployed Lighthouse >=90).
Output: a live production URL; the GitHub repo with full history; `lib/constants.ts` / `lib/ascii.ts` / `README.md` consistent with the final repo + origin.

This plan is `autonomous: false` and checkpoint-heavy. The `--auto` chain WILL (correctly) pause at the GitHub account-confirmation decision and at the Vercel human-action steps — deployment to a personal account is not something an agent does unattended.
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
@.planning/phases/07-deployment/07-00-SUMMARY.md

<interfaces>
<!-- Contracts the executor needs. The repo URL is the same owner/repo in all three files today. -->

`lib/constants.ts` (line 15) and `lib/ascii.ts` (line 31) BOTH currently hold:
```ts
const/export GITHUB_URL = 'https://github.com/tanguynoumea/portfolio';
```
`README.md` (after 07-00) references `tanguynoumea/portfolio` in its clone instruction.
The `scripts/check-readme.ts` gate (from 07-00) ENFORCES that these three stay consistent — so if the D-02 checkpoint picks a different owner, ALL THREE must be updated together and the gate re-run.

`lib/constants.ts` SITE_URL:
```ts
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev').replace(/\/$/, '');
```
The production origin is set as `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard (human-action) — NOT hardcoded here. The fallback stays `https://tanguy.dev` (the eventual custom domain).

Verified git/gh state (from 07-RESEARCH): branch = `main` (after 07-00), NO remote configured, 199 commits. `gh` 2.89.0 authed as `tanguynoumea-collab`, scopes include `repo` + `workflow` (so pushing `.github/workflows/ci.yml` is NOT rejected).
</interfaces>
</context>

<tasks>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 1: Confirm GitHub repo owner + visibility (D-02), then create the repo + push</name>
  <files>lib/constants.ts, lib/ascii.ts, README.md (only edited in the option-c branch, to realign GITHUB_URL)</files>
  <decision>Which GitHub account/namespace owns the public portfolio repo, and is it public?</decision>
  <context>
    `gh` is authenticated as **`tanguynoumea-collab`**, but the app's `GITHUB_URL` (`lib/constants.ts`), the console-art easter egg (`lib/ascii.ts`), and the README all reference **`tanguynoumea/portfolio`**. The agent must NOT guess which account owns the public repo (D-02). Whatever you choose, the repo refs in all three files will be made consistent with it. The console easter egg invites code review, so **public** is the recommended default. The repo carries 199 commits of GSD planning history (D-03: kept public in v1 — transparent, on-brand for "prove technical mastery").
  </context>
  <options>
    <option id="option-a">
      <name>tanguynoumea/portfolio, public (recommended) — if tanguynoumea-collab can push to the tanguynoumea namespace</name>
      <pros>No code changes needed — GITHUB_URL/ascii/README already match. The handle baked into the app is the live one.</pros>
      <cons>Requires that the authed `tanguynoumea-collab` account has push access to the `tanguynoumea` org/namespace; if not, `gh repo create` fails fast (no partial state) and you fall back to option-b or option-c.</cons>
    </option>
    <option id="option-b">
      <name>Re-auth gh as tanguynoumea, then create tanguynoumea/portfolio, public</name>
      <pros>Repo owned by the canonical handle; no app code changes needed.</pros>
      <cons>Requires `gh auth login` as `tanguynoumea` (and re-adding the `workflow` scope via `gh auth refresh -s workflow` if it drops, or the workflow push is rejected — Pitfall 4). Interrupts the flow for an interactive auth.</cons>
    </option>
    <option id="option-c">
      <name>tanguynoumea-collab/portfolio, public (use the authed account as-is)</name>
      <pros>Works immediately with the current gh auth — no re-auth.</pros>
      <cons>Requires updating `GITHUB_URL` (lib/constants.ts:15), `lib/ascii.ts` (line 31 GITHUB_URL const), and the README clone URL to `tanguynoumea-collab/portfolio`, then re-running `npm run check:readme` (consistency gate) + committing the correction BEFORE the push.</cons>
    </option>
  </options>
  <action>
    AFTER the user selects an owner/visibility:

    1. **If option-c (owner differs from `tanguynoumea`):** first update the repo refs so 07-00's `check-readme` consistency gate stays green:
       - `lib/constants.ts` line 15 → `export const GITHUB_URL = 'https://github.com/<owner>/portfolio';`
       - `lib/ascii.ts` line 31 → `const GITHUB_URL = 'https://github.com/<owner>/portfolio';`
       - `README.md` clone instruction → `https://github.com/<owner>/portfolio`
       Then `npm run check:readme` (must exit 0) and commit:
       `node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "fix(07-01): align repo URL refs to <owner>/portfolio (D-02)" --files lib/constants.ts lib/ascii.ts README.md`
       (For option-a / option-b the refs already match — skip this sub-step.)

    2. **If option-b:** the user runs `gh auth login` (and `gh auth refresh -s workflow` if needed) — confirm `gh auth status` shows the `workflow` scope before proceeding.

    3. **Create + push** (agent-runnable — gh is authed; this is NOT a human-action step, only the owner decision above was). Use the confirmed `<owner>`:
       ```bash
       gh repo create <owner>/portfolio --public --source=. --remote=origin --push
       ```
       - `--source=.` pushes the existing 199-commit history (no re-init).
       - `--remote=origin` adds the new repo as `origin` (none exists yet).
       - `--push` pushes `main` and sets upstream.
       - Swap `--public` → `--private` only if the user chose private at the checkpoint.
       If `gh repo create` reports the namespace isn't writable, it fails fast — re-run after re-auth (option-b) or switch to option-c.

    4. **Post-push verify** (agent-runnable):
       ```bash
       gh repo view <owner>/portfolio --json url,visibility
       git ls-remote --heads origin main
       ```
       Confirm the repo URL + visibility match the choice, and that `refs/heads/main` exists on the remote.
  </action>
  <verify>
    <automated>gh repo view --json url,visibility</automated>
    <automated>git ls-remote --heads origin main</automated>
    <automated>npm run check:readme</automated>
  </verify>
  <acceptance_criteria>
    - `git remote get-url origin` returns the confirmed `https://github.com/<owner>/portfolio`
    - `git ls-remote --heads origin main` lists `refs/heads/main` (push succeeded)
    - `gh repo view <owner>/portfolio --json url,visibility` shows the chosen visibility
    - `npm run check:readme` exits 0 (GITHUB_URL consistent across constants.ts / ascii.ts / README for the FINAL owner)
  </acceptance_criteria>
  <resume-signal>Select: option-a, option-b, or option-c (and confirm public vs private). After selection, the agent runs the create+push+verify above.</resume-signal>
  <done>The public (or chosen) repo exists at the confirmed owner with `main` (199 commits) pushed; all repo-URL refs are consistent and the readme gate is green. CI will run on the push (gh has the `workflow` scope).</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: Connect Vercel, set NEXT_PUBLIC_SITE_URL, deploy, enable Analytics + Speed Insights</name>
  <files>(none — dashboard-only; no repo files change in this checkpoint)</files>
  <what-built>
    The repo is pushed with a Vercel-ready Next 16 app (zero-config — no `vercel.json`), Analytics + Speed Insights already mounted in the layout (from 07-00), and CI green. Everything the agent can do is done. The remaining steps require YOUR Vercel account — Vercel OAuth, the GitHub-integration authorization, and dashboard env-var/enable toggles cannot be automated (per execute-phase: auth gates cannot be auto-approved).
  </what-built>
  <how-to-verify>
    Perform these steps in the Vercel dashboard, in order:
    1. Go to **https://vercel.com/new** and **import** the GitHub repo you just pushed (`<owner>/portfolio`). Authorize the Vercel GitHub app if prompted.
    2. **Accept the auto-detected Next.js framework preset** — leave build/output settings at their defaults. Next 16 + Turbopack builds with **zero config** (do NOT add a `vercel.json`).
    3. Before (or right after) the first deploy, go to **Project → Settings → Environment Variables** and add:
       - `NEXT_PUBLIC_SITE_URL` = the assigned production origin (e.g. `https://tanguy-portfolio.vercel.app`). This makes `metadataBase` / canonical / hreflang / sitemap / OG resolve to absolute URLs (Pitfall 5 — without it they fall back to the placeholder `https://tanguy.dev`).
    4. **Deploy.** Wait for the build to succeed (it mirrors your local `npm run build`, which 07-00 verified green).
    5. After deploy, go to **Project → Analytics → Enable** AND **Project → Speed Insights → Enable**. This provisions the `/_vercel/insights/*` and `/_vercel/speed-insights/*` routes — the code mount from 07-00 is necessary but NOT sufficient (Pitfall 2: enabling is a separate step).
    6. If you set `NEXT_PUBLIC_SITE_URL` after the first deploy, trigger a **redeploy** so the new env var is baked into the client bundle.

    Note the assigned production URL — you'll paste/confirm it at the next checkpoint. (Custom domain `tanguy.dev` is deferred — v1 ships on `*.vercel.app`, D-05.)
  </how-to-verify>
  <action>
    HUMAN-ACTION — the agent does NOT run any shell command here. Vercel OAuth, the GitHub-integration authorization, the dashboard env-var entry, and the Analytics/Speed-Insights enable toggles cannot be automated (execute-phase: auth gates cannot be auto-approved). Present the `<how-to-verify>` steps to the user, then PAUSE and wait for the resume-signal (the assigned production URL). Do not proceed to Task 3 until the user replies. There is no `vercel.json` and no terminal `vercel deploy` — the import + GitHub integration IS the entire deploy mechanism.
  </action>
  <verify>
    <automated>MISSING — HUMAN-UAT: Vercel connect/deploy is gated on the user's account; verified by the user reporting a reachable production URL at the resume-signal (no headless tool can reach or provision it).</automated>
  </verify>
  <resume-signal>Reply with the assigned production URL (e.g. `https://tanguy-portfolio.vercel.app`) once the deploy succeeded and Analytics + Speed Insights are enabled.</resume-signal>
  <done>The repo is imported into Vercel, the Next.js preset accepted (zero-config), `NEXT_PUBLIC_SITE_URL` set to the production origin, the first deploy succeeded, and Analytics + Speed Insights are both enabled. The user has reported the assigned production URL.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: HUMAN-UAT — verify production URL, auto-deploy, beaconing, and deployed Lighthouse (D-09)</name>
  <files>(none — manual verification; any next/dynamic remediation files are touched only in the contingent follow-up below)</files>
  <what-built>
    The site is deployed at the production URL from Task 2, with Analytics + Speed Insights enabled. These final checks are intrinsically HUMAN-UAT: the live URL is gated on your Vercel account, the analytics components are no-ops anywhere except Vercel production, and the authoritative Lighthouse score requires the live edge URL (the local Perf-69 from Phase 6 is not authoritative — D-09).
  </what-built>
  <how-to-verify>
    On the deployed production URL:
    1. **DEPLOY-02 — URL reachable + routes render:** open the production URL. Confirm the homepage renders, then visit `/en` (and `/fr`) and one project page (`/en/projects/<slug>`). All three must render correctly.
    2. **DEPLOY-02 — auto-deploy on push:** make a trivial commit on `main` locally and `git push`. Confirm Vercel automatically starts a new production deploy (visible in the Vercel dashboard Deployments tab) and it goes live. (The push IS the deploy trigger — no terminal `vercel deploy` needed.)
    3. **DEPLOY-03 — real Web-Vitals beaconing:** open the live site with browser DevTools → Network. Navigate between routes. Confirm a request to `/_vercel/insights/view` (Analytics) and `/_vercel/speed-insights/vitals` (Speed Insights) fires. After a little traffic, confirm data starts appearing in the Vercel dashboard (Analytics + Speed Insights tabs).
    4. **A11Y-08 (carryover, D-09) — deployed Lighthouse mobile >=90:** measure the DEPLOYED homepage, mobile, all 4 axes. Use either:
       - PageSpeed Insights (https://pagespeed.web.dev) on the production URL, mobile, OR
       - `npm run lighthouse:mobile` retargeted at the production URL (edit the script's URL or run lighthouse directly against the live origin).
       Record Performance / Accessibility / Best Practices / SEO. **Target: all four >=90.** Edge CDN + Brotli + HTTP/2 typically lift Performance 15-30 points over the local 69 — likely >=90 deployed.

    **IF deployed Performance < 90 (and only then) — D-09 remediation:** report it. The agent will then `next/dynamic` code-split the below-fold, animation-heavy client sections to defer their JS:
      - Safe to lazy-load (default `dynamic()`, `ssr: true` — keeps SSR HTML for SEO/LCP): `About`, `Skills`, `Contact`, `ProjectsSection`.
      - `ssr: false` ONLY for the leaf parallax island `ProjectCover` (purely decorative — missing SSR HTML costs nothing; and `ssr:false` is only valid inside Client Components in Next 16).
      - **NEVER** lazy-load `Hero` (above-fold, owns LCP) or any layout chrome (Navigation/Footer/providers).
      After remediation: `npm run build` green, commit, push (triggers redeploy), re-measure. This is contingent — skip entirely if Perf >=90.
  </how-to-verify>
  <action>
    HUMAN-UAT — present the `<how-to-verify>` steps and PAUSE for the user's report. The agent runs no shell command for the live verification itself (the production URL, beaconing, and edge Lighthouse are reachable only by the user on their deployed Vercel origin). ONLY if the user reports deployed Performance < 90 does the agent then act: apply the contingent `next/dynamic` remediation described above (default `dynamic()`/`ssr:true` for About/Skills/Contact/ProjectsSection; `ssr:false` only for the ProjectCover island; NEVER Hero/chrome), then `npm run build`, commit, and `git push` to trigger a redeploy for re-measurement. If Perf >=90, skip remediation entirely and proceed to Task 4.
  </action>
  <verify>
    <automated>MISSING — HUMAN-UAT: requires the live Vercel edge URL (local Perf-69 is not authoritative). Verified by the user reporting 4 Lighthouse scores + routes/auto-deploy/beaconing confirmation. If a next/dynamic remediation is applied, `npm run build` must exit 0 before the redeploy push.</automated>
  </verify>
  <resume-signal>Reply with the 4 Lighthouse scores (Perf/A11y/BP/SEO) and confirm: routes render, auto-deploy works, and beaconing fires. If Perf < 90, say so to trigger the next/dynamic remediation; otherwise type "approved".</resume-signal>
  <done>The production URL renders /fr + /en + a project page; auto-deploy on `main` push is confirmed; `/_vercel/insights/*` + `/_vercel/speed-insights/*` beacon on the live origin; deployed Lighthouse mobile is >=90 on all 4 axes (after the contingent next/dynamic remediation if Perf was <90).</done>
</task>

<task type="auto">
  <name>Task 4: Finalize SITE_URL/GITHUB_URL to real values, update README live URL, commit + push</name>
  <read_first>
    - lib/constants.ts (SITE_URL fallback + GITHUB_URL — confirm the final values to lock in)
    - lib/ascii.ts (GITHUB_URL console-art const — keep consistent)
    - README.md (live-URL placeholder line from 07-00 → replace with the real production URL; optionally add CI + Vercel badges now that URLs exist)
    - scripts/check-readme.ts (the consistency gate that must stay green)
    - 07-CONTEXT.md D-05 (SITE_URL → real origin) + Discretion (badges after URLs exist)
  </read_first>
  <files>lib/constants.ts, lib/ascii.ts, README.md</files>
  <action>
    Now that the real production URL + final repo owner are known:

    1. **README live URL (+ optional badges):** replace the 07-00 placeholder live-URL line with the real production URL (e.g. `Live: https://tanguy-portfolio.vercel.app`). Optionally add a CI status badge (`https://github.com/<owner>/portfolio/actions/workflows/ci.yml/badge.svg`) and/or a Vercel deploy badge now that the URLs exist (Claude's discretion — recommended yes). Keep the `<owner>/portfolio` clone URL consistent with the final repo.

    2. **GITHUB_URL:** if the D-02 decision changed the owner (option-c) it was already updated in Task 1 — just confirm `lib/constants.ts` + `lib/ascii.ts` + README all still reference the SAME final `<owner>/portfolio`.

    3. **SITE_URL:** the production origin lives in `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard (set in Task 2) — the runtime value resolves from env there. The `lib/constants.ts` fallback stays `https://tanguy.dev` (the eventual custom domain, D-05). DO NOT hardcode the `*.vercel.app` origin into the fallback — env is the source of truth and a future custom domain shouldn't require a code change. (If the user explicitly wants the vercel.app origin as the committed fallback instead, set it — but the env var is preferred.)

    4. **Verify + commit + push:**
       ```bash
       npm run check:readme && npm run build
       ```
       Both exit 0. Then commit only the touched files and push (the push triggers a Vercel redeploy that re-checks OG/sitemap against the now-correct origin — Pitfall 5):
       ```bash
       node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(07-01): finalize live URL + repo refs post-deploy (DEPLOY-01, DEPLOY-02)" --files README.md lib/constants.ts lib/ascii.ts
       git push
       ```
  </action>
  <verify>
    <automated>npm run check:readme</automated>
    <automated>npm run build</automated>
    <automated>git ls-remote --heads origin main</automated>
  </verify>
  <acceptance_criteria>
    - `lib/constants.ts` `GITHUB_URL` + `lib/ascii.ts` `GITHUB_URL` + `README.md` all reference the SAME final `<owner>/portfolio`
    - `README.md` contains the real production URL (no longer the bare `https://tanguy.dev` placeholder line for "Live:")
    - `npm run check:readme` exits 0
    - `npm run build` exits 0
    - The commit is pushed to `origin/main` (`git status` shows up to date; the Vercel redeploy is triggered by the push)
  </acceptance_criteria>
  <done>Repo refs + README live URL are finalized and consistent; SITE_URL resolves from the real `NEXT_PUBLIC_SITE_URL` in Vercel; the final commit is pushed (triggering a redeploy with correct absolute URLs). Milestone v1.0 is live — `/gsd:complete-milestone` is the follow-on (out of this phase's scope).</done>
</task>

</tasks>

<verification>
Phase go-live checks:
- **Agent-automatable (post-push, gh only):** `gh repo view` + `git ls-remote --heads origin main` confirm the repo exists and `main` is pushed; `npm run check:readme` + `npm run build` green; repo-URL consistency across constants/ascii/README.
- **Intrinsically HUMAN-UAT (Task 2 + Task 3 checkpoints — NOT asserted programmatically):**
  1. DEPLOY-02 — production URL reachable, renders /fr + /en + a project page, auto-deploys on `main` push (gated on the user's Vercel OAuth).
  2. DEPLOY-03 — real beaconing (`/_vercel/insights/*` + `/_vercel/speed-insights/*`) fires on the live origin; data in the Vercel dashboard (no-op off Vercel prod).
  3. A11Y-08 / D-09 — deployed Lighthouse mobile >=90 on all 4 axes (local Perf-69 is not authoritative); contingent `next/dynamic` remediation if Perf < 90.
</verification>

<success_criteria>
- DEPLOY-01: the repo exists at the user-confirmed owner with `main` (199 commits) pushed; README + repo refs consistent.
- DEPLOY-02: Vercel connected via the GitHub integration, auto-deploys on `main` push, production URL publicly reachable (HUMAN-UAT verified).
- DEPLOY-03: Analytics + Speed Insights enabled + beaconing in production with no NEXT_PUBLIC_* secret leak (HUMAN-UAT verified for live beaconing; leak gate green from 07-00).
- A11Y-08 carryover: deployed Lighthouse mobile >=90 on all 4 axes (remediated via next/dynamic only if Perf < 90).
- SITE_URL / GITHUB_URL finalized to real values; final commit pushed.
</success_criteria>

<output>
After completion, create `.planning/phases/07-deployment/07-01-SUMMARY.md`.
</output>
