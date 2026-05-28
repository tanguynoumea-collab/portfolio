/**
 * app/[locale]/projects/[slug]/page.tsx — CONTENT-02 + ANIM-02 (Wave 2 integrator).
 *
 * Async Server Component project detail page. Renders the long-form magazine
 * layout (D-04): full-width cover hero with parallax → metadata strip →
 * MDX body (max-w-prose) → optional gallery grid → footer (back + prev/next).
 *
 * Key contracts:
 *   - dynamicParams = false (Pattern 1): only the 12 generated routes render;
 *     unknown slugs 404 without on-demand rendering.
 *   - generateStaticParams returns ALL locale × slug combos (12 = 6 × 2, D-06).
 *   - getProjectBySlug → notFound() on null (D-07).
 *   - CRITICAL (Pitfall 5B): the MDX is loaded via a RELATIVE dynamic import path
 *     (../../../../content/projects/...), NOT the @/ alias — Turbopack's
 *     static-analysis can only resolve relative-path template literals in prod.
 *     Destructured as { default: MDXContent } so @types/mdx narrows the type.
 *   - prev/next wrap around via modulo over getProjectSlugs() (D-08).
 *
 * This is a Server Component (no client directive at module top). Only the cover
 * (ProjectCover), the MDX Image and CodeBlock components are client; they nest
 * fine inside this server tree. The mdx-components.tsx registry auto-injects on
 * the import.
 *
 * Colors: every surface uses palette-aliased Tailwind utilities (bg-card,
 * text-muted-foreground, border-border, bg-muted/30, etc.) — zero hardcoded
 * colors. The only fixed color in Phase 5 is the cover gradient scrim, which
 * lives in ProjectCover (a black gradient over a photo, not a themeable surface).
 *
 * Phase 3 D-23: lucide-react v1.16 ships without the `Github` brand icon, so the
 * repo link uses `Code2` (same substitution Footer/Contact made for GitHub).
 */

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { getProjectBySlug, getProjectSlugs, type Locale } from '@/lib/projects';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { ProjectCover } from '@/components/sections/ProjectCover';
import MDXImage from '@/components/mdx/Image';

// Pattern 1 (D-06/D-07): only the statically-generated routes render; an unknown
// slug 404s without any on-demand rendering attempt.
export const dynamicParams = false;

// Next 16 async-params contract.
type Params = Promise<{ locale: Locale; slug: string }>;

/**
 * D-06: pre-render every locale × slug combination (12 entries for 6 projects × 2
 * locales). Future projects need only an MDX file — no code change here.
 */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

/**
 * Minimal page title (D-15 discretion). Phase 6 (A11Y-01) expands with OG image,
 * hreflang alternates, twitter:card, and description.
 */
export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  return { title: `${project.title} — Tanguy Delrieu` };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();

  // CRITICAL (Pitfall 5B): RELATIVE path, NOT the @/ alias. From
  // app/[locale]/projects/[slug]/ up 4 levels (slug → projects → [locale] → app →
  // repo root) into content/projects/. The @next/mdx pipeline (remark-gfm +
  // rehype-pretty-code) runs automatically; mdx-components.tsx auto-injects.
  const { default: MDXContent } = await import(
    `../../../../content/projects/${slug}.${locale}.mdx`
  );

  // Prev/next with wrap-around (D-08). Slugs are locale-agnostic (from the .fr.mdx
  // set); modulo cycles last → first and first → last.
  const slugs = await getProjectSlugs();
  const idx = slugs.indexOf(slug);
  const nextSlug = slugs[(idx + 1) % slugs.length];
  const prevSlug = slugs[(idx - 1 + slugs.length) % slugs.length];
  const nextProject = nextSlug ? await getProjectBySlug(nextSlug, locale) : null;
  const prevProject = prevSlug ? await getProjectBySlug(prevSlug, locale) : null;

  const t = await getTranslations({ locale, namespace: 'projects.detail' });

  return (
    <article className="pb-20">
      {/* 1. Cover hero (D-04 step 1) — full-width, parallax client island. */}
      <ProjectCover src={project.cover} alt={project.title} />

      {/* 2. Metadata strip (D-04 step 2) — overlaps the bottom of the cover. */}
      <div className="-mt-32 mb-12 px-4">
        <div className="bg-card text-card-foreground mx-auto max-w-5xl rounded-lg p-6 shadow-lg">
          <h1 className="text-foreground text-3xl font-semibold md:text-4xl">
            {project.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Year. */}
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t('meta.year')}: </span>
              {project.year}
            </span>

            {/* Category badge (palette-independent fixed token, D-13). */}
            <Badge variant={`category-${project.category}`}>
              {t(`meta.${project.category}`)}
            </Badge>

            {/* Discriminated, category-specific metadata. The union narrows on
                project.category so TS knows which fields exist — no `any`, no
                casts to reach category-specific fields. */}
            {project.category === 'tech' && (
              <>
                {project.stack.slice(0, 4).map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                  >
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                    {t('meta.repo')}
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {t('meta.live')}
                  </a>
                )}
              </>
            )}

            {project.category === 'design' && (
              <>
                {project.tools.slice(0, 4).map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
                {project.client && (
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{t('meta.client')}: </span>
                    {project.client}
                  </span>
                )}
              </>
            )}

            {project.category === 'bim' && (
              <>
                {project.software.slice(0, 4).map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
                <Badge variant="outline">
                  {t(`meta.scale.${project.projectScale}`)}
                </Badge>
                {project.location && (
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{t('meta.location')}: </span>
                    {project.location}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. MDX body (D-04 step 3) — ideal reading measure. The registry
          (mdx-components.tsx) auto-injects Image/Callout/pre/a + prose styles. */}
      <div className="mx-auto max-w-prose px-4 py-12">
        <MDXContent />
      </div>

      {/* 4. Gallery grid (D-04 step 4) — renders ONLY when gallery is non-empty.
          Each cell reuses MDXImage so gallery images get click-to-zoom for free. */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="text-foreground mb-6 text-2xl font-semibold">
            {t('gallery')}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {project.gallery.map((src, i) => (
              <MDXImage
                key={src}
                src={src}
                alt={`${project.title} — ${i + 1}`}
                width={1200}
                height={800}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Footer nav (D-04 step 5) — back link + prev/next pair (wrapped). */}
      <nav className="border-border mx-auto mt-12 flex max-w-5xl flex-col gap-6 border-t px-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={{ pathname: '/', hash: 'projects' } as never}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('back')}
        </Link>

        <div className="flex items-center gap-6">
          {prevProject && (
            <Link
              href={`/projects/${prevSlug}` as never}
              className="text-muted-foreground hover:text-primary group inline-flex max-w-[40vw] items-center gap-2 text-sm"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex flex-col">
                <span className="text-muted-foreground text-xs">
                  {t('prev')}
                </span>
                <span className="truncate font-medium">
                  {prevProject.title}
                </span>
              </span>
            </Link>
          )}
          {nextProject && (
            <Link
              href={`/projects/${nextSlug}` as never}
              className="text-muted-foreground hover:text-primary group inline-flex max-w-[40vw] items-center gap-2 text-right text-sm"
            >
              <span className="flex flex-col">
                <span className="text-muted-foreground text-xs">
                  {t('next')}
                </span>
                <span className="truncate font-medium">
                  {nextProject.title}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
