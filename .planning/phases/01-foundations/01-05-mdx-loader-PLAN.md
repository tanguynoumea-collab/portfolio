---
phase: 01-foundations
plan: 05
type: execute
wave: 5
depends_on:
  - 01-04
files_modified:
  - next.config.ts
  - mdx-components.tsx
  - lib/projects.ts
  - lib/palettes.ts
  - content/projects/_template.fr.mdx
  - content/projects/_template.en.mdx
  - package.json
autonomous: true
requirements:
  - ARCH-08
gap_closure: false
must_haves:
  truths:
    - "`lib/projects.ts` exports a discriminated union `Project = TechProject | DesignProject | BIMProject` (D-18..D-22) — verified by `tsc --noEmit` accepting valid frontmatter and rejecting invalid"
    - "`lib/projects.ts` exports a server-only `getProjects(locale: 'fr' | 'en'): Promise<Project[]>` loader that reads `content/projects/{slug}.{locale}.mdx`, parses frontmatter via gray-matter, and validates each project's frontmatter against the discriminated union"
    - "`getProjects()` skips files starting with `_` (D-24) — verified by smoke test importing it and asserting slug list does not include `_template`"
    - "`content/projects/_template.fr.mdx` and `content/projects/_template.en.mdx` both exist (D-23) with full Tech-variant frontmatter (slug, title, year, category='tech', cover, summary, featured, stack[], optional repo, optional liveUrl)"
    - "`lib/palettes.ts` exports 5 typed `Palette` constants: terra, nordic, bauhaus, ocean, vaporwave (D-07, THEME-01 prep). Each palette has the same shape as the runtime `:root` vars: `{ id, name, bg, surface, text, textMuted, accent, secondary }`. Phase 2 will validate WCAG."
    - "`next.config.ts` is wrapped by both `createNextIntlPlugin` AND `createMDX` (composition matters — see ARCHITECTURE.md)"
    - "`mdx-components.tsx` at repo root exports `useMDXComponents` (required by @next/mdx for App Router)"
    - "All quality gates pass: `npm run lint`, `npx tsc --noEmit`, `npm run dev` boot"
  artifacts:
    - path: "lib/projects.ts"
      provides: "Discriminated Project type + getProjects(locale) loader"
      exports:
        - "Project"
        - "TechProject"
        - "DesignProject"
        - "BIMProject"
        - "getProjects"
        - "getProjectBySlug"
      contains_all:
        - "export type Project ="
        - "TechProject"
        - "DesignProject"
        - "BIMProject"
        - "category: 'tech'"
        - "category: 'design'"
        - "category: 'bim'"
        - "stack: string[]"
        - "tools: string[]"
        - "software: string[]"
        - "projectScale"
        - "getProjects"
        - "gray-matter"
        - "if (filename.startsWith('_'))"
    - path: "lib/palettes.ts"
      provides: "5 typed palette constants (Terra default + Nordic + Bauhaus + Ocean + Vaporwave secret)"
      exports:
        - "Palette"
        - "PaletteId"
        - "PALETTES"
        - "DEFAULT_PALETTE_ID"
      contains_all:
        - "export type Palette ="
        - "id: 'terra'"
        - "id: 'nordic'"
        - "id: 'bauhaus'"
        - "id: 'ocean'"
        - "id: 'vaporwave'"
        - "DEFAULT_PALETTE_ID"
    - path: "content/projects/_template.fr.mdx"
      provides: "FR-locale stub Tech project (D-23) — full discriminated frontmatter, ~2 paragraphs of plausible French copy"
    - path: "content/projects/_template.en.mdx"
      provides: "EN-locale stub Tech project (D-23) — full discriminated frontmatter, ~2 paragraphs of plausible English copy"
    - path: "mdx-components.tsx"
      provides: "Required @next/mdx entry point for App Router custom components"
      contains_all:
        - "useMDXComponents"
        - "MDXComponents"
    - path: "next.config.ts"
      provides: "Next config composed: createNextIntlPlugin + createMDX wrappers"
      contains_all:
        - "createNextIntlPlugin"
        - "createMDX"
        - "pageExtensions"
  key_links:
    - from: "Phase 5 (project pages)"
      to: "lib/projects.ts:getProjects(locale)"
      via: "import { getProjects } from '@/lib/projects'"
      pattern: "import.*getProjects.*from.*lib/projects"
    - from: "Phase 2 (ThemeProvider)"
      to: "lib/palettes.ts:PALETTES"
      via: "import { PALETTES, DEFAULT_PALETTE_ID } from '@/lib/palettes'"
      pattern: "PALETTES.*lib/palettes"
    - from: "lib/projects.ts:getProjects"
      to: "content/projects/{slug}.{locale}.mdx"
      via: "node:fs.readdirSync + gray-matter parse, with _template filtering (D-24)"
      pattern: "startsWith\\('_'\\)"
---

<objective>
Land the MDX content pipeline scaffold and the typed `Project` discriminated union so Phase 5 (project content pipeline) can drop in real MDX files without revisiting architecture:

1. Install the MDX stack: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `gray-matter`, `remark-gfm`, `rehype-pretty-code`. (PROJECT.md tech stack list.)
2. Compose `next.config.ts` with both `createNextIntlPlugin` (from plan 04) AND `createMDX` to enable `.mdx` page extensions and configure remark/rehype plugins.
3. Create `mdx-components.tsx` at repo root (required by `@next/mdx` for App Router — exports `useMDXComponents`).
4. Author `lib/projects.ts` with the **discriminated `Project = TechProject | DesignProject | BIMProject` union** per CONTEXT.md D-18..D-22, plus a server-only `getProjects(locale)` loader that uses `gray-matter` to parse frontmatter, validates the discriminator, and **skips files starting with `_`** (D-24).
5. Author the `_template.fr.mdx` + `_template.en.mdx` stub pair (D-23) — full Tech-variant frontmatter, 2-3 paragraphs of plausible copy, ready to copy-paste for Phase 5's real projects.
6. Author `lib/palettes.ts` with **5 typed `Palette` constants** (terra, nordic, bauhaus, ocean, vaporwave) per D-07 — Phase 2 will validate WCAG, but the typed constants live now so Phase 2 only wires UI to them.

Purpose: ARCH-08 is the last Phase 1 deliverable. With it complete, Phase 5 inherits a fully-typed loader + a working stub that proves the MDX pipeline end-to-end. Phase 2 inherits the canonical palette typed constants. No later phase has to revisit the Project type or palette shape.

Output: 6 source files (`next.config.ts` updated, `mdx-components.tsx`, `lib/projects.ts`, `lib/palettes.ts`, 2 MDX stubs), all compiling, lint-clean, and validated by a smoke test that imports `getProjects('fr')` and asserts the template slug is filtered.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundations/01-CONTEXT.md
@.planning/research/PITFALLS.md
@.planning/research/STACK.md
@.planning/research/ARCHITECTURE.md
@.planning/phases/01-foundations/01-01-SUMMARY.md
@.planning/phases/01-foundations/01-04-SUMMARY.md
@next.config.ts

<interfaces>
<!-- Authoritative discriminated Project union from CONTEXT.md D-18..D-22 -->
<!-- Executor implements this verbatim in lib/projects.ts -->

D-18 — Common fields (in every variant):
- `slug: string` (must match filename, e.g., `agora` for `agora.fr.mdx`)
- `title: string` (translated per locale)
- `year: number`
- `category: 'tech' | 'design' | 'bim'` (DISCRIMINANT — drives the union)
- `cover: string` (D-22: plain path relative to /public, e.g., '/projects/agora/cover.jpg')
- `summary: string` (1-3 sentences, translated)
- `featured: boolean` (allows pinning 2-3 projects in homepage)

D-19 — TechProject extends with:
- `stack: string[]` (required)
- `repo?: string` (optional GitHub URL)
- `liveUrl?: string` (optional deployed URL)

D-20 — DesignProject extends with:
- `tools: string[]` (required, e.g., ['Figma', 'Illustrator'])
- `client?: string` (optional)

D-21 — BIMProject extends with:
- `software: string[]` (required, e.g., ['Revit', 'ArchiCAD'])
- `projectScale: 'concept' | 'residential' | 'commercial' | 'urban'` (required strict enum)
- `location?: string` (optional)

The TypeScript shape:

```ts
type CommonFields = {
  slug: string;
  title: string;
  year: number;
  cover: string;
  summary: string;
  featured: boolean;
};

export type TechProject = CommonFields & {
  category: 'tech';
  stack: string[];
  repo?: string;
  liveUrl?: string;
};

export type DesignProject = CommonFields & {
  category: 'design';
  tools: string[];
  client?: string;
};

export type BIMProject = CommonFields & {
  category: 'bim';
  software: string[];
  projectScale: 'concept' | 'residential' | 'commercial' | 'urban';
  location?: string;
};

export type Project = TechProject | DesignProject | BIMProject;
```

This is a DISCRIMINATED UNION on `category`. Once you check `if (project.category === 'tech')`, TypeScript narrows to `TechProject` and you can access `project.stack` safely. This is what enables type-safe Tech/Design/BIM rendering in Phase 5.
</interfaces>

<palettes_data>
<!-- 5 palettes per D-07 + THEME-01. Phase 2 validates WCAG; here we just declare typed constants. -->
<!-- The exact OKLCh values for each palette are planner discretion (CONTEXT.md "Claude's Discretion"). -->
<!-- Terra MUST match the values authored in plan 02 (app/globals.css :root), since Terra is the cold-load default per D-06. -->

The shape (each palette is a `Palette`):
```ts
type Palette = {
  id: 'terra' | 'nordic' | 'bauhaus' | 'ocean' | 'vaporwave';
  name: string;  // Display name from messages/{locale}.json palette.presets — but for typed constants we use the literal D-07 names
  bg: string;        // OKLCh string, e.g. 'oklch(0.97 0.012 80)'
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  secondary: string;
};
```

Suggested values (planner discretion — Phase 2 will validateFullMatrix; refine then if needed):

- **Terra & Sage** (id: 'terra', warm/organic) — MUST match plan 02:
  - bg: oklch(0.97 0.012 80)
  - surface: oklch(0.94 0.018 75)
  - text: oklch(0.22 0.018 50)
  - textMuted: oklch(0.50 0.020 55)
  - accent: oklch(0.62 0.155 35)
  - secondary: oklch(0.55 0.075 145)

- **Atelier Nordique** (id: 'nordic', cool/minimal Scandinavian):
  - bg: oklch(0.98 0.004 240)
  - surface: oklch(0.95 0.006 240)
  - text: oklch(0.18 0.012 250)
  - textMuted: oklch(0.48 0.015 245)
  - accent: oklch(0.55 0.130 245)
  - secondary: oklch(0.60 0.060 200)

- **Bauhaus Bright** (id: 'bauhaus', primary-color geometric):
  - bg: oklch(0.97 0.005 90)
  - surface: oklch(1.00 0.000 0)
  - text: oklch(0.15 0.000 0)
  - textMuted: oklch(0.45 0.005 90)
  - accent: oklch(0.65 0.230 30)
  - secondary: oklch(0.70 0.180 250)

- **Ocean Studio** (id: 'ocean', deep blue + teal):
  - bg: oklch(0.96 0.012 220)
  - surface: oklch(0.93 0.018 215)
  - text: oklch(0.18 0.025 230)
  - textMuted: oklch(0.47 0.030 225)
  - accent: oklch(0.55 0.130 215)
  - secondary: oklch(0.62 0.095 180)

- **Vaporwave** (id: 'vaporwave', SECRET, dark base + neon — Phase 2 unlocks via Konami):
  - bg: oklch(0.20 0.040 290)
  - surface: oklch(0.26 0.055 285)
  - text: oklch(0.95 0.025 320)
  - textMuted: oklch(0.78 0.060 315)
  - accent: oklch(0.78 0.175 340)
  - secondary: oklch(0.80 0.150 200)

NOTE on Vaporwave WCAG: the dark bg + neon pink accent COMBINATION is likely to fail one or more WCAG pairs at strict 4.5:1. STATE.md flags this: "Vaporwave preset WCAG compliance — pre-validate in lib/palettes.ts with adjustForAA applied at definition time". HOWEVER, for Phase 1 we just store typed constants — Phase 2's `validateFullMatrix` + `adjustForAA` will refine these at runtime/at-import-time. Do NOT call validation in this plan. Just store the constants.
</palettes_data>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Install MDX stack + compose next.config.ts + create mdx-components.tsx</name>
  <files>package.json, next.config.ts, mdx-components.tsx</files>
  <read_first>
    - next.config.ts (from plan 04 — currently wrapped with createNextIntlPlugin only)
    - .planning/research/STACK.md §"Step 7 — MDX" (install command + pageExtensions + mdx-components.tsx requirement)
    - .planning/research/ARCHITECTURE.md §"Pattern 4: Locale-Suffix MDX Files" (overall MDX strategy)
  </read_first>
  <action>
    1. **Install MDX dependencies**:
       ```
       npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter remark-gfm rehype-pretty-code
       ```

       Verify in `package.json` dependencies (NOT devDependencies — these are runtime needed):
       - `@next/mdx@^16.x`
       - `@mdx-js/loader@^3.x`
       - `@mdx-js/react@^3.x`
       - `gray-matter@^4.x`
       - `remark-gfm@^4.x`
       - `rehype-pretty-code@^0.14.x`

       `@types/mdx` goes to devDependencies.

    2. **Compose `next.config.ts`** — current state (post-plan-04) is wrapped by `createNextIntlPlugin`. Add `createMDX` composition. Final file content:

       ```ts
       import type { NextConfig } from 'next';
       import createNextIntlPlugin from 'next-intl/plugin';
       import createMDX from '@next/mdx';
       import remarkGfm from 'remark-gfm';
       import rehypePrettyCode from 'rehype-pretty-code';

       const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

       const withMDX = createMDX({
         options: {
           remarkPlugins: [remarkGfm],
           rehypePlugins: [
             [rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }],
           ],
         },
       });

       const nextConfig: NextConfig = {
         pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
       };

       export default withNextIntl(withMDX(nextConfig));
       ```

       Composition order: `withNextIntl(withMDX(nextConfig))` — both wrappers compose; both must apply. Inner wrapper runs first, outer wraps. If both happen to mutate the same config keys, the outer wins; but in practice each plugin patches non-overlapping config so order doesn't change behavior.

       The `pageExtensions: ['ts', 'tsx', 'md', 'mdx']` adds MDX extensions to the list of files Next treats as pages. We won't put MDX files in `app/` (they live in `content/projects/`), but this is required by `@next/mdx` to register the loader.

       `rehypePrettyCode` uses GitHub theme by default; we use `github-dark-dimmed` for nice readability inside the cream Terra palette. `keepBackground: false` means the highlight respects the surrounding background (palette-aware code blocks in Phase 5).

       If `remark-gfm` or `rehype-pretty-code` cause TS issues due to ESM-only nature, the `next.config.ts` may need to be renamed to `next.config.mjs` OR use `.ts` with appropriate `--esm` handling. Next 16 supports TS configs natively, so .ts should work. If a peer warning emits, document it but proceed.

    3. **Create `mdx-components.tsx`** at repo root (REQUIRED by `@next/mdx` for App Router — without this file, MDX won't compile). Use this EXACT content:

       ```tsx
       import type { MDXComponents } from 'mdx/types';

       /**
        * Required entry point for @next/mdx in App Router.
        * Phase 5 will extend this with custom Image (zoom), CodeBlock, Callout components.
        * For Phase 1, this is the minimum scaffold — pass through built-in components.
        */
       export function useMDXComponents(components: MDXComponents): MDXComponents {
         return {
           ...components,
         };
       }
       ```

       Phase 5 (CONTENT-03) extends this with `Image` (zoom modal), `CodeBlock` (rehype-pretty-code wrapper), `Callout` (info/warning/note variants). For Phase 1, we just need the file to exist with a valid `useMDXComponents` export so Next 16's MDX loader doesn't error out.

    4. **Verify TS**: `npx tsc --noEmit` exits 0.

    5. **Verify lint**: `npm run lint` exits 0.

    6. **Verify build / dev boot**: `npm run dev` should boot without MDX-related errors. The pages already in app/ don't import MDX yet, so this is mostly a wiring check. Confirm Turbopack compiles cleanly.

    Do NOT create `content/projects/_template.*.mdx` yet — Task 2 handles those. Do NOT create `lib/projects.ts` or `lib/palettes.ts` — Task 3 handles those.
  </action>
  <verify>
    <automated>npx tsc --noEmit &amp;&amp; npm run lint &amp;&amp; node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); const req=['@next/mdx','@mdx-js/loader','@mdx-js/react','gray-matter','remark-gfm','rehype-pretty-code']; for(const d of req){if(!pkg.dependencies[d]){console.error('Missing dep:',d);process.exit(1);}} if(!pkg.devDependencies['@types/mdx']){console.error('Missing devDep @types/mdx');process.exit(2);} if(!fs.existsSync('mdx-components.tsx')){console.error('Missing mdx-components.tsx at repo root');process.exit(3);} const mdx=fs.readFileSync('mdx-components.tsx','utf8'); if(!/useMDXComponents/.test(mdx)||!/MDXComponents/.test(mdx)){console.error('mdx-components.tsx missing useMDXComponents export');process.exit(4);} const nc=fs.readFileSync('next.config.ts','utf8'); if(!/createMDX/.test(nc)){console.error('next.config.ts missing createMDX');process.exit(5);} if(!/createNextIntlPlugin/.test(nc)){console.error('next.config.ts lost createNextIntlPlugin from plan 04');process.exit(6);} if(!/pageExtensions/.test(nc)){console.error('next.config.ts missing pageExtensions for MDX');process.exit(7);} if(!/remarkGfm|remark-gfm/.test(nc)){console.error('next.config.ts missing remark-gfm');process.exit(8);} if(!/rehypePrettyCode|rehype-pretty-code/.test(nc)){console.error('next.config.ts missing rehype-pretty-code');process.exit(9);}"</automated>
  </verify>
  <acceptance_criteria>
    - File `package.json` dependencies includes `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `gray-matter`, `remark-gfm`, `rehype-pretty-code`
    - File `package.json` devDependencies includes `@types/mdx`
    - File `mdx-components.tsx` exists at REPO ROOT (NOT under `src/`, NOT under `app/`, NOT under `components/`)
    - File `mdx-components.tsx` exports a function named `useMDXComponents` taking and returning `MDXComponents` from `mdx/types`
    - File `next.config.ts` contains `createMDX` from `@next/mdx`
    - File `next.config.ts` STILL contains `createNextIntlPlugin` (composition preserved from plan 04)
    - File `next.config.ts` contains `pageExtensions: ['ts', 'tsx', 'md', 'mdx']` (or equivalent array)
    - File `next.config.ts` configures `remarkPlugins` with `remarkGfm` (or `remark-gfm`)
    - File `next.config.ts` configures `rehypePlugins` with `rehypePrettyCode` (or `rehype-pretty-code`)
    - File `next.config.ts` exports `withNextIntl(withMDX(nextConfig))` (composition order — both wrappers applied)
    - Command `npx tsc --noEmit` exits 0
    - Command `npm run lint` exits 0
    - Command `npm run dev` boots without MDX-related errors (verify via `curl -s http://localhost:3000/fr` still returns 200)
  </acceptance_criteria>
  <done>MDX stack is installed and composed in `next.config.ts` alongside next-intl. `mdx-components.tsx` exists at repo root with the minimal `useMDXComponents` export Phase 5 will extend. The build pipeline is ready to compile MDX files, but no MDX files exist yet — Tasks 2-3 deliver the stubs and the loader.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Author lib/projects.ts with discriminated Project union + getProjects loader</name>
  <files>lib/projects.ts</files>
  <read_first>
    - lib/utils.ts (from plan 03 — confirms lib/ is the right location for shared utilities)
    - .planning/phases/01-foundations/01-CONTEXT.md (D-18..D-22 for discriminated union; D-24 for `_*` filter; D-23 for stub validation)
    - .planning/research/ARCHITECTURE.md §"Pattern 4: Locale-Suffix MDX Files" + Frontmatter code example
    - .planning/research/PITFALLS.md §"Pitfall 8: MDX in App Router — frontmatter not typed" (typed frontmatter via TS, validation strategy)
  </read_first>
  <action>
    Create `lib/projects.ts` with this EXACT content (server-only — uses `node:fs` and `node:path`). Note this file will be imported by Server Components in Phase 5, so no `'use client'` directive — it is server-only by virtue of using Node APIs.

    ```ts
    /**
     * lib/projects.ts — Server-only MDX project loader + discriminated Project type.
     *
     * Discriminated union per CONTEXT.md D-18..D-22:
     *   - TechProject:   common + stack[] + repo? + liveUrl?
     *   - DesignProject: common + tools[] + client?
     *   - BIMProject:    common + software[] + projectScale + location?
     *
     * Loader contract:
     *   - Reads content/projects/{slug}.{locale}.mdx files
     *   - Parses frontmatter with gray-matter
     *   - Validates discriminator (category must be 'tech' | 'design' | 'bim')
     *   - Skips files starting with '_' (D-24 — _template stub stays in repo as reusable template)
     *
     * This file is imported by Server Components only (Phase 5 project pages).
     * It uses node:fs and is NOT safe to import from Client Components.
     */

    import { readFileSync, readdirSync, existsSync } from 'node:fs';
    import { join } from 'node:path';
    import matter from 'gray-matter';

    // ----- Discriminated Project union (D-18..D-22) -----

    type CommonFields = {
      slug: string;
      title: string;
      year: number;
      cover: string; // D-22: plain path relative to /public, e.g. '/projects/agora/cover.jpg'
      summary: string;
      featured: boolean;
    };

    export type TechProject = CommonFields & {
      category: 'tech';
      stack: string[];
      repo?: string;
      liveUrl?: string;
    };

    export type DesignProject = CommonFields & {
      category: 'design';
      tools: string[];
      client?: string;
    };

    export type BIMProject = CommonFields & {
      category: 'bim';
      software: string[];
      projectScale: 'concept' | 'residential' | 'commercial' | 'urban';
      location?: string;
    };

    export type Project = TechProject | DesignProject | BIMProject;

    export type Locale = 'fr' | 'en';

    // ----- Internal helpers -----

    const CONTENT_ROOT = join(process.cwd(), 'content', 'projects');

    function isStringArray(v: unknown): v is string[] {
      return Array.isArray(v) && v.every((x) => typeof x === 'string');
    }

    function isProjectScale(
      v: unknown,
    ): v is 'concept' | 'residential' | 'commercial' | 'urban' {
      return (
        typeof v === 'string' &&
        (v === 'concept' || v === 'residential' || v === 'commercial' || v === 'urban')
      );
    }

    /**
     * Runtime validator that narrows raw frontmatter data to the discriminated union.
     * Throws if a field is missing or has the wrong shape — fail loud at build time
     * rather than ship a broken project to production.
     */
    function validateFrontmatter(slug: string, data: Record<string, unknown>): Project {
      const common = {
        slug,
        title: typeof data.title === 'string' ? data.title : '',
        year: typeof data.year === 'number' ? data.year : 0,
        cover: typeof data.cover === 'string' ? data.cover : '',
        summary: typeof data.summary === 'string' ? data.summary : '',
        featured: typeof data.featured === 'boolean' ? data.featured : false,
      };

      if (!common.title || !common.year || !common.cover || !common.summary) {
        throw new Error(
          `[lib/projects] Invalid frontmatter for '${slug}': missing required common fields (title/year/cover/summary).`,
        );
      }

      const category = data.category;
      if (category === 'tech') {
        if (!isStringArray(data.stack)) {
          throw new Error(`[lib/projects] '${slug}' is a tech project but 'stack' is not a string array.`);
        }
        const project: TechProject = {
          ...common,
          category: 'tech',
          stack: data.stack,
          ...(typeof data.repo === 'string' ? { repo: data.repo } : {}),
          ...(typeof data.liveUrl === 'string' ? { liveUrl: data.liveUrl } : {}),
        };
        return project;
      }

      if (category === 'design') {
        if (!isStringArray(data.tools)) {
          throw new Error(`[lib/projects] '${slug}' is a design project but 'tools' is not a string array.`);
        }
        const project: DesignProject = {
          ...common,
          category: 'design',
          tools: data.tools,
          ...(typeof data.client === 'string' ? { client: data.client } : {}),
        };
        return project;
      }

      if (category === 'bim') {
        if (!isStringArray(data.software)) {
          throw new Error(`[lib/projects] '${slug}' is a BIM project but 'software' is not a string array.`);
        }
        if (!isProjectScale(data.projectScale)) {
          throw new Error(
            `[lib/projects] '${slug}' has invalid projectScale: expected one of 'concept' | 'residential' | 'commercial' | 'urban'.`,
          );
        }
        const project: BIMProject = {
          ...common,
          category: 'bim',
          software: data.software,
          projectScale: data.projectScale,
          ...(typeof data.location === 'string' ? { location: data.location } : {}),
        };
        return project;
      }

      throw new Error(
        `[lib/projects] '${slug}' has invalid category: expected 'tech' | 'design' | 'bim', got '${String(category)}'.`,
      );
    }

    /**
     * Returns all projects for a given locale.
     * Skips files whose name starts with '_' (D-24 — _template stub is reusable template, not a project).
     * Order is whatever readdirSync returns (locale-sorted at consumer level if needed).
     */
    export async function getProjects(locale: Locale): Promise<Project[]> {
      if (!existsSync(CONTENT_ROOT)) {
        return [];
      }
      const filenames = readdirSync(CONTENT_ROOT);
      const projects: Project[] = [];

      for (const filename of filenames) {
        if (filename.startsWith('_')) continue; // D-24
        if (!filename.endsWith(`.${locale}.mdx`)) continue;
        const slug = filename.replace(`.${locale}.mdx`, '');
        const raw = readFileSync(join(CONTENT_ROOT, filename), 'utf8');
        const { data } = matter(raw);
        const project = validateFrontmatter(slug, data as Record<string, unknown>);
        projects.push(project);
      }

      return projects;
    }

    /**
     * Returns a single project by slug+locale, or null if it does not exist.
     */
    export async function getProjectBySlug(
      slug: string,
      locale: Locale,
    ): Promise<Project | null> {
      if (slug.startsWith('_')) return null; // D-24 — templates not addressable
      const filename = `${slug}.${locale}.mdx`;
      const path = join(CONTENT_ROOT, filename);
      if (!existsSync(path)) return null;
      const raw = readFileSync(path, 'utf8');
      const { data } = matter(raw);
      return validateFrontmatter(slug, data as Record<string, unknown>);
    }

    /**
     * Returns the list of slugs available (locale-agnostic — derived from the .fr.mdx set).
     * Used by Phase 5's generateStaticParams to prerender locale × slug combos.
     */
    export async function getProjectSlugs(): Promise<string[]> {
      if (!existsSync(CONTENT_ROOT)) {
        return [];
      }
      return readdirSync(CONTENT_ROOT)
        .filter((f) => !f.startsWith('_') && f.endsWith('.fr.mdx'))
        .map((f) => f.replace('.fr.mdx', ''));
    }
    ```

    Key design choices:
    - **No zod dependency** — Phase 1 stays lean. The custom `validateFrontmatter` does runtime checks with TS guards. Phase 5 may revisit if frontmatter complexity grows; for now, plain TS suffices.
    - **`gray-matter` returns `data: { [key: string]: any }`** — we cast to `Record<string, unknown>` and validate each field. This is the right level of paranoia for build-time content validation.
    - **`async` signatures** — `getProjects` and `getProjectBySlug` are async even though `readFileSync` is sync. This is intentional: future-proofs the API for migration to async file IO without breaking call sites.
    - **`Locale` exported** — Phase 5 imports it via `import { Locale } from '@/lib/projects'`. Better than duplicating the type elsewhere.
    - **D-24 enforcement at TWO points** — both `getProjects` (skips files starting with `_`) AND `getProjectBySlug` (rejects slugs starting with `_`). Defense in depth.

    Verify:
    - `npx tsc --noEmit` exits 0
    - `npm run lint` exits 0
  </action>
  <verify>
    <automated>npx tsc --noEmit &amp;&amp; npm run lint &amp;&amp; node -e "const fs=require('fs'); const p='lib/projects.ts'; if(!fs.existsSync(p)){console.error('Missing:',p);process.exit(1);} const c=fs.readFileSync(p,'utf8'); const checks=[/export type Project\s*=\s*TechProject\s*\|\s*DesignProject\s*\|\s*BIMProject/,/export type TechProject\s*=/,/export type DesignProject\s*=/,/export type BIMProject\s*=/,/category:\s*'tech'/,/category:\s*'design'/,/category:\s*'bim'/,/stack:\s*string\[\]/,/tools:\s*string\[\]/,/software:\s*string\[\]/,/projectScale/,/'concept'/,/'residential'/,/'commercial'/,/'urban'/,/export async function getProjects/,/export async function getProjectBySlug/,/export async function getProjectSlugs/,/startsWith\('_'\)/,/import matter from 'gray-matter'/,/from 'node:fs'/,/from 'node:path'/]; for(let i=0;i&lt;checks.length;i++){if(!checks[i].test(c)){console.error('lib/projects.ts missing pattern',i,checks[i]);process.exit(2);}}"</automated>
  </verify>
  <acceptance_criteria>
    - File `lib/projects.ts` exists
    - File `lib/projects.ts` exports `Project` type as `TechProject | DesignProject | BIMProject`
    - File `lib/projects.ts` exports `TechProject` with literal `category: 'tech'` AND `stack: string[]`
    - File `lib/projects.ts` exports `DesignProject` with literal `category: 'design'` AND `tools: string[]`
    - File `lib/projects.ts` exports `BIMProject` with literal `category: 'bim'` AND `software: string[]` AND `projectScale` typed as `'concept' | 'residential' | 'commercial' | 'urban'`
    - File `lib/projects.ts` exports `getProjects(locale)` async function
    - File `lib/projects.ts` exports `getProjectBySlug(slug, locale)` async function
    - File `lib/projects.ts` exports `getProjectSlugs()` async function
    - File `lib/projects.ts` imports from `gray-matter`
    - File `lib/projects.ts` imports from `node:fs` and `node:path`
    - File `lib/projects.ts` contains `startsWith('_')` filter (D-24)
    - File `lib/projects.ts` does NOT contain the string `any` (TypeScript strict — Pitfall #2 of CLAUDE.md "no any")
    - File `lib/projects.ts` does NOT have `'use client'` directive (server-only by virtue of node:fs usage)
    - Command `npx tsc --noEmit` exits 0
    - Command `npm run lint` exits 0
  </acceptance_criteria>
  <done>`lib/projects.ts` exports the discriminated `Project = TechProject | DesignProject | BIMProject` union (D-18..D-22), plus three async loader functions (`getProjects`, `getProjectBySlug`, `getProjectSlugs`) that read `content/projects/*.{locale}.mdx`, parse frontmatter via gray-matter, validate the discriminator at runtime, and **skip files starting with `_`** (D-24). The file is fully typed, lint-clean, and contains zero `any`. Server-only — ready for Phase 5 consumption.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Author lib/palettes.ts (5 typed palettes) + _template.{fr,en}.mdx stubs</name>
  <files>lib/palettes.ts, content/projects/_template.fr.mdx, content/projects/_template.en.mdx</files>
  <read_first>
    - lib/projects.ts (just created — TechProject shape governs the stub's frontmatter)
    - app/globals.css (the Terra OKLCh values in `:root` MUST match the `terra` palette in lib/palettes.ts — they are the same canonical Terra constants)
    - .planning/phases/01-foundations/01-CONTEXT.md (D-07: 5 palettes from Phase 1; D-23: stub content; D-24: `_*` filter)
    - The `<palettes_data>` block above (authoritative OKLCh values for all 5 palettes)
  </read_first>
  <action>
    PART A — `lib/palettes.ts`:

    Create `lib/palettes.ts` with this EXACT content:

    ```ts
    /**
     * lib/palettes.ts — 5 typed palette constants (D-07).
     *
     * Terra is the cold-load default (D-06) — its OKLCh values MUST match the
     * :root declarations in app/globals.css authored by plan 02.
     *
     * Vaporwave is the SECRET palette — unlocked by Phase 2's Konami code listener.
     * It is included in PALETTES so Phase 2 can reference it via PALETTES.find(p => p.id === 'vaporwave'),
     * but it is NOT shown in the preset switcher UI (THEME-06: 4 visible presets).
     *
     * NOTE: Phase 2 will validate the full 7-pair WCAG matrix for each palette via
     * `validateFullMatrix` in lib/colors.ts. For palettes that fail (Vaporwave is the
     * likely candidate per STATE.md), Phase 2 applies `adjustForAA` at definition time.
     * Phase 1 only declares the typed constants.
     */

    export type PaletteId = 'terra' | 'nordic' | 'bauhaus' | 'ocean' | 'vaporwave';

    export type Palette = {
      id: PaletteId;
      name: string;
      bg: string;        // OKLCh CSS string, e.g. 'oklch(0.97 0.012 80)'
      surface: string;
      text: string;
      textMuted: string;
      accent: string;
      secondary: string;
    };

    export const DEFAULT_PALETTE_ID: PaletteId = 'terra'; // D-06: cold-load default

    export const PALETTES: ReadonlyArray<Palette> = [
      {
        id: 'terra',
        name: 'Terra & Sage',
        bg: 'oklch(0.97 0.012 80)',
        surface: 'oklch(0.94 0.018 75)',
        text: 'oklch(0.22 0.018 50)',
        textMuted: 'oklch(0.50 0.020 55)',
        accent: 'oklch(0.62 0.155 35)',
        secondary: 'oklch(0.55 0.075 145)',
      },
      {
        id: 'nordic',
        name: 'Atelier Nordique',
        bg: 'oklch(0.98 0.004 240)',
        surface: 'oklch(0.95 0.006 240)',
        text: 'oklch(0.18 0.012 250)',
        textMuted: 'oklch(0.48 0.015 245)',
        accent: 'oklch(0.55 0.130 245)',
        secondary: 'oklch(0.60 0.060 200)',
      },
      {
        id: 'bauhaus',
        name: 'Bauhaus Bright',
        bg: 'oklch(0.97 0.005 90)',
        surface: 'oklch(1.00 0.000 0)',
        text: 'oklch(0.15 0.000 0)',
        textMuted: 'oklch(0.45 0.005 90)',
        accent: 'oklch(0.65 0.230 30)',
        secondary: 'oklch(0.70 0.180 250)',
      },
      {
        id: 'ocean',
        name: 'Ocean Studio',
        bg: 'oklch(0.96 0.012 220)',
        surface: 'oklch(0.93 0.018 215)',
        text: 'oklch(0.18 0.025 230)',
        textMuted: 'oklch(0.47 0.030 225)',
        accent: 'oklch(0.55 0.130 215)',
        secondary: 'oklch(0.62 0.095 180)',
      },
      {
        id: 'vaporwave',
        name: '???', // Hidden in UI until Konami unlock (THEME-12)
        bg: 'oklch(0.20 0.040 290)',
        surface: 'oklch(0.26 0.055 285)',
        text: 'oklch(0.95 0.025 320)',
        textMuted: 'oklch(0.78 0.060 315)',
        accent: 'oklch(0.78 0.175 340)',
        secondary: 'oklch(0.80 0.150 200)',
      },
    ];

    /**
     * Lookup helper — returns the palette or the default if id is unknown.
     */
    export function getPaletteById(id: string | null | undefined): Palette {
      const found = PALETTES.find((p) => p.id === id);
      if (found) return found;
      const fallback = PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID);
      // PALETTES contains DEFAULT_PALETTE_ID by construction; the assertion is for TS narrowing.
      if (!fallback) {
        throw new Error('[lib/palettes] DEFAULT_PALETTE_ID is not present in PALETTES.');
      }
      return fallback;
    }
    ```

    Critical points:
    - Terra values MUST byte-match the `:root { --color-* }` values authored in plan 02 (`app/globals.css`). If `app/globals.css` differs (e.g., the executor of plan 02 used slightly different numbers), update plan 05's Terra to match — the two MUST be identical.
    - `PALETTES` is `ReadonlyArray<Palette>` — Phase 2's ThemeProvider should not mutate; it always returns a NEW Palette (e.g., a custom user one or harmonic-generated one) rather than editing the constants.
    - `getPaletteById` returns the default if lookup fails — Phase 2 uses this when reading `localStorage.getItem('palette-id')` returns a stale or unknown value.

    PART B — `content/projects/_template.fr.mdx`:

    Create `content/projects/_template.fr.mdx` with this EXACT content (D-23 — Tech variant, ~2 paragraphs of plausible French copy):

    ```mdx
    ---
    slug: _template
    title: Modèle de projet Tech
    year: 2025
    category: tech
    cover: /projects/_template/cover.jpg
    summary: Modèle réutilisable de fiche projet — duplique-le, renomme-le, remplis le contenu.
    featured: false
    stack:
      - Next.js
      - TypeScript
      - Tailwind CSS
      - Motion
    repo: https://github.com/tanguynoumea/portfolio-template
    liveUrl: https://example.com
    ---

    # Modèle de projet Tech

    Ceci est un fichier MDX d'exemple utilisé pour valider le pipeline de chargement
    de Phase 1. Il **n'apparaît pas dans la liste des projets** car son nom commence
    par un underscore (`_template.fr.mdx`), et `lib/projects.ts` filtre tous les
    fichiers `_*` (D-24).

    ## Comment utiliser ce modèle

    1. Dupliquez `_template.fr.mdx` et `_template.en.mdx` en `mon-projet.fr.mdx` et
       `mon-projet.en.mdx`.
    2. Adaptez `slug` (doit matcher le nom de fichier sans suffixe locale et `.mdx`).
    3. Ajustez `category` en `tech`, `design`, ou `bim` — chacun a son propre set
       de champs frontmatter discriminés (voir `lib/projects.ts`).
    4. Écrivez le contenu de l'étude de cas en MDX standard ; vous pouvez importer
       des composants React personnalisés (Phase 5 ajoutera `<Callout>`, `<CodeBlock>`,
       `<Image>` avec zoom).

    Le frontmatter ci-dessus exerce l'intégralité de la variante `TechProject` :
    champs communs + `stack[]` + `repo?` + `liveUrl?`. Si vous changez `category`
    pour `design` ou `bim`, vous devrez remplacer `stack/repo/liveUrl` par
    `tools/client?` ou `software/projectScale/location?`.
    ```

    PART C — `content/projects/_template.en.mdx`:

    Create `content/projects/_template.en.mdx` with this EXACT content (English mirror of the FR stub):

    ```mdx
    ---
    slug: _template
    title: Tech Project Template
    year: 2025
    category: tech
    cover: /projects/_template/cover.jpg
    summary: Reusable project case-study template — duplicate it, rename it, fill in the content.
    featured: false
    stack:
      - Next.js
      - TypeScript
      - Tailwind CSS
      - Motion
    repo: https://github.com/tanguynoumea/portfolio-template
    liveUrl: https://example.com
    ---

    # Tech Project Template

    This is an example MDX file used to validate the Phase 1 loader pipeline. It
    **does not appear in the project list** because its filename starts with an
    underscore (`_template.en.mdx`), and `lib/projects.ts` filters out all `_*`
    files (D-24).

    ## How to use this template

    1. Duplicate `_template.fr.mdx` and `_template.en.mdx` to `my-project.fr.mdx`
       and `my-project.en.mdx`.
    2. Adjust `slug` (must match the filename without the locale suffix and `.mdx`).
    3. Set `category` to `tech`, `design`, or `bim` — each has its own discriminated
       set of frontmatter fields (see `lib/projects.ts`).
    4. Write the case-study content in standard MDX; you can import custom React
       components (Phase 5 will add `<Callout>`, `<CodeBlock>`, `<Image>` with zoom).

    The frontmatter above exercises the full `TechProject` variant: common fields
    + `stack[]` + `repo?` + `liveUrl?`. If you change `category` to `design` or
    `bim`, you must replace `stack/repo/liveUrl` with `tools/client?` or
    `software/projectScale/location?`.
    ```

    PART D — Smoke test (post-write verification):

    After writing the 3 files, validate the loader works end-to-end:

    1. **Type-check**: `npx tsc --noEmit` exits 0.

    2. **Lint**: `npm run lint` exits 0.

    3. **Loader smoke test** — write a temporary throwaway script `verify-loader.mjs` at repo root:
       ```js
       import { getProjects, getProjectBySlug, getProjectSlugs } from './lib/projects.ts';

       const fr = await getProjects('fr');
       const en = await getProjects('en');
       const slugs = await getProjectSlugs();
       const template = await getProjectBySlug('_template', 'fr');

       const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1); } };

       assert(Array.isArray(fr), 'getProjects(fr) returned non-array');
       assert(Array.isArray(en), 'getProjects(en) returned non-array');
       assert(fr.every(p => !p.slug.startsWith('_')), 'D-24 violation: getProjects(fr) returned a _* slug');
       assert(en.every(p => !p.slug.startsWith('_')), 'D-24 violation: getProjects(en) returned a _* slug');
       assert(!slugs.includes('_template'), 'D-24 violation: getProjectSlugs returned _template');
       assert(template === null, 'D-24 violation: getProjectBySlug should refuse _* slugs');
       console.log('OK — D-24 enforcement verified. fr count:', fr.length, '/ en count:', en.length, '/ slugs:', slugs);
       ```

       Run with: `node --experimental-strip-types verify-loader.mjs` (Node 22+; if Node 20.x, use `npx tsx verify-loader.mjs` or compile via `npx tsc lib/projects.ts --outDir /tmp/projects-build && node verify-loader.mjs` adjusting the import).

       Expected output: `OK — D-24 enforcement verified. fr count: 0 / en count: 0 / slugs: []` (no projects in `content/projects/` besides the template, which is filtered).

       **Delete `verify-loader.mjs` after the test passes** — it is not a permanent artifact.

    4. **Dev boot check**: `npm run dev`; visit `/fr` and `/en`; both still render (Tasks 1-2 of plan 04 verified this; MDX wiring shouldn't break it).
  </action>
  <verify>
    <automated>npx tsc --noEmit &amp;&amp; npm run lint &amp;&amp; node -e "const fs=require('fs'); const required=['lib/palettes.ts','content/projects/_template.fr.mdx','content/projects/_template.en.mdx']; for(const f of required){if(!fs.existsSync(f)){console.error('Missing:',f);process.exit(1);}} const pal=fs.readFileSync('lib/palettes.ts','utf8'); const palChecks=[/export type PaletteId\s*=/,/'terra'/,/'nordic'/,/'bauhaus'/,/'ocean'/,/'vaporwave'/,/export const PALETTES/,/id:\s*'terra'/,/id:\s*'nordic'/,/id:\s*'bauhaus'/,/id:\s*'ocean'/,/id:\s*'vaporwave'/,/DEFAULT_PALETTE_ID/,/getPaletteById/]; for(let i=0;i&lt;palChecks.length;i++){if(!palChecks[i].test(pal)){console.error('lib/palettes.ts missing pattern',i,palChecks[i]);process.exit(2);}} const tplFr=fs.readFileSync('content/projects/_template.fr.mdx','utf8'); if(!/^---/.test(tplFr)){console.error('_template.fr.mdx missing frontmatter');process.exit(3);} if(!/category:\s*tech/.test(tplFr)){console.error('_template.fr.mdx missing category: tech');process.exit(4);} if(!/stack:/.test(tplFr)){console.error('_template.fr.mdx missing stack');process.exit(5);} const tplEn=fs.readFileSync('content/projects/_template.en.mdx','utf8'); if(!/^---/.test(tplEn)){console.error('_template.en.mdx missing frontmatter');process.exit(6);} if(!/category:\s*tech/.test(tplEn)){console.error('_template.en.mdx missing category: tech');process.exit(7);} const css=fs.readFileSync('app/globals.css','utf8'); const terraInCSS=css.match(/--color-bg:\s*oklch\(([^)]+)\)/); const terraInLib=pal.match(/id:\s*'terra'[\s\S]*?bg:\s*'oklch\(([^)]+)\)'/); if(terraInCSS&amp;&amp;terraInLib&amp;&amp;terraInCSS[1].trim()!==terraInLib[1].trim()){console.error('Terra mismatch! globals.css --color-bg='+terraInCSS[1]+' vs lib/palettes.ts terra.bg='+terraInLib[1]);process.exit(8);}"</automated>
  </verify>
  <acceptance_criteria>
    - File `lib/palettes.ts` exists
    - File `lib/palettes.ts` exports `PaletteId` type (union of 5 string literals)
    - File `lib/palettes.ts` exports `Palette` type with fields `id, name, bg, surface, text, textMuted, accent, secondary`
    - File `lib/palettes.ts` exports `PALETTES` as a `ReadonlyArray<Palette>` with exactly 5 entries
    - File `lib/palettes.ts` contains an entry with `id: 'terra'`
    - File `lib/palettes.ts` contains an entry with `id: 'nordic'`
    - File `lib/palettes.ts` contains an entry with `id: 'bauhaus'`
    - File `lib/palettes.ts` contains an entry with `id: 'ocean'`
    - File `lib/palettes.ts` contains an entry with `id: 'vaporwave'`
    - File `lib/palettes.ts` exports `DEFAULT_PALETTE_ID: PaletteId = 'terra'` (D-06)
    - File `lib/palettes.ts` exports `getPaletteById(id)` returning `Palette` (with fallback to default)
    - The `terra` palette in `lib/palettes.ts` has `bg` value matching the `--color-bg` OKLCh value in `app/globals.css` (Terra is canonical across both files)
    - File `content/projects/_template.fr.mdx` exists
    - File `content/projects/_template.fr.mdx` has YAML frontmatter starting with `---`
    - File `content/projects/_template.fr.mdx` contains `category: tech` in frontmatter
    - File `content/projects/_template.fr.mdx` contains `stack:` array in frontmatter (4+ entries)
    - File `content/projects/_template.fr.mdx` body has French text (at least 2 paragraphs)
    - File `content/projects/_template.en.mdx` exists
    - File `content/projects/_template.en.mdx` has YAML frontmatter starting with `---`
    - File `content/projects/_template.en.mdx` contains `category: tech`
    - File `content/projects/_template.en.mdx` contains `stack:` array
    - File `content/projects/_template.en.mdx` body has English text (at least 2 paragraphs)
    - Smoke test (documented in SUMMARY): a Node script importing `getProjects('fr')` returns `[]` AND `getProjectBySlug('_template', 'fr')` returns `null` — proving D-24 filter works in BOTH directions
    - Command `npx tsc --noEmit` exits 0
    - Command `npm run lint` exits 0
    - Command `npm run dev` boots cleanly and `/fr` + `/en` still render (no regression from MDX wiring)
  </acceptance_criteria>
  <done>`lib/palettes.ts` declares 5 typed palette constants — Phase 2's ThemeProvider, FAB switcher, and Konami listener consume them directly. The `terra` palette's OKLCh values match the canonical `:root` literals in `app/globals.css` (Terra default per D-06). `content/projects/_template.{fr,en}.mdx` exist with full Tech-variant frontmatter (D-23) and explanatory body copy. The D-24 filter (`startsWith('_')`) is enforced and verified — `getProjects()` returns `[]` even though MDX files exist, and `getProjectBySlug('_template', ...)` returns `null`. ARCH-08 is complete.</done>
</task>

</tasks>

<verification>
1. MDX stack installed: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `gray-matter`, `remark-gfm`, `rehype-pretty-code` in dependencies; `@types/mdx` in devDependencies
2. `next.config.ts` composes BOTH `createNextIntlPlugin('./i18n/request.ts')` AND `createMDX({ remarkPlugins, rehypePlugins })` — composition order: `withNextIntl(withMDX(nextConfig))`
3. `next.config.ts` includes `pageExtensions: ['ts', 'tsx', 'md', 'mdx']`
4. `mdx-components.tsx` at repo root exports `useMDXComponents` (required by @next/mdx)
5. `lib/projects.ts` exports `Project = TechProject | DesignProject | BIMProject` discriminated union (D-18..D-22)
6. `lib/projects.ts` exports `getProjects(locale)`, `getProjectBySlug(slug, locale)`, `getProjectSlugs()` async functions
7. `lib/projects.ts` skips files starting with `_` (D-24) — enforced at TWO points: filtering in `getProjects`/`getProjectSlugs` and rejecting in `getProjectBySlug`
8. `lib/projects.ts` contains zero occurrences of TypeScript `any` (CLAUDE.md constraint)
9. `lib/palettes.ts` exports `PALETTES: ReadonlyArray<Palette>` with 5 entries: terra, nordic, bauhaus, ocean, vaporwave
10. `lib/palettes.ts` exports `DEFAULT_PALETTE_ID = 'terra'` (D-06)
11. Terra's OKLCh values in `lib/palettes.ts` match `--color-bg/--color-surface/--color-text/--color-text-muted/--color-accent/--color-secondary` in `app/globals.css` (one canonical source of Terra)
12. `content/projects/_template.fr.mdx` and `content/projects/_template.en.mdx` exist, both with valid Tech-variant frontmatter (slug, title, year, category=tech, cover, summary, featured, stack[], repo, liveUrl) and 2+ paragraphs of body copy
13. Smoke test passes: `getProjects('fr')` returns `[]` (template filtered) AND `getProjectBySlug('_template', 'fr')` returns `null` (slug refused)
14. `npm run lint`, `npx tsc --noEmit`, `npm run dev` all exit 0 / boot cleanly
15. `/fr` and `/en` still render correctly (no regression from MDX wiring)
</verification>

<success_criteria>
ARCH-08 is complete: `lib/projects.ts` exposes a fully-typed discriminated union ready for Phase 5 to drop in real `.mdx` files and have them automatically picked up by the loader. The 5 typed palette constants in `lib/palettes.ts` are ready for Phase 2's ThemeProvider to consume. The `_template.{fr,en}.mdx` pair validates the full Tech-variant frontmatter shape AND proves the D-24 filter works (templates stay in the repo as reusable scaffolds but never leak into `getProjects()`'s output, so they will never appear in the homepage Projects grid or the sitemap). The full Phase 1 deliverable is now in place: a runnable Next 16 + Tailwind v4 OKLCh + shadcn (palette-aliased) + next-intl bilingual + MDX loader scaffold, ready for Phase 2 to start without re-litigating any architecture decision.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations/01-05-SUMMARY.md` documenting:
- Exact versions of `@next/mdx`, `gray-matter`, `remark-gfm`, `rehype-pretty-code` installed
- Smoke test outcome (the `getProjects('fr')` returns `[]` + `getProjectBySlug('_template', 'fr')` returns `null` — paste the actual console output)
- Confirmation that Terra OKLCh values in `lib/palettes.ts` match `app/globals.css` byte-for-byte (paste both blocks side-by-side)
- Whether `npm run build` (full production build) succeeds end-to-end — this is the strongest gate for Phase 1 because it exercises `generateStaticParams`, `setRequestLocale`, the MDX plugin chain, and shadcn token resolution all at once. If build fails, document the error and create a follow-up task before Phase 2 starts.
- Any deviations from the planned Vaporwave values (if Phase 1 executor identified obvious WCAG violations in advance and adjusted slightly — note that Phase 2 may further refine)
- Confirmation that `mdx-components.tsx` is at the repo ROOT (not nested in `app/`, `components/`, or `lib/`)
</output>
