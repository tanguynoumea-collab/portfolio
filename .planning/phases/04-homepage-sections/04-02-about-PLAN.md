---
phase: 04-homepage-sections
plan: 02
type: execute
wave: 1
depends_on: [00]
files_modified:
  - components/sections/About.tsx
  - components/sections/About.test.tsx
autonomous: true
requirements: [HOME-02]
requirements_addressed: [HOME-02]
gap_closure: false

must_haves:
  truths:
    - "About renders the title from about.title plus 2 paragraphs from about.paragraphs.1 and about.paragraphs.2 i18n keys"
    - "About photo uses next/image with width=400 height=500, priority=false, loading=lazy, placeholder='blur' and a blurDataURL"
    - "Layout: 2-column desktop (md+) with photo 1/3 + bio 2/3; stacked single-column on mobile"
    - "Animation: useGSAP({ scope: aboutRef }) creates a GSAP timeline gated by gsap.matchMedia: photo slides from x=-40, bio paragraphs stagger from y=30"
    - "ScrollTrigger config: trigger=aboutRef.current, start='top 75%', toggleActions='play none none reverse'"
    - "Under prefers-reduced-motion: reduce, gsap.set runs instead of timeline — elements appear at final state without animation"
    - "All colors via Tailwind utilities backed by --color-* tokens (no literal hex/rgb/hsl/oklch)"
  artifacts:
    - path: "components/sections/About.tsx"
      provides: "'use client' About section component — 2-col photo+bio with ScrollTrigger reveal"
      contains: "useGSAP"
    - path: "components/sections/About.test.tsx"
      provides: "Vitest spec turned GREEN from Wave 0 RED harness"
  key_links:
    - from: "components/sections/About.tsx"
      to: "@gsap/react useGSAP + gsap/ScrollTrigger"
      via: "useGSAP({ scope: aboutRef }) creates a timeline with scrollTrigger config"
      pattern: "useGSAP\\(.*scope: aboutRef"
    - from: "components/sections/About.tsx"
      to: "next/image"
      via: "<Image src='/about-photo.jpg' width={400} height={500} placeholder='blur'/>"
      pattern: "from 'next/image'"
    - from: "components/sections/About.tsx"
      to: "next-intl useTranslations('about')"
      via: "renders title + paragraphs.{1,2} from about.* i18n keys"
      pattern: "useTranslations\\('about'\\)"
    - from: "components/sections/About.tsx"
      to: "gsap.matchMedia"
      via: "isFull/isReduced branches gate the timeline vs gsap.set"
      pattern: "matchMedia"
---

<objective>
Implement the About section per HOME-02: a 2-column desktop / stacked mobile layout with `next/image` photo (`public/about-photo.jpg` placeholder from Wave 0) and 2 bio paragraphs from the new `about.paragraphs.{1,2}` i18n keys. ScrollTrigger reveals the section when 25% of it enters the viewport (`start: 'top 75%'`) — photo slides in from the left, paragraphs stagger up. Reduced-motion via `gsap.matchMedia()` skips the timeline entirely and renders elements at their final state.

Purpose: The personal narrative section that ties the bilingual hybrid Tech × Design × BIM profile to the work. Photo provides a human touch; the bio establishes credibility and tone. ScrollTrigger reveal is subtle (no dramatic effects) — the content carries the value, the animation just polishes the entrance.

Output:
- `components/sections/About.tsx` — `'use client'` component, exports `About`
- `components/sections/About.test.tsx` — Wave 0 RED harness turns GREEN with full HOME-02 assertions
- Estimated execution: ~20-30 minutes
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
@components/sections/About.test.tsx
@messages/fr.json
@messages/en.json
@CLAUDE.md

<interfaces>
<!-- Key contracts the executor MUST honor. -->

From gsap/ScrollTrigger (Phase 3 LenisProvider already registers it):
```typescript
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Already registered at LenisProvider module load — DO NOT register again.

// Timeline-bound ScrollTrigger config:
gsap.timeline({
  scrollTrigger: {
    trigger: HTMLElement | string;          // section root
    start: 'top 75%';                       // when top of section is at 75% of viewport
    toggleActions: 'play none none reverse'; // play on enter, reverse on leave-back
  },
});
```

From next/image (Next 16):
```typescript
import Image from 'next/image';
<Image
  src="/about-photo.jpg"
  alt={t('title')}
  width={400}
  height={500}
  loading="lazy"     // below the fold — lazy
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."  // 10-byte minimal blur OK
  sizes="(max-width: 768px) 100vw, 33vw"
  className="rounded-lg object-cover w-full h-auto"
/>
```

From messages/fr.json + messages/en.json (after Wave 0):
- `about.title` — "À propos de moi" / "About me"
- `about.intro` — preserved from Phase 1 placeholder (NOT consumed in Phase 4)
- `about.paragraphs.1` — full bilingual paragraph 1
- `about.paragraphs.2` — full bilingual paragraph 2

From components/sections/About.test.tsx (Wave 0 RED harness):
- Mocks `next-intl` returning `paragraphs.1` / `paragraphs.2` via the `about.paragraphs.X` key pattern
- Mocks `next/image` as a string stub
- Mocks `gsap` + `gsap/ScrollTrigger`
- Assertion: `screen.getByText(/First paragraph/)` and `screen.getByText(/Second paragraph/)` exist after render
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement About component</name>
  <files>components/sections/About.tsx</files>
  <behavior>
    - About renders an inner `<div ref={aboutRef}>` (parent `<section id="about">` is provided by page.tsx)
    - Layout: grid md:grid-cols-3 — photo md:col-span-1, bio md:col-span-2
    - Photo: next/image 400x500, lazy, blur placeholder, rounded-lg
    - Bio: title (h2) + 2 paragraphs from about.paragraphs.1 and about.paragraphs.2
    - Animation: useGSAP scope; gsap.matchMedia full-motion branch creates a timeline with scrollTrigger { trigger: aboutRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }. Photo from x:-40 opacity:0; paragraphs stagger from y:30 opacity:0 (stagger 0.15s)
    - Reduced-motion branch: gsap.set photo + paragraphs to opacity:1 x:0 y:0
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-11, D-12)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pattern 2: ScrollTrigger inside the Lenis-bridged provider tree" (full code example)
    - .planning/phases/04-homepage-sections/04-00-assets-and-stubs-PLAN.md (about.paragraphs.{1,2} i18n keys + public/about-photo.jpg path)
    - components/sections/About.test.tsx (Wave 0 RED harness; implementation makes it GREEN)
    - components/providers/LenisProvider.tsx (confirms ScrollTrigger registered + bridged at module load — do NOT re-register)
    - messages/fr.json (verify about.paragraphs.{1,2} after Wave 0; consume via t('paragraphs.1') / t('paragraphs.2'))
  </read_first>
  <action>
    Create `components/sections/About.tsx` with this structure:

    ```tsx
    'use client';

    /**
     * components/sections/About.tsx — HOME-02 Phase 4.
     *
     * 2-column desktop / stacked mobile bio + portrait. ScrollTrigger reveal
     * via useGSAP({ scope }) + gsap.matchMedia reduced-motion gate.
     *
     * Pattern: 04-RESEARCH.md §"Pattern 2" — LenisProvider already registered
     * ScrollTrigger and bridged Lenis ↔ ScrollTrigger.update at module load.
     * This component just creates ScrollTrigger instances and trusts the bridge.
     *
     * The parent <section id="about"> wrapper is provided by app/[locale]/page.tsx.
     * This component renders an inner <div ref={aboutRef}> as the GSAP scope.
     *
     * Colors: Tailwind utilities backed by --color-* tokens. No literal colors.
     */

    import { useRef } from 'react';
    import Image from 'next/image';
    import { useTranslations } from 'next-intl';
    import { useGSAP } from '@gsap/react';
    import { gsap } from 'gsap';
    // NOTE: ScrollTrigger plugin registered by LenisProvider at module load.
    // No registerPlugin call here.

    // Minimal blur placeholder — base64 of a 10x10 OKLCh-toned warm gray.
    // Tailwind v4 + next/image accept any valid base64 JPEG. This will be
    // replaced when the user provides their real photo (see Wave 0 deferred).
    const BLUR_DATA_URL =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAECBP/EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAABs0E//8QAFRABAQAAAAAAAAAAAAAAAAAAEDH/2gAIAQEAAQUCH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8BH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8BH//EABUQAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEABj8CH//EABYQAAMAAAAAAAAAAAAAAAAAAAAxYf/aAAgBAQABPyEx/9oADAMBAAIAAwAAABAH/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFRABAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEAAT8QH//Z';

    export function About() {
      const aboutRef = useRef<HTMLDivElement>(null);
      const t = useTranslations('about');

      useGSAP(
        () => {
          const mm = gsap.matchMedia();
          mm.add(
            {
              isReduced: '(prefers-reduced-motion: reduce)',
              isFull: '(prefers-reduced-motion: no-preference)',
            },
            (ctx) => {
              if (!ctx.conditions?.isFull) {
                // Reduced-motion: set elements to final state, no ScrollTrigger.
                gsap.set('[data-about-photo], [data-about-paragraph]', {
                  opacity: 1,
                  x: 0,
                  y: 0,
                });
                return;
              }
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: aboutRef.current,
                  start: 'top 75%',
                  toggleActions: 'play none none reverse',
                },
              });
              tl.from('[data-about-photo]', {
                opacity: 0,
                x: -40,
                duration: 0.7,
                ease: 'power2.out',
              }).from(
                '[data-about-paragraph]',
                {
                  opacity: 0,
                  y: 30,
                  duration: 0.6,
                  stagger: 0.15,
                  ease: 'power2.out',
                },
                '-=0.4',
              );
            },
          );
        },
        { scope: aboutRef },
      );

      return (
        <div ref={aboutRef} className="w-full">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div data-about-photo className="md:col-span-1">
              <Image
                src="/about-photo.jpg"
                alt={t('title')}
                width={400}
                height={500}
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="h-auto w-full rounded-lg object-cover"
              />
            </div>
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-foreground text-3xl font-semibold">
                {t('title')}
              </h2>
              <p
                data-about-paragraph
                className="text-foreground text-lg leading-relaxed"
              >
                {t('paragraphs.1')}
              </p>
              <p
                data-about-paragraph
                className="text-foreground text-lg leading-relaxed"
              >
                {t('paragraphs.2')}
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```

    **CRITICAL CHECKS:**
    - Starts with `'use client'`
    - Imports: `useRef` (React), `Image` (next/image), `useTranslations` (next-intl), `useGSAP` (@gsap/react), `gsap` (gsap)
    - NO `import { ScrollTrigger } from 'gsap/ScrollTrigger'` (LenisProvider already registered it; useGSAP picks it up via the gsap global)
    - WAIT — re-read 04-RESEARCH §"Pattern 2": the code example DOES `import { ScrollTrigger } from 'gsap/ScrollTrigger'` but DOES NOT call `gsap.registerPlugin(ScrollTrigger)`. The import alone is harmless. Decision: omit the import entirely — the timeline.scrollTrigger config uses string-based plugin lookup, which works because LenisProvider registered the plugin at module load. Simpler. If TypeScript complains about missing type info, add `import 'gsap/ScrollTrigger';` (side-effect-only import to register types).
    - Actually verify TS support: `gsap.timeline({ scrollTrigger: { ... } })` requires the ScrollTrigger types to be merged into gsap's typedef. The side-effect import `import 'gsap/ScrollTrigger';` accomplishes this without adding a binding. Include this.
    - Module-level `gsap.matchMedia` available since LenisProvider imports gsap — no extra registration needed
    - `useGSAP({ scope: aboutRef })`
    - `gsap.matchMedia()` reduced-motion gate
    - ScrollTrigger config: `{ trigger: aboutRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }`
    - Photo from x:-40; bio paragraph stagger 0.15s from y:30
    - Reduced-motion branch: gsap.set to final state
    - All Tailwind utilities use `--color-*` tokens
    - No literal colors
    - Named export `About`
  </action>
  <verify>
    <automated>node -e "const c=require('fs').readFileSync('components/sections/About.tsx','utf8'); const required=[\"'use client'\",'useGSAP','matchMedia','useTranslations','useRef','next/image','data-about-photo','data-about-paragraph','scope: aboutRef',\"start: 'top 75%'\",'toggleActions','blurDataURL','width={400}','height={500}','export function About','x: -40','y: 30','paragraphs.1','paragraphs.2']; const missing=required.filter(r=>!c.includes(r)); if(missing.length){console.error('MISSING:',missing);process.exit(1)} const bad=c.match(/#[0-9a-fA-F]{3,6}|rgb\\(|hsl\\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} console.log('about-impl-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/About.tsx` exists; starts with `'use client'`
    - Contains `useGSAP({ scope: aboutRef`
    - Contains `gsap.matchMedia` reduced-motion gate
    - Contains `start: 'top 75%'` AND `toggleActions: 'play none none reverse'`
    - Contains `<Image` with `width={400}`, `height={500}`, `placeholder="blur"`, `blurDataURL`
    - Contains 2 `data-about-paragraph` elements rendering `t('paragraphs.1')` and `t('paragraphs.2')`
    - Contains 1 `data-about-photo` wrapper
    - Contains `x: -40` (photo slide-in) AND `y: 30` (paragraph stagger)
    - Contains NO `oklch(`, NO `#XXX`, NO `rgb(`, NO `hsl(` color literals (note: `data:image/jpeg;base64,` is allowed — that's the blur placeholder, not a color literal)
    - Named export `About` (not default)
    - `npm run lint` exit 0
    - `npx vitest run components/sections/About.test.tsx` exits 0 (Wave 0 RED test turns GREEN)
  </acceptance_criteria>
  <done>About component shipped with 2-col desktop / stacked mobile layout, lazy photo with blur placeholder, ScrollTrigger reveal under reduced-motion gate; Wave 0 test harness GREEN.</done>
</task>

<task type="auto">
  <name>Task 2: Expand About.test.tsx with full HOME-02 acceptance assertions</name>
  <files>components/sections/About.test.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-VALIDATION.md (per-task rows 04-02-01..04)
    - components/sections/About.tsx (just-created implementation)
    - components/sections/About.test.tsx (Wave 0 baseline)
  </read_first>
  <action>
    EXTEND the Wave 0 test harness with these additional cases:

    1. Renders title from `about.title` i18n key
    2. Renders both paragraphs (`about.paragraphs.1` and `about.paragraphs.2`) — already in Wave 0; verify still passes after extension
    3. Renders `next/image` with correct width/height/placeholder props (assert via the mocked `next/image` returning a stub that exposes its props)
    4. Photo and paragraphs have data-attributes (`data-about-photo`, `data-about-paragraph`)
    5. Reduced-motion path: when `gsap.matchMedia` reports reduced, `gsap.set` is called (use spy on the mocked gsap.set) — assert spy called with the data selectors

    Use the pattern from Footer.test.tsx for jest-dom / @testing-library/react.

    Run `npx vitest run components/sections/About.test.tsx` → exits 0.
  </action>
  <verify>
    <automated>npx vitest run components/sections/About.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/About.test.tsx` contains ≥ 3 describe blocks and ≥ 5 it() cases
    - Tests cover: i18n title + paragraphs, photo width/height/blur attrs, useGSAP scope, reduced-motion gap, data-attributes
    - `npx vitest run components/sections/About.test.tsx` exits 0
    - No watch-mode flag
  </acceptance_criteria>
  <done>About test suite exercises HOME-02 contract; all tests GREEN.</done>
</task>

</tasks>

<verification>
1. **Files exist:** `components/sections/About.tsx` + `components/sections/About.test.tsx`
2. **Lint gate:** `npm run lint` exit 0
3. **Type gate:** `npx tsc --noEmit` exit 0
4. **Test gate:** `npx vitest run components/sections/About.test.tsx` exit 0
5. **No-color-literal gate:** `grep -E "(?<!base64,)oklch\(|(?<!base64,)#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" components/sections/About.tsx` returns nothing (base64 blur exception OK)
</verification>

<success_criteria>
- [ ] About.tsx created with `'use client'`
- [ ] 2-col desktop, stacked mobile grid layout
- [ ] next/image with width=400 height=500 lazy blur placeholder
- [ ] 2 paragraphs from about.paragraphs.1 + about.paragraphs.2
- [ ] useGSAP({ scope: aboutRef }) + gsap.matchMedia
- [ ] ScrollTrigger start='top 75%' toggleActions='play none none reverse'
- [ ] Reduced-motion gap via gsap.set
- [ ] No color literals
- [ ] Wave 0 test harness expanded and GREEN
</success_criteria>

<output>
After completion, create `.planning/phases/04-homepage-sections/04-02-SUMMARY.md` documenting:
- About shipped (HOME-02)
- ScrollTrigger config (top 75%, play-none-none-reverse)
- Photo slide-in (x:-40) + paragraph stagger (y:30, 0.15s)
- Reduced-motion gap via gsap.set
- next/image lazy + blur placeholder
- Tests added
</output>