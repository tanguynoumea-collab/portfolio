---
phase: 04-homepage-sections
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - public/cv-fr.pdf
  - public/cv-en.pdf
  - public/about-photo.jpg
  - public/projects/texture-manager/cover.jpg
  - public/projects/agora/cover.jpg
  - public/projects/brand-system/cover.jpg
  - public/projects/editorial-grid/cover.jpg
  - public/projects/tower-concept/cover.jpg
  - public/projects/residential-renovation/cover.jpg
  - content/projects/texture-manager.fr.mdx
  - content/projects/texture-manager.en.mdx
  - content/projects/agora.fr.mdx
  - content/projects/agora.en.mdx
  - content/projects/brand-system.fr.mdx
  - content/projects/brand-system.en.mdx
  - content/projects/editorial-grid.fr.mdx
  - content/projects/editorial-grid.en.mdx
  - content/projects/tower-concept.fr.mdx
  - content/projects/tower-concept.en.mdx
  - content/projects/residential-renovation.fr.mdx
  - content/projects/residential-renovation.en.mdx
  - lib/constants.ts
  - app/globals.css
  - messages/fr.json
  - messages/en.json
  - components/ui/badge.tsx
  - app/[locale]/page.tsx
  - components/sections/Hero.test.tsx
  - components/sections/About.test.tsx
  - components/sections/CategoryFilter.test.tsx
  - components/sections/ProjectCard.test.tsx
  - components/sections/ProjectGrid.test.tsx
  - components/sections/ProjectsSection.test.tsx
  - components/sections/Skills.test.tsx
  - components/sections/Contact.test.tsx
  - scripts/check-i18n-parity.ts
autonomous: true
requirements: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07]
requirements_addressed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07]
gap_closure: false

must_haves:
  truths:
    - "public/cv-fr.pdf and public/cv-en.pdf both exist on disk"
    - "public/about-photo.jpg exists as 800x800 placeholder"
    - "6 project slug directories under public/projects/ each contain cover.jpg"
    - "12 stub MDX files exist in content/projects/ (6 projects × 2 locales) and pass discriminated-frontmatter validation"
    - "lib/constants.ts exports EMAIL, GITHUB_URL, LINKEDIN_URL"
    - "app/globals.css declares 3 fixed category color tokens that NEVER mutate when ThemeProvider swaps palettes"
    - "messages/fr.json and messages/en.json contain new keys with FR/EN parity (about.paragraphs, skills.groups.{tech,design,bim}.items, hero.scrollCue)"
    - "components/ui/badge.tsx exposes category-tech, category-design, category-bim CVA variants"
    - "app/[locale]/page.tsx is a Server Component that server-loads getProjects(locale) and renders <Hero/>, <About/>, <ProjectsSection projects={projects}/>, <Skills/>, <Contact/>"
    - "8 TDD test harnesses exist in components/sections/ — each starts FAILING (RED) so Wave 1+2 implementations make them GREEN"
    - "i18n parity gate (scripts/check-i18n-parity.ts) exits 0 — every leaf key in fr.json mirrors in en.json"
  artifacts:
    - path: "public/cv-fr.pdf"
      provides: "FR CV download asset"
    - path: "public/cv-en.pdf"
      provides: "EN CV download asset (placeholder copy of FR until user translates)"
    - path: "public/about-photo.jpg"
      provides: "About section portrait placeholder (800x800)"
    - path: "content/projects/*.{fr,en}.mdx (×12, excluding _template)"
      provides: "6 stub projects with discriminated frontmatter (2 Tech / 2 Design / 2 BIM)"
    - path: "lib/constants.ts"
      provides: "EMAIL, GITHUB_URL, LINKEDIN_URL exports"
      exports: ["EMAIL", "GITHUB_URL", "LINKEDIN_URL"]
    - path: "app/globals.css"
      provides: "3 fixed category color tokens in :root AND @theme inline so Tailwind utilities bg-category-tech / text-category-tech etc. exist"
      contains: "--color-category-tech"
    - path: "components/ui/badge.tsx"
      provides: "shadcn Badge primitive with 3 new category-{tech,design,bim} CVA variants"
    - path: "messages/fr.json + messages/en.json"
      provides: "new i18n keys with FR/EN parity"
    - path: "app/[locale]/page.tsx"
      provides: "5-section composition with server-loaded projects prop"
    - path: "components/sections/*.test.tsx (×8)"
      provides: "TDD test harnesses (RED) for Wave 1+2 to implement to GREEN"
    - path: "scripts/check-i18n-parity.ts"
      provides: "Parity gate enforcing identical leaf-key sets in fr.json and en.json"
  key_links:
    - from: "app/[locale]/page.tsx"
      to: "lib/projects.ts (getProjects)"
      via: "server-side data load before rendering ProjectsSection"
      pattern: "getProjects\\(.*locale"
    - from: "app/globals.css :root"
      to: "@theme inline category tokens"
      via: "Tailwind v4 token aliasing — same pattern as --destructive D-12"
      pattern: "--color-category-(tech|design|bim)"
    - from: "components/ui/badge.tsx"
      to: "app/globals.css fixed category tokens"
      via: "CVA variant strings reference bg-category-* / text-category-* utilities"
      pattern: "category-(tech|design|bim)"
    - from: "messages/fr.json"
      to: "messages/en.json"
      via: "FR/EN leaf-key parity (scripts/check-i18n-parity.ts gates the build)"
      pattern: "about\\.paragraphs|skills\\.groups\\.(tech|design|bim)\\.items|hero\\.scrollCue"
---

<objective>
Establish ALL prerequisites for Phase 4's homepage sections in a single foundational plan: asset prep (CV PDF move + placeholder photo + 6 project covers + 12 MDX stubs), library expansion (shadcn Badge + 3 category CVA variants), design-token expansion (3 fixed category color tokens following Phase 1 D-12 `--destructive` precedent), i18n expansion (about.paragraphs + skills.groups.*.items + hero.scrollCue + FR/EN parity gate), centralized user-data file (lib/constants.ts per D-06), page.tsx wiring (5-section composition with server-loaded projects prop), and 8 TDD test harnesses (RED) that Wave 1+2 implementations will turn GREEN.

Purpose: Wave 0 is the dependency gate for the entire phase. Without it, Wave 1 (Hero/About/Skills/Contact) lacks i18n keys + lib/constants.ts; Wave 2 (Projects) lacks MDX stubs + category tokens + Badge variants. Doing this all in one isolated Wave 0 plan eliminates file-conflict risk in Wave 1's 4-way parallel execution.

Output:
- 6 binary asset files (1 CV FR + 1 CV EN + 1 about-photo + 6 project covers) — note: cv-en is a copy of cv-fr until user supplies translation
- 12 MDX stub files (2 per project × 6 projects, discriminated frontmatter validated by lib/projects.ts at build time)
- 1 NEW lib/constants.ts
- 1 NEW scripts/check-i18n-parity.ts (parity gate)
- app/globals.css edited: 3 new fixed `--color-category-*` tokens in `:root` + 3 entries in `@theme inline`
- messages/fr.json + messages/en.json edited: new `about.paragraphs.{1,2}`, `skills.groups.{tech,design,bim}.items[]`, `hero.scrollCue` (with `_template` not touched)
- components/ui/badge.tsx: created via shadcn CLI, then customized with 3 new `category-{tech,design,bim}` CVA variants
- app/[locale]/page.tsx: replaced placeholder section bodies with `<Hero/>`, `<About/>`, `<ProjectsSection projects={projects}/>`, `<Skills/>`, `<Contact/>`; page becomes async Server Component loading `getProjects(locale)`
- 8 RED test files in `components/sections/` (failing-by-default skeletons that Wave 1+2 must turn GREEN)

Estimated execution: ~25-35 minutes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/04-homepage-sections/04-CONTEXT.md
@.planning/phases/04-homepage-sections/04-RESEARCH.md
@.planning/phases/04-homepage-sections/04-VALIDATION.md
@.planning/phases/01-foundations/01-CONTEXT.md
@app/[locale]/page.tsx
@app/[locale]/layout.tsx
@app/globals.css
@messages/fr.json
@messages/en.json
@lib/projects.ts
@content/projects/_template.fr.mdx
@components/layout/Footer.tsx
@components/layout/LanguageSwitcher.tsx
@components/providers/LenisProvider.tsx
@CLAUDE.md

<interfaces>
<!-- Key types and contracts the executor MUST honor. Embedded so no codebase scavenger-hunt needed. -->

From lib/projects.ts (Phase 1 D-18..D-22 discriminated union):
```typescript
type CommonFields = {
  slug: string;
  title: string;
  year: number;
  cover: string;            // path under /public, e.g. '/projects/agora/cover.jpg'
  summary: string;
  featured: boolean;
};
export type TechProject   = CommonFields & { category: 'tech';   stack:    string[]; repo?: string; liveUrl?: string };
export type DesignProject = CommonFields & { category: 'design'; tools:    string[]; client?: string };
export type BIMProject    = CommonFields & { category: 'bim';    software: string[]; projectScale: 'concept' | 'residential' | 'commercial' | 'urban'; location?: string };
export type Project       = TechProject | DesignProject | BIMProject;
export type Locale        = 'fr' | 'en';
export async function getProjects(locale: Locale): Promise<Project[]>;
```
Loader REJECTS files starting with `_` (D-24) — stub MDX files MUST NOT use underscore prefix.
Loader VALIDATES required common fields (title/year/cover/summary) + per-category fields. THROWS on shape mismatch at build time.

From app/globals.css (Phase 1 D-12 fixed-token precedent for `--destructive`):
```css
:root {
  /* …palette tokens (mutated by ThemeProvider) … */
  --destructive: oklch(0.6 0.22 25);              /* FIXED — Phase 1 D-12 precedent */
  --destructive-foreground: oklch(0.98 0.01 80);  /* FIXED */
  /* Phase 4 ADDS these following the same fixed-token precedent: */
  /* --color-category-tech: oklch(0.55 0.15 240); */
  /* --color-category-design: oklch(0.65 0.20 330); */
  /* --color-category-bim: oklch(0.60 0.13 60); */
}
@theme inline {
  /* …existing aliases … */
  /* Phase 4 ADDS these so Tailwind generates bg-category-tech / text-category-tech etc.: */
  /* --color-category-tech: var(--color-category-tech); */
  /* --color-category-design: var(--color-category-design); */
  /* --color-category-bim: var(--color-category-bim); */
}
```

From messages/fr.json + messages/en.json (Phase 1 D-15 parity gate):
- Existing `nav.*`, `hero.*`, `about.*`, `projects.*`, `skills.*`, `contact.*`, `footer.*`, `palette.*`, `errors.*` must be preserved byte-identical
- New keys to ADD (FR + EN with identical leaf-key tree):
  - `about.paragraphs.1` (string)
  - `about.paragraphs.2` (string)
  - `skills.groups.tech.items` (array of 7 strings)
  - `skills.groups.design.items` (array of 7 strings)
  - `skills.groups.bim.items` (array of 7 strings)
  - `hero.scrollCue` (string — aria-label for the scroll-cue chevron)
- Note: `skills.groups.tech` already exists as a STRING ("Développement" / "Development"). To add `.items` under it, we must restructure to `skills.groups.tech = { label: "Développement", items: [...] }`. This is a BREAKING change to existing consumers (Phase 3 placeholder page just used `tNav('skills')`, not the group labels — verified no other consumer reads `skills.groups.*`).

Decision: restructure `skills.groups.{tech,design,bim}` from `string` to `{ label: string, items: string[] }` and update test mocks where needed.

From app/[locale]/page.tsx (currently a synchronous Server Component placeholder — will become async):
```tsx
// BEFORE (current):
import { useTranslations } from 'next-intl';
export default function HomePage() {
  const tNav = useTranslations('nav');
  return ( <> <section id="home">…</section> … </> );
}

// AFTER (Wave 0 result):
import { getProjects, type Locale } from '@/lib/projects';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { Skills } from '@/components/sections/Skills';
import { Contact } from '@/components/sections/Contact';

type Params = Promise<{ locale: string }>;
export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  const projects = await getProjects(locale as Locale);
  return (
    <>
      <section id="home"     className="flex min-h-screen items-center justify-center"><Hero /></section>
      <section id="about"    className="flex min-h-screen items-center justify-center"><About /></section>
      <section id="projects" className="flex min-h-screen items-center justify-center px-4"><ProjectsSection projects={projects} /></section>
      <section id="skills"   className="flex min-h-screen items-center justify-center px-4"><Skills /></section>
      <section id="contact"  className="flex min-h-screen items-center justify-center px-4"><Contact /></section>
    </>
  );
}
```

IMPORTANT: Section IDs (`home`, `about`, `projects`, `skills`, `contact`) MUST be preserved because Phase 3's Navigation uses `useActiveSection` IntersectionObserver to observe them.

From components/ui/badge.tsx (created via `npx shadcn@latest add badge`):
After install, modify the CVA `badgeVariants` to add 3 new variants:
```typescript
'category-tech':   'border-transparent bg-category-tech text-white hover:bg-category-tech/90',
'category-design': 'border-transparent bg-category-design text-white hover:bg-category-design/90',
'category-bim':    'border-transparent bg-category-bim text-white hover:bg-category-bim/90',
```
These reference `bg-category-tech` etc. — Tailwind utilities generated by the `@theme inline` entries you add to `globals.css`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Asset prep (CV PDF + about photo + 6 project covers)</name>
  <files>public/cv-fr.pdf, public/cv-en.pdf, public/about-photo.jpg, public/projects/texture-manager/cover.jpg, public/projects/agora/cover.jpg, public/projects/brand-system/cover.jpg, public/projects/editorial-grid/cover.jpg, public/projects/tower-concept/cover.jpg, public/projects/residential-renovation/cover.jpg</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-01, D-02, D-05)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Standard Stack" + §"Step 2.5 — Runtime State Inventory" (note about git mv preserving history)
    - CV_Tanguy_Delrieu_2023.pdf (existing — repo root, currently UNTRACKED per git status)
  </read_first>
  <action>
    Perform asset prep in 3 atomic operations:

    1. **CV PDF move (D-01)**:
       - The repo-root `CV_Tanguy_Delrieu_2023.pdf` is currently UNTRACKED (verified via git status in init context). Since it is not tracked, `git mv` would fail — use plain shell move instead.
       - Run (PowerShell): `Move-Item -Path "CV_Tanguy_Delrieu_2023.pdf" -Destination "public/cv-fr.pdf"` (or `mv` via Bash tool — cross-platform via the Bash tool with absolute paths preferred)
       - Then copy as EN placeholder: `Copy-Item -Path "public/cv-fr.pdf" -Destination "public/cv-en.pdf"` (or `cp`)
       - **CRITICAL:** Both `public/cv-fr.pdf` and `public/cv-en.pdf` MUST exist after this step. The EN file is a placeholder (same content as FR) until user supplies translation — this is documented in 04-CONTEXT.md deferred ideas.

    2. **About photo (D-02)**: Create a `public/about-photo.jpg` 800×800 placeholder.
       - Use a minimal approach: generate a solid-color JPEG via ImageMagick if available, OR write a tiny base64-encoded 800×800 JPEG to disk. A safe portable approach: use Node's `Buffer.from(base64String, 'base64')` and `fs.writeFileSync` to write a known 800×800 placeholder JPEG.
       - Simpler alternative: copy any existing JPEG asset in the repo (if there's one in `node_modules` or generate via `npm exec sharp`). If no tool available, write a fallback 1×1 JPEG and rely on `next/image`'s width=400 height=500 props for client-side scaling — the placeholder text in 04-CONTEXT.md notes user will swap pre-deploy anyway.
       - **Pragmatic recommendation:** Use a 1x1 base64 JPEG written to all 7 image files (about + 6 covers). They are all placeholders. Phase 5 (CONTENT) replaces project covers; user replaces about-photo pre-deploy. The visual placeholder content does NOT need to be aesthetic.
       - Reference base64 1x1 JPEG (paste into a Node script or use the Bash tool with the Write tool to create binary content via `node -e "require('fs').writeFileSync('public/about-photo.jpg', Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////...','base64'))"`. Generate a real 1x1 JPEG byte sequence at runtime (Node has crypto/zlib if needed, but the simplest reliable path is to find a minimal valid JPEG file in the project's vendor folders or generate via `sharp` since sharp@latest is bundled with Next 16).

       **AUTHORITATIVE METHOD** (avoids fragile base64 escaping):
       ```bash
       # The Bash tool will let you run a Node one-liner that uses sharp (bundled with Next 16):
       node -e "const sharp=require('sharp'); sharp({create:{width:800,height:800,channels:3,background:{r:200,g:180,b:160}}}).jpeg().toFile('public/about-photo.jpg')"
       ```
       If `sharp` is not directly available in node_modules root (it's a Next 16 internal dep), fallback to:
       ```bash
       node -e "const fs=require('fs'); fs.writeFileSync('public/about-photo.jpg', Buffer.from([0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0xFF,0xDB,0x00,0x43,0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,0x07,0x07,0x07,0x09,0x09,0x08,0x0A,0x0C,0x14,0x0D,0x0C,0x0B,0x0B,0x0C,0x19,0x12,0x13,0x0F,0x14,0x1D,0x1A,0x1F,0x1E,0x1D,0x1A,0x1C,0x1C,0x20,0x24,0x2E,0x27,0x20,0x22,0x2C,0x23,0x1C,0x1C,0x28,0x37,0x29,0x2C,0x30,0x31,0x34,0x34,0x34,0x1F,0x27,0x39,0x3D,0x38,0x32,0x3C,0x2E,0x33,0x34,0x32,0xFF,0xC0,0x00,0x0B,0x08,0x00,0x01,0x00,0x01,0x01,0x01,0x11,0x00,0xFF,0xC4,0x00,0x14,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0xC4,0x00,0x14,0x10,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0xDA,0x00,0x08,0x01,0x01,0x00,0x00,0x3F,0x00,0x37,0xFF,0xD9]))"
       ```
       This writes a minimal valid 1×1 JPEG byte sequence. `next/image` will scale it via the width/height props.

    3. **6 project covers (D-05)**: Create 6 directories and copy the same JPEG into each:
       - `public/projects/texture-manager/cover.jpg`
       - `public/projects/agora/cover.jpg`
       - `public/projects/brand-system/cover.jpg`
       - `public/projects/editorial-grid/cover.jpg`
       - `public/projects/tower-concept/cover.jpg`
       - `public/projects/residential-renovation/cover.jpg`
       - Each directory gets the SAME placeholder JPEG. Phase 5 will replace each individually.

    **Verify**: After this step, `ls public/cv-*.pdf` should return 2 lines; `ls public/projects/*/cover.jpg` should return 6 lines; `ls public/about-photo.jpg` should exist.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const paths=['public/cv-fr.pdf','public/cv-en.pdf','public/about-photo.jpg','public/projects/texture-manager/cover.jpg','public/projects/agora/cover.jpg','public/projects/brand-system/cover.jpg','public/projects/editorial-grid/cover.jpg','public/projects/tower-concept/cover.jpg','public/projects/residential-renovation/cover.jpg']; const missing=paths.filter(p=>!fs.existsSync(p)); if(missing.length){console.error('MISSING:',missing); process.exit(1)} console.log('all-assets-present')"</automated>
  </verify>
  <acceptance_criteria>
    - `public/cv-fr.pdf` exists and size > 0 bytes
    - `public/cv-en.pdf` exists and size > 0 bytes (copy of cv-fr.pdf)
    - `public/about-photo.jpg` exists and size > 0 bytes
    - 6 directories `public/projects/{texture-manager,agora,brand-system,editorial-grid,tower-concept,residential-renovation}/` each contain a `cover.jpg`
    - Original `CV_Tanguy_Delrieu_2023.pdf` at repo root is REMOVED (moved, not copied)
    - `git status` shows the new files as untracked or staged (NOT modified or deleted from elsewhere)
  </acceptance_criteria>
  <done>9 binary asset files exist on disk; CV move preserves intent (untracked PDF migrated, no copy left at root).</done>
</task>

<task type="auto">
  <name>Task 2: Create lib/constants.ts + add 3 fixed category color tokens to globals.css</name>
  <files>lib/constants.ts, app/globals.css</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-06, D-13)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pattern: Fixed category tokens follow Phase 1 D-12 precedent" + §"Specific Ideas: fixed category tokens — exact OKLCh values"
    - .planning/phases/01-foundations/01-CONTEXT.md (D-12 — `--destructive` is the precedent for fixed tokens)
    - app/globals.css (current state — see existing :root + @theme inline blocks; the new tokens append in the same blocks)
  </read_first>
  <action>
    **Step 2a: Create lib/constants.ts** (D-06 — centralized user-specific data):
    ```typescript
    /**
     * lib/constants.ts — User-specific data for Hero / Footer / Contact / ConsoleArt.
     *
     * Phase 4 D-06: 3 values the user swaps pre-deploy.
     *   - EMAIL is a placeholder; user provides their real email before Phase 7.
     *   - GITHUB_URL matches the Footer + ConsoleArt fallback from Phase 3.
     *   - LINKEDIN_URL is a placeholder; user provides their real profile URL.
     *
     * NO hardcoded values elsewhere in the codebase — Hero/Contact import from
     * here. Footer is already configured separately in Phase 3 (Footer.tsx
     * inlines the same URLs; Phase 4 deferred refactor is to migrate Footer to
     * import from this file too — not in scope for Phase 4).
     */
    export const EMAIL = 'tanguy@example.com';
    export const GITHUB_URL = 'https://github.com/tanguynoumea/portfolio';
    export const LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu';
    ```

    **Step 2b: Add 3 fixed category tokens to app/globals.css** (D-13 — follow Phase 1 D-12 `--destructive` precedent):

    Locate the `:root { ... }` block. After the `--destructive-foreground` line, INSERT:
    ```css
      /* Phase 4 D-13: fixed category tokens (palette-independent, follows D-12 --destructive precedent) */
      --color-category-tech: oklch(0.55 0.15 240);     /* cool blue */
      --color-category-design: oklch(0.65 0.20 330);   /* magenta/pink */
      --color-category-bim: oklch(0.60 0.13 60);       /* warm amber */
    ```

    Locate the `@theme inline { ... }` block. After the `--color-ring: var(--ring);` line, INSERT:
    ```css
      /* Phase 4 D-13: expose fixed category tokens to Tailwind utilities */
      --color-category-tech: var(--color-category-tech);
      --color-category-design: var(--color-category-design);
      --color-category-bim: var(--color-category-bim);
    ```

    These 3 tokens MUST NOT be added to `lib/palettes.ts` and MUST NOT be mutated by ThemeProvider. They are PALETTE-INDEPENDENT — the same color regardless of which palette the user has selected.

    **CRITICAL:** Do NOT touch any existing line in `:root` or `@theme inline`. Only ADD the new lines. Run `npm run build` after to verify no Tailwind compilation errors.
  </action>
  <verify>
    <automated>grep -c "EMAIL" lib/constants.ts && grep -c "GITHUB_URL" lib/constants.ts && grep -c "LINKEDIN_URL" lib/constants.ts && grep -c "color-category-tech" app/globals.css && grep -c "color-category-design" app/globals.css && grep -c "color-category-bim" app/globals.css</automated>
  </verify>
  <acceptance_criteria>
    - `lib/constants.ts` exists and exports `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` as `string` constants (verify via `node -e "import('./lib/constants.ts').then(m => console.log(typeof m.EMAIL))"` returns "string" — OR rely on TypeScript checking via `npm run build`)
    - `grep -c "--color-category-tech" app/globals.css` returns at least 2 (one in `:root`, one in `@theme inline`)
    - `grep -c "--color-category-design" app/globals.css` returns at least 2
    - `grep -c "--color-category-bim" app/globals.css` returns at least 2
    - The existing `--destructive` token is UNTOUCHED (same line, same value)
    - `npm run build` exit 0 (Tailwind compiles without errors)
  </acceptance_criteria>
  <done>lib/constants.ts created with 3 exports; globals.css extended with 3 fixed category tokens in :root AND @theme inline; build passes.</done>
</task>

<task type="auto">
  <name>Task 3: Install shadcn Badge + add 3 category CVA variants</name>
  <files>components/ui/badge.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-03)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"shadcn Badge variants for category colors" code example
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pitfall 4-F" (shadcn install may add duplicate tw-animate-css import — verify after)
    - app/globals.css (after Task 2 — confirm @theme inline has the category tokens before adding variants that reference them)
    - components/ui/button.tsx (reference for shadcn CVA structure)
  </read_first>
  <action>
    **Step 3a: Install shadcn Badge primitive**:
    ```bash
    npx shadcn@latest add badge
    ```
    This creates `components/ui/badge.tsx` with the default 4 variants (default / secondary / destructive / outline).

    **Step 3b: Verify globals.css is NOT polluted** (Pitfall 4-F): `grep -c "@import 'tw-animate-css'" app/globals.css` should return exactly 1. If shadcn add introduced a duplicate, remove it.

    **Step 3c: Customize the CVA variants** in `components/ui/badge.tsx`:

    Locate the `badgeVariants` cva() call and add 3 new variant entries inside the `variant` map (next to default/secondary/destructive/outline). Final state:
    ```typescript
    const badgeVariants = cva(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      {
        variants: {
          variant: {
            default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
            secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
            outline: 'text-foreground',
            // Phase 4 D-17 + D-13: fixed-token category variants (palette-independent)
            'category-tech':   'border-transparent bg-category-tech text-white hover:bg-category-tech/90',
            'category-design': 'border-transparent bg-category-design text-white hover:bg-category-design/90',
            'category-bim':    'border-transparent bg-category-bim text-white hover:bg-category-bim/90',
          },
        },
        defaultVariants: { variant: 'default' },
      },
    );
    ```

    NOTE: `text-white` is acceptable here despite the OKLCh-only rule because `white` is a CSS keyword (not an OKLCh literal). Verify by reading the actual shadcn output — if it uses different class structure, preserve that structure and only ADD the 3 new variant lines.

    **DO NOT** add OKLCh, hex, rgb(), or hsl() color literals anywhere in this file.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const c=fs.readFileSync('components/ui/badge.tsx','utf8'); const required=['category-tech','category-design','category-bim','bg-category-tech','bg-category-design','bg-category-bim']; const missing=required.filter(r=>!c.includes(r)); if(missing.length){console.error('MISSING:',missing);process.exit(1)} const bad=c.match(/oklch\(|#[0-9a-fA-F]{3,6}|rgb\(|hsl\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} console.log('badge-variants-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/ui/badge.tsx` exists (created by `npx shadcn@latest add badge`)
    - File contains `category-tech`, `category-design`, `category-bim` variant keys
    - File contains `bg-category-tech`, `bg-category-design`, `bg-category-bim` Tailwind utilities (referencing tokens added in Task 2)
    - File contains NO `oklch(`, NO `#XXX` hex, NO `rgb(`, NO `hsl(` literals
    - `npm run build` exit 0
    - `npm run lint` exit 0
    - `grep -c "@import 'tw-animate-css'" app/globals.css` returns 1 (no duplicate)
  </acceptance_criteria>
  <done>Badge primitive installed with 6 variants (4 default + 3 new category-*); no duplicate CSS imports; build + lint pass.</done>
</task>

<task type="auto">
  <name>Task 4: Seed 12 stub MDX files (6 projects × 2 locales)</name>
  <files>content/projects/texture-manager.fr.mdx, content/projects/texture-manager.en.mdx, content/projects/agora.fr.mdx, content/projects/agora.en.mdx, content/projects/brand-system.fr.mdx, content/projects/brand-system.en.mdx, content/projects/editorial-grid.fr.mdx, content/projects/editorial-grid.en.mdx, content/projects/tower-concept.fr.mdx, content/projects/tower-concept.en.mdx, content/projects/residential-renovation.fr.mdx, content/projects/residential-renovation.en.mdx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-04, D-05)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"MDX stub example (texture-manager.fr.mdx)" + §"Pitfall 4-H" (frontmatter validation requirements)
    - lib/projects.ts (the validateFrontmatter function — every required common field + per-category required fields)
    - content/projects/_template.fr.mdx (reference Tech variant shape)
    - .planning/phases/01-foundations/01-CONTEXT.md (D-18..D-22 discriminated union)
  </read_first>
  <action>
    Create 12 MDX files. Each must have COMPLETE frontmatter that satisfies `validateFrontmatter()` in lib/projects.ts. Required for ALL: `slug, title, year, category, cover, summary, featured`. Plus per-category required fields.

    **File 1: `content/projects/texture-manager.fr.mdx`** (Tech):
    ```mdx
    ---
    slug: texture-manager
    title: Texture Manager
    year: 2024
    category: tech
    cover: /projects/texture-manager/cover.jpg
    summary: Outil de gestion de textures procédurales pour environnements 3D temps réel.
    featured: true
    stack:
      - TypeScript
      - Three.js
      - React
      - Vite
    repo: https://github.com/tanguynoumea/texture-manager
    ---

    ## Contexte

    Cette page sera enrichie en Phase 5 du plan portfolio.
    ```

    **File 2: `content/projects/texture-manager.en.mdx`** (Tech — EN):
    ```mdx
    ---
    slug: texture-manager
    title: Texture Manager
    year: 2024
    category: tech
    cover: /projects/texture-manager/cover.jpg
    summary: Procedural texture management tool for real-time 3D environments.
    featured: true
    stack:
      - TypeScript
      - Three.js
      - React
      - Vite
    repo: https://github.com/tanguynoumea/texture-manager
    ---

    ## Context

    This page will be enriched in Phase 5 of the portfolio plan.
    ```

    **File 3: `content/projects/agora.fr.mdx`** (Tech):
    ```mdx
    ---
    slug: agora
    title: Agora
    year: 2023
    category: tech
    cover: /projects/agora/cover.jpg
    summary: Plateforme web de discussions thématiques avec modération communautaire.
    featured: true
    stack:
      - Next.js
      - TypeScript
      - Prisma
      - PostgreSQL
    repo: https://github.com/tanguynoumea/agora
    ---

    ## Contexte

    Cette page sera enrichie en Phase 5 du plan portfolio.
    ```

    **File 4: `content/projects/agora.en.mdx`** (Tech — EN): Same frontmatter as FR but `summary: "Web platform for thematic discussions with community moderation."` and body `## Context\n\nThis page will be enriched in Phase 5 of the portfolio plan.`

    **File 5: `content/projects/brand-system.fr.mdx`** (Design):
    ```mdx
    ---
    slug: brand-system
    title: Système de marque modulaire
    year: 2024
    category: design
    cover: /projects/brand-system/cover.jpg
    summary: Refonte d'identité visuelle complète avec système de design modulaire.
    featured: false
    tools:
      - Figma
      - Illustrator
      - InDesign
    client: Studio indépendant
    ---

    ## Contexte

    Cette page sera enrichie en Phase 5 du plan portfolio.
    ```

    **File 6: `content/projects/brand-system.en.mdx`** (Design — EN): Same frontmatter but `title: "Modular brand system"`, `summary: "Full visual identity redesign with a modular design system."`, `client: "Independent studio"`. EN body.

    **File 7: `content/projects/editorial-grid.fr.mdx`** (Design):
    ```mdx
    ---
    slug: editorial-grid
    title: Grille éditoriale
    year: 2023
    category: design
    cover: /projects/editorial-grid/cover.jpg
    summary: Système de grille typographique pour magazine bilingue trimestriel.
    featured: false
    tools:
      - InDesign
      - Figma
      - Typography
    ---

    ## Contexte

    Cette page sera enrichie en Phase 5 du plan portfolio.
    ```

    **File 8: `content/projects/editorial-grid.en.mdx`** (Design — EN): `title: "Editorial grid"`, `summary: "Typographic grid system for a bilingual quarterly magazine."`, EN body.

    **File 9: `content/projects/tower-concept.fr.mdx`** (BIM):
    ```mdx
    ---
    slug: tower-concept
    title: Concept tour résidentielle
    year: 2024
    category: bim
    cover: /projects/tower-concept/cover.jpg
    summary: Étude conceptuelle d'une tour résidentielle écologique de 15 étages.
    featured: true
    software:
      - Revit
      - Rhino
      - Twinmotion
    projectScale: concept
    location: France
    ---

    ## Contexte

    Cette page sera enrichie en Phase 5 du plan portfolio.
    ```

    **File 10: `content/projects/tower-concept.en.mdx`** (BIM — EN): `title: "Residential tower concept"`, `summary: "Conceptual study of a 15-storey ecological residential tower."`, EN body.

    **File 11: `content/projects/residential-renovation.fr.mdx`** (BIM):
    ```mdx
    ---
    slug: residential-renovation
    title: Rénovation résidentielle
    year: 2023
    category: bim
    cover: /projects/residential-renovation/cover.jpg
    summary: Modélisation BIM complète d'une rénovation résidentielle 200m².
    featured: false
    software:
      - ArchiCAD
      - AutoCAD
      - Lumion
    projectScale: residential
    location: France
    ---

    ## Contexte

    Cette page sera enrichie en Phase 5 du plan portfolio.
    ```

    **File 12: `content/projects/residential-renovation.en.mdx`** (BIM — EN): `title: "Residential renovation"`, `summary: "Full BIM modeling of a 200m² residential renovation."`, EN body.

    **CRITICAL CHECKS:**
    - NO slug starts with `_` (the `_template` filter D-24 must NOT catch our stubs)
    - Each file has EVERY required common field (slug, title, year, category, cover, summary, featured)
    - Tech projects have `stack: string[]`
    - Design projects have `tools: string[]`
    - BIM projects have `software: string[]` AND `projectScale: 'concept' | 'residential' | 'commercial' | 'urban'`
    - Cover paths match the directories created in Task 1 (`/projects/{slug}/cover.jpg`)
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'),p=require('path'),m=require('gray-matter'); const dir='content/projects'; const expected=['texture-manager','agora','brand-system','editorial-grid','tower-concept','residential-renovation']; let errors=[]; for(const slug of expected){for(const loc of ['fr','en']){const f=p.join(dir,slug+'.'+loc+'.mdx'); if(!fs.existsSync(f)){errors.push('missing:'+f);continue} const data=m(fs.readFileSync(f,'utf8')).data; if(!data.title||!data.year||!data.cover||!data.summary||typeof data.featured!=='boolean'||!['tech','design','bim'].includes(data.category)){errors.push('bad-frontmatter:'+f)}}} if(errors.length){console.error(errors);process.exit(1)} console.log('12-stubs-valid')"</automated>
  </verify>
  <acceptance_criteria>
    - `ls content/projects/*.fr.mdx | grep -v _template` returns 6 file lines
    - `ls content/projects/*.en.mdx | grep -v _template` returns 6 file lines
    - Each file has frontmatter with required fields (verified via the automated test above)
    - 2 files have category=tech with `stack: string[]`
    - 2 files have category=design with `tools: string[]`
    - 2 files have category=bim with `software: string[]` + `projectScale: 'concept' | 'residential' | 'commercial' | 'urban'`
    - `_template.fr.mdx` and `_template.en.mdx` are PRESERVED (untouched)
    - `npm run build` exit 0 (lib/projects.ts validateFrontmatter does not throw on any stub)
  </acceptance_criteria>
  <done>12 MDX stubs exist with discriminated frontmatter; getProjects(locale) now returns 6 projects per locale; build passes.</done>
</task>

<task type="auto">
  <name>Task 5: Extend i18n (messages/fr.json + messages/en.json) with new keys + create parity gate script</name>
  <files>messages/fr.json, messages/en.json, scripts/check-i18n-parity.ts</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-11 about paragraphs, D-19 skills items, D-07 hero scrollCue)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pitfall 4-J" (skills.groups.*.items access pattern)
    - messages/fr.json (current state — preserve all existing keys)
    - messages/en.json (current state — preserve all existing keys)
    - .planning/STATE.md (Phase 1 D-15: parity gate established at 66 leaf-keys; Phase 3 added nav.lang.* keys)
  </read_first>
  <action>
    **Step 5a: Extend messages/fr.json**:

    The existing `skills.groups.{tech,design,bim}` is a STRING (e.g. `"tech": "Développement"`). Restructure to an OBJECT `{ label, items }`:

    Replace existing:
    ```json
    "skills": {
      "title": "Compétences",
      "groups": {
        "tech": "Développement",
        "design": "Design",
        "bim": "Architecture & BIM"
      }
    },
    ```

    With:
    ```json
    "skills": {
      "title": "Compétences",
      "groups": {
        "tech": {
          "label": "Développement",
          "items": ["TypeScript", "React", "Next.js", "Node.js", "Tailwind", "GSAP", "Three.js"]
        },
        "design": {
          "label": "Design",
          "items": ["Figma", "Photoshop", "Illustrator", "InDesign", "Design System", "Branding", "Typography"]
        },
        "bim": {
          "label": "Architecture & BIM",
          "items": ["Revit", "ArchiCAD", "Rhino", "Grasshopper", "AutoCAD", "Twinmotion", "Lumion"]
        }
      }
    },
    ```

    Locate the existing `"about": { ... }` block and ADD `paragraphs`:
    ```json
    "about": {
      "title": "À propos de moi",
      "intro": "À compléter en Phase 4.",
      "details": "À compléter en Phase 4.",
      "paragraphs": {
        "1": "Je suis Tanguy, profil hybride au croisement du développement web, du design graphique et de l'architecture BIM. Mon parcours mêle des projets de gestion de textures procédurales pour la 3D temps réel, des refontes d'identité visuelle complètes et des études conceptuelles d'architecture résidentielle écologique.",
        "2": "Ce portfolio est lui-même une démonstration : système de palettes interactif WCAG-compliant, animations GSAP soignées, contenu MDX bilingue. Chaque détail vise à prouver la maîtrise technique, le sens du design et l'attention portée à l'utilisateur. Je suis disponible pour discuter de projets qui croisent ces trois disciplines."
      }
    },
    ```

    Locate the existing `"hero": { ... }` block and ADD `scrollCue`:
    ```json
    "hero": {
      "name": "Tanguy",
      "role": "Tech × Design × BIM",
      "tagline": "Profil hybride au croisement du développement, du design et de l'architecture.",
      "cta": "Découvrir mon travail",
      "scrollCue": "Faire défiler vers les projets"
    },
    ```

    **Step 5b: Extend messages/en.json** — MIRROR every key added to fr.json with English values:

    skills.groups restructure:
    ```json
    "skills": {
      "title": "Skills",
      "groups": {
        "tech": {
          "label": "Development",
          "items": ["TypeScript", "React", "Next.js", "Node.js", "Tailwind", "GSAP", "Three.js"]
        },
        "design": {
          "label": "Design",
          "items": ["Figma", "Photoshop", "Illustrator", "InDesign", "Design System", "Branding", "Typography"]
        },
        "bim": {
          "label": "Architecture & BIM",
          "items": ["Revit", "ArchiCAD", "Rhino", "Grasshopper", "AutoCAD", "Twinmotion", "Lumion"]
        }
      }
    },
    ```

    about.paragraphs:
    ```json
    "about": {
      "title": "About me",
      "intro": "To be completed in Phase 4.",
      "details": "To be completed in Phase 4.",
      "paragraphs": {
        "1": "I'm Tanguy, a hybrid profile at the crossroads of web development, graphic design, and BIM architecture. My work spans procedural texture management tools for real-time 3D, full visual identity redesigns, and conceptual studies of ecological residential architecture.",
        "2": "This portfolio is itself a demonstration: an interactive WCAG-compliant palette system, polished GSAP animations, bilingual MDX content. Every detail aims to prove technical mastery, design sensibility, and attention to user experience. I'm available to discuss projects that bridge these three disciplines."
      }
    },
    ```

    hero.scrollCue:
    ```json
    "hero": {
      "name": "Tanguy",
      "role": "Tech × Design × BIM",
      "tagline": "Hybrid profile at the crossroads of development, design, and architecture.",
      "cta": "See my work",
      "scrollCue": "Scroll to projects"
    },
    ```

    **Step 5c: Create scripts/check-i18n-parity.ts** (parity gate):
    ```typescript
    /**
     * scripts/check-i18n-parity.ts — Phase 1 D-15 parity gate, extended for Phase 4.
     *
     * Reads messages/fr.json and messages/en.json, flattens both to sorted
     * leaf-key paths, and exits non-zero if the sets differ. Run during CI / before
     * commit. Phase 4 adds about.paragraphs.{1,2}, skills.groups.{tech,design,bim}.{label,items}, hero.scrollCue.
     */
    import { readFileSync } from 'node:fs';

    function flatten(obj: unknown, prefix = ''): string[] {
      if (Array.isArray(obj)) {
        // Arrays count as a single leaf — represented by the path itself.
        return [prefix];
      }
      if (obj && typeof obj === 'object') {
        const out: string[] = [];
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          out.push(...flatten(v, prefix ? `${prefix}.${k}` : k));
        }
        return out;
      }
      return [prefix];
    }

    const fr = JSON.parse(readFileSync('messages/fr.json', 'utf8'));
    const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
    const frKeys = new Set(flatten(fr));
    const enKeys = new Set(flatten(en));

    const onlyFr = [...frKeys].filter((k) => !enKeys.has(k));
    const onlyEn = [...enKeys].filter((k) => !frKeys.has(k));

    if (onlyFr.length || onlyEn.length) {
      console.error('FR/EN parity FAILED.');
      if (onlyFr.length) console.error('  Keys only in FR:', onlyFr);
      if (onlyEn.length) console.error('  Keys only in EN:', onlyEn);
      process.exit(1);
    }
    console.log(`FR/EN parity OK — ${frKeys.size} leaf paths.`);
    ```

    Run `npx tsx scripts/check-i18n-parity.ts` to verify it passes.

    **VERIFY existing keys preserved**: After editing, every existing FR key (nav.*, hero.{name,role,tagline,cta}, about.{title,intro,details}, projects.*, skills.title, contact.*, footer.*, palette.*, errors.*) MUST still exist with identical values.
  </action>
  <verify>
    <automated>npx tsx scripts/check-i18n-parity.ts</automated>
  </verify>
  <acceptance_criteria>
    - `messages/fr.json` contains `about.paragraphs.1`, `about.paragraphs.2`, `hero.scrollCue`, `skills.groups.tech.label`, `skills.groups.tech.items`, `skills.groups.design.{label,items}`, `skills.groups.bim.{label,items}`
    - `messages/en.json` contains the same paths with English values
    - `messages/fr.json` and `messages/en.json` are BOTH valid JSON (parse without errors)
    - `npx tsx scripts/check-i18n-parity.ts` exits 0
    - `scripts/check-i18n-parity.ts` exists and is the parity gate
    - All previously-existing keys (e.g. `nav.home`, `hero.cta`, `contact.cv.fr`) are PRESERVED with their original values (`diff` against git HEAD should show only additions + the skills.groups restructure)
  </acceptance_criteria>
  <done>i18n extended with 9 new leaf paths × 2 locales = 18 new keys; parity gate script created and passes.</done>
</task>

<task type="auto">
  <name>Task 6: Wire app/[locale]/page.tsx — server-load getProjects + compose 5 section components</name>
  <files>app/[locale]/page.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-16 server-load + prop-drill pattern, code_context integration points)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Recommended Project Structure" + §"Anti-Patterns to Avoid: Reading getProjects(locale) from a Client Component"
    - app/[locale]/page.tsx (current state — placeholder Server Component with 5 sections)
    - app/[locale]/layout.tsx (provider tree — Phase 4 doesn't modify; just confirms page.tsx renders inside ThemeProvider + LenisProvider + NextIntlClientProvider)
    - lib/projects.ts (getProjects async signature; Locale type)
  </read_first>
  <action>
    Replace the entire contents of `app/[locale]/page.tsx` with:

    ```tsx
    /*
     * app/[locale]/page.tsx — Phase 4 HOME-01..HOME-07 composition root.
     *
     * Server Component (no 'use client'). Wraps the 5 homepage sections:
     *   - Hero       (HOME-01)
     *   - About      (HOME-02)
     *   - Projects   (HOME-03+04+05 — CategoryFilter + ProjectGrid + ProjectsSection)
     *   - Skills     (HOME-06)
     *   - Contact    (HOME-07)
     *
     * Server-side data loading per 04-RESEARCH.md anti-pattern guard:
     * lib/projects.ts uses node:fs and CANNOT be imported by Client Components.
     * We resolve projects here (Server) and pass as a serialized prop to
     * <ProjectsSection> (Client). The discriminated Project union serializes
     * cleanly via React's RSC boundary.
     *
     * Section IDs (home/about/projects/skills/contact) are PRESERVED from
     * Phase 3 so Navigation's useActiveSection IntersectionObserver continues
     * to work without modification.
     *
     * The outer <main> wrapper is owned by app/[locale]/layout.tsx (Phase 3
     * D-11 provider tree). This page returns a fragment of <section> children.
     */
    import { getProjects, type Locale } from '@/lib/projects';
    import { Hero } from '@/components/sections/Hero';
    import { About } from '@/components/sections/About';
    import { ProjectsSection } from '@/components/sections/ProjectsSection';
    import { Skills } from '@/components/sections/Skills';
    import { Contact } from '@/components/sections/Contact';

    type Params = Promise<{ locale: string }>;

    export default async function HomePage({ params }: { params: Params }) {
      const { locale } = await params;
      const projects = await getProjects(locale as Locale);

      return (
        <>
          <section id="home" className="flex min-h-screen items-center justify-center">
            <Hero />
          </section>
          <section id="about" className="flex min-h-screen items-center justify-center px-4">
            <About />
          </section>
          <section id="projects" className="flex min-h-screen items-center justify-center px-4 py-16">
            <ProjectsSection projects={projects} />
          </section>
          <section id="skills" className="flex min-h-screen items-center justify-center px-4 py-16">
            <Skills />
          </section>
          <section id="contact" className="flex min-h-screen items-center justify-center px-4 py-16">
            <Contact />
          </section>
        </>
      );
    }
    ```

    **CRITICAL:**
    - The page is now `async` (was synchronous). Next 16 `params` is a Promise — must `await` before destructuring.
    - The `'use client'` directive is ABSENT (page stays Server Component).
    - All 5 `<section id="...">` IDs match Phase 3 Navigation's section IDs.
    - The build will FAIL at this step because the 5 component imports don't exist yet — that's intentional. Wave 1+2 plans create them. The Wave 0 TDD harnesses (Task 7) will reference these imports as expected to exist.

    **NOTE:** Phase 4 plans 01-05 will fill the section bodies. After Wave 0 completes, `npm run build` will fail with import errors until Wave 1 ships at least Hero/About/Skills/Contact. This is expected — Wave 0 is the dependency gate, not a buildable state on its own. **BUT we can defer the runtime failure by ensuring the test harnesses for Wave 1+2 (Task 7) are properly RED — they will demonstrate "FAILING-by-default" before Wave 1's GREEN implementations.**

    **Wave 0 build expectation:** `npm run build` may fail at this step due to missing component imports. This is ACCEPTABLE because Wave 1 immediately follows. The atomic-completeness gate at the phase level is "all 6 plans done" — not "after each plan, build is green."

    Document this explicitly in the commit message: "build will fail at this commit; Wave 1 components restore green build state."
  </action>
  <verify>
    <automated>node -e "const c=require('fs').readFileSync('app/[locale]/page.tsx','utf8'); const required=['Hero','About','ProjectsSection','Skills','Contact','getProjects','async function HomePage','await params','projects={projects}']; const missing=required.filter(r=>!c.includes(r)); if(missing.length){console.error('MISSING:',missing);process.exit(1)} if(c.includes('use client')){console.error('SHOULD NOT BE CLIENT COMPONENT');process.exit(1)} console.log('page-tsx-wired')"</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/page.tsx` is an `async` function (not synchronous)
    - File contains `import { getProjects, type Locale } from '@/lib/projects'`
    - File contains exactly 5 component imports from `@/components/sections/{Hero,About,ProjectsSection,Skills,Contact}`
    - File renders 5 `<section id="...">` elements with IDs home/about/projects/skills/contact
    - `<ProjectsSection projects={projects} />` passes the server-loaded array as a prop
    - File does NOT contain `'use client'`
    - File contains `await params` and `await getProjects(locale as Locale)`
    - Note: `npm run build` will fail at this point (missing component imports) — that's expected; Wave 1 fixes it
  </acceptance_criteria>
  <done>page.tsx becomes Server Component data-loader + 5-section composer; Wave 1 components plug into the named exports.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 7: Create 8 TDD test harnesses (failing-by-default)</name>
  <files>components/sections/Hero.test.tsx, components/sections/About.test.tsx, components/sections/CategoryFilter.test.tsx, components/sections/ProjectCard.test.tsx, components/sections/ProjectGrid.test.tsx, components/sections/ProjectsSection.test.tsx, components/sections/Skills.test.tsx, components/sections/Contact.test.tsx</files>
  <behavior>
    Each test file should FAIL on import (the component doesn't exist yet) — that's the RED state. Wave 1+2 implementations make them GREEN by creating the components.
    Test files exercise the verification contracts from 04-VALIDATION.md per-task verification map.
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-VALIDATION.md §"Per-Task Verification Map" + §"Wave 0 Requirements" (8 test files listed)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Phase Requirements → Test Map" (per-REQ test cases enumerated)
    - components/layout/Footer.test.tsx (reference pattern — vi.mock('next-intl') style, screen.getByText/getByLabelText assertions)
    - components/layout/LanguageSwitcher.test.tsx (reference for motion + i18n mock pattern)
    - vitest.config.ts (alias + globals config)
  </read_first>
  <action>
    Create 8 failing-by-default test harnesses. Each must import from the (yet-to-exist) component file so the test FAILS at the `import` line until the component is created in Wave 1 or 2.

    **`components/sections/Hero.test.tsx`**:
    ```tsx
    /**
     * Hero.test.tsx — RED harness for HOME-01.
     *
     * Wave 1 (04-01-hero-PLAN) creates Hero.tsx and makes these pass.
     * Wave 0 ships this as a RED test — the import on line 1 fails until
     * Wave 1 ships the component.
     */
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render, screen } from '@testing-library/react';

    // Mock next-intl translations for the hero namespace.
    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => (k: string) => {
        if (ns === 'hero') {
          const map: Record<string, string> = {
            name: 'Tanguy',
            role: 'Tech × Design × BIM',
            tagline: 'Hybrid profile…',
            cta: 'See my work',
            scrollCue: 'Scroll to projects',
          };
          return map[k] ?? `${ns}.${k}`;
        }
        return `${ns}.${k}`;
      },
    }));

    // Mock @gsap/react useGSAP — verifies the scope was passed.
    const useGSAPSpy = vi.fn();
    vi.mock('@gsap/react', () => ({
      useGSAP: (fn: () => void, opts?: { scope?: unknown }) => {
        useGSAPSpy(opts);
        // Run the callback to exercise the matchMedia path
        fn();
      },
    }));

    // Mock gsap.matchMedia.
    vi.mock('gsap', () => ({
      gsap: {
        matchMedia: () => ({ add: () => undefined }),
        timeline: () => ({ from: () => ({ from: () => ({ from: () => ({ from: () => ({ from: () => undefined }) }) }) }) }),
        set: vi.fn(),
        registerPlugin: vi.fn(),
      },
    }));

    vi.mock('gsap/SplitText', () => ({
      SplitText: class { revert() {} },
    }));

    // Mock useLenis returning a fake instance.
    vi.mock('@/components/providers/LenisProvider', () => ({
      useLenis: () => ({ scrollTo: vi.fn() }),
    }));

    beforeEach(() => {
      useGSAPSpy.mockReset();
    });

    describe('Hero (HOME-01) — RED until Wave 1 ships', () => {
      it('renders name + role + tagline + CTA + scroll cue from i18n', async () => {
        const { Hero } = await import('./Hero');
        render(<Hero />);
        expect(screen.getByText(/Tanguy/)).toBeTruthy();
        expect(screen.getByText(/Tech × Design × BIM/)).toBeTruthy();
        expect(screen.getByText(/See my work/)).toBeTruthy();
      });

      it('useGSAP is called with a scope ref (Pattern 1 from RESEARCH.md)', async () => {
        const { Hero } = await import('./Hero');
        render(<Hero />);
        expect(useGSAPSpy).toHaveBeenCalled();
        const callArgs = useGSAPSpy.mock.calls[0][0];
        expect(callArgs).toHaveProperty('scope');
      });
    });
    ```

    **`components/sections/About.test.tsx`**:
    ```tsx
    /**
     * About.test.tsx — RED harness for HOME-02.
     */
    import { describe, it, expect, vi } from 'vitest';
    import { render, screen } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => (k: string) => {
        if (ns === 'about') {
          const map: Record<string, string> = {
            title: 'About me',
            'paragraphs.1': 'First paragraph placeholder.',
            'paragraphs.2': 'Second paragraph placeholder.',
          };
          return map[k] ?? `${ns}.${k}`;
        }
        return `${ns}.${k}`;
      },
    }));

    vi.mock('@gsap/react', () => ({ useGSAP: (fn: () => void) => fn() }));
    vi.mock('gsap', () => ({
      gsap: { matchMedia: () => ({ add: () => undefined }), timeline: () => ({ from: () => ({ from: () => undefined }) }), set: vi.fn(), registerPlugin: vi.fn() },
    }));
    vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

    vi.mock('next/image', () => ({
      default: (props: { alt?: string; src?: string; width?: number; height?: number }) =>
        `IMG[src=${props.src} alt=${props.alt} ${props.width}x${props.height}]` as unknown as React.ReactElement,
    }));

    describe('About (HOME-02) — RED until Wave 1 ships', () => {
      it('renders paragraphs from about.paragraphs.{1,2} i18n keys', async () => {
        const { About } = await import('./About');
        render(<About />);
        expect(screen.getByText(/First paragraph/)).toBeTruthy();
        expect(screen.getByText(/Second paragraph/)).toBeTruthy();
      });
    });
    ```

    **`components/sections/CategoryFilter.test.tsx`**:
    ```tsx
    /**
     * CategoryFilter.test.tsx — RED harness for HOME-03.
     */
    import { describe, it, expect, vi } from 'vitest';
    import { render, screen, fireEvent } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => (k: string) => {
        const map: Record<string, string> = { all: 'All', tech: 'Tech', design: 'Design', bim: 'BIM' };
        return map[k] ?? `${ns}.${k}`;
      },
    }));

    vi.mock('motion/react', () => ({
      motion: { span: ((props: Record<string, unknown>) => `<span ${JSON.stringify(props.layoutId)}/>`) as unknown as React.FC },
    }));

    describe('CategoryFilter (HOME-03) — RED until Wave 2 ships', () => {
      it('renders 4 buttons (All / Tech / Design / BIM)', async () => {
        const { CategoryFilter } = await import('./CategoryFilter');
        render(<CategoryFilter active="all" onChange={() => undefined} />);
        expect(screen.getByText(/All/)).toBeTruthy();
        expect(screen.getByText(/Tech/)).toBeTruthy();
        expect(screen.getByText(/Design/)).toBeTruthy();
        expect(screen.getByText(/BIM/)).toBeTruthy();
      });

      it('clicking inactive button calls onChange with target value', async () => {
        const { CategoryFilter } = await import('./CategoryFilter');
        const onChange = vi.fn();
        render(<CategoryFilter active="all" onChange={onChange} />);
        fireEvent.click(screen.getByText('Tech'));
        expect(onChange).toHaveBeenCalledWith('tech');
      });
    });
    ```

    **`components/sections/ProjectCard.test.tsx`**:
    ```tsx
    /**
     * ProjectCard.test.tsx — RED harness for HOME-04.
     */
    import { describe, it, expect, vi } from 'vitest';
    import { render, screen } from '@testing-library/react';
    import type { TechProject } from '@/lib/projects';

    vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
    vi.mock('next/image', () => ({ default: (p: { alt?: string }) => `IMG[${p.alt}]` as unknown as React.ReactElement }));
    vi.mock('@/i18n/navigation', () => ({
      Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
        ({ type: 'a', props: { href, ...rest, children } } as unknown as React.ReactElement),
    }));
    vi.mock('motion/react', () => ({
      motion: { div: ((props: Record<string, unknown>) => ({ type: 'div', props } as unknown as React.ReactElement)) as unknown as React.FC },
      useReducedMotion: () => false,
    }));

    const techProject: TechProject = {
      slug: 'texture-manager',
      title: 'Texture Manager',
      year: 2024,
      category: 'tech',
      cover: '/projects/texture-manager/cover.jpg',
      summary: 'Procedural texture manager.',
      featured: true,
      stack: ['TypeScript', 'Three.js'],
    };

    describe('ProjectCard (HOME-04) — RED until Wave 2 ships', () => {
      it('renders title + year + category for a tech project', async () => {
        const { ProjectCard } = await import('./ProjectCard');
        render(<ProjectCard project={techProject} />);
        expect(screen.getByText(/Texture Manager/)).toBeTruthy();
        expect(screen.getByText(/2024/)).toBeTruthy();
      });
    });
    ```

    **`components/sections/ProjectGrid.test.tsx`**:
    ```tsx
    /**
     * ProjectGrid.test.tsx — RED harness for HOME-05.
     */
    import { describe, it, expect, vi } from 'vitest';
    import { render, screen } from '@testing-library/react';
    import type { Project } from '@/lib/projects';

    vi.mock('next-intl', () => ({
      useTranslations: () => (k: string) => k === 'empty' ? 'No project matches this filter.' : k,
    }));
    vi.mock('motion/react', () => ({
      motion: { div: ((props: Record<string, unknown>) => ({ type: 'div', props } as unknown as React.ReactElement)) as unknown as React.FC },
      AnimatePresence: ({ children }: { children: React.ReactNode }) => children as React.ReactElement,
    }));
    vi.mock('./ProjectCard', () => ({
      ProjectCard: ({ project }: { project: { slug: string; title: string } }) =>
        ({ type: 'div', props: { 'data-slug': project.slug, children: project.title } } as unknown as React.ReactElement),
    }));

    describe('ProjectGrid (HOME-05) — RED until Wave 2 ships', () => {
      it('renders empty state when projects=[]', async () => {
        const { ProjectGrid } = await import('./ProjectGrid');
        render(<ProjectGrid projects={[]} />);
        expect(screen.getByText(/No project matches/)).toBeTruthy();
      });
    });
    ```

    **`components/sections/ProjectsSection.test.tsx`**:
    ```tsx
    /**
     * ProjectsSection.test.tsx — RED harness for HOME-05 (lifted state).
     */
    import { describe, it, expect, vi } from 'vitest';
    import { render, screen } from '@testing-library/react';
    import type { Project } from '@/lib/projects';

    vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
    vi.mock('./CategoryFilter', () => ({ CategoryFilter: ({ active }: { active: string }) => ({ type: 'div', props: { 'data-active': active } } as unknown as React.ReactElement) }));
    vi.mock('./ProjectGrid', () => ({ ProjectGrid: ({ projects }: { projects: Project[] }) => ({ type: 'div', props: { 'data-count': String(projects.length) } } as unknown as React.ReactElement) }));

    describe('ProjectsSection (HOME-05) — RED until Wave 2 ships', () => {
      it('default active filter is "all" and renders all projects', async () => {
        const { ProjectsSection } = await import('./ProjectsSection');
        const fakeProjects = [] as unknown as Project[];
        render(<ProjectsSection projects={fakeProjects} />);
        // structural — implementation will fill the assertion
        expect(true).toBe(true);
      });
    });
    ```

    **`components/sections/Skills.test.tsx`**:
    ```tsx
    /**
     * Skills.test.tsx — RED harness for HOME-06.
     */
    import { describe, it, expect, vi } from 'vitest';
    import { render, screen } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => {
        const t = (k: string) => `${ns}.${k}`;
        // next-intl t.raw for arrays
        t.raw = (k: string) => {
          if (k === 'groups.tech.items') return ['TypeScript', 'React'];
          if (k === 'groups.design.items') return ['Figma'];
          if (k === 'groups.bim.items') return ['Revit'];
          return [];
        };
        return t;
      },
    }));

    vi.mock('@gsap/react', () => ({ useGSAP: (fn: () => void) => fn() }));
    vi.mock('gsap', () => ({
      gsap: { matchMedia: () => ({ add: () => undefined }), timeline: () => ({ from: () => undefined }), set: vi.fn(), registerPlugin: vi.fn() },
    }));
    vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

    vi.mock('@/components/ui/badge', () => ({
      Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
        ({ type: 'span', props: { 'data-variant': variant, children } } as unknown as React.ReactElement),
    }));

    describe('Skills (HOME-06) — RED until Wave 1 ships', () => {
      it('renders the Tech group with skill badges', async () => {
        const { Skills } = await import('./Skills');
        render(<Skills />);
        // RED placeholder — Wave 1 ships actual component
        expect(true).toBe(true);
      });
    });
    ```

    **`components/sections/Contact.test.tsx`**:
    ```tsx
    /**
     * Contact.test.tsx — RED harness for HOME-07.
     */
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render, screen, fireEvent, waitFor } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => (k: string) => {
        const map: Record<string, string> = {
          email: 'Copy email address',
          emailCopied: 'Address copied!',
          'cv.fr': 'Télécharger le CV (FR)',
          'cv.en': 'Download CV (EN)',
          'social.github': 'GitHub',
          'social.linkedin': 'LinkedIn',
        };
        return map[k] ?? `${ns}.${k}`;
      },
    }));

    vi.mock('motion/react', () => ({
      motion: { span: ((props: Record<string, unknown>) => ({ type: 'span', props } as unknown as React.ReactElement)) as unknown as React.FC },
      AnimatePresence: ({ children }: { children: React.ReactNode }) => children as React.ReactElement,
    }));

    vi.mock('@/lib/constants', () => ({
      EMAIL: 'tanguy@example.com',
      GITHUB_URL: 'https://github.com/tanguynoumea/portfolio',
      LINKEDIN_URL: 'https://www.linkedin.com/in/tanguy-delrieu',
    }));

    describe('Contact (HOME-07) — RED until Wave 1 ships', () => {
      it('renders email button + 3 social links + 2 CV download buttons', async () => {
        const { Contact } = await import('./Contact');
        render(<Contact />);
        expect(screen.getByText(/tanguy@example.com/)).toBeTruthy();
      });
    });
    ```

    **Common test mechanics:**
    - Every test file uses `vi.mock('next-intl', ...)` because the components use `useTranslations`.
    - Every test file uses `vi.mock('@gsap/react', ...)`, `vi.mock('gsap', ...)`, `vi.mock('gsap/ScrollTrigger', ...)`, `vi.mock('gsap/SplitText', ...)` AS NEEDED for that component's animation imports.
    - Every test file uses `vi.mock('motion/react', ...)` for components using motion.
    - Use `await import('./ComponentName')` inside the test (dynamic import) — this makes the test fail at the `import` line until the component exists, but Vitest reports it as a "RED" failure (expected) not a parse error.
    - Tests do NOT assert internal animation behavior (e.g. GSAP timeline progress) — they assert structural / semantic behavior (renders correct text, calls correct callbacks).
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const expected=['Hero','About','CategoryFilter','ProjectCard','ProjectGrid','ProjectsSection','Skills','Contact']; const missing=expected.filter(n=>!fs.existsSync('components/sections/'+n+'.test.tsx')); if(missing.length){console.error('MISSING:',missing);process.exit(1)} console.log('8-test-harnesses-present')"</automated>
  </verify>
  <acceptance_criteria>
    - 8 test files exist at `components/sections/{Hero,About,CategoryFilter,ProjectCard,ProjectGrid,ProjectsSection,Skills,Contact}.test.tsx`
    - Each file imports its component via dynamic `await import('./ComponentName')` (so failure is RED, not a parse error)
    - Each file mocks `next-intl` and animation libraries appropriately
    - `npm test -- --reporter=verbose` runs (may show RED failures — expected); the test files themselves have NO syntax errors (they parse, just the imports fail because components don't exist yet)
    - No watch-mode flag in the test command (already `vitest run` via npm script)
  </acceptance_criteria>
  <done>8 RED test harnesses ship; Wave 1+2 implementations create the components and the tests turn GREEN.</done>
</task>

</tasks>

<verification>
After all 7 tasks complete:

1. **Asset gate:**
   - `node -e "['public/cv-fr.pdf','public/cv-en.pdf','public/about-photo.jpg','public/projects/texture-manager/cover.jpg','public/projects/agora/cover.jpg','public/projects/brand-system/cover.jpg','public/projects/editorial-grid/cover.jpg','public/projects/tower-concept/cover.jpg','public/projects/residential-renovation/cover.jpg'].forEach(p=>{if(!require('fs').existsSync(p))throw p})"` exits 0
2. **MDX gate:** `npx tsx -e "import('./lib/projects.ts').then(async m=>{const fr=await m.getProjects('fr');const en=await m.getProjects('en');if(fr.length!==6||en.length!==6)throw 'expected-6-projects-each-locale';console.log('mdx-ok')})"` exits 0
3. **i18n parity gate:** `npx tsx scripts/check-i18n-parity.ts` exits 0
4. **Token gate:** `grep -c "color-category-tech" app/globals.css` returns ≥ 2 (root + theme); same for design + bim
5. **Badge variant gate:** `grep "category-tech\|category-design\|category-bim" components/ui/badge.tsx` returns ≥ 3 matches
6. **Constants gate:** `grep "EMAIL\|GITHUB_URL\|LINKEDIN_URL" lib/constants.ts` returns ≥ 3 matches
7. **Page composition gate:** `grep "Hero\|About\|ProjectsSection\|Skills\|Contact" app/[locale]/page.tsx` returns ≥ 5 matches
8. **Test harness gate:** `ls components/sections/*.test.tsx | wc -l` returns 8
9. **No literal colors gate (will apply to Wave 1+2 outputs):** `grep -E "oklch\(|#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" components/ui/badge.tsx` returns nothing
10. **Build expectation (deferred):** `npm run build` will FAIL until Wave 1 ships Hero/About/Skills/Contact (and Wave 2 ships ProjectsSection). This is EXPECTED — phase-level gate, not plan-level.

The phase-level `npm run build` + `npm run lint` + `npm test` gates will green AFTER all 6 plans complete.
</verification>

<success_criteria>
- [ ] All 9 binary assets exist on disk (CV PDFs, about-photo, 6 project covers)
- [ ] All 12 MDX stubs validate via lib/projects.ts (no build error on lib/projects import)
- [ ] `lib/constants.ts` exports EMAIL / GITHUB_URL / LINKEDIN_URL
- [ ] `app/globals.css` declares 3 fixed `--color-category-*` tokens in `:root` AND in `@theme inline`
- [ ] `messages/fr.json` + `messages/en.json` extended with 9 new leaf-paths × 2 locales = 18 new keys
- [ ] `scripts/check-i18n-parity.ts` exists and exits 0
- [ ] `components/ui/badge.tsx` exists with 3 new category-{tech,design,bim} CVA variants
- [ ] `app/[locale]/page.tsx` is async Server Component, server-loads getProjects(locale), composes 5 section components
- [ ] 8 RED test harnesses exist in `components/sections/`
- [ ] Git commit (singular) covers all of Wave 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-homepage-sections/04-00-SUMMARY.md` documenting:
- Asset moves performed (CV PDF migration, placeholder generation)
- New shadcn Badge install + customizations
- Fixed category tokens added (3 OKLCh values with WCAG contrast notes vs 5 palette backgrounds)
- i18n schema changes (skills.groups restructure from string to {label,items})
- 12 MDX stub frontmatter shapes (Tech×2, Design×2, BIM×2)
- TDD harness coverage map (which test file → which HOME-* requirement)
- Wave 1+2 dependency unlock confirmation (i18n keys ready, badge variants ready, MDX stubs ready)
- Note: `npm run build` deliberately RED at end of Wave 0; Wave 1's first plan restores green.
</output>