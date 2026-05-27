---
phase: 03-layout-animation-foundation
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - package-lock.json
autonomous: true
requirements: [LAYOUT-02]
must_haves:
  truths:
    - "gsap@^3.13 is listed in package.json dependencies"
    - "@gsap/react@^2.1.2 is listed in package.json dependencies"
    - "lenis@^1.3 is listed in package.json dependencies"
    - "npm run build exits 0 after install"
    - "npm test exits 0 (94/94 Phase 2 baseline still green) after install"
    - "npm run lint exits 0 after install"
  artifacts:
    - path: "package.json"
      provides: "Phase 3 animation deps declared"
      contains: '"gsap"'
    - path: "package.json"
      provides: "useGSAP cleanup hook dep"
      contains: '"@gsap/react"'
    - path: "package.json"
      provides: "Smooth-scroll engine"
      contains: '"lenis"'
  key_links:
    - from: "package.json"
      to: "node_modules/gsap"
      via: "npm install"
      pattern: "gsap"
    - from: "package.json"
      to: "node_modules/@gsap/react"
      via: "npm install"
      pattern: "@gsap/react"
    - from: "package.json"
      to: "node_modules/lenis"
      via: "npm install"
      pattern: "lenis"
---

<objective>
Install the three net-new Phase 3 animation dependencies (`gsap`, `@gsap/react`, `lenis`) at the locked CONTEXT.md D-01 versions. This is the Wave 0 gate that unblocks every subsequent Phase 3 plan — LenisProvider (Plan 01), root layout font wiring (Plan 02), and the Wave 2/3 chrome components all import from these packages.

Purpose: gsap+@gsap/react are required for the LAYOUT-02 single-RAF bridge (`gsap.ticker.add` + `gsap.registerPlugin(ScrollTrigger)`); lenis is the smooth-scroll engine. `motion@^12.40` is ALREADY installed from Phase 2 W0 — do not reinstall it. NOT `@studio-freight/lenis` (legacy/unmaintained package) — must be the rebrand `lenis`.

Output: package.json + package-lock.json updated with the three deps, all existing tests still green, build still passing.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-layout-animation-foundation/03-CONTEXT.md
@.planning/phases/03-layout-animation-foundation/03-RESEARCH.md
@CLAUDE.md
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install gsap + @gsap/react + lenis at locked versions</name>
  <files>package.json, package-lock.json</files>
  <read_first>
    - package.json (current state — verify motion@^12 already present, gsap/@gsap/react/lenis NOT present)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Dependency Installation" (D-01 versions)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §"Standard Stack" + §"Install Commands"
    - .planning/research/STACK.md (canonical install commands)
  </read_first>
  <action>
    Run a single npm install command with caret-prefix locked versions per D-01:

    ```bash
    npm install gsap@^3.13.0 @gsap/react@^2.1.2 lenis@^1.3.0
    ```

    All three on one line so npm resolves the dep graph once.

    Constraints:
    - Use exact caret-prefixed semver `^3.13.0`, `^2.1.2`, `^1.3.0` so the entries in `package.json.dependencies` match the regex `"gsap": "\^3\.1"`, `"@gsap/react": "\^2\.1"`, `"lenis": "\^1\.3"`.
    - DO NOT install `@studio-freight/lenis` or `@studio-freight/react-lenis` (legacy/abandoned packages — Lenis was rebranded to plain `lenis` after Darkroom Engineering split from Studio Freight).
    - DO NOT install `motion` or `framer-motion` again — `motion@^12.40.0` is already on disk from Phase 2 W0.
    - DO NOT install ScrollTrigger separately — it ships bundled inside `gsap` since the April 2025 Webflow acquisition made the Club plugins free.
    - DO NOT add a `tailwind.config.js`/`.ts` file — Tailwind v4 is CSS-first; configuration belongs in `globals.css` `@theme`.

    After install:
    1. Verify the three packages show up in `package.json.dependencies` (NOT `devDependencies`).
    2. Run `npm run lint` — must exit 0 (no new code introduced, but catches accidental package.json formatting drift).
    3. Run `npm run build` — must exit 0 (verifies Next 16 + TS strict still resolve the dep graph).
    4. Run `npm test` — must exit 0 with 94/94 Phase 2 baseline tests still green (no test regression from peer dep changes).

    No source code changes in this task. package.json + package-lock.json edits ONLY.
  </read_first>
  <verify>
    <automated>npm install gsap@^3.13.0 @gsap/react@^2.1.2 lenis@^1.3.0 && npm run lint && npm run build && npm test</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` dependencies block contains a line matching the regex `"gsap": "\^3\.1[0-9]"` (caret major 3, minor >=13).
    - `package.json` dependencies block contains a line matching the regex `"@gsap/react": "\^2\.1"`.
    - `package.json` dependencies block contains a line matching the regex `"lenis": "\^1\.3"`.
    - `package.json` does NOT contain `@studio-freight/lenis` (legacy package).
    - `package.json` does NOT contain `@studio-freight/react-lenis` (legacy package).
    - `package.json` still contains `"motion": "^12"` (unchanged from Phase 2 W0).
    - `node_modules/gsap/package.json` exists after install.
    - `node_modules/@gsap/react/package.json` exists after install.
    - `node_modules/lenis/package.json` exists after install.
    - `npm run lint` exits with code 0.
    - `npm run build` exits with code 0.
    - `npm test` exits with code 0 and reports >= 94 passing tests (Phase 2 baseline preserved).
  </acceptance_criteria>
  <done>Three new deps in package.json at locked caret versions; lockfile updated; lint+build+test all exit 0.</done>
</task>

</tasks>

<verification>
- package.json contains the three new dependency entries (gsap, @gsap/react, lenis).
- node_modules directory has the three new package subdirectories.
- npm run lint exits 0.
- npm run build exits 0.
- npm test exits 0 with 94+ passing tests.
- No legacy `@studio-freight/*` packages present.
</verification>

<success_criteria>
The three Phase 3 net-new deps are installed at the locked CONTEXT.md D-01 versions. The Phase 2 baseline of 94 passing tests is preserved. Lint and build succeed. Wave 1 (LenisProvider + root-layout font wiring) can now import from `gsap`, `gsap/ScrollTrigger`, `@gsap/react`, and `lenis`.
</success_criteria>

<output>
After completion, create `.planning/phases/03-layout-animation-foundation/03-00-SUMMARY.md` documenting:
- Exact installed versions (resolved by npm) of gsap, @gsap/react, lenis.
- Confirmation that lint/build/test all green post-install.
- Confirmation that motion@^12 was NOT reinstalled.
</output>
