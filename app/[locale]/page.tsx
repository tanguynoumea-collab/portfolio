/*
 * app/[locale]/page.tsx — Phase 4 HOME-01..HOME-07 composition root.
 *
 * Server Component (no client directive). Wraps the 5 homepage sections:
 *   - Hero       (HOME-01)
 *   - About      (HOME-02)
 *   - Projects   (HOME-03+04+05 — CategoryFilter + ProjectGrid + ProjectsSection)
 *   - Skills     (HOME-06)
 *   - Contact    (HOME-07)
 *
 * Server-side data loading per 04-RESEARCH.md anti-pattern guard:
 * lib/projects.ts uses node:fs and CANNOT be imported by Client Components.
 * We resolve projects here (Server) and pass as a serialized prop to
 * <ProjectsSection> (Client). The discriminated Project union serializes
 * cleanly via React's RSC boundary.
 *
 * Section IDs (home/about/projects/skills/contact) are PRESERVED from
 * Phase 3 so Navigation's useActiveSection IntersectionObserver continues
 * to work without modification.
 *
 * The outer <main> wrapper is owned by app/[locale]/layout.tsx (Phase 3
 * D-11 provider tree). This page returns a fragment of <section> children.
 *
 * NOTE: This file imports 5 components that Wave 1+2 of Phase 4 ship.
 * Build will be RED at the end of Wave 0 until Wave 1's first plan
 * (Hero, About, Skills, Contact) and Wave 2 (ProjectsSection family)
 * ship the named exports. This is intentional per the Wave 0 dependency-gate
 * design.
 */
import { getProjects, type Locale } from '@/lib/projects';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { Skills } from '@/components/sections/Skills';
import { Contact } from '@/components/sections/Contact';

type Params = Promise<{ locale: string }>;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  const projects = await getProjects(locale as Locale);

  return (
    <>
      <section id="home" className="flex min-h-screen items-center justify-center">
        <Hero />
      </section>
      <section id="about" className="flex min-h-screen items-center justify-center px-4">
        <About />
      </section>
      <section id="projects" className="flex min-h-screen items-center justify-center px-4 py-16">
        <ProjectsSection projects={projects} />
      </section>
      <section id="skills" className="flex min-h-screen items-center justify-center px-4 py-16">
        <Skills />
      </section>
      <section id="contact" className="flex min-h-screen items-center justify-center px-4 py-16">
        <Contact />
      </section>
    </>
  );
}
