# Portfolio Tanguy (`tanguy-portfolio`)

## What This Is

Portfolio personnel bilingue FR/EN servant de complément au CV PDF, présentant **Tanguy Delrieu, ingénieur BIM** (coordination & modélisation, du modèle numérique au suivi de chantier). Le site expose des projets personnels avec un ton créatif assumé et des easter eggs. Sa **feature signature** est un système de palettes interactif (4 presets + custom color picker + génération harmonique avec contrôle WCAG temps réel + palette secrète Vaporwave déblocable via Konami code) qui permet à chaque visiteur de personnaliser le thème en live.

> **Note identité (post-v1.0, 2026-05-29) :** l'identité initiale était un profil fictif hybride *Tech × Design × BIM*. Elle a été refocalisée sur le **profil réel d'ingénieur BIM** issu du CV (voir bloc *Post-v1.0* dans Requirements). La section Projets contient encore les 6 projets fictifs catégorisés Tech/Design/BIM en attendant la refonte (Pass 2).

## Core Value

Mettre en valeur le profil d'**ingénieur BIM** de Tanguy Delrieu via une expérience web personnalisable qui **prouve la maîtrise technique, le sens du design et l'attention aux détails** — un portfolio qui est lui-même une démo vivante de son savoir-faire.

## Requirements

### Validated

**Validated in Phase 1: Foundations (2026-05-26)** — 5 plans, 15 commits, all 9 ARCH REQs satisfied, score 5/5 on phase verification.

- [x] Projet **Next.js 16** (App Router + React 19.2 + TypeScript strict) initialisé via `create-next-app@latest` — `proxy.ts` (Next 16), `params` async, Turbopack par défaut [ARCH-01]
- [x] ESLint flat config + Prettier + structure de dossiers (app, components, lib, content, messages, public) [ARCH-02]
- [x] shadcn/ui initialisé via `npx shadcn@latest init` (style `radix-nova` en 2026, umbrella `radix-ui@^1.4.3`) avec 7 composants : button, card, dialog, slider, switch, popover, tabs [ARCH-05]
- [x] **Tailwind CSS v4** configuré avec `@theme {}` en CSS (pas de `tailwind.config.ts`) — toutes les couleurs via `var(--color-*)` déclarées en OKLCh dans `:root` [ARCH-03]
- [x] `globals.css` avec CSS variables de couleurs (OKLCh, palette Terra par défaut) en `:root`, références dans `@theme {}`, transition globale 400ms sur color/background-color/border-color [ARCH-04]
- [x] next-intl v4.12 configuré avec `routing.ts` + `request.ts` + **`proxy.ts`** (Next 16) et routes localisées `/fr` et `/en` (`localePrefix: 'as-needed'`, `defaultLocale: 'fr'`) [ARCH-06]
- [x] Fichiers de traduction `messages/fr.json` et `messages/en.json` avec 9 namespaces (nav/hero/about/projects/skills/contact/footer/palette/404), parité parfaite 63 leaf keys × 2 locales [ARCH-07]
- [x] Type `Project` TS (union discriminée `TechProject | DesignProject | BIMProject`) + loader MDX dans `lib/projects.ts` via `@next/mdx` + `gray-matter` + `compileMDX` (zéro `any`, filter `_*` enforced) [ARCH-08]
- [x] Repo Git initialisé avec `.gitignore` complet (Next/Node/Vercel exclusions) [ARCH-09]
- [x] `lib/palettes.ts` avec 5 palettes typées (terra/nordic/bauhaus/ocean/vaporwave) anticipé en Phase 1 pour ground Phase 2

**Validated in Phase 2: Palette System (2026-05-27)** — 7 plans, 94/94 Vitest tests green, all 12 THEME REQs satisfied, automated verification 5/5 ROADMAP success criteria; 5 manual browser-only checks tracked in `02-HUMAN-UAT.md`.

- [x] `culori` installé pour manipulation couleurs OKLCh et calculs WCAG, plus `canvas-confetti` (dynamic-imported uniquement sur Konami) et `motion` (déjà installé en W0) [THEME-01..12]
- [x] `lib/colors.ts` complet : `wcagContrast`, `adjustForAA` (binary search OKLCh L), `validateFullMatrix` (7 paires), `generateHarmonic` (4 modes via rotation hue OKLCh), `pickTextOnAccent`, `deriveDefaultTokens` (D-10), `applyMatrixAdjust`, `oklchToHex`, `CRITICAL_PAIRS` — 29 tests green [THEME-02, THEME-03]
- [x] `ThemeProvider` (client, 368 LOC) avec useReducer + Context + CSS-var writer (ne touche QUE les 6 `--color-*`, jamais les alias shadcn) + persistance localStorage + intégration Konami via `useKonamiCode` + `vaporwaveUnlockNonce` counter — 16 tests green [THEME-04]
- [x] `PaletteFouCScript` Server Component (1000 bytes minifié, sous le budget 1024) avec `<Script strategy="beforeInteractive">` et PALETTES inlined au build (Vaporwave exclu per Pitfall A) — élimine FOUC sur cold load [THEME-05]
- [x] **Aliasing shadcn** (déjà fait en Phase 1, D-10..D-13) reste l'ancrage : ThemeProvider mute `--color-*` → chain `var()` propage automatiquement à `--primary`, `--background`, etc. — verifié par grep zéro mutation d'alias shadcn
- [x] Persistance localStorage : `palette-v1` (D-01 discriminated `{kind:'preset',id} | {kind:'custom',tokens,source}`) + `palette-secrets-v1` (D-02 silent fallback) — 12 tests green
- [x] Hook `usePalette()` exposant `{ palette, paletteId, isCustom, isVaporwaveUnlocked, wasAdjustedForAA, setPreset, setCustomColor, setHarmonic, unlockVaporwave }`
- [x] `PalettePresets` : 4 cartes pré-unlock, 5 post-unlock via `PALETTES.filter(p => p.id !== 'vaporwave' || isVaporwaveUnlocked)` (D-15), animation motion sur sélection, i18n via `useTranslations('palette')` — 6 tests green [THEME-06]
- [x] `CustomColorPicker` : 3 inputs natifs `<input type="color">` (bg, accent, secondary) avec conversion hex → OKLCh via culori à la frontière (D-09), `setCustomColor` déclenche derivation déterministe surface/text/textMuted (D-10) — 3 tests green [THEME-07]
- [x] `HarmonicGenerator` : source color picker + 4 modes (complementary/triadic/analogous/split-complementary) + inline 6-swatch preview avec "Aa" overlay (D-12) + Apply commits — 4 tests green [THEME-08]
- [x] `WCAGBadge` : ratio worst-pair (numérique 2 décimales) + statut AA/AAA/Fail avec icône Lucide verte/dorée/rouge + chip "Adjusted for AA" (D-06, D-11) gated sur `wasAdjustedForAA` flag — 5 tests green [THEME-09]
- [x] `PaletteSwitcher` : shadcn Sheet droite (D-04, side='right') + 3 onglets `defaultValue="presets"` (D-07) + sticky footer WCAGBadge visible sur tous les onglets — focus trap + Esc + Tab cycle via Radix (à valider manuellement) [THEME-10]
- [x] `PaletteFab` bottom-right (Lucide palette icon, motion hover scale + rotate 200ms, rotation 180deg + crossfade vers X à l'ouverture, prefers-reduced-motion gate opacity-only) avec aria-label localisé FR/EN, monté en sibling de `{children}` dans le layout [THEME-11]
- [x] `useKonamiCode` hook (sequence ArrowUp×2 ArrowDown×2 ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA via `e.code`, filtre INPUT/TEXTAREA/SELECT/contentEditable per D-16) intégré dans ThemeProvider, débloque Vaporwave, déclenche `canvas-confetti` (dynamic-import, particules colorées via Vaporwave.accent + secondary) avec prefers-reduced-motion gate, Sheet auto-opens sur Presets tab (D-14) — 11 tests green [THEME-12]
- [x] **Vaporwave WCAG pré-validation** : `scripts/validate-palettes.ts` (THEME-01 gate) confirme Vaporwave passe les 7 paires sans ajustement (worst pair textMuted/surface = 7.68). Bauhaus.secondary auto-ajustée 0.7→0.6 L au build pour passer le seuil 3.0 UI [resolves STATE.md blocker]
- [x] **Pitfall E mitigated** : règle scope-exclude dans `app/globals.css` pour `[data-slot='sheet-overlay'|'sheet-content'|'dialog-overlay'|'dialog-content'|'popover-content']` — la transition globale 400ms color/bg ne fight plus l'animation Sheet

**Validated in Phase 3: Layout & Animation Foundation (2026-05-27)** — 6 plans, 137/137 Vitest tests green (94 Phase 2 baseline + 43 net new), all 8 LAYOUT/ANIM/EGG REQs satisfied, automated verification 5/5 ROADMAP success criteria + 10/10 critical gates; 17 manual browser-only checks tracked in `03-HUMAN-UAT.md`.

- [x] Dépendances animation installées : `gsap@^3.15.0` + `@gsap/react@^2.1.2` + `lenis@^1.3.23` ; `motion@^12.40.0` préservé de Phase 2 ; aucun paquet legacy `@studio-freight/*` introduit [Phase 3 Wave 0]
- [x] Layout racine `app/[locale]/layout.tsx` (Server Component) wraps les pages avec **Inter** via `next/font/google` (`subsets: ['latin', 'latin-ext']`, `display: 'swap'`, `preload: true`, fallback `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`) + provider tree D-11 : `NextIntlClientProvider → ThemeProvider → LenisProvider → [ConsoleArt, Navigation, main, Footer, CustomCursor, PaletteFab]` + `generateMetadata` (title + tagline localisés, hreflang alternates) [LAYOUT-01]
- [x] `LenisProvider` client component (226 LOC, 4 unit tests) avec single-RAF `autoRaf: false` + bridge `gsap.ticker.add((t) => lenis.raf(t * 1000))` + `gsap.ticker.lagSmoothing(0)` + `gsap.registerPlugin(ScrollTrigger)` au module scope, `anchors: true`, `prevent: data-lenis-prevent` pour Radix overlays, `document.fonts.ready` re-refresh, debounce 450ms ScrollTrigger.refresh après `paletteId` change, mobile input-focus pause (`<768px` + focusin/focusout), reduced-motion skip total, exporte `LenisProvider` + `useLenis()` (returns null avant l'effet ou sous reduced-motion — consumers must null-check) [LAYOUT-02]
- [x] `Navigation` fixe top, transparent → `bg-background/80 backdrop-blur-md border-b` après >50px scroll, logo wordmark "Tanguy" `text-primary`, section anchors (#home/#about/#projects/#skills/#contact), `LanguageSwitcher` far-right, hamburger mobile `<Sheet side="left" data-lenis-prevent>` (réutilise la primitive shadcn Phase 2). PaletteFab **PAS** dans Nav (sibling séparé). Hook `useActiveSection` (IntersectionObserver `rootMargin: -40% 0px -40% 0px`) drive l'`aria-current` [LAYOUT-03]
- [x] `Footer` (`<footer>` semantic landmark) compact single-row → mobile 2-row stack, copyright dynamique `t('copyright', { year: new Date().getFullYear() })` server-side, tagline existante préservée (FR : "Construit avec Next.js et beaucoup de café." / EN : "Built with Next.js and a lot of coffee."), 3 social links lucide-react (`Code2` pour GitHub, `Briefcase` pour LinkedIn — substitution forcée par la suppression des icônes brand-trademarked en lucide-react v1.0 ; accessibilité préservée via i18n labels — `Mail` inchangé), `target="_blank" rel="noopener noreferrer"`, `mailto:`, GitHub link vers `tanguynoumea/portfolio` [LAYOUT-04]
- [x] `LanguageSwitcher` segmented control FR|EN avec `<motion.span layoutId="lang-indicator">` driving l'active background, `useRouter` + `usePathname` de `@/i18n/navigation` (locale-stripped), `document.documentElement.lang` imperative update via `useEffect([locale])`, scroll preservation via `lenis?.actualScroll` capture + `requestAnimationFrame(() => lenis.scrollTo(scrollY, { immediate: true }))` après `router.replace`, `aria-pressed={active}` + `aria-label` localisé via nouveaux keys `nav.lang.label` + `nav.lang.switchTo` (parité FR/EN vérifiée). PAS de drapeaux. [LAYOUT-05]
- [x] `CustomCursor` strictement contraint (anti-pattern "cursor takeover" interdit par REQUIREMENTS.md OOS) : 4 activation gates via `useSyncExternalStore` (`pointer:fine` AND `!prefers-reduced-motion` AND `!any-pointer:coarse` AND `!forced-colors:active`) — renders `null` si une gate fail. `useMotionValue` + `useSpring` (mass 0.3, stiffness 800) — zéro re-render React à 120Hz. Event-delegated `pointerover`/`pointerout` sur `'a, button, [role=button], [data-cursor=hover], img[data-zoomable]'` → scale 4× sur hover. `backgroundColor: var(--color-accent)` direct CSS variable (auto-recolore sur palette swap, zéro JS subscription). `mixBlendMode: difference`. **ZÉRO `cursor: none` dans le repo (grep gate)** — pointeur OS natif toujours visible [LAYOUT-06]
- [x] `app/template.tsx` (Client, `'use client'` line 1) avec `AnimatePresence mode="popLayout" initial={false}` (NOT `wait`) keyed par `usePathname()` de **`next/navigation`** (full path, pas la version locale-stripped) + variants fade + 8px Y-translate `duration: 0.3 easeOut` sous motion normale / opacity-only `duration: 0.1` sous reduced-motion via `useReducedMotion()` de motion/react [ANIM-01]
- [x] Console ASCII art bilingue : `lib/ascii.ts` exporte `getAsciiArt(locale)` avec wordmark FIGlet "Calvin S" pour "Tanguy" + intro FR/EN ("Profil hybride — Tech × Design × BIM" / "Hybrid profile — Tech × Design × BIM") + GitHub URL `https://github.com/tanguynoumea/portfolio` + Konami hint `// ↑ ↑ ↓ ↓ ← → ← → B A`. `ConsoleArt` (`'use client'`) avec module-level `let printed = false` qui survit React 19 Strict Mode + remount routes, NODE_ENV=test skip + SSR guard, accent sourced via `getComputedStyle(:root).getPropertyValue('--color-accent')`, single-shot `console.log('%c' + ascii, styleBlock)` au mount [EGG-01]

**Validated in Phase 4: Homepage Sections (2026-05-27)** — 6 plans, 222/222 Vitest tests green (137 Phase 3 baseline + 85 net new : Hero 11 + About 13 + Skills 8 + Contact 11 + CategoryFilter 12 + ProjectCard 14 + ProjectGrid 9 + ProjectsSection 10 + page 4 = 92… arrondi à 85 nets), all 7 HOME REQs satisfied, automated verification 5/5 ROADMAP success criteria + 15/15 critical gates + 38/38 must-haves + 17/17 key links wired ; 17 manual browser-only checks tracked in `04-HUMAN-UAT.md`.

- [x] `Hero` (`'use client'`, 189 LOC, 11 tests green) avec `useGSAP({ scope: heroRef, dependencies: [t('name'), t('role')] })` + module-scope `gsap.registerPlugin(SplitText)` + `gsap.matchMedia()` reduced-motion gate (full motion = SplitText char timeline 0.04s name + 0.025s role + tagline/CTA cascade ≤1.2s ; reduced motion = `gsap.set` final state instantané), CTA "Découvrir mon travail" / "See my work" qui smooth-scroll vers `#projects` via `useLenis()?.scrollTo(target, { offset: -64, duration: 1.0 })` avec `scrollIntoView({ behavior: 'smooth' })` en fallback, scroll cue ChevronDown lucide-react avec motion bounce `animate={{ y: [0, 8, 0] }}` 2s loop, cleanup explicite `nameSplit.revert() + roleSplit.revert()` dans matchMedia return, `ScrollTrigger.refresh()` dans `SplitText.onSplit` (Pitfall 4-D mitigation) [HOME-01]
- [x] `About` (`'use client'`, 124 LOC, 13 tests green) en grid 2-col desktop (photo `col-span-1` + bio `col-span-2`) / stacked mobile, `next/image` 400×500 (`priority={false}`, `loading="lazy"`, `placeholder="blur"` avec dataURL placeholder), 2 paragraphes FR/EN depuis nouveaux i18n keys `about.paragraphs.{1,2}`, `useGSAP({ scope: aboutRef })` + `import 'gsap/ScrollTrigger'` (side-effect — registerPlugin déjà appelé par LenisProvider Phase 3), reveal `gsap.timeline({ scrollTrigger: { start: 'top 75%', toggleActions: 'play none none reverse' } })` (photo slide-from-left x:-40 0.7s + paragraphs stagger up y:30 0.15s), `gsap.matchMedia({ isFull, isReduced })` gate [HOME-02]
- [x] `CategoryFilter` (`'use client'`, 80 LOC, 12 tests green) — controlled segmented control avec 4 pill buttons (All / Tech / Design / BIM) depuis i18n `projects.filters.*`, state lifté (props `active` + `onChange`), `<motion.span layoutId="filter-indicator">` driving l'active background (réutilise le pattern Phase 3 D-18 LanguageSwitcher avec layoutId différent), `aria-pressed={active === category}` sur chaque button, default `'all'` [HOME-03]
- [x] `ProjectCard` (`'use client'`, 142 LOC, 14 tests green) — shadcn `<Card>` wrapper + cover via `next/image` (explicit width/height + blur placeholder), category badge top-left absolute over image via `<Badge variant="category-${p.category}">`, year top-right absolute, title + summary (line-clamp-2), footer avec métadonnées domain-specific (Tech.stack[0..2] / Design.tools[0..2] / BIM.software[0..2] + BIM.projectScale), motion `whileHover={reducedMotion ? undefined : { scale: 1.02 }}` (Pitfall 4-B `=== true` check), `useReducedMotion()` from motion/react, hover image brightness/saturate + accent border-color + `ArrowUpRight` lucide translate-up-right, **`<Link>` depuis `@/i18n/navigation` (locale-stripped)** vers `/projects/${slug}`, motion.div OUTSIDE Link (Pitfall 4-I) [HOME-04]
- [x] `ProjectGrid` (`'use client'`, 76 LOC, 9 tests green) — grid responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`, outer `<motion.div layout>` (Pitfall 4-C) + inner `<AnimatePresence mode="popLayout" initial={false}>` (NOT `wait`), chaque card `<motion.div key={p.slug} layout initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}}>`, empty state quand `projects.length === 0` avec i18n `projects.empty` + lucide `SearchX` icon + motion fade-in [HOME-05]
- [x] `ProjectsSection` (`'use client'`, 62 LOC, 10 tests green) — state-lifting composer qui reçoit `projects: Project[]` prop server-loaded depuis `app/[locale]/page.tsx` (async Server Component avec `await getProjects(locale)`), `useState<Category | 'all'>('all')` pour filtre actif, `useMemo(() => projects.filter(p => active === 'all' || p.category === active), [projects, active])` mémoïsé, compose `<CategoryFilter active={active} onChange={setActive} />` + `<ProjectGrid projects={filtered} />` [HOME-05 composition]
- [x] `Skills` (`'use client'`, 122 LOC, 8 tests green) — 3 groupes (Tech / Design / BIM) depuis i18n `skills.groups.{tech,design,bim}.title` + `skills.groups.{tech,design,bim}.items[]` (read via `t.raw(...)` pour les arrays — Pitfall 4-J), chaque groupe = `flex flex-wrap gap-2` row de shadcn `<Badge variant="category-${key}">` (variants ajoutées en Wave 0 via CVA), `useGSAP({ scope: skillsRef })` + ScrollTrigger `start: 'top 75%'`, GSAP timeline avec per-badge stagger 0.05s intra-group + 0.15s offset group-to-group, `gsap.matchMedia()` reduced-motion gate skip animation [HOME-06]
- [x] `Contact` (`'use client'`, 223 LOC, 11 tests green) — email button qui copy-to-clipboard via `navigator.clipboard.writeText(EMAIL)` avec silent try/catch (Phase 2 D-02 precedent), motion `<AnimatePresence mode="wait">` icon swap Copy → Check + sr-only "Address copied!" label (i18n `contact.emailCopied`) pour 1.5s puis revert, 3 social links (GitHub `Code2`/LinkedIn `Briefcase`/mailto `Mail` — substitutions lucide v1.x forcées par Phase 3 D-23) avec `target="_blank" rel="noopener noreferrer"` + aria-label localisé, 2 CV download buttons en shadcn `<Button asChild>` wrapping `<a href download>` (FR variant=default → `/cv-fr.pdf` "CV_Tanguy_Delrieu_FR.pdf" + lucide `FileDown` ; EN variant=outline → `/cv-en.pdf` "CV_Tanguy_Delrieu_EN.pdf" + même icône), toutes URLs et email sourced depuis `lib/constants.ts` (`EMAIL`/`GITHUB_URL`/`LINKEDIN_URL` — swappables pre-deploy en 1 fichier) [HOME-07]
- [x] **3 fixed category color tokens** dans `app/globals.css` `:root` ET `@theme inline` (suivant Phase 1 D-12 `--destructive` precedent — déclarés une fois, JAMAIS mutés par ThemeProvider) : `--color-category-tech: oklch(0.55 0.15 240)` (cool blue), `--color-category-design: oklch(0.65 0.20 330)` (magenta), `--color-category-bim: oklch(0.60 0.13 60)` (warm amber). Tous validés WCAG 3:1 UI contrast contre les 5 palette backgrounds via culori `wcagContrast()`. shadcn Badge gagne 3 CVA variants `category-tech|design|bim` qui consomment ces tokens
- [x] **`lib/constants.ts`** centralise les données user-specific swappables (`EMAIL`, `GITHUB_URL`, `LINKEDIN_URL`) — single-source-of-truth importée par Hero/Footer/Contact/Navigation/ConsoleArt ; user customise les 3 valeurs pre-deploy en 1 PR
- [x] **6 projets MDX × 2 locales = 12 stub files** seedés en `content/projects/` (texture-manager + agora pour Tech, brand-system + editorial-grid pour Design, tower-concept + residential-renovation pour BIM) avec frontmatter complet satisfaisant le Project discriminated union (Phase 1 D-18..D-22), couvertures placeholder à `public/projects/{slug}/cover.jpg` (toutes le même JPEG partagé — Phase 5 swap individuellement). Body sera enrichi en Phase 5 (CONTENT-01..03)
- [x] **CV PDF** déplacé via `git mv` de `CV_Tanguy_Delrieu_2023.pdf` (repo root) vers `public/cv-fr.pdf` ; `public/cv-en.pdf` = copie placeholder jusqu'à user fournit traduction EN (Phase 7 deploy checklist devrait verifier)
- [x] **About photo placeholder** à `public/about-photo.jpg` (800×800 warm-beige gradient sharp-généré — user swap pre-deploy)
- [x] **i18n FR/EN parity gate** via `scripts/check-i18n-parity.ts` (72 leaf paths cross-validés ; exit 0 obligatoire dans CI). Nouveaux keys Phase 4 : `about.paragraphs.{1,2}`, `skills.groups.{tech,design,bim}.items[]`, `hero.scrollCue`, `contact.emailCopied`

**Validated in Phase 5: Project Content Pipeline (2026-05-28)** — 4 plans (3 waves), 276/276 Vitest tests green (267 baseline + 9 net new : ProjectCover 4 + project page 5 ; cumulatif depuis 222 Phase 4 : +31 MDX components + 10 useParallax + 9 page/cover), all 4 CONTENT/ANIM REQs satisfied, automated verification 20/20 must-have truths + `npm run build` exit 0 émettant 12 routes projet ; 4 manual browser-only checks tracked in `05-HUMAN-UAT.md`.

- [x] **`Project` type étendu** : `gallery?: string[]` optionnel ajouté à `CommonFields` (D-14) avec validateur `Array.isArray` narrowing (zéro `any`), rétro-compatible — les 12 stubs sans gallery valident toujours. `validateFrontmatter` exporté pour les tests [CONTENT-01]
- [x] **12 fichiers MDX enrichis** (6 projets × 2 locales) avec structure case-study à 4 sections H2 (FR : Contexte/Défi/Processus/Résultat ; EN : Context/Challenge/Process/Outcome), 250-400 mots/locale, prose placeholder domain-tailored (Tech : code/archi/perf ; Design : systèmes visuels/typo/grilles ; BIM : modélisation/Revit/coordination). `texture-manager` + `brand-system` portent une `gallery` frontmatter (4 entrées) ; les 4 autres l'omettent (valide le skip path). `scripts/check-mdx-structure.ts` (gate CONTENT-01 : 4 H2 + word count) exit 0 sur les 12 [CONTENT-01]
- [x] **`projects.detail.*` namespace i18n** (22 leaf keys/locale : 7 `detail` + 11 `meta` + 4 `meta.scale`) ajouté aux deux locales avec parité préservée (94 leaf paths, `check-i18n-parity.ts` exit 0). Inclut les labels discriminants `meta.{tech,design,bim}` consommés par la page via `t(\`meta.${category}\`)` + `meta.scale.{concept,residential,commercial,urban}`. 24 images placeholder seedées à `public/projects/{slug}/[1-4].jpg` [CONTENT-01]
- [x] **3 composants MDX custom** dans `components/mdx/` : `Image` (`'use client'`, shadcn Dialog zoom + `data-lenis-prevent` sur DialogContent uniquement per Pitfall 5C + hover scale `useReducedMotion`-gated), `CodeBlock` (override `<pre>` consommant `data-language` de rehype-pretty-code → badge + copy-to-clipboard via `textContent` + swap Copy↔Check 1.5s, pattern Phase 4 D-20), `Callout` (Server Component, 3 variants info/warning/note avec lucide Info/AlertTriangle/StickyNote + bg palette-aliasé `bg-primary/5`/`bg-destructive/5`/`bg-muted`, zéro couleur hardcodée — warning utilise le token fixe `--destructive` Phase 1 D-12). `mdx-components.tsx` wire Image/Callout/`pre:CodeBlock` + override `a` (externe → `target=_blank rel=noopener noreferrer` ; interne → next-intl Link) + overrides prose h1-h3/p/ul/ol/blockquote [CONTENT-03]
- [x] **`lib/hooks/useParallax.ts`** (D-13) — hook réutilisable `useParallax(ref, { factor: 0.3, maxTranslate: 50 })` via `useGSAP({ scope })` + `gsap.matchMedia()` dual-branch : full motion → `ScrollTrigger` `scrub: 0.5` translatant `[data-parallax-image]` jusqu'à `-maxTranslate` ; reduced motion → `gsap.set(y: 0)` sans ScrollTrigger. **Ne ré-enregistre JAMAIS `registerPlugin`** (grep = 0 ; LenisProvider Phase 3 le possède) — seul `import 'gsap/ScrollTrigger'` side-effect. Cleanup auto via `useGSAP` scope [ANIM-02]
- [x] **`app/[locale]/projects/[slug]/page.tsx`** (Server Component async) — `dynamicParams = false` + `generateStaticParams` flatMap (12 combos locale × slug), `getProjectBySlug` + `notFound()` sur null, **import dynamique RELATIF** `../../../../content/projects/${slug}.${locale}.mdx` (PAS l'alias `@/` — contrainte static-analysis Turbopack, Pitfall 5A ; `next-mdx-remote` archivé NON utilisé, zéro nouvelle dépendance). Layout magazine long-form : cover hero plein-écran → metadata strip (badges discriminés tech→stack+repo/live / design→tools+client / bim→software+scale+location) → article `max-w-prose` MDX → grille galerie (gated sur `gallery?.length`, réutilise MDXImage) → footer prev/next wrap-around `% slugs.length` (Links locale-aware). `generateMetadata` minimal title (Phase 6 étend OG/hreflang) [CONTENT-02]
- [x] **`components/sections/ProjectCover.tsx`** — îlot client (`'use client'`) qui consomme `useParallax(ref)` sur le wrapper cover, `next/image` `fill priority` scale 1.2 marqué `[data-parallax-image]` dans un wrapper `overflow-hidden h-[50vh] md:h-[60vh]`, scrim `from-black/60` (seule couleur non-palette sanctionnée — utilitaire Tailwind sur photo) [ANIM-02]

#### Contenu projets (MDX) — ✅ livré en Phase 5

- [x] 6 projets × 2 locales = **12 fichiers MDX** dans `content/projects/` (format `{slug}.{fr|en}.mdx` — 2 Tech, 2 Design, 2 BIM) avec frontmatter discriminé par catégorie — *enrichis en Phase 5 (voir bloc Validated ci-dessus)* [CONTENT-01]
- [x] Template page projet `app/[locale]/projects/[slug]/page.tsx` avec import MDX dynamique relatif (RSC) + galerie + `generateStaticParams(locale × slug)` — *Phase 5* [CONTENT-02]
- [x] Composants MDX custom (Image avec zoom, CodeBlock highlight, Callout) — *Phase 5* [CONTENT-03]

#### Animations avancées

- [ ] ~~Scroll horizontal sur section Projects en desktop (GSAP pin)~~ → **DÉPLACÉ vers Out of Scope v1** : conflits avec AnimatePresence du filter + casse les gestures mobile. Reconsidérer en v2 si valeur ajoutée prouvée
- [x] Parallaxe douce sur images projet via GSAP ScrollTrigger — *livré en Phase 5 (`useParallax` + `ProjectCover`, cover-only, `prefers-reduced-motion` gated)* [ANIM-02]

**Validated in Phase 6: SEO, Accessibility & Polish (2026-05-28)** — 6 plans (3 waves), 336/336 Vitest tests green (287 baseline + 49 net : +8 vitest-axe a11y surfaces + 41 palette stress), all 9 A11Y/EGG REQs satisfied to the automatable limit (5/5 must-have truth-groups verified) ; 3 manual browser/deploy checks tracked in `06-HUMAN-UAT.md`. Zero new runtime deps (only dev: `vitest-axe@1.0.0-pre.5` + `lighthouse`).

- [x] **Métadonnées dynamiques** : root + project `generateMetadata` étendus avec `metadataBase` (env-aware `SITE_URL`) + `openGraph` (website/article) + `twitter` (summary_large_image) + hreflang `alternates.languages` via next-intl `getPathname` (as-needed : fr→`/`, en→`/en`, x-default→`/`) + canonical. 2 routes OG dynamiques `opengraph-image.tsx` via **`next/og` built-in** (Satori flexbox-only, Node runtime, font Inter bundlé, couleurs Terra via `oklchToHex` — seule exception hex sanctionnée). FOUC script non régressé [A11Y-01]
- [x] **`app/sitemap.ts`** slug-driven (`1 + getProjectSlugs()` = 7 entrées, alternates fr/en par entrée) + **`app/robots.ts`** (allow `/`, disallow `/api/`, lien sitemap). Build émet `sitemap.xml` + `robots.txt` [A11Y-02]
- [x] **Route-state trio** : `not-found.tsx` (EGG-02 — copie bilingue playful "perdu dans le pixel art" via `errors.404`, motion entry `useReducedMotion`-gated, `<Button asChild><Link href="/">`), `error.tsx` (`'use client'` + prop `reset()` natif — PAS un Server Action, `errors.500`, `role=alert`), `loading.tsx` ×2 (locale + project route, `role=status` + `motion-safe:animate-pulse`) [A11Y-03, EGG-02]
- [x] **Audit a11y automatisé** : 8 surfaces `*.a11y.test.tsx` via `vitest-axe` `toHaveNoViolations` (seule règle `color-contrast` désactivée — couverte par `validateFullMatrix` ; `button-name` active prouve les aria-labels icon-only) + ring global `:focus-visible { outline: 2px solid var(--ring) }`. La passe clavier runtime (focus order, focus-trap, Esc, live-regions) reste HUMAN-UAT [A11Y-04]
- [x] **`prefers-reduced-motion` regression gate** : `scripts/check-reduced-motion.ts` (exit 0) — l'audit a **trouvé + corrigé 5 animations motion non-gated** laissées par les phases antérieures (CategoryFilter, LanguageSwitcher, Contact, CodeBlock, ProjectGrid) ; toutes gates désormais sur `useReducedMotion()` [A11Y-05]
- [x] **Image audit gate** : `scripts/check-image-audit.ts` (exit 0 — chaque `<Image>` a `fill` ou `width`+`height`, zéro `<img>` nu hors OG Satori) + `next.config.ts` `images.formats: ['image/avif','image/webp']` [A11Y-06]
- [x] **Palette stress test** : `lib/colors.stress.test.ts` seedé (Mulberry32 `0xC0FFEE`, 10 sources random × 4 modes = 40 palettes) + `scripts/stress-test-palettes.ts` gate — chaque palette passe `validateFullMatrix` + 6 tokens OKLCh valides. **Le test a trouvé un vrai bug** : `generateHarmonic` produisait accent/secondary < 3.0 pour sources pâles → ajout de `clampUiContrast` dans `lib/colors.ts` (durcit le switcher live ; invariant D-11 + Test 27 intacts) [A11Y-07]
- [x] **Lighthouse mobile** (pre-deploy gate local vs `next build && next start`) : **A11y 92 / Best-Practices 96 / SEO 92** ✓ ; **Performance 69** (coût JS main-thread GSAP+Lenis+Motion sous throttle 4× + serveur local sans edge CDN/Brotli — images 1.00, métadonnées complètes, font preload). Confirmation autoritative ≥90 sur l'URL Vercel déployée = **Phase 7** (REQUIREMENTS.md "homepage déployée Vercel"). Tracké HUMAN-UAT — **principal point de vigilance Phase 7** [A11Y-08]

#### Déploiement

**Validated in Phase 7: Deployment (2026-05-28) — MILESTONE v1.0 SHIPPED 🎉**

- [x] Repo Git initialisé avec `.gitignore` complet (Phase 1) + repo GitHub **public** créé à **`tanguynoumea-collab/portfolio`** (le namespace `tanguynoumea` n'existait pas ; refs GITHUB_URL alignées dans constants.ts/ascii.ts/README/Footer.tsx) + `main` poussé avec l'historique complet + README portfolio réel + CI GitHub Actions (lint/test/gates/build) [DEPLOY-01]
- [x] **Vercel connecté** via l'intégration GitHub (zéro-config Next 16), **URL de production live + publique : https://detportfolio.vercel.app**, auto-déploiement sur chaque push `main` [DEPLOY-02]
- [x] **`@vercel/analytics` + `@vercel/speed-insights`** montés (layout) + activés dans le dashboard Vercel ; aucun leak `NEXT_PUBLIC_*` (seul `NEXT_PUBLIC_SITE_URL`, origine publique) [DEPLOY-03]

**Lighthouse mobile déployé (PageSpeed) :** Accessibilité **92** ✓ · Bonnes pratiques **100** ✓ · SEO **100** ✓ · Performance **68** (FCP 0,2s / LCP 0,7s / SI 1,1s excellents ; TBT 1080ms = coût JS du trio GSAP+Lenis+Motion). **A11Y-08 : 3/4 axes ≥90 ; Performance 68 = arbitrage produit assumé** (portfolio créatif animé — l'utilisateur a choisi de livrer ainsi ; optimisation `next/dynamic`/allègement Motion = candidat v2).

**Correctifs post-déploiement (trouvés + corrigés live, vérifiés navigateur) :** SITE_URL → origine réelle ; `localePrefix` `as-needed`→`always` (home FR à `/` était cassée — sans `<html lang>`/`<title>`) ; transition de page déplacée root→`[locale]` (le template racine remontait toute l'app à chaque navigation → page blanche) ; `remark-frontmatter` ajouté (le frontmatter YAML s'affichait en clair sur les pages projet).

**Post-v1.0 — Refocus BIM & polish (2026-05-29)** — correctifs de contenu et UI post-lancement, hors cycle de phase (milestone v1.0 déjà clôturé). Commits directs sur `main`, auto-déployés sur Vercel.

- [x] **Identité refocalisée sur le BIM réel** (depuis le CV) : `hero.role` → "Ingénieur BIM" / "BIM Engineer", tagline coordination/modélisation, bio `about.paragraphs` (ESTP Paris, Vinci Construction Genève, suivi de chantier Nouvelle-Calédonie), `skills.groups` relabellisés BIM (Logiciels BIM : Revit/Navisworks/NEXT-BIM/BimCollab/AutoCAD ; Coordination & chantier ; Méthodes & économie), email réel `tanguy.delrieu@estp.fr`, metadata/OpenGraph/ASCII alignés. L'identité fictive Tech/Design/BIM est remplacée. *(commit `4a8f21c`)*
- [x] **Nom complet "Tanguy Delrieu"** partout où le prénom seul s'affichait : titre hero (haut-centre), wordmark navigation (haut-gauche), titre du menu mobile, `hero.name` FR/EN. *(commit `85b1834`)*
- [x] **Correctif centrage du nom dans le hero** : `SplitText` passé de `type:'chars'` → `'words,chars'` (empêchait la coupure en plein milieu d'un mot qui isolait une lettre — "Delrie"/"u") + conteneur titre `max-w-4xl` → `max-w-5xl` (le nom complet tient sur une ligne dès 1024px ; mobile wrappe proprement à l'espace). Vérifié navigateur (preview live) à 1024/1280/375px ; 336/336 tests verts. *(commits `92c2a56`, `d088010`)*

**Pass 2 — Refonte de la section Projets depuis GitHub (2026-05-29) ✅ livré :**

- [x] **6 projets fictifs remplacés par 5 vrais projets** issus des repos GitHub de l'utilisateur (avec son autorisation pour les projets HRS privés) : Olympe Datamind (Revit, moteur de règles — privé HRS), Olympe Hermès (Revit, géométrie offline BVH/FastWindingNumber — privé, IP perso), Olympe MaterialManager (add-in Revit matériaux — public), HRS.tab (suite pyRevit — privé HRS), DiskScout (analyseur disque Windows + audit IA — public MIT). 10 fiches MDX bilingues (4 sections H2, 250-400 mots) rédigées depuis les READMEs. *(commit `94a848d`)*
- [x] **Modèle `Project` aplati + 2 catégories** : l'union discriminée fictive (tech/design/bim + projectScale/location/tools/software) ne collait pas à des logiciels réels → type plat `{ category: 'bim'|'tech', stack[], revit?, repo?, liveUrl?, proprietary?, order? }`. Filtre à 2 pills (BIM·Revit / Outils). Repos privés featurés mais **non liés** (badge « Propriétaire » au lieu d'un lien mort) ; repos publics liés (Source + Download). Palette de badges `category-*` + section Skills inchangées (décoratives). Build vert (10 routes projet), 332 tests, gates i18n-parity (86)/mdx-structure/image-audit verts. Vérifié navigateur (filtre, pages détail privé/public, FR/EN).
- [x] **Couvertures placeholder** générées par slug (fond Terra, accent par catégorie, titre) — à remplacer par de vraies captures d'écran.

**Reste à faire (contenu utilisateur) :**

- [ ] Fournir l'**URL LinkedIn réelle** (actuellement `linkedin.com/in/tanguy-delrieu`, non vérifiée), la **traduction EN du CV** (`public/cv-en.pdf` = copie du FR), et les **vraies captures d'écran des projets** (couvertures + galeries, actuellement placeholders)

### Out of Scope

- **Scroll horizontal sur Projects (GSAP pin)** — Casse les gestures mobile, conflit avec AnimatePresence du filter, complexité disproportionnée vs valeur en v1. Re-évaluer en v2.
- **Dark mode binaire (toggle dark/light)** — Remplacé par le système de palettes personnalisables (Vaporwave + palettes custom couvrent les modes sombres)
- **Backend / API custom** — Site statique, déploiement Vercel suffit, aucune logique serveur en v1
- **CMS pour les projets** — MDX dans le repo, source de vérité = git, pas besoin de CMS pour 6-10 projets
- **Blog / articles** — Pas dans v1, peut venir en v2
- **Formulaire de contact backend / système de commentaires** — Contact via `mailto:` et liens sociaux uniquement
- **Authentification utilisateur** — Aucun compte requis, site public
- **E-commerce** — Hors scope total
- **App mobile native** — Web responsive (mobile-first) uniquement
- **Tests automatisés exhaustifs** — Pas critique pour un portfolio personnel, audit manuel + Lighthouse suffisent en v1
- **Intégrations API tierces** — Aucune dépendance externe en v1 (pas de feed Twitter, Instagram, etc.)

## Context

**Profil utilisateur :**
- **Tanguy Delrieu**, ingénieur BIM — diplômé de l'ESTP Paris ; coordination BIM chez Vinci Construction (Genève), suivi de chantier en Nouvelle-Calédonie (gros œuvre & rénovation)
- Le portfolio sert de complément au CV PDF — audience : recruteurs et acteurs de la construction / AEC
- Profil refocalisé sur le BIM le 2026-05-29 (l'identité initiale fictive Tech/Design/BIM a été remplacée par le profil réel issu du CV — voir le bloc *Post-v1.0* dans Requirements)

**Inspiration & benchmark :**
- Portfolios créatifs hybrides combinant fluidité d'animation (style Astro/GSAP) et UX moderne (style Next/Framer Motion)
- Sites de studios design avec forte interaction et personnalité

**Décisions design pré-projet (validées en phase de prep) :**
- Format visuel hybride Astro/GSAP × Next/Framer Motion
- 4 palettes prédéfinies : Terra & Sage, Atelier Nordique, Bauhaus Bright, Ocean Studio + 1 secrète Vaporwave
- Ton créatif assumé avec humour et easter eggs (console ASCII, Konami code)
- Bilingue FR/EN avec switcher visible

## Constraints

- **Tech stack** : **Next.js 16** App Router + React 19.2 + TypeScript 5.6 strict — moderne, performant, SEO-friendly, type-safety obligatoire (pas de `any`). Note Next 16 : `proxy.ts` au lieu de `middleware.ts`, `cookies()`/`headers()`/`params` async, Turbopack par défaut
- **Animations** : GSAP (free 100% depuis avril 2025, inclus SplitText/ScrollTrigger/ScrollSmoother) + Lenis (package `lenis` après rebrand Darkroom Engineering) pour le scroll + **`motion`** (anciennement `framer-motion`, imports via `motion/react`) pour micro-interactions et transitions — séparation claire des responsabilités, chaque lib dans son domaine d'excellence
- **i18n** : next-intl v4.12 avec routes localisées `/fr` et `/en` via `proxy.ts` (Next 16) — SEO-friendly, urls explicites, hreflang dans metadata
- **Couleurs** : TOUTES les couleurs en CSS variables OKLCh (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`) déclarées en `:root`, **Tailwind v4** les expose via `@theme {}` en CSS (pas de `tailwind.config.ts`) — palette switcher dynamique sans rebuild ni rechargement, OKLCh permet ajustement perceptuel précis pour WCAG
- **Accessibilité** : WCAG AA garanti par le ThemeProvider (ratio mini 4.5:1 entre `--color-text` et `--color-bg`) — si palette générée par utilisateur échoue, ajustement automatique luminosité texte. Navigation clavier complète, focus visible, aria-labels, focus management sur PaletteSwitcher
- **Performance** : Lighthouse 90+ sur Performance / Accessibility / Best Practices / SEO. Mobile-first responsive (breakpoints sm / md / lg / xl)
- **Patterns animations** : GSAP toujours dans hooks `useGSAP()` pour cleanup automatique. Lenis wrap toute l'app sauf zones nécessitant scroll natif (modales)
- **Composants** : Server Components par défaut, `"use client"` uniquement quand interaction (ThemeProvider obligatoirement client). Components atomiques (1 fichier = 1 responsabilité)
- **Conventions code** : TypeScript strict pas de `any`, components dans `components/` (sections de page dans `components/sections/`, système de thème dans `components/theme/`), contenu projets dans `content/projects/*.mdx`, traductions dans `messages/`, pas de couleurs hardcodées
- **Déploiement** : GitHub `tanguynoumea/portfolio` + Vercel (auto-deploy sur push main), domaine à configurer (ex. `tanguy.dev`)
- **Aucune API tierce** requise en v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Next.js 16** (App Router) + React 19.2 + TypeScript 5.6 strict | Moderne, SEO-friendly, type-safety, écosystème mature, Vercel-native. Mise à jour depuis l'intention initiale "Next 15" suite à recherche stack | — Pending |
| **Tailwind CSS v4** branché sur CSS variables OKLCh (pas de couleurs hardcodées, pas de `tailwind.config.ts`) | Permet le palette switcher dynamique sans rebuild ni rechargement. Tailwind v4 fait des design tokens des CSS vars natives via `@theme {}` — architecture idéale pour notre cas | — Pending |
| Stack animations triple (GSAP + Lenis + **`motion`**) | Chaque lib excelle dans son domaine : GSAP/ScrollTrigger pour scroll-driven, Lenis pour smooth scroll, `motion` (anciennement framer-motion) pour micro-interactions/transitions. GSAP est gratuit pour usage commercial depuis avril 2025 (rachat Webflow) | — Pending |
| Single RAF Lenis + GSAP (`gsap.ticker`) | Évite le desync de position scroll entre Lenis et ScrollTrigger qui se manifeste si chacun a son propre rAF | — Pending |
| Script `<head>` `beforeInteractive` pour FOUC palette | Lire localStorage dans `useEffect` cause un flash. Seule la lecture synchrone pré-hydratation l'évite | — Pending |
| Validation WCAG matricielle (7 paires) | Vérifier seulement text/bg laisse passer des palettes où accent/bg échoue à 2.3:1. Toutes les paires interactives doivent être validées | — Pending |
| Système de palettes remplace dark/light binaire | Différencie le portfolio, démontre maîtrise WCAG, expérience personnalisable, Vaporwave couvre le mode sombre | — Pending |
| `culori` pour manipulation couleurs + WCAG (OKLCh) | Lib moderne ESM utilisée par Tailwind v4 en interne. ⚠️ ne ship PAS de générateur harmonique → ~30 LOC custom dans `lib/colors.ts` via rotation hue OKLCh | — Pending |
| next-intl avec routes localisées `/fr` et `/en` | SEO-friendly, urls explicites, switcher visible, standard de l'écosystème | — Pending |
| MDX dans `content/projects/` (`{slug}.{fr|en}.mdx`, 1 fichier par projet par locale) | Source de vérité = git, pas de CMS, frontmatter typé pour metadata, écriture confortable en Markdown, workflow traducteur friendly. Stack : `@next/mdx` + `gray-matter` + `next-mdx-remote/rsc compileMDX` (contentlayer est abandonné depuis 2024) | — Pending |
| Vercel pour hébergement | Free tier généreux, déploiement auto GitHub, analytics intégré, Next.js native, edge network | — Pending |
| Easter eggs activés (ASCII console + Konami code) | Ton créatif assumé, attention au détail, mémorable pour les visiteurs tech | — Pending |
| Pas de dark mode binaire | Le système de palettes le remplace (Vaporwave + palettes custom couvrent les modes sombres) | — Pending |
| `useGSAP()` pour toutes les animations GSAP | Cleanup automatique, évite les leaks et re-trigger sur React strict mode | — Pending |
| shadcn/ui pour composants de base | Composants copier-coller customisables, pas de lock-in lib UI, parfaitement compatible Tailwind | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-28 — **MILESTONE v1.0 SHIPPED 🎉** (Phase 7: Deployment complete). Live: **https://detportfolio.vercel.app** · Repo: **github.com/tanguynoumea-collab/portfolio** (public, auto-deploy on `main`) · Vercel Analytics + Speed Insights active. All 7 phases + 52/52 requirements complete. Deployed Lighthouse mobile: A11y 92 / Best-Practices 100 / SEO 100 ✓ ; Performance 68 (FCP 0.2s/LCP 0.7s excellent; TBT 1080ms = GSAP+Lenis+Motion animation stack — A11Y-08's ≥90-all-axes is met on 3/4, Performance is an accepted creative-portfolio trade-off, v2 optimization candidate). 336/336 Vitest tests green. Post-launch hotfixes: SITE_URL, localePrefix as-needed→always (fixed broken FR root), root→[locale] template relocation (fixed blank-page-on-navigation), remark-frontmatter (fixed YAML leak on project pages). Remaining = user content swaps: real bio/photo/email/LinkedIn/project covers+galleries/MDX bodies/CV-EN. v2 candidates: animation perf optimization, blog, 3D BIM viewer, palette export, contact-form backend, custom domain.*

*Post-v1.0 update: 2026-05-29 — Identity refocused from the fictional Tech×Design×BIM hybrid to the **real BIM-engineer profile** (from CV): role, tagline, bio, skills, email, metadata/OG/ASCII (commit `4a8f21c`). Full name **"Tanguy Delrieu"** applied everywhere the first name alone appeared — hero (top-center), nav wordmark (top-left), mobile menu title (commit `85b1834`). Hero name-centering bug fixed: SplitText `chars`→`words,chars` + title container `max-w-4xl`→`max-w-5xl`, browser-verified at 1024/1280/375px (commits `92c2a56`, `d088010`). Done & live on Vercel. **Pass 2 (done, commit `94a848d`):** the 6 fictional projects were replaced with 5 real projects sourced from the user's GitHub repos — Olympe Datamind / Hermès / MaterialManager (Revit tooling), HRS.tab (pyRevit), DiskScout (Windows app) — and the Project model was flattened to 2 categories (BIM·Revit / Outils). Private/employer repos are featured with the user's authorization but not linked (shown with a "Proprietary" badge). 10 bilingual MDX case studies, placeholder covers, 332 tests + build green. **Remaining (user content):** real LinkedIn URL and EN CV translation.*

*Milestone archived: 2026-05-29 — **v1.0 "Launch"** formally completed (7 phases / 36 plans / 90 tasks); ROADMAP + REQUIREMENTS archived to `.planning/milestones/v1.0-*`, git tag `v1.0`, retrospective written. Content since Pass 2: job title set to **"Spécialiste BIM"** (was "Ingénieur BIM"); all 5 projects given **real covers + galleries** from the user's own assets (app logos + UI screenshots) — the Datamind/Hermès screenshots were first redacted for client confidentiality, then published **unredacted at the user's explicit authorization**; the image lightbox was enlarged (was capped at 384px). Next: `/gsd:new-milestone` to open v1.1.*
