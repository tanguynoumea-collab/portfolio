'use client';

/**
 * lib/hooks/useActiveSection.ts — IntersectionObserver active-section detector
 * (LAYOUT-03 D-15 support).
 *
 * Tracks which page section is currently active (largest intersectionRatio
 * within a 20%-tall band centered on the viewport). Returns the active section
 * id as a typed literal — 'home' | 'about' | 'projects' | 'skills' | 'contact'
 * — or null until at least one section enters the band (or if no sections
 * exist in the DOM, e.g. on a route that doesn't render the homepage layout).
 *
 * rootMargin '-40% 0px -40% 0px' creates a 20%-tall band centered on the
 * viewport: a section is "active" when its content crosses that band. Multiple
 * thresholds [0, 0.1, 0.5, 1] ensure the callback fires often enough to pick
 * up the largest-ratio winner as the user scrolls.
 *
 * Picking the LARGEST intersectionRatio among visible entries (instead of the
 * first or last) keeps the highlight stable when adjacent sections are both
 * partially visible — the user perceives the section that occupies the most
 * of the band as "current," matching their reading focus.
 *
 * Exports:
 *   - useActiveSection() — the hook
 *   - SectionId — the typed union of section IDs (string literal type)
 *   - NAV_SECTION_IDS — runtime-iterable readonly array for Navigation
 */

import { useEffect, useState } from 'react';

const SECTION_IDS = ['home', 'about', 'projects', 'skills', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export const NAV_SECTION_IDS: readonly SectionId[] = SECTION_IDS;

export function useActiveSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((best, cur) =>
          cur.intersectionRatio > best.intersectionRatio ? cur : best,
        );
        const id = top.target.id;
        if ((SECTION_IDS as readonly string[]).includes(id)) {
          setActive(id as SectionId);
        }
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return active;
}
