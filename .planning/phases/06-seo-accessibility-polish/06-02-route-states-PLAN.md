---
phase: 06-seo-accessibility-polish
plan: 02
type: execute
wave: 1
depends_on: ["06-00"]
files_modified:
  - app/[locale]/not-found.tsx
  - app/[locale]/error.tsx
  - app/[locale]/loading.tsx
  - app/[locale]/projects/[slug]/loading.tsx
  - app/[locale]/not-found.test.tsx
  - app/[locale]/error.test.tsx
  - app/[locale]/loading.test.tsx
autonomous: true
requirements: [A11Y-03, EGG-02]
must_haves:
  truths:
    - "A bad URL renders a bilingual playful 404 with a motion entry animation and a styled back link to the locale home"
    - "404 motion entry gates on useReducedMotion (opacity-only when reduced)"
    - "An error boundary renders the errors.500 copy and a Reset button wired to the framework reset() prop (NOT a Server Action)"
    - "A loading fallback renders a role=status spinner that is static under reduced motion (motion-safe:animate-pulse)"
    - "error.tsx is 'use client' and contains reset() and does NOT contain 'use server'"
  artifacts:
    - path: "app/[locale]/not-found.tsx"
      provides: "EGG-02 custom 404, errors.404 i18n, motion entry, Link back"
      contains: "errors.404"
    - path: "app/[locale]/error.tsx"
      provides: "Client error boundary, errors.500, reset()"
      contains: "reset"
    - path: "app/[locale]/loading.tsx"
      provides: "role=status spinner, motion-safe pulse"
      contains: "role=\"status\""
    - path: "app/[locale]/projects/[slug]/loading.tsx"
      provides: "loading fallback for the slowest (MDX) route"
  key_links:
    - from: "app/[locale]/not-found.tsx"
      to: "@/i18n/navigation Link"
      via: "locale-aware back link"
      pattern: "Link.*href=\"/\""
    - from: "app/[locale]/error.tsx"
      to: "framework reset() prop"
      via: "onClick reset"
      pattern: "onClick.*reset"
    - from: "app/[locale]/not-found.tsx"
      to: "motion/react useReducedMotion"
      via: "reduced-motion gate"
      pattern: "useReducedMotion"
---

<objective>
Deliver A11Y-03 (the route-state trio: loading/error/not-found) and EGG-02 (the personality-driven bilingual custom 404). The `errors.404` + `errors.500` i18n keys already exist in both locales (Phase 1) — this plan WIRES them, it does not author copy. The 404 is the EGG-02 easter egg: large "404", motion entry (reduced-motion-gated to opacity-only), styled shadcn Button wrapping a locale-aware `<Link>` back home. The error boundary uses the framework `reset()` prop (NOT a Server Action — locking the REQUIREMENTS.md ambiguity per D-08). The loading fallback is a motion-safe spinner.

Purpose: Graceful failure + a delightful 404 are part of the "attention au détail" core value; a recruiter who hits a dead link gets personality, not a stack trace.
Output: not-found.tsx, error.tsx, loading.tsx (locale + project route), + 3 unit test files.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-seo-accessibility-polish/06-RESEARCH.md
@.planning/phases/06-seo-accessibility-polish/06-CONTEXT.md

<interfaces>
<!-- Verified contracts — no exploration needed. -->

i18n keys ALREADY EXIST in BOTH messages/fr.json and messages/en.json (full parity):
  errors.404 = { title, message, back }   (FR: "Page introuvable" / "...perdu dans le pixel art." / "Retour à l'accueil")
  errors.500 = { title, message, reset }  (FR: "Quelque chose s'est cassé" / "...j'ai cassé quelque chose..." / "Réessayer")
DO NOT add new keys unless the 404 needs more than title/message/back — if you do, add to BOTH locales (parity-gated by scripts/check-i18n-parity.ts).

i18n/navigation.ts exports `Link` (locale-aware — `<Link href="/">` auto-prefixes the active locale: fr→`/`, en→`/en`).

@/components/ui/button exports `Button` (shadcn, supports `asChild` to wrap a Link).

motion/react exports `motion` and `useReducedMotion()` (returns boolean | null; treat truthy as reduced).

next-intl (client) exports `useTranslations(namespace)`. The IntlProvider in [locale]/layout.tsx passes the FULL message bundle, so `errors.404`/`errors.500` are available client-side. error.tsx + not-found.tsx render INSIDE that provider.

Existing test mock convention (from Contact.test.tsx / page.test.tsx): mock `motion/react` with `React.createElement` (serialize `initial`/`animate`/`whileHover` as data attributes), mock `next-intl` with a flat key resolver, mock `@/i18n/navigation` Link as an `<a>`. NO global jest-dom extend — use native chai matchers (`expect(x).toBe(...)`, `.toContain(...)`), query via `container.querySelector`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: app/[locale]/not-found.tsx (EGG-02) + app/[locale]/error.tsx</name>
  <read_first>
    - 06-RESEARCH.md §8 (not-found.tsx verbatim), §7 (error.tsx verbatim), Pitfall 4 (error.tsx client-only — no server imports/metadata)
    - messages/fr.json + messages/en.json errors.404/errors.500 (already exist — see interfaces)
    - components/sections/Contact.tsx (the established motion + useReducedMotion gate pattern, e.g. AnimatePresence Copy↔Check)
  </read_first>
  <action>
    Create `app/[locale]/not-found.tsx` (EGG-02) VERBATIM from 06-RESEARCH §8. It is `'use client'` (next-intl recommends client `useTranslations` for localized not-found; it renders inside the layout IntlProvider). It accepts NO props (do not read params). The `<Link href="/">` auto-prefixes the locale. `useReducedMotion()` gates scale→opacity-only:

    ```tsx
    'use client';
    import { useTranslations } from 'next-intl';
    import { motion, useReducedMotion } from 'motion/react';
    import { Link } from '@/i18n/navigation';
    import { Button } from '@/components/ui/button';

    export default function NotFound() {
      const t = useTranslations('errors.404');
      const reduce = useReducedMotion();

      return (
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-accent text-8xl font-bold tracking-tight">404</span>
            <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('message')}</p>
            <Button asChild>
              <Link href="/">{t('back')}</Link>
            </Button>
          </motion.div>
        </div>
      );
    }
    ```

    Create `app/[locale]/error.tsx` (A11Y-03, D-08) VERBATIM from 06-RESEARCH §7. MUST be `'use client'`. Uses the framework `reset()` prop — NO Server Action, NO `metadata` export, NO `next-intl/server` import (Pitfall 4):

    ```tsx
    'use client';
    import { useEffect } from 'react';
    import { useTranslations } from 'next-intl';
    import { Button } from '@/components/ui/button';

    export default function Error({
      error,
      reset,
    }: {
      error: Error & { digest?: string };
      reset: () => void;
    }) {
      const t = useTranslations('errors.500');
      useEffect(() => {
        // optional: report error; keep silent in prod per project console hygiene
      }, [error]);

      return (
        <div role="alert" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-foreground text-3xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('message')}</p>
          <Button onClick={() => reset()}>{t('reset')}</Button>
        </div>
      );
    }
    ```
    Keep `reset()` (D-08 locked) — do NOT use the new `unstable_retry`. Do NOT wire a Server Action despite the REQUIREMENTS.md A11Y-03 wording ("via Server Actions") — App Router error boundaries use the framework `reset()`; D-08 explicitly locks this.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const e=fs.readFileSync('app/[locale]/error.tsx','utf8'); if(!e.includes(\"'use client'\")) throw new Error('error.tsx missing use client'); if(!e.includes('reset()')) throw new Error('error.tsx missing reset()'); if(e.includes('use server')) throw new Error('error.tsx must NOT be a Server Action'); if(e.includes('next-intl/server')) throw new Error('error.tsx must not import next-intl/server'); const nf=fs.readFileSync('app/[locale]/not-found.tsx','utf8'); if(!nf.includes('useReducedMotion')) throw new Error('not-found missing useReducedMotion gate'); if(!nf.includes('errors.404')) throw new Error('not-found not wired to errors.404'); console.log('OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/error.tsx` contains `'use client'` AND `reset()` AND does NOT contain `'use server'` AND does NOT import `next-intl/server` AND has no `metadata` export
    - `app/[locale]/not-found.tsx` contains `'use client'`, `useTranslations('errors.404')`, `useReducedMotion`, and `<Link href="/">` from `@/i18n/navigation`
    - Both reuse EXISTING i18n keys (no new keys added unless parity-maintained)
  </acceptance_criteria>
  <done>404 (EGG-02, motion-gated, locale-aware back link) + client error boundary (reset(), errors.500, no Server Action) created.</done>
</task>

<task type="auto">
  <name>Task 2: app/[locale]/loading.tsx + project-route loading.tsx</name>
  <read_first>
    - 06-RESEARCH.md §9 (loading.tsx verbatim; motion-safe:animate-pulse for reduced-motion safety)
    - D-09 (loading.tsx at locale level + project route, palette CSS vars only)
  </read_first>
  <action>
    Create `app/[locale]/loading.tsx` (A11Y-03, D-09) VERBATIM from 06-RESEARCH §9. Server Component (NO `'use client'`). `motion-safe:animate-pulse` so reduced-motion users get a static dot:

    ```tsx
    // Server Component (no 'use client'). motion-safe: pulse → static under reduced-motion.
    export default function Loading() {
      return (
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
          <div className="bg-accent h-10 w-10 rounded-full opacity-80 motion-safe:animate-pulse" />
          <span className="sr-only">Loading…</span>
        </div>
      );
    }
    ```

    Create `app/[locale]/projects/[slug]/loading.tsx` — the slowest route (dynamic MDX import). Use the SAME component body (a duplicate is fine; both are tiny server components). To avoid divergence, re-export the locale-level one:

    ```tsx
    export { default } from '../../loading';
    ```
    (Path from `app/[locale]/projects/[slug]/loading.tsx` up to `app/[locale]/loading.tsx` is `../../loading`. If the re-export path resolves incorrectly under the route group, inline the same JSX body instead.)

    Colors: palette CSS vars only (`bg-accent`). No hardcoded colors. No new i18n key needed (the `sr-only` "Loading…" + `aria-label="Loading"` are acceptable as-is per D-09; only add `errors.loading`/`common.loading` to BOTH locales if a localized label is wanted — not required).
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const l=fs.readFileSync('app/[locale]/loading.tsx','utf8'); if(l.includes(\"'use client'\")) throw new Error('loading.tsx should be a Server Component'); if(!l.includes('role=\"status\"')) throw new Error('loading.tsx missing role=status'); if(!l.includes('motion-safe:animate-pulse')) throw new Error('loading.tsx missing motion-safe pulse'); fs.readFileSync('app/[locale]/projects/[slug]/loading.tsx'); console.log('OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `app/[locale]/loading.tsx` exists, is a Server Component (no `'use client'`), contains `role="status"` and `motion-safe:animate-pulse`
    - `app/[locale]/projects/[slug]/loading.tsx` exists
    - Uses only palette CSS vars (`bg-accent`), no hardcoded color
  </acceptance_criteria>
  <done>loading.tsx at locale + project route; motion-safe spinner; reduced-motion gives a static dot.</done>
</task>

<task type="auto">
  <name>Task 3: Unit tests for not-found, error (reset spy), loading</name>
  <read_first>
    - 06-RESEARCH.md §10 (mock conventions reference) + the VALIDATION.md per-task map rows for 06-02
    - components/sections/Contact.test.tsx + app/[locale]/projects/[slug]/page.test.tsx (the exact mock shapes: motion via React.createElement, next-intl flat resolver, Link as <a>, native chai matchers, no jest-dom)
  </read_first>
  <action>
    Write `app/[locale]/error.test.tsx` — render the boundary, click the reset button, assert the `reset` spy was called + errors.500 copy renders:

    ```tsx
    import { describe, it, expect, vi } from 'vitest';
    import React from 'react';
    import { render, fireEvent } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: () => (key: string) => `errors.500.${key}`,
    }));
    vi.mock('@/components/ui/button', () => ({
      Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) =>
        React.createElement('button', { onClick }, children),
    }));

    import ErrorBoundary from './error';

    describe('error.tsx (A11Y-03)', () => {
      it('renders errors.500 copy and calls reset() on button click', () => {
        const reset = vi.fn();
        const { getByRole, container } = render(
          <ErrorBoundary error={new Error('boom')} reset={reset} />,
        );
        expect(container.textContent).toContain('errors.500.title');
        expect(container.textContent).toContain('errors.500.message');
        fireEvent.click(getByRole('button'));
        expect(reset).toHaveBeenCalledTimes(1);
      });
    });
    ```

    Write `app/[locale]/not-found.test.tsx` — assert errors.404 title/message + the back Link to `/`, AND assert the motion entry gates on `useReducedMotion` (mock it both ways):

    ```tsx
    import { describe, it, expect, vi } from 'vitest';
    import React from 'react';
    import { render } from '@testing-library/react';

    const reduceRef = { current: false as boolean };
    vi.mock('next-intl', () => ({
      useTranslations: () => (key: string) => `errors.404.${key}`,
    }));
    vi.mock('motion/react', () => ({
      useReducedMotion: () => reduceRef.current,
      motion: new Proxy({}, {
        get: (_t, tag: string) =>
          ({ children, initial, animate, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
            React.createElement(
              tag,
              { ...rest, 'data-initial': JSON.stringify(initial), 'data-animate': JSON.stringify(animate) },
              children as React.ReactNode,
            ),
      }),
    }));
    vi.mock('@/i18n/navigation', () => ({
      Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
        React.createElement('a', { href }, children),
    }));
    vi.mock('@/components/ui/button', () => ({
      Button: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    }));

    import NotFound from './not-found';

    describe('not-found.tsx (EGG-02 / A11Y-03)', () => {
      it('renders errors.404 title/message and a back link to /', () => {
        reduceRef.current = false;
        const { container } = render(<NotFound />);
        expect(container.textContent).toContain('errors.404.title');
        expect(container.textContent).toContain('errors.404.message');
        const a = container.querySelector('a');
        expect(a?.getAttribute('href')).toBe('/');
      });
      it('motion entry is opacity-only under reduced motion', () => {
        reduceRef.current = true;
        const { container } = render(<NotFound />);
        const mdiv = container.querySelector('[data-initial]');
        const initial = JSON.parse(mdiv!.getAttribute('data-initial')!);
        expect(initial).toEqual({ opacity: 0 }); // NO scale when reduced
      });
    });
    ```

    Write `app/[locale]/loading.test.tsx`:

    ```tsx
    import { describe, it, expect } from 'vitest';
    import { render } from '@testing-library/react';
    import Loading from './loading';

    describe('loading.tsx (A11Y-03)', () => {
      it('renders a role=status spinner with motion-safe:animate-pulse', () => {
        const { container, getByRole } = render(<Loading />);
        expect(getByRole('status')).toBeTruthy();
        expect(container.innerHTML).toContain('motion-safe:animate-pulse');
      });
    });
    ```
    Match the existing mock conventions exactly (Contact.test.tsx / page.test.tsx) — if any import shape differs, adapt the mock, not the component.
  </action>
  <verify>
    <automated>npx vitest run "app/[locale]/error.test.tsx" "app/[locale]/not-found.test.tsx" "app/[locale]/loading.test.tsx"</automated>
  </verify>
  <acceptance_criteria>
    - error.test asserts `reset` spy called on click AND errors.500 copy renders
    - not-found.test asserts errors.404 title/message + back `<a href="/">` AND that `initial` is `{ opacity: 0 }` (no scale) when `useReducedMotion` is true
    - loading.test asserts `role=status` + `motion-safe:animate-pulse`
    - `npx vitest run` on all three test files exits 0
  </acceptance_criteria>
  <done>All three route-state files have passing unit tests including the reset() spy and the reduced-motion gate assertion.</done>
</task>

</tasks>

<verification>
- `npx vitest run "app/[locale]/error.test.tsx" "app/[locale]/not-found.test.tsx" "app/[locale]/loading.test.tsx"` all green
- error.tsx: `'use client'` + `reset()`, no `'use server'`, no `next-intl/server`, no `metadata` export
- not-found.tsx: `errors.404` wired, `useReducedMotion` gate, locale-aware `<Link href="/">`
- loading.tsx (+ project route): `role=status`, `motion-safe:animate-pulse`, palette colors only
- i18n parity preserved (no unbalanced new keys): `tsx scripts/check-i18n-parity.ts` exits 0
</verification>

<success_criteria>
A11Y-03: loading/error/not-found all exist at `app/[locale]/`; error.tsx offers a Reset via the framework reset() prop (NOT a Server Action). EGG-02: the 404 renders bilingual humor with a reduced-motion-gated motion entry and a styled locale-aware back link. The existing i18n keys are wired with full FR/EN parity maintained.
</success_criteria>

<output>
After completion, create `.planning/phases/06-seo-accessibility-polish/06-02-SUMMARY.md`
</output>
