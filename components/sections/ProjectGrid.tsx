'use client';

/**
 * components/sections/ProjectGrid.tsx — HOME-05 Phase 4.
 *
 * Responsive 1/2/3 column grid with AnimatePresence popLayout for filter
 * transitions. Empty state with SearchX icon when projects array is empty
 * (filter matches nothing OR no projects in repo at all).
 *
 * Pitfall 4-C: outer <motion.div layout> is REQUIRED — without it, the
 * grid height jumps as exiting cards leave layout flow (popLayout sets
 * them position:absolute). The layout prop smoothly transitions parent
 * height during exit-only states.
 *
 * mode="popLayout" — exiting cards are removed from layout flow IMMEDIATELY
 * so remaining cards reflow during the exit animation. Without popLayout,
 * the default "sync" mode keeps cards in flow during exit, causing visual
 * overlap as new positions are calculated mid-animation.
 *
 * initial={false} on AnimatePresence — suppresses initial entry animation
 * on first mount (we want cards visible immediately on page load; only
 * filter changes trigger enter/exit animations).
 *
 * Colors: Tailwind utilities backed by --color-* tokens. No literal colors.
 */

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { SearchX } from 'lucide-react';
import type { Project } from '@/lib/projects';
import { ProjectCard } from './ProjectCard';

type Props = {
  projects: Project[];
};

export function ProjectGrid({ projects }: Props) {
  const t = useTranslations('projects');

  if (projects.length === 0) {
    return (
      <motion.div
        className="text-muted-foreground flex flex-col items-center gap-3 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SearchX className="h-12 w-12" aria-hidden="true" />
        <p>{t('empty')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
