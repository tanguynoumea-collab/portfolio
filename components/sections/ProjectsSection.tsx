'use client';

/**
 * components/sections/ProjectsSection.tsx — HOME-05 Phase 4 (state lifter).
 *
 * Owns the filter state. Reads server-loaded projects via prop (page.tsx
 * loads getProjects(locale) and passes the array). Computes the filtered
 * subset via useMemo so identity is stable across renders that don't
 * change `projects` or `active` (avoids re-rendering ProjectGrid + its
 * AnimatePresence children unnecessarily).
 *
 * Composition:
 *   - <CategoryFilter active={active} onChange={setActive}/>  — D-13
 *   - <ProjectGrid projects={filtered}/>                       — D-15
 *
 * The parent <section id="projects"> wrapper is provided by
 * app/[locale]/page.tsx. This component renders an inner content shell.
 *
 * Server-side data flow: page.tsx (Server Component) calls
 * await getProjects(locale) and serializes the discriminated Project union
 * across the RSC boundary into this Client Component's `projects` prop.
 *
 * Colors: Tailwind utilities backed by --color-* tokens. No literal colors.
 */

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Project } from '@/lib/projects';
import { CategoryFilter, type FilterValue } from './CategoryFilter';
import { ProjectGrid } from './ProjectGrid';

type Props = {
  projects: Project[];
};

export function ProjectsSection({ projects }: Props) {
  const t = useTranslations('projects');
  const [active, setActive] = useState<FilterValue>('all');

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) => active === 'all' || p.category === active,
      ),
    [projects, active],
  );

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-foreground text-3xl font-semibold">
            {t('title')}
          </h2>
          <CategoryFilter active={active} onChange={setActive} />
        </div>
        <ProjectGrid projects={filtered} />
      </div>
    </div>
  );
}
