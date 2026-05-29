---
phase: 04-homepage-sections
plan: 04
type: execute
wave: 1
depends_on: [00]
files_modified:
  - components/sections/Skills.tsx
  - components/sections/Skills.test.tsx
autonomous: true
requirements: [HOME-06]
requirements_addressed: [HOME-06]
gap_closure: false

must_haves:
  truths:
    - "Skills renders the title 'Compétences' / 'Skills' from skills.title i18n"
    - "Skills renders 3 group sub-sections — Tech / Design / BIM — each with a sub-heading from skills.groups.{tech,design,bim}.label"
    - "Each group renders a flex-wrap row of shadcn <Badge> components with skill names from skills.groups.{tech,design,bim}.items array"
    - "Each badge uses the variant matching its group: category-tech / category-design / category-bim"
    - "Animation: useGSAP({ scope: skillsRef }) creates a ScrollTrigger timeline (start: 'top 75%') that staggers badges per group (0.05s intra) and groups (0.15s cascade)"
    - "Under reduced-motion: badges render at final state via gsap.set — no animation"
    - "No literal colors anywhere — badge category colors flow through Wave 0's fixed --color-category-* tokens"
  artifacts:
    - path: "components/sections/Skills.tsx"
      provides: "'use client' Skills section component — 3 groups × shadcn Badge stagger"
      contains: "useGSAP"
    - path: "components/sections/Skills.test.tsx"
      provides: "Vitest spec turned GREEN from Wave 0 RED harness"
  key_links:
    - from: "components/sections/Skills.tsx"
      to: "@gsap/react useGSAP + gsap/ScrollTrigger"
      via: "useGSAP({ scope: skillsRef }) with ScrollTrigger timeline staggering badges"
      pattern: "useGSAP\\(.*scope: skillsRef"
    - from: "components/sections/Skills.tsx"
      to: "@/components/ui/badge"
      via: "Badge variant={category-tech|category-design|category-bim}"
      pattern: "from '@/components/ui/badge'"
    - from: "components/sections/Skills.tsx"
      to: "next-intl useTranslations('skills')"
      via: "t.raw('groups.tech.items') etc — arrays read via t.raw"
      pattern: "useTranslations\\('skills'\\)"
---

<objective>
Implement the Skills section per HOME-06: 3 domain groups (Tech / Design / BIM) each presenting a flex-wrap row of shadcn `<Badge>` components with the category-coded variant from Wave 0. ScrollTrigger reveal staggers badges (0.05s intra-group) and cascades between groups (0.15s offset). Reduced-motion via `gsap.matchMedia()` skips animation and snaps to final state.

Purpose: Surface technical breadth without falling into the awkward "proficiency bars" anti-pattern (deferred). Color-coding via fixed category tokens demonstrates the design-system discipline that motivates the whole portfolio — even category tokens stay constant when the user swaps palettes (Phase 1 D-12 fixed-token precedent for `--destructive`).

Output:
- `components/sections/Skills.tsx` — `'use client'` component, exports `Skills`
- `components/sections/Skills.test.tsx` — Wave 0 RED harness turns GREEN
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
@components/ui/badge.tsx
@components/sections/Skills.test.tsx
@messages/fr.json
@messages/en.json
@app/globals.css
@CLAUDE.md

<interfaces>
<!-- Key contracts the executor MUST honor. -->

From components/ui/badge.tsx (after Wave 0 — extended with 3 new variants):
```typescript
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        'category-tech':   'border-transparent bg-category-tech text-white hover:bg-category-tech/90',
        'category-design': 'border-transparent bg-category-design text-white hover:bg-category-design/90',
        'category-bim':    'border-transparent bg-category-bim text-white hover:bg-category-bim/90',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({ className, variant, ...props }: { ... }): JSX.Element;
```

From messages/fr.json + messages/en.json (after Wave 0 restructure):
- `skills.title` — "Compétences" / "Skills"
- `skills.groups.tech.label` — "Développement" / "Development"
- `skills.groups.tech.items` — array of 7 strings (TypeScript, React, Next.js, Node.js, Tailwind, GSAP, Three.js)
- `skills.groups.design.label` — "Design" / "Design"
- `skills.groups.design.items` — array of 7 strings (Figma, Photoshop, Illustrator, InDesign, Design System, Branding, Typography)
- `skills.groups.bim.label` — "Architecture & BIM" / "Architecture & BIM"
- `skills.groups.bim.items` — array of 7 strings (Revit, ArchiCAD, Rhino, Grasshopper, AutoCAD, Twinmotion, Lumion)

Read arrays via `t.raw('groups.tech.items')` — next-intl's documented escape hatch for non-string values. TypeScript narrow as `string[]`. From 04-RESEARCH.md §"Pitfall 4-J": prefer `.map()` over indexed access (noUncheckedIndexedAccess strict).

From gsap (LenisProvider already registered ScrollTrigger):
```typescript
import { gsap } from 'gsap';
import 'gsap/ScrollTrigger'; // side-effect import for typedef merge
// matchMedia + timeline pattern same as About — see Pattern 2 in RESEARCH.
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement Skills component</name>
  <files>components/sections/Skills.tsx</files>
  <behavior>
    - Skills renders an inner `<div ref={skillsRef}>` (parent <section id="skills"> from page.tsx)
    - Title (h2) from skills.title
    - 3 groups stacked vertically; each group: sub-heading (h3) from skills.groups.{key}.label + flex-wrap row of Badges from skills.groups.{key}.items
    - Each Badge gets variant `category-{tech|design|bim}` matching its group; data-skill-badge attribute on each badge for animation targeting
    - useGSAP scope; gsap.matchMedia full-motion branch: ScrollTrigger timeline (trigger: skillsRef.current, start: 'top 75%', toggleActions: 'play none none reverse') with per-group sub-timelines using `gsap.from('[data-skill-badge][data-group=tech]', { opacity:0, y:16, scale:0.9, stagger:0.05 })` etc. and group cascade of 0.15s.
    - Reduced-motion branch: gsap.set all badges to final state.
  </behavior>
  <read_first>
    - .planning/phases/04-homepage-sections/04-CONTEXT.md (D-17, D-18, D-19)
    - .planning/phases/04-homepage-sections/04-RESEARCH.md §"Pattern 2: ScrollTrigger inside the Lenis-bridged provider tree" + §"Pitfall 4-J" (skills i18n array access)
    - .planning/phases/04-homepage-sections/04-00-assets-and-stubs-PLAN.md (skills.groups restructure to {label, items} + 3 Badge variants + 3 fixed category tokens)
    - components/sections/Skills.test.tsx (Wave 0 RED harness)
    - components/ui/badge.tsx (Wave 0 with 3 category variants)
    - messages/fr.json (skills.groups.* with items arrays; verify schema)
    - app/globals.css (verify --color-category-* tokens exist after Wave 0)
  </read_first>
  <action>
    Create `components/sections/Skills.tsx`:

    ```tsx
    'use client';

    /**
     * components/sections/Skills.tsx — HOME-06 Phase 4.
     *
     * 3 domain groups (Tech / Design / BIM), each presenting a flex-wrap row
     * of shadcn <Badge> components colored via the fixed category-*
     * variants from Wave 0. GSAP ScrollTrigger staggers per badge inside each
     * group + cascades between groups; reduced-motion gates via matchMedia.
     *
     * Skill arrays sourced from skills.groups.{tech,design,bim}.items via
     * next-intl's t.raw() (RESEARCH Pitfall 4-J). The flex-wrap allows
     * unlimited skills per group without breaking the layout.
     *
     * The parent <section id="skills"> wrapper is provided by app/[locale]/page.tsx.
     */

    import { useRef } from 'react';
    import { useTranslations } from 'next-intl';
    import { useGSAP } from '@gsap/react';
    import { gsap } from 'gsap';
    import 'gsap/ScrollTrigger';
    import { Badge } from '@/components/ui/badge';

    type GroupKey = 'tech' | 'design' | 'bim';
    const GROUPS: ReadonlyArray<GroupKey> = ['tech', 'design', 'bim'] as const;

    function variantFor(group: GroupKey): 'category-tech' | 'category-design' | 'category-bim' {
      if (group === 'tech') return 'category-tech';
      if (group === 'design') return 'category-design';
      return 'category-bim';
    }

    export function Skills() {
      const skillsRef = useRef<HTMLDivElement>(null);
      const t = useTranslations('skills');

      // Read group items via t.raw — next-intl's escape hatch for non-string
      // values. The TypeScript narrowing happens at the call site.
      const getItems = (group: GroupKey): string[] => {
        const raw = t.raw(`groups.${group}.items`);
        return Array.isArray(raw) ? (raw as unknown as string[]) : [];
      };

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
                gsap.set('[data-skill-badge]', {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                });
                return;
              }
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: skillsRef.current,
                  start: 'top 75%',
                  toggleActions: 'play none none reverse',
                },
              });
              GROUPS.forEach((group, idx) => {
                tl.from(
                  `[data-skill-badge][data-group="${group}"]`,
                  {
                    opacity: 0,
                    y: 16,
                    scale: 0.9,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'power2.out',
                  },
                  idx * 0.15,
                );
              });
            },
          );
        },
        { scope: skillsRef },
      );

      return (
        <div ref={skillsRef} className="w-full">
          <div className="mx-auto max-w-5xl space-y-12">
            <h2 className="text-foreground text-3xl font-semibold">
              {t('title')}
            </h2>
            <div className="space-y-8">
              {GROUPS.map((group) => {
                const items = getItems(group);
                const label = t(`groups.${group}.label`);
                return (
                  <div key={group}>
                    <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                      {label}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <span
                          key={skill}
                          data-skill-badge
                          data-group={group}
                        >
                          <Badge variant={variantFor(group)}>{skill}</Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    ```

    **CRITICAL CHECKS:**
    - Starts with `'use client'`
    - Imports: `useRef` (React), `useTranslations` (next-intl), `useGSAP` (@gsap/react), `gsap` (gsap), side-effect import `gsap/ScrollTrigger`, `Badge` (from `@/components/ui/badge`)
    - `useGSAP({ scope: skillsRef })`
    - `gsap.matchMedia` reduced-motion gate
    - ScrollTrigger config: `{ trigger: skillsRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }`
    - Forward-iterates 3 groups with cascade `idx * 0.15` and intra-group stagger `0.05`
    - `gsap.from` targets `[data-skill-badge][data-group="${group}"]`
    - Reduced-motion: `gsap.set` to final state
    - 3 Badge variants applied via `variantFor()` mapping
    - Skills sourced via `t.raw('groups.tech.items')` (NOT `t('groups.tech.items')`)
    - Each badge wrapped in `<span data-skill-badge data-group={group}>` (Span hosts the data-attrs; Badge is the styled child)
    - No literal colors
    - Named export `Skills`
  </action>
  <verify>
    <automated>node -e "const c=require('fs').readFileSync('components/sections/Skills.tsx','utf8'); const required=[\"'use client'\",'useGSAP','matchMedia','useTranslations','scope: skillsRef',\"start: 'top 75%'\",'toggleActions','data-skill-badge','data-group','category-tech','category-design','category-bim','t.raw','Badge','flex-wrap','stagger: 0.05','export function Skills']; const missing=required.filter(r=>!c.includes(r)); if(missing.length){console.error('MISSING:',missing);process.exit(1)} const bad=c.match(/oklch\\(|#[0-9a-fA-F]{3,6}|rgb\\(|hsl\\(/g); if(bad){console.error('FORBIDDEN COLOR LITERAL:',bad);process.exit(1)} console.log('skills-impl-ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `components/sections/Skills.tsx` exists with `'use client'`
    - Contains `useGSAP({ scope: skillsRef`
    - Contains `gsap.matchMedia` reduced-motion gate
    - Contains `start: 'top 75%'` ScrollTrigger config
    - Contains `category-tech`, `category-design`, `category-bim` Badge variants (mapped via `variantFor`)
    - Contains `t.raw` for array reads
    - Contains intra-group stagger 0.05 AND group cascade 0.15 (`idx * 0.15`)
    - Contains `flex flex-wrap gap-2` for badge row
    - 3 groups iterated via `GROUPS.map`
    - No literal colors
    - Named export `Skills`
    - `npm run lint` exit 0
    - Wave 0's `Skills.test.tsx` turns GREEN
  </acceptance_criteria>
  <done>Skills component shipped with 3 groups × category-colored badges + ScrollTrigger stagger + reduced-motion gate; test harness GREEN.</done>
</task>

<task type="auto">
  <name>Task 2: Expand Skills.test.tsx with full HOME-06 acceptance assertions</name>
  <files>components/sections/Skills.test.tsx</files>
  <read_first>
    - .planning/phases/04-homepage-sections/04-VALIDATION.md (per-task rows 04-04-01..05)
    - components/sections/Skills.tsx (just-created implementation)
    - components/sections/Skills.test.tsx (Wave 0 RED harness — extend, do not replace)
  </read_first>
  <action>
    Extend the Wave 0 test with these additional cases:

    1. Renders title from `skills.title` i18n
    2. Renders 3 sub-headings (Tech / Design / BIM) from `skills.groups.*.label`
    3. Renders skill badges from each group's items array (mock t.raw returning small arrays)
    4. Badge variants match group (assert `data-variant` attribute on the mocked Badge stub)
    5. Reduced-motion path: gsap.set called instead of gsap.timeline (spy on the gsap mock)

    Verify all tests pass: `npx vitest run components/sections/Skills.test.tsx`.
  </action>
  <verify>
    <automated>npx vitest run components/sections/Skills.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - Test file contains ≥ 3 describe blocks and ≥ 5 it() cases
    - Tests cover: title, 3 group sub-headings, badges per group, variant matches group, reduced-motion gap
    - `npx vitest run components/sections/Skills.test.tsx` exits 0
  </acceptance_criteria>
  <done>Skills test suite exercises HOME-06 contract; GREEN.</done>
</task>

</tasks>

<verification>
1. **Files exist:** Skills.tsx + Skills.test.tsx
2. **Lint:** `npm run lint` exit 0
3. **Type:** `npx tsc --noEmit` exit 0
4. **Test:** `npx vitest run components/sections/Skills.test.tsx` exit 0
5. **No literal colors:** `grep -E "oklch\(|#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" components/sections/Skills.tsx` returns nothing
6. **Badge variant coverage:** `grep "category-tech\|category-design\|category-bim" components/sections/Skills.tsx` returns ≥ 3 matches
</verification>

<success_criteria>
- [ ] Skills.tsx with `'use client'`
- [ ] 3 groups × flex-wrap badge row
- [ ] Each group uses correct category-* Badge variant
- [ ] useGSAP scope + matchMedia + ScrollTrigger config
- [ ] 0.05 intra-group stagger + 0.15 group cascade
- [ ] Reduced-motion gap via gsap.set
- [ ] t.raw for array reads
- [ ] No color literals
- [ ] Test harness GREEN
</success_criteria>

<output>
After completion, create `.planning/phases/04-homepage-sections/04-04-SUMMARY.md` documenting:
- Skills shipped (HOME-06)
- 3 groups iterated via GROUPS.map
- Per-group ScrollTrigger sub-timeline with stagger 0.05 + cascade 0.15
- Reduced-motion gap
- next-intl t.raw for skill arrays
- Category-coded badge variants
- Tests added
</output>