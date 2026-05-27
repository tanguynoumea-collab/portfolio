'use client';

/**
 * components/sections/ProjectCard.tsx — HOME-04 Phase 4.
 *
 * Color-coded project card with hover micro-interaction and locale-aware
 * routing. Discriminated metadata footer renders different fields per
 * project.category (Tech.stack / Design.tools / BIM.software + projectScale).
 *
 * Stack (per RESEARCH Pitfall 4-I): motion.div whileHover > Link > Card.
 * The motion.div is OUTSIDE the Link so pointer-enter fires on hover —
 * Link captures pointer events and would swallow whileHover otherwise.
 *
 * Pitfall 4-B (motion useReducedMotion null on SSR): compare === true so
 * the SSR null case keeps motion enabled (default to motion when uncertain).
 *
 * Link is imported from @/i18n/navigation (locale-aware) — NOT next/navigation.
 * next-intl prefixes the current locale automatically, so the href
 * `/projects/${slug}` resolves to `/fr/projects/slug` or `/en/projects/slug`.
 *
 * Category badge uses the fixed `category-{tech,design,bim}` Badge variants
 * from Wave 0 (palette-independent). Footer metadata badges use the
 * neutral `outline` variant — they are NOT category-colored.
 *
 * Colors are Tailwind utilities backed by --color-* tokens. No literal colors
 * (the base64 blur placeholder is a JPEG fallback for next/image, not a CSS color).
 */

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/projects';

type Props = {
  project: Project;
};

function categoryVariant(
  category: Project['category'],
): 'category-tech' | 'category-design' | 'category-bim' {
  if (category === 'tech') return 'category-tech';
  if (category === 'design') return 'category-design';
  return 'category-bim';
}

function metadataBadges(project: Project): string[] {
  if (project.category === 'tech') return project.stack.slice(0, 3);
  if (project.category === 'design') return project.tools.slice(0, 3);
  // BIM: software[0..1] + projectScale
  return [...project.software.slice(0, 2), project.projectScale];
}

// Minimal blur dataURL — matches About's about-photo blur for consistency.
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAECBP/EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAABs0E//8QAFRABAQAAAAAAAAAAAAAAAAAAEDH/2gAIAQEAAQUCH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8BH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8BH//EABUQAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEABj8CH//EABYQAAMAAAAAAAAAAAAAAAAAAAAxYf/aAAgBAQABPyEx/9oADAMBAAIAAwAAABAH/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFRABAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEAAT8QH//Z';

export function ProjectCard({ project }: Props) {
  const t = useTranslations('projects');
  const reducedMotion = useReducedMotion();

  // Pitfall 4-B: treat null (SSR / pre-hydration) as "allow motion".
  // Only an explicit `true` (user prefers reduced) suppresses the hover.
  const hoverProps = reducedMotion === true ? undefined : { scale: 1.02 };
  const arrowHoverProps = reducedMotion === true ? undefined : { x: 4, y: -4 };

  return (
    <motion.div
      whileHover={hoverProps}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`${t('viewProject')} — ${project.title}`}
        className="block h-full"
      >
        <Card className="border-border hover:border-primary group relative h-full overflow-hidden border transition-colors">
          {/* Cover image with category badge + year overlays */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={project.cover}
              alt={project.title}
              width={640}
              height={400}
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-110 group-hover:saturate-110"
            />
            <div className="absolute left-3 top-3">
              <Badge variant={categoryVariant(project.category)}>
                {project.category.toUpperCase()}
              </Badge>
            </div>
            <div className="text-muted-foreground bg-background/70 absolute right-3 top-3 rounded px-2 py-0.5 font-mono text-xs backdrop-blur-sm">
              {project.year}
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-foreground text-xl font-semibold">
              {project.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground line-clamp-2 text-sm">
              {project.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {metadataBadges(project).map((meta) => (
                <Badge key={meta} variant="outline" className="text-xs">
                  {meta}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <motion.span
              whileHover={arrowHoverProps}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-muted-foreground group-hover:text-primary inline-flex items-center"
              aria-hidden="true"
            >
              <ArrowUpRight className="h-5 w-5" />
            </motion.span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
