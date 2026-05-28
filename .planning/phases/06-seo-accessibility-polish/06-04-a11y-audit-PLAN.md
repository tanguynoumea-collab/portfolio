---
phase: 06-seo-accessibility-polish
plan: 04
type: execute
wave: 2
depends_on: ["06-00", "06-01", "06-02"]
files_modified:
  - app/globals.css
  - components/sections/Hero.a11y.test.tsx
  - components/sections/About.a11y.test.tsx
  - components/sections/ProjectsSection.a11y.test.tsx
  - components/sections/Skills.a11y.test.tsx
  - components/sections/Contact.a11y.test.tsx
  - components/theme/PaletteFab.a11y.test.tsx
  - app/[locale]/not-found.a11y.test.tsx
  - app/[locale]/error.a11y.test.tsx
  - scripts/check-reduced-motion.ts
  - scripts/check-image-audit.ts
autonomous: true
requirements: [A11Y-04, A11Y-05, A11Y-06]
must_haves:
  truths:
    - "Each key surface (Hero, About, ProjectsSection, Skills, Contact, PaletteFab, not-found, error) passes axe toHaveNoViolations with color-contrast disabled"
    - "axe flags would catch icon-only buttons missing accessible names (button-name rule active)"
    - "A global :focus-visible ring exists in globals.css using var(--ring)"
    - "scripts/check-reduced-motion.ts exits 0 — every animating file has a reduced-motion guard"
    - "scripts/check-image-audit.ts exits 0 — every <Image> has fill or width+height, no bare <img>"
  artifacts:
    - path: "scripts/check-reduced-motion.ts"
      provides: "A11Y-05 static regression gate"
      contains: "process.exit"
    - path: "scripts/check-image-audit.ts"
      provides: "A11Y-06 static image gate"
      contains: "process.exit"
    - path: "app/globals.css"
      provides: "global :focus-visible ring"
      contains: ":focus-visible"
  key_links:
    - from: "components/sections/Hero.a11y.test.tsx"
      to: "vitest-axe axe()"
      via: "toHaveNoViolations with color-contrast disabled"
      pattern: "color-contrast.*enabled: false"
    - from: "scripts/check-reduced-motion.ts"
      to: "components + app .tsx files"
      via: "ANIM regex vs GUARD regex"
      pattern: "usePrefersReducedMotion|useReducedMotion|gsap\\.matchMedia"
    - from: "app/globals.css :focus-visible"
      to: "--ring (= var(--color-accent))"
      via: "outline token"
      pattern: "outline.*--ring"
---

<objective>
Deliver A11Y-04 (axe-core zero violations + accessible names + visible focus ring), A11Y-05 (reduced-motion regression gate), and A11Y-06 (image audit gate). These are AUDIT plans over already-correct code — the gates must actually RUN and EXIT 0, not merely assert files exist. Add `*.a11y.test.tsx` files that render each key surface in jsdom and assert `toHaveNoViolations` (with axe's `color-contrast` rule disabled — jsdom can't compute contrast; `validateFullMatrix` (A11Y-07) + Lighthouse (A11Y-08) cover contrast). Add a global `:focus-visible` ring to globals.css. Add `scripts/check-reduced-motion.ts` and `scripts/check-image-audit.ts` grep gates (exit-0 contract, mirroring check-i18n-parity.ts).

Purpose: Automated accessibility regression coverage — every interactive surface stays axe-clean, every animation stays reduced-motion-gated, every image stays sized/lazy. This is the audit gate before deployment.
Output: globals.css :focus-visible edit, 8 *.a11y.test.tsx files, 2 check-*.ts gate scripts.
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
@.planning/phases/06-seo-accessibility-polish/06-CONTEXT.md

<interfaces>
<!-- Verified — no exploration needed. -->

vitest-axe (installed 06-00, pinned 1.0.0-pre.5): `import { axe } from 'vitest-axe'`. The `toHaveNoViolations` matcher is GLOBALLY registered via vitest-setup.ts (06-00). Call `axe(container, { rules: { 'color-contrast': { enabled: false } } })`.

Surface components + their EXISTING test files (reuse each `.test.tsx`'s mock shape verbatim — these are the established jsdom mocks that make the component render):
  - components/sections/Hero.tsx          ← Hero.test.tsx (mocks next-intl, @gsap/react useGSAP, gsap matchMedia, SplitText)
  - components/sections/About.tsx         ← About.test.tsx (mocks next-intl, gsap matchMedia, next/image)
  - components/sections/ProjectsSection.tsx ← ProjectsSection.test.tsx (mocks next-intl, motion/react, Link; takes a `projects` prop — pass a fixture array)
  - components/sections/Skills.tsx        ← Skills.test.tsx (mocks next-intl t.raw arrays, gsap)
  - components/sections/Contact.tsx       ← Contact.test.tsx (mocks next-intl, motion/react AnimatePresence, clipboard)
  - components/theme/PaletteFab.tsx       ← (icon-only button — aria-label localized; mock usePalette + next-intl + motion)
  - app/[locale]/not-found.tsx            ← not-found.test.tsx (06-02 mocks: next-intl, motion/react, Link, Button)
  - app/[locale]/error.tsx                ← error.test.tsx (06-02 mocks: next-intl, Button)

ProjectsSection takes `projects: Project[]` — use a 1-2 item fixture matching the discriminated union (e.g. `{ slug, title, year, category:'tech', summary, cover, stack:[] }`). PaletteSwitcher (Sheet) is NOT in this list (D-10 lists it but its open-state Radix Sheet portal is hard in jsdom — PaletteFab is the simpler icon-only-button axe target that covers the accessible-name requirement; the Sheet's focus-trap/Esc is verified by the existing Phase 2 tests + manual HUMAN-UAT). If PaletteSwitcher renders cleanly in jsdom with mocks, add it too — otherwise PaletteFab + the manual pass suffice.

globals.css CURRENT state (verified): `@layer base { * { @apply border-border outline-ring/50; } }` at line ~166. There is NO explicit `:focus-visible` selector and NO `@media (prefers-reduced-motion)` block. `--ring` resolves to `var(--color-accent)` (Phase 1 D-13).

Existing gate precedent: scripts/check-i18n-parity.ts + scripts/check-mdx-structure.ts (walk dirs, exit 1 + console.error on failure, console.log on pass, tsx-runnable).

Reduced-motion already gated across 15+ files (STATE.md): About (gsap.matchMedia), Hero (gsap.matchMedia), Skills (gsap.matchMedia), ProjectCard (useReducedMotion), CustomCursor (4-gate), LenisProvider (usePrefersReducedMotion), template.tsx, useParallax, PaletteFab, PalettePresets, mdx/Image (usePrefersReducedMotion), not-found.tsx (useReducedMotion, NEW 06-02).

next/image usages (4 files, verified): ProjectCover.tsx (`fill`+`priority`), About.tsx (`width`+`height`+lazy), ProjectCard.tsx (`width`+`height`), components/mdx/Image.tsx (`width`+`height`+lazy).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Global :focus-visible ring + scripts/check-reduced-motion.ts + scripts/check-image-audit.ts (run them, exit 0)</name>
  <read_first>
    - app/globals.css lines ~164-176 (the `@layer base * { outline-ring/50 }` block — ADD :focus-visible after it; verify NO existing :focus-visible)
    - 06-RESEARCH.md §15 (focus-visible + optional reduced-motion CSS net), §12 (check-reduced-motion.ts verbatim), §13 (check-image-audit.ts verbatim + the walk() body from §12)
    - scripts/check-i18n-parity.ts (exit-0 contract precedent)
  </read_first>
  <action>
    Edit `app/globals.css` — ADD a global `:focus-visible` ring (A11Y-04, D-11). Place it in/after the `@layer base` block. `--ring` already = `var(--color-accent)`:

    ```css
    :focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }
    ```
    Also add the reduced-motion CSS safety net (A11Y-05 belt-and-suspenders — the JS gates already cover it, but this neutralizes the global 400ms color transition + any stray CSS animation under reduced motion):

    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```
    CAUTION (06-RESEARCH §15): this flattens the ARCH-04 global 400ms color transition to instant under reduced motion (acceptable — palette swaps become instant). Verify the Phase 2 Pitfall-E overlay-transition test still passes after this edit; if it asserts a specific transition-duration, the test runs in jsdom without the reduced-motion media query active, so it should be unaffected — confirm by running the full suite.

    Create `scripts/check-reduced-motion.ts` VERBATIM from 06-RESEARCH §12 (walks components/ + app/, flags any .tsx that animates without a reduced-motion guard):

    ```ts
    import { readdirSync, readFileSync, statSync } from 'node:fs';
    import { join } from 'node:path';

    const ROOTS = ['components', 'app'];
    const ANIM = /useGSAP|gsap\.timeline|gsap\.to\(|gsap\.from\(|whileHover|whileTap|animate=|motion\./;
    const GUARD = /usePrefersReducedMotion|useReducedMotion|gsap\.matchMedia|prefers-reduced-motion|motion-safe:|motion-reduce:/;

    function walk(dir: string): string[] {
      const out: string[] = [];
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) out.push(...walk(p));
        else if (p.endsWith('.tsx') && !/\.(test|spec)\.tsx$/.test(p)) out.push(p);
      }
      return out;
    }

    const failures: string[] = [];
    for (const root of ROOTS) {
      for (const file of walk(root)) {
        const src = readFileSync(file, 'utf8');
        if (ANIM.test(src) && !GUARD.test(src)) {
          failures.push(`❌ ${file}: animates but no reduced-motion guard found`);
        }
      }
    }
    if (failures.length) {
      console.error('Reduced-motion gate FAILED.');
      for (const f of failures) console.error(`  ${f}`);
      process.exit(1);
    }
    console.log('✅ Reduced-motion gate OK — every animating file has a guard.');
    ```

    Create `scripts/check-image-audit.ts` VERBATIM from 06-RESEARCH §13 (every `<Image>` has fill OR width+height; no bare `<img>`). Use the SAME `walk()` body as §12 (it is stubbed in the snippet — copy the real walker):

    ```ts
    import { readdirSync, readFileSync, statSync } from 'node:fs';
    import { join } from 'node:path';

    function walk(dir: string): string[] {
      const out: string[] = [];
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) out.push(...walk(p));
        else if (p.endsWith('.tsx') && !/\.(test|spec)\.tsx$/.test(p)) out.push(p);
      }
      return out;
    }

    const failures: string[] = [];
    for (const root of ['components', 'app']) {
      for (const file of walk(root)) {
        const src = readFileSync(file, 'utf8');
        if (/<img[\s>]/.test(src)) failures.push(`❌ ${file}: bare <img> — use next/image`);
        const blocks = src.match(/<(?:Image|NextImage|MDXImage)\b[^>]*\/?>/gs) ?? [];
        for (const b of blocks) {
          const hasFill = /\bfill\b/.test(b);
          const hasDims = /\bwidth=/.test(b) && /\bheight=/.test(b);
          if (!hasFill && !hasDims) failures.push(`❌ ${file}: <Image> missing fill or width+height`);
        }
      }
    }
    if (failures.length) { console.error('Image audit FAILED.'); failures.forEach((f) => console.error(`  ${f}`)); process.exit(1); }
    console.log('✅ Image audit OK.');
    ```
    Note: include `MDXImage` in the element regex (the project page renders gallery items as `<MDXImage ... width={1200} height={800} />`). If the gate trips on a legitimately-OK file, the audit found a real gap — fix the source (add dims/fill), do NOT weaken the regex to hide it. If it trips on a false positive (a `motion.`-imported-but-static component for the reduced-motion gate, or an `<Image>` inside a comment), tune the regex narrowly per 06-RESEARCH §12 guidance.

    AUDIT FIRST (D-12/D-13): run BOTH gates. They are EXPECTED to pass on the current codebase (15+ files already gated; 4 image files already sized). If either fails, the failure is the audit finding — investigate and either fix the source file or refine the regex for a documented false positive.

    Add npm scripts: `"check:reduced-motion": "tsx scripts/check-reduced-motion.ts"` and `"check:images": "tsx scripts/check-image-audit.ts"`.
  </action>
  <verify>
    <automated>npx tsx scripts/check-reduced-motion.ts && npx tsx scripts/check-image-audit.ts && node -e "const c=require('fs').readFileSync('app/globals.css','utf8'); if(!c.includes(':focus-visible')) throw new Error('no :focus-visible'); if(!/outline.*--ring/.test(c)) throw new Error('focus ring not using --ring'); console.log('OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `app/globals.css` contains a `:focus-visible` rule with `outline: 2px solid var(--ring)` and a `@media (prefers-reduced-motion: reduce)` block
    - `scripts/check-reduced-motion.ts` exists, `process.exit(1)` on failure; `tsx scripts/check-reduced-motion.ts` EXITS 0 (every animating file guarded)
    - `scripts/check-image-audit.ts` exists, `process.exit(1)` on failure; `tsx scripts/check-image-audit.ts` EXITS 0 (every `<Image>`/`<MDXImage>` has fill or width+height; no bare `<img>`)
    - `package.json` has `check:reduced-motion` + `check:images` scripts
  </acceptance_criteria>
  <done>Focus-visible ring + reduced-motion CSS net added; both grep gates run and exit 0 (A11Y-05 + A11Y-06 proven, not just asserted).</done>
</task>

<task type="auto">
  <name>Task 2: vitest-axe a11y tests for the 5 homepage sections</name>
  <read_first>
    - 06-RESEARCH.md §10 (vitest-axe a11y test pattern — Hero example verbatim; color-contrast disabled rationale)
    - Hero.test.tsx, About.test.tsx, ProjectsSection.test.tsx, Skills.test.tsx, Contact.test.tsx — COPY each one's mock block (next-intl, gsap/@gsap/react, motion/react, next/image, Link) into the matching .a11y.test.tsx so the component renders identically
  </read_first>
  <action>
    For EACH of the 5 sections, create `<Component>.a11y.test.tsx` next to its existing `.test.tsx`. The pattern (06-RESEARCH §10): reuse the SAME mocks the component's existing `.test.tsx` uses (this is what makes it render in jsdom), render it, and assert `toHaveNoViolations` with `color-contrast` disabled.

    Hero example (VERBATIM structure from 06-RESEARCH §10 — copy Hero.test.tsx's `vi.mock(...)` blocks above the describe):

    ```tsx
    // components/sections/Hero.a11y.test.tsx
    import { describe, it, expect, vi } from 'vitest';
    import { render } from '@testing-library/react';
    import { axe } from 'vitest-axe';

    // ↓↓↓ PASTE Hero.test.tsx's vi.mock blocks here (next-intl, @gsap/react useGSAP,
    //     gsap matchMedia, gsap/SplitText) so Hero renders exactly as in Hero.test.tsx.

    describe('Hero (A11Y-04) — axe', () => {
      it('has no detectable a11y violations (color-contrast disabled in jsdom)', async () => {
        const { Hero } = await import('./Hero');
        const { container } = render(<Hero />);
        const results = await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        });
        expect(results).toHaveNoViolations();
      });
    });
    ```

    Repeat for:
    - `About.a11y.test.tsx` — reuse About.test.tsx mocks (next-intl, gsap matchMedia, next/image). Render `<About />`.
    - `ProjectsSection.a11y.test.tsx` — reuse ProjectsSection.test.tsx mocks (next-intl, motion/react, Link). ProjectsSection takes a `projects` prop — pass a 1-2 item fixture, e.g. `[{ slug:'x', title:'X', year:2024, category:'tech', summary:'s', cover:'/c.png', stack:['ts'] }]` (match the discriminated union the existing test uses). Render `<ProjectsSection projects={fixture} />`.
    - `Skills.a11y.test.tsx` — reuse Skills.test.tsx mocks (next-intl with `t.raw` returning arrays, gsap). Render `<Skills />`.
    - `Contact.a11y.test.tsx` — reuse Contact.test.tsx mocks (next-intl, motion/react AnimatePresence, clipboard). Render `<Contact />`.

    The default-export vs named-export form must match each component's actual export (Hero is a named export `{ Hero }` per the existing test's `await import`; check each file — use the same import form its `.test.tsx` uses). Disable ONLY `color-contrast` (jsdom can't compute it — 06-RESEARCH Pitfall 3; contrast is covered by A11Y-07 + A11Y-08). Do NOT disable any other rule — `button-name`, `image-alt`, `aria-*` must stay active so the suite genuinely verifies accessible names (A11Y-04).
  </action>
  <verify>
    <automated>npx vitest run components/sections/Hero.a11y.test.tsx components/sections/About.a11y.test.tsx components/sections/ProjectsSection.a11y.test.tsx components/sections/Skills.a11y.test.tsx components/sections/Contact.a11y.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - 5 files exist: Hero/About/ProjectsSection/Skills/Contact `.a11y.test.tsx`
    - Each calls `axe(container, { rules: { 'color-contrast': { enabled: false } } })` and `expect(results).toHaveNoViolations()`
    - No rule other than `color-contrast` is disabled (grep: only `color-contrast` appears in a `rules` disable)
    - `npx vitest run` on all 5 a11y test files exits 0
  </acceptance_criteria>
  <done>5 homepage sections pass axe toHaveNoViolations (color-contrast disabled); accessible-name rules active.</done>
</task>

<task type="auto">
  <name>Task 3: vitest-axe a11y tests for PaletteFab + not-found + error; full-suite + lint green</name>
  <read_first>
    - components/theme/PaletteFab.tsx (icon-only button — the accessible-name target; mock usePalette + next-intl + motion as its behavior needs)
    - app/[locale]/not-found.test.tsx + app/[locale]/error.test.tsx (06-02 — copy their mock blocks)
    - 06-RESEARCH.md §10 (D-11 accessible-name assertion via axe button-name rule)
  </read_first>
  <action>
    Create `components/theme/PaletteFab.a11y.test.tsx` — PaletteFab is the icon-only FAB whose localized `aria-label` is the A11Y-04 accessible-name proof. Reuse the mock shape PaletteFab needs (mock `@/components/providers/ThemeProvider` usePalette to return a minimal palette context, `next-intl` for the aria-label, `motion/react`). Render it and axe it:

    ```tsx
    // components/theme/PaletteFab.a11y.test.tsx
    import { describe, it, expect, vi } from 'vitest';
    import { render } from '@testing-library/react';
    import { axe } from 'vitest-axe';

    // PASTE the mocks PaletteFab needs (usePalette returning a stub context,
    // next-intl aria-label resolver, motion/react). Mirror how PaletteFab is
    // exercised elsewhere — the FAB must render with its localized aria-label.

    describe('PaletteFab (A11Y-04) — icon-only button has an accessible name', () => {
      it('has no a11y violations (button-name rule active)', async () => {
        const { PaletteFab } = await import('./PaletteFab');
        const { container } = render(<PaletteFab />);
        const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
        expect(results).toHaveNoViolations();
      });
    });
    ```
    If PaletteFab's context dependencies make it hard to render in isolation, wrap it minimally or mock `usePalette` to the shape it reads (`{ isVaporwaveUnlocked, vaporwaveUnlockNonce, ... }`). The point is to prove the icon-only button has a non-empty accessible name (axe `button-name` rule).

    Create `app/[locale]/not-found.a11y.test.tsx` and `app/[locale]/error.a11y.test.tsx` — reuse the 06-02 test mocks (next-intl, motion/react, Link, Button). For error.tsx pass `error={new Error('x')} reset={() => {}}`:

    ```tsx
    // app/[locale]/error.a11y.test.tsx
    import { describe, it, expect, vi } from 'vitest';
    import { render } from '@testing-library/react';
    import { axe } from 'vitest-axe';
    // PASTE error.test.tsx mocks (next-intl, Button).
    import ErrorBoundary from './error';
    describe('error.tsx (A11Y-04) — axe', () => {
      it('has no a11y violations', async () => {
        const { container } = render(<ErrorBoundary error={new Error('x')} reset={() => {}} />);
        const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
        expect(results).toHaveNoViolations();
      });
    });
    ```
    (Analogous for not-found.a11y.test.tsx, rendering `<NotFound />` with the 06-02 mocks.)

    After all 8 a11y files exist, run the FULL suite + lint + all gates to confirm Wave 2 did not regress anything and the whole audit passes together:

    ```bash
    npm test
    npm run lint
    npx tsx scripts/check-reduced-motion.ts
    npx tsx scripts/check-image-audit.ts
    npx tsx scripts/check-i18n-parity.ts
    ```
  </action>
  <verify>
    <automated>npx vitest run components/theme/PaletteFab.a11y.test.tsx "app/[locale]/not-found.a11y.test.tsx" "app/[locale]/error.a11y.test.tsx" && npm test</automated>
  </verify>
  <acceptance_criteria>
    - 3 files exist: PaletteFab/not-found/error `.a11y.test.tsx`, each asserting `toHaveNoViolations` (color-contrast disabled)
    - PaletteFab a11y test proves the icon-only button has an accessible name (axe passes with button-name rule active)
    - `npm test` (full suite) exits 0 — all prior tests + the 8 new a11y tests green together
    - `npm run lint` exits 0; `tsx scripts/check-reduced-motion.ts`, `check-image-audit.ts`, `check-i18n-parity.ts` all exit 0
  </acceptance_criteria>
  <done>PaletteFab + not-found + error pass axe; full suite + lint + all 3 gates green together.</done>
</task>

</tasks>

<verification>
- `npm test` green (full suite incl. 8 new a11y tests)
- `npx vitest run "**/*.a11y.test.tsx"` — all 8 surfaces `toHaveNoViolations` (color-contrast disabled, all other rules active)
- `tsx scripts/check-reduced-motion.ts` exits 0; `tsx scripts/check-image-audit.ts` exits 0; `tsx scripts/check-i18n-parity.ts` exits 0
- `app/globals.css` has `:focus-visible` ring (var(--ring)) + reduced-motion media block
- `npm run lint` clean
- MANUAL (HUMAN-UAT, recorded not blocking): full keyboard Tab cycle + focus order + Esc-close on PaletteSwitcher + screen-reader live-region announce (jsdom cannot verify these)
</verification>

<success_criteria>
A11Y-04: axe reports zero violations on all 8 key surfaces (contrast covered by A11Y-07/08); icon-only buttons have accessible names; a visible :focus-visible ring exists. A11Y-05: the reduced-motion gate runs and exits 0 (every animating file guarded). A11Y-06: the image gate runs and exits 0 (every Image sized, no bare img). All gates are executable and pass — not just file-existence assertions.
</success_criteria>

<output>
After completion, create `.planning/phases/06-seo-accessibility-polish/06-04-SUMMARY.md`
</output>
