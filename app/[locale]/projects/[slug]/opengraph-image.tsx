/**
 * app/[locale]/projects/[slug]/opengraph-image.tsx — project OG card (A11Y-01, D-04).
 *
 * Dynamic [slug] segment: `params` is a Promise in Next 16 — `await` it. The
 * route is colocated under [slug] (which has generateStaticParams +
 * dynamicParams = false in page.tsx), so the OG images prerender for every
 * generated route at build. Next auto-injects this as the project's og:image.
 *
 * Node runtime (default) — REQUIRED for the `readFile` font load. No edge.
 */
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OgCard, OG_SIZE } from '@/lib/og';
import { getProjectBySlug, type Locale } from '@/lib/projects';

export const alt = 'Project — Tanguy Delrieu';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  const inter = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));
  return new ImageResponse(
    <OgCard
      title={project?.title ?? 'Tanguy Delrieu'}
      subtitle={String(project?.year ?? '')}
      badge={project?.category?.toUpperCase()}
    />,
    {
      ...size,
      fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }],
    },
  );
}
