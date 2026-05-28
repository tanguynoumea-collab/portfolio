'use client';

/**
 * components/sections/ProjectCover.tsx — Wave 2 client island (ANIM-02, D-04/D-05).
 *
 * Small 'use client' island wrapping the cover image in a parallax-scoped ref.
 * The project page (app/[locale]/projects/[slug]/page.tsx) is a Server Component;
 * only this cover wrapper needs 'use client' because useParallax is a client-side
 * GSAP hook (DOM access). The rest of the page stays server-rendered for SEO.
 *
 * D-04: 50vh mobile / 60vh desktop, full-width, responsive via Tailwind.
 * D-05: image rendered at scale: 1.2 so the parallax translate (max 50px upward)
 *       never reveals the wrapper's bg through the bottom edge; overflow-hidden
 *       on the wrapper clips the overshoot.
 * D-13: useParallax(ref) — defaults factor 0.3, maxTranslate 50 (match D-05).
 *
 * Pitfall 5D: the [data-parallax-image] attribute on the Image is the selector
 * useParallax animates — a data attribute, never a bare 'img' tag selector that
 * would leak to portaled images elsewhere.
 *
 * The from-black/60 gradient is an intentional fixed-opacity scrim over the photo
 * for metadata-strip legibility — the ONE sanctioned non-palette color in Phase 5
 * (a black gradient over a cover image, standard practice; NOT a themeable surface).
 */

import { useRef } from 'react';
import Image from 'next/image';
import { useParallax } from '@/lib/hooks/useParallax';

export type ProjectCoverProps = {
  src: string;
  alt: string;
};

export function ProjectCover({ src, alt }: ProjectCoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref); // Use defaults — factor 0.3, maxTranslate 50.

  return (
    <div ref={ref} className="relative h-[50vh] w-full overflow-hidden md:h-[60vh]">
      <Image
        data-parallax-image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ scale: 1.2 }}
      />
      {/* Dark gradient overlay for metadata-strip readability over any cover. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
      />
    </div>
  );
}
