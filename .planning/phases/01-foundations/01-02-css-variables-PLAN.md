---
phase: 01-foundations
plan: 02
type: execute
wave: 2
depends_on:
  - 01-01
files_modified:
  - app/globals.css
autonomous: true
requirements:
  - ARCH-03
  - ARCH-04
gap_closure: false
must_haves:
  truths:
    - "`:root` block declares all 6 palette CSS variables in OKLCh inline literals (Terra & Sage defaults per D-06, D-09)"
    - "`@theme {}` block exposes Tailwind utilities via `var(--color-*)` references — NO hardcoded OKLCh literals inside `@theme` (Pitfall #2)"
    - "Global 400ms ease transition applied to `color, background-color, border-color` (ARCH-04)"
    - "Booting `npm run dev` and inspecting computed styles on `<html>` shows the 6 CSS vars resolved to OKLCh values"
    - "Tailwind utilities `bg-bg`, `text-text`, `text-accent`, `bg-surface`, `bg-secondary`, `text-text-muted` resolve via the CSS vars (verified at runtime by setting `:root { --color-bg: ... }` in DevTools and seeing utilities update)"
  artifacts:
    - path: "app/globals.css"
      provides: "CSS variable foundation + Tailwind v4 @theme block + global color transition"
      contains_all:
        - '@import "tailwindcss"'
        - ":root {"
        - "--color-bg: oklch("
        - "--color-surface: oklch("
        - "--color-text: oklch("
        - "--color-text-muted: oklch("
        - "--color-accent: oklch("
        - "--color-secondary: oklch("
        - "@theme {"
        - "--color-bg: var(--color-bg)"
        - "transition"
        - "400ms"
  key_links:
    - from: "Tailwind utilities (e.g., bg-bg, text-accent)"
      to: ":root CSS variables"
      via: "@theme { --color-*: var(--color-*) } indirection"
      pattern: "@theme\\s*\\{[^}]*--color-[a-z-]+:\\s*var\\(--color-"
    - from: "Future ThemeProvider script (Phase 2)"
      to: ":root CSS variables"
      via: "document.documentElement.style.setProperty('--color-*', ...) at runtime"
      pattern: "var\\(--color-(bg|surface|text|text-muted|accent|secondary)\\)"
---

<objective>
Author `app/globals.css` so that:
1. A `:root {}` block declares the 6 palette CSS variables with **Terra & Sage OKLCh inline literals** (D-06: Terra is the cold-load default; D-09: literals live in `:root`).
2. A `@theme {}` block exposes those variables to Tailwind v4 utility generation — **with every value being a `var(--color-*)` reference, never a hardcoded OKLCh literal** (Pitfall #2). This is the critical indirection that makes the palette switcher work: at runtime, the ThemeProvider (Phase 2) overwrites `:root` values via `setProperty`, and Tailwind utilities immediately repaint without rebuild.
3. A global transition rule applies `400ms ease` to `color`, `background-color`, and `border-color` so palette swaps animate smoothly across every element (ARCH-04).

Purpose: This file is the architectural pivot for the whole portfolio. Every later component reads `var(--color-*)` (via Tailwind utilities like `bg-bg`, `text-text`, `text-accent`) and depends on the indirection being correct. Getting this wrong means the palette switcher cannot work, and every downstream component must be rewritten.

Output: A `globals.css` ~30-40 lines that fully implements the CSS variable foundation. No other files touched.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundations/01-CONTEXT.md
@.planning/research/PITFALLS.md
@.planning/research/SUMMARY.md
@.planning/phases/01-foundations/01-01-SUMMARY.md
@app/globals.css

<interfaces>
<!-- Tailwind v4 @theme directive semantics — critical to get right -->
<!-- Source: research/STACK.md, Tailwind v4 docs, PITFALLS.md Pitfall #2 -->

Tailwind v4 reads theme tokens from `@theme {}` in CSS. Each token name `--color-foo` generates the Tailwind utility `bg-foo`, `text-foo`, `border-foo`, etc.

The critical pattern for runtime mutability:
- Declare the literal color value in `:root { --color-foo: oklch(...) }` (this is what the browser uses to paint).
- Reference the variable from `@theme { --color-foo: var(--color-foo) }` (this tells Tailwind to wire utilities to the var, NOT to bake the OKLCh value into the compiled CSS).

If you put a literal OKLCh into `@theme {}`, Tailwind compiles utilities like `.bg-bg { background-color: oklch(0.97 0.012 80) }` — the runtime CSS variable change has NO effect because the utility doesn't reference it.

Correct pattern:
```css
:root {
  --color-bg: oklch(0.97 0.012 80);
}
@theme {
  --color-bg: var(--color-bg);  /* THIS line is the indirection */
}
```

Wrong pattern (will break palette switching silently):
```css
@theme {
  --color-bg: oklch(0.97 0.012 80);  /* baked at build, not mutable at runtime */
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Author globals.css with `:root` literals + `@theme` indirection + global transition</name>
  <files>app/globals.css</files>
  <read_first>
    - app/globals.css (current state from scaffold — likely contains `@import "tailwindcss"` and maybe a default `@theme`; replace entirely)
    - .planning/phases/01-foundations/01-CONTEXT.md (D-06: Terra default; D-08: only 6 `--color-*` tokens this phase, no radius/font; D-09: OKLCh literals in `:root`)
    - .planning/research/PITFALLS.md §"Pitfall 2: Tailwind config hardcodes hex colors" (the `@theme` indirection rule — note PITFALLS shows the old v3 RGB-triplet pattern; OUR project uses Tailwind v4 with OKLCh, so the indirection pattern in CONTEXT.md D-09 supersedes)
    - .planning/research/SUMMARY.md §"Key Findings → Architecture Approach" (CSS variable foundation must be in place before any component uses them)
  </read_first>
  <action>
    Replace the entire contents of `app/globals.css` with EXACTLY the following CSS. Do not abbreviate, do not change OKLCh values, do not add comments beyond those shown — these specific values are the Terra & Sage palette per D-06:

    ```css
    @import "tailwindcss";

    /* ============================================================
       Palette CSS Variables — :root literals
       ------------------------------------------------------------
       These are the runtime-mutable tokens. The ThemeProvider
       (Phase 2) overwrites them via document.documentElement.style
       .setProperty(...) when the user changes palette. The default
       values below are the Terra & Sage preset (D-06).

       NEVER hardcode OKLCh literals anywhere else in the codebase.
       Always reference via var(--color-*) or Tailwind utilities
       backed by @theme below.
       ============================================================ */
    :root {
      --color-bg: oklch(0.97 0.012 80);
      --color-surface: oklch(0.94 0.018 75);
      --color-text: oklch(0.22 0.018 50);
      --color-text-muted: oklch(0.50 0.020 55);
      --color-accent: oklch(0.62 0.155 35);
      --color-secondary: oklch(0.55 0.075 145);
    }

    /* ============================================================
       Tailwind v4 @theme — utility wiring via var() indirection
       ------------------------------------------------------------
       CRITICAL: every value below MUST be `var(--color-*)`, never
       a hardcoded OKLCh literal. Tailwind v4 compiles utilities
       like bg-bg / text-accent / border-secondary to reference the
       variable directly — so changing :root at runtime updates
       every utility-styled element instantly without rebuild.

       Adding a literal here defeats the palette switcher silently
       (the utility bakes the color at build time).
       See PITFALLS.md Pitfall #2 + CONTEXT.md D-09.
       ============================================================ */
    @theme {
      --color-bg: var(--color-bg);
      --color-surface: var(--color-surface);
      --color-text: var(--color-text);
      --color-text-muted: var(--color-text-muted);
      --color-accent: var(--color-accent);
      --color-secondary: var(--color-secondary);
    }

    /* ============================================================
       Global palette swap transition (ARCH-04)
       ------------------------------------------------------------
       400ms ease cubic on color-related properties only, so palette
       swaps animate smoothly. Does NOT include transform/opacity/
       layout properties (those are animated by GSAP/motion per
       component, not globally).
       ============================================================ */
    * {
      transition:
        color 400ms ease,
        background-color 400ms ease,
        border-color 400ms ease;
    }
    ```

    Notes on the OKLCh values used (planner discretion per D-Claude-Discretion):
    - Terra background (`0.97 0.012 80`): very light warm cream, hue ~80° (yellow-orange), low chroma — soft and warm.
    - Terra surface (`0.94 0.018 75`): slightly darker cream for cards, same warm hue family.
    - Terra text (`0.22 0.018 50`): deep warm brown — passes 4.5:1 on the light bg.
    - Terra text-muted (`0.50 0.020 55`): mid-tone warm brown for secondary text.
    - Terra accent (`0.62 0.155 35`): warm terracotta orange — signature color, hue 35° (red-orange).
    - Terra secondary (`0.55 0.075 145`): sage green — complementary natural color, hue 145°.

    Phase 2's `validateFullMatrix` will formally verify the 7 WCAG pairs; these values are designed to pass but the proof comes in Phase 2. For Phase 1, the goal is the structural correctness (indirection + transition), not the pixel-perfect palette.

    Do NOT add:
    - `--radius` (D-08 — only color tokens this phase)
    - `--font-*` (D-08 — fonts deferred to Phase 3 / LAYOUT-01)
    - shadcn aliases like `--background`, `--primary` (plan 03 adds these after `shadcn init`)
    - Any `body { ... }` or `html { ... }` selector beyond the `*` transition
    - Any media query (reduced-motion CSS comes in Phase 6 polish)

    After writing, verify:
    1. `npm run lint` exits 0.
    2. `npm run dev` boots; open `http://localhost:3000` and use DevTools to inspect `<html>` computed styles — confirm all 6 `--color-*` vars are present with `oklch(...)` values.
    3. In DevTools console, run `getComputedStyle(document.documentElement).getPropertyValue('--color-accent')` — must return a non-empty string starting with `oklch(`.
    4. In DevTools, temporarily modify the `<head>` `<style>` element OR run `document.documentElement.style.setProperty('--color-bg', 'oklch(0.5 0.15 250)')` — the page background should change to blue. This proves the indirection works (Tailwind utilities reading the var live).
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; node -e "const c=require('fs').readFileSync('app/globals.css','utf8'); const checks=[/^@import \"tailwindcss\"/m,/:root\s*\{[\s\S]*--color-bg:\s*oklch\(/,/--color-surface:\s*oklch\(/,/--color-text:\s*oklch\(/,/--color-text-muted:\s*oklch\(/,/--color-accent:\s*oklch\(/,/--color-secondary:\s*oklch\(/,/@theme\s*\{[\s\S]*--color-bg:\s*var\(--color-bg\)/,/@theme[\s\S]*--color-surface:\s*var\(--color-surface\)/,/@theme[\s\S]*--color-text:\s*var\(--color-text\)/,/@theme[\s\S]*--color-text-muted:\s*var\(--color-text-muted\)/,/@theme[\s\S]*--color-accent:\s*var\(--color-accent\)/,/@theme[\s\S]*--color-secondary:\s*var\(--color-secondary\)/,/transition[\s\S]*color\s+400ms/,/background-color\s+400ms/,/border-color\s+400ms/]; for(let i=0;i&lt;checks.length;i++){if(!checks[i].test(c)){console.error('Failed regex',i,checks[i]);process.exit(1);}} const themeBlock=c.match(/@theme\s*\{([^}]*)\}/); if(!themeBlock){console.error('No @theme block');process.exit(2);} const themeBody=themeBlock[1]; const hardcodedOklch=themeBody.match(/--color-[a-z-]+:\s*oklch\(/g); if(hardcodedOklch){console.error('FORBIDDEN: hardcoded oklch() inside @theme:',hardcodedOklch);process.exit(3);}"</automated>
  </verify>
  <acceptance_criteria>
    - File `app/globals.css` exists
    - File `app/globals.css` first non-blank non-comment line is `@import "tailwindcss";`
    - File `app/globals.css` contains a `:root {` block
    - File `app/globals.css` `:root` block contains all 6 declarations matching pattern `--color-(bg|surface|text|text-muted|accent|secondary):\s*oklch\(`
    - File `app/globals.css` contains a `@theme {` block
    - File `app/globals.css` `@theme` block contains all 6 declarations matching pattern `--color-(bg|surface|text|text-muted|accent|secondary):\s*var\(--color-\1\)`
    - File `app/globals.css` `@theme` block contains ZERO occurrences of `oklch(` (verified by extracting the `@theme { ... }` body and grepping — Pitfall #2 mitigation)
    - File `app/globals.css` contains a transition rule matching the regex `transition[\s\S]*color\s+400ms` AND `background-color\s+400ms` AND `border-color\s+400ms`
    - Command `npm run lint` exits 0 with zero warnings
    - Command `npx tsc --noEmit` exits 0
    - Command `npm run format:check` exits 0 (CSS file is properly formatted)
    - When `npm run dev` is running, `curl -s http://localhost:3000` returns HTTP 200 and the response includes a `<link>` or inlined CSS referencing the compiled stylesheet
  </acceptance_criteria>
  <done>`app/globals.css` declares 6 Terra OKLCh variables in `:root`, wires Tailwind utilities via `var()` indirection in `@theme`, and applies a 400ms color transition globally. Pitfall #2 mitigation verified: NO hardcoded OKLCh literals appear inside `@theme`. The file is ready for plan 03 (shadcn aliasing) to append the shadcn token map.</done>
</task>

</tasks>

<verification>
1. The 6 palette CSS variables are declared in `:root` with OKLCh literal values (Terra & Sage defaults)
2. The `@theme {}` block exposes those 6 variables via `var(--color-*)` references — no hardcoded literals
3. A global `*` selector applies 400ms ease transitions on color/background-color/border-color
4. `npm run lint`, `npx tsc --noEmit`, `npm run format:check` all exit 0
5. `npm run dev` boots; DevTools computed styles on `<html>` show the 6 `--color-*` vars resolved
6. Runtime mutation test: setting `document.documentElement.style.setProperty('--color-bg', 'oklch(0.5 0.15 250)')` in console changes the visible background → proves the indirection chain works
</verification>

<success_criteria>
Tailwind utilities (`bg-bg`, `text-text`, `text-accent`, `bg-surface`, `bg-secondary`, `text-text-muted`) generated by Tailwind v4 read from the CSS variables, NOT from baked OKLCh values. The ThemeProvider in Phase 2 can change palettes by writing to `:root` style properties, and every Tailwind-utility-styled element will repaint automatically. The 400ms transition makes the swap feel smooth rather than abrupt. Pitfall #2 (Tailwind hardcoded colors) is structurally impossible because `@theme` only contains var references.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations/01-02-SUMMARY.md` documenting:
- The exact 6 OKLCh values authored (so Phase 2 has the canonical "Terra" preset values)
- Confirmation that the runtime mutation smoke test (changing --color-bg in DevTools) visibly updated the page background
- Any unexpected lint warnings or stylelint complaints (Tailwind v4 plugin may emit warnings about unknown @-rules in some setups — document and resolve)
- Note that shadcn aliases (--background, --primary, etc.) are intentionally NOT added — plan 03 handles them after `shadcn init`
</output>
