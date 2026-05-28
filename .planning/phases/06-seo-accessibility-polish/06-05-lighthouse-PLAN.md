---
phase: 06-seo-accessibility-polish
plan: 05
type: execute
wave: 2
depends_on: ["06-00", "06-01", "06-02"]
files_modified:
  - package.json
autonomous: false
requirements: [A11Y-08]
must_haves:
  truths:
    - "A production build succeeds (npm run build) with the Phase 6 metadata/OG/route-state additions"
    - "The lighthouse:mobile npm script runs against the local production server and produces a report"
    - "The four Lighthouse mobile scores (Performance, Accessibility, Best Practices, SEO) for the homepage are recorded"
    - "Any score < 90 is investigated and fixed where deterministic (image sizing, font preload, metadata) — flaky 88-89 is documented, not blocking"
  artifacts:
    - path: "package.json"
      provides: "lighthouse:mobile script (added in 06-00) confirmed runnable"
      contains: "lighthouse:mobile"
  key_links:
    - from: "npm run lighthouse:mobile"
      to: "local production server (npm run start)"
      via: "http://localhost:3000/en"
      pattern: "lighthouse"
---

<objective>
Deliver A11Y-08 (the local Lighthouse pre-deploy gate). Build the production bundle, serve it locally, run Lighthouse mobile on the homepage, record the four scores (Performance / Accessibility / Best Practices / SEO), and fix any deterministic sub-90 regression. Lighthouse is environment-sensitive (Pitfall 5) — the AUTHORITATIVE ≥90 confirmation happens on the deployed Vercel URL in Phase 7; this phase records scores as evidence and treats ≥90 as a target, not a hard blocker on a flaky local 88-89.

Purpose: Catch performance/SEO regressions before deploy. Automated proxies (axe a11y green from 06-04, metadata/sitemap tests green from 06-01, successful build) cover what's deterministic; Lighthouse adds the real-server perf/SEO numbers.
Output: confirmed lighthouse:mobile script (from 06-00) + the four recorded scores in the SUMMARY (HUMAN-UAT).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-seo-accessibility-polish/06-RESEARCH.md

<interfaces>
<!-- Verified — no exploration needed. -->

package.json (after 06-00) has:
  "lighthouse:mobile": "lighthouse http://localhost:3000/en --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./.lighthouse/mobile.html --chrome-flags=\"--headless\""
  "build": "next build", "start": "next start"
`.lighthouse/` is gitignored (06-00). `lighthouse@^13` is a dev dep (06-00).

Lighthouse needs Chrome/Chromium. If absent, the `lighthouse` npm package auto-fetches a Chromium; if that also fails, A11Y-08's authoritative pass is deferred to Phase 7 (Vercel) — record "local run unavailable, deferred to Phase 7" rather than blocking.

A11Y-08 specifies MOBILE. Lighthouse defaults to mobile; `--form-factor=mobile` is explicit. Do NOT use `--preset=desktop` for the authoritative number.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Production build + run Lighthouse mobile + record the four scores</name>
  <files>package.json, .lighthouse/mobile.html</files>
  <read_first>
    - 06-RESEARCH.md §14 (Lighthouse npm script + process: build && start, then lighthouse:mobile), Pitfall 5 (flakiness — record, don't block on transient 89)
    - package.json lighthouse:mobile + build + start scripts (see interfaces)
  </read_first>
  <action>
    Build the production bundle (confirms the Phase 6 metadata + 2 OG routes + route-state files compile for production and the OG images prerender):

    ```bash
    npm run build
    ```
    Confirm the build output lists the `opengraph-image` routes (home + the 12 project routes) and the new sitemap/robots routes. If the build fails, that is a blocker — fix before proceeding (likely an OG/metadata issue from 06-01).

    Start the production server in the background, then run Lighthouse mobile against the homepage:

    ```bash
    npm run start &
    # wait for the server to accept connections on :3000, then:
    npm run lighthouse:mobile
    ```
    (On Windows PowerShell, start `npm run start` in a separate process/terminal, confirm `http://localhost:3000/en` responds, then run `npm run lighthouse:mobile` in the main shell. Use `http://localhost:3000/en` — the EN route is explicit; the FR canonical `/` rewrites internally.)

    Read the four mobile scores from `./.lighthouse/mobile.html` (or the Lighthouse stdout summary): Performance, Accessibility, Best Practices, SEO. RECORD all four verbatim in the 06-05-SUMMARY.md as the A11Y-08 evidence.

    For ANY score < 90, investigate the Lighthouse audit details and fix the deterministic causes (per 06-RESEARCH §14 likely culprits): image sizing (covered by A11Y-06 — confirm next/image dims), font preload (Inter is `preload:true` already), metadata completeness (covered by A11Y-01), render-blocking resources. Apply fixes, rebuild, re-run, re-record. Do NOT block the phase on a flaky 88-89 that swings between runs (Pitfall 5) — re-run from a clean state (close background apps, fresh `npm run start`); if it persists at 88-89 transiently, document it and note the authoritative ≥90 confirmation is Phase 7 (deployed Vercel URL, per A11Y-08 wording "déployée Vercel").

    Stop the background server when done.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits 0 and the output includes `opengraph-image`, `sitemap`, and `robots` routes
    - `npm run lighthouse:mobile` produces `./.lighthouse/mobile.html` (or a deferred-to-Phase-7 note if Chrome is unavailable)
    - The four mobile scores (Performance / Accessibility / Best Practices / SEO) are recorded in 06-05-SUMMARY.md
    - Any deterministic sub-90 is fixed (rebuild + re-record); transient flaky 88-89 is documented with the Phase 7 deferral note
  </acceptance_criteria>
  <done>Production build green; Lighthouse mobile run recorded (4 scores); deterministic regressions fixed; flaky cases documented.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Checkpoint: Review Lighthouse scores + manual a11y/visual pass</name>
  <action>Pause for the user to review the recorded Lighthouse scores and complete the manual a11y/visual verifications (keyboard Tab cycle, PaletteSwitcher focus trap + Esc, random-palette layout, 404 motion, OG render) — items jsdom cannot verify. Details in the what-built / how-to-verify / resume-signal elements below.</action>
  <what-built>
    The local Lighthouse mobile gate for A11Y-08: a production build of the portfolio served locally, with the four mobile Lighthouse scores (Performance, Accessibility, Best Practices, SEO) recorded for the homepage. Plus the Phase-6 manual a11y items that jsdom cannot verify.
  </what-built>
  <how-to-verify>
    1. The four recorded Lighthouse mobile scores are in 06-05-SUMMARY.md. Confirm each is ≥ 90 (or, if any is a flaky 88-89, confirm it is documented with the Phase 7 deferral note). The authoritative ≥90 pass is on the deployed Vercel URL in Phase 7 — this local run is the pre-deploy gate.
    2. MANUAL a11y pass (jsdom can't do these — A11Y-04/A11Y-07 manual items): with the production server running:
       - Tab through the homepage: confirm a visible focus ring on every interactive element, logical focus order, no keyboard traps.
       - Open the PaletteSwitcher (FAB): confirm focus is trapped inside, Esc closes it, focus returns to the FAB.
       - Apply 3-4 random harmonic palettes (Generate tab): confirm NO layout overflow/clipping and text stays readable (A11Y-07 visual dimension).
       - Visit a bad URL (e.g. /en/nonexistent): confirm the playful 404 animates in and the back link returns home (EGG-02).
       - Visit `/en/opengraph-image` and a project's OG route: confirm the branded Terra card renders with the accent bar + correct text (A11Y-01 visual).
  </how-to-verify>
  <resume-signal>Type "approved" (with the 4 scores noted), or describe issues to fix.</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` succeeds with opengraph-image + sitemap + robots routes emitted
- `npm run lighthouse:mobile` run completed; 4 scores recorded in the SUMMARY
- Deterministic sub-90 fixed; flaky cases documented with Phase 7 deferral
- Human checkpoint: scores reviewed + manual a11y/visual pass (keyboard, focus trap, random palette layout, 404, OG render) completed
</verification>

<success_criteria>
A11Y-08 (local pre-deploy gate): the four Lighthouse mobile scores for the homepage are recorded against a production build; targets are ≥90 with deterministic regressions fixed. The authoritative ≥90 confirmation is deferred to Phase 7 (deployed Vercel URL, per the requirement wording). The manual keyboard/focus-trap/random-palette/404/OG verifications (jsdom-impossible) are confirmed via the human checkpoint.
</success_criteria>

<output>
After completion, create `.planning/phases/06-seo-accessibility-polish/06-05-SUMMARY.md` (MUST include the 4 recorded Lighthouse scores).
</output>
