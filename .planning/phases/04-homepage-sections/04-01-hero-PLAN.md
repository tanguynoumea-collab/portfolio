---
phase: 04-homepage-sections
plan: 01
type: execute
wave: 1
depends_on: [00]
files_modified:
  - components/sections/Hero.tsx
  - components/sections/Hero.test.tsx
autonomous: true
requirements: [HOME-01]
requirements_addressed: [HOME-01]
gap_closure: false

must_haves:
  truths:
    - "Hero renders the name 'Tanguy', the role 'Tech × Design × BIM', the tagline, and a CTA from hero.* i18n keys"
    - "On mount, GSAP SplitText splits the name + role into chars and animates them via a useGSAP-scoped timeline"
    - "Under prefers-reduced-motion: reduce, the animation is replaced by gsap.set() final-state — no tween runs"
    - "Clicking the CTA scrolls to #projects via useLenis().scrollTo when Lenis is available, falls back to scrollIntoView when Lenis is null (under reduced-motion)"
    - "The lucide ChevronDown scroll cue performs a gentle motion y-bounce loop under full motion; stays static under reduced motion"
    - "Initial paint (SSR) renders the text statically at final position to prevent CLS — animation overlays only after hydration"
  artifacts:
    - path: "components/sections/Hero.tsx"
      provides: "'use client' Hero section component"
      contains: "useGSAP"
    - path: "components/sections/Hero.test.tsx"
      provides: "Vitest spec turned GREEN — see Hero.test.tsx structure in 04-00 Task 7"
  key_links:
    - from: "components/sections/Hero.tsx"
      to: "@gsap/react useGSAP"
      via: "useGSAP({ scope: heroRef }) wrapping the SplitText timeline"
      pattern: "useGSAP\\(.*scope: heroRef"
    - from: "components/sections/Hero.tsx"
      to: "@/components/providers/LenisProvider useLenis"
      via: "CTA scroll handler reads useLenis() and null-checks before calling scrollTo"
      pattern: "useLenis\\(\\)"
    - from: "components/sections/Hero.tsx"
      to: "gsap/SplitText + gsap.matchMedia"
      via: "char-stagger timeline under matchMedia full-motion branch; gsap.set under reduced-motion branch"
      pattern: "SplitText|matchMedia"
    - from: "components/sections/Hero.tsx"
      to: "lucide-react ChevronDown"
      via: "scroll cue icon wrapped in motion.div with y:[0,8,0] 2s loop"
      pattern: "ChevronDown"
    - from: "components/sections/Hero.tsx"
      to: "next-intl useTranslations('hero')"
      via: "renders name/role/tagline/cta/scrollCue from hero.* i18n keys"
      pattern: "useTranslations\\('hero'\\)"
---

<objective>
Implement the Hero section per HOME-01: bilingual name reveal via GSAP SplitText char-stagger, role + tagline cascade, CTA scroll-to-projects (Lenis when available, scrollIntoView fallback), and a motion-bounced ChevronDown scroll cue. Reduced-motion gate via `gsap.matchMedia()` — splits still create chars (for SSR-stable layout), but the tween is replaced by `gsap.set()` final-state. Implementation honors the precise pattern from 04-RESEARCH.md §"Pattern 1: useGSAP({ scope }) with SplitText cleanup".

Purpose: Above-the-fold first-impression. The user is greeted with their bilingual identity in a single animated reveal. The CTA seamlessly carries them to the project showcase. Accessibility (reduced-motion + aria-label on cue) and performance (SSR-stable layout, no CLS, no FOUC) are baseline.

Output:
- `components/sections/Hero.tsx` — `'use client'` component, exports `Hero`
- `components/sections/Hero.test.tsx` — Wave 0 RED harness turns GREEN
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
@components/providers/LenisProvider.tsx
@components/layout/LanguageSwitcher.tsx
@components/sections/Hero.test.tsx
@messages/fr.json
@messages/en.json
@lib/hooks/usePrefersReducedMotion.ts
@CLAUDE.md

<interfaces>
<!-- Key contracts the executor MUST honor. -->

From components/providers/LenisProvider.tsx (Phase 3):
```typescript
export function useLenis(): Lenis | null;
// Returns null under reduced-motion OR before mount effect runs. ALWAYS null-check.
// When non-null, Lenis instance exposes:
//   lenis.scrollTo(target: HTMLElement | number | string, opts?: { offset?: number; duration?: number; immediate?: boolean })
```

From @gsap/react (Phase 3):
```typescript
function useGSAP(
  callback: (ctx: gsap.Context, contextSafe: (fn: Function) => Function) => void,
  config?: {
    scope?: React.RefObject<HTMLElement | null>;
    dependencies?: ReadonlyArray<unknown>;
    revertOnUpdate?: boolean;
  }
): { contextSafe: (fn: Function) => Function };
// Auto-reverts all GSAP animations, ScrollTriggers, AND SplitText instances on unmount.
```

From gsap/SplitText (free since Apr 2025, bundled in gsap@3.15):
```typescript
class SplitText {
  constructor(target: string | HTMLElement, config?: {
    type?: 'chars' | 'words' | 'lines' | 'chars,words' | 'chars,words,lines';
    aria?: 'auto' | string | false;
    onSplit?: () => void;
  });
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  revert(): void;
  kill(): void;
}
```

From gsap (registerPlugin pattern):
```typescript
// LenisProvider already registers ScrollTrigger at module load — DO NOT register again.
// SplitText needs registration here (Phase 4 first use):
gsap.registerPlugin(SplitText);
```

From messages/fr.json + messages/en.json (after Wave 0):
- `hero.name` — "Tanguy" (FR/EN identical)
- `hero.role` — "Tech × Design × BIM" (FR/EN identical)
- `hero.tagline` — FR/EN-specific tagline text
- `hero.cta` — FR: "Découvrir mon travail" / EN: "See my work"
- `hero.scrollCue` — FR: "Faire défiler vers les projets" / EN: "Scroll to projects" (aria-label)

From lucide-react@^1.16.0:
- `ChevronDown` icon (confirmed available, NOT a brand icon)

From motion/react:
- `motion` namespace; use `motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}` for bounce
- `useReducedMotion()` returns boolean (treat `null` as `false` per 04-RESEARCH §"Pitfall 4-B")

From components/ui/button.tsx (existing shadcn primitive):
```typescript
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean });
// Variants: default | destructive | outline | secondary | ghost | link
// Sizes: default | sm | lg | icon
```
Use `<Button onClick={onCta}>{t('cta')}</Button>` — default variant.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement Hero component</name>
  <files>components/sections/Hero.tsx</files>
  <behavior>
    - Hero renders an `<section ref={heroRef}>` (NOTE: but page.tsx wraps Hero already in a <section id="home">; for component-as-leaf approach, use a generic root like a <div> or render the inner content only since the parent <section> from page.tsx already provides id="home" + min-h-screen).
    - Decision: Hero exports a self-contained block that fills its parent <section>. Use a `<div ref={heroRef}>` for the GSAP scope, not a nested `<section>`. The parent page.tsx already provides the section landmark.
    - Renders name + role + tagline + CTA + scroll cue from hero.* i18n keys
    - Animation: useGSAP scope, gsap.matchMedia full-motion timeline with SplitText char-stagger (name 0.04s/char, role 0.025s/char), tagline opacity fade at 0.8s, CTA + cue fade-in at 1.0s
    - Reduced-motion: gsap.set() to final state for all 5 data-hero-* targets
    - CTA: useLenis() null-check; scrollTo target='#projects' with offset=-64; fallback to document.getElementById('projects').scrollIntoView
    - Scroll cue: motion.div with y:[0,8,0] loop; under reduced-motion → no animation prop
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-07, D-08, D-09, D-10)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pattern 1: useGSAP({ scope }) with SplitText cleanup" (full code example) + §"Pitfall 4-A" (i18n locale-switch SplitText dependencies) + §"Pitfall 4-B" (useReducedMotion null) + §"Pitfall 4-D" (ScrollTrigger refresh after SplitText)
    - .planning/phases/04-homepage-sections/04-00-assets-and-stubs-PLAN.md (Hero.test.tsx structure — the test expects useGSAP called with scope, and getByText for name/role/cta)
    - components/sections/Hero.test.tsx (Wave 0 RED harness — implementation makes this GREEN)
    - components/providers/LenisProvider.tsx (useLenis return contract; ScrollTrigger already registered at module load — DO NOT re-register)
    - components/layout/LanguageSwitcher.tsx (motion + useTranslations + 'use client' patterns reference)
    - lib/hooks/usePrefersReducedMotion.ts (canonical reduced-motion hook; OR use motion.useReducedMotion — both valid)
  </read_first>
  <action>
    Create `components/sections/Hero.tsx` with this structure:

    ```tsx
    'use client';

    /**
     * components/sections/Hero.tsx — HOME-01 Phase 4.
     *
     * Bilingual identity reveal via GSAP SplitText char-stagger inside a
     * useGSAP({ scope }) hook. CTA scrolls to #projects via Lenis (when
     * available) with a scrollIntoView fallback under reduced motion.
     * ChevronDown scroll cue performs a gentle motion y-bounce loop.
     *
     * Pattern: 04-RESEARCH.md §"Pattern 1" — gsap.matchMedia gates full vs
     * reduced motion; SplitText is auto-reverted by useGSAP on unmount;
     * dependencies on [t('name'), t('role')] guarantee re-split on locale
     * switch (Pitfall 4-A).
     *
     * Colors: all via Tailwind utilities backed by --color-* tokens. NO
     * literal oklch/rgb/hsl/hex anywhere.
     */

    import { useRef } from 'react';
    import { useTranslations } from 'next-intl';
    import { useGSAP } from '@gsap/react';
    import { gsap } from 'gsap';
    import { SplitText } from 'gsap/SplitText';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { motion } from 'motion/react';
    import { ChevronDown } from 'lucide-react';
    import { useLenis } from '@/components/providers/LenisProvider';
    import { Button } from '@/components/ui/button';
    import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

    // Module-level registration. ScrollTrigger is already registered by
    // LenisProvider; SplitText is registered HERE (Phase 4 first use of it).
    // gsap.registerPlugin is idempotent — no harm if called twice.
    gsap.registerPlugin(SplitText);

    export function Hero() {
      const heroRef = useRef<HTMLDivElement>(null);
      const t = useTranslations('hero');
      const lenis = useLenis();
      const reducedMotion = usePrefersReducedMotion();

      // Pitfall 4-A: pass i18n strings as dependencies so the SplitText
      // re-runs when the user switches locale (text content changes; without
      // this, the old chars stay in DOM and animation is skipped).
      useGSAP(
        () => {
          const mm = gsap.matchMedia();
          mm.add(
            {
              isReduced: '(prefers-reduced-motion: reduce)',
              isFull: '(prefers-reduced-motion: no-preference)',
            },
            (ctx) => {
              const nameSplit = new SplitText('[data-hero-name]', {
                type: 'chars',
                aria: 'auto',
                onSplit: () => ScrollTrigger.refresh(), // Pitfall 4-D
              });
              const roleSplit = new SplitText('[data-hero-role]', {
                type: 'chars',
                aria: 'auto',
              });

              if (ctx.conditions?.isFull) {
                const tl = gsap.timeline();
                tl.from(nameSplit.chars, {
                  opacity: 0,
                  y: 24,
                  duration: 0.5,
                  stagger: 0.04,
                  ease: 'power3.out',
                })
                  .from(
                    roleSplit.chars,
                    {
                      opacity: 0,
                      y: 24,
                      duration: 0.5,
                      stagger: 0.025,
                      ease: 'power3.out',
                    },
                    '-=0.3',
                  )
                  .from('[data-hero-tagline]', { opacity: 0, duration: 0.5 }, 0.8)
                  .from(
                    '[data-hero-cta]',
                    { opacity: 0, y: 12, duration: 0.5 },
                    1.0,
                  )
                  .from('[data-hero-cue]', { opacity: 0, duration: 0.5 }, 1.0);
              } else {
                // Reduced: snap to final state instantly — no tween.
                gsap.set(
                  [
                    nameSplit.chars,
                    roleSplit.chars,
                    '[data-hero-tagline]',
                    '[data-hero-cta]',
                    '[data-hero-cue]',
                  ],
                  { opacity: 1, y: 0 },
                );
              }

              // Belt-and-suspenders cleanup — useGSAP auto-reverts on unmount,
              // but matchMedia may tear down independently when conditions flip.
              return () => {
                nameSplit.revert();
                roleSplit.revert();
              };
            },
          );
        },
        { scope: heroRef, dependencies: [t('name'), t('role')] },
      );

      const onCta = () => {
        const target = document.getElementById('projects');
        if (!target) return;
        if (lenis) {
          lenis.scrollTo(target, { offset: -64, duration: 1.0 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      return (
        <div ref={heroRef} className="w-full">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1
              data-hero-name
              className="text-foreground text-7xl font-bold tracking-tight md:text-8xl lg:text-9xl"
            >
              {t('name')}
            </h1>
            <p
              data-hero-role
              className="text-primary text-2xl md:text-3xl"
            >
              {t('role')}
            </p>
            <p
              data-hero-tagline
              className="text-muted-foreground mx-auto max-w-2xl text-lg"
            >
              {t('tagline')}
            </p>
            <div data-hero-cta className="flex justify-center pt-4">
              <Button onClick={onCta} size="lg">
                {t('cta')}
              </Button>
            </div>
            <div data-hero-cue className="pt-8">
              <motion.div
                aria-label={t('scrollCue')}
                role="img"
                className="text-muted-foreground inline-block"
                animate={
                  reducedMotion
                    ? undefined
                    : { y: [0, 8, 0] }
                }
                transition={
                  reducedMotion
                    ? undefined
                    : {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              >
                <ChevronDown className="h-6 w-6" aria-hidden="true" />
              </motion.div>
            </div>
          </div>
        </div>
      );
    }
    ```

    **CRITICAL CHECKS:**
    - File starts with `'use client'`
    - Imports: `useRef` from React, `useTranslations` from 'next-intl', `useGSAP` from '@gsap/react', `gsap` from 'gsap', `SplitText` from 'gsap/SplitText', `ScrollTrigger` from 'gsap/ScrollTrigger', `motion` from 'motion/react', `ChevronDown` from 'lucide-react', `useLenis` from '@/components/providers/LenisProvider', `Button` from '@/components/ui/button', `usePrefersReducedMotion` from '@/lib/hooks/usePrefersReducedMotion'
    - Module-level `gsap.registerPlugin(SplitText)` call
    - `useGSAP({ scope: heroRef, dependencies: [t('name'), t('role')] })` — both scope AND dependencies
    - `gsap.matchMedia()` is the reduced-motion gate
    - `SplitText.revert()` called inside matchMedia cleanup return
    - `useLenis()` null-checked before calling `scrollTo`
    - CTA `onCta` falls back to `scrollIntoView` when Lenis is null
    - No literal colors anywhere — only Tailwind utilities (`text-foreground`, `text-primary`, `text-muted-foreground`)
    - All data-attributes (`data-hero-name`, `data-hero-role`, `data-hero-tagline`, `data-hero-cta`, `data-hero-cue`) present
    - Component exports a NAMED export `Hero` (not default)
  </action>
  <verify>
    <automated>node -e "const c=require('fs').readFileSync('components/sections/Hero.tsx','utf8'); const required=[\"'use client'\",'useGSAP','SplitText','matchMedia','useLenis','scrollTo','scrollIntoView','ChevronDown','useTranslations','registerPlugin(SplitText)','data-hero-name','data-hero-role','data-hero-tagline','data-hero-cta','data-hero-cue','scope: heroRef','revert()','export function Hero']; const missing=required.filter(r=>!c.includes(r)); if(missing.length){console.error('MISSING:',missing);process.exit(1)} const bad=c.match(/oklch\\(|#[0-9a-fA-F]{3,6}|rgb\\(|hsl\\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} console.log('hero-impl-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/Hero.tsx` exists and starts with `'use client'`
    - Contains `useGSAP({ scope: heroRef`
    - Contains `SplitText` AND `registerPlugin(SplitText)`
    - Contains `gsap.matchMedia` (the reduced-motion gate)
    - Contains `nameSplit.revert()` AND `roleSplit.revert()` inside the matchMedia callback's return
    - Contains `useLenis()` null-check and `scrollTo` call when truthy
    - Contains `scrollIntoView` fallback when Lenis is null
    - Contains `ChevronDown` from lucide-react inside a `motion.div`
    - Contains 5 `data-hero-*` attributes on the 5 animated elements (name, role, tagline, cta, cue)
    - Contains `useTranslations('hero')` call
    - Exports named `Hero` function (not default export)
    - Contains NO `oklch(`, `#XXX`, `rgb(`, `hsl(` literals
    - `npm run lint` exit 0
    - Wave 0's `components/sections/Hero.test.tsx` turns GREEN: `npx vitest run components/sections/Hero.test.tsx` exits 0
  </acceptance_criteria>
  <done>Hero component implements full HOME-01 spec; SplitText timeline scoped + dependency-tracked + reduced-motion-gated; CTA wires to Lenis with fallback; scroll cue bounces under full motion only; test harness turns GREEN.</done>
</task>

<task type="auto">
  <name>Task 2: Expand Hero.test.tsx with full HOME-01 acceptance assertions</name>
  <files>components/sections/Hero.test.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-VALIDATION.md (Hero-related per-task verification rows 04-01-01..04)
    - components/sections/Hero.test.tsx (Wave 0 RED harness — extend, do not replace)
    - components/sections/Hero.tsx (just-created implementation — extend tests to match)
  </read_first>
  <action>
    Open Wave 0's `components/sections/Hero.test.tsx` and EXTEND with additional test cases covering:

    1. CTA click calls `lenis.scrollTo` when Lenis is non-null (mock useLenis returning `{ scrollTo: vi.fn() }`)
    2. CTA click falls back to `scrollIntoView` when Lenis is null (mock useLenis returning null; spy on `Element.prototype.scrollIntoView`)
    3. Reduced-motion: when matchMedia matches reduced, `gsap.set` is called (NOT `gsap.timeline().from()`) — assert via the mocked gsap module
    4. Renders all 5 data-hero-* sentinels (`data-hero-name`, `data-hero-role`, `data-hero-tagline`, `data-hero-cta`, `data-hero-cue`)

    Use a pattern like:
    ```typescript
    describe('Hero (HOME-01) — CTA scroll behavior', () => {
      it('calls lenis.scrollTo when useLenis returns non-null', async () => {
        const scrollToSpy = vi.fn();
        vi.doMock('@/components/providers/LenisProvider', () => ({
          useLenis: () => ({ scrollTo: scrollToSpy }),
        }));
        const { Hero } = await import('./Hero');
        const { container } = render(<Hero />);
        // Place a #projects target in the document so onCta finds it
        const target = document.createElement('section');
        target.id = 'projects';
        document.body.appendChild(target);
        const cta = container.querySelector('[data-hero-cta] button') as HTMLButtonElement;
        cta?.click();
        expect(scrollToSpy).toHaveBeenCalled();
        document.body.removeChild(target);
      });
    });
    ```

    Make sure to use `vi.resetModules()` / `vi.doMock` correctly because the test suite imports Hero dynamically.

    Preserve the existing Wave 0 mocks at top of file; only ADD new describe blocks.

    Run `npx vitest run components/sections/Hero.test.tsx` to confirm all tests pass.
  </action>
  <verify>
    <automated>npx vitest run components/sections/Hero.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/Hero.test.tsx` contains ≥ 4 `describe` blocks and ≥ 6 `it()` cases
    - Test file covers: i18n rendering, useGSAP scope, CTA Lenis-path, CTA fallback-path, reduced-motion gating, data-hero-* sentinels presence
    - `npx vitest run components/sections/Hero.test.tsx` exits 0 (all tests GREEN)
    - No watch-mode flag
  </acceptance_criteria>
  <done>Hero test suite fully exercises HOME-01 acceptance contract; all tests green.</done>
</task>

</tasks>

<verification>
After both tasks complete:

1. **File gate:** `components/sections/Hero.tsx` exists; `components/sections/Hero.test.tsx` extended
2. **Lint gate:** `npm run lint` exit 0
3. **Type gate:** `npx tsc --noEmit` exit 0 (TypeScript strict, no `any`)
4. **Test gate:** `npx vitest run components/sections/Hero.test.tsx` exits 0
5. **No-color-literal gate:** `grep -E "oklch\(|#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" components/sections/Hero.tsx` returns nothing
6. **Structural gate (acceptance criteria automated check from Task 1)**
</verification>

<success_criteria>
- [ ] Hero.tsx exists with `'use client'`
- [ ] useGSAP({ scope: heroRef, dependencies: [t('name'), t('role')] }) wraps the timeline
- [ ] SplitText registered at module load and reverted on cleanup
- [ ] gsap.matchMedia gates full-motion vs reduced-motion
- [ ] Lenis CTA path with scrollIntoView fallback
- [ ] ChevronDown scroll cue with motion bounce
- [ ] All Tailwind utilities use --color-* tokens (no hex/rgb/hsl/oklch literals)
- [ ] Test harness expanded and passes
</success_criteria>

<output>
After completion, create `.planning/phases/04-homepage-sections/04-01-SUMMARY.md` documenting:
- Hero component shipped (HOME-01)
- SplitText timeline composition (name 0.04s, role 0.025s, tagline @ 0.8s, CTA + cue @ 1.0s)
- Reduced-motion semantic (gsap.set instant final state)
- useLenis null-check + scrollIntoView fallback
- ScrollTrigger.refresh() in SplitText.onSplit (Pitfall 4-D mitigation)
- Pitfall 4-A mitigation via dependencies array
- Tests added (4 describe blocks)
- npm test + npm run lint state
</output>