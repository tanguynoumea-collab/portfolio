---
phase: 06-seo-accessibility-polish
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - vitest.config.ts
  - vitest-setup.ts
  - vitest-axe.d.ts
  - next.config.ts
  - lib/constants.ts
  - assets/Inter-SemiBold.ttf
  - .gitignore
autonomous: true
requirements: [A11Y-04, A11Y-06, A11Y-08, A11Y-01]
must_haves:
  truths:
    - "vitest-axe@1.0.0-pre.5 (exact, no caret) installed as a dev dependency"
    - "lighthouse installed as a dev dependency with a lighthouse:mobile npm script"
    - "vitest-axe toHaveNoViolations matcher is wired via setupFiles so Wave 2 a11y tests resolve it"
    - "assets/Inter-SemiBold.ttf exists (real ttf, <500KB) for Satori OG font loading"
    - "next.config.ts declares images.formats: ['image/avif','image/webp']"
    - "lib/constants.ts exports SITE_URL (env-aware, trailing-slash-stripped)"
    - "npm test stays green (276 baseline) and npm run build succeeds"
  artifacts:
    - path: "vitest-setup.ts"
      provides: "expect.extend(matchers) from vitest-axe/matchers"
      contains: "expect.extend"
    - path: "vitest-axe.d.ts"
      provides: "TS augmentation so toHaveNoViolations typechecks"
      contains: "AxeMatchers"
    - path: "lib/constants.ts"
      provides: "SITE_URL metadataBase source"
      contains: "SITE_URL"
    - path: "assets/Inter-SemiBold.ttf"
      provides: "Satori OG font"
    - path: "next.config.ts"
      provides: "images.formats AVIF/WebP"
      contains: "formats"
  key_links:
    - from: "vitest.config.ts"
      to: "vitest-setup.ts"
      via: "setupFiles array entry"
      pattern: "setupFiles.*vitest-setup"
    - from: "package.json"
      to: "vitest-axe"
      via: "exact pinned devDependency"
      pattern: "vitest-axe.*1\\.0\\.0-pre\\.5"
---

<objective>
Wave 0 dependency + infrastructure gate. This is the bottleneck that unblocks BOTH Wave 1 (06-01 needs the OG font + SITE_URL) AND Wave 2 (06-04 needs the vitest-axe `toHaveNoViolations` matcher). Install the only two new dev deps (`vitest-axe@1.0.0-pre.5` exact + `lighthouse`), wire the axe matcher into the existing Vitest suite without disturbing the chai-matcher tests, bundle the Satori OG font, add `images.formats`, add `SITE_URL`, and ignore the lighthouse report dir.

Purpose: Land all shared infra so the three Wave 1 plans and two Wave 2 plans can execute in parallel without re-installing or re-configuring.
Output: package.json (2 deps + lighthouse scripts), vitest-setup.ts, vitest-axe.d.ts, vitest.config.ts edit, next.config.ts edit, lib/constants.ts edit, assets/Inter-SemiBold.ttf, .gitignore edit.
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
@.planning/phases/06-seo-accessibility-polish/06-VALIDATION.md

<interfaces>
<!-- Current state the executor edits — extracted from codebase, no exploration needed. -->

vitest.config.ts currently has `setupFiles: []`. The include globs already cover root-level `*.{test,spec}.{ts,tsx}` and `app/**`, `components/**`, `lib/**`, `scripts/**`. The `@` alias resolves to repo root.

lib/constants.ts currently exports ONLY: `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL`. SITE_URL must be ADDED (keep the existing three).

next.config.ts currently is `const nextConfig: NextConfig = { pageExtensions: ['ts', 'tsx', 'md', 'mdx'] };` wrapped in `withNextIntl(withMDX(nextConfig))`. Add an `images` key to nextConfig WITHOUT touching the MDX/intl wrapping.

package.json scripts currently: dev, build, start, lint, format, format:check, test (`vitest run`), test:watch, test:palettes (`tsx scripts/validate-palettes.ts`). No @vercel/og present (good — next/og is built-in).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install vitest-axe (pinned exact) + lighthouse, add lighthouse npm scripts</name>
  <read_first>
    - package.json (current scripts + devDependencies — see interfaces block)
    - 06-RESEARCH.md §"New dev dependencies" + §14 (Lighthouse npm script) — the exact install command + script strings
  </read_first>
  <action>
    Run the install with vitest-axe pinned EXACTLY (no caret — `latest` is the stale 2022 `0.1.0` that lacks the `./matchers` subpath):

    ```bash
    npm install --save-dev vitest-axe@1.0.0-pre.5 lighthouse
    ```

    This must produce a package.json devDependency entry `"vitest-axe": "1.0.0-pre.5"` (exact, NO `^`). If npm rewrites it with a caret, manually edit package.json to remove the caret so it reads exactly `"1.0.0-pre.5"`. `lighthouse` may use a caret (`^13.x`) — that is fine.

    Do NOT add `@types/vitest-axe` (vitest-axe ships its own `.d.ts`). Do NOT add `@vercel/og` (next/og is built-in).

    Add two scripts to package.json `scripts` (A11Y-08, D-15). Lighthouse defaults to mobile; `--form-factor=mobile` is explicit. Note the requirement is MOBILE — the `lighthouse:mobile` script is the authoritative one:

    ```jsonc
    "lighthouse": "lighthouse http://localhost:3000/en --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./.lighthouse/report.html --chrome-flags=\"--headless\"",
    "lighthouse:mobile": "lighthouse http://localhost:3000/en --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./.lighthouse/mobile.html --chrome-flags=\"--headless\""
    ```
  </action>
  <verify>
    <automated>node -e "const p=require('./package.json'); if(p.devDependencies['vitest-axe']!=='1.0.0-pre.5') throw new Error('vitest-axe not pinned exactly: '+p.devDependencies['vitest-axe']); if(!p.devDependencies.lighthouse) throw new Error('lighthouse missing'); if(!p.scripts['lighthouse:mobile']) throw new Error('lighthouse:mobile script missing'); console.log('OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"vitest-axe": "1.0.0-pre.5"` (exact literal, NO caret — grep `1.0.0-pre.5` with no `^` before it)
    - `package.json` contains a `lighthouse` devDependency and a `lighthouse:mobile` script
    - `package.json` does NOT contain `@vercel/og` and does NOT contain `@types/vitest-axe`
    - `node_modules/vitest-axe/package.json` exposes a `./matchers` export (confirms the prerelease, not 0.1.0): `node -e "const e=require('vitest-axe/package.json').exports; if(!e['./matchers']) throw new Error('stale vitest-axe — missing ./matchers'); console.log('matchers OK')"` exits 0
  </acceptance_criteria>
  <done>vitest-axe@1.0.0-pre.5 (exact) + lighthouse installed; lighthouse + lighthouse:mobile scripts present; no @vercel/og.</done>
</task>

<task type="auto">
  <name>Task 2: Wire vitest-axe matcher (setup file + TS augmentation + config), add SITE_URL, images.formats, .gitignore</name>
  <read_first>
    - vitest.config.ts (current `setupFiles: []` — see interfaces block)
    - lib/constants.ts (current EMAIL/GITHUB_URL/LINKEDIN_URL — ADD SITE_URL, keep the three)
    - next.config.ts (current nextConfig — ADD images key only)
    - 06-RESEARCH.md §10 (vitest-setup.ts + vitest-axe.d.ts + config edit), §2 (SITE_URL), §13 (images.formats)
  </read_first>
  <action>
    Create `vitest-setup.ts` at repo root (additive — does NOT globally extend jest-dom, so the existing native-chai-matcher tests stay intact):

    ```ts
    // vitest-setup.ts — registers the vitest-axe toHaveNoViolations matcher.
    import * as matchers from 'vitest-axe/matchers';
    import { expect } from 'vitest';
    expect.extend(matchers);
    ```

    Create `vitest-axe.d.ts` at repo root (TS augmentation so `toHaveNoViolations` typechecks):

    ```ts
    import 'vitest';
    import type { AxeMatchers } from 'vitest-axe/matchers';
    declare module 'vitest' {
      interface Assertion extends AxeMatchers {}
      interface AsymmetricMatchersContaining extends AxeMatchers {}
    }
    ```

    Edit `vitest.config.ts`: change `setupFiles: []` to `setupFiles: ['./vitest-setup.ts']`. Leave everything else (include globs, alias, jsdom) untouched.

    Edit `lib/constants.ts`: ADD (keep EMAIL/GITHUB_URL/LINKEDIN_URL exactly as-is):

    ```ts
    export const SITE_URL = (
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev'
    ).replace(/\/$/, ''); // strip trailing slash so `${SITE_URL}${pathname}` never double-slashes
    ```

    Edit `next.config.ts`: add an `images` key to the `nextConfig` object (A11Y-06, D-13). Do NOT touch the `withNextIntl(withMDX(...))` wrapping or `pageExtensions`:

    ```ts
    const nextConfig: NextConfig = {
      pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
      images: {
        formats: ['image/avif', 'image/webp'],
      },
    };
    ```

    Edit `.gitignore`: add a line `/.lighthouse/` (the Lighthouse report output dir — should not be committed). Add it near the existing build-artifact ignores; do not remove any existing entries.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json && node -e "require('fs').readFileSync('vitest-setup.ts');require('fs').readFileSync('vitest-axe.d.ts');console.log('files OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `vitest-setup.ts` exists and contains `expect.extend` and imports from `vitest-axe/matchers`
    - `vitest-axe.d.ts` exists and references `AxeMatchers`
    - `vitest.config.ts` contains `setupFiles: ['./vitest-setup.ts']` (no longer `[]`)
    - `lib/constants.ts` contains `export const SITE_URL` AND still contains `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL`
    - `next.config.ts` contains `formats: ['image/avif', 'image/webp']` and still contains `pageExtensions` and `withNextIntl(withMDX`
    - `.gitignore` contains `.lighthouse`
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Matcher infra wired, SITE_URL added, images.formats set, .lighthouse ignored; typecheck clean.</done>
</task>

<task type="auto">
  <name>Task 3: Bundle the Satori OG font (assets/Inter-SemiBold.ttf) and verify the suite + build stay green</name>
  <read_first>
    - 06-RESEARCH.md §4 note ("Font asset: place a real Inter-SemiBold.ttf in assets/") + Open Question 3 (Inter font sourcing)
    - node_modules/.cache or .next/static/media (Inter woff2 subsets exist from next/font — but Satori needs ttf/otf, NOT woff2-subset)
  </read_first>
  <action>
    Place a REAL Inter SemiBold (weight 600) font file at `assets/Inter-SemiBold.ttf`. Satori requires ttf/otf/woff (ttf preferred); it does NOT accept the unicode-range-split woff2 subsets that `next/font` emits.

    Download the official Inter ttf. Inter ships static instances on its GitHub releases:

    ```bash
    mkdir -p assets
    curl -L -o assets/Inter-SemiBold.ttf "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-SemiBold.ttf"
    ```

    Verify the file is a real, non-empty TrueType font (the first 4 bytes are the sfnt version `0x00010000` for ttf) and is well under the 500KB Satori bundle budget:

    ```bash
    node -e "const b=require('fs').readFileSync('assets/Inter-SemiBold.ttf'); if(b.length<50000) throw new Error('font too small — likely an HTML error page, got '+b.length+' bytes'); if(b.length>500000) throw new Error('font exceeds 500KB Satori budget: '+b.length); console.log('font OK '+b.length+' bytes')"
    ```

    If the curl URL 404s or returns HTML (size check fails), fall back to a different official source: the Inter release zip on https://github.com/rsms/inter/releases, or `node_modules` if a static Inter ttf is present. The file MUST be a genuine ttf/otf — a system-font fallback is unreliable inside the Satori sandbox (06-RESEARCH Discretion).

    After the font is in place, run the full suite + build to confirm Wave 0 changes did not regress the 276-test baseline or the production build:

    ```bash
    npm test
    npm run build
    ```
  </action>
  <verify>
    <automated>node -e "const b=require('fs').readFileSync('assets/Inter-SemiBold.ttf'); if(b.length<50000||b.length>500000) throw new Error('bad font size '+b.length); console.log('font OK')" && npm test</automated>
  </verify>
  <acceptance_criteria>
    - `assets/Inter-SemiBold.ttf` exists, is a real ttf (>50KB, <500KB)
    - `npm test` exits 0 with the full suite still green (276 baseline preserved — the new setupFiles addition must not break the chai-matcher tests)
    - `npm run build` exits 0 (Wave 0 config edits do not break the production build)
  </acceptance_criteria>
  <done>Real Inter-SemiBold.ttf bundled in assets/; full suite green; build succeeds.</done>
</task>

</tasks>

<verification>
- `npm test` green (276 baseline; setupFiles addition is additive)
- `npm run build` succeeds
- `npx tsc --noEmit` exits 0
- package.json: vitest-axe pinned exact, lighthouse present, lighthouse:mobile script present, no @vercel/og
- vitest-setup.ts + vitest-axe.d.ts exist; vitest.config.ts wires setupFiles
- lib/constants.ts has SITE_URL; next.config.ts has images.formats; assets/Inter-SemiBold.ttf bundled; .gitignore ignores .lighthouse
</verification>

<success_criteria>
All Wave 0 infra in place so Wave 1 (OG font + SITE_URL) and Wave 2 (vitest-axe matcher) can execute. No new runtime dependencies beyond vitest-axe + lighthouse (both dev). next/og remains the built-in OG path (zero OG deps).
</success_criteria>

<output>
After completion, create `.planning/phases/06-seo-accessibility-polish/06-00-SUMMARY.md`
</output>
