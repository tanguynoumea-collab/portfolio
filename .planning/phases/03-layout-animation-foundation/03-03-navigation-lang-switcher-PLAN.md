---
phase: 03-layout-animation-foundation
plan: 03
type: execute
wave: 2
depends_on: ["03-02"]
files_modified:
  - components/layout/Navigation.tsx
  - components/layout/Navigation.test.tsx
  - components/layout/LanguageSwitcher.tsx
  - components/layout/LanguageSwitcher.test.tsx
  - lib/hooks/useActiveSection.ts
  - lib/hooks/useActiveSection.test.ts
  - i18n/navigation.ts
  - messages/fr.json
  - messages/en.json
autonomous: true
requirements: [LAYOUT-03, LAYOUT-05]
must_haves:
  truths:
    - "Navigation renders fixed-top with logo on left, section anchor links in the center, LanguageSwitcher on the right"
    - "Navigation is transparent at scroll=0 and switches to backdrop-blur-md with border-bottom after scrolling >50px"
    - "Section anchor links use Lenis anchors:true (no JS click handler — pure <a href='#id'>)"
    - "Active section link is highlighted via the useActiveSection IntersectionObserver hook"
    - "Below md breakpoint, section links collapse into a Sheet side='left' hamburger menu; Sheet content has data-lenis-prevent"
    - "Navigation does NOT include a PaletteFab button (PaletteFab stays a separate FAB)"
    - "LanguageSwitcher renders FR and EN buttons with motion layoutId='lang-indicator' for the active background"
    - "LanguageSwitcher clicking an inactive locale calls router.replace({pathname, params}, {locale: target}) from @/i18n/navigation"
    - "LanguageSwitcher imperatively sets document.documentElement.lang = locale after navigation"
    - "LanguageSwitcher preserves scroll position via lenis.scrollTo(savedY, {immediate: true}) (falls back to window.scrollTo)"
    - "LanguageSwitcher has aria-pressed on each button and localized aria-label from new nav.lang.* keys"
    - "messages/fr.json and messages/en.json gain nav.lang.label and nav.lang.switchTo keys (FR/EN parity preserved)"
    - "i18n/navigation.ts is created with createNavigation(routing) exports"
    - "Vitest specs for Navigation, LanguageSwitcher, and useActiveSection all pass"
  artifacts:
    - path: "components/layout/Navigation.tsx"
      provides: "Fixed-top nav with section anchors + LanguageSwitcher + mobile hamburger"
      contains: "Sheet"
    - path: "components/layout/LanguageSwitcher.tsx"
      provides: "FR|EN segmented control with motion indicator + scroll preservation"
      contains: "layoutId"
    - path: "lib/hooks/useActiveSection.ts"
      provides: "IntersectionObserver active-section detection"
      contains: "IntersectionObserver"
    - path: "i18n/navigation.ts"
      provides: "Locale-aware Link/usePathname/useRouter"
      contains: "createNavigation"
  key_links:
    - from: "components/layout/Navigation.tsx"
      to: "lib/hooks/useActiveSection.ts"
      via: "active section highlight"
      pattern: "useActiveSection"
    - from: "components/layout/LanguageSwitcher.tsx"
      to: "i18n/navigation.ts"
      via: "locale-aware router.replace"
      pattern: "@/i18n/navigation"
    - from: "components/layout/LanguageSwitcher.tsx"
      to: "components/providers/LenisProvider.tsx"
      via: "useLenis() for scroll preservation"
      pattern: "useLenis"
    - from: "components/layout/Navigation.tsx"
      to: "components/ui/sheet.tsx"
      via: "mobile hamburger menu reuse"
      pattern: "Sheet"
---

<objective>
Ship the user-visible navigation chrome (LAYOUT-03 + LAYOUT-05): a fixed-top Navigation with a wordmark logo, centered section anchor links, a far-right LanguageSwitcher (segmented FR|EN with a motion layoutId indicator), a transparent→blur scroll behavior after 50px, and a mobile hamburger using the existing shadcn Sheet primitive.

Also create the small useActiveSection hook for IntersectionObserver-based active-link highlighting, the i18n/navigation.ts module that exposes next-intl's locale-aware hooks, and add the new `nav.lang.*` i18n keys to both fr.json and en.json (preserving the Phase 1 parity invariant).

This plan REPLACES the body of the stub `components/layout/Navigation.tsx` created in Plan 02 — the import in `app/[locale]/layout.tsx` continues to resolve without changes.

Output: Navigation + LanguageSwitcher + useActiveSection (and their tests) + i18n/navigation.ts + 2 new i18n keys per locale.
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
@components/layout/Navigation.tsx
@components/ui/sheet.tsx
@components/providers/LenisProvider.tsx
@i18n/routing.ts
@messages/fr.json
@messages/en.json
@app/[locale]/page.tsx

<interfaces>
<!-- Source: existing code + next-intl 4.12 docs (verified in RESEARCH.md §4) -->

From i18n/routing.ts (existing):
```typescript
export const routing = defineRouting({
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});
```

From next-intl/navigation:
```typescript
import { createNavigation } from 'next-intl/navigation';
const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
// usePathname() returns LOCALE-STRIPPED path (e.g. '/projects/foo', not '/fr/projects/foo')
// useRouter().replace(pathnameOrObject, { locale: target }) — locale-aware redirect
```

From components/providers/LenisProvider.tsx (Plan 01):
```typescript
export function useLenis(): Lenis | null;  // null until effect runs
```

From components/ui/sheet.tsx (Phase 2 shadcn):
```typescript
// Reusable Radix Sheet primitive. Already styled. Subcomponents:
// Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose
// SheetContent accepts side="left" | "right" | "top" | "bottom"
// CRITICAL: SheetContent root element gets data-lenis-prevent attribute to opt out of Lenis (D-04 contract).
```

From motion/react:
```typescript
import { motion } from 'motion/react';
// motion.div, motion.span — layoutId enables shared-element transitions between siblings.
```

From next/navigation:
```typescript
import { useParams } from 'next/navigation';  // for dynamic route segments
```

From lucide-react:
```typescript
import { Menu, X } from 'lucide-react';  // hamburger + close icons
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create i18n/navigation.ts (locale-aware next-intl helpers) and add nav.lang.* keys to both messages files</name>
  <files>i18n/navigation.ts, messages/fr.json, messages/en.json</files>
  <read_first>
    - i18n/routing.ts (the existing routing config — exports `routing`)
    - messages/fr.json (verify existing `nav.*` keys; the new keys go under the `nav` namespace)
    - messages/en.json (same)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §4 "next-intl Navigation API"
    - .planning/STATE.md (Phase 1 parity invariant — every nav.lang.* key must mirror across both locales)
  </read_first>
  <action>
    **Part A: Create `i18n/navigation.ts`** with the canonical next-intl 4.12 createNavigation pattern:

    ```typescript
    import { createNavigation } from 'next-intl/navigation';
    import { routing } from './routing';

    export const { Link, redirect, usePathname, useRouter, getPathname } =
      createNavigation(routing);
    ```

    Constraints:
    - 5 named exports exactly as shown.
    - Imports relative to the same directory (`./routing`).
    - DO NOT add `'use client'` — this is a barrel/factory that works in both server and client contexts.

    **Part B: Edit `messages/fr.json`** — under the existing `"nav"` namespace, add a new `"lang"` sub-object after the existing `"contact"` key. Final shape:

    ```json
    {
      "nav": {
        "home": "Accueil",
        "about": "À propos",
        "projects": "Projets",
        "skills": "Compétences",
        "contact": "Contact",
        "lang": {
          "label": "Changer la langue",
          "switchTo": "Passer en {target}"
        }
      },
      ...rest unchanged
    }
    ```

    **Part C: Edit `messages/en.json`** — mirror the FR addition with English values:

    ```json
    {
      "nav": {
        "home": "Home",
        "about": "About",
        "projects": "Projects",
        "skills": "Skills",
        "contact": "Contact",
        "lang": {
          "label": "Switch language",
          "switchTo": "Switch to {target}"
        }
      },
      ...rest unchanged
    }
    ```

    Constraints:
    - Both files MUST gain exactly two new leaf keys: `nav.lang.label` and `nav.lang.switchTo`.
    - The ICU placeholder `{target}` must be present in BOTH `switchTo` values.
    - DO NOT add any keys to one file but not the other (Phase 1 parity invariant).
    - DO NOT remove or modify any existing key.
    - DO NOT introduce trailing commas (JSON strict).

    After the edits, verify parity. If a Phase 1 parity script exists at `scripts/check-i18n-parity.ts` or similar, run it. Otherwise, run:
    ```bash
    node -e "const f=Object.keys(JSON.parse(require('fs').readFileSync('messages/fr.json'))).join(','); const e=Object.keys(JSON.parse(require('fs').readFileSync('messages/en.json'))).join(','); if (f!==e) { console.error('TOP-LEVEL KEY MISMATCH'); process.exit(1); } console.log('top-level parity OK');"
    ```
    For deeper parity (leaf key paths), the Phase 1 STATE.md notes a parity Node script was in place — reuse it.
  </action>
  <verify>
    <automated>node -e "const fr=JSON.parse(require('fs').readFileSync('messages/fr.json','utf8'));const en=JSON.parse(require('fs').readFileSync('messages/en.json','utf8'));if(!fr.nav.lang||!en.nav.lang)process.exit(1);if(!fr.nav.lang.label||!fr.nav.lang.switchTo||!en.nav.lang.label||!en.nav.lang.switchTo)process.exit(2);if(!fr.nav.lang.switchTo.includes('{target}')||!en.nav.lang.switchTo.includes('{target}'))process.exit(3);console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - File `i18n/navigation.ts` exists.
    - `i18n/navigation.ts` contains the literal string `createNavigation(routing)`.
    - `i18n/navigation.ts` exports exactly these names (regex): `usePathname`, `useRouter`, `Link`, `redirect`, `getPathname`.
    - `messages/fr.json` contains the literal string `"label": "Changer la langue"`.
    - `messages/fr.json` contains the literal string `"switchTo": "Passer en {target}"`.
    - `messages/en.json` contains the literal string `"label": "Switch language"`.
    - `messages/en.json` contains the literal string `"switchTo": "Switch to {target}"`.
    - Both messages files still parse as valid JSON: `node -e "JSON.parse(require('fs').readFileSync('messages/fr.json','utf8'))"` exits 0 (same for en.json).
    - Both messages files retain ALL pre-existing keys (top-level keys `nav`, `hero`, `about`, `projects`, `skills`, `contact`, `footer`, `palette`, `errors` all still present in both files).
    - The verification node script above exits 0 with "OK".
    - `npm run build` exits 0.
  </acceptance_criteria>
  <done>i18n/navigation.ts barrel created; both messages files have the new nav.lang.* keys; FR/EN parity preserved.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement lib/hooks/useActiveSection.ts (IntersectionObserver hook for active section detection) + Vitest spec</name>
  <files>lib/hooks/useActiveSection.ts, lib/hooks/useActiveSection.test.ts</files>
  <read_first>
    - lib/hooks/usePrefersReducedMotion.ts (style template — useSyncExternalStore pattern; useActiveSection uses useState/useEffect though)
    - app/[locale]/page.tsx (the 5 section IDs from Plan 02: home, about, projects, skills, contact)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §7 "IntersectionObserver Active-Section Pattern"
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Claude's Discretion" — hook extraction is cleaner
  </read_first>
  <behavior>
    Test 1: When the hook mounts and no sections exist in the DOM, returns null.
    Test 2: When 5 section elements with IDs ['home','about','projects','skills','contact'] are in the DOM and an IntersectionObserver entry reports `isIntersecting: true, intersectionRatio: 0.8` for the 'about' section, the hook returns 'about'.
    Test 3: When the entry with the LARGEST intersectionRatio changes from 'about' to 'projects', the hook returns 'projects'.
    Test 4: On unmount, IntersectionObserver.disconnect is called.
  </behavior>
  <action>
    **Part A: Create `lib/hooks/useActiveSection.ts`**:

    ```typescript
    'use client';

    import { useEffect, useState } from 'react';

    const SECTION_IDS = ['home', 'about', 'projects', 'skills', 'contact'] as const;
    export type SectionId = (typeof SECTION_IDS)[number];
    export const NAV_SECTION_IDS: readonly SectionId[] = SECTION_IDS;

    /**
     * Tracks which page section is currently active (largest intersectionRatio
     * within the viewport center band). Returns null until at least one section
     * is observed or if no sections exist in the DOM.
     *
     * rootMargin '-40% 0px -40% 0px' creates a 20%-tall band centered on the
     * viewport; a section is active when its content crosses that band.
     */
    export function useActiveSection(): SectionId | null {
      const [active, setActive] = useState<SectionId | null>(null);

      useEffect(() => {
        if (typeof document === 'undefined') return;
        const sections = SECTION_IDS
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => el !== null);
        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
          (entries) => {
            const visible = entries.filter((e) => e.isIntersecting);
            if (visible.length === 0) return;
            const top = visible.reduce((best, cur) =>
              cur.intersectionRatio > best.intersectionRatio ? cur : best
            );
            const id = top.target.id;
            if ((SECTION_IDS as readonly string[]).includes(id)) {
              setActive(id as SectionId);
            }
          },
          {
            rootMargin: '-40% 0px -40% 0px',
            threshold: [0, 0.1, 0.5, 1],
          }
        );

        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
      }, []);

      return active;
    }
    ```

    Constraints:
    - First line `'use client';`.
    - Export the const tuple type `SectionId` AND the array `NAV_SECTION_IDS` so the Navigation component can iterate without duplicating.
    - DO NOT use `any` (TS strict).

    **Part B: Create `lib/hooks/useActiveSection.test.ts`** — mock IntersectionObserver:

    ```typescript
    import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
    import { renderHook } from '@testing-library/react';

    type IOCallback = (entries: Array<{ isIntersecting: boolean; intersectionRatio: number; target: { id: string } }>) => void;

    let ioCallback: IOCallback | null = null;
    const observe = vi.fn();
    const disconnect = vi.fn();

    beforeEach(() => {
      ioCallback = null;
      observe.mockClear();
      disconnect.mockClear();
      (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
        constructor(cb: IOCallback) {
          ioCallback = cb;
        }
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
        takeRecords = vi.fn(() => []);
      };
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    describe('useActiveSection', () => {
      it('returns null when no sections exist', async () => {
        const { useActiveSection } = await import('./useActiveSection');
        const { result } = renderHook(() => useActiveSection());
        expect(result.current).toBe(null);
      });

      it('returns the section id with the largest intersectionRatio', async () => {
        ['home', 'about', 'projects', 'skills', 'contact'].forEach((id) => {
          const s = document.createElement('section');
          s.id = id;
          document.body.appendChild(s);
        });
        const { useActiveSection } = await import('./useActiveSection');
        const { result, rerender } = renderHook(() => useActiveSection());
        ioCallback?.([
          { isIntersecting: true, intersectionRatio: 0.3, target: { id: 'home' } },
          { isIntersecting: true, intersectionRatio: 0.8, target: { id: 'about' } },
        ]);
        rerender();
        expect(result.current).toBe('about');
      });

      it('updates when the largest ratio moves to another section', async () => {
        ['home', 'about', 'projects', 'skills', 'contact'].forEach((id) => {
          const s = document.createElement('section');
          s.id = id;
          document.body.appendChild(s);
        });
        const { useActiveSection } = await import('./useActiveSection');
        const { result, rerender } = renderHook(() => useActiveSection());
        ioCallback?.([
          { isIntersecting: true, intersectionRatio: 0.8, target: { id: 'about' } },
        ]);
        rerender();
        expect(result.current).toBe('about');
        ioCallback?.([
          { isIntersecting: true, intersectionRatio: 0.9, target: { id: 'projects' } },
        ]);
        rerender();
        expect(result.current).toBe('projects');
      });

      it('disconnects the observer on unmount', async () => {
        const s = document.createElement('section');
        s.id = 'home';
        document.body.appendChild(s);
        const { useActiveSection } = await import('./useActiveSection');
        const { unmount } = renderHook(() => useActiveSection());
        unmount();
        expect(disconnect).toHaveBeenCalled();
      });
    });
    ```
  </action>
  <verify>
    <automated>npm test -- useActiveSection</automated>
  </verify>
  <acceptance_criteria>
    - File `lib/hooks/useActiveSection.ts` exists.
    - File starts with `'use client';`.
    - File contains the literal string `IntersectionObserver`.
    - File contains the literal tuple `'home', 'about', 'projects', 'skills', 'contact'`.
    - File contains the literal string `rootMargin: '-40% 0px -40% 0px'`.
    - File exports `useActiveSection` (function), `SectionId` (type), and `NAV_SECTION_IDS` (const).
    - File `lib/hooks/useActiveSection.test.ts` exists.
    - Test file contains 4 `it(` blocks (returns null / largest ratio / ratio change / disconnect).
    - `npm test -- useActiveSection` exits 0 with 4 passing tests.
  </acceptance_criteria>
  <done>Hook + test exist; observable contract proven via 4 Vitest cases.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Implement components/layout/Navigation.tsx (fixed-top, scroll-state, section anchors, hamburger Sheet) + Vitest spec</name>
  <files>components/layout/Navigation.tsx, components/layout/Navigation.test.tsx</files>
  <read_first>
    - components/layout/Navigation.tsx (current stub from Plan 02 — replace body, keep export name)
    - components/ui/sheet.tsx (Sheet API surface — Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose)
    - lib/hooks/useActiveSection.ts (from Task 2 — `useActiveSection`, `NAV_SECTION_IDS`)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Navigation" (D-13..D-17)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §7 + §8
    - components/theme/PaletteFab.tsx (style reference — `data-lenis-prevent` usage)
    - lucide-react package for Menu and X icons
  </read_first>
  <behavior>
    Test 1: Navigation renders with role="navigation" (or a recognizable test-id) at all viewports.
    Test 2: Logo text "Tanguy" is rendered in a link/button to the locale root.
    Test 3: 5 section anchor links are rendered: href="#home", "#about", "#projects", "#skills", "#contact" with their translated labels.
    Test 4: The mobile hamburger button is rendered (via Menu icon) — when clicked, Sheet content opens.
    Test 5: The hamburger Sheet content carries the `data-lenis-prevent` attribute.
    Test 6: At scroll=0, the nav has a transparent class (e.g. no `bg-background/80`); after firing a scroll event with scrollY=100, it gains `backdrop-blur-md`.
  </behavior>
  <action>
    **Replace the body of `components/layout/Navigation.tsx`** (keep the `'use client'` and the named export `Navigation`). Stub returns `null`; the real impl is:

    ```typescript
    'use client';

    import { useEffect, useState } from 'react';
    import { useTranslations, useLocale } from 'next-intl';
    import Link from 'next/link';
    import { Menu } from 'lucide-react';
    import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
    import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
    import { useActiveSection, NAV_SECTION_IDS } from '@/lib/hooks/useActiveSection';
    import { cn } from '@/lib/utils';

    /**
     * LAYOUT-03: fixed-top navigation with logo + section anchor links + LanguageSwitcher.
     * Mobile: section links collapse into a Sheet side="left" hamburger menu.
     * Transparent at scroll=0 -> backdrop-blur-md with border-bottom after >50px scroll (D-13).
     * NO PaletteFab here — it stays a separate FAB per D-14.
     */
    export function Navigation() {
      const t = useTranslations('nav');
      const locale = useLocale();
      const activeId = useActiveSection();
      const [scrolled, setScrolled] = useState(false);
      const [open, setOpen] = useState(false);

      useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
      }, []);

      const renderLinks = (onClick?: () => void) =>
        NAV_SECTION_IDS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={onClick}
            aria-current={activeId === id ? 'true' : undefined}
            className={cn(
              'text-sm font-medium transition-colors',
              activeId === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(id)}
          </a>
        ));

      return (
        <header
          role="navigation"
          aria-label={t('home')}
          className={cn(
            'fixed inset-x-0 top-0 z-40 transition-all duration-300',
            scrolled
              ? 'bg-background/80 border-b border-border backdrop-blur-md'
              : 'bg-transparent'
          )}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            {/* Logo (D-17) */}
            <Link href={`/${locale}`} className="text-primary text-lg font-semibold tracking-tight">
              Tanguy
            </Link>

            {/* Desktop section links (D-14 + D-15) */}
            <nav className="hidden items-center gap-6 md:flex" aria-label={t('home')}>
              {renderLinks()}
            </nav>

            {/* Right side: LanguageSwitcher always; hamburger only on mobile */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  className="text-muted-foreground hover:text-foreground rounded-md p-2 md:hidden"
                  aria-label={t('home')}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </SheetTrigger>
                <SheetContent side="left" data-lenis-prevent>
                  <SheetHeader>
                    <SheetTitle>Tanguy</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-4 px-4" aria-label={t('home')}>
                    {renderLinks(() => setOpen(false))}
                  </nav>
                  <SheetClose aria-label={t('home')} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      );
    }
    ```

    Constraints:
    - Keep the export name `function Navigation` (Plan 02's layout imports this name).
    - First line `'use client'`.
    - DO NOT include a PaletteFab button or import in this file (D-14 — PaletteFab stays separate). `grep "PaletteFab" components/layout/Navigation.tsx` must return nothing.
    - The Sheet's `SheetContent` MUST carry `data-lenis-prevent` (D-04 + D-16).
    - DO NOT add `cursor: none` anywhere.
    - DO NOT add color literals — all colors via Tailwind utilities backed by the palette tokens.
    - DO NOT use the `useRouter`/`usePathname` from `@/i18n/navigation` here (Navigation doesn't navigate; LanguageSwitcher does).
    - The section links MUST be `<a href="#id">` — Lenis `anchors: true` (Plan 01 D-03) handles the smooth-scroll; no `e.preventDefault()` or manual `scrollTo`.

    **Create `components/layout/Navigation.test.tsx`** — RTL render with mocked next-intl + Lenis + matchMedia:

    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render, screen, fireEvent } from '@testing-library/react';

    vi.mock('next-intl', () => ({
      useTranslations: (ns: string) => (k: string) => `${ns}.${k}`,
      useLocale: () => 'fr',
    }));
    vi.mock('@/lib/hooks/useActiveSection', () => ({
      useActiveSection: () => 'about',
      NAV_SECTION_IDS: ['home', 'about', 'projects', 'skills', 'contact'],
    }));
    vi.mock('@/components/layout/LanguageSwitcher', () => ({
      LanguageSwitcher: () => <div data-testid="lang-switcher" />,
    }));

    let Navigation: () => JSX.Element;
    beforeEach(async () => {
      vi.clearAllMocks();
      const mod = await import('./Navigation');
      Navigation = mod.Navigation;
    });

    describe('Navigation', () => {
      it('renders the wordmark + 5 section anchor links + LanguageSwitcher', () => {
        render(<Navigation />);
        expect(screen.getByText('Tanguy')).toBeInTheDocument();
        ['home', 'about', 'projects', 'skills', 'contact'].forEach((id) => {
          expect(screen.getByRole('link', { name: `nav.${id}` })).toHaveAttribute('href', `#${id}`);
        });
        expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
      });

      it('does NOT include a PaletteFab button', () => {
        const { container } = render(<Navigation />);
        expect(container.innerHTML).not.toMatch(/PaletteFab/);
        expect(container.innerHTML).not.toMatch(/palette/i); // catches any leftover palette UI
      });

      it('mobile hamburger opens a Sheet with data-lenis-prevent', async () => {
        render(<Navigation />);
        const btn = screen.getAllByRole('button').find((b) => b.querySelector('svg'));
        if (!btn) throw new Error('hamburger not found');
        fireEvent.click(btn);
        // SheetContent is rendered to a portal; query the document for the attribute.
        const sheet = document.querySelector('[data-lenis-prevent]');
        expect(sheet).not.toBeNull();
      });

      it('marks the active section link with aria-current', () => {
        render(<Navigation />);
        const link = screen.getByRole('link', { name: 'nav.about' });
        expect(link).toHaveAttribute('aria-current', 'true');
      });

      it('switches to backdrop-blur after scrollY>50', () => {
        const { container } = render(<Navigation />);
        const header = container.querySelector('header');
        if (!header) throw new Error('header not found');
        expect(header.className).toContain('bg-transparent');
        Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
        fireEvent.scroll(window);
        expect(header.className).toContain('backdrop-blur-md');
      });
    });
    ```

    Note: the `getAllByRole('button')` approach for finding the hamburger trigger works in jsdom; if Radix renders SheetTrigger as a Slot, swap to `screen.getByLabelText` against the aria-label.
  </action>
  <verify>
    <automated>npm test -- Navigation</automated>
  </verify>
  <acceptance_criteria>
    - File `components/layout/Navigation.tsx` exists and is NOT a stub (no `return null` as the entire body).
    - File contains the literal string `'use client'`.
    - File contains the literal string `<Sheet` (Radix mobile hamburger reuse).
    - File contains the literal string `side="left"` (D-16 — Sheet on the LEFT to avoid PaletteFab on the right).
    - File contains the literal string `data-lenis-prevent` (D-04 contract on SheetContent).
    - File contains the literal string `<LanguageSwitcher` (imports/uses it).
    - File contains the literal strings `#home`, `#about`, `#projects`, `#skills`, `#contact` (anchor hrefs).
    - File contains the literal substring `scrollY > 50` (D-13 scroll threshold).
    - File contains the literal string `backdrop-blur-md` (D-13 blur class).
    - File contains the literal string `border-b border-border` (D-13 border-bottom solid state).
    - File contains the literal string `text-primary` (D-17 logo accent color via shadcn alias).
    - File contains the literal string `useActiveSection` (active state).
    - File DOES NOT contain the literal string `PaletteFab` (D-14 — PaletteFab is a separate FAB).
    - File DOES NOT contain `cursor: none`.
    - File DOES NOT contain any hex/rgb/hsl/oklch color literal.
    - File DOES NOT contain `: any` type annotation.
    - Test file `components/layout/Navigation.test.tsx` exists with at least 4 `it(` blocks.
    - `npm test -- Navigation` exits 0.
  </acceptance_criteria>
  <done>Navigation renders the fixed-top header with scroll state, section links, mobile Sheet hamburger, and integrates the LanguageSwitcher; tests prove the contract.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Implement components/layout/LanguageSwitcher.tsx (FR|EN segmented control with motion layoutId + scroll preservation + html.lang update) + Vitest spec</name>
  <files>components/layout/LanguageSwitcher.tsx, components/layout/LanguageSwitcher.test.tsx</files>
  <read_first>
    - i18n/navigation.ts (Task 1 — `useRouter`, `usePathname` exports)
    - components/providers/LenisProvider.tsx (`useLenis()` returns null until effect runs)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"LanguageSwitcher" (D-18..D-21)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §4 "next-intl Navigation API" (full reference impl)
    - messages/fr.json + en.json (verify `nav.lang.*` keys from Task 1 exist)
  </read_first>
  <behavior>
    Test 1: Both buttons render with text "FR" and "EN". The active locale's button has aria-pressed="true" and the other has aria-pressed="false".
    Test 2: A motion.span with layoutId="lang-indicator" exists inside the active button.
    Test 3: Clicking the inactive button calls router.replace with `{ pathname, params }` as the first arg and `{ locale: target }` as the second.
    Test 4: After a locale switch, document.documentElement.lang equals the new locale.
    Test 5: aria-label on each button uses the nav.lang.switchTo translation.
    Test 6: When useLenis returns a Lenis instance, scrollTo is called with the saved scroll position and `immediate: true`.
  </behavior>
  <action>
    **Create `components/layout/LanguageSwitcher.tsx`**:

    ```typescript
    'use client';

    import { useEffect, useTransition } from 'react';
    import { useLocale, useTranslations } from 'next-intl';
    import { useParams } from 'next/navigation';
    import { useRouter, usePathname } from '@/i18n/navigation';
    import { motion } from 'motion/react';
    import { useLenis } from '@/components/providers/LenisProvider';
    import { cn } from '@/lib/utils';

    const LOCALES = ['fr', 'en'] as const;
    type Locale = (typeof LOCALES)[number];

    /**
     * LAYOUT-05: segmented FR|EN switch with motion layoutId indicator (D-18),
     * locale-aware router.replace (D-19), imperative html.lang sync (D-19),
     * scroll-position preservation via lenis.scrollTo (D-21).
     */
    export function LanguageSwitcher() {
      const locale = useLocale() as Locale;
      const pathname = usePathname();
      const router = useRouter();
      const params = useParams();
      const t = useTranslations('nav.lang');
      const [isPending, startTransition] = useTransition();
      const lenis = useLenis();

      // D-19: keep <html lang> in sync after locale change.
      useEffect(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = locale;
        }
      }, [locale]);

      const switchTo = (target: Locale) => {
        if (target === locale) return;
        const scrollY = lenis ? lenis.actualScroll : (typeof window !== 'undefined' ? window.scrollY : 0);
        startTransition(() => {
          router.replace({ pathname, params } as Parameters<typeof router.replace>[0], { locale: target });
        });
        // Restore scroll on next frame (after route data fetches)
        if (typeof window !== 'undefined') {
          window.requestAnimationFrame(() => {
            if (lenis) lenis.scrollTo(scrollY, { immediate: true });
            else window.scrollTo(0, scrollY);
          });
        }
      };

      return (
        <div
          role="group"
          aria-label={t('label')}
          className="border-border bg-background relative inline-flex items-center gap-1 rounded-full border p-1 text-sm"
        >
          {LOCALES.map((target) => {
            const isActive = target === locale;
            return (
              <button
                key={target}
                type="button"
                onClick={() => switchTo(target)}
                aria-pressed={isActive}
                aria-label={t('switchTo', { target: target.toUpperCase() })}
                disabled={isPending}
                data-active={isActive ? 'true' : 'false'}
                className="relative z-10 cursor-pointer px-3 py-1 font-medium transition-colors disabled:cursor-wait"
              >
                {isActive && (
                  <motion.span
                    layoutId="lang-indicator"
                    aria-hidden="true"
                    className="bg-primary absolute inset-0 -z-10 rounded-full"
                    transition={{ type: 'spring', mass: 0.4, stiffness: 700 }}
                  />
                )}
                <span className={cn(isActive ? 'text-primary-foreground' : 'text-muted-foreground')}>
                  {target.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      );
    }
    ```

    Constraints:
    - First line `'use client'`.
    - IMPORT `usePathname` and `useRouter` from `@/i18n/navigation` (LOCALE-AWARE) — NOT from `next/navigation`. This is the critical disambiguation per the prompt's <critical_constraints>.
    - DO USE `useParams` from `next/navigation` (this one is fine — it returns raw route params).
    - DO NOT add `cursor: none` (the `cursor: cursor-wait` Tailwind class on disabled is CSS `cursor: wait` — that is permitted; only `cursor: none` is forbidden).

    Wait — re-read the constraint. The forbidden literal is exactly `cursor: none` (with a space). `cursor-wait` is a Tailwind utility class name, not a CSS declaration. To be safe, grep should look for `cursor: none` (with a space), NOT for the substring `cursor:`.

    Continue with constraints:
    - DO NOT subscribe to the palette object — the `bg-primary` Tailwind utility already routes through the palette tokens.
    - DO NOT introduce any color literal.

    **Create `components/layout/LanguageSwitcher.test.tsx`** with mocked dependencies:

    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render, screen, fireEvent } from '@testing-library/react';

    const replaceMock = vi.fn();
    vi.mock('@/i18n/navigation', () => ({
      useRouter: () => ({ replace: replaceMock }),
      usePathname: () => '/projects/foo',
    }));
    vi.mock('next/navigation', () => ({
      useParams: () => ({ slug: 'foo' }),
    }));

    const localeMock = vi.fn(() => 'fr');
    vi.mock('next-intl', () => ({
      useLocale: () => localeMock(),
      useTranslations: (_ns: string) => (k: string, vars?: Record<string, string>) => {
        if (k === 'label') return localeMock() === 'fr' ? 'Changer la langue' : 'Switch language';
        if (k === 'switchTo') return localeMock() === 'fr' ? `Passer en ${vars?.target}` : `Switch to ${vars?.target}`;
        return k;
      },
    }));

    const lenisScrollTo = vi.fn();
    vi.mock('@/components/providers/LenisProvider', () => ({
      useLenis: () => ({ actualScroll: 250, scrollTo: lenisScrollTo }),
    }));

    let LanguageSwitcher: () => JSX.Element;
    beforeEach(async () => {
      replaceMock.mockClear();
      lenisScrollTo.mockClear();
      localeMock.mockReturnValue('fr');
      const mod = await import('./LanguageSwitcher');
      LanguageSwitcher = mod.LanguageSwitcher;
    });

    describe('LanguageSwitcher', () => {
      it('renders FR and EN buttons with correct aria-pressed', () => {
        render(<LanguageSwitcher />);
        const fr = screen.getByRole('button', { name: 'Passer en FR' });
        const en = screen.getByRole('button', { name: 'Passer en EN' });
        expect(fr).toHaveAttribute('aria-pressed', 'true');
        expect(en).toHaveAttribute('aria-pressed', 'false');
      });

      it('calls router.replace with locale-aware shape when clicking the inactive locale', () => {
        render(<LanguageSwitcher />);
        const en = screen.getByRole('button', { name: 'Passer en EN' });
        fireEvent.click(en);
        expect(replaceMock).toHaveBeenCalled();
        const [pathArg, opts] = replaceMock.mock.calls[0];
        expect(pathArg).toMatchObject({ pathname: '/projects/foo', params: { slug: 'foo' } });
        expect(opts).toEqual({ locale: 'en' });
      });

      it('imperatively sets document.documentElement.lang on locale change', () => {
        const { rerender } = render(<LanguageSwitcher />);
        expect(document.documentElement.lang).toBe('fr');
        localeMock.mockReturnValue('en');
        rerender(<LanguageSwitcher />);
        expect(document.documentElement.lang).toBe('en');
      });

      it('calls lenis.scrollTo with saved scroll position after route change', () => {
        render(<LanguageSwitcher />);
        const en = screen.getByRole('button', { name: 'Passer en EN' });
        fireEvent.click(en);
        return new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => {
            expect(lenisScrollTo).toHaveBeenCalledWith(250, { immediate: true });
            resolve();
          });
        });
      });
    });
    ```
  </action>
  <verify>
    <automated>npm test -- LanguageSwitcher</automated>
  </verify>
  <acceptance_criteria>
    - File `components/layout/LanguageSwitcher.tsx` exists.
    - File starts with `'use client'`.
    - File contains the literal string `from '@/i18n/navigation'` (locale-aware imports — the critical disambiguation).
    - File contains the literal string `useRouter` and `usePathname`.
    - File contains the literal string `useParams` imported from `'next/navigation'`.
    - File contains the literal string `layoutId="lang-indicator"` (D-18 motion indicator).
    - File contains the literal string `aria-pressed` (D-20).
    - File contains the literal string `document.documentElement.lang` (D-19).
    - File contains the literal string `lenis.scrollTo` (D-21).
    - File contains the literal string `immediate: true` (D-21 instant scroll restore).
    - File contains the literal string `useTransition` (smooth navigation).
    - File contains the literal string `bg-primary` (motion indicator uses the palette accent).
    - File does NOT contain `cursor: none` (with a space — verbatim).
    - File does NOT contain any hex/rgb/hsl/oklch color literal.
    - Test file `components/layout/LanguageSwitcher.test.tsx` exists with at least 3 `it(` blocks.
    - `npm test -- LanguageSwitcher` exits 0.
  </acceptance_criteria>
  <done>FR|EN segmented switcher works with locale-aware router.replace, motion layoutId indicator, html.lang sync, and lenis-aware scroll preservation; tests prove the contract.</done>
</task>

</tasks>

<verification>
- 4 new component/hook files exist: Navigation.tsx, LanguageSwitcher.tsx, useActiveSection.ts, i18n/navigation.ts.
- 3 new test files exist and pass: Navigation.test.tsx, LanguageSwitcher.test.tsx, useActiveSection.test.ts.
- `messages/fr.json` and `messages/en.json` both contain `nav.lang.label` and `nav.lang.switchTo` (parity preserved).
- Navigation does NOT include PaletteFab.
- LanguageSwitcher uses `@/i18n/navigation` for usePathname + useRouter (locale-aware), NOT `next/navigation`.
- `npm test` reports >= 98 + N new tests passing (Plan 01 baseline + Plan 03 additions).
- `npm run build` exits 0.
- `npm run lint` exits 0.
</verification>

<success_criteria>
A user visiting `/fr` or `/en` sees a fixed-top nav with the wordmark, 5 section anchor links, and a FR|EN segmented switcher. Scrolling >50px solidifies the nav. Clicking an anchor smooth-scrolls (via Lenis anchors:true). Clicking the inactive locale switches language, preserves scroll position, and updates `<html lang>`. On mobile, the hamburger opens a left-side Sheet with data-lenis-prevent.
</success_criteria>

<output>
After completion, create `.planning/phases/03-layout-animation-foundation/03-03-SUMMARY.md` documenting:
- The 5 new files created.
- The i18n keys added (and FR/EN parity confirmation).
- The contract that Navigation uses `useActiveSection` and the section IDs match `[locale]/page.tsx`.
- Confirmation that the LanguageSwitcher imports from `@/i18n/navigation` (NOT `next/navigation`).
- Confirmation that the Sheet content carries `data-lenis-prevent`.
</output>
