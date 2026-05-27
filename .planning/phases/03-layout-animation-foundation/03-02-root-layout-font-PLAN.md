---
phase: 03-layout-animation-foundation
plan: 02
type: execute
wave: 1
depends_on: ["03-00", "03-01"]
files_modified:
  - app/[locale]/layout.tsx
  - app/globals.css
  - app/[locale]/page.tsx
autonomous: true
requirements: [LAYOUT-01]
must_haves:
  truths:
    - "Inter font loads via next/font/google with latin + latin-ext subsets, swap display, preload, and exposes --font-sans CSS variable"
    - "Tailwind v4 @theme inline references --font-sans so the font-sans utility resolves to Inter"
    - "Root [locale]/layout.tsx mounts the provider tree per D-11: NextIntlClientProvider > ThemeProvider > LenisProvider > [ConsoleArt + Navigation + main + Footer + CustomCursor + PaletteFab]"
    - "<html> element gains className={inter.variable} so the CSS variable is set on the root element"
    - "generateMetadata exports a localized title + description + viewport"
    - "app/[locale]/page.tsx has 5 placeholder <section> shells (home/about/projects/skills/contact) so the IntersectionObserver added by Plan 03 has targets"
    - "No nested 'use client' on the root layout — it stays a Server Component"
    - "npm run build exits 0 and Inter font files appear in .next/static/media"
  artifacts:
    - path: "app/[locale]/layout.tsx"
      provides: "Provider tree per D-11"
      contains: "LenisProvider"
    - path: "app/[locale]/layout.tsx"
      provides: "Inter font wiring"
      contains: "next/font/google"
    - path: "app/[locale]/layout.tsx"
      provides: "Localized metadata"
      contains: "generateMetadata"
    - path: "app/globals.css"
      provides: "Tailwind font-sans utility resolves to Inter"
      contains: "--font-sans"
    - path: "app/[locale]/page.tsx"
      provides: "Section anchor targets for nav IntersectionObserver"
      contains: 'id="home"'
  key_links:
    - from: "app/[locale]/layout.tsx"
      to: "components/providers/LenisProvider.tsx"
      via: "import + JSX mount"
      pattern: "LenisProvider"
    - from: "app/[locale]/layout.tsx"
      to: "next/font/google"
      via: "Inter import + className on <html>"
      pattern: "next/font/google"
    - from: "app/globals.css"
      to: "<html className={inter.variable}>"
      via: "Tailwind v4 @theme inline --font-sans"
      pattern: "--font-sans"
---

<objective>
Wire the Inter font into the app via `next/font/google`, extend Tailwind v4's `@theme inline` block so the `font-sans` utility resolves to Inter, and assemble the final Phase 3 provider tree in `app/[locale]/layout.tsx` per CONTEXT.md D-11. Also drop 5 placeholder `<section id="…">` shells into the home page so the Plan 03 IntersectionObserver has something to observe.

This addresses LAYOUT-01 — the root layout becomes the assembly point for every Phase 3+ piece. After this plan ships:
- Every `/fr/*` and `/en/*` route renders inside `ThemeProvider > LenisProvider > [chrome + main + chrome]`.
- The `font-sans` Tailwind utility resolves to Inter via the CSS variable injected by next/font.
- Sections exist for the nav's IntersectionObserver to target (Phase 4 fills the content; Phase 3 just creates the shells).

This plan mounts the LenisProvider but uses **placeholder JSX** for Navigation / Footer / CustomCursor / ConsoleArt — those components are built in Wave 2 and Wave 3. We use 4 placeholder stubs (empty client-component shells) so the JSX tree compiles cleanly and the Wave 2/3 plans can swap them in via Edit without touching the layout file.

Actually no — re-read D-11: the layout file should mount the real components. Since Wave 2 (plans 03, 04) and Wave 3 (plan 05) create the components in PARALLEL waves AFTER this Wave 1 plan, but the layout file must reference them, the cleanest sequencing is:

1. Plan 02 (this plan): create 4 minimal stub files for Navigation/Footer/CustomCursor/ConsoleArt that render `null` (or a comment-marked empty fragment) so imports resolve. The Wave 2/3 plans replace the stub bodies with real implementations.
2. Plan 02 wires the imports in `[locale]/layout.tsx`. Wave 2/3 only edit the component implementations, not the layout file.

This decouples the wave 1 layout edits from wave 2/3 implementation edits cleanly.

Output: edits to layout.tsx + globals.css + page.tsx + 4 new stub component files.
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
@app/[locale]/layout.tsx
@app/[locale]/page.tsx
@app/globals.css
@components/providers/ThemeProvider.tsx
@components/providers/LenisProvider.tsx
@components/theme/PaletteFab.tsx
@i18n/routing.ts
@messages/fr.json
@messages/en.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create stub files for Navigation / Footer / CustomCursor / ConsoleArt so imports resolve in the layout (Wave 2/3 plans implement bodies)</name>
  <files>components/layout/Navigation.tsx, components/layout/Footer.tsx, components/layout/CustomCursor.tsx, components/layout/ConsoleArt.tsx</files>
  <read_first>
    - components/providers/LenisProvider.tsx (verify the import path)
    - components/theme/PaletteFab.tsx (example of an existing client component for style match)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"D-11" (provider tree shape)
  </read_first>
  <action>
    Create exactly four placeholder client component files. Each file must be minimal but valid TypeScript so the Plan 02 layout import resolves and `npm run build` passes. Wave 2 (plans 03+04) and Wave 3 (plan 05) will REPLACE the bodies via Write or Edit.

    Each file MUST follow this skeleton (the export name is critical — Wave 2/3 plans assume these exact names):

    **File 1: `components/layout/Navigation.tsx`**
    ```typescript
    'use client';

    /**
     * components/layout/Navigation.tsx — STUB.
     * Plan 03-03 (Wave 2) implements the fixed-top nav with logo + section anchor
     * links + LanguageSwitcher + mobile hamburger Sheet. This stub exists so
     * Plan 03-02's layout edit can import the symbol without breaking the build.
     */
    export function Navigation() {
      return null;
    }
    ```

    **File 2: `components/layout/Footer.tsx`**
    ```typescript
    'use client';

    /**
     * components/layout/Footer.tsx — STUB.
     * Plan 03-04 (Wave 2) implements the compact-row footer with social icons +
     * dynamic year + tagline.
     */
    export function Footer({ year }: { year: number }) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _year = year;
      return null;
    }
    ```

    **File 3: `components/layout/CustomCursor.tsx`**
    ```typescript
    'use client';

    /**
     * components/layout/CustomCursor.tsx — STUB.
     * Plan 03-05 (Wave 3) implements the constrained tracer cursor.
     * IMPORTANT contract: implementation MUST NOT use `cursor: none`.
     */
    export function CustomCursor() {
      return null;
    }
    ```

    **File 4: `components/layout/ConsoleArt.tsx`**
    ```typescript
    'use client';

    /**
     * components/layout/ConsoleArt.tsx — STUB.
     * Plan 03-05 (Wave 3) implements the bilingual console.log ASCII art with
     * GitHub link + subtle Konami hint.
     */
    export function ConsoleArt() {
      return null;
    }
    ```

    Constraints:
    - First line of each MUST be `'use client';`
    - Each file exports a named function — DO NOT use default exports (consistency with Phase 2 components).
    - DO NOT add any styling, color literals, or animations — stubs return `null`.
    - Footer must accept `{ year: number }` prop in its signature (D-24 server-rendered year).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `components/layout/Navigation.tsx` exists, starts with `'use client';`, exports `function Navigation`.
    - `components/layout/Footer.tsx` exists, starts with `'use client';`, exports `function Footer({ year }: { year: number })`.
    - `components/layout/CustomCursor.tsx` exists, starts with `'use client';`, exports `function CustomCursor`.
    - `components/layout/ConsoleArt.tsx` exists, starts with `'use client';`, exports `function ConsoleArt`.
    - All four files contain exactly one `return null` (the stub body).
    - `npm run build` exits 0 with the new files compiled.
    - `grep -l "cursor: none" components/` returns nothing.
  </acceptance_criteria>
  <done>4 stub files created with correct export names; build still passes; ready for Wave 2/3 plans to swap bodies in.</done>
</task>

<task type="auto">
  <name>Task 2: Wire next/font/google Inter into app/[locale]/layout.tsx + extend @theme inline in globals.css + assemble the D-11 provider tree + add generateMetadata + mount placeholders</name>
  <files>app/[locale]/layout.tsx, app/globals.css</files>
  <read_first>
    - app/[locale]/layout.tsx (current state — Phase 2 final, mounts NextIntlClientProvider + ThemeProvider + PaletteFab)
    - app/globals.css (existing @theme + @theme inline blocks — we ADD to @theme inline, not replace)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Root Layout & Font" (D-08..D-12) and §"D-11" (provider tree diagram)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §3 "next/font/google Inter v16 Setup"
    - components/providers/LenisProvider.tsx (confirm `LenisProvider` named export)
    - messages/fr.json + messages/en.json (current keys; we don't add any here)
  </read_first>
  <action>
    **Part A: Extend `app/globals.css`** — add `--font-sans` to the existing `@theme inline` block (do NOT create a new block). Find the existing block that starts at line 116 (`@theme inline {`) and ADD ONE LINE inside it:

    ```css
    @theme inline {
      --color-background: var(--background);
      /* ... existing entries unchanged ... */
      --color-ring: var(--ring);
      --font-sans: var(--font-sans, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
    }
    ```

    The `var(--font-sans, ...)` indirection means: use the variable Inter injects on `<html>`; if it's somehow missing, fall back to the system stack.

    Constraints:
    - DO NOT touch the existing `@theme` block (the palette one).
    - DO NOT delete or modify any existing line in `@theme inline`.
    - The new line goes INSIDE `@theme inline { ... }`, before the closing brace.

    **Part B: Edit `app/[locale]/layout.tsx`** — perform a surgical replacement to:

    1. Add the Inter import + config at the top of the file:
       ```typescript
       import { Inter } from 'next/font/google';

       const inter = Inter({
         subsets: ['latin', 'latin-ext'],
         variable: '--font-sans',
         display: 'swap',
         preload: true,
         fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
       });
       ```

    2. Add new imports for the LenisProvider + stub components:
       ```typescript
       import { LenisProvider } from '@/components/providers/LenisProvider';
       import { Navigation } from '@/components/layout/Navigation';
       import { Footer } from '@/components/layout/Footer';
       import { CustomCursor } from '@/components/layout/CustomCursor';
       import { ConsoleArt } from '@/components/layout/ConsoleArt';
       import { getTranslations } from 'next-intl/server';
       import type { Metadata } from 'next';
       ```

    3. Add a `generateMetadata` async function BEFORE the `LocaleLayout` default export:
       ```typescript
       export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
         const { locale } = await params;
         const t = await getTranslations({ locale, namespace: 'hero' });
         return {
           title: 'Tanguy Delrieu — Tech × Design × BIM',
           description: t('tagline'),
           // Phase 6 (A11Y-01) expands this with og:image, og:locale, hreflang alternates.
         };
       }
       ```

    4. Update the `<html>` opening tag to include the Inter variable className AND `font-sans antialiased`:
       ```typescript
       <html lang={locale} suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
       ```

    5. Wrap the existing inner tree inside `<LenisProvider>...</LenisProvider>` per D-11, inserting the chrome placeholders. The final inner JSX (inside `<ThemeProvider>`) becomes:
       ```typescript
       <ThemeProvider>
         <LenisProvider>
           <ConsoleArt />
           <Navigation />
           <main>{children}</main>
           <Footer year={new Date().getFullYear()} />
           <CustomCursor />
           <PaletteFab />
         </LenisProvider>
       </ThemeProvider>
       ```

       Note the changes from the Phase 2 final state:
       - `{children}` is now wrapped in `<main>...</main>` (semantic landmark, accessibility).
       - PaletteFab remains the LAST child inside LenisProvider — unchanged from Phase 2, just relocated one level deeper.
       - The dynamic year is computed at render time on the server (server component) and passed as a `year` prop (D-24).

    Constraints:
    - `app/[locale]/layout.tsx` must STAY a Server Component — DO NOT add `'use client'` at the top.
    - DO NOT remove the existing `<PaletteFouCScript />` in `<head>` (Phase 2 THEME-05).
    - DO NOT change the existing `generateStaticParams`, `notFound`, `setRequestLocale`, or `getMessages` calls.
    - DO NOT add `motion` or `framer-motion` imports — page transitions live in `app/template.tsx` (Plan 05).
    - DO NOT add any color literals to either file.
    - `Params` type is already defined in the file as `Promise<{ locale: string }>` — re-use it in `generateMetadata`.

    After both edits, run `npm run build` and `npm run lint` to verify.
  </action>
  <verify>
    <automated>npm run build && npm run lint && npm test</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/layout.tsx` contains the literal string `from 'next/font/google'`.
    - `app/[locale]/layout.tsx` contains the literal string `Inter(` (the font initialization).
    - `app/[locale]/layout.tsx` contains the literal strings `'latin', 'latin-ext'` (D-08 subsets).
    - `app/[locale]/layout.tsx` contains the literal string `variable: '--font-sans'` (D-08 CSS variable name).
    - `app/[locale]/layout.tsx` contains the literal string `display: 'swap'` (D-09 strategy).
    - `app/[locale]/layout.tsx` contains the literal string `preload: true` (D-09 strategy).
    - `app/[locale]/layout.tsx` contains the literal string `inter.variable` (applied to <html>).
    - `app/[locale]/layout.tsx` contains the literal string `font-sans antialiased` (applied to <html>).
    - `app/[locale]/layout.tsx` contains the literal string `LenisProvider` (imported + used).
    - `app/[locale]/layout.tsx` contains the literal string `<ConsoleArt />`.
    - `app/[locale]/layout.tsx` contains the literal string `<Navigation />`.
    - `app/[locale]/layout.tsx` contains the literal string `<Footer year={`.
    - `app/[locale]/layout.tsx` contains the literal string `<CustomCursor />`.
    - `app/[locale]/layout.tsx` contains the literal string `<PaletteFab />` (still mounted).
    - `app/[locale]/layout.tsx` contains the literal string `<main>` (semantic wrapper around children).
    - `app/[locale]/layout.tsx` contains the literal string `generateMetadata` (exported async function).
    - `app/[locale]/layout.tsx` contains the literal string `new Date().getFullYear()` (D-24).
    - `app/[locale]/layout.tsx` does NOT contain `'use client'` (stays Server Component).
    - `app/[locale]/layout.tsx` does NOT contain `tailwind.config` (Tailwind v4 is CSS-first).
    - `app/globals.css` `@theme inline` block contains a new line referencing `--font-sans`.
    - `app/globals.css` still contains all original `@theme inline` lines (`--color-background: var(--background)`, etc.).
    - `app/globals.css` does NOT contain `cursor: none`.
    - `npm run build` exits 0.
    - `npm run lint` exits 0.
    - `npm test` exits 0.
    - After build, `.next/static/media/` contains at least one Inter-related font file (woff2). `Get-ChildItem .next/static/media -Recurse -Include *.woff2 | Where-Object Name -match Inter` returns at least 1 file.
  </acceptance_criteria>
  <done>Layout file mounts the full D-11 provider tree; Inter font wired via next/font + Tailwind @theme inline; generateMetadata stub in place; build/lint/test all green.</done>
</task>

<task type="auto">
  <name>Task 3: Add 5 placeholder section shells to app/[locale]/page.tsx so the IntersectionObserver in Plan 03 has targets</name>
  <files>app/[locale]/page.tsx</files>
  <read_first>
    - app/[locale]/page.tsx (current state — minimal Hero placeholder)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Integration Points" line about page.tsx section shells
    - messages/fr.json + en.json (verify `nav.home`, `nav.about`, `nav.projects`, `nav.skills`, `nav.contact` keys exist)
  </read_first>
  <action>
    Replace the body of `app/[locale]/page.tsx` so it renders 5 `<section>` elements with the canonical IDs the navigation IntersectionObserver will target. Each section must have `id="<section>"` matching the IDs in `lib/hooks/useActiveSection.ts` (Plan 03 creates that file): `home`, `about`, `projects`, `skills`, `contact`.

    The sections are EMPTY shells — Phase 4 fills them with Hero, About, Projects, Skills, Contact content. Phase 3 ships only the structural placeholders.

    Constraints:
    - Remove the existing `<main>` wrapper from page.tsx — the `<main>` lives in the parent layout now per Plan 02 Task 2.
    - DO NOT add any content or styling to the sections beyond minimum-viable structure (a title via `useTranslations('nav')` and a "Phase 4 placeholder" caption).
    - DO NOT use `motion` or `gsap` here — animations come in Phase 4.
    - DO NOT add color literals.
    - Each section must have `id="<canonical-id>"`.

    Required final content:

    ```typescript
    import { useTranslations } from 'next-intl';

    export default function HomePage() {
      const tNav = useTranslations('nav');
      return (
        <>
          <section id="home" className="min-h-screen flex items-center justify-center">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-semibold">{tNav('home')}</h1>
              <p className="text-muted-foreground text-sm">Phase 4 — Hero placeholder</p>
            </div>
          </section>
          <section id="about" className="min-h-screen flex items-center justify-center">
            <h2 className="text-3xl font-semibold">{tNav('about')}</h2>
          </section>
          <section id="projects" className="min-h-screen flex items-center justify-center">
            <h2 className="text-3xl font-semibold">{tNav('projects')}</h2>
          </section>
          <section id="skills" className="min-h-screen flex items-center justify-center">
            <h2 className="text-3xl font-semibold">{tNav('skills')}</h2>
          </section>
          <section id="contact" className="min-h-screen flex items-center justify-center">
            <h2 className="text-3xl font-semibold">{tNav('contact')}</h2>
          </section>
        </>
      );
    }
    ```
  </action>
  <verify>
    <automated>npm run build && npm run lint</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/page.tsx` contains the literal string `id="home"`.
    - `app/[locale]/page.tsx` contains the literal string `id="about"`.
    - `app/[locale]/page.tsx` contains the literal string `id="projects"`.
    - `app/[locale]/page.tsx` contains the literal string `id="skills"`.
    - `app/[locale]/page.tsx` contains the literal string `id="contact"`.
    - `app/[locale]/page.tsx` does NOT contain a `<main>` element (main now lives in the layout).
    - `app/[locale]/page.tsx` contains the literal string `useTranslations('nav')`.
    - `app/[locale]/page.tsx` does NOT contain any hex (`#[0-9a-fA-F]{3,6}`), `rgb(`, `hsl(`, or `oklch(` color literal.
    - `npm run build` exits 0.
    - `npm run lint` exits 0.
  </acceptance_criteria>
  <done>5 placeholder section shells exist with canonical IDs; nav IntersectionObserver (Plan 03) will have observe-targets when rendered.</done>
</task>

</tasks>

<verification>
- `app/[locale]/layout.tsx` mounts the full D-11 provider tree (NextIntlClientProvider > ThemeProvider > LenisProvider > [ConsoleArt + Navigation + main + Footer + CustomCursor + PaletteFab]).
- Inter font is wired with subsets=['latin','latin-ext'], variable='--font-sans', display='swap', preload=true.
- `app/globals.css` `@theme inline` includes `--font-sans` referencing `var(--font-sans, ...)`.
- 4 stub component files exist with correct named exports; build resolves them.
- 5 placeholder `<section id="…">` shells in `app/[locale]/page.tsx`.
- `app/[locale]/layout.tsx` stays a Server Component (no `'use client'`).
- `app/[locale]/layout.tsx` defines `generateMetadata` with localized title + description.
- `npm run build` + `npm run lint` + `npm test` all exit 0.
</verification>

<success_criteria>
Every page under `/fr/*` and `/en/*` is wrapped by the full Phase 3 provider tree and renders Inter as the body font. The IntersectionObserver in Plan 03 will find its 5 section targets. Wave 2 plans (03, 04) and Wave 3 plan (05) can now ship the real Navigation / LanguageSwitcher / Footer / CustomCursor / ConsoleArt component bodies WITHOUT touching the layout file.
</success_criteria>

<output>
After completion, create `.planning/phases/03-layout-animation-foundation/03-02-SUMMARY.md` documenting:
- The exact Inter() config used and the @theme inline addition.
- The final shape of the D-11 provider tree as it now exists in `[locale]/layout.tsx`.
- Confirmation that 4 stub component files were created with correct named exports.
- Confirmation that `[locale]/page.tsx` ships 5 placeholder sections with canonical IDs (home/about/projects/skills/contact).
- Confirmation that the root layout stays a Server Component (no `'use client'`).
</output>
