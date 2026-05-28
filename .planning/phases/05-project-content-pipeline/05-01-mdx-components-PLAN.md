---
phase: 05-project-content-pipeline
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/mdx/Image.tsx
  - components/mdx/Image.test.tsx
  - components/mdx/CodeBlock.tsx
  - components/mdx/CodeBlock.test.tsx
  - components/mdx/Callout.tsx
  - components/mdx/Callout.test.tsx
  - mdx-components.tsx
  - mdx-components.test.tsx
autonomous: true
requirements: [CONTENT-03]

must_haves:
  truths:
    - "<Image> renders next/image and opens a shadcn Dialog zoom modal with data-lenis-prevent on DialogContent"
    - "<CodeBlock> reads data-language into a badge and copies raw source to clipboard with a Copy↔Check 1.5s swap"
    - "<Callout> renders 3 variants (info/warning/note) with Info/AlertTriangle/StickyNote icons and palette-aliased backgrounds, no hardcoded colors"
    - "mdx-components.tsx wires Image, Callout, pre:CodeBlock, an external/internal a override, and prose heading/paragraph overrides"
  artifacts:
    - path: "components/mdx/Image.tsx"
      provides: "Click-to-zoom MDX image (Dialog + data-lenis-prevent + motion hover)"
      contains: "data-lenis-prevent"
    - path: "components/mdx/CodeBlock.tsx"
      provides: "<pre> override with copy button + language badge"
      contains: "data-language"
    - path: "components/mdx/Callout.tsx"
      provides: "info/warning/note variants with lucide icons + palette-aliased bg"
      contains: "StickyNote"
    - path: "mdx-components.tsx"
      provides: "MDX component registry (Image/Callout/pre/a + prose overrides)"
      contains: "pre: CodeBlock"
  key_links:
    - from: "components/mdx/Image.tsx <DialogContent>"
      to: "LenisProvider prevent contract"
      via: "data-lenis-prevent attribute on DialogContent only"
      pattern: "DialogContent[\\s\\S]*data-lenis-prevent"
    - from: "components/mdx/CodeBlock.tsx onCopy"
      to: "navigator.clipboard.writeText"
      via: "preRef.current.textContent (raw source extraction)"
      pattern: "textContent"
    - from: "mdx-components.tsx a override"
      to: "external vs internal link routing"
      via: "http(s) → target=_blank rel; else next-intl Link"
      pattern: "noopener noreferrer"
---

<objective>
Wave 1 (parallel with 05-02) — ship the 3 custom MDX components required by CONTENT-03 plus the `mdx-components.tsx` registry that wires them.

This plan delivers: `components/mdx/Image.tsx` (client; shadcn Dialog click-to-zoom with `data-lenis-prevent` on DialogContent + motion hover cue gated by reduced-motion — D-09), `components/mdx/CodeBlock.tsx` (client; `<pre>` override consuming rehype-pretty-code's `data-language` for a badge + copy-to-clipboard via the Phase 4 Contact pattern — D-10), `components/mdx/Callout.tsx` (server; 3 variants info/warning/note with lucide icons + palette-aliased tinted backgrounds — D-11), and the extended `mdx-components.tsx` (wires Image/Callout/pre + external-vs-internal `a` override + prose h1/h2/h3/p/ul/ol/blockquote overrides — D-12 + Pitfall 5G). Each component ships with a Vitest test.

Purpose: These components are consumed by Wave 2's project page (gallery cells use `<Image>`; the MDX bodies authored in Wave 0 use `<Callout>` + fenced code blocks routed through `pre: CodeBlock`). The `mdx-components.tsx` registry is auto-discovered by `@next/mdx` at build time so the components inject into rendered MDX without an explicit `components={...}` prop.
Output: 3 atomic MDX component files + 3 tests + extended `mdx-components.tsx` + its test.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-project-content-pipeline/05-CONTEXT.md
@.planning/phases/05-project-content-pipeline/05-RESEARCH.md
@.planning/phases/05-project-content-pipeline/05-VALIDATION.md

<interfaces>
<!-- Contracts the executor needs. Use directly — no codebase exploration required. -->

Existing files to reuse (do NOT recreate):
- `@/components/ui/dialog.tsx` (shadcn Dialog: exports Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose; DialogContent accepts a `showCloseButton?: boolean` prop)
- `@/lib/utils` exports `cn(...args)` (clsx + tailwind-merge)
- `@/lib/hooks/usePrefersReducedMotion` exports `usePrefersReducedMotion(): boolean` (useSyncExternalStore-based, returns false on SSR)
- `@/i18n/navigation` exports `Link` (locale-aware next-intl Link)
- `motion/react` exports `motion`, `AnimatePresence`
- `lucide-react` exports `Copy`, `Check`, `Info`, `AlertTriangle`, `StickyNote` (NOTE: v1.16 — no Github/Linkedin brand icons, but these 5 are present)
- `next-intl` exports `useTranslations` (client). i18n namespace `projects.detail` is added in Wave 0 (05-00): keys `imageZoom`, `copy`, `copied`.

Clipboard pattern (Phase 4 Contact.tsx, reuse VERBATIM): `try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch {}` — silent fallback, no console call.

rehype-pretty-code 0.14.3 (already wired in next.config.ts) emits `data-language="<lang>"` on the `<pre>` element AND wraps it in `<figure data-rehype-pretty-code-figure>`. The `pre` override receives `props['data-language']`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Callout.tsx (3 variants, server component) + test</name>
  <files>components/mdx/Callout.tsx, components/mdx/Callout.test.tsx</files>
  <read_first>
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #6 (verbatim Callout.tsx)
    - .planning/phases/05-project-content-pipeline/05-CONTEXT.md D-11 + the variant→icon mapping in §"Specific Ideas"
    - components/sections/Skills.tsx OR any existing component using `cn` from @/lib/utils (import pattern)
  </read_first>
  <behavior>
    - Test 1: variant="info" renders an Info icon and a container with class 'bg-primary/5' and 'border-l-primary'
    - Test 2: variant="warning" renders an AlertTriangle icon and 'bg-destructive/5' and 'border-l-destructive'
    - Test 3: variant="note" (and default — no variant prop) renders a StickyNote icon and 'bg-muted' and 'border-l-border'
    - Test 4: children render inside the body; optional title prop renders as a bold line above children
    - Test 5: rendered className strings contain NO hex ('#') and NO 'rgb(' and NO 'oklch(' literals (palette-aliased only)
  </behavior>
  <action>
    Create `components/mdx/Callout.tsx` EXACTLY as RESEARCH.md Code Example #6. It is a Server Component (NO 'use client'). Named export `Callout`. Props: `{ variant?: 'info'|'warning'|'note'; title?: string; children: ReactNode }`, default variant `'note'`. Use a `VARIANT_CONFIG` record mapping each variant to `{ Icon, container, iconColor }`:
    - info: `{ Icon: Info, container: 'border-l-primary bg-primary/5', iconColor: 'text-primary' }`
    - warning: `{ Icon: AlertTriangle, container: 'border-l-destructive bg-destructive/5', iconColor: 'text-destructive' }` (the `--destructive` token is the FIXED OKLCh from Phase 1 D-12 — palette-independent warning signal; do NOT alias it to `--color-*`)
    - note: `{ Icon: StickyNote, container: 'border-l-border bg-muted', iconColor: 'text-muted-foreground' }`
    Root element: `<div role="note" className={cn('my-6 flex gap-3 rounded-lg border-l-4 p-4 text-foreground', container)}>`, then the `<Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)} aria-hidden="true" />`, then `<div className="flex-1">{title && <p className="mb-1 font-semibold">{title}</p>}{children}</div>`. Export `CalloutVariant` and `CalloutProps` types. NO `any`.

    Create `components/mdx/Callout.test.tsx`. Import `{ Callout }`, render with `@testing-library/react`, use native chai matchers. Assert per `<behavior>`. For icon detection, mock `lucide-react` to render identifiable stubs (e.g. each icon returns `<svg data-icon="Info" />`) — mirror the Phase 4 mock style — OR query the rendered SVG and assert via a data attribute you add to the mock. For Test 5, read `container.innerHTML` and assert it does NOT match `/#[0-9a-f]{3,6}/i`, `/rgb\(/`, `/oklch\(/`.
  </action>
  <verify>
    <automated>npm test components/mdx/Callout</automated>
  </verify>
  <acceptance_criteria>
    - components/mdx/Callout.tsx contains 'StickyNote' and 'AlertTriangle' and 'Info'
    - components/mdx/Callout.tsx contains 'bg-primary/5' and 'bg-destructive/5' and 'bg-muted'
    - components/mdx/Callout.tsx contains 'border-l-4'
    - components/mdx/Callout.tsx does NOT contain 'use client'
    - components/mdx/Callout.tsx does NOT contain 'oklch(' nor a '#' hex literal nor 'rgb('
    - `npm test components/mdx/Callout` exits 0
  </acceptance_criteria>
  <done>Callout server component renders 3 variants with correct lucide icons + palette-aliased backgrounds; title + children render; zero color literals; 5 tests green.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Image.tsx (Dialog zoom) + CodeBlock.tsx (pre override) + tests</name>
  <files>components/mdx/Image.tsx, components/mdx/Image.test.tsx, components/mdx/CodeBlock.tsx, components/mdx/CodeBlock.test.tsx</files>
  <read_first>
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #4 (verbatim Image.tsx) + #5 (verbatim CodeBlock.tsx)
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md Pitfall 5C (data-lenis-prevent on DialogContent) + Pitfall 5F (textContent raw extraction)
    - components/sections/Contact.tsx (the clipboard + AnimatePresence Copy↔Check + 1.5s revert pattern to reuse verbatim)
    - components/ui/dialog.tsx (Dialog/DialogTrigger/DialogContent/DialogTitle exports + showCloseButton prop)
    - .planning/phases/05-project-content-pipeline/05-CONTEXT.md D-09 + D-10
  </read_first>
  <behavior>
    - Image Test 1: renders a next/image with the given src/alt/width/height
    - Image Test 2: clicking the trigger opens a DialogContent that carries the `data-lenis-prevent` attribute (Pitfall 5C)
    - Image Test 3: when reduced-motion is true, the motion hover scale prop is undefined (no hover animation)
    - CodeBlock Test 1: with data-language="ts", renders a badge with text "ts"; with no data-language, badge reads "text"
    - CodeBlock Test 2: clicking copy calls navigator.clipboard.writeText with the pre's textContent
    - CodeBlock Test 3: after a successful copy the Check icon shows, and after advancing fake timers 1500ms it reverts to the Copy icon
  </behavior>
  <action>
    Create `components/mdx/Image.tsx` EXACTLY as RESEARCH.md Code Example #4. `'use client'`. Default export `MDXImage`. Props `{ src, alt, width, height, caption? }` (caption is the discretion prop — include it, 2 LOC). Owns Dialog open state via `useState`. Trigger is a `motion.button` with `aria-label={t('imageZoom')}` (t = `useTranslations('projects.detail')`), `whileHover={reducedMotion ? undefined : { scale: 1.02 }}` (reducedMotion = `usePrefersReducedMotion()`), wrapping a `NextImage` (`loading="lazy"`). `<DialogContent data-lenis-prevent showCloseButton={true} className="max-h-screen w-full max-w-7xl p-2">` containing `<DialogTitle className="sr-only">{alt}</DialogTitle>` + a full-size `NextImage` with `object-contain`. CRITICAL (Pitfall 5C): `data-lenis-prevent` goes ONLY on `<DialogContent>` — not the Trigger, not the Overlay.

    Create `components/mdx/CodeBlock.tsx` EXACTLY as RESEARCH.md Code Example #5. `'use client'`. Default export `CodeBlock`. Props type `HTMLAttributes<HTMLPreElement> & { 'data-language'?: string; 'data-theme'?: string }`. Use a `preRef` (useRef<HTMLPreElement>). `const language = typeof props['data-language'] === 'string' ? props['data-language'] : 'text';`. `onCopy` reads `preRef.current.textContent ?? ''` (Pitfall 5F — this gives the raw source 1:1 because Shiki only wraps tokens) and runs the Contact clipboard pattern (writeText + setCopied(true) + 1500ms revert + silent catch). Render `<pre ref={preRef} data-slot="code-block" className={cn('group relative my-6 overflow-x-auto rounded-lg bg-card p-4 text-sm', className)} {...props}>` with: a language badge `<span className="absolute top-2 left-3 z-10 text-xs font-mono text-muted-foreground select-none">{language}</span>`, a copy button (`absolute top-2 right-2 ... opacity-0 group-hover:opacity-100 focus-visible:opacity-100`, aria-label `copied ? t('copied') : t('copy')`) containing the `AnimatePresence mode="wait" initial={false}` Copy↔Check swap (Check uses `text-primary`), then `{children}`. NO `any` — the `data-language` access uses the typed prop.

    Create `components/mdx/Image.test.tsx` and `components/mdx/CodeBlock.test.tsx`. Mock `next-intl` `useTranslations` to return keys directly (e.g. `(k) => k`), mock `next/image` as a prop-dump stub (Phase 4 About.test.tsx style), mock `@/lib/hooks/usePrefersReducedMotion` to control the boolean, mock `@/components/ui/dialog` so DialogContent renders its props/children into the DOM (so the `data-lenis-prevent` attribute is queryable) and DialogTrigger renders a clickable element. For CodeBlock, mock `motion/react` (motion.span/AnimatePresence passthrough) + `lucide-react` (Copy/Check stubs with data attributes), set `pre.textContent` via children, mock `navigator.clipboard.writeText` (vi.fn resolving), and use `vi.useFakeTimers()` for the 1500ms revert. Use native chai matchers. Cover the `<behavior>` cases.
  </action>
  <verify>
    <automated>npm test components/mdx/Image components/mdx/CodeBlock</automated>
  </verify>
  <acceptance_criteria>
    - components/mdx/Image.tsx contains 'use client' and 'data-lenis-prevent' and 'usePrefersReducedMotion'
    - components/mdx/Image.tsx has data-lenis-prevent on DialogContent (grep multiline: 'DialogContent' followed by 'data-lenis-prevent')
    - components/mdx/CodeBlock.tsx contains 'use client' and "props['data-language']" and 'textContent'
    - components/mdx/CodeBlock.tsx contains 'navigator.clipboard.writeText' and 'setTimeout' and '1500'
    - components/mdx/CodeBlock.tsx does NOT contain 'oklch(' nor 'rgb(' nor a '#' hex literal
    - `npm test components/mdx/Image components/mdx/CodeBlock` exits 0
  </acceptance_criteria>
  <done>Image opens a Dialog zoom with data-lenis-prevent on DialogContent + reduced-motion-gated hover; CodeBlock extracts data-language into a badge and copies raw textContent with a 1.5s Copy↔Check swap; tests green.</done>
</task>

<task type="auto">
  <name>Task 3: Extend mdx-components.tsx (wire Image/Callout/pre/a + prose) + test</name>
  <files>mdx-components.tsx, mdx-components.test.tsx</files>
  <read_first>
    - mdx-components.tsx (current Phase 1 passthrough scaffold — extend, don't rewrite the signature)
    - .planning/phases/05-project-content-pipeline/05-RESEARCH.md §"Code Examples" #7 (verbatim mdx-components.tsx) + Pitfall 5G (prose heading overrides)
    - components/mdx/Image.tsx, components/mdx/CodeBlock.tsx, components/mdx/Callout.tsx (the components being wired — must exist from Tasks 1-2)
    - .planning/phases/05-project-content-pipeline/05-CONTEXT.md D-12
  </read_first>
  <action>
    Replace `mdx-components.tsx` with RESEARCH.md Code Example #7 verbatim. Keep the `useMDXComponents(components: MDXComponents): MDXComponents` signature (App Router convention — do NOT introduce MDXProvider; Pitfall 8). Return `{ ...components, Image: MDXImage, Callout, pre: CodeBlock, a: <external/internal override>, h1, h2, h3, p, ul, ol, blockquote }`:
    - `Image: MDXImage` (default import from `@/components/mdx/Image`)
    - `Callout` (named import from `@/components/mdx/Callout`)
    - `pre: CodeBlock` (default import from `@/components/mdx/CodeBlock`)
    - `a` override: if no href → plain `<a>`; if `href.startsWith('http://') || href.startsWith('https://')` → `<a target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">`; else → `<Link href={href as never} className="text-primary underline-offset-4 hover:underline">` (Link from `@/i18n/navigation`). Use `cn(...)` to merge className.
    - Prose overrides (Pitfall 5G) with the exact classes from Code Example #7: h1 `mt-12 mb-6 text-4xl font-semibold text-foreground`, h2 `mt-10 mb-4 text-2xl font-semibold text-foreground`, h3 `mt-8 mb-3 text-xl font-semibold text-foreground`, p `my-4 leading-relaxed text-foreground/90`, ul `my-4 list-disc space-y-2 pl-6 text-foreground/90`, ol `my-4 list-decimal space-y-2 pl-6 text-foreground/90`, blockquote `my-6 border-l-4 border-primary/40 pl-4 italic text-muted-foreground`. NO `any` (the `href as never` cast is the intentional next-intl typed-routing workaround already used in Phase 4).

    Create `mdx-components.test.tsx`. Mock the 3 components (`@/components/mdx/Image`, `@/components/mdx/CodeBlock`, `@/components/mdx/Callout`) and `@/i18n/navigation` Link as identifiable stubs. Call `useMDXComponents({})` and assert the returned object: (1) has `Image`, `Callout`, `pre` keys mapped to the (mocked) components; (2) the `a` function, when called with `{ href: 'https://x.com', children: 'x' }`, returns an element with `target="_blank"` and `rel="noopener noreferrer"`; (3) the `a` function with `{ href: '/projects/foo', children: 'y' }` returns the (mocked) next-intl Link, NOT a plain anchor. Render the returned `a` results via RTL or inspect the element props directly. Native chai matchers.
  </action>
  <verify>
    <automated>npm test mdx-components</automated>
  </verify>
  <acceptance_criteria>
    - mdx-components.tsx contains 'pre: CodeBlock' and 'Callout' and 'Image: MDXImage'
    - mdx-components.tsx contains 'noopener noreferrer' and "@/i18n/navigation"
    - mdx-components.tsx contains 'text-2xl' (h2 prose override present)
    - mdx-components.tsx does NOT contain 'MDXProvider'
    - mdx-components.test.tsx asserts both external (target=_blank) and internal (Link) a-override branches
    - `npm test mdx-components` exits 0
  </acceptance_criteria>
  <done>Registry wires all 3 components + pre override + external/internal a routing + prose overrides; external links get target/rel, internal links use next-intl Link; test green.</done>
</task>

</tasks>

<verification>
- `npm test components/mdx/` exits 0 (Image + CodeBlock + Callout)
- `npm test mdx-components` exits 0 (registry wiring)
- `npm run lint` clean (zero hardcoded colors, no `any`)
- Full suite (`npm test`) green with the new component tests added on top of the 222 baseline
</verification>

<success_criteria>
CONTENT-03 satisfied: the 3 custom MDX components (Image zoom modal, CodeBlock with rehype-pretty-code highlighting + copy, Callout info/warning/note) are usable from any MDX file via the `mdx-components.tsx` registry. data-lenis-prevent is correctly placed on DialogContent; warning Callout uses the fixed --destructive token; zero hardcoded colors.
</success_criteria>

<output>
After completion, create `.planning/phases/05-project-content-pipeline/05-01-SUMMARY.md`
</output>
