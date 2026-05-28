'use client';

/**
 * components/sections/Contact.tsx — HOME-07 Phase 4 W1 conversion path.
 *
 * Four interactive surfaces:
 *
 *   1. Email button — copies EMAIL to clipboard via Web Clipboard API
 *      (navigator.clipboard.writeText). Motion AnimatePresence (mode="wait")
 *      swaps the Copy icon for Check + announces "Adresse copiée !" via an
 *      sr-only aria-live="polite" span for 1.5s, then reverts. Clipboard
 *      rejection is SILENT — no console call, no thrown error — matching
 *      the Phase 2 D-02 silent-fallback precedent for unreliable browser
 *      APIs. mode="wait" is intentional here (sequential icon swap) and
 *      DIFFERENT from popLayout (which is reserved for ProjectGrid in
 *      04-03 where multiple cards reflow).
 *
 *   2. Social links row — 3 anchors reusing the Phase 3 D-23 lucide
 *      substitutions (the lucide-react@1.x release removed brand-trademarked
 *      icons like Github/Linkedin):
 *        - GitHub  → Code2     (developer/code-repo connotation)
 *        - LinkedIn → Briefcase (career/professional connotation)
 *        - Email   → Mail      (still ships in v1.16+)
 *      GitHub + LinkedIn anchors carry target="_blank" rel="noopener noreferrer"
 *      (security best-practice: noopener prevents window.opener access,
 *      noreferrer strips the Referer header). The mailto: anchor does NOT
 *      carry target/rel — `mailto:` is handed off to the OS mail client and
 *      target="_blank" causes a blank-window flash in some browsers.
 *
 *   3. CV download buttons — 2 shadcn <Button asChild> wrapping <a href download>
 *      to public/cv-fr.pdf + public/cv-en.pdf (shipped by Wave 0). The
 *      `download` attribute works for same-origin static assets without CORS
 *      and forces a save dialog with the specified filename instead of
 *      inline PDF render. FR uses variant="default" (primary visual), EN
 *      uses variant="outline" (secondary).
 *
 *   4. Title + intro paragraph — from contact.title / contact.intro i18n.
 *
 * User-specific data (EMAIL / GITHUB_URL / LINKEDIN_URL) is centralized in
 * @/lib/constants per Phase 4 D-06 so a single edit before deploy updates
 * Hero + Footer + Contact + ConsoleArt in lockstep.
 *
 * Colors: Tailwind utilities backed by the palette CSS variables
 * (text-foreground, text-muted-foreground, border-border, bg-background,
 * hover:bg-muted, text-primary). NO color literals — palette switching
 * remains a single-CSS-var-update with zero rebuild.
 *
 * Section wrapper <section id="contact"> is provided by
 * app/[locale]/page.tsx (Phase 3 chrome) so Navigation's IntersectionObserver
 * via useActiveSection continues to highlight the correct nav item.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Copy,
  Check,
  Code2,
  Briefcase,
  Mail,
  FileDown,
} from 'lucide-react';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

/**
 * Contact section — exported as a named function so app/[locale]/page.tsx
 * can import { Contact } in its existing wiring.
 */
export function Contact() {
  const t = useTranslations('contact');
  const tSocial = useTranslations('contact.social');
  const [copied, setCopied] = useState(false);
  // A11Y-05: gate the Copy↔Check icon-swap animation. Under reduced motion the
  // icons swap instantly (no scale/opacity tween) — WCAG 2.3.3. The aria-live
  // copy feedback below is unaffected (it is not a motion concern).
  const reduce = useReducedMotion();
  const iconMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: { duration: 0.15 },
      };

  /**
   * Email copy handler.
   *
   * The Web Clipboard API requires a secure context (HTTPS or localhost).
   * Vercel deploys serve over HTTPS so production is fine; local dev on
   * `localhost` is also a secure context.
   *
   * On rejection (permission denied, insecure context, browser refusal,
   * etc.) we intentionally do NOTHING — no error log, no thrown error,
   * no UI feedback. This matches the Phase 2 D-02 silent-fallback pattern
   * for unreliable browser APIs: a recruiter who can't copy the email can
   * still read it on screen and the mailto: link below opens their mail
   * client directly. A v2 deferred idea is a fallback "select + copy"
   * tooltip on rejection.
   */
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent fallback per Phase 2 D-02 precedent. No log call.
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-3xl space-y-10 text-center">
        <h2 className="text-foreground text-3xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-lg">{t('intro')}</p>

        {/* Email copy button — displays the EMAIL constant inside a button
            that copies it to clipboard on click. The AnimatePresence below
            swaps the Copy icon for Check after a successful copy + reverts
            after 1.5s. The sr-only aria-live="polite" span announces the
            "Address copied!" feedback to screen readers without a visual
            tooltip (the icon swap is the visual feedback). */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onCopy}
            aria-label={t('email')}
            className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex items-center gap-3 rounded-md border px-5 py-3 font-mono text-base transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span>{EMAIL}</span>
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="check" {...iconMotion}>
                  <Check
                    className="text-primary h-4 w-4"
                    aria-hidden="true"
                  />
                </motion.span>
              ) : (
                <motion.span key="copy" {...iconMotion}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="sr-only" aria-live="polite">
              {copied ? t('emailCopied') : ''}
            </span>
          </button>
        </div>

        {/* Social links row — same Phase 3 D-23 lucide substitution pattern
            as Footer (Code2 / Briefcase / Mail). aria-labels are localized
            via contact.social.{github,linkedin}; the mailto: anchor uses
            "Email" as its accessible name (no localized key needed — same
            convention as Footer). GitHub + LinkedIn carry target+rel; the
            mailto: anchor does not (see module-level JSDoc for rationale). */}
        <nav aria-label="social" className="flex justify-center gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tSocial('github')}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Code2 className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tSocial('linkedin')}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Briefcase className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={`mailto:${EMAIL}`}
            aria-label="Email"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Mail className="h-5 w-5" aria-hidden="true" />
          </a>
        </nav>

        {/* CV download buttons — shadcn <Button asChild> wraps an <a> with
            href + download attributes. The download attribute forces the
            browser to save the PDF with the specified filename instead of
            opening it inline; this works for same-origin static assets
            (public/cv-{fr,en}.pdf are same-origin and CORS is not a concern).
            FR uses variant="default" (primary visual emphasis since the
            user is a FR-native recruiter likely viewing /fr first), EN
            uses variant="outline" (secondary). Both buttons stack on
            mobile (flex-col) and align side-by-side on sm+ (flex-row). */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="default" size="lg">
            <a
              href="/cv-fr.pdf"
              download="CV_Tanguy_Delrieu_FR.pdf"
              className="inline-flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {t('cv.fr')}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="/cv-en.pdf"
              download="CV_Tanguy_Delrieu_EN.pdf"
              className="inline-flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {t('cv.en')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
