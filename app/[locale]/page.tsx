import { useTranslations } from 'next-intl';

/*
 * app/[locale]/page.tsx — Phase 3 LAYOUT-01.
 *
 * Ships 5 placeholder <section id="…"> shells with the canonical IDs the
 * Plan 03-03 Navigation IntersectionObserver will observe: home, about,
 * projects, skills, contact. The IDs match the `nav.*` i18n keys 1:1.
 *
 * Each section is intentionally minimal:
 *   - id="<canonical>" — the IntersectionObserver target (D-15).
 *   - min-h-screen — gives each section enough vertical extent that the
 *     observer fires distinct enter/leave events as the user scrolls.
 *   - One <h1>/<h2> with the localized nav label so the section announces
 *     itself to screen readers and to anyone smoke-testing the build.
 *
 * Phase 4 (HOME-01..HOME-06) fills the section bodies with real content:
 *   - home → Hero (HOME-01)
 *   - about → About (HOME-02)
 *   - projects → ProjectGrid + filters (HOME-03..HOME-05)
 *   - skills → SkillsGrid (HOME-06)
 *   - contact → Contact (HOME-07)
 *
 * The outer main element wrapper now lives in app/[locale]/layout.tsx per
 * Plan 03-02 Task 2 (D-11 provider tree). This page renders only its
 * section tree as a fragment — the layout owns the landmark.
 */
export default function HomePage() {
  const tNav = useTranslations('nav');
  return (
    <>
      <section id="home" className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold">{tNav('home')}</h1>
          <p className="text-muted-foreground text-sm">
            Phase 4 — Hero placeholder
          </p>
        </div>
      </section>
      <section id="about" className="flex min-h-screen items-center justify-center">
        <h2 className="text-3xl font-semibold">{tNav('about')}</h2>
      </section>
      <section id="projects" className="flex min-h-screen items-center justify-center">
        <h2 className="text-3xl font-semibold">{tNav('projects')}</h2>
      </section>
      <section id="skills" className="flex min-h-screen items-center justify-center">
        <h2 className="text-3xl font-semibold">{tNav('skills')}</h2>
      </section>
      <section id="contact" className="flex min-h-screen items-center justify-center">
        <h2 className="text-3xl font-semibold">{tNav('contact')}</h2>
      </section>
    </>
  );
}
