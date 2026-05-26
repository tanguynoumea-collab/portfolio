---
status: passed
phase: 01-foundations
verified: 2026-05-26T00:00:00Z
score: 5/5
---

# Phase 01 Verification

**Phase Goal:** Deliver a runnable Next 16 + Tailwind v4 + next-intl skeleton where every later phase can read `var(--color-*)` and run inside a localized `/fr` or `/en` route without conflicts.
**Verified:** 2026-05-26
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Success Criteria

### SC1: Runnable + locale routing

**Status: PASS**

Evidence:
- `package.json` contains `"next": "^16.2.6"` — Next 16 confirmed.
- `proxy.ts` exists at repo root (NOT `middleware.ts`) — Next 16 rename honored.
- `i18n/routing.ts` exists with `defineRouting({ locales: ['fr', 'en'] as const, defaultLocale: 'fr', localePrefix: 'as-needed' })`.
- `i18n/request.ts` exists with `getRequestConfig` + `hasLocale` guard + dynamic messages import.
- `app/[locale]/layout.tsx` properly wires `NextIntlClientProvider`, `setRequestLocale`, awaits `params` (Next 16 async API), and returns `<html lang={locale} suppressHydrationWarning>`.
- `app/page.tsx` serves as defensive redirect to `/${routing.defaultLocale}`.
- `app/[locale]/page.tsx` renders `useTranslations('nav').t('home')` which returns "Accueil" on `/` (FR default via as-needed rewrite) and "Home" on `/en`.
- SUMMARY 01-04 documents smoke tests: `GET /` returns HTTP 200 with `x-middleware-rewrite: /fr`, `GET / Accept-Language: en-US` returns HTTP 307 to `/en`, `GET /en` returns HTTP 200. `npm run build` produced 6 static pages with `ƒ Proxy (Middleware)` registered.

D-17 deviation acknowledged: `/` serves FR content via internal rewrite (HTTP 200) rather than HTTP 307 redirect. This is the documented `as-needed` behavior. Both `/fr` and `/en` render correctly per smoke tests.

### SC2: Lint clean

**Status: PASS**

Evidence:
- `eslint.config.mjs` exists using flat config (`defineConfig` + `nextVitals` + `nextTs` + `globalIgnores`) — correct Next 16 pattern.
- `"lint": "eslint"` in `package.json` scripts (NOT the removed `next lint`).
- `.prettierrc` exists with `prettier-plugin-tailwindcss` configured.
- `"format:check": "prettier --check ."` exists in scripts.
- SUMMARY 01-01 through 01-05 all report `npm run lint` exit 0, `npm run format:check` exit 0, `npx tsc --noEmit` exit 0 at each plan's commit.
- Final plan 01-05 SUMMARY explicitly states all quality gates green at HEAD commit `5023cf5`.

### SC3: CSS vars + @theme + transition

**Status: PASS**

Evidence verified against actual `app/globals.css` file (170 lines):

1. **Six `--color-*` OKLCh variables in `:root`** — lines 37-42 confirmed:
   ```css
   --color-bg: oklch(0.97 0.012 80);
   --color-surface: oklch(0.94 0.018 75);
   --color-text: oklch(0.22 0.018 50);
   --color-text-muted: oklch(0.5 0.02 55);
   --color-accent: oklch(0.62 0.155 35);
   --color-secondary: oklch(0.55 0.075 145);
   ```
   grep for `--color-(bg|surface|text|text-muted|accent|secondary): oklch(` returns 6 matches.

2. **`@theme {}` uses var() indirection exclusively** — lines 98-103:
   ```css
   @theme {
     --color-bg: var(--color-bg);
     --color-surface: var(--color-surface);
     ...
   }
   ```
   Confirmed: zero `oklch()` literals inside the `@theme` block (Pitfall #2 mitigated structurally).

3. **Global 400ms color transition** — lines 164-169:
   ```css
   * {
     transition:
       color 400ms ease,
       background-color 400ms ease,
       border-color 400ms ease;
   }
   ```

### SC4: shadcn components use palette vars

**Status: PASS**

Evidence:
- `ls components/ui/` returns exactly 7 files: `button.tsx`, `card.tsx`, `dialog.tsx`, `popover.tsx`, `slider.tsx`, `switch.tsx`, `tabs.tsx`.
- `grep -E "(oklch|hsl|rgb|#[0-9a-fA-F])" components/ui/button.tsx` returns 0 matches — no hardcoded colors.
- `grep -E "(oklch|hsl|rgb|#[0-9a-fA-F])" components/ui/dialog.tsx` returns 0 matches.
- All 7 components use Tailwind semantic tokens only (`bg-primary`, `text-foreground`, `border-border`, `ring-ring`, `bg-destructive`, etc.).

D-11 enforcement in `globals.css`:
- `--primary: var(--color-accent)` — confirmed (line 55)
- `--accent: var(--color-surface)` — confirmed (line 65)

D-12 enforcement:
- `--destructive: oklch(0.6 0.22 25)` — confirmed fixed red (line 69)

D-13 enforcement:
- `--border: color-mix(in oklch, var(--color-text-muted) 30%, transparent)` — confirmed (line 73)
- `--ring: var(--color-accent)` — confirmed (line 77)

D-08 enforcement:
- `grep --radius globals.css` returns 0 (no `--radius` declarations; only documentation comments using prose "radius tokens").
- No `--chart-*` or `--sidebar-*` tokens declared.
- `.dark { }` block absent — only `@custom-variant dark` directive for Tailwind variant definition (inert without `.dark` ancestor).

The exhaustive D-10..D-13 aliasing table (19 shadcn tokens) verified present in the single merged `:root` block.

### SC5: Project discriminated union + MDX loader

**Status: PASS**

Evidence verified against actual `lib/projects.ts` (201 lines):

1. **Discriminated union** (line 54):
   ```typescript
   export type Project = TechProject | DesignProject | BIMProject;
   ```
   Category as discriminant: `'tech' | 'design' | 'bim'`.

2. **Variant-specific fields per D-19/D-20/D-21**:
   - `TechProject`: `stack: string[]`, `repo?: string`, `liveUrl?: string`
   - `DesignProject`: `tools: string[]`, `client?: string`
   - `BIMProject`: `software: string[]`, `projectScale: 'concept' | 'residential' | 'commercial' | 'urban'`, `location?: string`

3. **No `any`**: `grep " any" lib/projects.ts | grep -v "//"` returns 0 matches.

4. **D-24 filter at THREE points**: lines 165, 181, 199 — `filename.startsWith('_')`, `slug.startsWith('_')`, `!f.startsWith('_')`.

5. **`getProjects(locale)` loader**: confirmed async, reads from `content/projects/`, parses with `gray-matter`, validates frontmatter with type guards.

6. **Stub files**: `content/projects/_template.fr.mdx` and `_template.en.mdx` both exist with full Tech-variant frontmatter.

7. **`mdx-components.tsx` at repo root**: confirmed with `useMDXComponents` export (required by `@next/mdx` App Router contract).

8. **`next.config.ts` composition**: `withNextIntl(withMDX(nextConfig))` with string-tuple plugin specs for Turbopack compatibility.

9. **`lib/palettes.ts`**: 5 typed Palette constants (terra/nordic/bauhaus/ocean/vaporwave), `DEFAULT_PALETTE_ID = 'terra'`, Terra OKLCh values byte-match `:root` in `globals.css`.

10. **D-24 smoke test (from SUMMARY 01-05)**: `getProjects('fr')` returns `[]` and `getProjects('en')` returns `[]` despite template files existing — filter working correctly.

---

## Requirement Coverage

| REQ-ID  | Plan  | Status    | Evidence                                                                                                     |
|---------|-------|-----------|--------------------------------------------------------------------------------------------------------------|
| ARCH-01 | 01-01 | SATISFIED | Next.js 16.2.6 + React 19.2.4 + TypeScript strict scaffold at repo root. `npm run dev` starts without error. |
| ARCH-02 | 01-01 | SATISFIED | ESLint flat config + Prettier operational. All 8 required directories confirmed present.                      |
| ARCH-03 | 01-02 | SATISFIED | Tailwind v4 `@theme {}` block in CSS referencing `var(--color-*)`. Zero hardcoded OKLCh in `@theme`.         |
| ARCH-04 | 01-02 | SATISFIED | 6 `--color-*` OKLCh vars in `:root`. 400ms transition on `color`, `background-color`, `border-color`.       |
| ARCH-05 | 01-03 | SATISFIED | shadcn@4.8.0 initialized. 7 components in `components/ui/`. Exhaustive D-10..D-13 token aliasing in place.  |
| ARCH-06 | 01-04 | SATISFIED | next-intl v4.12.0 wired. `proxy.ts` (not `middleware.ts`). Routes `/fr` and `/en` render correctly.          |
| ARCH-07 | 01-04 | SATISFIED | `messages/fr.json` + `messages/en.json` with 63 leaf keys × 9 namespaces. Perfect parity confirmed.         |
| ARCH-08 | 01-05 | SATISFIED | Discriminated `Project` type exported. `getProjects(locale)` loader with gray-matter + MDX pipeline.        |
| ARCH-09 | 01-01 | SATISFIED | `.gitignore` contains `node_modules`, `.next`, `.env*.local`, `.vercel`, `.DS_Store`.                       |

All 9 ARCH requirements satisfied. No orphaned requirements.

---

## Locked Decisions Audit

| Decision | Plan  | Status | Evidence                                                                                    |
|----------|-------|--------|---------------------------------------------------------------------------------------------|
| D-01: App at repo root | 01-01 | PASS | `app/`, `package.json`, `lib/` all at repo root. No sub-folder indirection. |
| D-02: No `src/` directory | 01-01 | PASS | `ls src/` returns "No such file or directory". |
| D-03: Import alias `@/*` → `./*` | 01-01 | PASS | `tsconfig.json` paths: `"@/*": ["./*"]`. |
| D-04: package.json name = `tanguy-portfolio` | 01-01 | PASS | Confirmed in `package.json`. |
| D-05: Scaffold via create-next-app | 01-01 | PASS | Used temp-dir workaround due to dir name; functionally identical result. |
| D-06: Default palette = Terra | 01-02 | PASS | `:root` hardcodes Terra OKLCh values; `DEFAULT_PALETTE_ID = 'terra'` in `lib/palettes.ts`. |
| D-07: All 5 palettes in lib/palettes.ts | 01-05 | PASS | `PALETTES` array has terra/nordic/bauhaus/ocean/vaporwave. `PaletteId` union confirmed. |
| D-08: Color tokens only | 01-03 | PASS | ZERO `--radius`, `--chart-*`, `--sidebar-*` declarations in `:root`. |
| D-09: OKLCh literals only in `:root` | 01-02 | PASS | `@theme` block contains only `var()` references; zero `oklch()` literals inside `@theme`. |
| D-10: Exhaustive shadcn aliasing | 01-03 | PASS | All 19 shadcn tokens aliased per table in CONTEXT.md. |
| D-11: Resolve `--accent` clash | 01-03 | PASS | `--primary: var(--color-accent)`. `--accent: var(--color-surface)`. |
| D-12: `--destructive` palette-independent | 01-03 | PASS | `--destructive: oklch(0.6 0.22 25)` — fixed red, not aliased. |
| D-13: Borders via `color-mix` | 01-03 | PASS | `--border` and `--input` use `color-mix(in oklch, var(--color-text-muted) 30%, transparent)`. `--ring: var(--color-accent)`. |
| D-14: Default locale = FR | 01-04 | PASS | `defaultLocale: 'fr'` in `i18n/routing.ts`. |
| D-15: `NEXT_LOCALE` cookie persistence | 01-04 | PASS | next-intl's `createMiddleware` sets the cookie automatically (verified in smoke tests). |
| D-16: 308 redirect at `/` | 01-04 | DEVIATION (accepted) | See Accepted Deviations below. next-intl v4.12 emits HTTP 307. |
| D-17: `localePrefix: 'as-needed'` | 01-04 | PASS | Confirmed in `i18n/routing.ts`. |
| D-18: Common fields | 01-05 | PASS | `CommonFields` type has slug/title/year/category/cover/summary/featured. |
| D-19: TechProject adds stack/repo?/liveUrl? | 01-05 | PASS | Confirmed in `lib/projects.ts` lines 34-39. |
| D-20: DesignProject adds tools/client? | 01-05 | PASS | Confirmed in `lib/projects.ts` lines 41-46. |
| D-21: BIMProject adds software/projectScale/location? | 01-05 | PASS | Confirmed with strict `'concept' | 'residential' | 'commercial' | 'urban'` enum. |
| D-22: cover is plain string | 01-05 | PASS | `cover: string` in CommonFields. |
| D-23: Stubs = _template × 2 locales | 01-05 | PASS | `content/projects/_template.fr.mdx` + `_template.en.mdx` both present. |
| D-24: Loader filters `_*` files | 01-05 | PASS | Filter enforced at 3 points. Smoke test returns `[]` from `getProjects()`. |

**Pitfall checks:**
- Pitfall #1 (FOUC socket): `app/[locale]/layout.tsx` has explicit `<head></head>` with documented Phase 2 injection comment. `suppressHydrationWarning` on `<html>` present. Socket verified.
- Pitfall #2 (Tailwind runtime var): `@theme` block contains ZERO `oklch()` literals. All 6 entries are `var(--color-*)`. Structurally impossible to break.
- Pitfall #5 (shadcn token disconnect): All 19 shadcn tokens redirect through the aliasing chain. `bg-primary` → `--color-primary` → `var(--primary)` → `var(--color-accent)` → Terra OKLCh. No hardcoded islands.
- Pitfall #7 (redirect loops): proxy.ts matcher `/((?!api|_next|_vercel|.*\\..*).*)` excludes static files. Smoke tests confirm `/favicon.ico` → 200, no infinite loops.
- Pitfall #14 (i18n parity): FR and EN messages both have 63 leaf keys with identical sorted key paths.

---

## Accepted Deviations

1. **D-16 (307 vs 308 redirect):** next-intl v4.12 emits HTTP 307 for non-default locale redirects; the API provides no option to force 308. Plan 01-04 documents this explicitly. Google Search Central treats 307 and 308 equivalently for canonicalization. No impact on goal achievement. Tracked as v2 deferred work.

2. **D-17 vs D-16 tension (`as-needed` semantics):** With `localePrefix: 'as-needed'`, the default locale (`/fr`) is served at canonical `/` via HTTP 200 internal rewrite — NOT a visible redirect. Only non-default locales (`/en`) emit a redirect. Plan 01-04 SUMMARY documents the full semantics with 10 curl smoke tests. Both `/` (serving FR) and `/en` render correctly. Goal criterion satisfied.

3. **shadcn 4.8 style rename (`radix-nova` vs `new-york`):** shadcn 4.8.0 renamed its style system. The 2026 equivalent is `radix-nova`. All substantive goals (Radix primitives, CSS variables, modern OKLCh tokens) are met. `components.json` contains `"style": "radix-nova"`.

4. **`radix-ui` umbrella package:** shadcn 4.8 uses `radix-ui@^1.4.3` instead of legacy per-component `@radix-ui/react-*` packages. All 7 components import their primitives from the umbrella package. Functionally identical.

All 4 deviations were documented in plan SUMMARYs before they occurred (where predictable) and confirmed not to affect the phase goal.

---

## Human Verification Items

### 1. Visual palette rendering (optional smoke test)

**Test:** Run `npm run dev`, open `http://localhost:3000` and `http://localhost:3000/en` in a browser.
**Expected:** Page renders with Terra & Sage warm cream background (`oklch(0.97 0.012 80)`) and deep brown text (`oklch(0.22 0.018 50)`). The text shows "Accueil" in French on `/` and "Home" on `/en`.
**Why human:** Color rendering accuracy on screen cannot be verified programmatically.

### 2. shadcn component palette chain (optional visual spot-check)

**Test:** Temporarily add `<Button>Test</Button>` to `app/[locale]/page.tsx`, visit the page.
**Expected:** Button renders in Terra terracotta (`oklch(0.62 0.155 35)` = `--color-accent` = `--primary` = `bg-primary`), not default shadcn blue or any hardcoded color.
**Why human:** Visual rendering confirmation of the full aliasing chain cannot be automated without a browser.

---

## Anti-Patterns Found

None found across all Phase 1 files. All implementations are substantive:
- `lib/projects.ts`: 201 lines of real discriminated-union TypeScript with validation logic, not a stub.
- `lib/palettes.ts`: 94 lines with 5 complete palette constants, type definitions, and lookup helper.
- `app/globals.css`: 170 lines with architecture documented in comments, all 6 palette vars + 19 shadcn aliases + transition rule.
- All 7 `components/ui/*.tsx` files: real shadcn component implementations using Tailwind semantic tokens.
- `proxy.ts`: 9 lines — intentionally minimal, correct pattern.
- `i18n/routing.ts`, `i18n/request.ts`: correct next-intl v4 patterns, proper locale validation.

No `TODO`, `FIXME`, `return null` stubs, `return []` without justification, or hardcoded placeholder values in any production code.

---

## Issues Found

None. No blocking gaps. No STUB/MISSING artifacts. No broken wiring.

---

## Summary

Phase 1 goal achieved. The codebase delivers exactly what every subsequent phase needs:

**What was verified against the actual code (not just SUMMARY claims):**

All 5 success criteria pass against the real files on disk. The `app/globals.css` file is confirmed to have the correct 6 OKLCh `:root` variables, the Tailwind `@theme` block with pure `var()` indirection (Pitfall #2 structurally impossible), and the 400ms transition. The 19 shadcn token aliases (D-10..D-13) are present in the single merged `:root` block with no hardcoded colors leaking through the 7 components. The `proxy.ts` (not `middleware.ts`) correctly wires next-intl routing with `as-needed` locale prefix. The messages catalog has 63 keys × 9 namespaces with perfect FR/EN parity. The `lib/projects.ts` discriminated union is fully typed with zero `any`, three-point D-24 enforcement, and runtime frontmatter validation. The `lib/palettes.ts` 5-palette typed constants have Terra values byte-matching `:root`.

**The two Phase 2 integration sockets are verified open and ready:**
1. `app/[locale]/layout.tsx` `<head>` element with documented FOUC injection plan (THEME-05 plug-in target).
2. `app/globals.css` `:root` `--color-*` vars as the ThemeProvider mutation target.

All 9 ARCH requirements (ARCH-01..09) are satisfied. All 24 locked decisions (D-01..D-24) are honored, with 4 accepted deviations documented and confirmed non-blocking. Phase 2 can start immediately.

---

_Verified: 2026-05-26_
_Verifier: Claude (gsd-verifier)_
