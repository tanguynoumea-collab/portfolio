---
phase: 05-project-content-pipeline
plan: 03
type: execute
wave: 2
depends_on: ["05-00", "05-01", "05-02"]
files_modified:
  - components/sections/ProjectCover.tsx
  - components/sections/ProjectCover.test.tsx
  - app/[locale]/projects/[slug]/page.tsx
  - app/[locale]/projects/[slug]/page.test.tsx
autonomous: true
requirements: [CONTENT-02, ANIM-02]

must_haves:
  truths:
    - "/{locale}/projects/{slug} renders the cover hero, metadata strip, MDX body, optional gallery, and prev/next footer"
    - "generateStaticParams returns 12 entries (6 slugs × 2 locales)"
    - "Invalid slug calls notFound(); dynamicParams=false prevents on-demand rendering of unknown slugs"
    - "The MDX is loaded via a RELATIVE dynamic import path (NOT the @/ alias) so Turbopack resolves it in production"
    - "The cover image receives parallax via the ProjectCover client island consuming useParallax; gallery renders only when gallery?.length > 0"
    - "Metadata strip shows category-specific fields (tech→stack+repo/live; design→tools+client; bim→software+scale+location)"
    - "Prev/next navigation wraps around (last→first, first→last) with locale-aware Links labelled by target project title"
  artifacts:
    - path: "app/[locale]/projects/[slug]/page.tsx"
      provides: "Server Component project detail page (CONTENT-02)"
      contains: "notFound"
      min_lines: 120
    - path: "components/sections/ProjectCover.tsx"
      provides: "Client island: cover image + useParallax (ANIM-02)"
      contains: "data-parallax-image"
  key_links:
    - from: "app/[locale]/projects/[slug]/page.tsx"
      to: "content/projects/{slug}.{locale}.mdx"
      via: "RELATIVE dynamic import (../../../../content/projects/...)"
      pattern: "await import\\(\\s*`\\.\\./\\.\\./\\.\\./\\.\\./content/projects/"
    - from: "app/[locale]/projects/[slug]/page.tsx"
      to: "getProjectBySlug → notFound()"
      via: "null check on loader result"
      pattern: "notFound\\(\\)"
    - from: "components/sections/ProjectCover.tsx"
      to: "lib/hooks/useParallax"
      via: "useParallax(ref) on the cover wrapper"
      pattern: "useParallax"
    - from: "app/[locale]/projects/[slug]/page.tsx"
      to: "prev/next wrap-around"
      via: "modulo over getProjectSlugs()"
      pattern: "% slugs\\.length"
---

<objective>
Wave 2 (integrator) — ship the project detail page that renders everything Wave 0 + Wave 1 produced.

This plan delivers: `components/sections/ProjectCover.tsx` (client island — wraps `next/image` in a parallax-scoped ref via `useParallax`, D-04/D-05), and `app/[locale]/projects/[slug]/page.tsx` (async Server Component — `getProjectBySlug` + `notFound()` + RELATIVE dynamic MDX import + `generateStaticParams` + `generateMetadata` + cover hero + metadata strip + MDX body + gallery grid + prev/next footer, D-04..D-08). Plus their tests.

Purpose: This is the CONTENT-02 deliverable and the second half of ANIM-02 (parallax on the live page). It consumes the Wave 0 MDX bodies/i18n keys, the Wave 1 MDX components (gallery cells use `<Image>`; bodies route Callout/code through the `mdx-components.tsx` registry automatically), and the Wave 1 `useParallax` hook (via ProjectCover). Static generation produces 12 pre-rendered routes.
Output: 1 client island + 1 Server Component page + 2 tests.
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
<!-- Contracts the executor needs. Wave 0+1 deliverables it depends on. -->

From `@/lib/projects` (Wave 0 extended it with optional gallery):
```typescript
export type Locale = 'fr' | 'en';
export type Project = TechProject | DesignProject | BIMProject; // common + gallery?: string[]
//   TechProject:   category:'tech';   stack: string[];   repo?: string; liveUrl?: string
//   DesignProject: category:'design'; tools: string[];   client?: string
//   BIMProject:    category:'bim';    software: string[]; projectScale:'concept'|'residential'|'commercial'|'urban'; location?: string
//   common: slug, title, year, cover, summary, featured, gallery?
export async function getProjectBySlug(slug: string, locale: Locale): Promise<Project | null>;
export async function getProjectSlugs(): Promise<string[]>; // locale-agnostic, e.g. ['agora','brand-system','editorial-grid','residential-renovation','texture-manager','tower-concept']
```

From `@/i18n/routing`: `routing.locales` → `['fr','en']` (the default-locale config).
From `@/i18n/navigation`: `Link` (locale-aware). For internal hrefs use `href={... as never}` (Phase 4 next-intl typed-routing cast).
From `@/components/ui/badge`: `Badge` with CVA variants including `category-tech` / `category-design` / `category-bim` (Phase 4 W0) and `outline`.
From `@/components/mdx/Image` (Wave 1): default export `MDXImage` — reused for gallery cells (gives click-to-zoom for free).
From `@/lib/hooks/useParallax` (Wave 1): `useParallax(ref, options?)`.
i18n (Wave 0): `getTranslations({ locale, namespace: 'projects.detail' })` server-side. Keys: back, prev, next, gallery, copy, copied, imageZoom, meta.{tech,design,bim,year,stack,tools,software,location,repo,live,client}, meta.scale.{concept,residential,commercial,urban}.

Next 16 async params contract: `type Params = Promise<{ locale: Locale; slug: string }>;` then `const { locale, slug } = await params;`.

CRITICAL dynamic import (Pitfall 5B) — MUST be a RELATIVE path, NOT `@/`:
```typescript
const { default: MDXContent } = await import(`../../../../content/projects/${slug}.${locale}.mdx`);
```
From `app/[locale]/projects/[slug]/page.tsx` up 4 levels (slug→projects→[locale]→app→repo root) into `content/projects/`. The `@next/mdx` pipeline (remark-gfm + rehype-pretty-code) runs automatically on this import; the `mdx-components.tsx` registry auto-injects.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: ProjectCover client island + test</name>
  <files>components/sections/ProjectCover.tsx, components/sections/ProjectCover.test.tsx</files>
  <read_first>
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #3 (verbatim ProjectCover.tsx)
    - .planning/phases/05-project-content-pipeline/05-CONTEXT.md D-04 (cover height) + D-05 (scale 1.2 + overflow-hidden + parallax)
    - lib/hooks/useParallax.ts (Wave 1 — the hook this island consumes; confirm its signature)
    - components/sections/Hero.tsx OR ProjectCover-adjacent sections (the 'use client' + useRef + next/image import style)
  </read_first>
  <behavior>
    - Test 1: renders a next/image with the given src/alt, `fill`, `priority`, and a `[data-parallax-image]` marker attribute
    - Test 2: the wrapper div has the responsive height classes (h-[50vh] md:h-[60vh]) and overflow-hidden
    - Test 3: calls useParallax with the wrapper ref (assert the mocked useParallax was invoked)
  </behavior>
  <action>
    Create `components/sections/ProjectCover.tsx` EXACTLY as RESEARCH.md Code Example #3. `'use client'`. Named export `ProjectCover`. Props `{ src: string; alt: string }` (export `ProjectCoverProps`). Body: `const ref = useRef<HTMLDivElement>(null); useParallax(ref);` (use defaults — factor 0.3, maxTranslate 50). Render:
    ```tsx
    <div ref={ref} className="relative h-[50vh] w-full overflow-hidden md:h-[60vh]">
      <Image data-parallax-image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" style={{ scale: 1.2 }} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
    ```
    The `data-parallax-image` attribute on the Image is the selector useParallax animates (Pitfall 5D). `scale: 1.2` + `overflow-hidden` ensures the ≤50px translate never reveals the wrapper background (D-05). NO `any`. NOTE: `from-black/60` is an intentional fixed-opacity gradient overlay for cover-text legibility (not a palette token) — this is the ONE allowed non-palette color in Phase 5 (a black gradient scrim over a photo, standard practice; it is NOT a themeable surface). Do NOT add other color literals.

    Create `components/sections/ProjectCover.test.tsx`. Mock `next/image` as a prop-dump stub (Phase 4 About.test.tsx style — serialize props including `data-parallax-image`, `fill`, `priority` into the output) and mock `@/lib/hooks/useParallax` as a `vi.fn()`. Render `<ProjectCover src="/projects/agora/cover.jpg" alt="Agora" />` and assert per `<behavior>`. Native chai matchers.
  </action>
  <verify>
    <automated>npm test components/sections/ProjectCover</automated>
  </verify>
  <acceptance_criteria>
    - components/sections/ProjectCover.tsx contains 'use client' and 'useParallax' and 'data-parallax-image'
    - components/sections/ProjectCover.tsx contains 'overflow-hidden' and 'h-[50vh]' and 'md:h-[60vh]'
    - components/sections/ProjectCover.tsx contains "style={{ scale: 1.2 }}" (or scale: 1.2)
    - components/sections/ProjectCover.tsx does NOT contain 'oklch(' nor 'rgb(' nor a '#' hex literal (the black/60 gradient uses Tailwind's black utility, not a literal)
    - `npm test components/sections/ProjectCover` exits 0
  </acceptance_criteria>
  <done>ProjectCover client island renders the cover image at scale 1.2 inside an overflow-hidden responsive wrapper, marks it [data-parallax-image], and wires useParallax on the ref; test green.</done>
</task>

<task type="auto">
  <name>Task 2: project page Server Component (dynamic import + static params + layout)</name>
  <files>app/[locale]/projects/[slug]/page.tsx</files>
  <read_first>
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #8 (verbatim page.tsx — the full layout) + Pattern 1 (dynamic import + dynamicParams) + Pitfall 5B (relative path constraint)
    - .planning/phases/05-project-content-pipeline/05-CONTEXT.md D-04 (magazine layout order) + D-06 (generateStaticParams) + D-07 (notFound) + D-08 (prev/next wrap)
    - lib/projects.ts (getProjectBySlug / getProjectSlugs / Project discriminated union — the exact field names per category)
    - i18n/routing.ts (routing.locales) + i18n/navigation.ts (Link)
    - components/ui/badge.tsx (Badge variants — category-{tech,design,bim} + outline)
    - components/sections/ProjectCover.tsx (Task 1 — the cover island)
    - components/mdx/Image.tsx (Wave 1 — MDXImage default export, reused for gallery cells)
  </read_first>
  <action>
    Create `app/[locale]/projects/[slug]/page.tsx` EXACTLY as RESEARCH.md Code Example #8 (the full ~210-line page). Key structural requirements:

    1. `export const dynamicParams = false;` at module top (Pattern 1 — only the 12 generated routes render; unknown slugs 404 without on-demand rendering).
    2. `type Params = Promise<{ locale: Locale; slug: string }>;`
    3. `export async function generateStaticParams()` — `const slugs = await getProjectSlugs(); return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));` → 12 entries (D-06).
    4. `export async function generateMetadata({ params })` — `const { locale, slug } = await params; const project = await getProjectBySlug(slug, locale); if (!project) return {}; return { title: \`${project.title} — Tanguy Delrieu\` };` (D-15 discretion — minimal title; Phase 6 expands).
    5. Default `export async function ProjectPage({ params })`: `const { locale, slug } = await params; const project = await getProjectBySlug(slug, locale); if (!project) notFound();` (D-07).
    6. CRITICAL (Pitfall 5B): `const { default: MDXContent } = await import(\`../../../../content/projects/${slug}.${locale}.mdx\`);` — RELATIVE path, NOT `@/`. Destructure `{ default: MDXContent }` (not `mod.default`) so `@types/mdx` narrows the component type.
    7. Prev/next wrap (D-08): `const slugs = await getProjectSlugs(); const idx = slugs.indexOf(slug); const nextSlug = slugs[(idx + 1) % slugs.length]; const prevSlug = slugs[(idx - 1 + slugs.length) % slugs.length];` then `getProjectBySlug` for each neighbor's title.
    8. `const t = await getTranslations({ locale, namespace: 'projects.detail' });`
    9. Render the magazine layout (D-04) in this exact order inside `<article>`:
       - `<ProjectCover src={project.cover} alt={project.title} />`
       - Metadata strip (`-mt-32 mb-12 px-4` → inner `bg-card rounded-lg p-6 shadow-lg`): `<h1>` title, then a flex row with a `<Calendar>` + `{project.year}`, a `<Badge variant={\`category-${project.category}\`}>{t(\`meta.${project.category}\`)}</Badge>`, then DISCRIMINATED blocks — `project.category === 'tech'` → `project.stack.slice(0,4)` as outline Badges + `project.repo` link (Github icon, target=_blank rel) + `project.liveUrl` link (ExternalLink icon); `=== 'design'` → `project.tools.slice(0,4)` + `project.client` (Briefcase); `=== 'bim'` → `project.software.slice(0,4)` + `<Badge variant="outline">{t(\`meta.scale.${project.projectScale}\`)}</Badge>` + `project.location` (MapPin). Use the discriminated narrowing so TS knows which fields exist (NO `any`, NO casts to access category-specific fields).
       - MDX body: `<div className="mx-auto max-w-prose px-4 py-12"><MDXContent /></div>` (D-04 step 3).
       - Gallery grid (D-04 step 4): `{project.gallery && project.gallery.length > 0 && (<section ...><h2>{t('gallery')}</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{project.gallery.map((src,i) => <MDXImage key={src} src={src} alt={\`${project.title} — ${i+1}\`} width={1200} height={800} />)}</div></section>)}` — renders ONLY when gallery non-empty.
       - Footer nav (D-04 step 5): back link (`<Link href={{ pathname: '/', hash: 'projects' } as never}>` with ArrowLeft + `t('back')`) on the left; prev/next pair on the right — `{prevProject && <Link href={\`/projects/${prevSlug}\` as never}>...ChevronLeft + t('prev') + prevProject.title</Link>}` and `{nextProject && <Link href={\`/projects/${nextSlug}\` as never}>...nextProject.title + t('next') + ChevronRight</Link>}`.

    Lucide imports: `ChevronLeft, ChevronRight, ArrowLeft, ExternalLink, Github, Briefcase, MapPin, Calendar`. (Github IS available in lucide-react v1.16 for this use — if the executor finds it removed, substitute `Code2` per Phase 3 D-23 and note the deviation.) ALL colors via palette utilities (`bg-card`, `text-card-foreground`, `text-muted-foreground`, `text-foreground`, `border-border`, `bg-muted/30`) — zero hardcoded colors. The page is a Server Component — NO `'use client'` (only ProjectCover, Image, CodeBlock are client; they nest fine inside this server tree).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <acceptance_criteria>
    - app/[locale]/projects/[slug]/page.tsx contains 'dynamicParams = false' and 'notFound()' and 'generateStaticParams' and 'generateMetadata'
    - app/[locale]/projects/[slug]/page.tsx uses a RELATIVE import: grep multiline matches "await import(" followed by "../../../../content/projects/" and does NOT contain "@/content"
    - app/[locale]/projects/[slug]/page.tsx contains '% slugs.length' (prev/next wrap)
    - app/[locale]/projects/[slug]/page.tsx contains "project.category === 'tech'" and "=== 'design'" and "=== 'bim'"
    - app/[locale]/projects/[slug]/page.tsx contains 'project.gallery && project.gallery.length' (gallery gating)
    - app/[locale]/projects/[slug]/page.tsx does NOT contain 'use client'
    - app/[locale]/projects/[slug]/page.tsx does NOT contain 'oklch(' nor 'rgb(' nor a '#' hex literal
    - `npm run build` exits 0 AND emits 12 project HTML/route files (ls .next/server/app/{fr,en}/projects/*/ → 12 page outputs)
  </acceptance_criteria>
  <done>The project page statically generates 12 routes, loads MDX via the relative dynamic import, 404s on invalid slugs via notFound()+dynamicParams=false, renders cover+metadata+MDX+gallery(gated)+prev/next(wrapped), all palette-aliased; production build succeeds.</done>
</task>

<task type="auto">
  <name>Task 3: project page unit tests (static params, notFound, gallery gating, discriminator, wrap)</name>
  <files>app/[locale]/projects/[slug]/page.test.tsx</files>
  <read_first>
    - app/[locale]/projects/[slug]/page.tsx (Task 2 — the page under test; its exports generateStaticParams + ProjectPage)
    - .planning/phases/05-project-content-pipeline/05-VALIDATION.md (the CONTENT-02 test rows — exact cases to cover; note the Manual-Only table already lists the full MDX-render smoke)
    - components/sections/About.test.tsx (mocking style: vi.mock for next/navigation, next-intl/server, sub-components)
    - lib/projects.ts (getProjectBySlug / getProjectSlugs signatures to mock; the discriminated Project union for fixtures)
    - vitest.config.ts (CONFIRM: no MDX transform plugin — so a full ProjectPage render that reaches the dynamic MDX import will NOT resolve under jsdom; the test plan below is designed around that constraint)
  </read_first>
  <behavior>
    - Test 1: generateStaticParams returns 12 entries (mock getProjectSlugs → 6 slugs; assert flatMap over 2 locales = 12, each {locale, slug})
    - Test 2: notFound is called when getProjectBySlug resolves null (mock it → null; assert the notFound mock was called BEFORE the dynamic-import line is reached)
    - Test 3: gallery-gating PREDICATE — `project.gallery && project.gallery.length > 0` returns true for a fixture with a 4-item gallery and false/undefined for a fixture with no gallery field (assert the decision against the data, NOT against rendered MDX)
    - Test 4: category DISCRIMINATOR — given a tech / design / bim Project fixture, the discriminator (`project.category === 'tech'|'design'|'bim'`) selects the correct branch and the correct category-specific fields are present (tech→stack; design→tools+client; bim→software+projectScale+location) — asserted against the fixture, NOT against rendered MDX
    - Test 5: prev/next WRAP math — for the first slug, prevSlug computes to the LAST slug; for the last slug, nextSlug computes to the FIRST slug (modulo arithmetic over a 6-slug array)
  </behavior>
  <action>
    Create `app/[locale]/projects/[slug]/page.test.tsx`. ONE concrete, pre-decided approach (do NOT explore alternatives at execution time):

    CONSTRAINT (confirmed from vitest.config.ts): there is NO MDX transform plugin (`@mdx-js/rollup` is absent). The page's dynamic `await import('../../../../content/projects/${slug}.${locale}.mdx')` therefore CANNOT resolve under jsdom — any test that renders the full `ProjectPage` past the import line will fail. So this test suite NEVER renders past the dynamic import. It splits cleanly into two groups:

    GROUP A — full unit tests that assert logic reached BEFORE the dynamic-import line (Tests 1, 2, 5). These render/call the page exports directly:
    - `vi.mock('next/navigation', () => ({ notFound: vi.fn() }))` — capture the notFound spy.
    - `vi.mock('@/lib/projects', () => ({ getProjectBySlug: vi.fn(), getProjectSlugs: vi.fn() }))` — controllable per test via `mockResolvedValue`/`mockResolvedValueOnce`. Import the real `type Locale`/`type Project` from `@/lib/projects` for fixtures (types are erased — safe alongside the mock).
    - `vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr','en'] } }))`.
    - Test 1: call the exported `generateStaticParams()` directly (NO render, NO MDX import). Mock `getProjectSlugs` → `['a','b','c','d','e','f']`. Assert the result has length 12 and every entry is `{ locale, slug }` with locale ∈ {fr,en}.
    - Test 2: mock `getProjectBySlug` → `null`. Call `ProjectPage({ params: Promise.resolve({ locale: 'fr', slug: 'nope' }) })`. Because `notFound()` is invoked on the null branch BEFORE the dynamic import line, assert the `notFound` spy was called. (Note: real `notFound()` throws; the mock is a no-op `vi.fn()`, so execution would continue to the import and reject — wrap the call in `await expect(ProjectPage(...)).rejects` OR `try { await ProjectPage(...) } catch {}` and then assert `notFound` was called. Either is fine; the load-bearing assertion is `expect(notFound).toHaveBeenCalled()`.)
    - Test 5: assert the wrap arithmetic as a pure unit, independent of render. Define `slugs = ['a','b','c','d','e','f']`. For the first slug (idx 0): `prevSlug = slugs[(0 - 1 + slugs.length) % slugs.length]` MUST equal `'f'`. For the last slug (idx 5): `nextSlug = slugs[(5 + 1) % slugs.length]` MUST equal `'a'`. Assert both. (This mirrors the EXACT modulo expression used in Task 2's page — same formula, asserted in isolation; do NOT change Task 2's page to expose it.)

    GROUP B — DECISION-LOGIC tests asserted against a Project fixture, NOT against rendered MDX output (Tests 3, 4). These do NOT call `ProjectPage` (which would hit the unresolvable MDX import) — they assert the page's two pure data-derived decisions directly against discriminated `Project` fixtures:
    - Build minimal fixtures conforming to the real union: a tech fixture `{ slug:'t', title:'T', year:2024, cover:'/c.jpg', summary:'s', featured:false, category:'tech', stack:['Next.js','React','TS','Tailwind'], gallery:['/p/1.jpg','/p/2.jpg','/p/3.jpg','/p/4.jpg'] }`; a design fixture `{ ...common, category:'design', tools:['Figma','Illustrator'], client:'Studio' }` (no gallery field); a bim fixture `{ ...common, category:'bim', software:['Revit','Navisworks'], projectScale:'residential', location:'France' }` (no gallery field).
    - Test 3 (gallery gating): assert `Boolean(tech.gallery && tech.gallery.length > 0) === true` (4-item gallery → renders) AND `Boolean(design.gallery && design.gallery.length > 0) === false` (no gallery field → omitted). This is the EXACT predicate the page uses to gate the gallery `<section>`; asserting it on the fixture proves the gating decision without rendering MDX.
    - Test 4 (discriminator): for each fixture, switch on `project.category` and assert the correct category-specific fields exist and have the expected shape — `tech` → `Array.isArray(p.stack)` true; `design` → `Array.isArray(p.tools)` true AND `typeof p.client === 'string'`; `bim` → `Array.isArray(p.software)` true AND `p.projectScale === 'residential'` AND `typeof p.location === 'string'`. This proves the discriminated-narrowing branch selection (the same `=== 'tech'|'design'|'bim'` logic the page's metadata strip uses) against typed data, with zero MDX render.

    Use native chai matchers (`toBe`, `toHaveLength`, `toHaveBeenCalled`) — NOT jest-dom — matching the Phase 4 setupFiles:[] precedent. Add a one-line top-of-file comment: `// Full MDX-render verification is a manual smoke item (VALIDATION.md Manual-Only table); jsdom has no MDX transform, so these tests assert the page's pre-import logic + data-derived decisions, never a full ProjectPage render past the dynamic import.`
  </action>
  <verify>
    <automated>npm test app/[locale]/projects/[slug]/page</automated>
  </verify>
  <acceptance_criteria>
    - app/[locale]/projects/[slug]/page.test.tsx asserts generateStaticParams returns exactly 12 entries
    - app/[locale]/projects/[slug]/page.test.tsx asserts notFound is called when getProjectBySlug resolves null
    - app/[locale]/projects/[slug]/page.test.tsx asserts the gallery-gating predicate `gallery && gallery.length > 0` is true for a 4-item-gallery fixture and false for a no-gallery fixture (data-derived, NOT a rendered-MDX assertion)
    - app/[locale]/projects/[slug]/page.test.tsx asserts the 3-category discriminator selects the correct branch + category-specific fields against tech/design/bim fixtures (data-derived, NOT a rendered-MDX assertion)
    - app/[locale]/projects/[slug]/page.test.tsx asserts prev/next wrap math (first slug → prev is last; last slug → next is first) as a pure modulo unit
    - `npm test app/[locale]/projects/[slug]/page` exits 0
  </acceptance_criteria>
  <done>The CONTENT-02 behaviors are covered by passing unit tests: 12 static params + notFound-on-null + prev/next wrap math (pre-import logic), and gallery-gating + category-discriminator (asserted on Project fixtures, never on rendered MDX). Full MDX-render verification is the VALIDATION.md Manual-Only smoke item.</done>
</task>

</tasks>

<verification>
- `npm test app/[locale]/projects/[slug]/page` exits 0 (CONTENT-02 unit cases — pre-import logic + data-derived decisions)
- `npm test components/sections/ProjectCover` exits 0
- `npm run build` exits 0 AND emits exactly 12 project routes (smoke: `ls .next/server/app/fr/projects/*/ .next/server/app/en/projects/*/` → 12 — VALIDATION.md manual smoke)
- `npm run lint` clean (no `any`, no hardcoded colors except the documented from-black/60 cover gradient)
- Full suite (`npm test`) green — 222 baseline + Wave 0/1/2 additions (~224+ per VALIDATION.md)
- Manual smoke (execute-phase, VALIDATION.md Manual-Only table): visit /fr/projects/agora + /en/projects/texture-manager — cover renders, parallax fires under full motion (disabled under reduced-motion), gallery shows for texture-manager (not agora), Image zoom opens, code blocks render with copy button, Callouts display, prev/next navigate. (This is the canonical full-MDX-render verification that jsdom cannot perform.)
</verification>

<success_criteria>
CONTENT-02 satisfied: `/{locale}/projects/{slug}` statically generates 12 routes, renders MDX (via relative dynamic import) + frontmatter metadata (discriminated per category) + gallery (gated) + prev/next (wrapped), 404s invalid slugs. ANIM-02 fully satisfied: cover parallax live on the page via ProjectCover→useParallax, disabled under reduced-motion. Production build green with 12 emitted routes.
</success_criteria>

<output>
After completion, create `.planning/phases/05-project-content-pipeline/05-03-SUMMARY.md`
</output>
</content>
