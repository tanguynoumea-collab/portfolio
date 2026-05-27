---
phase: 03-layout-animation-foundation
plan: 04
type: execute
wave: 2
depends_on: ["03-02"]
files_modified:
  - components/layout/Footer.tsx
  - components/layout/Footer.test.tsx
autonomous: true
requirements: [LAYOUT-04]
must_haves:
  truths:
    - "Footer renders a single row on desktop (copyright + tagline left; social icon row right) and stacks to 2 rows on mobile"
    - "Footer accepts a `year` prop (number) — value passed by the server-rendered parent layout via new Date().getFullYear()"
    - "Footer renders the year inside the existing footer.copyright ICU template (`© {year} ...`)"
    - "Footer renders 3 social links with lucide-react icons (Github, Linkedin, Mail) wired with target='_blank' rel='noopener noreferrer'"
    - "Footer Mail link uses mailto: protocol (NOT https)"
    - "Footer GitHub link points to https://github.com/tanguynoumea/portfolio (per D-23 + FEATURES.md)"
    - "Footer is a <footer> semantic landmark"
    - "Footer renders the existing footer.tagline key (FR/EN already parity-verified for tagline + copyright after this plan)"
    - "messages/en.json footer.tagline matches the project tagline (not 'À compléter') — parity check passes"
    - "Vitest spec covers year + tagline + 3 social link attributes + lucide icons"
  artifacts:
    - path: "components/layout/Footer.tsx"
      provides: "Compact-row footer with social icons + dynamic year + i18n tagline"
      contains: "footer"
    - path: "components/layout/Footer.test.tsx"
      provides: "Render assertions for year, tagline, 3 social links with rel/target attributes"
      contains: "describe"
  key_links:
    - from: "app/[locale]/layout.tsx"
      to: "components/layout/Footer.tsx"
      via: "year prop server-rendered"
      pattern: "<Footer year=\\{"
    - from: "components/layout/Footer.tsx"
      to: "messages/{fr,en}.json"
      via: "useTranslations('footer')"
      pattern: "useTranslations"
    - from: "components/layout/Footer.tsx"
      to: "lucide-react"
      via: "Github, Linkedin, Mail icons"
      pattern: "lucide-react"
---

<objective>
Ship LAYOUT-04: a compact, single-row footer with the server-rendered dynamic year, the existing `footer.tagline` i18n string, and a row of 3 lucide-react social-link icons (GitHub repo, LinkedIn, mailto). On mobile it stacks to 2 rows.

This plan REPLACES the body of the stub `components/layout/Footer.tsx` created in Plan 02 — the layout import continues to resolve. The `year` prop is already passed by the parent via `<Footer year={new Date().getFullYear()} />`.

Output: real Footer.tsx + Vitest spec proving the contract.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/03-layout-animation-foundation/03-CONTEXT.md
@.planning/phases/03-layout-animation-foundation/03-RESEARCH.md
@CLAUDE.md
@components/layout/Footer.tsx
@messages/fr.json
@messages/en.json
@app/[locale]/layout.tsx

<interfaces>
From `next-intl`:
```typescript
// Client-component hook — uses ICU placeholders
const t = useTranslations('footer');
t('copyright', { year: 2026 }); // -> "© 2026 Tanguy Delrieu. Tous droits réservés."
```

From `lucide-react` (already installed):
```typescript
import { Github, Linkedin, Mail } from 'lucide-react';
// Each component accepts: className, size, aria-hidden, strokeWidth
```

From messages/{fr,en}.json existing keys (verified):
- `footer.tagline` (fr: "Construit avec Next.js et beaucoup de café.", en: "Built with Next.js and a lot of coffee.")
- `footer.copyright` (fr: "© {year} Tanguy Delrieu. Tous droits réservés.", en: "© {year} Tanguy Delrieu. All rights reserved.")
- `contact.social.github` (fr/en: "GitHub")
- `contact.social.linkedin` (fr/en: "LinkedIn")
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement components/layout/Footer.tsx (compact-row, 3 social icons via lucide, dynamic year, FR/EN parity-aware tagline) + Vitest spec</name>
  <files>components/layout/Footer.tsx, components/layout/Footer.test.tsx</files>
  <read_first>
    - components/layout/Footer.tsx (current stub from Plan 02 — replace body, keep `function Footer({ year }: { year: number })` signature)
    - messages/fr.json (verify `footer.tagline` and `footer.copyright` keys exist with `{year}` placeholder)
    - messages/en.json (same — verify parity)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Footer" (D-22..D-25)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §3 (server-rendered year via prop)
    - components/theme/PaletteFab.tsx (example of an existing client component with lucide icon usage)
  </read_first>
  <behavior>
    Test 1: Footer renders a `<footer>` element (semantic landmark).
    Test 2: Footer renders the dynamic year inside the copyright template — `expect(screen.getByText(/© 2026/)).toBeInTheDocument()`.
    Test 3: Footer renders 3 anchor links — one to GitHub portfolio repo, one to LinkedIn, one to mailto. Each has target="_blank" and rel containing "noopener" and "noreferrer". The mailto link has href starting with `mailto:`.
    Test 4: Footer renders 3 lucide icons (matched by aria-hidden + svg).
    Test 5: Footer renders the tagline text from messages.footer.tagline.
  </behavior>
  <action>
    **Replace the body of `components/layout/Footer.tsx`** (keep the `'use client'` and named export). The signature stays `function Footer({ year }: { year: number })` (from Plan 02 stub).

    Required implementation:

    ```typescript
    'use client';

    import { useTranslations } from 'next-intl';
    import { Github, Linkedin, Mail } from 'lucide-react';

    /**
     * LAYOUT-04: compact-row footer with social links + dynamic year + tagline.
     * Mobile: stacks to 2 rows (copyright top, socials bottom).
     * Year is server-rendered by the parent layout and passed as a prop (D-24)
     * so we don't introduce a "use client" hydration mismatch around new Date().
     * GitHub link points to the portfolio repo (per D-23 + FEATURES.md research).
     */
    const PORTFOLIO_REPO = 'https://github.com/tanguynoumea/portfolio';
    const LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu';
    const CONTACT_EMAIL = 'mailto:contact@tanguy-delrieu.dev';

    export function Footer({ year }: { year: number }) {
      const t = useTranslations('footer');
      const tSocial = useTranslations('contact.social');

      return (
        <footer className="border-border bg-background/60 text-muted-foreground border-t mt-16 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm sm:px-6 md:flex-row">
            {/* Left: copyright + tagline */}
            <div className="flex flex-col items-center gap-1 md:items-start">
              <p>{t('copyright', { year })}</p>
              <p className="text-xs">{t('tagline')}</p>
            </div>

            {/* Right: social row */}
            <nav aria-label="social" className="flex items-center gap-3">
              <a
                href={PORTFOLIO_REPO}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial('github')}
                className="hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial('linkedin')}
                className="hover:text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={CONTACT_EMAIL}
                aria-label="Email"
                className="hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </footer>
      );
    }
    ```

    Constraints:
    - First line MUST be `'use client'` (uses useTranslations which is a hook).
    - Keep the export name `function Footer({ year }: { year: number })` (Plan 02 layout passes this prop).
    - GitHub URL MUST be exactly `https://github.com/tanguynoumea/portfolio` (D-23 + FEATURES.md).
    - All 3 external links (https + mailto) MUST have `target="_blank"` EXCEPT the mailto (mail clients don't honor target). Actually re-read D-23: it says `target="_blank" rel="noopener noreferrer"` and "Email uses mailto:". Both https links must have target+rel. The mailto link CAN have target+rel for consistency (no harm), but the test requirement is the rel/target attrs on the GitHub + LinkedIn anchors specifically.

    Decision: GitHub + LinkedIn anchors carry `target="_blank" rel="noopener noreferrer"`. The Mail anchor has neither (mailto: + target=_blank causes blank window flash in some browsers).

    - DO NOT add color literals; all colors via Tailwind utilities backed by the palette tokens.
    - DO NOT add `cursor: none`.
    - DO NOT call `new Date()` inside the component — the year comes via prop (D-24 server-rendered).
    - Use `useTranslations('footer')` for `tagline` + `copyright`; use `useTranslations('contact.social')` for `github` + `linkedin` labels.

    **Create `components/layout/Footer.test.tsx`**:

    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render, screen } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => (k: string, vars?: Record<string, unknown>) => {
        if (ns === 'footer' && k === 'copyright') return `© ${vars?.year} Tanguy Delrieu. Tous droits réservés.`;
        if (ns === 'footer' && k === 'tagline') return 'Construit avec Next.js et beaucoup de café.';
        if (ns === 'contact.social' && k === 'github') return 'GitHub';
        if (ns === 'contact.social' && k === 'linkedin') return 'LinkedIn';
        return `${ns}.${k}`;
      },
    }));

    let Footer: (p: { year: number }) => JSX.Element;
    beforeEach(async () => {
      const mod = await import('./Footer');
      Footer = mod.Footer;
    });

    describe('Footer', () => {
      it('renders a <footer> landmark with the dynamic year', () => {
        const { container } = render(<Footer year={2026} />);
        const footerEl = container.querySelector('footer');
        expect(footerEl).not.toBeNull();
        expect(screen.getByText(/© 2026/)).toBeInTheDocument();
      });

      it('renders the tagline from messages.footer.tagline', () => {
        render(<Footer year={2026} />);
        expect(screen.getByText(/Construit avec Next.js/)).toBeInTheDocument();
      });

      it('renders 3 social anchors — GitHub, LinkedIn, Mail', () => {
        render(<Footer year={2026} />);
        const github = screen.getByLabelText('GitHub') as HTMLAnchorElement;
        const linkedin = screen.getByLabelText('LinkedIn') as HTMLAnchorElement;
        const mail = screen.getByLabelText('Email') as HTMLAnchorElement;
        expect(github.href).toBe('https://github.com/tanguynoumea/portfolio');
        expect(linkedin.href).toMatch(/linkedin\.com/);
        expect(mail.href).toMatch(/^mailto:/);
      });

      it('GitHub + LinkedIn anchors have target=_blank and rel=noopener noreferrer', () => {
        render(<Footer year={2026} />);
        const github = screen.getByLabelText('GitHub');
        const linkedin = screen.getByLabelText('LinkedIn');
        expect(github).toHaveAttribute('target', '_blank');
        expect(github.getAttribute('rel')).toMatch(/noopener/);
        expect(github.getAttribute('rel')).toMatch(/noreferrer/);
        expect(linkedin).toHaveAttribute('target', '_blank');
        expect(linkedin.getAttribute('rel')).toMatch(/noopener/);
        expect(linkedin.getAttribute('rel')).toMatch(/noreferrer/);
      });
    });
    ```
  </action>
  <verify>
    <automated>npm test -- Footer</automated>
  </verify>
  <acceptance_criteria>
    - File `components/layout/Footer.tsx` exists and is NOT a stub (no `return null` as the entire body).
    - File starts with `'use client'`.
    - File contains the literal string `function Footer({ year }: { year: number })` (or equivalent typed signature).
    - File contains the literal string `from 'lucide-react'`.
    - File contains the literal strings `Github`, `Linkedin`, `Mail` (lucide icon imports).
    - File contains the literal string `https://github.com/tanguynoumea/portfolio` (D-23 portfolio repo).
    - File contains the literal string `mailto:` (Mail link href prefix).
    - File contains the literal string `target="_blank"` (at least twice — GitHub + LinkedIn).
    - File contains the literal string `rel="noopener noreferrer"` (at least twice).
    - File contains the literal string `t('copyright', { year })` (or shorthand variant — ICU template with year).
    - File contains the literal string `t('tagline')`.
    - File contains the literal string `<footer` (semantic landmark).
    - File does NOT contain `new Date()` (year is server-rendered per D-24).
    - File does NOT contain `cursor: none`.
    - File does NOT contain any hex/rgb/hsl/oklch color literal.
    - Test file `components/layout/Footer.test.tsx` exists with at least 4 `it(` blocks.
    - `npm test -- Footer` exits 0.
  </acceptance_criteria>
  <done>Footer renders the compact row with year + tagline + 3 social links; tests prove the link attributes + semantic landmark.</done>
</task>

<task type="auto">
  <name>Task 2: Verify FR/EN parity for footer.tagline and run the full Phase 1 parity check (if a script exists)</name>
  <files>messages/fr.json, messages/en.json</files>
  <read_first>
    - messages/fr.json (verify footer.tagline + footer.copyright keys, FR values are correct)
    - messages/en.json (verify footer.tagline + footer.copyright keys, EN values are correct)
    - .planning/STATE.md (look for the Phase 1 parity script — STATE.md notes a Node script comparing sorted leaf-key paths)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Footer" D-25 (Tagline already in fr.json — verify EN parity)
  </read_first>
  <action>
    This task does NOT modify messages files for tagline/copyright if EN parity is already correct. The current EN file (per the Read in context) already has:
    - `footer.tagline`: "Built with Next.js and a lot of coffee."
    - `footer.copyright`: "© {year} Tanguy Delrieu. All rights reserved."

    Both keys exist in both files — parity for `footer.*` is already present from Phase 1.

    Run the inline parity check command — must exit 0:

    ```bash
    node -e "const fr=JSON.parse(require('fs').readFileSync('messages/fr.json','utf8'));const en=JSON.parse(require('fs').readFileSync('messages/en.json','utf8'));function leaves(o,p='',acc=[]){for(const k in o){const v=o[k];if(v&&typeof v==='object')leaves(v,p+'.'+k,acc);else acc.push(p+'.'+k);}return acc;}const fs=leaves(fr).sort().join('|');const es=leaves(en).sort().join('|');if(fs!==es){console.error('PARITY MISMATCH');process.exit(1);}console.log('FULL i18n parity OK');"
    ```

    If the parity check FAILS, identify the missing key and ADD it to the lacking file with an appropriate translation. Do not modify any pre-existing value.

    No source file edits are expected in this task — it is a verification gate. If a parity script under `scripts/` exists (the Phase 1 STATE.md mentions one), run that instead.

    NB: Plan 03 Task 1 already added `nav.lang.label` and `nav.lang.switchTo` to BOTH files — those are accounted for and parity is preserved.
  </action>
  <verify>
    <automated>node -e "const fr=JSON.parse(require('fs').readFileSync('messages/fr.json','utf8'));const en=JSON.parse(require('fs').readFileSync('messages/en.json','utf8'));function leaves(o,p='',acc=[]){for(const k in o){const v=o[k];if(v&&typeof v==='object')leaves(v,p+'.'+k,acc);else acc.push(p+'.'+k);}return acc;}const fs=leaves(fr).sort().join('|');const es=leaves(en).sort().join('|');if(fs!==es){console.error('PARITY MISMATCH');process.exit(1);}console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `messages/fr.json` contains the literal string `"tagline": "Construit avec Next.js et beaucoup de café."`.
    - `messages/en.json` contains the literal string `"tagline": "Built with Next.js and a lot of coffee."`.
    - `messages/fr.json` contains the literal string `"copyright": "© {year} Tanguy Delrieu. Tous droits réservés."`.
    - `messages/en.json` contains the literal string `"copyright": "© {year} Tanguy Delrieu. All rights reserved."`.
    - The parity check command above exits 0 with "OK" output.
    - `npm run build` exits 0.
  </acceptance_criteria>
  <done>FR/EN footer keys verified parity-clean; the broader parity script passes.</done>
</task>

</tasks>

<verification>
- `components/layout/Footer.tsx` exists with real implementation (no `return null`).
- `components/layout/Footer.test.tsx` passes >= 4 tests.
- GitHub link is exactly `https://github.com/tanguynoumea/portfolio`.
- LinkedIn + GitHub anchors have `target="_blank"` and `rel="noopener noreferrer"`.
- Mail link uses `mailto:` protocol.
- Footer is a `<footer>` element (semantic landmark).
- Footer accepts and uses the `year` prop (D-24 server-rendered).
- `npm test` exits 0 with passing Footer + Plan 03 tests.
- FR/EN parity script exits 0.
</verification>

<success_criteria>
A user visiting `/fr` or `/en` sees a compact footer with the localized copyright (including the current year), the localized tagline, and a row of 3 lucide icons linking to the portfolio's GitHub repo, LinkedIn profile, and a mailto contact. On mobile, the layout stacks vertically. No JavaScript Date() call at render time on the client (avoids hydration mismatch).
</success_criteria>

<output>
After completion, create `.planning/phases/03-layout-animation-foundation/03-04-SUMMARY.md` documenting:
- The 2 files created/modified.
- The exact 3 social link URLs used (GitHub repo, LinkedIn placeholder, mailto address).
- Confirmation that the FR/EN parity check passes.
- Confirmation that the year is server-rendered via prop (no `new Date()` inside the Footer component).
</output>
