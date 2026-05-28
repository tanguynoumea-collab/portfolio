---
phase: 06-seo-accessibility-polish
plan: 01
type: execute
wave: 1
depends_on: ["06-00"]
files_modified:
  - lib/og.tsx
  - app/[locale]/opengraph-image.tsx
  - app/[locale]/projects/[slug]/opengraph-image.tsx
  - app/[locale]/layout.tsx
  - app/[locale]/projects/[slug]/page.tsx
  - app/sitemap.ts
  - app/robots.ts
  - lib/og.test.ts
  - app/[locale]/layout.metadata.test.ts
  - app/[locale]/projects/[slug]/metadata.test.ts
  - app/sitemap.test.ts
  - app/robots.test.ts
autonomous: true
requirements: [A11Y-01, A11Y-02]
must_haves:
  truths:
    - "Root generateMetadata returns metadataBase + openGraph(type:website) + twitter + alternates.languages(fr-FR/en-US/x-default) + canonical"
    - "Project generateMetadata returns openGraph(type:article) + per-project title/summary + hreflang + canonical"
    - "hreflang map resolves fr-FR to SITE_URL/, en-US to SITE_URL/en, x-default to SITE_URL/ (as-needed, via getPathname)"
    - "Two opengraph-image.tsx routes (home + project[slug]) render branded Terra cards via next/og ImageResponse with the bundled Inter font"
    - "OG colors derive from oklchToHex(PALETTES[0].*) — no raw hex literals in OG files"
    - "sitemap() returns 13 entries (1 home + 12 projects) each with fr/en alternates"
    - "robots() allows /, disallows /api/, references SITE_URL/sitemap.xml"
    - "PaletteFouCScript + suppressHydrationWarning in layout.tsx are UNCHANGED (no FOUC regression)"
  artifacts:
    - path: "lib/og.tsx"
      provides: "Shared Satori-safe OgCard + OG_COLORS(Terra hex) + OG_SIZE"
      contains: "oklchToHex"
    - path: "app/[locale]/opengraph-image.tsx"
      provides: "Home OG card via ImageResponse"
      contains: "ImageResponse"
    - path: "app/[locale]/projects/[slug]/opengraph-image.tsx"
      provides: "Project OG card (await params)"
      contains: "ImageResponse"
    - path: "app/sitemap.ts"
      provides: "MetadataRoute.Sitemap, getProjectSlugs-driven"
      exports: ["default"]
      contains: "getProjectSlugs"
    - path: "app/robots.ts"
      provides: "MetadataRoute.Robots"
      exports: ["default"]
      contains: "disallow"
  key_links:
    - from: "app/[locale]/layout.tsx"
      to: "@/i18n/navigation getPathname"
      via: "hreflang alternates.languages"
      pattern: "getPathname"
    - from: "lib/og.tsx"
      to: "lib/colors oklchToHex + lib/palettes PALETTES[0]"
      via: "Terra-to-hex OG colors"
      pattern: "oklchToHex\\(.*terra|PALETTES\\[0\\]"
    - from: "app/sitemap.ts"
      to: "lib/projects getProjectSlugs"
      via: "project route enumeration"
      pattern: "getProjectSlugs"
---

<objective>
Deliver A11Y-01 (full per-route metadata + dynamic branded OG cards) and A11Y-02 (sitemap + robots). Expand the existing minimal `generateMetadata` in the root layout (title + description only) and the project page (title only) to full SEO: `metadataBase`, `openGraph`, `twitter`, hreflang `alternates.languages` + `canonical`, all locale-aware via next-intl `getPathname` (as-needed-aware — fr at `/`, en at `/en`). Add two dynamic `next/og` OG cards (home + project) using the bundled Inter font and Terra brand colors via `oklchToHex`. Add `app/sitemap.ts` (13 entries with alternates) and `app/robots.ts`.

Purpose: Recruiters find the portfolio via search and share it on social — branded OG cards + correct hreflang + a crawlable sitemap are the SEO baseline. Dynamic OG cards also demonstrate the "attention au détail" core value.
Output: lib/og.tsx, 2 opengraph-image.tsx files, layout.tsx + project page.tsx metadata expansions, app/sitemap.ts, app/robots.ts, + 5 unit test files.
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
<!-- Verified contracts the executor consumes — no codebase exploration needed. -->

lib/constants.ts (after 06-00): `export const SITE_URL` — env-aware, trailing-slash-stripped. Also EMAIL/GITHUB_URL/LINKEDIN_URL.

i18n/navigation.ts exports: `Link, redirect, usePathname, useRouter, getPathname` from `createNavigation(routing)`. `getPathname({ href, locale })` returns the as-needed pathname (fr → '/', en → '/en'). For dynamic hrefs the repo casts string hrefs with `as never` (see page.tsx prev/next links) — try the plain string `/projects/${slug}` first, add `as never` only if TS complains.

i18n/routing.ts: `localePrefix: 'as-needed'`, `defaultLocale: 'fr'`, `locales: ['fr','en']`. Import `routing` for `routing.defaultLocale`.

lib/colors.ts exports `oklchToHex(oklch: string): string` (falls back to '#ffffff' on parse fail).

lib/palettes.ts: `PALETTES[0]` is Terra with token fields `.bg .surface .text .textMuted .accent .secondary` (all OKLCh strings) + `.id` ('terra') + `.name`.

lib/projects.ts: `getProjectSlugs(): Promise<string[]>` (skips `_*` templates, returns the 6 slugs). `getProjectBySlug(slug, locale): Promise<Project | null>`. `Project` has `.title .summary .year .category` (+ category-specific fields). `type Locale`.

app/[locale]/layout.tsx CURRENT generateMetadata (EXPAND, do not rewrite the component):
```ts
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return { title: 'Tanguy Delrieu — Tech × Design × BIM', description: t('tagline') };
}
```
The DEFAULT component renders `<head><PaletteFouCScript /></head>` + `<html ... suppressHydrationWarning>` — DO NOT TOUCH these (FOUC regression guard, Pitfall 6).

app/[locale]/projects/[slug]/page.tsx CURRENT generateMetadata (EXPAND):
```ts
export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  return { title: `${project.title} — Tanguy Delrieu` };
}
```
This file already imports `getProjectBySlug, getProjectSlugs, type Locale` and `routing`. The page is a Server Component; `generateMetadata` is a separate export — expanding it does NOT touch the page body.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Shared OG layout helper (lib/og.tsx) + both opengraph-image.tsx routes</name>
  <read_first>
    - 06-RESEARCH.md §4 (lib/og.tsx + home OG + project OG verbatim snippets; Open Q1 verdict on Node runtime + readFile + Satori flexbox-only)
    - lib/colors.ts oklchToHex signature + lib/palettes.ts PALETTES[0] token fields (see interfaces)
    - lib/projects.ts getProjectBySlug + type Locale
    - assets/Inter-SemiBold.ttf (bundled in 06-00)
  </read_first>
  <action>
    Create `lib/og.tsx` — the shared Satori-safe JSX + Terra-hex colors (the ONE sanctioned hex boundary; colors derive via `oklchToHex`, never hand-typed). VERBATIM from 06-RESEARCH §4:

    ```tsx
    // lib/og.tsx — shared Satori-safe JSX + Terra hex (the ONE sanctioned hex boundary)
    import { PALETTES } from '@/lib/palettes';
    import { oklchToHex } from '@/lib/colors';

    const terra = PALETTES[0]!; // DEFAULT_PALETTE_ID === 'terra' (PALETTES[0])
    export const OG_COLORS = {
      bg: oklchToHex(terra.bg),
      surface: oklchToHex(terra.surface),
      text: oklchToHex(terra.text),
      textMuted: oklchToHex(terra.textMuted),
      accent: oklchToHex(terra.accent),
      secondary: oklchToHex(terra.secondary),
    };

    export const OG_SIZE = { width: 1200, height: 630 } as const;

    // Satori: flex ONLY, no grid. Every multi-child div sets display:flex.
    export function OgCard(props: { title: string; subtitle: string; badge?: string }) {
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', backgroundColor: OG_COLORS.bg,
          padding: '64px', fontFamily: 'Inter',
        }}>
          <div style={{ display: 'flex', height: '12px', width: '160px', backgroundColor: OG_COLORS.accent, borderRadius: '6px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {props.badge && (
              <div style={{ display: 'flex', alignSelf: 'flex-start', backgroundColor: OG_COLORS.secondary, color: OG_COLORS.bg, fontSize: 28, padding: '6px 18px', borderRadius: '999px', marginBottom: '20px' }}>
                {props.badge}
              </div>
            )}
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 600, color: OG_COLORS.text, lineHeight: 1.1 }}>{props.title}</div>
            <div style={{ display: 'flex', fontSize: 36, color: OG_COLORS.textMuted, marginTop: '16px' }}>{props.subtitle}</div>
          </div>
        </div>
      );
    }
    ```

    Create `app/[locale]/opengraph-image.tsx` (home OG) VERBATIM from 06-RESEARCH §4. Node runtime (default — `readFile` from disk), statically optimized at build:

    ```tsx
    import { ImageResponse } from 'next/og';
    import { readFile } from 'node:fs/promises';
    import { join } from 'node:path';
    import { OgCard, OG_SIZE } from '@/lib/og';

    export const alt = 'Tanguy Delrieu — Tech × Design × BIM';
    export const size = OG_SIZE;
    export const contentType = 'image/png';

    export default async function Image() {
      const inter = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));
      return new ImageResponse(
        <OgCard title="Tanguy Delrieu" subtitle="Tech × Design × BIM" />,
        { ...size, fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }] },
      );
    }
    ```

    Create `app/[locale]/projects/[slug]/opengraph-image.tsx` (project OG — `params` is a Promise in Next 16, `await` it) VERBATIM from 06-RESEARCH §4:

    ```tsx
    import { ImageResponse } from 'next/og';
    import { readFile } from 'node:fs/promises';
    import { join } from 'node:path';
    import { OgCard, OG_SIZE } from '@/lib/og';
    import { getProjectBySlug, type Locale } from '@/lib/projects';

    export const alt = 'Project — Tanguy Delrieu';
    export const size = OG_SIZE;
    export const contentType = 'image/png';

    export default async function Image({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
      const { locale, slug } = await params;
      const project = await getProjectBySlug(slug, locale);
      const inter = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));
      return new ImageResponse(
        <OgCard
          title={project?.title ?? 'Tanguy Delrieu'}
          subtitle={String(project?.year ?? '')}
          badge={project?.category?.toUpperCase()}
        />,
        { ...size, fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }] },
      );
    }
    ```

    CRITICAL Satori constraints (Pitfall 1): flexbox ONLY (NO `display:grid`); every multi-child `<div>` sets `display:'flex'`; inline `style={{}}` only (no Tailwind classes — Satori doesn't run Tailwind). Do NOT add `export const runtime = 'edge'` — the default Node runtime is required because we `readFile` from disk.

    Create `lib/og.test.ts` asserting OG_COLORS are valid hex (derived, not the fallback) and OG_SIZE is 1200×630:

    ```ts
    import { describe, it, expect } from 'vitest';
    import { OG_COLORS, OG_SIZE } from './og';
    describe('lib/og — Terra brand colors', () => {
      it('OG_SIZE is 1200x630', () => {
        expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
      });
      it('every OG color is a valid hex (derived from Terra, not the #ffffff fallback)', () => {
        for (const [k, v] of Object.entries(OG_COLORS)) {
          expect(v, `${k}=${v}`).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
        // accent must NOT be the parse-fail fallback
        expect(OG_COLORS.accent).not.toBe('#ffffff');
      });
    });
    ```
  </action>
  <verify>
    <automated>npx vitest run lib/og.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `lib/og.tsx` contains `oklchToHex` and imports `PALETTES` (no raw 6-digit hex literal in the file — grep for `#[0-9a-fA-F]{6}` returns nothing)
    - `app/[locale]/opengraph-image.tsx` contains `ImageResponse` and `readFile` and `assets/Inter-SemiBold.ttf`; does NOT contain `runtime = 'edge'` and does NOT contain `display: 'grid'`
    - `app/[locale]/projects/[slug]/opengraph-image.tsx` contains `ImageResponse` and `await params`
    - `npx vitest run lib/og.test.ts` exits 0 (OG_COLORS all valid hex, accent != #ffffff, OG_SIZE 1200×630)
  </acceptance_criteria>
  <done>Shared OgCard + both OG routes render branded Terra cards via next/og; colors derived from palette; og.test green.</done>
</task>

<task type="auto">
  <name>Task 2: Expand root + project generateMetadata (metadataBase, OG, twitter, hreflang via getPathname)</name>
  <read_first>
    - app/[locale]/layout.tsx (current generateMetadata + the FOUC head — see interfaces; DO NOT touch the component/head)
    - app/[locale]/projects/[slug]/page.tsx (current title-only generateMetadata + its existing imports)
    - 06-RESEARCH.md §1 (root expansion + hreflangMap), §3 (project expansion + getPathname typed-href note), Pitfall 2 (as-needed hreflang), Pitfall 6 (FOUC regression guard)
    - i18n/navigation.ts getPathname + i18n/routing.ts routing.defaultLocale
  </read_first>
  <action>
    Edit `app/[locale]/layout.tsx` — REPLACE ONLY the `generateMetadata` function body (keep `generateStaticParams`, the `inter` font, and the entire default `LocaleLayout` component including `<head><PaletteFouCScript/></head>` and `suppressHydrationWarning` UNCHANGED). Add the new imports at the top (`getPathname`, `routing`, `SITE_URL`). Use the verbatim 06-RESEARCH §1 pattern:

    ```tsx
    import { getPathname } from '@/i18n/navigation';
    import { SITE_URL } from '@/lib/constants';
    // routing is already imported in layout.tsx

    function hreflangMap(href: string) {
      return {
        'fr-FR': `${SITE_URL}${getPathname({ href, locale: 'fr' })}`,
        'en-US': `${SITE_URL}${getPathname({ href, locale: 'en' })}`,
        'x-default': `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
      };
    }

    export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
      const { locale } = await params;
      const t = await getTranslations({ locale, namespace: 'hero' });
      const canonical = `${SITE_URL}${getPathname({ href: '/', locale })}`;
      return {
        metadataBase: new URL(SITE_URL),
        title: 'Tanguy Delrieu — Tech × Design × BIM',
        description: t('tagline'),
        alternates: { canonical, languages: hreflangMap('/') },
        openGraph: {
          type: 'website',
          locale: locale === 'fr' ? 'fr_FR' : 'en_US',
          title: 'Tanguy Delrieu — Tech × Design × BIM',
          description: t('tagline'),
          siteName: 'Tanguy Delrieu',
          url: canonical,
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Tanguy Delrieu — Tech × Design × BIM',
          description: t('tagline'),
        },
      };
    }
    ```
    Note: do NOT manually list the OG image in `openGraph.images` — the file-based `opengraph-image.tsx` auto-injects `og:image`.

    Edit `app/[locale]/projects/[slug]/page.tsx` — REPLACE ONLY the `generateMetadata` function (keep `dynamicParams`, `generateStaticParams`, and the default `ProjectPage` component UNCHANGED). Add the new imports (`getPathname`, `SITE_URL`; `routing` is already imported). Verbatim 06-RESEARCH §3:

    ```tsx
    import { getPathname } from '@/i18n/navigation';
    import { SITE_URL } from '@/lib/constants';

    export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
      const { locale, slug } = await params;
      const project = await getProjectBySlug(slug, locale);
      if (!project) return {};
      const href = `/projects/${slug}`;
      const canonical = `${SITE_URL}${getPathname({ href, locale })}`;
      return {
        title: `${project.title} — Tanguy Delrieu`,
        description: project.summary,
        alternates: {
          canonical,
          languages: {
            'fr-FR': `${SITE_URL}${getPathname({ href, locale: 'fr' })}`,
            'en-US': `${SITE_URL}${getPathname({ href, locale: 'en' })}`,
            'x-default': `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
          },
        },
        openGraph: {
          type: 'article',
          locale: locale === 'fr' ? 'fr_FR' : 'en_US',
          title: project.title,
          description: project.summary,
          url: canonical,
        },
        twitter: { card: 'summary_large_image', title: project.title, description: project.summary },
      };
    }
    ```
    Add `import type { Metadata } from 'next';` to the project page (the current signature has no return type annotation — add `: Promise<Metadata>`). If TS rejects the plain string `href` in `getPathname`, cast as the repo does elsewhere: `getPathname({ href: href as never, locale })` (runtime is identical).

    Write `app/[locale]/layout.metadata.test.ts` — call `generateMetadata({ params })` and assert the shape:

    ```ts
    import { describe, it, expect, vi } from 'vitest';
    // Mock next-intl/server getTranslations to return a flat resolver (tagline → a string).
    vi.mock('next-intl/server', () => ({
      getTranslations: vi.fn(async () => (key: string) => `t:${key}`),
    }));
    import { generateMetadata } from './layout';
    import { SITE_URL } from '@/lib/constants';

    describe('root generateMetadata (A11Y-01)', () => {
      it('returns metadataBase + openGraph(website) + twitter + hreflang(fr/en/x-default)', async () => {
        const md = await generateMetadata({ params: Promise.resolve({ locale: 'fr' }) } as never);
        expect(String(md.metadataBase)).toContain(SITE_URL.replace(/^https?:\/\//, ''));
        expect(md.openGraph?.type).toBe('website');
        expect(md.twitter && (md.twitter as { card?: string }).card).toBe('summary_large_image');
        const langs = md.alternates?.languages as Record<string, string>;
        expect(langs['fr-FR']).toBe(`${SITE_URL}/`);
        expect(langs['en-US']).toBe(`${SITE_URL}/en`);
        expect(langs['x-default']).toBe(`${SITE_URL}/`);
        expect(md.alternates?.canonical).toBe(`${SITE_URL}/`);
      });
    });
    ```

    Write `app/[locale]/projects/[slug]/metadata.test.ts` — mock `getProjectBySlug` to return a fixture project, assert `type:'article'`, per-project title/summary, and hreflang:

    ```ts
    import { describe, it, expect, vi } from 'vitest';
    vi.mock('@/lib/projects', () => ({
      getProjectBySlug: vi.fn(async () => ({ title: 'Texture Manager', summary: 'A tool.', year: 2024, category: 'tech' })),
      getProjectSlugs: vi.fn(async () => ['texture-manager']),
    }));
    import { generateMetadata } from './page';
    import { SITE_URL } from '@/lib/constants';

    describe('project generateMetadata (A11Y-01)', () => {
      it('returns type:article + per-project OG + hreflang', async () => {
        const md = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'texture-manager' }) } as never);
        expect(md.title).toBe('Texture Manager — Tanguy Delrieu');
        expect(md.description).toBe('A tool.');
        expect(md.openGraph?.type).toBe('article');
        const langs = md.alternates?.languages as Record<string, string>;
        expect(langs['fr-FR']).toBe(`${SITE_URL}/projects/texture-manager`);
        expect(langs['en-US']).toBe(`${SITE_URL}/en/projects/texture-manager`);
      });
      it('returns {} when project not found', async () => {
        const { getProjectBySlug } = await import('@/lib/projects');
        (getProjectBySlug as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce(null);
        const md = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'nope' }) } as never);
        expect(md).toEqual({});
      });
    });
    ```
    If importing `./page` pulls in the MDX dynamic import and breaks in jsdom, the test only calls `generateMetadata` (not the default export) — but if the module top-level imports cause issues, mock `@/components/sections/ProjectCover` and `@/components/mdx/Image` as no-op components too (match the existing `page.test.tsx` mock shape).
  </action>
  <verify>
    <automated>npx vitest run "app/[locale]/layout.metadata.test.ts" "app/[locale]/projects/[slug]/metadata.test.ts"</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/layout.tsx` `generateMetadata` contains `metadataBase`, `openGraph`, `twitter`, `alternates`, `getPathname`; the file STILL contains `PaletteFouCScript` and `suppressHydrationWarning` (FOUC guard intact)
    - `app/[locale]/projects/[slug]/page.tsx` `generateMetadata` contains `type: 'article'` and `getPathname` and `project.summary`
    - layout.metadata.test asserts `fr-FR` → `${SITE_URL}/`, `en-US` → `${SITE_URL}/en`, `x-default` → `${SITE_URL}/`; project test asserts `type:'article'` + per-project hreflang
    - `npx vitest run` on both metadata test files exits 0
  </acceptance_criteria>
  <done>Both generateMetadata expanded with full OG/twitter/hreflang via getPathname; FOUC script untouched; metadata tests green.</done>
</task>

<task type="auto">
  <name>Task 3: app/sitemap.ts + app/robots.ts + tests</name>
  <read_first>
    - 06-RESEARCH.md §5 (sitemap.ts verbatim + the canonical-loc-with-alternates structure note), §6 (robots.ts verbatim)
    - lib/projects.ts getProjectSlugs (returns 6 slugs, skips _*)
    - i18n/navigation.ts getPathname, lib/constants.ts SITE_URL
  </read_first>
  <action>
    Create `app/sitemap.ts` VERBATIM from 06-RESEARCH §5 (canonical `<loc>` = fr at `/` + per-entry fr/en alternates; 1 home + N projects). For dynamic hrefs, cast with `as never` if TS complains (the repo precedent):

    ```ts
    import type { MetadataRoute } from 'next';
    import { getPathname } from '@/i18n/navigation';
    import { SITE_URL } from '@/lib/constants';
    import { getProjectSlugs } from '@/lib/projects';

    function abs(href: string, locale: 'fr' | 'en') {
      return `${SITE_URL}${getPathname({ href: href as never, locale })}`;
    }

    export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
      const slugs = await getProjectSlugs(); // skips _* templates (D-24)
      const now = new Date();

      const home: MetadataRoute.Sitemap[number] = {
        url: abs('/', 'fr'),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 1,
        alternates: { languages: { 'fr-FR': abs('/', 'fr'), 'en-US': abs('/', 'en') } },
      };

      const projects: MetadataRoute.Sitemap = slugs.map((slug) => {
        const href = `/projects/${slug}`;
        return {
          url: abs(href, 'fr'),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
          alternates: { languages: { 'fr-FR': abs(href, 'fr'), 'en-US': abs(href, 'en') } },
        };
      });

      return [home, ...projects];
    }
    ```
    Structure choice (document in SUMMARY): canonical-`<loc>`-with-alternates (Google-preferred, matches Next docs localized example). Each entry's `<loc>` is the fr canonical (`/` resolves canonical, `/projects/{slug}` for projects), with fr/en `<xhtml:link>` alternates covering both locales. This satisfies A11Y-02 ("covering /, /fr, /en, project pages") — `/fr` redirects to `/` under as-needed so the canonical is `/`, and `/en` is in the alternates.

    Create `app/robots.ts` VERBATIM from 06-RESEARCH §6:

    ```ts
    import type { MetadataRoute } from 'next';
    import { SITE_URL } from '@/lib/constants';

    export default function robots(): MetadataRoute.Robots {
      return {
        rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
        sitemap: `${SITE_URL}/sitemap.xml`,
      };
    }
    ```

    Write `app/sitemap.test.ts` — mock `getProjectSlugs` to return the 6 real slugs, assert 13 entries (1 home + 12... NO: 6 slugs → 1 home + 6 project entries = 7 entries; each project entry has fr+en alternates, so the URL COUNT across alternates is 1 + 6*2 = 13). The entry COUNT is 7 (1 home + 6 projects). The VALIDATION.md "13 entries" counts fr+en URLs (1 home counted once as canonical + its 2 alternates, 6 projects × 2). Assert BOTH clearly to avoid ambiguity:

    ```ts
    import { describe, it, expect, vi } from 'vitest';
    const SLUGS = ['texture-manager', 'agora', 'design-a', 'design-b', 'bim-a', 'bim-b'];
    vi.mock('@/lib/projects', () => ({ getProjectSlugs: vi.fn(async () => SLUGS) }));
    import sitemap from './sitemap';
    import { SITE_URL } from '@/lib/constants';

    describe('sitemap (A11Y-02)', () => {
      it('returns 1 home + 6 project entries (7 entries), each with fr/en alternates', async () => {
        const entries = await sitemap();
        expect(entries).toHaveLength(1 + SLUGS.length); // 7 entries
        // home canonical = fr at /
        expect(entries[0]!.url).toBe(`${SITE_URL}/`);
        expect(entries[0]!.alternates?.languages?.['en-US']).toBe(`${SITE_URL}/en`);
        // every entry has both fr/en alternates → 13 total alternate URLs
        const altUrls = entries.flatMap((e) => Object.values(e.alternates?.languages ?? {}));
        expect(altUrls).toHaveLength(2 * (1 + SLUGS.length)); // 14 alternate URLs (fr+en per entry)
        // project entry canonical = fr /projects/{slug}
        const proj = entries.find((e) => e.url.includes('/projects/texture-manager'));
        expect(proj?.alternates?.languages?.['en-US']).toBe(`${SITE_URL}/en/projects/texture-manager`);
      });
    });
    ```
    Use the REAL slug list — read it from the actual project MDX filenames if they differ from the placeholder above (the 2 Tech are texture-manager + agora per CONTENT-01; design/bim slugs per content/projects/). If unsure of exact slugs, the test should derive the expected count from the mocked SLUGS array length rather than hardcoding 6 — keep it slug-list-driven.

    Write `app/robots.test.ts`:

    ```ts
    import { describe, it, expect } from 'vitest';
    import robots from './robots';
    import { SITE_URL } from '@/lib/constants';

    describe('robots (A11Y-02)', () => {
      it('allows /, disallows /api/, references the sitemap', () => {
        const r = robots();
        const rule = Array.isArray(r.rules) ? r.rules[0]! : r.rules!;
        expect(rule.allow).toBe('/');
        expect(rule.disallow).toBe('/api/');
        expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
      });
    });
    ```
  </action>
  <verify>
    <automated>npx vitest run app/sitemap.test.ts app/robots.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `app/sitemap.ts` exists, default-exports an async function, imports `getProjectSlugs`, returns entries with `alternates.languages` (fr-FR + en-US)
    - `app/robots.ts` exists, default-exports `robots()`, contains `disallow: '/api/'` and `allow: '/'` and `${SITE_URL}/sitemap.xml`
    - sitemap.test asserts `1 + slugs.length` entries, home canonical `${SITE_URL}/`, en alternate `${SITE_URL}/en`, project en alternate `${SITE_URL}/en/projects/texture-manager`
    - `npx vitest run app/sitemap.test.ts app/robots.test.ts` exits 0
  </acceptance_criteria>
  <done>sitemap.ts (slug-driven, alternates) + robots.ts (/api disallow, sitemap ref) with passing tests.</done>
</task>

</tasks>

<verification>
- `npx vitest run lib/og.test.ts "app/[locale]/layout.metadata.test.ts" "app/[locale]/projects/[slug]/metadata.test.ts" app/sitemap.test.ts app/robots.test.ts` all green
- `npm run build` succeeds AND the build output emits `opengraph-image` routes for the home + each project route (HUMAN-UAT proxy: grep `.next` for opengraph-image; visiting `/en/opengraph-image` in dev renders a branded card)
- layout.tsx FOUC script + suppressHydrationWarning unchanged (diff check — Pitfall 6)
- No raw hex literal in lib/og.tsx (colors via oklchToHex); no `display:grid`, no `runtime='edge'` in OG files
</verification>

<success_criteria>
A11Y-01: root + project metadata return metadataBase + OG + twitter + hreflang(fr/en/x-default) + canonical via getPathname; two dynamic branded OG cards render via next/og with the bundled Inter font and Terra-derived hex colors. A11Y-02: sitemap covers home + all project pages with per-entry fr/en alternates; robots allows all except /api/ and references the sitemap. Zero new dependencies (next/og built-in).
</success_criteria>

<output>
After completion, create `.planning/phases/06-seo-accessibility-polish/06-01-SUMMARY.md`
</output>
