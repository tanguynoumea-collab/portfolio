'use client';

/**
 * components/layout/Footer.tsx — LAYOUT-04 (Phase 3 D-22..D-25).
 *
 * Compact-row footer with social links + dynamic year + i18n tagline.
 *   - Desktop (md+): single row — copyright + tagline on the left, social
 *     icon row on the right.
 *   - Mobile (< md): stacks to 2 rows — copyright/tagline on top, socials
 *     on bottom — driven by flex-col → md:flex-row.
 *
 * D-24: the `year` value is server-rendered by the parent layout
 *   (`app/[locale]/layout.tsx` resolves the current year server-side via
 *   `Date.prototype.getFullYear` and passes it as a prop). We deliberately
 *   do NOT instantiate a Date inside this component — doing so would
 *   either (a) introduce a hydration mismatch if it changed between SSR
 *   and CSR, or (b) lock the year to the build time if we made the
 *   component a Server Component but cached statically. Server-rendered
 *   prop is the cleanest contract.
 *
 * D-23: social links represented by lucide-react icons.
 *
 *   DEVIATION (Rule 3 — Blocker): the original plan specified the lucide
 *   icons `Github`, `Linkedin`, and `Mail`. The installed lucide-react
 *   version (^1.16.0) removed brand-trademarked icons in its v1.0 release
 *   (Github, Linkedin, Twitter, etc. — verified via
 *   `Object.keys(require('lucide-react'))`). Only `Mail` remains in this
 *   version. To avoid downgrading lucide-react (would cascade through
 *   PaletteFab and the rest of Phase 3), we substitute semantic icons:
 *     - GitHub link  → `Code2`     (developer/code-repo connotation)
 *     - LinkedIn     → `Briefcase` (career/professional connotation)
 *     - Email        → `Mail`      (unchanged — still ships in v1.16)
 *
 *   The link targets, aria-labels, and security attributes are unchanged
 *   from the plan; only the visual glyph differs. The accessible name
 *   ("GitHub" / "LinkedIn") still resolves correctly via tSocial(...).
 *
 *   - GitHub points to https://github.com/tanguynoumea-collab/portfolio per
 *     FEATURES.md research recommendation (invites code review).
 *   - LinkedIn points to a personal profile URL.
 *   - Email uses mailto: protocol.
 *   - GitHub + LinkedIn anchors carry target="_blank" rel="noopener noreferrer"
 *     (security best-practice: noopener prevents the new window from
 *     accessing `window.opener`; noreferrer additionally strips the
 *     Referer header).
 *   - The Mail anchor does NOT carry target/rel — `mailto:` is handed off
 *     to the OS mail client, and `target="_blank"` on a mailto: causes a
 *     blank-window flash in some browsers. aria-label="Email" is the
 *     accessible name (the lucide Mail icon has aria-hidden="true").
 *
 * D-25: tagline sourced from messages.footer.tagline (already populated in
 *   Phase 1 with FR/EN parity).
 *
 * Color tokens: all colors come from Tailwind utilities backed by the
 *   palette CSS variables (text-muted-foreground, hover:text-foreground,
 *   border-border, bg-background). No hex/rgb/oklch literals.
 *
 * 'use client' is required because next-intl's `useTranslations()` is a
 * React hook. The Footer has no other client-only behavior — it could
 * have been a Server Component if we used `getTranslations()` instead,
 * but mixing Server and Client translations adds friction with no benefit
 * for this small, frequently-cached component.
 */
import { useTranslations } from 'next-intl';
import { Code2, Briefcase, Mail } from 'lucide-react';

const PORTFOLIO_REPO = 'https://github.com/tanguynoumea-collab/portfolio';
const LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu';
const CONTACT_EMAIL = 'mailto:contact@tanguy-delrieu.dev';

export function Footer({ year }: { year: number }) {
  const t = useTranslations('footer');
  const tSocial = useTranslations('contact.social');

  return (
    <footer className="border-border bg-background/60 text-muted-foreground mt-16 border-t backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm sm:px-6 md:flex-row">
        {/* Left column: copyright (with ICU year placeholder) + tagline.
            On mobile, the column centers; on md+ it left-aligns to keep
            the visual hierarchy clear. */}
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p>{t('copyright', { year })}</p>
          <p className="text-xs">{t('tagline')}</p>
        </div>

        {/* Right column: social icon row. <nav aria-label="social"> gives
            screen readers a navigable landmark distinct from the main
            <nav> in the header. Each anchor uses a localized aria-label
            sourced from messages.contact.social.* (already FR/EN parity
            from Phase 1).

            Icon substitutions for the plan's original Github / Linkedin /
            Mail trio — see Rule 3 deviation note in the module-level
            JSDoc above. Mail stays. */}
        <nav aria-label="social" className="flex items-center gap-3">
          <a
            href={PORTFOLIO_REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tSocial('github')}
            className="hover:text-foreground focus-visible:ring-ring rounded transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {/* Github link → Code2 glyph (developer/code-repo connotation) */}
            <Code2 className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tSocial('linkedin')}
            className="hover:text-foreground focus-visible:ring-ring rounded transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {/* Linkedin link → Briefcase glyph (professional/career connotation) */}
            <Briefcase className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={CONTACT_EMAIL}
            aria-label="Email"
            className="hover:text-foreground focus-visible:ring-ring rounded transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {/* Mail link → Mail glyph (still available in lucide-react@^1.16) */}
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
