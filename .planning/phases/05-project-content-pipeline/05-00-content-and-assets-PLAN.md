---
phase: 05-project-content-pipeline
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - lib/projects.ts
  - lib/projects.test.ts
  - scripts/check-mdx-structure.ts
  - content/projects/_template.fr.mdx
  - content/projects/_template.en.mdx
  - content/projects/agora.fr.mdx
  - content/projects/agora.en.mdx
  - content/projects/texture-manager.fr.mdx
  - content/projects/texture-manager.en.mdx
  - content/projects/brand-system.fr.mdx
  - content/projects/brand-system.en.mdx
  - content/projects/editorial-grid.fr.mdx
  - content/projects/editorial-grid.en.mdx
  - content/projects/residential-renovation.fr.mdx
  - content/projects/residential-renovation.en.mdx
  - content/projects/tower-concept.fr.mdx
  - content/projects/tower-concept.en.mdx
  - messages/fr.json
  - messages/en.json
  - public/projects/agora/1.jpg
  - public/projects/agora/2.jpg
  - public/projects/agora/3.jpg
  - public/projects/agora/4.jpg
  - public/projects/texture-manager/1.jpg
  - public/projects/texture-manager/2.jpg
  - public/projects/texture-manager/3.jpg
  - public/projects/texture-manager/4.jpg
  - public/projects/brand-system/1.jpg
  - public/projects/brand-system/2.jpg
  - public/projects/brand-system/3.jpg
  - public/projects/brand-system/4.jpg
  - public/projects/editorial-grid/1.jpg
  - public/projects/editorial-grid/2.jpg
  - public/projects/editorial-grid/3.jpg
  - public/projects/editorial-grid/4.jpg
  - public/projects/residential-renovation/1.jpg
  - public/projects/residential-renovation/2.jpg
  - public/projects/residential-renovation/3.jpg
  - public/projects/residential-renovation/4.jpg
  - public/projects/tower-concept/1.jpg
  - public/projects/tower-concept/2.jpg
  - public/projects/tower-concept/3.jpg
  - public/projects/tower-concept/4.jpg
autonomous: true
requirements: [CONTENT-01]

must_haves:
  truths:
    - "All 6 projects have .fr.mdx + .en.mdx bodies with 4 H2 case-study sections (Contexte/Défi/Processus/Résultat | Context/Challenge/Process/Outcome), 250-400 words/locale"
    - "The Project type accepts an optional gallery?: string[] field; all 12 existing stubs still validate (backward-compatible)"
    - "2 projects (texture-manager Tech + brand-system Design) have gallery populated in frontmatter; the other 4 omit it"
    - "projects.detail.* i18n namespace exists in both messages/fr.json and messages/en.json with FR/EN parity"
    - "24 placeholder gallery images exist at public/projects/{slug}/[1-4].jpg"
  artifacts:
    - path: "lib/projects.ts"
      provides: "CommonFields.gallery?: string[] + validator support"
      contains: "gallery"
    - path: "scripts/check-mdx-structure.ts"
      provides: "CONTENT-01 gate: asserts 4 H2 sections + 250-400 word count per MDX body"
      contains: "split"
    - path: "content/projects/texture-manager.fr.mdx"
      provides: "Enriched Tech case-study body with gallery frontmatter"
      contains: "## Contexte"
    - path: "messages/fr.json"
      provides: "projects.detail.* namespace"
      contains: "detail"
  key_links:
    - from: "lib/projects.ts validateFrontmatter"
      to: "data.gallery"
      via: "Array.isArray narrowing → keep or drop"
      pattern: "Array\\.isArray\\(data\\.gallery\\)"
    - from: "scripts/check-mdx-structure.ts"
      to: "content/projects/*.mdx"
      via: "gray-matter parse + H2 marker + word count assertions"
      pattern: "matter\\("
---

<objective>
Wave 0 — ship the content + type + i18n + asset foundation that unblocks the Wave 2 project page.

This plan: (1) extends the discriminated `Project` type with an optional `gallery?: string[]` field (D-14) plus a backward-compat unit test, (2) authors all 12 MDX case-study bodies per the D-01 4-heading structure (250-400 words/locale, plausible first-person placeholders — NOT lorem ipsum), (3) adds `gallery` frontmatter to 2 demo projects (texture-manager Tech + brand-system Design per D-03), (4) seeds 24 placeholder gallery images, (5) adds the `projects.detail.*` i18n namespace to both locales (parity-gated), (6) updates `_template.{fr,en}.mdx` to the case-study scaffold, and (7) ships `scripts/check-mdx-structure.ts` — the new CONTENT-01 gate that asserts 4 H2 sections + word count.

Purpose: Wave 2's `app/[locale]/projects/[slug]/page.tsx` cannot render MDX, show metadata, or gate the gallery section without these bodies, type field, i18n keys, and assets in place. This is the sequential blocker for plan 05-03.
Output: 12 enriched MDX files, extended `lib/projects.ts` + test, new `check-mdx-structure.ts` script, the `projects.detail.*` namespace (**22 leaf keys per locale** per RESEARCH §9: 7 top-level `detail` keys + `meta` 11 keys + `meta.scale` 4 keys = 44 additions across both files) in both messages files, 24 placeholder images, updated template.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-project-content-pipeline/05-CONTEXT.md
@.planning/phases/05-project-content-pipeline/05-RESEARCH.md
@.planning/phases/05-project-content-pipeline/05-VALIDATION.md

<interfaces>
<!-- Current Project type contract from lib/projects.ts (lines 25-54). Executor MUST extend CommonFields only — all 3 variants inherit. -->

```typescript
type CommonFields = {
  slug: string;
  title: string;
  year: number;
  cover: string;
  summary: string;
  featured: boolean;
  // gallery?: string[];  <-- ADD THIS (D-14)
};

export type TechProject = CommonFields & { category: 'tech'; stack: string[]; repo?: string; liveUrl?: string };
export type DesignProject = CommonFields & { category: 'design'; tools: string[]; client?: string };
export type BIMProject = CommonFields & { category: 'bim'; software: string[]; projectScale: 'concept'|'residential'|'commercial'|'urban'; location?: string };
export type Project = TechProject | DesignProject | BIMProject;
export type Locale = 'fr' | 'en';
```

Existing loaders (no signature changes — just the new field flows through): `getProjects(locale)`, `getProjectBySlug(slug, locale)`, `getProjectSlugs()`.

<!-- Project → category map (confirmed from existing frontmatter). The 6 slugs: -->
- agora → tech (has repo)
- texture-manager → tech (has repo) — GETS gallery
- brand-system → design (client: "Studio indépendant") — GETS gallery
- editorial-grid → design
- residential-renovation → bim (projectScale: residential, location: France)
- tower-concept → bim (projectScale: concept, location: France)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Extend Project type with optional gallery + backward-compat test</name>
  <files>lib/projects.ts, lib/projects.test.ts</files>
  <read_first>
    - lib/projects.ts (the file being modified — CommonFields at lines 25-32, validateFrontmatter at 78-150)
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #1 (the exact patch)
    - content/projects/agora.fr.mdx (an existing stub — must still validate after the change)
  </read_first>
  <behavior>
    - Test 1: validateFrontmatter accepts a Tech project WITHOUT gallery (existing stub shape) → returns project, gallery is undefined
    - Test 2: validateFrontmatter accepts a Tech project WITH gallery: ['/projects/x/1.jpg'] → returns project with gallery array preserved
    - Test 3: validateFrontmatter with gallery set to a non-array (e.g. 'foo') THROWS with a message mentioning 'gallery'
    - Test 4: getProjectBySlug('agora', 'fr') resolves to a project (real stub still validates — regression guard)
  </behavior>
  <action>
    In `lib/projects.ts`, add `gallery?: string[];` to the `CommonFields` type (after `featured: boolean;` on line 31), with a comment: `// NEW (D-14) — optional. Asset paths under /public/projects/{slug}/.`

    In `validateFrontmatter` (starts line 78), AFTER building the `common` object (currently lines 79-86) and BEFORE the `if (!common.title ...)` guard, insert the gallery validation per RESEARCH.md Code Example #1:

    ```typescript
    const galleryValid =
      data.gallery === undefined ||
      (Array.isArray(data.gallery) && data.gallery.every((s): s is string => typeof s === 'string'));
    if (!galleryValid) {
      throw new Error(
        `[lib/projects] '${slug}' has invalid 'gallery': expected string[] or undefined, got ${typeof data.gallery}.`,
      );
    }
    ```

    Then extend the `common` object literal to conditionally spread gallery (replace the closing of the `common` object so it ends with):
    ```typescript
      featured: typeof data.featured === 'boolean' ? data.featured : false,
      ...(Array.isArray(data.gallery) ? { gallery: data.gallery as string[] } : {}),
    };
    ```
    No `any` — use the `(s): s is string` predicate and the `as string[]` narrowing exactly as written. All 3 variant constructions (TechProject/DesignProject/BIMProject) already spread `...common`, so gallery flows through automatically — do NOT touch the per-variant blocks.

    Create `lib/projects.test.ts` with the 4 tests from `<behavior>`. Import `getProjectBySlug` from `./projects` for Test 4. For Tests 1-3, since `validateFrontmatter` is not exported, exercise it indirectly: write the 3 cases by calling `getProjectBySlug` on real fixtures is insufficient for the "with gallery" / "invalid gallery" cases — instead EXPORT `validateFrontmatter` from `lib/projects.ts` (add `export` keyword to the existing `function validateFrontmatter`) so the test can call it directly with synthetic `data` objects: `validateFrontmatter('x', { title: 'X', year: 2024, cover: '/c.jpg', summary: 's', featured: false, category: 'tech', stack: ['Next.js'] })`. Use native chai matchers (`expect(...).toBe`, `expect(() => ...).toThrow(/gallery/)`) — NOT jest-dom — matching the Phase 4 setupFiles:[] precedent.
  </action>
  <verify>
    <automated>npm test lib/projects</automated>
  </verify>
  <acceptance_criteria>
    - lib/projects.ts contains 'gallery?: string[]'
    - lib/projects.ts contains 'Array.isArray(data.gallery)'
    - lib/projects.ts contains 'export function validateFrontmatter'
    - lib/projects.test.ts contains 'toThrow' and references 'gallery'
    - `npm test lib/projects` exits 0
  </acceptance_criteria>
  <done>The Project type carries optional gallery; validator accepts-but-not-requires it; non-array gallery throws; all 12 existing stubs still validate; 4 tests green.</done>
</task>

<task type="auto">
  <name>Task 2: Author 12 MDX case-study bodies + gallery frontmatter + update template</name>
  <files>content/projects/agora.fr.mdx, content/projects/agora.en.mdx, content/projects/texture-manager.fr.mdx, content/projects/texture-manager.en.mdx, content/projects/brand-system.fr.mdx, content/projects/brand-system.en.mdx, content/projects/editorial-grid.fr.mdx, content/projects/editorial-grid.en.mdx, content/projects/residential-renovation.fr.mdx, content/projects/residential-renovation.en.mdx, content/projects/tower-concept.fr.mdx, content/projects/tower-concept.en.mdx, content/projects/_template.fr.mdx, content/projects/_template.en.mdx</files>
  <read_first>
    - content/projects/agora.fr.mdx + content/projects/agora.en.mdx (current stubs — PRESERVE existing frontmatter exactly, replace only the body below the frontmatter `---`)
    - content/projects/_template.fr.mdx (current template body to update)
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #10 (the verbatim agora.fr.mdx case-study template — copy its structure/tone)
    - .planning/phases/05-project-content-pipeline/05-CONTEXT.md D-01 (4-heading structure) + D-03 (which 2 projects get gallery)
    - All 5 other .fr.mdx files to read their existing frontmatter (category-specific fields you MUST NOT alter)
  </read_first>
  <action>
    For EACH of the 12 project MDX files, KEEP the existing frontmatter block verbatim (do not change slug/title/year/category/cover/summary/featured/stack/tools/software/projectScale/location/repo/client) and REPLACE everything below the closing `---` with a 4-H2-section case-study body per D-01:
    - FR files: `## Contexte` → `## Défi` → `## Processus` → `## Résultat`
    - EN files: `## Context` → `## Challenge` → `## Process` → `## Outcome`
    - Each body 250-400 words. First-person, plausible-but-swappable specifics (e.g. "chargé 50× plus vite", "déployé pour 200 utilisateurs", "3 semaines de modélisation économisées"). NOT lorem ipsum. The FR and EN versions must be faithful translations of each other (same narrative, same facts), so the word counts both land in 250-400.
    - In the `## Processus`/`## Process` section of AT LEAST 3 projects, embed one `<Callout variant="info" title="...">...</Callout>` and in at least 1 Tech project embed a fenced code block (use ```` ```ts ````, ```` ```glsl ````, or ```` ```bash ````) to exercise the Wave 1 CodeBlock/Callout components. Use the RESEARCH.md #10 agora example as the canonical model. Do NOT use the `<Image>` component inside bodies in this phase (gallery render covers the Image component path; inline body images would need real assets) — keep bodies text + optional Callout + optional code fence only.
    - Tailor each narrative to its domain: Tech projects (agora, texture-manager) talk code/architecture/performance; Design projects (brand-system, editorial-grid) talk visual systems/typography/grids/client work; BIM projects (residential-renovation, tower-concept) talk modeling/Revit/coordination/site constraints.

    Gallery frontmatter (D-03): ONLY for `texture-manager.{fr,en}.mdx` AND `brand-system.{fr,en}.mdx`, add this gallery array to the existing frontmatter (insert before the closing `---`):
    ```yaml
    gallery:
      - /projects/{slug}/1.jpg
      - /projects/{slug}/2.jpg
      - /projects/{slug}/3.jpg
      - /projects/{slug}/4.jpg
    ```
    (substitute `{slug}` with `texture-manager` or `brand-system`). The other 4 projects (agora, editorial-grid, residential-renovation, tower-concept) get NO gallery field — this validates the optional-field skip path.

    Update `content/projects/_template.fr.mdx` and `_template.en.mdx` bodies to use the SAME 4-heading scaffold (Contexte/Défi/Processus/Résultat | Context/Challenge/Process/Outcome) with one-line placeholder guidance under each heading (e.g. "Décrivez le contexte du projet ici (2-3 phrases)."). Keep the template frontmatter (slug `_template`, category tech) unchanged. Add a commented gallery example in the template frontmatter showing the optional field. The template body may be shorter than 250 words (it is excluded from the word-count gate — see Task 3 which skips `_*` files).
  </action>
  <verify>
    <automated>npx tsx scripts/check-mdx-structure.ts</automated>
  </verify>
  <acceptance_criteria>
    - All 6 FR project files contain '## Contexte' and '## Défi' and '## Processus' and '## Résultat'
    - All 6 EN project files contain '## Context' and '## Challenge' and '## Process' and '## Outcome'
    - content/projects/texture-manager.fr.mdx contains 'gallery:' and '/projects/texture-manager/1.jpg'
    - content/projects/brand-system.fr.mdx contains 'gallery:' and '/projects/brand-system/1.jpg'
    - content/projects/agora.fr.mdx does NOT contain 'gallery:'
    - At least one Tech file contains a fenced code block (grep for '```')
    - At least 3 files contain '<Callout variant='
    - `npx tsx scripts/check-mdx-structure.ts` exits 0 (depends on Task 3 script existing — run Task 3 first or in same wave)
  </acceptance_criteria>
  <done>12 MDX bodies enriched with the 4-section structure (250-400 words/locale), 2 projects carry gallery, 4 omit it, template updated, structure gate passes.</done>
</task>

<task type="auto">
  <name>Task 3: Create check-mdx-structure.ts gate + projects.detail i18n keys + 24 placeholder images</name>
  <files>scripts/check-mdx-structure.ts, messages/fr.json, messages/en.json, public/projects/agora/1.jpg, public/projects/agora/2.jpg, public/projects/agora/3.jpg, public/projects/agora/4.jpg, public/projects/texture-manager/1.jpg, public/projects/texture-manager/2.jpg, public/projects/texture-manager/3.jpg, public/projects/texture-manager/4.jpg, public/projects/brand-system/1.jpg, public/projects/brand-system/2.jpg, public/projects/brand-system/3.jpg, public/projects/brand-system/4.jpg, public/projects/editorial-grid/1.jpg, public/projects/editorial-grid/2.jpg, public/projects/editorial-grid/3.jpg, public/projects/editorial-grid/4.jpg, public/projects/residential-renovation/1.jpg, public/projects/residential-renovation/2.jpg, public/projects/residential-renovation/3.jpg, public/projects/residential-renovation/4.jpg, public/projects/tower-concept/1.jpg, public/projects/tower-concept/2.jpg, public/projects/tower-concept/3.jpg, public/projects/tower-concept/4.jpg</files>
  <read_first>
    - scripts/check-i18n-parity.ts (sibling script — copy its tsx/Node style, exit-code convention, and the way it walks messages files)
    - lib/projects.ts (for the `_` filter convention + gray-matter usage to mirror in the new script)
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #9 (the exact projects.detail.* JSON for both locales — 22 leaf keys/locale)
    - .planning/phases/05-project-content-pipeline/05-VALIDATION.md (Wave 0 Requirements — the script's exact assertions)
    - messages/fr.json + messages/en.json (existing structure — projects.detail.* is ADDITIVE; preserve all existing keys)
  </read_first>
  <action>
    Create `scripts/check-mdx-structure.ts` — a standalone tsx-runnable Node script (no Vitest) modeled on `scripts/check-i18n-parity.ts`. It MUST:
    - Read every file in `content/projects/` matching `*.{fr,en}.mdx`, SKIPPING files starting with `_` (mirror the D-24 filter from lib/projects.ts).
    - Parse each with `gray-matter` (already a dependency) to separate frontmatter from body.
    - For `.fr.mdx` files: assert the body contains all 4 markers `## Contexte`, `## Défi`, `## Processus`, `## Résultat`. For `.en.mdx`: assert `## Context`, `## Challenge`, `## Process`, `## Outcome`. (Use `body.includes('## Contexte')` etc.)
    - Word count: `const words = body.split(/\s+/).filter(Boolean).length;` assert `words >= 250 && words <= 400`. (Strip MDX component tags from the count is NOT required — count the raw body words; the 250-400 target already accounts for occasional Callout/code content.)
    - Collect ALL failures, print each as `❌ {file}: {reason}`, and `process.exit(1)` if any failure; else print `✅ N files OK` and `process.exit(0)`. No `any` — type the gray-matter result and the file list.

    Add the `projects.detail.*` namespace to BOTH `messages/fr.json` and `messages/en.json` per RESEARCH.md Code Example #9 (verbatim — the COMPLETE 22-leaf-key object, not a subset). The namespace has exactly 22 leaf keys per locale: 7 direct children of `detail` (back, prev, next, gallery, imageZoom, copy, copied) + an 11-key `meta` object (tech, design, bim, year, stack, tools, software, location, repo, live, client) + a 4-key `meta.scale` object (concept, residential, commercial, urban). FR values: back="Tous les projets", prev="Précédent", next="Suivant", gallery="Galerie", imageZoom="Zoomer l'image", copy="Copier", copied="Copié !", and a `meta` object with tech="Tech", design="Design", bim="BIM", year="Année", stack="Stack", tools="Outils", software="Logiciels", a nested `scale` object {concept:"Concept", residential:"Résidentiel", commercial:"Commercial", urban:"Urbain"}, location="Lieu", repo="Code", live="Voir en ligne", client="Client". EN values per the same example (back="All projects", prev="Previous", next="Next", gallery="Gallery", imageZoom="Zoom image", copy="Copy", copied="Copied!", meta {tech:"Tech", design:"Design", bim:"BIM", year:"Year", stack:"Stack", tools:"Tools", software:"Software", location:"Location", repo:"Source", live:"Live demo", client:"Client"}, meta.scale {concept:"Concept", residential:"Residential", commercial:"Commercial", urban:"Urban"}). The discriminator-label keys `meta.tech`/`meta.design`/`meta.bim` are consumed by 05-03 via `t(\`meta.${project.category}\`)` and the scale keys via `t(\`meta.scale.${project.projectScale}\`)` — they are NOT optional; if omitted, the project page renders raw key strings instead of category/scale labels (silent degradation that `check-i18n-parity.ts` cannot catch because both locales would be equally missing them). This namespace nests under the EXISTING top-level `projects` key — merge into it, do NOT create a duplicate `projects` key. Preserve every existing key in both files.

    Seed 24 placeholder gallery images: copy the existing `public/projects/agora/cover.jpg` to `public/projects/{slug}/[1-4].jpg` for all 6 slugs (agora, texture-manager, brand-system, editorial-grid, residential-renovation, tower-concept). Use a shell loop (Bash) or Node fs.copyFileSync. All 24 share the one source JPEG — visual repetition signals "swap before deploy". The 6 per-slug directories already exist (each has cover.jpg). Verify all 24 files exist after.
  </action>
  <verify>
    <automated>npx tsx scripts/check-mdx-structure.ts && npx tsx scripts/check-i18n-parity.ts</automated>
  </verify>
  <acceptance_criteria>
    - scripts/check-mdx-structure.ts contains 'matter(' and 'split(/\s+/)' and 'process.exit(1)'
    - scripts/check-mdx-structure.ts contains '## Contexte' and '## Context'
    - messages/fr.json contains '"detail"' and '"imageZoom": "Zoomer l\'image"' and '"residential": "Résidentiel"'
    - messages/en.json contains '"detail"' and '"live": "Live demo"'
    - DISCRIMINATOR-LABEL keys present in BOTH locales (consumed by 05-03 — assert each): messages/fr.json AND messages/en.json each contain '"tech":', '"design":', and '"bim":' under projects.detail.meta (grep: all three appear in each file)
    - SCALE sub-keys present in BOTH locales (representative bounds — assert lowest + highest): messages/fr.json AND messages/en.json each contain '"concept":' and '"urban":' under projects.detail.meta.scale
    - Leaf-key COUNT is 22 per locale and internally consistent with the objective: the `projects.detail` object resolves to exactly 22 leaf string values per locale (7 direct + 11 meta + 4 meta.scale). A quick parity-of-shape check: `node -e "const m=require('./messages/fr.json').projects.detail; const n=(o)=>Object.values(o).reduce((a,v)=>a+(typeof v==='object'?n(v):1),0); process.exit(n(m)===22?0:1)"` exits 0 (and the same against en.json exits 0)
    - 24 files exist matching public/projects/*/[1-4].jpg (verify: count = 24)
    - `npx tsx scripts/check-mdx-structure.ts` exits 0
    - `npx tsx scripts/check-i18n-parity.ts` exits 0 (FR/EN parity preserved after additions)
  </acceptance_criteria>
  <done>New CONTENT-01 structure gate passes on all 12 bodies; projects.detail.* keys present in both locales at parity (full 22-leaf-key object including meta.tech/design/bim + meta.scale.* discriminator labels); 24 placeholder gallery images seeded.</done>
</task>

</tasks>

<verification>
- `npm test lib/projects` exits 0 (gallery backward-compat)
- `npx tsx scripts/check-mdx-structure.ts` exits 0 (4 H2 sections + word count, all 12 bodies)
- `npx tsx scripts/check-i18n-parity.ts` exits 0 (projects.detail.* FR/EN parity)
- `npm run lint` clean
- 24 placeholder gallery images present
- Existing 222/222 test baseline still green (`npm test` — no regressions in lib/projects)
</verification>

<success_criteria>
CONTENT-01 satisfied: 6 projects × 2 locales = 12 MDX files with valid discriminated frontmatter AND enriched 4-section case-study bodies. Project type carries optional gallery. i18n + assets + structure-gate scaffolding all in place to unblock the Wave 2 project page (05-03).
</success_criteria>

<output>
After completion, create `.planning/phases/05-project-content-pipeline/05-00-SUMMARY.md`
</output>
</content>
</invoke>
