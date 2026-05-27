---
phase: 04-homepage-sections
plan: 05
type: execute
wave: 1
depends_on: [00]
files_modified:
  - components/sections/Contact.tsx
  - components/sections/Contact.test.tsx
autonomous: true
requirements: [HOME-07]
requirements_addressed: [HOME-07]
gap_closure: false

must_haves:
  truths:
    - "Contact renders the email address (EMAIL constant from lib/constants.ts) inside a <button>; clicking it copies to clipboard via navigator.clipboard.writeText with silent try/catch"
    - "After successful copy: motion AnimatePresence swaps Copy icon for Check icon + shows 'Adresse copiée !' / 'Address copied!' label for 1.5s, then reverts"
    - "On clipboard failure: silent — no console, no thrown error (Phase 2 D-02 silent-fallback precedent)"
    - "3 social links rendered: GitHub (Code2 icon), LinkedIn (Briefcase icon), Email mailto (Mail icon) — same lucide substitutions as Phase 3 Footer"
    - "GitHub + LinkedIn anchors have target='_blank' rel='noopener noreferrer'; mailto: anchor does NOT"
    - "2 CV download buttons rendered: FR (Button variant=default, href=/cv-fr.pdf, download attr) + EN (Button variant=outline, href=/cv-en.pdf, download attr) — both with FileDown icon"
    - "aria-labels localized via contact.social.*; download attrs name the file CV_Tanguy_Delrieu_{FR,EN}.pdf"
  artifacts:
    - path: "components/sections/Contact.tsx"
      provides: "'use client' Contact section component — email copy + 3 socials + 2 CV downloads"
      contains: "navigator.clipboard.writeText"
    - path: "components/sections/Contact.test.tsx"
      provides: "Vitest spec turned GREEN from Wave 0 RED harness"
  key_links:
    - from: "components/sections/Contact.tsx"
      to: "@/lib/constants"
      via: "imports EMAIL, GITHUB_URL, LINKEDIN_URL"
      pattern: "from '@/lib/constants'"
    - from: "components/sections/Contact.tsx"
      to: "navigator.clipboard.writeText"
      via: "async onCopy handler wraps in try/catch"
      pattern: "navigator\\.clipboard\\.writeText"
    - from: "components/sections/Contact.tsx"
      to: "motion/react AnimatePresence + motion.span"
      via: "icon swap Copy<->Check; setState-driven mode='wait'"
      pattern: "AnimatePresence"
    - from: "components/sections/Contact.tsx"
      to: "components/ui/button asChild + <a download>"
      via: "<Button asChild><a href download/></Button> for CV downloads"
      pattern: "asChild"
---

<objective>
Implement the Contact section per HOME-07: email copy-to-clipboard with motion icon swap (`Copy` → `Check` + 1.5s revert), 3 social links reusing Phase 3 lucide substitutions (`Code2` / `Briefcase` / `Mail`), and 2 prominent CV download buttons (`/cv-fr.pdf` FR primary + `/cv-en.pdf` EN outline) with `<a href download>` attributes. Silent failure on clipboard rejection (Phase 2 D-02 precedent). All URLs and email sourced from `lib/constants.ts` (Wave 0).

Purpose: The conversion path. The user wants to discuss work — Contact must make email-copy effortless, surface professional links, and let the recruiter grab a PDF CV without clicking around. Everything is `mailto:`-only at v1; no backend.

Output:
- `components/sections/Contact.tsx` — `'use client'` component, exports `Contact`
- `components/sections/Contact.test.tsx` — Wave 0 RED harness turns GREEN with full HOME-07 assertions
- Estimated execution: ~25-35 minutes
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
@components/layout/Footer.tsx
@components/sections/Contact.test.tsx
@messages/fr.json
@messages/en.json
@CLAUDE.md

<interfaces>
<!-- Key contracts the executor MUST honor. -->

From lib/constants.ts (Wave 0):
```typescript
export const EMAIL: string;          // placeholder 'tanguy@example.com'
export const GITHUB_URL: string;     // 'https://github.com/tanguynoumea/portfolio'
export const LINKEDIN_URL: string;   // 'https://www.linkedin.com/in/tanguy-delrieu'
```

From messages/fr.json + messages/en.json (preserved Phase 1):
- `contact.title` — "Me contacter" / "Get in touch"
- `contact.intro` — preserved
- `contact.email` — aria-label for the email copy button (FR: "Copier l'adresse email" / EN: "Copy email address")
- `contact.emailCopied` — feedback label after copy (FR: "Adresse copiée !" / EN: "Address copied!")
- `contact.cv.fr` — FR CV button label ("Télécharger le CV (FR)")
- `contact.cv.en` — EN CV button label ("Download CV (EN)")
- `contact.social.github` — "GitHub"
- `contact.social.linkedin` — "LinkedIn"

From lucide-react@^1.16.0 (Phase 3 substitutions):
- `Code2` — GitHub substitute (brand icons removed)
- `Briefcase` — LinkedIn substitute
- `Mail` — Email
- `Copy` + `Check` — for icon swap
- `FileDown` — CV download button icon

From components/ui/button.tsx (existing shadcn primitive):
- `<Button asChild variant="default">` lets us pass an `<a>` as the styled child via Radix Slot (same pattern as Phase 3 Footer mailto link).
- Variants needed: `default` (FR CV primary) + `outline` (EN CV secondary).

From motion/react (Phase 2/3 already used):
- `<AnimatePresence mode="wait" initial={false}>` for icon-swap (since these are sibling icons, sequential transitions match user expectation)
- `<motion.span initial={{...}} animate={{...}} exit={{...}}>` for the swap targets

From the Web Clipboard API:
- `await navigator.clipboard.writeText(EMAIL)` — modern API; requires HTTPS or localhost (verified secure-context in production via Vercel)
- Wrap in `try/catch` per 04-RESEARCH §"Pitfall 4-E" + Phase 2 D-02 silent-fallback precedent

Pitfall: `<a href="/cv-fr.pdf" download="CV_Tanguy_Delrieu_FR.pdf">` — `download` attribute works for same-origin static assets without CORS (PDFs in public/ are same-origin). Forces filename instead of inline render.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement Contact component</name>
  <files>components/sections/Contact.tsx</files>
  <behavior>
    - Renders title (h2) from contact.title
    - Email row: button containing font-mono span with EMAIL + Copy icon (or Check after copy); AnimatePresence wraps the swappable icon; sr-only aria-live="polite" announces "Address copied!" after copy
    - Social links row: 3 anchors with localized aria-labels — GitHub (Code2), LinkedIn (Briefcase), Email mailto (Mail). External links have target+rel; mailto does not.
    - CV downloads row: 2 shadcn Buttons (asChild wrapping an <a href download>) — FR default variant, EN outline variant; both with FileDown icon
    - Clipboard write wrapped in try/catch; silent failure
    - 1.5s revert via setTimeout
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-20, D-21, D-22)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Email copy-to-clipboard with motion icon swap" code example + §"CV PDF download buttons" code example + §"Pitfall 4-E" (clipboard secure context) + §"Pitfall 4-G" (lucide brand icon substitution)
    - .planning/phases/04-homepage-sections/04-00-assets-and-stubs-PLAN.md (lib/constants.ts + cv-fr.pdf / cv-en.pdf in public/)
    - components/sections/Contact.test.tsx (Wave 0 RED harness — implementation makes it GREEN)
    - components/layout/Footer.tsx (lucide substitution pattern + target/rel security)
    - components/ui/button.tsx (asChild pattern via Radix Slot)
  </read_first>
  <action>
    Create `components/sections/Contact.tsx`:

    ```tsx
    'use client';

    /**
     * components/sections/Contact.tsx — HOME-07 Phase 4.
     *
     * 4 interactive elements:
     *   1. Email button — copies EMAIL to clipboard via Clipboard API.
     *      Motion AnimatePresence swaps the Copy icon for Check + the
     *      contact.emailCopied label for 1.5s, then reverts. Silent failure
     *      on clipboard rejection (Phase 2 D-02 precedent).
     *   2. Social links — GitHub (Code2 substitute), LinkedIn (Briefcase
     *      substitute), Email mailto (Mail). Phase 3 D-23 lucide
     *      substitutions reused; aria-labels from contact.social.* i18n.
     *   3. CV downloads — 2 shadcn <Button asChild> wrapping <a href download>
     *      to public/cv-{fr,en}.pdf with FileDown icons. FR variant=default
     *      (primary visual), EN variant=outline (secondary).
     *
     * Colors: Tailwind utilities backed by --color-* tokens. No literals.
     * The parent <section id="contact"> is provided by app/[locale]/page.tsx.
     */

    import { useState } from 'react';
    import { useTranslations } from 'next-intl';
    import { motion, AnimatePresence } from 'motion/react';
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

    export function Contact() {
      const t = useTranslations('contact');
      const tSocial = useTranslations('contact.social');
      const [copied, setCopied] = useState(false);

      const onCopy = async () => {
        try {
          await navigator.clipboard.writeText(EMAIL);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // Silent fallback per Phase 2 D-02 precedent. No console.
        }
      };

      return (
        <div className="w-full">
          <div className="mx-auto max-w-3xl space-y-10 text-center">
            <h2 className="text-foreground text-3xl font-semibold">
              {t('title')}
            </h2>
            <p className="text-muted-foreground text-lg">{t('intro')}</p>

            {/* Email copy button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onCopy}
                aria-label={t('email')}
                className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex items-center gap-3 rounded-md border px-5 py-3 text-base font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <span>{EMAIL}</span>
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="text-primary h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only" aria-live="polite">
                  {copied ? t('emailCopied') : ''}
                </span>
              </button>
            </div>

            {/* Social links row */}
            <nav aria-label="social" className="flex justify-center gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial('github')}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Code2 className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial('linkedin')}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                aria-label="Email"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            </nav>

            {/* CV download buttons */}
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
    ```

    **CRITICAL CHECKS:**
    - Starts with `'use client'`
    - Imports `EMAIL, GITHUB_URL, LINKEDIN_URL` from `@/lib/constants`
    - Imports `useState` from React, `useTranslations` from next-intl, `motion, AnimatePresence` from `motion/react`, `Copy, Check, Code2, Briefcase, Mail, FileDown` from `lucide-react`, `Button` from `@/components/ui/button`
    - `navigator.clipboard.writeText(EMAIL)` inside `try/catch` with EMPTY catch
    - `setTimeout(() => setCopied(false), 1500)` after successful copy
    - `<AnimatePresence mode="wait" initial={false}>` wrapping the Copy/Check swap
    - 3 social anchors: GitHub (Code2 + target/rel), LinkedIn (Briefcase + target/rel), Email mailto (Mail, NO target/rel)
    - 2 `<Button asChild variant="default|outline">` wrapping `<a href download>`
    - Both CV buttons use `FileDown` icon
    - Download attr names: `CV_Tanguy_Delrieu_FR.pdf` + `CV_Tanguy_Delrieu_EN.pdf`
    - aria-live polite span for screen reader announcement
    - No literal colors
    - Named export `Contact`
  </action>
  <verify>
    <automated>node -e "const c=require('fs').readFileSync('components/sections/Contact.tsx','utf8'); const required=[\"'use client'\",'useTranslations','navigator.clipboard.writeText','AnimatePresence','motion.span','Copy','Check','Code2','Briefcase','Mail','FileDown','EMAIL','GITHUB_URL','LINKEDIN_URL','asChild','/cv-fr.pdf','/cv-en.pdf','CV_Tanguy_Delrieu_FR.pdf','CV_Tanguy_Delrieu_EN.pdf','target=\"_blank\"','rel=\"noopener noreferrer\"','aria-live=\"polite\"','export function Contact','try {','catch']; const missing=required.filter(r=>!c.includes(r)); if(missing.length){console.error('MISSING:',missing);process.exit(1)} const bad=c.match(/oklch\\(|#[0-9a-fA-F]{3,6}|rgb\\(|hsl\\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} const consoleCalls=c.match(/console\\.(error|warn|log)/g); if(consoleCalls){console.error('FORBIDDEN console call in silent-fail path:',consoleCalls);process.exit(1)} console.log('contact-impl-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/Contact.tsx` exists with `'use client'`
    - Imports EMAIL/GITHUB_URL/LINKEDIN_URL from `@/lib/constants`
    - Contains `navigator.clipboard.writeText(EMAIL)` inside `try { ... } catch { /* silent */ }`
    - Contains `AnimatePresence mode="wait"`
    - Contains both `<Copy>` AND `<Check>` lucide icons
    - Contains `Code2`, `Briefcase`, `Mail`, `FileDown` lucide icons (Phase 3 substitutions reused)
    - 3 social anchors: GitHub (target/rel), LinkedIn (target/rel), Email mailto (NO target/rel)
    - 2 CV `<Button asChild variant="default|outline">` wrapping `<a href download>`
    - `href="/cv-fr.pdf"` + `download="CV_Tanguy_Delrieu_FR.pdf"`
    - `href="/cv-en.pdf"` + `download="CV_Tanguy_Delrieu_EN.pdf"`
    - sr-only aria-live="polite" for screen-reader copy announcement
    - NO `console.*` calls (silent failure mandate)
    - NO literal colors
    - Named export `Contact`
    - `npm run lint` exit 0
    - Wave 0's `Contact.test.tsx` turns GREEN
  </acceptance_criteria>
  <done>Contact component shipped with email copy + 3 socials + 2 CV downloads; silent fallback verified; test harness GREEN.</done>
</task>

<task type="auto">
  <name>Task 2: Expand Contact.test.tsx with full HOME-07 acceptance assertions</name>
  <files>components/sections/Contact.test.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-VALIDATION.md (per-task rows 04-05-01..06)
    - components/sections/Contact.tsx (just-created implementation)
    - components/sections/Contact.test.tsx (Wave 0 RED harness)
  </read_first>
  <action>
    Extend Wave 0 harness with these test cases:

    1. Renders email button containing EMAIL constant text (mocked from lib/constants)
    2. Click on email button calls `navigator.clipboard.writeText(EMAIL)` — mock the clipboard API via:
       ```typescript
       const writeTextSpy = vi.fn().mockResolvedValue(undefined);
       Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });
       ```
    3. After successful copy: assert sr-only `aria-live="polite"` element contains the emailCopied label (use `screen.findByText` for async)
    4. Clipboard rejection is silent: mock writeText to reject; spy on `console.error`; assert console.error NOT called
    5. 3 social links present: query by aria-label (GitHub / LinkedIn / Email); assert hrefs match GITHUB_URL / LINKEDIN_URL / `mailto:${EMAIL}`
    6. GitHub + LinkedIn have target="_blank" and rel includes "noopener" + "noreferrer"; mailto: anchor does NOT have target/rel
    7. 2 CV buttons: query by text matching the cv.fr / cv.en i18n labels; assert href + download attributes

    Pattern reference: components/layout/Footer.test.tsx for getByLabelText + anchor assertions.

    Run `npx vitest run components/sections/Contact.test.tsx` — exits 0.
  </action>
  <verify>
    <automated>npx vitest run components/sections/Contact.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - Test file contains ≥ 5 describe blocks and ≥ 8 it() cases
    - Tests cover: email render, clipboard call on click, emailCopied label after copy, silent rejection (no console), 3 social hrefs + aria-labels + target/rel, 2 CV button hrefs + downloads
    - `npx vitest run components/sections/Contact.test.tsx` exits 0
  </acceptance_criteria>
  <done>Contact test suite exercises HOME-07 contract; all GREEN.</done>
</task>

</tasks>

<verification>
1. **Files exist:** Contact.tsx + Contact.test.tsx
2. **Lint:** `npm run lint` exit 0
3. **Type:** `npx tsc --noEmit` exit 0
4. **Test:** `npx vitest run components/sections/Contact.test.tsx` exit 0
5. **No literal colors:** `grep -E "oklch\(|#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" components/sections/Contact.tsx` returns nothing
6. **Silent fallback:** `grep -c "console\\." components/sections/Contact.tsx` returns 0
</verification>

<success_criteria>
- [ ] Contact.tsx with `'use client'`
- [ ] Imports from @/lib/constants (Wave 0)
- [ ] Clipboard try/catch with silent failure (no console)
- [ ] AnimatePresence Copy↔Check icon swap + 1.5s revert
- [ ] 3 social links with correct hrefs + target/rel (mailto no target/rel)
- [ ] 2 CV download buttons with FR/EN paths + download filenames
- [ ] aria-live polite for screen reader announcement
- [ ] No color literals
- [ ] Test harness GREEN
</success_criteria>

<output>
After completion, create `.planning/phases/04-homepage-sections/04-05-SUMMARY.md` documenting:
- Contact shipped (HOME-07)
- Clipboard API + silent fallback (Phase 2 D-02 precedent)
- Motion AnimatePresence icon swap pattern
- Phase 3 lucide substitutions reused (Code2 / Briefcase / Mail)
- CV downloads via Button asChild + a href download
- Tests added
</output>