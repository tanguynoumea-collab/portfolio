# Plan 07-01 (go-live) — Summary

**Status:** Complete
**Date:** 2026-05-28
**Requirements:** DEPLOY-01, DEPLOY-02, DEPLOY-03 (+ A11Y-08 carryover — accepted trade-off)

## What shipped

- **GitHub repo (DEPLOY-01):** public repo created at **https://github.com/tanguynoumea-collab/portfolio**, `main` pushed with full history. (D-02 decision: owner = `tanguynoumea-collab` — the `tanguynoumea` namespace 404'd; all repo-URL refs in `lib/constants.ts`, `lib/ascii.ts`, `README.md`, and `Footer.tsx` realigned accordingly.)
- **Vercel deploy (DEPLOY-02):** user connected the repo to Vercel (zero-config Next 16), production URL live + publicly reachable at **https://detportfolio.vercel.app**, auto-deploys on every `main` push (demonstrated across 4 hotfix pushes).
- **Analytics (DEPLOY-03):** `@vercel/analytics` + `@vercel/speed-insights` mounted (07-00) and enabled in the Vercel dashboard by the user. No `NEXT_PUBLIC_*` secret leak (gate green).

## Post-deploy hotfixes (found + fixed live, browser-verified)

1. **`fbc88a1`** — `SITE_URL` set to the real production origin (`detportfolio.vercel.app`) in `lib/constants.ts` so OG/canonical/sitemap resolve (the user could not set the Vercel env var; hardcoded fallback instead, env var still overrides for a future custom domain).
2. **`8522274`** — `localePrefix: 'as-needed'` → `'always'`. The bare root `/` was serving the FR home via a rewrite that dropped the `<html lang>`/`<title>`/`<main>` wrapper on Vercel (broken FR homepage; tanked A11y 69 / SEO 73). `'always'` makes `/` cleanly 307→`/fr`, which serves the full localized layout. Metadata/sitemap auto-adjust via `getPathname` (now `/fr`, `/en`).
3. **`3e51aec`** — **Blank page / "This page couldn't load" on navigation.** Root cause (found via live browser DOM inspection): `app/template.tsx` sat at the ROOT level, above `<html>`+providers. A template re-mounts on every navigation AND remounts everything below it — so each navigation rebuilt the ENTIRE app (providers, nav, footer, html), collapsing the React tree to empty divs. Fixed by relocating the transition to `app/[locale]/template.tsx` (re-mounts only the page content; providers/chrome persist). Verified: home → project → back all render fully, no blank.
4. **`361bac5`** — Project pages rendered their raw YAML frontmatter as body text (`slug:`/`title:`/`category:`…). Added `remark-frontmatter` to `next.config.ts` to strip the `---…---` block from the rendered MDX (gray-matter still parses it for metadata). Verified gone on the deployed pages.

## Deployed Lighthouse (mobile, PageSpeed Insights — A11Y-08)

| Axis | Score | ≥90? |
|------|-------|------|
| Performance | **68** | ✗ (accepted trade-off) |
| Accessibility | **92** | ✓ |
| Best Practices | **100** | ✓ |
| SEO | **100** | ✓ |

Metrics: FCP 0.2s, LCP 0.7s, Speed Index 1.1s (all excellent) · TBT 1080ms (high — GSAP+Lenis+Motion main-thread JS) · CLS 0.101 (marginally above 0.1).

**A11Y-08 decision (user-accepted):** the requirement asks ≥90 on all four axes. 3/4 pass comfortably. **Performance 68 is an accepted product trade-off** for the animation-rich creative portfolio (the animations are the core value; FCP/LCP/SI are excellent, only TBT from the animation stack drags it). The user explicitly chose to ship at this score. Documented for a potential v2 optimization (lazy-init animations / reduce Motion bundle / defer Lenis).

## Known minor follow-ups (v2 / pre-share polish — non-blocking)

- Accessibility 92 flags: "ARIA attributes in prohibited roles" + one "insufficient color contrast" element (palette ThemeProvider guarantees AA for the 6 core tokens; investigate the specific flagged element — likely a badge). CLS 0.101 — minor layout shift (font swap / image).
- **Content placeholders** (see `PRE-DEPLOY-CHECKLIST.md`): real bio, photo, email/LinkedIn (in `lib/constants.ts` AND `Footer.tsx`), project covers + gallery images, real project MDX bodies, CV-EN translation.

## Verification
- `npm test` 336/336 green · `npm run lint` clean · `npm run build` exit 0
- Browser-verified on the deployed site: client navigation (home↔project, back button) renders fully; frontmatter stripped; routes `/`→307→`/fr`, `/fr` + `/en` + project pages all 200 with full `<html lang>`.

*Plan 07-01 complete — milestone v1.0 is live.*
