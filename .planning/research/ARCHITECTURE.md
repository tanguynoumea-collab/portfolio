# Architecture Research

**Domain:** Next.js 15 App Router creative portfolio with runtime CSS-variable theming, bilingual routing, MDX content, and triple animation stack (Lenis + GSAP + Framer Motion)
**Researched:** 2026-05-25
**Confidence:** HIGH (verified across official Next.js docs, next-intl docs, Tailwind v4 docs, GSAP docs, Lenis docs, and multiple 2026-published references)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  app/layout.tsx  (Server Component — root)                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ <html lang={locale} suppressHydrationWarning>                 │  │
│  │   <head>                                                      │  │
│  │     <ThemeScript />  ← inline blocking <script> (no FOUC)     │  │
│  │   </head>                                                     │  │
│  │   <body data-lenis-prevent-on={modalOpen?}>                   │  │
│  │     <Providers>  (Client island, "use client")                │  │
│  │       ├── NextIntlClientProvider                              │  │
│  │       ├── ThemeProvider  (CSS var writer + Konami listener)   │  │
│  │       ├── LenisProvider  (autoRaf:false, GSAP-driven)         │  │
│  │       └── {children}  ← passed as RSC children, stays server  │  │
│  │     </Providers>                                              │  │
│  │     <PaletteSwitcherFAB />  ← Client, rendered ONCE in layout │  │
│  │     <ConsoleArt />          ← Client, fires once on mount     │  │
│  │   </body>                                                     │  │
│  │ </html>                                                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  app/[locale]/layout.tsx  (Server — sets locale)                    │
│   • unstable_setRequestLocale(locale)                                │
│   • getMessages() → passed to NextIntlClientProvider via children    │
├─────────────────────────────────────────────────────────────────────┤
│  app/[locale]/page.tsx           app/[locale]/projects/[slug]/page  │
│  (Server, hero/about/skills)     (Server, MDX render)               │
│   • Sections are Server          • Loads MDX from content/projects/ │
│   • Client leafs only where      • Custom MDX components            │
│     interactivity is needed                                          │
├─────────────────────────────────────────────────────────────────────┤
│  components/                                                         │
│  ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────────┐  │
│  │ theme/  (Client)│ │ animation/(Client│ │ sections/ (mixed)    │  │
│  │ • Provider      │ │ • LenisProvider  │ │ • Hero (Client - GSAP│  │
│  │ • Switcher      │ │ • useGSAP wrap   │ │ • About (Server text)│  │
│  │ • Presets       │ │ • PageTransition │ │ • ProjectsGrid (Cli) │  │
│  │ • CustomPicker  │ │   (template.tsx) │ │ • Skills (Client GSAP│  │
│  │ • WCAGBadge     │ │                  │ │ • Contact (Client)   │  │
│  │ • FAB           │ │                  │ │                      │  │
│  └─────────────────┘ └──────────────────┘ └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  lib/   (pure modules, importable from Server or Client)             │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ palettes.ts  │ │ colors.ts   │ │ projects.ts  │ │ utils.ts    │  │
│  │ (5 presets)  │ │ (culori,    │ │ (MDX loader, │ │ (cn, etc.)  │  │
│  │              │ │  WCAG,      │ │  frontmatter │ │             │  │
│  │              │ │  harmonic)  │ │  zod schema) │ │             │  │
│  └──────────────┘ └─────────────┘ └──────────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  content/projects/*.mdx        messages/{fr,en}.json                 │
│   slug.{fr,en}.mdx pattern      next-intl translations               │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Server/Client | Responsibility | Implementation Notes |
|-----------|---------------|----------------|----------------------|
| `app/layout.tsx` | **Server** | HTML shell, `<head>`, inject blocking ThemeScript, render Providers wrapping children | Never `"use client"`. Forwards `children` to Providers (so RSC tree survives). |
| `ThemeScript` | **inline script** | Pre-hydration: read cookie, apply `data-palette` attr + CSS vars to `:root` — eliminates FOUC | Rendered via `dangerouslySetInnerHTML` in `<head>`. Pure synchronous JS, < 1KB. |
| `app/[locale]/layout.tsx` | **Server** | Validate locale, call `setRequestLocale`, load messages, pass to client provider | `generateStaticParams()` returns `[{locale:'fr'},{locale:'en'}]` |
| `Providers` (combined) | **Client** | Wrap children with all client contexts in one boundary | Lives in `components/providers.tsx`. Accepts `children` (preserves RSC). |
| `ThemeProvider` | **Client** | Hold palette state, write CSS vars to `:root` on change, persist to cookie, Konami listener | Uses `useState` initialized from cookie (read via server-supplied prop, not localStorage). |
| `LenisProvider` | **Client** | Mount Lenis instance, register `gsap.ticker` callback, expose `useLenis()` | `autoRaf: false`; drives Lenis from GSAP's ticker (single RAF loop). |
| `PaletteSwitcherFAB` | **Client** | Always-visible bottom-right button; opens Sheet/Drawer with tabs | Rendered in root layout — exists on every page, not per-page. |
| `PaletteSwitcher` | **Client** | The panel itself: Presets / Custom / Generate tabs (shadcn `Tabs`) | Hosts `PalettePresets`, `CustomColorPicker`, `HarmonicGenerator`, `WCAGBadge`. |
| `LanguageSwitcher` | **Client** | Toggle FR ↔ EN, uses `next-intl` `Link` + `usePathname` | In nav, not in providers tree. |
| `Hero`, `Skills` (sections) | **Client** | GSAP-driven entrance animations via `useGSAP()` | Read color from `getComputedStyle(:root)` if animation needs it. |
| `About`, `Contact` (sections) | **Server** by default; small Client leafs (copy button) | Markup is server; the `<CopyEmailButton/>` is the only client child. | Maximizes static HTML for SEO. |
| `ProjectsGrid` + `CategoryFilter` | **Client** | useState filter + Framer Motion `AnimatePresence` for layout shift | The card grid wrapper is client; each `ProjectCard` can still be server if data-only. |
| `ProjectCard` | **Server** (rendered inside client grid) | Pure markup of one project preview | Passed as RSC children/props to the client grid. |
| `app/[locale]/projects/[slug]/page.tsx` | **Server** | Resolve `await params`, load `${slug}.${locale}.mdx`, render with MDX components | Uses `generateStaticParams()` to prerender all `locale × slug` combos. |
| MDX components (`Image`, `Callout`, `CodeBlock`) | Mixed | `Callout` = Server. `Image` (with zoom) = Client. `CodeBlock` = Server (Shiki at build). | Registered via `mdx-components.tsx`. |
| `CustomCursor` | **Client** | `pointermove` listener, reads `--color-accent` via `getComputedStyle` | Mounted in root layout under desktop-only condition (`matchMedia`). |

---

## Recommended Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx                       # Server. <html>, <head>+ThemeScript, Providers wrapper.
│   ├── globals.css                      # Tailwind v4 imports + @theme + :root vars + dark blocks
│   ├── sitemap.ts                       # Per-locale URLs
│   ├── robots.ts
│   ├── [locale]/
│   │   ├── layout.tsx                   # Server. setRequestLocale + getMessages.
│   │   ├── template.tsx                 # Client. Framer Motion page transitions wrapper.
│   │   ├── page.tsx                     # Server. Hero/About/Projects/Skills/Contact sections.
│   │   ├── loading.tsx
│   │   ├── error.tsx                    # "use client" required.
│   │   ├── not-found.tsx
│   │   └── projects/
│   │       └── [slug]/
│   │           ├── page.tsx             # Server. Loads MDX by locale+slug.
│   │           └── loading.tsx
│   └── api/                             # (none in v1 — static only)
├── components/
│   ├── providers.tsx                    # Client. Combines NextIntl + Theme + Lenis providers.
│   ├── theme/                           # All client.
│   │   ├── theme-provider.tsx           # Context + CSS var writer + cookie persist + Konami
│   │   ├── theme-script.tsx             # Server component that emits the inline <script>
│   │   ├── palette-switcher-fab.tsx     # Bottom-right button (always mounted)
│   │   ├── palette-switcher.tsx         # The Sheet/Drawer with tabs
│   │   ├── palette-presets.tsx          # 4 mini-preview squares
│   │   ├── custom-color-picker.tsx      # 3 HSL inputs (bg / accent / secondary)
│   │   ├── harmonic-generator.tsx       # Source picker + mode selector + Generate
│   │   └── wcag-badge.tsx               # Live ratio + AA/AAA pill
│   ├── animation/                       # All client.
│   │   ├── lenis-provider.tsx           # Lenis + gsap.ticker bridge
│   │   ├── page-transition.tsx          # Wraps {children} in template.tsx
│   │   └── reveal-on-scroll.tsx         # Reusable GSAP ScrollTrigger wrapper
│   ├── layout/                          # Mostly client for interactivity.
│   │   ├── navbar.tsx                   # Client (mobile menu state)
│   │   ├── footer.tsx                   # Server (pure markup)
│   │   ├── language-switcher.tsx        # Client
│   │   └── custom-cursor.tsx            # Client
│   ├── sections/                        # Mix of server/client per section.
│   │   ├── hero.tsx                     # Client (GSAP SplitText)
│   │   ├── about.tsx                    # Server shell + client reveal wrapper
│   │   ├── projects-grid.tsx            # Client (filter state + AnimatePresence)
│   │   ├── project-card.tsx             # Server (pure presentation)
│   │   ├── category-filter.tsx          # Client (button group)
│   │   ├── skills.tsx                   # Client (GSAP stagger)
│   │   └── contact.tsx                  # Server shell + <CopyEmailButton/>
│   ├── mdx/                             # Components for MDX rendering.
│   │   ├── image-zoom.tsx               # Client
│   │   ├── code-block.tsx               # Server (Shiki at build)
│   │   ├── callout.tsx                  # Server
│   │   └── project-gallery.tsx          # Client (lightbox)
│   └── ui/                              # shadcn/ui copies — varies by component.
├── lib/
│   ├── palettes.ts                      # Typed Palette[] (5 entries inc. vaporwave secret)
│   ├── colors.ts                        # culori helpers: wcagContrast, generateHarmonic, adjustForAA
│   ├── projects.ts                      # MDX loader + zod-validated Frontmatter type
│   ├── cookies.ts                       # Server-only helpers: getPaletteFromCookie()
│   └── utils.ts                         # cn(), formatDate, etc.
├── content/
│   └── projects/
│       ├── studio-x.fr.mdx              # Locale-suffix pattern
│       ├── studio-x.en.mdx
│       └── ...
├── messages/
│   ├── fr.json                          # next-intl translations
│   └── en.json
├── mdx-components.tsx                   # Required by @next/mdx for App Router
├── i18n/
│   ├── routing.ts                       # next-intl routing config (locales, defaultLocale)
│   ├── request.ts                       # getRequestConfig — loads messages
│   └── navigation.ts                    # Re-exports Link, redirect from createNavigation
├── middleware.ts                        # next-intl middleware (or proxy.ts in Next 16+)
├── public/
├── next.config.mjs                      # MDX plugin config
├── tailwind.config.ts                   # (Optional in v4) — keep for shadcn/ui content path
├── postcss.config.mjs                   # Tailwind v4 @tailwindcss/postcss
└── tsconfig.json                        # strict: true
```

### Structure Rationale

- **`app/[locale]/`:** Required by next-intl App Router pattern — top-level dynamic segment is the only clean way to do route-prefix i18n with static rendering. `generateStaticParams` at this level prerenders both locales.
- **`components/theme/`:** All theme-related UI lives in one folder for testability and discoverability. Atomic split: provider owns state, switcher orchestrates UI, presets/custom/generate are siblings that share state via `usePalette()` — no prop drilling.
- **`components/animation/`:** Isolates animation infrastructure (providers + reusable wrappers) from sections that use them. Lets sections stay focused on content, not RAF plumbing.
- **`components/sections/`:** Page sections kept separate from layout chrome (navbar/footer) and from theme/animation infrastructure — clean separation of concerns.
- **`lib/`:** Pure, framework-agnostic logic. `colors.ts` and `palettes.ts` are importable from both Server and Client (no React imports). `cookies.ts` is server-only and imported only by server code.
- **`content/projects/{slug}.{locale}.mdx`:** Locale-suffix pattern (not a separate folder per locale, not frontmatter-based content) — see Pattern 4 below for rationale.
- **`mdx-components.tsx` at root:** Required by `@next/mdx` in App Router — must be at the project root.
- **`i18n/` folder:** next-intl convention. Keeps routing config, request config, and navigation helpers grouped.

---

## Architectural Patterns

### Pattern 1: FOUC-Free Theming via Inline Script + Cookie (RECOMMENDED)

**What:** Persist palette in a cookie (not localStorage). On every request the Server reads the cookie and renders `<html>` with a `data-palette` attribute pre-set. In the `<head>`, a tiny blocking inline script applies the corresponding CSS variables to `:root` before the first paint. React mounts after that with the same state, so no mismatch and no flash.

**When to use:** Always, for any runtime-mutable theme with SSR — this is the only approach that eliminates FOUC and avoids `suppressHydrationWarning` as a band-aid.

**Trade-offs:**
- ✅ Zero FOUC, zero hydration mismatch, palette state available on the Server (useful for `generateMetadata`'s OG image colors).
- ✅ Works with statically generated pages — cookies are read at request time without opting into dynamic rendering for the page body (only the layout `<html>` attribute changes).
- ❌ Cookie ≤ 4KB (fine — palette is a short string + 3 hex colors).
- ❌ Slightly more setup than next-themes; but next-themes does NOT solve FOUC for arbitrary palette systems (only for class-based dark/light) and uses localStorage internally, which forces a client-only render path.

**Recommendation: ONE approach** → Cookie + inline script. (Reject pure-localStorage and reject `next-themes` for this project because we need 5+ palette presets with live HSL mutation, not a binary toggle.)

**Example:**

```tsx
// components/theme/theme-script.tsx — Server Component
const PALETTES_JSON = JSON.stringify(palettes); // 5 entries, small

export function ThemeScript() {
  const script = `
    (function() {
      try {
        var p = document.cookie.match(/(?:^|;\\s*)palette=([^;]+)/);
        var paletteId = p ? decodeURIComponent(p[1]) : 'terra';
        var palettes = ${PALETTES_JSON};
        var palette = palettes.find(function(x){return x.id===paletteId;}) || palettes[0];
        var root = document.documentElement;
        root.setAttribute('data-palette', palette.id);
        Object.entries(palette.colors).forEach(function(entry){
          root.style.setProperty('--color-' + entry[0], entry[1]);
        });
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

```tsx
// app/layout.tsx — Server Component
import { cookies } from 'next/headers';
import { ThemeScript } from '@/components/theme/theme-script';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialPaletteId = cookieStore.get('palette')?.value ?? 'terra';
  return (
    <html suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <Providers initialPaletteId={initialPaletteId}>{children}</Providers>
        <PaletteSwitcherFAB />
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` ONLY suppresses the warning for the one attribute (`data-palette`) that the inline script set before React hydrated — that's the recommended use of this prop.

---

### Pattern 2: Tailwind v4 `@theme` + `:root` CSS Variables for Runtime Mutation (RECOMMENDED)

**What:** Use Tailwind v4 with `@theme inline` referencing CSS variables defined under `:root`. The `inline` keyword tells Tailwind to wire utilities like `bg-bg`, `text-fg`, `border-accent` to read `var(--color-bg)` etc. at runtime — so updating the CSS variable updates every utility-styled element instantly without rebuild.

**When to use:** Always, for this project. Tailwind v4 is the only correct choice here because:
1. Native CSS variable support is a first-class feature (v3 required hacks with `theme.extend` + manual var()).
2. Smaller bundle, faster builds via Oxide engine.
3. shadcn/ui has been migrated to v4 (their docs cover it directly).
4. Color format flexibility — HSL or OKLCH both work; HSL is recommended for this project because culori's harmonic generator outputs HSL natively and matches the design system's "3 HSL sliders" UX.

**Trade-offs vs v3:**
- ✅ Cleaner DX: change `--color-accent` in JS → every `bg-accent` updates instantly.
- ✅ No `tailwind.config.ts` color extension boilerplate.
- ❌ Tailwind v4 has Shadow DOM propagation caveats — irrelevant here (no web components).
- ❌ Newer ecosystem (some older plugins not v4-compatible) — not a concern for this stack.

**`prefers-color-scheme`:** Do **NOT** wire it to a `.dark` class for this project. The palette system replaces dark mode (Vaporwave covers dark, others are light/mid). Default palette = `terra` (light). If you want to be polite, detect `prefers-color-scheme: dark` ONLY on first visit (no cookie set) → default to `vaporwave` or a future dark preset. Code:

```tsx
// In ThemeScript, before reading cookie:
var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
var defaultPalette = dark ? 'vaporwave-locked-stub' : 'terra';
```

But honestly, since Vaporwave is a secret palette unlocked by Konami code, just default to `terra` and let users opt into others.

**Example:**

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --color-bg: 30 25% 96%;
  --color-surface: 30 20% 92%;
  --color-fg: 30 15% 12%;
  --color-fg-muted: 30 10% 35%;
  --color-accent: 12 75% 50%;
  --color-secondary: 145 30% 40%;
}

@theme inline {
  --color-bg:        hsl(var(--color-bg));
  --color-surface:   hsl(var(--color-surface));
  --color-fg:        hsl(var(--color-fg));
  --color-fg-muted:  hsl(var(--color-fg-muted));
  --color-accent:    hsl(var(--color-accent));
  --color-secondary: hsl(var(--color-secondary));
}

* { transition: color 400ms ease, background-color 400ms ease, border-color 400ms ease; }
```

Now `bg-bg`, `text-fg`, `bg-accent`, etc. all generated by Tailwind utilities — and mutate live when the ThemeProvider runs `root.style.setProperty('--color-accent', newHsl)`.

---

### Pattern 3: Provider Composition with RSC Children (CRITICAL)

**What:** All client-only providers (NextIntl, Theme, Lenis) are combined into ONE `<Providers>` client component that takes `{children}` as a prop. The Server `layout.tsx` renders this Providers component and passes the rest of the Server-rendered tree (page sections, etc.) as `children`. Because `children` is passed as a prop to a client component, React keeps it as a Server-rendered subtree — it does NOT get demoted to client.

**Why this matters:** The naive mistake is to put `"use client"` at the top of `layout.tsx` to "use the ThemeProvider" — that demotes the entire app to the client and destroys SEO/perf. The composition pattern below keeps Server Components dominant.

**Order matters:**

```
NextIntlClientProvider     ← Outermost — translations are needed by Theme switcher UI strings
  └─ ThemeProvider          ← Owns palette state, sets CSS vars. Reads initial from server prop.
       └─ LenisProvider     ← Owns Lenis instance + gsap.ticker. Inside theme so cursor color works.
            └─ {children}   ← Server-rendered subtree, intact.
```

**FAB lives in root layout, NOT in providers.** The PaletteSwitcherFAB is a sibling of `<Providers>{children}` inside `<body>`, so it appears on every page automatically. It calls `usePalette()` from the ThemeProvider context — that works because it's also a descendant of `<body>` and the context provider wraps the body's interactive zone… wait, this would NOT work because FAB is outside Providers.

**Corrected layout:**

```tsx
// app/layout.tsx
<body>
  <Providers initialPaletteId={initialPaletteId}>
    {children}
    <PaletteSwitcherFAB />   {/* MUST be inside Providers to access context */}
  </Providers>
</body>
```

`PaletteSwitcherFAB` is a Client Component, but placing it as a child of `<Providers>` keeps it inside the context. `{children}` next to it stays Server-rendered.

**Example:**

```tsx
// components/providers.tsx
"use client";

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { LenisProvider } from '@/components/animation/lenis-provider';

export function Providers({
  children, locale, messages, initialPaletteId,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
  initialPaletteId: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider initialPaletteId={initialPaletteId}>
        <LenisProvider>{children}</LenisProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
```

---

### Pattern 4: Locale-Suffix MDX Files + Locale-Aware Loader (RECOMMENDED)

**What:** One file per (project, locale) pair: `content/projects/studio-x.fr.mdx` and `content/projects/studio-x.en.mdx`. Frontmatter contains the schema-validated fields (slug, title, category, year, stack, cover). A typed loader in `lib/projects.ts` reads files by glob, parses with `gray-matter` or `zod`, and exposes `getProject(slug, locale)` and `getAllProjects(locale)`.

**When to use:** This project — for prose-heavy localized content where each language has its own narrative voice (not just label translation).

**Trade-offs vs frontmatter pattern (`title: { fr: "...", en: "..." }`):**
- ✅ Two files = clean separation; can translate independently; full prose flow per language; better for diff/review.
- ✅ Static generation pairs naturally with `generateStaticParams` returning `locale × slug` combos.
- ✅ Each MDX file can have locale-specific imports, components, even structure.
- ❌ Duplication of frontmatter — mitigated by a `_shared.json` companion or by deriving non-textual frontmatter (stack, year, cover) from the FR file as source of truth.
- ❌ Risk of drift between languages — solved by build-time check: every slug MUST have both `.fr.mdx` and `.en.mdx` or fail the build (add a `pre-build` check).

**Frontmatter pattern is wrong here because:**
- Prose body in MDX can't be expressed in JSON frontmatter cleanly.
- Inline MDX components in different languages may differ structurally.

**Example:**

```ts
// lib/projects.ts — Server-only
import { z } from 'zod';
import matter from 'gray-matter';
import { glob } from 'glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.enum(['tech', 'design', 'bim']),
  year: z.number(),
  stack: z.array(z.string()),
  cover: z.string(),
});
export type Frontmatter = z.infer<typeof FrontmatterSchema>;

const ROOT = path.join(process.cwd(), 'content/projects');

export async function getAllProjects(locale: 'fr' | 'en'): Promise<Frontmatter[]> {
  const files = await glob(`*.${locale}.mdx`, { cwd: ROOT });
  return Promise.all(files.map(async (f) => {
    const raw = await readFile(path.join(ROOT, f), 'utf8');
    return FrontmatterSchema.parse(matter(raw).data);
  }));
}

export async function getProjectSlugs(): Promise<string[]> {
  const files = await glob('*.fr.mdx', { cwd: ROOT });
  return files.map((f) => f.replace(/\.fr\.mdx$/, ''));
}
```

```tsx
// app/[locale]/projects/[slug]/page.tsx — Server
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc'; // OR use @next/mdx + dynamic import
import { mdxComponents } from '@/mdx-components';

type Params = Promise<{ locale: 'fr' | 'en'; slug: string }>;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return ['fr', 'en'].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const filePath = path.join(ROOT, `${slug}.${locale}.mdx`);
  let raw: string;
  try { raw = await readFile(filePath, 'utf8'); }
  catch { notFound(); }

  const { content, frontmatter } = await compileMDX<Frontmatter>({
    source: raw,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });
  return <article>{content}</article>;
}
```

**MDX Library Choice: `@next/mdx` (RECOMMENDED) for this project size.**

| | `@next/mdx` | `next-mdx-remote` | Custom RSC pipeline |
|---|---|---|---|
| App Router native | ✅ first-class | ✅ via `/rsc` import | ✅ |
| File-based routing | ✅ `.mdx` becomes a route | ❌ load from anywhere | ❌ |
| Custom components | via `mdx-components.tsx` | passed to `<MDXRemote/>` | manual |
| Frontmatter | needs plugin (`remark-frontmatter` + `remark-mdx-frontmatter`) | built-in (`parseFrontmatter: true`) | manual |
| Static at build | ✅ | ✅ when called from RSC | ✅ |
| Best for | small/medium content (your 6-10 projects) | when content lives outside repo (CMS, S3) | bespoke |

**Pick `@next/mdx`** because: content lives in repo, file count is small (6-10 projects × 2 locales = 12-20 files), `mdx-components.tsx` is the cleanest custom-component story, and full Server Component rendering. The catch — `@next/mdx` doesn't make `.mdx` files into routes automatically when they're in `/content/` (only in `/app/`). So you keep MDX files in `/content/projects/` and use `next-mdx-remote/rsc`'s `compileMDX` for the dynamic route — OR you can use `@next/mdx` to parse and a dynamic `import()` in the page. The cleanest practical setup:

- Use `next-mdx-remote/rsc` `compileMDX()` for loading MDX from `content/`
- Use `mdx-components.tsx` to define your custom component map (importable from both pipelines)

This is the modern hybrid — best of both worlds.

---

### Pattern 5: Lenis + GSAP via Single RAF Loop (CRITICAL)

**What:** Set `autoRaf: false` on Lenis and drive `lenis.raf(time*1000)` from `gsap.ticker.add()`. This ensures both libraries advance on the same frame, eliminating the 1-2 frame jitter that plagues naïve setups. Then call `ScrollTrigger.refresh()` once Lenis is ready. **`ScrollTrigger.scrollerProxy()` is NOT needed in Lenis 1.x** — the old setup was for `@studio-freight/lenis`. Modern Lenis updates `window.scrollY` directly via translate transforms on `<html>`, so ScrollTrigger reads the right value automatically.

**When to use:** Any time you combine Lenis with GSAP/ScrollTrigger — which is mandatory for this project (parallax, scroll-pin horizontal scroll, reveals).

**Trade-offs:**
- ✅ Stable scroll behavior across all browsers.
- ✅ No jitter, no double-RAF cost.
- ❌ Requires both Lenis AND GSAP registered before any ScrollTrigger is created — affects build order (see Pattern 8).

**Example:**

```tsx
// components/animation/lenis-provider.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Lenis emits scroll → tell ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

**`data-lenis-prevent` usage:** Apply this attribute to any scrollable container that should use native scroll instead of Lenis — typically:
- Modal/Sheet content (shadcn `Dialog`, `Sheet`) when content overflows
- The PaletteSwitcher panel itself (long content scrolls naturally)
- Code blocks with horizontal overflow
- Any `<textarea>` or scrollable child inside MDX

Companion CSS:
```css
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
```

**Don't use `data-lenis-stop`** to disable Lenis globally on modal open — keep page background scrollable via `lenis.stop()` programmatically:

```tsx
const lenis = useLenis();
useEffect(() => {
  if (modalOpen) lenis?.stop();
  else lenis?.start();
}, [modalOpen, lenis]);
```

---

### Pattern 6: Page Transitions via `template.tsx` (NOT `AnimatePresence` in layout)

**What:** Next.js App Router does NOT remount `layout.tsx` between routes — so `AnimatePresence` wrapping `{children}` in a layout never sees an exit. Use `template.tsx` instead: it DOES remount on every navigation. Wrap children in a `motion.div` with `initial/animate/exit` and `key={pathname}`.

**When to use:** Every time you want page-level transitions in App Router. Don't fight `AnimatePresence` in `layout.tsx` — it's a known dead end as of Next.js 14+.

**Trade-offs:**
- ✅ Works with App Router out of the box.
- ✅ Simple, idiomatic.
- ❌ No true exit animation (the old page is gone before new one mounts). Use `initial→animate` (enter) only, or use the new View Transitions API for true exit.

**Example:**

```tsx
// app/[locale]/template.tsx — Client
"use client";
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

---

### Pattern 7: Async `params` + `setRequestLocale` for Static i18n Routes

**What:** In Next.js 15, dynamic route params are now Promises. Combined with next-intl's `setRequestLocale`, this enables fully static prerendering of localized routes. Without `setRequestLocale`, next-intl falls back to reading `headers()` — which opts the route into dynamic rendering and breaks static generation.

**When to use:** Every Server Component under `app/[locale]/` that calls `useTranslations`, `getTranslations`, or `getMessages`.

**Example:**

```tsx
// app/[locale]/layout.tsx — Server
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  // Pass to Providers (rendered by root layout via children).
  // OR: a sub-provider here that also wraps children client-side.
  return children;
}
```

Note: In Next.js 16.2+, `next/root-params` removes the need for `setRequestLocale` entirely.

---

## Data Flow

### Palette State Flow

```
[Cookie: palette=terra]                          [User clicks PaletteSwitcher]
        ↓                                                   ↓
[Server reads cookie]                            [setPalette('vaporwave')]
        ↓                                                   ↓
[layout.tsx renders                              [ThemeProvider context update]
 <ThemeScript> with init id]                                ↓
        ↓                                        [useEffect → write CSS vars to :root]
[Inline script runs in <head>:                              ↓
 sets :root style props]                         [Browser repaints with new vars]
        ↓                                                   ↓
[React hydrates — ThemeProvider              [document.cookie = 'palette=vaporwave;...']
 reads same initial id from prop]                          ↓
        ↓                                        [Next SSR uses new cookie ✓]
[Match — no FOUC, no mismatch ✓]
```

### Locale Flow

```
[URL: /en/projects/studio-x]
        ↓
[middleware.ts (next-intl)]
   → validates locale, sets x-next-intl-locale header
        ↓
[app/[locale]/layout.tsx — Server]
   → await params, setRequestLocale('en'), getMessages()
        ↓
[Providers (Client)]
   → NextIntlClientProvider locale="en" messages={...}
        ↓
[app/[locale]/projects/[slug]/page.tsx — Server]
   → await params → { locale:'en', slug:'studio-x' }
   → readFile content/projects/studio-x.en.mdx
   → compileMDX with mdx-components
        ↓
[HTML streamed]
```

### MDX Content Flow

```
[content/projects/studio-x.en.mdx]
        ↓ glob+read at request time (build-time when static)
[lib/projects.ts: getProject('studio-x','en')]
        ↓ gray-matter + zod validate
[{ frontmatter: Frontmatter, body: string }]
        ↓ next-mdx-remote/rsc compileMDX
[React element tree using mdx-components.tsx map]
        ↓ <Image>, <Callout>, <CodeBlock>, etc.
[Server-rendered HTML, ImageZoom hydrates as client island only when interacted]
```

### Animation/Scroll Flow

```
[Browser scroll/wheel event]
        ↓
[Lenis listener intercepts, transforms <html> with translate]
        ↓ (driven by gsap.ticker, NOT independent RAF)
[Lenis emits 'scroll' → ScrollTrigger.update()]
        ↓
[ScrollTrigger checks all registered triggers]
        ↓
[GSAP animations advance on same frame]
        ↓
[Framer Motion components (independent) animate via their own scheduler]
        ↓ (no conflict — they don't read window.scrollY)
[Browser composites]
```

---

## Build Order — Dependency-Driven Phasing (CRITICAL FOR ROADMAP)

This is the order phases MUST be built in. Each phase's deliverables enable the next.

| # | Phase | Why It Must Come First | Blocks |
|---|-------|------------------------|--------|
| **1** | **Project skeleton + Tailwind v4 CSS variable foundation** | Without CSS variable plumbing in `globals.css` + Tailwind `@theme inline`, no component can be styled — every later component depends on `bg-bg`, `text-fg`, `text-accent` utilities resolving correctly. | Everything |
| **2** | **next-intl routing + middleware + empty `[locale]` layout** | Every page lives under `[locale]/`. Without the dynamic segment + middleware + `setRequestLocale`, pages can't render statically and any link/route breaks. Static generation must work before adding content. | All pages, all sections |
| **3** | **Cookie reader + ThemeScript + ThemeProvider (state + CSS var writer)** | The cookie-based, FOUC-free theming pipeline must exist before any component that depends on dynamic colors. The Providers boundary (Pattern 3) must be wired before sections are built. Without this, you'd build sections, then have to retrofit the theming and discover hydration bugs everywhere. | Palette UI, sections with accent colors, custom cursor |
| **4** | **Palette presets data + culori-backed colors lib (`lib/palettes.ts`, `lib/colors.ts`)** | Pure logic, no UI. Must precede any UI that exposes palette switching. Defines the shape of palette state. WCAG helpers needed by every palette UI badge. | PaletteSwitcher UI |
| **5** | **PaletteSwitcher UI (FAB + Presets + CustomPicker + HarmonicGenerator + WCAGBadge)** | The signature feature. Must work end-to-end before any section relies on accent color animation, because palette robustness drives final color choices. Konami listener integrates here. | Visual polish phase |
| **6** | **shadcn/ui scaffolding (Button, Card, Dialog, Sheet, Slider, Switch, Popover, Tabs)** | Used by PaletteSwitcher (Sheet, Tabs, Slider, Popover) and by many sections. Add components on-demand rather than all upfront. | Sections, PaletteSwitcher refinement |
| **7** | **LenisProvider + GSAP registration (animation infrastructure)** | Must come before any section that uses `useGSAP()` or ScrollTrigger. The single-RAF setup must be in place so ScrollTrigger reads correct scroll values from day one. | All animated sections |
| **8** | **Layout chrome — Navbar, Footer, LanguageSwitcher, page template.tsx** | Sections render inside this chrome. Page transitions wrap them. | Sections |
| **9** | **Sections — Hero, About, Projects (grid+filter+cards), Skills, Contact** | Homepage assembly. Builds on all infrastructure. | Project pages |
| **10** | **MDX pipeline + mdx-components.tsx + lib/projects.ts loader** | Needed for project detail pages. Independent of sections, but sections (ProjectCard) need the frontmatter type. Could run in parallel with sections. | Project detail pages |
| **11** | **Project detail pages `app/[locale]/projects/[slug]/page.tsx` + 6 MDX seed files** | Consumes loader + MDX pipeline. Tests static generation per locale per slug. | — |
| **12** | **Polish — CustomCursor, ConsoleArt, page transitions wiring, 404 page** | Personality layer. Nothing depends on it. | — |
| **13** | **SEO — `generateMetadata`, `sitemap.ts`, `robots.ts`, OG images** | Verification on a working site. | — |
| **14** | **A11y audit + WCAG enforcement test + 10-palette robustness pass** | Final verification. | — |
| **15** | **Deploy — Git/GitHub + Vercel + Analytics + Speed Insights** | Last because everything else must work first. | — |

**Hard rule:** Phases 1, 2, 3 are foundational and serial — they MUST land before Phase 4+. Phases 7-12 have more parallelism opportunities (e.g., MDX work can happen alongside Sections work).

---

## Component Boundaries — `components/theme/`

The theme system has 6+ pieces. To balance atomicity (testable, swappable) with practicality (no prop drilling), split as follows:

| File | Owns | Talks to |
|------|------|----------|
| `theme-provider.tsx` | React Context, palette state, CSS variable writes, cookie persistence, Konami listener, `usePalette()` hook | Reads `lib/palettes.ts`. Provides context to all children. |
| `theme-script.tsx` | Renders the inline `<script>` for pre-hydration palette application | Pure server. Reads `lib/palettes.ts` to inline data. |
| `palette-switcher-fab.tsx` | The bottom-right floating button. Animated open icon (Framer Motion). Opens the Sheet. | Local `useState(open)`. Hosts `<PaletteSwitcher/>` inside `<Sheet/>`. |
| `palette-switcher.tsx` | The Sheet content: `<Tabs/>` with three panels. Common header. | Uses `usePalette()`. Renders 3 sibling panels. |
| `palette-presets.tsx` | 4 mini-preview clickable squares (Framer Motion select animation) | Calls `usePalette().setPreset(id)`. |
| `custom-color-picker.tsx` | 3 HSL inputs (bg / accent / secondary) with live preview | Calls `usePalette().setCustomColor(role, hsl)`. |
| `harmonic-generator.tsx` | Color picker + mode select (analogous/complementary/triadic/split-complementary) + Generate button | Calls `lib/colors.ts.generateHarmonic(mode, source)` then `usePalette().setHarmonic(result)`. |
| `wcag-badge.tsx` | Live contrast ratio + AA/AAA pill. Read-only. | Reads `usePalette()`. Calls `lib/colors.ts.wcagContrast()`. |

**No prop drilling** — all UI sub-components consume `usePalette()` directly. PaletteProvider holds the single source of truth. The Switcher itself is a layout/composition shell.

**Konami code listener** lives in `ThemeProvider` (not in FAB) because it should be active globally as long as the app is mounted — and Provider is the single global mount point.

---

## Performance Architecture — Server vs Client

### Components that MUST be Client (`"use client"`)

| Component | Why |
|-----------|-----|
| `ThemeProvider` + all of `components/theme/*` except `theme-script.tsx` | `useState`, `useEffect`, event listeners, `setProperty`, cookie write |
| `LenisProvider` | Window APIs, gsap.ticker |
| `Hero`, `Skills` | `useGSAP()` hooks |
| `ProjectsGrid`, `CategoryFilter` | Filter state, `AnimatePresence` |
| `LanguageSwitcher` | `useRouter`, `usePathname` |
| `CustomCursor` | `pointermove` listener |
| `ConsoleArt` | `console.log` on mount via `useEffect` |
| `template.tsx` (page transitions) | `usePathname`, Framer Motion |
| `error.tsx` | Required by Next.js to be a client component |
| `CopyEmailButton`, `ImageZoom` | Click handlers, animations |

### Components that MUST stay Server

| Component | Why |
|-----------|-----|
| `app/layout.tsx`, `app/[locale]/layout.tsx` | Read cookies, await params, call `setRequestLocale`/`getMessages` |
| `app/[locale]/page.tsx` | Composes sections (some client) but itself stays server |
| `app/[locale]/projects/[slug]/page.tsx` | MDX compilation, file I/O, frontmatter parse |
| `Footer`, `ProjectCard` (data-only), `Callout`, `CodeBlock`, `About` shell | Pure presentation/markup |
| `ThemeScript` | Renders an inline `<script>` tag (no state) |

### Server Component Maximization Strategy

1. **Section pattern: server shell + client interactivity leaf.** Example: `About` is a Server Component rendering the bio markdown; only the scroll-reveal wrapper around it is client. `Contact` is server prose with a single `<CopyEmailButton/>` client island.
2. **`ProjectCard` stays server** even though it lives inside the client `ProjectsGrid`. It receives `Frontmatter` as props and renders pure HTML. Framer Motion `hover` animation is applied via the grid's parent passing a `motion.div` wrapper around the server card.
3. **Render Server Components as `{children}` of Client Components.** This is the key technique — `Providers` is client, but `{children}` (the entire page tree) renders as Server Components and is shipped as RSC payload.
4. **Avoid `"use client"` at page or layout root.** That demotes the entire subtree. Push the directive down to the smallest leaf that needs it.

### Performance Targets (Lighthouse 90+)

| Concern | Strategy |
|---------|----------|
| Largest Contentful Paint | Hero is a Client Component (GSAP), but its initial frame should be the final layout state. Use `next/font` with `display:swap`. Preload OG image. |
| Total Blocking Time | Defer GSAP plugins via dynamic import where possible. Lenis + gsap.ticker is the only critical JS. |
| Cumulative Layout Shift | Reserve image dimensions via `next/image` `width`/`height`. Avoid late-loading fonts shifting layout. |
| First Contentful Paint | Inline ThemeScript is tiny (~1KB). RSC streams immediately. |
| Bundle size | Lenis (~5KB), GSAP core (~20KB), ScrollTrigger (~25KB), Framer Motion (~30KB after tree-shake) — well under budget for this kind of site. |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (1 portfolio, 6-10 projects, 2 locales) | Static export possible; current architecture handles fine. No changes needed. |
| 20-50 projects | Add pagination or virtualization to `ProjectsGrid`. Move project loader to `unstable_cache` or build-time only. Consider Velite or Content Collections for typed content layer. |
| 50+ projects + blog | Migrate `content/` to a CMS (Sanity/Contentful) or keep as MDX with a proper content layer. Add search (Pagefind for static, Algolia otherwise). |
| Multi-language expansion (3+ locales) | Generate frontmatter from a single source-of-truth JSON instead of duplicating per locale. Consider Crowdin or i18n service for translation management. |

### Scaling Priorities

1. **First bottleneck:** Build time grows linearly with `locale × slug` combos. At 50 projects × 5 locales = 250 pages, build is still <2 min on Vercel — no action needed until then.
2. **Second bottleneck:** Bundle size if more animation effects added per project page. Code-split per-project effects with `dynamic(() => import(...), { ssr: false })`.

---

## Anti-Patterns

### Anti-Pattern 1: Using `localStorage` for theme persistence

**What people do:** Read `localStorage.getItem('palette')` in a `useEffect` and apply CSS vars.
**Why it's wrong:** Server has no access to `localStorage` → first paint always uses default → guaranteed FOUC. `suppressHydrationWarning` only hides the warning, doesn't fix the flash.
**Do this instead:** Use cookies (Pattern 1). Server-readable, no FOUC, deterministic SSR.

### Anti-Pattern 2: Putting `"use client"` at the top of `app/layout.tsx`

**What people do:** "I need ThemeProvider, so the layout must be client."
**Why it's wrong:** Demotes the entire app to the client. Destroys RSC benefits, kills SEO performance, bloats bundle.
**Do this instead:** Create a separate `<Providers>` client component and render Server Children inside it (Pattern 3).

### Anti-Pattern 3: Running Lenis and GSAP on separate RAF loops

**What people do:** Initialize Lenis with default `autoRaf: true`, then create ScrollTriggers separately.
**Why it's wrong:** Two RAF loops → 1-2 frame desync → ScrollTrigger triggers fire at wrong scroll positions, animations jitter.
**Do this instead:** `autoRaf: false` + `gsap.ticker.add(t => lenis.raf(t*1000))` (Pattern 5). One loop, perfect sync.

### Anti-Pattern 4: `AnimatePresence` wrapping `{children}` in `app/layout.tsx`

**What people do:** Copy Pages Router patterns into App Router and wonder why exit animations never fire.
**Why it's wrong:** `layout.tsx` doesn't remount on navigation, so `AnimatePresence` never sees an unmount.
**Do this instead:** Use `template.tsx` (Pattern 6) with `key={pathname}` and enter-only animations, OR adopt the View Transitions API.

### Anti-Pattern 5: Storing locale-specific strings in MDX frontmatter

**What people do:** `title: { fr: "...", en: "..." }` to keep one file per project.
**Why it's wrong:** Breaks naturally with prose body (which can't be JSON-encoded). Forces complex frontmatter parsing. Loses MDX's biggest strength — locale-specific structure and components.
**Do this instead:** One MDX file per (slug, locale) using `slug.{locale}.mdx` naming (Pattern 4).

### Anti-Pattern 6: Hardcoding hex colors anywhere

**What people do:** `bg-[#f4f1ec]` or `style={{color: "#aa3322"}}`.
**Why it's wrong:** Breaks the palette switcher — those values won't update at runtime.
**Do this instead:** ALWAYS use `bg-bg`, `text-fg`, `text-accent` utilities backed by CSS variables. Enforce via ESLint rule (`no-restricted-syntax` matching hex regex in JSX).

### Anti-Pattern 7: Reading palette inside `generateMetadata` and assuming it works statically

**What people do:** Try to generate per-palette OG images dynamically.
**Why it's wrong:** Reading cookies in `generateMetadata` opts the page into dynamic rendering.
**Do this instead:** Use a single OG image per palette (5 baked images) and select based on referrer pattern, OR keep OG image palette-agnostic with a neutral design.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel Analytics | `<Analytics />` from `@vercel/analytics/next` in root layout | Client component, no perf hit |
| Vercel Speed Insights | `<SpeedInsights />` from `@vercel/speed-insights/next` | Same as above |
| GitHub (deployment) | Automatic on push to `main` via Vercel integration | No code, configured in Vercel dashboard |
| Email (contact) | `mailto:` link, no backend | Plain `<a>` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components ↔ Client Components | Props (serializable only) via `children` slot pattern | Never import client into server with `"use client"` inside server file — let Next.js infer |
| ThemeProvider ↔ all theme UI components | React Context via `usePalette()` hook | No prop drilling |
| LenisProvider ↔ GSAP | Shared `gsap.ticker` instance | Single RAF loop |
| Server (cookies) ↔ ThemeScript ↔ ThemeProvider | Cookie value → `initialPaletteId` prop → context initial state | Three-way sync via single source (cookie) |
| MDX content ↔ Page rendering | `compileMDX` + `mdx-components.tsx` global map | Components from `components/mdx/` |
| Sections ↔ Lenis | `useLenis()` hook for programmatic control (modal open/close) | Optional — sections usually don't touch Lenis |

---

## Where Complexity Concentrates (Phase Research Flags)

| Topic | Complexity Source | Mitigation |
|-------|-------------------|------------|
| **FOUC + hydration** (Phase 3) | Server cookie read → inline script → React state → MUST match exactly | Strict pattern (Pattern 1). Test every palette on cold + hot refresh. |
| **Lenis + GSAP integration** (Phase 7) | Two libraries with their own loops + ScrollTrigger needs accurate scroll | Strict pattern (Pattern 5). Test with parallax + scroll-pin together. |
| **Static generation of `[locale]/projects/[slug]`** (Phase 11) | `generateStaticParams` returning locale×slug + async params + `setRequestLocale` chain | Test build output `.next/server/app/[locale]/projects/[slug]/...` actually contains pre-rendered HTML per combo. |
| **WCAG enforcement on custom palettes** (Phase 4 + 14) | User-generated palettes can violate 4.5:1 ratio | `lib/colors.ts.adjustForAA()` runs on every palette change before write. Tested on 10 random palettes. |
| **`template.tsx` page transition + Lenis scroll reset on navigation** (Phase 8) | Lenis preserves scroll position; new route may want top | Call `lenis.scrollTo(0, { immediate: true })` in `template.tsx` on path change. |

---

## Sources

### Official Documentation
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — Internationalization](https://nextjs.org/docs/app/guides/internationalization)
- [Next.js — generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js — MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [next-intl — App Router Setup](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl — Locale-based Routing Setup](https://next-intl.dev/docs/routing/setup)
- [Tailwind CSS — Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [shadcn/ui — Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [shadcn/ui — Theming](https://ui.shadcn.com/docs/theming)
- [GSAP — React Guide](https://gsap.com/resources/React/)
- [@gsap/react useGSAP hook](https://www.npmjs.com/package/@gsap/react)
- [Lenis — GitHub README](https://github.com/darkroomengineering/lenis)

### Patterns and Best Practices
- [Smooth Scrolling in Next.js with Lenis & GSAP (2026 Guide)](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)
- [How to implement Lenis in Next.js — Bridger Tower](https://bridger.to/lenis-nextjs)
- [Orchestrating GSAP + Lenis](https://skills.rest/skill/orchestrating-gsap-lenis)
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering)
- [Don't use LocalStorage for Dark Mode in Next.js: Here's a Better Way](https://medium.com/@kjinengineer/dont-use-localstorage-for-dark-mode-in-next-js-here-s-a-better-way-f6d4c98c3c07)
- [Understanding & Fixing FOUC in Next.js App Router (2025 Guide)](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk)
- [Solving Framer Motion Page Transitions in Next.js App Router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router)
- [Better dynamic themes in Tailwind with OKLCH color magic — Evil Martians](https://evilmartians.com/chronicles/better-dynamic-themes-in-tailwind-with-oklch-color-magic)
- [Next.js 15 Dynamic Routes: The Params Promise Pattern](https://fortifiedhq.com/blog/next-js-15-dynamic-routes-params-promise)
- [Lenis scroll prevention on modal — GitHub Discussion #292](https://github.com/darkroomengineering/lenis/discussions/292)
- [GSAP + Lenis scrollerProxy issue — GSAP Forum](https://gsap.com/community/forums/topic/34814-scrolltrigger-with-lenis-smooth-scroll-problem-with-the-scrollerproxy-setup/)
- [Vercel Discussion — Light/Dark Mode with App Router + RSC](https://github.com/vercel/next.js/discussions/53063)
- [MDX files and Internationalization (i18n) — Vercel Discussion #68374](https://github.com/vercel/next.js/discussions/68374)
- [next-mdx-remote — GitHub](https://github.com/hashicorp/next-mdx-remote)

---

*Architecture research for: Next.js 15 App Router creative portfolio with runtime CSS-variable theming, bilingual i18n, MDX content pipeline, and triple animation stack*
*Researched: 2026-05-25*
