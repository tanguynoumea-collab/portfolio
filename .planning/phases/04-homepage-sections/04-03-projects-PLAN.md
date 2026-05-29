---
phase: 04-homepage-sections
plan: 03
type: execute
wave: 2
depends_on: [00]
files_modified:
  - components/sections/CategoryFilter.tsx
  - components/sections/CategoryFilter.test.tsx
  - components/sections/ProjectCard.tsx
  - components/sections/ProjectCard.test.tsx
  - components/sections/ProjectGrid.tsx
  - components/sections/ProjectGrid.test.tsx
  - components/sections/ProjectsSection.tsx
  - components/sections/ProjectsSection.test.tsx
autonomous: true
requirements: [HOME-03, HOME-04, HOME-05]
requirements_addressed: [HOME-03, HOME-04, HOME-05]
gap_closure: false

must_haves:
  truths:
    - "CategoryFilter renders 4 pill buttons (All / Tech / Design / BIM) localized via projects.filters.* i18n keys"
    - "CategoryFilter active button has aria-pressed='true'; others have aria-pressed='false'"
    - "CategoryFilter clicking inactive button calls onChange callback with target FilterValue ('all' | 'tech' | 'design' | 'bim')"
    - "CategoryFilter renders a motion <span layoutId='filter-indicator'> background on the active button (same pattern as Phase 3 LanguageSwitcher D-18)"
    - "ProjectCard renders cover (next/image) + title + year + category badge (color-coded variant) + summary + footer metadata badges (stack/tools/software per category)"
    - "ProjectCard wraps in <Link> from @/i18n/navigation pointing to /projects/{slug} (locale-prefixed automatically)"
    - "ProjectCard hover under full motion: scale 1.02 (200ms easeOut); under reduced-motion: no hover transform (useReducedMotion gate)"
    - "ProjectCard aria-label on Link includes project title for screen reader navigation"
    - "ProjectGrid renders all passed projects when filter='all'; renders subset when filter !== 'all'"
    - "ProjectGrid uses AnimatePresence mode='popLayout' + outer motion.div layout for filter transitions"
    - "ProjectGrid renders empty state with SearchX icon + projects.empty label when projects array is empty"
    - "ProjectsSection lifts the active filter state ('all' default), uses useMemo to compute filtered projects, passes both to CategoryFilter and ProjectGrid"
  artifacts:
    - path: "components/sections/CategoryFilter.tsx"
      provides: "'use client' segmented filter — 4 pills + motion layoutId"
      exports: ["CategoryFilter", "FilterValue", "Category"]
    - path: "components/sections/ProjectCard.tsx"
      provides: "'use client' project card — cover + badges + hover + locale-aware Link"
    - path: "components/sections/ProjectGrid.tsx"
      provides: "'use client' filterable grid — AnimatePresence popLayout + empty state"
    - path: "components/sections/ProjectsSection.tsx"
      provides: "'use client' state-lifting composer wrapping CategoryFilter + ProjectGrid"
    - path: "components/sections/*.test.tsx (4 files)"
      provides: "Wave 0 RED harnesses turned GREEN"
  key_links:
    - from: "components/sections/CategoryFilter.tsx"
      to: "motion.span layoutId='filter-indicator'"
      via: "shared-element transition pattern matching Phase 3 LanguageSwitcher D-18"
      pattern: "layoutId=\"filter-indicator\""
    - from: "components/sections/ProjectCard.tsx"
      to: "@/i18n/navigation Link"
      via: "<Link href={{pathname:'/projects/[slug]',params:{slug}}}> for locale-aware routing"
      pattern: "from '@/i18n/navigation'"
    - from: "components/sections/ProjectGrid.tsx"
      to: "motion AnimatePresence mode='popLayout'"
      via: "filter transitions don't collapse grid (PITFALLS Pitfall 4-C)"
      pattern: "mode=\"popLayout\""
    - from: "components/sections/ProjectsSection.tsx"
      to: "useState + useMemo filter"
      via: "lifted state pattern + memoized selector"
      pattern: "useState.*FilterValue|useMemo"
    - from: "components/sections/ProjectCard.tsx + Skills.tsx"
      to: "components/ui/badge.tsx category-{tech,design,bim} variants"
      via: "domain color coding via Wave 0 fixed tokens"
      pattern: "category-tech|category-design|category-bim"
---

<objective>
Implement HOME-03 + HOME-04 + HOME-05 as a single tightly-coupled plan: CategoryFilter (segmented control with motion shared-element indicator), ProjectCard (color-coded card with hover stack + locale-aware Link), ProjectGrid (AnimatePresence popLayout filter with empty state), and ProjectsSection (state-lifting composer that connects them and consumes the server-loaded `projects` prop from page.tsx).

This is Wave 2 — it depends on Wave 0 (MDX stubs, Badge variants, fixed category tokens) so the grid renders 6 real projects. Wave 1's 4 parallel plans don't touch the filter machinery, but Wave 2's bundle must ship as one cohesive unit because the 4 components reference each other directly.

Purpose: HOME-05 is the projects showcase, the conversion-funnel hub. The user filters by domain, sees color-coded cards reveal smoothly via popLayout, and clicks through to detail pages (Phase 5 ships those). The 3-category color system here demonstrates the design discipline that motivates the whole portfolio.

Output:
- 4 new `components/sections/*.tsx` files (CategoryFilter, ProjectCard, ProjectGrid, ProjectsSection)
- 4 expanded test files (Wave 0 RED → GREEN)
- Estimated execution: ~45-60 minutes
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/04-homepage-sections/04-CONTEXT.md
@.planning/phases/04-homepage-sections/04-RESEARCH.md
@.planning/phases/04-homepage-sections/04-VALIDATION.md
@.planning/phases/04-homepage-sections/04-00-assets-and-stubs-PLAN.md
@app/[locale]/page.tsx
@lib/projects.ts
@lib/utils.ts
@components/layout/LanguageSwitcher.tsx
@components/ui/badge.tsx
@components/ui/card.tsx
@components/sections/CategoryFilter.test.tsx
@components/sections/ProjectCard.test.tsx
@components/sections/ProjectGrid.test.tsx
@components/sections/ProjectsSection.test.tsx
@messages/fr.json
@messages/en.json
@i18n/navigation.ts
@CLAUDE.md

<interfaces>
<!-- Key contracts the executor MUST honor. -->

From lib/projects.ts (Phase 1):
```typescript
export type Project = TechProject | DesignProject | BIMProject;
// TechProject:   { ...common, category: 'tech', stack: string[], repo?, liveUrl? }
// DesignProject: { ...common, category: 'design', tools: string[], client? }
// BIMProject:    { ...common, category: 'bim', software: string[], projectScale, location? }
//
// Discriminator: project.category — used both for filtering AND for picking
// which metadata fields to render in ProjectCard's footer.
```

From i18n/navigation.ts (Phase 3):
```typescript
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
// Link is the LOCALE-AWARE link. Use shape:
//   <Link href={`/projects/${project.slug}`}> ...
// next-intl prefixes the current locale automatically: /fr/projects/{slug} or /en/projects/{slug}.
// DO NOT import Link from 'next/link' — that one is NOT locale-aware.
```

From messages/fr.json + messages/en.json (preserved from Phase 1):
- `projects.title` — "Projets" / "Projects"
- `projects.filters.all` — "Tous" / "All"
- `projects.filters.tech` — "Tech"
- `projects.filters.design` — "Design"
- `projects.filters.bim` — "BIM"
- `projects.empty` — "Aucun projet ne correspond à ce filtre." / "No project matches this filter."
- `projects.viewProject` — "Voir le projet" / "View project"

From components/ui/badge.tsx (after Wave 0):
- Variants: default / secondary / destructive / outline / category-tech / category-design / category-bim
- The `bg-category-*` Tailwind utilities are generated by Wave 0's @theme inline additions.

From components/ui/card.tsx (shadcn Card primitive):
```typescript
export function Card({ className, ...props }): JSX.Element;
export function CardHeader({ ... }): JSX.Element;
export function CardTitle({ ... }): JSX.Element;
export function CardDescription({ ... }): JSX.Element;
export function CardContent({ ... }): JSX.Element;
export function CardFooter({ ... }): JSX.Element;
```

From motion/react:
- `<motion.div layout>` parent — animates layout changes (height/width/position) smoothly
- `<AnimatePresence mode="popLayout" initial={false}>` — exit/enter sequencing without layout jump
- `<motion.div initial={...} animate={...} exit={...} key={...}>` — per-card transitions
- `useReducedMotion()` — boolean (or null on SSR); compare to `true` explicitly per 04-RESEARCH Pitfall 4-B

From Phase 3 LanguageSwitcher.tsx (D-18 reuse pattern):
```typescript
{isActive && (
  <motion.span
    layoutId="lang-indicator"     // PHASE 4: use "filter-indicator"
    aria-hidden="true"
    className="bg-primary absolute inset-0 -z-10 rounded-full"
    transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
  />
)}
```

From 04-RESEARCH §"Pitfall 4-I": ProjectCard's motion.div whileHover MUST wrap the Link (not the inverse), or the hover state doesn't fire (Link captures pointer enter).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement CategoryFilter + ProjectCard (paired UI primitives)</name>
  <files>components/sections/CategoryFilter.tsx, components/sections/ProjectCard.tsx</files>
  <behavior>
    **CategoryFilter:**
    - Renders 4 pill buttons in a row (All / Tech / Design / BIM)
    - Receives `active: FilterValue` + `onChange: (value) => void` as props
    - Default `active` is 'all' (set by parent ProjectsSection)
    - Active button hosts `<motion.span layoutId="filter-indicator">` with `bg-primary` background
    - aria-pressed on each button reflects active state (follows Phase 3 LanguageSwitcher D-20 precedent)
    - Click on inactive button calls `onChange(target)`
    - Exports `FilterValue` and `Category` types

    **ProjectCard:**
    - Receives `project: Project` prop
    - Renders shadcn `<Card>` containing:
      - Cover image: `next/image` with object-cover, 16:10 aspect ratio
      - Top-left absolute overlay: category Badge (variant=category-{tech|design|bim})
      - Top-right absolute overlay: year text
      - Body: title (CardTitle), summary (CardDescription)
      - Footer: domain-specific metadata badges (stack[0..2] for tech, tools[0..2] for design, software[0..2] + projectScale for bim) — these are NEUTRAL badges, not category-colored
      - Arrow icon (ArrowUpRight) bottom-right
    - Wrapped in motion.div with `whileHover={{ scale: 1.02 }}` under full motion, undefined under reduced-motion
    - Outer wrapper is `<Link href={`/projects/${project.slug}`}>` from `@/i18n/navigation` with aria-label including the project title
    - **CRITICAL pattern per RESEARCH Pitfall 4-I:** motion.div OUTSIDE the Link; Link OUTSIDE the Card. Stack: motion.div > Link > Card.
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-13, D-14)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pattern 4: motion layoutId" (CategoryFilter) + §"Pattern 3: AnimatePresence popLayout" (re: ProjectGrid integration) + §"Pitfall 4-I" (motion.div outside Link!) + §"Pitfall 4-B" (useReducedMotion === true check)
    - components/sections/CategoryFilter.test.tsx + ProjectCard.test.tsx (Wave 0 RED harnesses)
    - components/layout/LanguageSwitcher.tsx (motion layoutId="lang-indicator" reference — same pattern, different ID)
    - components/ui/badge.tsx (Wave 0 category variants)
    - components/ui/card.tsx (shadcn Card primitive structure)
    - i18n/navigation.ts (Link/useRouter exports)
    - lib/projects.ts (Project type + per-category metadata fields)
  </read_first>
  <action>
    **Step 1a: Create `components/sections/CategoryFilter.tsx`:**

    ```tsx
    'use client';

    /**
     * components/sections/CategoryFilter.tsx — HOME-03 Phase 4.
     *
     * Segmented control with 4 pill buttons (All / Tech / Design / BIM) and a
     * shared-element motion indicator (layoutId="filter-indicator"). The
     * pattern mirrors Phase 3 LanguageSwitcher D-18 — only the layoutId string
     * differs.
     *
     * State is LIFTED — parent <ProjectsSection> owns the active value and
     * passes (active, onChange) as props. This component is purely
     * presentational + callback-firing.
     *
     * aria-pressed (NOT role="radio") — same a11y pattern as Phase 3
     * LanguageSwitcher D-20.
     */

    import { useTranslations } from 'next-intl';
    import { motion } from 'motion/react';
    import { cn } from '@/lib/utils';

    export type Category = 'tech' | 'design' | 'bim';
    export type FilterValue = Category | 'all';

    const OPTIONS: ReadonlyArray<FilterValue> = ['all', 'tech', 'design', 'bim'] as const;

    type Props = {
      active: FilterValue;
      onChange: (value: FilterValue) => void;
    };

    export function CategoryFilter({ active, onChange }: Props) {
      const t = useTranslations('projects.filters');
      return (
        <div
          role="group"
          aria-label={t('all')}
          className="border-border bg-background relative inline-flex items-center gap-1 rounded-full border p-1 text-sm"
        >
          {OPTIONS.map((option) => {
            const isActive = option === active;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                aria-pressed={isActive}
                data-active={isActive ? 'true' : 'false'}
                className="relative z-10 px-4 py-1.5 font-medium transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-indicator"
                    aria-hidden="true"
                    className="bg-primary absolute inset-0 -z-10 rounded-full"
                    transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
                  />
                )}
                <span
                  className={cn(
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t(option)}
                </span>
              </button>
            );
          })}
        </div>
      );
    }
    ```

    **Step 1b: Create `components/sections/ProjectCard.tsx`:**

    ```tsx
    'use client';

    /**
     * components/sections/ProjectCard.tsx — HOME-04 Phase 4.
     *
     * Color-coded project card with hover micro-interaction and locale-aware
     * routing. Discriminated metadata footer renders different fields per
     * project.category.
     *
     * Stack (per Pitfall 4-I): motion.div whileHover > Link > Card.
     * The motion.div is OUTSIDE the Link so pointer-enter fires on hover.
     */

    import Image from 'next/image';
    import { useTranslations } from 'next-intl';
    import { motion, useReducedMotion } from 'motion/react';
    import { ArrowUpRight } from 'lucide-react';
    import { Link } from '@/i18n/navigation';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      // BIM: software[0..2] + projectScale
      return [...project.software.slice(0, 2), project.projectScale];
    }

    // Minimal blur dataURL — matches About's about-photo blur for consistency.
    const BLUR_DATA_URL =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAECBP/EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAABs0E//8QAFRABAQAAAAAAAAAAAAAAAAAAEDH/2gAIAQEAAQUCH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8BH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8BH//EABUQAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEABj8CH//EABYQAAMAAAAAAAAAAAAAAAAAAAAxYf/aAAgBAQABPyEx/9oADAMBAAIAAwAAABAH/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFRABAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEAAT8QH//Z';

    export function ProjectCard({ project }: Props) {
      const t = useTranslations('projects');
      const reducedMotion = useReducedMotion();

      // Pitfall 4-B: treat null as "allow motion".
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
            <Card className="border-border hover:border-primary group relative h-full overflow-hidden transition-colors">
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
                <div className="text-muted-foreground bg-background/70 absolute right-3 top-3 rounded px-2 py-0.5 text-xs font-mono backdrop-blur-sm">
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
                  animate={arrowHoverProps ? undefined : {}}
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
    ```

    **CRITICAL CHECKS:**
    - CategoryFilter: `'use client'`, motion `layoutId="filter-indicator"`, exports `FilterValue` + `Category` types, `aria-pressed` on each button
    - ProjectCard: `'use client'`, imports `Link` from `@/i18n/navigation` (NOT `next/navigation`), `useReducedMotion` from `motion/react`, `Card/CardContent/CardFooter/CardHeader/CardTitle/CardDescription` from `@/components/ui/card`, `Badge` from `@/components/ui/badge`, `Project` type from `@/lib/projects`, `ArrowUpRight` from `lucide-react`
    - Stack: `<motion.div whileHover>` outer, `<Link>` middle, `<Card>` inner (Pitfall 4-I compliance)
    - `whileHover` is `undefined` when `reducedMotion === true` (compares to `true` explicitly — Pitfall 4-B)
    - Category badge uses `category-tech|category-design|category-bim` variant via `categoryVariant()` helper
    - Footer metadata badges use `variant="outline"` (NEUTRAL — not category-colored)
    - `aria-label` on Link includes `t('viewProject')` + project title
    - Discriminated metadata: tech → stack[0..2]; design → tools[0..2]; bim → software[0..1] + projectScale
    - No literal colors (data:image/jpeg;base64 blur exception OK)
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const cf=fs.readFileSync('components/sections/CategoryFilter.tsx','utf8'); const pc=fs.readFileSync('components/sections/ProjectCard.tsx','utf8'); const cfReq=[\"'use client'\",'layoutId=\"filter-indicator\"','aria-pressed','useTranslations','onChange','export type FilterValue','export type Category','export function CategoryFilter']; const cfMiss=cfReq.filter(r=>!cf.includes(r)); if(cfMiss.length){console.error('CF MISSING:',cfMiss);process.exit(1)} const pcReq=[\"'use client'\",\"from '@/i18n/navigation'\",'useReducedMotion','category-tech','category-design','category-bim','motion.div','whileHover','<Link','<Card','ArrowUpRight','aria-label','export function ProjectCard']; const pcMiss=pcReq.filter(r=>!pc.includes(r)); if(pcMiss.length){console.error('PC MISSING:',pcMiss);process.exit(1)} if(pc.includes(\"from 'next/navigation'\")){console.error('FORBIDDEN next/navigation import');process.exit(1)} const bad=(cf+pc).match(/oklch\\(|(?<!base64,)#[0-9a-fA-F]{3,6}|rgb\\(|hsl\\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} console.log('filter-card-impl-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/CategoryFilter.tsx` exists with `'use client'`
    - Contains `layoutId="filter-indicator"`
    - Contains `aria-pressed` on each button
    - Exports `FilterValue` and `Category` types
    - `components/sections/ProjectCard.tsx` exists with `'use client'`
    - Contains `from '@/i18n/navigation'` (Link import)
    - Does NOT contain `from 'next/navigation'`
    - Contains `useReducedMotion` from `motion/react`
    - Contains `category-tech`, `category-design`, `category-bim` Badge variants
    - Stack order: `<motion.div>` > `<Link>` > `<Card>`
    - Discriminated metadata footer handles tech/design/bim distinctly
    - `aria-label` on Link includes `t('viewProject')` + project title
    - NO color literals (base64 blur dataURL OK)
    - `npm run lint` exit 0
    - Wave 0's `CategoryFilter.test.tsx` and `ProjectCard.test.tsx` turn GREEN
  </acceptance_criteria>
  <done>CategoryFilter + ProjectCard shipped; types exported for ProjectGrid + ProjectsSection consumption; Pitfall 4-I + 4-B mitigations applied.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement ProjectGrid + ProjectsSection (composition + state lifting)</name>
  <files>components/sections/ProjectGrid.tsx, components/sections/ProjectsSection.tsx</files>
  <behavior>
    **ProjectGrid:**
    - Receives `projects: Project[]` prop
    - When projects.length === 0: render empty state with SearchX icon + `projects.empty` i18n string
    - Otherwise: outer `<motion.div layout>` with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`; inner `<AnimatePresence mode="popLayout" initial={false}>` wrapping `projects.map(p => <motion.div key={p.slug} layout initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}} transition={{duration:0.3,ease:'easeOut'}}><ProjectCard project={p}/></motion.div>)`
    - Pitfall 4-C: outer wrapper MUST have `layout` prop so grid height transitions smoothly

    **ProjectsSection:**
    - Receives `projects: Project[]` prop (from page.tsx server load)
    - Owns `useState<FilterValue>('all')` for active filter
    - Computes `filtered = useMemo(() => projects.filter(p => active === 'all' || p.category === active), [projects, active])`
    - Renders title (h2) from `projects.title` i18n
    - Renders `<CategoryFilter active={active} onChange={setActive}/>`
    - Renders `<ProjectGrid projects={filtered}/>`
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-15, D-16)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pattern 3: AnimatePresence popLayout" full example + §"Pitfall 4-C: AnimatePresence popLayout collapses parent height" (requires outer motion.div layout)
    - components/sections/ProjectGrid.test.tsx + ProjectsSection.test.tsx (Wave 0 RED)
    - components/sections/CategoryFilter.tsx (just-created — verify FilterValue export shape)
    - components/sections/ProjectCard.tsx (just-created — verify import shape)
    - lib/projects.ts (Project type)
  </read_first>
  <action>
    **Step 2a: Create `components/sections/ProjectGrid.tsx`:**

    ```tsx
    'use client';

    /**
     * components/sections/ProjectGrid.tsx — HOME-05 Phase 4.
     *
     * Responsive grid with AnimatePresence popLayout for filter transitions.
     * Empty state with SearchX icon when projects array is empty (filter
     * matches nothing OR no projects in repo at all).
     *
     * Pitfall 4-C: outer <motion.div layout> is REQUIRED — without it, the
     * grid height jumps as exiting cards leave layout flow (popLayout sets
     * them position:absolute). The layout prop smoothly transitions parent
     * height during exit-only states.
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
    ```

    **Step 2b: Create `components/sections/ProjectsSection.tsx`:**

    ```tsx
    'use client';

    /**
     * components/sections/ProjectsSection.tsx — HOME-05 Phase 4 (state lifter).
     *
     * Owns the filter state. Reads server-loaded projects via prop (page.tsx
     * loads getProjects(locale) and passes the array). Computes the filtered
     * subset via useMemo. Renders the title + filter + grid as a vertical stack.
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
    ```

    **CRITICAL CHECKS:**
    - ProjectGrid: `'use client'`, contains `mode="popLayout"`, outer `<motion.div layout>`, empty state with `SearchX` + `t('empty')`
    - ProjectsSection: `'use client'`, contains `useState<FilterValue>('all')`, contains `useMemo`, renders CategoryFilter + ProjectGrid with state-prop wiring
    - No literal colors
    - Named exports
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const pg=fs.readFileSync('components/sections/ProjectGrid.tsx','utf8'); const ps=fs.readFileSync('components/sections/ProjectsSection.tsx','utf8'); const pgReq=[\"'use client'\",'AnimatePresence','mode=\"popLayout\"','motion.div','layout','SearchX',\"t('empty')\",'export function ProjectGrid','from \\'./ProjectCard\\'']; const pgMiss=pgReq.filter(r=>!pg.includes(r)); if(pgMiss.length){console.error('PG MISSING:',pgMiss);process.exit(1)} const psReq=[\"'use client'\",'useState','useMemo','FilterValue',\"useState<FilterValue>('all')\",'<CategoryFilter','<ProjectGrid','export function ProjectsSection','from \\'./CategoryFilter\\'','from \\'./ProjectGrid\\'']; const psMiss=psReq.filter(r=>!ps.includes(r)); if(psMiss.length){console.error('PS MISSING:',psMiss);process.exit(1)} const bad=(pg+ps).match(/oklch\\(|#[0-9a-fA-F]{3,6}|rgb\\(|hsl\\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} console.log('grid-section-impl-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/ProjectGrid.tsx` exists with `'use client'`
    - Contains `mode="popLayout"`
    - Contains outer `<motion.div layout>` (Pitfall 4-C mitigation)
    - Contains empty state with `SearchX` icon + `t('empty')`
    - Imports `ProjectCard` from `./ProjectCard`
    - `components/sections/ProjectsSection.tsx` exists with `'use client'`
    - Contains `useState<FilterValue>('all')` (lifted state, default 'all')
    - Contains `useMemo` for filter selector
    - Imports `CategoryFilter` + `FilterValue` from `./CategoryFilter` and `ProjectGrid` from `./ProjectGrid`
    - Both files have NO color literals
    - `npm run lint` exit 0
    - Wave 0's `ProjectGrid.test.tsx` and `ProjectsSection.test.tsx` turn GREEN
  </acceptance_criteria>
  <done>ProjectGrid + ProjectsSection shipped; state lifted; useMemo filter selector; popLayout + outer layout prop applied; tests GREEN.</done>
</task>

<task type="auto">
  <name>Task 3: Expand 4 test files with full HOME-03/04/05 acceptance assertions + run full phase suite</name>
  <files>components/sections/CategoryFilter.test.tsx, components/sections/ProjectCard.test.tsx, components/sections/ProjectGrid.test.tsx, components/sections/ProjectsSection.test.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-VALIDATION.md (per-task rows 04-03-01..17)
    - components/sections/{CategoryFilter,ProjectCard,ProjectGrid,ProjectsSection}.tsx (just-created implementations)
    - 4 Wave 0 RED harnesses for each component (extend, do not replace)
    - components/layout/LanguageSwitcher.test.tsx (reference for aria-pressed + click + motion-mock patterns)
  </read_first>
  <action>
    Extend the 4 Wave 0 RED harnesses with full HOME-03/04/05 acceptance:

    **CategoryFilter.test.tsx — add:**
    1. Default active='all' selected: `aria-pressed="true"` on the All button
    2. aria-pressed="false" on inactive buttons
    3. Click on Tech button calls `onChange('tech')`
    4. Click on All button calls `onChange('all')` (works even when already active — passive idempotency)
    5. Renders motion.span with `layoutId="filter-indicator"` only on active button (assert via getAllByRole + querying the inactive ones don't contain the layoutId stub)
    6. All 4 buttons have role attribute (button or radio — assert structural)

    **ProjectCard.test.tsx — add:**
    1. Renders title, year, summary, category badge from project prop
    2. Footer renders metadata: for tech project, badges from stack[0..2]; for design, tools[0..2]; for bim, software[0..1] + projectScale
    3. Link from @/i18n/navigation has `href` matching `/projects/{slug}` (mock the Link export and capture href prop)
    4. Link has `aria-label` containing project.title
    5. motion.div whileHover is undefined when useReducedMotion returns true (mock useReducedMotion)
    6. motion.div whileHover is `{ scale: 1.02 }` when useReducedMotion returns false
    7. Category badge variant matches project.category (assert via mocked Badge stub data-variant)

    **ProjectGrid.test.tsx — add:**
    1. Renders 1 card per project when projects.length > 0 (use 3 fake Project objects of different categories)
    2. Renders empty state when projects=[]
    3. Empty state contains `t('empty')` text and SearchX icon (assert via container.querySelectorAll('svg'))
    4. Outer wrapper has `mode="popLayout"` (assert by spying on the mocked AnimatePresence)
    5. Outer motion.div has `layout` prop (assert via spy)

    **ProjectsSection.test.tsx — add:**
    1. Default active='all' shows all projects
    2. Selecting Tech filter → CategoryFilter receives active='tech'
    3. ProjectGrid receives only tech-category projects when active='tech'
    4. useMemo correctly filters for each category
    5. Empty filter results pass empty array to ProjectGrid (i.e., empty state)

    Each test file should run independently: `npx vitest run components/sections/{File}.test.tsx`.

    After all 4 tests pass, run the FULL phase suite:
    ```bash
    npm test
    npm run lint
    npm run build
    ```
    All 3 exit 0.
  </action>
  <verify>
    <automated>npx vitest run components/sections/ && npm run lint && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - 4 test files each have ≥ 3 describe blocks and ≥ 5 it() cases
    - All 4 test files exit 0 when run individually
    - `npx vitest run` (full Vitest suite) exits 0
    - `npm run lint` exit 0
    - `npm run build` exit 0 (phase fully ships — all imports resolve, all sections render)
    - Per-test assertions cover HOME-03 (aria-pressed, onChange, layoutId, default active), HOME-04 (cover, title, year, badge variant, locale-aware Link with aria-label, hover whileHover gating, discriminated metadata), HOME-05 (renders cards, filter subsets, empty state, popLayout, useMemo selector, lifted state)
  </acceptance_criteria>
  <done>All 4 Wave 0 RED tests now GREEN; phase-level build + lint + test gates pass; Phase 4 fully ships.</done>
</task>

</tasks>

<verification>
After all 3 tasks complete:

1. **All 4 component files exist:** CategoryFilter.tsx, ProjectCard.tsx, ProjectGrid.tsx, ProjectsSection.tsx — verified via `ls components/sections/*.tsx | wc -l` returns 9 (5 W1+W2 components + 4 tests for them + extras) — actual minimum check: 4 specific file existence.

2. **Lint:** `npm run lint` exit 0

3. **Type:** `npx tsc --noEmit` exit 0

4. **Tests:** `npx vitest run` exit 0 (137 prior Phase 3 + 8 Phase 4 sections = ~150 total)

5. **Build:** `npm run build` exit 0 (this is the phase-completion gate — page.tsx imports resolve, MDX stubs validate, no token errors)

6. **No literal colors anywhere in Phase 4 components:**
   `grep -rE "oklch\(|#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" components/sections/*.tsx | grep -v "base64,"` returns nothing

7. **Locale-aware Link:** `grep "@/i18n/navigation" components/sections/ProjectCard.tsx` returns 1 line
   `grep "next/navigation" components/sections/ProjectCard.tsx` returns nothing

8. **popLayout:** `grep 'mode="popLayout"' components/sections/ProjectGrid.tsx` returns 1 line

9. **layoutId:** `grep 'layoutId="filter-indicator"' components/sections/CategoryFilter.tsx` returns 1 line

10. **All 7 HOME requirements addressed:** HOME-01 (Hero plan), HOME-02 (About plan), HOME-03/04/05 (this plan), HOME-06 (Skills plan), HOME-07 (Contact plan) — verified via cross-plan requirements_addressed field aggregation.
</verification>

<success_criteria>
- [ ] CategoryFilter.tsx with motion layoutId="filter-indicator" + aria-pressed + lifted state contract
- [ ] ProjectCard.tsx with motion.div > Link > Card stack (Pitfall 4-I) + reducedMotion === true check (Pitfall 4-B) + discriminated metadata footer + locale-aware Link
- [ ] ProjectGrid.tsx with AnimatePresence mode="popLayout" + outer motion.div layout + empty state
- [ ] ProjectsSection.tsx with useState lifted state + useMemo filter + composition wiring
- [ ] 4 expanded test files GREEN
- [ ] npm test + npm run lint + npm run build all exit 0 (PHASE COMPLETE)
- [ ] No literal colors
- [ ] @/i18n/navigation Link (not next/navigation)
</success_criteria>

<output>
After completion, create `.planning/phases/04-homepage-sections/04-03-SUMMARY.md` documenting:
- 4 components shipped (CategoryFilter / ProjectCard / ProjectGrid / ProjectsSection)
- HOME-03/04/05 contracts fulfilled
- Motion layoutId="filter-indicator" reused from Phase 3 LanguageSwitcher D-18 pattern
- Pitfall 4-I (motion outside Link) + 4-B (useReducedMotion === true) + 4-C (outer motion.div layout) mitigations
- Discriminated metadata footer (Tech.stack vs Design.tools vs BIM.software+projectScale)
- useMemo filter selector preserves identity across renders
- Server-loaded projects prop pattern (page.tsx → ProjectsSection → ProjectGrid)
- PHASE COMPLETE — all 7 HOME-* requirements GREEN; build + lint + test pass
</output>