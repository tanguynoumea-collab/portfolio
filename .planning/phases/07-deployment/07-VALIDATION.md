---
phase: 7
slug: deployment
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-28
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `07-RESEARCH.md` §"Validation Architecture". Deployment is checkpoint-heavy — this map is honest about what is headless-automatable vs intrinsically HUMAN-UAT.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 + jsdom 29 + RTL 16 + vitest-axe 1.0.0-pre.5 (existing) |
| **Config file** | `vitest.config.ts` (+ `vitest-setup.ts`) |
| **Quick run command** | `npm test` (~336 tests, seconds) |
| **Full suite / pre-push** | `npm test && npm run test:palettes && npm run test:stress && npx tsx scripts/check-i18n-parity.ts && npx tsx scripts/check-mdx-structure.ts && npm run check:reduced-motion && npm run check:images && npm run build` |
| **New Wave-0 gates** | `scripts/check-analytics.ts`, `scripts/check-env-leak.ts`, `scripts/check-readme.ts` (tiny `tsx` gates, exit 1 on failure) |
| **New deps** | `@vercel/analytics@^2.0.1` + `@vercel/speed-insights@^2.0.0` (runtime; STACK.md's ^1.x is stale — both now v2) |

---

## Sampling Rate

- **Per task commit (07-00):** `npm test` (quick — full suite runs in seconds)
- **Per wave / pre-push:** the full-suite command above (tests + all gates + build) — exactly what CI re-runs, so green locally ⇒ green in CI
- **Phase gate:** full suite + 4 new Wave-0 gates green + `npm run build` exit 0 before `/gsd:verify-work`; then the HUMAN-UAT checkpoints in 07-01
- **Max feedback latency:** 30s (the deploy + beaconing + deployed-Lighthouse checks are HUMAN-UAT, off the automated path)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-00-* | 00 | 0 | DEPLOY-01 | smoke | `git rev-parse --abbrev-ref HEAD` → `main` | ✅ git | ⬜ |
| 07-00-* | 00 | 0 | DEPLOY-01 | content | `npx tsx scripts/check-readme.ts` (no `bootstrapped with`/`create-next-app`; has Tanguy + Next.js 16 + stack markers; repo-URL consistency across constants.ts/ascii.ts/README) | ❌ W0 | ⬜ |
| 07-00-* | 00 | 0 | DEPLOY-03 | static | `npx tsx scripts/check-analytics.ts` (layout imports `@vercel/analytics/next` + `@vercel/speed-insights/next` AND renders `<Analytics />` + `<SpeedInsights />`) | ❌ W0 | ⬜ |
| 07-00-* | 00 | 0 | DEPLOY-03 | grep gate | `npx tsx scripts/check-env-leak.ts` (no `NEXT_PUBLIC_*` other than SITE_URL with a non-URL/secret-looking value) | ❌ W0 | ⬜ |
| 07-00-* | 00 | 0 | DEPLOY-03 | smoke | `package.json` has `@vercel/analytics` `^2` + `@vercel/speed-insights` `^2` | ❌ W0 | ⬜ |
| 07-00-* | 00 | 0 | DEPLOY-01/02 | CI/build | `.github/workflows/ci.yml` runs lint+test+gates+build; `npm run build` exit 0 locally | ❌ W0 | ⬜ |
| 07-01-* | 01 | 2 | DEPLOY-01 | smoke (post-push) | `gh repo view <owner>/portfolio --json url,visibility` + `git ls-remote --heads origin main` | ✅ gh | ⬜ |
| 07-01-* | 01 | 2 | DEPLOY-02 | **HUMAN-UAT** | open assigned `*.vercel.app` URL → `/fr` + `/en` + a project page render; push trivial commit → Vercel rebuilds | N/A manual | ⬜ |
| 07-01-* | 01 | 2 | DEPLOY-03 | **HUMAN-UAT** | deployed Network tab shows `/_vercel/insights/view` + `/_vercel/speed-insights/vitals`; data appears in Vercel dashboard | N/A manual | ⬜ |
| 07-01-* | 01 | 2 | A11Y-08 (carryover) | **HUMAN-UAT** | `lighthouse:mobile` or PageSpeed against the DEPLOYED URL → ≥90 all 4 axes; if Perf<90, `next/dynamic` remediation (D-09) | N/A manual | ⬜ |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Honest Automatable vs HUMAN-UAT Split

**Automatable (07-00, headless & deterministic):** branch rename, README real-content + repo-URL consistency, analytics-mount assertion, `NEXT_PUBLIC_` leak gate, dep-version smoke, CI workflow, `npm run build` as the deploy proxy, full existing suite green.

**Post-push automatable (07-01, gh only — no human OAuth for the check):** `gh repo view` + `git ls-remote` confirm the repo exists and `main` is pushed.

**Intrinsically HUMAN-UAT (cannot be headless-verified):**
1. **DEPLOY-02 live URL + auto-deploy** — gated on the user's Vercel OAuth/account; no agent tool can reach or provision it.
2. **DEPLOY-03 real beaconing** — the components are no-ops outside Vercel production.
3. **A11Y-08 deployed Lighthouse ≥90** — requires the live Vercel URL; local Perf-69 is not authoritative.

The plan marks these as HUMAN-UAT checkpoints in 07-01 with exact manual steps — NOT asserted programmatically.

---

## Wave 0 Requirements

- [ ] `scripts/check-analytics.ts` — asserts the two `/next` imports + both components mounted (DEPLOY-03 automatable half)
- [ ] `scripts/check-env-leak.ts` — `NEXT_PUBLIC_*` secret-leak grep gate (D-08)
- [ ] `scripts/check-readme.ts` — README real (no scaffold boilerplate) + portfolio markers + repo-URL consistency (DEPLOY-01)
- [ ] (Optional) `package.json` aliases `check:analytics` / `check:env-leak` / `check:readme` so CI + local stay uniform
- [ ] Confirm `package-lock.json` committed (✅ already tracked — CI `npm ci` works)

*Framework install: none — Vitest + tsx already present.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel connect + env var + first deploy | DEPLOY-02 | Vercel OAuth/dashboard — human-action, no agent tool | Import repo at vercel.com/new → accept Next.js preset → set `NEXT_PUBLIC_SITE_URL` → deploy |
| Production URL renders + auto-deploy on push | DEPLOY-02 | Needs the live deploy | Open `*.vercel.app`; confirm `/fr`+`/en`+project page; push a commit → confirm rebuild |
| Real Web-Vitals beaconing | DEPLOY-03 | Components no-op off Vercel prod | Network tab on live site → `/_vercel/insights/*` + `/_vercel/speed-insights/*` fire; dashboard shows data |
| Deployed Lighthouse mobile ≥90 (all 4) | A11Y-08 / D-09 | Requires live Vercel edge URL | `lighthouse:mobile` or PageSpeed on the deployed URL; if Perf<90 → `next/dynamic` below-fold (NOT Hero) + redeploy |
| GitHub account/visibility for the repo | DEPLOY-01 / D-02 | gh authed as `tanguynoumea-collab` ≠ `tanguynoumea/portfolio` in app links — user's call | Confirm owner + public before `gh repo create`; keep GITHUB_URL/ascii/README consistent |

---

## Validation Sign-Off

- [ ] All 07-00 tasks have `<automated>` verify (the 3 new gates + build + suite)
- [ ] HUMAN-UAT items (DEPLOY-02, DEPLOY-03 beaconing, deployed Lighthouse) marked as checkpoints in 07-01 with exact steps
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s on the automated path
- [ ] `nyquist_compliant: true` set

**Approval:** approved 2026-05-28
