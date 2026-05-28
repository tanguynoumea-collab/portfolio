# Phase 7: Deployment - Discussion Log (Auto Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 07-deployment
**Mode:** `--auto` (Claude picked recommended defaults — no user interaction)
**Areas analyzed:** Git/GitHub, Vercel deploy, Analytics, deployed Lighthouse, content checklist, plan structure
**KEY CAVEAT:** This phase is NOT fully autonomous — Vercel OAuth + account actions are human-action checkpoints `--auto` cannot auto-approve.

---

## Git & GitHub (DEPLOY-01)

### D-01 — branch name
| Option | Selected |
|--------|----------|
| Rename `master` → `main` (GitHub/Vercel convention) | ✓ |
| Keep `master` | |

### D-02 — GitHub account/repo target
| Option | Description | Selected |
|--------|-------------|----------|
| `tanguynoumea/portfolio` public (handle already in app links) | Matches GITHUB_URL + console art + footer | ✓ (user confirms at checkpoint) |
| `tanguynoumea-collab/portfolio` (the authed account) | gh is authed as collab — would need GITHUB_URL/console-art updates | (fallback) |
| Re-auth gh as tanguynoumea | User's call | (option) |

**Scout finding:** `gh` authenticated as **`tanguynoumea-collab`** ≠ the `tanguynoumea/portfolio` baked into the app. This is a genuine user decision → made a **checkpoint** in 07-01, not auto-guessed. Whatever wins, GITHUB_URL + ascii art + README stay consistent. Public (console easter egg invites code review).

### D-03 — .planning/ in public repo
| Option | Description | Selected |
|--------|-------------|----------|
| Keep .planning/ public | Transparent, on-brand (disciplined planning), reversible, already committed (111 files / 197 commits) | ✓ |
| Filter via /gsd:pr-branch | Clean repo face | (deferred) |

### D-04 — README
| Option | Selected |
|--------|----------|
| Real portfolio README (pitch, features, stack, dev, deploy) | ✓ |
| Keep create-next-app scaffold | |

---

## Vercel Deployment (DEPLOY-02)

### D-05 — deploy target / domain
| Option | Description | Selected |
|--------|-------------|----------|
| `*.vercel.app` URL first; custom domain deferred | Immediate, free, no DNS blocker | ✓ |
| Buy + configure tanguy.dev now | Adds purchase + DNS to the critical path | (deferred) |

### D-06 — Vercel connection
| Option | Description | Selected |
|--------|-------------|----------|
| Human-action checkpoint with exact steps; zero-config (no vercel.json) | Vercel OAuth/dashboard can't be agent-automated | ✓ |
| Vercel CLI token automation | Requires a token the user must provision anyway | |

### D-07 — CI
| Option | Description | Selected |
|--------|-------------|----------|
| Lightweight GitHub Actions (ci+lint+test+build+gates) | Catches failures before Vercel; repo-health signal; stays in unit-test scope | ✓ |
| No CI (rely on Vercel build) | Misses pre-Vercel gating | |
| Full E2E CI matrix | OOS per PROJECT.md | |

---

## Analytics (DEPLOY-03)

### D-08
| Option | Selected |
|--------|----------|
| `@vercel/analytics` + `@vercel/speed-insights` in layout `<body>` end + NEXT_PUBLIC leak-check | ✓ |
| Analytics only (skip Speed Insights) | (REQ wants both) |
| Third-party (Plausible/GA) | Vercel-native chosen per STACK.md |

**No secret leak:** only `NEXT_PUBLIC_SITE_URL` (public origin). D-08 adds a grep gate.

---

## Deployed Lighthouse (A11Y-08 carryover)

### D-09
| Option | Description | Selected |
|--------|-------------|----------|
| Measure deployed; remediate Perf only if <90 (next/dynamic) | Vercel edge typically lifts Perf 15-30 pts vs local 69; remediation ready if needed | ✓ |
| Code-split now regardless | Premature; may be unnecessary post-deploy | |
| Ignore (leave at local 69) | Fails A11Y-08 authoritative measure | |

---

## Content Checklist & Plan Structure

### D-10 — pre-deploy content-swap checklist
Selected: generate `PRE-DEPLOY-CHECKLIST.md` enumerating all placeholders (bio, photo, email, LinkedIn, GitHub URL, project covers/gallery, MDX bodies, CV-EN, SITE_URL, skills). Site deploys functional with placeholders — checklist is for content quality, not a deploy blocker.

### D-11 — plan structure
| Option | Description | Selected |
|--------|-------------|----------|
| 2 plans: 07-00 (autonomous prep) + 07-01 (checkpoint-driven go-live) | Clean split agent-controlled vs user-account actions | ✓ |
| 1 plan | Mixes autonomous + human-action awkwardly | |
| 3+ plans | Over-split for 3 REQs | |

---

## Claude's Discretion
Analytics import path (/next vs /react), README depth + badges/screenshot, CI Node version + cache, gh --public timing, exact next/dynamic remediation targets if Perf<90, analytics route-awareness.

## Deferred Ideas
11 deferred items in CONTEXT.md `<deferred>` — custom domain, /gsd:pr-branch clean repo, README badges, preview-deploy bots, Web Vitals dashboards, real content swaps, next/dynamic perf split (contingent), Search Console submission, Sentry/uptime, v2 milestone planning.

## Critical Caveat (repeated)
The `--auto` chain runs discuss + plan + the autonomous **07-00**. **07-01 has human-action checkpoints (Vercel OAuth, GitHub account confirmation) that pause for the user** — deploying to personal Vercel/GitHub accounts is correctly not done unattended.
