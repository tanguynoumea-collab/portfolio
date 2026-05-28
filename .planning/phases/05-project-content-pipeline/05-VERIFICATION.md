---
phase: 05-project-content-pipeline
verified: 2026-05-28T07:40:00Z
status: human_needed
score: 20/20 must-have truths verified
human_verification:
  - test: "Cover parallax visually translates on scroll under full motion"
    expected: "Visit /fr/projects/agora with normal motion preference; scroll down — the cover image translates upward (≤50px) slower than the page. Then enable prefers-reduced-motion → cover image stays static (no translate)."
    why_human: "Scroll-driven GSAP ScrollTrigger scrub:0.5 needs a real viewport + Lenis RAF; jsdom cannot drive scroll-position-based animation. Hook config and dual-branch logic are unit-verified (10 tests green); only the live visual motion is browser-only."
  - test: "<Image> zoom Dialog opens and closes via Esc / backdrop"
    expected: "Visit /fr/projects/texture-manager, click a gallery image → Dialog opens with the enlarged image; press Esc and click the backdrop → both close. Page behind does not scroll while modal is open (data-lenis-prevent)."
    why_human: "Radix Dialog focus-trap + keyboard/backdrop close is browser-only (jsdom cannot fully simulate). The data-lenis-prevent attribute placement and Dialog wiring are unit-verified; the interaction is manual."
  - test: "<CodeBlock> copy button copies source and swaps Copy↔Check"
    expected: "On a project page with a fenced code block, hover the block → copy button appears top-right; click it → icon swaps to a check for ~1.5s, and the clipboard holds the raw code source."
    why_human: "navigator.clipboard write + real clipboard read is a browser permission/UX behavior; the writeText call, textContent extraction, and 1500ms revert are unit-verified with fake timers, but the actual clipboard round-trip and hover-reveal are manual."
  - test: "Full project page renders MDX body + metadata strip + gallery visually"
    expected: "Visit /fr/projects/agora (no gallery) and /en/projects/texture-manager (gallery shows 4 images). Confirm: cover hero, metadata strip with category-specific fields, 4 case-study sections rendered, Callouts styled by variant, prev/next footer navigates with wrap-around."
    why_human: "Full MDX render through the RELATIVE dynamic import only happens in the running app/production build; jsdom page tests intentionally never render past the dynamic import. Build emits all 12 routes (verified); visual layout/typography quality is a human judgment."
---

# Phase 5: Project Content Pipeline Verification Report

**Phase Goal:** Deliver the project case-study system — 12 localized MDX files (6 projects × 2 locales), the discriminated `Project` type pipeline, and detail pages rendered with dynamic MDX import + generateStaticParams, galleries, custom MDX components (Image zoom, CodeBlock, Callout), and a subtle GSAP parallax (factor ≈ 0.3) on the project cover image — all respecting prefers-reduced-motion.

**Verified:** 2026-05-28T07:40:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

Every must-have truth across all 4 plans is verified against the actual codebase (not SUMMARY claims). All 4 ROADMAP success criteria are satisfied at the automated layer. The 4 items routed to human verification are the documented Manual-Only behaviors from `05-VALIDATION.md` (live scroll motion, Dialog interaction, clipboard round-trip, full visual render) — these are legitimate browser-only checks, NOT implementation gaps. The code paths underlying all 4 are unit-verified; only the runtime UX is manual.

### Observable Truths

| #   | Truth (Plan)                                                                                          | Status     | Evidence                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| 1   | 6 projects × FR/EN bodies with 4 H2 case-study sections, 250-400 words/locale (00)                    | ✓ VERIFIED | 12 files, each exactly 4 `## ` headings; `check-mdx-structure.ts` exits 0: "12 files OK (4 H2 + 250-400 words)" |
| 2   | `Project` type accepts optional `gallery?: string[]`; all 12 stubs still validate (00)                | ✓ VERIFIED | `lib/projects.ts:32` `gallery?: string[]`; validator `Array.isArray` narrowing (L82,96); 4 backward-compat tests green |
| 3   | texture-manager (Tech) + brand-system (Design) carry gallery; other 4 omit it (00)                    | ✓ VERIFIED | `grep -l "^gallery:"` returns exactly those 4 files (fr+en); each has 4 image paths                       |
| 4   | `projects.detail.*` namespace in both locales with FR/EN parity (00)                                  | ✓ VERIFIED | `"detail"` present in both `messages/{fr,en}.json`; `check-i18n-parity.ts` exits 0: "94 leaf paths"        |
| 5   | 24 placeholder gallery images at `public/projects/{slug}/[1-4].jpg` (00)                              | ✓ VERIFIED | 24 files on disk across 6 slug dirs                                                                        |
| 6   | `<Image>` renders next/image + opens shadcn Dialog zoom with `data-lenis-prevent` on DialogContent (01)| ✓ VERIFIED | `components/mdx/Image.tsx:76-77` Dialog + `data-lenis-prevent` on DialogContent only; 6 tests green        |
| 7   | `<CodeBlock>` reads `data-language` → badge, copies raw source, Copy↔Check 1.5s swap (01)             | ✓ VERIFIED | `CodeBlock.tsx:45-46,50-54` data-language + textContent writeText + 1500ms revert; 5 tests green           |
| 8   | `<Callout>` 3 variants (info/warning/note) w/ correct icons + palette-aliased bg, no hardcoded color (01)| ✓ VERIFIED | `Callout.tsx:14-33` Info/AlertTriangle/StickyNote + `border-l-primary`/`bg-destructive/5`/`bg-muted`; grep: no hex/rgb |
| 9   | `mdx-components.tsx` wires Image, Callout, pre:CodeBlock, a override, prose overrides (01)             | ✓ VERIFIED | `mdx-components.tsx:31-35` registry + `noopener noreferrer` external/internal a (L59) + h1-h3/p/ul/ol/blockquote; 10 tests |
| 10  | `useParallax` installs ScrollTrigger scrub:0.5 on `[data-parallax-image]` under no-preference (02)    | ✓ VERIFIED | `useParallax.ts:60-69` gsap.to + `scrub: 0.5`; full-motion branch tests green                              |
| 11  | Under reduced motion the hook sets y:0 and installs NO ScrollTrigger (02)                              | ✓ VERIFIED | `useParallax.ts:55-58` `gsap.set('[data-parallax-image]', { y: 0 })` + early return; reduced-motion tests green |
| 12  | The hook never calls `gsap.registerPlugin` (LenisProvider owns it) (02)                               | ✓ VERIFIED | `grep -c registerPlugin useParallax.ts` = 0; only side-effect `import 'gsap/ScrollTrigger'` (L13)          |
| 13  | Cleanup is automatic via `useGSAP({ scope })` on unmount (02)                                         | ✓ VERIFIED | `useParallax.ts:46,73` `useGSAP(fn, { scope: ref, dependencies: [maxTranslate] })`; lifecycle tests green  |
| 14  | `/{locale}/projects/{slug}` renders cover, metadata strip, MDX body, optional gallery, prev/next (03) | ✓ VERIFIED | `page.tsx` full magazine layout L106-278; build emits the route; visual render routed to human #4          |
| 15  | `generateStaticParams` returns 12 entries (6 slugs × 2 locales) (03)                                  | ✓ VERIFIED | prerender-manifest lists exactly 12 `/projects/` routes; `page.tsx:63-68` flatMap locales × slugs          |
| 16  | Invalid slug calls `notFound()`; `dynamicParams=false` blocks unknown slugs (03)                      | ✓ VERIFIED | `page.tsx:54` `dynamicParams = false`; L84-85 `getProjectBySlug` + `notFound()`; group-A tests green       |
| 17  | MDX loaded via RELATIVE dynamic import (NOT @/ alias) so Turbopack resolves in prod (03)              | ✓ VERIFIED | `page.tsx:91-93` `await import(\`../../../../content/projects/${slug}.${locale}.mdx\`)`; prod build exit 0 |
| 18  | Cover gets parallax via ProjectCover consuming useParallax; gallery renders only when length > 0 (03) | ✓ VERIFIED | `ProjectCover.tsx:37` `useParallax(ref)` + L42 `data-parallax-image`; `page.tsx:214` gallery length gate    |
| 19  | Metadata strip shows category-specific fields (tech/design/bim) (03)                                  | ✓ VERIFIED | `page.tsx:134-201` discriminated narrowing: tech→stack+repo/live, design→tools+client, bim→software+scale+location |
| 20  | Prev/next navigation wraps (last→first, first→last) with locale-aware Links (03)                      | ✓ VERIFIED | `page.tsx:99-100` `% slugs.length` modulo wrap; `Link` from `@/i18n/navigation`; wrap-math tests green     |

**Score:** 20/20 must-have truths verified

### Required Artifacts

| Artifact                                      | Expected                                                | Status     | Details                                                                 |
| --------------------------------------------- | ------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `lib/projects.ts`                             | `gallery?: string[]` + validator support                | ✓ VERIFIED | L32 field; L82/96 Array.isArray; backward-compat (gallery undefined→skip) |
| `scripts/check-mdx-structure.ts`              | CONTENT-01 gate (4 H2 + word count)                     | ✓ VERIFIED | Exits 0 on all 12 bodies; gray-matter parse + marker + word count        |
| `content/projects/*.mdx` (12)                 | 4 H2 sections + valid discriminated frontmatter         | ✓ VERIFIED | 12 files, 4 `## ` each; categories 2 tech / 2 design / 2 bim             |
| `messages/{fr,en}.json`                       | `projects.detail.*` namespace, FR/EN parity             | ✓ VERIFIED | `"detail"` in both; 94 leaf paths parity                                 |
| `components/mdx/Image.tsx`                     | Dialog zoom + data-lenis-prevent + motion hover         | ✓ VERIFIED | WIRED into registry + reused as gallery cell in page.tsx                 |
| `components/mdx/CodeBlock.tsx`                 | `<pre>` override + copy + language badge                | ✓ VERIFIED | WIRED as `pre:` in registry                                             |
| `components/mdx/Callout.tsx`                   | info/warning/note variants, palette-aliased             | ✓ VERIFIED | WIRED as `Callout` in registry; no hardcoded colors                      |
| `mdx-components.tsx`                           | Registry (Image/Callout/pre/a + prose)                  | ✓ VERIFIED | Auto-discovered by @next/mdx; build consumes it                          |
| `lib/hooks/useParallax.ts`                    | matchMedia dual-branch, no registerPlugin               | ✓ VERIFIED | WIRED into ProjectCover; scrub:0.5; reduced→y:0                          |
| `app/[locale]/projects/[slug]/page.tsx`       | Server Component detail page (CONTENT-02), min 120 lines | ✓ VERIFIED | 280 lines; RELATIVE import; 12 routes; notFound; metadata strip          |
| `components/sections/ProjectCover.tsx`        | Client island: cover + useParallax (ANIM-02)            | ✓ VERIFIED | `data-parallax-image` marker; consumes useParallax(ref)                  |

### Key Link Verification

| From                                  | To                                      | Via                                            | Status   | Details                                              |
| ------------------------------------- | --------------------------------------- | ---------------------------------------------- | -------- | ---------------------------------------------------- |
| `validateFrontmatter`                 | `data.gallery`                          | Array.isArray narrowing → keep or drop         | ✓ WIRED  | L82,96 — undefined or string[] only, conditional spread |
| `check-mdx-structure.ts`              | `content/projects/*.mdx`                | gray-matter parse + H2 + word count            | ✓ WIRED  | Script runs, exits 0                                 |
| `Image.tsx <DialogContent>`           | LenisProvider prevent contract          | data-lenis-prevent on DialogContent only       | ✓ WIRED  | L77; not on Overlay/Trigger                          |
| `CodeBlock.tsx onCopy`                | navigator.clipboard.writeText           | preRef.current.textContent                     | ✓ WIRED  | L50-52                                               |
| `mdx-components.tsx a override`       | external vs internal routing            | http(s)→target=_blank rel; else next-intl Link | ✓ WIRED  | L52-81; noopener noreferrer                          |
| `useParallax.ts`                      | gsap.matchMedia dual-branch             | isFull scrub:0.5; isReduced gsap.set y:0       | ✓ WIRED  | L48-71                                               |
| `useParallax.ts`                      | useGSAP scope cleanup                   | useGSAP(fn, { scope: ref, deps })              | ✓ WIRED  | L46,73                                               |
| `page.tsx`                            | `content/projects/{slug}.{locale}.mdx`  | RELATIVE dynamic import                         | ✓ WIRED  | L91-93; resolves in prod build (exit 0)              |
| `page.tsx`                            | `getProjectBySlug → notFound()`         | null check                                     | ✓ WIRED  | L84-85                                               |
| `ProjectCover.tsx`                    | `lib/hooks/useParallax`                 | useParallax(ref) on cover wrapper              | ✓ WIRED  | L28,37                                               |
| `page.tsx`                            | prev/next wrap-around                   | modulo over getProjectSlugs()                  | ✓ WIRED  | L99-100 `% slugs.length`                             |

### Data-Flow Trace (Level 4)

| Artifact          | Data Variable | Source                                      | Produces Real Data | Status     |
| ----------------- | ------------- | ------------------------------------------- | ------------------ | ---------- |
| `page.tsx`        | `project`     | `getProjectBySlug` → fs read + gray-matter  | Yes (real MDX frontmatter) | ✓ FLOWING  |
| `page.tsx`        | `MDXContent`  | RELATIVE dynamic import of compiled MDX     | Yes (real body, prod build renders) | ✓ FLOWING  |
| `page.tsx`        | `project.gallery` | frontmatter `gallery:` (2 projects)     | Yes (4 paths each on disk) | ✓ FLOWING  |
| `page.tsx`        | prev/next     | `getProjectSlugs()` modulo                  | Yes (12-slug set)  | ✓ FLOWING  |
| `ProjectCover`    | `src/alt`     | props from `project.cover`/`project.title`  | Yes (passed from server) | ✓ FLOWING  |

> Note: gallery placeholder images and case-study prose are intentional, documented Wave-0 placeholders (real assets/copy swapped pre-deploy in Phase 7 per D-01/D-03). They are real, valid data flowing through the pipeline — not stubs blocking the goal.

### Behavioral Spot-Checks

| Behavior                                       | Command                                  | Result                                         | Status  |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------- | ------- |
| MDX structure gate (4 H2 + word count)         | `npx tsx scripts/check-mdx-structure.ts` | "12 files OK"; exit 0                           | ✓ PASS  |
| i18n FR/EN parity                              | `npx tsx scripts/check-i18n-parity.ts`   | "94 leaf paths"; exit 0                         | ✓ PASS  |
| Full unit suite                                | `npm test`                               | 276 passed (35 files); exit 0                   | ✓ PASS  |
| Production build (RELATIVE import under Turbopack) | `npm run build`                       | "Compiled successfully"; exit 0                 | ✓ PASS  |
| 12 static project routes (CONTENT-02 smoke)    | prerender-manifest project route count   | 12 routes (6 slugs × fr/en)                     | ✓ PASS  |
| 24 gallery images present                      | `ls public/projects/*/[1-4].jpg`         | 24                                              | ✓ PASS  |

### Requirements Coverage

| Requirement | Source Plan(s) | Description                                                              | Status      | Evidence                                                              |
| ----------- | -------------- | ------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| CONTENT-01  | 05-00          | 12 MDX files `{slug}.{fr|en}.mdx`, discriminated frontmatter             | ✓ SATISFIED | 12 files, 2 tech/2 design/2 bim, check-mdx-structure exit 0           |
| CONTENT-02  | 05-03          | Project page renders MDX via dynamic import + generateStaticParams + gallery | ✓ SATISFIED | Build emits 12 routes; RELATIVE import resolves; metadata strip + gallery |
| CONTENT-03  | 05-01          | Custom MDX components (Image zoom, CodeBlock highlight, Callout variants) | ✓ SATISFIED | 3 components + registry wired; 31 tests green; build consumes registry |
| ANIM-02     | 05-02, 05-03   | Cover parallax (factor ≈ 0.3) via GSAP ScrollTrigger, respects reduced-motion | ✓ SATISFIED | useParallax matchMedia dual-branch + ProjectCover island; live motion → human #1 |

No orphaned requirements: REQUIREMENTS.md maps exactly CONTENT-01/02/03 + ANIM-02 to Phase 5, all claimed by plans and already marked Complete in the traceability table.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| —    | —    | None    | —        | No TODO/FIXME/placeholder, no hardcoded hex/rgb in MDX components, no @/ alias in dynamic import, no console-only handlers |

> The single fixed-color `from-black/60` gradient scrim in `ProjectCover.tsx` is the one sanctioned non-palette color (D-05/D-13) — a standard photo-overlay scrim, not a themeable surface. Not an anti-pattern.

### Human Verification Required

4 items need human testing in a running browser. All are documented Manual-Only behaviors in `05-VALIDATION.md` — the underlying code is unit-verified; only the runtime UX cannot be checked programmatically:

1. **Cover parallax visually translates on scroll (full motion) / static (reduced motion)** — Visit `/fr/projects/agora`, scroll, confirm cover translates ≤50px slower than page; toggle `prefers-reduced-motion` → static. (ScrollTrigger scrub needs a real viewport + Lenis.)
2. **`<Image>` zoom Dialog opens + closes via Esc / backdrop** — Visit `/fr/projects/texture-manager`, click gallery image → Dialog opens; Esc + backdrop close it; page behind stays put. (Radix focus-trap is browser-only.)
3. **`<CodeBlock>` copy button copies source + Copy↔Check swap** — Hover a code block → copy button reveals; click → check icon ~1.5s + clipboard holds raw source. (Real clipboard round-trip is browser-only.)
4. **Full project page visual render** — `/fr/projects/agora` (no gallery) + `/en/projects/texture-manager` (gallery 4 images): cover hero, metadata strip with category fields, 4 case-study sections, styled Callouts, prev/next wrap navigation, typography/layout quality. (Full MDX render only in running app; visual quality is human judgment.)

### Gaps Summary

No gaps. All 20 must-have truths across all 4 plans are verified against the actual codebase. All 4 ROADMAP success criteria pass at the automated layer:

1. ✓ Six projects (2 Tech / 2 Design / 2 BIM) with `.fr.mdx` + `.en.mdx` and valid discriminated frontmatter.
2. ✓ `/{locale}/projects/{slug}` statically generated (12 routes confirmed in prerender-manifest) rendering MDX + category-specific metadata strip + gated gallery.
3. ✓ Custom MDX components (Image zoom, CodeBlock highlight, Callout variants) usable from any MDX via the auto-discovered registry.
4. ✓ Cover parallax (factor ≈ 0.3 / maxTranslate 50) via GSAP ScrollTrigger, disabled under `prefers-reduced-motion` (dual-branch verified).

The production build (the one CONTENT-02 proof unit tests cannot cover — RELATIVE dynamic-import resolution under Turbopack) exits 0 and emits all 12 routes. Status is `human_needed` solely because 4 runtime UX behaviors are intrinsically browser-only per the VALIDATION.md Manual-Only contract — these are expected UAT items, not implementation gaps.

---

_Verified: 2026-05-28T07:40:00Z_
_Verifier: Claude (gsd-verifier)_
