/**
 * app/[locale]/opengraph-image.tsx — home OG card (A11Y-01, D-04).
 *
 * File-based metadata route: Next auto-injects `og:image` (+ twitter:image)
 * pointing here for the [locale] segment, so layout.tsx's generateMetadata does
 * NOT list it manually. Statically optimized at build time (no dynamic data).
 *
 * Node runtime (the default for file-based metadata routes) — REQUIRED because
 * we `readFile` the bundled Inter font from disk. Do NOT add
 * `export const runtime = 'edge'` (edge has no fs access to process.cwd()).
 */
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OgCard, OG_SIZE } from '@/lib/og';

export const alt = 'Tanguy Delrieu — Ingénieur BIM';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  const inter = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));
  return new ImageResponse(
    <OgCard title="Tanguy Delrieu" subtitle="Ingénieur BIM" />,
    {
      ...size,
      fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }],
    },
  );
}
