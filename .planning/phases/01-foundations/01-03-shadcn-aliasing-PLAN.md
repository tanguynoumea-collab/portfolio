---
phase: 01-foundations
plan: 03
type: execute
wave: 3
depends_on:
  - 01-02
files_modified:
  - app/globals.css
  - components.json
  - lib/utils.ts
  - components/ui/button.tsx
  - components/ui/card.tsx
  - components/ui/dialog.tsx
  - components/ui/slider.tsx
  - components/ui/switch.tsx
  - components/ui/popover.tsx
  - components/ui/tabs.tsx
  - package.json
autonomous: true
requirements:
  - ARCH-05
gap_closure: false
must_haves:
  truths:
    - "shadcn CLI initialized via `npx shadcn@latest init` with new-york style, OKLCh CSS vars, and Tailwind v4 detection"
    - "7 components installed: button, card, dialog, slider, switch, popover, tabs"
    - "`components.json` exists at repo root and uses alias `@/components`"
    - "`lib/utils.ts` exists with the `cn()` helper using `clsx + tailwind-merge`"
    - "Every shadcn token in `app/globals.css` is aliased to either `var(--color-*)` from the palette system OR (for `--destructive`/`--destructive-foreground`) a fixed OKLCh literal (D-12) OR (for `--border`/`--input`) a `color-mix()` expression (D-13)"
    - "ZERO shadcn token in `:root` shadcn block uses an HSL literal, RGB literal, or hardcoded hex — exhaustive aliasing (D-10)"
    - "Pitfall #5 mitigation verified: opening a shadcn Button or Card in a smoke test page shows it inherits the palette's accent/bg/text colors, NOT the shadcn default neutral"
    - "D-08 enforcement: `app/globals.css` contains ZERO `--radius` occurrences (color tokens only in Phase 1; shadcn-init's default --radius line is deleted during the merge)"
  artifacts:
    - path: "components.json"
      provides: "shadcn CLI configuration"
      contains_all:
        - '"style"'
        - '"tailwind"'
        - '"aliases"'
        - '@/components'
    - path: "lib/utils.ts"
      provides: "cn() helper combining clsx + tailwind-merge"
      contains_all:
        - "import { clsx"
        - "twMerge"
        - "export function cn"
    - path: "components/ui/button.tsx"
      provides: "shadcn Button component"
    - path: "components/ui/card.tsx"
      provides: "shadcn Card component"
    - path: "components/ui/dialog.tsx"
      provides: "shadcn Dialog component"
    - path: "components/ui/slider.tsx"
      provides: "shadcn Slider component"
    - path: "components/ui/switch.tsx"
      provides: "shadcn Switch component"
    - path: "components/ui/popover.tsx"
      provides: "shadcn Popover component"
    - path: "components/ui/tabs.tsx"
      provides: "shadcn Tabs component"
    - path: "app/globals.css"
      provides: "Palette CSS vars + Tailwind @theme + shadcn token aliasing block (D-10..D-13)"
      contains_all:
        - "--background: var(--color-bg)"
        - "--foreground: var(--color-text)"
        - "--card: var(--color-surface)"
        - "--card-foreground: var(--color-text)"
        - "--popover: var(--color-surface)"
        - "--popover-foreground: var(--color-text)"
        - "--primary: var(--color-accent)"
        - "--primary-foreground: var(--color-bg)"
        - "--secondary: var(--color-secondary)"
        - "--secondary-foreground: var(--color-text)"
        - "--muted: var(--color-surface)"
        - "--muted-foreground: var(--color-text-muted)"
        - "--accent: var(--color-surface)"
        - "--accent-foreground: var(--color-text)"
        - "--destructive: oklch(0.6 0.22 25)"
        - "--ring: var(--color-accent)"
        - "color-mix"
  key_links:
    - from: "shadcn components (Button, Card, etc.)"
      to: "palette CSS vars (--color-accent, --color-bg, --color-text, etc.)"
      via: "shadcn token aliasing in :root (--primary: var(--color-accent), etc.)"
      pattern: "--primary:\\s*var\\(--color-accent\\)"
    - from: "shadcn Button"
      to: "Terra accent color at runtime"
      via: "Button uses bg-primary class → primary points to --color-accent → resolves to Terra terracotta OKLCh"
      pattern: "bg-primary"
---

<objective>
Run `npx shadcn@latest init` to set up the shadcn CLI (detecting Tailwind v4 + React 19 automatically), install the 7 required components (button, card, dialog, slider, switch, popover, tabs), then perform the **exhaustive one-time aliasing pass** that redirects every shadcn token (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, and their `*-foreground` variants) to either `var(--color-*)` from the palette system OR — for `--destructive*` only — a fixed OKLCh literal (D-12), OR — for `--border`/`--input` — a `color-mix()` expression on the text-muted color with 30% opacity (D-13).

The result: every shadcn component (Button, Card, Dialog, Slider, Switch, Popover, Tabs) inherits the active palette through the `var()` chain. When Phase 2's ThemeProvider mutates `--color-accent` at runtime, the shadcn Button's `bg-primary` repaints automatically because `--primary` is aliased to `var(--color-accent)`. Pitfall #5 (shadcn defaults hardcoding colors) is structurally impossible.

Purpose: Without this aliasing pass, shadcn ships its default OKLCh palette (neutral grays) into `:root`, and components ignore the palette switcher entirely. The portfolio's signature feature collapses. The aliasing must happen ONCE, BEFORE any shadcn component is used by downstream phases.

Output: 7 component files in `components/ui/`, a `components.json` at repo root, a `lib/utils.ts` with `cn()`, and an updated `app/globals.css` with the full shadcn token aliasing block appended after the existing `@theme` block.
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
@.planning/research/STACK.md
@.planning/phases/01-foundations/01-02-SUMMARY.md
@app/globals.css

<interfaces>
<!-- Exact token map from CONTEXT.md D-10..D-13 — authoritative one-time mapping. -->
<!-- Executor pastes this verbatim into globals.css after running shadcn init. -->

| shadcn token              | Aliased to                                                          |
|---------------------------|---------------------------------------------------------------------|
| `--background`            | `var(--color-bg)`                                                   |
| `--foreground`            | `var(--color-text)`                                                 |
| `--card`                  | `var(--color-surface)`                                              |
| `--card-foreground`       | `var(--color-text)`                                                 |
| `--popover`               | `var(--color-surface)`                                              |
| `--popover-foreground`    | `var(--color-text)`                                                 |
| `--primary`               | `var(--color-accent)`                                               |
| `--primary-foreground`    | `var(--color-bg)`                                                   |
| `--secondary`             | `var(--color-secondary)`                                            |
| `--secondary-foreground`  | `var(--color-text)`                                                 |
| `--muted`                 | `var(--color-surface)`                                              |
| `--muted-foreground`      | `var(--color-text-muted)`                                           |
| `--accent`                | `var(--color-surface)`  (NOTE: shadcn --accent is hover surface, NOT portfolio's accent — see D-11) |
| `--accent-foreground`     | `var(--color-text)`                                                 |
| `--destructive`           | `oklch(0.6 0.22 25)`  (FIXED red — palette-independent, D-12)       |
| `--destructive-foreground`| `oklch(0.98 0.01 80)` (FIXED near-white — palette-independent)      |
| `--border`                | `color-mix(in oklch, var(--color-text-muted) 30%, transparent)`     |
| `--input`                 | `color-mix(in oklch, var(--color-text-muted) 30%, transparent)`     |
| `--ring`                  | `var(--color-accent)`                                               |

Rationale recap (from CONTEXT.md):
- D-11: shadcn `--primary` = portfolio `accent` because shadcn's "primary" semantically maps to the portfolio's "signature color" (CTAs, focus). shadcn's `--accent` is a discrete hover surface, so it gets `--color-surface`.
- D-12: `--destructive` is FIXED — affordance "red = danger" must survive any palette swap. Vaporwave must not turn error states pink.
- D-13: `--border`/`--input` via `color-mix` — subtle, palette-aware, readable on any palette.
- D-13: `--ring` = accent (focus stays signature-coded and WCAG-compliant per Pitfall #9 fix).
</interfaces>

<shadcn_components_to_install>
The 7 components from ARCH-05 (PROJECT.md "shadcn/ui initialisé via `npx shadcn@latest init`, et les 7 composants `button`, `card`, `dialog`, `slider`, `switch`, `popover`, `tabs` sont installés"):

```
npx shadcn@latest add button card dialog slider switch popover tabs
```

This single command also installs (as transitive deps): @radix-ui/react-dialog, @radix-ui/react-slider, @radix-ui/react-switch, @radix-ui/react-popover, @radix-ui/react-tabs, class-variance-authority, clsx, tailwind-merge, tw-animate-css, lucide-react.
</shadcn_components_to_install>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Run shadcn init + add 7 components</name>
  <files>components.json, lib/utils.ts, components/ui/button.tsx, components/ui/card.tsx, components/ui/dialog.tsx, components/ui/slider.tsx, components/ui/switch.tsx, components/ui/popover.tsx, components/ui/tabs.tsx, app/globals.css, package.json</files>
  <read_first>
    - app/globals.css (current state — has palette `:root` + `@theme` from plan 02; shadcn will append its own tokens)
    - .planning/phases/01-foundations/01-CONTEXT.md (D-10..D-13 for the aliasing strategy)
    - .planning/research/STACK.md §"Step 3 — Initialize shadcn/ui" (init flags)
    - package.json (will gain new deps; do not break existing ones)
  </read_first>
  <action>
    1. **Run `npx shadcn@latest init` non-interactively** with these answers (shadcn 2.x supports CLI flags, but if interactive, the answers are):
       - **Style:** `new-york`
       - **Base color:** `neutral` (this only affects shadcn's default OKLCh literals — they'll be overwritten by the aliasing pass below)
       - **CSS variables:** **YES** (mandatory for the palette feature)
       - **Tailwind config / globals.css paths:** accept defaults (`app/globals.css`)
       - **Components alias:** `@/components`
       - **Utils alias:** `@/lib/utils`
       - **React Server Components:** YES

       If shadcn refuses interactive mode in CI, use the flag-driven form:
       ```
       npx shadcn@latest init --yes --defaults --style new-york --base-color neutral
       ```
       Or pipe answers in. Verify `components.json` is created at repo root with `"style": "new-york"`, alias `"@/components"`, alias `"@/lib/utils"`, and `"cssVariables": true`.

       The init will MUTATE `app/globals.css` by appending shadcn's default `:root` block with HSL or OKLCh literals (depending on shadcn version), plus `@layer base` blocks. **DO NOT panic** — Task 2 will rewrite shadcn's block to alias to the palette vars. For this task, just ensure init completes successfully.

    2. **Install the 7 components** in one command:
       ```
       npx shadcn@latest add button card dialog slider switch popover tabs
       ```
       This will:
       - Create `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/dialog.tsx`, `components/ui/slider.tsx`, `components/ui/switch.tsx`, `components/ui/popover.tsx`, `components/ui/tabs.tsx`
       - Add `@radix-ui/react-dialog`, `@radix-ui/react-slider`, `@radix-ui/react-switch`, `@radix-ui/react-popover`, `@radix-ui/react-tabs`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react` to `package.json` dependencies
       - Create `lib/utils.ts` if not already created by init, containing the `cn()` helper

       If any component fails to install (peer dep conflicts, etc.), resolve before continuing. Do not skip components.

    3. **Verify `lib/utils.ts` contents** — it must export `cn()`. If the scaffolder placed `cn()` elsewhere or used a different import, normalize to this exact content:
       ```ts
       import { clsx, type ClassValue } from 'clsx';
       import { twMerge } from 'tailwind-merge';

       export function cn(...inputs: ClassValue[]): string {
         return twMerge(clsx(inputs));
       }
       ```
       Note: shadcn's default `cn()` uses `ClassValue[]` from clsx — preserve that signature exactly. The function returns `string` (twMerge always returns a string).

    4. **Verify components are typed and import correctly** by running:
       ```
       npx tsc --noEmit
       ```
       This must exit 0. If shadcn's components use `forwardRef` (older style) or `ref` as prop (React 19 / shadcn 2.x style), do NOT modify them — shadcn 2.x supports both patterns. Just confirm they compile.

    5. **Verify lint** with `npm run lint`. Some shadcn components may emit React-specific lint warnings (e.g., unused `displayName`) — if so, those are pre-existing patterns in shadcn output and acceptable. Document any warnings in the SUMMARY.

    Do NOT yet touch the shadcn-generated `:root` block in `globals.css` — Task 2 does that as a single focused edit.
  </action>
  <verify>
    <automated>npx tsc --noEmit &amp;&amp; node -e "const fs=require('fs'); const files=['components.json','lib/utils.ts','components/ui/button.tsx','components/ui/card.tsx','components/ui/dialog.tsx','components/ui/slider.tsx','components/ui/switch.tsx','components/ui/popover.tsx','components/ui/tabs.tsx']; for(const f of files){if(!fs.existsSync(f)){console.error('Missing:',f);process.exit(1);}} const cj=JSON.parse(fs.readFileSync('components.json','utf8')); if(!cj.aliases||cj.aliases.components!=='@/components'){console.error('bad components alias',cj.aliases);process.exit(2);} const utils=fs.readFileSync('lib/utils.ts','utf8'); if(!utils.includes('twMerge')||!utils.includes('export function cn')){console.error('lib/utils.ts cn helper missing');process.exit(3);} const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); const reqDeps=['clsx','tailwind-merge','class-variance-authority','lucide-react','tw-animate-css']; for(const d of reqDeps){if(!pkg.dependencies[d]){console.error('Missing dep:',d);process.exit(4);}}"</automated>
  </verify>
  <acceptance_criteria>
    - File `components.json` exists at repo root
    - File `components.json` contains `"style": "new-york"` (case-sensitive)
    - File `components.json` contains `"@/components"` (aliases.components)
    - File `components.json` contains `"@/lib/utils"` (aliases.utils)
    - File `components.json` contains `"cssVariables": true` (or equivalent — confirms CSS var mode)
    - File `lib/utils.ts` exists
    - File `lib/utils.ts` contains `import { clsx` AND `twMerge` AND `export function cn`
    - File `components/ui/button.tsx` exists
    - File `components/ui/card.tsx` exists
    - File `components/ui/dialog.tsx` exists
    - File `components/ui/slider.tsx` exists
    - File `components/ui/switch.tsx` exists
    - File `components/ui/popover.tsx` exists
    - File `components/ui/tabs.tsx` exists
    - File `package.json` dependencies includes all of: `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tw-animate-css`
    - File `package.json` dependencies includes Radix primitives for installed components (at minimum `@radix-ui/react-dialog`, `@radix-ui/react-slider`, `@radix-ui/react-switch`, `@radix-ui/react-popover`, `@radix-ui/react-tabs`)
    - Command `npx tsc --noEmit` exits 0
    - Command `npm run lint` exits 0 (warnings from shadcn-generated files are acceptable if documented in SUMMARY)
  </acceptance_criteria>
  <done>shadcn 2.x is initialized in Tailwind v4 + React 19 mode. The 7 required components compile and exist in `components/ui/`. `lib/utils.ts` exports `cn()`. `components.json` is configured with the correct aliases. The shadcn-generated `:root` block in `globals.css` is in its initial post-init state (about to be rewritten in Task 2).</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Exhaustive shadcn token aliasing pass — rewrite shadcn `:root` block in globals.css</name>
  <files>app/globals.css</files>
  <read_first>
    - app/globals.css (current state — has palette `:root` + `@theme` + shadcn's appended `:root` block with default neutral OKLCh values; need to replace shadcn's block while preserving palette block above)
    - .planning/phases/01-foundations/01-CONTEXT.md (D-10: exhaustive aliasing; D-11: --primary → accent / --accent → surface clash resolution; D-12: --destructive fixed; D-13: color-mix borders + --ring → accent)
    - .planning/research/PITFALLS.md §"Pitfall 9: shadcn/ui components hardcode color tokens" (Option A — adopt shadcn names as aliases)
  </read_first>
  <action>
    The `app/globals.css` file at this point looks roughly like this (the exact shadcn-generated portion depends on shadcn 2.x version; the palette block from plan 02 is untouched at the top):

    ```css
    @import "tailwindcss";

    :root {
      --color-bg: oklch(...);
      --color-surface: oklch(...);
      --color-text: oklch(...);
      --color-text-muted: oklch(...);
      --color-accent: oklch(...);
      --color-secondary: oklch(...);
    }

    @theme {
      --color-bg: var(--color-bg);
      ... (6 indirection lines)
    }

    * { transition: color 400ms ease, ... }

    /* ──────────── SHADCN-GENERATED BLOCK STARTS HERE ──────────── */
    @import "tw-animate-css";  /* may appear here or elsewhere */

    :root {
      --background: oklch(1 0 0);       /* shadcn neutral defaults — to be replaced */
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      ... (about 20 shadcn tokens)
    }

    .dark {
      --background: oklch(0.145 0 0);   /* shadcn dark mode block */
      ...
    }

    @theme inline {
      --color-background: var(--background);
      --color-foreground: var(--foreground);
      ... (shadcn's own @theme inline block — preserve this, it wires shadcn's tokens to Tailwind utilities)
    }

    @layer base { ... }  /* shadcn's @layer base resets — preserve */
    ```

    Your job:

    1. **Locate the shadcn-generated `:root` block** (the second `:root {}` in the file, after the palette block from plan 02). It will contain entries like `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-1..5`, `--sidebar*`, `--radius`.

    2. **Replace the entire shadcn `:root` block contents** with the exact aliased values below. Preserve the `:root {` opening and `}` closing brace.

       Use this EXACT replacement block (drop in verbatim — these come from CONTEXT.md D-10..D-13 token map):

       ```css
       :root {
         /* shadcn token aliases — every value points to palette var(--color-*) */
         /* See .planning/phases/01-foundations/01-CONTEXT.md D-10..D-13 */
         --background: var(--color-bg);
         --foreground: var(--color-text);

         --card: var(--color-surface);
         --card-foreground: var(--color-text);

         --popover: var(--color-surface);
         --popover-foreground: var(--color-text);

         /* D-11: shadcn --primary maps to portfolio accent (CTAs, focus ring) */
         --primary: var(--color-accent);
         --primary-foreground: var(--color-bg);

         --secondary: var(--color-secondary);
         --secondary-foreground: var(--color-text);

         --muted: var(--color-surface);
         --muted-foreground: var(--color-text-muted);

         /* D-11: shadcn --accent is a HOVER SURFACE (NOT portfolio's accent) */
         --accent: var(--color-surface);
         --accent-foreground: var(--color-text);

         /* D-12: --destructive is FIXED — palette-independent affordance */
         --destructive: oklch(0.6 0.22 25);
         --destructive-foreground: oklch(0.98 0.01 80);

         /* D-13: borders/inputs via color-mix on text-muted at 30% */
         --border: color-mix(in oklch, var(--color-text-muted) 30%, transparent);
         --input: color-mix(in oklch, var(--color-text-muted) 30%, transparent);

         /* D-13: focus ring uses portfolio accent (WCAG-friendly) */
         --ring: var(--color-accent);

         /* D-08: NO --radius or non-color tokens in this :root block. shadcn's default rounded-* utilities use Tailwind v4's built-in radius scale; Phase 1 does NOT need CSS variable indirection for radius. */
       }
       ```

    3. **Remove the `.dark { ... }` block entirely** if shadcn-init created one. Reason: the portfolio uses the palette system, NOT a dark/light toggle (REQUIREMENTS.md "Out of Scope: Dark mode binaire"). Vaporwave palette covers dark needs.

       If `.dark` block contains chart colors or sidebar colors not present elsewhere, that's fine — those are unused in this portfolio and can be deleted.

    4. **Remove `--chart-1` through `--chart-5` and `--sidebar*` tokens** from the `:root` block. They are not used by any of the 7 installed components (button, card, dialog, slider, switch, popover, tabs) and add noise. If shadcn put them there, delete them.

    5. **Preserve shadcn's `@theme inline { ... }` block** if it exists — that wires shadcn's tokens (`--color-background`, `--color-foreground`, etc.) to Tailwind utility generation (`bg-background`, `text-foreground`). Without this block, shadcn components' Tailwind utilities won't compile. Do NOT delete it. If shadcn used `@theme inline` referencing `--background` etc., that chain now correctly resolves to `var(--color-bg)` via the aliasing above.

    6. **Preserve any `@layer base { ... }` block** shadcn added — typically contains `* { @apply border-border outline-ring/50; }` and `body { @apply bg-background text-foreground; }`. These reference the aliased tokens, so they now correctly inherit the palette.

    7. **Verify there is ONLY ONE `:root { ... }` block** in the final file. The palette block from plan 02 and the shadcn block must be MERGED into a single `:root { }`. To do this:
       - Keep the palette block from plan 02 (6 `--color-*` declarations) at the top of the merged `:root`.
       - Append the shadcn aliases below them, inside the SAME `:root { }` block.

       Final structure should be:
       ```css
       @import "tailwindcss";
       @import "tw-animate-css";  /* if shadcn added it */

       :root {
         /* Palette CSS Variables (plan 02) */
         --color-bg: oklch(0.97 0.012 80);
         --color-surface: oklch(0.94 0.018 75);
         --color-text: oklch(0.22 0.018 50);
         --color-text-muted: oklch(0.50 0.020 55);
         --color-accent: oklch(0.62 0.155 35);
         --color-secondary: oklch(0.55 0.075 145);

         /* shadcn token aliases (plan 03) */
         --background: var(--color-bg);
         --foreground: var(--color-text);
         /* ... full aliasing block from step 2 — NOTE: no --radius per D-08 ... */
       }

       @theme {
         /* Tailwind v4 utility wiring for palette tokens (plan 02) */
         --color-bg: var(--color-bg);
         --color-surface: var(--color-surface);
         --color-text: var(--color-text);
         --color-text-muted: var(--color-text-muted);
         --color-accent: var(--color-accent);
         --color-secondary: var(--color-secondary);
       }

       @theme inline {
         /* Shadcn's own @theme inline — preserve as-is */
         --color-background: var(--background);
         --color-foreground: var(--foreground);
         /* ...etc */
       }

       @layer base {
         /* Shadcn's @layer base — preserve as-is */
         * { @apply border-border outline-ring/50; }
         body { @apply bg-background text-foreground; }
       }

       * {
         transition: color 400ms ease, background-color 400ms ease, border-color 400ms ease;
       }
       ```

    8. **Verify lint**: `npm run lint` exits 0.

    9. **Verify format**: `npm run format:check` exits 0 (or run `npm run format` to fix).

    10. **Verify boot**: `npm run dev` boots; navigate to `http://localhost:3000`. The default Next.js placeholder page may now render with palette-aware colors (since the body uses `bg-background text-foreground` via shadcn's `@layer base`, and those resolve to `var(--color-bg)` / `var(--color-text)` via the aliasing). The page background should be the Terra cream color, text should be the Terra deep brown.

    11. **Pitfall #5 smoke test (manual visual check, not automated)**: Temporarily add to `app/page.tsx` a button: `<button className="bg-primary text-primary-foreground px-4 py-2 rounded">Test</button>`. The button must appear with the Terra accent (terracotta) background and the Terra bg (cream) foreground — NOT shadcn's default neutral. After verifying, remove the test button.

    12. **CRITICAL grep checks** — verify (the automated verify command does these):
        - **D-08 (no --radius):** the file must contain ZERO occurrences of `--radius`. Per D-08, Phase 1 ships color tokens ONLY. shadcn-init typically writes `--radius: 0.5rem` into its default `:root` block; you MUST delete that line during the merge. shadcn's default `rounded-*` utilities will use Tailwind v4's built-in radius scale (no CSS variable indirection needed for Phase 1). The verify script exits with code 9 if `--radius` is found.
        - **No hardcoded color literals** in the shadcn aliasing block (other than `--destructive*` which are intentionally fixed per D-12):
        - In the merged `:root` block, between the line `/* shadcn token aliases */` and the closing `}`, there must be exactly TWO `oklch(` occurrences (both for `--destructive` and `--destructive-foreground`).
        - All other shadcn tokens (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, and their `-foreground` variants, plus `--ring`) must be `var(--color-*)` references.
        - `--border` and `--input` must contain `color-mix(in oklch`.
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; npm run format:check &amp;&amp; npx tsc --noEmit &amp;&amp; node -e "const c=require('fs').readFileSync('app/globals.css','utf8'); const required=[/--background:\s*var\(--color-bg\)/,/--foreground:\s*var\(--color-text\)/,/--card:\s*var\(--color-surface\)/,/--card-foreground:\s*var\(--color-text\)/,/--popover:\s*var\(--color-surface\)/,/--popover-foreground:\s*var\(--color-text\)/,/--primary:\s*var\(--color-accent\)/,/--primary-foreground:\s*var\(--color-bg\)/,/--secondary:\s*var\(--color-secondary\)/,/--secondary-foreground:\s*var\(--color-text\)/,/--muted:\s*var\(--color-surface\)/,/--muted-foreground:\s*var\(--color-text-muted\)/,/--accent:\s*var\(--color-surface\)/,/--accent-foreground:\s*var\(--color-text\)/,/--destructive:\s*oklch\(0\.6\s+0\.22\s+25\)/,/--border:\s*color-mix\(in oklch[^)]*--color-text-muted[^)]*30%/,/--input:\s*color-mix\(in oklch[^)]*--color-text-muted[^)]*30%/,/--ring:\s*var\(--color-accent\)/]; for(let i=0;i&lt;required.length;i++){if(!required[i].test(c)){console.error('MISSING alias pattern',i,required[i]);process.exit(1);}} if(/\.dark\s*\{/.test(c)){console.error('FORBIDDEN: .dark block must be removed (palette system replaces dark mode)');process.exit(2);} const rootMatches=c.match(/:root\s*\{/g); if(!rootMatches||rootMatches.length!==1){console.error('Expected exactly one :root block, found',rootMatches?rootMatches.length:0);process.exit(3);} if(/--radius/.test(c)){console.error('FAIL: --radius found in app/globals.css, violates D-08 (color tokens only in Phase 1)');process.exit(9);}"</automated>
  </verify>
  <acceptance_criteria>
    - File `app/globals.css` contains EXACTLY ONE `:root {` block (palette + shadcn aliases merged)
    - File `app/globals.css` does NOT contain any `.dark {` block (palette system replaces dark mode per REQUIREMENTS.md "Out of Scope")
    - File `app/globals.css` contains `--background: var(--color-bg)` (case-sensitive, whitespace-flexible regex `--background:\s*var\(--color-bg\)`)
    - File `app/globals.css` contains `--foreground: var(--color-text)`
    - File `app/globals.css` contains `--card: var(--color-surface)`
    - File `app/globals.css` contains `--card-foreground: var(--color-text)`
    - File `app/globals.css` contains `--popover: var(--color-surface)`
    - File `app/globals.css` contains `--popover-foreground: var(--color-text)`
    - File `app/globals.css` contains `--primary: var(--color-accent)` (D-11)
    - File `app/globals.css` contains `--primary-foreground: var(--color-bg)`
    - File `app/globals.css` contains `--secondary: var(--color-secondary)`
    - File `app/globals.css` contains `--secondary-foreground: var(--color-text)`
    - File `app/globals.css` contains `--muted: var(--color-surface)`
    - File `app/globals.css` contains `--muted-foreground: var(--color-text-muted)`
    - File `app/globals.css` contains `--accent: var(--color-surface)` (D-11 — shadcn `--accent` is hover surface, NOT portfolio's accent)
    - File `app/globals.css` contains `--accent-foreground: var(--color-text)`
    - File `app/globals.css` contains `--destructive: oklch(0.6 0.22 25)` (D-12 — fixed red)
    - File `app/globals.css` contains `--destructive-foreground: oklch(` (D-12 — fixed)
    - File `app/globals.css` contains `--border: color-mix(in oklch` AND that line contains `var(--color-text-muted)` AND `30%` (D-13)
    - File `app/globals.css` contains `--input: color-mix(in oklch` AND `var(--color-text-muted)` AND `30%` (D-13)
    - File `app/globals.css` contains `--ring: var(--color-accent)` (D-13)
    - File `app/globals.css` `:root` block does NOT contain `--radius` (D-08 enforcement — color tokens only in Phase 1; shadcn default rounded-* utilities use Tailwind v4 built-in radius scale)
    - Grep check: file content contains zero `--radius` occurrences (verified by automated regex test in verify block — exits 9 if violated)
    - Command `npm run lint` exits 0 with zero warnings
    - Command `npm run format:check` exits 0
    - Command `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>The exhaustive shadcn aliasing pass is complete. Every shadcn token in `:root` aliases to either a palette `var(--color-*)`, a fixed `oklch()` (destructive only — D-12), or a `color-mix()` (borders/inputs — D-13). When Phase 2's ThemeProvider mutates `--color-accent`, the shadcn `Button`, `Slider thumb`, focus rings, and any other component using `--primary` or `--ring` will repaint automatically. Pitfall #5 (shadcn token disconnect) is structurally impossible. The `.dark` block is removed (REQUIREMENTS.md out-of-scope).</done>
</task>

</tasks>

<verification>
1. `components.json` exists at repo root with `style: "new-york"`, aliases `@/components` and `@/lib/utils`
2. 7 component files exist in `components/ui/`: button, card, dialog, slider, switch, popover, tabs
3. `lib/utils.ts` exports `cn()` using `clsx + tailwind-merge`
4. `package.json` dependencies include shadcn's transitive deps: `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tw-animate-css`, and Radix primitives
5. `app/globals.css` `:root` block contains every shadcn token aliased per the D-10..D-13 table
6. `app/globals.css` contains NO `.dark` block (REQUIREMENTS.md out-of-scope)
7. `app/globals.css` contains exactly one `:root {` declaration (palette + shadcn merged)
8. `--destructive` and `--destructive-foreground` are the ONLY shadcn tokens with `oklch(` literals — every other is a `var()` or `color-mix()`
9. **D-08 enforcement**: `app/globals.css` contains ZERO occurrences of `--radius` (Phase 1 ships color tokens only; shadcn rounded-* utilities use Tailwind v4 built-in radius scale)
9. `npm run lint`, `npm run format:check`, `npx tsc --noEmit` all exit 0
10. Pitfall #5 mitigation: shadcn `<Button className="bg-primary">` inherits Terra accent (terracotta), not shadcn's default neutral
</verification>

<success_criteria>
The 7 shadcn components are installed and structurally palette-aware. When Phase 2's ThemeProvider writes `document.documentElement.style.setProperty('--color-accent', 'oklch(...)')` at runtime, every `bg-primary`, every focus `ring-ring`, every `bg-secondary` (slider track), every `bg-popover` element will repaint instantly without rebuild. The `--destructive` red survives palette swaps (Vaporwave will not turn errors pink). Borders are subtle and palette-aware via `color-mix`. The portfolio's signature palette switcher feature has its structural foundation in place.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations/01-03-SUMMARY.md` documenting:
- Exact shadcn version installed (`components.json` schema version + which shadcn CLI version was used)
- Whether `tw-animate-css` was auto-installed (it should be, per STACK.md research)
- The final structure of `app/globals.css` (line count, block order — palette `:root`, shadcn aliases inside same `:root`, `@theme`, `@theme inline`, `@layer base`, transition rule)
- Confirmation that `.dark` block was removed (and what was in it before removal, for the record)
- Whether the manual Pitfall #5 smoke test passed (test button with `bg-primary` showed Terra terracotta on cream)
- Any lint warnings emitted by shadcn-generated files (to inform whether future phases need to add ESLint overrides)
</output>
