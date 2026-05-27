# Portfolio Tanguy (`tanguy-portfolio`)

## What This Is

Portfolio personnel bilingue FR/EN servant de complément au CV PDF, présentant un profil hybride **Tech (dev) × Design (créatif) × BIM (architecture)**. Le site expose 6 à 10 projets personnels filtrables par catégorie, avec un ton créatif assumé et des easter eggs. Sa **feature signature** est un système de palettes interactif (4 presets + custom color picker + génération harmonique avec contrôle WCAG temps réel + palette secrète Vaporwave déblocable via Konami code) qui permet à chaque visiteur de personnaliser le thème en live.

## Core Value

Démontrer le profil créatif hybride Tech/Design/BIM via une expérience web personnalisable qui **prouve la maîtrise technique, le sens du design et l'attention aux détails** — un portfolio qui est lui-même une démo vivante de ce que je sais faire.

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

#### Sections homepage

- [ ] Hero avec révélation texte GSAP SplitText + stagger animation au mount
- [ ] About avec photo, bio bilingue, révélation au scroll via ScrollTrigger
- [ ] `CategoryFilter` (All / Tech / Design / BIM) avec état React
- [ ] `ProjectCard` avec hover Framer Motion (scale + image reveal + accent color animé)
- [ ] Section Projects : grille filtrable + AnimatePresence transitions + layout shift fluide
- [ ] Section Skills avec badges animés au scroll (stagger GSAP)
- [ ] Section Contact avec liens email/GitHub/LinkedIn, copy-to-clipboard animé, et **boutons de téléchargement du CV PDF (FR + EN)** — complément essentiel au portfolio

#### Contenu projets (MDX)

- [ ] 6 projets × 2 locales = **12 fichiers MDX** dans `content/projects/` (format `{slug}.{fr|en}.mdx` — 2 Tech, 2 Design, 2 BIM) avec frontmatter discriminé par catégorie (Tech.stack, Design.tools, BIM.software+projectScale)
- [ ] Template page projet `app/[locale]/projects/[slug]/page.tsx` avec `compileMDX` (RSC) + galerie + `generateStaticParams(locale × slug)`
- [ ] Composants MDX custom (Image avec zoom, CodeBlock highlight, Callout)

#### Animations avancées

- [ ] ~~Scroll horizontal sur section Projects en desktop (GSAP pin)~~ → **DÉPLACÉ vers Out of Scope v1** : conflits avec AnimatePresence du filter + casse les gestures mobile. Reconsidérer en v2 si valeur ajoutée prouvée
- [ ] Parallaxe douce sur images projet via GSAP ScrollTrigger — *Phase 5*

#### Easter eggs & personnalité

- [ ] Page 404 personnalisée avec animation et lien retour humoristique bilingue — *Phase 6*

#### SEO, accessibilité, robustesse

- [ ] Métadonnées dynamiques (`generateMetadata`) avec title, description, OG image par page
- [ ] `sitemap.ts` et `robots.ts` dans `app/`
- [ ] `loading.tsx`, `error.tsx`, `not-found.tsx` pour chaque route principale
- [ ] Audit a11y : focus visible, aria-labels, contraste WCAG AA garanti, navigation clavier complète sur PaletteSwitcher, **`prefers-reduced-motion` respecté sur toutes les animations** (GSAP + motion + cursor + Lenis), axe-core 0 erreur
- [ ] Images optimisées via `next/image` avec formats WebP/AVIF
- [ ] Test palette switcher sur 4 presets + 10 palettes random pour vérifier robustesse UI

#### Déploiement

- [ ] Repo Git initialisé avec `.gitignore` et premier commit
- [ ] Repo GitHub `tanguynoumea/portfolio` créé et code pushé
- [ ] Connexion Vercel via intégration GitHub et déploiement production
- [ ] Vercel Analytics + Speed Insights configurés

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
- Tanguy, profil hybride Tech (développement) × Design (créatif) × BIM (architecture)
- Le portfolio sert de complément au CV PDF — audience : recruteurs, clients potentiels, communauté tech/design/archi
- Confort technique avec Next.js, TypeScript, Tailwind, animations modernes

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
*Last updated: 2026-05-27 after Phase 3 completion (Layout & Animation Foundation) — persistent UI shell live: Inter via next/font/google + provider tree D-11 (NextIntl → Theme → Lenis → chrome) + LenisProvider single-RAF gsap.ticker bridge + ScrollTrigger.refresh debounced on palette swap + reduced-motion skip + mobile input pause + Navigation transparent→blur after 50px + segmented FR|EN LanguageSwitcher with motion layoutId + scroll preservation + imperative html.lang + Footer compact-row with lucide social icons (Code2/Briefcase/Mail substituted for brand-removed Github/Linkedin) + 4-gate constrained CustomCursor (native cursor stays visible — zero `cursor: none` in repo) + app/template.tsx AnimatePresence popLayout fade+Y / 300ms normal / 100ms reduced + bilingual console ASCII art with FIGlet wordmark + GitHub link + Konami hint. 137/137 Vitest tests green (94 Phase 2 + 43 net new). LAYOUT-01..06 + ANIM-01 + EGG-01 all validated automatically; 17 manual browser checks tracked in 03-HUMAN-UAT.md.*
