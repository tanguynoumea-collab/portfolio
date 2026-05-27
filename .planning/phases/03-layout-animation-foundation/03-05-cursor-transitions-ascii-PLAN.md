---
phase: 03-layout-animation-foundation
plan: 05
type: execute
wave: 3
depends_on: ["03-02"]
files_modified:
  - components/layout/CustomCursor.tsx
  - components/layout/CustomCursor.test.tsx
  - app/template.tsx
  - app/template.test.tsx
  - components/layout/ConsoleArt.tsx
  - components/layout/ConsoleArt.test.tsx
  - lib/ascii.ts
  - lib/ascii.test.ts
autonomous: true
requirements: [LAYOUT-06, ANIM-01, EGG-01]
must_haves:
  truths:
    - "CustomCursor renders null when ANY of the 4 activation gates fails: pointer:fine OR prefers-reduced-motion:reduce OR any-pointer:coarse OR forced-colors:active"
    - "CustomCursor renders a fixed <motion.div> tracer when ALL 4 gates pass"
    - "CustomCursor uses useMotionValue + useSpring (NOT React state) for pointer position — zero re-renders during pointer move"
    - "CustomCursor backgroundColor is var(--color-accent) — direct CSS variable, no JS subscription"
    - "CustomCursor scales up on hover over a, button, [role=button], [data-cursor=hover], img[data-zoomable] (event delegation on document)"
    - "NOWHERE in components/ or app/ contains `cursor: none` (LAYOUT-06 D-26 non-negotiable gate — verifies via grep)"
    - "app/template.tsx is a Client Component (line 1 = `'use client'`) — required for AnimatePresence"
    - "app/template.tsx imports usePathname from 'next/navigation' (full path, NOT from @/i18n/navigation)"
    - "app/template.tsx wraps children in AnimatePresence mode='popLayout' initial={false} with motion.div keyed by usePathname()"
    - "app/template.tsx transition is fade + 8px Y-translate 300ms easeOut under normal motion, opacity-only ≤100ms under reduced motion"
    - "ConsoleArt prints exactly ONCE per cold page load (module-level printed flag guards against React Strict Mode double-invoke + route changes)"
    - "ConsoleArt skips printing when process.env.NODE_ENV === 'test' (D-36)"
    - "lib/ascii.ts exports getAsciiArt(locale: 'fr' | 'en') returning a multi-line template string with ASCII wordmark + intro + GitHub link + Konami hint"
    - "Konami hint in ASCII output contains the literal sequence `↑ ↑ ↓ ↓ ← → ← → B A` (or ASCII fallback)"
    - "GitHub link in ASCII output is exactly https://github.com/tanguynoumea/portfolio"
  artifacts:
    - path: "components/layout/CustomCursor.tsx"
      provides: "Constrained tracer cursor (native cursor stays visible)"
      contains: "useMotionValue"
    - path: "app/template.tsx"
      provides: "motion AnimatePresence page transitions"
      contains: "AnimatePresence"
    - path: "components/layout/ConsoleArt.tsx"
      provides: "One-shot bilingual console print on cold load"
      contains: "console.log"
    - path: "lib/ascii.ts"
      provides: "getAsciiArt(locale) — FR/EN ASCII content"
      contains: "getAsciiArt"
  key_links:
    - from: "components/layout/CustomCursor.tsx"
      to: "var(--color-accent)"
      via: "direct CSS variable in style"
      pattern: "var\\(--color-accent\\)"
    - from: "app/template.tsx"
      to: "motion/react"
      via: "AnimatePresence + motion.div"
      pattern: "motion/react"
    - from: "components/layout/ConsoleArt.tsx"
      to: "lib/ascii.ts"
      via: "getAsciiArt(locale)"
      pattern: "getAsciiArt"
---

<objective>
Ship the three remaining Phase 3 chrome pieces in parallel within Wave 3:

1. **LAYOUT-06 — CustomCursor**: a constrained motion-driven tracer that follows the pointer on desktop with prefers-reduced-motion respected, NEVER hides the native cursor (no `cursor: none` anywhere — non-negotiable per REQUIREMENTS.md OOS list).

2. **ANIM-01 — `app/template.tsx`**: a Client Component that wraps every route under the [locale] segment with motion `AnimatePresence mode="popLayout"`, fading + 8px Y-translating for 300ms (easeOut), instant-fade ≤100ms under reduced motion, keyed by `usePathname()` from `next/navigation` (FULL path — not the locale-stripped one used in LanguageSwitcher).

3. **EGG-01 — ConsoleArt + lib/ascii.ts**: a tiny mount-only effect that `console.log()`s a bilingual ASCII signature with a GitHub repo link + a subtle Konami hint (`↑ ↑ ↓ ↓ ← → ← → B A`). Prints exactly once per cold page load (module-level flag), skips under NODE_ENV=test, sources the ASCII content from `lib/ascii.ts`.

Each piece is small and INDEPENDENT — there are no shared imports or file conflicts. The 3 chunks REPLACE the stub bodies created by Plan 02. The layout file is NOT touched in this plan.

Output: 4 implementation files + 4 test files. Critical grep gate ensures `cursor: none` appears nowhere in the codebase.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/03-layout-animation-foundation/03-CONTEXT.md
@.planning/phases/03-layout-animation-foundation/03-RESEARCH.md
@.planning/research/FEATURES.md
@CLAUDE.md
@components/layout/CustomCursor.tsx
@components/layout/ConsoleArt.tsx
@app/[locale]/layout.tsx
@lib/hooks/usePrefersReducedMotion.ts

<interfaces>
From motion/react (already installed):
```typescript
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

// useMotionValue<number>(initial): MotionValue<number>
//   - .set(value): updates without React re-render
//   - .get(): reads current value
// useSpring(source, config): MotionValue<number>
//   - source can be another MotionValue or a number
//   - config: { mass, stiffness, damping }
// useReducedMotion(): boolean | null   — null on SSR
//
// AnimatePresence supports mode: 'sync' | 'wait' | 'popLayout'. popLayout removes
// exiting element from layout (position:absolute) so the incoming element can claim space.
// initial={false} suppresses the FIRST enter animation (cold load).
```

From next/navigation (NOT @/i18n/navigation — this is critical for template.tsx):
```typescript
import { usePathname } from 'next/navigation';  // returns FULL path including /fr or /en
```

From app/[locale]/page.tsx (the 5 section IDs are NOT relevant here).

From components/layout/ConsoleArt.tsx (current stub):
```typescript
export function ConsoleArt(): null;  // Plan 02 stub
```

From browser globals (for ConsoleArt):
- `console.log(template, ...styles)` — `%c` placeholders accept CSS strings
- `document.documentElement.lang` returns the current locale string
- `process.env.NODE_ENV` — Vite sets this to 'test' during Vitest runs
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement components/layout/CustomCursor.tsx (4-gate activation, useMotionValue + useSpring follow, event-delegated hover scale, var(--color-accent) styling, NEVER cursor:none) + Vitest spec</name>
  <files>components/layout/CustomCursor.tsx, components/layout/CustomCursor.test.tsx</files>
  <read_first>
    - components/layout/CustomCursor.tsx (current Plan 02 stub — replace body, keep `function CustomCursor` export)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"CustomCursor" (D-26..D-30, NON-NEGOTIABLE constraints)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §6 "CustomCursor Constrained Pattern" (full reference impl)
    - .planning/REQUIREMENTS.md "Out of Scope" — "Cursor takeover (cache complètement le curseur natif)" explicitly excluded
    - .planning/research/FEATURES.md §"Custom cursor (full-page takeover) flagged as 2026 anti-feature"
    - lib/hooks/usePrefersReducedMotion.ts (style template — useSyncExternalStore pattern)
  </read_first>
  <behavior>
    Test 1 (no gates): When `window.matchMedia('(pointer: fine)').matches = false`, CustomCursor renders nothing (`container` is empty or only metadata).
    Test 2 (reduced-motion): When `window.matchMedia('(prefers-reduced-motion: reduce)').matches = true`, CustomCursor renders nothing.
    Test 3 (forced-colors): When `window.matchMedia('(forced-colors: active)').matches = true`, CustomCursor renders nothing.
    Test 4 (all gates pass): With pointer:fine=true, reduced-motion=false, any-pointer:coarse=false, forced-colors:active=false, CustomCursor renders a div with `position: fixed` and `pointer-events: none`.
    Test 5 (no cursor:none): The rendered div's inline style does NOT contain `cursor: none`. (Separate full-repo grep gate in acceptance criteria covers the static-text check.)
  </behavior>
  <action>
    **Replace the body of `components/layout/CustomCursor.tsx`** (keep `'use client'` and named export `CustomCursor`):

    ```typescript
    'use client';

    import { useEffect, useState } from 'react';
    import { motion, useMotionValue, useSpring } from 'motion/react';

    const HOVER_SELECTORS = 'a, button, [role="button"], [data-cursor=hover], img[data-zoomable]';

    function shouldRenderCursor(): boolean {
      if (typeof window === 'undefined') return false;
      if (typeof window.matchMedia !== 'function') return false;
      // D-27: 4-gate activation. ALL must pass.
      if (!window.matchMedia('(pointer: fine)').matches) return false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      if (window.matchMedia('(any-pointer: coarse)').matches) return false;
      if (window.matchMedia('(forced-colors: active)').matches) return false;
      return true;
    }

    /**
     * LAYOUT-06: constrained custom cursor.
     * NON-NEGOTIABLE: the native OS cursor STAYS visible. This is a decorative
     * tracer dot that follows the pointer — NOT a takeover. NEVER set `cursor: none`.
     * (See REQUIREMENTS.md OOS list and FEATURES.md anti-feature consensus.)
     */
    export function CustomCursor() {
      const [enabled, setEnabled] = useState(false);

      useEffect(() => {
        setEnabled(shouldRenderCursor());
        const queries = [
          window.matchMedia('(pointer: fine)'),
          window.matchMedia('(prefers-reduced-motion: reduce)'),
          window.matchMedia('(any-pointer: coarse)'),
          window.matchMedia('(forced-colors: active)'),
        ];
        const onChange = () => setEnabled(shouldRenderCursor());
        queries.forEach((q) => q.addEventListener('change', onChange));
        return () => queries.forEach((q) => q.removeEventListener('change', onChange));
      }, []);

      // D-30: motion values, NOT React state — zero re-renders per pointer move.
      const x = useMotionValue(0);
      const y = useMotionValue(0);
      const scale = useMotionValue(1);
      const xSpring = useSpring(x, { mass: 0.3, stiffness: 800, damping: 30 });
      const ySpring = useSpring(y, { mass: 0.3, stiffness: 800, damping: 30 });
      const scaleSpring = useSpring(scale, { mass: 0.3, stiffness: 600 });

      useEffect(() => {
        if (!enabled) return;
        const onMove = (e: PointerEvent) => {
          x.set(e.clientX);
          y.set(e.clientY);
        };
        // D-29: event delegation
        const onOver = (e: PointerEvent) => {
          const target = e.target as Element | null;
          if (target && target.closest?.(HOVER_SELECTORS)) {
            scale.set(4);
          }
        };
        const onOut = (e: PointerEvent) => {
          const target = e.target as Element | null;
          if (target && target.closest?.(HOVER_SELECTORS)) {
            const next = e.relatedTarget as Element | null;
            if (next && next.closest?.(HOVER_SELECTORS)) return;
            scale.set(1);
          }
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerover', onOver, { passive: true });
        document.addEventListener('pointerout', onOut, { passive: true });
        return () => {
          window.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerover', onOver);
          document.removeEventListener('pointerout', onOut);
        };
      }, [enabled, x, y, scale]);

      if (!enabled) return null;

      return (
        <motion.div
          aria-hidden="true"
          data-testid="custom-cursor"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 8,
            height: 8,
            borderRadius: 9999,
            opacity: 0.7,
            // D-28: direct CSS variable — auto-recolors on palette swap with zero JS.
            backgroundColor: 'var(--color-accent)',
            pointerEvents: 'none',
            translateX: '-50%',
            translateY: '-50%',
            x: xSpring,
            y: ySpring,
            scale: scaleSpring,
            zIndex: 9999,
            mixBlendMode: 'difference',
          }}
        />
      );
    }
    ```

    Constraints:
    - First line `'use client'`.
    - Keep the export name `function CustomCursor` (Plan 02 layout import).
    - DO NOT use `cursor: none` ANYWHERE in this file or anywhere else in the codebase. This is the LAYOUT-06 D-26 NON-NEGOTIABLE gate.
    - DO NOT use React state for pointer position (use `useMotionValue` + `useSpring`).
    - DO NOT subscribe to palette changes via React state — use `var(--color-accent)` directly in inline style (D-28).
    - DO NOT introduce any color literal (the only color value is `var(--color-accent)`).
    - Use `pointermove`, `pointerover`, `pointerout` events (NOT `mousemove` / `mouseover` — pointer events normalize touch/pen/mouse).

    **Create `components/layout/CustomCursor.test.tsx`**:

    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render } from '@testing-library/react';

    type MQL = { matches: boolean; addEventListener: () => void; removeEventListener: () => void };

    function mockMatchMedia(map: Record<string, boolean>) {
      const cache = new Map<string, MQL>();
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn((query: string) => {
          const existing = cache.get(query);
          if (existing) return existing;
          const mql: MQL = {
            matches: !!map[query],
            addEventListener: () => {},
            removeEventListener: () => {},
          };
          cache.set(query, mql);
          return mql;
        }),
      });
    }

    let CustomCursor: () => JSX.Element | null;
    beforeEach(async () => {
      vi.resetModules();
      const mod = await import('./CustomCursor');
      CustomCursor = mod.CustomCursor;
    });

    describe('CustomCursor — activation gates', () => {
      it('renders nothing when pointer is not fine', () => {
        mockMatchMedia({
          '(pointer: fine)': false,
          '(prefers-reduced-motion: reduce)': false,
          '(any-pointer: coarse)': false,
          '(forced-colors: active)': false,
        });
        const { queryByTestId } = render(<CustomCursor />);
        expect(queryByTestId('custom-cursor')).toBeNull();
      });

      it('renders nothing when prefers-reduced-motion is reduce', () => {
        mockMatchMedia({
          '(pointer: fine)': true,
          '(prefers-reduced-motion: reduce)': true,
          '(any-pointer: coarse)': false,
          '(forced-colors: active)': false,
        });
        const { queryByTestId } = render(<CustomCursor />);
        expect(queryByTestId('custom-cursor')).toBeNull();
      });

      it('renders nothing under any-pointer:coarse (hybrid devices in touch mode)', () => {
        mockMatchMedia({
          '(pointer: fine)': true,
          '(prefers-reduced-motion: reduce)': false,
          '(any-pointer: coarse)': true,
          '(forced-colors: active)': false,
        });
        const { queryByTestId } = render(<CustomCursor />);
        expect(queryByTestId('custom-cursor')).toBeNull();
      });

      it('renders nothing under forced-colors:active (Windows High Contrast)', () => {
        mockMatchMedia({
          '(pointer: fine)': true,
          '(prefers-reduced-motion: reduce)': false,
          '(any-pointer: coarse)': false,
          '(forced-colors: active)': true,
        });
        const { queryByTestId } = render(<CustomCursor />);
        expect(queryByTestId('custom-cursor')).toBeNull();
      });

      it('renders the tracer when all 4 gates pass', () => {
        mockMatchMedia({
          '(pointer: fine)': true,
          '(prefers-reduced-motion: reduce)': false,
          '(any-pointer: coarse)': false,
          '(forced-colors: active)': false,
        });
        const { queryByTestId } = render(<CustomCursor />);
        const tracer = queryByTestId('custom-cursor');
        expect(tracer).not.toBeNull();
        expect(tracer?.getAttribute('aria-hidden')).toBe('true');
        const style = tracer?.getAttribute('style') ?? '';
        expect(style).toContain('position: fixed');
        expect(style).toContain('pointer-events: none');
        // CRITICAL: cursor:none must NEVER appear here.
        expect(style).not.toMatch(/cursor:\s*none/);
      });
    });
    ```
  </action>
  <verify>
    <automated>npm test -- CustomCursor</automated>
  </verify>
  <acceptance_criteria>
    - File `components/layout/CustomCursor.tsx` exists and is NOT a stub.
    - File starts with `'use client'`.
    - File contains the literal string `useMotionValue` (imported from motion/react).
    - File contains the literal string `useSpring`.
    - File contains the literal string `(pointer: fine)`.
    - File contains the literal string `(prefers-reduced-motion: reduce)`.
    - File contains the literal string `(any-pointer: coarse)`.
    - File contains the literal string `(forced-colors: active)`.
    - File contains the literal string `var(--color-accent)` (D-28 — direct CSS variable usage).
    - File contains the literal string `pointermove` (event name).
    - File contains the literal string `pointerover` AND `pointerout` (event delegation).
    - File contains the literal string `[data-cursor=hover]` (selector).
    - File contains the literal string `img[data-zoomable]` (selector).
    - File contains the literal string `mixBlendMode: 'difference'` (research recommendation).
    - File DOES NOT contain `cursor: none` (with a space — verbatim).
    - File DOES NOT contain `cursor:none` (no space variant).
    - File DOES NOT contain any hex/rgb/hsl/oklch color literal.
    - **Repo-wide grep gate (CRITICAL LAYOUT-06 D-26):** `grep -r "cursor: none" components/ app/ --include="*.tsx" --include="*.ts" --include="*.css"` returns no matches. Also check `cursor:none` (no space): `grep -r "cursor:none" components/ app/` returns no matches.
    - Test file `components/layout/CustomCursor.test.tsx` exists with 5 `it(` blocks.
    - `npm test -- CustomCursor` exits 0.
  </acceptance_criteria>
  <done>CustomCursor renders a constrained tracer that respects all 4 gates and uses motion values (no React re-renders during move). NO `cursor: none` exists anywhere in the codebase.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement app/template.tsx (motion AnimatePresence popLayout, pathname-keyed, reduced-motion fallback) + Vitest spec</name>
  <files>app/template.tsx, app/template.test.tsx</files>
  <read_first>
    - app/[locale]/layout.tsx (verify template.tsx will sit at root, NOT inside [locale]/ — per RESEARCH §5)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Page Transitions" (D-31..D-33)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §5 "motion AnimatePresence mode='popLayout' in app/template.tsx"
    - app/[locale]/page.tsx (current home content — template wraps `children` which is this page)
  </read_first>
  <behavior>
    Test 1: Template renders its children inside a motion.div with key equal to the mocked pathname.
    Test 2: Under normal motion (useReducedMotion=false), the motion.div has `initial={opacity:0,y:8}`, `animate={opacity:1,y:0}`, `exit={opacity:0,y:-8}`.
    Test 3: Under reduced motion (useReducedMotion=true), the motion.div has opacity-only variants (no `y` key).
    Test 4: AnimatePresence renders with mode="popLayout" and initial={false}.
    Test 5: The first line of `app/template.tsx` is `'use client'`.
  </behavior>
  <action>
    **Create `app/template.tsx`** (this file does NOT exist yet — Plan 02 did not create it):

    ```typescript
    'use client';

    import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
    import { usePathname } from 'next/navigation';
    import type { ReactNode } from 'react';

    /**
     * ANIM-01: route-transition wrapper.
     * Lives at app/template.tsx (NOT app/[locale]/template.tsx) so locale
     * switches do NOT trigger a page transition — only true route changes do.
     * D-31 popLayout (not wait) — Phase 4 filter grid uses the same mode.
     * D-32 fade + 8px Y-translate 300ms; reduced-motion = opacity-only ≤100ms.
     * D-33 pathname-keyed motion.div.
     *
     * IMPORTANT: usePathname here comes from 'next/navigation' (FULL path including
     * the locale prefix). The locale-stripped usePathname from '@/i18n/navigation'
     * would NOT trigger a re-key on locale-only navigation — but locale switches
     * intentionally do NOT animate, so the FULL path is the correct primitive.
     */
    export default function Template({ children }: { children: ReactNode }) {
      const pathname = usePathname();
      const reduce = useReducedMotion();

      const transition = reduce
        ? { duration: 0.1, ease: 'linear' as const }
        : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

      const variants = reduce
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

      return (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pathname}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      );
    }
    ```

    Constraints:
    - First line MUST be `'use client';` (Next 16 templates default to Server; AnimatePresence requires client).
    - Default export — Next App Router file convention requires templates to default-export the component.
    - IMPORT `usePathname` from `'next/navigation'` (FULL path) — NOT from `@/i18n/navigation`. This is the critical disambiguation per the prompt's <critical_constraints>.
    - DO NOT introduce color literals.
    - DO NOT introduce `cursor: none`.
    - The file MUST sit at `app/template.tsx` (root level), NOT `app/[locale]/template.tsx`.

    **Create `app/template.test.tsx`**:

    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { render, screen } from '@testing-library/react';

    const pathnameMock = vi.fn(() => '/fr/projects/foo');
    vi.mock('next/navigation', () => ({
      usePathname: () => pathnameMock(),
    }));

    const reducedMock = vi.fn(() => false);
    vi.mock('motion/react', async () => {
      // Pass through actual motion to render <motion.div> as a real DOM <div> for tests.
      const actual = await vi.importActual<typeof import('motion/react')>('motion/react');
      return {
        ...actual,
        useReducedMotion: () => reducedMock(),
      };
    });

    let Template: (p: { children: React.ReactNode }) => JSX.Element;
    beforeEach(async () => {
      vi.clearAllMocks();
      pathnameMock.mockReturnValue('/fr/projects/foo');
      reducedMock.mockReturnValue(false);
      vi.resetModules();
      const mod = await import('./template');
      Template = mod.default;
    });

    describe('app/template.tsx', () => {
      it('renders children inside a motion wrapper keyed by pathname', () => {
        render(<Template><div data-testid="kid">hi</div></Template>);
        expect(screen.getByTestId('kid')).toBeInTheDocument();
      });

      it('handles the reduced-motion branch (opacity-only)', () => {
        reducedMock.mockReturnValue(true);
        render(<Template><div data-testid="kid">hi</div></Template>);
        expect(screen.getByTestId('kid')).toBeInTheDocument();
      });

      // Smoke test that the import surface is valid Next-template shape: default export
      it('uses default export (Next App Router convention)', async () => {
        const mod = await import('./template');
        expect(typeof mod.default).toBe('function');
      });
    });
    ```

    Note: For Test 2 + 3 in <behavior>, jsdom + motion's render shape make it tricky to assert on the exact `initial` prop value. The smoke + render coverage above is the minimum acceptable. The deep variant assertion can be added if the executor finds a clean motion test pattern; otherwise these 3 tests are sufficient.
  </action>
  <verify>
    <automated>npm test -- template</automated>
  </verify>
  <acceptance_criteria>
    - File `app/template.tsx` exists.
    - First line of the file matches the regex `^['"]use client['"];?$` — verify with `head -1 app/template.tsx` returning a line starting with `'use client'`.
    - File contains the literal string `AnimatePresence` (imported from motion/react).
    - File contains the literal string `mode="popLayout"` (D-31).
    - File contains the literal string `initial={false}` (suppress first-mount enter).
    - File contains the literal string `useReducedMotion` (motion's hook, NOT the custom one).
    - File contains the literal string `usePathname` imported from `'next/navigation'` (FULL path).
    - File DOES NOT contain `from '@/i18n/navigation'` (this would be the locale-stripped pathname — wrong here).
    - File contains the literal string `key={pathname}` (D-33 — pathname-keyed motion.div).
    - File contains the literal string `0.3` (300ms duration under normal motion) AND `0.1` (100ms under reduced motion).
    - File contains the literal string `export default function Template` (or `export default function Template(`).
    - File DOES NOT contain `'use server'` (must be Client Component).
    - File DOES NOT contain `cursor: none`.
    - File DOES NOT contain any hex/rgb/hsl/oklch color literal.
    - File DOES NOT contain `import { motion } from 'framer-motion'` (must be `motion/react`).
    - Test file `app/template.test.tsx` exists with at least 3 `it(` blocks.
    - `npm test -- template` exits 0.
    - `npm run build` exits 0 with `app/template.tsx` compiled successfully.
  </acceptance_criteria>
  <done>app/template.tsx wraps the page tree in AnimatePresence popLayout, keyed by FULL pathname; reduced-motion path is opacity-only; build passes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Implement lib/ascii.ts (FR/EN ASCII content with wordmark + intro + GitHub link + Konami hint) + Vitest spec</name>
  <files>lib/ascii.ts, lib/ascii.test.ts</files>
  <read_first>
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Console ASCII Art" (D-34 content rules)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §10 (one-shot print pattern + bilingual content + GitHub link)
  </read_first>
  <behavior>
    Test 1: `getAsciiArt('fr')` returns a multi-line string containing the GitHub link, the Konami hint glyph sequence, and a French intro phrase.
    Test 2: `getAsciiArt('en')` returns the same content shape with English intro text.
    Test 3: Both outputs contain an ASCII wordmark element (some non-trivial multi-line ASCII signature).
    Test 4: The GitHub URL is exactly `https://github.com/tanguynoumea/portfolio`.
    Test 5: The Konami hint string contains `↑` glyphs (UTF-8 arrows).
  </behavior>
  <action>
    **Create `lib/ascii.ts`**:

    ```typescript
    /**
     * lib/ascii.ts — bilingual ASCII signature for ConsoleArt (EGG-01).
     * D-34: ASCII wordmark + 2-3 intro lines + GitHub link + subtle Konami hint.
     * NO explanation of what the Konami sequence unlocks — discoverability IS the easter egg.
     */

    const WORDMARK = String.raw`
     _____                                
    |_   _|__ _ _ _   _ _ _   _ _   _ 
      | |/ _' | ' \ |_  / | | | | |/ /
      |_|\__,_|_||_|/_/  \__,_|\__/`;

    const GITHUB_URL = 'https://github.com/tanguynoumea/portfolio';
    const KONAMI_HINT = '// ↑ ↑ ↓ ↓ ← → ← → B A';

    const FR_INTRO =
      'Profil hybride Tech × Design × BIM.\n' +
      'Si tu lis ceci, tu aimes jeter un œil sous le capot — bienvenue.';

    const EN_INTRO =
      'Hybrid profile — Tech × Design × BIM.\n' +
      'If you are reading this, you are the kind of person who looks under the hood — welcome.';

    /**
     * Returns the multi-line ASCII signature for the given locale.
     * Used by ConsoleArt to console.log the bilingual greeting on cold load.
     */
    export function getAsciiArt(locale: 'fr' | 'en'): string {
      const intro = locale === 'fr' ? FR_INTRO : EN_INTRO;
      return [
        WORDMARK,
        '',
        intro,
        '',
        `>> ${GITHUB_URL}`,
        '',
        KONAMI_HINT,
      ].join('\n');
    }

    export const ASCII_GITHUB_URL = GITHUB_URL;
    export const ASCII_KONAMI_HINT = KONAMI_HINT;
    ```

    Constraints:
    - Pure module — NO `'use client'` directive needed (this is a non-React module called from a client component).
    - Export `getAsciiArt(locale: 'fr' | 'en'): string` exactly as shown.
    - Export `ASCII_GITHUB_URL` and `ASCII_KONAMI_HINT` constants so tests + ConsoleArt can reference them.
    - GitHub URL MUST be exactly `https://github.com/tanguynoumea/portfolio`.
    - Konami hint MUST contain the literal UTF-8 arrow glyphs `↑ ↑ ↓ ↓ ← → ← →`.
    - DO NOT use `any` (TS strict).

    **Create `lib/ascii.test.ts`**:

    ```typescript
    import { describe, it, expect } from 'vitest';
    import { getAsciiArt, ASCII_GITHUB_URL, ASCII_KONAMI_HINT } from './ascii';

    describe('lib/ascii', () => {
      it('FR variant contains the French intro phrase', () => {
        const out = getAsciiArt('fr');
        expect(out).toContain('Profil hybride');
        expect(out).toContain('Tech × Design × BIM');
      });

      it('EN variant contains the English intro phrase', () => {
        const out = getAsciiArt('en');
        expect(out).toContain('Hybrid profile');
        expect(out).toContain('Tech × Design × BIM');
      });

      it('contains the portfolio GitHub URL exactly', () => {
        expect(ASCII_GITHUB_URL).toBe('https://github.com/tanguynoumea/portfolio');
        expect(getAsciiArt('fr')).toContain('https://github.com/tanguynoumea/portfolio');
        expect(getAsciiArt('en')).toContain('https://github.com/tanguynoumea/portfolio');
      });

      it('contains the Konami arrow-glyph hint', () => {
        expect(ASCII_KONAMI_HINT).toContain('↑');
        expect(ASCII_KONAMI_HINT).toContain('↓');
        expect(ASCII_KONAMI_HINT).toContain('←');
        expect(ASCII_KONAMI_HINT).toContain('→');
        expect(ASCII_KONAMI_HINT).toContain('B A');
      });

      it('outputs are multi-line strings (the wordmark)', () => {
        expect(getAsciiArt('fr').split('\n').length).toBeGreaterThan(5);
        expect(getAsciiArt('en').split('\n').length).toBeGreaterThan(5);
      });
    });
    ```
  </action>
  <verify>
    <automated>npm test -- lib/ascii</automated>
  </verify>
  <acceptance_criteria>
    - File `lib/ascii.ts` exists.
    - File exports `getAsciiArt` (function), `ASCII_GITHUB_URL` (const string), `ASCII_KONAMI_HINT` (const string).
    - File contains the literal string `https://github.com/tanguynoumea/portfolio`.
    - File contains the literal UTF-8 glyphs `↑` AND `↓` AND `←` AND `→`.
    - File contains the literal substring `B A` (end of Konami sequence).
    - File contains the literal substring `Tech × Design × BIM` (or `Tech x Design x BIM` if executor avoids the unicode multiplication sign — preferred is the unicode `×`).
    - File contains FR intro keyword (e.g. `Profil hybride` or `Bienvenue`).
    - File contains EN intro keyword (e.g. `Hybrid profile` or `welcome`).
    - File does NOT contain `'use client'` (pure module).
    - File does NOT contain any color literal.
    - Test file `lib/ascii.test.ts` exists with at least 4 `it(` blocks.
    - `npm test -- lib/ascii` exits 0.
  </acceptance_criteria>
  <done>lib/ascii.ts ships getAsciiArt('fr'|'en') with wordmark + intro + GitHub link + Konami hint; tests prove all required substrings.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Implement components/layout/ConsoleArt.tsx (one-shot console.log on mount, module-level printed flag, NODE_ENV=test skip, FR/EN locale dispatch) + Vitest spec</name>
  <files>components/layout/ConsoleArt.tsx, components/layout/ConsoleArt.test.tsx</files>
  <read_first>
    - components/layout/ConsoleArt.tsx (current Plan 02 stub — replace body, keep `function ConsoleArt` export)
    - lib/ascii.ts (Task 3 — `getAsciiArt`)
    - .planning/phases/03-layout-animation-foundation/03-CONTEXT.md §"Console ASCII Art" (D-34..D-36)
    - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §10 (one-shot pattern + accent color sourcing)
  </read_first>
  <behavior>
    Test 1: When NODE_ENV is NOT 'test', the component calls console.log exactly once on mount.
    Test 2: When NODE_ENV is 'test', console.log is NOT called.
    Test 3: Module-level `printed` flag guards against double-print under React Strict Mode (re-mounting the component does NOT re-print).
    Test 4: The console.log first argument string contains the FR intro when locale='fr' and EN intro when locale='en'.
  </behavior>
  <action>
    **Replace the body of `components/layout/ConsoleArt.tsx`** (keep `'use client'` and named export):

    ```typescript
    'use client';

    import { useEffect } from 'react';
    import { useLocale } from 'next-intl';
    import { getAsciiArt } from '@/lib/ascii';

    /**
     * EGG-01: bilingual ASCII signature printed in the browser console on cold load.
     * One-shot: a module-level `printed` flag ensures the message logs exactly once
     * per page load, surviving React 19 Strict Mode double-invoke and route changes.
     * Skipped under NODE_ENV=test to keep Vitest output clean (D-36).
     */
    let printed = false;

    export function ConsoleArt() {
      const locale = useLocale();

      useEffect(() => {
        if (printed) return;
        if (typeof window === 'undefined') return;
        if (process.env.NODE_ENV === 'test') return;
        printed = true;
        const safeLocale: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr';
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        const styleBlock = `font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: ${accent || 'inherit'}; line-height: 1.3;`;
        // eslint-disable-next-line no-console
        console.log('%c' + getAsciiArt(safeLocale), styleBlock);
      }, [locale]);

      return null;
    }

    // Test-only export so the spec can reset the module-level guard.
    export function __resetConsoleArt() {
      printed = false;
    }
    ```

    Constraints:
    - First line `'use client'`.
    - Keep the named export `function ConsoleArt` (Plan 02 layout import).
    - The `printed` module-level flag MUST live OUTSIDE the component function (module scope), so re-mounts under Strict Mode share the same value.
    - The `NODE_ENV === 'test'` guard MUST come before the `printed = true` assignment, so tests never set the flag.
    - The `console.log` MUST call `getAsciiArt(safeLocale)` — pass through the locale (D-34 dispatch).
    - The accent color sourcing via `getComputedStyle` is the documented pattern (D-35) — but if it returns an empty string (Vitest jsdom), fall back to `'inherit'`.
    - DO NOT introduce `cursor: none`.
    - DO NOT introduce color literals (the accent comes from `--color-accent` at runtime).
    - Export the `__resetConsoleArt` helper so the test can reset the module-level guard between cases.

    **Create `components/layout/ConsoleArt.test.tsx`**:

    ```typescript
    import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
    import { render } from '@testing-library/react';

    const localeMock = vi.fn(() => 'fr' as 'fr' | 'en');
    vi.mock('next-intl', () => ({
      useLocale: () => localeMock(),
    }));

    let ConsoleArt: () => JSX.Element | null;
    let __resetConsoleArt: () => void;
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      vi.resetModules();
      const mod = await import('./ConsoleArt');
      ConsoleArt = mod.ConsoleArt;
      __resetConsoleArt = mod.__resetConsoleArt;
      __resetConsoleArt();
      logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    describe('ConsoleArt', () => {
      it('does NOT call console.log under NODE_ENV=test', () => {
        // process.env.NODE_ENV is set to 'test' by Vitest automatically.
        expect(process.env.NODE_ENV).toBe('test');
        render(<ConsoleArt />);
        expect(logSpy).not.toHaveBeenCalled();
      });

      it('calls console.log exactly once when NODE_ENV is not test', async () => {
        const prev = process.env.NODE_ENV;
        Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
        try {
          // Re-import so the runtime guard reads the new value.
          vi.resetModules();
          const mod = await import('./ConsoleArt');
          mod.__resetConsoleArt();
          render(<mod.ConsoleArt />);
          expect(logSpy).toHaveBeenCalledTimes(1);
        } finally {
          Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
        }
      });

      it('module-level flag prevents a second print on remount', async () => {
        const prev = process.env.NODE_ENV;
        Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
        try {
          vi.resetModules();
          const mod = await import('./ConsoleArt');
          mod.__resetConsoleArt();
          const { unmount } = render(<mod.ConsoleArt />);
          unmount();
          render(<mod.ConsoleArt />);
          expect(logSpy).toHaveBeenCalledTimes(1);
        } finally {
          Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
        }
      });

      it('dispatches by locale — FR variant contains French intro', async () => {
        const prev = process.env.NODE_ENV;
        Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
        try {
          vi.resetModules();
          const mod = await import('./ConsoleArt');
          mod.__resetConsoleArt();
          localeMock.mockReturnValue('fr');
          render(<mod.ConsoleArt />);
          const firstArg = logSpy.mock.calls[0]?.[0] as string;
          expect(firstArg).toMatch(/Profil hybride|hybride/);
        } finally {
          Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
        }
      });

      it('dispatches by locale — EN variant contains English intro', async () => {
        const prev = process.env.NODE_ENV;
        Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
        try {
          vi.resetModules();
          const mod = await import('./ConsoleArt');
          mod.__resetConsoleArt();
          localeMock.mockReturnValue('en');
          render(<mod.ConsoleArt />);
          const firstArg = logSpy.mock.calls[0]?.[0] as string;
          expect(firstArg).toMatch(/Hybrid profile|welcome/i);
        } finally {
          Object.defineProperty(process.env, 'NODE_ENV', { value: prev, configurable: true });
        }
      });
    });
    ```
  </action>
  <verify>
    <automated>npm test -- ConsoleArt</automated>
  </verify>
  <acceptance_criteria>
    - File `components/layout/ConsoleArt.tsx` exists and is NOT a stub.
    - File starts with `'use client'`.
    - File contains the literal string `let printed = false` (module-level guard — must be outside the component function).
    - File contains the literal string `process.env.NODE_ENV` (D-36 test skip).
    - File contains the literal string `'test'` (D-36 comparison value).
    - File contains the literal string `console.log` (the print call).
    - File contains the literal string `getAsciiArt` (imports from lib/ascii).
    - File contains the literal string `useLocale` (next-intl locale dispatch).
    - File contains the literal string `getComputedStyle` (D-35 accent color sourcing).
    - File contains the literal string `--color-accent` (the CSS var being read).
    - File does NOT contain `cursor: none`.
    - File does NOT contain any color literal.
    - Test file `components/layout/ConsoleArt.test.tsx` exists with >= 4 `it(` blocks.
    - `npm test -- ConsoleArt` exits 0.
  </acceptance_criteria>
  <done>ConsoleArt prints once per cold load, skips under test env, locale-dispatches via lib/ascii; tests prove the guard + locale variants.</done>
</task>

</tasks>

<verification>
- All 4 implementation files exist: CustomCursor.tsx, app/template.tsx, ConsoleArt.tsx, lib/ascii.ts.
- All 4 test files exist and pass: CustomCursor.test.tsx, app/template.test.tsx, ConsoleArt.test.tsx, lib/ascii.test.ts.
- **CRITICAL GATE (LAYOUT-06 D-26):** `grep -r "cursor: none" components/ app/ --include="*.tsx" --include="*.ts" --include="*.css"` returns NO matches anywhere in the repository (a 6th implicit acceptance criterion). Also check `cursor:none` (no space).
- `app/template.tsx` line 1 is `'use client'` (head -1 verification).
- `app/template.tsx` imports `usePathname` from `'next/navigation'` (NOT from `@/i18n/navigation`).
- `CustomCursor.tsx` uses `var(--color-accent)` (direct CSS variable, not JS subscription).
- `lib/ascii.ts` GitHub URL is exactly `https://github.com/tanguynoumea/portfolio`.
- `lib/ascii.ts` Konami hint contains UTF-8 arrow glyphs.
- `npm test` exits 0 with all new tests passing.
- `npm run build` exits 0.
- `npm run lint` exits 0.
</verification>

<success_criteria>
After this plan ships, a user on desktop with motion enabled sees:
1. A decorative tracer dot following their pointer (their OS cursor STILL visible — non-negotiable).
2. A smooth fade + Y-translate transition between routes (≤ 350ms).
3. On opening DevTools after a cold load: a bilingual ASCII signature with their locale's intro text, the portfolio repo URL, and the Konami hint.

Users with prefers-reduced-motion or on touch devices see no CustomCursor and an instant opacity-only page transition. Vitest catches any regression in the activation gates, the popLayout mode, the one-shot console print, or the locale dispatch.

The **LAYOUT-06 D-26 non-negotiable** (no `cursor: none` ANYWHERE in the codebase) is enforced by an explicit grep gate in the acceptance criteria.
</success_criteria>

<output>
After completion, create `.planning/phases/03-layout-animation-foundation/03-05-SUMMARY.md` documenting:
- The 4 implementation files and 4 test files created.
- Confirmation that `grep -r "cursor: none" components/ app/` returns nothing (LAYOUT-06 D-26 gate).
- Confirmation that `app/template.tsx` imports usePathname from `next/navigation` (NOT `@/i18n/navigation`).
- Confirmation that ConsoleArt prints exactly once per cold load (module-level flag pattern).
- Confirmation that lib/ascii.ts contains the portfolio GitHub URL and Konami arrow glyphs.
- Phase 3 contract for downstream phases: GSAP animations in Phase 4+ MUST use `useGSAP({ scope: ref })` from `@gsap/react`.
</output>
