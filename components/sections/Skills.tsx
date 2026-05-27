'use client';

/**
 * components/sections/Skills.tsx — HOME-06 Phase 4.
 *
 * 3 domain groups (Tech / Design / BIM), each presenting a flex-wrap row
 * of shadcn <Badge> components colored via the fixed category-*
 * variants from Wave 0. GSAP ScrollTrigger staggers per badge inside each
 * group + cascades between groups; reduced-motion gates via matchMedia.
 *
 * Skill arrays sourced from skills.groups.{tech,design,bim}.items via
 * next-intl's t.raw() (RESEARCH Pitfall 4-J). The flex-wrap allows
 * unlimited skills per group without breaking the layout.
 *
 * The parent <section id="skills"> wrapper is provided by app/[locale]/page.tsx.
 */

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import 'gsap/ScrollTrigger';
import { Badge } from '@/components/ui/badge';

type GroupKey = 'tech' | 'design' | 'bim';
const GROUPS: ReadonlyArray<GroupKey> = ['tech', 'design', 'bim'] as const;

function variantFor(
  group: GroupKey,
): 'category-tech' | 'category-design' | 'category-bim' {
  if (group === 'tech') return 'category-tech';
  if (group === 'design') return 'category-design';
  return 'category-bim';
}

export function Skills() {
  const skillsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('skills');

  // Read group items via t.raw — next-intl's escape hatch for non-string
  // values. TypeScript narrowing happens at the call site.
  const getItems = (group: GroupKey): string[] => {
    const raw = t.raw(`groups.${group}.items`);
    return Array.isArray(raw) ? (raw as unknown as string[]) : [];
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          if (!ctx.conditions?.isFull) {
            gsap.set('[data-skill-badge]', {
              opacity: 1,
              y: 0,
              scale: 1,
            });
            return;
          }
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: skillsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          });
          GROUPS.forEach((group, idx) => {
            tl.from(
              `[data-skill-badge][data-group="${group}"]`,
              {
                opacity: 0,
                y: 16,
                scale: 0.9,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out',
              },
              idx * 0.15,
            );
          });
        },
      );
    },
    { scope: skillsRef },
  );

  return (
    <div ref={skillsRef} className="w-full">
      <div className="mx-auto max-w-5xl space-y-12">
        <h2 className="text-foreground text-3xl font-semibold">{t('title')}</h2>
        <div className="space-y-8">
          {GROUPS.map((group) => {
            const items = getItems(group);
            const label = t(`groups.${group}.label`);
            return (
              <div key={group}>
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                  {label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      data-skill-badge
                      data-group={group}
                    >
                      <Badge variant={variantFor(group)}>{skill}</Badge>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
