'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

export type MDXImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

/**
 * <Image> MDX component — click-to-zoom modal via shadcn Dialog (D-09, CONTENT-03).
 *
 * D-09 contract:
 *   - 'use client' (owns Dialog open state).
 *   - data-lenis-prevent on <DialogContent> (LenisProvider D-04 contract) so
 *     scrolling inside the zoom modal does not move the page behind it.
 *   - usePrefersReducedMotion() gates the hover scale 1.0 → 1.02 / 200ms cue.
 *   - aria-label via projects.detail.imageZoom i18n key.
 *   - Props mirror next/image (src/alt/width/height); optional caption renders
 *     under the inline image.
 *   - Esc / backdrop close via Radix Dialog defaults.
 *
 * Pitfall 5C: data-lenis-prevent goes ONLY on DialogContent — NOT the Overlay
 * (a fixed backdrop, not scrollable) and NOT the Trigger (the click target).
 */
export default function MDXImage({
  src,
  alt,
  width,
  height,
  caption,
}: MDXImageProps) {
  const t = useTranslations('projects.detail');
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          type="button"
          aria-label={t('imageZoom')}
          whileHover={reducedMotion ? undefined : { scale: 1.02 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="my-6 block w-full cursor-zoom-in overflow-hidden rounded-lg"
        >
          <NextImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="(max-width: 768px) 100vw, 800px"
            loading="lazy"
            className="h-auto w-full object-cover"
          />
          {caption && (
            <span className="mt-2 block text-sm text-muted-foreground">
              {caption}
            </span>
          )}
        </motion.button>
      </DialogTrigger>
      <DialogContent
        data-lenis-prevent
        showCloseButton={true}
        className="max-h-screen w-full max-w-7xl p-2"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="100vw"
          className="h-auto max-h-[90vh] w-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
